// =====================================================================
// Fiches — fonction serveur « create-checkout » (round 65)
// ---------------------------------------------------------------------
// Appelée par l'appli (bouton « S'abonner » de la page Abonnements) avec
// le jeton du compte connecté. Crée (ou retrouve) le client Stripe du
// compte, puis une page de paiement Stripe Checkout, et renvoie son
// adresse : l'appli y redirige. AUCUNE donnée de carte ne passe par
// l'appli ni par Supabase.
//
// Secrets (Supabase > Edge Functions > Secrets) :
//   STRIPE_SECRET_KEY          sk_test_… (puis sk_live_…)
//   STRIPE_PRICE_INDIVIDUEL    price_… (2 € / mois)
//   STRIPE_PRICE_INDIVIDUEL_ANNUEL  price_… (facultatif)
//   APP_URL                    adresse de l'appli, ex. https://app.darwin.fr/
//   STRIPE_TRIAL_DAYS          facultatif, remplacé par le réglage « Durée
//                              de l'essai gratuit » de Darwin Admin (v228)
//   STRIPE_AUTOMATIC_TAX       "1" pour activer Stripe Tax (facultatif)
//   STRIPE_MANAGED_PAYMENTS    "1" pour laisser Stripe être le vendeur
//                              officiel (Managed Payments) ; sinon désactivé
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement.
// =====================================================================
import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

export type Deps = {
  env: (k: string) => string | undefined;
  stripe: any;
  admin: any; // client Supabase avec la clé service_role
};

const PLANS: Record<string, { envKey: string; label: string }> = {
  individuel: { envKey: "STRIPE_PRICE_INDIVIDUEL", label: "individuel" },
  individuel_annuel: { envKey: "STRIPE_PRICE_INDIVIDUEL_ANNUEL", label: "individuel_annuel" },
  // Round 68 : 1 € / mois / classe couverte (quantité = nombre de classes).
  super_enseignant: { envKey: "STRIPE_PRICE_SUPER_ENSEIGNANT", label: "super_enseignant" },
};

/** Classes de l'enseignant parmi celles demandées (ids valides, sans
 *  doublon). */
export async function teacherClassIds(deps: Deps, userId: string, wanted: unknown): Promise<string[]> {
  const ids = Array.isArray(wanted) ? [...new Set(wanted.filter((x) => typeof x === "string"))] : [];
  if (!ids.length) return [];
  const { data } = await deps.admin.from("classes").select("id").eq("teacher_id", userId);
  const mine = new Set((data || []).map((c: any) => c.id));
  return ids.filter((id) => mine.has(id));
}

/** Adresse de retour : APP_URL, avec un paramètre que l'appli reconnaît. */
export function returnUrl(appUrl: string, outcome: "ok" | "annule"): string {
  const u = new URL(appUrl);
  u.searchParams.set("abonnement", outcome);
  u.hash = "";
  return u.toString();
}

/** Round 68 : durée de l'essai réglée dans Darwin Admin (réglages communs,
 *  subscriptionPolicy.trialDays) ; à défaut le secret STRIPE_TRIAL_DAYS ;
 *  à défaut 30 jours. */
export async function trialDaysSetting(deps: Deps): Promise<number> {
  try {
    const { data } = await deps.admin.from("dev_settings_public").select("settings").eq("id", "global").maybeSingle();
    const raw = data && data.settings && data.settings.subscriptionPolicy ? data.settings.subscriptionPolicy.trialDays : undefined;
    const v = raw === undefined || raw === null || raw === "" ? NaN : Number(raw);
    if (Number.isFinite(v) && v >= 0 && v <= 365) return Math.round(v);
  } catch (_e) {
    /* réglages illisibles : valeur par défaut */
  }
  const env = Number(deps.env("STRIPE_TRIAL_DAYS"));
  return Number.isFinite(env) && deps.env("STRIPE_TRIAL_DAYS") !== undefined && deps.env("STRIPE_TRIAL_DAYS") !== "" ? env : 30;
}

export function createHandler(deps: Deps) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    try {
      const appUrl = deps.env("APP_URL");
      if (!appUrl) return json({ error: "config_missing", detail: "APP_URL" }, 500);

      // 1) Compte connecté (jeton envoyé par l'appli).
      const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!jwt) return json({ error: "not_authenticated" }, 401);
      const { data: userData, error: userError } = await deps.admin.auth.getUser(jwt);
      const user = userData && userData.user;
      if (userError || !user) return json({ error: "not_authenticated" }, 401);

      // 2) Formule demandée.
      let body: any = {};
      try {
        body = await req.json();
      } catch (_e) {
        body = {};
      }
      const planKey = typeof body.plan === "string" ? body.plan : "individuel";
      const plan = PLANS[planKey];
      if (!plan) return json({ error: "unknown_plan" }, 400);
      const price = deps.env(plan.envKey);
      if (!price) return json({ error: "plan_unavailable" }, 400);

      // 3) Abonnement déjà en cours ?
      const { data: row } = await deps.admin
        .from("subscriptions")
        .select("status, source, current_period_end, stripe_customer_id, trial_used")
        .eq("user_id", user.id)
        .maybeSingle();
      const live =
        row &&
        row.source === "stripe" &&
        ["active", "trial", "past_due"].includes(row.status) &&
        (!row.current_period_end || new Date(row.current_period_end) > new Date());
      if (live) return json({ error: "already_subscribed" }, 409);

      // 3 bis) Super enseignant : les classes choisies (au moins une).
      const isSuper = planKey === "super_enseignant";
      let classIds: string[] = [];
      if (isSuper) {
        classIds = await teacherClassIds(deps, user.id, body.classIds);
        if (!classIds.length) return json({ error: "no_class" }, 400);
      }

      // 4) Client Stripe du compte (créé une seule fois).
      let customerId: string | null = (row && row.stripe_customer_id) || null;
      // Client enregistré mais introuvable chez Stripe (supprimé, créé dans
      // un autre environnement de test, ou par les Managed Payments) : on en
      // recrée un.
      let recreated = false;
      if (customerId) {
        try {
          const existing = await deps.stripe.customers.retrieve(customerId);
          if (!existing || existing.deleted) customerId = null;
        } catch (e) {
          if ((e as any)?.code === "resource_missing" || /No such customer/i.test(String((e as Error)?.message || ""))) customerId = null;
          else throw e;
        }
        recreated = !customerId;
      }
      if (!customerId) {
        const customer = await deps.stripe.customers.create(
          { email: user.email || undefined, metadata: { user_id: user.id } },
          // Clé d'idempotence (évite deux clients sur un double toucher) ;
          // pas réutilisée quand on remplace un client disparu.
          recreated ? undefined : { idempotencyKey: `customer-${user.id}` }
        );
        customerId = customer.id;
        if (row) {
          await deps.admin.from("subscriptions").update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() }).eq("user_id", user.id);
        } else {
          await deps.admin.from("subscriptions").insert({
            user_id: user.id,
            status: "incomplete",
            source: "stripe",
            plan: "",
            stripe_customer_id: customerId,
          });
        }
      }

      // 5) Page de paiement. Un seul mois offert par compte.
      const trialDays = await trialDaysSetting(deps);
      const withTrial = !isSuper && !(row && row.trial_used) && trialDays > 0;
      // Classes choisies, gardées en attendant la confirmation du paiement
      // (lues par class_library_access une fois l'abonnement actif).
      if (isSuper) {
        await deps.admin.from("subscriptions").update({ super_class_ids: classIds }).eq("user_id", user.id);
      }
      const params: any = {
        mode: "subscription",
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price, quantity: isSuper ? classIds.length : 1 }],
        payment_method_collection: "always",
        allow_promotion_codes: true,
        locale: "fr",
        success_url: returnUrl(appUrl, "ok"),
        cancel_url: returnUrl(appUrl, "annule"),
        subscription_data: {
          metadata: { user_id: user.id, plan: plan.label },
          ...(withTrial ? { trial_period_days: trialDays } : {}),
        },
        metadata: { user_id: user.id, plan: plan.label },
      };
      if (deps.env("STRIPE_AUTOMATIC_TAX") === "1") {
        params.automatic_tax = { enabled: true };
        params.customer_update = { address: "auto" };
        params.billing_address_collection = "required";
      }
      // Managed Payments (Stripe vendeur officiel) : désactivé pour chaque
      // paiement, quel que soit le réglage du compte Stripe, sauf si le
      // secret STRIPE_MANAGED_PAYMENTS vaut "1". Si Stripe ne connaît pas
      // ce paramètre, on réessaie sans.
      params.managed_payments = { enabled: deps.env("STRIPE_MANAGED_PAYMENTS") === "1" };
      let session;
      try {
        session = await deps.stripe.checkout.sessions.create(params);
      } catch (e) {
        if (/managed_payments/i.test(String((e as Error)?.message || "")) && /unknown|unrecognized|not supported|invalid/i.test(String((e as Error)?.message || ""))) {
          delete params.managed_payments;
          session = await deps.stripe.checkout.sessions.create(params);
        } else {
          throw e;
        }
      }
      return json({ url: session.url, trial: withTrial });
    } catch (e) {
      console.error("create-checkout", e);
      return json({ error: "server_error", detail: String((e as Error)?.message || e) }, 500);
    }
  };
}

function defaultDeps(): Deps {
  const env = (k: string) => Deno.env.get(k);
  const stripe = new Stripe(env("STRIPE_SECRET_KEY") || "", { httpClient: Stripe.createFetchHttpClient() });
  const admin = createClient(env("SUPABASE_URL") || "", env("SUPABASE_SERVICE_ROLE_KEY") || "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { env, stripe, admin };
}

if (!Deno.env.get("FICHES_NO_SERVE")) Deno.serve(createHandler(defaultDeps()));
