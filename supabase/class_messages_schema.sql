-- ============================================================
-- Fiches — Round 6, item 5 : messagerie par classe (façon groupe
-- WhatsApp — prof + tous les élèves d'une classe automatiquement
-- membres de la même discussion).
--
-- À exécuter UNE FOIS dans l'éditeur SQL de ton projet Supabase, EN PLUS
-- de classes_schema.sql et classes_schema_round3.sql déjà en place (ce
-- script réutilise leurs fonctions is_teacher_of_class /
-- is_member_of_class). Idempotent : peut être relancé sans risque.
-- ============================================================

create table if not exists public.class_messages (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  -- Dénormalisé : le client n'a pas accès à auth.users pour retrouver
  -- l'email d'un autre membre de la classe — juste pour l'affichage,
  -- jamais utilisé pour une vérification de droits (voir policies).
  sender_email text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists class_messages_class_id_created_at_idx
  on public.class_messages (class_id, created_at);

alter table public.class_messages enable row level security;

-- Lecture/écriture réservées aux membres de la classe (élèves) et à son
-- prof — mêmes fonctions `security definer` que shared_boxes/shared_events.
drop policy if exists "class_messages_select" on public.class_messages;
create policy "class_messages_select" on public.class_messages
  for select using (
    public.is_teacher_of_class(class_id)
    or public.is_member_of_class(class_id)
  );

drop policy if exists "class_messages_insert" on public.class_messages;
create policy "class_messages_insert" on public.class_messages
  for insert with check (
    sender_id = auth.uid()
    and (public.is_teacher_of_class(class_id) or public.is_member_of_class(class_id))
  );

-- Pas de update/delete : un message envoyé reste tel quel une fois posté
-- (comme dans un groupe de discussion classique) — plus simple, et
-- suffisant pour l'usage prévu ici.

-- Realtime : si les nouveaux messages n'apparaissent pas tout seuls dans
-- la messagerie (il faut recharger la page pour les voir), vérifie que
-- la réplication temps réel est activée pour cette table dans Supabase
-- (Database -> Replication -> supabase_realtime -> class_messages).
