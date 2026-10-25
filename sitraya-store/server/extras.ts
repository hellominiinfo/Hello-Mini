/** Product view counter, abandoned carts (Cart Recovery) and the brand's installable-app files. */
import { sql } from "./db";
import { audit, rateLimit, requireAdmin } from "./auth";
import { getCfg, getSettings, loadProducts } from "./store";
import { cartInputSchema } from "./validate";
import { brandIconRefs, ORIG_BRAND } from "./shell";
import { HttpError, clientIp, escHtml, json, normPhone, randomToken, readJson, sha256 } from "./util";
import { z } from "zod";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|preview|headless|lighthouse|pingdom|curl|wget|python|httpclient/i;
const bdDay = () => new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);

// ---------------------------------------------------------------- views
/** One count per person per product every 30 minutes; one "visitor" per device per product. Bots are ignored. */
export async function recordView(req: Request): Promise<Response> {
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  const ip = clientIp(req);
  await rateLimit(`view:ip:${ip}`, 240, 10 * 60);
  const b = z.object({ pid: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/), vid: z.string().regex(/^[a-z0-9]{12,40}$/).optional().default("") }).parse(await readJson(req, 1024));
  const s = await getSettings();
  if (!s.site.views.on) return new Response(null, { status: 204 });
  const db = sql();
  const [p] = await db<{ id: string }[]>`select id from products where id = ${b.pid} and status = 'active'`;
  if (!p) return new Response(null, { status: 204 });
  try { await rateLimit(`viewp:${ip}:${b.pid}`, 20, 24 * 3600); } catch { return new Response(null, { status: 204 }); }
  const kView = sha256(`v|${ip}|${b.pid}`);
  const fresh = await db`insert into view_seen (k, until) values (${kView}, now() + interval '30 minutes')
    on conflict (k) do update set until = excluded.until where view_seen.until < now()`;
  if (fresh.count !== 1) return new Response(null, { status: 204 });
  const kUniq = sha256(`u|${b.vid || ip + "|" + ua}|${b.pid}`);
  const uniq = await db`insert into view_seen (k, until) values (${kUniq}, now() + interval '30 days') on conflict (k) do nothing`;
  await db`insert into product_views (product_id, day, views, uniques) values (${b.pid}, ${bdDay()}, 1, ${uniq.count === 1 ? 1 : 0})
    on conflict (product_id, day) do update set views = product_views.views + 1, uniques = product_views.uniques + excluded.uniques`;
  if (Math.random() < 0.02) await db`delete from view_seen where until < now()`;
  return new Response(null, { status: 204 });
}

/** Totals per product: { id: { t: views, u: visitors } }. For the public shop, pass a filter so hidden counts never leave the server. */
export async function viewTotals(keep?: (pid: string, t: number) => boolean): Promise<Record<string, { t: number; u: number }>> {
  const rows = await sql()<{ product_id: string; t: number; u: number }[]>`select product_id, sum(views)::int as t, sum(uniques)::int as u from product_views group by product_id`;
  const out: Record<string, { t: number; u: number }> = {};
  for (const r of rows) if (!keep || keep(r.product_id, r.t)) out[r.product_id] = keep ? { t: r.t, u: 0 } : { t: r.t, u: r.u };
  return out;
}

// ---------------------------------------------------------------- carts
type CartRow = { id: string; sid: string; phone: string | null; name: string; wa: string; district: string; items: any[]; value: number; status: string; reminders: number[]; optout: boolean; lang: string; order_ref: string; created_at: Date; updated_at: Date };
const cartOut = (c: CartRow) => ({ id: c.id, sid: c.sid, phone: c.phone || "", name: c.name, wa: c.wa, district: c.district, items: c.items, value: c.value, status: c.status, reminders: c.reminders || [], optout: c.optout, lang: c.lang, order: c.order_ref, created: new Date(c.created_at).getTime(), updated: new Date(c.updated_at).getTime() });

/** Saves what is in a customer's bag. A cart only gets a name and number when the customer typed them at checkout. */
export async function saveCart(req: Request): Promise<Response> {
  await rateLimit(`cart:ip:${clientIp(req)}`, 60, 10 * 60);
  const b = cartInputSchema.parse(await readJson(req, 16 * 1024));
  const s = await getSettings();
  if (!s.site.cart.on) return json({ ok: true });
  const phone = normPhone(b.phone) || "";
  const products = await loadProducts({ activeOnly: true });
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = b.items.filter((l) => { const p = byId.get(l.pid); return p && p.variants.some((v) => v.size === l.size && v.color.toLowerCase() === l.color.toLowerCase()); })
    .map((l) => { const p = byId.get(l.pid)!; const unit = p.sale && p.sale < p.price ? p.sale : p.price; return { id: l.pid, size: l.size, color: l.color, qty: l.qty, price: unit }; });
  const value = items.reduce((a, l) => a + l.price * l.qty, 0);
  const db = sql();
  if (Math.random() < 0.02) {
    await db`delete from carts where phone is null and updated_at < now() - interval '2 days'`;
    await db`delete from carts where status in ('expired', 'converted') and updated_at < now() - interval '90 days'`;
  }
  return await db.begin(async (tx) => {
    // one request at a time per device, so two quick saves never make two carts
    await tx`select pg_advisory_xact_lock(hashtext(${"cart:" + b.sid}))`;
    // a typed phone number is not proof of identity: a phone cart is only ever updated from the device that created it
    let [rec] = phone
      ? await tx<CartRow[]>`select * from carts where phone = ${phone} and sid = ${b.sid} and status in ('pending', 'reminded') order by updated_at desc limit 1 for update`
      : await tx<CartRow[]>`select * from carts where sid = ${b.sid} and phone is null and status = 'pending' order by updated_at desc limit 1 for update`;
    if (phone) await tx`delete from carts where sid = ${b.sid} and phone is null and status = 'pending'`;
    if (!items.length) {
      if (rec && (!rec.phone || rec.status === "pending")) await tx`delete from carts where id = ${rec.id}`;
      else if (rec) await tx`update carts set status = 'expired', updated_at = now() where id = ${rec.id}`;
      return json({ ok: true });
    }
    if (!rec) {
      const id = "c" + randomToken(12).replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 16);
      await tx`insert into carts (id, sid, phone, name, wa, district, items, value, lang) values (${id}, ${b.sid}, ${phone || null}, ${b.name}, ${normPhone(b.wa) || ""}, ${b.district}, ${tx.json(items as any)}, ${value}, ${b.lang})`;
      return json({ ok: true, id });
    }
    await tx`update carts set items = ${tx.json(items as any)}, value = ${value}, sid = ${b.sid}, lang = ${b.lang}, updated_at = now(),
      name = case when ${b.name} <> '' then ${b.name} else name end,
      wa = case when ${normPhone(b.wa) || ""} <> '' then ${normPhone(b.wa) || ""} else wa end,
      district = case when ${b.district} <> '' then ${b.district} else district end
      where id = ${rec.id}`;
    return json({ ok: true, id: rec.id });
  });
}

/** The link in a reminder opens the same bag again. It returns only the items, never the customer's details. */
export async function getCart(id: string): Promise<Response> {
  const [c] = await sql()<{ items: any[] }[]>`select items from carts where id = ${id} and status <> 'converted'`;
  if (!c) throw new HttpError(404, "This cart is no longer available.", "not_found");
  return json({ items: (c.items || []).map((l: any) => ({ id: l.id, size: l.size, color: l.color, qty: l.qty })) });
}

/** Called when an order is placed: that customer's saved cart is now "Converted". */
export async function convertCarts(phone: string, sid: string, ref: string): Promise<void> {
  await sql()`update carts set status = 'converted', order_ref = ${ref}, updated_at = now()
    where status in ('pending', 'reminded', 'expired') and (phone = ${phone} or (${sid} <> '' and sid = ${sid}))`;
}

async function expireOld(days: number) {
  await sql()`update carts set status = 'expired' where status in ('pending', 'reminded') and updated_at < now() - make_interval(days => ${days})`;
}

export async function adminCarts(req: Request): Promise<Response> {
  await requireAdmin(req, "orders");
  const s = await getSettings();
  await expireOld(s.site.cart.days);
  const rows = await sql()<CartRow[]>`select * from carts where phone is not null order by updated_at desc limit 400`;
  const [anon] = await sql()<{ n: number; v: number }[]>`select count(*)::int as n, coalesce(sum(value), 0)::int as v from carts c
    where c.phone is null and c.status = 'pending' and not exists (select 1 from carts d where d.sid = c.sid and d.phone is not null)`;
  return json({ carts: rows.map(cartOut), anon: { n: anon.n, v: anon.v } });
}

export async function adminCartReminded(req: Request, id: string): Promise<Response> {
  const a = await requireAdmin(req, "orders", "edit");
  const C = (await getSettings()).site.cart;
  return await sql().begin(async (tx) => {
    const [c] = await tx<CartRow[]>`select * from carts where id = ${id} for update`;
    if (!c) throw new HttpError(404, "Cart not found.", "not_found");
    const rem = (c.reminders || []) as number[], last = rem.length ? rem[rem.length - 1] : 0, age = Date.now() - new Date(c.updated_at).getTime();
    if (!c.phone) throw new HttpError(400, "This cart has no phone number.", "invalid");
    if (c.optout) throw new HttpError(400, "The customer asked not to be messaged.", "invalid");
    if (c.status === "converted") throw new HttpError(400, "The customer already ordered.", "invalid");
    if (c.status === "expired" || age > C.days * 864e5) throw new HttpError(400, "This cart has expired.", "invalid");
    if (rem.length >= C.max) throw new HttpError(400, `Already reminded ${C.max} times.`, "invalid");
    if (last && Date.now() - last < C.cool * 3600e3) throw new HttpError(400, "Please wait before sending another reminder.", "invalid");
    const next = rem.concat(Date.now());
    await tx`update carts set reminders = ${tx.json(next as any)}, status = 'reminded' where id = ${id}`;
    await audit(a.name, "Cart reminder sent", `${c.name} ${c.phone}`);
    return json({ cart: cartOut({ ...c, reminders: next, status: "reminded" }) });
  });
}

export async function adminCartOptout(req: Request, id: string): Promise<Response> {
  const a = await requireAdmin(req, "orders", "edit");
  const b = z.object({ optout: z.boolean() }).parse(await readJson(req, 512));
  const r = await sql()<CartRow[]>`update carts set optout = ${b.optout} where id = ${id} returning *`;
  if (!r.length) throw new HttpError(404, "Cart not found.", "not_found");
  await audit(a.name, b.optout ? "Customer opted out of messages" : "Customer messages allowed", r[0].phone || "");
  return json({ cart: cartOut(r[0]) });
}

// ---------------------------------------------------------------- brand files
function monogramSvg(name: string, color: string): string {
  const ch = escHtml((name.trim().charAt(0) || "S").toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${color}"/><text x="50" y="67" text-anchor="middle" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#fff">${ch}</text></svg>`;
}
async function brandBasics() {
  const [cfg, s] = await Promise.all([getCfg(), getSettings()]);
  const name = String((cfg as any).brand && (cfg as any).brand.name || "Shop");
  const B = s.site.brand;
  return { name, B, site: s.site, theme: /^#[0-9a-fA-F]{6}$/.test(B.theme) ? B.theme : "#0D2B26" };
}
export async function brandIcon(): Promise<Response> {
  const { name, theme } = await brandBasics();
  return new Response(monogramSvg(name, theme), { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=300", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } });
}
/** The admin app's name and icon come from Website Settings → Brand, so a renamed shop installs under its own name. */
export async function adminManifest(): Promise<Response> {
  const { name, B, site, theme } = await brandBasics();
  const icons = brandIconRefs(site, name);
  const list = (B.appIcon && /^(\/m\/|https:\/\/)/.test(B.appIcon)) ? [{ src: B.appIcon, sizes: "512x512", purpose: "any" }]
    : name === ORIG_BRAND ? [{ src: "/assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/assets/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }]
    : [{ src: icons.touch, sizes: "any", type: "image/svg+xml", purpose: "any" }];
  const man = { name: (B.appName || name + " Admin").slice(0, 45), short_name: (B.appShort || name).slice(0, 12), description: `Orders, products and notifications for ${name}`,
    start_url: "/admin", scope: "/admin", display: "standalone", background_color: theme, theme_color: theme, icons: list };
  return new Response(JSON.stringify(man), { headers: { "content-type": "application/manifest+json; charset=utf-8", "cache-control": "no-cache", "x-content-type-options": "nosniff" } });
}
