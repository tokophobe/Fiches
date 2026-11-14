-- ==================================================================
-- v293 — Librairie rangée par chapitres du programme
-- ==================================================================
-- Quoi faire : copier tout ce fichier dans l'éditeur SQL de Supabase et
-- cliquer « Run », D'ABORD dans la base de TEST, puis dans la base RÉELLE.
-- Le script peut être relancé sans risque.
--
-- À exécuter APRÈS supabase/v287_migration.sql (il reprend la vue
-- `library_catalog` de la v287 en y ajoutant une colonne à la fin).
--
-- Ce que ça fait :
--   1. Ajoute aux boîtes de la Librairie la colonne `programme_chapter` :
--      le chapitre du programme choisi par darwin pour une boîte
--      d'enseignant (« niveau|matière|titre du chapitre », vide = « Autres
--      chapitres »). Les boîtes toutes prêtes n'en ont pas besoin : elles
--      sont rangées d'après le programme (data/chapitres.json).
--   2. Montre cette colonne dans la liste publique `library_catalog`.
--   3. Crée `admin_set_collection_chapter`, que seul darwin peut appeler
--      (Darwin Admin, page d'une proposition).
-- ==================================================================

-- 1. Colonne
alter table public.library_collections add column if not exists programme_chapter text;

-- 2. Liste publique (identique à la v287, colonne ajoutée à la fin)
create or replace view public.library_catalog as
 select id, owner_id, owner_first_name, owner_last_name, name, summary, description, level,
        price_tokens, source_subject_id, taxonomy, tags, card_count, shared_at, updated_at, link,
        author_mode, case when author_mode = 'anonymous' then '' else author_label end as author_label,
        programme_chapter
   from public.library_collections lc
  where (not lc.review_hold or lc.owner_id = auth.uid() or public.is_admin())
    and (lc.owner_id = auth.uid() or public.is_admin() or not public.library_darwin_only()
         or exists (select 1 from public.admins a where a.user_id = lc.owner_id));
grant select on public.library_catalog to anon, authenticated;

-- 3. Choix du chapitre par darwin
create or replace function public.admin_set_collection_chapter(p_collection_id uuid, p_chapter text)
returns void language plpgsql security definer set search_path = public as $f$
begin
  if not public.is_admin() then
    raise exception 'Réservé à darwin';
  end if;
  update public.library_collections
     set programme_chapter = nullif(trim(coalesce(p_chapter, '')), '')
   where id = p_collection_id;
end;
$f$;
revoke all on function public.admin_set_collection_chapter(uuid, text) from public, anon;
grant execute on function public.admin_set_collection_chapter(uuid, text) to authenticated;
