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
  const MULTI_SELECTION_LABEL_KEY = "fiches_multi_subject_label";
  /** Libellé à afficher pour la sélection multi-matières (item 18) : le nom
   *  du dossier si un seul dossier a été coché (rien d'autre), sinon vide
   *  (générique "Sélection de matières"). Un seul SUJET coché ne passe même
   *  plus par ce mécanisme : voir le confirm du picker, qui bascule alors
   *  directement dessus. */
  function loadMultiSelectionLabel() {
    return localStorage.getItem(MULTI_SELECTION_LABEL_KEY) || "";
  }
  function saveMultiSelectionLabel(label) {
    localStorage.setItem(MULTI_SELECTION_LABEL_KEY, label || "");
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

  /* ---------------------------------------------------------
     Barre d'outils de mise en forme riche (item 13) : agit sur le champ
     (question ou réponse) qui avait le focus juste avant le clic sur un
     bouton — `mousedown`+preventDefault empêche le clic de faire perdre
     cette sélection avant que la commande ne s'applique.
  --------------------------------------------------------- */
  let lastFocusedEditor = null;
  [inputQuestion, inputAnswer].forEach((editor) => {
    if (!editor) return;
    editor.addEventListener("focus", () => { lastFocusedEditor = editor; });
  });

  function focusLastEditor() {
    const target = lastFocusedEditor || inputQuestion;
    if (target) target.focus();
    return target;
  }

  document.querySelectorAll(".rt-btn[data-cmd]").forEach((btn) => {
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => {
      focusLastEditor();
      document.execCommand(btn.dataset.cmd, false, null);
    });
  });

  const rtHighlightBtn = document.querySelector(".rt-btn--highlight");
  if (rtHighlightBtn) {
    rtHighlightBtn.addEventListener("mousedown", (e) => e.preventDefault());
    rtHighlightBtn.addEventListener("click", () => {
      focusLastEditor();
      const color = rtHighlightBtn.dataset.highlight;
      // "hiliteColor" est la commande historique (Firefox) ; "backColor"
      // est celle que Chrome/Safari reconnaissent pour le même effet sur
      // une sélection de texte (pas tout le champ).
      if (!document.execCommand("hiliteColor", false, color)) {
        document.execCommand("backColor", false, color);
      }
    });
  }

  document.querySelectorAll(".rt-color[data-color]").forEach((btn) => {
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => {
      focusLastEditor();
      document.execCommand("foreColor", false, btn.dataset.color);
    });
  });

  const rtClearBtn = el("rt-clear-btn");
  if (rtClearBtn) {
    rtClearBtn.addEventListener("mousedown", (e) => e.preventDefault());
    rtClearBtn.addEventListener("click", () => {
      focusLastEditor();
      document.execCommand("removeFormat", false, null);
    });
  }

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
    // Valeurs alignées sur les 12 choix disponibles pour les curseurs
    // (ALGO_K_VALUES/ALGO_M_VALUES) — Kg=2, Ke=2.4 et Ke=1.9 n'existaient
    // dans aucune des deux listes, ce qui faisait apparaître un curseur/menu
    // vide (aucune valeur sélectionnée) au lieu de la vraie valeur d'origine.
    cool: { name: "Cool", Ka: 3, Kh: 1.6, Kg: 2.1, Ke: 3.5, Ma: 3, Mh: 6, Mg: 60, Me: 300 },
    normal: { name: "Normal", Ka: 1.3, Kh: 1.5, Kg: 1.8, Ke: 2.5, Ma: 2, Mh: 3, Mg: 30, Me: 180 },
    renforce: { name: "Renforcé", Ka: 1, Kh: 1.3, Kg: 1.6, Ke: 1.8, Ma: 1, Mh: 2, Mg: 15, Me: 90 },
  };
  // Conservés pour compatibilité avec le code existant qui les référence
  // encore (couleurs, libellés courts...).
  const ALGO_MODE_ORDER = ["cool", "normal", "renforce", "custom"];
  const ALGO_MODE_SHORT_LABELS = { cool: "Cool", normal: "Normal", renforce: "Renforcé", custom: "Personnalisé" };
  const ALGO_KEYS8 = ["Ka", "Kh", "Kg", "Ke", "Ma", "Mh", "Mg", "Me"];
  // Valeurs discrètes disponibles pour les curseurs (item 9) — remplace les
  // anciens champs numériques libres, plus pratiques à régler au doigt.
  const ALGO_K_VALUES = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.1, 2.5, 3, 3.5];
  const ALGO_M_VALUES = [1, 2, 3, 4, 6, 10, 15, 30, 60, 90, 180, 300];
  function snapToNearest(value, list) {
    let best = list[0], bestDist = Infinity;
    for (const v of list) {
      const d = Math.abs(v - value);
      if (d < bestDist) { bestDist = d; best = v; }
    }
    return best;
  }

  function clampAlgoK(v, fallback) {
    const n = Number(v);
    return snapToNearest(Number.isFinite(n) ? n : Number(fallback) || 1, ALGO_K_VALUES);
  }
  function clampAlgoM(v, fallback) {
    const n = Number(v);
    return snapToNearest(Number.isFinite(n) ? n : Number(fallback) || 1, ALGO_M_VALUES);
  }
  function clampModeProfile(raw, fallbackId) {
    const factory = getFactoryDefaults();
    const fb = factory[fallbackId] || factory.normal;
    const out = {};
    ["Ka", "Kh", "Kg", "Ke"].forEach((k) => { out[k] = clampAlgoK(raw && raw[k], fb[k]); });
    ["Ma", "Mh", "Mg", "Me"].forEach((k) => { out[k] = clampAlgoM(raw && raw[k], fb[k]); });
    return out;
  }

  /* ---------------------------------------------------------
     Page Développeur (item 19) : réglages internes — émoticônes/texte des
     boutons de notation et du menu principal, et les valeurs "usine" des
     3 modes d'apprentissage fixes (celles vers lesquelles "Revenir aux
     réglages d'origine" ramène, et celles d'une toute nouvelle
     installation). Cachée derrière un simple onglet pour l'instant ; une
     vraie séparation développeur/utilisateur viendra plus tard.
  --------------------------------------------------------- */
  const DEV_SETTINGS_KEY = "fiches_dev_settings";
  const DEFAULT_RATING_LABELS = { again: "😵‍💫", hard: "🤔", good: "🙂", easy: "😎" };
  const DEFAULT_NAV_LABELS = {
    review: "🤓", manage: "🗃️", cards: "📄", stats: "📊", "learning-modes": "🎓", settings: "⚙",
  };

  function loadDevSettings() {
    let parsed = {};
    try {
      const raw = localStorage.getItem(DEV_SETTINGS_KEY);
      parsed = raw ? JSON.parse(raw) : {};
    } catch (e) {
      parsed = {};
    }
    return {
      ratingLabels: { ...DEFAULT_RATING_LABELS, ...(parsed.ratingLabels || {}) },
      navLabels: { ...DEFAULT_NAV_LABELS, ...(parsed.navLabels || {}) },
      factoryDefaults: {
        cool: { ...BUILTIN_MODE_DEFAULTS.cool, ...((parsed.factoryDefaults || {}).cool || {}) },
        normal: { ...BUILTIN_MODE_DEFAULTS.normal, ...((parsed.factoryDefaults || {}).normal || {}) },
        renforce: { ...BUILTIN_MODE_DEFAULTS.renforce, ...((parsed.factoryDefaults || {}).renforce || {}) },
      },
    };
  }
  function saveDevSettings(settings) {
    localStorage.setItem(DEV_SETTINGS_KEY, JSON.stringify(settings));
  }
  function getFactoryDefaults() {
    return loadDevSettings().factoryDefaults;
  }

  /** Applique les émoticônes/texte des boutons de notation (item 19) —
   *  appelé au démarrage et après chaque modification sur la page
   *  Développeur. */
  function applyRatingLabels() {
    const labels = loadDevSettings().ratingLabels;
    ["again", "hard", "good", "easy"].forEach((r) => {
      const el2 = document.querySelector(`.stamp--${r} .stamp-label`);
      if (el2) el2.textContent = labels[r];
    });
  }
  /** Applique les émoticônes/texte du menu principal (item 19). */
  function applyNavLabels() {
    const labels = loadDevSettings().navLabels;
    Object.keys(labels).forEach((view) => {
      const tab = document.querySelector(`.tab[data-view="${view}"]`);
      if (tab) tab.textContent = labels[view];
    });
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
        await persistSubject(s);
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
    await persistSubject(s);
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
        await persistSubject(s);
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


  const cardsSubjectSelectEl = el("cards-subject-select");
  const manageAddSubjectBtn = el("manage-add-subject-btn");
  const subjectListEl = el("subject-list");
  const subjectBarCountEl = el("subject-bar-count");

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
      // Chantier (item 16) : fiche marquée à corriger/compléter plus tard.
      underConstruction: false,
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
      // Item 18 : le nom du dossier si un seul dossier a été sélectionné,
      // sinon le libellé générique.
      return loadMultiSelectionLabel() || "Sélection de matières";
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
    // Le préfixe "Nom de la matière :" reste toujours en texte échappé (pas
    // question qu'un nom de matière contenant "<" casse l'affichage) ; la
    // question elle-même passe par toDisplayHtml (item 13 : contenu riche).
    questionTextEl.innerHTML = isSentinelSubject(currentSubjectId)
      ? `${escapeHtml(subjectName(card.subject))} :<br><br>${toDisplayHtml(card.question)}`
      : toDisplayHtml(card.question);
    renderSubjectAlgoBadge(card.subject);
    const constructionBtn = el("construction-current-btn");
    if (constructionBtn) {
      constructionBtn.hidden = false;
      constructionBtn.classList.toggle("is-active-construction", !!card.underConstruction);
    }
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
      await persistSubject(general);
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
    // Réviser (item 18) : le bouton affiche le nom courant (matière,
    // dossier, "Toutes les matières" ou "Sélection de matières") — plus de
    // liste déroulante native listant chaque matière une par une, voir le
    // menu à 3 choix (#subject-choice-menu) ouvert au clic.
    if (subjectSelectBtn) subjectSelectBtn.textContent = subjectName(currentSubjectId);
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

    renderExportSubjectSelect();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /** Mise en forme riche (item 13) : question/réponse sont désormais du
   *  HTML (produit par les champs contenteditable), pas du texte brut.
   *  `toDisplayHtml` protège la compatibilité avec les fiches créées AVANT
   *  ce changement — leur contenu, du texte brut, pourrait contenir des
   *  caractères spéciaux HTML ("<", "&"...) qui casseraient l'affichage
   *  s'ils étaient interprétés tels quels. Détecte si le contenu ressemble
   *  déjà à du HTML volontaire (balises reconnues) ; sinon l'échappe et
   *  convertit ses retours à la ligne en <br>. */
  function looksLikeHtml(str) {
    return /<\/?(b|i|u|s|strong|em|span|br|div|mark|font)\b/i.test(str || "");
  }
  function toDisplayHtml(raw) {
    if (!raw) return "";
    if (looksLikeHtml(raw)) return raw;
    return escapeHtml(raw).replace(/\n/g, "<br>");
  }
  /** Texte brut d'un contenu HTML — pour l'export en clair et la
   *  vérification "champ vide", jamais pour l'affichage. */
  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || "";
  }
  /** Version rapide (regex, sans toucher au DOM) du même besoin, réservée
   *  au filtrage de recherche (item 10) : `stripHtml` recréait un élément
   *  DOM pour CHAQUE fiche à CHAQUE frappe, perceptible comme un
   *  ralentissement dès que la matière contient beaucoup de fiches. Le
   *  décodage d'entités reste volontairement sommaire — largement
   *  suffisant pour un filtre de recherche. */
  function stripHtmlFast(html) {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  function isRichEditorEmpty(el) {
    return !el || stripHtml(el.innerHTML).trim() === "";
  }

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

  /** Rendu en arborescence avec indentation, mais repliable (item 8) : un
   *  compromis entre le picker toujours déplié (peu lisible dès qu'il y a
   *  plusieurs niveaux) et la navigation dossier par dossier d'avant (un
   *  clic pour "entrer", rien vu d'autre à la fois) — les dossiers sont
   *  repliés par défaut, un clic sur leur nom les déplie ou replie sur
   *  place, sans changer de page. Les nouvelles matières/dossiers sont
   *  créés à la racine (déplaçables ensuite via ↔️). */
  const expandedManageFolders = new Set();

  function renderSubjectManageList() {
    subjectListEl.innerHTML = "";
    renderTreeLevel(ROOT_FOLDER_ID, 0);
    if (folders.length === 0 && subjects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "field-hint";
      empty.textContent = "Aucune matière pour l'instant.";
      subjectListEl.appendChild(empty);
    }
  }

  function renderTreeLevel(parentId, depth) {
    const childFolders = folders
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const childSubjects = subjects
      .filter((s) => s.folderId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    childFolders.forEach((f) => {
      const expanded = expandedManageFolders.has(f.id);
      const li = document.createElement("li");
      li.className = "subject-row folder-row";
      li.style.paddingLeft = `${depth * 18}px`;

      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "subject-row-name";
      nameBtn.title = expanded ? "Replier ce dossier" : "Déplier ce dossier";
      nameBtn.textContent = `${expanded ? "▾" : "▸"} 📁 ${f.name}`;
      nameBtn.addEventListener("click", () => {
        if (expandedManageFolders.has(f.id)) expandedManageFolders.delete(f.id);
        else expandedManageFolders.add(f.id);
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

      // Ne recurse dans ce dossier que s'il est déplié (item 8) — sinon on
      // retombe sur l'arborescence toujours entièrement affichée d'avant,
      // illisible dès que plusieurs niveaux de dossiers existent.
      if (expanded) renderTreeLevel(f.id, depth + 1);
    });

    for (const s of childSubjects) {
      const li = document.createElement("li");
      li.className = "subject-row" + (s.id === currentSubjectId ? " is-active" : "");
      li.style.paddingLeft = `${depth * 18}px`;

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
      algoBtn.className = `subject-row-algo-btn subject-row-algo-btn--compact ${ALGO_MODE_KEY_TO_CLASS[algoModeCssKey(getSubjectAlgoMode(s.id))]}`;
      algoBtn.innerHTML = `🎓`;
      algoBtn.title = `Mode d'apprentissage : ${modeDisplayName(getSubjectAlgoMode(s.id))}`;
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
  }

  /* ---------------------------------------------------------
     Gestion des dossiers (créer, renommer, supprimer, déplacer) — item 1
  --------------------------------------------------------- */
  async function createFolderFlow() {
    const name = prompt("Nom du nouveau dossier :");
    if (!name || !name.trim()) return;
    // Créé à la racine (item 13 : plus de notion de dossier "actuellement
    // ouvert" avec l'arborescence désormais toujours dépliée en entier) —
    // déplaçable ensuite avec ↔️.
    const folder = newFolder(name, ROOT_FOLDER_ID);
    await persistFolder(folder);
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
    await persistFolder(f);
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
    if (f) await pushFolderDeleted(f);
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
          await persistFolder(f);
        }
      } else if (movePickerKind === "subject") {
        const s = subjects.find((x) => x.id === movePickerTargetId);
        if (s) {
          s.folderId = destId;
          s.updatedAt = new Date().toISOString();
          await persistSubject(s);
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

  /** Place la valeur d'un mode sur son curseur discret (item 9) et met à
   *  jour le texte affiché (préfixe × pour les coefficients, &lt; jours
   *  pour les maximums). */
  function setSliderField(id, value, list, prefix, suffix) {
    const input = el(id);
    const valueEl = el(`${id}-value`);
    if (!input) return;
    const idx = list.indexOf(value);
    input.value = String(idx === -1 ? 0 : idx);
    if (valueEl) valueEl.textContent = `${prefix} ${value}${suffix}`;
  }

  function loadModeFormIntoInputs(modeId) {
    const modes = loadLearningModes();
    const m = modes[modeId] || modes.normal;
    algoEditingModeId = m.id;
    setSliderField("algo-ka", m.Ka, ALGO_K_VALUES, "×", "");
    setSliderField("algo-kh", m.Kh, ALGO_K_VALUES, "×", "");
    setSliderField("algo-kg", m.Kg, ALGO_K_VALUES, "×", "");
    setSliderField("algo-ke", m.Ke, ALGO_K_VALUES, "×", "");
    setSliderField("algo-ma", m.Ma, ALGO_M_VALUES, "<", " j");
    setSliderField("algo-mh", m.Mh, ALGO_M_VALUES, "<", " j");
    setSliderField("algo-mg", m.Mg, ALGO_M_VALUES, "<", " j");
    setSliderField("algo-me", m.Me, ALGO_M_VALUES, "<", " j");
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
  /** Étend le nombre de points du graphique (item 9) jusqu'à ce que les
   *  courbes affichées atteignent leur plafond (deux valeurs arrondies
   *  identiques de suite), plutôt qu'un nombre de points fixe — plafonné à
   *  40 pour éviter un graphique interminable si un maximum est très élevé
   *  par rapport à son coefficient. */
  /** Étend le nombre de points du graphique (item 4/10) jusqu'à ce que les
   *  courbes affichées atteignent leur plafond — calculé analytiquement
   *  (résout K^n ≥ M) plutôt qu'en itérant avec un plafond fixe : un
   *  plafond fixe trop bas coupait certaines courbes à croissance lente
   *  (petit coefficient, maximum élevé — ex. ×1,1 plafonné à 300 jours a
   *  besoin d'une soixantaine de points pour vraiment atteindre son
   *  plateau) avant qu'elles n'aient eu le temps de vraiment se stabiliser
   *  — bug corrigé (item 10). */
  function computeNeededSteps(settings, ratings) {
    const ABSOLUTE_CAP = 64;
    let needed = 4;
    ratings.forEach((r) => {
      const [kKey, mKey] = ALGO_RATING_KEYS[r];
      const k = settings[kKey];
      const m = settings[mKey];
      // Coefficient ~1 : l'échéance ne grandit quasiment pas, le "plateau"
      // est atteint dès le premier point.
      const n = k <= 1.0001 ? 1 : Math.ceil(Math.log(m) / Math.log(k));
      // +2 points au-delà du début du plateau, pour bien montrer que la
      // courbe est devenue horizontale plutôt que de s'arrêter net pile au
      // moment où elle se stabilise.
      needed = Math.max(needed, Math.min(ABSOLUTE_CAP, n + 2));
    });
    return Math.max(4, Math.min(ABSOLUTE_CAP, needed));
  }

  function buildPreviewChartHtml(settings) {
    const ratings = ["again", "hard", "good", "easy"];
    const visibleRatings = ratings.filter((r) => algoChartVisible[r]);
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

    const N = computeNeededSteps(settings, visibleRatings);
    const seriesByRating = {};
    ratings.forEach((r) => {
      seriesByRating[r] = computeAlgoPreviewSeries(settings, r, N);
    });
    let maxVal = 1;
    visibleRatings.forEach((r) => { maxVal = Math.max(maxVal, ...seriesByRating[r]); });

    const W = 320, H = 260, padL = 30, padB = 22, padT = 14, padR = 12;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const xPos = (i) => padL + (i / (N - 1)) * plotW;
    const yMax = Math.max(10, Math.ceil((maxVal * 1.08) / 10) * 10);
    const yPos = (v) => padT + (1 - v / yMax) * plotH;
    // Au-delà d'une quinzaine de points, on n'étiquette plus qu'un point sur
    // deux (ou plus) en abscisse pour ne pas les faire se chevaucher.
    const xLabelStep = N <= 15 ? 1 : Math.ceil(N / 15);

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
        // Sur les longs graphiques, on n'étiquette la valeur qu'aux mêmes
        // points que l'axe, plus le tout dernier (le plafond atteint).
        if (i % xLabelStep !== 0 && i !== s.length - 1) return;
        const x = xPos(i), y = yPos(v);
        svg += `<circle cx="${x}" cy="${y}" r="2.4" fill="${ALGO_CHART_COLORS[r]}"/>`;
        svg += `<text x="${x + labelDx[r]}" y="${y - 5}" font-size="7.5" fill="${ALGO_CHART_COLORS[r]}" text-anchor="middle" font-family="var(--font-mono)">${v}</text>`;
      });
    });
    for (let i = 0; i < N; i += xLabelStep) {
      svg += `<text x="${xPos(i)}" y="${H - padB + 12}" font-size="8" fill="#9aa89e" text-anchor="middle">${i + 1}</text>`;
    }
    svg += `</svg>`;

    // Ordonnée verticale à gauche du graphique (item 4), plutôt qu'une
    // légende horizontale sous le graphique.
    const body =
      `<div class="algo-chart-body">` +
      `<span class="algo-chart-axis-y">Délai d'interrogation en jours</span>` +
      `<div class="algo-chart-svg-col">${svg}</div>` +
      `</div>` +
      `<div class="algo-chart-axis-x">Nombre de fois qu'une fiche a été évaluée</div>`;

    return `<div class="algo-chart-legend">${legend}</div>${body}`;
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
    const idx = (id) => Math.round(Number(el(id).value)) || 0;
    return {
      Ka: ALGO_K_VALUES[idx("algo-ka")] ?? 1,
      Kh: ALGO_K_VALUES[idx("algo-kh")] ?? 1,
      Kg: ALGO_K_VALUES[idx("algo-kg")] ?? 1,
      Ke: ALGO_K_VALUES[idx("algo-ke")] ?? 1,
      Ma: ALGO_M_VALUES[idx("algo-ma")] ?? 1,
      Mh: ALGO_M_VALUES[idx("algo-mh")] ?? 1,
      Mg: ALGO_M_VALUES[idx("algo-mg")] ?? 1,
      Me: ALGO_M_VALUES[idx("algo-me")] ?? 1,
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

  const ALGO_FIELD_META = {
    "algo-ka": { list: ALGO_K_VALUES, prefix: "×", suffix: "" },
    "algo-kh": { list: ALGO_K_VALUES, prefix: "×", suffix: "" },
    "algo-kg": { list: ALGO_K_VALUES, prefix: "×", suffix: "" },
    "algo-ke": { list: ALGO_K_VALUES, prefix: "×", suffix: "" },
    "algo-ma": { list: ALGO_M_VALUES, prefix: "<", suffix: " j" },
    "algo-mh": { list: ALGO_M_VALUES, prefix: "<", suffix: " j" },
    "algo-mg": { list: ALGO_M_VALUES, prefix: "<", suffix: " j" },
    "algo-me": { list: ALGO_M_VALUES, prefix: "<", suffix: " j" },
  };
  Object.keys(ALGO_FIELD_META).forEach((id) => {
    const input = el(id);
    if (!input) return;
    const meta = ALGO_FIELD_META[id];
    const valueEl = el(`${id}-value`);
    const updateReadout = () => {
      const v = meta.list[Math.round(Number(input.value)) || 0];
      if (valueEl) valueEl.textContent = `${meta.prefix} ${v}${meta.suffix}`;
    };
    input.addEventListener("input", () => {
      updateReadout();
      renderAlgoPreviewChart();
    });
    input.addEventListener("change", saveModeFormAndRefresh);
  });

  const algoResetBtn = el("algo-reset-btn");
  if (algoResetBtn) {
    algoResetBtn.addEventListener("click", () => {
      const modes = loadLearningModes();
      const m = modes[algoEditingModeId];
      if (!m || !m.builtin) return;
      if (!confirm(`Remettre le mode ${m.name} à ses valeurs d'origine ? Toutes les matières qui l'utilisent seront concernées.`)) return;
      updateModeProfile(algoEditingModeId, getFactoryDefaults()[algoEditingModeId]);
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
    const subject = newSubject(name, ROOT_FOLDER_ID);
    await persistSubject(subject);
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
    await persistSubject(s);
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
    await pushSubjectDeleted(s);

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

  const subjectSelectBtn = el("subject-select-btn");
  const subjectChoiceMenu = el("subject-choice-menu");

  function openSubjectChoiceMenu() {
    if (subjectChoiceMenu) subjectChoiceMenu.hidden = false;
  }
  function closeSubjectChoiceMenu() {
    if (subjectChoiceMenu) subjectChoiceMenu.hidden = true;
  }
  if (subjectSelectBtn) {
    subjectSelectBtn.addEventListener("click", () => {
      closeMultiSubjectPicker();
      openSubjectChoiceMenu();
    });
  }
  const subjectChoiceAllBtn = el("subject-choice-all");
  if (subjectChoiceAllBtn) {
    subjectChoiceAllBtn.addEventListener("click", () => {
      closeSubjectChoiceMenu();
      switchSubject(ALL_SUBJECTS_ID, true);
    });
  }
  const subjectChoiceSelectionBtn = el("subject-choice-selection");
  if (subjectChoiceSelectionBtn) {
    subjectChoiceSelectionBtn.addEventListener("click", () => {
      closeSubjectChoiceMenu();
      openMultiSubjectPicker();
    });
  }
  const subjectChoiceCancelBtn = el("subject-choice-cancel");
  if (subjectChoiceCancelBtn) {
    subjectChoiceCancelBtn.addEventListener("click", () => closeSubjectChoiceMenu());
  }
  // Cliquer n'importe où en dehors du menu le referme (item 6 : comportement
  // attendu d'un vrai menu déroulant), sans rien changer au choix précédent.
  document.addEventListener("click", (e) => {
    if (!subjectChoiceMenu || subjectChoiceMenu.hidden) return;
    if (subjectChoiceMenu.contains(e.target) || e.target === subjectSelectBtn) return;
    closeSubjectChoiceMenu();
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
      // Cocher/décocher un dossier répercute le même état sur tout ce
      // qu'il contient — sous-dossiers et matières, à toute profondeur
      // (item 7).
      cb.addEventListener("change", () => {
        const descendantFolderIds = new Set(folderDescendantIds(f.id));
        const descendantSubjectIds = new Set(subjectIdsInFolder(f.id));
        container.querySelectorAll('input[type="checkbox"]').forEach((other) => {
          if (other === cb) return;
          if (other.dataset.kind === "folder" && descendantFolderIds.has(other.value)) {
            other.checked = cb.checked;
          } else if (other.dataset.kind === "subject" && descendantSubjectIds.has(other.value)) {
            other.checked = cb.checked;
          }
        });
      });
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
    // "Annuler" (item 18) : referme la fenêtre et reste sur le choix
    // précédent, sans rien modifier.
    multiPickerCancelBtn.addEventListener("click", () => closeMultiSubjectPicker());
  }

  const multiPickerConfirmBtn = el("multi-subject-picker-confirm");
  if (multiPickerConfirmBtn) {
    multiPickerConfirmBtn.addEventListener("click", () => {
      const checkedFolders = [...document.querySelectorAll('#multi-subject-picker-list input[data-kind="folder"]:checked')];
      const checkedSubjects = [...document.querySelectorAll('#multi-subject-picker-list input[data-kind="subject"]:checked')];
      const resultIds = new Set();
      checkedFolders.forEach((cb) => subjectIdsInFolder(cb.value).forEach((id) => resultIds.add(id)));
      checkedSubjects.forEach((cb) => resultIds.add(cb.value));
      if (resultIds.size === 0) {
        alert("Choisis au moins une matière ou un dossier.");
        return;
      }
      closeMultiSubjectPicker();

      // Affichage intelligent (item 18) : une seule matière cochée -> on
      // bascule directement dessus (son nom s'affiche naturellement,
      // inutile de passer par le mode "sélection"). Un seul dossier coché
      // (rien d'autre) -> le nom du DOSSIER s'affiche. Sinon, un mélange ->
      // libellé générique "Sélection de matières".
      if (checkedFolders.length === 0 && checkedSubjects.length === 1) {
        switchSubject(checkedSubjects[0].value, true);
        return;
      }
      saveMultiSelection([...resultIds]);
      if (checkedFolders.length === 1 && checkedSubjects.length === 0) {
        saveMultiSelectionLabel(folders.find((f) => f.id === checkedFolders[0].value)?.name || "");
      } else {
        saveMultiSelectionLabel("");
      }
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
    // Débounce (item 10) : sans lui, chaque frappe relançait un filtrage +
    // un rendu complet de la liste — perceptible comme un ralentissement
    // sur une matière avec beaucoup de fiches, en tapant vite.
    let cardsSearchDebounce = null;
    cardsSearchInputEl.addEventListener("input", () => {
      clearTimeout(cardsSearchDebounce);
      cardsSearchDebounce = setTimeout(() => {
        cardsSearchQuery = cardsSearchInputEl.value.trim();
        renderManageList();
      }, 180);
    });
  }

  const constructionFilterBtn = el("construction-filter-btn");
  if (constructionFilterBtn) {
    constructionFilterBtn.addEventListener("click", () => {
      cardsConstructionFilter = !cardsConstructionFilter;
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

  /** Même principe que `persist` pour les fiches, mais pour les matières et
   *  les dossiers (item 1/8) : jusqu'ici jamais vraiment synchronisés (une
   *  matière créée ou déplacée sur un appareil n'apparaissait jamais, ou
   *  pas correctement, sur les autres). */
  async function persistSubject(subject) {
    await DB.putSubject(subject);
    if (Sync.isConfigured()) {
      Sync.pushSubject(subject).finally(updateSyncStatus);
    }
  }
  async function persistFolder(folder) {
    await DB.putFolder(folder);
    if (Sync.isConfigured()) {
      Sync.pushFolder(folder).finally(updateSyncStatus);
    }
  }
  /** Suppression douce envoyée aux autres appareils AVANT le retrait local
   *  (voir schéma Supabase : "deleted": true plutôt qu'un vrai DELETE, pour
   *  que le pull suivant sache retirer la matière/le dossier au lieu de le
   *  voir réapparaître). */
  async function pushSubjectDeleted(subject) {
    if (Sync.isConfigured()) {
      await Sync.pushSubject({ ...subject, deleted: true, updatedAt: new Date().toISOString() });
    }
  }
  async function pushFolderDeleted(folder) {
    if (Sync.isConfigured()) {
      await Sync.pushFolder({ ...folder, deleted: true, updatedAt: new Date().toISOString() });
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
        answerTextEl.innerHTML = toDisplayHtml(currentCard.answer);
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
  const cardAlgoBtn = el("card-algo-btn");

  function renderSubjectAlgoBadge(cardSubjectId) {
    const sentinel = isSentinelSubject(currentSubjectId);
    const n = currentSubjectId ? subjectCards().length : 0;
    const effectiveSubjectId = sentinel && cardSubjectId ? cardSubjectId : currentSubjectId;

    if (subjectBarCountEl) subjectBarCountEl.textContent = `${n} fiche${n > 1 ? "s" : ""}`;
    // Un vrai identifiant de matière (jamais un sentinel) est toujours
    // disponible dès qu'une fiche est affichée à l'écran (item 17 : le
    // badge de mode vit maintenant sur la fiche elle-même, plus à côté du
    // sélecteur de matière — ça n'avait plus de sens avec le multi-matières).
    const showBtn = !sentinel || !!cardSubjectId;
    if (cardAlgoBtn) cardAlgoBtn.hidden = !showBtn;
    if (showBtn && effectiveSubjectId) {
      const key = getSubjectAlgoMode(effectiveSubjectId);
      if (cardAlgoBtn) {
        Object.values(ALGO_MODE_KEY_TO_CLASS).forEach((c) => cardAlgoBtn.classList.remove(c));
        cardAlgoBtn.classList.add(ALGO_MODE_KEY_TO_CLASS[algoModeCssKey(key)]);
        cardAlgoBtn.dataset.subjectId = effectiveSubjectId;
        cardAlgoBtn.title = `Mode d'apprentissage : ${modeDisplayName(key)}`;
      }
    }
  }

  if (cardAlgoBtn) {
    cardAlgoBtn.addEventListener("click", () => {
      // En mode "toutes matières"/"sélection", `dataset.subjectId` porte la
      // vraie matière de la fiche actuellement affichée (voir
      // renderSubjectAlgoBadge) ; sinon, la matière active classique.
      const targetId = cardAlgoBtn.dataset.subjectId || currentSubjectId;
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
    // Une nouvelle session invalide l'annulation en attente (item 2) : la
    // fiche à restaurer n'est plus forcément dans la nouvelle file.
    lastRatingSnapshot = null;
    const undoBtn = el("undo-rating-btn");
    if (undoBtn) undoBtn.hidden = true;
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
    answerTextEl.innerHTML = toDisplayHtml(currentCard.answer);
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
    // Coupe l'animation de retournement pour CE changement de fiche (item
    // 7 — bug corrigé : voir le commentaire CSS sur .no-flip-transition) —
    // remise en place juste après (au prochain frame), pour que le
    // prochain retournement volontaire (tap sur la fiche) reste bien animé.
    flipCardEl.classList.add("no-flip-transition");
    flipCardEl.classList.remove("is-flipped");
    void flipCardEl.offsetWidth; // force l'application de la classe avant la suite
    requestAnimationFrame(() => flipCardEl.classList.remove("no-flip-transition"));

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
      answerTextEl.innerHTML = toDisplayHtml(currentCard.answer);

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
      if (el("construction-current-btn")) el("construction-current-btn").hidden = true;
      if (cardAlgoBtn) cardAlgoBtn.hidden = true;
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
    answerTextEl.innerHTML = toDisplayHtml(currentCard.answer);
    reviewProgressEl.textContent = "Fiches du jour terminées — révision libre";
    if (enteringBonusMode) {
      showCenterToast("🔁 Fiches du jour terminées — passage en révision libre");
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

  /** Journal des notes données (item 15) : un evénement par notation, quel
   *  que soit le mode (file du jour ou révision libre) — sert uniquement
   *  aux statistiques "Notes données" de la page Stats, jamais à la
   *  planification elle-même. */
  let ratingLog = [];
  async function logRating(card, rating) {
    const entry = { id: uid(), cardId: card.id, subjectId: card.subject, rating, at: new Date().toISOString() };
    ratingLog.push(entry);
    await DB.addRatingLog(entry);
    return entry.id;
  }

  /** Annuler la dernière évaluation (item 2) : un seul niveau d'annulation
   *  (pas d'historique complet), écrasé à chaque nouvelle notation.
   *  Capture tout ce qui est modifié par une notation, pour tout restaurer
   *  à l'identique : la fiche elle-même (avant notation), la file de
   *  révision, le mode bonus, le compteur de fiches dues, et l'entrée du
   *  journal des notes (pour ne pas fausser les statistiques après coup). */
  let lastRatingSnapshot = null;

  function captureRatingSnapshot(ratingLogId) {
    lastRatingSnapshot = {
      card: { ...currentCard },
      reviewQueue: reviewQueue.map((c) => ({ ...c })),
      isBonusMode,
      sessionTotalDue,
      ratingLogId,
    };
    const undoBtn = el("undo-rating-btn");
    if (undoBtn) undoBtn.hidden = false;
  }

  async function undoLastRating() {
    const snap = lastRatingSnapshot;
    if (!snap) return;
    lastRatingSnapshot = null;
    const undoBtn = el("undo-rating-btn");
    if (undoBtn) undoBtn.hidden = true;

    // Restaure la fiche à son état d'avant notation.
    await persist(snap.card);
    const idx = cards.findIndex((c) => c.id === snap.card.id);
    if (idx >= 0) cards[idx] = snap.card;

    // Retire l'entrée correspondante du journal des notes (item 15/stats),
    // pour qu'une évaluation annulée n'y apparaisse pas comme si elle avait
    // eu lieu.
    if (snap.ratingLogId) {
      ratingLog = ratingLog.filter((e) => e.id !== snap.ratingLogId);
      await DB.removeFromRatingLog(snap.ratingLogId);
    }

    reviewQueue = snap.reviewQueue;
    isBonusMode = snap.isBonusMode;
    sessionTotalDue = snap.sessionTotalDue;
    currentCard = snap.card;

    flipCardEl.classList.add("no-flip-transition");
    flipCardEl.classList.remove("is-flipped");
    void flipCardEl.offsetWidth;
    requestAnimationFrame(() => flipCardEl.classList.remove("no-flip-transition"));
    isFlipped = false;
    renderQuestionText(currentCard);
    answerTextEl.innerHTML = toDisplayHtml(currentCard.answer);
    updateRatingPreviews();
    renderReviewChart();
    renderStats();
    renderManageList();
    renderDuePill();
  }

  const undoRatingBtn = el("undo-rating-btn");
  if (undoRatingBtn) {
    undoRatingBtn.addEventListener("click", undoLastRating);
  }

  async function rateCurrentCard(rating) {
    if (!currentCard) return;
    const ratingLogId = await logRating(currentCard, rating);
    captureRatingSnapshot(ratingLogId);
    const updated = isBonusMode ? await rateBonusCard(rating) : await rateScheduledCard(rating);
    showNextCard();
    // Anime le mini graphique (item 9) : la barre "aujourd'hui" et toutes
    // les barres jusqu'à la nouvelle date de la fiche s'allument en vague,
    // de gauche à droite. `requestAnimationFrame` laisse le temps au
    // graphique (redessiné par showNextCard -> renderReviewChart) d'exister
    // dans le DOM avant qu'on n'essaie de lui appliquer l'animation.
    if (updated) {
      requestAnimationFrame(() => triggerReviewChartWave(0, updated.interval));
    }
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
    return updated;
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
    return updated;
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

  const constructionCurrentBtn = el("construction-current-btn");
  if (constructionCurrentBtn) {
    constructionCurrentBtn.addEventListener("click", async () => {
      if (!currentCard) return;
      await toggleUnderConstruction(currentCard.id);
      constructionCurrentBtn.classList.toggle("is-active-construction", !!currentCard.underConstruction);
    });
  }

  /** cardForm.reset() natif ne touche pas les champs contenteditable (item
   *  13) — seuls les vrais éléments de formulaire (input/textarea/select).
   *  On les vide donc à la main partout où l'ancien reset() était appelé. */
  function resetCardForm() {
    cardForm.reset();
    if (inputQuestion) inputQuestion.innerHTML = "";
    if (inputAnswer) inputAnswer.innerHTML = "";
  }

  /* ---------------------------------------------------------
     Vue Gérer : formulaire + liste
  --------------------------------------------------------- */
  cardForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Les champs contenteditable ne supportent pas l'attribut HTML
    // `required` natif : on vérifie donc à la main qu'ils ne sont pas vides
    // (au sens texte, une fiche entièrement blanche ou juste un <br> ne
    // doit pas compter comme "remplie").
    if (isRichEditorEmpty(inputQuestion) || isRichEditorEmpty(inputAnswer)) return;
    const question = inputQuestion.innerHTML.trim();
    const answer = inputAnswer.innerHTML.trim();

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

    resetCardForm();
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
    resetCardForm();
  });

  const deleteEditingCardBtn = el("delete-editing-card");

  function enterEditMode(card) {
    editingId = card.id;
    inputQuestion.innerHTML = toDisplayHtml(card.question);
    inputAnswer.innerHTML = toDisplayHtml(card.answer);
    submitBtn.textContent = "Enregistrer les modifications";
    cancelEditBtn.hidden = false;
    if (deleteEditingCardBtn) deleteEditingCardBtn.hidden = false;
    inputQuestion.focus();
  }

  function exitEditMode() {
    editingId = null;
    submitBtn.textContent = "Ajouter à la pile";
    cancelEditBtn.hidden = true;
    if (deleteEditingCardBtn) deleteEditingCardBtn.hidden = true;
  }

  if (deleteEditingCardBtn) {
    deleteEditingCardBtn.addEventListener("click", async () => {
      if (!editingId) return;
      if (!confirm("Supprimer définitivement cette fiche ? Cette action est irréversible.")) return;
      const id = editingId;
      editReturnToReview = false;
      exitEditMode();
      resetCardForm();
      await deleteCard(id, true);
    });
  }

  const CARDS_SCOPE_CURRENT = "__current__";
  const CARDS_SCOPE_MULTI = "__cards_multi__";
  const CARDS_SCOPE_MULTI_KEY = "fiches_cards_multi_ids";
  let cardsScopeFilter = CARDS_SCOPE_CURRENT;
  let cardsSearchQuery = "";
  let cardsConstructionFilter = false;

  function loadCardsMultiSelection() {
    try {
      const raw = localStorage.getItem(CARDS_SCOPE_MULTI_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids.filter((id) => subjects.some((s) => s.id === id)) : [];
    } catch (e) {
      return [];
    }
  }
  function saveCardsMultiSelection(ids) {
    localStorage.setItem(CARDS_SCOPE_MULTI_KEY, JSON.stringify(ids));
  }

  /** Périmètre d'affichage/recherche de la page Fiches (item 12) — distinct
   *  de la matière choisie pour la CRÉATION d'une nouvelle fiche
   *  (`cardsSubjectSelectEl`, qui doit toujours rester une matière réelle
   *  unique) : par défaut "cette matière" suit ce choix, mais peut être
   *  élargi à un dossier entier, toutes les matières, ou une sélection
   *  libre, sans changer où atterrit une nouvelle fiche. */
  function cardsScopeCards() {
    if (cardsScopeFilter === CARDS_SCOPE_CURRENT) return subjectCards();
    if (cardsScopeFilter === ALL_SUBJECTS) return cards.filter((c) => !c.deleted);
    if (cardsScopeFilter === CARDS_SCOPE_MULTI) {
      const set = new Set(loadCardsMultiSelection());
      return cards.filter((c) => !c.deleted && set.has(c.subject));
    }
    if (typeof cardsScopeFilter === "string" && cardsScopeFilter.startsWith("folder:")) {
      const set = new Set(subjectIdsInFolder(cardsScopeFilter.slice(7)));
      return cards.filter((c) => !c.deleted && set.has(c.subject));
    }
    return cards.filter((c) => !c.deleted && c.subject === cardsScopeFilter);
  }

  function renderCardsScopeSelect() {
    const sel = el("cards-scope-select");
    if (!sel) return;
    const prev = sel.value || cardsScopeFilter;
    const folderOpts = folders
      .map((f) => ({ f, path: folderPath(f.id).map((p) => p.name).join(" / ") }))
      .sort((a, b) => a.path.localeCompare(b.path, "fr"))
      .map(({ f, path }) => `<option value="folder:${f.id}">📁 ${escapeHtml(path)}</option>`)
      .join("");
    sel.innerHTML =
      `<option value="${CARDS_SCOPE_CURRENT}">Cette matière</option>` +
      `<option value="${ALL_SUBJECTS}">Toutes les matières</option>` +
      folderOpts +
      subjects.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("") +
      `<option value="${CARDS_SCOPE_MULTI}">☑️ Sélection de matières et dossiers…</option>`;
    const isFolderOpt = typeof prev === "string" && prev.startsWith("folder:") && folders.some((f) => `folder:${f.id}` === prev);
    const valid = prev === CARDS_SCOPE_CURRENT || prev === ALL_SUBJECTS || prev === CARDS_SCOPE_MULTI || isFolderOpt || subjects.some((s) => s.id === prev);
    cardsScopeFilter = valid ? prev : CARDS_SCOPE_CURRENT;
    sel.value = cardsScopeFilter;
  }

  function openCardsMultiPicker() {
    const picker = el("cards-multi-picker");
    const list = el("cards-multi-picker-list");
    if (!picker || !list) return;
    const selected = new Set(loadCardsMultiSelection());
    list.innerHTML = "";
    renderFolderTreeForPicker(list, ROOT_FOLDER_ID, 0, selected);
    picker.hidden = false;
  }
  function closeCardsMultiPicker() {
    const picker = el("cards-multi-picker");
    if (picker) picker.hidden = true;
  }
  const cardsScopeSelectEl = el("cards-scope-select");
  if (cardsScopeSelectEl) {
    cardsScopeSelectEl.addEventListener("change", () => {
      if (cardsScopeSelectEl.value === CARDS_SCOPE_MULTI) {
        cardsScopeSelectEl.value = cardsScopeFilter;
        openCardsMultiPicker();
        return;
      }
      closeCardsMultiPicker();
      cardsScopeFilter = cardsScopeSelectEl.value;
      renderManageList();
    });
  }
  const cardsMultiPickerCancelBtn = el("cards-multi-picker-cancel");
  if (cardsMultiPickerCancelBtn) cardsMultiPickerCancelBtn.addEventListener("click", closeCardsMultiPicker);
  const cardsMultiPickerConfirmBtn = el("cards-multi-picker-confirm");
  if (cardsMultiPickerConfirmBtn) {
    cardsMultiPickerConfirmBtn.addEventListener("click", () => {
      const resultIds = new Set();
      document.querySelectorAll("#cards-multi-picker-list input:checked").forEach((cb) => {
        if (cb.dataset.kind === "folder") {
          subjectIdsInFolder(cb.value).forEach((id) => resultIds.add(id));
        } else {
          resultIds.add(cb.value);
        }
      });
      if (resultIds.size === 0) {
        alert("Choisis au moins une matière ou un dossier.");
        return;
      }
      saveCardsMultiSelection([...resultIds]);
      closeCardsMultiPicker();
      cardsScopeFilter = CARDS_SCOPE_MULTI;
      if (cardsScopeSelectEl) cardsScopeSelectEl.value = CARDS_SCOPE_MULTI;
      renderManageList();
    });
  }

  function renderManageList() {
    renderCardsScopeSelect();
    let visible = cardsScopeCards();
    const showSubjectNames = cardsScopeFilter !== CARDS_SCOPE_CURRENT;
    if (cardsConstructionFilter) {
      visible = visible.filter((c) => c.underConstruction);
    }
    if (cardsSearchQuery) {
      const q = cardsSearchQuery.toLowerCase();
      // Recherche sur le texte brut (item 13 : question/réponse sont
      // maintenant du HTML) — sinon une mise en forme au milieu du mot
      // recherché (ex. "Pa<b>ri</b>s") empêcherait de le retrouver.
      visible = visible.filter(
        (c) => stripHtmlFast(c.question).toLowerCase().includes(q) || stripHtmlFast(c.answer).toLowerCase().includes(q)
      );
    }
    totalCountEl.textContent = String(visible.length);
    cardListEl.innerHTML = "";
    renderSubjectManageList();

    // Badge de la pastille 🚧 : nombre de fiches "chantier" dans le
    // périmètre actuel (avant filtrage recherche/chantier, pour rester stable).
    const constructionCount = cardsScopeCards().filter((c) => c.underConstruction).length;
    const badge = el("construction-filter-badge");
    if (badge) {
      badge.hidden = constructionCount === 0;
      badge.textContent = String(constructionCount);
    }
    if (constructionFilterBtn) constructionFilterBtn.classList.toggle("is-active", cardsConstructionFilter);

    if (visible.length === 0) {
      const li = document.createElement("li");
      li.className = "list-empty";
      li.textContent = cardsSearchQuery
        ? "Aucune fiche ne correspond à cette recherche."
        : cardsConstructionFilter
        ? "Aucune fiche « chantier » dans ce périmètre."
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
      q.innerHTML = (card.underConstruction ? "🚧 " : "") + toDisplayHtml(card.question);

      const a = document.createElement("p");
      a.className = "card-row-a";
      a.innerHTML = toDisplayHtml(card.answer);

      const meta = document.createElement("p");
      meta.className = "card-row-meta";
      // Nom de la matière (item 11) : seulement utile quand la liste mélange
      // plusieurs matières (dossier / toutes / sélection) — inutile et
      // redondant quand on est déjà filtré sur "cette matière".
      const dueLabel = SM2.isDue(card)
        ? "à revoir aujourd'hui"
        : `prochaine question dans ${formatInterval(daysUntil(card.dueDate))}`;
      meta.textContent = showSubjectNames ? `${subjectName(card.subject)} — ${dueLabel}` : dueLabel;

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

      const constructionBtn = document.createElement("button");
      constructionBtn.className = "icon-btn" + (card.underConstruction ? " is-active-construction" : "");
      constructionBtn.type = "button";
      constructionBtn.textContent = "🚧";
      constructionBtn.title = card.underConstruction ? "Retirer le statut « chantier »" : "Marquer « chantier » (fiche à corriger)";
      constructionBtn.addEventListener("click", () => toggleUnderConstruction(card.id));

      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn icon-btn--danger";
      delBtn.type = "button";
      delBtn.textContent = "suppr.";
      delBtn.addEventListener("click", () => deleteCard(card.id));

      actions.appendChild(editBtn);
      actions.appendChild(constructionBtn);

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

  /** Bascule le statut "chantier" (item 16) : fiche à corriger, signalée
   *  par une petite barrière 🚧 partout où elle apparaît. */
  async function toggleUnderConstruction(id) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    const updated = touch({ ...card, underConstruction: !card.underConstruction });
    await persist(updated);
    const idx = cards.findIndex((c) => c.id === id);
    if (idx >= 0) cards[idx] = updated;
    syncCardEverywhere(updated);
    renderAll();
  }

  async function deleteCard(id, skipConfirm) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    if (!skipConfirm && !confirm("Supprimer définitivement cette fiche ? Cette action est irréversible.")) {
      return;
    }
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
     Import / export JSON (item 8 : sélecteur de matière dédié à l'export,
     indépendant de la page Réviser).
  --------------------------------------------------------- */
  const exportSubjectSelectEl = el("export-subject-select");
  const settingsIoCountEl = el("settings-io-count");

  function renderExportSubjectSelect() {
    if (!exportSubjectSelectEl) return;
    const prev = exportSubjectSelectEl.value;
    exportSubjectSelectEl.innerHTML = subjects
      .map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`)
      .join("");
    exportSubjectSelectEl.value = subjects.some((s) => s.id === prev) ? prev : currentSubjectId;
    updateExportCount();
  }
  function updateExportCount() {
    if (!settingsIoCountEl || !exportSubjectSelectEl) return;
    const n = cards.filter((c) => !c.deleted && c.subject === exportSubjectSelectEl.value).length;
    settingsIoCountEl.textContent = String(n);
  }
  if (exportSubjectSelectEl) {
    exportSubjectSelectEl.addEventListener("change", updateExportCount);
  }

  exportBtn.addEventListener("click", () => {
    const exportSubjectId = exportSubjectSelectEl ? exportSubjectSelectEl.value : currentSubjectId;
    const subj = subjects.find((s) => s.id === exportSubjectId);
    const exportCards = cards.filter((c) => !c.deleted && c.subject === exportSubjectId);
    const blob = new Blob([JSON.stringify(exportCards, null, 2)], {
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
  const STATS_MULTI_ID = "__stats_multi__";
  const STATS_MULTI_SELECTION_KEY = "fiches_stats_multi_ids";
  function loadStatsMultiSelection() {
    try {
      const raw = localStorage.getItem(STATS_MULTI_SELECTION_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids.filter((id) => subjects.some((s) => s.id === id)) : [];
    } catch (e) {
      return [];
    }
  }
  function saveStatsMultiSelection(ids) {
    localStorage.setItem(STATS_MULTI_SELECTION_KEY, JSON.stringify(ids));
  }

  /** Étend le sélecteur Stats (item 15) : matières individuelles (comme
   *  avant), mais aussi des dossiers entiers ("folder:<id>", toutes les
   *  matières qu'ils contiennent, sous-dossiers compris) et une sélection
   *  libre combinant plusieurs matières et/ou dossiers. */
  function renderStatsSubjectSelect() {
    if (!statsSubjectSelectEl) return;
    const prev = statsSubjectSelectEl.value || statsSubjectFilter;
    const folderOpts = folders
      .map((f) => ({ f, path: folderPath(f.id).map((p) => p.name).join(" / ") }))
      .sort((a, b) => a.path.localeCompare(b.path, "fr"))
      .map(({ f, path }) => `<option value="folder:${f.id}">📁 ${escapeHtml(path)}</option>`)
      .join("");
    statsSubjectSelectEl.innerHTML =
      `<option value="${ALL_SUBJECTS}">Toutes catégories confondues</option>` +
      folderOpts +
      subjects.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("") +
      `<option value="${STATS_MULTI_ID}">☑️ Sélection de matières et dossiers…</option>`;
    const isFolderOpt = typeof prev === "string" && prev.startsWith("folder:") && folders.some((f) => `folder:${f.id}` === prev);
    const valid = prev === ALL_SUBJECTS || prev === STATS_MULTI_ID || isFolderOpt || subjects.some((s) => s.id === prev);
    statsSubjectFilter = valid ? prev : ALL_SUBJECTS;
    statsSubjectSelectEl.value = statsSubjectFilter;
  }

  /** Fiches (non supprimées) dans le périmètre choisi pour l'onglet Stats. */
  function statsScopeCards() {
    if (statsSubjectFilter === ALL_SUBJECTS) {
      return cards.filter((c) => !c.deleted);
    }
    if (statsSubjectFilter === STATS_MULTI_ID) {
      const set = new Set(loadStatsMultiSelection());
      return cards.filter((c) => !c.deleted && set.has(c.subject));
    }
    if (typeof statsSubjectFilter === "string" && statsSubjectFilter.startsWith("folder:")) {
      const set = new Set(subjectIdsInFolder(statsSubjectFilter.slice(7)));
      return cards.filter((c) => !c.deleted && set.has(c.subject));
    }
    return cards.filter((c) => !c.deleted && c.subject === statsSubjectFilter);
  }

  /** Mêmes identifiants de matières que statsScopeCards, mais pour filtrer
   *  le journal des notes (ratingLog), qui référence subjectId et non les
   *  fiches elles-mêmes (une fiche déplacée entre-temps ne fausse donc pas
   *  l'historique : chaque entrée garde la matière qu'elle avait au moment
   *  de la notation). */
  function statsScopeSubjectIds() {
    if (statsSubjectFilter === ALL_SUBJECTS) return null; // signifie "toutes"
    if (statsSubjectFilter === STATS_MULTI_ID) return new Set(loadStatsMultiSelection());
    if (typeof statsSubjectFilter === "string" && statsSubjectFilter.startsWith("folder:")) {
      return new Set(subjectIdsInFolder(statsSubjectFilter.slice(7)));
    }
    return new Set([statsSubjectFilter]);
  }

  function openStatsMultiPicker() {
    const picker = el("stats-multi-picker");
    const list = el("stats-multi-picker-list");
    if (!picker || !list) return;
    const selected = new Set(loadStatsMultiSelection());
    list.innerHTML = "";
    renderFolderTreeForPicker(list, ROOT_FOLDER_ID, 0, selected);
    picker.hidden = false;
  }
  function closeStatsMultiPicker() {
    const picker = el("stats-multi-picker");
    if (picker) picker.hidden = true;
  }
  const statsMultiPickerCancelBtn = el("stats-multi-picker-cancel");
  if (statsMultiPickerCancelBtn) statsMultiPickerCancelBtn.addEventListener("click", closeStatsMultiPicker);
  const statsMultiPickerConfirmBtn = el("stats-multi-picker-confirm");
  if (statsMultiPickerConfirmBtn) {
    statsMultiPickerConfirmBtn.addEventListener("click", () => {
      const resultIds = new Set();
      document.querySelectorAll("#stats-multi-picker-list input:checked").forEach((cb) => {
        if (cb.dataset.kind === "folder") {
          subjectIdsInFolder(cb.value).forEach((id) => resultIds.add(id));
        } else {
          resultIds.add(cb.value);
        }
      });
      if (resultIds.size === 0) {
        alert("Choisis au moins une matière ou un dossier.");
        return;
      }
      saveStatsMultiSelection([...resultIds]);
      closeStatsMultiPicker();
      statsSubjectFilter = STATS_MULTI_ID;
      if (statsSubjectSelectEl) statsSubjectSelectEl.value = STATS_MULTI_ID;
      renderStats();
    });
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

  /** Historique des fiches RÉVISÉES par jour passé (item 7) — analogue à
   *  computeDueHistogram mais tournée vers le passé (index 0 = aujourd'hui,
   *  index i = il y a i jours) et basée sur `lastReviewed` plutôt que
   *  `dueDate`. Les dates portées par chaque case restent des vraies dates
   *  (comme pour l'histogramme "à réviser"), donc `renderHistogramInto` -
   *  qui ne fait que lire ces dates pour ses repères (Auj., jours de la
   *  semaine, 1er du mois...) - fonctionne à l'identique sans rien changer. */
  function computeReviewedHistogram(pool, days) {
    const today = startOfDay(new Date());
    const buckets = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.push({ date: d, count: 0 });
    }
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() - days);

    for (const c of pool) {
      if (!c.lastReviewed) continue;
      const rev = startOfDay(new Date(c.lastReviewed));
      if (rev.getTime() > today.getTime()) continue;
      if (rev.getTime() <= horizon.getTime()) continue;
      const offset = Math.round((today.getTime() - rev.getTime()) / 86400000);
      if (offset >= 0 && offset < days) buckets[offset].count += 1;
    }
    return buckets;
  }

  const MONTH_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  // Index 0 = dimanche (convention JS Date#getDay()).
  const WEEKDAY_SHORT = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
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
  function renderHistogramInto(chartEl, emptyEl, wrapEl, pool, rangeKey, maxBarPx, computeFn, todayAtEnd) {
    if (!chartEl) return;
    const cfg = RANGE_CONFIG[rangeKey] || { visible: rangeKey, total: rangeKey };
    const days = cfg.total;
    let buckets = (computeFn || computeDueHistogram)(pool, days);
    // Historique des fiches révisées (item 21) : présent à droite, passé à
    // gauche — sens inverse du graphique "à revoir" (présent à gauche,
    // futur à droite). On inverse simplement l'ordre des colonnes déjà
    // calculées (index 0 = aujourd'hui devient la DERNIÈRE colonne) plutôt
    // que de dupliquer toute la logique de calcul.
    if (todayAtEnd) buckets = [...buckets].reverse();
    const todayIdx = todayAtEnd ? buckets.length - 1 : 0;
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
        "chart-col" + (i === todayIdx ? " is-today" : "") + (changed ? " chart-col--changed" : "");
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
      // "Auj." prioritaire sur la colonne d'aujourd'hui ; puis, sur les
      // échelles rapprochées (15j / 1 mois), le jour de la semaine abrégé
      // pour les 7 jours suivants (item 11) ; sinon, repères de date à date
      // fixe pour se répérer dans le défilement : le 1er ET le 15 du mois
      // sur les échelles rapprochées, seulement le 1er du mois sur les
      // échelles larges (3 mois / 1 an) où le 15 ajouterait surtout du
      // bruit visuel vu la densité des colonnes.
      const dom = b.date.getDate();
      const fineScale = rangeKey === 15 || rangeKey === 30;
      const coarseScale = rangeKey === 90 || rangeKey === 365;
      if (i === todayIdx) {
        label.textContent = "Auj.";
      } else if (fineScale && Math.abs(i - todayIdx) <= 7) {
        label.textContent = WEEKDAY_SHORT[b.date.getDay()];
      } else if ((fineScale && (dom === 1 || dom === 15)) || (coarseScale && dom === 1)) {
        label.textContent = formatShortDateLabel(b.date);
      } else {
        label.textContent = "";
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

  /** Second histogramme de la page Stats (item 7) : historique des fiches
   *  révisées, plutôt que celles à venir — mêmes échelles (tap pour
   *  cycler), état indépendant du premier graphique. */
  let reviewedChartRangeDays = 15;
  const reviewedChartEl = el("reviewed-chart");
  const reviewedChartEmptyEl = el("reviewed-chart-empty");
  const reviewedChartWrapEl = el("reviewed-chart-wrap");
  function renderReviewedChart() {
    const pool = statsScopeCards();
    renderHistogramInto(
      reviewedChartEl,
      reviewedChartEmptyEl,
      reviewedChartWrapEl,
      pool,
      reviewedChartRangeDays,
      CHART_MAX_BAR_PX,
      computeReviewedHistogram,
      true // todayAtEnd (item 21) : présent à droite, passé à gauche
    );
  }
  function cycleReviewedChartRange() {
    const idx = REVIEW_CHART_STEPS.indexOf(reviewedChartRangeDays);
    reviewedChartRangeDays = REVIEW_CHART_STEPS[(idx + 1) % REVIEW_CHART_STEPS.length];
    renderReviewedChart();
  }
  if (reviewedChartWrapEl) reviewedChartWrapEl.addEventListener("click", cycleReviewedChartRange);

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
    renderReviewedChart();
    renderRatingsChart();
    renderRatingsHistoryChart();
    renderStreak();
    renderPeriodCounts();
  }

  /** Histogramme "Notes données" — sur la période partagée choisie plus
   *  haut (item 6 : aujourd'hui/hier/semaine/mois/3 mois/6 mois/an), au lieu
   *  des 3 anciens onglets Global/Aujourd'hui/7 jours. Basé sur `ratingLog`
   *  (un événement par notation, indépendant de l'état actuel des fiches)
   *  plutôt que sur les fiches elles-mêmes. */
  const WEEKDAY_FULL = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  let statsPeriod = "week";

  /** Convertit un choix de période (item 6) en plage de dates [start, end[
   *  — end exclusive (début du lendemain de la borne haute). */
  function periodToRange(period) {
    const today = startOfDay(new Date());
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    const start = new Date(today);
    switch (period) {
      case "today":
        break;
      case "yesterday":
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case "week":
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start.setDate(start.getDate() - 30);
        break;
      case "3months":
        start.setDate(start.getDate() - 90);
        break;
      case "6months":
        start.setDate(start.getDate() - 180);
        break;
      case "year":
        start.setDate(start.getDate() - 365);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    return { start, end };
  }

  function filterEntriesByPeriod(entries, period) {
    const { start, end } = periodToRange(period);
    return entries.filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
  }

  function ratingLogInScope() {
    const scopeIds = statsScopeSubjectIds();
    return scopeIds === null ? ratingLog : ratingLog.filter((e) => scopeIds.has(e.subjectId));
  }

  function ratingCountsFor(entries) {
    const counts = { again: 0, hard: 0, good: 0, easy: 0 };
    entries.forEach((e) => {
      if (counts[e.rating] !== undefined) counts[e.rating] += 1;
    });
    return counts;
  }

  function renderRatingsSimpleChart(wrap, entries, ratings) {
    const counts = ratingCountsFor(entries);
    const total = ratings.reduce((sum, r) => sum + counts[r], 0);
    if (total === 0) {
      wrap.innerHTML = `<p class="field-hint algo-chart-empty">Aucune note enregistrée sur cette période.</p>`;
      return;
    }
    const max = Math.max(1, ...ratings.map((r) => counts[r]));
    const yMax = Math.max(4, Math.ceil(max * 1.15));
    const W = 320, H = 190, padL = 26, padB = 26, padT = 14, padR = 12;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const gap = plotW / ratings.length;
    const barW = gap * 0.55;
    const yPos = (v) => padT + (1 - v / yMax) * plotH;

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:var(--desk);border-radius:8px;">`;
    svg += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="rgba(247,241,225,0.3)" stroke-width="1"/>`;
    ratings.forEach((r, i) => {
      const v = counts[r];
      const h = (v / yMax) * plotH;
      const x = padL + gap * i + (gap - barW) / 2;
      const y = H - padB - h;
      svg += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(1, h)}" rx="4" fill="${ALGO_CHART_COLORS[r]}"/>`;
      svg += `<text x="${x + barW / 2}" y="${y - 5}" font-size="10" fill="${ALGO_CHART_COLORS[r]}" text-anchor="middle" font-family="var(--font-mono)">${v}</text>`;
      svg += `<text x="${x + barW / 2}" y="${H - padB + 14}" font-size="9" fill="#9aa89e" text-anchor="middle">${ALGO_CHART_RATING_LABELS[r]}</text>`;
    });
    svg += `</svg>`;
    wrap.innerHTML = svg;
  }

  function renderRatingsChart() {
    const wrap = el("ratings-chart-wrap");
    if (!wrap) return;
    const scoped = ratingLogInScope();
    const filtered = filterEntriesByPeriod(scoped, statsPeriod);
    renderRatingsSimpleChart(wrap, filtered, ["again", "hard", "good", "easy"]);
  }

  /* ---------------------------------------------------------
     Évolution des notes dans le temps (item 6) : histogramme à barres
     empilées en pourcentage, avec des cases à cocher pour choisir quelles
     notes combiner dans une même barre (ex. cocher seulement 🙂 et 😎 pour
     voir leur part combinée plutôt que les 4 séparément).
  --------------------------------------------------------- */
  let ratingsHistoryVisible = { again: true, hard: true, good: true, easy: true };

  function bucketEntriesByPeriod(entries, start, end, numBuckets) {
    const totalMs = end.getTime() - start.getTime();
    const bucketMs = totalMs / numBuckets;
    const buckets = Array.from({ length: numBuckets }, () => ({ again: 0, hard: 0, good: 0, easy: 0 }));
    entries.forEach((e) => {
      const t = new Date(e.at).getTime();
      if (t < start.getTime() || t >= end.getTime()) return;
      let idx = Math.floor((t - start.getTime()) / bucketMs);
      if (idx >= numBuckets) idx = numBuckets - 1;
      if (idx < 0) idx = 0;
      if (buckets[idx][e.rating] !== undefined) buckets[idx][e.rating] += 1;
    });
    return buckets;
  }

  function renderRatingsHistoryChart() {
    const wrap = el("ratings-history-chart-wrap");
    if (!wrap) return;
    const scoped = ratingLogInScope();
    const { start, end } = periodToRange(statsPeriod);
    const filtered = filterEntriesByPeriod(scoped, statsPeriod);
    const ratings = ["again", "hard", "good", "easy"];
    const visibleRatings = ratings.filter((r) => ratingsHistoryVisible[r]);

    const legend = ratings
      .map(
        (r) => `<label class="algo-chart-legend-item">
          <input type="checkbox" class="ratings-history-checkbox" data-rating="${r}" ${ratingsHistoryVisible[r] ? "checked" : ""} />
          <span class="algo-chart-legend-dot" style="background:${ALGO_CHART_COLORS[r]}"></span>${ALGO_CHART_RATING_LABELS[r]}
        </label>`
      )
      .join("");

    const wireCheckboxes = () => {
      wrap.querySelectorAll(".ratings-history-checkbox").forEach((cb) => {
        cb.addEventListener("change", () => {
          ratingsHistoryVisible[cb.dataset.rating] = cb.checked;
          renderRatingsHistoryChart();
        });
      });
    };

    if (filtered.length === 0 || visibleRatings.length === 0) {
      const msg = filtered.length === 0 ? "Aucune note enregistrée sur cette période." : "Coche au moins une note pour l'afficher.";
      wrap.innerHTML = `<div class="algo-chart-legend">${legend}</div><p class="field-hint algo-chart-empty">${msg}</p>`;
      wireCheckboxes();
      return;
    }

    const NUM_BUCKETS = 10;
    const buckets = bucketEntriesByPeriod(filtered, start, end, NUM_BUCKETS);

    const W = 320, H = 200, padL = 28, padB = 14, padT = 10, padR = 8;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const bucketW = plotW / NUM_BUCKETS;
    const barW = bucketW * 0.7;

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:var(--desk);border-radius:8px;">`;
    [0, 50, 100].forEach((pct) => {
      const y = padT + (1 - pct / 100) * plotH;
      svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(247,241,225,0.1)" stroke-width="1"/>`;
      svg += `<text x="${padL - 4}" y="${y + 3}" font-size="7" fill="#9aa89e" text-anchor="end">${pct}%</text>`;
    });

    buckets.forEach((b, i) => {
      const x = padL + bucketW * i + (bucketW - barW) / 2;
      const totalVisible = visibleRatings.reduce((s, r) => s + b[r], 0);
      if (totalVisible === 0) return;
      let yCursor = padT + plotH;
      visibleRatings.forEach((r) => {
        const share = b[r] / totalVisible;
        const segH = share * plotH;
        const y = yCursor - segH;
        if (segH > 0) svg += `<rect x="${x}" y="${y}" width="${barW}" height="${segH}" fill="${ALGO_CHART_COLORS[r]}"/>`;
        yCursor = y;
      });
    });
    svg += `</svg>`;

    wrap.innerHTML = `<div class="algo-chart-legend">${legend}</div>${svg}`;
    wireCheckboxes();
  }

  /* ---------------------------------------------------------
     🔥 Flammes / jours d'utilisation (item 6) : toujours calculées sur les
     30 derniers jours, indépendamment de la période choisie plus haut (un
     "streak" n'a pas vraiment de sens limité à "aujourd'hui" par exemple).
  --------------------------------------------------------- */
  function computeStreakData(scopeIds) {
    const today = startOfDay(new Date());
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    const hotSet = new Set();
    ratingLog.forEach((e) => {
      if (scopeIds !== null && !scopeIds.has(e.subjectId)) return;
      hotSet.add(startOfDay(new Date(e.at)).getTime());
    });
    const hotDays = days.map((d) => hotSet.has(d.getTime()));
    let streak = 0;
    for (let i = hotDays.length - 1; i >= 0; i--) {
      if (hotDays[i]) streak++;
      else break;
    }
    return { days, hotDays, streak };
  }

  function renderStreak() {
    const summaryEl = el("streak-summary");
    const streakChartEl = el("streak-chart-wrap");
    if (!summaryEl || !streakChartEl) return;
    const scopeIds = statsScopeSubjectIds();
    const { days, hotDays, streak } = computeStreakData(scopeIds);
    summaryEl.innerHTML = `<span class="streak-number">🔥 ${streak}</span><span>jour${streak > 1 ? "s" : ""} d'affilée</span>`;
    const todayIdx = days.length - 1;
    const cells = days
      .map((d, i) => `<div class="streak-day${hotDays[i] ? " is-hot" : ""}${i === todayIdx ? " is-today" : ""}" title="${formatShortDateLabel(d)}"></div>`)
      .join("");
    streakChartEl.innerHTML = `<div class="streak-row">${cells}</div>`;
  }

  /* ---------------------------------------------------------
     Compteurs "fiches créées" / "fiches révisées" sur la période choisie
     (item 6).
  --------------------------------------------------------- */
  function renderPeriodCounts() {
    const scopeIds = statsScopeSubjectIds();
    const { start, end } = periodToRange(statsPeriod);
    const createdCount = cards.filter((c) => {
      if (c.deleted) return false;
      if (scopeIds !== null && !scopeIds.has(c.subject)) return false;
      const t = new Date(c.createdAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    const reviewedCount = filterEntriesByPeriod(ratingLogInScope(), statsPeriod).length;
    const createdEl = el("stat-created-period");
    const reviewedEl = el("stat-reviewed-period");
    if (createdEl) createdEl.textContent = String(createdCount);
    if (reviewedEl) reviewedEl.textContent = String(reviewedCount);
  }

  const statsPeriodSelectEl = el("stats-period-select");
  if (statsPeriodSelectEl) {
    statsPeriodSelectEl.value = statsPeriod;
    statsPeriodSelectEl.addEventListener("change", () => {
      statsPeriod = statsPeriodSelectEl.value;
      renderRatingsChart();
      renderRatingsHistoryChart();
      renderPeriodCounts();
    });
  }

  /** Affiche un message de confirmation bien visible, en bas d'écran. */
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3400);
  }

  /** Variante centrée à l'écran (item 3) pour les annonces plus
   *  importantes qu'une simple confirmation discrète (ex. passage en
   *  révision libre) — la version en bas d'écran passait trop inaperçue. */
  function showCenterToast(message) {
    const toast = document.createElement("div");
    toast.className = "app-toast app-toast--center";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3400);
  }

  statsSubjectSelectEl.addEventListener("change", () => {
    if (statsSubjectSelectEl.value === STATS_MULTI_ID) {
      statsSubjectSelectEl.value = statsSubjectFilter;
      openStatsMultiPicker();
      return;
    }
    closeStatsMultiPicker();
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

  /** Anime en vague, de gauche à droite, toutes les colonnes entre
   *  `fromIdx` (aujourd'hui) et `toIdx` (nouvelle date de la fiche notée) —
   *  item 9 : chaque barre s'allume l'une après l'autre (léger décalage) et
   *  grossit brièvement avant de revenir à sa taille normale. Ne fait rien
   *  si l'échelle actuelle du mini graphique ne montre pas encore jusqu'à
   *  `toIdx` (fiche renvoyée hors de l'écran affiché) ou si le graphique
   *  est vide (rien à animer). */
  function triggerReviewChartWave(fromIdx, toIdx) {
    if (!reviewChartEl) return;
    const cols = reviewChartEl.querySelectorAll(".chart-col");
    if (cols.length === 0) return;
    const lo = Math.max(0, Math.min(fromIdx, toIdx));
    const hi = Math.min(cols.length - 1, Math.max(fromIdx, toIdx));
    const span = hi - lo;
    const STEP_MS = 55; // décalage entre deux barres consécutives de la vague
    for (let i = lo; i <= hi; i++) {
      const bar = cols[i].querySelector(".chart-bar");
      if (!bar) continue;
      const delay = (i - lo) * STEP_MS;
      // Repart d'un état neutre avant de rejouer l'animation, au cas où une
      // vague précédente serait encore en cours sur cette même barre.
      bar.classList.remove("chart-bar-wave");
      void bar.offsetWidth;
      bar.style.animationDelay = `${delay}ms`;
      bar.classList.add("chart-bar-wave");
      bar.addEventListener(
        "animationend",
        () => {
          bar.classList.remove("chart-bar-wave");
          bar.style.animationDelay = "";
        },
        { once: true }
      );
    }
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

  const SHOW_RATING_DAYS_KEY = "fiches_show_rating_days";
  function loadShowRatingDays() {
    const raw = localStorage.getItem(SHOW_RATING_DAYS_KEY);
    return raw === null ? true : raw === "true";
  }
  function saveShowRatingDays(value) {
    localStorage.setItem(SHOW_RATING_DAYS_KEY, String(value));
  }
  function applyShowRatingDays() {
    const ratingRowEl = el("rating-row");
    if (ratingRowEl) ratingRowEl.classList.toggle("hide-days", !loadShowRatingDays());
  }
  const settingShowRatingDaysEl = el("setting-show-rating-days");
  if (settingShowRatingDaysEl) {
    settingShowRatingDaysEl.addEventListener("change", () => {
      saveShowRatingDays(settingShowRatingDaysEl.checked);
      applyShowRatingDays();
    });
  }

  function renderSettingsView() {
    if (settingBonusHardEl) settingBonusHardEl.value = bonusDaysSettings.hard;
    if (settingBonusGoodEl) settingBonusGoodEl.value = bonusDaysSettings.good;
    if (settingBonusEasyEl) settingBonusEasyEl.value = bonusDaysSettings.easy;
    if (settingBonusAgainModeEl) settingBonusAgainModeEl.value = bonusAgainMode;
    if (settingHibernateDaysEl) settingHibernateDaysEl.value = hibernateDays;
    if (settingShowRatingDaysEl) settingShowRatingDaysEl.checked = loadShowRatingDays();
  }

  /* ---------------------------------------------------------
     Page Développeur (item 19)
  --------------------------------------------------------- */
  function saveRatingLabelsFromInputs() {
    const settings = loadDevSettings();
    ["again", "hard", "good", "easy"].forEach((r) => {
      const input = el(`dev-rating-${r}`);
      if (input && input.value.trim()) settings.ratingLabels[r] = input.value.trim();
    });
    saveDevSettings(settings);
    applyRatingLabels();
  }
  function saveNavLabelsFromInputs() {
    const settings = loadDevSettings();
    Object.keys(DEFAULT_NAV_LABELS).forEach((view) => {
      const input = el(`dev-nav-${view}`);
      if (input && input.value.trim()) settings.navLabels[view] = input.value.trim();
    });
    saveDevSettings(settings);
    applyNavLabels();
  }

  ["again", "hard", "good", "easy"].forEach((r) => {
    const input = el(`dev-rating-${r}`);
    if (input) input.addEventListener("change", saveRatingLabelsFromInputs);
  });
  const devRatingResetBtn = el("dev-rating-reset");
  if (devRatingResetBtn) {
    devRatingResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.ratingLabels = { ...DEFAULT_RATING_LABELS };
      saveDevSettings(settings);
      applyRatingLabels();
      renderDevView();
    });
  }
  Object.keys(DEFAULT_NAV_LABELS).forEach((view) => {
    const input = el(`dev-nav-${view}`);
    if (input) input.addEventListener("change", saveNavLabelsFromInputs);
  });
  const devNavResetBtn = el("dev-nav-reset");
  if (devNavResetBtn) {
    devNavResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.navLabels = { ...DEFAULT_NAV_LABELS };
      saveDevSettings(settings);
      applyNavLabels();
      renderDevView();
    });
  }

  /** Éditeur des valeurs "usine" des 3 modes fixes (item 19) : mêmes 12
   *  valeurs discrètes que partout ailleurs (ALGO_K_VALUES/ALGO_M_VALUES),
   *  ici via de simples menus déroulants (page technique, pas besoin de
   *  curseurs tactiles soignés). */
  function renderFactoryDefaultsEditor() {
    const wrap = el("dev-factory-defaults");
    if (!wrap) return;
    const factory = getFactoryDefaults();
    const kOpts = ALGO_K_VALUES.map((v) => `<option value="${v}">${v}</option>`).join("");
    const mOpts = ALGO_M_VALUES.map((v) => `<option value="${v}">${v}</option>`).join("");
    wrap.innerHTML = BUILTIN_MODE_IDS.map((modeId) => {
      const f = factory[modeId];
      const fields = ["Ka", "Kh", "Kg", "Ke", "Ma", "Mh", "Mg", "Me"]
        .map((k) => {
          const isK = k.startsWith("K");
          const opts = isK ? kOpts : mOpts;
          return `<label class="field settings-bonus-field">
            <span>${k}</span>
            <select id="dev-factory-${modeId}-${k}" data-mode="${modeId}" data-key="${k}">${opts}</select>
          </label>`;
        })
        .join("");
      return `<h4 class="settings-block-title">${ALGO_MODE_SHORT_LABELS[modeId]}</h4><div class="algo-grid algo-grid--4">${fields}</div>`;
    }).join("");

    BUILTIN_MODE_IDS.forEach((modeId) => {
      ["Ka", "Kh", "Kg", "Ke", "Ma", "Mh", "Mg", "Me"].forEach((k) => {
        const sel = el(`dev-factory-${modeId}-${k}`);
        if (sel) sel.value = String(factory[modeId][k]);
      });
    });

    wrap.querySelectorAll("select").forEach((sel) => {
      sel.addEventListener("change", () => {
        const settings = loadDevSettings();
        settings.factoryDefaults[sel.dataset.mode][sel.dataset.key] = Number(sel.value);
        saveDevSettings(settings);
      });
    });
  }

  function renderDevView() {
    const labels = loadDevSettings().ratingLabels;
    ["again", "hard", "good", "easy"].forEach((r) => {
      const input = el(`dev-rating-${r}`);
      if (input) input.value = labels[r];
    });
    const navLabels = loadDevSettings().navLabels;
    Object.keys(DEFAULT_NAV_LABELS).forEach((view) => {
      const input = el(`dev-nav-${view}`);
      if (input) input.value = navLabels[view];
    });
    renderFactoryDefaultsEditor();
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
      if (view === "dev") renderDevView();
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
  let unsubscribeSubjectsRealtime = null;
  let unsubscribeFoldersRealtime = null;
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
    if (unsubscribeSubjectsRealtime) unsubscribeSubjectsRealtime();
    if (unsubscribeFoldersRealtime) unsubscribeFoldersRealtime();
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
      await persistSubject(s);
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
      await persistSubject(general);
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

  /** Fusionne une matière reçue de Supabase : adoptée si plus récente que
   *  la version locale, retirée localement si marquée supprimée là-bas
   *  (voir pushSubjectDeleted) — jamais l'inverse (une suppression locale
   *  ne doit pas ressusciter une matière plus récente créée ailleurs). */
  async function mergeRemoteSubject(remote) {
    const idx = subjects.findIndex((s) => s.id === remote.id);
    if (remote.deleted) {
      if (idx >= 0) {
        subjects.splice(idx, 1);
        await DB.removeSubject(remote.id);
        if (currentSubjectId === remote.id) {
          currentSubjectId = subjects[0] ? subjects[0].id : null;
        }
      }
      return;
    }
    const local = idx >= 0 ? subjects[idx] : null;
    if (!local || new Date(remote.updatedAt || 0) > new Date(local.updatedAt || 0)) {
      await DB.putSubject(remote);
      if (idx >= 0) subjects[idx] = remote;
      else subjects.push(remote);
      subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }
  }

  async function mergeRemoteFolder(remote) {
    const idx = folders.findIndex((f) => f.id === remote.id);
    if (remote.deleted) {
      if (idx >= 0) {
        folders.splice(idx, 1);
        await DB.removeFolder(remote.id);
      }
      return;
    }
    const local = idx >= 0 ? folders[idx] : null;
    if (!local || new Date(remote.updatedAt || 0) > new Date(local.updatedAt || 0)) {
      await DB.putFolder(remote);
      if (idx >= 0) folders[idx] = remote;
      else folders.push(remote);
    }
  }

  /** Même logique que reconcileWithRemote (fiches), pour les matières et
   *  les dossiers (item 1/8). Dossiers d'abord : une matière peut référencer
   *  un folderId qu'il vaut mieux avoir déjà en place. */
  async function reconcileSubjectsAndFolders() {
    const remoteFolders = await Sync.pullFolders();
    const remoteFolderById = new Map(remoteFolders.map((r) => [r.id, r]));
    for (const local of folders) {
      const remote = remoteFolderById.get(local.id);
      if (!remote || new Date(local.updatedAt || 0) > new Date(remote.updatedAt || 0)) {
        Sync.pushFolder(local);
      }
    }
    for (const remote of remoteFolders) {
      await mergeRemoteFolder(remote);
    }

    const remoteSubjects = await Sync.pullSubjects();
    const remoteSubjectById = new Map(remoteSubjects.map((r) => [r.id, r]));
    for (const local of subjects) {
      const remote = remoteSubjectById.get(local.id);
      if (!remote || new Date(local.updatedAt || 0) > new Date(remote.updatedAt || 0)) {
        Sync.pushSubject(local);
      }
    }
    for (const remote of remoteSubjects) {
      await mergeRemoteSubject(remote);
    }

    if (subjects.length === 0) {
      const general = newSubject("Général");
      await persistSubject(general);
      subjects = [general];
    }
    if (!currentSubjectId || (!isSentinelSubject(currentSubjectId) && !subjects.some((s) => s.id === currentSubjectId))) {
      currentSubjectId = subjects[0].id;
    }
  }

  async function reconcileWithRemote() {
    await reconcileSubjectsAndFolders();
    renderSubjectSelect();

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
    if (unsubscribeSubjectsRealtime) unsubscribeSubjectsRealtime();
    if (unsubscribeFoldersRealtime) unsubscribeFoldersRealtime();

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

    unsubscribeSubjectsRealtime = Sync.subscribeSubjectsRealtime(async (remote) => {
      await mergeRemoteSubject(remote);
      renderSubjectSelect();
      renderAll();
    });
    unsubscribeFoldersRealtime = Sync.subscribeFoldersRealtime(async (remote) => {
      await mergeRemoteFolder(remote);
      renderSubjectManageList();
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
      if (el("view-stats") && el("view-stats").classList.contains("is-active")) { renderDueChart(); renderReviewedChart(); }
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
    applyRatingLabels();
    applyNavLabels();
    applyShowRatingDays();
    await loadSubjects();
    cards = await DB.getAll();
    ratingLog = await DB.getAllRatingLog();
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
