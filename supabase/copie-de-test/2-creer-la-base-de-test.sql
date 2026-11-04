-- ============================================================
-- Copie de test — étape B : CONSTRUIRE LA BASE DE TEST.
--
-- À exécuter UNIQUEMENT dans le projet Supabase de TEST (darwin-test) :
-- vérifier le nom du projet en haut à gauche AVANT de cliquer sur Run.
-- SQL Editor → New query → coller tout ce texte → Run. Si Supabase
-- demande « Run and Enable RLS » ou « Run without RLS », choisir
-- « Run without RLS » (les règles de sécurité sont déjà dans le script).
--
-- Contenu : la structure de la base réelle exportée le 4 nov. 2026 par
-- 1-exporter-la-structure.sql (tables, fonctions, règles de sécurité,
-- droits), plus les réglages communs de l'appli. AUCUNE donnée
-- d'utilisateur. Peut être relancé sans risque.
--
-- C'est aussi la structure de référence de la base réelle à cette date
-- (des scripts exécutés à la main manquaient au dépôt).
-- ============================================================

-- Structure exportée le 2026-11-04 14:16 (624 instructions)
set check_function_bodies = off;

create table if not exists public.account_activity (
  user_id uuid not null,
  day date default CURRENT_DATE not null
);

create table if not exists public.account_ages (
  user_id uuid not null,
  birth_date date not null,
  set_by text default 'user'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.admin_audit (
  id bigint generated always as identity not null,
  at timestamp with time zone default now() not null,
  admin_id uuid,
  admin_email text default ''::text not null,
  action text not null,
  target text default ''::text not null,
  details jsonb default '{}'::jsonb not null
);

create table if not exists public.admins (
  user_id uuid not null,
  email text default ''::text not null,
  added_at timestamp with time zone default now() not null,
  added_by uuid
);

create table if not exists public.backup_r29_cards (
  id text,
  sync_code text,
  question text,
  answer text,
  created_at timestamp with time zone,
  due_date timestamp with time zone,
  last_reviewed timestamp with time zone,
  review_count integer,
  easiness numeric,
  "interval" integer,
  repetitions integer,
  updated_at timestamp with time zone,
  deleted boolean,
  subject text,
  subject_name text,
  max_interval_reached integer
);

create table if not exists public.backup_r29_folders (
  id text,
  sync_code text,
  name text,
  parent_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  deleted boolean
);

create table if not exists public.backup_r29_subjects (
  id text,
  sync_code text,
  name text,
  folder_id text,
  mode_id text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  deleted boolean
);

create table if not exists public.calendar_events (
  owner_id uuid default auth.uid() not null,
  id text not null,
  payload jsonb default '{}'::jsonb not null,
  updated_at timestamp with time zone default now() not null,
  deleted boolean default false not null
);

create table if not exists public.card_reports (
  id uuid default gen_random_uuid() not null,
  reporter_id uuid default auth.uid() not null,
  reporter_name text default ''::text not null,
  author_id uuid not null,
  source_kind text not null,
  source_id text not null,
  box_name text default ''::text not null,
  card_id text default ''::text not null,
  card_question text default ''::text not null,
  card_answer text default ''::text not null,
  message text not null,
  created_at timestamp with time zone default now() not null,
  read_at timestamp with time zone,
  resolved boolean default false not null,
  resolved_at timestamp with time zone,
  resolved_question text,
  resolved_answer text,
  author_reply text,
  author_reply_at timestamp with time zone,
  reporter_seen_at timestamp with time zone
);

create table if not exists public.cards (
  id text not null,
  sync_code text,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default now() not null,
  due_date timestamp with time zone default now() not null,
  last_reviewed timestamp with time zone,
  review_count integer default 0 not null,
  easiness numeric default 2.5 not null,
  "interval" integer default 0 not null,
  repetitions integer default 0 not null,
  updated_at timestamp with time zone default now() not null,
  deleted boolean default false not null,
  subject text,
  subject_name text,
  max_interval_reached integer default 0 not null,
  owner_id uuid default auth.uid() not null,
  payload jsonb
);

create table if not exists public.class_members (
  class_id uuid not null,
  user_id uuid not null,
  role text default 'student'::text not null,
  joined_at timestamp with time zone default now() not null
);

create table if not exists public.class_messages (
  id uuid default gen_random_uuid() not null,
  class_id uuid not null,
  sender_id uuid not null,
  sender_email text default ''::text not null,
  body text not null,
  created_at timestamp with time zone default now() not null,
  sender_name text default ''::text not null
);

create table if not exists public.classes (
  id uuid default gen_random_uuid() not null,
  name text not null,
  teacher_id uuid not null,
  invite_code text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  box_folders jsonb default '[]'::jsonb not null
);

create table if not exists public.client_errors (
  id bigint generated by default as identity not null,
  user_id uuid,
  app text default 'app'::text not null,
  app_version text default ''::text not null,
  kind text default 'error'::text not null,
  message text default ''::text not null,
  stack text default ''::text not null,
  page text default ''::text not null,
  user_agent text default ''::text not null,
  fingerprint text default ''::text not null,
  occurrences integer default 1 not null,
  first_seen timestamp with time zone default now() not null,
  last_seen timestamp with time zone default now() not null
);

create table if not exists public.dev_settings (
  sync_code text not null,
  payload jsonb default '{}'::jsonb not null,
  updated_at timestamp with time zone default now() not null,
  account_email text default ''::text not null
);

create table if not exists public.dev_settings_public (
  id text default 'global'::text not null,
  settings jsonb default '{}'::jsonb not null,
  updated_at timestamp with time zone default now() not null,
  updated_by uuid
);

create table if not exists public.folders (
  id text not null,
  sync_code text,
  name text not null,
  parent_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  deleted boolean default false not null,
  owner_id uuid default auth.uid() not null,
  payload jsonb
);

create table if not exists public.inactivity_notices (
  user_id uuid not null,
  warned_at timestamp with time zone default now() not null,
  reminded_at timestamp with time zone,
  delete_on timestamp with time zone not null
);

create table if not exists public.inactivity_runs (
  id bigint generated always as identity not null,
  ran_at timestamp with time zone default now() not null,
  dry_run boolean default false not null,
  trigger text default 'cron'::text not null,
  warned integer default 0 not null,
  reminded integer default 0 not null,
  deleted integer default 0 not null,
  deleted_unconfirmed integer default 0 not null,
  errors integer default 0 not null,
  detail text default ''::text not null
);

create table if not exists public.learning_modes (
  id text not null,
  sync_code text not null,
  name text not null,
  builtin boolean default false not null,
  ka numeric not null,
  kh numeric not null,
  kg numeric not null,
  ke numeric not null,
  ma integer not null,
  mh integer not null,
  mg integer not null,
  me integer not null,
  updated_at timestamp with time zone default now() not null,
  deleted boolean default false not null
);

create table if not exists public.library_collections (
  id uuid default gen_random_uuid() not null,
  owner_id uuid not null,
  owner_email text default ''::text not null,
  name text not null,
  cards jsonb default '[]'::jsonb not null,
  shared_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  level text default ''::text not null,
  price_tokens integer default 0 not null,
  owner_first_name text default ''::text not null,
  owner_last_name text default ''::text not null,
  summary text default ''::text not null,
  description text default ''::text not null,
  source_subject_id text,
  taxonomy jsonb default '{}'::jsonb not null,
  tags text[] default '{}'::text[] not null,
  card_count integer default 0 not null,
  link text
);

create table if not exists public.library_free_picks (
  user_id uuid not null,
  collection_id uuid not null,
  picked_at timestamp with time zone default now() not null
);

create table if not exists public.library_ratings (
  id uuid default gen_random_uuid() not null,
  collection_id uuid not null,
  user_id uuid not null,
  rating smallint not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.library_submissions (
  id uuid default gen_random_uuid() not null,
  owner_id uuid default auth.uid() not null,
  owner_first_name text default ''::text not null,
  owner_last_name text default ''::text not null,
  class_id uuid,
  class_name text default ''::text not null,
  shared_box_id uuid,
  source_subject_id text,
  name text not null,
  summary text default ''::text not null,
  description text default ''::text not null,
  taxonomy jsonb default '{}'::jsonb not null,
  tags text[] default '{}'::text[] not null,
  cards jsonb default '[]'::jsonb not null,
  status text default 'pending'::text not null,
  admin_note text default ''::text not null,
  collection_id uuid,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  link text
);

create table if not exists public.page_views (
  day date default CURRENT_DATE not null,
  path text not null,
  referrer text default ''::text not null,
  n integer default 0 not null
);

create table if not exists public.parental_consents (
  user_id uuid not null,
  parent_email text default ''::text not null,
  status text default 'pending'::text not null,
  token_hash text,
  token_expires_at timestamp with time zone,
  send_count integer default 0 not null,
  send_window_start timestamp with time zone,
  last_sent_at timestamp with time zone,
  answered_at timestamp with time zone,
  granted_by text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.referral_codes (
  user_id uuid not null,
  code text not null,
  created_at timestamp with time zone default now() not null
);

create table if not exists public.referrals (
  id bigint generated always as identity not null,
  referrer_id uuid,
  referee_id uuid not null,
  code text not null,
  plan text default ''::text not null,
  status text default 'pending'::text not null,
  reward_months integer default 0 not null,
  reward_cents integer default 0 not null,
  detail text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  rewarded_at timestamp with time zone
);

create table if not exists public.retention_settings (
  id boolean default true not null,
  enabled boolean default false not null,
  months integer default 24 not null,
  warn_days integer default 30 not null,
  remind_days integer default 7 not null,
  unconfirmed_days integer default 30 not null,
  max_per_run integer default 200 not null,
  updated_at timestamp with time zone default now() not null,
  updated_by uuid
);

create table if not exists public.reward_state (
  sync_code text not null,
  opened jsonb default '{}'::jsonb not null,
  updated_at timestamp with time zone default now() not null,
  tamagotchi jsonb
);

create table if not exists public.school_quotes (
  id uuid default gen_random_uuid() not null,
  kind text not null,
  number text not null,
  school_id uuid,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  created_by uuid
);

create table if not exists public.school_teachers (
  school_id uuid not null,
  email text not null,
  added_at timestamp with time zone default now() not null
);

create table if not exists public.schools (
  id uuid default gen_random_uuid() not null,
  manager_id uuid not null,
  name text not null,
  city text default ''::text not null,
  uai text default ''::text not null,
  billing_email text default ''::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.seller_info (
  id boolean default true not null,
  info jsonb default '{}'::jsonb not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.shared_boxes (
  id uuid default gen_random_uuid() not null,
  class_id uuid not null,
  shared_by uuid not null,
  subject_name text not null,
  cards jsonb default '[]'::jsonb not null,
  shared_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  folder_path jsonb default '[]'::jsonb not null,
  library_collection_id uuid,
  link text
);

create table if not exists public.shared_events (
  id uuid default gen_random_uuid() not null,
  class_id uuid not null,
  shared_by uuid not null,
  title text not null,
  date date not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  shared_by_name text default ''::text not null,
  box_ids jsonb default '[]'::jsonb not null
);

create table if not exists public.stripe_events (
  id text not null,
  type text default ''::text not null,
  received_at timestamp with time zone default now() not null
);

create table if not exists public.subjects (
  id text not null,
  sync_code text,
  name text not null,
  folder_id text,
  mode_id text default 'normal'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  deleted boolean default false not null,
  owner_id uuid default auth.uid() not null,
  payload jsonb
);

create table if not exists public.subscriptions (
  user_id uuid not null,
  status text default 'none'::text not null,
  plan text default ''::text not null,
  source text default 'manual'::text not null,
  current_period_end timestamp with time zone,
  note text default ''::text not null,
  updated_at timestamp with time zone default now() not null,
  updated_by uuid,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  quantity integer default 1 not null,
  cancel_at_period_end boolean default false not null,
  trial_used boolean default false not null,
  super_class_ids uuid[] default '{}'::uuid[] not null,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  started_at timestamp with time zone,
  collection_method text
);

do $x$ begin
alter table public.account_activity add constraint account_activity_pkey PRIMARY KEY (user_id, day);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.account_ages add constraint account_ages_birth_date_check CHECK ((birth_date >= '1900-01-01'::date));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.account_ages add constraint account_ages_pkey PRIMARY KEY (user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.account_ages add constraint account_ages_set_by_check CHECK ((set_by = ANY (ARRAY['user'::text, 'admin'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.admin_audit add constraint admin_audit_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.admins add constraint admins_pkey PRIMARY KEY (user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.calendar_events add constraint calendar_events_pkey PRIMARY KEY (owner_id, id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.card_reports add constraint card_reports_author_reply_len CHECK (((author_reply IS NULL) OR (length(author_reply) <= 2000)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.card_reports add constraint card_reports_message_check CHECK (((length(message) >= 1) AND (length(message) <= 2000)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.card_reports add constraint card_reports_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.card_reports add constraint card_reports_source_kind_check CHECK ((source_kind = ANY (ARRAY['library'::text, 'class'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.cards add constraint cards_pkey PRIMARY KEY (owner_id, id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_members add constraint class_members_pkey PRIMARY KEY (class_id, user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_members add constraint class_members_role_check CHECK ((role = ANY (ARRAY['student'::text, 'co-teacher'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_messages add constraint class_messages_body_len CHECK ((length(body) <= 4000)) NOT VALID;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_messages add constraint class_messages_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.classes add constraint classes_invite_code_key UNIQUE (invite_code);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.classes add constraint classes_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.client_errors add constraint client_errors_app_check CHECK ((app = ANY (ARRAY['app'::text, 'admin'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.client_errors add constraint client_errors_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.dev_settings add constraint dev_settings_pkey PRIMARY KEY (sync_code, account_email);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.dev_settings_public add constraint dev_settings_public_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.folders add constraint folders_pkey PRIMARY KEY (owner_id, id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.inactivity_notices add constraint inactivity_notices_pkey PRIMARY KEY (user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.inactivity_runs add constraint inactivity_runs_detail_check CHECK ((length(detail) <= 4000));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.inactivity_runs add constraint inactivity_runs_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.inactivity_runs add constraint inactivity_runs_trigger_check CHECK ((trigger = ANY (ARRAY['cron'::text, 'admin'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.learning_modes add constraint learning_modes_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_collections add constraint library_collections_link_check CHECK (((link IS NULL) OR ((link ~ '^https://'::text) AND (length(link) <= 500))));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_collections add constraint library_collections_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_free_picks add constraint library_free_picks_pkey PRIMARY KEY (user_id, collection_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_ratings add constraint library_ratings_collection_id_user_id_key UNIQUE (collection_id, user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_ratings add constraint library_ratings_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_ratings add constraint library_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_description_check CHECK ((length(description) <= 5000));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_link_check CHECK (((link IS NULL) OR ((link ~ '^https://'::text) AND (length(link) <= 500))));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_name_check CHECK (((length(name) >= 1) AND (length(name) <= 200)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'published'::text, 'rejected'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_summary_check CHECK ((length(summary) <= 500));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.page_views add constraint page_views_path_check CHECK (((length(path) >= 1) AND (length(path) <= 200)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.page_views add constraint page_views_pkey PRIMARY KEY (day, path, referrer);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.page_views add constraint page_views_referrer_check CHECK ((length(referrer) <= 100));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.parental_consents add constraint parental_consents_granted_by_check CHECK ((granted_by = ANY (ARRAY[''::text, 'parent'::text, 'admin'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.parental_consents add constraint parental_consents_pkey PRIMARY KEY (user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.parental_consents add constraint parental_consents_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'granted'::text, 'refused'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referral_codes add constraint referral_codes_code_check CHECK ((code ~ '^[A-Z0-9]{6,12}$'::text));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referral_codes add constraint referral_codes_code_key UNIQUE (code);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referral_codes add constraint referral_codes_pkey PRIMARY KEY (user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referrals add constraint referrals_detail_check CHECK ((length(detail) <= 500));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referrals add constraint referrals_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referrals add constraint referrals_referee_id_key UNIQUE (referee_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referrals add constraint referrals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'rewarded'::text, 'refused'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_id_check CHECK (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_max_per_run_check CHECK (((max_per_run >= 1) AND (max_per_run <= 5000)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_months_check CHECK (((months >= 6) AND (months <= 60)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_remind_days_check CHECK (((remind_days >= 0) AND (remind_days <= 30)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_unconfirmed_days_check CHECK (((unconfirmed_days >= 7) AND (unconfirmed_days <= 365)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_warn_days_check CHECK (((warn_days >= 7) AND (warn_days <= 90)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.reward_state add constraint reward_state_pkey PRIMARY KEY (sync_code);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_quotes add constraint school_quotes_kind_check CHECK ((kind = ANY (ARRAY['devis'::text, 'bon_de_commande'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_quotes add constraint school_quotes_number_key UNIQUE (number);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_quotes add constraint school_quotes_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_teachers add constraint school_teachers_email_check CHECK (((email = lower(email)) AND (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text) AND (length(email) <= 254)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_teachers add constraint school_teachers_pkey PRIMARY KEY (school_id, email);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.schools add constraint schools_billing_email_check CHECK ((length(billing_email) <= 254));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.schools add constraint schools_city_check CHECK ((length(city) <= 120));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.schools add constraint schools_manager_id_key UNIQUE (manager_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.schools add constraint schools_name_check CHECK (((length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM name)) <= 200)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.schools add constraint schools_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.schools add constraint schools_uai_check CHECK (((uai = ''::text) OR (uai ~ '^[0-9]{7}[A-Z]$'::text)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.seller_info add constraint seller_info_id_check CHECK (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.seller_info add constraint seller_info_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.shared_boxes add constraint shared_boxes_link_check CHECK (((link IS NULL) OR ((link ~ '^https://'::text) AND (length(link) <= 500))));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.shared_boxes add constraint shared_boxes_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.shared_events add constraint shared_events_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.stripe_events add constraint stripe_events_pkey PRIMARY KEY (id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subjects add constraint subjects_pkey PRIMARY KEY (owner_id, id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subscriptions add constraint subscriptions_note_check CHECK ((length(note) <= 2000));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subscriptions add constraint subscriptions_pkey PRIMARY KEY (user_id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subscriptions add constraint subscriptions_plan_check CHECK ((length(plan) <= 100));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subscriptions add constraint subscriptions_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'stripe'::text, 'apple'::text, 'google'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subscriptions add constraint subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'trial'::text, 'none'::text, 'canceled'::text, 'past_due'::text, 'incomplete'::text])));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

CREATE INDEX IF NOT EXISTS account_activity_day_idx ON public.account_activity USING btree (day);

CREATE INDEX IF NOT EXISTS admin_audit_at_idx ON public.admin_audit USING btree (at DESC);

CREATE INDEX IF NOT EXISTS card_reports_author_idx ON public.card_reports USING btree (author_id, resolved);

CREATE INDEX IF NOT EXISTS card_reports_reporter_created_idx ON public.card_reports USING btree (reporter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS card_reports_reporter_idx ON public.card_reports USING btree (reporter_id);

CREATE INDEX IF NOT EXISTS cards_owner_idx ON public.cards USING btree (owner_id);

CREATE INDEX IF NOT EXISTS cards_sync_code_idx ON public.cards USING btree (sync_code);

CREATE INDEX IF NOT EXISTS class_messages_class_id_created_at_idx ON public.class_messages USING btree (class_id, created_at);

CREATE INDEX IF NOT EXISTS class_messages_sender_created_idx ON public.class_messages USING btree (sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS classes_teacher_created_idx ON public.classes USING btree (teacher_id, created_at DESC);

CREATE INDEX IF NOT EXISTS client_errors_fp_idx ON public.client_errors USING btree (fingerprint, user_id, first_seen DESC);

CREATE INDEX IF NOT EXISTS client_errors_last_seen_idx ON public.client_errors USING btree (last_seen DESC);

CREATE INDEX IF NOT EXISTS folders_owner_idx ON public.folders USING btree (owner_id);

CREATE INDEX IF NOT EXISTS folders_sync_code_idx ON public.folders USING btree (sync_code);

CREATE INDEX IF NOT EXISTS learning_modes_sync_code_idx ON public.learning_modes USING btree (sync_code);

CREATE INDEX IF NOT EXISTS library_collections_level_idx ON public.library_collections USING btree (level);

CREATE INDEX IF NOT EXISTS library_collections_owner_created_idx ON public.library_collections USING btree (owner_id, shared_at DESC);

CREATE INDEX IF NOT EXISTS library_collections_owner_source_idx ON public.library_collections USING btree (owner_id, source_subject_id);

CREATE INDEX IF NOT EXISTS library_collections_shared_at_idx ON public.library_collections USING btree (shared_at DESC);

CREATE INDEX IF NOT EXISTS library_collections_tags_idx ON public.library_collections USING gin (tags);

CREATE INDEX IF NOT EXISTS library_collections_taxonomy_idx ON public.library_collections USING gin (taxonomy);

CREATE INDEX IF NOT EXISTS library_ratings_collection_idx ON public.library_ratings USING btree (collection_id);

CREATE INDEX IF NOT EXISTS library_submissions_owner_created_idx ON public.library_submissions USING btree (owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS library_submissions_status_idx ON public.library_submissions USING btree (status, created_at DESC);

CREATE INDEX IF NOT EXISTS parental_consents_token_idx ON public.parental_consents USING btree (token_hash);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals USING btree (referrer_id, created_at);

CREATE INDEX IF NOT EXISTS school_teachers_email_idx ON public.school_teachers USING btree (email);

CREATE INDEX IF NOT EXISTS shared_boxes_library_idx ON public.shared_boxes USING btree (class_id, shared_at) WHERE (library_collection_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS subjects_owner_idx ON public.subjects USING btree (owner_id);

CREATE INDEX IF NOT EXISTS subjects_sync_code_idx ON public.subjects USING btree (sync_code);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_customer_idx ON public.subscriptions USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL);

CREATE OR REPLACE FUNCTION public.account_last_active(p_uid uuid)
 RETURNS timestamp with time zone
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  select greatest(u.created_at, u.last_sign_in_at,
                  (select max(a.day)::timestamptz + interval '12 hours' from public.account_activity a where a.user_id = u.id))
    from auth.users u where u.id = p_uid;
$function$
;

CREATE OR REPLACE FUNCTION public.account_restricted()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.account_restricted_for(auth.uid());
$function$
;

CREATE OR REPLACE FUNCTION public.account_restricted_for(p_uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select p_uid is not null
     and exists (
       select 1 from public.account_ages a
        where a.user_id = p_uid
          and a.birth_date > (current_date - interval '15 years')::date
     )
     and not exists (
       select 1 from public.parental_consents c
        where c.user_id = p_uid and c.status = 'granted'
     )
     and not exists (select 1 from public.admins ad where ad.user_id = p_uid);
$function$
;

CREATE OR REPLACE FUNCTION public.admin_account_age(p_user uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  a public.account_ages;
  c public.parental_consents;
begin
  perform public.admin_assert();
  select * into a from public.account_ages where user_id = p_user;
  select * into c from public.parental_consents where user_id = p_user;
  return jsonb_build_object(
    'birth_date', a.birth_date,
    'birth_date_set_by', a.set_by,
    'age', case when a.birth_date is null then null
                else extract(year from age(current_date, a.birth_date))::int end,
    'restricted', public.account_restricted_for(p_user),
    'consent_status', c.status,
    'parent_email', c.parent_email,
    'last_sent_at', c.last_sent_at,
    'answered_at', c.answered_at,
    'granted_by', c.granted_by
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_add_admin(p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_assert()
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_audit_list(p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS TABLE(id bigint, at timestamp with time zone, admin_email text, action text, target text, details jsonb, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  return query
    select a.id, a.at, a.admin_email, a.action, a.target, a.details, count(*) over ()
      from public.admin_audit a
     order by a.at desc
     limit greatest(1, least(coalesce(p_limit, 100), 500)) offset greatest(0, coalesce(p_offset, 0));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_box_cards(p_owner uuid, p_box text)
 RETURNS TABLE(id text, question text, answer text, due_date timestamp with time zone, last_reviewed timestamp with time zone, review_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  return query
    select c.id, c.question, c.answer, c.due_date, c.last_reviewed, c.review_count
      from public.cards c
     where c.owner_id = p_owner and c.subject = p_box and not c.deleted
     order by c.created_at
     limit 500;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_boxes(p_search text DEFAULT ''::text, p_kind text DEFAULT 'all'::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id text, owner_id uuid, owner_email text, owner_name text, name text, kind text, in_revisions boolean, cards bigint, updated_at timestamp with time zone, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_class_detail(p_class uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_classes(p_search text DEFAULT ''::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, name text, invite_code text, teacher_id uuid, teacher_email text, teacher_name text, created_at timestamp with time zone, members bigint, shared_boxes bigint, messages bigint, last_message_at timestamp with time zone, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_client_errors(p_days integer DEFAULT 30)
 RETURNS TABLE(fingerprint text, app text, kind text, message text, stack text, accounts bigint, occurrences bigint, first_seen timestamp with time zone, last_seen timestamp with time zone, versions text[], pages text[], user_agents text[], emails text[])
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs.';
  end if;
  return query
  select e.fingerprint,
         min(e.app),
         min(e.kind),
         (array_agg(e.message order by e.last_seen desc))[1],
         (array_agg(e.stack order by e.last_seen desc))[1],
         count(distinct coalesce(e.user_id::text, 'anon-' || e.id)),
         sum(e.occurrences)::bigint,
         min(e.first_seen),
         max(e.last_seen),
         (array_agg(distinct e.app_version))[1:10],
         (array_agg(distinct e.page))[1:10],
         (array_agg(distinct e.user_agent))[1:5],
         (array_remove(array_agg(distinct u.email::text), null))[1:20]
    from public.client_errors e
    left join auth.users u on u.id = e.user_id
   where e.last_seen > now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 90)))
   group by e.fingerprint
   order by max(e.last_seen) desc
   limit 500;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_collections(p_search text DEFAULT ''::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, name text, owner_id uuid, owner_email text, owner_name text, cards integer, level text, taxonomy jsonb, tags text[], summary text, shared_at timestamp with time zone, updated_at timestamp with time zone, ratings bigint, rating_avg numeric, reports bigint, reports_open bigint, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_create_quote(p_kind text, p_school uuid, p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_prefix text;
  v_year text := to_char(now(), 'YYYY');
  v_n integer;
  v_number text;
  v_row public.school_quotes;
begin
  perform public.admin_assert();
  if p_kind not in ('devis', 'bon_de_commande') then
    raise exception 'invalid_kind';
  end if;
  if length(coalesce(p_payload, '{}'::jsonb)::text) > 20000 then
    raise exception 'payload_too_large';
  end if;
  v_prefix := case p_kind when 'devis' then 'DEV' else 'BC' end;
  perform pg_advisory_xact_lock(hashtext('school_quotes_' || p_kind));
  select coalesce(max(substring(number from '\d+$')::integer), 0) + 1 into v_n
    from public.school_quotes where kind = p_kind and number like v_prefix || '-' || v_year || '-%';
  v_number := v_prefix || '-' || v_year || '-' || lpad(v_n::text, 4, '0');
  insert into public.school_quotes (kind, number, school_id, payload, created_by)
  values (p_kind, v_number, p_school, coalesce(p_payload, '{}'::jsonb), auth.uid())
  returning * into v_row;
  perform public.admin_log('school.quote', v_number, jsonb_build_object('school', p_school, 'kind', p_kind));
  return to_jsonb(v_row);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_delete_collection(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  my_email text;
begin
  perform public.admin_assert();
  if exists (select 1 from public.admins a where a.user_id = p_user) then
    raise exception 'admin_account';
  end if;
  if exists (
    select 1 from public.subscriptions s
     where s.user_id = p_user and s.source in ('stripe', 'apple', 'google')
       and s.status in ('active', 'trial', 'past_due')
       and not s.cancel_at_period_end
       and (s.current_period_end is null or s.current_period_end > now())
  ) then
    raise exception 'active_subscription';
  end if;
  select email into my_email from auth.users where id = p_user;
  if my_email is null and not exists (select 1 from auth.users where id = p_user) then
    raise exception 'not_found';
  end if;
  perform public.admin_log('user.delete', p_user::text, jsonb_build_object('email', my_email));
  update public.dev_settings_public set updated_by = null where updated_by = p_user;
  if to_regclass('public.dev_settings') is not null and my_email is not null then
    execute 'delete from public.dev_settings where lower(account_email) = lower($1)' using my_email;
  end if;
  delete from auth.users where id = p_user;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_grant_parental_consent(p_user uuid, p_note text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  insert into public.parental_consents (user_id, status, answered_at, granted_by)
  values (p_user, 'granted', now(), 'admin')
  on conflict (user_id) do update
    set status = 'granted', answered_at = now(), granted_by = 'admin', token_hash = null, updated_at = now();
  perform public.admin_log('account.parental_consent', p_user::text, jsonb_build_object('note', coalesce(p_note, '')));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_admins()
 RETURNS TABLE(user_id uuid, email text, name text, added_at timestamp with time zone, added_by_email text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  return query
    select a.user_id, coalesce(u.email, a.email)::text, public.admin_user_label(a.user_id), a.added_at, coalesce(b.email, '')::text
      from public.admins a
      left join auth.users u on u.id = a.user_id
      left join auth.users b on b.id = a.added_by
     order by a.added_at;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_log(p_action text, p_target text, p_details jsonb)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  insert into public.admin_audit (admin_id, admin_email, action, target, details)
  values (auth.uid(), coalesce((select email from auth.users where id = auth.uid()), ''),
          p_action, coalesce(p_target, ''), coalesce(p_details, '{}'::jsonb));
$function$
;

CREATE OR REPLACE FUNCTION public.admin_overview()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_publish_submission(p_id uuid, p_patch jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  sub public.library_submissions;
  new_id uuid;
  v_name text;
  v_tax jsonb;
begin
  perform public.admin_assert();
  select * into sub from public.library_submissions where id = p_id for update;
  if not found then
    raise exception 'Proposition introuvable';
  end if;
  if sub.status = 'published' then
    raise exception 'Proposition déjà publiée';
  end if;
  v_name := coalesce(nullif(trim(p_patch ->> 'name'), ''), sub.name);
  v_tax := coalesce(p_patch -> 'taxonomy', sub.taxonomy);
  insert into public.library_collections (
    owner_id, owner_email, owner_first_name, owner_last_name, name, cards, level,
    price_tokens, summary, description, source_subject_id, taxonomy, tags, link)
  values (
    sub.owner_id,
    coalesce((select email from auth.users where id = sub.owner_id), ''),
    sub.owner_first_name, sub.owner_last_name, v_name,
    coalesce(p_patch -> 'cards', sub.cards),
    coalesce(v_tax -> 'niveau' ->> 'label', ''),
    0,
    coalesce(p_patch ->> 'summary', sub.summary),
    coalesce(p_patch ->> 'description', sub.description),
    sub.source_subject_id,
    v_tax,
    coalesce((select array_agg(x) from jsonb_array_elements_text(p_patch -> 'tags') x), sub.tags),
    case when p_patch ? 'link' then nullif(trim(p_patch ->> 'link'), '') else sub.link end)
  returning id into new_id;
  update public.library_submissions
     set status = 'published', collection_id = new_id, name = v_name,
         reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now(),
         admin_note = coalesce(p_patch ->> 'note', admin_note)
   where id = p_id;
  perform public.admin_log('submission.publish', p_id::text, jsonb_build_object('collection', new_id, 'name', v_name));
  return new_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_referrals(p_limit integer DEFAULT 200)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
begin
  perform public.admin_assert();
  return jsonb_build_object(
    'total', (select count(*) from public.referrals),
    'rewarded', (select count(*) from public.referrals where status = 'rewarded'),
    'months', (select coalesce(sum(reward_months), 0) from public.referrals where status = 'rewarded'),
    'list', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id, 'code', r.code, 'plan', r.plan, 'status', r.status, 'reward_months', r.reward_months,
               'reward_cents', r.reward_cents, 'detail', r.detail, 'created_at', r.created_at, 'rewarded_at', r.rewarded_at,
               'referrer_id', r.referrer_id, 'referrer_email', u1.email, 'referee_id', r.referee_id, 'referee_email', u2.email)
             order by r.created_at desc)
        from (select * from public.referrals order by created_at desc limit greatest(1, least(coalesce(p_limit, 200), 1000))) r
        left join auth.users u1 on u1.id = r.referrer_id
        left join auth.users u2 on u2.id = r.referee_id), '[]'::jsonb)
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_reject_submission(p_id uuid, p_note text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  update public.library_submissions
     set status = 'rejected', admin_note = coalesce(p_note, ''),
         reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
   where id = p_id;
  perform public.admin_log('submission.reject', p_id::text, jsonb_build_object('note', p_note));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_remove_admin(p_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  if (select count(*) from public.admins) <= 1 then
    raise exception 'Impossible de retirer le dernier administrateur';
  end if;
  delete from public.admins where user_id = p_user;
  perform public.admin_log('admin.remove', p_user::text,
    jsonb_build_object('email', (select email from auth.users where id = p_user)));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_reports(p_status text DEFAULT 'open'::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, created_at timestamp with time zone, source_kind text, source_id text, box_name text, card_question text, card_answer text, message text, resolved boolean, resolved_at timestamp with time zone, resolved_question text, resolved_answer text, author_reply text, reporter_id uuid, reporter_name text, reporter_email text, author_id uuid, author_name text, author_email text, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_retention_overview()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  st public.retention_settings;
  r jsonb;
begin
  perform public.admin_assert();
  select * into st from public.retention_settings where id;
  with c as (
    select x.*, public.inactivity_exempt(x.user_id, now() - make_interval(months => st.months)) as exempt
      from public.inactivity_candidates() x
  ), soon as (
    select x.*, public.inactivity_exempt(x.user_id, now() - make_interval(months => st.months)) as exempt
      from public.inactivity_candidates(now() + interval '30 days') x
  )
  select jsonb_build_object(
    'settings', to_jsonb(st) - 'id' - 'updated_by',
    'now', jsonb_build_object(
      'warn', (select count(*) from c where action = 'warn' and not exempt),
      'remind', (select count(*) from c where action = 'remind' and not exempt),
      'delete', (select count(*) from c where action = 'delete' and not exempt),
      'delete_unconfirmed', (select count(*) from c where action = 'delete_unconfirmed' and not exempt),
      'exempt', (select count(*) from c where action is not null and exempt)),
    'next30', jsonb_build_object(
      'warn', (select count(*) from soon where action = 'warn' and not exempt),
      'delete', (select count(*) from soon where action in ('delete', 'delete_unconfirmed') and not exempt)),
    'pending_notices', (select count(*) from public.inactivity_notices),
    'list', coalesce((
      select jsonb_agg(jsonb_build_object('user_id', user_id, 'email', email, 'action', action,
                                          'last_active', last_active, 'delete_on', delete_on) order by last_active)
        from (select * from c where action is not null and not exempt order by last_active limit 100) l), '[]'::jsonb),
    'notices', coalesce((
      select jsonb_agg(jsonb_build_object('user_id', n.user_id, 'email', u.email, 'warned_at', n.warned_at,
                                          'reminded_at', n.reminded_at, 'delete_on', n.delete_on) order by n.delete_on)
        from (select * from public.inactivity_notices order by delete_on limit 100) n
        join auth.users u on u.id = n.user_id), '[]'::jsonb),
    'runs', coalesce((
      select jsonb_agg(to_jsonb(x) order by x.ran_at desc)
        from (select * from public.inactivity_runs order by ran_at desc limit 20) x), '[]'::jsonb),
    'activity_since', (select min(day) from public.account_activity)
  ) into r;
  return r;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_school_detail(p_school uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  seats integer;
begin
  perform public.admin_assert();
  seats := public.school_subscription_live(p_school);
  return (
    select jsonb_build_object(
      'teachers', coalesce((
        select jsonb_agg(jsonb_build_object(
                 'email', t.email, 'added_at', t.added_at, 'user_id', t.uid0,
                 'has_account', t.uid0 is not null and t.confirmed,
                 'name', trim(coalesce(tu.raw_user_meta_data ->> 'first_name', '') || ' ' || coalesce(tu.raw_user_meta_data ->> 'last_name', '')),
                 'covered', t.seat_rank is not null and t.seat_rank <= seats,
                 'classes', (select count(*) from public.classes k where k.teacher_id = t.uid0),
                 'last_active', case when t.uid0 is not null then public.account_last_active(t.uid0) end
               ) order by t.added_at, t.email)
          from (select t0.*, u0.id as uid0, u0.email_confirmed_at is not null as confirmed,
                       case when u0.id is not null and u0.email_confirmed_at is not null
                            then row_number() over (partition by (u0.id is not null and u0.email_confirmed_at is not null) order by t0.added_at, t0.email)
                       end as seat_rank
                  from public.school_teachers t0
                  left join auth.users u0 on lower(u0.email) = t0.email
                 where t0.school_id = p_school) t
          left join auth.users tu on tu.id = t.uid0), '[]'::jsonb),
      'quotes', coalesce((
        select jsonb_agg(jsonb_build_object('id', q.id, 'number', q.number, 'kind', q.kind, 'created_at', q.created_at,
                                            'seats', q.payload ->> 'seats', 'total', q.payload ->> 'total') order by q.created_at desc)
          from public.school_quotes q where q.school_id = p_school), '[]'::jsonb)
    ));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_schools()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
begin
  perform public.admin_assert();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'id', sc.id, 'name', sc.name, 'city', sc.city, 'uai', sc.uai, 'billing_email', sc.billing_email,
             'created_at', sc.created_at,
             'manager_id', sc.manager_id, 'manager_email', u.email,
             'manager_name', trim(coalesce(u.raw_user_meta_data ->> 'first_name', '') || ' ' || coalesce(u.raw_user_meta_data ->> 'last_name', '')),
             'seats', public.school_subscription_live(sc.id),
             'status', s.status, 'plan', s.plan, 'quantity', s.quantity, 'period_end', s.current_period_end,
             'cancel_at_period_end', s.cancel_at_period_end, 'collection_method', s.collection_method,
             'stripe_customer_id', s.stripe_customer_id,
             'teachers', (select count(*) from public.school_teachers t where t.school_id = sc.id),
             'teachers_with_account', (select count(*) from public.school_teachers t
                                         join auth.users tu on lower(tu.email) = t.email and tu.email_confirmed_at is not null
                                        where t.school_id = sc.id)
           ) order by sc.name)
      from public.schools sc
      join auth.users u on u.id = sc.manager_id
      left join public.subscriptions s on s.user_id = sc.manager_id), '[]'::jsonb);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_birth_date(p_user uuid, p_date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  if p_date is null then
    delete from public.account_ages where user_id = p_user;
  else
    if p_date > current_date or p_date < date '1900-01-01' then
      raise exception 'invalid_birth_date';
    end if;
    insert into public.account_ages (user_id, birth_date, set_by)
    values (p_user, p_date, 'admin')
    on conflict (user_id) do update set birth_date = excluded.birth_date, set_by = 'admin', updated_at = now();
  end if;
  perform public.admin_log('account.birth_date', p_user::text, jsonb_build_object('birth_date', p_date));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_retention(p_enabled boolean, p_months integer, p_warn_days integer, p_remind_days integer, p_unconfirmed_days integer, p_max_per_run integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  update public.retention_settings
     set enabled = coalesce(p_enabled, enabled),
         months = coalesce(p_months, months),
         warn_days = coalesce(p_warn_days, warn_days),
         remind_days = coalesce(p_remind_days, remind_days),
         unconfirmed_days = coalesce(p_unconfirmed_days, unconfirmed_days),
         max_per_run = coalesce(p_max_per_run, max_per_run),
         updated_at = now(), updated_by = auth.uid()
   where id;
  perform public.admin_log('retention.settings', '', jsonb_build_object('enabled', p_enabled, 'months', p_months,
    'warn_days', p_warn_days, 'remind_days', p_remind_days, 'unconfirmed_days', p_unconfirmed_days, 'max_per_run', p_max_per_run));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_seller_info(p_info jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  if length(coalesce(p_info, '{}'::jsonb)::text) > 5000 then
    raise exception 'payload_too_large';
  end if;
  update public.seller_info set info = coalesce(p_info, '{}'::jsonb), updated_at = now() where id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_subscription(p_user uuid, p_status text, p_plan text DEFAULT ''::text, p_until timestamp with time zone DEFAULT NULL::timestamp with time zone, p_note text DEFAULT ''::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  perform public.admin_assert();
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'Compte introuvable';
  end if;
  if p_status = 'default' then
    if exists (select 1 from public.subscriptions where user_id = p_user and stripe_customer_id is not null) then
      update public.subscriptions
         set status = 'canceled', plan = '', source = 'manual', current_period_end = null,
             note = coalesce(p_note, ''), updated_at = now(), updated_by = auth.uid()
       where user_id = p_user;
    else
      delete from public.subscriptions where user_id = p_user;
    end if;
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_stats(p_days integer DEFAULT 90)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  d integer := greatest(14, least(coalesce(p_days, 90), 365));
  r jsonb;
begin
  perform public.admin_assert();
  with live as (
    select s.* from public.subscriptions s
     where s.status in ('active', 'trial', 'past_due')
       and (s.current_period_end is null or s.current_period_end > now())
  ), weeks as (
    select generate_series(date_trunc('week', current_date) - interval '11 weeks', date_trunc('week', current_date), interval '1 week')::date as w
  )
  select jsonb_build_object(
    'activity_since', (select min(day) from public.account_activity),
    'dau', (select count(*) from public.account_activity where day = current_date),
    'wau', (select count(distinct user_id) from public.account_activity where day > current_date - 7),
    'mau', (select count(distinct user_id) from public.account_activity where day > current_date - 30),
    'users_total', (select count(*) from auth.users),
    'active_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', g::date, 'n', coalesce(x.n, 0)) order by g), '[]'::jsonb)
        from generate_series(current_date - (d - 1), current_date, interval '1 day') g
        left join (select day, count(*) as n from public.account_activity where day > current_date - d group by day) x on x.day = g::date),
    'signups_by_week', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'week', w.w,
               'eleve', (select count(*) from auth.users u where u.created_at >= w.w and u.created_at < w.w + 7
                           and coalesce(u.raw_user_meta_data -> 'usages', '[]'::jsonb) ? 'eleve'),
               'enseignant', (select count(*) from auth.users u where u.created_at >= w.w and u.created_at < w.w + 7
                           and coalesce(u.raw_user_meta_data -> 'usages', '[]'::jsonb) ? 'enseignant'
                           and not coalesce(u.raw_user_meta_data -> 'usages', '[]'::jsonb) ? 'eleve'),
               'autre', (select count(*) from auth.users u where u.created_at >= w.w and u.created_at < w.w + 7
                           and not coalesce(u.raw_user_meta_data -> 'usages', '[]'::jsonb) ?| array['eleve', 'enseignant'])
             ) order by w.w), '[]'::jsonb) from weeks w),
    'retention', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'week', w.w,
               'size', (select count(*) from auth.users u where u.created_at >= w.w and u.created_at < w.w + 7),
               'd1_7', (select count(*) from auth.users u where u.created_at >= w.w and u.created_at < w.w + 7
                          and exists (select 1 from public.account_activity a where a.user_id = u.id
                                       and a.day > u.created_at::date and a.day <= u.created_at::date + 7)),
               'd28_35', (select count(*) from auth.users u where u.created_at >= w.w and u.created_at < w.w + 7
                          and exists (select 1 from public.account_activity a where a.user_id = u.id
                                       and a.day >= u.created_at::date + 28 and a.day <= u.created_at::date + 35)),
               'complete7', w.w + 14 <= current_date,
               'complete35', w.w + 42 <= current_date
             ) order by w.w), '[]'::jsonb) from weeks w),
    'usages', jsonb_build_object(
      'eleve', (select count(*) from auth.users u where coalesce(u.raw_user_meta_data -> 'usages', '[]'::jsonb) ? 'eleve'),
      'enseignant', (select count(*) from auth.users u where coalesce(u.raw_user_meta_data -> 'usages', '[]'::jsonb) ? 'enseignant'),
      'perso', (select count(*) from auth.users u where coalesce(u.raw_user_meta_data -> 'usages', '[]'::jsonb) ? 'perso'),
      'aucun', (select count(*) from auth.users u where jsonb_array_length(case when jsonb_typeof(u.raw_user_meta_data -> 'usages') = 'array'
                                                                             then u.raw_user_meta_data -> 'usages' else '[]'::jsonb end) = 0)),
    'plans', coalesce((select jsonb_object_agg(k, v) from (
        select coalesce(nullif(plan, ''), 'manuel') as k,
               jsonb_build_object('n', count(*), 'qty', sum(quantity), 'trial', count(*) filter (where status = 'trial'),
                                  'canceling', count(*) filter (where cancel_at_period_end)) as v
          from live group by 1) p), '{}'::jsonb),
    'mrr_cents', (
      select coalesce(sum(case plan
               when 'individuel' then 200
               when 'individuel_annuel' then 2000 / 12.0
               when 'super_enseignant' then 100 * greatest(quantity, 3)
               when 'super_enseignant_annuel' then 1000 * greatest(quantity, 3) / 12.0
               when 'super_ecole' then 5000 * quantity / 12.0
               else 0 end), 0)::integer
        from live where source = 'stripe' and status <> 'trial'),
    'new_subs_by_month', (
      select coalesce(jsonb_agg(jsonb_build_object('month', m::date,
               'n', (select count(*) from public.subscriptions s where s.source = 'stripe' and s.started_at >= m and s.started_at < m + interval '1 month'))
             order by m), '[]'::jsonb)
        from generate_series(date_trunc('month', current_date) - interval '5 months', date_trunc('month', current_date), interval '1 month') m),
    'conversion', jsonb_build_object(
      'signups_90d', (select count(*) from auth.users where created_at > now() - interval '90 days'),
      'paying_90d', (select count(*) from auth.users u join live s on s.user_id = u.id
                      where u.created_at > now() - interval '90 days' and s.source = 'stripe' and s.status <> 'trial'),
      'paying_total', (select count(*) from live where source = 'stripe' and status <> 'trial'),
      'trial_total', (select count(*) from live where status = 'trial')),
    'top_library', coalesce((
      select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'accounts', t.n, 'active30', t.a) order by t.n desc)
        from (select lc.id, lc.name, count(distinct s.owner_id) as n,
                     count(distinct s.owner_id) filter (where exists (
                       select 1 from public.account_activity a where a.user_id = s.owner_id and a.day > current_date - 30)) as a
                from public.subjects s
                join public.library_collections lc on lc.id::text = s.payload ->> 'libraryOriginId'
               where not s.deleted
               group by lc.id, lc.name
               order by n desc limit 20) t), '[]'::jsonb),
    'classes', jsonb_build_object(
      'total', (select count(*) from public.classes),
      'with_members', (select count(*) from public.classes k where exists (select 1 from public.class_members m where m.class_id = k.id)),
      'active_members_30d', (select count(distinct m.user_id) from public.class_members m
                              join public.account_activity a on a.user_id = m.user_id and a.day > current_date - 30)),
    'site_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('day', g::date, 'n', coalesce(x.n, 0)) order by g), '[]'::jsonb)
        from generate_series(current_date - (d - 1), current_date, interval '1 day') g
        left join (select day, sum(n) as n from public.page_views where day > current_date - d group by day) x on x.day = g::date),
    'site_pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'n', n) order by n desc)
        from (select path, sum(n) as n from public.page_views where day > current_date - 30 group by path order by 2 desc limit 15) p), '[]'::jsonb),
    'site_referrers', coalesce((
      select jsonb_agg(jsonb_build_object('referrer', referrer, 'n', n) order by n desc)
        from (select referrer, sum(n) as n from public.page_views where day > current_date - 30 and referrer <> ''
               group by referrer order by 2 desc limit 10) p), '[]'::jsonb)
  ) into r;
  return r;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_submission_latest_cards(p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  res jsonb;
begin
  perform public.admin_assert();
  select b.cards into res
    from public.library_submissions s
    join public.shared_boxes b on b.id = s.shared_box_id
   where s.id = p_id;
  return res;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_subscriptions(p_status text DEFAULT 'all'::text, p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS TABLE(user_id uuid, email text, name text, status text, plan text, source text, current_period_end timestamp with time zone, note text, updated_at timestamp with time zone, updated_by_email text, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_user_detail(p_user uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_user_label(p_user uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(nullif(trim(coalesce(u.raw_user_meta_data->>'first_name', '') || ' ' ||
                              coalesce(u.raw_user_meta_data->>'last_name', '')), ''), u.email, '')
    from auth.users u where u.id = p_user;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_users(p_search text DEFAULT ''::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_sort text DEFAULT 'created'::text)
 RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, usages jsonb, created_at timestamp with time zone, last_sign_in_at timestamp with time zone, cards bigint, boxes bigint, classes_taught bigint, classes_joined bigint, collections bigint, sub_status text, sub_plan text, sub_until timestamp with time zone, is_admin boolean, total bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.card_reports_mark_seen(p_ids uuid[])
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  update public.card_reports
     set reporter_seen_at = now()
   where id = any(p_ids)
     and reporter_id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.card_reports_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.is_admin() then
    return new;
  end if;
  perform public.rate_limit_check(
    (select count(*) from public.card_reports where reporter_id = new.reporter_id and created_at > now() - interval '1 hour'), 15, 'signalements');
  perform public.rate_limit_check(
    (select count(*) from public.card_reports where reporter_id = new.reporter_id and created_at > now() - interval '1 day'), 60, 'signalements');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.class_library_access(p_class uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.shared_boxes b
                  where b.class_id = p_class and b.library_collection_id is not null
                    and public.shared_box_library_access(b.id));
$function$
;

CREATE OR REPLACE FUNCTION public.class_member_count(p_class_id uuid)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select count(*)::integer from public.class_members where class_id = p_class_id;
$function$
;

CREATE OR REPLACE FUNCTION public.class_members_list(p_class_id uuid)
 RETURNS TABLE(user_id uuid, joined_at timestamp with time zone, first_name text, last_name text, email text, role text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not (public.is_teacher_of_class(p_class_id) or public.is_member_of_class(p_class_id)) then
    return;
  end if;
  return query
    select x.user_id, x.joined_at, x.first_name, x.last_name, ''::text, x.role
      from (
        select m.user_id, m.joined_at,
               coalesce(u.raw_user_meta_data->>'first_name', '')::text as first_name,
               coalesce(u.raw_user_meta_data->>'last_name', '')::text as last_name,
               'student'::text as role
          from public.class_members m
          join auth.users u on u.id = m.user_id
         where m.class_id = p_class_id
        union all
        select c.teacher_id, c.created_at,
               coalesce(u.raw_user_meta_data->>'first_name', '')::text,
               coalesce(u.raw_user_meta_data->>'last_name', '')::text,
               'teacher'::text
          from public.classes c
          join auth.users u on u.id = c.teacher_id
         where c.id = p_class_id
      ) x
     order by x.role desc, x.last_name, x.first_name;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.class_messages_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.is_admin() then
    return new;
  end if;
  perform public.rate_limit_check(
    (select count(*) from public.class_messages where sender_id = new.sender_id and created_at > now() - interval '1 minute'), 20, 'messages');
  perform public.rate_limit_check(
    (select count(*) from public.class_messages where sender_id = new.sender_id and created_at > now() - interval '1 day'), 300, 'messages');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.class_messages_strip_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.sender_email := '';
  if position('@' in coalesce(new.sender_name, '')) > 0 then
    new.sender_name := '';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.classes_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.is_admin() then
    return new;
  end if;
  perform public.rate_limit_check(
    (select count(*) from public.classes where teacher_id = new.teacher_id and created_at > now() - interval '1 day'), 20, 'créations de classes');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.count_page_view(p_path text, p_referrer text DEFAULT ''::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_path text := left(regexp_replace(coalesce(p_path, ''), '[?#].*$', ''), 200);
  v_ref text := lower(left(coalesce(p_referrer, ''), 100));
begin
  if v_path !~ '^/[A-Za-z0-9/._-]*$' then
    return;
  end if;
  if v_ref !~ '^[a-z0-9.-]*$' then
    v_ref := '';
  end if;
  -- Garde-fou : pas plus de 2 000 pages différentes par jour.
  if (select count(*) from public.page_views where day = current_date) >= 2000
     and not exists (select 1 from public.page_views where day = current_date and path = v_path and referrer = v_ref) then
    return;
  end if;
  insert into public.page_views (day, path, referrer, n) values (current_date, v_path, v_ref, 1)
  on conflict (day, path, referrer) do update set n = public.page_views.n + 1;
  delete from public.page_views where day < current_date - 800;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_my_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
       and s.status in ('active', 'trial', 'past_due')
       and not s.cancel_at_period_end
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
$function$
;

CREATE OR REPLACE FUNCTION public.fiches_random_class_code()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.classes where invite_code = code);
  end loop;
  return code;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.has_library_access()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- v238 : Super enseignant désigné par son établissement.
  if public.school_teacher_active(uid) then
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
$function$
;

CREATE OR REPLACE FUNCTION public.inactivity_candidates(p_now timestamp with time zone DEFAULT now())
 RETURNS TABLE(user_id uuid, email text, first_name text, action text, last_active timestamp with time zone, delete_on timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  st public.retention_settings;
begin
  select * into st from public.retention_settings where id;
  return query
  with base as (
    select u.id, u.email::text as email, coalesce(u.raw_user_meta_data ->> 'first_name', '')::text as first_name,
           u.email_confirmed_at, u.created_at,
           public.account_last_active(u.id) as last_active,
           n.warned_at, n.reminded_at, n.delete_on as notice_delete_on,
           exists (select 1 from public.account_activity a where a.user_id = u.id) as ever_active
      from auth.users u
      left join public.inactivity_notices n on n.user_id = u.id
  )
  select b.id, b.email, b.first_name,
         case
           when b.email_confirmed_at is null and b.warned_at is null and not b.ever_active
                and b.created_at < p_now - make_interval(days => st.unconfirmed_days)
                and b.last_active < p_now - make_interval(days => st.unconfirmed_days)
             then 'delete_unconfirmed'
           when b.warned_at is not null and b.last_active < b.warned_at and p_now >= b.notice_delete_on
             then 'delete'
           when b.warned_at is not null and b.last_active < b.warned_at and b.reminded_at is null
                and st.remind_days > 0 and p_now >= b.notice_delete_on - make_interval(days => st.remind_days)
                and p_now >= b.warned_at + interval '2 days'
             then 'remind'
           when b.warned_at is null and b.email_confirmed_at is not null
                and p_now >= b.last_active + make_interval(months => st.months) - make_interval(days => st.warn_days)
             then 'warn'
         end as action,
         b.last_active,
         case when b.warned_at is not null then b.notice_delete_on
              else greatest(b.last_active + make_interval(months => st.months), p_now + make_interval(days => st.warn_days)) end
    from base b
   where (b.warned_at is not null and b.last_active < b.warned_at)
      or (b.warned_at is null and (
            (b.email_confirmed_at is not null and p_now >= b.last_active + make_interval(months => st.months) - make_interval(days => st.warn_days))
         or (b.email_confirmed_at is null and not b.ever_active and b.created_at < p_now - make_interval(days => st.unconfirmed_days))));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.inactivity_delete(p_uid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  st public.retention_settings;
  c record;
  my_email text;
begin
  select * into st from public.retention_settings where id;
  select * into c from public.inactivity_candidates() x where x.user_id = p_uid;
  if not found or c.action not in ('delete', 'delete_unconfirmed') then
    return false;
  end if;
  if public.inactivity_exempt(p_uid, now() - make_interval(months => st.months)) then
    return false;
  end if;
  select email into my_email from auth.users where id = p_uid;
  update public.dev_settings_public set updated_by = null where updated_by = p_uid;
  if to_regclass('public.dev_settings') is not null and my_email is not null then
    execute 'delete from public.dev_settings where lower(account_email) = lower($1)' using my_email;
  end if;
  delete from auth.users where id = p_uid;
  return true;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.inactivity_due(p_limit integer DEFAULT 200)
 RETURNS TABLE(user_id uuid, email text, first_name text, action text, last_active timestamp with time zone, delete_on timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  st public.retention_settings;
begin
  select * into st from public.retention_settings where id;
  delete from public.inactivity_notices n
   where public.account_last_active(n.user_id) >= n.warned_at
      or public.inactivity_exempt(n.user_id, n.warned_at - make_interval(months => st.months));
  return query
  select c.* from public.inactivity_candidates() c
   where c.action is not null
     and not public.inactivity_exempt(c.user_id, now() - make_interval(months => st.months))
   order by case c.action when 'delete' then 0 when 'delete_unconfirmed' then 1 when 'remind' then 2 else 3 end, c.last_active
   limit greatest(1, least(coalesce(p_limit, 200), 5000));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.inactivity_exempt(p_uid uuid, p_since timestamp with time zone)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  select exists (select 1 from public.admins a where a.user_id = p_uid)
      or exists (select 1 from public.subscriptions s
                  where s.user_id = p_uid and s.status in ('active', 'trial', 'past_due')
                    and (s.current_period_end is null or s.current_period_end > now()))
      or public.school_teacher_active(p_uid)
      or exists (select 1 from public.schools sc where sc.manager_id = p_uid and public.school_subscription_live(sc.id) > 0)
      or exists (select 1 from public.classes k
                   join public.class_members m on m.class_id = k.id
                   join public.account_activity a on a.user_id = m.user_id
                  where k.teacher_id = p_uid and a.day >= p_since::date);
$function$
;

CREATE OR REPLACE FUNCTION public.inactivity_log_run(p_dry boolean, p_trigger text, p_warned integer, p_reminded integer, p_deleted integer, p_unconfirmed integer, p_errors integer, p_detail text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  insert into public.inactivity_runs (dry_run, trigger, warned, reminded, deleted, deleted_unconfirmed, errors, detail)
  values (coalesce(p_dry, false), case when p_trigger = 'admin' then 'admin' else 'cron' end,
          coalesce(p_warned, 0), coalesce(p_reminded, 0), coalesce(p_deleted, 0), coalesce(p_unconfirmed, 0),
          coalesce(p_errors, 0), left(coalesce(p_detail, ''), 4000));
  delete from public.inactivity_runs where ran_at < now() - interval '400 days';
$function$
;

CREATE OR REPLACE FUNCTION public.inactivity_mark(p_uid uuid, p_kind text, p_delete_on timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_kind = 'warn' then
    insert into public.inactivity_notices (user_id, warned_at, delete_on)
    values (p_uid, now(), p_delete_on)
    on conflict (user_id) do update set warned_at = now(), reminded_at = null, delete_on = excluded.delete_on;
  elsif p_kind = 'remind' then
    update public.inactivity_notices set reminded_at = now() where user_id = p_uid;
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$function$
;

CREATE OR REPLACE FUNCTION public.is_member_of_class(p_class_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.class_members where class_id = p_class_id and user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_teacher_of_class(p_class_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.classes where id = p_class_id and teacher_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.join_class_by_code(p_code text)
 RETURNS classes
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_class public.classes;
begin
  if public.account_restricted() then
    raise exception 'parental_consent_required';
  end if;
  select * into v_class from public.classes where invite_code = upper(trim(p_code));
  if v_class.id is null then
    raise exception 'Code invalide';
  end if;

  insert into public.class_members (class_id, user_id, role)
  values (v_class.id, auth.uid(), 'student')
  on conflict (class_id, user_id) do nothing;

  return v_class;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.library_collection_cards(p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  col record;
  full_access boolean;
  preview jsonb;
begin
  select lc.owner_id, lc.cards into col from public.library_collections lc where lc.id = p_id;
  if not found then
    return null;
  end if;
  full_access := auth.uid() is not null and (
    col.owner_id = auth.uid()
    or public.has_library_access()
    or exists (select 1 from public.library_free_picks p where p.user_id = auth.uid() and p.collection_id = p_id)
  );
  if full_access then
    return jsonb_build_object('full', true, 'cards', coalesce(col.cards, '[]'::jsonb));
  end if;
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
$function$
;

CREATE OR REPLACE FUNCTION public.library_collections_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.is_admin() then
    return new;
  end if;
  perform public.rate_limit_check(
    (select count(*) from public.library_collections where owner_id = new.owner_id and shared_at > now() - interval '1 day'), 30, 'publications');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.library_collections_set_card_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.card_count := case when jsonb_typeof(new.cards) = 'array' then jsonb_array_length(new.cards) else 0 end;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.library_preview_text(p_html text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.library_submissions_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.is_admin() then
    return new;
  end if;
  perform public.rate_limit_check(
    (select count(*) from public.library_submissions where owner_id = new.owner_id and created_at > now() - interval '1 day'), 20, 'propositions');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.merge_summary_description(p_summary text, p_description text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare
  a text := btrim(coalesce(p_summary, ''));
  b text := btrim(coalesce(p_description, ''));
  na text;
  nb text;
begin
  if a = '' then return b; end if;
  if b = '' then return a; end if;
  na := regexp_replace(lower(a), '[[:space:].!?…]+$', '');
  nb := regexp_replace(lower(b), '[[:space:].!?…]+$', '');
  if left(lower(b), length(na)) = na then return b; end if;
  if position(nb in lower(a)) > 0 then return a; end if;
  return a || case when a ~ '[.!?…:]$' then '' else '.' end || ' ' || b;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.my_account_status()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uid uuid := auth.uid();
  a public.account_ages;
  c public.parental_consents;
begin
  if uid is null then
    return null;
  end if;
  select * into a from public.account_ages where user_id = uid;
  select * into c from public.parental_consents where user_id = uid;
  return jsonb_build_object(
    'birth_date', a.birth_date,
    'age', case when a.birth_date is null then null
                else extract(year from age(current_date, a.birth_date))::int end,
    'restricted', public.account_restricted_for(uid),
    'consent_status', c.status,
    'parent_email', c.parent_email,
    'last_sent_at', c.last_sent_at
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.my_covered_classes()
 RETURNS uuid[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(array_agg(c.id), '{}')
    from public.classes c
   where (c.teacher_id = auth.uid()
          or exists (select 1 from public.class_members m where m.class_id = c.id and m.user_id = auth.uid()))
     and public.class_library_access(c.id);
$function$
;

CREATE OR REPLACE FUNCTION public.my_covered_library_boxes()
 RETURNS uuid[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce(array_agg(b.id), '{}')
    from public.shared_boxes b
    join public.classes c on c.id = b.class_id
   where b.library_collection_id is not null
     and (c.teacher_id = auth.uid()
          or exists (select 1 from public.class_members m where m.class_id = c.id and m.user_id = auth.uid()))
     and public.shared_box_library_access(b.id);
$function$
;

CREATE OR REPLACE FUNCTION public.my_library_class_usage()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'quota', public.teacher_library_quota(auth.uid()),
    'classes', coalesce((select jsonb_agg(jsonb_build_object('class_id', t.class_id, 'name', c.name, 'rank', t.rank, 'boxes', t.boxes) order by t.rank)
                           from public.teacher_library_classes(auth.uid()) t join public.classes c on c.id = t.class_id), '[]'::jsonb)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.my_library_rights()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'full', public.has_library_access(),
    'free_limit', public.policy_int('freeLibraryBoxes', 2),
    'free_picks', coalesce((select jsonb_agg(p.collection_id order by p.picked_at)
                              from public.library_free_picks p where p.user_id = auth.uid()), '[]'::jsonb)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.my_referral()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  s public.subscriptions;
  v_code text;
  i integer := 0;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  s := public.subscription_live_row(auth.uid());
  if s.user_id is null or s.status <> 'active' or s.source <> 'stripe' or s.plan = 'super_ecole' then
    return jsonb_build_object('eligible', false);
  end if;
  select code into v_code from public.referral_codes where user_id = auth.uid();
  while v_code is null and i < 10 loop
    v_code := upper(substr(translate(replace(gen_random_uuid()::text, '-', ''), '01', ''), 1, 8));
    begin
      if length(v_code) >= 6 then
        insert into public.referral_codes (user_id, code) values (auth.uid(), v_code);
      else
        v_code := null;
      end if;
    exception when unique_violation then
      v_code := null;
    end;
    i := i + 1;
  end loop;
  return jsonb_build_object(
    'eligible', true,
    'code', v_code,
    'months', public.policy_int('referralMonths', 2),
    'friend_months', public.policy_int('referralFriendMonths', 1),
    'rewarded', (select count(*) from public.referrals r where r.referrer_id = auth.uid() and r.status = 'rewarded'),
    'pending', (select count(*) from public.referrals r where r.referrer_id = auth.uid() and r.status = 'pending'),
    'months_earned', (select coalesce(sum(r.reward_months), 0) from public.referrals r where r.referrer_id = auth.uid() and r.status = 'rewarded')
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.my_school()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  sc public.schools;
  seats integer;
  res jsonb;
begin
  if auth.uid() is null then
    return null;
  end if;
  select * into sc from public.schools where manager_id = auth.uid();
  if not found then
    return null;
  end if;
  seats := public.school_subscription_live(sc.id);
  select jsonb_build_object(
    'id', sc.id, 'name', sc.name, 'city', sc.city, 'uai', sc.uai, 'billing_email', sc.billing_email,
    'seats', seats,
    'teachers', coalesce((
      select jsonb_agg(jsonb_build_object(
               'email', t.email,
               'has_account', u.id is not null and u.email_confirmed_at is not null,
               'name', trim(coalesce(u.raw_user_meta_data ->> 'first_name', '') || ' ' || coalesce(u.raw_user_meta_data ->> 'last_name', '')),
               'covered', t.seat_rank is not null and t.seat_rank <= seats
             ) order by t.added_at, t.email)
        from (select t0.*, u0.id as uid0,
                     case when u0.id is not null and u0.email_confirmed_at is not null
                          then row_number() over (partition by (u0.id is not null and u0.email_confirmed_at is not null) order by t0.added_at, t0.email)
                     end as seat_rank
                from public.school_teachers t0
                left join auth.users u0 on lower(u0.email) = t0.email
               where t0.school_id = sc.id) t
        left join auth.users u on u.id = t.uid0
    ), '[]'::jsonb)
  ) into res;
  return res;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.my_school_teacher_status()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  select jsonb_build_object('school', sc.name, 'city', sc.city, 'active', public.school_teacher_active(auth.uid()))
    from auth.users u
    join public.school_teachers t on t.email = lower(u.email)
    join public.schools sc on sc.id = t.school_id
   where u.id = auth.uid()
   order by public.school_subscription_live(sc.id) desc, t.added_at
   limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.parental_refusal_delete(p_uid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  my_email text;
begin
  if p_uid is null then
    return;
  end if;
  if exists (select 1 from public.admins a where a.user_id = p_uid) then
    raise exception 'admin_account';
  end if;
  select email into my_email from auth.users where id = p_uid;
  update public.dev_settings_public set updated_by = null where updated_by = p_uid;
  if to_regclass('public.dev_settings') is not null and my_email is not null then
    execute 'delete from public.dev_settings where lower(account_email) = lower($1)' using my_email;
  end if;
  delete from auth.users where id = p_uid;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.pick_free_library_box(p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_limit integer := public.policy_int('freeLibraryBoxes', 2);
  v_used integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if not exists (select 1 from public.library_collections where id = p_id) then
    raise exception 'not_found';
  end if;
  if exists (select 1 from public.library_free_picks where user_id = auth.uid() and collection_id = p_id) then
    return public.my_library_rights();
  end if;
  perform pg_advisory_xact_lock(hashtext('free_picks_' || auth.uid()::text));
  select count(*) into v_used from public.library_free_picks where user_id = auth.uid();
  if v_used >= v_limit then
    raise exception 'free_limit_reached';
  end if;
  insert into public.library_free_picks (user_id, collection_id) values (auth.uid(), p_id);
  return public.my_library_rights();
end;
$function$
;

CREATE OR REPLACE FUNCTION public.policy_int(p_key text, p_default integer)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select coalesce((
    select case when (d.settings -> 'subscriptionPolicy' ->> p_key) ~ '^\d{1,4}$'
                then (d.settings -> 'subscriptionPolicy' ->> p_key)::integer end
      from public.dev_settings_public d where d.id = 'global'
  ), p_default);
$function$
;

CREATE OR REPLACE FUNCTION public.rate_limit_check(p_count bigint, p_max integer, p_what text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  if p_count >= p_max then
    raise exception 'Trop de % en peu de temps : réessaie un peu plus tard.', p_what
      using errcode = 'P0001', hint = 'rate_limited';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.referral_code_valid(p_code text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.referral_codes r
                  where r.code = upper(trim(coalesce(p_code, ''))) and r.user_id <> auth.uid());
$function$
;

CREATE OR REPLACE FUNCTION public.release_free_library_box(p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  delete from public.library_free_picks where user_id = auth.uid() and collection_id = p_id;
  return public.my_library_rights();
end;
$function$
;

CREATE OR REPLACE FUNCTION public.report_client_error(p_app text, p_version text, p_kind text, p_message text, p_stack text, p_page text, p_user_agent text, p_fingerprint text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_fp text := left(coalesce(p_fingerprint, ''), 64);
  v_id bigint;
begin
  if coalesce(p_message, '') = '' then
    return;
  end if;
  -- Compte supprimé mais session encore ouverte : erreur anonyme.
  if v_uid is not null and not exists (select 1 from auth.users where id = v_uid) then
    v_uid := null;
  end if;
  -- Même erreur, même compte, dans les dernières 24 h : on compte.
  select id into v_id from public.client_errors
   where fingerprint = v_fp
     and user_id is not distinct from v_uid
     and first_seen > now() - interval '1 day'
   order by first_seen desc
   limit 1;
  if v_id is not null then
    update public.client_errors
       set occurrences = least(occurrences + 1, 1000000), last_seen = now(),
           app_version = left(coalesce(p_version, ''), 20)
     where id = v_id;
    return;
  end if;
  -- Garde-fous contre le remplissage de la table :
  -- 30 erreurs différentes par compte et par heure ; 300 par heure pour
  -- l'ensemble des visiteurs non connectés ; 5 000 par heure au total.
  if v_uid is not null then
    if (select count(*) from public.client_errors where user_id = v_uid and first_seen > now() - interval '1 hour') >= 30 then
      return;
    end if;
  elsif (select count(*) from public.client_errors where user_id is null and first_seen > now() - interval '1 hour') >= 300 then
    return;
  end if;
  if (select count(*) from public.client_errors where first_seen > now() - interval '1 hour') >= 5000 then
    return;
  end if;
  insert into public.client_errors (user_id, app, app_version, kind, message, stack, page, user_agent, fingerprint)
  values (
    v_uid,
    case when p_app = 'admin' then 'admin' else 'app' end,
    left(coalesce(p_version, ''), 20),
    left(coalesce(p_kind, 'error'), 20),
    left(p_message, 500),
    left(coalesce(p_stack, ''), 4000),
    left(coalesce(p_page, ''), 300),
    left(coalesce(p_user_agent, ''), 300),
    v_fp
  );
  -- Ménage de temps en temps : erreurs de plus de 90 jours.
  if random() < 0.02 then
    delete from public.client_errors where last_seen < now() - interval '90 days';
  end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.save_my_school(p_name text, p_city text, p_uai text, p_billing_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if public.account_restricted() then
    raise exception 'parental_consent_required';
  end if;
  insert into public.schools (manager_id, name, city, uai, billing_email)
  values (auth.uid(), trim(p_name), trim(coalesce(p_city, '')), upper(trim(coalesce(p_uai, ''))), lower(trim(coalesce(p_billing_email, ''))))
  on conflict (manager_id) do update
     set name = excluded.name, city = excluded.city, uai = excluded.uai,
         billing_email = excluded.billing_email, updated_at = now()
  returning id into v_id;
  return v_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.school_subscription_live(p_school uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Nombre d'enseignants payés (0 si pas d'abonnement en cours).
  select coalesce((
    select greatest(s.quantity, 0)
      from public.schools sc
      join public.subscriptions s on s.user_id = sc.manager_id
     where sc.id = p_school
       and s.plan = 'super_ecole'
       and s.status in ('active', 'trial', 'past_due')
       and (s.current_period_end is null or s.current_period_end > now())
  ), 0);
$function$
;

CREATE OR REPLACE FUNCTION public.school_teacher_active(p_uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  select exists (
    select 1
      from auth.users u
      join public.school_teachers t on t.email = lower(u.email)
     where u.id = p_uid
       and u.email_confirmed_at is not null
       -- Rang parmi les enseignants désignés qui ont un compte confirmé
       -- (une adresse sans compte ne prend pas de place).
       and (select count(*) from public.school_teachers t2
              join auth.users u2 on lower(u2.email) = t2.email and u2.email_confirmed_at is not null
             where t2.school_id = t.school_id
               and (t2.added_at, t2.email) <= (t.added_at, t.email))
           <= public.school_subscription_live(t.school_id)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.set_my_birth_date(p_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  uid uuid := auth.uid();
  cur date;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_date is null or p_date > current_date or p_date < date '1900-01-01' then
    raise exception 'invalid_birth_date';
  end if;
  select birth_date into cur from public.account_ages where user_id = uid;
  if cur is not null and cur <> p_date then
    raise exception 'birth_date_already_set';
  end if;
  if cur is null then
    insert into public.account_ages (user_id, birth_date) values (uid, p_date);
  end if;
  return public.my_account_status();
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_my_school_teachers(p_emails text[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_school uuid;
  v_emails text[];
begin
  select id into v_school from public.schools where manager_id = auth.uid();
  if v_school is null then
    raise exception 'no_school';
  end if;
  select coalesce(array_agg(distinct e), '{}') into v_emails
    from (select lower(trim(x)) as e from unnest(coalesce(p_emails, '{}')) x) q
   where e <> '';
  if coalesce(array_length(v_emails, 1), 0) > 200 then
    raise exception 'too_many_teachers';
  end if;
  if exists (select 1 from unnest(v_emails) e where e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'invalid_email';
  end if;
  delete from public.school_teachers where school_id = v_school and not (email = any (v_emails));
  -- Nouvelles adresses : dans l'ordre de la liste, après les anciennes.
  insert into public.school_teachers (school_id, email, added_at)
  select v_school, q.e, clock_timestamp() + (q.n * interval '1 millisecond')
    from (select e, min(n) as n
            from unnest(coalesce(p_emails, '{}')) with ordinality as x(raw, n)
            cross join lateral (select lower(trim(x.raw)) as e) l
           where l.e = any (v_emails)
           group by e) q
  on conflict (school_id, email) do nothing;
  return coalesce(array_length(v_emails, 1), 0);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.shared_box_library_access(p_box uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  b record;
  q jsonb;
  r integer;
  box_rank integer;
begin
  select sb.id, sb.class_id, sb.shared_at, sb.library_collection_id, c.teacher_id
    into b
    from public.shared_boxes sb join public.classes c on c.id = sb.class_id
   where sb.id = p_box;
  if not found then
    return false;
  end if;
  if b.library_collection_id is null then
    return true;
  end if;
  if (select count(*) from public.class_members m where m.class_id = b.class_id and m.role = 'student') > 60 then
    return false;
  end if;
  q := public.teacher_library_quota(b.teacher_id);
  select t.rank into r from public.teacher_library_classes(b.teacher_id) t where t.class_id = b.class_id;
  if r is null or r > (q ->> 'classes')::integer then
    return false;
  end if;
  if q ->> 'boxes' is null then
    return true;
  end if;
  select count(*) into box_rank
    from public.shared_boxes x
   where x.class_id = b.class_id and x.library_collection_id is not null
     and (x.shared_at, x.id) <= (b.shared_at, b.id);
  return box_rank <= (q ->> 'boxes')::integer;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.shared_boxes_library_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_teacher uuid;
  q jsonb;
  r integer;
  n_classes integer;
  n_boxes integer;
  col_cards jsonb;
begin
  if new.library_collection_id is null then
    return new;
  end if;
  select c.teacher_id into v_teacher from public.classes c where c.id = new.class_id;
  if v_teacher is null then
    return new;
  end if;
  q := public.teacher_library_quota(v_teacher);
  if q ->> 'plan' <> 'admin' then
    perform pg_advisory_xact_lock(hashtext('library_share_' || v_teacher::text));
    select t.rank, t.boxes into r, n_boxes from public.teacher_library_classes(v_teacher) t where t.class_id = new.class_id;
    if r is null then
      select count(*) into n_classes from public.teacher_library_classes(v_teacher);
      if n_classes >= (q ->> 'classes')::integer then
        raise exception 'library_class_limit' using detail = q::text;
      end if;
    elsif r > (q ->> 'classes')::integer then
      raise exception 'library_class_limit' using detail = q::text;
    elsif q ->> 'boxes' is not null and n_boxes >= (q ->> 'boxes')::integer then
      raise exception 'library_class_box_limit' using detail = q::text;
    end if;
  end if;
  select lc.cards into col_cards from public.library_collections lc where lc.id = new.library_collection_id;
  if col_cards is not null and jsonb_typeof(col_cards) = 'array' then
    select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
             'id', c ->> 'id', 'question', c ->> 'question', 'answer', c ->> 'answer',
             'more', c -> 'more', 'wrongs', c -> 'wrongs', 'link', c -> 'link')) order by ord), '[]'::jsonb)
      into new.cards
      from jsonb_array_elements(col_cards) with ordinality as t(c, ord);
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.shared_events_strip_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if position('@' in coalesce(new.shared_by_name, '')) > 0 then
    new.shared_by_name := '';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.subscription_live_row(p_uid uuid)
 RETURNS subscriptions
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select s.* from public.subscriptions s
   where s.user_id = p_uid
     and s.status in ('active', 'trial', 'past_due')
     and (s.current_period_end is null or s.current_period_end > now())
   limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.subscriptions_started_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.status in ('active', 'trial') and (tg_op = 'INSERT' or old.status not in ('active', 'trial') or old.plan is distinct from new.plan) then
    new.started_at := now();
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.teacher_library_classes(p_teacher uuid)
 RETURNS TABLE(class_id uuid, rank integer, boxes integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select x.class_id, (row_number() over (order by x.first_at, x.class_id))::integer, x.n::integer
    from (select b.class_id, min(b.shared_at) as first_at, count(*) as n
            from public.shared_boxes b
            join public.classes c on c.id = b.class_id
           where c.teacher_id = p_teacher and b.library_collection_id is not null
           group by b.class_id) x;
$function$
;

CREATE OR REPLACE FUNCTION public.teacher_library_quota(p_teacher uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  s public.subscriptions;
begin
  if exists (select 1 from public.admins a where a.user_id = p_teacher) then
    return jsonb_build_object('plan', 'admin', 'classes', 1000, 'boxes', null);
  end if;
  if public.school_teacher_active(p_teacher) then
    return jsonb_build_object('plan', 'ecole', 'classes', 15, 'boxes', null);
  end if;
  s := public.subscription_live_row(p_teacher);
  if s.user_id is not null and s.plan in ('super_enseignant', 'super_enseignant_annuel') then
    return jsonb_build_object('plan', 'prof', 'classes', greatest(coalesce(s.quantity, 3), 3), 'boxes', null);
  end if;
  return jsonb_build_object('plan', 'free', 'classes', public.policy_int('freeTeacherClasses', 1),
                            'boxes', public.policy_int('freeClassLibraryBoxes', 2));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.touch_activity()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then
    return;
  end if;
  insert into public.account_activity (user_id, day) values (auth.uid(), current_date)
  on conflict do nothing;
  delete from public.inactivity_notices where user_id = auth.uid();
end;
$function$
;

create or replace view public.library_catalog as
 SELECT id,
    owner_id,
    owner_first_name,
    owner_last_name,
    name,
    summary,
    description,
    level,
    price_tokens,
    source_subject_id,
    taxonomy,
    tags,
    card_count,
    shared_at,
    updated_at,
    link
   FROM library_collections;

do $x$ begin
alter table public.account_activity add constraint account_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.account_ages add constraint account_ages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.admin_audit add constraint admin_audit_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.admins add constraint admins_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.admins add constraint admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.calendar_events add constraint calendar_events_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.card_reports add constraint card_reports_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.card_reports add constraint card_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.cards add constraint cards_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_members add constraint class_members_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_members add constraint class_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_messages add constraint class_messages_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.class_messages add constraint class_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.classes add constraint classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.client_errors add constraint client_errors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.dev_settings_public add constraint dev_settings_public_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.folders add constraint folders_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.inactivity_notices add constraint inactivity_notices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_collections add constraint library_collections_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_free_picks add constraint library_free_picks_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES library_collections(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_free_picks add constraint library_free_picks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_ratings add constraint library_ratings_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES library_collections(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_ratings add constraint library_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES library_collections(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.library_submissions add constraint library_submissions_shared_box_id_fkey FOREIGN KEY (shared_box_id) REFERENCES shared_boxes(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.parental_consents add constraint parental_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referral_codes add constraint referral_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referrals add constraint referrals_referee_id_fkey FOREIGN KEY (referee_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.referrals add constraint referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.retention_settings add constraint retention_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_quotes add constraint school_quotes_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_quotes add constraint school_quotes_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.school_teachers add constraint school_teachers_school_id_fkey FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.schools add constraint schools_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.shared_boxes add constraint shared_boxes_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.shared_boxes add constraint shared_boxes_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.shared_events add constraint shared_events_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.shared_events add constraint shared_events_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subjects add constraint subjects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subscriptions add constraint subscriptions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
alter table public.subscriptions add constraint subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER card_reports_rate_limit BEFORE INSERT ON public.card_reports FOR EACH ROW EXECUTE FUNCTION card_reports_rate_limit();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER class_messages_rate_limit BEFORE INSERT ON public.class_messages FOR EACH ROW EXECUTE FUNCTION class_messages_rate_limit();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER class_messages_strip_email BEFORE INSERT OR UPDATE ON public.class_messages FOR EACH ROW EXECUTE FUNCTION class_messages_strip_email();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER classes_rate_limit BEFORE INSERT ON public.classes FOR EACH ROW EXECUTE FUNCTION classes_rate_limit();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER library_collections_card_count BEFORE INSERT OR UPDATE OF cards ON public.library_collections FOR EACH ROW EXECUTE FUNCTION library_collections_set_card_count();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER library_collections_rate_limit BEFORE INSERT ON public.library_collections FOR EACH ROW EXECUTE FUNCTION library_collections_rate_limit();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER library_submissions_rate_limit BEFORE INSERT ON public.library_submissions FOR EACH ROW EXECUTE FUNCTION library_submissions_rate_limit();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER shared_boxes_library_guard BEFORE INSERT ON public.shared_boxes FOR EACH ROW EXECUTE FUNCTION shared_boxes_library_guard();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER shared_events_strip_email BEFORE INSERT OR UPDATE ON public.shared_events FOR EACH ROW EXECUTE FUNCTION shared_events_strip_email();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
CREATE TRIGGER subscriptions_started_at BEFORE INSERT OR UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION subscriptions_started_at();
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

alter table public.account_activity enable row level security;

alter table public.account_ages enable row level security;

alter table public.admin_audit enable row level security;

alter table public.admins enable row level security;

alter table public.backup_r29_cards enable row level security;

alter table public.backup_r29_folders enable row level security;

alter table public.backup_r29_subjects enable row level security;

alter table public.calendar_events enable row level security;

alter table public.card_reports enable row level security;

alter table public.cards enable row level security;

alter table public.class_members enable row level security;

alter table public.class_messages enable row level security;

alter table public.classes enable row level security;

alter table public.client_errors enable row level security;

alter table public.dev_settings enable row level security;

alter table public.dev_settings_public enable row level security;

alter table public.folders enable row level security;

alter table public.inactivity_notices enable row level security;

alter table public.inactivity_runs enable row level security;

alter table public.learning_modes enable row level security;

alter table public.library_collections enable row level security;

alter table public.library_free_picks enable row level security;

alter table public.library_ratings enable row level security;

alter table public.library_submissions enable row level security;

alter table public.page_views enable row level security;

alter table public.parental_consents enable row level security;

alter table public.referral_codes enable row level security;

alter table public.referrals enable row level security;

alter table public.retention_settings enable row level security;

alter table public.reward_state enable row level security;

alter table public.school_quotes enable row level security;

alter table public.school_teachers enable row level security;

alter table public.schools enable row level security;

alter table public.seller_info enable row level security;

alter table public.shared_boxes enable row level security;

alter table public.shared_events enable row level security;

alter table public.stripe_events enable row level security;

alter table public.subjects enable row level security;

alter table public.subscriptions enable row level security;

do $x$ begin
create policy account_ages_select_own on public.account_ages as permissive for select to authenticated using ((user_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy "owner manages own calendar" on public.calendar_events as permissive for all to authenticated using ((owner_id = auth.uid())) with check ((owner_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy card_reports_delete on public.card_reports as permissive for delete to authenticated using ((author_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy card_reports_insert on public.card_reports as permissive for insert to authenticated with check (((reporter_id = auth.uid()) AND (((source_kind = 'library'::text) AND (EXISTS ( SELECT 1
   FROM library_collections lc
  WHERE (((lc.id)::text = card_reports.source_id) AND (lc.owner_id = card_reports.author_id))))) OR ((source_kind = 'class'::text) AND (EXISTS ( SELECT 1
   FROM shared_boxes sb
  WHERE (((sb.id)::text = card_reports.source_id) AND (sb.shared_by = card_reports.author_id))))))));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy card_reports_select on public.card_reports as permissive for select to authenticated using (((author_id = auth.uid()) OR (reporter_id = auth.uid())));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy card_reports_update on public.card_reports as permissive for update to authenticated using ((author_id = auth.uid())) with check ((author_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy minor_consent_required on public.card_reports as restrictive for insert to authenticated with check ((NOT account_restricted()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy "owner manages own cards" on public.cards as permissive for all to authenticated using ((owner_id = auth.uid())) with check ((owner_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy class_members_delete on public.class_members as permissive for delete to public using (((user_id = auth.uid()) OR is_teacher_of_class(class_id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy class_members_select on public.class_members as permissive for select to public using (((user_id = auth.uid()) OR is_teacher_of_class(class_id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy class_messages_insert on public.class_messages as permissive for insert to public with check (((sender_id = auth.uid()) AND (is_teacher_of_class(class_id) OR is_member_of_class(class_id))));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy class_messages_select on public.class_messages as permissive for select to public using ((is_teacher_of_class(class_id) OR is_member_of_class(class_id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy minor_consent_required on public.class_messages as restrictive for insert to authenticated with check ((NOT account_restricted()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy classes_delete_own on public.classes as permissive for delete to public using ((teacher_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy classes_insert_as_teacher on public.classes as permissive for insert to public with check ((teacher_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy classes_select_own_or_member on public.classes as permissive for select to public using (((teacher_id = auth.uid()) OR is_member_of_class(id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy classes_update_own on public.classes as permissive for update to public using ((teacher_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy minor_consent_required on public.classes as restrictive for insert to authenticated with check ((NOT account_restricted()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy client_errors_admin_delete on public.client_errors as permissive for delete to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy client_errors_admin_select on public.client_errors as permissive for select to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy dev_settings_public_insert_admin on public.dev_settings_public as permissive for insert to authenticated with check (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy dev_settings_public_select_all on public.dev_settings_public as permissive for select to public using (true);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy dev_settings_public_update_admin on public.dev_settings_public as permissive for update to authenticated using (is_admin()) with check (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy "owner manages own folders" on public.folders as permissive for all to authenticated using ((owner_id = auth.uid())) with check ((owner_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy inactivity_notices_admin on public.inactivity_notices as permissive for select to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy inactivity_runs_admin on public.inactivity_runs as permissive for select to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_collections_delete on public.library_collections as permissive for delete to authenticated using ((owner_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_collections_delete_admin on public.library_collections as permissive for delete to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_collections_insert on public.library_collections as permissive for insert to authenticated with check ((owner_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_collections_select on public.library_collections as permissive for select to authenticated using (((owner_id = auth.uid()) OR is_admin()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_collections_update on public.library_collections as permissive for update to authenticated using ((owner_id = auth.uid())) with check ((owner_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_collections_update_admin on public.library_collections as permissive for update to authenticated using (is_admin()) with check (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy minor_consent_required on public.library_collections as restrictive for insert to authenticated with check ((NOT account_restricted()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_free_picks_select on public.library_free_picks as permissive for select to authenticated using (((user_id = auth.uid()) OR is_admin()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_ratings_delete on public.library_ratings as permissive for delete to authenticated using ((user_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_ratings_insert on public.library_ratings as permissive for insert to authenticated with check ((user_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_ratings_select on public.library_ratings as permissive for select to public using (true);
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_ratings_update on public.library_ratings as permissive for update to authenticated using ((user_id = auth.uid())) with check ((user_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_submissions_insert_own on public.library_submissions as permissive for insert to authenticated with check (((owner_id = auth.uid()) AND (status = 'pending'::text)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy library_submissions_select on public.library_submissions as permissive for select to authenticated using (((owner_id = auth.uid()) OR is_admin()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy minor_consent_required on public.library_submissions as restrictive for insert to authenticated with check ((NOT account_restricted()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy page_views_admin on public.page_views as permissive for select to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy referral_codes_select on public.referral_codes as permissive for select to authenticated using (((user_id = auth.uid()) OR is_admin()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy referrals_select on public.referrals as permissive for select to authenticated using (((referrer_id = auth.uid()) OR (referee_id = auth.uid()) OR is_admin()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy retention_settings_admin on public.retention_settings as permissive for select to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy school_quotes_admin on public.school_quotes as permissive for select to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy school_teachers_select on public.school_teachers as permissive for select to authenticated using ((is_admin() OR (EXISTS ( SELECT 1
   FROM schools s
  WHERE ((s.id = school_teachers.school_id) AND (s.manager_id = auth.uid()))))));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy schools_admin_select on public.schools as permissive for select to authenticated using (((manager_id = auth.uid()) OR is_admin()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy seller_info_admin on public.seller_info as permissive for select to authenticated using (is_admin());
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy minor_consent_required on public.shared_boxes as restrictive for insert to authenticated with check ((NOT account_restricted()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_boxes_delete_as_teacher on public.shared_boxes as permissive for delete to public using (is_teacher_of_class(class_id));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_boxes_insert_as_teacher on public.shared_boxes as permissive for insert to public with check (((shared_by = auth.uid()) AND is_teacher_of_class(class_id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_boxes_select on public.shared_boxes as permissive for select to public using ((is_teacher_of_class(class_id) OR is_member_of_class(class_id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_boxes_update_as_teacher on public.shared_boxes as permissive for update to public using (is_teacher_of_class(class_id));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy minor_consent_required on public.shared_events as restrictive for insert to authenticated with check ((NOT account_restricted()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_events_delete_as_teacher on public.shared_events as permissive for delete to public using (is_teacher_of_class(class_id));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_events_insert_as_teacher on public.shared_events as permissive for insert to public with check (((shared_by = auth.uid()) AND is_teacher_of_class(class_id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_events_select on public.shared_events as permissive for select to public using ((is_teacher_of_class(class_id) OR is_member_of_class(class_id)));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy shared_events_update_as_teacher on public.shared_events as permissive for update to public using (is_teacher_of_class(class_id));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy "owner manages own subjects" on public.subjects as permissive for all to authenticated using ((owner_id = auth.uid())) with check ((owner_id = auth.uid()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

do $x$ begin
create policy subscriptions_select_own_or_admin on public.subscriptions as permissive for select to authenticated using (((user_id = auth.uid()) OR is_admin()));
exception when duplicate_object or duplicate_table or invalid_table_definition then null; end $x$;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.account_activity to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.account_activity to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.account_activity to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.account_ages to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.account_ages to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.account_ages to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_audit to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_audit to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admin_audit to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admins to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admins to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.admins to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_cards to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_cards to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_cards to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_folders to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_folders to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_folders to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_subjects to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_subjects to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.backup_r29_subjects to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.calendar_events to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.calendar_events to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.calendar_events to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.card_reports to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.card_reports to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.card_reports to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.cards to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.cards to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.cards to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.class_members to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.class_members to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.class_members to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.class_messages to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.class_messages to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.class_messages to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.classes to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.classes to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.classes to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.client_errors to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.client_errors to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.client_errors to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.dev_settings to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.dev_settings to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.dev_settings to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.dev_settings_public to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.dev_settings_public to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.dev_settings_public to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.folders to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.folders to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.folders to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.inactivity_notices to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.inactivity_notices to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.inactivity_notices to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.inactivity_runs to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.inactivity_runs to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.inactivity_runs to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.learning_modes to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.learning_modes to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.learning_modes to service_role;

grant SELECT on public.library_catalog to anon;

grant SELECT on public.library_catalog to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_catalog to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_collections to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_collections to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_collections to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_free_picks to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_free_picks to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_free_picks to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_ratings to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_ratings to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_ratings to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_submissions to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_submissions to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.library_submissions to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.page_views to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.page_views to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.page_views to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.parental_consents to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.parental_consents to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.parental_consents to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.referral_codes to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.referral_codes to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.referral_codes to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.referrals to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.referrals to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.referrals to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.retention_settings to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.retention_settings to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.retention_settings to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.reward_state to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.reward_state to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.reward_state to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.school_quotes to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.school_quotes to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.school_quotes to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.school_teachers to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.school_teachers to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.school_teachers to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.schools to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.schools to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.schools to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.seller_info to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.seller_info to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.seller_info to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.shared_boxes to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.shared_boxes to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.shared_boxes to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.shared_events to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.shared_events to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.shared_events to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.stripe_events to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subjects to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subjects to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subjects to service_role;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subscriptions to anon;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subscriptions to authenticated;

grant DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.subscriptions to service_role;

revoke all on function public.account_last_active(p_uid uuid) from public, anon, authenticated; grant execute on function public.account_last_active(p_uid uuid) to service_role;

revoke all on function public.account_restricted() from public, anon, authenticated; grant execute on function public.account_restricted() to authenticated; grant execute on function public.account_restricted() to service_role;

revoke all on function public.account_restricted_for(p_uid uuid) from public, anon, authenticated; grant execute on function public.account_restricted_for(p_uid uuid) to service_role;

revoke all on function public.admin_account_age(p_user uuid) from public, anon, authenticated; grant execute on function public.admin_account_age(p_user uuid) to authenticated; grant execute on function public.admin_account_age(p_user uuid) to service_role;

revoke all on function public.admin_add_admin(p_email text) from public, anon, authenticated; grant execute on function public.admin_add_admin(p_email text) to authenticated; grant execute on function public.admin_add_admin(p_email text) to service_role;

revoke all on function public.admin_assert() from public, anon, authenticated; grant execute on function public.admin_assert() to authenticated; grant execute on function public.admin_assert() to anon; grant execute on function public.admin_assert() to service_role;

revoke all on function public.admin_audit_list(p_limit integer, p_offset integer) from public, anon, authenticated; grant execute on function public.admin_audit_list(p_limit integer, p_offset integer) to authenticated; grant execute on function public.admin_audit_list(p_limit integer, p_offset integer) to service_role;

revoke all on function public.admin_box_cards(p_owner uuid, p_box text) from public, anon, authenticated; grant execute on function public.admin_box_cards(p_owner uuid, p_box text) to authenticated; grant execute on function public.admin_box_cards(p_owner uuid, p_box text) to service_role;

revoke all on function public.admin_boxes(p_search text, p_kind text, p_limit integer, p_offset integer) from public, anon, authenticated; grant execute on function public.admin_boxes(p_search text, p_kind text, p_limit integer, p_offset integer) to authenticated; grant execute on function public.admin_boxes(p_search text, p_kind text, p_limit integer, p_offset integer) to service_role;

revoke all on function public.admin_class_detail(p_class uuid) from public, anon, authenticated; grant execute on function public.admin_class_detail(p_class uuid) to authenticated; grant execute on function public.admin_class_detail(p_class uuid) to service_role;

revoke all on function public.admin_classes(p_search text, p_limit integer, p_offset integer) from public, anon, authenticated; grant execute on function public.admin_classes(p_search text, p_limit integer, p_offset integer) to authenticated; grant execute on function public.admin_classes(p_search text, p_limit integer, p_offset integer) to service_role;

revoke all on function public.admin_client_errors(p_days integer) from public, anon, authenticated; grant execute on function public.admin_client_errors(p_days integer) to authenticated; grant execute on function public.admin_client_errors(p_days integer) to anon; grant execute on function public.admin_client_errors(p_days integer) to service_role;

revoke all on function public.admin_collections(p_search text, p_limit integer, p_offset integer) from public, anon, authenticated; grant execute on function public.admin_collections(p_search text, p_limit integer, p_offset integer) to authenticated; grant execute on function public.admin_collections(p_search text, p_limit integer, p_offset integer) to service_role;

revoke all on function public.admin_create_quote(p_kind text, p_school uuid, p_payload jsonb) from public, anon, authenticated; grant execute on function public.admin_create_quote(p_kind text, p_school uuid, p_payload jsonb) to authenticated; grant execute on function public.admin_create_quote(p_kind text, p_school uuid, p_payload jsonb) to service_role;

revoke all on function public.admin_delete_collection(p_id uuid) from public, anon, authenticated; grant execute on function public.admin_delete_collection(p_id uuid) to authenticated; grant execute on function public.admin_delete_collection(p_id uuid) to service_role;

revoke all on function public.admin_delete_user(p_user uuid) from public, anon, authenticated; grant execute on function public.admin_delete_user(p_user uuid) to authenticated; grant execute on function public.admin_delete_user(p_user uuid) to service_role;

revoke all on function public.admin_grant_parental_consent(p_user uuid, p_note text) from public, anon, authenticated; grant execute on function public.admin_grant_parental_consent(p_user uuid, p_note text) to authenticated; grant execute on function public.admin_grant_parental_consent(p_user uuid, p_note text) to service_role;

revoke all on function public.admin_list_admins() from public, anon, authenticated; grant execute on function public.admin_list_admins() to authenticated; grant execute on function public.admin_list_admins() to service_role;

revoke all on function public.admin_log(p_action text, p_target text, p_details jsonb) from public, anon, authenticated; grant execute on function public.admin_log(p_action text, p_target text, p_details jsonb) to service_role;

revoke all on function public.admin_overview() from public, anon, authenticated; grant execute on function public.admin_overview() to authenticated; grant execute on function public.admin_overview() to service_role;

revoke all on function public.admin_publish_submission(p_id uuid, p_patch jsonb) from public, anon, authenticated; grant execute on function public.admin_publish_submission(p_id uuid, p_patch jsonb) to authenticated; grant execute on function public.admin_publish_submission(p_id uuid, p_patch jsonb) to service_role;

revoke all on function public.admin_referrals(p_limit integer) from public, anon, authenticated; grant execute on function public.admin_referrals(p_limit integer) to authenticated; grant execute on function public.admin_referrals(p_limit integer) to service_role;

revoke all on function public.admin_reject_submission(p_id uuid, p_note text) from public, anon, authenticated; grant execute on function public.admin_reject_submission(p_id uuid, p_note text) to authenticated; grant execute on function public.admin_reject_submission(p_id uuid, p_note text) to service_role;

revoke all on function public.admin_remove_admin(p_user uuid) from public, anon, authenticated; grant execute on function public.admin_remove_admin(p_user uuid) to authenticated; grant execute on function public.admin_remove_admin(p_user uuid) to service_role;

revoke all on function public.admin_reports(p_status text, p_limit integer, p_offset integer) from public, anon, authenticated; grant execute on function public.admin_reports(p_status text, p_limit integer, p_offset integer) to authenticated; grant execute on function public.admin_reports(p_status text, p_limit integer, p_offset integer) to service_role;

revoke all on function public.admin_retention_overview() from public, anon, authenticated; grant execute on function public.admin_retention_overview() to authenticated; grant execute on function public.admin_retention_overview() to service_role;

revoke all on function public.admin_school_detail(p_school uuid) from public, anon, authenticated; grant execute on function public.admin_school_detail(p_school uuid) to authenticated; grant execute on function public.admin_school_detail(p_school uuid) to service_role;

revoke all on function public.admin_schools() from public, anon, authenticated; grant execute on function public.admin_schools() to authenticated; grant execute on function public.admin_schools() to service_role;

revoke all on function public.admin_set_birth_date(p_user uuid, p_date date) from public, anon, authenticated; grant execute on function public.admin_set_birth_date(p_user uuid, p_date date) to authenticated; grant execute on function public.admin_set_birth_date(p_user uuid, p_date date) to service_role;

revoke all on function public.admin_set_retention(p_enabled boolean, p_months integer, p_warn_days integer, p_remind_days integer, p_unconfirmed_days integer, p_max_per_run integer) from public, anon, authenticated; grant execute on function public.admin_set_retention(p_enabled boolean, p_months integer, p_warn_days integer, p_remind_days integer, p_unconfirmed_days integer, p_max_per_run integer) to authenticated; grant execute on function public.admin_set_retention(p_enabled boolean, p_months integer, p_warn_days integer, p_remind_days integer, p_unconfirmed_days integer, p_max_per_run integer) to service_role;

revoke all on function public.admin_set_seller_info(p_info jsonb) from public, anon, authenticated; grant execute on function public.admin_set_seller_info(p_info jsonb) to authenticated; grant execute on function public.admin_set_seller_info(p_info jsonb) to service_role;

revoke all on function public.admin_set_subscription(p_user uuid, p_status text, p_plan text, p_until timestamp with time zone, p_note text) from public, anon, authenticated; grant execute on function public.admin_set_subscription(p_user uuid, p_status text, p_plan text, p_until timestamp with time zone, p_note text) to authenticated; grant execute on function public.admin_set_subscription(p_user uuid, p_status text, p_plan text, p_until timestamp with time zone, p_note text) to service_role;

revoke all on function public.admin_stats(p_days integer) from public, anon, authenticated; grant execute on function public.admin_stats(p_days integer) to authenticated; grant execute on function public.admin_stats(p_days integer) to service_role;

revoke all on function public.admin_submission_latest_cards(p_id uuid) from public, anon, authenticated; grant execute on function public.admin_submission_latest_cards(p_id uuid) to authenticated; grant execute on function public.admin_submission_latest_cards(p_id uuid) to service_role;

revoke all on function public.admin_subscriptions(p_status text, p_limit integer, p_offset integer) from public, anon, authenticated; grant execute on function public.admin_subscriptions(p_status text, p_limit integer, p_offset integer) to authenticated; grant execute on function public.admin_subscriptions(p_status text, p_limit integer, p_offset integer) to service_role;

revoke all on function public.admin_user_detail(p_user uuid) from public, anon, authenticated; grant execute on function public.admin_user_detail(p_user uuid) to authenticated; grant execute on function public.admin_user_detail(p_user uuid) to service_role;

revoke all on function public.admin_user_label(p_user uuid) from public, anon, authenticated; grant execute on function public.admin_user_label(p_user uuid) to service_role;

revoke all on function public.admin_users(p_search text, p_limit integer, p_offset integer, p_sort text) from public, anon, authenticated; grant execute on function public.admin_users(p_search text, p_limit integer, p_offset integer, p_sort text) to authenticated; grant execute on function public.admin_users(p_search text, p_limit integer, p_offset integer, p_sort text) to service_role;

revoke all on function public.card_reports_mark_seen(p_ids uuid[]) from public, anon, authenticated; grant execute on function public.card_reports_mark_seen(p_ids uuid[]) to authenticated; grant execute on function public.card_reports_mark_seen(p_ids uuid[]) to service_role;

revoke all on function public.card_reports_rate_limit() from public, anon, authenticated; grant execute on function public.card_reports_rate_limit() to authenticated; grant execute on function public.card_reports_rate_limit() to anon; grant execute on function public.card_reports_rate_limit() to service_role; grant execute on function public.card_reports_rate_limit() to public;

revoke all on function public.class_library_access(p_class uuid) from public, anon, authenticated; grant execute on function public.class_library_access(p_class uuid) to authenticated; grant execute on function public.class_library_access(p_class uuid) to service_role;

revoke all on function public.class_member_count(p_class_id uuid) from public, anon, authenticated; grant execute on function public.class_member_count(p_class_id uuid) to authenticated; grant execute on function public.class_member_count(p_class_id uuid) to anon; grant execute on function public.class_member_count(p_class_id uuid) to service_role; grant execute on function public.class_member_count(p_class_id uuid) to public;

revoke all on function public.class_members_list(p_class_id uuid) from public, anon, authenticated; grant execute on function public.class_members_list(p_class_id uuid) to authenticated; grant execute on function public.class_members_list(p_class_id uuid) to service_role;

revoke all on function public.class_messages_rate_limit() from public, anon, authenticated; grant execute on function public.class_messages_rate_limit() to authenticated; grant execute on function public.class_messages_rate_limit() to anon; grant execute on function public.class_messages_rate_limit() to service_role; grant execute on function public.class_messages_rate_limit() to public;

revoke all on function public.class_messages_strip_email() from public, anon, authenticated; grant execute on function public.class_messages_strip_email() to authenticated; grant execute on function public.class_messages_strip_email() to anon; grant execute on function public.class_messages_strip_email() to service_role; grant execute on function public.class_messages_strip_email() to public;

revoke all on function public.classes_rate_limit() from public, anon, authenticated; grant execute on function public.classes_rate_limit() to authenticated; grant execute on function public.classes_rate_limit() to anon; grant execute on function public.classes_rate_limit() to service_role; grant execute on function public.classes_rate_limit() to public;

revoke all on function public.count_page_view(p_path text, p_referrer text) from public, anon, authenticated; grant execute on function public.count_page_view(p_path text, p_referrer text) to authenticated; grant execute on function public.count_page_view(p_path text, p_referrer text) to anon; grant execute on function public.count_page_view(p_path text, p_referrer text) to service_role;

revoke all on function public.delete_my_account() from public, anon, authenticated; grant execute on function public.delete_my_account() to authenticated; grant execute on function public.delete_my_account() to service_role;

revoke all on function public.fiches_random_class_code() from public, anon, authenticated; grant execute on function public.fiches_random_class_code() to authenticated; grant execute on function public.fiches_random_class_code() to anon; grant execute on function public.fiches_random_class_code() to service_role; grant execute on function public.fiches_random_class_code() to public;

revoke all on function public.has_library_access() from public, anon, authenticated; grant execute on function public.has_library_access() to authenticated; grant execute on function public.has_library_access() to service_role;

revoke all on function public.inactivity_candidates(p_now timestamp with time zone) from public, anon, authenticated; grant execute on function public.inactivity_candidates(p_now timestamp with time zone) to service_role;

revoke all on function public.inactivity_delete(p_uid uuid) from public, anon, authenticated; grant execute on function public.inactivity_delete(p_uid uuid) to service_role;

revoke all on function public.inactivity_due(p_limit integer) from public, anon, authenticated; grant execute on function public.inactivity_due(p_limit integer) to service_role;

revoke all on function public.inactivity_exempt(p_uid uuid, p_since timestamp with time zone) from public, anon, authenticated; grant execute on function public.inactivity_exempt(p_uid uuid, p_since timestamp with time zone) to service_role;

revoke all on function public.inactivity_log_run(p_dry boolean, p_trigger text, p_warned integer, p_reminded integer, p_deleted integer, p_unconfirmed integer, p_errors integer, p_detail text) from public, anon, authenticated; grant execute on function public.inactivity_log_run(p_dry boolean, p_trigger text, p_warned integer, p_reminded integer, p_deleted integer, p_unconfirmed integer, p_errors integer, p_detail text) to service_role;

revoke all on function public.inactivity_mark(p_uid uuid, p_kind text, p_delete_on timestamp with time zone) from public, anon, authenticated; grant execute on function public.inactivity_mark(p_uid uuid, p_kind text, p_delete_on timestamp with time zone) to service_role;

revoke all on function public.is_admin() from public, anon, authenticated; grant execute on function public.is_admin() to authenticated; grant execute on function public.is_admin() to anon; grant execute on function public.is_admin() to service_role;

revoke all on function public.is_member_of_class(p_class_id uuid) from public, anon, authenticated; grant execute on function public.is_member_of_class(p_class_id uuid) to authenticated; grant execute on function public.is_member_of_class(p_class_id uuid) to anon; grant execute on function public.is_member_of_class(p_class_id uuid) to service_role; grant execute on function public.is_member_of_class(p_class_id uuid) to public;

revoke all on function public.is_teacher_of_class(p_class_id uuid) from public, anon, authenticated; grant execute on function public.is_teacher_of_class(p_class_id uuid) to authenticated; grant execute on function public.is_teacher_of_class(p_class_id uuid) to anon; grant execute on function public.is_teacher_of_class(p_class_id uuid) to service_role; grant execute on function public.is_teacher_of_class(p_class_id uuid) to public;

revoke all on function public.join_class_by_code(p_code text) from public, anon, authenticated; grant execute on function public.join_class_by_code(p_code text) to authenticated; grant execute on function public.join_class_by_code(p_code text) to anon; grant execute on function public.join_class_by_code(p_code text) to service_role; grant execute on function public.join_class_by_code(p_code text) to public;

revoke all on function public.library_collection_cards(p_id uuid) from public, anon, authenticated; grant execute on function public.library_collection_cards(p_id uuid) to authenticated; grant execute on function public.library_collection_cards(p_id uuid) to anon; grant execute on function public.library_collection_cards(p_id uuid) to service_role;

revoke all on function public.library_collections_rate_limit() from public, anon, authenticated; grant execute on function public.library_collections_rate_limit() to authenticated; grant execute on function public.library_collections_rate_limit() to anon; grant execute on function public.library_collections_rate_limit() to service_role; grant execute on function public.library_collections_rate_limit() to public;

revoke all on function public.library_collections_set_card_count() from public, anon, authenticated; grant execute on function public.library_collections_set_card_count() to authenticated; grant execute on function public.library_collections_set_card_count() to anon; grant execute on function public.library_collections_set_card_count() to service_role; grant execute on function public.library_collections_set_card_count() to public;

revoke all on function public.library_preview_text(p_html text) from public, anon, authenticated; grant execute on function public.library_preview_text(p_html text) to authenticated; grant execute on function public.library_preview_text(p_html text) to anon; grant execute on function public.library_preview_text(p_html text) to service_role; grant execute on function public.library_preview_text(p_html text) to public;

revoke all on function public.library_submissions_rate_limit() from public, anon, authenticated; grant execute on function public.library_submissions_rate_limit() to authenticated; grant execute on function public.library_submissions_rate_limit() to anon; grant execute on function public.library_submissions_rate_limit() to service_role; grant execute on function public.library_submissions_rate_limit() to public;

revoke all on function public.merge_summary_description(p_summary text, p_description text) from public, anon, authenticated; grant execute on function public.merge_summary_description(p_summary text, p_description text) to authenticated; grant execute on function public.merge_summary_description(p_summary text, p_description text) to anon; grant execute on function public.merge_summary_description(p_summary text, p_description text) to service_role; grant execute on function public.merge_summary_description(p_summary text, p_description text) to public;

revoke all on function public.my_account_status() from public, anon, authenticated; grant execute on function public.my_account_status() to authenticated; grant execute on function public.my_account_status() to service_role;

revoke all on function public.my_covered_classes() from public, anon, authenticated; grant execute on function public.my_covered_classes() to authenticated; grant execute on function public.my_covered_classes() to service_role;

revoke all on function public.my_covered_library_boxes() from public, anon, authenticated; grant execute on function public.my_covered_library_boxes() to authenticated; grant execute on function public.my_covered_library_boxes() to service_role;

revoke all on function public.my_library_class_usage() from public, anon, authenticated; grant execute on function public.my_library_class_usage() to authenticated; grant execute on function public.my_library_class_usage() to service_role;

revoke all on function public.my_library_rights() from public, anon, authenticated; grant execute on function public.my_library_rights() to authenticated; grant execute on function public.my_library_rights() to service_role;

revoke all on function public.my_referral() from public, anon, authenticated; grant execute on function public.my_referral() to authenticated; grant execute on function public.my_referral() to service_role;

revoke all on function public.my_school() from public, anon, authenticated; grant execute on function public.my_school() to authenticated; grant execute on function public.my_school() to service_role;

revoke all on function public.my_school_teacher_status() from public, anon, authenticated; grant execute on function public.my_school_teacher_status() to authenticated; grant execute on function public.my_school_teacher_status() to service_role;

revoke all on function public.parental_refusal_delete(p_uid uuid) from public, anon, authenticated; grant execute on function public.parental_refusal_delete(p_uid uuid) to service_role;

revoke all on function public.pick_free_library_box(p_id uuid) from public, anon, authenticated; grant execute on function public.pick_free_library_box(p_id uuid) to authenticated; grant execute on function public.pick_free_library_box(p_id uuid) to service_role;

revoke all on function public.policy_int(p_key text, p_default integer) from public, anon, authenticated; grant execute on function public.policy_int(p_key text, p_default integer) to authenticated; grant execute on function public.policy_int(p_key text, p_default integer) to service_role;

revoke all on function public.rate_limit_check(p_count bigint, p_max integer, p_what text) from public, anon, authenticated; grant execute on function public.rate_limit_check(p_count bigint, p_max integer, p_what text) to authenticated; grant execute on function public.rate_limit_check(p_count bigint, p_max integer, p_what text) to anon; grant execute on function public.rate_limit_check(p_count bigint, p_max integer, p_what text) to service_role; grant execute on function public.rate_limit_check(p_count bigint, p_max integer, p_what text) to public;

revoke all on function public.referral_code_valid(p_code text) from public, anon, authenticated; grant execute on function public.referral_code_valid(p_code text) to authenticated; grant execute on function public.referral_code_valid(p_code text) to service_role;

revoke all on function public.release_free_library_box(p_id uuid) from public, anon, authenticated; grant execute on function public.release_free_library_box(p_id uuid) to authenticated; grant execute on function public.release_free_library_box(p_id uuid) to service_role;

revoke all on function public.report_client_error(p_app text, p_version text, p_kind text, p_message text, p_stack text, p_page text, p_user_agent text, p_fingerprint text) from public, anon, authenticated; grant execute on function public.report_client_error(p_app text, p_version text, p_kind text, p_message text, p_stack text, p_page text, p_user_agent text, p_fingerprint text) to authenticated; grant execute on function public.report_client_error(p_app text, p_version text, p_kind text, p_message text, p_stack text, p_page text, p_user_agent text, p_fingerprint text) to anon; grant execute on function public.report_client_error(p_app text, p_version text, p_kind text, p_message text, p_stack text, p_page text, p_user_agent text, p_fingerprint text) to service_role;

revoke all on function public.save_my_school(p_name text, p_city text, p_uai text, p_billing_email text) from public, anon, authenticated; grant execute on function public.save_my_school(p_name text, p_city text, p_uai text, p_billing_email text) to authenticated; grant execute on function public.save_my_school(p_name text, p_city text, p_uai text, p_billing_email text) to service_role;

revoke all on function public.school_subscription_live(p_school uuid) from public, anon, authenticated; grant execute on function public.school_subscription_live(p_school uuid) to authenticated; grant execute on function public.school_subscription_live(p_school uuid) to service_role;

revoke all on function public.school_teacher_active(p_uid uuid) from public, anon, authenticated; grant execute on function public.school_teacher_active(p_uid uuid) to authenticated; grant execute on function public.school_teacher_active(p_uid uuid) to service_role;

revoke all on function public.set_my_birth_date(p_date date) from public, anon, authenticated; grant execute on function public.set_my_birth_date(p_date date) to authenticated; grant execute on function public.set_my_birth_date(p_date date) to service_role;

revoke all on function public.set_my_school_teachers(p_emails text[]) from public, anon, authenticated; grant execute on function public.set_my_school_teachers(p_emails text[]) to authenticated; grant execute on function public.set_my_school_teachers(p_emails text[]) to service_role;

revoke all on function public.shared_box_library_access(p_box uuid) from public, anon, authenticated; grant execute on function public.shared_box_library_access(p_box uuid) to authenticated; grant execute on function public.shared_box_library_access(p_box uuid) to service_role;

revoke all on function public.shared_boxes_library_guard() from public, anon, authenticated; grant execute on function public.shared_boxes_library_guard() to authenticated; grant execute on function public.shared_boxes_library_guard() to anon; grant execute on function public.shared_boxes_library_guard() to service_role; grant execute on function public.shared_boxes_library_guard() to public;

revoke all on function public.shared_events_strip_email() from public, anon, authenticated; grant execute on function public.shared_events_strip_email() to authenticated; grant execute on function public.shared_events_strip_email() to anon; grant execute on function public.shared_events_strip_email() to service_role; grant execute on function public.shared_events_strip_email() to public;

revoke all on function public.subscription_live_row(p_uid uuid) from public, anon, authenticated; grant execute on function public.subscription_live_row(p_uid uuid) to service_role;

revoke all on function public.subscriptions_started_at() from public, anon, authenticated; grant execute on function public.subscriptions_started_at() to authenticated; grant execute on function public.subscriptions_started_at() to anon; grant execute on function public.subscriptions_started_at() to service_role; grant execute on function public.subscriptions_started_at() to public;

revoke all on function public.teacher_library_classes(p_teacher uuid) from public, anon, authenticated; grant execute on function public.teacher_library_classes(p_teacher uuid) to service_role;

revoke all on function public.teacher_library_quota(p_teacher uuid) from public, anon, authenticated; grant execute on function public.teacher_library_quota(p_teacher uuid) to service_role;

revoke all on function public.touch_activity() from public, anon, authenticated; grant execute on function public.touch_activity() to authenticated; grant execute on function public.touch_activity() to service_role;

do $pub$ begin alter publication supabase_realtime add table public.calendar_events; exception when others then null; end $pub$;

do $pub$ begin alter publication supabase_realtime add table public.cards; exception when others then null; end $pub$;

do $pub$ begin alter publication supabase_realtime add table public.dev_settings; exception when others then null; end $pub$;

do $pub$ begin alter publication supabase_realtime add table public.dev_settings_public; exception when others then null; end $pub$;

do $pub$ begin alter publication supabase_realtime add table public.folders; exception when others then null; end $pub$;

do $pub$ begin alter publication supabase_realtime add table public.learning_modes; exception when others then null; end $pub$;

do $pub$ begin alter publication supabase_realtime add table public.reward_state; exception when others then null; end $pub$;

do $pub$ begin alter publication supabase_realtime add table public.subjects; exception when others then null; end $pub$;

insert into public.dev_settings_public select * from json_populate_record(null::public.dev_settings_public, '{"id":"global","settings":{"icons": {"edit": "✎", "undo": "◀️", "folder": "📁", "hibernate": "💤", "construction": "🚩"}, "shadows": {"card": true, "duePill": false, "statBox": false, "cardForm": false, "chartWrap": false, "homeSquare": true, "subjectRow": false}, "taxTint": {"other": {"color": "#ffffff", "alphas": [20, 19, 14, 10, 6, 2]}, "library": {"color": "#ffffff", "alphas": [10, 16, 22, 29, 36, 43]}}, "appPrefs": {"bonusDays": null, "cardFontSize": null, "hibernateDays": null, "bonusAgainMode": null, "showRatingDays": "false", "nightModeActive": "false", "showReviewChart": null, "newCardSubjectId": "mtikj79r-myak0o"}, "autoZoom": {"refWidth": 390}, "bgColors": {"appBg": "#ebebeb", "cardBg": "#fafafa", "homeBg": "#ebebeb", "addBtnBg": "#ff0000", "folderBg": "#e3e3e3", "homeBtnBg": "#ffffff00", "cardFormBg": "#fafafae3", "folderL1Bg": "#d1d1d1", "folderL2Bg": "#bfbfbf", "folderL3Bg": "#b3b3b3", "svgChartBg": "#eef2f800", "chartWrapBg": "transparent", "dueBarColor": "#c7e2ff", "homeSquareBg": "#fafafa", "richEditorBg": "#fafafae3", "subjectRowBg": "#ffffff", "syncStatusBg": "transparent", "homeAddCardBg": "#d0c3b3", "homeLibraryBg": "#d69fd1", "libraryPageBg": "#e5cde3", "skipProgramBg": "#ffffff", "todayBarColor": "#d68a8a", "subjectSelectBg": "transparent", "reviewedBarColor": "#d9d9d9"}, "bodyLogo": {"size": 120, "shadow": true}, "homeLogo": {"x": 32, "y": 20, "size": 200, "shadow": true}, "iconBank": {"edit": "pencil", "undo": "undo", "hibernate": "moon", "construction": "flag"}, "navIcons": {"dev": "code", "sync": "refresh", "boxes": "layers", "cards": "search", "stats": "barChart", "manage": "folder", "review": "gradCap", "addCard": "plus", "library": "share", "reports": "flag", "calendar": "calendar", "settings": "settings", "creations": "pencil", "learning-modes": "gradCap"}, "navLabels": {"cards": "📄", "stats": "📊", "manage": "🗃️", "review": "🤓", "settings": "⚙", "learning-modes": "🎓"}, "nightMode": false, "taxColors": {"other": ["#d7eaf8", "#deeef9", "#e6f2fb", "#edf5fc", "#f4f9fd", "#fbfdfe"], "library": ["#d7eaf8", "#deeef9", "#e6f2fb", "#edf5fc", "#f4f9fd", "#fbfdfe"]}, "updatedAt": "2026-11-03T13:33:49.207Z", "appBgColor": "#c6dde7", "darwinLogo": {"x": 80, "y": 15, "size": 125, "color": "#18356c", "shadow": false}, "darwinText": {"x": 80, "y": 18.4, "size": 13, "content": "c’est facile !"}, "homeLayout": {"dev": {"d": 70, "x": 90, "y": 100}, "defi": {"d": 110, "x": 80, "y": 80}, "boxes": {"d": 105, "x": 50, "y": 50}, "stats": {"d": 50, "x": 44, "y": 108}, "manage": {"d": 95, "x": 23.9, "y": 40.4}, "review": {"d": 126, "x": 80, "y": 40}, "account": {"d": 50, "x": 76, "y": 108}, "addCard": {"d": 70, "x": 84.7, "y": 24.8}, "classes": {"d": 80, "x": 20, "y": 75.7}, "library": {"d": 69, "x": 14, "y": 88.5}, "reports": {"d": 50, "x": 92, "y": 108}, "calendar": {"d": 90, "x": 32, "y": 63}, "settings": {"d": 50, "x": 60, "y": 108}, "creations": {"d": 95, "x": 29.3, "y": 58.6}}, "reviewInfo": {"hideDelays": true}, "textColors": [{"hex": "#23302a", "label": "Foncé"}, {"hex": "#b6604a", "label": "Terracotta"}, {"hex": "#cf9a4d", "label": "Ambre"}, {"hex": "#6f8b5c", "label": "Sauge"}, {"hex": "#3e7c6b", "label": "Bleu-vert"}, {"hex": "#1f3a5f", "label": "Marine"}, {"hex": "#2a8fd8", "label": "Ciel"}, {"hex": "#c96a95", "label": "Rose"}, {"hex": "#8a5fb3", "label": "Violet"}, {"hex": "#d97f35", "label": "Orange"}, {"hex": "#6b7280", "label": "Gris"}], "cardBgColor": "#ffffff", "cycleColors": {"autre": "#94a3b8", "lycee": "#8a63c9", "college": "#4a9fe0", "primaire": "#e0a23a", "superieur": "#3e7c6b"}, "dueBarColor": "#b9d3e4", "nightColors": {"taxTint": {"other": {"color": "#000000", "alphas": [8, 11, 14, 17, 20, 23]}, "library": {"color": "#ffffff", "alphas": [15, 21, 27, 34, 41, 48]}}, "bgColors": {"appBg": "#11151c", "cardBg": "#1c2330", "homeBg": "#11151c", "addBtnBg": "#232b3a", "folderBg": "#1c2330", "homeBtnBg": "transparent", "cardFormBg": "#1c2330", "folderL1Bg": "#212939", "folderL2Bg": "#252e40", "folderL3Bg": "#2a3447", "svgChartBg": "#11151c", "chartWrapBg": "#1c2330", "dueBarColor": "#5a9fe0", "homeSquareBg": "#262f40", "richEditorBg": "#232b3a", "subjectRowBg": "#1c2330", "syncStatusBg": "transparent", "homeAddCardBg": "#204164", "homeLibraryBg": "#0d4259", "libraryPageBg": "#0d4259", "skipProgramBg": "#242d4c", "todayBarColor": "#6bafef", "subjectSelectBg": "#232b3a", "reviewedBarColor": "#5a9fe0"}, "taxColors": {"other": ["#1e2837", "#202e40", "#223449", "#253b51", "#27415a", "#294763"], "library": ["#1e2837", "#202e40", "#223449", "#253b51", "#27415a", "#294763"]}, "ratingColors": {"easy": "#21c458", "good": "#8bd5a4", "hard": "#c5d3ca", "again": "#e6e6e6"}, "textColorsSet": {"titles": "#eef2f8", "cardText": "#eef2f8", "syncText": "#93a1b5", "homeTitle": "#eef2f8", "chartLabels": "#93a1b5", "chartValues": "#93a1b5", "generalText": "#93a1b5", "selectorText": "#eef2f8", "chartTodayLabel": "#eef2f8", "folderSubjectNames": "#eef2f8"}, "ratingBtnBgColor": "#1c2330", "libraryCycleBgPct": 18}, "orgIconBank": {"orgMove": "move", "orgBoite": "layers", "orgDelete": "trash", "orgRename": "pencil"}, "ratingIcons": {"easy": "faceGrin", "good": "faceSmile", "hard": "faceNeutral", "again": "faceSad"}, "ratingColors": {"easy": "#21c458", "good": "#8bd5a4", "hard": "#c5d3ca", "again": "#e6e6e6"}, "ratingLabels": {"easy": "😎", "good": "🙂", "hard": "🤔", "again": "😵‍💫"}, "reviewLayout": {"cardTopPct": 45.5, "gaugeTopPct": 78, "cardWidthPct": 88, "gaugeWidthPx": 170, "statusTopPct": 95, "cardHeightPct": 45, "gaugeHeightPx": 12, "flipDurationSec": 0.7, "ratingRowTopPct": 34, "scoreInfoTopPct": 20, "boxChangeAnimSec": 0.6}, "revisionAlgo": {"version": 2, "coefFond": [0, 0, 2, 3], "coefSprint": [1.03, 1.05, 2, 3], "plafondMin": [4320, 1440, 43200, 172800], "plancherMin": [4320, 1440, 4320, 7200]}, "appPrefsOwner": "ab1af4b6-d1c8-44d9-a5e2-7631b6996098", "cardTextColor": "#23302a", "emptyBarColor": "#f2f2f2", "mainTextColor": "#002638", "textColorsSet": {"titles": "#1f2937", "cardText": "#1f2937", "syncText": "#8c8c8c", "homeTitle": "#1f2937", "chartLabels": "#5b6472", "chartValues": "#5b6472", "generalText": "#526073", "selectorText": "#1f2937", "chartTodayLabel": "#1f2937", "folderSubjectNames": "#1f2937"}, "todayBarColor": "#b1edf2", "bonusPillColor": "#ffffff", "homeLayoutUnit": "percent", "cardFormBgColor": "#fafafa", "persGaugeColors": {"long": "#88dda4", "court": "#d9d9d9", "moyen": "#abbab0", "tresLong": "#21c458"}, "svgChartBgColor": "#ffffff", "chartWrapBgColor": "#ffffff", "homeLayoutAnchor": "center", "ratingBtnBgColor": "#ffffff", "libraryCycleBgPct": 15, "richEditorBgColor": "#ffffff", "helpMessagesByView": {"dev": ["Le mode développeur : les réglages de présentation, communs à tous les utilisateurs."], "defi": ["Chaque jour, 10 questions de culture générale de plus en plus difficiles, les mêmes pour tout le monde. Tu as 3 vies : une erreur coûte une vie, et la question t''est reposée sans la réponse fausse.", "Quand tu as fini, partage ton score avec tes amis. Un nouveau défi arrive chaque jour à minuit."], "sync": ["L''état de la synchronisation de tes données entre tes appareils."], "cards": ["Toutes les fiches de cette boîte. Le drapeau signale une fiche à corriger ; la flèche ouvre les autres actions (éditer, déplacer, supprimer)."], "stats": ["Tes statistiques : combien de fiches tu révises, et comment tu progresses."], "manage": ["Sur cette page, tu organises tes dossiers et tes boites...", "Tu verras aussi tes classes. Une classe, c''est un peu comme un dossier, sauf que ce n''est pas toi qui la gère, c''est ton professeur...", "Tu peux créer des dossiers et des sous-dossiers dans lesquels tu ranges tes boîtes de fiches...", "Comment créer une boite de fiche ? C''est très simple : tu crées un dossier vide, tu y ranges une fiche et voilà ! Ton dossier s''est transformé en boite."], "review": ["Touche la fiche pour voir la réponse, puis dis-moi si tu la savais. Je m''occupe de te la reposer au bon moment."], "account": ["Ton compte : ton nom, ton niveau scolaire et la façon dont tu utilises l''appli."], "classes": ["Choisis ton rôle : élève (tu rejoins une classe avec un code) ou enseignant (tu crées tes classes)."], "library": ["Ici, tu peux prendre des collections de fiches partagées par d''autres — elles s''ajoutent à tes collections, avec cette icône en réseau pour les reconnaître."], "reports": ["Voici les fiches que d''autres utilisateurs t''ont signalées. Corrige-les, puis marque le signalement comme traité."], "calendar": ["Note ici tes échéances (contrôle, interrogation, partiels, bac...) liées à une boîte ou un dossier. De quoi, plus tard, générer automatiquement un programme de révision."], "messages": ["Une discussion par classe : touche une classe pour lire et écrire les messages."], "new-card": ["Écris la question et la réponse : je te poserai la question et tu me diras si tu connaissais la réponse."], "settings": ["Tes réglages : l''apparence des fiches, l''import et l''export de tes boîtes."], "creations": ["Ici, toutes les boîtes que tu as créées. Publie-les dans la Librairie, ou ajoute-les à tes révisions pour les ranger dans Mes fiches de révision."], "box-create": ["Donne un nom à ta boîte et classe-la : ce classement servira aux filtres, et sera repris si tu la publies dans la Librairie."], "fiches-hub": [], "review-hub": ["Choisis comment réviser : les révisions urgentes préparent tes prochaines échéances (c''est ce que je te conseille), le renforcement fait travailler les boîtes où tu es le plet la sélection manuelle te laisse choisir toi-même."], "school-hub": ["Retrouve ici tes classes, la messagerie de tes classes et ton calendrier."], "class-share": ["Partage une de tes boîtes avec la classe, ou une boîte de la Librairie (seuls les élèves abonnés y auront accès)."], "mode-assign": [], "report-card": ["Explique à l''auteur ce qui ne va pas dans cette fiche : il recevra ton message et pourra la corriger."], "reports-hub": ["Retrouve ici les fiches que tu as signalées à leur auteur, et celles que d''autres t''ont signalées."], "role-picker": ["Tu utilises darwin comme élève et comme enseignant : choisis le compte avec lequel tu veux continuer. Tu pourras en changer depuis l''accueil, en touchant « Élève » ou « Enseignant » en haut de l''écran."], "boite-picker": ["Choisis une boîte ou un dossier dans la liste."], "class-detail": ["La page de la classe : ses boîtes partagées, ses évènements à venir et la liste des élèves."], "classes-join": ["Entre le code que ton enseignant t''a donné pour rejoindre sa classe."], "reports-sent": ["Les fiches que tu as signalées : tu vois ici quand l''auteur les a corrigées, ce qu''il a changé, et son message."], "library-cards": ["Un aperçu des fiches de cette collection."], "library-share": ["Publie ta boîte dans la Librairie : donne-lui un nom, un classement et des mots clés pour qu''on la trouve facilement."], "subscriptions": ["Bientôt, l''abonnement te donnera accès à toutes les boîtes de la Librairie."], "classes-create": ["Donne un nom à ta classe."], "library-detail": ["La présentation de cette collection : son auteur, son classement et sa note."], "message-thread": ["Écris ton message en bas de la page : toute la classe le verra."], "classes-student": ["Les classes que tu as rejointes. Touche une classe pour voir ses boîtes et ses évènements."], "classes-teacher": ["Les classes que tu as créées. Donne leur code à tes élèves pour qu''ils les rejoignent."], "creation-detail": ["Le résumé de ta boîte : ses fiches, son classement, sa place dans tes révisions. Le bouton + ajoute une fiche."], "manage-creations": ["Ici, seulement les boîtes que tu as créées toi-même. L''interrupteur ne garde que celles publiées dans la Librairie."], "revision-program": ["A ta place, voici ce que je réviserais en priorité, dans l''ordre :"], "revision-reinforce": ["Voici tes boîtes, celles sur lesquelles tu es le plus en retard d''abord. La barre montre où tu en es dans l''apprentissage de chacune."], "calendar-event-form": ["Donne un titre et une date à ton échéance, puis choisis les boîtes à réviser pour elle."], "calendar-event-detail": ["Le détail de cette échéance et des boîtes à réviser pour elle."]}, "subscriptionPolicy": {"enforce": false, "trialDays": 30, "checkoutOpen": true, "referralMonths": 2, "freeLibraryBoxes": 2, "freeTeacherClasses": 1, "referralFriendMonths": 1, "freeClassLibraryBoxes": 2, "referralMaxMonthsPerYear": 12}, "constructionActiveColor": "#ffff00"},"updated_at":"2026-11-03T13:33:49.207+00:00"}'::json) on conflict do nothing;

notify pgrst, 'reload schema';
