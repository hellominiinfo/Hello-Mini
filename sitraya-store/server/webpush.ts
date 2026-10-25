/**
 * Web Push for admin phones/laptops, using only Node's built-in crypto.
 *  - Message encryption: RFC 8291 (aes128gcm content coding, RFC 8188)
 *  - Server identification: RFC 8292 (VAPID, ES256 JWT)
 */
import crypto from "node:crypto";

const b64u = (b: Buffer | Uint8Array) => Buffer.from(b).toString("base64url");
const unb64u = (s: string) => Buffer.from(s, "base64url");
const hmac = (key: Buffer, data: Buffer) => crypto.createHmac("sha256", key).update(data).digest();

export type VapidKeys = { publicKey: string; privateKey: string };

export function generateVapidKeys(): VapidKeys {
  const { privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = privateKey.export({ format: "jwk" }) as { x?: string; y?: string; d?: string };
  const pub = Buffer.concat([Buffer.from([4]), unb64u(jwk.x!), unb64u(jwk.y!)]);
  return { publicKey: b64u(pub), privateKey: jwk.d! };
}

function privateKeyObject(publicKeyB64u: string, privateKeyB64u: string): crypto.KeyObject {
  const pub = unb64u(publicKeyB64u);
  return crypto.createPrivateKey({ key: { kty: "EC", crv: "P-256", x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)), d: privateKeyB64u }, format: "jwk" });
}

export function vapidAuthHeader(endpoint: string, keys: VapidKeys, subject: string, expSeconds = 12 * 3600): string {
  const aud = new URL(endpoint).origin;
  const header = b64u(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64u(Buffer.from(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + expSeconds, sub: subject })));
  const data = `${header}.${payload}`;
  const sig = crypto.sign("sha256", Buffer.from(data), { key: privateKeyObject(keys.publicKey, keys.privateKey), dsaEncoding: "ieee-p1363" });
  return `vapid t=${data}.${b64u(sig)}, k=${keys.publicKey}`;
}

/**
 * Encrypts one push message for one browser subscription (RFC 8291 §3.4).
 * `asPrivate` and `salt` are only passed in tests; normally they are random.
 */
export function encryptPayload(plaintext: Buffer, uaPublicB64u: string, authSecretB64u: string, opts: { asPrivate?: string; salt?: Buffer } = {}): Buffer {
  const uaPublic = unb64u(uaPublicB64u);
  const authSecret = unb64u(authSecretB64u);
  if (uaPublic.length !== 65 || uaPublic[0] !== 4) throw new Error("bad p256dh key");
  if (authSecret.length < 16) throw new Error("bad auth secret");

  const ecdh = crypto.createECDH("prime256v1");
  if (opts.asPrivate) ecdh.setPrivateKey(unb64u(opts.asPrivate)); else ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const ecdhSecret = ecdh.computeSecret(uaPublic);

  const prkKey = hmac(authSecret, ecdhSecret);
  const keyInfo = Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic]);
  const ikm = hmac(prkKey, Buffer.concat([keyInfo, Buffer.from([1])]));

  const salt = opts.salt ?? crypto.randomBytes(16);
  const prk = hmac(salt, ikm);
  const cek = hmac(prk, Buffer.from("Content-Encoding: aes128gcm\0\x01")).subarray(0, 16);
  const nonce = hmac(prk, Buffer.from("Content-Encoding: nonce\0\x01")).subarray(0, 12);

  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const padded = Buffer.concat([plaintext, Buffer.from([2])]); // single, final record
  const ct = Buffer.concat([cipher.update(padded), cipher.final(), cipher.getAuthTag()]);

  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, ct]);
}

export type PushSub = { endpoint: string; p256dh: string; auth: string };

/** Sends one notification. Returns "gone" when the browser unsubscribed (delete it). */
export async function sendPush(sub: PushSub, payload: object, keys: VapidKeys, subject: string): Promise<"ok" | "gone" | "error"> {
  try {
    const url = new URL(sub.endpoint);
    if (url.protocol !== "https:") return "gone";
    const body = encryptPayload(Buffer.from(JSON.stringify(payload)), sub.p256dh, sub.auth);
    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        TTL: "86400",
        Urgency: "high",
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        Authorization: vapidAuthHeader(sub.endpoint, keys, subject),
      },
      body: new Uint8Array(body),
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 404 || res.status === 410) return "gone";
    if (!res.ok) { console.warn("push failed", res.status, (await res.text()).slice(0, 200)); return "error"; }
    return "ok";
  } catch (e) {
    console.warn("push error", e);
    return "error";
  }
}
