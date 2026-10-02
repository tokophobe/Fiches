-- ============================================================
-- Fiches — Round 26, item 2 : identité du professeur sur les évènements
-- partagés avec une classe (affichée côté élève : « classe · par Prénom
-- Nom »).
--
-- À exécuter UNE FOIS dans l'éditeur SQL de ton projet Supabase.
-- Idempotent : peut être relancé sans risque.
--
-- Sans cette migration, le partage d'évènements continue de fonctionner
-- (l'appli réessaie sans le nom), mais l'élève ne voit que la classe.
-- Les évènements déjà partagés sont complétés automatiquement à la
-- prochaine ouverture de l'appli par le professeur.
-- ============================================================

alter table public.shared_events
  add column if not exists shared_by_name text not null default '';

notify pgrst, 'reload schema';
