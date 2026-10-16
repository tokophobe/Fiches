-- ============================================================
-- Round 53 — à exécuter UNE FOIS dans Supabase (SQL Editor), AVANT de
-- mettre en ligne la v207. Idempotent : peut être relancé sans risque.
--
-- 1) Dossiers propres à chaque classe : l'enseignant range les boîtes
--    partagées dans des dossiers créés depuis la page de la classe (les
--    boîtes partagées n'héritent plus de son organisation personnelle).
--    `box_folders` garde la liste des dossiers (y compris vides), chacun
--    sous forme de chemin : [["Chapitre 1"], ["Chapitre 1", "Exercices"]].
--    La mise à jour passe par la règle existante « classes_update_own »
--    (seul l'enseignant de la classe peut la modifier).
-- 2) Adresse email des élèves : l'enseignant ne la voit plus que si
--    l'élève l'a autorisé (case « Montrer mon adresse email aux
--    enseignants de mes classes » dans Mon compte, métadonnée
--    `share_email_with_teachers`).
--
-- Sans ce script : les dossiers qui contiennent des boîtes fonctionnent
-- (chemin de chaque boîte), mais un dossier vide ne peut pas être créé ;
-- l'email resterait visible par l'enseignant comme avant.
-- ============================================================

alter table public.classes add column if not exists box_folders jsonb not null default '[]'::jsonb;

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
                  when v_is_teacher and coalesce(u.raw_user_meta_data->>'share_email_with_teachers', 'false') = 'true'
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
