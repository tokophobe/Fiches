/* ============================================================
   Fiches — règles « profil élève / profil enseignant » (v256, Q6 de la
   spécification). Logique pure, sans écran ni stockage : testée dans
   tests/profile-rules.test.js.

   Un évènement d'agenda appartient à un profil :
   - échéance donnée par l'enseignant à sa classe (classShare) → enseignant ;
   - échéance reçue d'une classe suivie (sharedEventId) → élève ;
   - évènement personnel → le profil où il a été créé (champ `profile`),
     « élève » pour ceux créés avant la v256.
   Les révisions (mode sprint, Révisions prioritaires, Renforcer) ne
   tiennent compte que des évènements du profil élève.
   ============================================================ */
(function (root) {
  "use strict";

  function eventProfile(ev) {
    if (!ev) return "student";
    if (ev.classShare && ev.classShare.classId) return "teacher";
    if (ev.sharedEventId) return "student";
    return ev.profile === "teacher" ? "teacher" : "student";
  }

  /** L'évènement s'affiche-t-il dans l'agenda du profil `role`
   *  ("student" | "teacher") ? */
  function eventVisibleInProfile(ev, role) {
    return eventProfile(ev) === (role === "teacher" ? "teacher" : "student");
  }

  /** L'évènement compte-t-il pour les révisions (sprint, priorités) ? */
  function eventCountsForRevisions(ev) {
    return eventProfile(ev) === "student";
  }

  const api = { eventProfile, eventVisibleInProfile, eventCountsForRevisions };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ProfileRules = api;
})(typeof window !== "undefined" ? window : globalThis);
