import crypto from "node:crypto";
import { sql } from "./db";
import { audit, rateLimit, type AdminRow } from "./auth";
import { getCfg, getSettings } from "./store";
import { FLOW, type OrderInput, type CouponDoc } from "./validate";
import { HttpError, clientIp, isDhaka, normPhone } from "./util";

export type OrderItem = { pid: string; en: string; bn: string; sku: string; size: string; color: string; qty: number; unit: number };
export type OrderDoc = {
  id: string; ref: string; at: number; demo: false; source: string;
  customer: { name: string; phone: string; wa: string; district: string; area: string; po?: string; addr: string; note: string };
  zone: "in" | "out"; items: OrderItem[]; sub: number; disc: number; coupon: string; del: number; total: number;
  pay: string; trx: string; payStatus: string; status: string;
  history: { s: string; at: number; by: string; note?: string }[];
  courier: string; tracking: string; notes: string; stockOut: boolean;
};

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newRef(): string {
  const b = crypto.randomBytes(6);
  let r = "ST-";
  for (let i = 0; i < 6; i++) r += REF_CHARS[b[i] % REF_CHARS.length];
  return r;
}

export function couponDiscount(c: CouponDoc & { uses?: number }, sub: number, now = Date.now()): { ok: true; disc: number } | { ok: false; code: string; min?: number } {
  if (!c.active) return { ok: false, code: "cp_off" };
  if (c.expires && now > c.expires) return { ok: false, code: "cp_exp" };
  if (c.maxUses && (c.uses || 0) >= c.maxUses) return { ok: false, code: "cp_used" };
  if (sub < (c.min || 0)) return { ok: false, code: "cp_min", min: c.min };
  const disc = c.type === "percent" ? Math.round((sub * c.value) / 100) : Math.min(c.value, sub);
  return { ok: true, disc };
}

export function deliveryCharge(cfgDelivery: { inside: number; outside: number; free: number }, zone: "in" | "out", sub: number) {
  const free = zone === "in" && sub >= cfgDelivery.free;
  return { free, del: free ? 0 : zone === "in" ? cfgDelivery.inside : cfgDelivery.outside };
}

/** Creates an order. Prices, discounts, delivery and stock are all decided here, never by the browser. */
export async function createOrder(req: Request, input: OrderInput): Promise<OrderDoc> {
  await rateLimit(`order:ip:${clientIp(req)}`, 12, 10 * 60);
  const phone = normPhone(input.customer.phone);
  if (!phone) throw new HttpError(400, "Enter a valid Bangladeshi mobile number.", "e_phone");
  const wa = input.customer.wa ? normPhone(input.customer.wa) : "";
  if (input.customer.wa && !wa) throw new HttpError(400, "Enter a valid WhatsApp number.", "e_phone");
  await rateLimit(`order:ph:${phone}`, 8, 60 * 60);

  const [settings, cfg] = await Promise.all([getSettings(), getCfg()]);
  const pm = input.pay === "cod" ? settings.pay.cod : settings.pay[input.pay];
  if (!pm || !pm.on) throw new HttpError(400, "This payment method is not available.", "pay_off");
  if (input.pay !== "cod" && !input.trx) throw new HttpError(400, "Enter the transaction ID (TrxID).", "e_trx");
  const delivery = { inside: 80, outside: 150, free: 2000, ...(cfg.delivery || {}) };

  // merge duplicate lines
  const lines = new Map<string, { pid: string; size: string; color: string; qty: number }>();
  for (const it of input.items) {
    const k = `${it.pid}|${it.size}|${it.color.toLowerCase()}`;
    const cur = lines.get(k);
    if (cur) cur.qty = Math.min(10, cur.qty + it.qty); else lines.set(k, { ...it, color: it.color.toLowerCase() });
  }

  const db = sql();
  const order = await db.begin(async (tx) => {
    const pids = [...new Set([...lines.values()].map((l) => l.pid))];
    const prods = await tx<{ id: string; doc: any }[]>`select id, doc from products where id in ${tx(pids)} and status = 'active'`;
    const pmap = new Map(prods.map((p) => [p.id, p.doc]));
    const vars = await tx<{ sku: string; product_id: string; size: string; color: string; stock: number }[]>`
      select sku, product_id, size, color, stock from variants where product_id in ${tx(pids)} order by sku for update`;

    const items: OrderItem[] = [];
    let sub = 0;
    for (const l of lines.values()) {
      const p = pmap.get(l.pid);
      if (!p) throw new HttpError(409, "A product in your bag is no longer available.", "stock_changed");
      const v = vars.find((x) => x.product_id === l.pid && x.size === l.size && x.color.toLowerCase() === l.color);
      if (!v || v.stock < l.qty) throw new HttpError(409, `${p.en}: not enough stock for this size/colour.`, "stock_changed");
      const unit = p.sale && p.sale < p.price ? p.sale : p.price;
      items.push({ pid: l.pid, en: p.en, bn: p.bn, sku: v.sku, size: v.size, color: v.color, qty: l.qty, unit });
      sub += unit * l.qty;
    }

    let disc = 0, couponCode = "";
    if (input.coupon) {
      const cr = await tx<{ doc: CouponDoc; uses: number }[]>`select doc, uses from coupons where code = ${input.coupon} for update`;
      if (!cr.length) throw new HttpError(400, "This coupon code does not exist.", "cp_bad");
      const chk = couponDiscount({ ...cr[0].doc, uses: cr[0].uses }, sub);
      if (!chk.ok) throw new HttpError(400, "This coupon cannot be used for this order.", chk.code);
      disc = chk.disc; couponCode = input.coupon;
      await tx`update coupons set uses = uses + 1 where code = ${input.coupon}`;
    }

    const zone: "in" | "out" = isDhaka(input.customer.district) ? "in" : "out";
    const { del } = deliveryCharge(delivery, zone, sub);
    const now = Date.now();

    for (const it of items) {
      const r = await tx`update variants set stock = stock - ${it.qty} where sku = ${it.sku} and stock >= ${it.qty}`;
      if (r.count !== 1) throw new HttpError(409, `${it.en}: not enough stock.`, "stock_changed");
    }

    let ref = "";
    const doc: OrderDoc = {
      id: "", ref: "", at: now, demo: false, source: "web",
      customer: { name: input.customer.name, phone, wa, district: input.customer.district, area: input.customer.area, po: input.customer.po || "", addr: input.customer.addr, note: input.customer.note || "" },
      zone, items, sub, disc, coupon: couponCode, del, total: sub - disc + del,
      pay: input.pay, trx: input.pay === "cod" ? "" : input.trx, payStatus: input.pay === "cod" ? "unpaid" : "verify",
      status: "received", history: [{ s: "received", at: now, by: "customer" }], courier: "", tracking: "", notes: "", stockOut: true,
    };
    for (let i = 0; i < 6 && !ref; i++) {
      const cand = newRef();
      doc.ref = doc.id = cand;
      const r = await tx`insert into orders (ref, status, phone, doc) values (${cand}, 'received', ${phone}, ${tx.json(doc as any)}) on conflict (ref) do nothing`;
      if (r.count === 1) ref = cand;
    }
    if (!ref) throw new HttpError(500, "Could not create an order number. Please try again.", "server");

    for (const it of items) await tx`insert into moves (product_id, sku, delta, why, by_name) values (${it.pid}, ${it.sku}, ${-it.qty}, ${"Order " + ref}, ${"customer"})`;
    if (settings.notif.order) await tx`insert into notifs (type, title, body, ref) values ('order', ${"New order " + ref}, ${`${doc.customer.name} · ৳${doc.total.toLocaleString("en-IN")} · ${doc.customer.district}`}, ${ref})`;
    if (settings.notif.stock) {
      const low = await tx<{ sku: string; stock: number; product_id: string }[]>`select sku, stock, product_id from variants where sku in ${tx(items.map((i) => i.sku))} and stock <= ${settings.lowStock}`;
      for (const v of low) {
        const p = pmap.get(v.product_id);
        await tx`insert into notifs (type, title, body, ref) values ('stock', ${(v.stock ? "Low stock: " : "Out of stock: ") + (p?.en || v.product_id)}, ${v.sku + " · " + v.stock + " left"}, ${v.product_id})`;
      }
    }
    return doc;
  });
  return order;
}

export function publicOrderView(o: OrderDoc) {
  return {
    ref: o.ref, at: o.at, items: o.items, sub: o.sub, disc: o.disc, coupon: o.coupon, del: o.del, total: o.total, pay: o.pay, zone: o.zone,
    payStatus: o.payStatus, status: o.status,
    customer: { name: o.customer.name, phone: o.customer.phone, addr: o.customer.addr, area: o.customer.area, district: o.customer.district },
  };
}

export async function trackOrder(req: Request, refRaw: string, phoneRaw: string) {
  await rateLimit(`track:ip:${clientIp(req)}`, 30, 10 * 60);
  const ref = String(refRaw || "").trim().toUpperCase().replace(/^ST(?=[A-Z0-9]{6}$)/, "ST-");
  const phone = normPhone(phoneRaw);
  if (!/^ST-[A-Z0-9]{6}$/.test(ref) || !phone) return null;
  const rows = await sql()<{ doc: OrderDoc }[]>`select doc from orders where ref = ${ref} and phone = ${phone}`;
  if (!rows.length) return null;
  const o = rows[0].doc;
  return { ref: o.ref, total: o.total, payStatus: o.payStatus, status: o.status, history: o.history.map((h) => ({ s: h.s, at: h.at })), courier: o.courier, tracking: o.tracking };
}

export function allowedNext(status: string): string[] {
  if (status === "cancelled" || status === "returned") return [];
  const i = (FLOW as readonly string[]).indexOf(status);
  const out = FLOW.filter((_, j) => j > i) as string[];
  out.push(status === "delivered" ? "returned" : "cancelled");
  return out;
}

/** Moves an order forward, or cancels/returns it and puts the stock back. */
export async function changeStatus(admin: AdminRow, ref: string, next: string, note: string): Promise<{ order: OrderDoc; touched: string[] }> {
  const settings = await getSettings();
  const result = await sql().begin(async (tx) => {
    const rows = await tx<{ doc: OrderDoc }[]>`select doc from orders where ref = ${ref} for update`;
    if (!rows.length) throw new HttpError(404, "Order not found.", "not_found");
    const o = rows[0].doc;
    if (!allowedNext(o.status).includes(next)) throw new HttpError(409, `An order that is ${o.status} cannot become ${next}.`, "bad_transition");
    const old = o.status;
    o.status = next;
    o.history.push({ s: next, at: Date.now(), by: admin.name, note: note || "" });
    const touched: string[] = [];
    if ((next === "cancelled" || next === "returned") && o.stockOut) {
      for (const it of o.items) {
        let r = await tx`update variants set stock = stock + ${it.qty} where sku = ${it.sku}`;
        if (r.count !== 1) r = await tx`update variants set stock = stock + ${it.qty} where sku = (select sku from variants where product_id = ${it.pid} and size = ${it.size} and lower(color) = lower(${it.color}) limit 1)`;
        if (r.count === 1) {
          touched.push(it.pid);
          await tx`insert into moves (product_id, sku, delta, why, by_name) values (${it.pid}, ${it.sku}, ${it.qty}, ${(next === "cancelled" ? "Cancelled " : "Returned ") + ref}, ${admin.name})`;
        }
      }
      o.stockOut = false;
    }
    await tx`update orders set status = ${next}, doc = ${tx.json(o as any)}, updated_at = now() where ref = ${ref}`;
    if (next === "cancelled" && settings.notif.cancel) await tx`insert into notifs (type, title, body, ref) values ('cancel', ${"Order cancelled " + ref}, ${o.customer.name + " · ৳" + o.total.toLocaleString("en-IN")}, ${ref})`;
    return { order: o, touched, old };
  });
  await audit(admin.name, "Order status changed", `${ref}: ${result.old} → ${next}${note ? ` ("${note}")` : ""}`);
  return { order: result.order, touched: [...new Set(result.touched)] };
}

export async function patchOrder(admin: AdminRow, ref: string, patch: Partial<Pick<OrderDoc, "payStatus" | "courier" | "tracking" | "notes">>): Promise<OrderDoc> {
  const o = await sql().begin(async (tx) => {
    const rows = await tx<{ doc: OrderDoc }[]>`select doc from orders where ref = ${ref} for update`;
    if (!rows.length) throw new HttpError(404, "Order not found.", "not_found");
    const d = rows[0].doc;
    Object.assign(d, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)));
    await tx`update orders set doc = ${tx.json(d as any)}, updated_at = now() where ref = ${ref}`;
    return d;
  });
  const what = Object.keys(patch).filter((k) => (patch as any)[k] !== undefined).join(", ");
  if (what) await audit(admin.name, "Order updated", `${ref}: ${what}`);
  return o;
}
