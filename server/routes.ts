import { z } from "zod";
import { sql, asJson } from "./db";
import { audit, can, checkSameOrigin, destroySession, getAdmin, hashPassword, login, rateLimit, requireAdmin, createSession, verifyPassword, type AdminRow } from "./auth";
import { allowedNext, changeStatus, createOrder, patchOrder, publicOrderView, trackOrder, type OrderDoc } from "./orders";
import { announceOrder, getVapid, pushToAdmins, telegram } from "./notify";
import { capiPurchase, catalogFeed } from "./meta";
import { saveImage, serveImage } from "./media";
import { adminCartOptout, adminCartReminded, adminCarts, adminManifest, brandIcon, convertCarts, getCart, recordView, saveCart, viewTotals } from "./extras";
import { renderPage, securityHeaders } from "./shell";
import { ensureSeed, getCategories, getCfg, getSecrets, getSettings, kvVersion, loadProducts, publicBoot, publicProduct, setKV, setKVChecked, setSecrets } from "./store";
import {
  categoriesSchema, checkCfg, couponSchema, orderInputSchema, orderPatchSchema, passwordSchema, productSchema, ROLES, settingsSchema, statusChangeSchema, type CouponDoc,
} from "./validate";
import { HttpError, clientIp, json, randomId, randomToken, readJson } from "./util";

type Ctx = { req: Request; url: URL; params: string[] };
type Handler = (c: Ctx) => Promise<Response>;
const routes: { method: string; re: RegExp; h: Handler }[] = [];
const on = (method: string, pattern: string, h: Handler) => routes.push({ method, re: new RegExp("^" + pattern + "$"), h });

export async function route(req: Request, pathname: string): Promise<Response | null> {
  for (const r of routes) {
    if (r.method !== req.method && !(req.method === "HEAD" && r.method === "GET")) continue;
    const m = r.re.exec(pathname);
    if (m) return r.h({ req, url: new URL(req.url), params: m.slice(1).map(decodeURIComponent) });
  }
  return null;
}

// =====================================================================
// Pages
// =====================================================================
on("GET", "/", async ({ req }) => { await ensureSeed(); return renderPage(req, { kind: "home" }); });
on("GET", "/p/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => { await ensureSeed(); return renderPage(req, { kind: "product", id: params[0] }); });
on("GET", "/c/([a-z0-9-]{1,30})", async ({ req, params }) => { await ensureSeed(); return renderPage(req, { kind: "category", id: params[0] }); });
on("GET", "/admin", async ({ req }) => { await ensureSeed(); return renderPage(req, { kind: "admin" }); });
on("GET", "/m/([A-Za-z0-9]{8,40})", async ({ params }) => serveImage(params[0]));
on("GET", "/admin\\.webmanifest", async () => adminManifest());
on("GET", "/brand/icon\\.svg", async () => brandIcon());
on("GET", "/feeds/meta-catalog\\.xml", async ({ req }) => new Response(await catalogFeed(req), {
  headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=600", "x-content-type-options": "nosniff" },
}));

// =====================================================================
// Public API
// =====================================================================
on("GET", "/api/boot", async () => { await ensureSeed(); return json(await publicBoot()); });

on("POST", "/api/orders", async ({ req }) => {
  const input = orderInputSchema.parse(await readJson(req, 32 * 1024));
  const order = await createOrder(req, input);
  try { await convertCarts(order.customer.phone, input.sid || "", order.ref); } catch (e) { console.warn("cart convert", e); }
  // tell the admins and Meta; never block the customer for long
  await Promise.allSettled([announceOrder(req, order), capiPurchase(req, order, { fbp: input.fbp, fbc: input.fbc })]);
  return json({ order: publicOrderView(order) }, 201);
});

on("POST", "/api/view", async ({ req }) => recordView(req));
on("POST", "/api/cart", async ({ req }) => saveCart(req));
on("GET", "/api/cart/([a-z0-9]{8,40})", async ({ params }) => getCart(params[0]));
on("GET", "/api/admin/carts", async ({ req }) => adminCarts(req));
on("POST", "/api/admin/carts/([a-z0-9]{8,40})/reminded", async ({ req, params }) => adminCartReminded(req, params[0]));
on("PATCH", "/api/admin/carts/([a-z0-9]{8,40})", async ({ req, params }) => adminCartOptout(req, params[0]));

on("POST", "/api/track", async ({ req }) => {
  const b = z.object({ ref: z.string().max(20), phone: z.string().max(30) }).parse(await readJson(req, 2048));
  const o = await trackOrder(req, b.ref, b.phone);
  return o ? json({ order: o }) : json({ error: "Order not found", code: "trk_nf" }, 404);
});

on("GET", "/api/coupons/([A-Za-z0-9]{1,16})", async ({ req, params }) => {
  await rateLimit(`coupon:ip:${clientIp(req)}`, 40, 10 * 60);
  const rows = await sql()<{ doc: CouponDoc; uses: number }[]>`select doc, uses from coupons where code = ${params[0].toUpperCase()}`;
  const c = rows[0]?.doc;
  // paused, expired or used-up codes look exactly like unknown ones
  if (!c || !c.active || (c.expires && Date.now() > c.expires) || (c.maxUses && rows[0].uses >= c.maxUses)) return json({ error: "Coupon not found", code: "cp_bad" }, 404);
  // only what the shopper needs to see the discount; the server checks again when the order is placed
  return json({ coupon: { code: c.code, type: c.type, value: c.value, min: c.min } });
});

on("POST", "/api/subscribe", async ({ req }) => {
  await rateLimit(`sub:ip:${clientIp(req)}`, 10, 60 * 60);
  const b = z.object({ email: z.string().trim().toLowerCase().email().max(160), lang: z.enum(["bn", "en"]).optional() }).parse(await readJson(req, 2048));
  await sql()`insert into subscribers (email, lang) values (${b.email}, ${b.lang || "bn"}) on conflict (email) do nothing`;
  return json({ ok: true });
});

// =====================================================================
// Admin: sign in / out / password
// =====================================================================
const meOf = (a: AdminRow) => ({ id: a.id, name: a.name, email: a.email, role: a.role, isOwner: a.is_owner, mustChange: a.must_change });

on("POST", "/api/admin/login", async ({ req }) => {
  checkSameOrigin(req);
  const b = z.object({ email: z.string().max(200), password: z.string().max(200) }).parse(await readJson(req, 2048));
  const { admin, cookie } = await login(req, b.email, b.password);
  return json({ me: meOf(admin) }, 200, { "set-cookie": cookie });
});
on("POST", "/api/admin/logout", async ({ req }) => {
  checkSameOrigin(req);
  const a = await getAdmin(req);
  const cookie = await destroySession(req);
  if (a) await audit(a.name, "Signed out", "");
  return json({ ok: true }, 200, { "set-cookie": cookie });
});
on("GET", "/api/admin/me", async ({ req }) => {
  const a = await getAdmin(req);
  return a ? json({ me: meOf(a) }) : json({ error: "Not signed in", code: "auth" }, 401);
});
on("POST", "/api/admin/password", async ({ req }) => {
  const a = await requireAdmin(req, "dashboard", "view", { allowMustChange: true });
  await rateLimit(`pw:${a.id}`, 10, 15 * 60);
  const b = z.object({ current: z.string().max(200), next: passwordSchema }).parse(await readJson(req, 2048));
  const [row] = await sql()<{ pass_hash: string }[]>`select pass_hash from admins where id = ${a.id}`;
  if (!(await verifyPassword(b.current, row.pass_hash))) throw new HttpError(400, "Your current password is not correct.", "bad_password");
  if (b.next === b.current) throw new HttpError(400, "Choose a new password that is different.", "same_password");
  await sql()`update admins set pass_hash = ${await hashPassword(b.next)}, must_change = false where id = ${a.id}`;
  await sql()`delete from sessions where admin_id = ${a.id}`; // sign out every other device
  const cookie = await createSession(req, a.id);
  await audit(a.name, "Password changed", "");
  return json({ ok: true }, 200, { "set-cookie": cookie });
});

// =====================================================================
// Admin: everything the panel shows
// =====================================================================
on("GET", "/api/admin/data", async ({ req }) => {
  const a = await requireAdmin(req);
  await ensureSeed();
  const db = sql();
  const [cfg, categories, products, settings, secrets, vCfg, vCats, vSet] = await Promise.all([getCfg(), getCategories(), loadProducts({ withVersion: true }), getSettings(), getSecrets(), kvVersion("cfg"), kvVersion("categories"), kvVersion("settings")]);
  const seeOrders = can(a.role, "orders");
  const orders = seeOrders ? (await db<{ doc: OrderDoc }[]>`select doc from orders order by created_at desc limit 1000`).map((r) => r.doc) : [];
  const moves = can(a.role, "inventory") ? (await db<{ at: Date; product_id: string; sku: string; delta: number; why: string }[]>`select at, product_id, sku, delta, why from moves order by at desc limit 300`)
    .map((m) => ({ at: m.at.getTime(), pid: m.product_id, sku: m.sku, d: m.delta, why: m.why })) : [];
  const notifs = (await db<{ id: string; at: Date; type: string; title: string; body: string; ref: string; read: boolean }[]>`select id::text, at, type, title, body, ref, read from notifs order by at desc limit 150`)
    .filter((n) => seeOrders || n.type === "stock" || n.type === "system")
    .map((n) => ({ ...n, at: n.at.getTime() }));
  const log = can(a.role, "log") ? (await db<{ at: Date; who: string; action: string; detail: string }[]>`select at, who, action, detail from logs order by at desc limit 400`).map((l) => ({ ...l, at: l.at.getTime() })) : [];
  const coupons = can(a.role, "coupons") ? (await db<{ doc: CouponDoc; uses: number }[]>`select doc, uses from coupons order by code`).map((c) => ({ ...c.doc, uses: c.uses })) : [];
  const admins = (await db<{ id: string; name: string; email: string; role: string; active: boolean; is_owner: boolean }[]>`select id, name, email, role, active, is_owner from admins order by is_owner desc, created_at`)
    .map((u) => ({ id: u.id, name: u.name, email: can(a.role, "users") || u.id === a.id ? u.email : "", role: u.role, active: u.active, isOwner: u.is_owner }));
  const vapid = await getVapid();
  const subs = await db<{ endpoint: string }[]>`select endpoint from push_subs where admin_id = ${a.id}`;
  return json({
    v: 4, cfg, categories,
    // stock keepers see stock, but cost prices only go to people who manage products
    products: can(a.role, "products", "edit") ? products : can(a.role, "products") || can(a.role, "inventory") ? products.map(publicProduct) : [],
    orders, moves, notifs, log, coupons, admins, reviews: [],
    settings: {
      ...(can(a.role, "settings") ? settings : { ...settings, notif: { ...settings.notif, telegramChat: "" }, meta: { ...settings.meta, test: "", pixel: "" } }),
      hasMetaToken: !!secrets.metaToken, hasTelegramToken: !!secrets.telegramToken,
    },
    me: meOf(a),
    versions: { cfg: vCfg, categories: vCats, settings: vSet },
    push: { publicKey: vapid.publicKey, endpoints: subs.map((s) => s.endpoint) },
    views: await viewTotals(),
  });
});

on("GET", "/api/admin/poll", async ({ req, url }) => {
  const a = await requireAdmin(req);
  const since = Math.max(0, Number(url.searchParams.get("since") || 0));
  const seeOrders = can(a.role, "orders");
  const db = sql();
  const orders = seeOrders ? (await db<{ doc: OrderDoc }[]>`select doc from orders where updated_at > to_timestamp(${since / 1000}) order by created_at desc limit 100`).map((r) => r.doc) : [];
  const notifs = (await db<{ id: string; at: Date; type: string; title: string; body: string; ref: string; read: boolean }[]>`select id::text, at, type, title, body, ref, read from notifs where at > to_timestamp(${since / 1000}) order by at desc limit 50`)
    .filter((n) => seeOrders || n.type === "stock").map((n) => ({ ...n, at: n.at.getTime() }));
  const stock = can(a.role, "products") || can(a.role, "inventory") ? await db<{ sku: string; product_id: string; stock: number }[]>`select sku, product_id, stock from variants` : [];
  return json({ now: Date.now(), orders, notifs, stock: stock.map((s) => [s.product_id, s.sku, s.stock]) });
});

// ---------- homepage content, pages, categories ----------
on("PUT", "/api/admin/cfg", async ({ req }) => {
  const a = await requireAdmin(req, "site", "edit");
  const body = await readJson(req, 450 * 1024) as { cfg?: unknown; version?: number };
  const cfg = checkCfg(body.cfg);
  // delivery prices are a settings matter
  if (!can(a.role, "settings", "edit")) cfg.delivery = (await getCfg()).delivery;
  const version = await setKVChecked("cfg", cfg, typeof body.version === "number" ? body.version : undefined);
  await audit(a.name, "Website content updated", "");
  return json({ cfg, version });
});
on("PUT", "/api/admin/delivery", async ({ req }) => {
  const a = await requireAdmin(req, "settings", "edit");
  const d = z.object({ inside: z.coerce.number().int().min(0).max(100000), outside: z.coerce.number().int().min(0).max(100000), free: z.coerce.number().int().min(0).max(10_000_000) }).parse(await readJson(req, 1024));
  const cfg = await getCfg(); cfg.delivery = d; await setKV("cfg", cfg);
  await audit(a.name, "Delivery charges changed", `inside ৳${d.inside}, outside ৳${d.outside}, free from ৳${d.free}`);
  return json({ delivery: d });
});
on("PUT", "/api/admin/categories", async ({ req }) => {
  const a = await requireAdmin(req, "products", "edit");
  const body = await readJson(req, 64 * 1024) as { categories?: unknown; version?: number };
  const cats = categoriesSchema.parse(body.categories);
  const ids = new Set(cats.map((c) => c.id));
  if (ids.size !== cats.length) throw new HttpError(400, "Two categories have the same ID.", "invalid");
  const version = await setKVChecked("categories", cats, typeof body.version === "number" ? body.version : undefined);
  await audit(a.name, "Categories updated", "");
  return json({ categories: cats, version });
});

// ---------- settings & secrets ----------
on("PUT", "/api/admin/settings", async ({ req }) => {
  const a = await requireAdmin(req, "settings", "edit");
  const body = await readJson(req, 64 * 1024) as { settings?: unknown; version?: number; secrets?: { metaToken?: string | null; telegramToken?: string | null } };
  const s = settingsSchema.parse(body.settings);
  const version = await setKVChecked("settings", s, typeof body.version === "number" ? body.version : undefined);
  const sec = body.secrets || {};
  const patch: Record<string, string> = {};
  if (typeof sec.metaToken === "string" && sec.metaToken.trim()) patch.metaToken = z.string().trim().min(20).max(600).regex(/^[A-Za-z0-9_-]+$/, "Meta token looks wrong").parse(sec.metaToken);
  if (sec.metaToken === null) patch.metaToken = "";
  if (typeof sec.telegramToken === "string" && sec.telegramToken.trim()) patch.telegramToken = z.string().trim().regex(/^\d{5,15}:[A-Za-z0-9_-]{20,80}$/, "Telegram bot token looks wrong").parse(sec.telegramToken);
  if (sec.telegramToken === null) patch.telegramToken = "";
  const secrets = Object.keys(patch).length ? await setSecrets(patch) : await getSecrets();
  await audit(a.name, "Settings changed", Object.keys(patch).length ? "including saved keys" : "");
  return json({ settings: { ...s, hasMetaToken: !!secrets.metaToken, hasTelegramToken: !!secrets.telegramToken }, version });
});

// ---------- products ----------
async function productOut(id: string) { return (await loadProducts({ withVersion: true })).find((p) => p.id === id) || null; }

on("POST", "/api/admin/products", async ({ req }) => {
  const a = await requireAdmin(req, "products", "edit");
  const body = await readJson(req, 128 * 1024) as { product?: unknown };
  const p = productSchema.parse(body.product);
  const cats = await getCategories();
  if (!cats.some((c: any) => c.id === p.cat)) throw new HttpError(400, "Choose a category.", "invalid");
  const id = "p" + randomId("", 6).toLowerCase().slice(0, 8);
  const { variants, ...doc } = p;
  try {
    await sql().begin(async (tx) => {
      const [{ s }] = await tx<{ s: number }[]>`select coalesce(max(sort), 0) + 1 as s from products`;
      await tx`insert into products (id, sort, status, doc) values (${id}, ${s}, ${p.status}, ${tx.json({ ...doc, id } as any)})`;
      let pos = 0;
      for (const v of variants) {
        await tx`insert into variants (sku, product_id, size, color, stock, pos) values (${v.sku}, ${id}, ${v.size}, ${v.color}, ${v.stock}, ${pos++})`;
        if (v.stock) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${v.sku}, ${v.stock}, 'Opening stock', ${a.name})`;
      }
    });
  } catch (e: any) {
    if (e && e.code === "23505") throw new HttpError(409, "A variant SKU is already used by another product. Change the product SKU.", "dup_sku");
    throw e;
  }
  await audit(a.name, "Product created", `${p.en} (${p.sku})`);
  return json({ product: await productOut(id) }, 201);
});

on("PUT", "/api/admin/products/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "products", "edit");
  const id = params[0];
  const body = await readJson(req, 128 * 1024) as { product?: unknown; baseline?: Record<string, number>; version?: number };
  const p = productSchema.parse(body.product);
  const baseline = z.record(z.string().max(40), z.number().int().min(0)).default({}).parse(body.baseline || {});
  const cats = await getCategories();
  if (!cats.some((c: any) => c.id === p.cat)) throw new HttpError(400, "Choose a category.", "invalid");
  const { variants, ...doc } = p;
  try {
    await sql().begin(async (tx) => {
      const cur = await tx<{ id: string; v: string }[]>`select id, (extract(epoch from updated_at) * 1000)::bigint::text as v from products where id = ${id} for update`;
      if (!cur.length) throw new HttpError(404, "Product not found (maybe deleted).", "not_found");
      if (typeof body.version === "number" && body.version !== Number(cur[0].v)) throw new HttpError(409, "Someone else changed this product a moment ago. The latest version has been loaded — please make your change again.", "conflict");
      await tx`update products set status = ${p.status}, doc = ${tx.json({ ...doc, id } as any)}, updated_at = clock_timestamp() where id = ${id}`;
      const existing = await tx<{ sku: string; stock: number }[]>`select sku, stock from variants where product_id = ${id} for update`;
      const ex = new Map(existing.map((v) => [v.sku, v.stock]));
      const keep = new Set(variants.map((v) => v.sku));
      for (const [sku, stock] of ex) if (!keep.has(sku)) {
        await tx`delete from variants where sku = ${sku}`;
        if (stock) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${sku}, ${-stock}, 'Variant removed', ${a.name})`;
      }
      let pos = 0;
      for (const v of variants) {
        if (ex.has(v.sku)) {
          // apply only the change the admin made, so orders placed meanwhile are not undone
          const delta = baseline[v.sku] !== undefined ? v.stock - baseline[v.sku] : v.stock - ex.get(v.sku)!;
          const next = Math.max(0, ex.get(v.sku)! + delta);
          await tx`update variants set size = ${v.size}, color = ${v.color}, stock = ${next}, pos = ${pos++} where sku = ${v.sku}`;
          if (next !== ex.get(v.sku)) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${v.sku}, ${next - ex.get(v.sku)!}, 'Edited in product form', ${a.name})`;
        } else {
          await tx`insert into variants (sku, product_id, size, color, stock, pos) values (${v.sku}, ${id}, ${v.size}, ${v.color}, ${v.stock}, ${pos++})`;
          if (v.stock) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${id}, ${v.sku}, ${v.stock}, 'New variant', ${a.name})`;
        }
      }
    });
  } catch (e: any) {
    if (e && e.code === "23505") throw new HttpError(409, "A variant SKU is already used by another product. Change the product SKU.", "dup_sku");
    throw e;
  }
  await audit(a.name, "Product updated", `${p.en} (${p.sku})`);
  return json({ product: await productOut(id) });
});

on("PATCH", "/api/admin/products/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "products", "edit");
  const b = z.object({ status: z.enum(["active", "draft", "archived"]).optional(), isNew: z.union([z.boolean(), z.number()]).optional(), top: z.union([z.boolean(), z.number()]).optional() }).parse(await readJson(req, 1024));
  const rows = await sql()<{ doc: any }[]>`select doc from products where id = ${params[0]}`;
  if (!rows.length) throw new HttpError(404, "Product not found.", "not_found");
  const d = rows[0].doc;
  if (b.status) d.status = b.status;
  if (b.isNew !== undefined) d.isNew = b.isNew ? 1 : 0;
  if (b.top !== undefined) d.top = b.top ? 1 : 0;
  await sql()`update products set status = ${d.status}, doc = ${asJson(d)}, updated_at = clock_timestamp() where id = ${params[0]}`;
  await audit(a.name, "Product display changed", `${d.en}: ${Object.keys(b).join(", ")}`);
  return json({ product: await productOut(params[0]) });
});

on("DELETE", "/api/admin/products/([A-Za-z0-9_-]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "products", "edit");
  const rows = await sql()<{ doc: any }[]>`delete from products where id = ${params[0]} returning doc`;
  if (!rows.length) throw new HttpError(404, "Product not found.", "not_found");
  await audit(a.name, "Product deleted", `${rows[0].doc.en} (${rows[0].doc.sku})`);
  return json({ ok: true });
});

on("POST", "/api/admin/stock", async ({ req }) => {
  const a = await requireAdmin(req, "inventory", "edit");
  const b = z.object({ sku: z.string().max(40), set: z.number().int().min(0).max(1_000_000).optional(), delta: z.number().int().min(-1_000_000).max(1_000_000).optional(), why: z.string().max(80).optional() }).parse(await readJson(req, 1024));
  if (b.set === undefined && b.delta === undefined) throw new HttpError(400, "Nothing to change.", "invalid");
  const settings = await getSettings();
  const out = await sql().begin(async (tx) => {
    const r = await tx<{ product_id: string; stock: number }[]>`select product_id, stock from variants where sku = ${b.sku} for update`;
    if (!r.length) throw new HttpError(404, "That variant no longer exists.", "not_found");
    const old = r[0].stock;
    const next = Math.max(0, b.set !== undefined ? b.set : old + (b.delta || 0));
    if (next === old) return { product_id: r[0].product_id, stock: old, d: 0 };
    await tx`update variants set stock = ${next} where sku = ${b.sku}`;
    await tx`insert into moves (product_id, sku, delta, why, by_name) values (${r[0].product_id}, ${b.sku}, ${next - old}, ${b.why || (b.set !== undefined ? "Stock count set" : "Manual adjustment")}, ${a.name})`;
    if (next <= settings.lowStock && next < old && settings.notif.stock) await tx`insert into notifs (type, title, body, ref) values ('stock', ${(next ? "Low stock: " : "Out of stock: ") + b.sku}, ${b.sku + " · " + next + " left"}, ${r[0].product_id})`;
    return { product_id: r[0].product_id, stock: next, d: next - old };
  });
  if (out.d) await audit(a.name, "Stock adjusted", `${b.sku}: ${out.d > 0 ? "+" : ""}${out.d} → ${out.stock}`);
  return json({ sku: b.sku, stock: out.stock, product: await productOut(out.product_id) });
});

// ---------- orders ----------
on("POST", "/api/admin/orders/(ST-[A-Z0-9]{6})/status", async ({ req, params }) => {
  const a = await requireAdmin(req, "orders", "edit");
  const b = statusChangeSchema.parse(await readJson(req, 2048));
  const { order, touched } = await changeStatus(a, params[0], b.status, b.note);
  const all = touched.length ? await loadProducts({ withVersion: true }) : [];
  return json({ order, products: all.filter((p) => touched.includes(p.id)), next: allowedNext(order.status) });
});
on("PATCH", "/api/admin/orders/(ST-[A-Z0-9]{6})", async ({ req, params }) => {
  const a = await requireAdmin(req, "orders", "edit");
  const order = await patchOrder(a, params[0], orderPatchSchema.parse(await readJson(req, 8 * 1024)));
  return json({ order });
});

// ---------- coupons ----------
on("PUT", "/api/admin/coupons/([A-Z0-9]{1,16})", async ({ req, params }) => {
  const a = await requireAdmin(req, "coupons", "edit");
  const body = await readJson(req, 4096) as { coupon?: unknown };
  const c = couponSchema.parse(body.coupon);
  const old = params[0];
  await sql().begin(async (tx) => {
    if (old !== c.code) {
      const dup = await tx`select 1 from coupons where code = ${c.code}`;
      if (dup.length) throw new HttpError(409, "This code already exists.", "dup");
      const prev = await tx<{ uses: number }[]>`delete from coupons where code = ${old} returning uses`;
      await tx`insert into coupons (code, doc, uses) values (${c.code}, ${tx.json(c as any)}, ${prev.length ? prev[0].uses : 0})`;
    } else {
      await tx`insert into coupons (code, doc, uses) values (${c.code}, ${tx.json(c as any)}, 0) on conflict (code) do update set doc = excluded.doc`;
    }
  });
  await audit(a.name, "Coupon saved", c.code);
  const [r] = await sql()<{ uses: number }[]>`select uses from coupons where code = ${c.code}`;
  return json({ coupon: { ...c, uses: r.uses } });
});
on("DELETE", "/api/admin/coupons/([A-Z0-9]{1,16})", async ({ req, params }) => {
  const a = await requireAdmin(req, "coupons", "edit");
  await sql()`delete from coupons where code = ${params[0]}`;
  await audit(a.name, "Coupon deleted", params[0]);
  return json({ ok: true });
});

// ---------- notifications ----------
on("POST", "/api/admin/notifs/read", async ({ req }) => {
  await requireAdmin(req);
  const b = z.object({ ids: z.array(z.string().regex(/^\d{1,18}$/)).max(500).optional(), all: z.boolean().optional() }).parse(await readJson(req, 16 * 1024));
  if (b.all) await sql()`update notifs set read = true where not read`;
  else if (b.ids && b.ids.length) await sql()`update notifs set read = true where id in ${sql()(b.ids.map(Number))}`;
  return json({ ok: true });
});

on("POST", "/api/admin/push/subscribe", async ({ req }) => {
  const a = await requireAdmin(req);
  const b = z.object({ endpoint: z.string().url().max(1000).startsWith("https://"), keys: z.object({ p256dh: z.string().regex(/^[A-Za-z0-9_-]{80,100}$/), auth: z.string().regex(/^[A-Za-z0-9_-]{16,30}$/) }) }).parse(await readJson(req, 4096));
  await sql()`insert into push_subs (endpoint, admin_id, p256dh, auth, ua) values (${b.endpoint}, ${a.id}, ${b.keys.p256dh}, ${b.keys.auth}, ${(req.headers.get("user-agent") || "").slice(0, 200)})
              on conflict (endpoint) do update set admin_id = excluded.admin_id, p256dh = excluded.p256dh, auth = excluded.auth`;
  await audit(a.name, "Phone/laptop notifications turned on", (req.headers.get("user-agent") || "").slice(0, 80));
  return json({ ok: true });
});
on("POST", "/api/admin/push/unsubscribe", async ({ req }) => {
  const a = await requireAdmin(req);
  const b = z.object({ endpoint: z.string().max(1000) }).parse(await readJson(req, 4096));
  await sql()`delete from push_subs where endpoint = ${b.endpoint} and admin_id = ${a.id}`;
  return json({ ok: true });
});
on("POST", "/api/admin/push/test", async ({ req }) => {
  const a = await requireAdmin(req);
  await rateLimit(`pushtest:${a.id}`, 10, 10 * 60);
  const r = await pushToAdmins(req, { title: "✅ Notifications are working", body: `${a.name}, new orders will appear like this.`, url: "/admin", tag: "test" }, "dashboard", a.id);
  return json(r);
});
on("POST", "/api/admin/telegram/test", async ({ req }) => {
  const a = await requireAdmin(req, "settings", "edit");
  await rateLimit(`tgtest:${a.id}`, 10, 10 * 60);
  const ok = await telegram(`✅ ${a.name}: Telegram order alerts are working.`);
  return ok ? json({ ok }) : json({ error: "Telegram did not accept the message. Check the bot token and chat ID, and send /start to your bot first.", code: "telegram" }, 400);
});

// ---------- team ----------
const tempPassword = () => randomToken(9).replace(/[-_]/g, "x");
on("POST", "/api/admin/users", async ({ req }) => {
  const a = await requireAdmin(req, "users", "edit");
  const b = z.object({ name: z.string().trim().min(1).max(60), email: z.string().trim().toLowerCase().email().max(160), role: z.enum(ROLES).refine((r) => r !== "Super Admin", "Only the owner is Super Admin") }).parse(await readJson(req, 2048));
  const pw = tempPassword();
  const id = randomId("u");
  const r = await sql()`insert into admins (id, email, name, role, pass_hash, must_change) values (${id}, ${b.email}, ${b.name}, ${b.role}, ${await hashPassword(pw)}, true) on conflict (email) do nothing`;
  if (r.count !== 1) throw new HttpError(409, "This email is already an admin.", "dup");
  await audit(a.name, "Admin added", `${b.name} (${b.role})`);
  return json({ user: { id, name: b.name, email: b.email, role: b.role, active: true, isOwner: false }, tempPassword: pw }, 201);
});
on("PATCH", "/api/admin/users/([A-Za-z0-9]{1,40})", async ({ req, params }) => {
  const a = await requireAdmin(req, "users", "edit");
  const b = z.object({ role: z.enum(ROLES).optional(), active: z.boolean().optional(), resetPassword: z.boolean().optional() }).parse(await readJson(req, 1024));
  const rows = await sql()<{ id: string; name: string; is_owner: boolean }[]>`select id, name, is_owner from admins where id = ${params[0]}`;
  if (!rows.length) throw new HttpError(404, "Admin not found.", "not_found");
  const u = rows[0];
  if (u.is_owner) throw new HttpError(403, "The owner account cannot be changed here.", "owner");
  if (b.role === "Super Admin") throw new HttpError(403, "Only the owner is Super Admin.", "owner");
  let pw: string | undefined;
  if (b.role) await sql()`update admins set role = ${b.role} where id = ${u.id}`;
  if (b.active !== undefined) {
    await sql()`update admins set active = ${b.active} where id = ${u.id}`;
    if (!b.active) { await sql()`delete from sessions where admin_id = ${u.id}`; await sql()`delete from push_subs where admin_id = ${u.id}`; }
  }
  if (b.resetPassword) { pw = tempPassword(); await sql()`update admins set pass_hash = ${await hashPassword(pw)}, must_change = true where id = ${u.id}`; await sql()`delete from sessions where admin_id = ${u.id}`; }
  await audit(a.name, "Admin changed", `${u.name}: ${Object.keys(b).join(", ")}`);
  return json({ ok: true, ...(pw ? { tempPassword: pw } : {}) });
});

// ---------- uploads ----------
on("POST", "/api/admin/media", async ({ req }) => {
  const a = await requireAdmin(req);
  if (!can(a.role, "products", "edit") && !can(a.role, "site", "edit")) throw new HttpError(403, "Your role cannot upload images.", "forbidden");
  await rateLimit(`upload:${a.id}`, 120, 60 * 60);
  const body = await readJson(req, 3_600_000) as { data?: string };
  return json({ url: await saveImage(body.data, a.name) }, 201);
});

export { securityHeaders };
