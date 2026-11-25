-- ============================================================
-- v305 — Remarques de l'administrateur sur les fiches et les boîtes
-- (demande du propriétaire, 25 nov. 2026).
--
-- QUOI : dans l'appli, l'administrateur écrit une remarque sur une fiche
-- (page d'une boîte ou révision) ou sur une boîte. Claude Code lit les
-- remarques nouvelles au début de chaque demande, les traite, puis les
-- marque « traitée » ou « question » avec une réponse courte.
--
-- À FAIRE, dans l'ordre :
--   1. Exécuter ce script dans l'éditeur SQL de la base de TEST, puis de
--      la base RÉELLE (il peut être rejoué sans risque).
--   2. Dans chaque base, lire le code d'accès de Claude :
--        select token from public.claude_access;
--      et le saisir dans le formulaire sécurisé que Claude ouvre
--      (« clé » de l'en-tête x-remarques-token, une par base).
--      Ne jamais coller ce code dans le chat.
--
-- SÉCURITÉ : la table des remarques n'est lisible et modifiable que par
-- un administrateur (fonction is_admin, admin_migration.sql). Claude n'a
-- pas de compte : il passe par deux fonctions qui vérifient le code
-- d'accès envoyé dans l'en-tête x-remarques-token et ne permettent que
-- de lire les remarques et d'y répondre.
-- ============================================================

create table if not exists public.admin_remarks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author uuid default auth.uid(),
  scope text not null default 'fiche',        -- 'fiche' ou 'boite'
  context text not null default 'boite',      -- 'boite' (page d'une boîte) ou 'revision'
  form text,                                  -- forme affichée en révision : a, b, c, cbis, d
  card_id text,                               -- identifiant de la fiche dans le compte
  box_name text,                              -- nom de la boîte
  card_snapshot jsonb,                        -- question, réponse, texte à trous, question poussée…
  body text not null,                         -- la remarque
  status text not null default 'envoyee',     -- 'envoyee', 'traitee' ou 'question'
  reply text,                                 -- réponse de Claude
  replied_at timestamptz
);

alter table public.admin_remarks drop constraint if exists admin_remarks_scope_check;
alter table public.admin_remarks add constraint admin_remarks_scope_check check (scope in ('fiche', 'boite'));
alter table public.admin_remarks drop constraint if exists admin_remarks_context_check;
alter table public.admin_remarks add constraint admin_remarks_context_check check (context in ('boite', 'revision'));
alter table public.admin_remarks drop constraint if exists admin_remarks_status_check;
alter table public.admin_remarks add constraint admin_remarks_status_check check (status in ('envoyee', 'traitee', 'question'));

create index if not exists admin_remarks_status_idx on public.admin_remarks (status, created_at);

alter table public.admin_remarks enable row level security;
drop policy if exists admin_remarks_admin_all on public.admin_remarks;
create policy admin_remarks_admin_all on public.admin_remarks
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Code d'accès de Claude (une seule ligne). Aucune policy : la table
-- n'est lue que par les fonctions ci-dessous.
create table if not exists public.claude_access (
  id int primary key default 1 check (id = 1),
  token text not null default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
);
alter table public.claude_access enable row level security;
revoke all on public.claude_access from anon, authenticated;
insert into public.claude_access (id) values (1) on conflict (id) do nothing;

-- Le code envoyé dans l'en-tête x-remarques-token est-il le bon ?
create or replace function public.claude_token_ok()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (nullif(current_setting('request.headers', true), '')::json ->> 'x-remarques-token') = (select token from public.claude_access where id = 1),
    false
  );
$$;
revoke all on function public.claude_token_ok() from public;

-- Remarques pour Claude : en attente seulement, ou toutes.
create or replace function public.claude_remarks(p_all boolean default false)
returns setof public.admin_remarks
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.claude_token_ok() then
    raise exception 'accès refusé' using errcode = '42501';
  end if;
  return query
    select * from public.admin_remarks r
     where p_all or r.status = 'envoyee'
     order by r.created_at;
end;
$$;
revoke all on function public.claude_remarks(boolean) from public;
grant execute on function public.claude_remarks(boolean) to anon;

-- Réponse de Claude : statut « traitee » ou « question », et texte court.
create or replace function public.claude_remark_reply(p_id uuid, p_status text, p_reply text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.claude_token_ok() then
    raise exception 'accès refusé' using errcode = '42501';
  end if;
  if p_status not in ('traitee', 'question', 'envoyee') then
    raise exception 'statut inconnu : %', p_status;
  end if;
  update public.admin_remarks
     set status = p_status, reply = p_reply, replied_at = now()
   where id = p_id;
end;
$$;
revoke all on function public.claude_remark_reply(uuid, text, text) from public;
grant execute on function public.claude_remark_reply(uuid, text, text) to anon;
