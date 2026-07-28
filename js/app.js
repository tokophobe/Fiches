(() => {
  "use strict";

  /** @type {Array<any>} cache mémoire de toutes les fiches */
  let cards = [];
  /** file de fiches dues pour la session de révision en cours */
  let reviewQueue = [];
  let currentCard = null;
  let editingId = null;
  let isFlipped = false;

  const el = (id) => document.getElementById(id);

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

  const uid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  function newCard(question, answer) {
    const now = new Date().toISOString();
    return {
      id: uid(),
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
  async function loadCards() {
    cards = await DB.getAll();
    renderAll();
  }

  function renderAll() {
    renderDuePill();
    renderManageList();
    renderStats();
  }

  function dueCards() {
    return cards.filter((c) => !c.deleted && SM2.isDue(c));
  }

  function renderDuePill() {
    dueCountEl.textContent = String(dueCards().length);
  }

  /* ---------------------------------------------------------
     Vue Réviser
  --------------------------------------------------------- */
  function startReviewSession() {
    reviewQueue = shuffle(dueCards());
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

  function showNextCard() {
    isFlipped = false;
    flipCardEl.classList.remove("is-flipped");
    ratingRowEl.hidden = true;

    if (reviewQueue.length === 0) {
      currentCard = null;
      emptyStateEl.hidden = false;
      cardStackEl.hidden = true;
      editCurrentBtn.hidden = true;
      reviewProgressEl.textContent =
        cards.length === 0
          ? ""
          : "Tout est à jour pour aujourd'hui.";
      return;
    }

    currentCard = reviewQueue[0];
    emptyStateEl.hidden = true;
    cardStackEl.hidden = false;
    editCurrentBtn.hidden = false;
    questionTextEl.textContent = currentCard.question;
    answerTextEl.textContent = currentCard.answer;

    const totalToday = dueCards().length;
    const doneToday = totalToday - reviewQueue.length;
    reviewProgressEl.textContent = `${doneToday}/${totalToday} fiches revues aujourd'hui`;

    updateRatingPreviews(currentCard);
  }

  function updateRatingPreviews(card) {
    const previews = {};
    for (const rating of ["hard", "good", "easy"]) {
      const next = SM2.sm2Next(card, rating);
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

    renderDuePill();
    renderStats();
    renderManageList();
    showNextCard();
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
    const visible = cards.filter((c) => !c.deleted);
    totalCountEl.textContent = String(visible.length);
    cardListEl.innerHTML = "";

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
    const blob = new Blob([JSON.stringify(cards.filter((c) => !c.deleted), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fiches-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Format inattendu");

      const normalized = imported.map((item) =>
        touch({
          ...newCard(item.question ?? "", item.answer ?? ""),
          ...item,
          id: item.id || uid(),
        })
      );

      await DB.bulkPut(normalized);
      if (Sync.isConfigured()) {
        for (const card of normalized) {
          Sync.pushCard(card);
        }
      }
      await loadCards();
      startReviewSession();
    } catch (err) {
      alert("Import impossible : le fichier ne semble pas être un export valide.");
    } finally {
      importInput.value = "";
    }
  });

  /* ---------------------------------------------------------
     Vue Stats
  --------------------------------------------------------- */
  function renderStats() {
    const visible = cards.filter((c) => !c.deleted);
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

      if (view === "review") startReviewSession();
      if (view === "stats") renderStats();
      if (view === "sync") renderSyncView();
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

  /** Fusionne une fiche reçue de Supabase (import initial ou temps réel). */
  async function mergeRemoteCard(remote) {
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
      // Si la fiche en cours de révision a changé ailleurs, on rafraîchit la file.
      if (currentCard && currentCard.id === remote.id) {
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
  loadCards().then(async () => {
    startReviewSession();
    updateSyncStatus();
    if (Sync.isConfigured()) {
      await connectSync();
      startReviewSession();
    }
  });
})();
