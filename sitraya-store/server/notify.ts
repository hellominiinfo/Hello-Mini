import { sql } from "./db";
import { can } from "./auth";
import { getSecrets, getSettings, setSecrets } from "./store";
import { generateVapidKeys, sendPush, type VapidKeys } from "./webpush";
import type { OrderDoc } from "./orders";
import { env, siteOrigin } from "./util";

/** VAPID keys are created automatically the first time and kept (encrypted) in the database. */
export async function getVapid(): Promise<VapidKeys> {
  const s = await getSecrets();
  if (s.vapidPublic && s.vapidPrivate) return { publicKey: s.vapidPublic, privateKey: s.vapidPrivate };
  const k = generateVapidKeys();
  await setSecrets({ vapidPublic: k.publicKey, vapidPrivate: k.privateKey });
  return k;
}

const withTimeout = <T>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<T | "timeout">((r) => setTimeout(() => r("timeout"), ms))]);

export async function pushToAdmins(req: Request, payload: { title: string; body: string; url: string; tag?: string }, area: "orders" | "inventory" | "dashboard" = "dashboard", onlyAdminId?: string): Promise<{ sent: number; failed: number }> {
  const rows = await sql()<{ endpoint: string; p256dh: string; auth: string; role: string; admin_id: string }[]>`
    select s.endpoint, s.p256dh, s.auth, a.role, a.id as admin_id from push_subs s join admins a on a.id = s.admin_id where a.active`;
  const targets = rows.filter((r) => can(r.role, area, "view") && (!onlyAdminId || r.admin_id === onlyAdminId));
  if (!targets.length) return { sent: 0, failed: 0 };
  const keys = await getVapid();
  const subject = env("VAPID_SUBJECT") || siteOrigin(req);
  let sent = 0, failed = 0;
  await Promise.all(targets.map(async (t) => {
    const r = await sendPush(t, payload, keys, subject.startsWith("http") || subject.startsWith("mailto:") ? subject : "mailto:" + subject);
    if (r === "ok") sent++; else failed++;
    if (r === "gone") await sql()`delete from push_subs where endpoint = ${t.endpoint}`;
  }));
  return { sent, failed };
}

export async function telegram(text: string, override?: { token?: string; chat?: string }): Promise<boolean> {
  const token = override?.token ?? (await getSecrets()).telegramToken;
  const chat = override?.chat ?? (await getSettings()).notif.telegramChat;
  if (!token || !chat) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch { return false; }
}

const taka = (n: number) => "৳" + n.toLocaleString("en-IN");

/** Tells every admin about a new order: phone/laptop notification + optional Telegram message. */
export async function announceOrder(req: Request, o: OrderDoc): Promise<void> {
  const settings = await getSettings();
  if (!settings.notif.order) return;
  const items = o.items.map((i) => `${i.en} (${i.size}) ×${i.qty}`).join(", ");
  const title = `🛍️ New order ${o.ref} · ${taka(o.total)}`;
  const body = `${o.customer.name} · ${o.customer.district} · ${items}`.slice(0, 180);
  const url = `/admin#order=${o.ref}`;
  await withTimeout(Promise.allSettled([
    pushToAdmins(req, { title, body, url, tag: o.ref }, "orders"),
    telegram(`${title}\n${o.customer.name} · ${o.customer.phone}\n${o.customer.addr}, ${o.customer.area}, ${o.customer.district}\n${items}\nPayment: ${o.pay.toUpperCase()}\n${siteOrigin(req)}${url}`),
  ]), 7000);
}
