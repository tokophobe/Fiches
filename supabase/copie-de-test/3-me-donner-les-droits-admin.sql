-- ============================================================
-- Copie de test — étape C : devenir administrateur de la BASE DE TEST.
--
-- À exécuter dans le projet Supabase de TEST (darwin-test) seulement,
-- APRÈS avoir créé son compte depuis l'adresse de test de l'appli.
-- SQL Editor → New query → coller → Run. Peut être relancé sans risque.
-- ============================================================
insert into public.admins (user_id, email)
select u.id, coalesce(u.email, '')
  from auth.users u
 where lower(u.email) = 'stephane.vezain@gmail.com'
on conflict (user_id) do nothing;

-- Vérification : doit afficher une ligne avec l'adresse email.
select email, added_at from public.admins;
