import crypto from "node:crypto";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") { super(message); }
}

export const env = (k: string, fallback = ""): string => (process.env[k] ?? fallback).trim();

export function requireEnv(k: string): string {
  const v = env(k);
  if (!v) throw new HttpError(500, `Server setting ${k} is missing. Add it in Netlify → Project configuration → Environment variables, then redeploy.`, "config");
  return v;
}

export const nowMs = () => Date.now();

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) return json({ error: e.message, code: e.code }, e.status);
  if (e && typeof e === "object" && "issues" in e) {
    // zod error: show the first problem in plain words
    const issues = (e as { issues: { path: (string | number)[]; message: string }[] }).issues;
    const first = issues[0];
    return json({ error: first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input", code: "invalid" }, 400);
  }
  console.error("Unhandled error", e);
  return json({ error: "Something went wrong on the server. Please try again.", code: "server" }, 500);
}

export async function readJson(req: Request, maxBytes = 64 * 1024): Promise<unknown> {
  const len = Number(req.headers.get("content-length") || "0");
  if (len > maxBytes) throw new HttpError(413, "Request is too large.", "too_large");
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new HttpError(415, "Send JSON.", "content_type");
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "Request is too large.", "too_large");
  try { return JSON.parse(text); } catch { throw new HttpError(400, "Invalid JSON.", "bad_json"); }
}

export function parseCookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  const raw = req.headers.get("cookie");
  if (!raw) return out;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) { try { out[k] = decodeURIComponent(v); } catch { out[k] = v; } }
  }
  return out;
}

/** IP given by the hosting platform itself (Netlify's context.ip). Set once per request by the entry point. */
const trustedIp = new WeakMap<Request, string>();
export function setClientIp(req: Request, ip: string | undefined): void {
  if (ip) trustedIp.set(req, String(ip).slice(0, 64));
}

export function clientIp(req: Request): string {
  const t = trustedIp.get(req);
  if (t) return t;
  // Netlify sets x-nf-client-connection-ip itself. In x-forwarded-for only the right-most entry
  // is added by the last proxy; earlier ones are client-supplied.
  const v = req.headers.get("x-nf-client-connection-ip");
  if (v) return v.split(",")[0].trim().slice(0, 64) || "unknown";
  const parts = (req.headers.get("x-forwarded-for") || "").split(",").map((s) => s.trim()).filter(Boolean);
  return (parts[parts.length - 1] || "unknown").slice(0, 64);
}

export const sha256 = (s: string | Buffer) => crypto.createHash("sha256").update(s).digest("hex");
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");
export const randomId = (prefix = "", bytes = 9) => prefix + crypto.randomBytes(bytes).toString("base64url").replace(/[-_]/g, "x");

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  if (ab.length !== bb.length) { crypto.timingSafeEqual(ab, ab); return false; }
  return crypto.timingSafeEqual(ab, bb);
}

// ---- secrets at rest: AES-256-GCM with a key derived from APP_SECRET ----
function secretKey(): Buffer {
  const s = requireEnv("APP_SECRET");
  if (s.length < 32) throw new HttpError(500, "APP_SECRET must be at least 32 characters long.", "config");
  return crypto.createHash("sha256").update("sitraya-secrets:" + s).digest();
}
export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return "v1." + Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64url");
}
export function decrypt(blob: string): string {
  if (!blob.startsWith("v1.")) throw new Error("bad secret format");
  const raw = Buffer.from(blob.slice(3), "base64url");
  const d = crypto.createDecipheriv("aes-256-gcm", secretKey(), raw.subarray(0, 12));
  d.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString("utf8");
}

export const escHtml = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export function enDigits(v: string): string { return v.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))); }

/** Bangladeshi mobile number → 01XXXXXXXXX, or "" when invalid. */
export function normPhone(v: unknown): string {
  let s = enDigits(String(v ?? "")).replace(/[\s\-().]/g, "");
  if (s.startsWith("+88")) s = s.slice(3);
  else if (s.startsWith("88") && s.length === 13) s = s.slice(2);
  return /^01[3-9]\d{8}$/.test(s) ? s : "";
}

export const isDhaka = (d: string) => /^\s*(dhaka|ঢাকা)\s*$/i.test(d || "");

export function siteOrigin(req: Request): string {
  const fixed = env("SITE_URL").replace(/\/+$/, "");
  if (fixed) return fixed;
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}
