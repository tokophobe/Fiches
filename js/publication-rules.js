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

  /** Version du texte de licence que l'enseignant accepte. Le texte
   *  intégral de chaque version est gardé dans la base (table
   *  library_license_texts, supabase/v280_migration.sql) : c'est lui que
   *  l'appli affiche. Une nouvelle version = une nouvelle ligne, et cette
   *  constante change. */
  const LICENSE_VERSION = "2026-11-11-v2"; // v285 : texte reformulé (même règle)

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

  /** L'accord se donne UNE fois par boîte, avec ses deux cases (v280,
   *  Q18 a) : la licence de partage ET l'autorisation pour l'abonnement.
   *  Il en faut un nouveau si aucun accord complet n'existe pour cette
   *  boîte (un ancien accord sans l'autorisation « abonnement » ne suffit
   *  plus). `acceptances` : liste de { sourceSubjectId, commercialConsent }. */
  function needsLicenseAcceptance(acceptances, sourceSubjectId) {
    if (!sourceSubjectId) return true;
    return !(acceptances || []).some((a) => a && a.sourceSubjectId === sourceSubjectId && a.commercialConsent === true);
  }

  /** Mention de l'auteur (Q18 b) : anonyme par défaut ; nom ou pseudonyme
   *  sur demande, modifiable à tout moment. Renvoie le texte à afficher
   *  (vide = rien). */
  const AUTHOR_MODES = ["anonymous", "name", "pseudonym"];
  function authorMention(mode, label) {
    if (mode !== "name" && mode !== "pseudonym") return "";
    return String(label || "").trim().slice(0, 80);
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

  /** Suivi des modifications façon traitement de texte (v280) : compare
   *  deux textes mot à mot et renvoie des morceaux { type, text } —
   *  « same » (inchangé), « del » (supprimé), « ins » (ajouté). Les espaces
   *  restent collés aux mots. Au-delà d'une certaine taille, on se contente
   *  de « tout supprimé / tout ajouté » (calcul trop long sinon). */
  function wordDiff(before, after) {
    const a = String(before || "");
    const b = String(after || "");
    if (a === b) return a ? [{ type: "same", text: a }] : [];
    const tok = (t) => t.match(/\s+|[^\s]+/g) || [];
    const x = tok(a);
    const y = tok(b);
    if (x.length * y.length > 250000) {
      return [a && { type: "del", text: a }, b && { type: "ins", text: b }].filter(Boolean);
    }
    // Plus longue sous-suite commune (programmation dynamique).
    const m = x.length;
    const n = y.length;
    const L = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      }
    }
    const out = [];
    const push = (type, text) => {
      const last = out[out.length - 1];
      if (last && last.type === type) last.text += text;
      else out.push({ type, text });
    };
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (x[i] === y[j]) {
        push("same", x[i]);
        i++;
        j++;
      } else if (L[i + 1][j] >= L[i][j + 1]) {
        push("del", x[i++]);
      } else {
        push("ins", y[j++]);
      }
    }
    while (i < m) push("del", x[i++]);
    while (j < n) push("ins", y[j++]);
    return groupChanges(out);
  }
  /** Regroupe un passage modifié (morceaux supprimés / ajoutés séparés
   *  seulement par des espaces) en UN bloc supprimé suivi d'UN bloc ajouté :
   *  « ~~Sydney, la plus grande ville.~~ Canberra, et non Sydney. » plutôt
   *  qu'une alternance mot à mot illisible. */
  function groupChanges(parts) {
    const out = [];
    let del = "";
    let ins = "";
    let pendingSpace = "";
    const flush = () => {
      if (del) out.push({ type: "del", text: del });
      if (ins) out.push({ type: "ins", text: ins });
      del = "";
      ins = "";
    };
    const pushSame = (text) => {
      const last = out[out.length - 1];
      if (last && last.type === "same") last.text += text;
      else out.push({ type: "same", text });
    };
    parts.forEach((p) => {
      if (p.type === "same") {
        if ((del || ins) && /^\s+$/.test(p.text)) {
          pendingSpace += p.text; // espace au milieu d'un passage modifié
          return;
        }
        flush();
        if (pendingSpace) pushSame(pendingSpace);
        pendingSpace = "";
        pushSame(p.text);
        return;
      }
      if (pendingSpace) {
        if (del) del += pendingSpace;
        if (ins) ins += pendingSpace;
        pendingSpace = "";
      }
      if (p.type === "del") del += p.text;
      else ins += p.text;
    });
    flush();
    if (pendingSpace) pushSame(pendingSpace);
    return out;
  }

  /** Librairie à l'ouverture (Q16) : avec le réglage « seulement les
   *  boîtes darwin », une boîte venue d'un enseignant n'est pas montrée. */
  function visibleInLibrary(collection, darwinOnly) {
    if (!collection) return false;
    return !darwinOnly || collection.origin === "darwin";
  }

  const api = {
    LICENSE_VERSION, STATUS, TRANSITIONS, AUTHOR_MODES,
    canTransition, isOpen, canPropose, needsLicenseAcceptance, authorMention, teacherNotified,
    shouldResubmit, cardsSignature, cardsDiff, wordDiff, visibleInLibrary,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PublicationRules = api;
})(typeof window !== "undefined" ? window : globalThis);
