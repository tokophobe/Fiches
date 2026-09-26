-- ============================================================
-- Fiches — Round 20, item 2/5/6 : Bibliothèque — résumé + description
-- d'une collection, lien vers la boîte d'origine (empêche de partager
-- deux fois la même boîte), et suppression d'une collection par le
-- développeur (Stéphane).
--
-- À exécuter UNE FOIS dans l'éditeur SQL de ton projet Supabase, APRÈS
-- avoir déjà exécuté library_collections_schema.sql et
-- library_collections_ratings_level_price_migration.sql.
-- Idempotent : peut être relancé sans risque.
-- ============================================================

-- Résumé (une phrase, affiché dans la liste/le détail) et description
-- (plus longue, affichée uniquement sur la page de détail).
alter table public.library_collections
  add column if not exists summary text not null default '';
alter table public.library_collections
  add column if not exists description text not null default '';

-- Round 20, item 5 : lien vers la boîte d'origine (côté appli), pour
-- pouvoir vérifier AVANT de publier qu'on n'a pas déjà partagé cette
-- même boîte (évite les doublons dans la Bibliothèque). Nullable : les
-- collections partagées avant ce round n'ont pas cette information, et
-- restent partageables une fois "à nouveau" sans que ça bloque quoi que
-- ce soit côté base (le contrôle se fait côté appli, avant l'insertion).
alter table public.library_collections
  add column if not exists source_subject_id text;

create index if not exists library_collections_owner_source_idx
  on public.library_collections (owner_id, source_subject_id);

-- Round 20, item 6 : le développeur (Stéphane) peut supprimer N'IMPORTE
-- QUELLE collection de la Bibliothèque (modération), en plus de la
-- policy déjà existante qui permet à chaque auteur de supprimer les
-- siennes (les policies pour une même opération se cumulent avec OU).
drop policy if exists "library_collections_delete_dev" on public.library_collections;
create policy "library_collections_delete_dev" on public.library_collections
  for delete using ((auth.jwt() ->> 'email') = 'stephane.vezain@gmail.com');
