/* ============================================================
   Fiches — cloisonnement des données locales par compte (round 29).

   Chargé AVANT tous les autres scripts. Détermine, de façon synchrone et
   même hors-ligne, quel compte est connecté sur cet appareil (la session
   Supabase est enregistrée par supabase-js dans le stockage local, sous une
   clé « sb-<projet>-auth-token »), puis :
   - choisit la base IndexedDB propre à ce compte (voir db.js) ;
   - redirige vers une version « par compte » les clés localStorage qui
     contiennent des données personnelles (boîte en cours, sélections,
     réglages de révision, file d'attente de synchro…).

   Changer de compte (connexion, déconnexion) recharge l'appli (voir
   initAccountState, app.js) : elle redémarre alors sur l'espace du
   nouveau compte. Sans compte connecté, l'espace « invité » est vide (et
   de toute façon verrouillé par l'écran de connexion obligatoire).
   ============================================================ */
(function () {
  "use strict";

  // Clés localStorage personnelles (propres à chaque compte). Les autres
  // (mode nuit, zoom, déverrouillage développeur, serveur, taxonomie…)
  // restent propres à l'appareil.
  const USER_KEYS = [
    "fiches_current_subject",
    "fiches_multi_subject_ids",
    "fiches_multi_subject_label",
    "fiches_new_card_subject_id",
    "fiches_cards_multi_ids",
    "fiches_cards_multi_label",
    "fiches_stats_multi_ids",
    "fiches_stats_multi_label",
    "fiches_messages_last_read",
    "fiches_bonus_days",
    "fiches_bonus_again_mode",
    "fiches_hibernate_days",
    "fiches_org_display_mode",
    "fiches_show_rating_days",
    "fiches_show_review_chart",
    "fiches_card_font_size",
    "fiches_due_pill_color",
    "fiches_sb_pending",
    "fiches_calendar_pending",
  ];

  function readStoredUserId() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !/^sb-.+-auth-token$/.test(k)) continue;
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const v = JSON.parse(raw);
        const user = (v && v.user) || (v && v.currentSession && v.currentSession.user) || null;
        if (user && user.id) return String(user.id);
      }
    } catch (e) {
      /* stockage illisible : pas de compte */
    }
    return null;
  }

  const uid = readStoredUserId();
  const keySet = new Set(USER_KEYS);
  const suffix = uid ? `__u_${uid}` : "__guest";
  const mapKey = (k) => (keySet.has(String(k)) ? `${k}${suffix}` : k);

  // Redirection transparente des clés personnelles : le reste du code
  // continue d'écrire localStorage.getItem("fiches_current_subject"), et
  // lit/écrit en réalité « fiches_current_subject__u_<id du compte> ».
  const proto = Storage.prototype;
  const origGet = proto.getItem;
  const origSet = proto.setItem;
  const origRemove = proto.removeItem;
  proto.getItem = function (k) {
    return origGet.call(this, this === window.localStorage ? mapKey(k) : k);
  };
  proto.setItem = function (k, v) {
    return origSet.call(this, this === window.localStorage ? mapKey(k) : k, v);
  };
  proto.removeItem = function (k) {
    return origRemove.call(this, this === window.localStorage ? mapKey(k) : k);
  };

  window.UserScope = {
    uid,
    /** Nom de la base IndexedDB de ce compte. */
    dbName: uid ? `fiches-db__u_${uid}` : "fiches-db__guest",
    /** Ancienne base commune à l'appareil (avant les comptes). */
    legacyDbName: "fiches-db",
    userKeys: USER_KEYS.slice(),
    /** Lecture/écriture d'une clé SANS redirection (ancienne valeur commune). */
    rawGet: (k) => origGet.call(window.localStorage, k),
    rawSet: (k, v) => origSet.call(window.localStorage, k, v),
    rawRemove: (k) => origRemove.call(window.localStorage, k),
    scopedKey: mapKey,
  };
})();
