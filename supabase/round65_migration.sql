-- ============================================================
-- Fiches — round 65 (v222) : paiements Stripe (abonnement Individuel)
-- ============================================================
-- À exécuter UNE fois dans l'éditeur SQL de Supabase (idempotent), après
-- round64_migration.sql. Voir supabase/functions/README-stripe.md pour la suite
-- (compte Stripe, fonctions serveur, webhook).
--
-- - subscriptions : identifiants Stripe (client, abonnement, prix),
--   résiliation programmée, essai déjà utilisé (un seul mois offert par
--   compte). Écriture : uniquement les fonctions serveur (clé
--   service_role), jamais l'appli.
-- - stripe_events : évènements Stripe déjà traités (un évènement reçu deux
--   fois n'est appliqué qu'une fois). Aucun accès depuis l'appli.
-- - delete_my_account : un abonnement Stripe non résilié bloque toujours
--   la suppression (round 64) ; un abonnement résilié en fin de période
--   ne la bloque plus.
-- ============================================================

alter table public.subscriptions add column if not exists stripe_customer_id text;
alter table public.subscriptions add column if not exists stripe_subscription_id text;
alter table public.subscriptions add column if not exists stripe_price_id text;
alter table public.subscriptions add column if not exists quantity integer not null default 1;
alter table public.subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.subscriptions add column if not exists trial_used boolean not null default false;

-- Nouveau statut « incomplete » : paiement Stripe commencé mais pas encore
-- confirmé (même accès que sans abonnement).
alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('active', 'trial', 'none', 'canceled', 'past_due', 'incomplete'));

create unique index if not exists subscriptions_stripe_customer_idx
  on public.subscriptions (stripe_customer_id) where stripe_customer_id is not null;

create table if not exists public.stripe_events (
  id text primary key,
  type text not null default '',
  received_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
revoke all on public.stripe_events from anon, authenticated;

-- Darwin Admin, « Pas d'abonnement » (valeur 'default') : la ligne d'un client Stripe n'est
-- plus effacée (on perdrait le lien avec son client Stripe, et un nouveau
-- client serait créé à son prochain abonnement) ; elle passe en
-- « Résilié », qui donne exactement le même accès que l'absence de ligne.
create or replace function public.admin_set_subscription(
  p_user uuid, p_status text, p_plan text default '', p_until timestamptz default null, p_note text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_assert();
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'Compte introuvable';
  end if;
  if p_status = 'default' then
    if exists (select 1 from public.subscriptions where user_id = p_user and stripe_customer_id is not null) then
      update public.subscriptions
         set status = 'canceled', plan = '', source = 'manual', current_period_end = null,
             note = coalesce(p_note, ''), updated_at = now(), updated_by = auth.uid()
       where user_id = p_user;
    else
      delete from public.subscriptions where user_id = p_user;
    end if;
    perform public.admin_log('subscription.clear', p_user::text,
      jsonb_build_object('email', (select email from auth.users where id = p_user)));
    return;
  end if;
  insert into public.subscriptions (user_id, status, plan, source, current_period_end, note, updated_at, updated_by)
  values (p_user, p_status, coalesce(p_plan, ''), 'manual', p_until, coalesce(p_note, ''), now(), auth.uid())
  on conflict (user_id) do update
    set status = excluded.status, plan = excluded.plan, source = 'manual',
        current_period_end = excluded.current_period_end, note = excluded.note,
        updated_at = now(), updated_by = auth.uid();
  perform public.admin_log('subscription.set', p_user::text,
    jsonb_build_object('status', p_status, 'plan', p_plan, 'until', p_until, 'email',
                       (select email from auth.users where id = p_user)));
end;
$$;

-- Suppression du compte : bloquée seulement par un abonnement payant qui
-- continuera d'être prélevé (pas déjà résilié pour la fin de période).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  my_email text;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if exists (
    select 1 from public.subscriptions s
     where s.user_id = uid and s.source in ('stripe', 'apple', 'google')
       and s.status in ('active', 'trial', 'past_due')
       and not s.cancel_at_period_end
       and (s.current_period_end is null or s.current_period_end > now())
  ) then
    raise exception 'active_subscription';
  end if;
  if exists (select 1 from public.admins a where a.user_id = uid)
     and (select count(*) from public.admins) <= 1 then
    raise exception 'last_admin';
  end if;

  select email into my_email from auth.users where id = uid;

  update public.dev_settings_public set updated_by = null where updated_by = uid;
  if to_regclass('public.dev_settings') is not null and my_email is not null then
    execute 'delete from public.dev_settings where lower(account_email) = lower($1)' using my_email;
  end if;

  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

notify pgrst, 'reload schema';
