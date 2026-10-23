// =====================================================================
// Fiches — fonction serveur « customer-portal » (round 65)
// ---------------------------------------------------------------------
// Bouton « Gérer mon abonnement » : ouvre le portail client Stripe
// (changer de carte, résilier, télécharger les factures). Rien à
// développer côté appli : le portail est hébergé par Stripe.
// Secrets : STRIPE_SECRET_KEY, APP_URL (voir create-checkout).
// Le portail doit être activé une fois dans Stripe :
// Paramètres > Facturation > Portail client.
// =====================================================================
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

export type Deps = { env: (k: string) => string | undefined; stripe: any; admin: any };

export function createHandler(deps: Deps) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    try {
      const appUrl = deps.env("APP_URL");
      if (!appUrl) return json({ error: "config_missing", detail: "APP_URL" }, 500);
      const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!jwt) return json({ error: "not_authenticated" }, 401);
      const { data: userData, error: userError } = await deps.admin.auth.getUser(jwt);
      const user = userData && userData.user;
      if (userError || !user) return json({ error: "not_authenticated" }, 401);
      const { data: row } = await deps.admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
      if (!row || !row.stripe_customer_id) return json({ error: "no_customer" }, 404);
      const u = new URL(appUrl);
      u.searchParams.set("abonnement", "portail");
      u.hash = "";
      const session = await deps.stripe.billingPortal.sessions.create({ customer: row.stripe_customer_id, return_url: u.toString(), locale: "fr" });
      return json({ url: session.url });
    } catch (e) {
      console.error("customer-portal", e);
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
