-- ============================================================
-- Fiches — schéma "Classes" (partage prof -> élèves)
-- ============================================================
-- À exécuter dans l'éditeur SQL de ton projet Supabase (le même projet
-- que celui déjà utilisé pour la synchro des fiches). Ce script est
-- indépendant des tables existantes (cards, subjects, folders...) : il
-- n'y touche pas, il ajoute seulement ce qu'il faut pour les Classes.
--
-- Contrairement à la synchro perso (un simple "code" partagé, sans vrai
-- compte), les Classes ont besoin de VRAIS comptes Supabase Auth (email +
-- mot de passe) pour distinguer qui est prof, qui est élève, et empêcher
-- un élève de modifier les données d'un prof. Active donc l'auth par
-- email dans Supabase (Authentication -> Providers -> Email) si ce n'est
-- pas déjà fait — inscription libre, pas besoin de configurer un
-- fournisseur externe.

-- ------------------------------------------------------------
-- Table des classes
-- ------------------------------------------------------------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Membres d'une classe (élèves, et éventuellement co-profs plus tard)
-- ------------------------------------------------------------
create table if not exists public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'co-teacher')),
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

-- ------------------------------------------------------------
-- Boîtes partagées à une classe (instantané du contenu au moment du
-- partage — chaque élève en fera sa propre copie locale, avec sa propre
-- progression SM-2, jamais celle du prof).
-- ------------------------------------------------------------
create table if not exists public.shared_boxes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  shared_by uuid not null references auth.users(id) on delete cascade,
  subject_name text not null,
  cards jsonb not null default '[]'::jsonb, -- [{question, answer}, ...]
  -- Round 3, item 1 : chemin des dossiers du prof (noms, de la racine
  -- jusqu'au dossier direct de la boîte), pour que l'élève puisse
  -- reconstituer la même arborescence, en lecture seule, sous le dossier
  -- de sa classe. ex: ["Anglais", "Vocabulaire"].
  folder_path jsonb not null default '[]'::jsonb,
  shared_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration pour une base déjà créée avant round 3 (idempotent) :
alter table public.shared_boxes add column if not exists folder_path jsonb not null default '[]'::jsonb;

-- ------------------------------------------------------------
-- RLS : activée sur les 3 tables
-- ------------------------------------------------------------
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.shared_boxes enable row level security;

-- ------------------------------------------------------------
-- Fonctions `security definer` qui vérifient l'appartenance/le rôle SANS
-- redéclencher les politiques RLS de la table qu'elles consultent.
-- Indispensable : `classes` et `class_members` ont chacune besoin de
-- regarder dans l'autre pour décider qui a le droit de lire quoi ; passer
-- par une sous-requête RLS directe des deux côtés crée un cycle
-- ("infinite recursion detected in policy for relation classes"). Ces
-- fonctions cassent le cycle.
-- ------------------------------------------------------------
create or replace function public.is_teacher_of_class(p_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classes where id = p_class_id and teacher_id = auth.uid()
  );
$$;

grant execute on function public.is_teacher_of_class(uuid) to authenticated;

create or replace function public.is_member_of_class(p_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members where class_id = p_class_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_member_of_class(uuid) to authenticated;

-- classes : visible par son prof, et par ses membres (élèves) — jamais
-- par un inconnu (donc pas de moyen de "deviner" un code en listant les
-- classes existantes).
create policy "classes_select_own_or_member" on public.classes
  for select using (
    teacher_id = auth.uid()
    or public.is_member_of_class(id)
  );

create policy "classes_insert_as_teacher" on public.classes
  for insert with check (teacher_id = auth.uid());

create policy "classes_update_own" on public.classes
  for update using (teacher_id = auth.uid());

create policy "classes_delete_own" on public.classes
  for delete using (teacher_id = auth.uid());

-- class_members : un prof voit les membres de SES classes ; un élève se
-- voit lui-même. Aucun INSERT direct autorisé ici (voir la fonction
-- join_class_by_code plus bas) : c'est elle, pas le client, qui vérifie
-- le code d'invitation avant d'ajouter quelqu'un.
create policy "class_members_select" on public.class_members
  for select using (
    user_id = auth.uid()
    or public.is_teacher_of_class(class_id)
  );

create policy "class_members_delete" on public.class_members
  for delete using (
    user_id = auth.uid() -- un élève peut quitter une classe
    or public.is_teacher_of_class(class_id) -- un prof peut retirer un élève
  );

-- shared_boxes : un prof gère celles de SES classes ; un élève voit
-- celles des classes qu'il a rejointes.
create policy "shared_boxes_select" on public.shared_boxes
  for select using (
    public.is_teacher_of_class(class_id)
    or public.is_member_of_class(class_id)
  );

create policy "shared_boxes_insert_as_teacher" on public.shared_boxes
  for insert with check (
    shared_by = auth.uid()
    and public.is_teacher_of_class(class_id)
  );

create policy "shared_boxes_update_as_teacher" on public.shared_boxes
  for update using (public.is_teacher_of_class(class_id));

create policy "shared_boxes_delete_as_teacher" on public.shared_boxes
  for delete using (public.is_teacher_of_class(class_id));

-- ------------------------------------------------------------
-- Rejoindre une classe par code d'invitation.
-- SECURITY DEFINER : la fonction, elle, a le droit de lire la table
-- `classes` en entier pour vérifier le code (le client, lui, ne l'a
-- jamais — voir classes_select_own_or_member ci-dessus). C'est le seul
-- moyen sûr de rejoindre une classe sans exposer la liste de toutes les
-- classes existantes à tout le monde.
-- ------------------------------------------------------------
create or replace function public.join_class_by_code(p_code text)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes;
begin
  select * into v_class from public.classes where invite_code = upper(trim(p_code));
  if v_class.id is null then
    raise exception 'Code invalide';
  end if;

  insert into public.class_members (class_id, user_id, role)
  values (v_class.id, auth.uid(), 'student')
  on conflict (class_id, user_id) do nothing;

  return v_class;
end;
$$;

grant execute on function public.join_class_by_code(text) to authenticated;

-- ------------------------------------------------------------
-- Compte de membres par classe, pour l'affichage prof (nombre d'élèves)
-- sans avoir à exposer la liste des membres d'une autre classe.
-- ------------------------------------------------------------
create or replace function public.class_member_count(p_class_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from public.class_members where class_id = p_class_id;
$$;

grant execute on function public.class_member_count(uuid) to authenticated;

-- ------------------------------------------------------------
-- Round 3, item 4 (squelette) : événements de calendrier partagés par un
-- prof à une classe — même esprit que shared_boxes (le prof pousse, les
-- élèves reçoivent en lecture seule dans leur propre calendrier).
-- ------------------------------------------------------------
create table if not exists public.shared_events (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  shared_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shared_events enable row level security;

create policy "shared_events_select" on public.shared_events
  for select using (
    public.is_teacher_of_class(class_id)
    or public.is_member_of_class(class_id)
  );

create policy "shared_events_insert_as_teacher" on public.shared_events
  for insert with check (
    shared_by = auth.uid()
    and public.is_teacher_of_class(class_id)
  );

create policy "shared_events_update_as_teacher" on public.shared_events
  for update using (public.is_teacher_of_class(class_id));

create policy "shared_events_delete_as_teacher" on public.shared_events
  for delete using (public.is_teacher_of_class(class_id));
