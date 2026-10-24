// Tests des fonctions serveur Stripe (round 65), sans réseau : Stripe et
// Supabase sont remplacés par des doublures en mémoire ; la vérification
// de signature utilise le vrai SDK Stripe.
// Lancer : FICHES_NO_SERVE=1 deno test -A supabase/functions/tests/
import Stripe from "npm:stripe@18.5.0";
import { createHandler as checkoutHandler } from "../create-checkout/index.ts";
import { createHandler as portalHandler } from "../customer-portal/index.ts";
import { createHandler as webhookHandler, mapStatus, periodEnd } from "../stripe-webhook/index.ts";
import { createHandler as superHandler } from "../update-super-classes/index.ts";

function assertEq(a: unknown, b: unknown, msg = "") {
  const sa = JSON.stringify(a);
  const sb = JSON.stringify(b);
  if (sa !== sb) throw new Error(`${msg} attendu ${sb}, obtenu ${sa}`);
}

// ---- Doublure Supabase (service_role) -------------------------------
function fakeAdmin(users: Record<string, any>, tables: Record<string, any[]>) {
  class Q {
    t: string;
    f: [string, unknown][] = [];
    op = "select";
    payload: any = null;
    constructor(t: string) {
      this.t = t;
    }
    select() {
      return this;
    }
    eq(k: string, v: unknown) {
      this.f.push([k, v]);
      return this;
    }
    update(p: any) {
      this.op = "update";
      this.payload = p;
      return this;
    }
    insert(p: any) {
      this.op = "insert";
      this.payload = p;
      return this;
    }
    upsert(p: any) {
      this.op = "upsert";
      this.payload = p;
      return this;
    }
    maybeSingle() {
      return this.run(true);
    }
    then(res: any, rej: any) {
      return this.run(false).then(res, rej);
    }
    async run(single: boolean) {
      const rows = (tables[this.t] = tables[this.t] || []);
      const match = rows.filter((r) => this.f.every(([k, v]) => r[k] === v));
      if (this.op === "update") {
        match.forEach((r) => Object.assign(r, this.payload));
        return { data: null, error: null };
      }
      if (this.op === "insert") {
        rows.push({ ...this.payload });
        return { data: null, error: null };
      }
      if (this.op === "upsert") {
        const ex = rows.find((r) => r.user_id === this.payload.user_id);
        if (ex) Object.assign(ex, this.payload);
        else rows.push({ ...this.payload });
        return { data: null, error: null };
      }
      return { data: single ? match[0] || null : match, error: null };
    }
  }
  return {
    auth: {
      getUser: async (jwt: string) => (users[jwt] ? { data: { user: users[jwt] }, error: null } : { data: { user: null }, error: { message: "bad jwt" } }),
    },
    from: (t: string) => new Q(t),
  };
}

// ---- Doublure Stripe ---------------------------------------------------
function fakeStripe(subs: Record<string, any> = {}) {
  const calls: any[] = [];
  return {
    calls,
    customers: {
      create: async (p: any) => {
        calls.push(["customers.create", p]);
        return { id: "cus_123" };
      },
      retrieve: async (id: string) => ({ id, metadata: {} }),
    },
    checkout: {
      sessions: {
        create: async (p: any) => {
          calls.push(["checkout.create", p]);
          return { url: "https://checkout.stripe.com/c/pay/test" };
        },
      },
    },
    billingPortal: {
      sessions: {
        create: async (p: any) => {
          calls.push(["portal.create", p]);
          return { url: "https://billing.stripe.com/p/session/test" };
        },
      },
    },
    subscriptions: { retrieve: async (id: string) => subs[id] },
  };
}

const ENV: Record<string, string> = {
  APP_URL: "https://app.darwin.test/index.html",
  STRIPE_PRICE_INDIVIDUEL: "price_mensuel",
};
const env = (k: string) => ENV[k];
const post = (body: unknown, jwt?: string) =>
  new Request("http://x/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
    body: JSON.stringify(body),
  });
const USER = { id: "u1", email: "eleve@test.fr" };

Deno.test("checkout : refuse sans compte", async () => {
  const h = checkoutHandler({ env, stripe: fakeStripe(), admin: fakeAdmin({}, {}) });
  const r = await h(post({ plan: "individuel" }));
  assertEq(r.status, 401);
});

Deno.test("checkout : crée le client, essai de 30 jours la première fois", async () => {
  const tables: any = { subscriptions: [] };
  const stripe = fakeStripe();
  const h = checkoutHandler({ env, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  const r = await h(post({ plan: "individuel" }, "jwt1"));
  const body = await r.json();
  assertEq(r.status, 200, "statut");
  assertEq(body.url, "https://checkout.stripe.com/c/pay/test");
  assertEq(body.trial, true, "essai");
  const params = stripe.calls.find((c) => c[0] === "checkout.create")[1];
  assertEq(params.subscription_data.trial_period_days, 30, "jours d'essai");
  assertEq(params.line_items, [{ price: "price_mensuel", quantity: 1 }]);
  assertEq(params.success_url, "https://app.darwin.test/index.html?abonnement=ok");
  assertEq(params.payment_method_collection, "always");
  assertEq(tables.subscriptions[0].stripe_customer_id, "cus_123");
  assertEq(tables.subscriptions[0].status, "incomplete");
});

Deno.test("checkout : pas de second essai, client réutilisé", async () => {
  const tables: any = { subscriptions: [{ user_id: "u1", status: "canceled", source: "stripe", stripe_customer_id: "cus_old", trial_used: true }] };
  const stripe = fakeStripe();
  const h = checkoutHandler({ env, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  const body = await (await h(post({ plan: "individuel" }, "jwt1"))).json();
  assertEq(body.trial, false);
  const params = stripe.calls.find((c) => c[0] === "checkout.create")[1];
  assertEq(params.customer, "cus_old");
  assertEq(params.subscription_data.trial_period_days, undefined);
  assertEq(stripe.calls.some((c) => c[0] === "customers.create"), false, "pas de nouveau client");
});

Deno.test("checkout : déjà abonné → 409 ; formule inconnue → 400", async () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const tables: any = { subscriptions: [{ user_id: "u1", status: "active", source: "stripe", current_period_end: future, stripe_customer_id: "cus_1" }] };
  const h = checkoutHandler({ env, stripe: fakeStripe(), admin: fakeAdmin({ jwt1: USER }, tables) });
  assertEq((await h(post({ plan: "individuel" }, "jwt1"))).status, 409);
  assertEq((await h(post({ plan: "inconnue" }, "jwt1"))).status, 400);
  assertEq((await h(post({ plan: "individuel_annuel" }, "jwt1"))).status, 400, "annuel non configuré");
});

Deno.test("portail : renvoie l'adresse du portail Stripe", async () => {
  const tables: any = { subscriptions: [{ user_id: "u1", stripe_customer_id: "cus_1" }] };
  const stripe = fakeStripe();
  const h = portalHandler({ env, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  const body = await (await h(post({}, "jwt1"))).json();
  assertEq(body.url, "https://billing.stripe.com/p/session/test");
  const h2 = portalHandler({ env, stripe, admin: fakeAdmin({ jwt2: { id: "u2" } }, tables) });
  assertEq((await h2(post({}, "jwt2"))).status, 404, "sans client Stripe");
});

Deno.test("webhook : correspondance des statuts et fin de période", () => {
  assertEq(["trialing", "active", "past_due", "unpaid", "incomplete", "canceled", "incomplete_expired"].map(mapStatus), [
    "trial",
    "active",
    "past_due",
    "past_due",
    "incomplete",
    "canceled",
    "canceled",
  ]);
  assertEq(periodEnd({ items: { data: [{ current_period_end: 1767225600 }] } }), "2026-01-01T00:00:00.000Z");
  assertEq(periodEnd({ current_period_end: 1767225600 }), "2026-01-01T00:00:00.000Z");
});

// Vraie vérification de signature (SDK Stripe), avec un secret de test.
const SECRET = "whsec_test_secret";
const realStripe = new Stripe("sk_test_dummy", { httpClient: Stripe.createFetchHttpClient() });
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const verify = (payload: string, sig: string) => realStripe.webhooks.constructEventAsync(payload, sig, SECRET, undefined, cryptoProvider);
async function signed(event: unknown) {
  const payload = JSON.stringify(event);
  const header = await realStripe.webhooks.generateTestHeaderStringAsync({ payload, secret: SECRET, cryptoProvider });
  return new Request("http://x/", { method: "POST", headers: { "Stripe-Signature": header }, body: payload });
}

function sub(id: string, status: string, extra: any = {}) {
  return {
    id,
    status,
    customer: "cus_1",
    metadata: { user_id: "u1" },
    cancel_at_period_end: false,
    items: { data: [{ price: { id: "price_mensuel" }, quantity: 1, current_period_end: 1767225600 }] },
    ...extra,
  };
}

Deno.test("webhook : signature invalide → 400", async () => {
  const h = webhookHandler({ env, stripe: fakeStripe(), admin: fakeAdmin({}, {}), verify });
  const r = await h(new Request("http://x/", { method: "POST", headers: { "Stripe-Signature": "t=1,v1=faux" }, body: "{}" }));
  assertEq(r.status, 400);
});

Deno.test("webhook : essai puis actif, évènement en double ignoré, résiliation", async () => {
  const subs: any = { sub_1: sub("sub_1", "trialing", { trial_start: 1, trial_end: 1767225600 }) };
  const tables: any = { subscriptions: [{ user_id: "u1", status: "incomplete", source: "stripe", stripe_customer_id: "cus_1" }], stripe_events: [] };
  const h = webhookHandler({ env, stripe: fakeStripe(subs), admin: fakeAdmin({}, tables), verify });

  const ev1 = { id: "evt_1", type: "checkout.session.completed", data: { object: { mode: "subscription", subscription: "sub_1" } } };
  assertEq((await h(await signed(ev1))).status, 200);
  assertEq(tables.subscriptions[0].status, "trial", "essai");
  assertEq(tables.subscriptions[0].plan, "individuel");
  assertEq(tables.subscriptions[0].trial_used, true);
  assertEq(tables.subscriptions[0].current_period_end, "2026-01-01T00:00:00.000Z");

  subs.sub_1 = sub("sub_1", "active");
  const ev2 = { id: "evt_2", type: "invoice.paid", data: { object: { subscription: "sub_1" } } };
  await h(await signed(ev2));
  assertEq(tables.subscriptions[0].status, "active", "actif");
  assertEq(tables.subscriptions[0].trial_used, true, "essai toujours compté");

  subs.sub_1 = sub("sub_1", "canceled");
  const dup = await (await h(await signed(ev2))).json();
  assertEq(dup.duplicate, true, "doublon");
  assertEq(tables.subscriptions[0].status, "active", "doublon sans effet");

  subs.sub_1 = sub("sub_1", "active", { cancel_at_period_end: true });
  await h(await signed({ id: "evt_3", type: "customer.subscription.updated", data: { object: { id: "sub_1" } } }));
  assertEq(tables.subscriptions[0].cancel_at_period_end, true, "résiliation programmée");

  subs.sub_1 = sub("sub_1", "canceled");
  await h(await signed({ id: "evt_4", type: "customer.subscription.deleted", data: { object: { id: "sub_1" } } }));
  assertEq(tables.subscriptions[0].status, "canceled", "résilié");
});

Deno.test("webhook : un ancien abonnement qui se termine n'écrase pas le nouveau", async () => {
  const subs: any = { sub_old: sub("sub_old", "canceled") };
  const tables: any = { subscriptions: [{ user_id: "u1", status: "active", source: "stripe", stripe_customer_id: "cus_1", stripe_subscription_id: "sub_new" }], stripe_events: [] };
  const h = webhookHandler({ env, stripe: fakeStripe(subs), admin: fakeAdmin({}, tables), verify });
  const res = await (await h(await signed({ id: "evt_9", type: "customer.subscription.deleted", data: { object: { id: "sub_old" } } }))).json();
  assertEq(res.result, "ignored_old_subscription");
  assertEq(tables.subscriptions[0].status, "active");
});

Deno.test("checkout : formule annuelle (20 € / an) avec son propre prix", async () => {
  const tables: any = { subscriptions: [] };
  const stripe = fakeStripe();
  const envA = (k: string) => ({ ...ENV, STRIPE_PRICE_INDIVIDUEL_ANNUEL: "price_annuel" } as Record<string, string>)[k];
  const h = checkoutHandler({ env: envA, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  const r = await h(post({ plan: "individuel_annuel" }, "jwt1"));
  assertEq(r.status, 200);
  const params = stripe.calls.find((c) => c[0] === "checkout.create")[1];
  assertEq(params.line_items, [{ price: "price_annuel", quantity: 1 }]);
  assertEq(params.subscription_data.metadata.plan, "individuel_annuel");
});

Deno.test("checkout : Managed Payments désactivé par défaut, réessai si Stripe refuse le paramètre", async () => {
  const stripe: any = fakeStripe();
  let first = true;
  const orig = stripe.checkout.sessions.create;
  stripe.checkout.sessions.create = async (p: any) => {
    if (first && p.managed_payments) {
      first = false;
      assertEq(p.managed_payments, { enabled: false });
      throw new Error("Received unknown parameter: managed_payments");
    }
    return orig(p);
  };
  const h = checkoutHandler({ env, stripe, admin: fakeAdmin({ jwt1: USER }, { subscriptions: [] }) });
  const r = await h(post({ plan: "individuel" }, "jwt1"));
  assertEq(r.status, 200);
  const last = stripe.calls.filter((c: any) => c[0] === "checkout.create").pop()[1];
  assertEq(last.managed_payments, undefined, "réessai sans le paramètre");
});

Deno.test("checkout : client enregistré mais disparu chez Stripe → nouveau client", async () => {
  const tables: any = { subscriptions: [{ user_id: "u1", status: "canceled", source: "stripe", stripe_customer_id: "cus_disparu", trial_used: true }] };
  const stripe: any = fakeStripe();
  stripe.customers.retrieve = async (id: string) => {
    const e: any = new Error(`No such customer: '${id}'`);
    e.code = "resource_missing";
    throw e;
  };
  const h = checkoutHandler({ env, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  const r = await h(post({ plan: "individuel" }, "jwt1"));
  assertEq(r.status, 200);
  assertEq(tables.subscriptions[0].stripe_customer_id, "cus_123", "client remplacé");
  const params = stripe.calls.filter((c: any) => c[0] === "checkout.create").pop()[1];
  assertEq(params.customer, "cus_123");
});

Deno.test("checkout : durée d'essai lue dans les réglages de Darwin Admin", async () => {
  const tables: any = { subscriptions: [], dev_settings_public: [{ id: "global", settings: { subscriptionPolicy: { trialDays: 14 } } }] };
  const stripe: any = fakeStripe();
  const h = checkoutHandler({ env, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  await h(post({ plan: "individuel" }, "jwt1"));
  const params = stripe.calls.filter((c: any) => c[0] === "checkout.create").pop()[1];
  assertEq(params.subscription_data.trial_period_days, 14);
  tables.dev_settings_public[0].settings.subscriptionPolicy.trialDays = 0;
  tables.subscriptions = [];
  const r = await (await h(post({ plan: "individuel" }, "jwt1"))).json();
  assertEq(r.trial, false, "0 jour = pas d'essai");
});

Deno.test("checkout : Super enseignant — quantité = classes de l'enseignant, pas d'essai", async () => {
  const tables: any = {
    subscriptions: [],
    classes: [{ id: "c1", teacher_id: "u1" }, { id: "c2", teacher_id: "u1" }, { id: "cX", teacher_id: "autre" }],
  };
  const stripe: any = fakeStripe();
  const envS = (k: string) => ({ ...ENV, STRIPE_PRICE_SUPER_ENSEIGNANT: "price_super" } as Record<string, string>)[k];
  const h = checkoutHandler({ env: envS, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  assertEq((await h(post({ plan: "super_enseignant", classIds: ["cX"] }, "jwt1"))).status, 400, "classe d'un autre");
  const r = await h(post({ plan: "super_enseignant", classIds: ["c1", "c2", "cX", "c1"] }, "jwt1"));
  const body = await r.json();
  assertEq(r.status, 200);
  assertEq(body.trial, false);
  const params = stripe.calls.filter((c: any) => c[0] === "checkout.create").pop()[1];
  assertEq(params.line_items, [{ price: "price_super", quantity: 2 }]);
  assertEq(tables.subscriptions[0].super_class_ids, ["c1", "c2"]);
});

Deno.test("update-super-classes : ajuste la quantité Stripe et la liste", async () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const tables: any = {
    subscriptions: [{ user_id: "u1", plan: "super_enseignant", status: "active", source: "stripe", current_period_end: future, stripe_subscription_id: "sub_s", super_class_ids: ["c1"], quantity: 1 }],
    classes: [{ id: "c1", teacher_id: "u1" }, { id: "c2", teacher_id: "u1" }, { id: "c3", teacher_id: "u1" }],
  };
  const stripe: any = fakeStripe({ sub_s: { id: "sub_s", items: { data: [{ id: "si_1", quantity: 1 }] } } });
  stripe.subscriptions.update = async (id: string, p: any) => {
    stripe.calls.push(["subscriptions.update", id, p]);
    return {};
  };
  const h = superHandler({ env, stripe, admin: fakeAdmin({ jwt1: USER }, tables) });
  const r = await (await h(post({ classIds: ["c1", "c3"] }, "jwt1"))).json();
  assertEq(r, { ok: true, quantity: 2 });
  const upd = stripe.calls.find((c: any) => c[0] === "subscriptions.update");
  assertEq(upd[2].items, [{ id: "si_1", quantity: 2 }]);
  assertEq(tables.subscriptions[0].super_class_ids, ["c1", "c3"]);
  const h2 = superHandler({ env, stripe, admin: fakeAdmin({ jwt2: { id: "u2" } }, tables) });
  assertEq((await h2(post({ classIds: ["c1"] }, "jwt2"))).status, 400, "pas ses classes");
});
