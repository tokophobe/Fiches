-- ============================================================
-- darwin — 11 nov. 2026 : boîtes de la Librairie partagées avec une
-- classe, mises à jour avec la Librairie
-- ============================================================
-- QUOI FAIRE : copier ce fichier dans l'éditeur SQL de Supabase, d'abord
-- dans le projet de TEST (darwin-test), puis dans le projet RÉEL (à
-- n'importe quel moment : sans risque pour l'appli en ligne). « Run ».
-- Le script peut être relancé sans risque (idempotent).
--
-- CONTENU : un enseignant peut partager avec sa classe une boîte de la
-- Librairie (« + Partager » → « Depuis la Librairie »). Jusqu'ici, la
-- classe en recevait une copie figée : quand darwin publiait une nouvelle
-- version ou corrigeait la boîte, les élèves ne la recevaient jamais.
-- Désormais, toute modification d'une boîte de la Librairie (fiches, nom,
-- lien) est recopiée aussitôt dans les classes qui l'ont reçue ; les
-- élèves la reçoivent en direct (script v282).
-- ============================================================
create or replace function public.library_collections_propagate_to_classes()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if new.cards is distinct from old.cards or new.name is distinct from old.name or new.link is distinct from old.link then
    update public.shared_boxes
       set cards = new.cards, subject_name = new.name, link = new.link, updated_at = now()
     where library_collection_id = new.id;
  end if;
  return new;
end;
$f$;
drop trigger if exists library_collections_propagate_to_classes on public.library_collections;
create trigger library_collections_propagate_to_classes after update on public.library_collections
  for each row execute function public.library_collections_propagate_to_classes();
