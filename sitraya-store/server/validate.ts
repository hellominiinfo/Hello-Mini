import { z } from "zod";
import { HttpError } from "./util";

// ---------- shared pieces ----------
export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a colour like #1B1A18");
const SAFE_URL = /^https:\/\/[^\s"'()<>\\`]{4,400}$/;
/** An image is a built-in picture name, an uploaded file (/m/…) or an https link. */
export function isImgRef(v: string): boolean {
  return v === "" || /^[a-z0-9-]{1,40}$/.test(v) || /^\/m\/[A-Za-z0-9]{8,40}$/.test(v) || SAFE_URL.test(v);
}
export function isVideoRef(v: string): boolean {
  return v === "" || SAFE_URL.test(v);
}
export const imgRef = z.string().max(420).refine(isImgRef, "must be an uploaded image or an https link");
export const videoRef = z.string().max(420).refine(isVideoRef, "must be an https link (YouTube, Facebook or .mp4)");
const flag = z.union([z.boolean(), z.number()]).transform((v) => (v ? 1 : 0));
const bi = (n: number) => z.object({ bn: z.string().max(n).default(""), en: z.string().max(n).default("") });
const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

// ---------- products ----------
export const variantSchema = z.object({
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,40}$/, "variant SKU: 3–40 letters, numbers or dashes"),
  size: z.string().trim().min(1).max(20),
  color: hexColor,
  stock: int(0, 1_000_000),
});
export const productSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/).optional(),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,30}$/, "SKU must be 3–30 letters, numbers or dashes"),
  cat: z.string().regex(/^[a-z0-9-]{1,30}$/),
  en: z.string().trim().min(1, "English name is required").max(140),
  bn: z.string().trim().min(1, "বাংলা নাম দিন").max(140),
  den: z.string().max(4000).default(""),
  dbn: z.string().max(4000).default(""),
  price: int(1, 10_000_000),
  sale: int(0, 10_000_000).optional().default(0),
  cost: int(0, 10_000_000).optional().default(0),
  status: z.enum(["active", "draft", "archived"]),
  isNew: flag.default(0),
  top: flag.default(0),
  tint: hexColor.default("#EFE6D6"),
  img: imgRef.default(""),
  gallery: z.array(imgRef).max(6).default([]),
  video: videoRef.default(""),
  sizes: z.array(z.string().trim().min(1).max(20)).min(1).max(20),
  colors: z.array(hexColor).min(1).max(12),
  variants: z.array(variantSchema).min(1).max(240),
  // how the photo sits in cards: focus point "x% y%", whole photo or fill, and the view-count override
  fpos: z.string().regex(/^(\d{1,3}% \d{1,3}%)?$/, "focus point must look like 50% 30%").default(""),
  fit: z.enum(["", "contain", "cover"]).default(""),
  views: z.enum(["", "show", "hide"]).default(""),
  // 1200 × 630 picture made in the browser for Facebook/WhatsApp previews, and which photo it was made from
  shareImg: imgRef.default(""),
  _shareFrom: imgRef.default(""),
}).superRefine((p, ctx) => {
  if (p.sale && p.sale >= p.price) ctx.addIssue({ code: "custom", path: ["sale"], message: "Sale price must be lower than the regular price" });
  const seen = new Set<string>();
  for (const v of p.variants) {
    if (seen.has(v.sku)) ctx.addIssue({ code: "custom", path: ["variants"], message: `Variant SKU ${v.sku} is used twice` });
    seen.add(v.sku);
    if (!p.sizes.includes(v.size) || !p.colors.map((c) => c.toLowerCase()).includes(v.color.toLowerCase()))
      ctx.addIssue({ code: "custom", path: ["variants"], message: `Variant ${v.sku} uses a size or colour that is not in the product` });
  }
});
export type ProductDoc = z.infer<typeof productSchema>;

// ---------- categories ----------
export const categoriesSchema = z.array(z.object({
  id: z.string().regex(/^[a-z0-9-]{1,30}$/),
  bn: z.string().trim().min(1).max(60),
  en: z.string().trim().min(1).max(60),
  img: imgRef.default(""),
  tint: hexColor.default("#EFE6D6"),
}).passthrough()).min(1).max(40);

// ---------- coupons ----------
export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,16}$/, "Code must be 4–16 letters or numbers"),
  type: z.enum(["percent", "fixed"]),
  value: int(1, 1_000_000),
  min: int(0, 10_000_000).default(0),
  maxUses: int(0, 10_000_000).default(0),
  expires: int(0, 32503680000000).default(0),
  active: z.boolean().default(true),
}).superRefine((c, ctx) => {
  if (c.type === "percent" && c.value > 90) ctx.addIssue({ code: "custom", path: ["value"], message: "Percent off can be at most 90%" });
});
export type CouponDoc = z.infer<typeof couponSchema>;

// ---------- website settings (Admin → Website Settings, Cart Recovery) ----------
const sw = (d: boolean) => z.boolean().default(d);
const secS = (d: Record<string, unknown>) => z.object({
  mode: z.enum(["grid", "slider"]).default(d.mode as "grid"),
  auto: sw(d.auto as boolean), sec: int(2, 30).default(d.sec as number),
  d: int(1, 6).default(d.d as number), t: int(1, 4).default(d.t as number), m: int(1, 3).default(d.m as number),
  arrows: sw(d.arrows as boolean), dots: sw(d.dots as boolean), loop: sw(d.loop as boolean),
  dir: z.enum(["ltr", "rtl"]).default(d.dir as "ltr"), speed: int(150, 2000).default(d.speed as number),
}).default({});
const S0 = { mode: "slider", auto: true, sec: 3, arrows: true, dots: false, loop: true, dir: "ltr", speed: 600 };
export const siteSchema = z.object({
  brand: z.object({
    title: bi(70).default({ bn: "", en: "" }), desc: bi(160).default({ bn: "", en: "" }),
    logoLight: imgRef.default(""), favicon: imgRef.default(""), appIcon: imgRef.default(""), shareImg: imgRef.default(""),
    appName: z.string().trim().max(45).default(""), appShort: z.string().trim().max(12).default(""),
    theme: hexColor.default("#0D2B26"), lang: z.enum(["bn", "en"]).default("bn"),
  }).default({}),
  img: z.object({ ratio: z.enum(["auto", "1/1", "4/5", "3/4", "2/3"]).default("auto"), fit: z.enum(["contain", "cover"]).default("contain"), bg: hexColor.default("#F4F1EC"), webp: sw(true) }).default({}),
  views: z.object({ on: sw(true), show: sw(false), min: int(0, 100000).default(10) }).default({}),
  search: z.object({ recent: sw(true), popular: sw(true) }).default({}),
  ui: z.object({ m: int(85, 120).default(100), d: int(85, 120).default(100), user: sw(true) }).default({}),
  hero: z.object({ h: z.enum(["s", "m", "l"]).default("m") }).default({}),
  sections: z.object({
    top: secS({ ...S0, dots: true, d: 2, t: 2, m: 1 }),
    new: secS({ ...S0, mode: "grid", d: 4, t: 3, m: 2 }),
    rowA: secS({ ...S0, d: 5, t: 3, m: 2 }),
    rowB: secS({ ...S0, sec: 4, d: 5, t: 3, m: 2, dir: "rtl" }),
  }).default({}),
  cart: z.object({
    on: sw(true), days: int(1, 60).default(7), cool: int(1, 720).default(24), max: int(1, 5).default(3),
    tpl: z.object({ bn: z.string().max(600).default(""), en: z.string().max(600).default("") }).default({}),
  }).default({}),
});

// ---------- settings (secrets are handled separately and never sent back) ----------
const payM = z.object({ on: z.boolean().default(false), num: z.string().trim().max(20).default("") });
export const settingsSchema = z.object({
  store: z.object({
    phone: z.string().trim().max(30).default(""),
    whatsapp: z.string().trim().max(30).default(""),
    email: z.string().trim().max(120).default(""),
    domain: z.string().trim().max(120).default(""),
    addr: bi(300).default({ bn: "", en: "" }),
    social: z.object({ fb: z.string().trim().max(300).default(""), ig: z.string().trim().max(300).default(""), yt: z.string().trim().max(300).default(""), tt: z.string().trim().max(300).default("") }).default({}),
    about: bi(1000).default({ bn: "", en: "" }),
  }).default({}),
  pay: z.object({ cod: z.object({ on: z.boolean().default(true) }).default({ on: true }), bkash: payM.default({}), nagad: payM.default({}), rocket: payM.default({}) }).default({}),
  lowStock: int(0, 1000).default(3),
  reviewsApprove: z.boolean().default(true),
  notif: z.object({
    order: z.boolean().default(true), stock: z.boolean().default(true), cancel: z.boolean().default(true), review: z.boolean().default(true),
    telegramChat: z.string().trim().max(40).regex(/^-?\d{0,20}$|^@[A-Za-z0-9_]{4,40}$/, "Telegram chat ID is a number").default(""),
  }).default({}),
  meta: z.object({
    pixel: z.string().trim().regex(/^(\d{15,16})?$/, "A Pixel ID is 15 or 16 digits").default(""),
    test: z.string().trim().max(40).default(""),
    pixelOn: z.boolean().default(false),
    capiOn: z.boolean().default(false),
    testMode: z.boolean().default(true),
    events: z.record(z.string().max(40), z.boolean()).default({}),
  }).default({}),
  site: siteSchema.default({}),
});
export type Settings = z.infer<typeof settingsSchema>;

// ---------- homepage content (cfg) ----------
/** cfg is a flexible tree written by the homepage editor. We bound its size, and check every image/video field. */
export function checkCfg(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new HttpError(400, "Homepage content must be an object.", "invalid");
  const size = JSON.stringify(v).length;
  if (size > 400_000) throw new HttpError(413, "Homepage content is too large.", "too_large");
  const walk = (x: unknown, key: string, depth: number) => {
    if (depth > 8) throw new HttpError(400, "Homepage content is nested too deeply.", "invalid");
    if (typeof x === "string") {
      if (x.length > 20000) throw new HttpError(400, `Text in "${key}" is too long.`, "invalid");
      // names of styles, colours and links must be plain words (they end up inside HTML attributes)
      if (/^(skin|btn|bg|link|interval|tickerOn|v|on|fit|pos)$/.test(key) && !/^[a-z0-9-]{0,40}$/i.test(x)) throw new HttpError(400, `"${key}" has an invalid value.`, "invalid");
      if (/^(img|imgM|logo|image|pic|art|light|dark|gold)$/i.test(key) && !isImgRef(x)) throw new HttpError(400, `"${key}" must be an uploaded image or https link.`, "invalid");
      if (/^(vid|video)$/i.test(key) && !isVideoRef(x)) throw new HttpError(400, `"${key}" must be an https video link.`, "invalid");
      return;
    }
    if (Array.isArray(x)) { if (x.length > 200) throw new HttpError(400, "A list in the homepage content is too long.", "invalid"); x.forEach((y) => walk(y, key, depth + 1)); return; }
    if (x && typeof x === "object") { for (const [k, y] of Object.entries(x)) { if (k === "__proto__" || k === "constructor") throw new HttpError(400, "Invalid key.", "invalid"); walk(y, k, depth + 1); } return; }
    if (x === null || typeof x === "number" || typeof x === "boolean") return;
    throw new HttpError(400, "Invalid value in homepage content.", "invalid");
  };
  walk(v, "", 0);
  const o = v as Record<string, any>;
  o.interval = z.coerce.number().min(2).max(60).catch(6.5).parse(o.interval ?? 6.5);
  if (o.tickerOn !== undefined) o.tickerOn = !!o.tickerOn;
  const d = o.delivery || {};
  o.delivery = { inside: int(0, 100000).parse(d.inside ?? 80), outside: int(0, 100000).parse(d.outside ?? 150), free: int(0, 10_000_000).parse(d.free ?? 2000) };
  return o;
}

// ---------- checkout ----------
export const orderInputSchema = z.object({
  items: z.array(z.object({
    pid: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
    size: z.string().max(20),
    color: hexColor,
    qty: int(1, 10),
  })).min(1).max(30),
  customer: z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    phone: z.string().max(30),
    wa: z.string().max(30).optional().default(""),
    district: z.string().trim().min(2).max(60),
    area: z.string().trim().min(1).max(80),
    po: z.string().trim().max(60).optional().default(""),
    addr: z.string().trim().min(3).max(300),
    note: z.string().trim().max(500).optional().default(""),
  }),
  pay: z.enum(["cod", "bkash", "nagad", "rocket"]),
  trx: z.string().trim().max(40).optional().default(""),
  coupon: z.string().trim().toUpperCase().max(16).optional().default(""),
  lang: z.enum(["bn", "en"]).optional().default("bn"),
  fbp: z.string().max(200).optional().default(""),
  fbc: z.string().max(400).optional().default(""),
  sid: z.string().regex(/^[a-z0-9]{0,40}$/).optional().default(""),
});
export type OrderInput = z.infer<typeof orderInputSchema>;

// ---------- abandoned carts (saved only after the customer types a phone number) ----------
export const cartInputSchema = z.object({
  sid: z.string().regex(/^[a-z0-9]{12,40}$/),
  items: z.array(z.object({ pid: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/), size: z.string().max(20), color: hexColor, qty: int(1, 10) })).max(30),
  phone: z.string().max(30).optional().default(""),
  name: z.string().trim().max(60).optional().default(""),
  wa: z.string().max(30).optional().default(""),
  district: z.string().trim().max(40).optional().default(""),
  lang: z.enum(["bn", "en"]).optional().default("bn"),
});

export const STATUSES = ["received", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
export const FLOW = ["received", "confirmed", "processing", "shipped", "delivered"] as const;
export const PAY_STATUSES = ["unpaid", "verify", "paid", "refunded"] as const;

export const orderPatchSchema = z.object({
  payStatus: z.enum(PAY_STATUSES).optional(),
  courier: z.string().trim().max(40).optional(),
  tracking: z.string().trim().max(80).optional(),
  notes: z.string().max(4000).optional(),
});
export const statusChangeSchema = z.object({ status: z.enum(STATUSES), note: z.string().trim().max(300).optional().default("") });

export const ROLES = ["Super Admin", "Administrator", "Order Manager", "Product Manager", "Inventory Manager", "Content Manager", "Read-only Analyst"] as const;
export type Role = (typeof ROLES)[number];
export const passwordSchema = z.string().min(10, "Password must be at least 10 characters").max(200);
