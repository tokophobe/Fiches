-- ============================================================
-- darwin — chantier « publication avec relecture », ÉTAPE A (9 nov. 2026)
-- ============================================================
-- QUOI FAIRE :
--   1. Copier tout ce fichier dans l'éditeur SQL de Supabase du projet de
--      TEST (darwin-test, tcyvrkiccmlozwkvhpul), cliquer « Run ».
--   2. Si tout va bien, refaire la même chose dans le projet RÉEL
--      (pyqffmweflicfpbniroz).
--   Le script peut être relancé sans risque (idempotent).
--
-- CE QUE ÇA CHANGE POUR LES UTILISATEURS : rien de visible. Cette étape
-- prépare seulement la base ; l'appli s'en servira à l'étape B, Darwin
-- Admin à l'étape C. La publication directe actuelle continue de marcher :
-- elle ne sera fermée qu'à l'étape B (autre script), en même temps que la
-- nouvelle version de l'appli.
--
-- CONTENU (règles : docs/SPECIFICATION.md §7.2 ; mêmes règles côté appli
-- dans js/publication-rules.js, testées) :
--   - propositions (library_submissions) : nouveaux états « à modifier »,
--     « remplacée » (par une version plus récente), « retirée » ; d'où vient
--     la proposition (bouton Publier ou partage avec une classe) ; boîte de
--     la Librairie à mettre à jour quand il s'agit d'une nouvelle version ;
--     licence acceptée (version du texte et date) ;
--   - library_license_acceptances : l'accord de licence, donné UNE fois
--     par boîte. Gardé même si le compte est supprimé (preuve de l'accord) ;
--     ni modifiable ni supprimable par l'utilisateur ;
--   - library_submission_messages : les échanges darwin ↔ enseignant
--     (« Messages de darwin ») ;
--   - automatismes : une nouvelle version d'une boîte remplace la
--     proposition encore ouverte et vise la boîte déjà publiée ;
--   - Darwin Admin : publier (y compris mettre à jour une boîte déjà
--     publiée), demander une modification, refuser — avec un message à
--     l'enseignant quand il doit être prévenu.
-- ============================================================

-- ---------- 1. Propositions : états et nouvelles colonnes ----------

alter table public.library_submissions drop constraint if exists library_submissions_status_check;
alter table public.library_submissions add constraint library_submissions_status_check
  check (status in ('pending', 'changes_requested', 'published', 'rejected', 'superseded', 'withdrawn'));

-- D'où vient la proposition : 'publish' (bouton « Publier dans la
-- Librairie ») ou 'class' (partage avec une classe, seul cas existant avant).
alter table public.library_submissions add column if not exists origin text not null default 'class';
alter table public.library_submissions drop constraint if exists library_submissions_origin_check;
alter table public.library_submissions add constraint library_submissions_origin_check
  check (origin in ('publish', 'class'));

-- Nouvelle version d'une boîte déjà publiée : la boîte de la Librairie à
-- mettre à jour (rempli automatiquement, voir § 4).
alter table public.library_submissions add column if not exists target_collection_id uuid;
do $x$ begin
  alter table public.library_submissions add constraint library_submissions_target_collection_id_fkey
    foreign key (target_collection_id) references public.library_collections(id) on delete set null;
exception when duplicate_object then null; end $x$;

-- Accord de licence repris de library_license_acceptances (§ 4).
alter table public.library_submissions add column if not exists license_version text not null default '';
alter table public.library_submissions add column if not exists license_accepted_at timestamptz;

create index if not exists library_submissions_owner_source_idx
  on public.library_submissions (owner_id, source_subject_id, created_at desc);

-- ---------- 2. Accords de licence (une fois par boîte) ----------

create table if not exists public.library_license_acceptances (
  id uuid primary key default gen_random_uuid(),
  -- Pas de lien vers auth.users : l'accord reste après la suppression du
  -- compte (les boîtes publiées restent dans la Librairie).
  owner_id uuid not null default auth.uid(),
  source_subject_id text not null check (length(source_subject_id) between 1 and 200),
  license_version text not null check (length(license_version) between 1 and 100),
  accepted_at timestamptz not null default now(),
  unique (owner_id, source_subject_id)
);

alter table public.library_license_acceptances enable row level security;

drop policy if exists library_license_acceptances_select on public.library_license_acceptances;
create policy library_license_acceptances_select on public.library_license_acceptances
  for select to authenticated using (owner_id = auth.uid() or public.is_admin());

drop policy if exists library_license_acceptances_insert on public.library_license_acceptances;
create policy library_license_acceptances_insert on public.library_license_acceptances
  for insert to authenticated with check (owner_id = auth.uid());
-- Aucune règle update / delete : un accord ne se modifie ni ne s'efface.
revoke all on public.library_license_acceptances from anon, authenticated;
grant select, insert on public.library_license_acceptances to authenticated;

-- La date est toujours celle du serveur (impossible d'antidater).
create or replace function public.library_license_acceptances_prepare()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  new.accepted_at := now();
  if not public.is_admin() then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$f$;
drop trigger if exists library_license_acceptances_prepare on public.library_license_acceptances;
create trigger library_license_acceptances_prepare before insert on public.library_license_acceptances
  for each row execute function public.library_license_acceptances_prepare();

-- ---------- 3. Messages darwin ↔ enseignant ----------

create table if not exists public.library_submission_messages (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.library_submissions(id) on delete cascade,
  from_admin boolean not null default false,
  -- message : simple message ; changes_requested / rejected /
  -- published_with_changes / withdrawn : décision de darwin ;
  -- withdrawal_request : l'enseignant demande le retrait.
  kind text not null default 'message' check (kind in
    ('message', 'changes_requested', 'rejected', 'published_with_changes', 'withdrawn', 'withdrawal_request')),
  body text not null default '' check (length(body) <= 4000),
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  check (kind <> 'message' or length(trim(body)) >= 1)
);

create index if not exists library_submission_messages_sub_idx
  on public.library_submission_messages (submission_id, created_at);

-- Lire et écrire seulement ; « lu » passe par library_messages_mark_seen.
revoke all on public.library_submission_messages from anon, authenticated;
grant select, insert on public.library_submission_messages to authenticated;

alter table public.library_submission_messages enable row level security;

drop policy if exists library_submission_messages_select on public.library_submission_messages;
create policy library_submission_messages_select on public.library_submission_messages
  for select to authenticated using (
    public.is_admin()
    or exists (select 1 from public.library_submissions s
                where s.id = submission_id and s.owner_id = auth.uid()));

-- L'enseignant écrit seulement sur SES propositions : un message ou une
-- demande de retrait.
drop policy if exists library_submission_messages_insert_owner on public.library_submission_messages;
create policy library_submission_messages_insert_owner on public.library_submission_messages
  for insert to authenticated with check (
    from_admin = false
    and kind in ('message', 'withdrawal_request')
    and exists (select 1 from public.library_submissions s
                 where s.id = submission_id and s.owner_id = auth.uid()));

drop policy if exists library_submission_messages_insert_admin on public.library_submission_messages;
create policy library_submission_messages_insert_admin on public.library_submission_messages
  for insert to authenticated with check (public.is_admin() and from_admin = true);

create or replace function public.library_submission_messages_prepare()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  new.created_at := now();
  new.seen_at := null;
  if not public.is_admin() then
    new.from_admin := false;
    perform public.rate_limit_check(
      (select count(*) from public.library_submission_messages m
         join public.library_submissions s on s.id = m.submission_id
        where s.owner_id = auth.uid() and not m.from_admin and m.created_at > now() - interval '1 day'),
      50, 'messages à darwin');
  end if;
  return new;
end;
$f$;
drop trigger if exists library_submission_messages_prepare on public.library_submission_messages;
create trigger library_submission_messages_prepare before insert on public.library_submission_messages
  for each row execute function public.library_submission_messages_prepare();

-- Marquer comme lus : l'enseignant les messages de darwin, darwin ceux
-- des enseignants.
create or replace function public.library_messages_mark_seen(p_ids uuid[])
returns void language sql security definer set search_path = public as $f$
  update public.library_submission_messages m
     set seen_at = now()
   where m.id = any(p_ids) and m.seen_at is null
     and ((m.from_admin and exists (select 1 from public.library_submissions s
                                     where s.id = m.submission_id and s.owner_id = auth.uid()))
          or (not m.from_admin and public.is_admin()));
$f$;
grant execute on function public.library_messages_mark_seen(uuid[]) to authenticated;

-- ---------- 4. Automatismes à l'envoi d'une proposition ----------

create or replace function public.library_submissions_prepare()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if not public.is_admin() then
    -- Une proposition arrive toujours « en relecture », sans décision.
    new.status := 'pending';
    new.collection_id := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.admin_note := '';
  end if;
  -- Nouvelle version d'une boîte déjà publiée : la boîte de la Librairie
  -- à mettre à jour est retrouvée par le serveur (jamais choisie par
  -- l'appli, pour qu'on ne puisse pas viser la boîte de quelqu'un d'autre).
  new.target_collection_id := null;
  if new.source_subject_id is not null then
    new.target_collection_id := coalesce(
      (select s.collection_id from public.library_submissions s
         join public.library_collections c on c.id = s.collection_id
        where s.owner_id = new.owner_id and s.source_subject_id = new.source_subject_id
          and s.status = 'published'
        order by s.reviewed_at desc nulls last limit 1),
      (select c.id from public.library_collections c
        where c.owner_id = new.owner_id and c.source_subject_id = new.source_subject_id
        order by c.shared_at desc limit 1));
    -- Accord de licence donné pour cette boîte (obligatoire à l'étape B).
    select a.license_version, a.accepted_at
      into new.license_version, new.license_accepted_at
      from public.library_license_acceptances a
     where a.owner_id = new.owner_id and a.source_subject_id = new.source_subject_id;
    new.license_version := coalesce(new.license_version, '');
  end if;
  return new;
end;
$f$;
drop trigger if exists library_submissions_prepare on public.library_submissions;
create trigger library_submissions_prepare before insert on public.library_submissions
  for each row execute function public.library_submissions_prepare();

-- La nouvelle version remplace la proposition encore ouverte de la même
-- boîte (« remplacée »).
create or replace function public.library_submissions_supersede()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if new.source_subject_id is not null then
    update public.library_submissions
       set status = 'superseded', updated_at = now()
     where owner_id = new.owner_id and source_subject_id = new.source_subject_id
       and id <> new.id and status in ('pending', 'changes_requested');
  end if;
  return new;
end;
$f$;
drop trigger if exists library_submissions_supersede on public.library_submissions;
create trigger library_submissions_supersede after insert on public.library_submissions
  for each row execute function public.library_submissions_supersede();

-- Limite d'envois : les nouvelles versions automatiques d'une même boîte
-- ne doivent pas bloquer l'enseignant. 20 boîtes différentes et 200 envois
-- au plus par jour.
create or replace function public.library_submissions_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if public.is_admin() then
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

-- ---------- 5. Décisions de darwin (Darwin Admin) ----------

-- Publier : nouvelle boîte, ou mise à jour de la boîte déjà publiée.
-- p_patch : corrections de darwin (name, summary, description, taxonomy,
-- tags, cards, link) et note (message à l'enseignant).
create or replace function public.admin_publish_submission(p_id uuid, p_patch jsonb)
returns uuid language plpgsql security definer set search_path = public as $f$
declare
  sub public.library_submissions;
  new_id uuid;
  v_name text;
  v_tax jsonb;
  v_cards jsonb;
  v_note text;
begin
  perform public.admin_assert();
  select * into sub from public.library_submissions where id = p_id for update;
  if not found then
    raise exception 'Proposition introuvable';
  end if;
  if sub.status not in ('pending', 'changes_requested') then
    raise exception 'Proposition déjà traitée (%)', sub.status;
  end if;
  p_patch := coalesce(p_patch, '{}'::jsonb);
  v_name := coalesce(nullif(trim(p_patch ->> 'name'), ''), sub.name);
  v_tax := coalesce(p_patch -> 'taxonomy', sub.taxonomy);
  v_cards := coalesce(p_patch -> 'cards', sub.cards);
  v_note := coalesce(trim(p_patch ->> 'note'), '');

  if sub.target_collection_id is not null
     and exists (select 1 from public.library_collections where id = sub.target_collection_id) then
    -- Nouvelle version : la boîte publiée est mise à jour (ceux qui l'ont
    -- prise reçoivent la nouvelle version, comme pour une correction).
    update public.library_collections set
      name = v_name,
      cards = v_cards,
      level = coalesce(v_tax -> 'niveau' ->> 'label', level),
      summary = coalesce(p_patch ->> 'summary', sub.summary),
      description = coalesce(p_patch ->> 'description', sub.description),
      taxonomy = v_tax,
      tags = coalesce((select array_agg(x) from jsonb_array_elements_text(p_patch -> 'tags') x), sub.tags),
      link = case when p_patch ? 'link' then nullif(trim(p_patch ->> 'link'), '') else sub.link end,
      updated_at = now()
    where id = sub.target_collection_id;
    new_id := sub.target_collection_id;
  else
    insert into public.library_collections (
      owner_id, owner_email, owner_first_name, owner_last_name, name, cards, level,
      price_tokens, summary, description, source_subject_id, taxonomy, tags, link)
    values (
      sub.owner_id,
      coalesce((select email from auth.users where id = sub.owner_id), ''),
      sub.owner_first_name, sub.owner_last_name, v_name,
      v_cards,
      coalesce(v_tax -> 'niveau' ->> 'label', ''),
      0,
      coalesce(p_patch ->> 'summary', sub.summary),
      coalesce(p_patch ->> 'description', sub.description),
      sub.source_subject_id,
      v_tax,
      coalesce((select array_agg(x) from jsonb_array_elements_text(p_patch -> 'tags') x), sub.tags),
      case when p_patch ? 'link' then nullif(trim(p_patch ->> 'link'), '') else sub.link end)
    returning id into new_id;
  end if;

  update public.library_submissions
     set status = 'published', collection_id = new_id, name = v_name,
         reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now(),
         admin_note = case when v_note <> '' then v_note else admin_note end
   where id = p_id;

  -- Discrétion : l'enseignant n'est prévenu que si darwin a changé ses
  -- fiches, ou s'il lui laisse un mot.
  if v_cards is distinct from sub.cards then
    insert into public.library_submission_messages (submission_id, from_admin, kind, body)
    values (p_id, true, 'published_with_changes', v_note);
  elsif v_note <> '' then
    insert into public.library_submission_messages (submission_id, from_admin, kind, body)
    values (p_id, true, 'message', v_note);
  end if;

  perform public.admin_log('submission.publish', p_id::text,
    jsonb_build_object('collection', new_id, 'name', v_name, 'update', sub.target_collection_id is not null));
  return new_id;
end;
$f$;

-- Demander une modification à l'enseignant (avec un message).
create or replace function public.admin_request_submission_changes(p_id uuid, p_note text)
returns void language plpgsql security definer set search_path = public as $f$
begin
  perform public.admin_assert();
  if coalesce(trim(p_note), '') = '' then
    raise exception 'Écris un message pour expliquer la modification demandée';
  end if;
  update public.library_submissions
     set status = 'changes_requested', admin_note = p_note,
         reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
   where id = p_id and status = 'pending';
  if not found then
    raise exception 'Proposition introuvable ou déjà traitée';
  end if;
  insert into public.library_submission_messages (submission_id, from_admin, kind, body)
  values (p_id, true, 'changes_requested', p_note);
  perform public.admin_log('submission.changes_requested', p_id::text, jsonb_build_object('note', p_note));
end;
$f$;
grant execute on function public.admin_request_submission_changes(uuid, text) to authenticated;

-- Refuser (avec un message à l'enseignant).
create or replace function public.admin_reject_submission(p_id uuid, p_note text)
returns void language plpgsql security definer set search_path = public as $f$
begin
  perform public.admin_assert();
  update public.library_submissions
     set status = 'rejected', admin_note = coalesce(p_note, ''),
         reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
   where id = p_id and status in ('pending', 'changes_requested');
  if not found then
    raise exception 'Proposition introuvable ou déjà traitée';
  end if;
  insert into public.library_submission_messages (submission_id, from_admin, kind, body)
  values (p_id, true, 'rejected', coalesce(p_note, ''));
  perform public.admin_log('submission.reject', p_id::text, jsonb_build_object('note', p_note));
end;
$f$;

-- ---------- Vérification (facultatif) ----------
-- select status, origin, count(*) from public.library_submissions group by 1, 2;
