/** Meta (Facebook / Instagram): Conversions API purchase events and the product catalogue feed. */
import { getCategories, getCfg, getSecrets, getSettings, loadProducts } from "./store";
import type { OrderDoc } from "./orders";
import { clientIp, escHtml, sha256, siteOrigin } from "./util";

export const GRAPH_VERSION = "v25.0";
const norm = (s: string) => s.trim().toLowerCase();

export async function capiPurchase(req: Request, o: OrderDoc, browser: { fbp?: string; fbc?: string }): Promise<void> {
  const s = await getSettings();
  const m = s.meta;
  if (!m.capiOn || !m.pixel || m.events.Purchase === false) return;
  const token = (await getSecrets()).metaToken;
  if (!token) return;
  const phone = "88" + o.customer.phone; // E.164 without "+"
  const event = {
    event_name: "Purchase",
    event_time: Math.floor(o.at / 1000),
    event_id: o.ref, // the browser Pixel uses the same ID, so Meta counts the purchase once
    action_source: "website",
    event_source_url: siteOrigin(req) + "/",
    user_data: {
      ph: [sha256(phone)],
      external_id: [sha256(phone)],
      fn: [sha256(norm(o.customer.name.split(/\s+/)[0] || ""))],
      ct: [sha256(norm(o.customer.district).replace(/\s+/g, ""))],
      country: [sha256("bd")],
      client_ip_address: clientIp(req),
      client_user_agent: (req.headers.get("user-agent") || "").slice(0, 400),
      ...(browser.fbp ? { fbp: browser.fbp } : {}),
      ...(browser.fbc ? { fbc: browser.fbc } : {}),
    },
    custom_data: {
      currency: "BDT",
      value: o.total,
      content_type: "product",
      content_ids: [...new Set(o.items.map((i) => i.pid))],
      contents: o.items.map((i) => ({ id: i.pid, quantity: i.qty, item_price: i.unit })),
      num_items: o.items.reduce((a, i) => a + i.qty, 0),
      order_id: o.ref,
    },
  };
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${m.pixel}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: [event], access_token: token, ...(m.testMode && m.test ? { test_event_code: m.test } : {}) }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) console.warn("Meta CAPI error", res.status, (await res.text()).slice(0, 300));
  } catch (e) { console.warn("Meta CAPI failed", e); }
}

function absImg(origin: string, ref: string | undefined, fallback: string): string {
  if (!ref) return fallback;
  if (ref.startsWith("https://")) return ref;
  if (ref.startsWith("/m/")) return origin + ref;
  return fallback; // built-in demo pictures are SVG drawings, which Meta does not accept
}

/** RSS 2.0 product feed for Meta Commerce Manager (Catalogue → Data sources → Scheduled feed). */
export async function catalogFeed(req: Request): Promise<string> {
  const origin = siteOrigin(req);
  const [products, cfg, cats] = await Promise.all([loadProducts({ activeOnly: true }), getCfg(), getCategories()]);
  const brand = (cfg.brand && cfg.brand.name) || "Shop";
  // a product without its own photo falls back to the shop's share picture; the original cover photo only while the shop keeps its first name
  const site: any = ((await getSettings()) as any).site || {};
  const shareRef = site.brand && site.brand.shareImg ? absImg(origin, site.brand.shareImg, "") : "";
  const cover = shareRef || (brand === "Sitraya" ? origin + "/assets/brand/cover.jpg" : "");
  const catName = new Map(cats.map((c: any) => [c.id, c.en]));
  const items = products.map((p) => {
    const stock = p.variants.reduce((a, v) => a + v.stock, 0);
    const price = p.price, sale = p.sale && p.sale < p.price ? p.sale : 0;
    const extra = (p.gallery || []).map((g) => absImg(origin, g, "")).filter(Boolean).slice(0, 10);
    return `<item>
<g:id>${escHtml(p.id)}</g:id>
<g:title>${escHtml(p.en)}</g:title>
<g:description>${escHtml((p.den || p.en).slice(0, 4900))}</g:description>
<g:link>${escHtml(`${origin}/p/${encodeURIComponent(p.id)}`)}</g:link>
<g:image_link>${escHtml(absImg(origin, p.img, cover))}</g:image_link>
${extra.map((u) => `<g:additional_image_link>${escHtml(u)}</g:additional_image_link>`).join("\n")}
<g:availability>${stock > 0 ? "in stock" : "out of stock"}</g:availability>
<g:inventory>${stock}</g:inventory>
<g:condition>new</g:condition>
<g:price>${price}.00 BDT</g:price>
${sale ? `<g:sale_price>${sale}.00 BDT</g:sale_price>` : ""}
<g:brand>${escHtml(brand)}</g:brand>
<g:product_type>${escHtml(String(catName.get(p.cat) || p.cat))}</g:product_type>
<g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
<g:size>${escHtml(p.sizes.join(", "))}</g:size>
</item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>${escHtml(brand)}</title>
<link>${escHtml(origin)}</link>
<description>${escHtml(brand)} product catalogue</description>
${items.join("\n")}
</channel>
</rss>`;
}
