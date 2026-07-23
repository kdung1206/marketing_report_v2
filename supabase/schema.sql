-- Run this once in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).
-- Creates the single table the app uses as its shared database.
--
-- Storage model: one JSONB blob per "app instance" (id = 'main'), mirroring
-- the old src/db_store.json shape (digital_marketing, kol_koc, btl_trade,
-- monthly_ooh_pr, btl_trade_monthly, comments, active_state, mail_config,
-- users). This keeps the migration a storage-layer swap instead of a full
-- relational redesign; splitting into normalized tables can be a later step
-- if/when query needs grow beyond "read/write the whole document".

create table if not exists app_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- The Express/Vercel API always uses the SERVICE ROLE key (server-side only,
-- never shipped to the browser), which bypasses Row Level Security entirely.
-- RLS is enabled anyway as defense in depth: if the anon/public key ever leaks
-- or gets used by mistake, no client can read or write this table directly.
alter table app_state enable row level security;
