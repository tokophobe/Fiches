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

-- Force PostgREST à recharger son cache de schéma tout de suite (sinon les
-- nouvelles colonnes peuvent mettre quelques minutes à être reconnues par
-- l'API, même après ce script).
notify pgrst, 'reload schema';
