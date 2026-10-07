-- ============================================================
-- Fiches — Round 41 : signaler une fiche à son auteur.
--
-- Quand un élève signale une fiche d'une boîte de classe ou d'une
-- collection prise dans la Librairie, il écrit un message à l'auteur
-- (le prof qui a partagé la boîte, ou l'auteur de la collection). L'auteur
-- le retrouve dans « Gérer mes fiches » → bouton « Signalements ».
--
-- À exécuter UNE FOIS dans Supabase → SQL Editor → New query → Run.
-- Peut être relancé sans risque.
-- ============================================================
create table if not exists public.card_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reporter_name text not null default '',
  author_id uuid not null references auth.users(id) on delete cascade,
  source_kind text not null check (source_kind in ('library', 'class')),
  source_id text not null,
  box_name text not null default '',
  card_id text not null default '',
  card_question text not null default '',
  card_answer text not null default '',
  message text not null check (length(message) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  resolved boolean not null default false
);
create index if not exists card_reports_author_idx on public.card_reports (author_id, resolved);

alter table public.card_reports enable row level security;

-- Signaler : seulement en son nom, et seulement à l'auteur RÉEL de la
-- collection / de la boîte partagée concernée (pas de message envoyé à
-- n'importe qui).
drop policy if exists "card_reports_insert" on public.card_reports;
create policy "card_reports_insert" on public.card_reports
  for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and (
      (source_kind = 'library' and exists (
        select 1 from public.library_collections lc
        where lc.id::text = source_id and lc.owner_id = author_id))
      or
      (source_kind = 'class' and exists (
        select 1 from public.shared_boxes sb
        where sb.id::text = source_id and sb.shared_by = author_id))
    )
  );

-- Lire : l'auteur (ses signalements reçus) et celui qui a signalé.
drop policy if exists "card_reports_select" on public.card_reports;
create policy "card_reports_select" on public.card_reports
  for select to authenticated
  using (author_id = auth.uid() or reporter_id = auth.uid());

-- Marquer comme lu / traité : l'auteur seulement.
drop policy if exists "card_reports_update" on public.card_reports;
create policy "card_reports_update" on public.card_reports
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "card_reports_delete" on public.card_reports;
create policy "card_reports_delete" on public.card_reports
  for delete to authenticated
  using (author_id = auth.uid());

notify pgrst, 'reload schema';
