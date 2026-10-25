import crypto from "node:crypto";
import { sql } from "./db";
import { HttpError, clientIp, env, parseCookies, randomId, randomToken, safeEqual, sha256, siteOrigin } from "./util";
import type { Role } from "./validate";

// ---------- password hashing (scrypt, built into Node) ----------
const SCRYPT = { N: 1 << 15, r: 8, p: 1, keylen: 64, maxmem: 96 * 1024 * 1024 };

export function hashPassword(pw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  return new Promise((res, rej) => crypto.scrypt(pw.normalize("NFKC"), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem }, (err, key) => {
    if (err) return rej(err);
    res(`scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`);
  }));
}

export function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return Promise.resolve(false);
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  return new Promise((res) => crypto.scrypt(pw.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, { N: +n, r: +r, p: +p, maxmem: SCRYPT.maxmem }, (err, key) => {
    if (err) return res(false);
    res(crypto.timingSafeEqual(key, expected));
  }));
}

// A fixed hash used so that "unknown email" takes as long as "wrong password".
let dummyHash: Promise<string> | null = null;
const getDummy = () => (dummyHash ??= hashPassword("not-a-real-password-" + randomToken(8)));

// ---------- roles & permissions (checked on every request) ----------
export type Area = "orders" | "products" | "inventory" | "site" | "coupons" | "settings" | "users" | "log" | "dashboard";
const A = (edit: Role[], view: Role[] = []) => ({ edit, view: [...edit, ...view] });
const SA: Role = "Super Admin", AD: Role = "Administrator", OM: Role = "Order Manager", PM: Role = "Product Manager", IM: Role = "Inventory Manager", CM: Role = "Content Manager", RA: Role = "Read-only Analyst";
export const PERMS: Record<Area, { edit: Role[]; view: Role[] }> = {
  orders: A([SA, AD, OM], [RA]),
  products: A([SA, AD, PM], [IM, RA]),
  inventory: A([SA, AD, PM, IM], [OM, RA]),
  site: A([SA, AD, CM]),
  coupons: A([SA, AD, PM], [RA]),
  settings: A([SA, AD]),
  users: A([SA]),
  log: A([SA, AD]),
  dashboard: A([SA, AD, OM, PM, IM, CM, RA]),
};
export const can = (role: string, area: Area, mode: "view" | "edit" = "view") => (PERMS[area][mode] as string[]).includes(role);

export type AdminRow = { id: string; email: string; name: string; role: Role; active: boolean; is_owner: boolean; must_change: boolean };

// ---------- sessions ----------
const SESSION_DAYS = 7;
export function cookieName(req: Request) { return isSecure(req) ? "__Host-st_s" : "st_s"; }
function isSecure(req: Request) { return new URL(req.url).protocol === "https:" || env("FORCE_SECURE_COOKIES") === "1"; }

export function sessionCookie(req: Request, token: string, maxAgeSec: number): string {
  const parts = [`${cookieName(req)}=${token}`, "Path=/", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAgeSec}`];
  if (isSecure(req)) parts.push("Secure");
  return parts.join("; ");
}

export async function createSession(req: Request, adminId: string): Promise<string> {
  const token = randomToken(32);
  const db = sql();
  await db`delete from sessions where expires_at < now()`;
  await db`insert into sessions (id_hash, admin_id, expires_at, ua, ip)
           values (${sha256(token)}, ${adminId}, now() + ${SESSION_DAYS + " days"}::interval, ${(req.headers.get("user-agent") || "").slice(0, 200)}, ${clientIp(req)})`;
  await db`update admins set last_login = now() where id = ${adminId}`;
  return sessionCookie(req, token, SESSION_DAYS * 86400);
}

export async function destroySession(req: Request): Promise<string> {
  const token = parseCookies(req)[cookieName(req)];
  if (token) await sql()`delete from sessions where id_hash = ${sha256(token)}`;
  return sessionCookie(req, "", 0);
}

/** Blocks cross-site requests to the admin API (together with SameSite=Strict cookies). */
export function checkSameOrigin(req: Request) {
  if (req.method === "GET" || req.method === "HEAD") return;
  if (req.headers.get("x-sitraya") !== "1") throw new HttpError(403, "Request blocked.", "csrf");
  const origin = req.headers.get("origin");
  if (origin && origin !== siteOrigin(req) && origin !== new URL(req.url).origin) throw new HttpError(403, "Request blocked (wrong origin).", "csrf");
  const sfs = req.headers.get("sec-fetch-site");
  if (sfs && sfs !== "same-origin" && sfs !== "none") throw new HttpError(403, "Request blocked (cross-site).", "csrf");
}

export async function getAdmin(req: Request): Promise<AdminRow | null> {
  const token = parseCookies(req)[cookieName(req)];
  if (!token || token.length > 100) return null;
  const rows = await sql()<(AdminRow & { expires_at: Date })[]>`
    select a.id, a.email, a.name, a.role, a.active, a.is_owner, a.must_change, s.expires_at
    from sessions s join admins a on a.id = s.admin_id
    where s.id_hash = ${sha256(token)} and s.expires_at > now()`;
  const a = rows[0];
  if (!a || !a.active) return null;
  // slide the session forward once a day so active admins stay signed in
  if (a.expires_at.getTime() - Date.now() < (SESSION_DAYS - 1) * 86400_000)
    await sql()`update sessions set expires_at = now() + ${SESSION_DAYS + " days"}::interval where id_hash = ${sha256(token)}`;
  return a;
}

export async function requireAdmin(req: Request, area: Area = "dashboard", mode: "view" | "edit" = "view", opts: { allowMustChange?: boolean } = {}): Promise<AdminRow> {
  checkSameOrigin(req);
  const a = await getAdmin(req);
  if (!a) throw new HttpError(401, "Please sign in again.", "auth");
  if (a.must_change && !opts.allowMustChange && req.method !== "GET") throw new HttpError(403, "Please choose your own password first.", "must_change");
  if (!can(a.role, area, mode)) throw new HttpError(403, `Your role (${a.role}) cannot ${mode === "edit" ? "change" : "see"} this.`, "forbidden");
  return a;
}

// ---------- login ----------
export async function login(req: Request, emailRaw: string, password: string): Promise<{ admin: AdminRow; cookie: string }> {
  const email = String(emailRaw || "").trim().toLowerCase().slice(0, 200);
  const ip = clientIp(req);
  await rateLimit(`login:ip:${ip}`, 20, 15 * 60);
  await rateLimit(`login:em:${ip}:${email}`, 8, 15 * 60);
  await rateLimit(`login:emall:${email}`, 60, 15 * 60);
  if (!email || !password) throw new HttpError(400, "Enter your email and password.", "invalid");
  const db = sql();

  // First run: create the owner from the ADMIN_EMAIL / ADMIN_PASSWORD settings.
  const [{ n }] = await db<{ n: number }[]>`select count(*)::int as n from admins`;
  if (n === 0) {
    const be = env("ADMIN_EMAIL").toLowerCase(), bp = env("ADMIN_PASSWORD");
    if (!be || bp.length < 10) throw new HttpError(503, "No admin exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters) in Netlify, then redeploy.", "setup");
    if (email === be && safeEqual(password, bp)) {
      const id = randomId("u");
      const made = await db`insert into admins (id, email, name, role, pass_hash, is_owner, must_change)
               values (${id}, ${be}, ${env("ADMIN_NAME", "Owner")}, ${"Super Admin"}, ${await hashPassword(bp)}, true, true)
               on conflict (email) do nothing`;
      if (made.count === 1) await audit("System", "Owner account created", be);
    }
  }

  const rows = await db<(AdminRow & { pass_hash: string })[]>`select id, email, name, role, active, is_owner, must_change, pass_hash from admins where email = ${email}`;
  const u = rows[0];
  const ok = await verifyPassword(password, u ? u.pass_hash : await getDummy());
  if (!u || !ok || !u.active) {
    await audit("System", "Failed sign-in", email + " · " + ip);
    throw new HttpError(401, "That email and password do not match.", "auth");
  }
  await db`delete from rate_limits where key = ${`login:em:${ip}:${email}`}`;
  const cookie = await createSession(req, u.id);
  await audit(u.name, "Signed in", ip);
  const { pass_hash: _, ...admin } = u;
  return { admin, cookie };
}

// ---------- rate limiting (stored in Postgres, works across server instances) ----------
export async function rateLimit(key: string, max: number, windowSec: number): Promise<void> {
  const rows = await sql()<{ count: number }[]>`
    insert into rate_limits (key, count, reset_at) values (${key}, 1, now() + ${windowSec + " seconds"}::interval)
    on conflict (key) do update set
      count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at < now() then now() + ${windowSec + " seconds"}::interval else rate_limits.reset_at end
    returning count`;
  if (rows[0].count > max) throw new HttpError(429, "Too many attempts. Please wait a few minutes and try again.", "rate_limited");
  if (Math.random() < 0.02) await sql()`delete from rate_limits where reset_at < now() - interval '1 hour'`;
}

export async function audit(who: string, action: string, detail = ""): Promise<void> {
  await sql()`insert into logs (who, action, detail) values (${who.slice(0, 80)}, ${action.slice(0, 120)}, ${detail.slice(0, 500)})`;
}
