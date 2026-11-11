-- ============================================================
-- darwin — chantier « publication avec relecture », ÉTAPE B (10 nov. 2026)
-- ============================================================
-- QUOI FAIRE (après publication_relecture_A_migration.sql) :
--   1. Copier tout ce fichier dans l'éditeur SQL de Supabase du projet de
--      TEST (darwin-test), cliquer « Run », puis essayer la copie de test
--      de l'appli (lien Netlify de la demande de fusion).
--   2. Au moment de fusionner la version v278 de l'appli, exécuter le même
--      fichier dans le projet RÉEL. (Avant : l'ancienne appli ne pourrait
--      plus publier ; après sans ce script : la nouvelle appli enverrait des
--      propositions sans que la publication directe soit fermée.)
--   Le script peut être relancé sans risque (idempotent).
--
-- CE QUE ÇA CHANGE (docs/SPECIFICATION.md §7.2) :
--   - plus de publication directe : seul darwin (un administrateur) met une
--     boîte dans la Librairie ou la modifie ; un enseignant envoie une
--     proposition, qui suppose l'accord de licence pour cette boîte ;
--   - un élève ne peut pas envoyer de proposition (compte avec l'usage
--     « enseignant » obligatoire) ;
--   - les boîtes déjà publiées par des enseignants sont « remises en
--     relecture » : retirées de la Librairie (sauf pour leur auteur, qui
--     les voit toujours, et pour ceux qui les avaient déjà prises, qui les
--     gardent) jusqu'à ce que darwin les publie depuis Darwin Admin ;
--   - quand darwin publie une nouvelle version, la boîte réapparaît.
-- ============================================================

-- ---------- 1. Boîtes « en relecture » ----------

alter table public.library_collections add column if not exists review_hold boolean not null default false;

-- La limite d'envois ne s'applique qu'aux utilisateurs connectés (pas à
-- ce script, lancé depuis l'éditeur SQL).
create or replace function public.library_submissions_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;
  perform public.rate_limit_check(
    (select count(distinct coalesce(source_subject_id, id::text)) from public.library_submissions
      where owner_id = new.owner_id and created_at > now() - interval '1 day'
        and coalesce(source_subject_id, '') <> coalesce(new.source_subject_id, '')), 20, 'propositions');
  perform public.rate_limit_check(
    (select count(*) from public.library_submissions
      where owner_id = new.owner_id and created_at > now() - interval '1 day'), 200, 'envois de propositions');
  return new;
end;
$f$;

-- Chaque boîte publiée par un enseignant (pas par darwin) et jamais passée
-- par la relecture devient une proposition « en relecture » qui la vise.
-- Sans effet si le script est relancé (la proposition existe déjà).
do $x$
declare
  c record;
  v_id uuid;
begin
  for c in
    select lc.* from public.library_collections lc
     where not exists (select 1 from public.admins a where a.user_id = lc.owner_id)
       and not exists (select 1 from public.library_submissions s
                        where s.collection_id = lc.id or s.target_collection_id = lc.id)
  loop
    update public.library_collections set review_hold = true where id = c.id;
    insert into public.library_submissions (
      owner_id, owner_first_name, owner_last_name, source_subject_id, name, summary, description,
      taxonomy, tags, cards, link, origin, created_at)
    values (c.owner_id, c.owner_first_name, c.owner_last_name, c.source_subject_id, c.name, c.summary,
            c.description, c.taxonomy, c.tags, c.cards, c.link, 'publish', c.shared_at)
    returning id into v_id;
    -- La boîte visée est fixée ici (la règle automatique ne la retrouve
    -- pas pour une boîte publiée sans identifiant d'origine).
    update public.library_submissions set target_collection_id = c.id where id = v_id;
  end loop;
end
$x$;

-- La Librairie ne montre pas les boîtes en relecture, sauf à leur auteur
-- et à darwin. (Mêmes colonnes qu'avant, dans le même ordre.)
create or replace view public.library_catalog as
 select id, owner_id, owner_first_name, owner_last_name, name, summary, description, level,
        price_tokens, source_subject_id, taxonomy, tags, card_count, shared_at, updated_at, link
   from public.library_collections
  where not review_hold or owner_id = auth.uid() or public.is_admin();

-- ---------- 2. Fin de la publication directe ----------

drop policy if exists library_collections_insert on public.library_collections;
create policy library_collections_insert on public.library_collections
  for insert to authenticated with check (public.is_admin());

-- Ni modification ni suppression par l'auteur : il envoie une nouvelle
-- version (automatique) ou demande le retrait. Les règles « admin »
-- existantes (library_collections_update_admin / _delete_admin) restent.
drop policy if exists library_collections_update on public.library_collections;
drop policy if exists library_collections_delete on public.library_collections;

-- ---------- 3. Propositions : enseignant + accord de licence ----------

drop policy if exists library_submissions_insert_own on public.library_submissions;
create policy library_submissions_insert_own on public.library_submissions
  for insert to authenticated with check (
    owner_id = auth.uid()
    and status = 'pending'
    and (public.is_admin() or (
      coalesce(auth.jwt() -> 'user_metadata' -> 'usages', '[]'::jsonb) ? 'enseignant'
      and source_subject_id is not null
      and exists (select 1 from public.library_license_acceptances a
                   where a.owner_id = auth.uid() and a.source_subject_id = library_submissions.source_subject_id))));

-- ---------- 4. Publier lève la mise en relecture ----------

create or replace function public.library_collections_release_hold()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if new.status = 'published' and old.status is distinct from 'published' and new.collection_id is not null then
    update public.library_collections set review_hold = false where id = new.collection_id and review_hold;
  end if;
  return new;
end;
$f$;
drop trigger if exists library_collections_release_hold on public.library_submissions;
create trigger library_collections_release_hold after update of status on public.library_submissions
  for each row execute function public.library_collections_release_hold();

-- ---------- Vérification (facultatif) ----------
-- select count(*) filter (where review_hold) as en_relecture, count(*) as total from public.library_collections;
-- select status, origin, count(*) from public.library_submissions group by 1, 2;
