-- ============================================================
-- Fiches — Round 44 : boîtes à réviser des évènements de classe.
--
-- Quand un enseignant lie une ou plusieurs boîtes à un évènement partagé
-- avec une classe, la liste des boîtes partagées correspondantes
-- (ids de public.shared_boxes) est envoyée avec l'évènement : les élèves
-- voient alors ces boîtes dans l'évènement, dans « Révisions
-- conseillées », et leurs fiches passent en mode sprint.
--
-- À exécuter UNE FOIS dans l'éditeur SQL de ton projet Supabase.
-- Idempotent : peut être relancé sans risque. Les règles d'accès (RLS)
-- de shared_events ne changent pas.
-- ============================================================

alter table public.shared_events
  add column if not exists box_ids jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
