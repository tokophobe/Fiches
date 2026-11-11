-- ============================================================
-- darwin — v280 (11 nov. 2026) : messagerie en temps réel, licence en
-- deux accords, mention de l'auteur, corrections d'une boîte publiée,
-- réponse automatique aux demandes de retrait.
-- ============================================================
-- QUOI FAIRE (après les scripts publication_relecture A, B et D) :
--   1. Copier tout ce fichier dans l'éditeur SQL de Supabase du projet de
--      TEST (darwin-test), cliquer « Run », puis essayer la copie de test.
--   2. Au moment de fusionner la version v280, faire de même dans le
--      projet RÉEL.
--   Le script peut être relancé sans risque (idempotent).
--
-- CONTENU (docs/SPECIFICATION.md §6.5, §7.2 ; décisions Q18 du 11 nov.) :
--   1. Temps réel : les nouveaux messages de classe et les messages
--      darwin ↔ enseignant arrivent tout de suite chez le destinataire
--      (avant, la table des messages de classe n'était pas diffusée : il
--      fallait changer de page ou recharger l'appli).
--   2. Licence : texte intégral de chaque version gardé dans la base
--      (avec son empreinte) ; l'accord d'une boîte enregistre aussi
--      l'autorisation pour l'abonnement (2e case) et l'empreinte de la
--      boîte. Proposer une boîte exige les deux accords.
--   3. Mention de l'auteur : anonyme par défaut, ou nom / pseudonyme,
--      modifiable à tout moment par l'auteur.
--   4. Darwin Admin peut corriger une boîte déjà publiée.
--   5. Demande de retrait : réponse automatique à l'enseignant.
-- ============================================================

-- ---------- 1. Temps réel ----------
do $x$ begin
  alter publication supabase_realtime add table public.class_messages;
exception when duplicate_object or undefined_object then null; end $x$;
do $x$ begin
  alter publication supabase_realtime add table public.library_submission_messages;
exception when duplicate_object or undefined_object then null; end $x$;

-- ---------- 2. Textes de licence et accords ----------
create table if not exists public.library_license_texts (
  version text primary key,
  body text not null,
  sha256 text not null,
  created_at timestamptz not null default now()
);
alter table public.library_license_texts enable row level security;
drop policy if exists library_license_texts_select on public.library_license_texts;
create policy library_license_texts_select on public.library_license_texts
  for select to anon, authenticated using (true);
revoke all on public.library_license_texts from anon, authenticated;
grant select on public.library_license_texts to anon, authenticated;

-- Texte affiché dans l'appli à partir de la v280 (le même que dans
-- js/app.js, LICENSE_TEXT). Une nouvelle version = une nouvelle ligne,
-- jamais une modification.
insert into public.library_license_texts (version, body, sha256)
select v, b, encode(sha256(convert_to(b, 'UTF8')), 'hex')
from (values ('2026-11-11', $txt$1. Licence de partage (obligatoire pour partager ou publier)
En partageant cette boîte avec une classe ou en la publiant, tu accordes à darwin, pour cette boîte et ses versions successives que tu partages, une licence non exclusive, gratuite et mondiale, pour toute la durée des droits d'auteur : darwin peut la reproduire, l'héberger, la corriger, la compléter, la traduire, la réorganiser, la classer et la mettre à disposition de ses utilisateurs dans sa Librairie, directement ou par ses prestataires. Ces adaptations améliorent la qualité, l'exactitude ou l'organisation de la boîte ; elles en respectent le sens et la finalité et ne la dénaturent pas. Cette licence n'est pas une renonciation à tes droits moraux.
Ta boîte reste à toi : tu peux continuer à l'utiliser, à la modifier et à la diffuser ailleurs. Par défaut ton nom n'est pas affiché ; tu peux demander à tout moment qu'il le soit (ou un pseudonyme).
Tu confirmes avoir le droit de la partager : contenu écrit par toi ou utilisé avec l'autorisation de ses auteurs (citer une source ne suffit pas) ; si tu es agent public, dans le respect des droits de ton employeur sur les contenus créés dans le cadre de tes fonctions.

2. Abonnement darwin (obligatoire pour partager ou publier)
La Librairie est accessible aux abonnés de darwin : l'abonnement donne accès à toutes les boîtes publiées, sans achat à l'unité. Tu autorises gratuitement darwin à y proposer ta boîte et tu reconnais que darwin tire des revenus de ses abonnements sans rémunération attachée à ta boîte, sous réserve des dispositions légales impératives.$txt$)) t(v, b)
on conflict (version) do nothing;

alter table public.library_license_acceptances add column if not exists commercial_consent boolean not null default false;
alter table public.library_license_acceptances add column if not exists box_hash text not null default '';
-- Un nouvel accord peut être donné pour une nouvelle version du texte.
alter table public.library_license_acceptances drop constraint if exists library_license_acceptances_owner_id_source_subject_id_key;
do $x$ begin
  alter table public.library_license_acceptances add constraint library_license_acceptances_owner_source_version_key
    unique (owner_id, source_subject_id, license_version);
exception when duplicate_object or duplicate_table then null; end $x$;

-- Un nouvel accord cite forcément une version de texte gardée dans la base
-- (« not valid » : les accords plus anciens ne sont pas vérifiés).
do $x$ begin
  alter table public.library_license_acceptances add constraint library_license_acceptances_version_fkey
    foreign key (license_version) references public.library_license_texts(version) not valid;
exception when duplicate_object then null; end $x$;

-- Proposer une boîte : accord avec l'autorisation « abonnement ».
drop policy if exists library_submissions_insert_own on public.library_submissions;
create policy library_submissions_insert_own on public.library_submissions
  for insert to authenticated with check (
    owner_id = auth.uid()
    and status = 'pending'
    and (public.is_admin() or (
      coalesce(auth.jwt() -> 'user_metadata' -> 'usages', '[]'::jsonb) ? 'enseignant'
      and source_subject_id is not null
      and exists (select 1 from public.library_license_acceptances a
                   where a.owner_id = auth.uid()
                     and a.source_subject_id = library_submissions.source_subject_id
                     and a.commercial_consent))));

-- La proposition retient l'accord le plus récent pour cette boîte.
create or replace function public.library_submissions_prepare()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if not public.is_admin() then
    new.status := 'pending';
    new.collection_id := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.admin_note := '';
  end if;
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
    select a.license_version, a.accepted_at
      into new.license_version, new.license_accepted_at
      from public.library_license_acceptances a
     where a.owner_id = new.owner_id and a.source_subject_id = new.source_subject_id
     order by a.accepted_at desc limit 1;
    new.license_version := coalesce(new.license_version, '');
  end if;
  return new;
end;
$f$;

-- ---------- 3. Mention de l'auteur ----------
alter table public.library_submissions add column if not exists author_mode text not null default 'anonymous';
alter table public.library_submissions add column if not exists author_label text not null default '';
alter table public.library_collections add column if not exists author_mode text not null default 'anonymous';
alter table public.library_collections add column if not exists author_label text not null default '';
alter table public.library_submissions drop constraint if exists library_submissions_author_mode_check;
alter table public.library_submissions add constraint library_submissions_author_mode_check
  check (author_mode in ('anonymous', 'name', 'pseudonym') and length(author_label) <= 80);
alter table public.library_collections drop constraint if exists library_collections_author_mode_check;
alter table public.library_collections add constraint library_collections_author_mode_check
  check (author_mode in ('anonymous', 'name', 'pseudonym') and length(author_label) <= 80);

-- Catalogue : mêmes colonnes qu'avant, plus la mention de l'auteur (à la fin).
create or replace view public.library_catalog as
 select id, owner_id, owner_first_name, owner_last_name, name, summary, description, level,
        price_tokens, source_subject_id, taxonomy, tags, card_count, shared_at, updated_at, link,
        author_mode, case when author_mode = 'anonymous' then '' else author_label end as author_label
   from public.library_collections
  where not review_hold or owner_id = auth.uid() or public.is_admin();

-- L'auteur choisit (et change quand il veut) la mention de son nom pour
-- une de ses boîtes : propositions et boîte publiée.
create or replace function public.set_box_author_mention(p_source text, p_mode text, p_label text)
returns void language plpgsql security definer set search_path = public as $f$
declare
  v_label text := left(trim(coalesce(p_label, '')), 80);
begin
  if auth.uid() is null then
    raise exception 'Connexion nécessaire';
  end if;
  if p_mode not in ('anonymous', 'name', 'pseudonym') then
    raise exception 'Mention inconnue';
  end if;
  if p_mode <> 'anonymous' and v_label = '' then
    raise exception 'Indique le nom ou le pseudonyme à afficher';
  end if;
  if p_mode = 'anonymous' then v_label := ''; end if;
  update public.library_submissions set author_mode = p_mode, author_label = v_label, updated_at = now()
   where owner_id = auth.uid() and source_subject_id = p_source;
  update public.library_collections set author_mode = p_mode, author_label = v_label
   where owner_id = auth.uid() and source_subject_id = p_source;
end;
$f$;
grant execute on function public.set_box_author_mention(text, text, text) to authenticated;

-- À la publication : la boîte reprend la mention choisie, et sort de
-- « en relecture » (étape B).
create or replace function public.library_collections_release_hold()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if new.status = 'published' and old.status is distinct from 'published' and new.collection_id is not null then
    update public.library_collections
       set review_hold = false, author_mode = new.author_mode, author_label = new.author_label
     where id = new.collection_id;
  end if;
  return new;
end;
$f$;

-- ---------- 4. Darwin Admin corrige une boîte déjà publiée ----------
create or replace function public.admin_update_published_submission(p_id uuid, p_patch jsonb)
returns void language plpgsql security definer set search_path = public as $f$
declare
  sub public.library_submissions;
  col public.library_collections;
  v_cards jsonb;
  v_note text;
begin
  perform public.admin_assert();
  select * into sub from public.library_submissions where id = p_id for update;
  if not found or sub.status <> 'published' or sub.collection_id is null then
    raise exception 'Seule une boîte publiée peut être corrigée ici';
  end if;
  select * into col from public.library_collections where id = sub.collection_id for update;
  if not found then
    raise exception 'Boîte introuvable dans la Librairie';
  end if;
  p_patch := coalesce(p_patch, '{}'::jsonb);
  v_cards := coalesce(p_patch -> 'cards', col.cards);
  v_note := coalesce(trim(p_patch ->> 'note'), '');
  update public.library_collections set
    name = coalesce(nullif(trim(p_patch ->> 'name'), ''), name),
    cards = v_cards,
    description = coalesce(p_patch ->> 'description', description),
    link = case when p_patch ? 'link' then nullif(trim(p_patch ->> 'link'), '') else link end,
    updated_at = now()
  where id = col.id;
  if v_cards is distinct from col.cards then
    insert into public.library_submission_messages (submission_id, from_admin, kind, body)
    values (p_id, true, 'published_with_changes', v_note);
  elsif v_note <> '' then
    insert into public.library_submission_messages (submission_id, from_admin, kind, body)
    values (p_id, true, 'message', v_note);
  end if;
  perform public.admin_log('submission.correct', p_id::text, jsonb_build_object('collection', col.id));
end;
$f$;
grant execute on function public.admin_update_published_submission(uuid, jsonb) to authenticated;

-- ---------- 5. Réponse automatique aux demandes de retrait ----------
alter table public.library_submission_messages drop constraint if exists library_submission_messages_kind_check;
alter table public.library_submission_messages add constraint library_submission_messages_kind_check
  check (kind in ('message', 'changes_requested', 'rejected', 'published_with_changes', 'withdrawn',
                  'withdrawal_request', 'auto_reply'));

create or replace function public.library_submission_messages_prepare()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  new.created_at := now();
  new.seen_at := null;
  -- Réponse automatique (insérée par le serveur) : de darwin, déjà lue.
  if current_setting('darwin.auto_reply', true) = '1' then
    new.from_admin := true;
    new.seen_at := now();
    return new;
  end if;
  if not public.is_admin() then
    new.from_admin := false;
    if new.kind = 'auto_reply' then
      raise exception 'Type de message réservé';
    end if;
    perform public.rate_limit_check(
      (select count(*) from public.library_submission_messages m
         join public.library_submissions s on s.id = m.submission_id
        where s.owner_id = auth.uid() and not m.from_admin and m.created_at > now() - interval '1 day'),
      50, 'messages à darwin');
  end if;
  return new;
end;
$f$;

create or replace function public.library_withdrawal_auto_reply()
returns trigger language plpgsql security definer set search_path = public as $f$
begin
  if new.kind = 'withdrawal_request' and not new.from_admin then
    perform set_config('darwin.auto_reply', '1', true);
    insert into public.library_submission_messages (submission_id, from_admin, kind, body)
    values (new.submission_id, true, 'auto_reply',
      'Message automatique : votre demande de retrait va être prise en compte dans les meilleurs délais. Vous serez informé après traitement.');
    perform set_config('darwin.auto_reply', '', true);
  end if;
  return new;
end;
$f$;
drop trigger if exists library_withdrawal_auto_reply on public.library_submission_messages;
create trigger library_withdrawal_auto_reply after insert on public.library_submission_messages
  for each row execute function public.library_withdrawal_auto_reply();
