import { viewTotals } from "./extras";
import { sql, asJson } from "./db";
import { DEFAULT_CATEGORIES, DEFAULT_CFG, DEFAULT_SETTINGS, DEMO_PRODUCTS } from "./seed-data";
import { HttpError, decrypt, encrypt, env } from "./util";
import { settingsSchema, type ProductDoc, type Settings } from "./validate";

// ---------- key/value settings ----------
export async function getKV<T>(key: string, fallback: T): Promise<T> {
  const rows = await sql()<{ value: T }[]>`select value from kv where key = ${key}`;
  return rows.length ? rows[0].value : fallback;
}
/** Version (last change time in ms) of a stored setting; 0 when it was never saved. */
export async function kvVersion(key: string): Promise<number> {
  const rows = await sql()<{ v: string }[]>`select (extract(epoch from updated_at) * 1000)::bigint::text as v from kv where key = ${key}`;
  return rows.length ? Number(rows[0].v) : 0;
}
/** Saves only if nobody else saved it since `expected` (optimistic locking). Returns the new version. */
export async function setKVChecked(key: string, value: unknown, expected: number | undefined): Promise<number> {
  return sql().begin(async (tx) => {
    const cur = await tx<{ v: string }[]>`select (extract(epoch from updated_at) * 1000)::bigint::text as v from kv where key = ${key} for update`;
    const now = cur.length ? Number(cur[0].v) : 0;
    if (expected !== undefined && expected !== now) throw new HttpError(409, "Someone else changed this a moment ago. The latest version has been loaded — please make your change again.", "conflict");
    const r = await tx<{ v: string }[]>`insert into kv (key, value, updated_at) values (${key}, ${tx.json(value as any)}, clock_timestamp())
      on conflict (key) do update set value = excluded.value, updated_at = clock_timestamp() returning (extract(epoch from updated_at) * 1000)::bigint::text as v`;
    return Number(r[0].v);
  });
}
export async function setKV(key: string, value: unknown): Promise<void> {
  await sql()`insert into kv (key, value, updated_at) values (${key}, ${asJson(value)}, now())
              on conflict (key) do update set value = excluded.value, updated_at = now()`;
}

export const getCfg = () => getKV<Record<string, any>>("cfg", structuredClone(DEFAULT_CFG));
export const getCategories = () => getKV<any[]>("categories", structuredClone(DEFAULT_CATEGORIES));
export async function getSettings(): Promise<Settings> {
  const raw = await getKV<Record<string, unknown>>("settings", structuredClone(DEFAULT_SETTINGS));
  const parsed = settingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : settingsSchema.parse(DEFAULT_SETTINGS);
}

// ---------- secrets (encrypted at rest, never sent to browsers) ----------
export type Secrets = { metaToken?: string; telegramToken?: string; vapidPrivate?: string; vapidPublic?: string };
export async function getSecrets(): Promise<Secrets> {
  const blob = await getKV<string>("secrets", "");
  if (!blob) return {};
  try { return JSON.parse(decrypt(blob)); } catch (e) { console.error("Could not read saved secrets (was APP_SECRET changed?)", e); return {}; }
}
export async function setSecrets(patch: Partial<Secrets>): Promise<Secrets> {
  const blob = await getKV<string>("secrets", "");
  let cur: Secrets = {};
  if (blob) {
    try { cur = JSON.parse(decrypt(blob)); }
    catch { throw new HttpError(500, "Saved keys cannot be read because APP_SECRET was changed. Put the old APP_SECRET back in Netlify and redeploy.", "config"); }
  }
  const next = { ...cur, ...patch };
  for (const k of Object.keys(next) as (keyof Secrets)[]) if (next[k] === "") delete next[k];
  await setKV("secrets", encrypt(JSON.stringify(next)));
  return next;
}

// ---------- products ----------
export type Variant = { sku: string; size: string; color: string; stock: number };
export type Product = ProductDoc & { id: string; variants: Variant[] };

export async function loadProducts(opts: { activeOnly?: boolean; withVersion?: boolean } = {}): Promise<Product[]> {
  const db = sql();
  const prods = opts.activeOnly
    ? await db<{ id: string; doc: any; v: string }[]>`select id, doc, (extract(epoch from updated_at) * 1000)::bigint::text as v from products where status = 'active' order by sort, id`
    : await db<{ id: string; doc: any; v: string }[]>`select id, doc, (extract(epoch from updated_at) * 1000)::bigint::text as v from products order by sort, id`;
  if (!prods.length) return [];
  const vars = await db<(Variant & { product_id: string })[]>`select product_id, sku, size, color, stock from variants where product_id in ${db(prods.map((p) => p.id))} order by pos, sku`;
  const by = new Map<string, Variant[]>();
  for (const v of vars) { const l = by.get(v.product_id) || []; l.push({ sku: v.sku, size: v.size, color: v.color, stock: v.stock }); by.set(v.product_id, l); }
  return prods.map((p) => ({ ...p.doc, id: p.id, variants: by.get(p.id) || [], ...(opts.withVersion ? { _v: Number(p.v) } : {}) }));
}

export function publicProduct(p: Product) {
  const { cost: _cost, ...rest } = p as Product & { cost?: number };
  return rest;
}

/** Inserts the demo catalogue once, so a fresh shop is not empty. Delete the products any time in the admin panel. */
let seeded: Promise<void> | null = null;
export function ensureSeed(): Promise<void> {
  if (!seeded) {
    seeded = (async () => {
      const db = sql();
      const done = await getKV<boolean>("seeded", false);
      if (done) return;
      await db.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(726354002)`;
        const again = await tx<{ value: boolean }[]>`select value from kv where key = 'seeded'`;
        if (again.length) return;
        const [{ n }] = await tx<{ n: number }[]>`select count(*)::int as n from products`;
        if (n === 0 && env("SEED_DEMO_PRODUCTS", "1") !== "0") {
          let sort = 0;
          for (const p of DEMO_PRODUCTS) {
            const { variants, ...doc } = p;
            await tx`insert into products (id, sort, status, doc) values (${p.id}, ${sort++}, ${p.status}, ${tx.json(doc)})`;
            let pos = 0;
            for (const v of variants) await tx`insert into variants (sku, product_id, size, color, stock, pos) values (${v.sku}, ${p.id}, ${v.size}, ${v.color}, ${v.stock}, ${pos++})`;
          }
        }
        await tx`insert into kv (key, value) values ('seeded', 'true'::jsonb)`;
      });
    })().catch((e) => { seeded = null; throw e; });
  }
  return seeded;
}

/** Data the public website needs on first load (no costs, no secrets, no orders). */
export async function publicBoot() {
  const [cfg, categories, products, s] = await Promise.all([getCfg(), getCategories(), loadProducts({ activeOnly: true }), getSettings()]);
  return {
    cfg,
    categories,
    products: products.map(publicProduct),
    settings: {
      store: s.store,
      pay: s.pay,
      lowStock: s.lowStock,
      meta: { pixel: s.meta.pixel, pixelOn: s.meta.pixelOn && !!s.meta.pixel, events: s.meta.events },
      site: { ...s.site, cart: { on: s.site.cart.on, days: s.site.cart.days, cool: s.site.cart.cool, max: s.site.cart.max, tpl: { bn: "", en: "" } } },
    },
    // only the counts customers are meant to see: shown products, above the minimum
    views: s.site.views.on ? await viewTotals((pid, t) => { const p = products.find((x) => x.id === pid) as any; if (!p) return false; const ov = p.views || ""; return ov === "show" || (ov !== "hide" && s.site.views.show && t >= s.site.views.min); }) : {},
  };
}

export async function notify(type: string, title: string, body = "", ref = ""): Promise<void> {
  await sql()`insert into notifs (type, title, body, ref) values (${type}, ${title.slice(0, 200)}, ${body.slice(0, 500)}, ${ref.slice(0, 60)})`;
}
