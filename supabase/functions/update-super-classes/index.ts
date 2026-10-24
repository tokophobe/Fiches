// =====================================================================
// Fiches — fonction serveur « update-super-classes » (round 68)
// ---------------------------------------------------------------------
// Super enseignant : l'enseignant change la liste des classes couvertes.
// La quantité de l'abonnement Stripe (1 € / mois / classe) est ajustée
// tout de suite, au prorata (Stripe facture ou crédite la différence sur
// la prochaine facture), et la liste est enregistrée dans
// subscriptions.super_class_ids.
// Secrets : STRIPE_SECRET_KEY (voir create-checkout).
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

export type Deps = { env: (k: string) => string | undefined; stripe: any; admin: any };

export function createHandler(deps: Deps) {
  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    try {
      const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!jwt) return json({ error: "not_authenticated" }, 401);
      const { data: userData, error: userError } = await deps.admin.auth.getUser(jwt);
      const user = userData && userData.user;
      if (userError || !user) return json({ error: "not_authenticated" }, 401);

      let body: any = {};
      try {
        body = await req.json();
      } catch (_e) {
        body = {};
      }
      const wanted = Array.isArray(body.classIds) ? [...new Set(body.classIds.filter((x: unknown) => typeof x === "string"))] : [];
      const { data: mine } = await deps.admin.from("classes").select("id").eq("teacher_id", user.id);
      const owned = new Set((mine || []).map((c: any) => c.id));
      const classIds = (wanted as string[]).filter((id) => owned.has(id));
      if (!classIds.length) return json({ error: "no_class" }, 400);

      const { data: row } = await deps.admin
        .from("subscriptions")
        .select("plan, status, source, current_period_end, stripe_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();
      const live =
        row &&
        row.source === "stripe" &&
        row.plan === "super_enseignant" &&
        ["active", "trial", "past_due"].includes(row.status) &&
        (!row.current_period_end || new Date(row.current_period_end) > new Date());
      if (!live || !row.stripe_subscription_id) return json({ error: "no_super_subscription" }, 404);

      const sub = await deps.stripe.subscriptions.retrieve(row.stripe_subscription_id);
      const item = sub && sub.items && Array.isArray(sub.items.data) ? sub.items.data[0] : null;
      if (!item) return json({ error: "no_super_subscription" }, 404);
      if (item.quantity !== classIds.length) {
        await deps.stripe.subscriptions.update(row.stripe_subscription_id, {
          items: [{ id: item.id, quantity: classIds.length }],
          proration_behavior: "create_prorations",
        });
      }
      const { error } = await deps.admin
        .from("subscriptions")
        .update({ super_class_ids: classIds, quantity: classIds.length, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (error) throw new Error(error.message || String(error));
      return json({ ok: true, quantity: classIds.length });
    } catch (e) {
      console.error("update-super-classes", e);
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
