-- ============================================================
-- Fiches — migration Round 3 (à exécuter UNE FOIS, en plus du schéma
-- classes_schema.sql déjà en place, dans l'éditeur SQL Supabase).
-- Idempotent : peut être relancé sans risque si jamais interrompu.
-- ============================================================

-- Item 1 : chemin de dossiers (organisation du prof) transporté avec
-- chaque boîte partagée, pour que l'élève la reconstitue en lecture seule.
alter table public.shared_boxes add column if not exists folder_path jsonb not null default '[]'::jsonb;

-- Item 4 (squelette) : événements de calendrier partagés par un prof à
-- une classe — même esprit que shared_boxes.
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

drop policy if exists "shared_events_select" on public.shared_events;
create policy "shared_events_select" on public.shared_events
  for select using (
    public.is_teacher_of_class(class_id)
    or public.is_member_of_class(class_id)
  );

drop policy if exists "shared_events_insert_as_teacher" on public.shared_events;
create policy "shared_events_insert_as_teacher" on public.shared_events
  for insert with check (
    shared_by = auth.uid()
    and public.is_teacher_of_class(class_id)
  );

drop policy if exists "shared_events_update_as_teacher" on public.shared_events;
create policy "shared_events_update_as_teacher" on public.shared_events
  for update using (public.is_teacher_of_class(class_id));

drop policy if exists "shared_events_delete_as_teacher" on public.shared_events;
create policy "shared_events_delete_as_teacher" on public.shared_events
  for delete using (public.is_teacher_of_class(class_id));
