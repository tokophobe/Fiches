-- Round 6 : cloisonne les réglages développeur personnels (table
-- dev_settings) par Compte Supabase Auth connecté, en plus du code de
-- synchro perso.
--
-- Pourquoi : dev_settings n'avait jusqu'ici qu'UNE ligne par code de
-- synchro (sync_code = clé primaire), complètement indépendante du
-- Compte connecté par-dessus (page Compte / Classes). Deux Comptes
-- différents (ex. un compte prof et un compte élève de test) utilisant
-- le MÊME code de synchro personnelle partageaient donc automatiquement
-- ces réglages — dont le mode nuit, qui fait partie de cet objet — y
-- compris en temps réel (abonnement Realtime), même avant tout clic sur
-- "Publier" (qui, lui, concerne un tout autre canal : dev_settings_public,
-- voir dev_settings_public_schema.sql).
--
-- Idempotent : peut être ré-exécuté sans risque.

alter table public.dev_settings
  add column if not exists account_email text not null default '';

-- Remplace la clé primaire (sync_code) par une clé composite
-- (sync_code, account_email). Les lignes déjà existantes reçoivent
-- account_email = '' (via le défaut ci-dessus), ce qui représente "aucun
-- Compte connecté" — exactement le comportement d'avant ce correctif,
-- donc rien ne casse pour un usage de la synchro perso sans Comptes/
-- Classes. Un Compte fraîchement cloisonné repart de cette ligne une
-- fois (voir pullDevSettings dans sync.js), pour ne pas perdre les
-- réglages déjà personnalisés par Stéphane.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'dev_settings_pkey' and conrelid = 'public.dev_settings'::regclass
  ) then
    alter table public.dev_settings drop constraint dev_settings_pkey;
  end if;
end $$;

alter table public.dev_settings
  add constraint dev_settings_pkey primary key (sync_code, account_email);

-- RLS inchangée (déjà "to anon, authenticated", ouverte — le code de
-- synchro reste le seul secret) : pas de ré-écriture nécessaire ici.
