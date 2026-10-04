-- ============================================================
-- Fiches — Round 33 : réglages (couleurs, position des boutons…) mis à
-- jour EN DIRECT sur tous tes appareils.
--
-- Ajoute la table des réglages partagés (dev_settings_public) au canal
-- « temps réel » de Supabase : un réglage changé sur le PC arrive alors
-- tout de suite sur l'iPhone si l'appli y est ouverte (sinon, au retour
-- dans l'appli). Crée aussi la table et ses règles si elles manquent.
--
-- À exécuter UNE FOIS dans Supabase → SQL Editor → New query → Run.
-- Peut être relancé sans risque.
-- ============================================================
create table if not exists public.dev_settings_public (
  id text primary key default 'global',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.dev_settings_public enable row level security;

drop policy if exists "dev_settings_public_select_all" on public.dev_settings_public;
create policy "dev_settings_public_select_all" on public.dev_settings_public
  for select using (true);

-- Écriture réservée à ton compte.
drop policy if exists "dev_settings_public_insert_owner" on public.dev_settings_public;
create policy "dev_settings_public_insert_owner" on public.dev_settings_public
  for insert with check (lower(auth.jwt() ->> 'email') = 'stephane.vezain@gmail.com');
drop policy if exists "dev_settings_public_update_owner" on public.dev_settings_public;
create policy "dev_settings_public_update_owner" on public.dev_settings_public
  for update using (lower(auth.jwt() ->> 'email') = 'stephane.vezain@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'stephane.vezain@gmail.com');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'dev_settings_public'
  ) then
    alter publication supabase_realtime add table public.dev_settings_public;
  end if;
end $$;

notify pgrst, 'reload schema';

-- Contrôle : la ligne des réglages et sa dernière mise à jour.
select id, updated_at, updated_by from public.dev_settings_public;
