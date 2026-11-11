-- ============================================================
-- darwin — v282 (11 nov. 2026) : boîtes de classe à jour en direct
-- ============================================================
-- QUOI FAIRE : copier ce fichier dans l'éditeur SQL de Supabase, d'abord
-- dans le projet de TEST (darwin-test), puis dans le projet RÉEL (à
-- n'importe quel moment : sans risque pour l'appli en ligne). « Run ».
-- Le script peut être relancé sans risque (idempotent).
--
-- CONTENU : la table des boîtes partagées avec les classes est diffusée
-- en temps réel. Quand un enseignant ajoute ou modifie une boîte de sa
-- classe, les élèves la reçoivent tout de suite (avant : seulement en
-- rouvrant l'appli ou la page « Mes classes »). La base ne transmet à
-- chacun que les boîtes des classes dont il fait partie (règles d'accès
-- existantes).
-- ============================================================
do $x$ begin
  alter publication supabase_realtime add table public.shared_boxes;
exception when duplicate_object or undefined_object then null; end $x$;
