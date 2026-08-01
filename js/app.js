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

  const cardForm = el("card-form");
  const inputQuestion = el("input-question");
  const inputAnswer = el("input-answer");
  const submitBtn = el("submit-btn");
  const cancelEditBtn = el("cancel-edit");
  const cardListEl = el("card-list");
  const totalCountEl = el("total-count");

  const statTotal = el("stat-total");
  const statDue = el("stat-due");
  const statLearning = el("stat-learning");
  const statMastered = el("stat-mastered");

  const exportBtn = el("export-btn");
  const importInput = el("import-input");
  const importTargetSelect = el("import-target-select");

  const subjectSelectEl = el("subject-select");
  const addSubjectBtn = el("add-subject-btn");
  const manageAddSubjectBtn = el("manage-add-subject-btn");
  const subjectListEl = el("subject-list");
  const statsSubjectNameEl = el("stats-subject-name");

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

  /** Fiches créées avant l'introduction des matières (ou reçues d'un vieil export) : on les rattache à la matière active. */
  async function migrateOrphanCards() {
    const orphans = cards.filter((c) => !c.subject);
    if (orphans.length === 0) return;
    const fixed = orphans.map((c) => touch({ ...c, subject: currentSubjectId }));
    await DB.bulkPut(fixed);
    for (const f of fixed) {
      const idx = cards.findIndex((c) => c.id === f.id);
      if (idx >= 0) cards[idx] = f;
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
    if (statsSubjectNameEl) statsSubjectNameEl.textContent = subjectName(currentSubjectId);
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

    renderSubjectSelect();
    renderSubjectManageList();
    renderAll();
    if (el("view-review").classList.contains("is-active")) {
      startReviewSession();
    }
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

  /* ---------------------------------------------------------
     Chargement / rafraîchissement des données
  --------------------------------------------------------- */
  function renderAll() {
    renderDuePill();
    renderManageList();
    renderStats();
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

    if (isBonusMode) {
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

  function pickRandomBonusCard(pool, excludeId) {
    const candidates =
      pool.length > 1 ? pool.filter((c) => c.id !== excludeId) : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function showNextCard() {
    isFlipped = false;
    flipCardEl.classList.remove("is-flipped");
    ratingRowEl.hidden = true;

    if (reviewQueue.length > 0) {
      isBonusMode = false;
      currentCard = reviewQueue[0];
      emptyStateEl.hidden = true;
      cardStackEl.hidden = false;
      editCurrentBtn.hidden = false;
      questionTextEl.textContent = currentCard.question;
      answerTextEl.textContent = currentCard.answer;

      const doneToday = sessionTotalDue - reviewQueue.length;
      reviewProgressEl.textContent = `${doneToday}/${sessionTotalDue} fiches revues aujourd'hui`;

      updateRatingPreviews();
      renderDuePill();
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
      reviewProgressEl.textContent = "";
      renderDuePill();
      return;
    }

    // Mode bonus : on continue avec des fiches piochées au hasard.
    isBonusMode = true;
    currentCard = pickRandomBonusCard(pool, currentCard ? currentCard.id : null);
    emptyStateEl.hidden = true;
    cardStackEl.hidden = false;
    editCurrentBtn.hidden = false;
    questionTextEl.textContent = currentCard.question;
    answerTextEl.textContent = currentCard.answer;
    reviewProgressEl.textContent = "Fiches du jour terminées — révision libre";

    updateRatingPreviews();
    renderDuePill();
  }

  function updateRatingPreviews() {
    if (!currentCard) return;
    if (isBonusMode) {
      el("sub-hard").textContent = "+1 j";
      el("sub-good").textContent = "+3 j";
      el("sub-easy").textContent = "+5 j";
      return;
    }
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
    ratingRowEl.hidden = !isFlipped;
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

  /** Mode bonus (révision libre) : la date d'interrogation est simplement reculée,
   *  sans toucher au facteur de facilité SM-2. "Encore" ne change rien, on passe
   *  juste à une autre fiche aléatoire. */
  async function rateBonusCard(rating) {
    const bonusDays = { hard: 1, good: 3, easy: 5 }[rating];
    if (bonusDays === undefined) return;

    const due = new Date();
    due.setHours(0, 0, 0, 0);
    due.setDate(due.getDate() + bonusDays);

    const updated = touch({
      ...currentCard,
      interval: bonusDays,
      dueDate: due.toISOString(),
      lastReviewed: new Date().toISOString(),
      reviewCount: (currentCard.reviewCount || 0) + 1,
    });
    await persist(updated);

    const idx = cards.findIndex((c) => c.id === updated.id);
    if (idx >= 0) cards[idx] = updated;

    renderStats();
    renderManageList();
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
  function renderStats() {
    if (statsSubjectNameEl) statsSubjectNameEl.textContent = subjectName(currentSubjectId);
    const visible = subjectCards();
    statTotal.textContent = String(visible.length);
    statDue.textContent = String(dueCards().length);
    statLearning.textContent = String(
      visible.filter((c) => c.interval > 0 && c.interval <= 21).length
    );
    statMastered.textContent = String(
      visible.filter((c) => c.interval > 21).length
    );
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
      }
      if (view === "stats") renderStats();
      if (view === "sync") renderSyncView();
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
      const s = {
        id: remote.subject,
        name: remote.subjectName || "Matière importée",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await DB.putSubject(s);
      subjects.push(s);
      subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      renderSubjectSelect();
      return s.id;
    }
    // Fiche distante ancienne, sans matière renseignée : on la range dans "Général".
    let general = subjects.find((s) => s.name === "Général");
    if (!general) {
      general = newSubject("Général");
      await DB.putSubject(general);
      subjects.push(general);
      renderSubjectSelect();
    }
    return general.id;
  }

  /** Fusionne une fiche reçue de Supabase (import initial ou temps réel). */
  async function mergeRemoteCard(remote) {
    remote.subject = await ensureLocalSubjectFor(remote);
    const idx = cards.findIndex((c) => c.id === remote.id);
    if (idx === -1) {
      cards.push(remote);
      await DB.put(remote);
    } else {
      const local = cards[idx];
      if (new Date(remote.updatedAt) > new Date(local.updatedAt || 0)) {
        cards[idx] = remote;
        await DB.put(remote);
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
    await loadSubjects();
    renderSubjectSelect();
    cards = await DB.getAll();
    await migrateOrphanCards();
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
