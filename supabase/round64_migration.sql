-- ============================================================
-- Fiches — round 64 (v221) : avant la mise en ligne
-- ============================================================
-- À exécuter UNE fois dans l'éditeur SQL de Supabase (idempotent : peut
-- être relancé sans risque), APRÈS les migrations précédentes, et AVANT
-- de mettre en ligne la v221 de l'appli (l'appli v221 lit la nouvelle vue
-- `library_catalog` et la fonction `library_collection_cards`).
--
-- 1) Sécurité : referme les anciennes règles « tout le monde peut tout
--    lire/écrire » des tables de synchro d'avant les comptes (au cas où un
--    vieux script les aurait recréées) et ferme les tables de sauvegarde
--    backup_r29_* (créées sans règle d'accès : lisibles par n'importe qui).
-- 2) Librairie : le contenu des fiches n'est plus lisible directement.
--    - Liste publique : vue `library_catalog` (tout sauf les fiches et
--      l'email de l'auteur) + nombre de fiches (`card_count`).
--    - Fiches : fonction `library_collection_cards(id)` — fiches
--      complètes pour l'auteur, un administrateur ou un compte qui a accès
--      à la Librairie (abonné, ou Librairie ouverte à tous tant que
--      « Réserver la Librairie aux abonnés » est désactivé dans Darwin
--      Admin) ; sinon un aperçu (réponses coupées à la moitié, sans
--      complément ni réponses fausses).
-- 3) Compte : fonction `delete_my_account()` (bouton « Supprimer mon
--    compte » de la page Compte).
-- ============================================================


-- ---------- 1) Sécurité ----------------------------------------------

drop policy if exists "anon can read/write cards" on public.cards;
drop policy if exists "anon can read/write subjects" on public.subjects;
drop policy if exists "anon can read/write folders" on public.folders;
do $$
begin
  if to_regclass('public.reward_state') is not null then
    execute 'drop policy if exists "anon can read/write reward_state" on public.reward_state';
    execute 'alter table public.reward_state enable row level security';
  end if;
  if to_regclass('public.learning_modes') is not null then
    execute 'drop policy if exists "anon can read/write learning_modes" on public.learning_modes';
    execute 'alter table public.learning_modes enable row level security';
  end if;
  if to_regclass('public.dev_settings') is not null then
    execute 'drop policy if exists "anon can read/write dev_settings" on public.dev_settings';
    execute 'alter table public.dev_settings enable row level security';
  end if;
  -- Sauvegardes du round 29 : plus aucun accès depuis l'appli (seul
  -- l'éditeur SQL de Supabase peut encore les lire).
  if to_regclass('public.backup_r29_cards') is not null then
    execute 'alter table public.backup_r29_cards enable row level security';
  end if;
  if to_regclass('public.backup_r29_subjects') is not null then
    execute 'alter table public.backup_r29_subjects enable row level security';
  end if;
  if to_regclass('public.backup_r29_folders') is not null then
    execute 'alter table public.backup_r29_folders enable row level security';
  end if;
end $$;


-- ---------- 2) Librairie ---------------------------------------------

-- Accès à la Librairie (même règle que hasLibrarySubscription dans
-- l'appli) : administrateur, ou abonnement actif / en essai non échu, ou —
-- tant que l'abonnement n'est pas exigé (subscriptionPolicy.enforce dans
-- les réglages communs) — tout compte connecté qui n'a pas été
-- explicitement privé d'accès (statut « none »).
create or replace function public.has_library_access()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  sub record;
  enforce boolean;
begin
  if uid is null then
    return false;
  end if;
  if exists (select 1 from public.admins a where a.user_id = uid) then
    return true;
  end if;
  select s.status, s.current_period_end into sub from public.subscriptions s where s.user_id = uid;
  if found and sub.status in ('active', 'trial') and (sub.current_period_end is null or sub.current_period_end > now()) then
    return true;
  end if;
  select coalesce((d.settings -> 'subscriptionPolicy' ->> 'enforce')::boolean, false)
    into enforce
    from public.dev_settings_public d
   where d.id = 'global';
  if coalesce(enforce, false) then
    return false;
  end if;
  return not (found and sub.status = 'none');
end;
$$;
revoke all on function public.has_library_access() from public, anon;
grant execute on function public.has_library_access() to authenticated;

-- Nombre de fiches tenu à jour par la base (la liste n'a plus besoin de
-- télécharger les fiches pour l'afficher).
alter table public.library_collections
  add column if not exists card_count integer not null default 0;

create or replace function public.library_collections_set_card_count()
returns trigger
language plpgsql
as $$
begin
  new.card_count := case when jsonb_typeof(new.cards) = 'array' then jsonb_array_length(new.cards) else 0 end;
  return new;
end;
$$;
drop trigger if exists library_collections_card_count on public.library_collections;
create trigger library_collections_card_count
  before insert or update of cards on public.library_collections
  for each row execute function public.library_collections_set_card_count();

update public.library_collections
   set card_count = case when jsonb_typeof(cards) = 'array' then jsonb_array_length(cards) else 0 end
 where card_count is distinct from (case when jsonb_typeof(cards) = 'array' then jsonb_array_length(cards) else 0 end);

-- La table elle-même : seulement l'auteur et les administrateurs.
drop policy if exists "library_collections_select" on public.library_collections;
create policy "library_collections_select" on public.library_collections
  for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- La liste publique (consultable sans compte, comme avant) : tout sauf les
-- fiches et l'email de l'auteur. La vue s'exécute avec les droits de son
-- propriétaire (elle voit toutes les lignes) et n'expose que ces colonnes.
drop view if exists public.library_catalog;
create view public.library_catalog as
  select id, owner_id, owner_first_name, owner_last_name, name, summary, description,
         level, price_tokens, source_subject_id, taxonomy, tags, card_count,
         shared_at, updated_at
    from public.library_collections;
revoke all on public.library_catalog from public, anon, authenticated;
grant select on public.library_catalog to anon, authenticated;

-- Fiches d'une collection : complètes si accès, aperçu sinon.
-- Renvoie { "full": true|false, "cards": [...] } (null si introuvable).
create or replace function public.library_collection_cards(p_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  col record;
  full_access boolean;
  preview jsonb;
begin
  select lc.owner_id, lc.cards into col from public.library_collections lc where lc.id = p_id;
  if not found then
    return null;
  end if;
  full_access := auth.uid() is not null and (col.owner_id = auth.uid() or public.has_library_access());
  if full_access then
    return jsonb_build_object('full', true, 'cards', coalesce(col.cards, '[]'::jsonb));
  end if;
  -- Aperçu : question entière, réponse (texte brut) coupée à la moitié,
  -- au dernier espace si possible — même règle que l'appli avant v221.
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', c ->> 'id',
           'question', coalesce(c ->> 'question', ''),
           'answer', public.library_preview_text(coalesce(c ->> 'answer', '')),
           'preview', true
         ) order by ord), '[]'::jsonb)
    into preview
    from jsonb_array_elements(case when jsonb_typeof(col.cards) = 'array' then col.cards else '[]'::jsonb end)
         with ordinality as t(c, ord);
  return jsonb_build_object('full', false, 'cards', preview);
end;
$$;

create or replace function public.library_preview_text(p_html text)
returns text
language plpgsql
immutable
as $$
declare
  plain text;
  half int;
  cut text;
  last_space int;
begin
  plain := regexp_replace(coalesce(p_html, ''), '<br\s*/?>|</(div|p|li)>', ' ', 'gi');
  plain := regexp_replace(plain, '<[^>]*>', '', 'g');
  plain := replace(replace(replace(replace(replace(plain, '&nbsp;', ' '), '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&amp;', '&');
  plain := btrim(regexp_replace(plain, '\s+', ' ', 'g'));
  if plain = '' then
    return '';
  end if;
  half := ceil(length(plain) / 2.0);
  cut := left(plain, half);
  last_space := length(cut) - position(' ' in reverse(cut)) + 1;
  if position(' ' in cut) > 0 and last_space > half * 0.4 then
    cut := left(cut, last_space - 1);
  end if;
  return cut || '…';
end;
$$;

revoke all on function public.library_collection_cards(uuid) from public;
grant execute on function public.library_collection_cards(uuid) to anon, authenticated;


-- ---------- 3) Supprimer mon compte ----------------------------------

-- Efface le compte connecté et TOUT ce qui lui appartient (fiches, boîtes,
-- dossiers, calendrier, classes qu'il enseigne — avec leurs boîtes,
-- évènements et messages —, inscriptions comme élève, messages envoyés,
-- signalements, collections publiées dans la Librairie, notes, abonnement).
-- Les tables liées à auth.users sont en « on delete cascade » ; quelques
-- références « auteur de la modification » sont remises à vide d'abord.
-- Refusé : abonnement payant en cours (à résilier d'abord), ou dernier
-- administrateur.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  my_email text;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if exists (
    select 1 from public.subscriptions s
     where s.user_id = uid and s.source in ('stripe', 'apple', 'google')
       and s.status in ('active', 'trial')
       and (s.current_period_end is null or s.current_period_end > now())
  ) then
    raise exception 'active_subscription';
  end if;
  if exists (select 1 from public.admins a where a.user_id = uid)
     and (select count(*) from public.admins) <= 1 then
    raise exception 'last_admin';
  end if;

  select email into my_email from auth.users where id = uid;

  update public.dev_settings_public set updated_by = null where updated_by = uid;
  if to_regclass('public.dev_settings') is not null and my_email is not null then
    execute 'delete from public.dev_settings where lower(account_email) = lower($1)' using my_email;
  end if;

  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

notify pgrst, 'reload schema';

-- ---------- Vérifications (facultatif) -------------------------------
-- Tables du schéma public SANS règles d'accès activées (doit être vide) :
--   select tablename from pg_tables where schemaname = 'public' and not rowsecurity;
-- Règles « ouvertes à tous » restantes (à examiner une par une) :
--   select tablename, policyname, cmd, roles from pg_policies
--    where schemaname = 'public' and qual = 'true';
