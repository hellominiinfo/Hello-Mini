import postgres from "postgres";
import { env, requireEnv } from "./util";

type Sql = postgres.Sql<Record<string, never>>;
let _sql: Sql | null = null;

export function sql(): Sql {
  if (_sql) return _sql;
  // DATABASE_URL = Neon pooled connection string. NETLIFY_DATABASE_URL / POSTGRES_URL are accepted as fallbacks.
  let url = env("DATABASE_URL") || env("NETLIFY_DATABASE_URL") || env("POSTGRES_URL") || requireEnv("DATABASE_URL");
  try { const u = new URL(url); u.searchParams.delete("channel_binding"); url = u.toString(); } catch { /* keep as is */ }
  _sql = postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
    // Neon / pgbouncer pooled connections do not support prepared statements.
    prepare: false,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? false : "require",
    onnotice: () => {},
    transform: { undefined: null },
  }) as unknown as Sql;
  return _sql;
}

/** Ordered list of schema changes. Never edit an applied step; add a new one. */
const MIGRATIONS: { id: number; sql: string }[] = [
  {
    id: 1,
    sql: `
create table if not exists admins (
  id text primary key,
  email text not null unique,
  name text not null,
  role text not null,
  pass_hash text not null,
  active boolean not null default true,
  is_owner boolean not null default false,
  must_change boolean not null default false,
  created_at timestamptz not null default now(),
  last_login timestamptz
);
create table if not exists sessions (
  id_hash text primary key,
  admin_id text not null references admins(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  ua text,
  ip text
);
create index if not exists sessions_admin on sessions(admin_id);
create table if not exists kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists products (
  id text primary key,
  sort int not null default 0,
  status text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists variants (
  sku text primary key,
  product_id text not null references products(id) on delete cascade,
  size text not null,
  color text not null,
  stock int not null check (stock >= 0),
  pos int not null default 0
);
create index if not exists variants_product on variants(product_id);
create table if not exists orders (
  ref text primary key,
  created_at timestamptz not null default now(),
  status text not null,
  phone text not null,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists orders_created on orders(created_at desc);
create index if not exists orders_phone on orders(phone);
create table if not exists coupons (
  code text primary key,
  doc jsonb not null,
  uses int not null default 0
);
create table if not exists moves (
  id bigserial primary key,
  at timestamptz not null default now(),
  product_id text,
  sku text,
  delta int not null,
  why text,
  by_name text
);
create index if not exists moves_at on moves(at desc);
create table if not exists notifs (
  id bigserial primary key,
  at timestamptz not null default now(),
  type text not null,
  title text not null,
  body text not null default '',
  ref text not null default '',
  read boolean not null default false
);
create index if not exists notifs_at on notifs(at desc);
create table if not exists logs (
  id bigserial primary key,
  at timestamptz not null default now(),
  who text not null,
  action text not null,
  detail text not null default ''
);
create index if not exists logs_at on logs(at desc);
create table if not exists push_subs (
  endpoint text primary key,
  admin_id text not null references admins(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  ua text,
  created_at timestamptz not null default now()
);
create table if not exists media (
  id text primary key,
  mime text not null,
  bytes bytea not null,
  size int not null,
  created_at timestamptz not null default now(),
  created_by text
);
create table if not exists rate_limits (
  key text primary key,
  count int not null,
  reset_at timestamptz not null
);
create table if not exists subscribers (
  email text primary key,
  lang text,
  created_at timestamptz not null default now()
);
`,
  },
  {
    id: 2,
    sql: `
-- product view counter: one row per product per day
create table if not exists product_views (
  product_id text not null,
  day date not null,
  views int not null default 0,
  uniques int not null default 0,
  primary key (product_id, day)
);
-- short-lived "already counted" marks (hashed, no personal data)
create table if not exists view_seen (
  k text primary key,
  until timestamptz not null
);
create index if not exists view_seen_until on view_seen (until);
-- carts left at checkout (Cart Recovery)
create table if not exists carts (
  id text primary key,
  sid text not null,
  phone text,
  name text not null default '',
  wa text not null default '',
  district text not null default '',
  items jsonb not null default '[]',
  value int not null default 0,
  status text not null default 'pending',
  reminders jsonb not null default '[]',
  optout boolean not null default false,
  lang text not null default 'bn',
  order_ref text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists carts_phone on carts (phone);
create index if not exists carts_sid on carts (sid);
create index if not exists carts_updated on carts (updated_at);
`,
  },
];

let migrated: Promise<void> | null = null;

/** Runs pending migrations once per server instance. Safe when several instances start together. */
export function ensureSchema(): Promise<void> {
  if (!migrated) {
    migrated = (async () => {
      const db = sql();
      await db.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(726354001)`;
        await tx`create table if not exists schema_migrations (id int primary key, applied_at timestamptz not null default now())`;
        const done = new Set((await tx<{ id: number }[]>`select id from schema_migrations`).map((r) => r.id));
        for (const m of MIGRATIONS) {
          if (done.has(m.id)) continue;
          await tx.unsafe(m.sql);
          await tx`insert into schema_migrations (id) values (${m.id})`;
        }
      });
    })().catch((e) => { migrated = null; throw e; });
  }
  return migrated;
}

export type Json = postgres.JSONValue;
export const asJson = (v: unknown) => sql().json(v as Json);
