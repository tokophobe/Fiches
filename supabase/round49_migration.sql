-- ============================================================
-- Round 49 — à exécuter UNE FOIS dans Supabase (SQL Editor), APRÈS
-- supabase/card_reports_migration.sql. Idempotent.
--
-- Signalements : suivi côté signaleur.
-- - Quand l'auteur traite un signalement, on garde la date et la fiche
--   telle qu'elle est après correction (resolved_question / _answer), pour
--   que le signaleur voie les modifications apportées.
-- - L'auteur peut écrire un message au signaleur (author_reply).
-- - Le signaleur marque comme « vus » le traitement et la réponse
--   (reporter_seen_at), via une fonction qui ne touche qu'à ce champ et à
--   SES signalements (il n'a aucun autre droit de modification).
-- ============================================================

alter table public.card_reports add column if not exists resolved_at timestamptz;
alter table public.card_reports add column if not exists resolved_question text;
alter table public.card_reports add column if not exists resolved_answer text;
alter table public.card_reports add column if not exists author_reply text;
alter table public.card_reports add column if not exists author_reply_at timestamptz;
alter table public.card_reports add column if not exists reporter_seen_at timestamptz;

alter table public.card_reports drop constraint if exists card_reports_author_reply_len;
alter table public.card_reports add constraint card_reports_author_reply_len
  check (author_reply is null or length(author_reply) <= 2000);

create index if not exists card_reports_reporter_idx on public.card_reports (reporter_id);

create or replace function public.card_reports_mark_seen(p_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.card_reports
     set reporter_seen_at = now()
   where id = any(p_ids)
     and reporter_id = auth.uid();
$$;

revoke all on function public.card_reports_mark_seen(uuid[]) from public;
revoke all on function public.card_reports_mark_seen(uuid[]) from anon;
grant execute on function public.card_reports_mark_seen(uuid[]) to authenticated;

notify pgrst, 'reload schema';
