// =====================================================================
// Fiches — fonction serveur « stripe-webhook » (round 65)
// ---------------------------------------------------------------------
// Stripe prévient cette adresse à chaque changement (paiement, essai,
// renouvellement, impayé, résiliation). La signature est vérifiée, puis
// l'abonnement est RELU chez Stripe (état toujours à jour, même si les
// évènements arrivent dans le désordre) et recopié dans la table
// `subscriptions` — celle que lisent l'appli, Darwin Admin et la règle
// d'accès à la Librairie (has_library_access).
//
// À déployer SANS vérification de jeton Supabase (Stripe n'en a pas) :
//   supabase functions deploy stripe-webhook --no-verify-jwt
// (ou, dans le tableau de bord : décocher « Enforce JWT verification »).
// Secrets : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (whsec_…),
//           STRIPE_PRICE_INDIVIDUEL, STRIPE_PRICE_INDIVIDUEL_ANNUEL,
//           STRIPE_PRICE_SUPER_ENSEIGNANT.
// Évènements à cocher dans Stripe : checkout.session.completed,
//   customer.subscription.created / updated / deleted,
//   invoice.paid, invoice.payment_failed.
// =====================================================================
import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

export type Deps = {
  env: (k: string) => string | undefined;
  stripe: any;
  admin: any;
  verify: (payload: string, signature: string) => Promise<any>;
};

/** Statut Stripe → statut de la table subscriptions. */
export function mapStatus(s: string): string {
  switch (s) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "incomplete":
      return "incomplete";
    default:
      // canceled, incomplete_expired, paused
      return "canceled";
  }
}

/** Fin de la période en cours (champ déplacé sur les lignes de
 *  l'abonnement dans les versions récentes de l'API Stripe). */
export function periodEnd(sub: any): string | null {
  const item = sub && sub.items && Array.isArray(sub.items.data) ? sub.items.data[0] : null;
  const ts = (sub && sub.current_period_end) || (item && item.current_period_end) || (sub && sub.trial_end) || null;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

export function planOf(priceId: string | null, env: (k: string) => string | undefined): string {
  if (priceId && priceId === env("STRIPE_PRICE_INDIVIDUEL")) return "individuel";
  if (priceId && priceId === env("STRIPE_PRICE_INDIVIDUEL_ANNUEL")) return "individuel_annuel";
  if (priceId && priceId === env("STRIPE_PRICE_SUPER_ENSEIGNANT")) return "super_enseignant";
  return priceId ? `stripe:${priceId}` : "";
}

/** Ligne `subscriptions` correspondant à un abonnement Stripe. */
export function rowFromSubscription(sub: any, env: (k: string) => string | undefined) {
  const item = sub.items && Array.isArray(sub.items.data) ? sub.items.data[0] : null;
  const priceId = item && item.price ? item.price.id : null;
  return {
    status: mapStatus(sub.status),
    source: "stripe",
    plan: planOf(priceId, env),
    current_period_end: periodEnd(sub),
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer && sub.customer.id,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    quantity: (item && item.quantity) || 1,
    cancel_at_period_end: !!sub.cancel_at_period_end || !!sub.cancel_at,
    updated_at: new Date().toISOString(),
    updated_by: null,
  };
}

async function findUserId(deps: Deps, sub: any): Promise<string | null> {
  const meta = sub.metadata && sub.metadata.user_id;
  if (meta) return meta;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer && sub.customer.id;
  if (!customerId) return null;
  const { data } = await deps.admin.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
  if (data && data.user_id) return data.user_id;
  // Dernier recours : l'identifiant posé sur le client à sa création.
  const customer = await deps.stripe.customers.retrieve(customerId);
  return (customer && customer.metadata && customer.metadata.user_id) || null;
}

export async function syncSubscription(deps: Deps, subscriptionId: string): Promise<string> {
  const sub = await deps.stripe.subscriptions.retrieve(subscriptionId);
  const userId = await findUserId(deps, sub);
  if (!userId) return "no_user";
  const { data: existing } = await deps.admin
    .from("subscriptions")
    .select("stripe_subscription_id, status, trial_used")
    .eq("user_id", userId)
    .maybeSingle();
  const row: any = rowFromSubscription(sub, deps.env);
  // Un ancien abonnement qui se termine ne doit pas écraser un abonnement
  // plus récent déjà enregistré pour ce compte.
  if (
    existing &&
    existing.stripe_subscription_id &&
    existing.stripe_subscription_id !== sub.id &&
    ["canceled", "incomplete"].includes(row.status) &&
    ["active", "trial", "past_due"].includes(existing.status)
  ) {
    return "ignored_old_subscription";
  }
  row.trial_used = !!(existing && existing.trial_used) || !!sub.trial_start || sub.status === "trialing";
  const { error } = await deps.admin.from("subscriptions").upsert({ user_id: userId, ...row }, { onConflict: "user_id" });
  if (error) throw new Error(error.message || String(error));
  return row.status;
}

export function createHandler(deps: Deps) {
  return async (req: Request): Promise<Response> => {
    if (req.method !== "POST") return new Response("method_not_allowed", { status: 405 });
    const signature = req.headers.get("Stripe-Signature") || "";
    const payload = await req.text();
    let event: any;
    try {
      event = await deps.verify(payload, signature);
    } catch (e) {
      console.warn("stripe-webhook : signature invalide", (e as Error)?.message);
      return new Response("bad_signature", { status: 400 });
    }
    try {
      const { data: seen } = await deps.admin.from("stripe_events").select("id").eq("id", event.id).maybeSingle();
      if (seen) return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });

      const obj = event.data && event.data.object;
      let result = "ignored";
      switch (event.type) {
        case "checkout.session.completed":
          if (obj && obj.mode === "subscription" && obj.subscription) {
            result = await syncSubscription(deps, typeof obj.subscription === "string" ? obj.subscription : obj.subscription.id);
          }
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        case "customer.subscription.paused":
        case "customer.subscription.resumed":
          result = await syncSubscription(deps, obj.id);
          break;
        case "invoice.paid":
        case "invoice.payment_failed": {
          const subId =
            (obj && obj.subscription) ||
            (obj && obj.parent && obj.parent.subscription_details && obj.parent.subscription_details.subscription) ||
            null;
          if (subId) result = await syncSubscription(deps, typeof subId === "string" ? subId : subId.id);
          break;
        }
        default:
          break;
      }
      await deps.admin.from("stripe_events").insert({ id: event.id, type: event.type });
      return new Response(JSON.stringify({ received: true, result }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e) {
      // 500 : Stripe renverra l'évènement plus tard (jusqu'à 3 jours).
      console.error("stripe-webhook", event && event.type, e);
      return new Response("server_error", { status: 500 });
    }
  };
}

function defaultDeps(): Deps {
  const env = (k: string) => Deno.env.get(k);
  const stripe = new Stripe(env("STRIPE_SECRET_KEY") || "", { httpClient: Stripe.createFetchHttpClient() });
  const crypto = Stripe.createSubtleCryptoProvider();
  const admin = createClient(env("SUPABASE_URL") || "", env("SUPABASE_SERVICE_ROLE_KEY") || "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const verify = (payload: string, signature: string) =>
    stripe.webhooks.constructEventAsync(payload, signature, env("STRIPE_WEBHOOK_SECRET") || "", undefined, crypto);
  return { env, stripe, admin, verify };
}

if (!Deno.env.get("FICHES_NO_SERVE")) Deno.serve(createHandler(defaultDeps()));
