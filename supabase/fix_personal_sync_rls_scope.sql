-- ============================================================
-- Fiches — correctif RLS : la synchro perso casse quand on est
-- connecté avec un Compte (Classes)
-- ============================================================
-- À exécuter dans l'éditeur SQL de ton projet Supabase. Idempotent,
-- peut être relancé sans risque.
--
-- Pourquoi ce correctif est nécessaire :
-- Les policies RLS des 6 tables de synchro "perso" (cards, subjects,
-- folders, reward_state, learning_modes, dev_settings) étaient toutes
-- écrites "to anon" — c'est-à-dire qu'elles n'autorisent QUE les
-- requêtes envoyées avec le rôle Postgres "anon" (visiteur non identifié).
--
-- Or le même client Supabase (un seul objet, partagé par toute l'appli)
-- sert à la fois à la synchro perso (par code de synchro, sans compte)
-- ET aux Comptes/Classes (avec compte, via Supabase Auth). Dès qu'un
-- appareil est connecté avec un compte (page Compte), TOUTES les
-- requêtes de ce client — y compris celles de la synchro perso — sont
-- envoyées avec le rôle "authenticated", plus "anon". Comme les
-- policies ne matchent que "anon", elles bloquent alors tout : c'est
-- exactement l'erreur "new row violates row-level security policy for
-- table \"cards\"" que tu as vue.
--
-- Le correctif : élargir ces 6 policies à "anon, authenticated", pour
-- que la synchro perso continue de fonctionner même sur un appareil
-- connecté à un compte. La sécurité reste la même qu'avant (ce sont
-- déjà des policies ouvertes "using (true)" — le "sync_code" est le
-- seul secret, comme précisé dans supabase-schema.sql) : on ne fait
-- qu'accepter aussi le rôle "authenticated" en plus de "anon", pas
-- ouvrir l'accès plus largement.

drop policy if exists "anon can read/write cards" on public.cards;
create policy "anon can read/write cards"
  on public.cards
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "anon can read/write subjects" on public.subjects;
create policy "anon can read/write subjects"
  on public.subjects
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "anon can read/write folders" on public.folders;
create policy "anon can read/write folders"
  on public.folders
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "anon can read/write reward_state" on public.reward_state;
create policy "anon can read/write reward_state"
  on public.reward_state
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "anon can read/write learning_modes" on public.learning_modes;
create policy "anon can read/write learning_modes"
  on public.learning_modes
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "anon can read/write dev_settings" on public.dev_settings;
create policy "anon can read/write dev_settings"
  on public.dev_settings
  for all
  to anon, authenticated
  using (true)
  with check (true);

notify pgrst, 'reload schema';
