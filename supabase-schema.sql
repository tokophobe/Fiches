-- À exécuter une seule fois dans Supabase : Project → SQL Editor → New query
-- puis « Run ». Crée la table qui stocke les fiches de tout le monde,
-- séparées par sync_code.

create table if not exists public.cards (
  id text primary key,
  sync_code text not null,
  subject text,
  subject_name text,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  due_date timestamptz not null default now(),
  last_reviewed timestamptz,
  review_count integer not null default 0,
  easiness numeric not null default 2.5,
  interval integer not null default 0,
  repetitions integer not null default 0,
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

-- Pour les bases créées avant l'introduction des matières : ajoute les
-- colonnes si elles n'existent pas déjà (sans effet si déjà présentes).
alter table public.cards add column if not exists subject text;
alter table public.cards add column if not exists subject_name text;

-- Pour les bases créées avant la page "Récompenses" : le record personnel
-- de délai de chaque fiche (le plus grand nombre de jours qu'elle ait
-- jamais atteint avant sa prochaine révision), utilisé pour savoir quelles
-- cases du tableau de récompenses sont débloquées.
alter table public.cards add column if not exists max_interval_reached integer not null default 0;

create index if not exists cards_sync_code_idx on public.cards (sync_code);

-- Row Level Security : nécessaire pour que la clé publique ("anon") puisse
-- lire/écrire. Comme il n'y a pas de compte utilisateur, la policy est
-- ouverte : c'est le sync_code, gardé secret par toi, qui joue le rôle de
-- mot de passe. Voir le README pour les implications de sécurité.
alter table public.cards enable row level security;

drop policy if exists "anon can read/write cards" on public.cards;
create policy "anon can read/write cards"
  on public.cards
  for all
  to anon
  using (true)
  with check (true);

-- Active la réplication en temps réel (pour que le PC voie immédiatement
-- ce que tu ajoutes sur le téléphone, et inversement). "do $$ ... $$"
-- évite une erreur si la table est déjà dans la publication (rejouer ce
-- script plusieurs fois est censé être sans risque).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cards'
  ) then
    alter publication supabase_realtime add table public.cards;
  end if;
end $$;

-- Matières : jusqu'ici jamais synchronisées pour de vrai (seul leur nom
-- était recopié sur chaque fiche) — leur dossier et leur mode
-- d'apprentissage ne voyageaient donc jamais d'un appareil à l'autre. Un
-- "deleted" (suppression douce) plutôt qu'un vrai DELETE, pour que les
-- autres appareils sachent qu'une matière a disparu au lieu de la voir
-- réapparaître au prochain pull.
create table if not exists public.subjects (
  id text primary key,
  sync_code text not null,
  name text not null,
  folder_id text,
  mode_id text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create index if not exists subjects_sync_code_idx on public.subjects (sync_code);

alter table public.subjects enable row level security;

drop policy if exists "anon can read/write subjects" on public.subjects;
create policy "anon can read/write subjects"
  on public.subjects
  for all
  to anon
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'subjects'
  ) then
    alter publication supabase_realtime add table public.subjects;
  end if;
end $$;

-- Dossiers (arborescence, item 1) : jamais synchronisés du tout jusqu'ici —
-- un dossier créé sur un appareil n'apparaissait jamais sur les autres.
create table if not exists public.folders (
  id text primary key,
  sync_code text not null,
  name text not null,
  parent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create index if not exists folders_sync_code_idx on public.folders (sync_code);

alter table public.folders enable row level security;

drop policy if exists "anon can read/write folders" on public.folders;
create policy "anon can read/write folders"
  on public.folders
  for all
  to anon
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'folders'
  ) then
    alter publication supabase_realtime add table public.folders;
  end if;
end $$;

-- Table partagée par la page "Tamagotchi" (et l'ancienne page "Récompenses",
-- conservée pour compatibilité) : une seule ligne par code de synchro.
-- "opened" = ancien tableau de récompenses (plus utilisé par l'appli).
-- "tamagotchi" = état du compagnon (besoins, croissance) + ses cadeaux.
create table if not exists public.reward_state (
  sync_code text primary key,
  opened jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Pour les bases créées avant l'introduction du Tamagotchi.
alter table public.reward_state add column if not exists tamagotchi jsonb;

alter table public.reward_state enable row level security;

drop policy if exists "anon can read/write reward_state" on public.reward_state;
create policy "anon can read/write reward_state"
  on public.reward_state
  for all
  to anon
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reward_state'
  ) then
    alter publication supabase_realtime add table public.reward_state;
  end if;
end $$;

-- Modes d'apprentissage (item 1, audit synchro) : jusqu'ici jamais
-- synchronisés du tout — seul le "modeId" de chaque matière l'était (voir
-- table subjects). Un mode personnalisé créé sur un appareil (nom + les 8
-- coefficients/maximums) restait donc invisible sur les autres, qui
-- retombaient silencieusement sur le mode "Normal" par défaut. Les 3 modes
-- fixes (cool/normal/renforce) sont aussi synchronisés ici : si leurs
-- valeurs sont personnalisées sur un appareil, ça doit se refléter partout.
create table if not exists public.learning_modes (
  id text primary key,
  sync_code text not null,
  name text not null,
  builtin boolean not null default false,
  ka numeric not null,
  kh numeric not null,
  kg numeric not null,
  ke numeric not null,
  ma integer not null,
  mh integer not null,
  mg integer not null,
  me integer not null,
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create index if not exists learning_modes_sync_code_idx on public.learning_modes (sync_code);

alter table public.learning_modes enable row level security;

drop policy if exists "anon can read/write learning_modes" on public.learning_modes;
create policy "anon can read/write learning_modes"
  on public.learning_modes
  for all
  to anon
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'learning_modes'
  ) then
    alter publication supabase_realtime add table public.learning_modes;
  end if;
end $$;

-- Réglages du mode développeur (item 1 — audit synchro) : jusqu'ici
-- jamais synchronisés du tout (couleurs, icônes, palette de texte, tout
-- restait propre à chaque appareil). Une seule ligne JSON par code de
-- synchro, même principe que reward_state.
create table if not exists public.dev_settings (
  sync_code text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dev_settings enable row level security;

drop policy if exists "anon can read/write dev_settings" on public.dev_settings;
create policy "anon can read/write dev_settings"
  on public.dev_settings
  for all
  to anon
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'dev_settings'
  ) then
    alter publication supabase_realtime add table public.dev_settings;
  end if;
end $$;

-- Force PostgREST à recharger son cache de schéma tout de suite (sinon les
-- nouvelles colonnes peuvent mettre quelques minutes à être reconnues par
-- l'API, même après ce script).
notify pgrst, 'reload schema';
