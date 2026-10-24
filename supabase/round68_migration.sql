-- ============================================================
-- Fiches — round 68 (v228) : formule Super enseignant
-- ============================================================
-- À exécuter UNE fois dans l'éditeur SQL de Supabase (idempotent), après
-- round65_migration.sql.
--
-- Super enseignant : 1 € / mois / classe couverte (prix Stripe « par
-- unité », quantité = nombre de classes). Les élèves d'une classe couverte
-- ont accès aux boîtes de la Librairie que l'enseignant y partage, sans
-- abonnement de leur côté. L'enseignant a lui-même accès à la Librairie.
--
-- - subscriptions.super_class_ids : classes choisies par l'enseignant
--   (écrit uniquement par les fonctions serveur create-checkout et
--   update-super-classes).
-- - class_library_access(classe) : la classe est-elle couverte ?
--   (enseignant avec une formule Super enseignant en cours, classe dans sa
--   liste, pas plus de classes que de places payées, 60 élèves au plus).
-- - my_covered_classes() : classes couvertes de l'utilisateur connecté
--   (comme enseignant ou comme élève) — lue par l'appli pour déverrouiller
--   les boîtes de la Librairie partagées dans ces classes.
-- ============================================================

alter table public.subscriptions add column if not exists super_class_ids uuid[] not null default '{}';

create or replace function public.class_library_access(p_class uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.classes c
      join public.subscriptions s on s.user_id = c.teacher_id
     where c.id = p_class
       and s.plan = 'super_enseignant'
       and s.status in ('active', 'trial', 'past_due')
       and (s.current_period_end is null or s.current_period_end > now())
       and c.id = any (s.super_class_ids)
       and coalesce(array_length(s.super_class_ids, 1), 0) <= greatest(s.quantity, 0)
       and (select count(*) from public.class_members m where m.class_id = c.id and m.role = 'student') <= 60
  );
$$;
revoke all on function public.class_library_access(uuid) from public, anon;
grant execute on function public.class_library_access(uuid) to authenticated;

create or replace function public.my_covered_classes()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(c.id), '{}')
    from public.classes c
   where (c.teacher_id = auth.uid()
          or exists (select 1 from public.class_members m where m.class_id = c.id and m.user_id = auth.uid()))
     and public.class_library_access(c.id);
$$;
revoke all on function public.my_covered_classes() from public, anon;
grant execute on function public.my_covered_classes() to authenticated;

notify pgrst, 'reload schema';
