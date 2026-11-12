-- ============================================================
-- darwin — chantier « publication avec relecture », ÉTAPE E (v287, 12 nov. 2026)
-- ============================================================
-- QUOI FAIRE :
--   1. Copier tout ce fichier dans l'éditeur SQL de Supabase du projet de
--      TEST (darwin-test), cliquer « Run », puis essayer la copie de test
--      de l'appli (lien Netlify de la demande de fusion v287).
--   2. Au moment de fusionner la v287, exécuter le même fichier dans le
--      projet RÉEL.
--   Le script peut être relancé sans risque (idempotent).
--
-- CE QUE ÇA CHANGE (docs/SPECIFICATION.md §7.2, étape E) :
--   1. « Signaler cette boîte » : un signalement peut porter sur toute la
--      boîte (colonne `scope` = 'box') et plus seulement sur une fiche.
--   2. Les signalements d'une boîte de la LIBRAIRIE vont à darwin (Darwin
--      Admin), même si la boîte vient d'un enseignant : l'enseignant ne les
--      voit plus. Ceux d'une boîte partagée avec une classe vont toujours
--      à l'enseignant qui l'a partagée.
--   3. Réglage de Darwin Admin « Librairie : seulement les boîtes darwin »
--      (activé tant qu'il n'a jamais été touché) : la Librairie ne montre
--      que les boîtes de darwin. Un enseignant voit toujours ses propres
--      boîtes publiées ; darwin voit tout.
--   4. Suppression d'un compte enseignant : ses boîtes publiées dans la
--      Librairie restent (licence irrévocable). Elles passent au nom de
--      darwin, sans aucune donnée personnelle de l'ancien auteur.
-- ============================================================

-- ---------- 1. Signalement d'une boîte entière ----------

alter table public.card_reports add column if not exists scope text not null default 'card';
alter table public.card_reports drop constraint if exists card_reports_scope_check;
alter table public.card_reports add constraint card_reports_scope_check check (scope in ('card', 'box'));

-- ---------- 2. Signalements de la Librairie → darwin ----------

-- Lire : celui qui a signalé ; darwin (tout) ; l'enseignant seulement pour
-- les boîtes partagées avec ses classes.
drop policy if exists card_reports_select on public.card_reports;
create policy card_reports_select on public.card_reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin() or (author_id = auth.uid() and source_kind = 'class'));

-- Traiter (lu, traité, réponse) : l'enseignant pour ses classes, darwin
-- pour la Librairie.
drop policy if exists card_reports_update on public.card_reports;
create policy card_reports_update on public.card_reports
  for update to authenticated
  using ((author_id = auth.uid() and source_kind = 'class') or (public.is_admin() and source_kind = 'library'))
  with check ((author_id = auth.uid() and source_kind = 'class') or (public.is_admin() and source_kind = 'library'));

drop policy if exists card_reports_delete on public.card_reports;
create policy card_reports_delete on public.card_reports
  for delete to authenticated
  using ((author_id = auth.uid() and source_kind = 'class') or (public.is_admin() and source_kind = 'library'));

-- Liste de Darwin Admin : même chose qu'avant, plus la portée (fiche ou
-- boîte entière). Le type de retour change : on supprime puis recrée.
drop function if exists public.admin_reports(text, integer, integer);
create function public.admin_reports(p_status text default 'open', p_limit integer default 50, p_offset integer default 0)
returns table(id uuid, created_at timestamptz, source_kind text, source_id text, box_name text, card_question text,
              card_answer text, message text, resolved boolean, resolved_at timestamptz, resolved_question text,
              resolved_answer text, author_reply text, reporter_id uuid, reporter_name text, reporter_email text,
              author_id uuid, author_name text, author_email text, scope text, total bigint)
language plpgsql stable security definer set search_path = public as $f$
begin
  perform public.admin_assert();
  return query
  with f as (
    select r.*, count(*) over () as n_total
      from public.card_reports r
     where p_status = 'all' or (p_status = 'done' and r.resolved) or (coalesce(p_status, 'open') = 'open' and not r.resolved)
     order by r.created_at desc
     limit greatest(1, least(coalesce(p_limit, 50), 500)) offset greatest(0, coalesce(p_offset, 0))
  )
  select f.id, f.created_at, f.source_kind, f.source_id, f.box_name, f.card_question, f.card_answer, f.message,
         f.resolved, f.resolved_at, f.resolved_question, f.resolved_answer, f.author_reply,
         f.reporter_id, public.admin_user_label(f.reporter_id), coalesce(ru.email, '')::text,
         f.author_id, public.admin_user_label(f.author_id), coalesce(au.email, '')::text, f.scope, f.n_total
    from f
    left join auth.users ru on ru.id = f.reporter_id
    left join auth.users au on au.id = f.author_id
   order by f.created_at desc;
end;
$f$;
revoke all on function public.admin_reports(text, integer, integer) from public, anon;
grant execute on function public.admin_reports(text, integer, integer) to authenticated;

-- darwin répond à un signalement de la Librairie et/ou le marque traité.
-- La réponse est vue par la personne qui a signalé (comme celle d'un
-- enseignant). Une correction de la boîte se fait par les moyens habituels
-- (proposition / boîte publiée) : l'enseignant la reçoit alors dans
-- « Messages de darwin ».
create or replace function public.admin_handle_report(p_id uuid, p_reply text, p_resolve boolean)
returns void language plpgsql security definer set search_path = public as $f$
declare
  r public.card_reports;
begin
  perform public.admin_assert();
  select * into r from public.card_reports where id = p_id;
  if not found then
    raise exception 'not_found';
  end if;
  if r.source_kind <> 'library' then
    raise exception 'class_report';   -- traité par l'enseignant de la classe
  end if;
  update public.card_reports
     set author_reply = case when nullif(btrim(coalesce(p_reply, '')), '') is null then author_reply else left(btrim(p_reply), 2000) end,
         author_reply_at = case when nullif(btrim(coalesce(p_reply, '')), '') is null then author_reply_at else now() end,
         read_at = coalesce(read_at, now()),
         resolved = resolved or coalesce(p_resolve, false),
         resolved_at = case when coalesce(p_resolve, false) and not resolved then now() else resolved_at end
   where id = p_id;
  perform public.admin_log('report.handle', p_id::text,
    jsonb_build_object('reply', nullif(btrim(coalesce(p_reply, '')), '') is not null, 'resolve', coalesce(p_resolve, false)));
end;
$f$;
revoke all on function public.admin_handle_report(uuid, text, boolean) from public, anon;
grant execute on function public.admin_handle_report(uuid, text, boolean) to authenticated;

-- ---------- 3. « Librairie : seulement les boîtes darwin » ----------

-- Lu dans les réglages globaux de Darwin Admin ; vrai tant que darwin ne
-- l'a pas désactivé.
create or replace function public.library_darwin_only()
returns boolean language sql stable security definer set search_path = public as $f$
  select coalesce((select (d.settings -> 'libraryPolicy' ->> 'darwinOnly')::boolean
                     from public.dev_settings_public d where d.id = 'global'), true);
$f$;
revoke all on function public.library_darwin_only() from public;
grant execute on function public.library_darwin_only() to anon, authenticated;

-- Catalogue : mêmes colonnes qu'en v280 ; une condition de plus.
create or replace view public.library_catalog as
 select id, owner_id, owner_first_name, owner_last_name, name, summary, description, level,
        price_tokens, source_subject_id, taxonomy, tags, card_count, shared_at, updated_at, link,
        author_mode, case when author_mode = 'anonymous' then '' else author_label end as author_label
   from public.library_collections lc
  where (not lc.review_hold or lc.owner_id = auth.uid() or public.is_admin())
    and (lc.owner_id = auth.uid() or public.is_admin() or not public.library_darwin_only()
         or exists (select 1 from public.admins a where a.user_id = lc.owner_id));
grant select on public.library_catalog to anon, authenticated;

-- ---------- 4. Boîtes publiées gardées à la suppression d'un compte ----------

-- Juste avant la suppression d'un compte (par lui-même ou par darwin), ses
-- boîtes publiées dans la Librairie passent au premier compte darwin, sans
-- nom, e-mail ni mention d'auteur. Les boîtes encore en relecture
-- disparaissent avec le compte, comme avant. Les signalements de ces
-- boîtes suivent.
create or replace function public.keep_published_boxes_on_user_delete()
returns trigger language plpgsql security definer set search_path = public as $f$
declare
  v_admin uuid;
begin
  select a.user_id into v_admin from public.admins a where a.user_id <> old.id order by a.added_at, a.user_id limit 1;
  if v_admin is null then
    return old;
  end if;
  update public.card_reports r
     set author_id = v_admin
   where r.author_id = old.id and r.source_kind = 'library'
     and exists (select 1 from public.library_collections lc
                  where lc.id::text = r.source_id and lc.owner_id = old.id and not lc.review_hold);
  update public.library_collections
     set owner_id = v_admin, owner_email = '', owner_first_name = '', owner_last_name = '',
         author_mode = 'anonymous', author_label = ''
   where owner_id = old.id and not review_hold;
  return old;
end;
$f$;
revoke all on function public.keep_published_boxes_on_user_delete() from public, anon, authenticated;

drop trigger if exists keep_published_boxes_on_user_delete on auth.users;
create trigger keep_published_boxes_on_user_delete
  before delete on auth.users
  for each row execute function public.keep_published_boxes_on_user_delete();

notify pgrst, 'reload schema';
