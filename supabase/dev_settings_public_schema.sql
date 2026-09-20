-- ============================================================
-- Fiches — réglages du mode développeur, publiés pour tout le monde
-- ============================================================
-- À exécuter dans l'éditeur SQL de ton projet Supabase (le même projet
-- que celui déjà utilisé pour la synchro des fiches et les Classes).
-- Idempotent, peut être relancé sans risque.
--
-- Round 4, partie 3 : jusqu'ici, un réglage fait dans le mode
-- développeur (couleurs, icônes, messages d'aide du robot...) ne
-- survivait qu'en local (+ synchronisé entre TES appareils via ton
-- propre code de synchro) — un élève, un prof, ou un tout nouvel
-- appareil démarrait toujours avec les valeurs par défaut écrites dans
-- le code, jusqu'à ce qu'une nouvelle version de l'appli soit livrée.
--
-- Cette table ajoute une ligne UNIQUE et PARTAGÉE, publiée depuis le
-- mode développeur ("Publier ces réglages pour tous les utilisateurs"),
-- lue par TOUTE installation de l'appli au démarrage (dès lors que la
-- Sync est configurée avec l'URL/clé de CE projet — ce qui est déjà le
-- cas de tout utilisateur des Classes, élève ou prof, puisque Classes et
-- synchro perso partagent le même projet Supabase).
create table if not exists public.dev_settings_public (
  id text primary key default 'global',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.dev_settings_public enable row level security;

-- Lecture : tout le monde, MÊME sans compte (clé anonyme) — c'est ce qui
-- permet à une installation qui n'a que la synchro perso (pas de compte
-- Classes) de récupérer quand même ces réglages au démarrage.
drop policy if exists "dev_settings_public_select_all" on public.dev_settings_public;
create policy "dev_settings_public_select_all" on public.dev_settings_public
  for select using (true);

-- Écriture : réservée à TON compte (identifié par ton email de compte
-- Classes/Compte, stephane.vezain@gmail.com) — si tu changes un jour
-- d'adresse, remplace-la ici ET relance ce fichier.
drop policy if exists "dev_settings_public_insert_owner" on public.dev_settings_public;
create policy "dev_settings_public_insert_owner" on public.dev_settings_public
  for insert with check ((auth.jwt() ->> 'email') = 'stephane.vezain@gmail.com');

drop policy if exists "dev_settings_public_update_owner" on public.dev_settings_public;
create policy "dev_settings_public_update_owner" on public.dev_settings_public
  for update using ((auth.jwt() ->> 'email') = 'stephane.vezain@gmail.com');
