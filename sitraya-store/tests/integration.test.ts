/**
 * Runs the real server bundle (netlify/functions/sitraya/server.mjs) against a real Postgres database.
 *   TEST_DATABASE_URL=postgres://... npm test
 * The database is wiped first, so never point this at the live shop.
 */
import test, { before } from "node:test";
import assert from "node:assert/strict";
import postgres from "postgres";

const DBURL = process.env.TEST_DATABASE_URL || "";
const skip = !DBURL ? "set TEST_DATABASE_URL to run integration tests" : false;
const BASE = "http://test.local";
let api: { fetch: (r: Request) => Promise<Response> };

async function call(method: string, path: string, body?: unknown, opts: { cookie?: string; csrf?: boolean; ip?: string; origin?: string; ua?: string } = {}) {
  // A client-supplied header that must be ignored: the platform IP (Netlify context.ip) is passed separately.
  const headers: Record<string, string> = { "x-forwarded-for": "6.6.6.6", "x-nf-client-connection-ip": "6.6.6.6" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (opts.csrf !== false) headers["x-sitraya"] = "1";
  if (opts.origin) headers.origin = opts.origin;
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.ua) headers["user-agent"] = opts.ua;
  const res = await api.fetch(new Request(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined }), opts.ip || "10.0.0.1");
  const setCookie = res.headers.get("set-cookie") || "";
  const text = await res.text();
  let json: any = null; try { json = JSON.parse(text); } catch { /* html */ }
  return { status: res.status, json, text, cookie: setCookie.split(";")[0], headers: res.headers };
}

const OWNER = { email: "owner@test.local", password: "Owner-Password-123" };
let ownerCookie = "";

before(async () => {
  if (skip) return;
  const sql = postgres(DBURL, { onnotice: () => {} });
  await sql.unsafe("drop schema public cascade; create schema public;");
  await sql.end();
  Object.assign(process.env, { DATABASE_URL: DBURL, APP_SECRET: "integration-secret-0123456789abcdefgh", ADMIN_EMAIL: OWNER.email, ADMIN_PASSWORD: OWNER.password });
  api = (await import("../netlify/functions/sitraya/server.mjs" as string)).default;
  const r = await call("POST", "/api/admin/login", OWNER);
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.me.mustChange, true);
  // nothing can be changed until the owner picks a new password
  const blocked = await call("PUT", "/api/admin/cfg", { cfg: {} }, { cookie: r.cookie });
  assert.equal(blocked.status, 403); assert.equal(blocked.json.code, "must_change");
  const pw = await call("POST", "/api/admin/password", { current: OWNER.password, next: OWNER.password + "-new" }, { cookie: r.cookie });
  assert.equal(pw.status, 200, JSON.stringify(pw.json));
  ownerCookie = pw.cookie;
  OWNER.password += "-new";
});

test("pages render with security headers and share tags", { skip }, async () => {
  const home = await call("GET", "/");
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-security-policy") || "", /frame-ancestors 'none'/);
  assert.equal(home.headers.get("x-content-type-options"), "nosniff");
  const p = await call("GET", "/p/n1");
  assert.match(p.text, /<meta property="og:title" content="Noor Embroidered Three Piece/);
  assert.equal((await call("GET", "/p/doesnotexist")).status, 404);
  const feed = await call("GET", "/feeds/meta-catalog.xml");
  assert.match(feed.text, /<g:id>n1<\/g:id>/);
  assert.match(feed.text, /<g:price>3450\.00 BDT<\/g:price>/);
});

test("public data never contains cost prices or secrets", { skip }, async () => {
  const b = await call("GET", "/api/boot");
  assert.equal(b.status, 200);
  assert.ok(b.json.products.length > 0);
  assert.ok(b.json.products.every((p: any) => p.cost === undefined));
  assert.equal(JSON.stringify(b.json).includes("token"), false);
});

async function stockOf(pid: string, size: string, color: string) {
  const b = await call("GET", "/api/boot");
  return b.json.products.find((p: any) => p.id === pid).variants.find((v: any) => v.size === size && v.color === color).stock;
}
const customer = { name: "Test Buyer", phone: "01711000001", district: "Dhaka", area: "Mirpur", addr: "House 1, Road 1" };

test("orders: server prices, delivery, stock and coupons", { skip }, async () => {
  const b = await call("GET", "/api/boot");
  const p = b.json.products.find((x: any) => x.id === "n1");
  const v = p.variants.find((x: any) => x.stock >= 2);
  const before = v.stock;
  const r = await call("POST", "/api/orders", { items: [{ pid: "n1", size: v.size, color: v.color, qty: 1 }], customer, pay: "cod", unit: 1, total: 1 }, { ip: "10.1.0.1" });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  assert.equal(r.json.order.sub, 2950); // sale price from the server, not from the browser
  assert.equal(r.json.order.del, 0);    // inside Dhaka, above ৳2,000
  assert.equal(await stockOf("n1", v.size, v.color), before - 1);

  const c = await call("PUT", "/api/admin/coupons/SAVE300", { coupon: { code: "SAVE300", type: "fixed", value: 300, min: 1000, maxUses: 1, active: true } }, { cookie: ownerCookie });
  assert.equal(c.status, 200, JSON.stringify(c.json));
  const o2 = await call("POST", "/api/orders", { items: [{ pid: "n1", size: v.size, color: v.color, qty: 1 }], customer: { ...customer, district: "Gazipur", phone: "01711000002" }, pay: "cod", coupon: "save300" }, { ip: "10.1.0.2" });
  assert.equal(o2.status, 201, JSON.stringify(o2.json));
  assert.equal(o2.json.order.disc, 300);
  assert.equal(o2.json.order.del, 150);
  assert.equal(o2.json.order.total, 2950 - 300 + 150);
  const o3 = await call("POST", "/api/orders", { items: [{ pid: "n1", size: v.size, color: v.color, qty: 1 }], customer: { ...customer, phone: "01711000003" }, pay: "cod", coupon: "SAVE300" }, { ip: "10.1.0.3" });
  assert.equal(o3.status, 400); assert.equal(o3.json.code, "cp_used");
});

test("orders: two buyers cannot both get the last piece", { skip }, async () => {
  const b = await call("GET", "/api/boot");
  let target: any = null;
  for (const p of b.json.products) for (const v of p.variants) if (!target && v.stock > 0) target = { p, v };
  const r = await call("POST", "/api/admin/stock", { sku: target.v.sku, set: 1 }, { cookie: ownerCookie });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  const mk = (i: number) => call("POST", "/api/orders", { items: [{ pid: target.p.id, size: target.v.size, color: target.v.color, qty: 1 }], customer: { ...customer, phone: "0171100010" + i }, pay: "cod" }, { ip: "10.2.0." + i });
  const results = await Promise.all([mk(1), mk(2), mk(3)]);
  assert.equal(results.filter((x) => x.status === 201).length, 1);
  assert.ok(results.filter((x) => x.status === 409).every((x) => x.json.code === "stock_changed"));
  assert.equal(await stockOf(target.p.id, target.v.size, target.v.color), 0);
});

test("orders: bad input is refused", { skip }, async () => {
  const b = await call("GET", "/api/boot");
  const p = b.json.products[0], v = p.variants[0];
  const bad = await call("POST", "/api/orders", { items: [{ pid: p.id, size: v.size, color: v.color, qty: 1 }], customer: { ...customer, phone: "12345" }, pay: "cod" }, { ip: "10.3.0.1" });
  assert.equal(bad.json.code, "e_phone");
  const off = await call("POST", "/api/orders", { items: [{ pid: p.id, size: v.size, color: v.color, qty: 1 }], customer, pay: "bkash", trx: "X1" }, { ip: "10.3.0.2" });
  assert.equal(off.json.code, "pay_off");
  const many = await call("POST", "/api/orders", { items: [{ pid: p.id, size: v.size, color: v.color, qty: 99 }], customer, pay: "cod" }, { ip: "10.3.0.3" });
  assert.equal(many.status, 400);
});

test("cancelling puts stock back; status rules are enforced", { skip }, async () => {
  const b = await call("GET", "/api/boot");
  const p = b.json.products.find((x: any) => x.variants.some((v: any) => v.stock >= 3));
  const v = p.variants.find((x: any) => x.stock >= 3);
  const o = await call("POST", "/api/orders", { items: [{ pid: p.id, size: v.size, color: v.color, qty: 2 }], customer: { ...customer, phone: "01711000201" }, pay: "cod" }, { ip: "10.4.0.1" });
  assert.equal(o.status, 201);
  const ref = o.json.order.ref;
  assert.equal(await stockOf(p.id, v.size, v.color), v.stock - 2);
  const bad = await call("POST", `/api/admin/orders/${ref}/status`, { status: "returned" }, { cookie: ownerCookie });
  assert.equal(bad.status, 409);
  const c = await call("POST", `/api/admin/orders/${ref}/status`, { status: "cancelled", note: "test" }, { cookie: ownerCookie });
  assert.equal(c.status, 200, JSON.stringify(c.json));
  assert.equal(await stockOf(p.id, v.size, v.color), v.stock);
  const again = await call("POST", `/api/admin/orders/${ref}/status`, { status: "confirmed" }, { cookie: ownerCookie });
  assert.equal(again.status, 409);
  const t = await call("POST", "/api/track", { ref, phone: "০১৭১১০০০২০১" });
  assert.equal(t.status, 200); assert.equal(t.json.order.status, "cancelled");
  assert.equal(t.json.order.customer, undefined); // tracking never shows the address
  const wrong = await call("POST", "/api/track", { ref, phone: "01711999999" });
  assert.equal(wrong.status, 404);
});

test("admin API is protected: sign-in, CSRF, roles", { skip }, async () => {
  assert.equal((await call("GET", "/api/admin/data")).status, 401);
  assert.equal((await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie, csrf: false })).status, 200); // GET is safe
  assert.equal((await call("PUT", "/api/admin/cfg", { cfg: {} }, { cookie: ownerCookie, csrf: false })).status, 403);
  assert.equal((await call("PUT", "/api/admin/cfg", { cfg: {} }, { cookie: ownerCookie, origin: "https://evil.example" })).status, 403);
  const add = await call("POST", "/api/admin/users", { name: "Desk", email: "desk@test.local", role: "Order Manager" }, { cookie: ownerCookie });
  assert.equal(add.status, 201, JSON.stringify(add.json));
  const login = await call("POST", "/api/admin/login", { email: "desk@test.local", password: add.json.tempPassword }, { ip: "10.5.0.1" });
  assert.equal(login.status, 200);
  assert.equal(login.json.me.mustChange, true);
  const pw = await call("POST", "/api/admin/password", { current: add.json.tempPassword, next: "Desk-Password-2026" }, { cookie: login.cookie });
  assert.equal(pw.status, 200);
  const desk = pw.cookie;
  assert.equal((await call("PUT", "/api/admin/settings", { settings: {} }, { cookie: desk })).status, 403);
  assert.equal((await call("POST", "/api/admin/users", { name: "X", email: "x@test.local", role: "Administrator" }, { cookie: desk })).status, 403);
  const data = await call("GET", "/api/admin/data", undefined, { cookie: desk });
  assert.ok(data.json.orders.length > 0);
  assert.ok(data.json.products.length > 0 && data.json.products.every((p: any) => p.cost === undefined)); // order desk sees stock, not cost prices
  const make = await call("POST", "/api/admin/users", { name: "Boss", email: "boss@test.local", role: "Super Admin" }, { cookie: ownerCookie });
  assert.equal(make.status, 400);
  // disabling signs them out immediately
  await call("PATCH", `/api/admin/users/${add.json.user.id}`, { active: false }, { cookie: ownerCookie });
  assert.equal((await call("GET", "/api/admin/data", undefined, { cookie: desk })).status, 401);
});

test("login is rate limited and gives the same answer for unknown emails", { skip }, async () => {
  const a = await call("POST", "/api/admin/login", { email: "nobody@test.local", password: "whatever-123" }, { ip: "10.6.0.1" });
  const b = await call("POST", "/api/admin/login", { email: OWNER.email, password: "wrong-password-1" }, { ip: "10.6.0.1" });
  assert.equal(a.status, 401); assert.equal(b.status, 401); assert.equal(a.json.error, b.json.error);
  let last = 0;
  for (let i = 0; i < 10; i++) last = (await call("POST", "/api/admin/login", { email: "spray@test.local", password: "x-" + i }, { ip: "10.6.0.2" })).status;
  assert.equal(last, 429);
});

test("settings keep secret keys encrypted and hidden", { skip }, async () => {
  const d = await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie });
  const s = d.json.settings;
  const r = await call("PUT", "/api/admin/settings", { settings: { ...s, meta: { ...s.meta, pixel: "123456789012345" } }, secrets: { metaToken: "EAAB" + "z".repeat(40) } }, { cookie: ownerCookie });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.settings.hasMetaToken, true);
  const again = await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie });
  assert.equal(again.text.includes("zzzzzzzz"), false);
  const sql = postgres(DBURL, { onnotice: () => {} });
  const [row] = await sql`select value from kv where key = 'secrets'`;
  await sql.end();
  assert.equal(JSON.stringify(row.value).includes("zzzzzzzz"), false);
});

test("uploads accept real images only", { skip }, async () => {
  const png = "data:image/png;base64," + Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4c40000000049454e44ae426082", "hex").toString("base64");
  const ok = await call("POST", "/api/admin/media", { data: png }, { cookie: ownerCookie });
  assert.equal(ok.status, 201, JSON.stringify(ok.json));
  const img = await call("GET", ok.json.url);
  assert.equal(img.status, 200); assert.equal(img.headers.get("content-type"), "image/png");
  const svg = "data:image/png;base64," + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>').toString("base64");
  assert.equal((await call("POST", "/api/admin/media", { data: svg }, { cookie: ownerCookie })).status, 400);
});

test("product edits keep orders placed meanwhile", { skip }, async () => {
  const d = await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie });
  const p = d.json.products.find((x: any) => x.variants.some((v: any) => v.stock >= 4));
  const v = p.variants.find((x: any) => x.stock >= 4);
  const baseline = Object.fromEntries(p.variants.map((x: any) => [x.sku, x.stock]));
  // a customer buys one while the admin has the form open
  const o = await call("POST", "/api/orders", { items: [{ pid: p.id, size: v.size, color: v.color, qty: 1 }], customer: { ...customer, phone: "01711000301" }, pay: "cod" }, { ip: "10.7.0.1" });
  assert.equal(o.status, 201);
  // the admin adds 2 pieces in the form, based on the old number
  const edited = { ...p, variants: p.variants.map((x: any) => x.sku === v.sku ? { ...x, stock: x.stock + 2 } : x) };
  const put = await call("PUT", `/api/admin/products/${p.id}`, { product: edited, baseline }, { cookie: ownerCookie });
  assert.equal(put.status, 200, JSON.stringify(put.json));
  assert.equal(put.json.product.variants.find((x: any) => x.sku === v.sku).stock, v.stock - 1 + 2);
});

test("security fixes from review", { skip }, async () => {
  // homepage content cannot carry HTML in style/link/number fields
  const bad = await call("PUT", "/api/admin/cfg", { cfg: { interval: '6"><input data-urole="1">', brand: { name: "Sitraya", logo: "" } } }, { cookie: ownerCookie });
  assert.equal(bad.status, 400); // HTML in a number field is refused
  const num = await call("PUT", "/api/admin/cfg", { cfg: { interval: "7", brand: { name: "Sitraya", logo: "" } } }, { cookie: ownerCookie });
  assert.equal(num.status, 200); assert.equal(num.json.cfg.interval, 7);
  const bad2 = await call("PUT", "/api/admin/cfg", { cfg: { skin: 'x" onmouseover="1', brand: { name: "S", logo: "" } } }, { cookie: ownerCookie });
  assert.equal(bad2.status, 400);
  // faked IP headers (sent on every call by call()) do not get around rate limits: the platform IP counts
  let last = 0;
  for (let i = 0; i < 45; i++) last = (await call("GET", "/api/coupons/ZZZZ" + i, undefined, { ip: "9.9.9.9" })).status;
  assert.equal(last, 429);
  // paused coupons are invisible to the public
  await call("PUT", "/api/admin/coupons/STAFF90", { coupon: { code: "STAFF90", type: "percent", value: 90, min: 0, maxUses: 0, active: false } }, { cookie: ownerCookie });
  assert.equal((await call("GET", "/api/coupons/STAFF90", undefined, { ip: "10.9.0.1" })).status, 404);
  // inventory staff see stock but never cost prices
  const add = await call("POST", "/api/admin/users", { name: "Stock", email: "stock@test.local", role: "Inventory Manager" }, { cookie: ownerCookie });
  const li = await call("POST", "/api/admin/login", { email: "stock@test.local", password: add.json.tempPassword }, { ip: "10.9.0.2" });
  const d = await call("GET", "/api/admin/data", undefined, { cookie: li.cookie });
  assert.ok(d.json.products.length > 0 && d.json.products.every((p: any) => p.cost === undefined));
  // two admins: the second save based on an old version is refused
  const v0 = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json.versions.cfg;
  const s1 = await call("PUT", "/api/admin/cfg", { cfg: { brand: { name: "A", logo: "" } }, version: v0 }, { cookie: ownerCookie });
  assert.equal(s1.status, 200);
  const s2 = await call("PUT", "/api/admin/cfg", { cfg: { brand: { name: "B", logo: "" } }, version: v0 }, { cookie: ownerCookie });
  assert.equal(s2.status, 409); assert.equal(s2.json.code, "conflict");
});

test("a changed APP_SECRET never overwrites saved keys", { skip }, async () => {
  const good = process.env.APP_SECRET;
  process.env.APP_SECRET = "a-completely-different-secret-0123456789xyz";
  const d = await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie });
  assert.equal(d.status, 500); assert.equal(d.json.code, "config"); assert.match(d.json.error, /APP_SECRET was changed/);
  process.env.APP_SECRET = good;
  const back = await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie });
  assert.equal(back.json.settings.hasMetaToken, true); // the token saved earlier is still there
});

// ---------------------------------------------------------------- website upgrade (views, carts, brand, sharing)
const PHONE_UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36";

test("website settings are saved, checked and sent to the shop", { skip }, async () => {
  const d = await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie });
  const s = d.json.settings;
  assert.equal(s.site.img.ratio, "auto"); assert.equal(s.site.sections.top.d, 2); // defaults for an existing shop
  s.site.brand.appShort = "Noor"; s.site.views.show = true; s.site.views.min = 0; s.site.ui.m = 110;
  delete s.hasMetaToken; delete s.hasTelegramToken;
  const ok = await call("PUT", "/api/admin/settings", { settings: s, version: d.json.versions.settings }, { cookie: ownerCookie });
  assert.equal(ok.status, 200, JSON.stringify(ok.json));
  const bad = JSON.parse(JSON.stringify(s)); bad.site.ui.m = 300;
  assert.equal((await call("PUT", "/api/admin/settings", { settings: bad }, { cookie: ownerCookie })).status, 400);
  const bad2 = JSON.parse(JSON.stringify(s)); bad2.site.brand.favicon = "javascript:alert(1)";
  assert.equal((await call("PUT", "/api/admin/settings", { settings: bad2 }, { cookie: ownerCookie })).status, 400);
  const boot = await call("GET", "/api/boot");
  assert.equal(boot.json.settings.site.ui.m, 110); assert.equal(boot.json.settings.site.cart.tpl.bn, ""); // templates stay in the admin
});

test("homepage: phone banner, crop mode and focus are checked", { skip }, async () => {
  const cur = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json;
  const cfg = JSON.parse(JSON.stringify(cur.cfg)); if (!Array.isArray(cfg.slides) || !cfg.slides.length) cfg.slides = [{ on: true, img: "cover", bg: "noir" }]; cfg.slides[0].imgM = "/m/AbCdEfGh12"; cfg.slides[0].fit = "fill"; cfg.slides[0].pos = "top";
  const ok = await call("PUT", "/api/admin/cfg", { cfg, version: cur.versions.cfg }, { cookie: ownerCookie });
  assert.equal(ok.status, 200, JSON.stringify(ok.json));
  const bad = JSON.parse(JSON.stringify(cfg)); bad.slides[0].imgM = "data:text/html,<script>"; 
  assert.equal((await call("PUT", "/api/admin/cfg", { cfg: bad }, { cookie: ownerCookie })).status, 400);
  const bad2 = JSON.parse(JSON.stringify(cfg)); bad2.slides[0].pos = '50%"><img src=x onerror=alert(1)>';
  assert.equal((await call("PUT", "/api/admin/cfg", { cfg: bad2 }, { cookie: ownerCookie })).status, 400);
});

test("product photo settings and share picture are stored and used for Facebook", { skip }, async () => {
  const d = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json;
  const p = d.products.find((x: any) => x.status === "active");
  const put = await call("PUT", "/api/admin/products/" + p.id, { product: { ...p, fpos: "50% 20%", fit: "cover", views: "show", shareImg: "/m/ShareImage123", _shareFrom: p.img }, version: p._v }, { cookie: ownerCookie });
  assert.equal(put.status, 200, JSON.stringify(put.json));
  assert.equal(put.json.product.fpos, "50% 20%"); assert.equal(put.json.product.shareImg, "/m/ShareImage123");
  const bad = await call("PUT", "/api/admin/products/" + p.id, { product: { ...p, fpos: "50%;background:url(x)" } }, { cookie: ownerCookie });
  assert.equal(bad.status, 400);
  const page = await call("GET", "/p/" + p.id);
  assert.match(page.text, /og:image" content="http:\/\/[^"]*\/m\/ShareImage123"/);
  assert.match(page.text, /og:image:width" content="1200"/);
  assert.match(page.text, /"@type":"Product"/);
  assert.match(page.text, /name="google" content="notranslate"/);
});

test("views: one count per person per 30 minutes, bots ignored, totals in boot and admin", { skip }, async () => {
  const pid = (await call("GET", "/api/boot")).json.products[0].id;
  for (let i = 0; i < 3; i++) assert.equal((await call("POST", "/api/view", { pid, vid: "visitorone12345" }, { ip: "10.7.0.1", ua: PHONE_UA })).status, 204);
  await call("POST", "/api/view", { pid, vid: "visitortwo12345" }, { ip: "10.7.0.2", ua: PHONE_UA });
  await call("POST", "/api/view", { pid, vid: "botvisitor12345" }, { ip: "10.7.0.3", ua: "facebookexternalhit/1.1" });
  const boot = await call("GET", "/api/boot");
  assert.deepEqual(boot.json.views[pid], { t: 2, u: 0 }); // shop sees only the count, visitor numbers stay in the admin
  const adm = await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie });
  assert.deepEqual(adm.json.views[pid], { t: 2, u: 2 });
  // one visitor cannot pump the number: a new visitor id or browser from the same address still counts once
  for (let i = 0; i < 5; i++) await call("POST", "/api/view", { pid, vid: "fakevisitor" + i + "abcd" }, { ip: "10.7.0.1", ua: PHONE_UA + i });
  assert.equal((await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json.views[pid].t, 2);
  // a product set to "never show" sends no count to the shop at all
  const p = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json.products.find((x: any) => x.id === pid);
  await call("PUT", "/api/admin/products/" + pid, { product: { ...p, views: "hide" }, version: p._v }, { cookie: ownerCookie });
  assert.equal((await call("GET", "/api/boot")).json.views[pid], undefined);
  const p2 = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json.products.find((x: any) => x.id === pid);
  await call("PUT", "/api/admin/products/" + pid, { product: { ...p2, views: p.views || "" }, version: p2._v }, { cookie: ownerCookie });
});

test("cart recovery: saved with a phone, one cart per customer, converted by the order, reminders limited", { skip }, async () => {
  const boot = (await call("GET", "/api/boot")).json;
  const p = boot.products.find((x: any) => x.variants.some((v: any) => v.stock > 2)); const v = p.variants.find((x: any) => x.stock > 2);
  const item = { pid: p.id, size: v.size, color: v.color, qty: 1 };
  const sid = "devicesid1234567";
  const a1 = await call("POST", "/api/cart", { sid, items: [item] }, { ip: "10.8.0.1" });   // no phone yet: anonymous
  assert.equal(a1.status, 200, JSON.stringify(a1.json));
  const a2 = await call("POST", "/api/cart", { sid, items: [item, { ...item, qty: 2 }], phone: "01811222333", name: "Nusrat" }, { ip: "10.8.0.1" });
  const a3 = await call("POST", "/api/cart", { sid, items: [{ ...item, qty: 2 }], phone: "01811222333" }, { ip: "10.8.0.1" });
  assert.equal(a2.json.id, a3.json.id); // same customer, same cart
  let list = (await call("GET", "/api/admin/carts", undefined, { cookie: ownerCookie })).json;
  const c = list.carts.find((x: any) => x.phone === "01811222333");
  assert.ok(c); assert.equal(c.name, "Nusrat"); assert.equal(c.items.length, 1); assert.equal(c.value, (p.sale && p.sale < p.price ? p.sale : p.price) * 2);
  assert.equal(list.anon.n, 0); // the anonymous copy was merged into the customer's cart
  const pub = await call("GET", "/api/cart/" + c.id);
  assert.deepEqual(Object.keys(pub.json), ["items"]); assert.equal(pub.json.items[0].qty, 2); // only items, never personal details
  const r1 = await call("POST", `/api/admin/carts/${c.id}/reminded`, {}, { cookie: ownerCookie });
  assert.equal(r1.status, 200, JSON.stringify(r1.json)); assert.equal(r1.json.cart.status, "reminded");
  assert.equal((await call("POST", `/api/admin/carts/${c.id}/reminded`, {}, { cookie: ownerCookie })).status, 400); // waiting time
  assert.equal((await call("PATCH", `/api/admin/carts/${c.id}`, { optout: true }, { cookie: ownerCookie })).json.cart.optout, true);
  const o = await call("POST", "/api/orders", { items: [{ ...item, qty: 2 }], customer: { name: "Nusrat", phone: "01811222333", district: "Dhaka", area: "Uttara", po: "Uttara-1230", addr: "House 9, Road 3" }, pay: "cod", sid }, { ip: "10.8.0.2" });
  assert.equal(o.status, 201, JSON.stringify(o.json));
  list = (await call("GET", "/api/admin/carts", undefined, { cookie: ownerCookie })).json;
  const c2 = list.carts.find((x: any) => x.id === c.id);
  assert.equal(c2.status, "converted"); assert.equal(c2.order, o.json.order.ref);
  const od = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json.orders.find((x: any) => x.ref === o.json.order.ref);
  assert.equal(od.customer.po, "Uttara-1230");
  assert.equal((await call("GET", "/api/cart/" + c.id)).status, 404); // a finished cart cannot be reopened
  // someone else typing the same phone number on another device cannot take over the customer's cart
  const victim = await call("POST", "/api/cart", { sid: "victimdevice1234", items: [item], phone: "01822333444", name: "Real", wa: "01822333444" }, { ip: "10.8.1.1" });
  const thief = await call("POST", "/api/cart", { sid: "thiefdevice12345", items: [item], phone: "01822333444", name: "Fake", wa: "01999999999" }, { ip: "10.8.1.2" });
  assert.notEqual(victim.json.id, thief.json.id);
  list = (await call("GET", "/api/admin/carts", undefined, { cookie: ownerCookie })).json;
  const real = list.carts.find((x: any) => x.id === victim.json.id);
  assert.equal(real.name, "Real"); assert.equal(real.wa, "01822333444");
  // emptying the bag removes the waiting cart
  await call("POST", "/api/cart", { sid: "victimdevice1234", items: [], phone: "01822333444" }, { ip: "10.8.1.1" });
  list = (await call("GET", "/api/admin/carts", undefined, { cookie: ownerCookie })).json;
  assert.equal(list.carts.find((x: any) => x.id === victim.json.id), undefined);
  const roleLess = await call("GET", "/api/admin/carts");
  assert.equal(roleLess.status, 401);
});

test("installable admin app and icons follow the brand", { skip }, async () => {
  let man = await call("GET", "/admin.webmanifest");
  assert.equal(man.status, 200); assert.equal(man.json.short_name, "Noor"); // set in Website Settings earlier
  const cur = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json;
  const cfg = JSON.parse(JSON.stringify(cur.cfg)); cfg.brand.name = "Noor Lane";
  assert.equal((await call("PUT", "/api/admin/cfg", { cfg, version: cur.versions.cfg }, { cookie: ownerCookie })).status, 200);
  man = await call("GET", "/admin.webmanifest");
  assert.match(man.json.name, /Noor Lane/); assert.equal(man.json.icons[0].src, "/brand/icon.svg");
  const icon = await call("GET", "/brand/icon.svg"); assert.equal(icon.status, 200); assert.match(icon.text, /<svg/);
  const home = await call("GET", "/");
  assert.doesNotMatch(home.text.split('<script id="boot"')[0], /Sitraya|cover\.jpg/); // no old name or cover photo in the page head
  cfg.brand.name = "Sitraya";
  const back = (await call("GET", "/api/admin/data", undefined, { cookie: ownerCookie })).json;
  assert.equal((await call("PUT", "/api/admin/cfg", { cfg, version: back.versions.cfg }, { cookie: ownerCookie })).status, 200);
});
