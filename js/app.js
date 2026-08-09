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
  /** id de la matière actuellement affichée */
  let currentSubjectId = null;
  const CURRENT_SUBJECT_KEY = "fiches_current_subject";

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
  const REVIEW_CHART_STEPS = [15, 30, 90, 182, 365];
  const REVIEW_CHART_MAX_BAR_PX = 100;
  let reviewChartRangeDays = 15;

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

  /** Appelée après chaque changement d'échéance issu d'une vraie révision
   *  (algorithme SM-2 normal ou mode bonus — pas l'hibernation, qui ne
   *  compte volontairement pas comme une révision). Met à jour le record
   *  personnel de la fiche (conservé pour historique / usages futurs). */
  function trackCardInterval(card, intervalDays) {
    if (!Number.isFinite(intervalDays)) return;
    card.maxIntervalReached = Math.max(card.maxIntervalReached || 0, intervalDays);
  }

  /* ---------------------------------------------------------
     Tamagotchi : un compagnon qui grandit fiche après fiche.

     Mécanique des cadeaux : sur le mini histogramme de la page Réviser
     (fiches dues par jour, matière en cours), dès qu'une colonne atteint
     un certain nombre de fiches dues ce jour-là, un petit cadeau 🎁
     apparaît sur cette barre — à aller chercher d'un coup de pouce.
     L'ouvrir tire un emoji dans le pool du besoin le plus bas du moment
     (manger / boire / dormir / jouer / copains / se soigner) : le type
     d'emoji obtenu détermine donc quel besoin est comblé.

     Le compagnon grandit dès qu'il a cumulé assez de "bons jours" —
     des jours où tous ses besoins sont restés bien remplis. Un jour
     moins bon ne le fait pas régresser, il met juste sa croissance en
     pause : rien de punitif, juste un encouragement à revenir régulièrement.

     État synchronisé (une ligne JSON par code de synchro, voir js/sync.js) :
     `tamaState` (besoins, jours cumulés, dates) et `tamaGifts` (cadeaux
     déjà repérés/ouverts, par matière + date).
  --------------------------------------------------------- */
  const TAMA_STATE_KEY = "fiches_tama_state";
  const TAMA_GIFTS_KEY = "fiches_tama_gifts";

  const NEED_KEYS = ["manger", "boire", "dormir", "jouer", "copains", "soigner"];
  const NEED_LABELS = {
    manger: "Manger",
    boire: "Boire",
    dormir: "Dormir",
    jouer: "Jouer",
    copains: "Copains",
    soigner: "Se soigner",
  };
  const NEED_ICONS = {
    manger: "🍽️",
    boire: "🥤",
    dormir: "😴",
    jouer: "🎲",
    copains: "🐾",
    soigner: "💊",
  };

  /* 6 besoins x 32 emoji, découpés en 4 tranches de 8 (commune / rare /
     épique / légendaire) : la tranche pioche selon la rareté du cadeau,
     le besoin selon ce qui manque le plus au compagnon à ce moment-là. */
  const NEED_EMOJI_POOLS = {
    manger: ["🍎","🍏","🍊","🍋","🍌","🍉","🍇","🍓","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🥕","🌽","🥒","🥦","🍞","🥐","🥖","🧀","🍕","🍔","🍣","🍰","🎂","🍫","🍩","🍯"],
    boire: ["☕","🍵","🧃","🥤","🥛","🧋","🍶","🫖","🥥","🍹","🧉","🍯","🫙","🚰","💧","🌊","🍧","🍦","🧊","❄️","☃️","🌨️","🌧️","⛲","🍾","🥂","🌈","✨","💫","🫗","🔮","🧪"],
    dormir: ["😴","💤","🛌","🛏️","🌙","🌛","🌜","🌚","🧸","🕯️","🌌","⭐","✨","🌟","☁️","🫧","🦉","🐨","🌠","🪐","🌃","🎐","🪄","🔮","👑","🌈","🧚","🪶","🕊️","🦢","🪺","🌙"],
    jouer: ["⚽","🏀","🎾","🏓","🏸","🎳","🎯","🎲","🧩","🪀","🪁","🎮","🕹️","🎨","🖍️","🎭","🎡","🎢","🎠","🎪","🎉","🎊","🥳","🎆","🏆","🥇","🎖️","🏅","🌟","✨","🎇","🎁"],
    copains: ["🐶","🐱","🐰","🐹","🐻","🐼","🐨","🦊","🐸","🐵","🐔","🐧","🦄","🐴","🐷","🐮","🦋","🐝","🐢","🐬","🦁","🐯","🦒","🐘","🧑‍🤝‍🧑","👫","👭","👬","💞","❤️","🫂","🎈"],
    soigner: ["🩹","💊","🌡️","🩺","🧴","🧼","🪥","🧽","🧻","🚿","🛁","🧺","🩸","💉","🧬","🔬","🍀","🌿","🌱","🍃","🧘","🧘‍♀️","☮️","🕉️","💚","🫶","🩷","✨","🌈","🦋","🕊️","👼"],
  };

  const GIFT_TIERS = ["commune", "rare", "epique", "legendaire"];
  const GIFT_TIER_RANK = { commune: 0, rare: 1, epique: 2, legendaire: 3 };
  /* Nombre de fiches dues ce jour-là (hauteur de la barre) nécessaire pour
     qu'un cadeau de ce niveau apparaisse sur la colonne. */
  const GIFT_TIER_DUE_THRESHOLDS = { commune: 5, rare: 15, epique: 30, legendaire: 50 };
  /* Points de besoin rendus à l'ouverture, selon le niveau du cadeau. */
  const GIFT_TIER_BOOST = { commune: 15, rare: 25, epique: 40, legendaire: 60 };

  const HEALTHY_NEED_THRESHOLD = 50; // seuil "besoin bien rempli"
  const NEED_DECAY_PER_DAY = 10; // baisse quotidienne de chaque besoin

  /** Étapes de croissance, débloquées par nombre cumulé de "bons jours"
   *  (pas forcément consécutifs — un jour moins bon met juste en pause). */
  const GROWTH_STAGES = [
    { minGoodDays: 0, emoji: "🥚", name: "Œuf" },
    { minGoodDays: 3, emoji: "🐣", name: "Poussin" },
    { minGoodDays: 7, emoji: "🐥", name: "Bébé" },
    { minGoodDays: 14, emoji: "🐦", name: "Ado" },
    { minGoodDays: 30, emoji: "🦋", name: "Adulte" },
    { minGoodDays: 60, emoji: "🦄", name: "Légende" },
  ];

  function defaultTamaState() {
    const needs = {};
    NEED_KEYS.forEach((k) => (needs[k] = 80));
    const today = todayISODate();
    return {
      needs,
      goodDaysCount: 0,
      lastDecayDate: today,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  let tamaState = null;
  /** { "<subjectId>::<dateISO>": { tier, opened, need, emoji, openedAt } } */
  let tamaGifts = {};
  let tamaSyncUnsub = null;

  function todayISODate() {
    return startOfDay(new Date()).toISOString().slice(0, 10);
  }

  function loadTamaState() {
    try {
      const raw = localStorage.getItem(TAMA_STATE_KEY);
      tamaState = raw ? JSON.parse(raw) : null;
    } catch {
      tamaState = null;
    }
    if (!tamaState || !tamaState.needs) {
      tamaState = defaultTamaState();
      saveTamaState(); // sinon rien n'est persisté avant une première action
    }
  }

  function saveTamaState() {
    tamaState.updatedAt = new Date().toISOString();
    localStorage.setItem(TAMA_STATE_KEY, JSON.stringify(tamaState));
  }

  function loadTamaGifts() {
    try {
      const raw = localStorage.getItem(TAMA_GIFTS_KEY);
      tamaGifts = raw ? JSON.parse(raw) : {};
    } catch {
      tamaGifts = {};
    }
  }

  function saveTamaGifts() {
    localStorage.setItem(TAMA_GIFTS_KEY, JSON.stringify(tamaGifts));
  }

  /** Fait avancer l'horloge du compagnon jusqu'à aujourd'hui : pour chaque
   *  jour calendaire écoulé depuis le dernier passage, vérifie si la
   *  veille était un "bon jour" (tous les besoins bien remplis) avant de
   *  faire baisser les besoins. Plafonné pour éviter une boucle infinie si
   *  l'appli reste fermée très longtemps. */
  function applyTamaUpkeep() {
    const today = todayISODate();
    let cursor = tamaState.lastDecayDate || today;
    let iterations = 0;
    let changed = false;
    while (cursor < today && iterations < 730) {
      const healthy = NEED_KEYS.every((k) => (tamaState.needs[k] || 0) >= HEALTHY_NEED_THRESHOLD);
      if (healthy) tamaState.goodDaysCount = (tamaState.goodDaysCount || 0) + 1;
      NEED_KEYS.forEach((k) => {
        tamaState.needs[k] = Math.max(0, (tamaState.needs[k] || 0) - NEED_DECAY_PER_DAY);
      });
      const d = new Date(cursor + "T00:00:00");
      d.setDate(d.getDate() + 1);
      cursor = d.toISOString().slice(0, 10);
      iterations += 1;
      changed = true;
    }
    tamaState.lastDecayDate = today;
    if (changed) saveTamaState();
  }

  function tamaStageIndex() {
    let idx = 0;
    GROWTH_STAGES.forEach((s, i) => {
      if ((tamaState.goodDaysCount || 0) >= s.minGoodDays) idx = i;
    });
    return idx;
  }

  function tamaStage() {
    return GROWTH_STAGES[tamaStageIndex()];
  }

  function tamaNextStage() {
    return GROWTH_STAGES[tamaStageIndex() + 1] || null;
  }

  function tamaAverageNeed() {
    const sum = NEED_KEYS.reduce((acc, k) => acc + (tamaState.needs[k] || 0), 0);
    return sum / NEED_KEYS.length;
  }

  function tamaMood() {
    const avg = tamaAverageNeed();
    if (avg >= 80) return { emoji: "🤩", label: "Ravi" };
    if (avg >= 60) return { emoji: "😊", label: "Content" };
    if (avg >= 40) return { emoji: "😐", label: "Neutre" };
    if (avg >= 20) return { emoji: "😟", label: "Grognon" };
    return { emoji: "😢", label: "Triste" };
  }

  /** Le besoin le plus urgent à combler, avec un peu d'aléatoire pour ne
   *  pas être totalement prévisible (le plus bas 7 fois sur 10, sinon le
   *  deuxième plus bas). */
  function tamaNeediestKey() {
    const sorted = [...NEED_KEYS].sort((a, b) => (tamaState.needs[a] || 0) - (tamaState.needs[b] || 0));
    if (sorted.length > 1 && Math.random() > 0.7) return sorted[1];
    return sorted[0];
  }

  /** Emoji jamais tiré pour ce besoin si possible, dans la tranche de
   *  rareté du cadeau ; retombe sur tout le pool du besoin si épuisée. */
  function pickTamaEmoji(need, tier) {
    const pool = NEED_EMOJI_POOLS[need] || NEED_EMOJI_POOLS.manger;
    const rank = GIFT_TIER_RANK[tier] || 0;
    const slice = pool.slice(rank * 8, rank * 8 + 8);
    const used = new Set(
      Object.values(tamaGifts)
        .flatMap((dateEntry) => Object.values(dateEntry))
        .filter((g) => g.opened && g.need === need)
        .map((g) => g.emoji)
    );
    const free = slice.filter((e) => !used.has(e));
    if (free.length > 0) return free[Math.floor(Math.random() * free.length)];
    const freeAny = pool.filter((e) => !used.has(e));
    if (freeAny.length > 0) return freeAny[Math.floor(Math.random() * freeAny.length)];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function tamaGiftKey(subjectId, dateISO) {
    return `${subjectId}::${dateISO}`;
  }

  /** Le prochain palier à viser pour ce jour : le premier niveau (dans
   *  l'ordre commune -> légendaire) pas encore ouvert. `null` si les 4
   *  niveaux de ce jour ont déjà été récoltés. */
  function tamaNextGoalTier(subjectId, dateISO) {
    const entry = tamaGifts[tamaGiftKey(subjectId, dateISO)];
    for (const t of GIFT_TIERS) {
      if (!entry || !entry[t] || !entry[t].opened) return t;
    }
    return null;
  }

  /** Ouvre le palier `tier` du jour `dateISO` pour la matière `subjectId` :
   *  gonfle le besoin le plus urgent et fige l'emoji obtenu. Refuse si ce
   *  palier est déjà ouvert (protège contre un double-clic ou un état
   *  distant arrivé entre-temps). */
  function collectTamaGift(subjectId, dateISO, tier) {
    const key = tamaGiftKey(subjectId, dateISO);
    if (!tamaGifts[key]) tamaGifts[key] = {};
    const entry = tamaGifts[key];
    if (entry[tier] && entry[tier].opened) return null;

    const need = tamaNeediestKey();
    const emoji = pickTamaEmoji(need, tier);
    tamaState.needs[need] = Math.min(100, (tamaState.needs[need] || 0) + GIFT_TIER_BOOST[tier]);
    entry[tier] = { opened: true, need, emoji, openedAt: new Date().toISOString() };
    saveTamaGifts();
    saveTamaState();
    if (Sync.isConfigured()) pushTamaBlob();
    return { need, emoji, tier };
  }

  /** Un objectif est-il actuellement atteint et prêt à être récolté, dans le
   *  graphique actuellement affiché ? Mis à jour à chaque rendu du mini
   *  histogramme de la page Réviser ; sert au petit point de notification
   *  sur l'onglet Tamagotchi. */
  let reviewChartHasReadyGoal = false;

  function refreshTamaTabIcon() {
    const iconEl = el("tab-tamagotchi-icon");
    const stage = tamaStage();
    if (iconEl) iconEl.textContent = stage.emoji;
    const tabEl = el("tab-tamagotchi");
    if (tabEl) tabEl.classList.toggle("has-pending-gift", reviewChartHasReadyGoal);
    const moodEmojiEl = el("tama-mood-emoji");
    if (moodEmojiEl) moodEmojiEl.textContent = tamaMood().emoji;
  }

  /* ---------------------------------------------------------
     Synchro multi-appareils de l'état du compagnon (état + cadeaux
     regroupés dans un seul blob JSON, voir js/sync.js).
  --------------------------------------------------------- */
  function mergeTamaGifts(remoteGifts) {
    let changed = false;
    for (const [key, remoteEntry] of Object.entries(remoteGifts || {})) {
      if (!tamaGifts[key]) tamaGifts[key] = {};
      const local = tamaGifts[key];
      for (const [tier, remoteTier] of Object.entries(remoteEntry || {})) {
        if (remoteTier.opened && (!local[tier] || !local[tier].opened)) {
          local[tier] = remoteTier; // l'autre appareil l'a ouvert en premier
          changed = true;
        }
      }
    }
    if (changed) saveTamaGifts();
    return changed;
  }

  async function pushTamaBlob() {
    if (!Sync.isConfigured()) return false;
    return Sync.pushTamaState({ pet: tamaState, gifts: tamaGifts });
  }

  async function pullAndMergeTama() {
    if (!Sync.isConfigured()) return;
    const remote = await Sync.pullTamaState();
    if (!remote) return;
    mergeTamaGifts(remote.gifts);
    // État du compagnon : on garde le plus récemment mis à jour dans son
    // ensemble (besoins + jours cumulés forment un tout cohérent, les
    // fusionner champ à champ donnerait un état incohérent).
    if (remote.pet && new Date(remote.pet.updatedAt || 0) > new Date(tamaState.updatedAt || 0)) {
      tamaState = remote.pet;
      saveTamaState();
    }
    await pushTamaBlob();
  }

  const exportBtn = el("export-btn");
  const importInput = el("import-input");
  const importTargetSelect = el("import-target-select");

  const subjectSelectEl = el("subject-select");
  const addSubjectBtn = el("add-subject-btn");
  const manageAddSubjectBtn = el("manage-add-subject-btn");
  const subjectListEl = el("subject-list");

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
      ...SM2.createSm2State(),
    };
  }

  /* ---------------------------------------------------------
     Matières (subjects)
  --------------------------------------------------------- */
  function newSubject(name) {
    const now = new Date().toISOString();
    return { id: uid(), name: name.trim(), createdAt: now, updatedAt: now };
  }

  function subjectName(id) {
    const s = subjects.find((x) => x.id === id);
    return s ? s.name : "Matière inconnue";
  }

  /** Exposé pour que sync.js puisse dénormaliser le nom de la matière sur chaque ligne envoyée. */
  window.getSubjectName = subjectName;

  /** Charge les matières depuis IndexedDB ; en crée une par défaut si aucune n'existe encore. */
  async function loadSubjects() {
    subjects = await DB.getAllSubjects();
    if (subjects.length === 0) {
      const general = newSubject("Général");
      await DB.putSubject(general);
      subjects = [general];
    }
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));

    const saved = localStorage.getItem(CURRENT_SUBJECT_KEY);
    if (saved && subjects.some((s) => s.id === saved)) {
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
    subjectSelectEl.innerHTML = opts;

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

  function renderSubjectManageList() {
    subjectListEl.innerHTML = "";
    for (const s of subjects) {
      const li = document.createElement("li");
      li.className = "subject-row" + (s.id === currentSubjectId ? " is-active" : "");

      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "subject-row-name";
      nameBtn.textContent = s.name;
      nameBtn.title = "Renommer";
      nameBtn.addEventListener("click", () => renameSubject(s.id));

      const count = document.createElement("span");
      count.className = "subject-row-count";
      const n = cards.filter((c) => !c.deleted && c.subject === s.id).length;
      count.textContent = `${n} fiche${n > 1 ? "s" : ""}`;

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "icon-btn icon-btn--danger";
      delBtn.textContent = "suppr.";
      delBtn.addEventListener("click", () => deleteSubject(s.id));

      actions.appendChild(delBtn);

      li.appendChild(nameBtn);
      li.appendChild(count);
      li.appendChild(actions);
      subjectListEl.appendChild(li);
    }
  }

  async function createSubjectFlow() {
    const name = prompt("Nom de la nouvelle matière :");
    if (!name || !name.trim()) return null;
    const subject = newSubject(name);
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

  function switchSubject(id) {
    if (id === currentSubjectId || !subjects.some((s) => s.id === id)) return;
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
    switchSubject(subjectSelectEl.value);
  });

  addSubjectBtn.addEventListener("click", async () => {
    const s = await createSubjectFlow();
    if (s) switchSubject(s.id);
  });

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
        questionTextEl.textContent = currentCard.question;
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
    refreshTamaTabIcon();
  }

  /** Toutes les fiches non supprimées de la matière actuellement active. */
  function subjectCards() {
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
    questionTextEl.textContent = currentCard.question;
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
      questionTextEl.textContent = currentCard.question;
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

    // Mode bonus : on continue avec des fiches piochées au hasard.
    isBonusMode = true;
    currentCard = pickRandomBonusCard(pool, currentCard ? currentCard.id : null);
    emptyStateEl.hidden = true;
    cardStackEl.hidden = false;
    editCurrentBtn.hidden = false;
    if (hibernateCurrentBtn) hibernateCurrentBtn.hidden = false;
    ratingRowEl.hidden = false;
    questionTextEl.textContent = currentCard.question;
    answerTextEl.textContent = currentCard.answer;
    reviewProgressEl.textContent = "Fiches du jour terminées — révision libre";

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
    for (const rating of ["hard", "good", "easy"]) {
      const next = SM2.sm2Next(currentCard, rating);
      previews[rating] = formatInterval(next.interval);
    }
    el("sub-hard").textContent = previews.hard;
    el("sub-good").textContent = previews.good;
    el("sub-easy").textContent = previews.easy;
  }

  function formatInterval(days) {
    if (days < 1) return "< 1 j";
    if (days === 1) return "1 j";
    if (days < 30) return `${days} j`;
    if (days < 365) return `${Math.round(days / 30)} mois`;
    return `${Math.round(days / 365)} an(s)`;
  }

  let editReturnToReview = false;

  editCurrentBtn.addEventListener("click", () => {
    if (!currentCard) return;
    editReturnToReview = true;
    enterEditMode(currentCard);
    document.querySelector('.tab[data-view="manage"]').click();
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
    const next = SM2.sm2Next(currentCard, rating);
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

    refreshTamaTabIcon();
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

    refreshTamaTabIcon();
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

  function renderManageList() {
    const visible = subjectCards();
    totalCountEl.textContent = String(visible.length);
    cardListEl.innerHTML = "";
    renderSubjectManageList();

    if (visible.length === 0) {
      const li = document.createElement("li");
      li.className = "list-empty";
      li.textContent = "Aucune fiche pour l'instant. Ajoute la première ci-dessus.";
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

      const meta = document.createElement("p");
      meta.className = "card-row-meta";
      meta.textContent = SM2.isDue(card)
        ? "à revoir aujourd'hui"
        : `prochaine question dans ${formatInterval(daysUntil(card.dueDate))}`;

      main.appendChild(q);
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

      li.appendChild(main);
      li.appendChild(actions);
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

  /** Dessine un histogramme "fiches dues par jour" dans les éléments fournis.
   *  Factorisé pour être partagé entre le grand graphique de l'onglet Stats
   *  et le mini graphique de la page Réviser (matière en cours). */
  function renderHistogramInto(chartEl, emptyEl, wrapEl, pool, days, maxBarPx, giftOpts) {
    if (!chartEl) return;
    const buckets = computeDueHistogram(pool, days);
    const max = Math.max(0, ...buckets.map((b) => b.count));
    // Les objectifs-cadeaux n'ont de sens que sur les échelles rapprochées
    // (15 / 30 jours) : au-delà, les colonnes sont trop tassées pour rester
    // lisibles avec un repère en plus.
    const showGoals = !!giftOpts && days <= 31;
    if (giftOpts) reviewChartHasReadyGoal = false;

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

    // Au-delà d'1 mois affiché (3 mois / 6 mois / 1 an), il y a trop de
    // colonnes pour qu'un espace entre chaque barre reste visible : les
    // barres finissent par disparaître entre les espaces. On les fait donc
    // se toucher, et on retire les nombres qui n'ont de toute façon plus la
    // place de s'afficher lisiblement.
    const dense = days > 31;
    chartEl.classList.toggle("chart--dense", dense);

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
      label.textContent = i === 0 ? "Auj." : "";

      col.appendChild(value);
      col.appendChild(bar);
      col.appendChild(label);

      if (showGoals && b.count > 0) {
        const dateISO = b.date.toISOString().slice(0, 10);
        const tier = tamaNextGoalTier(giftOpts.subjectId, dateISO);
        if (tier) {
          const threshold = GIFT_TIER_DUE_THRESHOLDS[tier];
          const ready = b.count >= threshold;
          if (ready) reviewChartHasReadyGoal = true;
          const targetPx = Math.min(maxBarPx, Math.max(2, Math.round((threshold / scaleMax) * maxBarPx)));

          const goal = document.createElement(ready ? "button" : "div");
          if (ready) goal.type = "button";
          goal.className = `chart-goal chart-goal--tier-${tier} ${ready ? "is-ready" : "is-locked"}`;
          goal.style.bottom = `${targetPx}px`;
          goal.title = ready
            ? "Objectif atteint — touche pour ouvrir le cadeau"
            : `Encore ${threshold - b.count} fiche(s) ce jour-là pour ouvrir ce cadeau (objectif : ${threshold})`;

          const line = document.createElement("span");
          line.className = "chart-goal-line";
          const emoji = document.createElement("span");
          emoji.className = "chart-goal-gift";
          emoji.textContent = "🎁";
          goal.appendChild(emoji);
          goal.appendChild(line);
          if (!ready) {
            const progress = document.createElement("span");
            progress.className = "chart-goal-progress";
            progress.textContent = `${b.count}/${threshold}`;
            goal.appendChild(progress);
          }

          if (ready) {
            goal.addEventListener("click", (e) => {
              e.stopPropagation();
              const result = collectTamaGift(giftOpts.subjectId, dateISO, tier);
              if (result && giftOpts.onCollect) giftOpts.onCollect(result, goal);
            });
          }
          col.appendChild(goal);
        }
      }

      frag.appendChild(col);
    });
    chartEl.appendChild(frag);
    chartEl._prevCounts = buckets.map((b) => b.count);
    if (giftOpts) refreshTamaTabIcon();
  }

  function renderDueChart() {
    const pool = statsScopeCards();
    renderHistogramInto(dueChartEl, chartEmptyEl, el("chart-wrap"), pool, statsRangeDays, CHART_MAX_BAR_PX);
  }

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

  /* ---------------------------------------------------------
     Vue Tamagotchi : état du compagnon, ses besoins, son environnement
  --------------------------------------------------------- */
  const tamaHeroEmojiEl = el("tama-hero-emoji");
  const tamaHeroNameEl = el("tama-hero-name");
  const tamaMoodLineEl = el("tama-mood-line");
  const tamaProgressNoteEl = el("tama-progress-note");
  const tamaNeedsListEl = el("tama-needs-list");
  const tamaEnvTextEl = el("tama-env-text");

  /** Petite phrase d'ambiance générée à partir du besoin le plus bas et de
   *  l'humeur générale — c'est "l'environnement" du compagnon. */
  function tamaEnvironmentText() {
    const mood = tamaMood();
    const sorted = [...NEED_KEYS].sort((a, b) => (tamaState.needs[a] || 0) - (tamaState.needs[b] || 0));
    const lowest = sorted[0];
    const lowestVal = tamaState.needs[lowest] || 0;
    const stage = tamaStage();
    const place =
      tamaStageIndex() <= 1
        ? "dans son petit nid douillet"
        : tamaStageIndex() <= 3
        ? "dans son coin bien à lui"
        : "dans son grand espace, entouré de ses trouvailles";
    let sentence = `${stage.name} passe son temps ${place}.`;
    if (lowestVal < 30) {
      sentence += ` Il a surtout besoin qu'on pense à "${NEED_LABELS[lowest]}" — ${NEED_ICONS[lowest]}`;
    } else if (mood.label === "Ravi" || mood.label === "Content") {
      sentence += ` Il a l'air bien entouré en ce moment.`;
    } else {
      sentence += ` Un cadeau ou deux lui feraient du bien.`;
    }
    return sentence;
  }

  function renderTamagotchiView() {
    applyTamaUpkeep();
    const stage = tamaStage();
    const next = tamaNextStage();
    const mood = tamaMood();

    if (tamaHeroEmojiEl) tamaHeroEmojiEl.textContent = stage.emoji;
    if (tamaHeroNameEl) tamaHeroNameEl.textContent = stage.name;
    if (tamaMoodLineEl) tamaMoodLineEl.textContent = `${mood.emoji} ${mood.label}`;

    if (tamaProgressNoteEl) {
      const good = tamaState.goodDaysCount || 0;
      tamaProgressNoteEl.textContent = next
        ? `${good}/${next.minGoodDays} bons jours pour devenir ${next.name} ${next.emoji}`
        : `${good} bons jours cumulés — stade maximum atteint`;
    }

    if (tamaNeedsListEl) {
      tamaNeedsListEl.innerHTML = "";
      const frag = document.createDocumentFragment();
      NEED_KEYS.forEach((key) => {
        const value = Math.round(tamaState.needs[key] || 0);
        const row = document.createElement("div");
        row.className = "tama-need-row";

        const label = document.createElement("span");
        label.className = "tama-need-label";
        label.textContent = `${NEED_ICONS[key]} ${NEED_LABELS[key]}`;

        const barWrap = document.createElement("div");
        barWrap.className = "tama-need-bar";
        const fill = document.createElement("div");
        fill.className =
          "tama-need-fill" + (value < 30 ? " is-low" : value < HEALTHY_NEED_THRESHOLD ? " is-mid" : "");
        fill.style.width = `${Math.max(2, value)}%`;
        barWrap.appendChild(fill);

        const valueEl = document.createElement("span");
        valueEl.className = "tama-need-value";
        valueEl.textContent = `${value}`;

        row.appendChild(label);
        row.appendChild(barWrap);
        row.appendChild(valueEl);
        frag.appendChild(row);
      });
      tamaNeedsListEl.appendChild(frag);
    }

    if (tamaEnvTextEl) tamaEnvTextEl.textContent = tamaEnvironmentText();
    refreshTamaTabIcon();
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
      case 182: return "6 mois";
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
      REVIEW_CHART_MAX_BAR_PX,
      { subjectId: currentSubjectId, onCollect: showTamaGiftToast }
    );
  }

  /** Petit toast qui confirme ce que le cadeau vient d'apporter au
   *  compagnon, affiché près du graphique sans changer la mise en page. */
  function showTamaGiftToast(result, anchorEl) {
    refreshTamaTabIcon();
    renderReviewChart(); // fait disparaître le badge tout juste ouvert
    if (el("view-tamagotchi") && el("view-tamagotchi").classList.contains("is-active")) {
      renderTamagotchiView();
    }
    const toast = document.createElement("div");
    toast.className = "tama-toast";
    toast.textContent = `${result.emoji} +${NEED_LABELS[result.need]}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1600);
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

  function saveBonusDaysSettings() {
    localStorage.setItem(BONUS_DAYS_KEY, JSON.stringify(bonusDaysSettings));
  }

  function loadBonusAgainMode() {
    const raw = localStorage.getItem(BONUS_AGAIN_MODE_KEY);
    bonusAgainMode = raw === "increment" ? "increment" : DEFAULT_BONUS_AGAIN_MODE;
  }

  function saveBonusAgainMode() {
    localStorage.setItem(BONUS_AGAIN_MODE_KEY, bonusAgainMode);
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
  }

  function renderSettingsView() {
    if (settingBonusHardEl) settingBonusHardEl.value = bonusDaysSettings.hard;
    if (settingBonusGoodEl) settingBonusGoodEl.value = bonusDaysSettings.good;
    if (settingBonusEasyEl) settingBonusEasyEl.value = bonusDaysSettings.easy;
    if (settingBonusAgainModeEl) settingBonusAgainModeEl.value = bonusAgainMode;
    if (settingHibernateDaysEl) settingHibernateDaysEl.value = hibernateDays;
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
      if (view === "tamagotchi") renderTamagotchiView();
      if (view === "sync") renderSyncView();
      if (view === "settings") renderSettingsView();
      renderDuePill();
    });
  });

  /** Le smiley d'humeur du haut de la page Réviser ouvre directement
   *  l'onglet Tamagotchi (raccourci, sans dupliquer la logique de nav). */
  const tamaMoodBtnEl = el("tama-mood-btn");
  if (tamaMoodBtnEl) {
    tamaMoodBtnEl.addEventListener("click", () => {
      const tamaTab = el("tab-tamagotchi");
      if (tamaTab) tamaTab.click();
    });
  }

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
    if (tamaSyncUnsub) tamaSyncUnsub();

    await reconcileWithRemote();
    await Sync.flushPending((id) => cards.find((c) => c.id === id));
    await pullAndMergeTama();

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

    tamaSyncUnsub = Sync.subscribeTamaRealtime((remoteBlob) => {
      const changed = mergeTamaGifts(remoteBlob.gifts);
      if (remoteBlob.pet && new Date(remoteBlob.pet.updatedAt || 0) > new Date(tamaState.updatedAt || 0)) {
        tamaState = remoteBlob.pet;
        saveTamaState();
      }
      if (changed || remoteBlob.pet) {
        refreshTamaTabIcon();
        if (el("view-tamagotchi") && el("view-tamagotchi").classList.contains("is-active")) renderTamagotchiView();
        renderReviewChart();
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
        .register("sw.js")
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
    loadTamaState();
    loadTamaGifts();
    applyTamaUpkeep();
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
    if (Sync.isConfigured()) {
      await connectSync();
      // Ne relance pas startReviewSession() ici : reconcileWithRemote() a déjà
      // rafraîchi les données via renderAll(), et relancer une session ici
      // remélangeait la file et changeait la fiche affichée sous les yeux de
      // l'utilisateur, sans lien avec son évaluation. On ajoute juste
      // discrètement les éventuelles nouvelles fiches dues à la file en cours.
      mergeNewDueCardsIntoQueue();
    }
  })();
})();
