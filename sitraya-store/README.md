# Sitraya Store

Bilingual (Bangla / English) online shop with an admin panel, phone notifications for new orders, and Meta (Facebook / Instagram) integration.

**Setup guide in Bangla (step by step): [SETUP-BN.md](SETUP-BN.md)**

## How it is built

| Part | What it is |
|---|---|
| `public/` | The website and admin panel (the approved design), service worker, icons. Served as static files. |
| `netlify/functions/sitraya/` | The Netlify Function. `index.mjs` says which paths it serves; `server.mjs` is the whole server in one file (built from `server/`). |
| `netlify.toml` | Netlify settings: publish `public/`, functions folder, static-file headers. |
| `server/` | Server source (TypeScript): orders, stock, coupons, admin API, sessions, roles, web push, Meta, images. |
| `client-src/` | Source of the website design. `npm run rebuild` regenerates `public/assets` and the server bundle. |
| `tests/` | Unit tests and integration tests against a real Postgres database. |

Hosting: **Netlify** (website + one function), **Neon Postgres** (database, created at neon.com, connection string pasted into Netlify). The bundle includes its libraries (`postgres`, `zod`), so nothing needs building on Netlify. Put the Neon database in the same region as the function: US East (Ohio) on Netlify Free/Personal, Singapore on Netlify Pro (set *Functions → Region*).

## Environment variables

| Name | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon **pooled** connection string (Neon → Connect, connection pooling on). `NETLIFY_DATABASE_URL` is also accepted. |
| `APP_SECRET` | yes | 48+ random characters. Encrypts saved keys (Meta token, Telegram token, push keys). Do not change after launch: if it changes, saving keys is refused until the old value is restored. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first run | Creates the owner account on the first sign-in, only while no admin exists. The owner must choose a new password at once. |
| `ADMIN_NAME` | no | Owner's display name (default "Owner"). |
| `SITE_URL` | no | Your public address, e.g. `https://www.sitraya.com`. Used in links, the Meta feed and CSRF checks. |
| `SEED_DEMO_PRODUCTS` | no | `0` to start with no demo products. Default: demo products are added once. |
| `VAPID_SUBJECT` | no | Contact for push services, e.g. `mailto:you@example.com`. Defaults to the site address. |

The database tables are created automatically on the first request.

## Security

- Prices, discounts, delivery and stock are calculated on the server inside a database transaction. Stock is locked (`SELECT … FOR UPDATE`) so two buyers cannot get the last piece.
- Admin passwords are hashed with scrypt. Sessions are random 256-bit tokens. Only their SHA-256 is stored, in `HttpOnly; Secure; SameSite=Strict` cookies (`__Host-` prefix). Sessions last 7 days and are cleared on a password change or when an admin is disabled.
- The client IP for rate limits comes from Netlify (`context.ip`), not from headers a visitor can send.
- Every admin API call checks sign-in, a same-origin header and `Origin`/`Sec-Fetch-Site`, and the admin's **role** (7 roles, checked on the server).
- Rate limits are stored in Postgres: login per IP and per email, orders per IP and per phone, tracking, coupons, uploads.
- Secret keys (Meta CAPI token, Telegram bot token, VAPID private key) are encrypted with AES-256-GCM using `APP_SECRET` and are never sent to a browser.
- Uploads accept real JPG/PNG/WebP/GIF only, checked by file signature (SVG is refused). They are served with `nosniff` and a sandbox CSP.
- Every input is validated with zod. Image and video fields only accept uploaded files or `https://` links.
- Security headers: strict CSP (no inline scripts), HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Public data never includes cost prices, orders or secrets. Order tracking needs the order number **and** the phone number, and does not reveal the address.

## Notifications

- **Phone / laptop (Web Push):** each admin opens *Admin → Notifications → Turn on* on each device. Works on Android (Chrome), Windows/Mac (Chrome, Edge, Firefox, Safari) and iPhone. On iPhone, add the admin to the home screen first (iOS 16.4+). Push messages are encrypted per RFC 8291 and signed with VAPID (RFC 8292), using Node's own crypto with no extra library. The VAPID keys are generated and stored automatically.
- **Telegram (backup):** bot token and chat ID in *Admin → Notifications*.
- **In the panel:** the bell and the orders list update every 25 seconds.

## Meta (Facebook / Instagram)

- **Pixel:** browser events `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Search` and `Purchase`. Each can be switched on or off in *Admin → Meta Integration*.
- **Conversions API:** the server sends `Purchase` with hashed phone, name and city, using the order number as `event_id`, so Meta counts a purchase only once.
- **Catalogue feed:** `https://YOUR-DOMAIN/feeds/meta-catalog.xml` (RSS 2.0 / Google format). Add it in Commerce Manager as a scheduled feed.
- **Share previews:** every product has a page `/p/<id>` with Open Graph tags (title, price, photo).

## Commands (only needed for development)

```bash
# dev tools only (the website itself needs no install step):
npm i --no-save @types/node@^22.18.0 esbuild@^0.28.2 postgres@^3.4.9 typescript@^6.0.3 zod@^3.25.76 tsx@^4.20.0
npm run rebuild             # design sources → public/assets + server bundle (needs Python 3)
npm run build:server        # server/ → netlify/functions/sitraya/server.mjs
npm run typecheck
DATABASE_URL=... APP_SECRET=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run dev   # http://localhost:3000
TEST_DATABASE_URL=postgres://... npm test   # WIPES that database — use an empty test database
```

## Website upgrade (October 2026)

- **Website Settings** (admin): brand identity (name, logos, tab title/description with `{brand}`, favicon, app name/icon, theme colour, default language), product image shape/fit/focus point/WebP, display scale for phones and computers plus customer text size, product sections as grid or auto-scrolling slider (per-device counts, interval, direction, arrows, dots, loop, speed), view counter, search suggestions, Facebook share pictures. Stored in `settings.site`, validated by `siteSchema`.
- **White-label:** no code path falls back to the original name or pictures once the shop is renamed (`ORIG_BRAND` in `server/shell.ts`). `/admin.webmanifest` and `/brand/icon.svg` are generated from the brand settings.
- **Facebook sharing:** each product gets a 1200 × 630 share picture made in the browser when saved (`shareImg`), used as `og:image` with width/height while it matches the current photo. Product pages carry schema.org Product data.
- **View counter:** `POST /api/view` — one count per person per product per 30 minutes (hashed, no personal data), bots ignored, daily rows in `product_views`.
- **Cart Recovery:** `POST /api/cart` saves a bag; it gets a name/number only after the customer typed a phone at checkout. One cart per customer, converted automatically by the order (`convertCarts`), reminders limited by waiting time, maximum count and opt-out. `GET /api/cart/:id` returns items only.
- **Phones:** checkout keeps the typed field visible with the keyboard open, product buttons in one row, whole product photos, phone banners for the slider, search suggestions before the keyboard, optional post office field.

## Not included (can be added later)

Online card/bKash payment gateway (manual bKash/Nagad/Rocket with TrxID is included), courier API integration, email/SMS notifications, customer accounts, product reviews, and video file uploads (videos are YouTube/Facebook/.mp4 links).
