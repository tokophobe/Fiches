-- ============================================================
-- Round 55 — à exécuter UNE FOIS dans Supabase (SQL Editor), AVANT de
-- mettre en ligne la v209 (après round53_migration.sql). Idempotent.
--
-- Adresse email des élèves dans la liste d'une classe : elle est
-- maintenant montrée à l'enseignant PAR DÉFAUT, sauf si l'élève a coché
-- « Ne pas montrer mon adresse email aux enseignants et élèves de mes
-- classes » dans Mon compte (métadonnée hide_email_in_classes). Les
-- autres élèves ne voient jamais l'email. L'ancienne autorisation
-- (share_email_with_teachers, round 53) n'est plus utilisée.
-- ============================================================

-- Même résultat que la version du round 48 (enseignant compris, colonne
-- role), seule la colonne email change. DROP d'abord : Postgres refuse de
-- remplacer une fonction dont les colonnes renvoyées diffèrent.
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
               (case
                  when v_is_teacher and coalesce(u.raw_user_meta_data->>'hide_email_in_classes', 'false') <> 'true'
                    then coalesce(u.email, '')
                  else ''
                end)::text as email,
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
