(() => {
  "use strict";

  /** @type {Array<any>} cache mémoire de toutes les fiches */
  let cards = [];
  /** file de fiches dues pour la session de révision en cours */
  let reviewQueue = [];
  let currentCard = null;
  let editingId = null;
  let isFlipped = false;
  /** nombre de fiches dues au moment où la session a démarré (dénominateur stable du compteur) */
  let sessionTotalDue = 0;
  /** true dès qu'on a épuisé les fiches dues et qu'on pioche des fiches au hasard */
  let isBonusMode = false;
  /** true dès que la toute première session de révision a été lancée (au chargement de l'appli) */
  let reviewSessionStarted = false;

  /** @type {Array<{id:string,name:string,createdAt:string,updatedAt:string}>} liste des matières */
  let subjects = [];
  /** id de la matière actuellement affichée — peut aussi être l'une des deux
   *  valeurs sentinelles ci-dessous (item 1 : révision toutes matières /
   *  sélection de plusieurs matières confondues). */
  let currentSubjectId = null;
  const CURRENT_SUBJECT_KEY = "fiches_current_subject";
  const ALL_SUBJECTS_ID = "__all__";
  const MULTI_SUBJECTS_ID = "__multi__";
  const MULTI_SELECTION_KEY = "fiches_multi_subject_ids";
  function isSentinelSubject(id) {
    return id === ALL_SUBJECTS_ID || id === MULTI_SUBJECTS_ID;
  }
  function loadMultiSelection() {
    try {
      const raw = localStorage.getItem(MULTI_SELECTION_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      // Ne garde que des matières qui existent toujours.
      return Array.isArray(ids) ? ids.filter((id) => subjects.some((s) => s.id === id)) : [];
    } catch (e) {
      return [];
    }
  }
  function saveMultiSelection(ids) {
    localStorage.setItem(MULTI_SELECTION_KEY, JSON.stringify(ids));
  }

  const el = (id) => document.getElementById(id);

  const duePillEl = el("due-pill");
  const dueCountEl = el("due-count");
  const reviewProgressEl = el("review-progress");
  const emptyStateEl = el("empty-state");
  const cardStackEl = el("card-stack");
  const flipCardEl = el("flip-card");
  const questionTextEl = el("question-text");
  const answerTextEl = el("answer-text");
  const ratingRowEl = el("rating-row");
  const editCurrentBtn = el("edit-current-btn");
  const hibernateCurrentBtn = el("hibernate-current-btn");

  const cardForm = el("card-form");
  const inputQuestion = el("input-question");
  const inputAnswer = el("input-answer");
  const submitBtn = el("submit-btn");
  const cancelEditBtn = el("cancel-edit");
  const cardListEl = el("card-list");
  const totalCountEl = el("total-count");

  const statTotal = el("stat-total");
  const statReviewedToday = el("stat-reviewed-today");
  const statsSubjectSelectEl = el("stats-subject-select");
  const statsRangeSelectEl = el("stats-range-select");
  const dueChartEl = el("due-chart");
  const chartEmptyEl = el("chart-empty");
  const ALL_SUBJECTS = "__all__";
  let statsSubjectFilter = ALL_SUBJECTS;
  let statsRangeDays = 15;
  const CHART_MAX_BAR_PX = 140;

  /* Mini histogramme de la page Réviser (matière en cours). Échelle propre,
     changée en tapant dessus, indépendante du sélecteur de l'onglet Stats. */
  const reviewChartEl = el("review-due-chart");
  const reviewChartEmptyEl = el("review-chart-empty");
  const reviewChartWrapEl = el("review-chart-wrap");
  const reviewChartToggleEl = el("review-chart-toggle");
  const reviewChartScaleLabelEl = el("review-chart-scale-label");
  const reviewChartSubjectNameEl = el("review-chart-subject-name");
  const REVIEW_CHART_STEPS = [15, 30, 90, 365];
  const REVIEW_CHART_MAX_BAR_PX = 100;
  let reviewChartRangeDays = 15;

  /* Échelles des histogrammes : `visible` = nombre de colonnes qui tiennent
     sur la largeur de l'écran (calculé dynamiquement à partir de la largeur
     réelle disponible), `total` = nombre de jours réellement chargés dans le
     graphique, sur lesquels on peut ensuite défiler horizontalement. Avant,
     les deux étaient confondus (un seul `days`), ce qui fait qu'à l'échelle
     "3 mois" par exemple, il n'y avait justement que 3 mois de données —
     aucun défilement possible au-delà. Échelle "6 mois" retirée (item 4). */
  const RANGE_CONFIG = {
    15: { visible: 15, total: 60 },     // 15 jours à l'écran, défilement sur 2 mois
    30: { visible: 30, total: 120 },    // 1 mois à l'écran, défilement sur 4 mois
    90: { visible: 90, total: 365 },    // 3 mois à l'écran, défilement sur 1 an
    365: { visible: 360, total: 1095 }, // 1 an à l'écran, défilement sur 3 ans
  };

  /* Réglages du mode bonus : nombre de jours dont chaque note recule la
     fiche en révision libre (persisté en local, indépendant par appareil). */
  const BONUS_DAYS_KEY = "fiches_bonus_days";
  const DEFAULT_BONUS_DAYS = { hard: 1, good: 3, easy: 5 };
  let bonusDaysSettings = { ...DEFAULT_BONUS_DAYS };
  const settingBonusHardEl = el("setting-bonus-hard");
  const settingBonusGoodEl = el("setting-bonus-good");
  const settingBonusEasyEl = el("setting-bonus-easy");

  /* Réglage du comportement du bouton "Encore" en mode bonus : soit une
     date fixe (toujours le lendemain), soit un jour de plus à chaque fois
     par rapport à l'échéance actuelle de la fiche. */
  const BONUS_AGAIN_MODE_KEY = "fiches_bonus_again_mode";
  const DEFAULT_BONUS_AGAIN_MODE = "fixed"; // "fixed" | "increment"
  let bonusAgainMode = DEFAULT_BONUS_AGAIN_MODE;
  const settingBonusAgainModeEl = el("setting-bonus-again-mode");

  /* Réglage du nombre de jours dont le bouton "hibernation" repousse la
     prochaine interrogation d'une fiche. */
  const HIBERNATE_DAYS_KEY = "fiches_hibernate_days";
  const DEFAULT_HIBERNATE_DAYS = 7;
  let hibernateDays = DEFAULT_HIBERNATE_DAYS;
  const settingHibernateDaysEl = el("setting-hibernate-days");

  /* ---------------------------------------------------------
     Algorithme de répétition espacée "maison" (remplace SM-2) :
     - échéance initiale = 1 jour ;
     - à chaque réponse, nouvelle échéance = min(M[note], K[note] × échéance
       actuelle) — calculée SANS arrondi et conservée ainsi en mémoire
       (card.deadlineDaysRaw, 3 décimales) pour les calculs suivants ;
     - seule la version arrondie à l'entier (card.interval) sert à fixer la
       date de la prochaine interrogation et l'affichage.
     Réglable par matière (Ka/Kh/Kg/Ke bornés 1–10 par dixièmes, Ma/Mh/Mg/Me
     bornés 1–365 par unités), persisté en local sous une seule clé (map
     subjectId -> réglages), donc conservé d'une version de l'appli à
     l'autre comme le reste des réglages.
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Modes d'apprentissage (item 2) : désormais des entités GLOBALES
     (3 modes fixes + des modes personnalisés nommés, créés/modifiés/
     supprimés librement), chacune affectée à une ou plusieurs matières
     (ou affectée en bloc à un dossier entier, qui répercute alors le
     changement sur toutes les matières qu'il contient). Modifier les
     coefficients d'un mode affecte donc TOUTES les matières qui l'utilisent
     — contrairement à l'ancien système où chaque matière avait ses 4
     emplacements de réglages indépendants.
  --------------------------------------------------------- */
  const LEARNING_MODES_KEY = "fiches_learning_modes";
  const BUILTIN_MODE_IDS = ["cool", "normal", "renforce"];
  const BUILTIN_MODE_DEFAULTS = {
    cool: { name: "Cool", Ka: 3, Kh: 1.6, Kg: 2, Ke: 3.5, Ma: 3, Mh: 6, Mg: 60, Me: 300 },
    normal: { name: "Normal", Ka: 1.3, Kh: 1.5, Kg: 1.8, Ke: 2.4, Ma: 2, Mh: 3, Mg: 30, Me: 180 },
    renforce: { name: "Renforcé", Ka: 1, Kh: 1.3, Kg: 1.6, Ke: 1.9, Ma: 1, Mh: 2, Mg: 15, Me: 90 },
  };
  // Conservés pour compatibilité avec le code existant qui les référence
  // encore (couleurs, libellés courts...).
  const ALGO_MODE_ORDER = ["cool", "normal", "renforce", "custom"];
  const ALGO_MODE_SHORT_LABELS = { cool: "Cool", normal: "Normal", renforce: "Renforcé", custom: "Personnalisé" };
  const ALGO_KEYS8 = ["Ka", "Kh", "Kg", "Ke", "Ma", "Mh", "Mg", "Me"];

  function clampAlgoK(v, fallback) {
    const n = Math.round(Number(v) * 10) / 10;
    return Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : fallback;
  }
  function clampAlgoM(v, fallback) {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(365, Math.max(1, n)) : fallback;
  }
  function clampModeProfile(raw, fallbackId) {
    const fb = BUILTIN_MODE_DEFAULTS[fallbackId] || BUILTIN_MODE_DEFAULTS.normal;
    const out = {};
    ["Ka", "Kh", "Kg", "Ke"].forEach((k) => { out[k] = clampAlgoK(raw && raw[k], fb[k]); });
    ["Ma", "Mh", "Mg", "Me"].forEach((k) => { out[k] = clampAlgoM(raw && raw[k], fb[k]); });
    return out;
  }

  /** Charge tous les modes (3 fixes + personnalisés), garantissant que les
   *  3 fixes existent toujours (avec leurs valeurs éventuellement
   *  modifiées, sinon leurs valeurs d'origine). */
  function loadLearningModes() {
    let stored = {};
    try {
      const raw = localStorage.getItem(LEARNING_MODES_KEY);
      stored = raw ? JSON.parse(raw) : {};
    } catch (e) {
      stored = {};
    }
    const modes = {};
    BUILTIN_MODE_IDS.forEach((id) => {
      modes[id] = {
        id,
        name: BUILTIN_MODE_DEFAULTS[id].name,
        builtin: true,
        ...clampModeProfile(stored[id], id),
      };
    });
    Object.values(stored).forEach((m) => {
      if (m && m.id && !BUILTIN_MODE_IDS.includes(m.id)) {
        modes[m.id] = { id: m.id, name: (m.name || "Sans nom").trim() || "Sans nom", builtin: false, ...clampModeProfile(m, "normal") };
      }
    });
    return modes;
  }
  function saveLearningModes(modes) {
    localStorage.setItem(LEARNING_MODES_KEY, JSON.stringify(modes));
    touchAppSettingsTimestamp();
  }
  function createCustomMode(name, basedOnId) {
    const modes = loadLearningModes();
    const id = "custom-" + uid();
    const base = modes[basedOnId] || modes.normal;
    modes[id] = { id, name: (name || "Nouveau mode").trim(), builtin: false, ...clampModeProfile(base, "normal") };
    saveLearningModes(modes);
    return id;
  }
  function renameCustomMode(modeId, name) {
    const modes = loadLearningModes();
    if (!modes[modeId] || modes[modeId].builtin || !name || !name.trim()) return;
    modes[modeId].name = name.trim();
    saveLearningModes(modes);
  }
  async function deleteCustomMode(modeId) {
    const modes = loadLearningModes();
    if (!modes[modeId] || modes[modeId].builtin) return;
    delete modes[modeId];
    saveLearningModes(modes);
    // Toute matière qui utilisait ce mode supprimé retombe sur "Normal".
    for (const s of subjects) {
      if (s.modeId === modeId) {
        s.modeId = "normal";
        s.updatedAt = new Date().toISOString();
        await DB.putSubject(s);
      }
    }
  }
  function updateModeProfile(modeId, values) {
    const modes = loadLearningModes();
    if (!modes[modeId]) return;
    Object.assign(modes[modeId], clampModeProfile(values, modeId));
    saveLearningModes(modes);
  }

  /** Mode effectif d'une matière (objet complet, avec Ka..Me) — "Normal" si
   *  la matière n'a pas encore de mode affecté ou si son mode a disparu. */
  function getSubjectMode(subjectId) {
    const s = subjects.find((x) => x.id === subjectId);
    const modes = loadLearningModes();
    const modeId = s && modes[s.modeId] ? s.modeId : "normal";
    return modes[modeId];
  }
  function getSubjectAlgoSettings(subjectId) {
    return getSubjectMode(subjectId);
  }
  function getSubjectAlgoMode(subjectId) {
    return getSubjectMode(subjectId).id;
  }
  /** Affecte un mode à une matière (utilisé aussi en boucle pour affecter un
   *  dossier entier — voir assignModeToFolder). */
  async function assignModeToSubject(subjectId, modeId) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    s.modeId = modeId;
    s.updatedAt = new Date().toISOString();
    await DB.putSubject(s);
  }
  /** "quand on affecte un mode à un sous dossier ou un dossier, ça
   *  s'applique à toutes les matières contenues dedans" (item 1/2) : un
   *  affectage en bloc, immédiat, pas une référence permanente au dossier —
   *  déplacer ensuite une matière hors du dossier ne lui retire pas le mode
   *  déjà affecté. */
  async function assignModeToFolder(folderId, modeId) {
    for (const id of subjectIdsInFolder(folderId)) {
      await assignModeToSubject(id, modeId);
    }
  }

  /** Migration ponctuelle depuis l'ancien système (4 emplacements de
   *  réglages PAR MATIÈRE, clé localStorage "fiches_subject_algo") vers les
   *  modes globaux nommés (item 2). Pour chaque matière ayant un réglage
   *  dans l'ancien format : si son mode actif à l'époque correspondait
   *  exactement à un préréglage fixe, elle est simplement affectée à ce
   *  mode ; sinon (c'était un "Personnalisé" propre à cette matière), un
   *  nouveau mode personnalisé est créé avec ces valeurs, nommé d'après la
   *  matière, pour ne rien perdre de ses réglages existants. Ne s'exécute
   *  qu'une fois (l'ancienne clé est ensuite supprimée). */
  async function migrateSubjectModesIfNeeded() {
    const OLD_KEY = "fiches_subject_algo";
    let oldMap;
    try {
      const raw = localStorage.getItem(OLD_KEY);
      oldMap = raw ? JSON.parse(raw) : null;
    } catch (e) {
      oldMap = null;
    }
    let changed = false;
    for (const s of subjects) {
      if (s.modeId === undefined) {
        s.modeId = "normal";
        changed = true;
      }
    }
    if (oldMap) {
      for (const s of subjects) {
        const old = oldMap[s.id];
        if (!old || !old.profiles) continue;
        const mode = old.mode && old.profiles[old.mode] ? old.profiles[old.mode] : old.profiles.normal;
        if (!mode) continue;
        let matched = null;
        for (const key of BUILTIN_MODE_IDS) {
          if (ALGO_KEYS8.every((k) => Math.abs(mode[k] - BUILTIN_MODE_DEFAULTS[key][k]) < 1e-9)) {
            matched = key;
            break;
          }
        }
        if (matched) {
          s.modeId = matched;
        } else {
          s.modeId = createCustomMode(`${s.name} (personnalisé)`, "normal");
          updateModeProfile(s.modeId, mode);
        }
        changed = true;
      }
      localStorage.removeItem(OLD_KEY);
    }
    if (changed) {
      for (const s of subjects) {
        await DB.putSubject(s);
      }
    }
  }

  /** Clé CSS de couleur (is-cool/is-normal/is-renforce/is-custom) : tout
   *  mode personnalisé (id "custom-xxxx", quel que soit son nom) retombe
   *  sur la couleur "is-custom" (jaune) partagée par tous les modes maison. */
  function algoModeCssKey(modeId) {
    return BUILTIN_MODE_IDS.includes(modeId) ? modeId : "custom";
  }
  /** Nom affiché d'un mode — le vrai nom pour un mode personnalisé (créé et
   *  nommé librement), le libellé court fixe pour les 3 modes intégrés. */
  function modeDisplayName(modeId) {
    const modes = loadLearningModes();
    const m = modes[modeId];
    if (m) return m.name;
    return ALGO_MODE_SHORT_LABELS.normal;
  }

  const ALGO_RATING_KEYS = { again: ["Ka", "Ma"], hard: ["Kh", "Mh"], good: ["Kg", "Mg"], easy: ["Ke", "Me"] };
  /** Calcule la nouvelle échéance (non arrondie) pour une note donnée. */
  function computeNextDeadlineRaw(currentRawDays, rating, settings) {
    const [kKey, mKey] = ALGO_RATING_KEYS[rating];
    return Math.min(settings[mKey], settings[kKey] * currentRawDays);
  }
  /** Échéance non arrondie actuellement en mémoire pour une fiche — 1 jour
   *  par défaut pour une fiche neuve, ou reprise de `interval` (ancien champ
   *  SM-2) pour ne pas repartir de zéro sur les fiches déjà existantes lors
   *  de la migration vers ce nouvel algorithme. */
  function currentDeadlineRaw(card) {
    if (typeof card.deadlineDaysRaw === "number" && Number.isFinite(card.deadlineDaysRaw)) {
      return card.deadlineDaysRaw;
    }
    return typeof card.interval === "number" && card.interval > 0 ? card.interval : 1;
  }
  /** Applique une note à une fiche avec le nouvel algorithme : renvoie les
   *  champs à fusionner dans la fiche (échéance brute conservée à 3
   *  décimales, échéance entière, et date de prochaine interrogation). */
  function computeAlgoNext(card, rating, subjectId) {
    const settings = getSubjectAlgoSettings(subjectId);
    const rawBefore = currentDeadlineRaw(card);
    const rawAfter = computeNextDeadlineRaw(rawBefore, rating, settings);
    const rawAfterRounded3 = Math.round(rawAfter * 1000) / 1000;
    const intervalDays = Math.max(1, Math.round(rawAfter));
    const due = startOfDay(new Date());
    due.setDate(due.getDate() + intervalDays);
    return { deadlineDaysRaw: rawAfterRounded3, interval: intervalDays, dueDate: due.toISOString() };
  }


  /** Appelée après chaque changement d'échéance issu d'une vraie révision
   *  (algorithme SM-2 normal ou mode bonus — pas l'hibernation, qui ne
   *  compte volontairement pas comme une révision). Met à jour le record
   *  personnel de la fiche (conservé pour historique / usages futurs). */
  function trackCardInterval(card, intervalDays) {
    if (!Number.isFinite(intervalDays)) return;
    card.maxIntervalReached = Math.max(card.maxIntervalReached || 0, intervalDays);
  }

  const exportBtn = el("export-btn");
  const importInput = el("import-input");
  const importTargetSelect = el("import-target-select");

  const subjectSelectEl = el("subject-select");
  const cardsSubjectSelectEl = el("cards-subject-select");
  const manageAddSubjectBtn = el("manage-add-subject-btn");
  const subjectListEl = el("subject-list");
  const subjectBarCountEl = el("subject-bar-count");
  const subjectBarAlgoBtn = el("subject-bar-algo-btn");
  const subjectBarAlgoLabelEl = el("subject-bar-algo-label");

  const uid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  function newCard(question, answer, subjectId = currentSubjectId) {
    const now = new Date().toISOString();
    return {
      id: uid(),
      subject: subjectId,
      question,
      answer,
      createdAt: now,
      dueDate: now, // due immédiatement
      lastReviewed: null,
      reviewCount: 0,
      updatedAt: now,
      deleted: false,
      // Nouvel algorithme (remplace SM-2) : échéance initiale = 1 jour, non
      // arrondie (voir computeAlgoNext / currentDeadlineRaw).
      interval: 1,
      deadlineDaysRaw: 1,
    };
  }

  /* ---------------------------------------------------------
     Matières (subjects) et dossiers (folders) — item 1 : arborescence
  --------------------------------------------------------- */
  /** @type {Array<{id:string,name:string,parentId:string|null,createdAt:string,updatedAt:string}>} */
  let folders = [];
  const ROOT_FOLDER_ID = null;

  function newFolder(name, parentId) {
    const now = new Date().toISOString();
    return { id: uid(), name: name.trim(), parentId: parentId || ROOT_FOLDER_ID, createdAt: now, updatedAt: now };
  }

  function newSubject(name, folderId) {
    const now = new Date().toISOString();
    return { id: uid(), name: name.trim(), folderId: folderId || ROOT_FOLDER_ID, createdAt: now, updatedAt: now };
  }

  /** Tous les descendants (sous-dossiers, à tous les niveaux) d'un dossier. */
  function folderDescendantIds(folderId) {
    const out = [];
    const stack = [folderId];
    while (stack.length) {
      const id = stack.pop();
      folders.forEach((f) => {
        if (f.parentId === id) {
          out.push(f.id);
          stack.push(f.id);
        }
      });
    }
    return out;
  }

  /** Identifiants de toutes les matières contenues dans un dossier, y
   *  compris dans ses sous-dossiers à n'importe quelle profondeur. */
  function subjectIdsInFolder(folderId) {
    const ids = new Set([folderId, ...folderDescendantIds(folderId)]);
    return subjects.filter((s) => ids.has(s.folderId)).map((s) => s.id);
  }

  /** Un dossier ne peut être supprimé que s'il est vide (item 1) : ni
   *  sous-dossier, ni matière directement dedans. */
  function folderIsEmpty(folderId) {
    return (
      !folders.some((f) => f.parentId === folderId) &&
      !subjects.some((s) => s.folderId === folderId)
    );
  }

  function subjectName(id) {
    if (id === ALL_SUBJECTS_ID) return "Toutes les matières";
    if (id === MULTI_SUBJECTS_ID) {
      const n = loadMultiSelection().length;
      return `Sélection (${n} matière${n > 1 ? "s" : ""})`;
    }
    const s = subjects.find((x) => x.id === id);
    return s ? s.name : "Matière inconnue";
  }

  /** Affiche la question d'une fiche — précédée de "Nom de la matière :" +
   *  deux sauts de ligne UNIQUEMENT quand on révise plusieurs matières
   *  confondues (item 2) : ça n'a pas d'intérêt quand une seule matière est
   *  affichée à la fois, et ça ne doit jamais apparaître côté réponse.
   *  Rafraîchit aussi le bouton mode d'apprentissage sur CETTE fiche
   *  précise (sa propre matière), pas sur la sélection globale — utile en
   *  mode "toutes matières"/"sélection", où chaque fiche peut appartenir à
   *  une matière différente avec son propre mode. */
  function renderQuestionText(card) {
    if (!card) return;
    questionTextEl.textContent = isSentinelSubject(currentSubjectId)
      ? `${subjectName(card.subject)} :\n\n${card.question}`
      : card.question;
    renderSubjectAlgoBadge(card.subject);
  }

  /** Exposé pour que sync.js puisse dénormaliser le nom de la matière sur chaque ligne envoyée. */
  window.getSubjectName = subjectName;

  /** Charge les matières depuis IndexedDB ; en crée une par défaut si aucune n'existe encore. */
  async function loadSubjects() {
    subjects = await DB.getAllSubjects();
    folders = await DB.getAllFolders();
    subjects.forEach((s) => { if (s.folderId === undefined) s.folderId = ROOT_FOLDER_ID; });
    if (subjects.length === 0) {
      const general = newSubject("Général");
      await DB.putSubject(general);
      subjects = [general];
    }
    await migrateSubjectModesIfNeeded();
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));

    const saved = localStorage.getItem(CURRENT_SUBJECT_KEY);
    if (saved && (isSentinelSubject(saved) || subjects.some((s) => s.id === saved))) {
      currentSubjectId = saved;
    } else {
      currentSubjectId = subjects[0].id;
      localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
    }
  }

  /** Fiches créées avant l'introduction des matières (ou reçues d'un vieil export) :
   *  on les rattache à une matière fixe et déterministe (la première par ordre
   *  alphabétique) plutôt qu'à "la matière actuellement affichée", qui peut varier
   *  d'un appareil à l'autre et provoquer des reclassements imprévisibles lors
   *  de la synchronisation. */
  async function migrateOrphanCards() {
    const orphans = cards.filter((c) => !c.subject);
    if (orphans.length === 0) return;
    const target = subjects[0].id;
    const fixed = orphans.map((c) => touch({ ...c, subject: target }));
    await DB.bulkPut(fixed);
    for (const f of fixed) {
      const idx = cards.findIndex((c) => c.id === f.id);
      if (idx >= 0) cards[idx] = f;
    }
  }

  /** Nettoyage ponctuel (exécuté à chaque démarrage) : fusionne les matières
   *  strictement homonymes lorsque certaines n'ont aucune fiche — séquelle du
   *  bug de synchronisation ci-dessus, qui pouvait laisser une matière
   *  "Général" fantôme et vide sur un appareil après une synchro. On ne
   *  touche jamais à une matière qui contient des fiches. */
  async function dedupeEmptySubjects() {
    const byName = new Map();
    for (const s of subjects) {
      if (!byName.has(s.name)) byName.set(s.name, []);
      byName.get(s.name).push(s);
    }
    for (const group of byName.values()) {
      if (group.length < 2) continue;
      const withCards = group.filter((s) =>
        cards.some((c) => c.subject === s.id && !c.deleted)
      );
      const keep = withCards[0] || group[0];
      const toRemove = group.filter((s) => s.id !== keep.id && !withCards.includes(s));
      for (const s of toRemove) {
        await DB.removeSubject(s.id);
        subjects = subjects.filter((x) => x.id !== s.id);
        if (currentSubjectId === s.id) {
          currentSubjectId = keep.id;
          localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
        }
      }
    }
  }

  function renderSubjectSelect() {
    const opts = subjects
      .map(
        (s) =>
          `<option value="${s.id}" ${s.id === currentSubjectId ? "selected" : ""}>${escapeHtml(s.name)}</option>`
      )
      .join("");
    // Options "toutes matières" / "sélection de matières" (item 1) — SEULE
    // la page Réviser les propose : créer une fiche (Gérer) ou exporter
    // (Réglages) exige toujours une matière réelle et précise.
    const sentinelOpts =
      `<option value="${ALL_SUBJECTS_ID}" ${currentSubjectId === ALL_SUBJECTS_ID ? "selected" : ""}>🔀 Toutes les matières</option>` +
      `<option value="${MULTI_SUBJECTS_ID}" ${currentSubjectId === MULTI_SUBJECTS_ID ? "selected" : ""}>☑️ Sélection de matières…</option>`;
    subjectSelectEl.innerHTML = opts + sentinelOpts;
    // Second sélecteur, en tête de la page Fiches (item 2) : matières
    // réelles uniquement (pas de dossier ni de mode "toutes matières").
    if (cardsSubjectSelectEl) {
      cardsSubjectSelectEl.innerHTML = opts;
      if (!isSentinelSubject(currentSubjectId)) cardsSubjectSelectEl.value = currentSubjectId;
    }

    // Le sélecteur d'import propose en plus la création d'une nouvelle matière à la volée.
    const importOpts =
      opts + `<option value="__new__">+ Nouvelle matière…</option>`;
    const prevImportTarget = importTargetSelect.value || currentSubjectId;
    importTargetSelect.innerHTML = importOpts;
    if ([...importTargetSelect.options].some((o) => o.value === prevImportTarget)) {
      importTargetSelect.value = prevImportTarget;
    } else {
      importTargetSelect.value = currentSubjectId;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /** Dossier actuellement "ouvert" dans la page Gérer (navigation, distincte
   *  de la matière active choisie pour réviser/créer une fiche). */
  let manageFolderBrowseId = ROOT_FOLDER_ID;

  function folderPath(folderId) {
    const path = [];
    let cur = folderId;
    while (cur) {
      const f = folders.find((x) => x.id === cur);
      if (!f) break;
      path.unshift(f);
      cur = f.parentId;
    }
    return path;
  }

  function renderFolderBreadcrumb() {
    const bc = el("folder-breadcrumb");
    if (!bc) return;
    bc.innerHTML = "";
    const path = folderPath(manageFolderBrowseId);
    const rootBtn = document.createElement("button");
    rootBtn.type = "button";
    rootBtn.className = "folder-breadcrumb-item" + (!manageFolderBrowseId ? " is-current" : "");
    rootBtn.textContent = "🗂️ Racine";
    rootBtn.addEventListener("click", () => {
      manageFolderBrowseId = ROOT_FOLDER_ID;
      renderSubjectManageList();
    });
    bc.appendChild(rootBtn);
    path.forEach((f) => {
      const sep = document.createElement("span");
      sep.className = "folder-breadcrumb-sep";
      sep.textContent = "›";
      bc.appendChild(sep);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "folder-breadcrumb-item" + (f.id === manageFolderBrowseId ? " is-current" : "");
      btn.textContent = f.name;
      btn.addEventListener("click", () => {
        manageFolderBrowseId = f.id;
        renderSubjectManageList();
      });
      bc.appendChild(btn);
    });
  }

  function renderSubjectManageList() {
    renderFolderBreadcrumb();
    subjectListEl.innerHTML = "";

    const childFolders = folders
      .filter((f) => f.parentId === manageFolderBrowseId)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const childSubjects = subjects
      .filter((s) => s.folderId === manageFolderBrowseId)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    childFolders.forEach((f) => {
      const li = document.createElement("li");
      li.className = "subject-row folder-row";

      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "subject-row-name";
      nameBtn.title = "Ouvrir ce dossier";
      nameBtn.textContent = `📁 ${f.name}`;
      nameBtn.addEventListener("click", () => {
        manageFolderBrowseId = f.id;
        renderSubjectManageList();
      });

      const count = document.createElement("span");
      count.className = "subject-row-count";
      const n = subjectIdsInFolder(f.id).length;
      count.textContent = `${n} matière${n > 1 ? "s" : ""}`;

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const renameBtn = document.createElement("button");
      renameBtn.type = "button";
      renameBtn.className = "icon-btn";
      renameBtn.textContent = "✏️";
      renameBtn.title = "Renommer ce dossier";
      renameBtn.addEventListener("click", () => renameFolder(f.id));

      const moveBtn = document.createElement("button");
      moveBtn.type = "button";
      moveBtn.className = "icon-btn";
      moveBtn.textContent = "↔️";
      moveBtn.title = "Déplacer ce dossier";
      moveBtn.addEventListener("click", () => openMovePicker("folder", f.id));

      const assignBtn = document.createElement("button");
      assignBtn.type = "button";
      assignBtn.className = "icon-btn";
      assignBtn.textContent = "🎓";
      assignBtn.title = "Affecter un mode d'apprentissage à toutes les matières de ce dossier";
      assignBtn.addEventListener("click", () => openAssignView("folder", f.id, "manage"));

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "icon-btn icon-btn--danger";
      delBtn.textContent = "🗑️";
      delBtn.title = "Supprimer ce dossier (doit être vide)";
      delBtn.addEventListener("click", () => deleteFolder(f.id));

      actions.appendChild(renameBtn);
      actions.appendChild(moveBtn);
      actions.appendChild(assignBtn);
      actions.appendChild(delBtn);

      li.appendChild(nameBtn);
      li.appendChild(count);
      li.appendChild(actions);
      subjectListEl.appendChild(li);
    });

    for (const s of childSubjects) {
      const li = document.createElement("li");
      li.className = "subject-row" + (s.id === currentSubjectId ? " is-active" : "");

      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "subject-row-name";
      nameBtn.title = "Renommer";
      nameBtn.textContent = s.name;
      nameBtn.addEventListener("click", () => renameSubject(s.id));

      const count = document.createElement("span");
      count.className = "subject-row-count";
      const n = cards.filter((c) => !c.deleted && c.subject === s.id).length;
      count.textContent = `${n} fiche${n > 1 ? "s" : ""}`;

      const actions = document.createElement("div");
      actions.className = "row-actions";

      // Bouton "mode" fusionné avec l'affichage du mode actuel (item 9) :
      // un encadré à part entière (pas juste du texte) pour bien se lire
      // comme un bouton, sans élargir la ligne.
      const algoBtn = document.createElement("button");
      algoBtn.type = "button";
      algoBtn.className = `subject-row-algo-btn ${ALGO_MODE_KEY_TO_CLASS[algoModeCssKey(getSubjectAlgoMode(s.id))]}`;
      algoBtn.innerHTML = `🎓 <span>${modeDisplayName(getSubjectAlgoMode(s.id))}</span>`;
      algoBtn.title = "Mode d'apprentissage de cette matière";
      algoBtn.addEventListener("click", () => openSubjectAlgoView(s.id));

      const moveBtn = document.createElement("button");
      moveBtn.type = "button";
      moveBtn.className = "icon-btn";
      moveBtn.textContent = "↔️";
      moveBtn.title = "Déplacer cette matière";
      moveBtn.addEventListener("click", () => openMovePicker("subject", s.id));

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "icon-btn icon-btn--danger";
      delBtn.textContent = "🗑️";
      delBtn.title = "Supprimer cette matière";
      delBtn.addEventListener("click", () => deleteSubject(s.id));

      actions.appendChild(algoBtn);
      actions.appendChild(moveBtn);
      actions.appendChild(delBtn);

      li.appendChild(nameBtn);
      li.appendChild(count);
      li.appendChild(actions);
      subjectListEl.appendChild(li);
    }

    if (childFolders.length === 0 && childSubjects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "field-hint";
      empty.textContent = "Ce dossier est vide.";
      subjectListEl.appendChild(empty);
    }
  }

  /* ---------------------------------------------------------
     Gestion des dossiers (créer, renommer, supprimer, déplacer) — item 1
  --------------------------------------------------------- */
  async function createFolderFlow() {
    const name = prompt("Nom du nouveau dossier :");
    if (!name || !name.trim()) return;
    const folder = newFolder(name, manageFolderBrowseId);
    await DB.putFolder(folder);
    folders.push(folder);
    renderSubjectManageList();
  }

  async function renameFolder(folderId) {
    const f = folders.find((x) => x.id === folderId);
    if (!f) return;
    const name = prompt("Nouveau nom du dossier :", f.name);
    if (!name || !name.trim() || name.trim() === f.name) return;
    f.name = name.trim();
    f.updatedAt = new Date().toISOString();
    await DB.putFolder(f);
    renderSubjectManageList();
  }

  async function deleteFolder(folderId) {
    if (!folderIsEmpty(folderId)) {
      alert("Ce dossier n'est pas vide : déplace ou supprime d'abord ce qu'il contient.");
      return;
    }
    const f = folders.find((x) => x.id === folderId);
    if (!confirm(`Supprimer le dossier « ${f ? f.name : ""} » ?`)) return;
    folders = folders.filter((x) => x.id !== folderId);
    await DB.removeFolder(folderId);
    renderSubjectManageList();
  }

  /* ---------------------------------------------------------
     Déplacer un dossier ou une matière vers un autre dossier
  --------------------------------------------------------- */
  let movePickerKind = null; // "folder" | "subject"
  let movePickerTargetId = null;

  function openMovePicker(kind, targetId) {
    movePickerKind = kind;
    movePickerTargetId = targetId;
    const picker = el("move-picker");
    const list = el("move-picker-list");
    const title = el("move-picker-title");
    if (!picker || !list) return;

    // Pour un dossier, on exclut lui-même et tous ses descendants de la
    // liste des destinations possibles (on ne peut pas le déplacer dans
    // lui-même ou l'un de ses propres sous-dossiers).
    const excluded = kind === "folder" ? new Set([targetId, ...folderDescendantIds(targetId)]) : new Set();
    const name = kind === "folder" ? (folders.find((f) => f.id === targetId) || {}).name : (subjects.find((s) => s.id === targetId) || {}).name;
    if (title) title.textContent = `Déplacer « ${name || ""} » vers :`;

    list.innerHTML = "";
    const rootLabel = document.createElement("label");
    rootLabel.className = "multi-subject-picker-item";
    rootLabel.innerHTML = `<input type="radio" name="move-target" value="" checked /> <span>🗂️ Racine</span>`;
    list.appendChild(rootLabel);

    folders
      .filter((f) => !excluded.has(f.id))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      .forEach((f) => {
        const label = document.createElement("label");
        label.className = "multi-subject-picker-item";
        const path = folderPath(f.id).map((p) => p.name).join(" / ");
        label.innerHTML = `<input type="radio" name="move-target" value="${f.id}" /> <span>📁 ${escapeHtml(path)}</span>`;
        list.appendChild(label);
      });

    picker.hidden = false;
  }

  function closeMovePicker() {
    const picker = el("move-picker");
    if (picker) picker.hidden = true;
    movePickerKind = null;
    movePickerTargetId = null;
  }

  const movePickerCancelBtn = el("move-picker-cancel");
  if (movePickerCancelBtn) movePickerCancelBtn.addEventListener("click", closeMovePicker);

  const movePickerConfirmBtn = el("move-picker-confirm");
  if (movePickerConfirmBtn) {
    movePickerConfirmBtn.addEventListener("click", async () => {
      const checked = document.querySelector('input[name="move-target"]:checked');
      const destId = checked && checked.value ? checked.value : ROOT_FOLDER_ID;
      if (movePickerKind === "folder") {
        const f = folders.find((x) => x.id === movePickerTargetId);
        if (f) {
          f.parentId = destId;
          f.updatedAt = new Date().toISOString();
          await DB.putFolder(f);
        }
      } else if (movePickerKind === "subject") {
        const s = subjects.find((x) => x.id === movePickerTargetId);
        if (s) {
          s.folderId = destId;
          s.updatedAt = new Date().toISOString();
          await DB.putSubject(s);
        }
      }
      closeMovePicker();
      renderSubjectManageList();
    });
  }

  const manageAddFolderBtn = el("manage-add-folder-btn");
  if (manageAddFolderBtn) manageAddFolderBtn.addEventListener("click", createFolderFlow);

  /* ---------------------------------------------------------
     Vue globale "Modes d'apprentissage" (item 2) : édite un mode (3 fixes +
     personnalisés créables/renommables/supprimables) — les réglages sont
     globaux, partagés par toutes les matières qui utilisent ce mode.
  --------------------------------------------------------- */
  let algoEditingModeId = "normal";
  /** État coché/décoché des 4 courbes (item 3), partagé par les deux
   *  graphiques (édition globale + aperçu d'affectation). */
  let algoChartVisible = { again: true, hard: true, good: true, easy: true };

  const ALGO_MODE_COLORS = { cool: "var(--sage)", normal: "var(--amber)", renforce: "var(--terracotta)", custom: "#e8c84a" };
  function algoSliderIdxForMode(modeId) {
    const i = BUILTIN_MODE_IDS.indexOf(modeId);
    return i === -1 ? 3 : i;
  }
  function updateAlgoModeTicksHighlight(idx) {
    document.querySelectorAll("#algo-mode-ticks span").forEach((tick) => {
      tick.classList.toggle("is-active", Number(tick.dataset.idx) === idx);
    });
    const slider = el("algo-mode-slider");
    const key = ALGO_MODE_ORDER[idx];
    if (slider) slider.style.setProperty("--algo-slider-color", ALGO_MODE_COLORS[key] || "var(--amber)");
    const ticksWrap = el("algo-mode-ticks");
    if (ticksWrap) ticksWrap.style.setProperty("--algo-tick-color", ALGO_MODE_COLORS[key] || "var(--amber)");
  }

  function renderCustomPickerList() {
    const list = el("algo-custom-picker-list");
    if (!list) return;
    const modes = loadLearningModes();
    const customs = Object.values(modes).filter((m) => !m.builtin).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    list.innerHTML = "";
    if (customs.length === 0) {
      const p = document.createElement("p");
      p.className = "field-hint";
      p.textContent = "Aucun mode personnalisé pour l'instant.";
      list.appendChild(p);
      return;
    }
    customs.forEach((m) => {
      const label = document.createElement("label");
      label.className = "multi-subject-picker-item";
      const cb = document.createElement("input");
      cb.type = "radio";
      cb.name = "custom-mode-pick";
      cb.value = m.id;
      cb.checked = m.id === algoEditingModeId;
      const span = document.createElement("span");
      span.textContent = m.name;
      label.appendChild(cb);
      label.appendChild(span);
      list.appendChild(label);
      cb.addEventListener("change", () => loadModeFormIntoInputs(m.id));
    });
  }

  function loadModeFormIntoInputs(modeId) {
    const modes = loadLearningModes();
    const m = modes[modeId] || modes.normal;
    algoEditingModeId = m.id;
    el("algo-ka").value = m.Ka;
    el("algo-kh").value = m.Kh;
    el("algo-kg").value = m.Kg;
    el("algo-ke").value = m.Ke;
    el("algo-ma").value = m.Ma;
    el("algo-mh").value = m.Mh;
    el("algo-mg").value = m.Mg;
    el("algo-me").value = m.Me;
    const idx = algoSliderIdxForMode(m.id);
    const slider = el("algo-mode-slider");
    if (slider) slider.value = String(idx);
    updateAlgoModeTicksHighlight(idx);
    const customPicker = el("algo-custom-picker");
    if (customPicker) customPicker.hidden = idx !== 3;
    if (idx === 3) renderCustomPickerList();
    const resetBtn = el("algo-reset-btn");
    if (resetBtn) resetBtn.hidden = !m.builtin;
    renderAlgoPreviewChart();
  }

  /** Construit le HTML (légende + SVG) d'un graphique d'aperçu pour un jeu
   *  de réglages donné — partagé entre la page d'édition globale et la
   *  page d'affectation (lecture seule). Échelle LINÉAIRE (pas log, item 5
   *  d'une demande précédente), valeur écrite à côté de chaque point. */
  const ALGO_CHART_COLORS = { again: "var(--terracotta)", hard: "var(--amber)", good: "var(--sage)", easy: "var(--teal)" };
  const ALGO_CHART_RATING_LABELS = { again: "Encore", hard: "Difficile", good: "Bien", easy: "Facile" };
  function computeAlgoPreviewSeries(settings, rating, n) {
    let raw = 1;
    const out = [];
    for (let i = 0; i < n; i++) {
      raw = computeNextDeadlineRaw(raw, rating, settings);
      out.push(Math.max(1, Math.round(raw)));
    }
    return out;
  }
  function buildPreviewChartHtml(settings) {
    const N = 8;
    const ratings = ["again", "hard", "good", "easy"];
    const seriesByRating = {};
    ratings.forEach((r) => {
      seriesByRating[r] = computeAlgoPreviewSeries(settings, r, N);
    });
    const visibleRatings = ratings.filter((r) => algoChartVisible[r]);
    let maxVal = 1;
    visibleRatings.forEach((r) => { maxVal = Math.max(maxVal, ...seriesByRating[r]); });

    const legend = ratings
      .map(
        (r) => `<label class="algo-chart-legend-item">
          <input type="checkbox" class="algo-chart-legend-checkbox" data-rating="${r}" ${algoChartVisible[r] ? "checked" : ""} />
          <span class="algo-chart-legend-dot" style="background:${ALGO_CHART_COLORS[r]}"></span>${ALGO_CHART_RATING_LABELS[r]}
        </label>`
      )
      .join("");

    if (visibleRatings.length === 0) {
      return `<div class="algo-chart-legend">${legend}</div><p class="field-hint algo-chart-empty">Coche au moins une courbe pour l'afficher.</p>`;
    }

    const W = 320, H = 260, padL = 30, padB = 22, padT = 14, padR = 12;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const xPos = (i) => padL + (i / (N - 1)) * plotW;
    const yMax = Math.max(10, Math.ceil((maxVal * 1.08) / 10) * 10);
    const yPos = (v) => padT + (1 - v / yMax) * plotH;

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:var(--desk);border-radius:8px;">`;
    svg += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="rgba(247,241,225,0.3)" stroke-width="1"/>`;
    svg += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="rgba(247,241,225,0.3)" stroke-width="1"/>`;

    [0, yMax / 3, (2 * yMax) / 3, yMax].forEach((t) => {
      const y = yPos(t);
      svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(247,241,225,0.1)" stroke-width="1"/>`;
      svg += `<text x="${padL - 4}" y="${y + 3}" font-size="8" fill="#9aa89e" text-anchor="end">${Math.round(t)}</text>`;
    });

    const labelDx = { again: -9, hard: -3, good: 3, easy: 9 };
    visibleRatings.forEach((r) => {
      const s = seriesByRating[r];
      const pts = s.map((v, i) => `${xPos(i)},${yPos(v)}`).join(" ");
      svg += `<polyline points="${pts}" fill="none" stroke="${ALGO_CHART_COLORS[r]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      s.forEach((v, i) => {
        const x = xPos(i), y = yPos(v);
        svg += `<circle cx="${x}" cy="${y}" r="2.4" fill="${ALGO_CHART_COLORS[r]}"/>`;
        svg += `<text x="${x + labelDx[r]}" y="${y - 5}" font-size="7.5" fill="${ALGO_CHART_COLORS[r]}" text-anchor="middle" font-family="var(--font-mono)">${v}</text>`;
      });
    });
    for (let i = 0; i < N; i++) {
      svg += `<text x="${xPos(i)}" y="${H - padB + 12}" font-size="8" fill="#9aa89e" text-anchor="middle">${i + 1}</text>`;
    }
    svg += `</svg>`;

    return `<div class="algo-chart-legend">${legend}</div>${svg}`;
  }

  function wireChartCheckboxes(wrap, onToggle) {
    wrap.querySelectorAll(".algo-chart-legend-checkbox").forEach((cb) => {
      cb.addEventListener("change", () => {
        algoChartVisible[cb.dataset.rating] = cb.checked;
        onToggle();
      });
    });
  }

  function renderAlgoPreviewChart() {
    const wrap = el("algo-chart-wrap");
    if (!wrap) return;
    wrap.innerHTML = buildPreviewChartHtml(readAlgoFormSettings());
    wireChartCheckboxes(wrap, renderAlgoPreviewChart);
  }

  function readAlgoFormSettings() {
    return {
      Ka: clampAlgoK(el("algo-ka").value, BUILTIN_MODE_DEFAULTS.normal.Ka),
      Kh: clampAlgoK(el("algo-kh").value, BUILTIN_MODE_DEFAULTS.normal.Kh),
      Kg: clampAlgoK(el("algo-kg").value, BUILTIN_MODE_DEFAULTS.normal.Kg),
      Ke: clampAlgoK(el("algo-ke").value, BUILTIN_MODE_DEFAULTS.normal.Ke),
      Ma: clampAlgoM(el("algo-ma").value, BUILTIN_MODE_DEFAULTS.normal.Ma),
      Mh: clampAlgoM(el("algo-mh").value, BUILTIN_MODE_DEFAULTS.normal.Mh),
      Mg: clampAlgoM(el("algo-mg").value, BUILTIN_MODE_DEFAULTS.normal.Mg),
      Me: clampAlgoM(el("algo-me").value, BUILTIN_MODE_DEFAULTS.normal.Me),
    };
  }

  function saveModeFormAndRefresh() {
    updateModeProfile(algoEditingModeId, readAlgoFormSettings());
    loadModeFormIntoInputs(algoEditingModeId);
    renderSubjectAlgoBadge();
    renderSubjectManageList();
  }

  const algoModeSliderEl = el("algo-mode-slider");
  if (algoModeSliderEl) {
    algoModeSliderEl.addEventListener("input", () => {
      const idx = Number(algoModeSliderEl.value);
      updateAlgoModeTicksHighlight(idx);
      const customPicker = el("algo-custom-picker");
      if (idx < 3) {
        if (customPicker) customPicker.hidden = true;
        loadModeFormIntoInputs(BUILTIN_MODE_IDS[idx]);
        return;
      }
      if (customPicker) customPicker.hidden = false;
      const customs = Object.values(loadLearningModes()).filter((m) => !m.builtin);
      if (customs.length === 0) {
        const name = prompt("Nom du nouveau mode personnalisé :", "Mon mode");
        if (name && name.trim()) {
          const id = createCustomMode(name, algoEditingModeId);
          renderCustomPickerList();
          loadModeFormIntoInputs(id);
        } else {
          const prevIdx = algoSliderIdxForMode(algoEditingModeId);
          algoModeSliderEl.value = String(prevIdx);
          updateAlgoModeTicksHighlight(prevIdx);
          if (customPicker) customPicker.hidden = true;
        }
      } else {
        renderCustomPickerList();
        loadModeFormIntoInputs(customs[0].id);
      }
    });
  }

  const algoCustomNewBtn = el("algo-custom-new-btn");
  if (algoCustomNewBtn) {
    algoCustomNewBtn.addEventListener("click", () => {
      const name = prompt("Nom du nouveau mode personnalisé :");
      if (!name || !name.trim()) return;
      const id = createCustomMode(name, algoEditingModeId);
      renderCustomPickerList();
      loadModeFormIntoInputs(id);
    });
  }
  const algoCustomRenameBtn = el("algo-custom-rename-btn");
  if (algoCustomRenameBtn) {
    algoCustomRenameBtn.addEventListener("click", () => {
      const modes = loadLearningModes();
      const m = modes[algoEditingModeId];
      if (!m || m.builtin) return;
      const name = prompt("Nouveau nom du mode :", m.name);
      if (!name || !name.trim()) return;
      renameCustomMode(algoEditingModeId, name);
      renderCustomPickerList();
      renderSubjectAlgoBadge();
      renderSubjectManageList();
    });
  }
  const algoCustomDeleteBtn = el("algo-custom-delete-btn");
  if (algoCustomDeleteBtn) {
    algoCustomDeleteBtn.addEventListener("click", async () => {
      const modes = loadLearningModes();
      const m = modes[algoEditingModeId];
      if (!m || m.builtin) return;
      if (!confirm(`Supprimer le mode « ${m.name} » ? Les matières qui l'utilisent repasseront en mode Normal.`)) return;
      await deleteCustomMode(algoEditingModeId);
      const remaining = Object.values(loadLearningModes()).filter((x) => !x.builtin);
      if (remaining.length > 0) {
        renderCustomPickerList();
        loadModeFormIntoInputs(remaining[0].id);
      } else {
        loadModeFormIntoInputs("normal");
      }
      renderSubjectManageList();
      renderSubjectAlgoBadge();
    });
  }

  ["algo-ka", "algo-kh", "algo-kg", "algo-ke", "algo-ma", "algo-mh", "algo-mg", "algo-me"].forEach((id) => {
    const input = el(id);
    if (!input) return;
    input.addEventListener("change", saveModeFormAndRefresh);
    input.addEventListener("input", renderAlgoPreviewChart);
  });

  const algoResetBtn = el("algo-reset-btn");
  if (algoResetBtn) {
    algoResetBtn.addEventListener("click", () => {
      const modes = loadLearningModes();
      const m = modes[algoEditingModeId];
      if (!m || !m.builtin) return;
      if (!confirm(`Remettre le mode ${m.name} à ses valeurs d'origine ? Toutes les matières qui l'utilisent seront concernées.`)) return;
      updateModeProfile(algoEditingModeId, BUILTIN_MODE_DEFAULTS[algoEditingModeId]);
      loadModeFormIntoInputs(algoEditingModeId);
      renderSubjectAlgoBadge();
    });
  }

  const algoAdvancedToggle = el("algo-advanced-toggle");
  const algoAdvancedPanel = el("algo-advanced-panel");
  if (algoAdvancedToggle && algoAdvancedPanel) {
    algoAdvancedToggle.addEventListener("click", () => {
      const willShow = algoAdvancedPanel.hidden;
      algoAdvancedPanel.hidden = !willShow;
      algoAdvancedToggle.textContent = willShow ? "Paramétrages avancés ▴" : "Paramétrages avancés ▾";
    });
  }

  /* ---------------------------------------------------------
     Vue "Affecter un mode" (par matière OU par dossier entier — item 1/2),
     ouverte depuis la page Gérer. Simple sélection parmi les modes déjà
     définis (édités globalement sur la page Modes d'apprentissage) — plus
     aucun réglage éditable ici.
  --------------------------------------------------------- */
  let algoOpenedFromView = "manage";
  let assignTargetKind = null; // "subject" | "folder"
  let assignTargetId = null;
  let assignCurrentModeId = "normal";

  function renderAssignChart(modeId) {
    const wrap = el("assign-chart-wrap");
    if (!wrap) return;
    const modes = loadLearningModes();
    const settings = modes[modeId] || modes.normal;
    wrap.innerHTML = buildPreviewChartHtml(settings);
    wireChartCheckboxes(wrap, () => renderAssignChart(assignCurrentModeId));
  }

  function renderAssignModeList(currentModeId) {
    const list = el("assign-mode-list");
    if (!list) return;
    const modes = loadLearningModes();
    const all = [
      ...BUILTIN_MODE_IDS.map((id) => modes[id]),
      ...Object.values(modes).filter((m) => !m.builtin).sort((a, b) => a.name.localeCompare(b.name, "fr")),
    ];
    list.innerHTML = "";
    all.forEach((m) => {
      const label = document.createElement("label");
      label.className = "multi-subject-picker-item";
      const cb = document.createElement("input");
      cb.type = "radio";
      cb.name = "assign-mode-pick";
      cb.value = m.id;
      cb.checked = m.id === currentModeId;
      const span = document.createElement("span");
      span.textContent = m.name;
      label.appendChild(cb);
      label.appendChild(span);
      list.appendChild(label);
      cb.addEventListener("change", async () => {
        assignCurrentModeId = m.id;
        if (assignTargetKind === "subject") {
          await assignModeToSubject(assignTargetId, m.id);
        } else if (assignTargetKind === "folder") {
          await assignModeToFolder(assignTargetId, m.id);
        }
        renderAssignChart(m.id);
        renderSubjectManageList();
        renderSubjectAlgoBadge();
      });
    });
  }

  function openAssignView(kind, targetId, fromView) {
    assignTargetKind = kind;
    assignTargetId = targetId;
    algoOpenedFromView = fromView === "review" ? "review" : "manage";
    algoChartVisible = { again: true, hard: true, good: true, easy: true };

    let title, currentModeId;
    if (kind === "subject") {
      const s = subjects.find((x) => x.id === targetId);
      title = `Affecter un mode — ${s ? s.name : ""}`;
      currentModeId = getSubjectAlgoMode(targetId);
    } else {
      const f = folders.find((x) => x.id === targetId);
      title = `Affecter un mode — 📁 ${f ? f.name : ""}`;
      currentModeId = "normal";
    }
    const titleEl = el("assign-target-title");
    if (titleEl) titleEl.textContent = title;
    assignCurrentModeId = currentModeId;
    renderAssignModeList(currentModeId);
    renderAssignChart(currentModeId);
    const reviewOldBlock = el("assign-review-old-block");
    if (reviewOldBlock) reviewOldBlock.hidden = kind !== "subject";

    const backBtn = el("assign-back-btn");
    if (backBtn) backBtn.textContent = algoOpenedFromView === "review" ? "← Retour à Réviser" : "← Retour à Gérer";

    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-mode-assign").classList.add("is-active");
  }

  // Conservé pour compatibilité avec les anciens appels (page Réviser) —
  // ouvre désormais la vue d'affectation plutôt que d'édition directe,
  // puisque les réglages ne se modifient plus matière par matière.
  function openSubjectAlgoView(subjectId, fromView) {
    openAssignView("subject", subjectId, fromView);
  }

  function closeAssignView() {
    const targetView = algoOpenedFromView === "review" ? "review" : "manage";
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el(`view-${targetView}`).classList.add("is-active");
    if (targetView === "manage") renderSubjectManageList();
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    const targetTab = document.querySelector(`.tab[data-view="${targetView}"]`);
    if (targetTab) {
      targetTab.classList.add("is-active");
      targetTab.setAttribute("aria-selected", "true");
    }
  }

  const assignBackBtn = el("assign-back-btn");
  if (assignBackBtn) assignBackBtn.addEventListener("click", closeAssignView);

  const algoReviewOldBtn = el("algo-review-old-btn");
  if (algoReviewOldBtn) {
    algoReviewOldBtn.addEventListener("click", async () => {
      if (assignTargetKind !== "subject" || !assignTargetId) return;
      const subject = subjects.find((s) => s.id === assignTargetId);
      const today = startOfDay(new Date());
      const targets = cards.filter((c) => {
        if (c.deleted || c.subject !== assignTargetId || !c.dueDate) return false;
        const daysAhead = Math.round((startOfDay(new Date(c.dueDate)).getTime() - today.getTime()) / 86400000);
        return daysAhead > 10;
      });
      if (targets.length === 0) {
        alert("Aucune fiche de cette matière n'a une prochaine interrogation prévue dans plus de 10 jours.");
        return;
      }
      const msg =
        `Attention : cette action va ramener l'échéance et la date de prochaine ` +
        `interrogation à 10 jours pour ${targets.length} fiche${targets.length > 1 ? "s" : ""} ` +
        `de « ${subject ? subject.name : ""} » (celles actuellement prévues dans plus de 10 jours). ` +
        `Cette action est irréversible. Continuer ?`;
      if (!confirm(msg)) return;

      const due = new Date(today);
      due.setDate(due.getDate() + 10);
      for (const c of targets) {
        const updated = touch({ ...c, interval: 10, deadlineDaysRaw: 10, dueDate: due.toISOString() });
        await persist(updated);
        const idx = cards.findIndex((x) => x.id === updated.id);
        if (idx >= 0) cards[idx] = updated;
      }
      renderStats();
      renderManageList();
      renderDuePill();
      alert(`${targets.length} fiche${targets.length > 1 ? "s" : ""} ramenée${targets.length > 1 ? "s" : ""} à 10 jours.`);
    });
  }


  async function createSubjectFlow() {
    const name = prompt("Nom de la nouvelle matière :");
    if (!name || !name.trim()) return null;
    const subject = newSubject(name, manageFolderBrowseId);
    await DB.putSubject(subject);
    subjects.push(subject);
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    renderStatsSubjectSelect();
    return subject;
  }

  async function renameSubject(id) {
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    const name = prompt("Nouveau nom de la matière :", s.name);
    if (!name || !name.trim() || name.trim() === s.name) return;
    s.name = name.trim();
    s.updatedAt = new Date().toISOString();
    await DB.putSubject(s);
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    renderSubjectSelect();
    renderSubjectManageList();
    renderStatsSubjectSelect();
    if (el("view-stats").classList.contains("is-active")) renderStats();
  }

  async function deleteSubject(id) {
    if (subjects.length <= 1) {
      alert("Impossible de supprimer la dernière matière restante.");
      return;
    }
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    const n = cards.filter((c) => !c.deleted && c.subject === id).length;
    const confirmMsg =
      n > 0
        ? `Supprimer la matière « ${s.name} » et ses ${n} fiche(s) ? Cette action est irréversible.`
        : `Supprimer la matière « ${s.name} » ?`;
    if (!confirm(confirmMsg)) return;

    // Suppression douce des fiches de cette matière (cohérent avec la sync).
    const toDelete = cards.filter((c) => !c.deleted && c.subject === id);
    for (const c of toDelete) {
      const updated = touch({ ...c, deleted: true });
      await persist(updated);
      const idx = cards.findIndex((x) => x.id === c.id);
      if (idx >= 0) cards[idx] = updated;
    }

    await DB.removeSubject(id);
    subjects = subjects.filter((x) => x.id !== id);

    if (currentSubjectId === id) {
      currentSubjectId = subjects[0].id;
      localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
      reviewSessionStarted = false;
    }
    if (statsSubjectFilter === id) statsSubjectFilter = ALL_SUBJECTS;

    renderSubjectSelect();
    renderSubjectManageList();
    renderStatsSubjectSelect();
    renderAll();
    if (el("view-review").classList.contains("is-active")) {
      startReviewSession();
    }
    if (el("view-stats").classList.contains("is-active")) renderStats();
  }

  function switchSubject(id, force) {
    const sentinel = isSentinelSubject(id);
    if ((id === currentSubjectId && !force) || (!sentinel && !subjects.some((s) => s.id === id))) return;
    currentSubjectId = id;
    localStorage.setItem(CURRENT_SUBJECT_KEY, id);

    // On repart d'une session de révision propre pour la nouvelle matière.
    reviewSessionStarted = false;
    reviewQueue = [];
    currentCard = null;
    isBonusMode = false;

    renderSubjectSelect();
    renderAll();

    if (el("view-review").classList.contains("is-active")) {
      startReviewSession();
    }
    if (el("view-stats").classList.contains("is-active")) {
      renderStats();
    }
  }

  subjectSelectEl.addEventListener("change", () => {
    if (subjectSelectEl.value === MULTI_SUBJECTS_ID) {
      // On n'active pas encore le mode "sélection" tant que le choix des
      // matières n'est pas confirmé — le select reste sur son ancienne
      // valeur en attendant (voir openMultiSubjectPicker/confirm).
      subjectSelectEl.value = currentSubjectId;
      openMultiSubjectPicker();
      return;
    }
    closeMultiSubjectPicker();
    switchSubject(subjectSelectEl.value);
  });

  /* ---------------------------------------------------------
     Sélection de plusieurs matières confondues (item 1)
  --------------------------------------------------------- */
  /** Construit récursivement l'arbre dossiers/matières dans le sélecteur
   *  multi-matières (item 1) : cocher un dossier inclut TOUTES les matières
   *  qu'il contient (y compris dans ses sous-dossiers), sans avoir besoin
   *  de les cocher une par une. */
  function renderFolderTreeForPicker(container, parentId, depth, selectedSubjectIds) {
    const childFolders = folders.filter((f) => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const childSubjects = subjects.filter((s) => s.folderId === parentId).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    childFolders.forEach((f) => {
      const ids = subjectIdsInFolder(f.id);
      const label = document.createElement("label");
      label.className = "multi-subject-picker-item";
      label.style.paddingLeft = `${depth * 18}px`;
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.kind = "folder";
      cb.value = f.id;
      cb.checked = ids.length > 0 && ids.every((id) => selectedSubjectIds.has(id));
      const span = document.createElement("span");
      span.textContent = `📁 ${f.name}`;
      label.appendChild(cb);
      label.appendChild(span);
      container.appendChild(label);
      renderFolderTreeForPicker(container, f.id, depth + 1, selectedSubjectIds);
    });
    childSubjects.forEach((s) => {
      const label = document.createElement("label");
      label.className = "multi-subject-picker-item";
      label.style.paddingLeft = `${depth * 18}px`;
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.kind = "subject";
      cb.value = s.id;
      cb.checked = selectedSubjectIds.has(s.id);
      const span = document.createElement("span");
      span.textContent = s.name;
      label.appendChild(cb);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  function openMultiSubjectPicker() {
    const picker = el("multi-subject-picker");
    const list = el("multi-subject-picker-list");
    if (!picker || !list) return;
    const selected = new Set(loadMultiSelection());
    list.innerHTML = "";
    renderFolderTreeForPicker(list, ROOT_FOLDER_ID, 0, selected);
    picker.hidden = false;
  }

  function closeMultiSubjectPicker() {
    const picker = el("multi-subject-picker");
    if (picker) picker.hidden = true;
  }

  const multiPickerCancelBtn = el("multi-subject-picker-cancel");
  if (multiPickerCancelBtn) {
    multiPickerCancelBtn.addEventListener("click", () => closeMultiSubjectPicker());
  }

  const multiPickerConfirmBtn = el("multi-subject-picker-confirm");
  if (multiPickerConfirmBtn) {
    multiPickerConfirmBtn.addEventListener("click", () => {
      const resultIds = new Set();
      document.querySelectorAll("#multi-subject-picker-list input:checked").forEach((cb) => {
        if (cb.dataset.kind === "folder") {
          subjectIdsInFolder(cb.value).forEach((id) => resultIds.add(id));
        } else {
          resultIds.add(cb.value);
        }
      });
      const checked = [...resultIds];
      if (checked.length === 0) {
        alert("Choisis au moins une matière ou un dossier.");
        return;
      }
      saveMultiSelection(checked);
      closeMultiSubjectPicker();
      renderSubjectSelect();
      switchSubject(MULTI_SUBJECTS_ID, true);
    });
  }

  if (cardsSubjectSelectEl) {
    cardsSubjectSelectEl.addEventListener("change", () => {
      switchSubject(cardsSubjectSelectEl.value);
    });
  }

  const cardsSearchInputEl = el("cards-search-input");
  if (cardsSearchInputEl) {
    cardsSearchInputEl.addEventListener("input", () => {
      cardsSearchQuery = cardsSearchInputEl.value.trim();
      renderManageList();
    });
  }

  manageAddSubjectBtn.addEventListener("click", async () => {
    const s = await createSubjectFlow();
    if (s) {
      switchSubject(s.id);
      renderSubjectManageList();
    }
  });

  importTargetSelect.addEventListener("change", async () => {
    if (importTargetSelect.value === "__new__") {
      const s = await createSubjectFlow();
      renderSubjectSelect();
      importTargetSelect.value = s ? s.id : currentSubjectId;
    }
  });

  function touch(card) {
    return { ...card, updatedAt: new Date().toISOString() };
  }

  /** Sauvegarde locale + tentative d'envoi vers Supabase si configuré. */
  async function persist(card) {
    await DB.put(card);
    if (Sync.isConfigured()) {
      Sync.pushCard(card).finally(updateSyncStatus);
    }
  }

  /** Répercute la version à jour d'une fiche partout où une copie ancienne
   *  pourrait encore traîner (la fiche affichée, et la file de révision en
   *  cours). Sans ça, `currentCard` et `reviewQueue` gardent l'instantané
   *  pris au début de la session : on se retrouve interrogé sur l'ancien
   *  contenu d'une fiche qu'on vient d'éditer, et une réponse donnée avec
   *  cet instantané périmé écrase ensuite la vraie mise à jour dans la base
   *  (elle "n'est pas enregistrée"). Ça couvre aussi le cas de deux appareils
   *  ouverts en même temps : une fiche notée sur l'un doit disparaître de la
   *  file de l'autre au lieu d'y être proposée une seconde fois.
   *  N'est volontairement PAS appelée depuis les fonctions de notation
   *  (rateScheduledCard / rateBonusCard), qui gèrent déjà `reviewQueue`
   *  elles-mêmes (shift/push), y compris pour "Encore" qui remet la fiche
   *  en fin de file même si elle n'est plus "due" au sens strict. */
  function syncCardEverywhere(updated) {
    if (currentCard && currentCard.id === updated.id) {
      currentCard = updated;
      if (el("view-review").classList.contains("is-active")) {
        renderQuestionText(currentCard);
        answerTextEl.textContent = currentCard.answer;
        updateRatingPreviews();
      }
    }

    const qIdx = reviewQueue.findIndex((c) => c.id === updated.id);
    if (qIdx >= 0) {
      const stillBelongsInQueue =
        !updated.deleted &&
        updated.subject === currentSubjectId &&
        SM2.isDue(updated);
      if (stillBelongsInQueue) {
        reviewQueue[qIdx] = updated;
      } else {
        reviewQueue.splice(qIdx, 1);
      }
    }
  }

  /* ---------------------------------------------------------
     Chargement / rafraîchissement des données
  --------------------------------------------------------- */
  function renderAll() {
    renderDuePill();
    renderManageList();
    renderStats();
    renderReviewChart();
    renderSubjectAlgoBadge();
  }

  /** Badge "mode d'apprentissage" de la matière active, affiché dans la
   *  barre déjà existante en haut (voir item 7) — jamais de ligne en plus.
   *  Libellé court (juste "Normal", pas "Apprentissage normal") : la place
   *  disponible à côté du sélecteur est trop réduite pour le nom complet,
   *  qui se faisait tronquer en "Apprentissage n…", peu lisible. */
  const ALGO_MODE_KEY_TO_CLASS = { cool: "is-cool", normal: "is-normal", renforce: "is-renforce", custom: "is-custom" };
  /** Rafraîchit tout ce qui dépend de la matière active en dehors de sa
   *  propre page : le nombre de fiches + bouton mode dans la barre de
   *  Réviser (item 1, mêmes couleurs que le curseur du mode d'apprentissage
   *  — voir ALGO_MODE_COLORS), et le récapitulatif d'export/import dans
   *  Réglages (item 6). */
  /** `cardSubjectId` (optionnel) : quand on révise "toutes matières" ou une
   *  "sélection", chaque fiche affichée a sa propre matière — c'est ELLE
   *  qui doit déterminer le mode affiché/édité par le bouton, pas la
   *  sélection globale (item 2). Sans cet argument (autres pages, ou mode
   *  normal), on retombe sur `currentSubjectId` comme avant. */
  function renderSubjectAlgoBadge(cardSubjectId) {
    const sentinel = isSentinelSubject(currentSubjectId);
    const n = currentSubjectId ? subjectCards().length : 0;
    const effectiveSubjectId = sentinel && cardSubjectId ? cardSubjectId : currentSubjectId;

    if (subjectBarCountEl) subjectBarCountEl.textContent = `${n} fiche${n > 1 ? "s" : ""}`;
    // Un vrai identifiant de matière (jamais un sentinel) est toujours
    // disponible dès qu'une fiche est affichée à l'écran — le bouton reste
    // donc visible et utile même en mode "toutes matières"/"sélection".
    const showBtn = !sentinel || !!cardSubjectId;
    if (subjectBarAlgoBtn) subjectBarAlgoBtn.hidden = !showBtn;
    if (showBtn && effectiveSubjectId) {
      const key = getSubjectAlgoMode(effectiveSubjectId);
      if (subjectBarAlgoLabelEl) subjectBarAlgoLabelEl.textContent = modeDisplayName(key);
      if (subjectBarAlgoBtn) {
        Object.values(ALGO_MODE_KEY_TO_CLASS).forEach((c) => subjectBarAlgoBtn.classList.remove(c));
        subjectBarAlgoBtn.classList.add(ALGO_MODE_KEY_TO_CLASS[algoModeCssKey(key)]);
        subjectBarAlgoBtn.dataset.subjectId = effectiveSubjectId;
      }
    }

    const ioName = el("settings-io-subject-name");
    const ioCount = el("settings-io-count");
    if (ioName) ioName.textContent = subjectName(currentSubjectId);
    if (ioCount) ioCount.textContent = String(n);
  }

  if (subjectBarAlgoBtn) {
    subjectBarAlgoBtn.addEventListener("click", () => {
      // En mode "toutes matières"/"sélection", `dataset.subjectId` porte la
      // vraie matière de la fiche actuellement affichée (voir
      // renderSubjectAlgoBadge) ; sinon, la matière active classique.
      const targetId = subjectBarAlgoBtn.dataset.subjectId || currentSubjectId;
      if (targetId && !isSentinelSubject(targetId)) openSubjectAlgoView(targetId, "review");
    });
  }

  /** Toutes les fiches non supprimées de la matière actuellement active —
   *  gère aussi les deux modes "toutes matières" / "sélection de matières"
   *  (item 1), chaque fiche gardant alors le mode d'apprentissage de SA
   *  propre matière (voir computeAlgoNext, qui utilise card.subject). */
  function subjectCards() {
    if (currentSubjectId === ALL_SUBJECTS_ID) {
      return cards.filter((c) => !c.deleted);
    }
    if (currentSubjectId === MULTI_SUBJECTS_ID) {
      const set = new Set(loadMultiSelection());
      return cards.filter((c) => !c.deleted && set.has(c.subject));
    }
    return cards.filter((c) => !c.deleted && c.subject === currentSubjectId);
  }

  function dueCards() {
    return subjectCards().filter((c) => SM2.isDue(c));
  }

  function renderDuePill() {
    const due = dueCards().length;
    dueCountEl.textContent = String(due);

    // Dès que le compteur atteint 0, la pastille passe en blanc (comme en
    // mode bonus) — que l'on soit ou non dans une session de révision.
    if (isBonusMode || due === 0) {
      duePillEl.classList.add("is-bonus");
      duePillEl.style.removeProperty("background");
      duePillEl.style.removeProperty("color");
      return;
    }

    duePillEl.classList.remove("is-bonus");
    const total = subjectCards().length;
    const fraction = total === 0 ? 0 : due / total;
    const hue = Math.round(120 - 120 * Math.min(1, Math.max(0, fraction)));
    duePillEl.style.background = `hsl(${hue}, 62%, 42%)`;
    duePillEl.style.color = "var(--paper)";
  }

  /* ---------------------------------------------------------
     Vue Réviser
  --------------------------------------------------------- */
  function startReviewSession() {
    reviewSessionStarted = true;
    reviewQueue = shuffle(dueCards());
    sessionTotalDue = reviewQueue.length;
    showNextCard();
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Reprend la fiche affichée depuis `cards` (après édition/sync ailleurs) sans changer de fiche ni remélanger la file. */
  function syncCurrentCardFromStore() {
    if (!currentCard) return;
    const fresh = cards.find((c) => c.id === currentCard.id && !c.deleted);
    if (!fresh) {
      if (!isBonusMode) {
        reviewQueue = reviewQueue.filter((c) => c.id !== currentCard.id);
      }
      showNextCard();
      return;
    }
    currentCard = fresh;
    renderQuestionText(currentCard);
    answerTextEl.textContent = currentCard.answer;
    updateRatingPreviews();
  }

  /** Repère, parmi les prochaines échéances de `pool`, le jour calendaire
   *  qui concentre le plus de fiches (la barre la plus haute du graphique).
   *  Renvoie le timestamp (00:00) de ce jour, ou null si aucun jour ne
   *  ressort (pas d'échéance future, ou aucun jour avec plus d'une fiche). */
  function findBusiestUpcomingDay(pool) {
    const counts = new Map();
    for (const c of pool) {
      if (!c.dueDate) continue;
      const day = startOfDay(new Date(c.dueDate)).getTime();
      counts.set(day, (counts.get(day) || 0) + 1);
    }
    let bestDay = null;
    let bestCount = 1; // on ne "lisse" que s'il y a un vrai pic (>= 2 fiches)
    for (const [day, count] of counts) {
      if (count > bestCount) {
        bestCount = count;
        bestDay = day;
      }
    }
    return bestDay;
  }

  /** Mode bonus : pioche en priorité parmi les fiches du jour le plus chargé
   *  à venir, pour lisser la charge de révision future. Si aucun pic net ne
   *  se dégage, on retombe sur un tirage aléatoire classique sur toute la
   *  matière. */
  function pickRandomBonusCard(pool, excludeId) {
    const busiestDay = findBusiestUpcomingDay(pool);
    if (busiestDay !== null) {
      const fromBusiestDay = pool.filter(
        (c) => c.dueDate && startOfDay(new Date(c.dueDate)).getTime() === busiestDay
      );
      const filtered =
        fromBusiestDay.length > 1
          ? fromBusiestDay.filter((c) => c.id !== excludeId)
          : fromBusiestDay;
      if (filtered.length > 0) {
        return filtered[Math.floor(Math.random() * filtered.length)];
      }
    }

    const candidates =
      pool.length > 1 ? pool.filter((c) => c.id !== excludeId) : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function showNextCard() {
    isFlipped = false;
    flipCardEl.classList.remove("is-flipped");

    if (reviewQueue.length > 0) {
      isBonusMode = false;
      currentCard = reviewQueue[0];
      emptyStateEl.hidden = true;
      cardStackEl.hidden = false;
      editCurrentBtn.hidden = false;
      if (hibernateCurrentBtn) hibernateCurrentBtn.hidden = false;
      // Les boutons d'évaluation restent affichés en permanence (côté
      // question comme côté réponse) : on ne les cache plus au retournement.
      ratingRowEl.hidden = false;
      renderQuestionText(currentCard);
      answerTextEl.textContent = currentCard.answer;

      const doneToday = sessionTotalDue - reviewQueue.length;
      reviewProgressEl.textContent = `${doneToday}/${sessionTotalDue} fiches revues aujourd'hui`;

      updateRatingPreviews();
      renderDuePill();
      renderReviewChart();
      return;
    }

    // Plus rien de programmé pour aujourd'hui.
    const pool = subjectCards();
    if (pool.length === 0) {
      isBonusMode = false;
      currentCard = null;
      emptyStateEl.hidden = false;
      cardStackEl.hidden = true;
      editCurrentBtn.hidden = true;
      if (hibernateCurrentBtn) hibernateCurrentBtn.hidden = true;
      ratingRowEl.hidden = true;
      reviewProgressEl.textContent = "";
      renderDuePill();
      renderReviewChart();
      return;
    }

    // Mode bonus : on continue avec des fiches piochées au hasard. Le
    // popup de bascule ne doit s'afficher qu'une fois, à l'entrée en
    // révision libre — pas à chaque nouvelle fiche piochée une fois dedans.
    const enteringBonusMode = !isBonusMode;
    isBonusMode = true;
    currentCard = pickRandomBonusCard(pool, currentCard ? currentCard.id : null);
    emptyStateEl.hidden = true;
    cardStackEl.hidden = false;
    editCurrentBtn.hidden = false;
    if (hibernateCurrentBtn) hibernateCurrentBtn.hidden = false;
    ratingRowEl.hidden = false;
    renderQuestionText(currentCard);
    answerTextEl.textContent = currentCard.answer;
    reviewProgressEl.textContent = "Fiches du jour terminées — révision libre";
    if (enteringBonusMode) {
      showToast("🔁 Fiches du jour terminées — passage en révision libre");
    }

    updateRatingPreviews();
    renderDuePill();
    renderReviewChart();
  }

  function updateRatingPreviews() {
    if (!currentCard) return;
    if (isBonusMode) {
      el("sub-again").textContent =
        bonusAgainMode === "increment" ? "+1 j" : "→ demain";
      el("sub-hard").textContent = `+${bonusDaysSettings.hard} j`;
      el("sub-good").textContent = `+${bonusDaysSettings.good} j`;
      el("sub-easy").textContent = `+${bonusDaysSettings.easy} j`;
      return;
    }
    el("sub-again").textContent = "< 1 j";
    const previews = {};
    for (const rating of ["again", "hard", "good", "easy"]) {
      const next = computeAlgoNext(currentCard, rating, currentCard.subject);
      previews[rating] = formatInterval(next.interval);
    }
    el("sub-again").textContent = previews.again;
    el("sub-hard").textContent = previews.hard;
    el("sub-good").textContent = previews.good;
    el("sub-easy").textContent = previews.easy;
  }

  function formatInterval(days) {
    if (days < 1) return "< 1 j";
    // Toujours en jours, même au-delà d'1 mois — demandé explicitement
    // (item 3) : convertir en mois/ans faisait perdre en précision visuelle
    // exactement là où l'écart entre Encore/Difficile/Bien/Facile compte le
    // plus (voir aussi la correction de l'algorithme SM-2 plus haut).
    return `${Math.round(days)} j`;
  }

  let editReturnToReview = false;

  editCurrentBtn.addEventListener("click", () => {
    if (!currentCard) return;
    editReturnToReview = true;
    enterEditMode(currentCard);
    document.querySelector('.tab[data-view="cards"]').click();
    inputQuestion.focus();
  });

  flipCardEl.addEventListener("click", () => {
    if (!currentCard) return;
    isFlipped = !isFlipped;
    flipCardEl.classList.toggle("is-flipped", isFlipped);
  });

  ratingRowEl.addEventListener("click", async (e) => {
    const btn = e.target.closest(".stamp");
    if (!btn || !currentCard) return;
    const rating = btn.dataset.rating;
    await rateCurrentCard(rating);
  });

  async function rateCurrentCard(rating) {
    if (isBonusMode) {
      await rateBonusCard(rating);
    } else {
      await rateScheduledCard(rating);
    }
    showNextCard();
  }

  async function rateScheduledCard(rating) {
    const next = computeAlgoNext(currentCard, rating, currentCard.subject);
    const updated = touch({
      ...currentCard,
      ...next,
      lastReviewed: new Date().toISOString(),
      reviewCount: (currentCard.reviewCount || 0) + 1,
    });
    trackCardInterval(updated, updated.interval);
    await persist(updated);

    const idx = cards.findIndex((c) => c.id === updated.id);
    if (idx >= 0) cards[idx] = updated;

    reviewQueue.shift();
    // "Encore" remet la fiche en fin de file pour cette session
    if (rating === "again") {
      reviewQueue.push(updated);
    }

    renderStats();
    renderManageList();
  }

  /** Calcule la nouvelle échéance quand on répond "Encore" en mode bonus,
   *  selon le réglage choisi :
   *   - "fixed"     : toujours le lendemain (date fixe), quelle que soit
   *                   l'échéance actuelle de la fiche.
   *   - "increment" : un jour de plus par rapport à l'échéance actuelle de
   *                   la fiche (ou à aujourd'hui si elle est déjà passée) —
   *                   plusieurs "Encore" successifs éloignent donc la fiche
   *                   un peu plus à chaque fois. */
  function nextBonusAgainDueDate(card, today) {
    if (bonusAgainMode === "increment") {
      const base = card.dueDate ? startOfDay(new Date(card.dueDate)) : today;
      const start = base.getTime() > today.getTime() ? base : today;
      const due = new Date(start);
      due.setDate(due.getDate() + 1);
      return due;
    }
    const due = new Date(today);
    due.setDate(due.getDate() + 1);
    return due;
  }

  /** Mode bonus (révision libre) : la date d'interrogation est reculée à partir
   *  de la prochaine interrogation déjà programmée pour cette fiche (et non à
   *  partir d'aujourd'hui), pour ne pas raccourcir l'intervalle d'une fiche
   *  révisée en avance. Si cette échéance est déjà passée (fiche en retard),
   *  on repart d'aujourd'hui. "Encore" recule la fiche d'au moins un jour
   *  (voir nextBonusAgainDueDate), sans toucher au facteur de facilité SM-2 —
   *  elle n'est donc plus jamais remise à "due aujourd'hui" par erreur. */
  async function rateBonusCard(rating) {
    const today = startOfDay(new Date());
    let due;

    if (rating === "again") {
      due = nextBonusAgainDueDate(currentCard, today);
    } else {
      const bonusDays = bonusDaysSettings[rating];
      if (bonusDays === undefined) return;
      const scheduledDue = currentCard.dueDate ? startOfDay(new Date(currentCard.dueDate)) : today;
      const base = scheduledDue.getTime() > today.getTime() ? scheduledDue : today;
      due = new Date(base);
      due.setDate(due.getDate() + bonusDays);
    }

    const updated = touch({
      ...currentCard,
      interval: Math.round((due.getTime() - today.getTime()) / 86400000),
      dueDate: due.toISOString(),
      lastReviewed: new Date().toISOString(),
      reviewCount: (currentCard.reviewCount || 0) + 1,
    });
    trackCardInterval(updated, updated.interval);
    await persist(updated);

    const idx = cards.findIndex((c) => c.id === updated.id);
    if (idx >= 0) cards[idx] = updated;

    // Comportement bizarre corrigé : si malgré tout la fiche redevient due
    // aujourd'hui (ou reste en retard), on la remet dans la file normale au
    // lieu de rester en mode bonus avec un compteur "à revoir" qui n'est
    // plus à zéro.
    if (SM2.isDue(updated)) {
      reviewQueue.push(updated);
      sessionTotalDue += 1;
    }

    renderStats();
    renderManageList();
  }

  /** Bouton "hibernation" : repousse la prochaine interrogation d'une fiche
   *  de plusieurs jours (réglable) sans que ça compte comme une révision —
   *  ni passage par SM-2, ni lastReviewed touché. Fonctionne aussi bien en
   *  file normale qu'en mode bonus. */
  async function hibernateCurrentCard() {
    const card = currentCard;
    if (!card) return;
    const today = startOfDay(new Date());
    const base = card.dueDate ? startOfDay(new Date(card.dueDate)) : today;
    const start = base.getTime() > today.getTime() ? base : today;
    const due = new Date(start);
    due.setDate(due.getDate() + hibernateDays);

    const updated = touch({
      ...card,
      dueDate: due.toISOString(),
      interval: Math.round((due.getTime() - today.getTime()) / 86400000),
    });
    await persist(updated);

    const idx = cards.findIndex((c) => c.id === updated.id);
    if (idx >= 0) cards[idx] = updated;

    reviewQueue = reviewQueue.filter((c) => c.id !== updated.id);
    renderStats();
    renderManageList();
    renderDuePill();
    showNextCard();
  }

  if (hibernateCurrentBtn) {
    hibernateCurrentBtn.addEventListener("click", async () => {
      if (!currentCard) return;
      // Confirmation avec explication : le nombre de jours vient du réglage
      // (potentiellement modifié par la personne), donc on l'affiche
      // explicitement plutôt que de supposer qu'elle s'en souvient.
      const msg =
        `Mettre cette fiche en hibernation ?\n\n` +
        `Sa prochaine interrogation sera repoussée de ${hibernateDays} jour${hibernateDays > 1 ? "s" : ""} ` +
        `(réglable dans Réglages), sans compter comme une révision — ni le calcul d'échéance, ni le statut de la fiche ne changent, elle est juste mise de côté pour plus tard.`;
      if (!confirm(msg)) return;
      await hibernateCurrentCard();
    });
  }

  /* ---------------------------------------------------------
     Vue Gérer : formulaire + liste
  --------------------------------------------------------- */
  cardForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = inputQuestion.value.trim();
    const answer = inputAnswer.value.trim();
    if (!question || !answer) return;

    if (editingId) {
      const idx = cards.findIndex((c) => c.id === editingId);
      if (idx >= 0) {
        const updated = touch({ ...cards[idx], question, answer });
        await persist(updated);
        cards[idx] = updated;
        syncCardEverywhere(updated);
      }
      exitEditMode();
    } else {
      const card = newCard(question, answer);
      await persist(card);
      cards.push(card);
    }

    cardForm.reset();
    renderAll();

    if (editReturnToReview) {
      editReturnToReview = false;
      document.querySelector('.tab[data-view="review"]').click();
    } else if (!currentCard) {
      startReviewSession();
    }
  });

  cancelEditBtn.addEventListener("click", () => {
    editReturnToReview = false;
    exitEditMode();
    cardForm.reset();
  });

  function enterEditMode(card) {
    editingId = card.id;
    inputQuestion.value = card.question;
    inputAnswer.value = card.answer;
    submitBtn.textContent = "Enregistrer les modifications";
    cancelEditBtn.hidden = false;
    inputQuestion.focus();
  }

  function exitEditMode() {
    editingId = null;
    submitBtn.textContent = "Ajouter à la pile";
    cancelEditBtn.hidden = true;
  }

  let cardsSearchQuery = "";

  function renderManageList() {
    let visible = subjectCards();
    if (cardsSearchQuery) {
      const q = cardsSearchQuery.toLowerCase();
      visible = visible.filter(
        (c) => c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q)
      );
    }
    totalCountEl.textContent = String(visible.length);
    cardListEl.innerHTML = "";
    renderSubjectManageList();

    if (visible.length === 0) {
      const li = document.createElement("li");
      li.className = "list-empty";
      li.textContent = cardsSearchQuery
        ? "Aucune fiche ne correspond à cette recherche."
        : "Aucune fiche pour l'instant. Ajoute la première ci-dessus.";
      cardListEl.appendChild(li);
      return;
    }

    const sorted = [...visible].sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    );

    for (const card of sorted) {
      const li = document.createElement("li");
      li.className = "card-row";

      const main = document.createElement("div");
      main.className = "card-row-main";

      const q = document.createElement("p");
      q.className = "card-row-q";
      q.textContent = card.question;

      const a = document.createElement("p");
      a.className = "card-row-a";
      a.textContent = card.answer;

      const meta = document.createElement("p");
      meta.className = "card-row-meta";
      meta.textContent = SM2.isDue(card)
        ? "à revoir aujourd'hui"
        : `prochaine question dans ${formatInterval(daysUntil(card.dueDate))}`;

      main.appendChild(q);
      main.appendChild(a);
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "icon-btn";
      editBtn.type = "button";
      editBtn.textContent = "éditer";
      editBtn.addEventListener("click", () => enterEditMode(card));

      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn icon-btn--danger";
      delBtn.type = "button";
      delBtn.textContent = "suppr.";
      delBtn.addEventListener("click", () => deleteCard(card.id));

      actions.appendChild(editBtn);

      if (subjects.length > 1) {
        const moveSelect = document.createElement("select");
        moveSelect.className = "icon-btn card-row-move";
        moveSelect.title = "Déplacer vers une autre matière";
        moveSelect.innerHTML =
          `<option value="">déplacer…</option>` +
          subjects
            .filter((s) => s.id !== card.subject)
            .map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`)
            .join("");
        moveSelect.addEventListener("change", async () => {
          if (!moveSelect.value) return;
          await moveCardToSubject(card.id, moveSelect.value);
        });
        actions.appendChild(moveSelect);
      }

      actions.appendChild(delBtn);

      li.appendChild(actions);
      li.appendChild(main);
      cardListEl.appendChild(li);
    }
  }

  function daysUntil(dueDateIso) {
    const ms = new Date(dueDateIso).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86400000));
  }

  /** Reclasse manuellement une fiche vers une autre matière (utile pour
   *  corriger un classement erroné, ex. après une synchronisation). */
  async function moveCardToSubject(id, newSubjectId) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.subject === newSubjectId) return;
    const updated = touch({ ...card, subject: newSubjectId });
    await persist(updated);

    const idx = cards.findIndex((c) => c.id === id);
    if (idx >= 0) cards[idx] = updated;
    reviewQueue = reviewQueue.filter((c) => c.id !== id);
    if (currentCard && currentCard.id === id) {
      showNextCard();
    }
    renderAll();
  }

  async function deleteCard(id) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    const updated = touch({ ...card, deleted: true });
    await persist(updated);

    const idx = cards.findIndex((c) => c.id === id);
    if (idx >= 0) cards[idx] = updated;
    reviewQueue = reviewQueue.filter((c) => c.id !== id);
    if (currentCard && currentCard.id === id) {
      showNextCard();
    }
    renderAll();
  }

  /* ---------------------------------------------------------
     Import / export JSON
  --------------------------------------------------------- */
  exportBtn.addEventListener("click", () => {
    const subj = subjects.find((s) => s.id === currentSubjectId);
    const blob = new Blob([JSON.stringify(subjectCards(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (subj ? subj.name : "fiches")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    a.download = `fiches-${slug || "export"}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      let targetId = importTargetSelect.value;
      if (targetId === "__new__" || !subjects.some((s) => s.id === targetId)) {
        targetId = currentSubjectId;
      }

      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Format inattendu");

      // Chaque import crée de nouvelles fiches avec de nouveaux identifiants :
      // rien parmi les fiches déjà présentes n'est jamais modifié ni supprimé.
      const normalized = imported.map((item) =>
        touch({
          ...newCard(item.question ?? "", item.answer ?? "", targetId),
          ...item,
          id: uid(),
          subject: targetId,
        })
      );

      await DB.bulkPut(normalized);
      cards.push(...normalized);
      if (Sync.isConfigured()) {
        for (const card of normalized) {
          Sync.pushCard(card);
        }
      }
      renderAll();
      if (targetId === currentSubjectId) {
        startReviewSession();
      }
      alert(`${normalized.length} fiche(s) ajoutée(s) à « ${subjectName(targetId)} ». Les fiches existantes n'ont pas été touchées.`);
    } catch (err) {
      alert("Import impossible : le fichier ne semble pas être un export valide.");
    } finally {
      importInput.value = "";
      importTargetSelect.value = currentSubjectId;
    }
  });

  /* ---------------------------------------------------------
     Vue Stats
  --------------------------------------------------------- */
  function renderStatsSubjectSelect() {
    if (!statsSubjectSelectEl) return;
    const prev = statsSubjectSelectEl.value || statsSubjectFilter;
    statsSubjectSelectEl.innerHTML =
      `<option value="${ALL_SUBJECTS}">Toutes catégories confondues</option>` +
      subjects
        .map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`)
        .join("");
    const valid = prev === ALL_SUBJECTS || subjects.some((s) => s.id === prev);
    statsSubjectFilter = valid ? prev : ALL_SUBJECTS;
    statsSubjectSelectEl.value = statsSubjectFilter;
  }

  /** Fiches (non supprimées) dans le périmètre choisi pour l'onglet Stats. */
  function statsScopeCards() {
    if (statsSubjectFilter === ALL_SUBJECTS) {
      return cards.filter((c) => !c.deleted);
    }
    return cards.filter((c) => !c.deleted && c.subject === statsSubjectFilter);
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Construit un bucket "fiches dues" par jour calendaire, du jour présent
   *  à `days - 1` jours plus tard. Les fiches en retard (dueDate passée)
   *  sont comptées dans le bucket d'aujourd'hui. */
  function computeDueHistogram(pool, days) {
    const today = startOfDay(new Date());
    const buckets = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      buckets.push({ date: d, count: 0 });
    }
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + days);

    for (const c of pool) {
      if (!c.dueDate) continue;
      const due = new Date(c.dueDate);
      if (due.getTime() < today.getTime()) {
        buckets[0].count += 1; // en retard -> comptée aujourd'hui
        continue;
      }
      if (due.getTime() >= horizon.getTime()) continue; // hors période affichée
      const dueDay = startOfDay(due);
      const offset = Math.round((dueDay.getTime() - today.getTime()) / 86400000);
      if (offset >= 0 && offset < days) buckets[offset].count += 1;
    }
    return buckets;
  }

  const MONTH_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  function formatShortDateLabel(date) {
    return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
  }

  /** Largeur de contenu réellement disponible dans une carte d'histogramme
   *  (clientWidth moins le padding horizontal), utilisée pour calculer la
   *  largeur de colonne qui fait tenir exactement N jours à l'écran. */
  function chartAvailableWidth(wrapEl) {
    if (!wrapEl || !wrapEl.clientWidth) return 300;
    const style = getComputedStyle(wrapEl);
    const paddingL = parseFloat(style.paddingLeft) || 0;
    const paddingR = parseFloat(style.paddingRight) || 0;
    return Math.max(60, wrapEl.clientWidth - paddingL - paddingR);
  }

  /** Dessine un histogramme "fiches dues par jour" dans les éléments fournis.
   *  Factorisé pour être partagé entre le grand graphique de l'onglet Stats
   *  et le mini graphique de la page Réviser (matière en cours). */
  function renderHistogramInto(chartEl, emptyEl, wrapEl, pool, rangeKey, maxBarPx) {
    if (!chartEl) return;
    const cfg = RANGE_CONFIG[rangeKey] || { visible: rangeKey, total: rangeKey };
    const days = cfg.total;
    const buckets = computeDueHistogram(pool, days);
    const max = Math.max(0, ...buckets.map((b) => b.count));

    // Compte précédent par jour (mémorisé sur l'élément lui-même) : sert à
    // repérer, après un nouveau rendu, quelles colonnes ont réellement changé
    // de valeur pour leur appliquer un bref flash — sans ça, un déplacement
    // d'une fiche d'un jour à l'autre (même hauteur de barre des deux côtés)
    // passe complètement inaperçu dans le mini graphique.
    const prevCounts = chartEl._prevCounts || null;

    chartEl.innerHTML = "";
    if (max === 0) {
      if (emptyEl) emptyEl.hidden = false;
      if (wrapEl) wrapEl.hidden = true;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (wrapEl) wrapEl.hidden = false;

    // L'échelle (dénominateur utilisé pour la hauteur des barres) est arrondie
    // au multiple de 5 supérieur plutôt que de coller exactement au maximum
    // du jour. Sans ça, noter UNE SEULE fiche peut changer le total le plus
    // élevé (ex. 7 -> 6) et donc redessiner TOUTES les barres à une nouvelle
    // échelle, même celles dont le nombre de fiches n'a pas bougé — ce qui
    // donnait l'impression que plusieurs barres changent en même temps. En
    // arrondissant par palier de 5, une petite variation reste dans le même
    // palier et seules les barres réellement concernées bougent.
    const scaleMax = Math.max(5, Math.ceil(max / 5) * 5);

    // Au-delà d'1 mois affiché à l'écran (échelles 3 mois / 6 mois / 1 an),
    // il y a trop de colonnes pour qu'un espace entre chaque barre reste
    // visible : les barres finissent par disparaître entre les espaces. On
    // les fait donc se toucher, et on retire les nombres qui n'ont de toute
    // façon plus la place de s'afficher lisiblement. Basé sur le nombre de
    // colonnes VISIBLES à l'écran (cfg.visible), pas sur le total chargé
    // (cfg.total) qui sert uniquement au défilement.
    const dense = cfg.visible > 31;
    chartEl.classList.toggle("chart--dense", dense);

    // Largeur de colonne calculée pour que exactement `cfg.visible` colonnes
    // tiennent sur la largeur visible de la carte (le nombre de colonnes
    // réellement dessinées, `cfg.total`, déborde ensuite hors écran et se
    // parcourt au doigt via overflow-x sur wrapEl). Fixé en `px` inline
    // plutôt que par classe CSS pour ne jamais dépendre de l'ordre des
    // règles dans la feuille de style (voir les soucis de spécificité passés
    // avec les classes .chart--mini / .chart--dense).
    const gapPx = dense ? 0 : 2;
    const availPx = chartAvailableWidth(wrapEl || chartEl);
    // Largeur minimale volontairement très faible (pas 3-4px) : sur les
    // échelles les plus zoomées (6 mois / 1 an), faire tenir 180 ou 360
    // colonnes sur un écran de ~330px de large exige des colonnes
    // sub-pixel — les navigateurs les anti-aliassent très bien (elles se
    // fondent en une bande de densité, ce qui est justement l'effet
    // recherché à ces échelles). Un plancher plus haut (ex. 3px) ferait
    // largement déborder le total hors de la largeur d'écran visée.
    const colWidth = Math.max(0.6, (availPx - gapPx * (cfg.visible - 1)) / cfg.visible);
    chartEl.style.gap = `${gapPx}px`;

    // Les dates par colonne ont été retirées (trop de bruit visuel) : seul
    // "Auj." reste, sur la première colonne. L'échelle affichée (15 j, 1
    // mois...) est indiquée ailleurs (étiquette au-dessus du graphique),
    // donc pas besoin de répéter chaque date individuelle ici.
    const frag = document.createDocumentFragment();
    buckets.forEach((b, i) => {
      const changed = prevCounts !== null && prevCounts[i] !== b.count;
      const col = document.createElement("div");
      col.className =
        "chart-col" + (i === 0 ? " is-today" : "") + (changed ? " chart-col--changed" : "");
      col.style.flex = `0 0 ${colWidth}px`;
      col.style.width = `${colWidth}px`;

      const value = document.createElement("span");
      value.className = "chart-value";
      value.textContent = dense ? "" : b.count > 0 ? String(b.count) : "";

      const bar = document.createElement("div");
      bar.className = "chart-bar" + (b.count === 0 ? " chart-bar--zero" : "");
      // Les jours à zéro fiche gardent une petite barre témoin (couleur neutre)
      // pour rester visibles dans la grille, plutôt que de disparaître.
      const height =
        b.count === 0 ? 3 : Math.max(3, Math.round((b.count / scaleMax) * maxBarPx));
      bar.style.height = `${height}px`;

      const label = document.createElement("span");
      label.className = "chart-label";
      // "Auj." prioritaire sur la colonne d'aujourd'hui ; sinon, repères de
      // date à date fixe pour se répérer dans le défilement : le 1er ET le
      // 15 du mois sur les échelles rapprochées (15j / 1 mois), seulement
      // le 1er du mois sur les échelles larges (3 mois / 6 mois / 1 an) où
      // le 15 ajouterait surtout du bruit visuel vu la densité des colonnes.
      if (i === 0) {
        label.textContent = "Auj.";
      } else {
        const dom = b.date.getDate();
        const fineScale = rangeKey === 15 || rangeKey === 30;
        const coarseScale = rangeKey === 90 || rangeKey === 365;
        if ((fineScale && (dom === 1 || dom === 15)) || (coarseScale && dom === 1)) {
          label.textContent = formatShortDateLabel(b.date);
        } else {
          label.textContent = "";
        }
      }

      col.appendChild(value);
      col.appendChild(bar);
      col.appendChild(label);

      frag.appendChild(col);
    });
    chartEl.appendChild(frag);
    chartEl._prevCounts = buckets.map((b) => b.count);
  }

  function renderDueChart() {
    const pool = statsScopeCards();
    renderHistogramInto(dueChartEl, chartEmptyEl, el("chart-wrap"), pool, statsRangeDays, CHART_MAX_BAR_PX);
    if (statsRangeSelectEl) statsRangeSelectEl.value = String(statsRangeDays);
  }

  /** Tape sur l'histogramme de la page Stats : passe à l'échelle
   *  supérieure (boucle), comme sur le mini graphique de la page Réviser
   *  (voir cycleReviewChartRange) — et met à jour le menu déroulant
   *  au-dessus pour rester cohérent avec l'échelle réellement affichée. */
  function cycleStatsChartRange() {
    const idx = REVIEW_CHART_STEPS.indexOf(statsRangeDays);
    statsRangeDays = REVIEW_CHART_STEPS[(idx + 1) % REVIEW_CHART_STEPS.length];
    renderDueChart();
  }
  const statsChartWrapEl = el("chart-wrap");
  if (statsChartWrapEl) statsChartWrapEl.addEventListener("click", cycleStatsChartRange);

  /** Fiches (de `pool`) dont la dernière révision remonte à aujourd'hui. */
  function reviewedTodayCount(pool) {
    const today = startOfDay(new Date()).getTime();
    return pool.filter((c) => {
      if (!c.lastReviewed) return false;
      return startOfDay(new Date(c.lastReviewed)).getTime() === today;
    }).length;
  }

  function renderStats() {
    renderStatsSubjectSelect();
    const pool = statsScopeCards();
    statTotal.textContent = String(pool.length);
    if (statReviewedToday) statReviewedToday.textContent = String(reviewedTodayCount(pool));
    renderDueChart();
  }

  /** Affiche un message de confirmation bien visible, en bas d'écran. */
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3400);
  }

  statsSubjectSelectEl.addEventListener("change", () => {
    statsSubjectFilter = statsSubjectSelectEl.value;
    renderStats();
  });

  statsRangeSelectEl.addEventListener("change", () => {
    statsRangeDays = Number(statsRangeSelectEl.value) || 15;
    renderDueChart();
  });

  /* ---------------------------------------------------------
     Mini histogramme de la page Réviser (matière en cours)
  --------------------------------------------------------- */
  function formatRangeShort(days) {
    switch (days) {
      case 15: return "15 j";
      case 30: return "1 mois";
      case 90: return "3 mois";
      case 365: return "1 an";
      default: return `${days} j`;
    }
  }

  function renderReviewChart() {
    if (!reviewChartEl) return;
    if (reviewChartSubjectNameEl) reviewChartSubjectNameEl.textContent = subjectName(currentSubjectId);
    if (reviewChartScaleLabelEl) reviewChartScaleLabelEl.textContent = formatRangeShort(reviewChartRangeDays);
    const pool = subjectCards();
    renderHistogramInto(
      reviewChartEl,
      reviewChartEmptyEl,
      reviewChartWrapEl,
      pool,
      reviewChartRangeDays,
      REVIEW_CHART_MAX_BAR_PX
    );
  }

  /** Tape sur le mini graphique : passe à l'échelle supérieure (boucle). */
  function cycleReviewChartRange() {
    const idx = REVIEW_CHART_STEPS.indexOf(reviewChartRangeDays);
    reviewChartRangeDays = REVIEW_CHART_STEPS[(idx + 1) % REVIEW_CHART_STEPS.length];
    renderReviewChart();
  }

  if (reviewChartToggleEl) reviewChartToggleEl.addEventListener("click", cycleReviewChartRange);
  if (reviewChartWrapEl) reviewChartWrapEl.addEventListener("click", cycleReviewChartRange);

  /* ---------------------------------------------------------
     Réglages : recul (en jours) du mode bonus
  --------------------------------------------------------- */
  function clampBonusDays(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1) return fallback;
    return Math.min(365, Math.round(n));
  }

  function loadBonusDaysSettings() {
    try {
      const raw = localStorage.getItem(BONUS_DAYS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        bonusDaysSettings = {
          hard: clampBonusDays(parsed.hard, DEFAULT_BONUS_DAYS.hard),
          good: clampBonusDays(parsed.good, DEFAULT_BONUS_DAYS.good),
          easy: clampBonusDays(parsed.easy, DEFAULT_BONUS_DAYS.easy),
        };
      }
    } catch {
      bonusDaysSettings = { ...DEFAULT_BONUS_DAYS };
    }
  }

  const APP_SETTINGS_TS_KEY = "fiches_settings_ts";

  /** Horodatage de la dernière modification locale des réglages — permet,
   *  à la synchro, de savoir si les réglages distants sont plus récents
   *  (et doivent donc être appliqués ici) ou l'inverse. */
  function touchAppSettingsTimestamp() {
    localStorage.setItem(APP_SETTINGS_TS_KEY, new Date().toISOString());
  }

  function getAppSettingsTimestamp() {
    return localStorage.getItem(APP_SETTINGS_TS_KEY) || new Date(0).toISOString();
  }

  function saveBonusDaysSettings() {
    localStorage.setItem(BONUS_DAYS_KEY, JSON.stringify(bonusDaysSettings));
    touchAppSettingsTimestamp();
  }

  function loadBonusAgainMode() {
    const raw = localStorage.getItem(BONUS_AGAIN_MODE_KEY);
    bonusAgainMode = raw === "increment" ? "increment" : DEFAULT_BONUS_AGAIN_MODE;
  }

  function saveBonusAgainMode() {
    localStorage.setItem(BONUS_AGAIN_MODE_KEY, bonusAgainMode);
    touchAppSettingsTimestamp();
  }

  function clampHibernateDays(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1) return fallback;
    return Math.min(365, Math.round(n));
  }

  function loadHibernateDays() {
    try {
      const raw = localStorage.getItem(HIBERNATE_DAYS_KEY);
      hibernateDays = raw ? clampHibernateDays(raw, DEFAULT_HIBERNATE_DAYS) : DEFAULT_HIBERNATE_DAYS;
    } catch {
      hibernateDays = DEFAULT_HIBERNATE_DAYS;
    }
  }

  function saveHibernateDays() {
    localStorage.setItem(HIBERNATE_DAYS_KEY, String(hibernateDays));
    touchAppSettingsTimestamp();
  }

  function renderSettingsView() {
    if (settingBonusHardEl) settingBonusHardEl.value = bonusDaysSettings.hard;
    if (settingBonusGoodEl) settingBonusGoodEl.value = bonusDaysSettings.good;
    if (settingBonusEasyEl) settingBonusEasyEl.value = bonusDaysSettings.easy;
    if (settingBonusAgainModeEl) settingBonusAgainModeEl.value = bonusAgainMode;
    if (settingHibernateDaysEl) settingHibernateDaysEl.value = hibernateDays;
  }

  /** Bouton de dépannage manuel : désinscrit le(s) service worker(s) et vide
   *  le Cache Storage de l'appli, sans toucher IndexedDB (les fiches) ni
   *  localStorage (réglages). Sert de filet de sécurité
   *  accessible sans les outils de développement, pour les cas où la
   *  détection automatique de nouvelle version reste bloquée (observé sur
   *  GitHub Pages, qui ne permet pas de fixer nous-mêmes les en-têtes de
   *  cache HTTP — voir aussi updateViaCache: "none" plus bas). */
  const settingHardResetEl = el("setting-hard-reset");
  if (settingHardResetEl) {
    settingHardResetEl.addEventListener("click", async () => {
      settingHardResetEl.disabled = true;
      settingHardResetEl.textContent = "Nettoyage en cours…";
      try {
        if (window.caches && caches.keys) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch (e) {
        /* on recharge quand même : au pire, rien n'a pu être nettoyé */
      }
      window.location.reload();
    });
  }

  function wireBonusSettingInput(inputEl, rating) {
    if (!inputEl) return;
    inputEl.addEventListener("change", () => {
      bonusDaysSettings[rating] = clampBonusDays(inputEl.value, DEFAULT_BONUS_DAYS[rating]);
      inputEl.value = bonusDaysSettings[rating];
      saveBonusDaysSettings();
      if (isBonusMode) updateRatingPreviews();
    });
  }

  wireBonusSettingInput(settingBonusHardEl, "hard");
  wireBonusSettingInput(settingBonusGoodEl, "good");
  wireBonusSettingInput(settingBonusEasyEl, "easy");

  if (settingBonusAgainModeEl) {
    settingBonusAgainModeEl.addEventListener("change", () => {
      bonusAgainMode = settingBonusAgainModeEl.value === "increment" ? "increment" : "fixed";
      saveBonusAgainMode();
      if (isBonusMode) updateRatingPreviews();
    });
  }

  if (settingHibernateDaysEl) {
    settingHibernateDaysEl.addEventListener("change", () => {
      hibernateDays = clampHibernateDays(settingHibernateDaysEl.value, DEFAULT_HIBERNATE_DAYS);
      settingHibernateDaysEl.value = hibernateDays;
      saveHibernateDays();
    });
  }

  /* ---------------------------------------------------------
     Navigation par onglets
  --------------------------------------------------------- */
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const view = tab.dataset.view;
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
      el(`view-${view}`).classList.add("is-active");

      if (view === "review") {
        if (!reviewSessionStarted) {
          startReviewSession();
        } else {
          syncCurrentCardFromStore();
        }
        renderReviewChart();
      }
      if (view === "stats") renderStats();
      if (view === "learning-modes") loadModeFormIntoInputs(algoEditingModeId || "normal");
      if (view === "sync") renderSyncView();
      if (view === "settings") renderSettingsView();
      renderDuePill();
    });
  });

  /* ---------------------------------------------------------
     Vue Sync : formulaire de connexion + statut
  --------------------------------------------------------- */
  const syncUnconfiguredEl = el("sync-unconfigured");
  const syncConfiguredEl = el("sync-configured");
  const syncForm = el("sync-form");
  const syncUrlInput = el("sync-url");
  const syncKeyInput = el("sync-key");
  const syncCodeInput = el("sync-code");
  const generateCodeBtn = el("generate-code-btn");
  const currentSyncCodeEl = el("current-sync-code");
  const copyCodeBtn = el("copy-code-btn");
  const disconnectBtn = el("disconnect-btn");
  const syncPendingNoteEl = el("sync-pending-note");
  const syncErrorNoteEl = el("sync-error-note");
  const retrySyncBtn = el("retry-sync-btn");
  const syncStatusBtn = el("sync-status");
  const syncDotEl = el("sync-dot");
  const syncStatusTextEl = el("sync-status-text");

  let unsubscribeRealtime = null;
  let syncAutoRetrying = false;

  function renderSyncView() {
    const configured = Sync.isConfigured();
    syncUnconfiguredEl.hidden = configured;
    syncConfiguredEl.hidden = !configured;

    if (configured) {
      currentSyncCodeEl.textContent = Sync.getConfig().code;
      const pending = Sync.pendingCount();
      syncPendingNoteEl.hidden = pending === 0;
      syncPendingNoteEl.textContent = `${pending} fiche(s) en attente d'envoi (dès que la connexion revient).`;

      const lastError = Sync.getLastError();
      syncErrorNoteEl.hidden = !lastError;
      syncErrorNoteEl.textContent = lastError
        ? `Dernière erreur Supabase : ${lastError}`
        : "";

      // Nouvelle tentative silencieuse à chaque ouverture de l'onglet,
      // sans se relancer elle-même pour éviter une boucle.
      if (pending > 0 && navigator.onLine && !syncAutoRetrying) {
        syncAutoRetrying = true;
        Sync.flushPending((id) => cards.find((c) => c.id === id)).then(() => {
          syncAutoRetrying = false;
          const stillPending = Sync.pendingCount();
          syncPendingNoteEl.hidden = stillPending === 0;
          syncPendingNoteEl.textContent = `${stillPending} fiche(s) en attente d'envoi (dès que la connexion revient).`;
          const err = Sync.getLastError();
          syncErrorNoteEl.hidden = !err;
          syncErrorNoteEl.textContent = err ? `Dernière erreur Supabase : ${err}` : "";
          updateSyncStatus();
        });
      }
    }
  }

  function updateSyncStatus() {
    if (!Sync.isConfigured()) {
      syncDotEl.className = "sync-dot";
      syncStatusTextEl.textContent = "Local";
      return;
    }
    const pending = Sync.pendingCount();
    if (!navigator.onLine) {
      syncDotEl.className = "sync-dot is-offline";
      syncStatusTextEl.textContent = "Hors ligne";
    } else if (pending > 0) {
      syncDotEl.className = "sync-dot is-pending";
      syncStatusTextEl.textContent = `${pending} en attente`;
    } else {
      syncDotEl.className = "sync-dot is-synced";
      syncStatusTextEl.textContent = "Synchronisé";
    }
    if (el("view-sync").classList.contains("is-active")) {
      renderSyncView();
    }
  }

  syncStatusBtn.addEventListener("click", () => {
    document.querySelector('.tab[data-view="sync"]').click();
  });

  generateCodeBtn.addEventListener("click", () => {
    syncCodeInput.value = Sync.generateSyncCode();
  });

  syncForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    Sync.saveConfig({
      url: syncUrlInput.value,
      key: syncKeyInput.value,
      code: syncCodeInput.value,
    });
    await connectSync();
    renderSyncView();
  });

  copyCodeBtn.addEventListener("click", async () => {
    const code = Sync.getConfig().code;
    try {
      await navigator.clipboard.writeText(code);
      copyCodeBtn.textContent = "Copié !";
      setTimeout(() => (copyCodeBtn.textContent = "Copier le code"), 1500);
    } catch {
      /* presse-papier indisponible, tant pis */
    }
  });

  retrySyncBtn.addEventListener("click", async () => {
    retrySyncBtn.disabled = true;
    retrySyncBtn.textContent = "Envoi...";
    await reconcileWithRemote();
    await Sync.flushPending((id) => cards.find((c) => c.id === id));
    mergeNewDueCardsIntoQueue();
    renderSyncView();
    updateSyncStatus();
    retrySyncBtn.disabled = false;
    retrySyncBtn.textContent = "Réessayer maintenant";
  });

  disconnectBtn.addEventListener("click", () => {
    if (!confirm("Se déconnecter ? Tes fiches restent sur cet appareil, mais ne seront plus synchronisées tant que tu ne reconnectes pas un code.")) {
      return;
    }
    if (unsubscribeRealtime) unsubscribeRealtime();
    Sync.clearConfig();
    syncForm.reset();
    renderSyncView();
    updateSyncStatus();
  });

  /** Trouve (ou crée) localement la matière référencée par une fiche distante, à partir de son id + nom dénormalisé. */
  async function ensureLocalSubjectFor(remote) {
    if (remote.subject && subjects.some((s) => s.id === remote.subject)) {
      return remote.subject;
    }
    if (remote.subject) {
      // Matière inconnue sur cet appareil (créée ailleurs) : on la recrée avec le même id
      // pour que les deux appareils convergent vers la même matière.
      const remoteName = remote.subjectName || "Matière importée";

      // Évite les doublons "fantômes" : si une matière locale du même nom
      // existe déjà mais n'a encore aucune fiche (typiquement le "Général"
      // créé automatiquement au tout premier lancement de l'appli, avant la
      // toute première synchronisation), on la remplace par celle du serveur
      // au lieu d'en garder deux — sinon chaque nouvel appareil qui se
      // connecte fait apparaître une matière "Général" vide supplémentaire.
      const emptyDuplicate = subjects.find(
        (s) => s.id !== remote.subject && s.name === remoteName &&
          !cards.some((c) => c.subject === s.id && !c.deleted)
      );
      if (emptyDuplicate) {
        await DB.removeSubject(emptyDuplicate.id);
        subjects = subjects.filter((s) => s.id !== emptyDuplicate.id);
        if (currentSubjectId === emptyDuplicate.id) {
          currentSubjectId = remote.subject;
          localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
        }
      }

      const s = {
        id: remote.subject,
        name: remoteName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await DB.putSubject(s);
      subjects.push(s);
      subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      renderSubjectSelect();
      renderStatsSubjectSelect();
      return s.id;
    }
    // Fiche distante ancienne, sans matière renseignée : on la range dans "Général".
    let general = subjects.find((s) => s.name === "Général");
    if (!general) {
      general = newSubject("Général");
      await DB.putSubject(general);
      subjects.push(general);
      renderSubjectSelect();
      renderStatsSubjectSelect();
    }
    return general.id;
  }

  /** Fusionne une fiche reçue de Supabase (import initial ou temps réel).
   *  Règle importante : une ligne distante sans matière renseignée (donnée
   *  ancienne, d'avant l'introduction des matières) ne doit jamais dégrader
   *  une fiche déjà correctement classée localement — sinon une simple
   *  synchronisation peut faire "retomber" une fiche dans Général. */
  async function mergeRemoteCard(remote) {
    const idx = cards.findIndex((c) => c.id === remote.id);
    const local = idx >= 0 ? cards[idx] : null;

    if (remote.deleted) {
      // Fiche supprimée : elle ne sera jamais affichée (partout on filtre sur
      // !c.deleted), donc pas besoin de résoudre une vraie matière pour elle.
      // Important : si on appelait ensureLocalSubjectFor ici, une matière
      // qu'on vient de supprimer localement (avec toutes ses fiches) serait
      // recréée dès qu'on récupère ces mêmes fiches (supprimées) depuis
      // Supabase — c'est ce qui faisait "réapparaître" la matière supprimée
      // à chaque réouverture de l'appli.
      remote.subject = remote.subject || (local ? local.subject : null);
    } else if (remote.subject) {
      remote.subject = await ensureLocalSubjectFor(remote);
    } else if (local && local.subject) {
      remote.subject = local.subject;
    } else {
      remote.subject = await ensureLocalSubjectFor(remote);
    }

    if (!local) {
      cards.push(remote);
      await DB.put(remote);
    } else if (new Date(remote.updatedAt) > new Date(local.updatedAt || 0)) {
      // Garde-fou : une ligne distante qui a toutes les apparences d'une
      // fiche "jamais révisée" (aucune lastReviewed, intervalle et
      // répétitions à 0) ne doit jamais écraser une fiche locale qui, elle,
      // a une vraie progression. Une réponse "Encore" légitime redonne bien
      // un intervalle de 1 jour, jamais 0 — donc ce garde-fou ne bloque pas
      // les remises à zéro volontaires, seulement les lignes distantes
      // incomplètes/corrompues qui feraient perdre la progression réelle
      // d'une fiche (ex. remise à "interrogation immédiate" à tort).
      const remoteLooksNeverReviewed =
        !remote.deleted &&
        !remote.lastReviewed &&
        (remote.repetitions || 0) === 0 &&
        (remote.interval || 0) === 0;
      const localHasRealProgress =
        Boolean(local.lastReviewed) || local.repetitions > 0 || local.interval > 0;

      if (!(remoteLooksNeverReviewed && localHasRealProgress)) {
        cards[idx] = remote;
        await DB.put(remote);
        syncCardEverywhere(remote);
      }
    }
  }

  /** Ajoute discrètement à la file en cours les fiches dues de la matière active
   *  qui viennent d'arriver par la sync, sans jamais changer la fiche affichée. */
  function mergeNewDueCardsIntoQueue() {
    if (!reviewSessionStarted || isBonusMode) return;
    const queueIds = new Set(reviewQueue.map((c) => c.id));
    const currentId = currentCard ? currentCard.id : null;
    const newlyDue = dueCards().filter(
      (c) => c.id !== currentId && !queueIds.has(c.id)
    );
    if (newlyDue.length === 0) return;
    reviewQueue.push(...newlyDue);
    sessionTotalDue += newlyDue.length;
    reviewProgressEl.textContent = `${sessionTotalDue - reviewQueue.length}/${sessionTotalDue} fiches revues aujourd'hui`;
    renderDuePill();
  }

  async function reconcileWithRemote() {
    const remoteCards = await Sync.pullAll();
    const remoteById = new Map(remoteCards.map((r) => [r.id, r]));

    // Fiches locales plus récentes que la version distante (ou absentes
    // du serveur) : on les pousse.
    for (const local of cards) {
      const remote = remoteById.get(local.id);
      if (!remote || new Date(local.updatedAt || 0) > new Date(remote.updatedAt || 0)) {
        Sync.pushCard(local);
      }
    }

    // Fiches distantes plus récentes : on les adopte localement.
    for (const remote of remoteCards) {
      await mergeRemoteCard(remote);
    }

    renderAll();
    updateSyncStatus();
  }

  async function connectSync() {
    if (!Sync.isConfigured()) return;
    if (unsubscribeRealtime) unsubscribeRealtime();

    await reconcileWithRemote();
    await Sync.flushPending((id) => cards.find((c) => c.id === id));

    unsubscribeRealtime = Sync.subscribeRealtime(async (remote) => {
      await mergeRemoteCard(remote);
      renderAll();
      if (currentCard) {
        // On resynchronise le contenu de la fiche affichée sans en changer,
        // et on ajoute la nouvelle fiche à la file sans rien basculer à l'écran.
        syncCurrentCardFromStore();
        mergeNewDueCardsIntoQueue();
      } else if (!isBonusMode) {
        // Rien n'était affiché : on peut lancer une session sans rien perturber.
        startReviewSession();
      }
    });

    updateSyncStatus();
  }

  window.addEventListener("online", () => {
    updateSyncStatus();
    if (Sync.isConfigured()) {
      Sync.flushPending((id) => cards.find((c) => c.id === id)).then(updateSyncStatus);
    }
  });
  window.addEventListener("offline", updateSyncStatus);

  // Redessine les histogrammes au redimensionnement / changement d'orientation
  // (la largeur de colonne est calculée depuis la largeur réelle de l'écran,
  // voir chartAvailableWidth) — avec un léger debounce pour éviter de
  // redessiner à chaque pixel pendant un resize continu.
  let chartResizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(chartResizeTimer);
    chartResizeTimer = setTimeout(() => {
      if (el("view-stats") && el("view-stats").classList.contains("is-active")) renderDueChart();
      if (el("view-review") && el("view-review").classList.contains("is-active")) renderReviewChart();
    }, 150);
  });

  /* ---------------------------------------------------------
     Service worker (hors-ligne + mise à jour automatique)
  --------------------------------------------------------- */
  if ("serviceWorker" in navigator) {
    let refreshing = false;

    // Dès qu'un nouveau service worker prend le contrôle (il a déjà fait
    // skipWaiting() côté sw.js), on recharge la page une seule fois pour
    // charger les nouveaux fichiers.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      showUpdateToast();
      setTimeout(() => window.location.reload(), 900);
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker
        // `updateViaCache: "none"` : ignore complètement le cache HTTP du
        // navigateur pour sw.js à CHAQUE vérification (pas seulement au
        // bout de 24h comme le prévoit le comportement par défaut des
        // navigateurs). Indispensable ici car GitHub Pages ne permet pas
        // de fixer nous-mêmes les en-têtes de cache (contrairement à
        // Netlify, voir le fichier _headers, sans effet sur GitHub Pages) :
        // sans ce réglage, un sw.js mis en cache empêchait la détection de
        // toute nouvelle version, et donc toute mise à jour, indéfiniment.
        .register("sw.js", { updateViaCache: "none" })
        .then((registration) => {
          // Vérifie immédiatement s'il existe une version plus récente.
          registration.update();

          // Et à nouveau chaque fois que l'appli redevient visible
          // (ex. rouverte depuis l'écran d'accueil de l'iPhone).
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              registration.update();
            }
          });

          // Filet de sécurité si l'appli reste ouverte longtemps en arrière-plan.
          setInterval(() => registration.update(), 60 * 60 * 1000);
        })
        .catch(() => {
          /* l'appli reste utilisable même si le SW échoue à s'enregistrer */
        });
    });
  }

  function showUpdateToast() {
    const toast = document.createElement("div");
    toast.className = "update-toast";
    toast.textContent = "Mise à jour de l'appli…";
    document.body.appendChild(toast);
  }

  /* ---------------------------------------------------------
     Démarrage
  --------------------------------------------------------- */
  (async () => {
    loadBonusDaysSettings();
    loadBonusAgainMode();
    loadHibernateDays();
    renderSettingsView();
    await loadSubjects();
    cards = await DB.getAll();
    await migrateOrphanCards();
    await dedupeEmptySubjects();
    // Rattrape le record par-fiche pour les fiches existantes qui n'ont
    // pas encore ce champ (ex. créées avant cette fonctionnalité, ou
    // importées) : sans ça leurs paliers déjà mérités resteraient invisibles.
    for (const c of cards) {
      const shouldBe = Math.max(c.maxIntervalReached || 0, c.interval || 0);
      if (shouldBe !== (c.maxIntervalReached || 0)) {
        c.maxIntervalReached = shouldBe;
        await persist(c);
      }
    }
    renderSubjectSelect();
    renderAll();
    startReviewSession();
    updateSyncStatus();
    // L'essentiel de l'UI est rendu et interactif : on désarme le filet de
    // sécurité anti-écran-blanc (voir le <script> tout en haut du <head>).
    // La synchro Supabase qui suit peut échouer sans que ça bloque l'appli.
    if (window.__clearBootWatchdog) window.__clearBootWatchdog();
    if (window.__clearBootRetryFlag) window.__clearBootRetryFlag();
    if (Sync.isConfigured()) {
      await connectSync();
      // Doublons "Général" : reconcileWithRemote() peut faire apparaître un
      // second sujet "Général" arrivé du serveur (fiches distantes sans
      // matière) en plus de celui créé localement par défaut avant même que
      // la synchro n'ait eu le temps de tourner (voir loadSubjects) — d'où
      // la matière "Générale" qui apparaissait parfois à la toute première
      // connexion. On redéduplique donc une fois la synchro effectuée.
      await dedupeEmptySubjects();
      renderSubjectSelect();
      renderStatsSubjectSelect();
      // Ne relance pas startReviewSession() ici : reconcileWithRemote() a déjà
      // rafraîchi les données via renderAll(), et relancer une session ici
      // remélangeait la file et changeait la fiche affichée sous les yeux de
      // l'utilisateur, sans lien avec son évaluation. On ajoute juste
      // discrètement les éventuelles nouvelles fiches dues à la file en cours.
      mergeNewDueCardsIntoQueue();
    }
  })();
})();
