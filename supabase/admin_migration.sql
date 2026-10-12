-- ============================================================
-- Round 50 — appli d'administration « Darwin Admin » (dossier admin/).
-- À exécuter UNE FOIS dans Supabase → SQL Editor → New query → Run,
-- APRÈS toutes les migrations précédentes (round49_migration.sql compris).
-- Idempotent : peut être relancé sans risque.
--
-- 1) Administrateurs : table `admins` + fonction `is_admin()`. Le compte
--    stephane.vezain@gmail.com est déclaré administrateur d'office. Les
--    réglages communs (dev_settings_public) et la modération de la
--    Librairie ne dépendent plus d'un email écrit en dur, mais de cette
--    table (on peut ajouter d'autres administrateurs depuis l'appli).
-- 2) Abonnements : table `subscriptions` (une ligne par compte), gérée par
--    les administrateurs en attendant le vrai paiement (Stripe / Apple…).
--    Chaque compte peut lire SA ligne (l'appli Fiches s'en sert pour
--    savoir s'il a accès aux boîtes de la Librairie).
-- 3) Journal des actions d'administration (`admin_audit`).
-- 4) Fonctions de lecture pour le tableau de bord (comptes, boîtes,
--    classes, Librairie, signalements…). Toutes vérifient d'abord que
--    l'appelant est administrateur : un autre compte reçoit une erreur
--    « réservé aux administrateurs ». Le contenu des messages des classes
--    n'est jamais renvoyé (seulement des nombres).
-- ============================================================

-- ---------- 1) Administrateurs ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  added_at timestamptz not null default now(),
  added_by uuid references auth.users(id) on delete set null
);
alter table public.admins enable row level security;
-- Aucune policy : la table ne se lit / s'écrit que par les fonctions
-- ci-dessous (security definer).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

insert into public.admins (user_id, email)
select u.id, coalesce(u.email, '')
  from auth.users u
 where lower(u.email) = 'stephane.vezain@gmail.com'
on conflict (user_id) do nothing;

-- Erreur commune « réservé aux administrateurs ».
create or replace function public.admin_assert()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;
end;
$$;
revoke all on function public.admin_assert() from public;
grant execute on function public.admin_assert() to authenticated;

-- Réglages communs : écriture réservée aux administrateurs.
drop policy if exists "dev_settings_public_insert_owner" on public.dev_settings_public;
drop policy if exists "dev_settings_public_update_owner" on public.dev_settings_public;
drop policy if exists "dev_settings_public_insert_admin" on public.dev_settings_public;
drop policy if exists "dev_settings_public_update_admin" on public.dev_settings_public;
create policy "dev_settings_public_insert_admin" on public.dev_settings_public
  for insert to authenticated with check (public.is_admin());
create policy "dev_settings_public_update_admin" on public.dev_settings_public
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Librairie : modération par les administrateurs.
drop policy if exists "library_collections_delete_dev" on public.library_collections;
drop policy if exists "library_collections_delete_admin" on public.library_collections;
drop policy if exists "library_collections_update_admin" on public.library_collections;
create policy "library_collections_delete_admin" on public.library_collections
  for delete to authenticated using (public.is_admin());
create policy "library_collections_update_admin" on public.library_collections
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- 2) Abonnements ----------
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'none'
    check (status in ('active', 'trial', 'none', 'canceled', 'past_due')),
  plan text not null default '' check (length(plan) <= 100),
  source text not null default 'manual'
    check (source in ('manual', 'stripe', 'apple', 'google')),
  current_period_end timestamptz,
  note text not null default '' check (length(note) <= 2000),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions_select_own_or_admin" on public.subscriptions;
create policy "subscriptions_select_own_or_admin" on public.subscriptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
-- Pas d'écriture directe : uniquement admin_set_subscription (ou, plus
-- tard, le serveur de paiement avec la clé service_role).

-- ---------- 3) Journal ----------
create table if not exists public.admin_audit (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text not null default '',
  action text not null,
  target text not null default '',
  details jsonb not null default '{}'::jsonb
);
alter table public.admin_audit enable row level security;
create index if not exists admin_audit_at_idx on public.admin_audit (at desc);

create or replace function public.admin_log(p_action text, p_target text, p_details jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_audit (admin_id, admin_email, action, target, details)
  values (auth.uid(), coalesce((select email from auth.users where id = auth.uid()), ''),
          p_action, coalesce(p_target, ''), coalesce(p_details, '{}'::jsonb));
$$;
revoke all on function public.admin_log(text, text, jsonb) from public, anon, authenticated;

-- Nom affichable d'un compte (prénom nom, sinon email).
create or replace function public.admin_user_label(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(nullif(trim(coalesce(u.raw_user_meta_data->>'first_name', '') || ' ' ||
                              coalesce(u.raw_user_meta_data->>'last_name', '')), ''), u.email, '')
    from auth.users u where u.id = p_user;
$$;
revoke all on function public.admin_user_label(uuid) from public, anon, authenticated;

-- ---------- 4) Tableau de bord ----------
create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r jsonb;
begin
  perform public.admin_assert();
  select jsonb_build_object(
    'users_total',      (select count(*) from auth.users),
    'users_new_7d',     (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'users_new_30d',    (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'users_active_7d',  (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'users_active_30d', (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days'),
    'reviewers_7d',     (select count(distinct owner_id) from public.cards where not deleted and last_reviewed > now() - interval '7 days'),
    'cards_total',      (select count(*) from public.cards where not deleted),
    'boxes_total',      (select count(*) from public.subjects s where not s.deleted
                           and coalesce(s.payload->>'sharedBoxId', '') = ''
                           and coalesce((s.payload->>'fromLibrary')::boolean, false) = false),
    'collections_total',(select count(*) from public.library_collections),
    'ratings_total',    (select count(*) from public.library_ratings),
    'classes_total',    (select count(*) from public.classes),
    'class_members_total', (select count(*) from public.class_members),
    'messages_7d',      (select count(*) from public.class_messages where created_at > now() - interval '7 days'),
    'reports_open',     (select count(*) from public.card_reports where not resolved),
    'reports_total',    (select count(*) from public.card_reports),
    'subscriptions_active', (select count(*) from public.subscriptions
                              where status in ('active', 'trial')
                                and (current_period_end is null or current_period_end > now())),
    'admins_total',     (select count(*) from public.admins),
    'signups_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'n', coalesce(n, 0)) order by d), '[]'::jsonb)
        from generate_series(current_date - 29, current_date, interval '1 day') d
        left join (select created_at::date as day, count(*) as n from auth.users
                    where created_at >= current_date - 29 group by 1) x on x.day = d::date),
    'reviews_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'n', coalesce(n, 0)) order by d), '[]'::jsonb)
        from generate_series(current_date - 29, current_date, interval '1 day') d
        left join (select last_reviewed::date as day, count(*) as n from public.cards
                    where not deleted and last_reviewed >= current_date - 29 group by 1) x on x.day = d::date)
  ) into r;
  return r;
end;
$$;

-- Comptes (recherche sur email / prénom / nom), page par page.
create or replace function public.admin_users(
  p_search text default '', p_limit int default 50, p_offset int default 0, p_sort text default 'created')
returns table (
  user_id uuid, email text, first_name text, last_name text, usages jsonb,
  created_at timestamptz, last_sign_in_at timestamptz,
  cards bigint, boxes bigint, classes_taught bigint, classes_joined bigint, collections bigint,
  sub_status text, sub_plan text, sub_until timestamptz, is_admin boolean, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q text := '%' || lower(coalesce(trim(p_search), '')) || '%';
begin
  perform public.admin_assert();
  return query
  with f as (
    select u.*, count(*) over () as n_total
      from auth.users u
     where lower(coalesce(u.email, '')) like q
        or lower(coalesce(u.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(u.raw_user_meta_data->>'last_name', '')) like q
     order by
       case when p_sort = 'last_sign_in' then u.last_sign_in_at end desc nulls last,
       case when p_sort = 'email' then lower(u.email) end asc,
       u.created_at desc
     limit greatest(1, least(coalesce(p_limit, 50), 500)) offset greatest(0, coalesce(p_offset, 0))
  )
  select f.id, coalesce(f.email, '')::text,
         coalesce(f.raw_user_meta_data->>'first_name', '')::text,
         coalesce(f.raw_user_meta_data->>'last_name', '')::text,
         coalesce(f.raw_user_meta_data->'usages', '[]'::jsonb),
         f.created_at, f.last_sign_in_at,
         (select count(*) from public.cards c where c.owner_id = f.id and not c.deleted),
         (select count(*) from public.subjects s where s.owner_id = f.id and not s.deleted),
         (select count(*) from public.classes k where k.teacher_id = f.id),
         (select count(*) from public.class_members m where m.user_id = f.id),
         (select count(*) from public.library_collections lc where lc.owner_id = f.id),
         coalesce(s.status, '')::text, coalesce(s.plan, '')::text, s.current_period_end,
         exists (select 1 from public.admins a where a.user_id = f.id),
         f.n_total
    from f
    left join public.subscriptions s on s.user_id = f.id
   order by
     case when p_sort = 'last_sign_in' then f.last_sign_in_at end desc nulls last,
     case when p_sort = 'email' then lower(f.email) end asc,
     f.created_at desc;
end;
$$;

-- Fiche détaillée d'un compte.
create or replace function public.admin_user_detail(p_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r jsonb;
begin
  perform public.admin_assert();
  select jsonb_build_object(
    'user', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at,
                                       'last_sign_in_at', u.last_sign_in_at, 'meta', u.raw_user_meta_data)
               from auth.users u where u.id = p_user),
    'is_admin', exists (select 1 from public.admins a where a.user_id = p_user),
    'subscription', (select to_jsonb(s) from public.subscriptions s where s.user_id = p_user),
    'last_review', (select max(c.last_reviewed) from public.cards c where c.owner_id = p_user and not c.deleted),
    'boxes', (
      select coalesce(jsonb_agg(b order by b->>'name'), '[]'::jsonb) from (
        select jsonb_build_object(
          'id', s.id, 'name', s.name,
          'kind', case when coalesce(s.payload->>'sharedBoxId', '') <> '' then 'class'
                       when coalesce((s.payload->>'fromLibrary')::boolean, false) then 'library'
                       else 'own' end,
          'in_revisions', not coalesce((s.payload->>'outOfRevisions')::boolean, false),
          'cards', (select count(*) from public.cards c where c.owner_id = p_user and c.subject = s.id and not c.deleted),
          'updated_at', s.updated_at) as b
          from public.subjects s where s.owner_id = p_user and not s.deleted) t),
    'classes_taught', (
      select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'name', k.name, 'code', k.invite_code,
             'members', (select count(*) from public.class_members m where m.class_id = k.id)) order by k.name), '[]'::jsonb)
        from public.classes k where k.teacher_id = p_user),
    'classes_joined', (
      select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'name', k.name, 'teacher', public.admin_user_label(k.teacher_id),
             'joined_at', m.joined_at) order by k.name), '[]'::jsonb)
        from public.class_members m join public.classes k on k.id = m.class_id where m.user_id = p_user),
    'collections', (
      select coalesce(jsonb_agg(jsonb_build_object('id', lc.id, 'name', lc.name, 'cards', jsonb_array_length(lc.cards),
             'shared_at', lc.shared_at) order by lc.shared_at desc), '[]'::jsonb)
        from public.library_collections lc where lc.owner_id = p_user),
    'reports_sent', (select count(*) from public.card_reports r where r.reporter_id = p_user),
    'reports_received', (select count(*) from public.card_reports r where r.author_id = p_user),
    'reports_received_open', (select count(*) from public.card_reports r where r.author_id = p_user and not r.resolved)
  ) into r;
  return r;
end;
$$;

-- Toutes les boîtes (kind : all / own / class / library).
create or replace function public.admin_boxes(
  p_search text default '', p_kind text default 'all', p_limit int default 50, p_offset int default 0)
returns table (
  id text, owner_id uuid, owner_email text, owner_name text, name text, kind text,
  in_revisions boolean, cards bigint, updated_at timestamptz, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q text := '%' || lower(coalesce(trim(p_search), '')) || '%';
begin
  perform public.admin_assert();
  return query
  with b as (
    select s.*, case when coalesce(s.payload->>'sharedBoxId', '') <> '' then 'class'
                     when coalesce((s.payload->>'fromLibrary')::boolean, false) then 'library'
                     else 'own' end as k
      from public.subjects s
     where not s.deleted
  ), f as (
    select b.*, u.email as u_email, count(*) over () as n_total
      from b join auth.users u on u.id = b.owner_id
     where (p_kind is null or p_kind = 'all' or b.k = p_kind)
       and (lower(b.name) like q or lower(coalesce(u.email, '')) like q)
     order by b.updated_at desc
     limit greatest(1, least(coalesce(p_limit, 50), 500)) offset greatest(0, coalesce(p_offset, 0))
  )
  select f.id, f.owner_id, coalesce(f.u_email, '')::text, public.admin_user_label(f.owner_id), f.name, f.k,
         not coalesce((f.payload->>'outOfRevisions')::boolean, false),
         (select count(*) from public.cards c where c.owner_id = f.owner_id and c.subject = f.id and not c.deleted),
         f.updated_at, f.n_total
    from f
   order by f.updated_at desc;
end;
$$;

-- Fiches d'une boîte (500 au plus).
create or replace function public.admin_box_cards(p_owner uuid, p_box text)
returns table (id text, question text, answer text, due_date timestamptz, last_reviewed timestamptz, review_count int)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  return query
    select c.id, c.question, c.answer, c.due_date, c.last_reviewed, c.review_count
      from public.cards c
     where c.owner_id = p_owner and c.subject = p_box and not c.deleted
     order by c.created_at
     limit 500;
end;
$$;

-- Classes.
create or replace function public.admin_classes(p_search text default '', p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, name text, invite_code text, teacher_id uuid, teacher_email text, teacher_name text,
  created_at timestamptz, members bigint, shared_boxes bigint, messages bigint, last_message_at timestamptz, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q text := '%' || lower(coalesce(trim(p_search), '')) || '%';
begin
  perform public.admin_assert();
  return query
  with f as (
    select k.*, u.email as u_email, count(*) over () as n_total
      from public.classes k join auth.users u on u.id = k.teacher_id
     where lower(k.name) like q or lower(coalesce(u.email, '')) like q or lower(k.invite_code) like q
     order by k.created_at desc
     limit greatest(1, least(coalesce(p_limit, 50), 500)) offset greatest(0, coalesce(p_offset, 0))
  )
  select f.id, f.name, f.invite_code, f.teacher_id, coalesce(f.u_email, '')::text, public.admin_user_label(f.teacher_id),
         f.created_at,
         (select count(*) from public.class_members m where m.class_id = f.id),
         (select count(*) from public.shared_boxes sb where sb.class_id = f.id),
         (select count(*) from public.class_messages cm where cm.class_id = f.id),
         (select max(cm.created_at) from public.class_messages cm where cm.class_id = f.id),
         f.n_total
    from f
   order by f.created_at desc;
end;
$$;

-- Détail d'une classe : membres et boîtes partagées (pas les messages).
create or replace function public.admin_class_detail(p_class uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r jsonb;
begin
  perform public.admin_assert();
  select jsonb_build_object(
    'members', (select coalesce(jsonb_agg(jsonb_build_object('user_id', m.user_id, 'name', public.admin_user_label(m.user_id),
                  'email', u.email, 'joined_at', m.joined_at) order by m.joined_at), '[]'::jsonb)
                  from public.class_members m join auth.users u on u.id = m.user_id where m.class_id = p_class),
    'boxes', (select coalesce(jsonb_agg(jsonb_build_object('id', sb.id, 'name', sb.subject_name,
                'cards', jsonb_array_length(sb.cards), 'folder_path', sb.folder_path, 'shared_at', sb.shared_at)
                order by sb.shared_at desc), '[]'::jsonb)
                from public.shared_boxes sb where sb.class_id = p_class)
  ) into r;
  return r;
end;
$$;

-- Librairie.
create or replace function public.admin_collections(p_search text default '', p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, name text, owner_id uuid, owner_email text, owner_name text, cards int, level text,
  taxonomy jsonb, tags text[], summary text, shared_at timestamptz, updated_at timestamptz,
  ratings bigint, rating_avg numeric, reports bigint, reports_open bigint, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q text := '%' || lower(coalesce(trim(p_search), '')) || '%';
begin
  perform public.admin_assert();
  return query
  with f as (
    select lc.*, count(*) over () as n_total
      from public.library_collections lc
     where lower(lc.name) like q or lower(lc.owner_email) like q
        or lower(lc.owner_first_name || ' ' || lc.owner_last_name) like q
        or exists (select 1 from unnest(lc.tags) t where lower(t) like q)
     order by lc.shared_at desc
     limit greatest(1, least(coalesce(p_limit, 50), 500)) offset greatest(0, coalesce(p_offset, 0))
  )
  select f.id, f.name, f.owner_id, f.owner_email,
         coalesce(nullif(trim(f.owner_first_name || ' ' || f.owner_last_name), ''), f.owner_email)::text,
         jsonb_array_length(f.cards), f.level, f.taxonomy, f.tags, f.summary, f.shared_at, f.updated_at,
         (select count(*) from public.library_ratings lr where lr.collection_id = f.id),
         (select round(avg(lr.rating)::numeric, 2) from public.library_ratings lr where lr.collection_id = f.id),
         (select count(*) from public.card_reports r where r.source_kind = 'library' and r.source_id = f.id::text),
         (select count(*) from public.card_reports r where r.source_kind = 'library' and r.source_id = f.id::text and not r.resolved),
         f.n_total
    from f
   order by f.shared_at desc;
end;
$$;

create or replace function public.admin_delete_collection(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  perform public.admin_assert();
  select name into v_name from public.library_collections where id = p_id;
  if v_name is null then
    raise exception 'Collection introuvable';
  end if;
  delete from public.library_collections where id = p_id;
  perform public.admin_log('library.delete', p_id::text, jsonb_build_object('name', v_name));
end;
$$;

-- Signalements (status : open / done / all).
create or replace function public.admin_reports(p_status text default 'open', p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, created_at timestamptz, source_kind text, source_id text, box_name text,
  card_question text, card_answer text, message text, resolved boolean, resolved_at timestamptz,
  resolved_question text, resolved_answer text, author_reply text,
  reporter_id uuid, reporter_name text, reporter_email text, author_id uuid, author_name text, author_email text, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
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
         f.author_id, public.admin_user_label(f.author_id), coalesce(au.email, '')::text, f.n_total
    from f
    left join auth.users ru on ru.id = f.reporter_id
    left join auth.users au on au.id = f.author_id
   order by f.created_at desc;
end;
$$;

-- Abonnements.
create or replace function public.admin_subscriptions(p_status text default 'all', p_limit int default 100, p_offset int default 0)
returns table (
  user_id uuid, email text, name text, status text, plan text, source text, current_period_end timestamptz,
  note text, updated_at timestamptz, updated_by_email text, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  return query
  with f as (
    select s.*, count(*) over () as n_total
      from public.subscriptions s
     where coalesce(p_status, 'all') = 'all' or s.status = p_status
     order by s.updated_at desc
     limit greatest(1, least(coalesce(p_limit, 100), 500)) offset greatest(0, coalesce(p_offset, 0))
  )
  select f.user_id, coalesce(u.email, '')::text, public.admin_user_label(f.user_id), f.status, f.plan, f.source,
         f.current_period_end, f.note, f.updated_at, coalesce(ub.email, '')::text, f.n_total
    from f
    left join auth.users u on u.id = f.user_id
    left join auth.users ub on ub.id = f.updated_by
   order by f.updated_at desc;
end;
$$;

create or replace function public.admin_set_subscription(
  p_user uuid, p_status text, p_plan text default '', p_until timestamptz default null, p_note text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'Compte introuvable';
  end if;
  -- « default » : plus d'abonnement enregistré (règle générale d'accès).
  if p_status = 'default' then
    delete from public.subscriptions where user_id = p_user;
    perform public.admin_log('subscription.clear', p_user::text,
      jsonb_build_object('email', (select email from auth.users where id = p_user)));
    return;
  end if;
  insert into public.subscriptions (user_id, status, plan, source, current_period_end, note, updated_at, updated_by)
  values (p_user, p_status, coalesce(p_plan, ''), 'manual', p_until, coalesce(p_note, ''), now(), auth.uid())
  on conflict (user_id) do update
    set status = excluded.status, plan = excluded.plan, source = 'manual',
        current_period_end = excluded.current_period_end, note = excluded.note,
        updated_at = now(), updated_by = auth.uid();
  perform public.admin_log('subscription.set', p_user::text,
    jsonb_build_object('status', p_status, 'plan', p_plan, 'until', p_until, 'email',
                       (select email from auth.users where id = p_user)));
end;
$$;

-- Administrateurs.
create or replace function public.admin_list_admins()
returns table (user_id uuid, email text, name text, added_at timestamptz, added_by_email text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  return query
    select a.user_id, coalesce(u.email, a.email)::text, public.admin_user_label(a.user_id), a.added_at, coalesce(b.email, '')::text
      from public.admins a
      left join auth.users u on u.id = a.user_id
      left join auth.users b on b.id = a.added_by
     order by a.added_at;
end;
$$;

create or replace function public.admin_add_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_email text;
begin
  perform public.admin_assert();
  select id, email into v_id, v_email from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then
    raise exception 'Aucun compte avec cet email';
  end if;
  insert into public.admins (user_id, email, added_by) values (v_id, coalesce(v_email, ''), auth.uid())
  on conflict (user_id) do nothing;
  perform public.admin_log('admin.add', v_id::text, jsonb_build_object('email', v_email));
end;
$$;

create or replace function public.admin_remove_admin(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  if (select count(*) from public.admins) <= 1 then
    raise exception 'Impossible de retirer le dernier administrateur';
  end if;
  delete from public.admins where user_id = p_user;
  perform public.admin_log('admin.remove', p_user::text,
    jsonb_build_object('email', (select email from auth.users where id = p_user)));
end;
$$;

-- Journal.
create or replace function public.admin_audit_list(p_limit int default 100, p_offset int default 0)
returns table (id bigint, at timestamptz, admin_email text, action text, target text, details jsonb, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  return query
    select a.id, a.at, a.admin_email, a.action, a.target, a.details, count(*) over ()
      from public.admin_audit a
     order by a.at desc
     limit greatest(1, least(coalesce(p_limit, 100), 500)) offset greatest(0, coalesce(p_offset, 0));
end;
$$;

-- Droits d'exécution : comptes connectés seulement (chaque fonction
-- vérifie ensuite qu'il s'agit d'un administrateur).
do $$
declare
  f text;
begin
  foreach f in array array[
    'admin_overview()',
    'admin_users(text, int, int, text)',
    'admin_user_detail(uuid)',
    'admin_boxes(text, text, int, int)',
    'admin_box_cards(uuid, text)',
    'admin_classes(text, int, int)',
    'admin_class_detail(uuid)',
    'admin_collections(text, int, int)',
    'admin_delete_collection(uuid)',
    'admin_reports(text, int, int)',
    'admin_subscriptions(text, int, int)',
    'admin_set_subscription(uuid, text, text, timestamptz, text)',
    'admin_list_admins()',
    'admin_add_admin(text)',
    'admin_remove_admin(uuid)',
    'admin_audit_list(int, int)'
  ] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('revoke all on function public.%s from anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
