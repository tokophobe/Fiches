-- ============================================================
-- Fiches — Round 18, item 15 : Bibliothèque — notation par étoiles,
-- prix en jetons (ou statut gratuit), niveau scolaire, et nom/prénom
-- de l'auteur au lieu de son email.
--
-- À exécuter UNE FOIS dans l'éditeur SQL de ton projet Supabase, APRÈS
-- avoir déjà exécuté library_collections_schema.sql.
-- Idempotent : peut être relancé sans risque.
-- ============================================================

-- Nouvelles colonnes sur library_collections (toutes optionnelles, avec
-- des valeurs par défaut raisonnables pour les collections déjà publiées
-- avant ce round).
alter table public.library_collections
  add column if not exists level text not null default '';
alter table public.library_collections
  add column if not exists price_tokens integer not null default 0;
alter table public.library_collections
  add column if not exists owner_first_name text not null default '';
alter table public.library_collections
  add column if not exists owner_last_name text not null default '';

create index if not exists library_collections_level_idx
  on public.library_collections (level);

-- Notation par étoiles (1 à 5), une note par utilisateur et par
-- collection (un nouvel envoi remplace l'ancienne note, cf. policy
-- update + contrainte unique ci-dessous).
create table if not exists public.library_ratings (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.library_collections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  unique (collection_id, user_id)
);

create index if not exists library_ratings_collection_idx
  on public.library_ratings (collection_id);

alter table public.library_ratings enable row level security;

-- Lecture publique : la moyenne des notes doit être visible par tous,
-- comme le reste de la Bibliothèque.
drop policy if exists "library_ratings_select" on public.library_ratings;
create policy "library_ratings_select" on public.library_ratings
  for select using (true);

-- Noter nécessite d'être connecté avec un Compte, et seulement en son
-- propre nom (user_id = auth.uid()).
drop policy if exists "library_ratings_insert" on public.library_ratings;
create policy "library_ratings_insert" on public.library_ratings
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "library_ratings_update" on public.library_ratings;
create policy "library_ratings_update" on public.library_ratings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "library_ratings_delete" on public.library_ratings;
create policy "library_ratings_delete" on public.library_ratings
  for delete to authenticated using (user_id = auth.uid());
