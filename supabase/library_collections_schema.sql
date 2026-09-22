-- ============================================================
-- Fiches — Round 8 : Bibliothèque — collections de fiches partagées
-- PUBLIQUEMENT (visibles/prenables par n'importe quel utilisateur, pas
-- seulement les membres d'une classe précise — contrairement à
-- shared_boxes, qui reste réservé à une classe). "Prendre" une collection
-- côté client fait une COPIE INDÉPENDANTE dans Mes collections : cette
-- table n'a donc besoin d'aucun mécanisme de mise à jour en direct, elle
-- ne fait que stocker chaque collection publiée telle quelle au moment du
-- partage.
--
-- À exécuter UNE FOIS dans l'éditeur SQL de ton projet Supabase.
-- Idempotent : peut être relancé sans risque.
-- ============================================================

create table if not exists public.library_collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  -- Dénormalisé : affiché tel quel dans la Bibliothèque ("par email@...."),
  -- jamais utilisé pour une vérification de droits (voir policies).
  owner_email text not null default '',
  name text not null,
  cards jsonb not null default '[]'::jsonb,
  shared_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists library_collections_shared_at_idx
  on public.library_collections (shared_at desc);

alter table public.library_collections enable row level security;

-- Lecture PUBLIQUE (y compris sans compte) : la Bibliothèque doit être
-- consultable par tout le monde, comme n'importe quelle bibliothèque.
drop policy if exists "library_collections_select" on public.library_collections;
create policy "library_collections_select" on public.library_collections
  for select using (true);

-- Publier une collection nécessite d'être connecté avec un Compte (sert
-- d'identité/attribution — même principe que le partage avec une classe).
drop policy if exists "library_collections_insert" on public.library_collections;
create policy "library_collections_insert" on public.library_collections
  for insert to authenticated with check (owner_id = auth.uid());

-- Modifier/retirer sa propre collection publiée reste possible plus tard
-- (pas encore d'UI dédiée dans l'appli pour l'instant, réservé pour un
-- futur incrément — "gérer mes collections partagées").
drop policy if exists "library_collections_update" on public.library_collections;
create policy "library_collections_update" on public.library_collections
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "library_collections_delete" on public.library_collections;
create policy "library_collections_delete" on public.library_collections
  for delete to authenticated using (owner_id = auth.uid());
