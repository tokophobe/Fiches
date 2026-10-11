-- ============================================================
-- Round 48 — à exécuter UNE FOIS dans Supabase (SQL Editor), APRÈS
-- supabase/class_members_list_migration.sql (round 47).
-- Idempotent : peut être relancé sans risque.
--
-- 1) Codes de classe : les codes sont générés sans O, I, 0 (ni 1 ni L)
--    depuis longtemps ; les codes plus anciens qui contiennent O, I ou 0
--    sont remplacés par un nouveau code sans ces caractères. Les élèves
--    déjà inscrits ne sont pas concernés (le code ne sert qu'à rejoindre) ;
--    l'enseignant voit le nouveau code sur la page de sa classe.
-- 2) Messagerie : prénom et nom de l'expéditeur enregistrés avec chaque
--    message (colonne sender_name), affichés à la place de l'email.
-- 3) Liste des membres d'une classe : l'enseignant y figure aussi
--    (role = 'teacher'), pour afficher son nom dans la messagerie.
-- ============================================================

-- 1) Codes de classe -------------------------------------------------
create or replace function public.fiches_random_class_code()
returns text
language plpgsql
volatile
as $$
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
$$;

update public.classes
   set invite_code = public.fiches_random_class_code(),
       updated_at = now()
 where invite_code ~ '[OI0]';

-- 2) Nom de l'expéditeur des messages --------------------------------
alter table public.class_messages add column if not exists sender_name text not null default '';

-- Rattrapage des anciens messages : prénom et nom du compte, s'ils sont
-- renseignés.
update public.class_messages m
   set sender_name = trim(coalesce(u.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(u.raw_user_meta_data->>'last_name', ''))
  from auth.users u
 where u.id = m.sender_id
   and m.sender_name = ''
   and trim(coalesce(u.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(u.raw_user_meta_data->>'last_name', '')) <> '';

-- 3) Membres d'une classe, enseignant compris ------------------------
drop function if exists public.class_members_list(uuid);
create function public.class_members_list(p_class_id uuid)
returns table (user_id uuid, joined_at timestamptz, first_name text, last_name text, email text, role text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_is_teacher boolean := public.is_teacher_of_class(p_class_id);
begin
  if not (v_is_teacher or public.is_member_of_class(p_class_id)) then
    return;
  end if;
  return query
    select x.user_id, x.joined_at, x.first_name, x.last_name, x.email, x.role
      from (
        select m.user_id,
               m.joined_at,
               coalesce(u.raw_user_meta_data->>'first_name', '')::text as first_name,
               coalesce(u.raw_user_meta_data->>'last_name', '')::text as last_name,
               (case when v_is_teacher then coalesce(u.email, '') else '' end)::text as email,
               'student'::text as role
          from public.class_members m
          join auth.users u on u.id = m.user_id
         where m.class_id = p_class_id
        union all
        select c.teacher_id,
               c.created_at,
               coalesce(u.raw_user_meta_data->>'first_name', '')::text,
               coalesce(u.raw_user_meta_data->>'last_name', '')::text,
               ''::text,
               'teacher'::text
          from public.classes c
          join auth.users u on u.id = c.teacher_id
         where c.id = p_class_id
      ) x
     order by x.role desc, x.last_name, x.first_name;
end;
$$;

revoke all on function public.class_members_list(uuid) from public;
revoke all on function public.class_members_list(uuid) from anon;
grant execute on function public.class_members_list(uuid) to authenticated;
