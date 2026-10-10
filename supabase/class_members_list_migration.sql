-- ============================================================
-- Round 47 — à exécuter UNE FOIS dans Supabase (SQL Editor).
-- Idempotent : peut être relancé sans risque.
--
-- 1) Liste des élèves d'une classe (page d'une classe, section « Élèves ») :
--    prénom et nom de chaque membre ; l'email n'est renvoyé qu'à
--    l'enseignant de la classe (jamais aux autres élèves). Seuls
--    l'enseignant et les membres de la classe peuvent l'appeler.
-- 2) Boîte partagée avec une classe depuis la Librairie : on garde la
--    collection d'origine (library_collection_id), pour pouvoir plus tard
--    réserver ces boîtes aux élèves abonnés.
--
-- Sans ce script, l'appli fonctionne : la section « Élèves » indique que
-- la liste sera disponible après la mise à jour du serveur, et le partage
-- depuis la Librairie se fait sans garder la collection d'origine.
-- ============================================================

create or replace function public.class_members_list(p_class_id uuid)
returns table (user_id uuid, joined_at timestamptz, first_name text, last_name text, email text)
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
    select m.user_id,
           m.joined_at,
           coalesce(u.raw_user_meta_data->>'first_name', '')::text,
           coalesce(u.raw_user_meta_data->>'last_name', '')::text,
           (case when v_is_teacher then coalesce(u.email, '') else '' end)::text
      from public.class_members m
      join auth.users u on u.id = m.user_id
     where m.class_id = p_class_id
     order by 4, 3;
end;
$$;

revoke all on function public.class_members_list(uuid) from public;
revoke all on function public.class_members_list(uuid) from anon;
grant execute on function public.class_members_list(uuid) to authenticated;

alter table public.shared_boxes add column if not exists library_collection_id uuid;
