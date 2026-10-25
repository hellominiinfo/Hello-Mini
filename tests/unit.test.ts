import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { encryptPayload, generateVapidKeys, vapidAuthHeader } from "../server/webpush";
import { normPhone, isDhaka, encrypt, decrypt, clientIp, setClientIp } from "../server/util";
import { couponDiscount, deliveryCharge, allowedNext, newRef } from "../server/orders";
import { checkCfg, isImgRef, productSchema } from "../server/validate";

test("web push encryption matches RFC 8291 Appendix A", () => {
  const out = encryptPayload(Buffer.from("V2hlbiBJIGdyb3cgdXAsIEkgd2FudCB0byBiZSBhIHdhdGVybWVsb24", "base64url"),
    "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4", "BTBZMqHH6r4Tts7J_aSIgg",
    { asPrivate: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw", salt: Buffer.from("DGv6ra1nlYgDCS1FRnbzlw", "base64url") });
  assert.equal(out.toString("base64url"), "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN");
});

test("VAPID header is a valid ES256 JWT for the push service origin", () => {
  const k = generateVapidKeys();
  const h = vapidAuthHeader("https://fcm.googleapis.com/fcm/send/abc", k, "https://shop.example");
  const m = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(h);
  assert.ok(m);
  const payload = JSON.parse(Buffer.from(m![2], "base64url").toString());
  assert.equal(payload.aud, "https://fcm.googleapis.com");
  assert.equal(m![4], k.publicKey);
  const pub = Buffer.from(k.publicKey, "base64url");
  const key = crypto.createPublicKey({ key: { kty: "EC", crv: "P-256", x: pub.subarray(1, 33).toString("base64url"), y: pub.subarray(33).toString("base64url") }, format: "jwk" });
  assert.ok(crypto.verify("sha256", Buffer.from(`${m![1]}.${m![2]}`), { key, dsaEncoding: "ieee-p1363" }, Buffer.from(m![3], "base64url")));
});

test("Bangladeshi phone numbers (English and Bangla digits)", () => {
  assert.equal(normPhone("01711-223344"), "01711223344");
  assert.equal(normPhone("+8801711223344"), "01711223344");
  assert.equal(normPhone("8801711223344"), "01711223344");
  assert.equal(normPhone("০১৭১১২২৩৩৪৪"), "01711223344");
  assert.equal(normPhone("01211223344"), "");
  assert.equal(normPhone("12345"), "");
  assert.ok(isDhaka("Dhaka") && isDhaka(" ঢাকা ") && !isDhaka("Gazipur"));
});

test("coupons and delivery are calculated correctly", () => {
  const c = { code: "EID200", type: "fixed" as const, value: 200, min: 3000, maxUses: 1, expires: 0, active: true };
  assert.deepEqual(couponDiscount(c, 2999), { ok: false, code: "cp_min", min: 3000 });
  assert.deepEqual(couponDiscount(c, 3500), { ok: true, disc: 200 });
  assert.deepEqual(couponDiscount({ ...c, uses: 1 }, 3500), { ok: false, code: "cp_used" });
  assert.deepEqual(couponDiscount({ ...c, active: false }, 3500), { ok: false, code: "cp_off" });
  assert.deepEqual(couponDiscount({ ...c, expires: 1 }, 3500), { ok: false, code: "cp_exp" });
  assert.deepEqual(couponDiscount({ ...c, type: "percent", value: 10, min: 0 }, 2950), { ok: true, disc: 295 });
  const d = { inside: 80, outside: 150, free: 2000 };
  assert.deepEqual(deliveryCharge(d, "in", 1999), { free: false, del: 80 });
  assert.deepEqual(deliveryCharge(d, "in", 2000), { free: true, del: 0 });
  assert.deepEqual(deliveryCharge(d, "out", 9000), { free: false, del: 150 });
});

test("order status rules", () => {
  assert.deepEqual(allowedNext("received"), ["confirmed", "processing", "shipped", "delivered", "cancelled"]);
  assert.deepEqual(allowedNext("delivered"), ["returned"]);
  assert.deepEqual(allowedNext("cancelled"), []);
  assert.match(newRef(), /^ST-[A-HJ-NP-Z2-9]{6}$/);
});

test("secrets round-trip with AES-GCM and detect tampering", () => {
  process.env.APP_SECRET = "unit-test-secret-0123456789abcdefghij";
  const e = encrypt("token-123");
  assert.equal(decrypt(e), "token-123");
  const raw = Buffer.from(e.slice(3), "base64url"); raw[raw.length - 5] ^= 0xff;
  const bad = "v1." + raw.toString("base64url");
  assert.throws(() => decrypt(bad));
});

test("image fields reject scripts and CSS break-outs", () => {
  assert.ok(isImgRef("n1") && isImgRef("/m/AbCdEfGh12") && isImgRef("https://cdn.example.com/a.jpg") && isImgRef(""));
  for (const bad of ["javascript:alert(1)", "data:image/svg+xml;base64,AAA", "https://x.com/a.jpg') ;background:url(x", "http://x.com/a.jpg", "/m/../../etc"]) assert.equal(isImgRef(bad), false, bad);
  assert.throws(() => checkCfg({ slides: [{ img: "x'); background:url(javascript:alert(1)" }] }));
  assert.throws(() => checkCfg({ promos: [{ vid: "javascript:alert(1)" }] }));
  const ok = checkCfg({ brand: { name: "Sitraya", logo: "" }, delivery: { inside: "90", outside: 160, free: 2500 } });
  assert.deepEqual(ok.delivery, { inside: 90, outside: 160, free: 2500 });
});

test("product validation", () => {
  const base = { sku: "ST-AB-101", cat: "abaya", en: "Test", bn: "টেস্ট", price: 1000, status: "active", sizes: ["M"], colors: ["#111111"], variants: [{ sku: "ST-AB-101-M-1", size: "M", color: "#111111", stock: 3 }] };
  assert.ok(productSchema.safeParse(base).success);
  assert.equal(productSchema.safeParse({ ...base, sale: 1000 }).success, false);
  assert.equal(productSchema.safeParse({ ...base, variants: [{ ...base.variants[0], size: "XL" }] }).success, false);
  assert.equal(productSchema.safeParse({ ...base, price: -5 }).success, false);
  assert.equal(productSchema.safeParse({ ...base, img: "javascript:x" }).success, false);
});

test("client IP comes from the platform, not from headers a visitor can send", () => {
  const r = new Request("https://x.test/", { headers: { "x-forwarded-for": "6.6.6.6, 1.2.3.4", "x-nf-client-connection-ip": "9.9.9.9" } });
  assert.equal(clientIp(r), "9.9.9.9");
  setClientIp(r, "203.0.113.7");
  assert.equal(clientIp(r), "203.0.113.7");
  const r2 = new Request("https://x.test/", { headers: { "x-forwarded-for": "6.6.6.6, 1.2.3.4" } });
  assert.equal(clientIp(r2), "1.2.3.4");
});
