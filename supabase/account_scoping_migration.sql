-- ============================================================
-- Fiches — Round 29 : les données appartiennent au COMPTE.
--
-- Avant : fiches, boîtes et dossiers étaient rangés par « code de
-- synchronisation », avec des règles d'accès ouvertes (n'importe qui
-- disposant de la clé publique pouvait tout lire et modifier).
-- Après : chaque ligne appartient à un compte (owner_id) et les règles de
-- sécurité (RLS) ne laissent chacun lire et écrire QUE ses propres
-- données. Le calendrier est désormais synchronisé lui aussi.
--
-- À exécuter UNE FOIS dans Supabase → SQL Editor → New query → Run,
-- AVANT d'ouvrir la nouvelle version de l'appli (sinon elle prévient que
-- la base n'est pas à jour et garde les fiches sur l'appareil).
--
-- ⚠ Vérifie l'adresse email ci-dessous (étape 3) : toutes les données
-- existantes (rangées par code de synchronisation) sont rattachées à CE
-- compte, qui doit déjà exister (créé depuis la page Compte de l'appli).
--
-- Le script commence par une SAUVEGARDE des tables (backup_r29_…), et
-- peut être relancé sans risque.
-- ============================================================

-- 1. Sauvegarde (une seule fois : les copies existantes ne sont pas
--    écrasées si le script est relancé). Les copies sont fermées à tout
--    accès depuis l'appli (RLS activée, aucune règle d'accès).
create table if not exists public.backup_r29_cards as table public.cards;
create table if not exists public.backup_r29_subjects as table public.subjects;
create table if not exists public.backup_r29_folders as table public.folders;
alter table public.backup_r29_cards enable row level security;
alter table public.backup_r29_subjects enable row level security;
alter table public.backup_r29_folders enable row level security;

-- 2. Nouvelles colonnes : propriétaire (compte) et copie complète de
--    l'objet (payload, pour ne perdre aucun champ d'un appareil à l'autre).
alter table public.cards add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.cards add column if not exists payload jsonb;
alter table public.cards alter column sync_code drop not null;

alter table public.subjects add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.subjects add column if not exists payload jsonb;
alter table public.subjects alter column sync_code drop not null;

alter table public.folders add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.folders add column if not exists payload jsonb;
alter table public.folders alter column sync_code drop not null;

-- 3. Rattachement des données existantes au compte de Stéphane.
do $$
declare
  owner_email text := 'stephane.vezain@gmail.com';  -- ← à vérifier
  owner uuid;
begin
  -- Rien à rattacher (ex. nouvelle installation) : on passe.
  if not exists (select 1 from public.cards where owner_id is null)
     and not exists (select 1 from public.subjects where owner_id is null)
     and not exists (select 1 from public.folders where owner_id is null) then
    return;
  end if;
  select id into owner from auth.users where lower(email) = lower(owner_email);
  if owner is null then
    raise exception 'Aucun compte avec l''email % : crée-le d''abord depuis l''appli (page Compte), ou corrige l''adresse en haut de l''étape 3.', owner_email;
  end if;
  update public.cards set owner_id = owner where owner_id is null;
  update public.subjects set owner_id = owner where owner_id is null;
  update public.folders set owner_id = owner where owner_id is null;
end $$;

-- 4. Propriétaire obligatoire, rempli automatiquement avec le compte
--    connecté ; clé primaire « (propriétaire, id) » : deux comptes peuvent
--    avoir une fiche de même id (ex. copie d'une boîte de classe ou de la
--    Librairie), chacun la sienne.
alter table public.cards alter column owner_id set default auth.uid();
alter table public.cards alter column owner_id set not null;
alter table public.cards drop constraint if exists cards_pkey;
alter table public.cards add constraint cards_pkey primary key (owner_id, id);
create index if not exists cards_owner_idx on public.cards (owner_id);

alter table public.subjects alter column owner_id set default auth.uid();
alter table public.subjects alter column owner_id set not null;
alter table public.subjects drop constraint if exists subjects_pkey;
alter table public.subjects add constraint subjects_pkey primary key (owner_id, id);
create index if not exists subjects_owner_idx on public.subjects (owner_id);

alter table public.folders alter column owner_id set default auth.uid();
alter table public.folders alter column owner_id set not null;
alter table public.folders drop constraint if exists folders_pkey;
alter table public.folders add constraint folders_pkey primary key (owner_id, id);
create index if not exists folders_owner_idx on public.folders (owner_id);

-- 5. Règles d'accès : chacun ne voit et ne modifie que ses lignes.
drop policy if exists "anon can read/write cards" on public.cards;
drop policy if exists "owner manages own cards" on public.cards;
create policy "owner manages own cards" on public.cards
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "anon can read/write subjects" on public.subjects;
drop policy if exists "owner manages own subjects" on public.subjects;
create policy "owner manages own subjects" on public.subjects
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "anon can read/write folders" on public.folders;
drop policy if exists "owner manages own folders" on public.folders;
create policy "owner manages own folders" on public.folders
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 6. Anciennes tables plus utilisées par l'appli (récompenses, modes
--    d'apprentissage, ancien réglage dév. par code) : on ferme leur accès
--    ouvert. Les tables et leur contenu restent en place.
drop policy if exists "anon can read/write reward_state" on public.reward_state;
drop policy if exists "anon can read/write learning_modes" on public.learning_modes;
drop policy if exists "anon can read/write dev_settings" on public.dev_settings;

-- 7. Calendrier, synchronisé par compte.
create table if not exists public.calendar_events (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted boolean not null default false,
  primary key (owner_id, id)
);
alter table public.calendar_events enable row level security;
drop policy if exists "owner manages own calendar" on public.calendar_events;
create policy "owner manages own calendar" on public.calendar_events
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'calendar_events'
  ) then
    alter publication supabase_realtime add table public.calendar_events;
  end if;
end $$;

notify pgrst, 'reload schema';

-- Contrôle : nombre de lignes par compte (tout doit être à ton compte).
select 'cards' as table_name, owner_id, count(*) from public.cards group by owner_id
union all
select 'subjects', owner_id, count(*) from public.subjects group by owner_id
union all
select 'folders', owner_id, count(*) from public.folders group by owner_id;
