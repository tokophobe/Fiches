/* ============================================================
   Fiches — règles de la publication avec relecture (chantier décidé le
   9 nov. 2026, étape A). Logique pure, sans écran ni stockage : testée
   dans tests/publication-rules.test.js (docs/SPECIFICATION.md, §7.2).
   Les mêmes règles sont appliquées côté base de données par
   supabase/publication_relecture_A_migration.sql.

   Pas encore chargé par l'appli : il le sera à l'étape B (appli) et C
   (Darwin Admin), avec sa balise <script> et CORE_ASSETS dans sw.js.
   ============================================================ */
(function (root) {
  "use strict";

  /** Version du texte de licence que l'enseignant accepte (brouillon :
   *  docs/brouillon-licence-publication.md). À changer à chaque nouvelle
   *  version du texte ; l'accord déjà donné pour une boîte reste valable. */
  const LICENSE_VERSION = "2026-11-09-brouillon";

  /** États d'une proposition (colonne status de library_submissions). */
  const STATUS = Object.freeze({
    PENDING: "pending",                   // envoyée, en relecture
    CHANGES_REQUESTED: "changes_requested", // darwin demande une modification
    PUBLISHED: "published",               // publiée (ou mise à jour) dans la Librairie
    REJECTED: "rejected",                 // refusée par darwin
    SUPERSEDED: "superseded",             // remplacée par une version plus récente de la boîte
    WITHDRAWN: "withdrawn",               // retirée de la Librairie par darwin
  });

  /** Qui peut faire passer une proposition d'un état à un autre.
   *  « teacher » = l'enseignant auteur ; « darwin » = un administrateur ;
   *  « system » = automatique (nouvelle version envoyée). */
  const TRANSITIONS = {
    pending: { published: ["darwin"], changes_requested: ["darwin"], rejected: ["darwin"], superseded: ["system"] },
    changes_requested: { superseded: ["system"], rejected: ["darwin"], published: ["darwin"] },
    published: { withdrawn: ["darwin"] },
    rejected: {},
    superseded: {},
    withdrawn: {},
  };

  function canTransition(from, to, actor) {
    const next = TRANSITIONS[from];
    return !!(next && next[to] && next[to].includes(actor));
  }

  /** États « ouverts » : darwin n'a pas encore tranché. Une nouvelle
   *  version de la même boîte les remplace (état « superseded »). */
  function isOpen(status) {
    return status === STATUS.PENDING || status === STATUS.CHANGES_REQUESTED;
  }

  /** Seul un enseignant propose une boîte (jamais un élève). */
  function canPropose(role) {
    return role === "teacher";
  }

  /** L'accord de licence se donne UNE fois par boîte : il en faut un si
   *  aucun accord n'existe encore pour cette boîte (quelle que soit la
   *  version du texte acceptée à l'époque). `acceptances` : liste de
   *  { sourceSubjectId, licenseVersion, acceptedAt }. */
  function needsLicenseAcceptance(acceptances, sourceSubjectId) {
    if (!sourceSubjectId) return true;
    return !(acceptances || []).some((a) => a && a.sourceSubjectId === sourceSubjectId);
  }

  /** Discrétion envers l'enseignant : il n'est prévenu (pastille
   *  « Messages de darwin ») que si darwin a besoin de lui ou a changé son
   *  contenu. Publication sans retouche, relecture en cours : rien. */
  function teacherNotified(event) {
    if (!event) return false;
    switch (event.type) {
      case "changes_requested":
      case "rejected":
      case "withdrawn":
      case "darwin_message":
        return true;
      case "published":
        return !!event.cardsChanged; // publiée avec des corrections de darwin
      default:
        return false; // envoyée, mise à jour acceptée sans retouche, etc.
    }
  }

  /** Après une modification de sa boîte par l'enseignant : faut-il
   *  envoyer automatiquement (et sans rien lui dire) une nouvelle version
   *  à darwin ? Oui si la boîte est déjà passée par le circuit (proposée,
   *  publiée ou à modifier) et que son contenu a changé depuis le dernier
   *  envoi. Pas après un refus définitif ni un retrait. */
  function shouldResubmit(lastStatus, lastSentSignature, currentSignature) {
    if (!lastStatus) return false;
    if (lastStatus === STATUS.REJECTED || lastStatus === STATUS.WITHDRAWN) return false;
    return lastSentSignature !== currentSignature;
  }

  /** Contenu publié d'une fiche (mêmes champs que shareableCard dans
   *  js/sync.js) : question, réponse, 3 mauvaises réponses du QCM, « pour
   *  aller plus loin » et lien. */
  function cardContentKey(c) {
    return JSON.stringify([c.question || "", c.answer || "", Array.isArray(c.wrongs) ? c.wrongs : null, c.more || "", c.link || ""]);
  }

  /** Empreinte d'un ensemble de fiches (pour savoir si le contenu a
   *  changé) : ne tient compte que de ce qui est publié. */
  function cardsSignature(cards) {
    return JSON.stringify((cards || []).map((c) => [c.id || "", cardContentKey(c)]));
  }

  /** Avant / après d'une boîte, fiche par fiche (repérées par leur id),
   *  pour « Messages de darwin » : fiches modifiées, ajoutées, retirées. */
  function cardsDiff(before, after) {
    const key = cardContentKey;
    const beforeById = new Map((before || []).map((c) => [c.id, c]));
    const afterById = new Map((after || []).map((c) => [c.id, c]));
    const changed = [];
    const added = [];
    const removed = [];
    for (const [id, a] of afterById) {
      const b = beforeById.get(id);
      if (!b) added.push(a);
      else if (key(a) !== key(b)) changed.push({ before: b, after: a });
    }
    for (const [id, b] of beforeById) if (!afterById.has(id)) removed.push(b);
    return { changed, added, removed, any: changed.length + added.length + removed.length > 0 };
  }

  /** Librairie à l'ouverture (Q16) : avec le réglage « seulement les
   *  boîtes darwin », une boîte venue d'un enseignant n'est pas montrée. */
  function visibleInLibrary(collection, darwinOnly) {
    if (!collection) return false;
    return !darwinOnly || collection.origin === "darwin";
  }

  const api = {
    LICENSE_VERSION, STATUS, TRANSITIONS,
    canTransition, isOpen, canPropose, needsLicenseAcceptance, teacherNotified,
    shouldResubmit, cardsSignature, cardsDiff, visibleInLibrary,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PublicationRules = api;
})(typeof window !== "undefined" ? window : globalThis);
