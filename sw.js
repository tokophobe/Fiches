const CACHE_NAME = "fiches-cache-v83";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/sm2.js",
  "./js/db.js",
  "./js/sync.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// Stratégie : cache d'abord pour les fichiers du cœur de l'appli,
// réseau avec repli sur le cache pour le reste (ex. polices Google Fonts).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isCoreAsset = url.origin === self.location.origin;
  // Vrai uniquement pour une navigation de page (l'utilisateur charge/recharge
  // l'appli elle-même) — jamais pour un script, une feuille de style ou une
  // police. Sert à limiter le repli "hors-ligne -> sers index.html" au SEUL
  // cas où ça a du sens.
  const isNavigation = request.mode === "navigate" || request.destination === "document";

  if (isCoreAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              return response;
            })
            .catch(() => {
              // BUG corrigé ici : auparavant, un script/style/police qui ne
              // se chargeait pas (accroc réseau ponctuel, fréquent en
              // 4G/5G) se voyait renvoyer le contenu HTML de index.html à
              // la place — un <script> qui reçoit du HTML plante aussitôt
              // au parsing, avec un message générique ("Script error.",
              // sans aucun détail sous Safari) qui ne donnait aucun indice
              // sur la vraie cause. Seule une VRAIE navigation de page peut
              // légitimement se rabattre sur index.html hors-ligne ; pour
              // tout le reste, on laisse l'échec réseau remonter tel quel.
              if (isNavigation) return caches.match("./index.html");
              return Response.error();
            })
      )
    );
  } else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});
