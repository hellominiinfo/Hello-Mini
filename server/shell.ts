/** Builds the HTML page: the approved design, plus per-page title/preview tags for Facebook & WhatsApp shares. */
import { BODY, ASSET_VER } from "./generated/shell";
import { publicBoot } from "./store";
import { escHtml, siteOrigin } from "./util";

export function securityHeaders(req: Request): Record<string, string> {
  const https = new URL(req.url).protocol === "https:";
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://www.facebook.com https://connect.facebook.net",
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com",
    "worker-src 'self'",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  return {
    "content-security-policy": csp,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
    ...(https ? { "strict-transport-security": "max-age=63072000; includeSubDomains" } : {}),
  };
}

/** JSON inside <script> must never contain "</script>" or "<!--". */
const safeJson = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

function imgUrl(origin: string, ref: string | undefined, isOrig = true): string {
  if (ref && ref.startsWith("https://")) return ref;
  if (ref && ref.startsWith("/m/")) return origin + ref;
  // the original shop's cover photo is never used under another shop name
  return isOrig ? origin + "/assets/brand/cover.jpg" : origin + "/brand/icon.svg";
}
/** The name the code was first made for; its own pictures are used only while the shop keeps that name. */
export const ORIG_BRAND = "Sitraya";
export function brandIconRefs(site: any, brand: string): { favicon: string; touch: string } {
  const b = (site && site.brand) || {};
  const orig = brand === ORIG_BRAND;
  const up = (r: string) => (r && (r.startsWith("/m/") || r.startsWith("https://")) ? r : "");
  const favicon = up(b.favicon) || up(b.appIcon) || (orig ? "/assets/icon-192.png" : "/brand/icon.svg");
  const touch = up(b.appIcon) || up(b.favicon) || (orig ? "/assets/icon-192.png" : "/brand/icon.svg");
  return { favicon, touch };
}

export async function renderPage(req: Request, route: { kind: "home" | "product" | "category" | "admin" | "page"; id?: string }): Promise<Response> {
  const origin = siteOrigin(req);
  const boot = await publicBoot();
  const brand = (boot.cfg.brand && boot.cfg.brand.name) || "Shop";
  const site: any = (boot.settings as any).site || {};
  const B = site.brand || {}, lang: "bn" | "en" = B.lang === "en" ? "en" : "bn", orig = brand === ORIG_BRAND;
  const fill = (s: string) => String(s || "").replace(/\{brand\}/g, () => brand);
  let title = fill(B.title && B.title[lang]) || (lang === "bn" ? `${brand} — প্রিমিয়াম মডেস্ট ফ্যাশন` : `${brand} — Premium modest fashion in Bangladesh`);
  let desc = fill(B.desc && B.desc[lang]) || `${brand}: burqa, abaya, hijab, three piece, kurti and festive wear. Cash on delivery all over Bangladesh.`;
  let image = imgUrl(origin, B.shareImg || undefined, orig);
  let wide = !!B.shareImg;
  let ld = "";
  let path = "/";
  let status = 200;

  if (route.kind === "product" && route.id) {
    const p = boot.products.find((x) => x.id === route.id);
    if (p) {
      const price = p.sale && p.sale < p.price ? p.sale : p.price;
      title = `${p.en} · ৳${price.toLocaleString("en-IN")} — ${brand}`;
      desc = (p.den || `${p.bn} — ${p.en}`).slice(0, 200);
      // the 1200 × 630 share picture shows the whole product; it is used only while it matches the current photo
      const share = (p as any).shareImg && (p as any)._shareFrom === p.img ? (p as any).shareImg : "";
      image = imgUrl(origin, share || p.img, orig); wide = !!share;
      path = `/p/${encodeURIComponent(p.id)}`;
      const stock = (p.variants || []).reduce((a: number, v: any) => a + v.stock, 0);
      ld = `<script type="application/ld+json">${safeJson({ "@context": "https://schema.org", "@type": "Product", name: p.en, sku: p.sku, description: (p.den || p.en).slice(0, 300), image: imgUrl(origin, p.img, orig), brand: { "@type": "Brand", name: brand }, url: origin + path,
        offers: { "@type": "Offer", priceCurrency: "BDT", price: String(price), availability: stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: origin + path } })}</script>`;
    } else status = 404;
  } else if (route.kind === "category" && route.id) {
    const c = boot.categories.find((x: any) => x.id === route.id);
    if (c) { title = `${c.en} · ${c.bn} — ${brand}`; path = `/c/${encodeURIComponent(c.id)}`; } else status = 404;
  } else if (route.kind === "admin") {
    title = `${brand} Admin`;
    path = "/admin";
  }
  const icons = brandIconRefs(site, brand);
  const theme = /^#[0-9a-fA-F]{6}$/.test(B.theme || "") ? B.theme : "#0D2B26";
  const appShort = String(B.appShort || "").trim() || brand;

  const head = `<!doctype html>
<html lang="${lang}" translate="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(desc)}">
<link rel="canonical" href="${escHtml(origin + path)}">
<meta name="theme-color" content="${escHtml(theme)}">
<meta name="google" content="notranslate">
${route.kind === "admin" ? `<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="/admin.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${escHtml(appShort.slice(0, 30))}">` : `<meta property="og:type" content="${route.kind === "product" ? "product" : "website"}">
<meta property="og:site_name" content="${escHtml(brand)}">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:image" content="${escHtml(image)}">
${wide ? `<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
` : ""}<meta property="og:image:alt" content="${escHtml(title)}">
<meta property="og:url" content="${escHtml(origin + path)}">
<meta name="twitter:card" content="summary_large_image">`}
<link rel="icon" href="${escHtml(icons.favicon)}">
<link rel="apple-touch-icon" href="${escHtml(icons.touch)}">
${ld}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Outfit:wght@400;500;600;700;800&family=Anek+Bangla:wght@500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/app.css?v=${ASSET_VER}">
<script id="boot" type="application/json">${safeJson({ ...boot, route })}</script>
<script src="/assets/app.js?v=${ASSET_VER}" defer></script>
</head>
<body>
`;
  const html = head + BODY + "\n</body>\n</html>\n";
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // public pages are cached for a short time at the edge; admin never
      "cache-control": route.kind === "admin" ? "no-store" : "public, max-age=0, s-maxage=20, stale-while-revalidate=60",
      ...securityHeaders(req),
    },
  });
}
