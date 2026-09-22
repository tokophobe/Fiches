(() => {
  "use strict";

  // Version affichée dans Réglages (bouton "Vérifier les mises à jour") —
  // à garder alignée avec CACHE_NAME dans sw.js à chaque livraison, pour
  // que l'utilisateur puisse vérifier facilement s'il a bien la dernière
  // version installée.
  const APP_VERSION = "v148";

  const ICON_LIBRARY = {
    cards: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="4" y1="12" x2="20" y2="12"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    file: '<path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M15 2v5h5"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
    stackedSheets: '<path d="M8 3h9l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M17 3v4h4"/><path d="M5 7v13a1 1 0 0 0 1 1h11"/><path d="M2 11v13a1 1 0 0 0 1 1h11"/>',
    barChart: '<line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="10"/><line x1="3" y1="20" x2="21" y2="20"/>',
    gradCap: '<path d="M2 9l10-5 10 5-10 5-10-5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><line x1="22" y1="9" x2="22" y2="15.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    brain: '<path d="M9.5 2a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 1.5 5.5V17a3 3 0 0 0 3 3 2.5 2.5 0 0 0 2.5-2.5V4.5A2.5 2.5 0 0 0 9.5 2z"/><path d="M14.5 2a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-1.5 5.5V17a3 3 0 0 1-3 3 2.5 2.5 0 0 1-2.5-2.5V4.5A2.5 2.5 0 0 1 14.5 2z"/>',
    star: '<path d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 18l-6.4 3.6 1.4-7.1-5.3-5 7.2-.9z"/>',
    heart: '<path d="M12 21s-7-4.5-9.5-9C1 8 2 4 6 4c2 0 4 1.5 6 4 2-2.5 4-4 6-4 4 0 5 4 3.5 8-2.5 4.5-9.5 9-9.5 9z"/>',
    bookmark: '<path d="M6 2h12v20l-6-4-6 4z"/>',
    flag: '<path d="M4 22V3"/><path d="M4 4h14l-2 4 2 4H4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,14"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    check: '<polyline points="4,12 9,17 20,6"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    layers: '<path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    zap: '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M4 4.5v16"/>',
    // Équivalents sobres des icônes déjà utilisées ailleurs dans l'appli
    // (crayon, hibernation, chantier, annuler...).
    pencil: '<path d="M17 3a2.83 2.83 0 0 1 4 4L7 21l-4 1 1-4z"/>',
    sleep: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/><line x1="9" y1="9" x2="13" y2="9"/><line x1="9" y1="9" x2="13" y2="9" transform="rotate(20 11 9)"/>',
    cone: '<path d="M12 2l6 16H6z"/><line x1="8.2" y1="13" x2="15.8" y2="13"/><line x1="4" y1="21" x2="20" y2="21"/>',
    undo: '<polyline points="9,14 4,9 9,4"/><path d="M4 9h11a5 5 0 0 1 5 5v1"/>',
    trash: '<polyline points="3,6 5,6 21,6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.9 17.9A10.6 10.6 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 4.2-5.4M9.9 4.2A9.7 9.7 0 0 1 12 4c7 0 11 8 11 8a19 19 0 0 1-2.2 3.1"/><line x1="1" y1="1" x2="23" y2="23"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.8"/>',
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    list: '<line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    grid: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    filter: '<polygon points="4,4 20,4 14,12 14,19 10,21 10,12"/>',
    shuffle: '<polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
    chevronLeft: '<polyline points="15,18 9,12 15,6"/>',
    chevronRight: '<polyline points="9,18 15,12 9,6"/>',
    chevronDown: '<polyline points="6,9 12,15 18,9"/>',
    code: '<polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>',
    chevronUp: '<polyline points="18,15 12,9 6,15"/>',
    refresh: '<polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.4A9 9 0 0 0 20.5 15"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.5-1.5"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,6 12,13 22,6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
    thumbsUp: '<path d="M7 22V11l5-9 2 1v7h6a2 2 0 0 1 2 2l-1.5 7a2 2 0 0 1-2 1.5H7z"/>',
    alertTriangle: '<path d="M10.3 3.9L1.8 18a1.7 1.7 0 0 0 1.5 2.5h17.4a1.7 1.7 0 0 0 1.5-2.5L13.7 3.9a1.7 1.7 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="11"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    shield: '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/>',
    gift: '<rect x="3" y="8" width="18" height="4"/><rect x="4" y="12" width="16" height="9"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M12 8C10 3 5 4 5 6.5S8 8 12 8z"/><path d="M12 8c2-5 7-4 7-1.5S16 8 12 8z"/>',
    award: '<circle cx="12" cy="8" r="6"/><polyline points="8.2,13.5 6,22 12,18 18,22 15.8,13.5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><polygon points="15,9 13,15 9,17 11,11"/>',
    cloud: '<path d="M17 18H6a4 4 0 1 1 .7-7.9A6 6 0 0 1 18 9.5 4 4 0 0 1 17 18z"/>',
    hash: '<line x1="5" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="19" y2="15"/><line x1="10" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="14" y2="20"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    userCheck: '<path d="M5 21v-2a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v2"/><circle cx="9.5" cy="7" r="4"/><polyline points="17,11 19,13 23,9"/>',
    globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0 5.4 5.4l-6 6a2 2 0 0 1-2.8 0l-3-3a2 2 0 0 1 0-2.8z"/><path d="M2 22l6-6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3l2 2-2 2 2 2-3 3-2-2-3.2 3.2"/>',
    battery: '<rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="10" x2="22" y2="14"/><line x1="6" y1="10" x2="6" y2="14"/>',
    wifi: '<path d="M2 8.5a16 16 0 0 1 20 0"/><path d="M5.5 12a11 11 0 0 1 13 0"/><path d="M9 15.5a6 6 0 0 1 6 0"/><line x1="12" y1="19" x2="12.01" y2="19"/>',
    thermometer: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.1" y2="15.9"/><line x1="14.5" y1="14.5" x2="20" y2="20"/><line x1="8.1" y1="8.1" x2="12" y2="12"/>',
    paperclip: '<path d="M21 11.5l-9.4 9.4a5 5 0 0 1-7-7L13 5.5a3.5 3.5 0 0 1 5 5L9.4 19a2 2 0 0 1-2.8-2.8L14 8.5"/>',
    upload: '<path d="M12 3v13"/><polyline points="7,8 12,3 17,8"/><path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/>',
    download: '<path d="M12 3v13"/><polyline points="7,11 12,16 17,11"/><path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/>',
    move: '<line x1="3" y1="12" x2="21" y2="12"/><polyline points="8,6 3,12 8,18"/><polyline points="16,6 21,12 16,18"/>',
    // Visages pour les boutons d'évaluation (item 3) : sobres, cohérents
    // avec le reste de la banque, remplacent les émoticônes colorées.
    faceSad: '<circle cx="12" cy="12" r="9"/><path d="M8 16s1.5-2.5 4-2.5 4 2.5 4 2.5"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    faceNeutral: '<circle cx="12" cy="12" r="9"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    faceSmile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    faceGrin: '<circle cx="12" cy="12" r="9"/><path d="M7.5 13c0 2 2 4.5 4.5 4.5s4.5-2.5 4.5-4.5z"/><line x1="7.5" y1="13" x2="16.5" y2="13"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  };

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

  /** @type {Array<{id:string,name:string,createdAt:string,updatedAt:string}>} liste des boîtes */
  let subjects = [];
  /** id de la boîte actuellement affichée — peut aussi être l'une des deux
   *  valeurs sentinelles ci-dessous (item 1 : révision toutes boîtes /
   *  sélection de plusieurs boîtes confondues). */
  let currentSubjectId = null;
  // Boîte ciblée par le cadre "Nouvelle fiche" (item 5) : indépendante de
  // la boîte affichée sur Réviser (currentSubjectId), et mémorisée d'une
  // fiche à l'autre — bug corrigé au passage : le sélecteur du cadre de
  // création n'était jusqu'ici relié à RIEN, la fiche partait toujours
  // dans la boîte active de Réviser, quoi qu'on ait choisi ici.
  const NEW_CARD_SUBJECT_KEY = "fiches_new_card_subject_id";
  let newCardSubjectId = localStorage.getItem(NEW_CARD_SUBJECT_KEY) || null;
  function saveNewCardSubjectId(id) {
    newCardSubjectId = id;
    if (id) localStorage.setItem(NEW_CARD_SUBJECT_KEY, id);
    else localStorage.removeItem(NEW_CARD_SUBJECT_KEY);
    scheduleDevSettingsPush();
  }
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
      // Ne garde que des boîtes qui existent toujours.
      return Array.isArray(ids) ? ids.filter((id) => subjects.some((s) => s.id === id)) : [];
    } catch (e) {
      return [];
    }
  }
  function saveMultiSelection(ids) {
    localStorage.setItem(MULTI_SELECTION_KEY, JSON.stringify(ids));
  }
  const MULTI_SELECTION_LABEL_KEY = "fiches_multi_subject_label";
  /** Libellé à afficher pour la sélection multi-boîtes (item 18) : le nom
   *  du dossier si un seul dossier a été coché (rien d'autre), sinon vide
   *  (générique "Sélection de boîtes"). Un seul SUJET coché ne passe même
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
  // Bouton "révéler" (item 7 — repositionné en haut à droite, popup
  // vertical) : les actions secondaires (chantier, hibernation, éditer)
  // restent repliées tant qu'on n'a pas cliqué dessus.
  const revealSecondaryIconsBtn = el("reveal-secondary-icons-btn");
  const secondaryIconsWrap = el("secondary-icons-wrap");
  if (revealSecondaryIconsBtn && secondaryIconsWrap) {
    // Item 6 : icônes épurées (banque d'icônes) plutôt que les caractères
    // ▾/▴, à l'aller comme au retour.
    revealSecondaryIconsBtn.innerHTML = iconSvgMarkup("chevronDown", "icon-inline-svg");
    revealSecondaryIconsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      secondaryIconsWrap.hidden = !secondaryIconsWrap.hidden;
      revealSecondaryIconsBtn.innerHTML = iconSvgMarkup(secondaryIconsWrap.hidden ? "chevronDown" : "chevronUp", "icon-inline-svg");
    });
    document.addEventListener("pointerdown", (e) => {
      if (secondaryIconsWrap.hidden) return;
      if (secondaryIconsWrap.contains(e.target) || e.target === revealSecondaryIconsBtn) return;
      secondaryIconsWrap.hidden = true;
      revealSecondaryIconsBtn.innerHTML = iconSvgMarkup("chevronDown", "icon-inline-svg");
    });
  }
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
  const dueChartEl = el("due-chart");
  const chartEmptyEl = el("chart-empty");
  const ALL_SUBJECTS = "__all__";
  let statsSubjectFilter = ALL_SUBJECTS;
  let statsRangeDays = 15;
  const CHART_MAX_BAR_PX = 140;

  /* Mini histogramme de la page Réviser (boîte en cours). Échelle propre,
     changée en tapant dessus, indépendante du sélecteur de l'onglet Stats. */
  const reviewChartEl = el("review-due-chart");
  const reviewChartEmptyEl = el("review-chart-empty");
  const reviewChartWrapEl = el("review-chart-wrap");
  const reviewChartToggleEl = el("review-chart-toggle");
  const reviewChartScaleLabelEl = el("review-chart-scale-label");
  const reviewChartSubjectNameEl = el("review-chart-subject-name");
  const REVIEW_CHART_STEPS = [15, 30, 90, 365];
  // Item 8 : pas de "1 an" pour l'histogramme fusionné de Stats
  // spécifiquement (celui de Réviser garde ses 4 échelles).
  const STATS_CHART_STEPS = [15, 30, 90];
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
     Réglable par boîte (Ka/Kh/Kg/Ke bornés 1–10 par dixièmes, Ma/Mh/Mg/Me
     bornés 1–365 par unités), persisté en local sous une seule clé (map
     subjectId -> réglages), donc conservé d'une version de l'appli à
     l'autre comme le reste des réglages.
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Modes d'apprentissage (item 2) : désormais des entités GLOBALES
     (3 modes fixes + des modes personnalisés nommés, créés/modifiés/
     supprimés librement), chacune affectée à une ou plusieurs boîtes
     (ou affectée en bloc à un dossier entier, qui répercute alors le
     changement sur toutes les boîtes qu'il contient). Modifier les
     coefficients d'un mode affecte donc TOUTES les boîtes qui l'utilisent
     — contrairement à l'ancien système où chaque boîte avait ses 4
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
  // Round 4, partie 2 : le mode développeur reste dans l'appli (pas de page
  // séparée) mais n'est plus visible par défaut — il ne l'était pas assez
  // caché jusqu'ici (bouton/onglet ordinaires, accessibles à n'importe qui,
  // y compris les élèves/profs des Classes). Débloqué sur un appareil via
  // un geste discret (7 appuis sur le numéro de version, page Réglages),
  // mémorisé localement (jamais synchronisé, jamais transmis aux autres
  // appareils/comptes).
  const DEV_UNLOCK_KEY = "fiches_dev_unlocked";
  function isDevUnlocked() {
    return localStorage.getItem(DEV_UNLOCK_KEY) === "1";
  }
  function setDevUnlocked(v) {
    if (v) localStorage.setItem(DEV_UNLOCK_KEY, "1");
    else localStorage.removeItem(DEV_UNLOCK_KEY);
    updateDevModeVisibility();
  }
  function updateDevModeVisibility() {
    const unlocked = isDevUnlocked();
    const devTab = document.querySelector('.tab[data-view="dev"]');
    if (devTab) devTab.hidden = !unlocked;
    const devCircle = document.querySelector('.home-circle[data-key="dev"]');
    if (devCircle) devCircle.hidden = !unlocked;
  }
  const DEFAULT_RATING_LABELS = { again: "😵‍💫", hard: "🤔", good: "🙂", easy: "😎" };
  const DEFAULT_NAV_LABELS = {
    review: "🤓", manage: "🗃️", cards: "📄", stats: "📊", settings: "⚙",
  };
  /** Banque d'icônes monochromes (essai apprécié, étoffé sur demande) —
   *  chaque entrée est le contenu interne d'un <svg viewBox="0 0 24 24">
   *  (traits seulement, currentColor géré au niveau du SVG englobant),
   *  pour rester cohérent avec le style sobre déjà en place sur le menu. */
  function iconSvgMarkup(iconId, cls) {
    const inner = ICON_LIBRARY[iconId];
    if (!inner) return "";
    return `<svg class="${cls || "tab-icon-svg"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  }
  // Choix par défaut = les icônes déjà en place (essai précédent).
  const DEFAULT_NAV_ICONS = {
    review: "cards", manage: "folder", cards: "file", stats: "barChart", settings: "settings",
    addCard: "plus", calendar: "calendar", sync: "refresh", dev: "code",
  };
  // Couleurs des 4 notes (boutons d'évaluation + graphiques) et des 4 modes
  // d'apprentissage (badges) — item 2 : rendues éditables depuis la page
  // Développeur plutôt que codées en dur dans la feuille de style.
  const DEFAULT_RATING_COLORS = { again: "#b6604a", hard: "#cf9a4d", good: "#6f8b5c", easy: "#3e7c6b" };
  // Fond partagé des 4 boutons d'évaluation (item 4) — une seule couleur,
  // désormais séparée de la couleur de chaque note (qui teinte l'icône).
  const DEFAULT_RATING_BTN_BG_COLOR = "#ffffff";
  const DEFAULT_NIGHT_RATING_BTN_BG_COLOR = "#1c2330";
  const DEFAULT_MODE_COLORS = { cool: "#6f8b5c", normal: "#cf9a4d", renforce: "#b6604a", custom: "#e8c84a" };
  // Fond de l'appli, fond du bouton "chantier" actif, fond de la pastille
  // "0 à revoir" en mode bonus (items 3/4/8).
  const DEFAULT_APP_BG_COLOR = "#eef2f8";
  const DEFAULT_CONSTRUCTION_ACTIVE_COLOR = "#cf9a4d";
  const DEFAULT_BONUS_PILL_COLOR = "#ffffff";
  // Textes généraux, barres/fonds d'histogrammes, fonds de zones (item :
  // étoffe encore le mode développeur) — valeurs par défaut mises à jour
  // pour le thème clair (item 1 : "futuriste naïf", blanc/gris/bleu ciel).
  const DEFAULT_MAIN_TEXT_COLOR = "#1f2937";
  const DEFAULT_CARD_TEXT_COLOR = "#1f2937";
  const DEFAULT_DUE_BAR_COLOR = "#4a90d9";
  const DEFAULT_TODAY_BAR_COLOR = "#4a9fe0";
  const DEFAULT_CHART_WRAP_BG_COLOR = "#ffffff";
  const DEFAULT_SVG_CHART_BG_COLOR = "#eef2f8";
  const DEFAULT_CARD_FORM_BG_COLOR = "#ffffff";
  const DEFAULT_RICH_EDITOR_BG_COLOR = "#f4f7fb";
  const DEFAULT_CARD_BG_COLOR = "#ffffff";
  const DEFAULT_EMPTY_BAR_COLOR = "#dce4f0";
  // Nouveaux réglages "Couleurs des fonds" / "Couleurs des textes" (items
  // 2h/2i) : chacun a un nom de réglage direct, plus explicite que les
  // anciennes clés génériques ci-dessus.
  const DEFAULT_BG_COLORS = {
    appBg: "#eef2f8",
    homeSquareBg: "#ffffff",
    homeAddCardBg: "#4a90d9",
    cardFormBg: "#ffffff",
    richEditorBg: "#f4f7fb",
    homeBtnBg: "transparent",
    cardBg: "#ffffff",
    subjectSelectBg: "#f0f3f7",
    syncStatusBg: "transparent",
    folderBg: "#ffffff",
    folderL1Bg: "#ffffff",
    folderL2Bg: "#ffffff",
    folderL3Bg: "#ffffff",
    subjectRowBg: "#ffffff",
    addBtnBg: "#f0f3f7",
    chartWrapBg: "#ffffff",
    svgChartBg: "#eef2f8",
    dueBarColor: "#4a90d9",
    todayBarColor: "#4a9fe0",
    reviewedBarColor: "#4a90d9",
    // Item 10 (dernier lot) : fond du bouton "Ne pas suivre le programme".
    skipProgramBg: "#fde8d7",
    // Item 11 (dernier lot) : fond de la page d'accueil, indépendant du
    // fond des autres pages (appBg).
    homeBg: "#eef2f8",
  };
  // Item 4 : couleurs de fond pour le mode nuit — un jeu de valeurs sombres
  // parallèle, réglable séparément dans le mode développeur.
  const DEFAULT_NIGHT_BG_COLORS = {
    appBg: "#11151c",
    homeSquareBg: "#1c2330",
    homeAddCardBg: "#3a75b3",
    cardFormBg: "#1c2330",
    richEditorBg: "#232b3a",
    homeBtnBg: "transparent",
    cardBg: "#1c2330",
    subjectSelectBg: "#232b3a",
    syncStatusBg: "transparent",
    folderBg: "#1c2330",
    folderL1Bg: "#212939",
    folderL2Bg: "#252e40",
    folderL3Bg: "#2a3447",
    subjectRowBg: "#1c2330",
    addBtnBg: "#232b3a",
    chartWrapBg: "#1c2330",
    svgChartBg: "#11151c",
    dueBarColor: "#5a9fe0",
    todayBarColor: "#6bafef",
    reviewedBarColor: "#5a9fe0",
    skipProgramBg: "#4a3524",
    homeBg: "#11151c",
  };
  const DEFAULT_TEXT_COLORS_SET = {
    homeTitle: "#1f2937",
    titles: "#1f2937",
    generalText: "#64748b",
    folderSubjectNames: "#1f2937",
    cardText: "#1f2937",
    chartValues: "#6b7280",
    chartLabels: "#6b7280",
    chartTodayLabel: "#1f2937",
    selectorText: "#1f2937",
    syncText: "#64748b",
  };
  const DEFAULT_NIGHT_TEXT_COLORS_SET = {
    homeTitle: "#eef2f8",
    titles: "#eef2f8",
    generalText: "#93a1b5",
    folderSubjectNames: "#eef2f8",
    cardText: "#eef2f8",
    chartValues: "#93a1b5",
    chartLabels: "#93a1b5",
    chartTodayLabel: "#eef2f8",
    selectorText: "#eef2f8",
    syncText: "#93a1b5",
  };
  // Effet d'ombrage réglable élément par élément (item 5) — clé -> nom de
  // variable CSS + intitulé affiché dans la page développeur. Tout activé
  // par défaut (comportement actuel inchangé tant qu'on ne décoche rien).
  const SHADOW_ELEMENTS = {
    duePill: { varName: "--shadow-due-pill", title: "Pastille « à revoir »" },
    homeSquare: { varName: "--shadow-home-square", title: "Boutons de la page d'accueil" },
    card: { varName: "--shadow-card", title: "Fiches (recto & verso)" },
    cardForm: { varName: "--shadow-card-form", title: "Cadres (blocs)" },
    statBox: { varName: "--shadow-stat-box", title: "Cases de statistiques" },
    chartWrap: { varName: "--shadow-chart-wrap", title: "Histogrammes" },
    subjectRow: { varName: "--shadow-subject-row", title: "Boîtes et dossiers" },
  };
  const DEFAULT_SHADOWS = Object.fromEntries(Object.keys(SHADOW_ELEMENTS).map((k) => [k, true]));
  // Score d'apprentissage des fiches (item 1) : S = ((D-1)^P)/((D-1)^P+B),
  // D = délai (en jours) avant la prochaine interrogation.
  const DEFAULT_CARD_SCORE_SETTINGS = {
    p: 1.2,
    b: 10,
    v1: 10,
    v2: 45,
    v3: 65,
    v4: 75,
    v5: 85,
    hideReviewScoreInfo: false,
    hideSubjectScoreOnReview: false,
    // Item 3 : taille de police du texte "Objectif : X" sur la jauge de
    // la page Programme de révision, réglable dans le mode développeur.
    programTargetFontSize: 8,
  };
  // Zones de la jauge (item 4) : 6 zones désormais ("Bien" ajoutée entre
  // "En bonne voie" et "Maîtrisé"), couleurs réglables depuis le mode
  // développeur plutôt que fixes.
  const GAUGE_ZONE_DEFS = [
    { key: "debutant", boundKey: "v1", label: "0 étoile", stars: 0 },
    { key: "fragile", boundKey: "v2", label: "1 étoile", stars: 1 },
    { key: "enBonneVoie", boundKey: "v3", label: "2 étoiles", stars: 2 },
    { key: "bien", boundKey: "v4", label: "3 étoiles", stars: 3 },
    { key: "maitrise", boundKey: "v5", label: "4 étoiles", stars: 4 },
    { key: "acquis", boundKey: null, label: "5 étoiles", stars: 5 },
  ];
  // Item 8 : intitulés des zones remplacés par des étoiles — une étoile
  // grisée vide pour le tout premier niveau (0), puis 1 à 5 étoiles
  // pleines, dans la couleur de la zone.
  function gaugeZoneStarText(stars) {
    return stars === 0 ? "☆" : "★".repeat(stars);
  }
  const DEFAULT_GAUGE_COLORS = {
    debutant: "#94a3b8",
    fragile: "#7c93b3",
    enBonneVoie: "#4a90d9",
    bien: "#3a7cc4",
    maitrise: "#2f6fb0",
    acquis: "#5fae7c",
  };

  // Nouvel algorithme de révision (remplace entièrement le système de
  // modes K/M "again/hard/good/easy" ci-dessus pour le calcul de
  // l'échéance — celui-ci reste en mémoire pour compat mais n'est plus
  // utilisé par computeAlgoNext). Chaque fiche porte désormais :
  //  - dd   : dernier délai d'interrogation appliqué (en MINUTES)
  //  - pers : persistance de la fiche (en MINUTES)
  // Chaque bouton (index 0=Encore, 1=Difficile, 2=Bien, 3=Excellent) porte
  // COEF_TE/COEF_DD/PLAFOND/PLANCHER/ABAT. À l'évaluation :
  //   TE = temps écoulé (minutes) depuis la dernière interrogation
  //   NDI = maxi(DD*COEF_DD ; TE*COEF_TE), borné à
  //         [PLANCHER ; mini(PLAFOND ; DD*COEF_DD)]
  //   PERS = NDI*ABAT
  // Remarque (signalée à l'utilisateur, décision explicitement reportée) :
  // avec cette formule de plafond telle que donnée, mini(PLAFOND ; DD*COEF_DD)
  // est mathématiquement toujours <= DD*COEF_DD, qui est lui-même toujours
  // <= maxi(...) — donc TE*COEF_TE n'a, en l'état, aucune influence sur le
  // résultat final. Implémenté ici littéralement tel que spécifié ; à
  // corriger une fois la question tranchée avec l'utilisateur.
  const REVISION_ALGO_RATING_ORDER = ["again", "hard", "good", "easy"];
  const REVISION_ALGO_RATING_LABELS = {
    again: "Encore (indice 0)",
    hard: "Difficile (indice 1)",
    good: "Bien (indice 2)",
    easy: "Excellent (indice 3)",
  };
  const DEFAULT_REVISION_ALGO_SETTINGS = {
    coefTe: [0, 0, 1.4, 2],
    coefDd: [0, 0, 1.1, 1.2],
    // PLAFOND/PLANCHER en MINUTES.
    plafondMin: [7, 15, 43200, 86400],
    plancherMin: [7, 15, 45, 240],
    abat: [0, 0.1, 0.66, 0.8],
    // Délai initial (minutes) appliqué à la création d'une fiche.
    initialDelayMin: 5,
    // Paliers des jauges — saisis en JOURS dans le mode développeur,
    // convertis en minutes au moment des calculs (voir revisionAlgoPaliersMin).
    palierCourtTermeJ: 2,
    palierMoyenTermeJ: 8,
    palierLongTermeJ: 30,
  };
  // Jauge "persistance" (4 segments) qui remplace l'ancienne jauge de score
  // 0-100 dans les 3 emplacements où elle apparaissait (Organisation,
  // Réviser, Programme de révision).
  const DEFAULT_PERS_GAUGE_COLORS = {
    court: "#d9dde3", // gris clair : PERS < PALIER_COURT_TERME
    moyen: "#a7e3b0", // vert clair : entre COURT et MOYEN
    long: "#4caf6b", // vert : entre MOYEN et LONG
    tresLong: "#1f7a44", // vert foncé : PERS > PALIER_LONG_TERME
  };
  const PERS_GAUGE_ZONE_ORDER = ["court", "moyen", "long", "tresLong"];
  const PERS_GAUGE_ZONE_LABELS = {
    court: "Court terme",
    moyen: "Moyen terme",
    long: "Long terme",
    tresLong: "Très long terme",
  };
  // Disposition dispersée de la page d'accueil (item 3) : position (x,y en
  // pixels, coin haut-gauche du cercle) + diamètre (px) par bouton — tailles
  // différentes selon l'importance (Réviser le plus grand, Développeur le
  // plus petit). Repères en pourcentage de la zone d'accueil (item — bug
  // corrigé : des pixels fixes, pensés pour ~390px de large, décalaient
  // tout vers la gauche sur un écran plus large comme un PC, puisque
  // l'appli s'adapte elle en largeur — le pourcentage, lui, suit toujours
  // la largeur réelle quel que soit l'appareil).
  const HOME_LAYOUT_TITLES = {
    review: "Réviser", manage: "Mes collections", cards: "Fiches", addCard: "Ajouter une fiche",
    stats: "Statistiques", settings: "Réglages", calendar: "Calendrier",
    sync: "Synchronisation", dev: "Développeur", classes: "Classes",
    account: "Compte", messages: "Messagerie", library: "Bibliothèque",
  };
  // Largeur/hauteur de référence utilisées uniquement pour convertir une
  // seule fois d'anciens réglages enregistrés en pixels (avant ce
  // correctif) vers des pourcentages équivalents.
  const HOME_LAYOUT_LEGACY_REF_WIDTH = 354;
  const HOME_LAYOUT_LEGACY_REF_HEIGHT = 640;
  const DEFAULT_HOME_LAYOUT = {
    review: { x: 26.1, y: 13.7, d: 155 },
    addCard: { x: 73.4, y: 14.9, d: 110 },
    cards: { x: 21.9, y: 39.5, d: 105 },
    stats: { x: 77.7, y: 37.5, d: 100 },
    manage: { x: 79.8, y: 59.0, d: 95 },
    calendar: { x: 39.5, y: 54.7, d: 100 },
    settings: { x: 16.2, y: 73.8, d: 85 },
    sync: { x: 54.4, y: 76.2, d: 95 },
    dev: { x: 89.0, y: 79.0, d: 80 },
    classes: { x: 50.0, y: 90.0, d: 85 },
    account: { x: 15.0, y: 90.0, d: 70 },
    // Round 6, item 5 : position par défaut du rond Messagerie — zone
    // encore libre entre "Réviser" et "Ajouter une fiche" en haut, et
    // "Fiches"/"Stats" en dessous ; ajustable comme les autres via le
    // mode développeur si jamais ça chevauche un réglage personnalisé.
    messages: { x: 50.0, y: 26.5, d: 90 },
    // Nouvelle Bibliothèque (partage public de collections) : zone libre à
    // gauche, entre "Fiches" et "Réglages".
    library: { x: 16.0, y: 54.0, d: 90 },
  };
  // Items 1/2 (logo) : position (X/Y en %, centre du logo) et taille (px)
  // du logo sur la page d'accueil.
  const DEFAULT_HOME_LOGO = { x: 50, y: 7, size: 64, shadow: false };
  // Items 1/2/6 (dernier lot) : logo affiché en haut du corps de chaque
  // autre page (taille + ombre, indépendantes de celles de l'accueil).
  const DEFAULT_BODY_LOGO = { size: 40, shadow: false };
  // Items 4 et 5 : le robot (logo en haut du corps de page) peut porter un
  // ou plusieurs messages d'aide selon la page — un tableau permet une
  // petite série façon tuto (voir bouton "Suite", round 4), une simple
  // chaîne reste acceptée pour un message unique.
  const DEFAULT_HELP_MESSAGES_BY_VIEW = {
    manage: ["Lorsque tu mets une fiche dans un dossier vide, il se transforme alors en boîte à fiches."],
    "revision-program": ["A ta place, voici ce que je réviserais en priorité, dans l'ordre :"],
    review: [],
    cards: [],
    stats: [],
    sync: [],
    calendar: [],
    classes: [],
    "classes-student": [],
    "classes-teacher": [],
    "class-detail": [],
    account: [],
    settings: [],
    dev: [],
    "new-card": [],
    "boite-picker": [],
    "mode-assign": [],
    messages: [],
    "message-thread": [],
    library: ["Ici, tu peux prendre des collections de fiches partagées par d'autres — elles s'ajoutent à tes collections, avec cette icône en réseau pour les reconnaître."],
  };
  // Round 4, partie 2 : intitulés amicaux de chaque page, pour l'éditeur du
  // mode développeur — mêmes clés que DEFAULT_HELP_MESSAGES_BY_VIEW.
  const HELP_VIEW_LABELS = {
    review: "Réviser",
    manage: "Mes collections (Organisation)",
    cards: "Fiches",
    stats: "Statistiques",
    sync: "Synchronisation",
    calendar: "Calendrier",
    "revision-program": "Programme de révision",
    classes: "Classes (page d'accueil)",
    "classes-student": "Classes — J'apprends",
    "classes-teacher": "Classes — J'enseigne",
    "class-detail": "Classes — page d'une classe",
    account: "Compte",
    settings: "Réglages",
    dev: "Développeur",
    "new-card": "Nouvelle fiche",
    "boite-picker": "Sélecteur de boîte(s)",
    "mode-assign": "Affecter un mode",
    messages: "Messagerie",
    "message-thread": "Messagerie — discussion",
    library: "Bibliothèque",
  };
  // Round 4 : le robot ne dit plus rien par défaut — une petite bulle
  // "aide" cliquable apparaît à côté de lui quand la page a un message, et
  // c'est ce clic qui ouvre la bulle de parole (fermée à chaque changement
  // de page). Une série de plusieurs messages se parcourt avec "Suite".
  // Round 4, partie 2 : les messages viennent maintenant des réglages
  // développeur (éditables dans l'appli), avec les valeurs ci-dessus comme
  // défaut tant que rien n'a été personnalisé.
  let bodyLogoSpeechMessages = [];
  let bodyLogoSpeechIndex = 0;
  function applyBodyLogoSpeech(view) {
    const raw = loadDevSettings().helpMessagesByView[view];
    bodyLogoSpeechMessages = Array.isArray(raw) ? raw.filter((m) => m && m.trim()) : raw ? [raw] : [];
    bodyLogoSpeechIndex = 0;
    renderBodyLogoSpeechState(false);
  }
  function renderBodyLogoSpeechState(open) {
    const helpBtn = el("body-logo-help-btn");
    const speechEl = el("body-logo-speech");
    const textEl = el("body-logo-speech-text");
    const prevBtn = el("body-logo-speech-prev");
    const nextBtn = el("body-logo-speech-next");
    if (!helpBtn || !speechEl || !textEl || !nextBtn) return;
    const hasMessages = bodyLogoSpeechMessages.length > 0;
    const isOpen = hasMessages && open;
    helpBtn.hidden = !hasMessages || isOpen;
    speechEl.hidden = !isOpen;
    if (!isOpen) return;
    const text = bodyLogoSpeechMessages[bodyLogoSpeechIndex] || "";
    if (textEl.textContent !== text) {
      textEl.textContent = text;
      // Petite animation "pop" à chaque nouveau message, pour bien montrer
      // que c'est un nouveau propos du robot.
      speechEl.classList.remove("is-popping");
      void speechEl.offsetWidth;
      speechEl.classList.add("is-popping");
    }
    // Round 4, partie 3 : "Précédent" masqué sur le tout premier message,
    // "Suite" masqué sur le dernier.
    if (prevBtn) prevBtn.hidden = bodyLogoSpeechIndex <= 0;
    nextBtn.hidden = bodyLogoSpeechIndex >= bodyLogoSpeechMessages.length - 1;
  }
  const bodyLogoHelpBtn = el("body-logo-help-btn");
  if (bodyLogoHelpBtn) {
    bodyLogoHelpBtn.addEventListener("click", () => {
      bodyLogoSpeechIndex = 0;
      renderBodyLogoSpeechState(true);
    });
  }
  const bodyLogoSpeechEl = el("body-logo-speech");
  if (bodyLogoSpeechEl) {
    // Cliquer sur la bulle elle-même la referme (sauf sur les boutons
    // "Précédent"/"Suite", qui ont leur propre comportement).
    bodyLogoSpeechEl.addEventListener("click", (e) => {
      if (e.target.closest("#body-logo-speech-next") || e.target.closest("#body-logo-speech-prev")) return;
      renderBodyLogoSpeechState(false);
    });
  }
  const bodyLogoSpeechPrevBtn = el("body-logo-speech-prev");
  if (bodyLogoSpeechPrevBtn) {
    bodyLogoSpeechPrevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      bodyLogoSpeechIndex = Math.max(bodyLogoSpeechIndex - 1, 0);
      renderBodyLogoSpeechState(true);
    });
  }
  const bodyLogoSpeechNextBtn = el("body-logo-speech-next");
  if (bodyLogoSpeechNextBtn) {
    bodyLogoSpeechNextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      bodyLogoSpeechIndex = Math.min(bodyLogoSpeechIndex + 1, bodyLogoSpeechMessages.length - 1);
      renderBodyLogoSpeechState(true);
    });
  }
  /* Round 3, item 3 : le robot "parle" pour tous les messages de l'appli
   *  (information, avertissement, confirmation) — remplace les alert()/
   *  confirm() natifs du navigateur, jugés trop bruts et pas cohérents
   *  avec le personnage du robot déjà utilisé ailleurs dans l'appli.
   *  showRobotMessage(text, {buttons}) affiche la bulle en superposition
   *  et résout une Promise avec la "value" du bouton cliqué (ou la touche
   *  Échap, traitée comme une annulation). robotAlert/robotConfirm sont
   *  des raccourcis pour les deux cas d'usage les plus courants. */
  function showRobotMessage(text, opts) {
    opts = opts || {};
    const buttons = opts.buttons || [{ label: "OK", value: true, primary: true }];
    const overlay = el("robot-modal-overlay");
    const textEl = el("robot-modal-text");
    const actions = el("robot-modal-actions");
    if (!overlay || !textEl || !actions) {
      // Repli très défensif si jamais le balisage manque (ne devrait pas
      // arriver) : on ne bloque pas l'appli, on résout juste positivement.
      return Promise.resolve(buttons[buttons.length - 1].value);
    }
    return new Promise((resolve) => {
      textEl.textContent = text;
      actions.innerHTML = "";
      let settled = false;
      function close(value) {
        if (settled) return;
        settled = true;
        overlay.hidden = true;
        document.removeEventListener("keydown", onKeydown, true);
        resolve(value);
      }
      function onKeydown(e) {
        if (e.key === "Escape") {
          e.preventDefault();
          close(opts.cancelValue !== undefined ? opts.cancelValue : false);
        }
      }
      buttons.forEach((b) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "robot-modal-btn" +
          (b.primary ? " robot-modal-btn--primary" : "") +
          (b.danger ? " robot-modal-btn--danger" : "");
        btn.textContent = b.label;
        btn.addEventListener("click", () => close(b.value));
        actions.appendChild(btn);
      });
      overlay.hidden = false;
      document.addEventListener("keydown", onKeydown, true);
      requestAnimationFrame(() => {
        const first = actions.querySelector(".robot-modal-btn--primary") || actions.querySelector("button");
        if (first) first.focus();
      });
    });
  }
  /** Remplace alert("...") : un seul bouton OK, résout quand il est fermé. */
  function robotAlert(text) {
    return showRobotMessage(text, { buttons: [{ label: "OK", value: true, primary: true }] });
  }
  /** Remplace confirm("...") : deux boutons, résout true/false. Le bouton
   *  de confirmation est marqué "danger" (rouge) pour les actions
   *  destructrices (suppressions), pour garder le même signal visuel
   *  qu'ailleurs dans l'appli. */
  function robotConfirm(text, opts) {
    opts = opts || {};
    return showRobotMessage(text, {
      buttons: [
        { label: opts.cancelLabel || "Annuler", value: false },
        {
          label: opts.okLabel || "Confirmer",
          value: true,
          primary: !opts.danger,
          danger: !!opts.danger,
        },
      ],
    });
  }

  const LOGO_SHADOW_FILTER = "drop-shadow(0 3px 5px rgba(0,0,0,0.35))";
  // Hauteur de référence utilisée pour calculer les % verticaux de la page
  // Réviser (voir applyReviewLayout) : 844px est la hauteur de l'iPhone
  // standard 13/14/15 (390×844) sur lequel toute la disposition par défaut
  // ci-dessous a été réglée à l'origine — déductible des anciennes valeurs
  // par défaut du CSS (ex. 675px de haut de jauge / 80% = 844).
  const REVIEW_LAYOUT_REF_HEIGHT = 844;
  // Largeur de référence associée (390px = largeur de ce même iPhone
  // standard 13/14/15). Corrige un ratio largeur/hauteur incohérent entre
  // PC et iPhone (round 5, correctif 5) : la hauteur de référence était
  // déjà plafonnée ci-dessus, mais la largeur (voir applyReviewLayout)
  // restait calculée sur la largeur RÉELLE de .desk, qui va jusqu'à 560px
  // sur PC (voir .desk en CSS) contre ~390px sur iPhone — la fiche
  // s'étalait donc proportionnellement plus en largeur qu'en hauteur sur
  // un grand écran. Les deux dimensions se basent maintenant sur le même
  // gabarit fixe 390×844, centré quel que soit l'écran.
  const REVIEW_LAYOUT_REF_WIDTH = 390;
  // Disposition de la page Réviser (item 1c) : hauteur/largeur de la fiche
  // et position Y de son bord haut, position Y des boutons d'évaluation
  // (tous en % de l'écran), temps de retournement en secondes.
  const DEFAULT_REVIEW_LAYOUT = {
    cardHeightPct: 45,
    cardWidthPct: 91,
    cardTopPct: 13,
    ratingRowTopPct: 60,
    scoreInfoTopPct: 70,
    gaugeTopPct: 80,
    flipDurationSec: 0.7,
  };
  const DEFAULT_ICONS = {
    hibernate: "💤", edit: "✎", construction: "🚧", undo: "◀️", folder: "📁",
  };
  // Choix par défaut dans la banque d'icônes pour ces mêmes réglages
  // (utilisé seulement pour les 4 premiers — le dossier reste en
  // émoticône, utilisé comme simple texte à trop d'endroits pour basculer
  // en SVG sans tout casser).
  const DEFAULT_ICON_BANK_CHOICES = { hibernate: "sleep", edit: "pencil", construction: "cone", undo: "undo" };
  // Icônes de la page Organisation (item 3) : renommer/déplacer/supprimer,
  // sobres, choisies dans la banque d'icônes.
  const DEFAULT_ORG_ICON_BANK_CHOICES = { orgRename: "pencil", orgMove: "move", orgDelete: "trash", orgBoite: "stackedSheets" };
  // Icônes des boutons d'évaluation (item 2a) : plus d'émoticônes libres,
  // uniquement la banque d'icônes sobres.
  const DEFAULT_RATING_ICONS = { again: "faceSad", hard: "faceNeutral", good: "faceSmile", easy: "faceGrin" };
  // Palette de couleurs de texte proposée dans la mise en forme des fiches
  // (item 20 puis étendue ici) — modifiable, y compris ajouter/retirer des
  // couleurs, depuis la page Développeur.
  const DEFAULT_TEXT_COLORS = [
    { label: "Foncé", hex: "#23302a" },
    { label: "Terracotta", hex: "#b6604a" },
    { label: "Ambre", hex: "#cf9a4d" },
    { label: "Sauge", hex: "#6f8b5c" },
    { label: "Bleu-vert", hex: "#3e7c6b" },
    { label: "Marine", hex: "#1f3a5f" },
    { label: "Ciel", hex: "#2a8fd8" },
    { label: "Rose", hex: "#c96a95" },
    { label: "Violet", hex: "#8a5fb3" },
    { label: "Orange", hex: "#d97f35" },
    { label: "Gris", hex: "#6b7280" },
  ];

  /** Convertit une disposition d'accueil enregistrée en pixels (avant le
   *  correctif de cet item) vers des pourcentages équivalents, une seule
   *  fois — repérable via l'absence du marqueur homeLayoutUnit. Les
   *  réglages déjà migrés, ou tout nouveau réglage refait depuis
   *  l'interface (déjà en pourcentage), passent au travers sans y
   *  toucher. Gère aussi le passage du coin haut-gauche vers le centre du
   *  cercle (homeLayoutAnchor) — deux migrations indépendantes, un
   *  réglage peut avoir besoin de l'une, de l'autre, des deux, ou d'aucune. */
  function migrateHomeLayoutToPercent(parsed) {
    const stored = parsed.homeLayout || {};
    const unitMigrated = parsed.homeLayoutUnit === "percent";
    const anchorMigrated = parsed.homeLayoutAnchor === "center";
    return Object.fromEntries(
      Object.keys(DEFAULT_HOME_LAYOUT).map((k) => {
        const def = DEFAULT_HOME_LAYOUT[k];
        const val = stored[k];
        if (!val) return [k, { ...def }];
        // Ancien format en pixels : convertit vers un pourcentage de la
        // largeur/hauteur de référence d'origine (~390px de large).
        let x = val.x !== undefined ? Number(val.x) : def.x;
        let y = val.y !== undefined ? Number(val.y) : def.y;
        const d = val.d !== undefined ? Number(val.d) : def.d;
        if (!unitMigrated) {
          x = (x / HOME_LAYOUT_LEGACY_REF_WIDTH) * 100;
          y = (y / HOME_LAYOUT_LEGACY_REF_HEIGHT) * 100;
        }
        if (!anchorMigrated) {
          // Coin haut-gauche -> centre : on décale d'un demi-diamètre,
          // converti en pourcentage des mêmes repères de référence.
          x += (d / 2 / HOME_LAYOUT_LEGACY_REF_WIDTH) * 100;
          y += (d / 2 / HOME_LAYOUT_LEGACY_REF_HEIGHT) * 100;
        }
        return [k, { x, y, d }];
      })
    );
  }

  // Round 4, partie 3 : réglages développeur PUBLIÉS par Stéphane pour
  // tout le monde (table Supabase partagée en lecture, voir sync.js et
  // supabase/dev_settings_public_schema.sql) — récupérés une fois au
  // démarrage par loadPublicDevSettingsForEveryone(). null tant que rien
  // n'a encore été récupéré (hors ligne, Sync non configurée, ou pas
  // encore essayé) : dans ce cas, comportement inchangé (valeurs par
  // défaut du code).
  let publicDevSettingsOverride = null;
  function isPlainDevSettingsObject(v) {
    return Boolean(v) && typeof v === "object" && !Array.isArray(v);
  }
  /** Fusionne récursivement deux "couches" de réglages développeur :
   *  toute clé présente dans `override` l'emporte sur `base`, mais si les
   *  deux valeurs sont des objets simples (ex. nightColors.bgColors), on
   *  fusionne leurs propres clés au lieu de remplacer tout le groupe —
   *  un tableau (ex. une liste de messages d'aide) est, lui, toujours
   *  remplacé en bloc, jamais fusionné élément par élément. */
  function mergeDevSettingsLayer(base, override) {
    const out = { ...(isPlainDevSettingsObject(base) ? base : {}) };
    if (!isPlainDevSettingsObject(override)) return out;
    Object.keys(override).forEach((key) => {
      const b = out[key];
      const o = override[key];
      out[key] = isPlainDevSettingsObject(b) && isPlainDevSettingsObject(o) ? mergeDevSettingsLayer(b, o) : o;
    });
    return out;
  }
  /** Récupère (une fois, au démarrage) les réglages développeur publiés
   *  pour tout le monde et les applique — appelée depuis connectSync(),
   *  donc seulement quand la Sync est configurée (même condition que les
   *  comptes Classes, qui partagent le même projet Supabase). */
  async function loadPublicDevSettingsForEveryone() {
    try {
      const pub = await Sync.fetchPublicDevSettings();
      if (pub) {
        publicDevSettingsOverride = pub;
        // Invalide le cache ci-dessous pour forcer une refusion au
        // prochain loadDevSettings(), puis réapplique tout de suite (utile
        // pour tous les utilisateurs qui n'ont eux-mêmes AUCUN réglage
        // développeur local — la quasi-totalité des élèves/profs).
        _devSettingsCacheRaw = undefined;
        _devSettingsCache = undefined;
        applyAllDevSettings();
      }
    } catch (e) {
      /* hors ligne, ou pas encore de ligne publiée : on continue avec les
         valeurs par défaut du code, comme avant cette fonctionnalité. */
    }
  }

  // Bug corrigé (item 9) : cette fonction est appelée TRÈS souvent (une
  // fois par fiche pour son score, par exemple) et reconstruisait à chaque
  // fois l'objet complet (JSON.parse + fusion de ~15 groupes de réglages)
  // — sur une liste de nombreuses fiches, ça pouvait provoquer un vrai
  // temps de gel. On ne refait ce travail que si le contenu brut de
  // localStorage a changé depuis le dernier appel.
  let _devSettingsCacheRaw;
  let _devSettingsCache;
  function loadDevSettings() {
    const raw = localStorage.getItem(DEV_SETTINGS_KEY);
    if (_devSettingsCache && raw === _devSettingsCacheRaw) return _devSettingsCache;
    let parsed = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch (e) {
      parsed = {};
    }
    // Round 4, partie 3 : les réglages publiés pour tout le monde
    // s'insèrent ICI, comme une "sous-couche" entre les valeurs par
    // défaut du code et les réglages strictement locaux à cet appareil —
    // un réglage local reste prioritaire (utile à Stéphane, qui peut
    // préparer un changement avant de le publier), mais tout le monde
    // d'autre en hérite tant qu'il n'a pas ses propres réglages locaux.
    if (publicDevSettingsOverride) {
      parsed = mergeDevSettingsLayer(publicDevSettingsOverride, parsed);
    }
    const built = {
      ratingLabels: { ...DEFAULT_RATING_LABELS, ...(parsed.ratingLabels || {}) },
      navLabels: { ...DEFAULT_NAV_LABELS, ...(parsed.navLabels || {}) },
      navIcons: { ...DEFAULT_NAV_ICONS, ...(parsed.navIcons || {}) },
      ratingIcons: { ...DEFAULT_RATING_ICONS, ...(parsed.ratingIcons || {}) },
      iconBank: { ...DEFAULT_ICON_BANK_CHOICES, ...(parsed.iconBank || {}) },
      orgIconBank: { ...DEFAULT_ORG_ICON_BANK_CHOICES, ...(parsed.orgIconBank || {}) },
      ratingColors: { ...DEFAULT_RATING_COLORS, ...(parsed.ratingColors || {}) },
      // Round 4, partie 2 : messages d'aide du robot par page, éditables
      // dans le mode développeur. Fusion clé par clé comme les autres
      // groupes : une page personnalisée (même avec un tableau vide,
      // volontairement) remplace entièrement la valeur par défaut de
      // cette page, elle ne se mélange pas avec elle.
      helpMessagesByView: { ...DEFAULT_HELP_MESSAGES_BY_VIEW, ...(parsed.helpMessagesByView || {}) },
      ratingBtnBgColor: parsed.ratingBtnBgColor || DEFAULT_RATING_BTN_BG_COLOR,
      modeColors: { ...DEFAULT_MODE_COLORS, ...(parsed.modeColors || {}) },
      customModeColors: { ...(parsed.customModeColors || {}) },
      appBgColor: parsed.appBgColor || DEFAULT_APP_BG_COLOR,
      constructionActiveColor: parsed.constructionActiveColor || DEFAULT_CONSTRUCTION_ACTIVE_COLOR,
      bonusPillColor: parsed.bonusPillColor || DEFAULT_BONUS_PILL_COLOR,
      mainTextColor: parsed.mainTextColor || DEFAULT_MAIN_TEXT_COLOR,
      cardTextColor: parsed.cardTextColor || DEFAULT_CARD_TEXT_COLOR,
      dueBarColor: parsed.dueBarColor || DEFAULT_DUE_BAR_COLOR,
      todayBarColor: parsed.todayBarColor || DEFAULT_TODAY_BAR_COLOR,
      chartWrapBgColor: parsed.chartWrapBgColor || DEFAULT_CHART_WRAP_BG_COLOR,
      svgChartBgColor: parsed.svgChartBgColor || DEFAULT_SVG_CHART_BG_COLOR,
      cardFormBgColor: parsed.cardFormBgColor || DEFAULT_CARD_FORM_BG_COLOR,
      richEditorBgColor: parsed.richEditorBgColor || DEFAULT_RICH_EDITOR_BG_COLOR,
      cardBgColor: parsed.cardBgColor || DEFAULT_CARD_BG_COLOR,
      emptyBarColor: parsed.emptyBarColor || DEFAULT_EMPTY_BAR_COLOR,
      bgColors: { ...DEFAULT_BG_COLORS, ...(parsed.bgColors || {}) },
      textColorsSet: { ...DEFAULT_TEXT_COLORS_SET, ...(parsed.textColorsSet || {}) },
      shadows: { ...DEFAULT_SHADOWS, ...(parsed.shadows || {}) },
      homeLayout: migrateHomeLayoutToPercent(parsed),
      homeLogo: { ...DEFAULT_HOME_LOGO, ...(parsed.homeLogo || {}) },
      bodyLogo: { ...DEFAULT_BODY_LOGO, ...(parsed.bodyLogo || {}) },
      homeLayoutUnit: "percent",
      homeLayoutAnchor: "center",
      reviewLayout: { ...DEFAULT_REVIEW_LAYOUT, ...(parsed.reviewLayout || {}) },
      cardScore: { ...DEFAULT_CARD_SCORE_SETTINGS, ...(parsed.cardScore || {}) },
      gaugeColors: { ...DEFAULT_GAUGE_COLORS, ...(parsed.gaugeColors || {}) },
      // Clonage explicite des tableaux (coefTe/coefDd/plafondMin/plancherMin/
      // abat) — bug corrigé : un simple spread superficiel partageait la
      // même référence de tableau que DEFAULT_REVISION_ALGO_SETTINGS quand
      // aucun réglage n'était encore enregistré, donc modifier UN index
      // depuis le mode développeur mutait silencieusement les valeurs PAR
      // DÉFAUT elles-mêmes — et "Revenir aux valeurs par défaut" n'avait
      // alors plus aucun effet (il recopiait ce même tableau déjà corrompu).
      revisionAlgo: {
        ...DEFAULT_REVISION_ALGO_SETTINGS,
        ...(parsed.revisionAlgo || {}),
        coefTe: [...((parsed.revisionAlgo || {}).coefTe || DEFAULT_REVISION_ALGO_SETTINGS.coefTe)],
        coefDd: [...((parsed.revisionAlgo || {}).coefDd || DEFAULT_REVISION_ALGO_SETTINGS.coefDd)],
        plafondMin: [...((parsed.revisionAlgo || {}).plafondMin || DEFAULT_REVISION_ALGO_SETTINGS.plafondMin)],
        plancherMin: [...((parsed.revisionAlgo || {}).plancherMin || DEFAULT_REVISION_ALGO_SETTINGS.plancherMin)],
        abat: [...((parsed.revisionAlgo || {}).abat || DEFAULT_REVISION_ALGO_SETTINGS.abat)],
      },
      persGaugeColors: { ...DEFAULT_PERS_GAUGE_COLORS, ...(parsed.persGaugeColors || {}) },
      // Item 4 : mode nuit — un jeu de couleurs parallèle et réglable pour
      // chacun des groupes ci-dessus, plus un simple drapeau on/off (dont
      // l'état effectif est en réalité piloté par le bouton en topbar, pas
      // ce réglage-ci, qui ne sert qu'à mémoriser le dernier choix).
      nightMode: parsed.nightMode === true,
      nightColors: {
        bgColors: { ...DEFAULT_NIGHT_BG_COLORS, ...((parsed.nightColors || {}).bgColors || {}) },
        textColorsSet: { ...DEFAULT_NIGHT_TEXT_COLORS_SET, ...((parsed.nightColors || {}).textColorsSet || {}) },
        ratingColors: { ...DEFAULT_RATING_COLORS, ...((parsed.nightColors || {}).ratingColors || {}) },
        ratingBtnBgColor: (parsed.nightColors || {}).ratingBtnBgColor || DEFAULT_NIGHT_RATING_BTN_BG_COLOR,
        modeColors: { ...DEFAULT_MODE_COLORS, ...((parsed.nightColors || {}).modeColors || {}) },
        gaugeColors: { ...DEFAULT_GAUGE_COLORS, ...((parsed.nightColors || {}).gaugeColors || {}) },
      },
      icons: { ...DEFAULT_ICONS, ...(parsed.icons || {}) },
      textColors: Array.isArray(parsed.textColors) && parsed.textColors.length > 0 ? parsed.textColors : DEFAULT_TEXT_COLORS,
      factoryDefaults: {
        cool: { ...BUILTIN_MODE_DEFAULTS.cool, ...((parsed.factoryDefaults || {}).cool || {}) },
        normal: { ...BUILTIN_MODE_DEFAULTS.normal, ...((parsed.factoryDefaults || {}).normal || {}) },
        renforce: { ...BUILTIN_MODE_DEFAULTS.renforce, ...((parsed.factoryDefaults || {}).renforce || {}) },
      },
      // Bug corrigé (round 4, partie 3) : cette date n'était jusqu'ici
      // JAMAIS recopiée dans l'objet fusionné, alors que
      // reconcileDevSettings (synchro personnelle) s'en sert pour savoir
      // si la version locale est plus récente que celle du serveur — la
      // comparaison était donc toujours "locale = temps 0", donc toujours
      // perdante face au serveur.
      updatedAt: parsed.updatedAt,
    };
    _devSettingsCacheRaw = raw;
    _devSettingsCache = built;
    return built;
  }
  /** Round 4, partie 3 : réglages STRICTEMENT locaux à cet appareil, TELS
   *  QUE STOCKÉS (sans les valeurs par défaut du code ni la "sous-couche"
   *  publique — voir loadDevSettings) — à utiliser pour toute écriture
   *  automatique (non déclenchée par une vraie personnalisation de
   *  l'utilisateur dans le mode développeur), pour ne jamais figer par
   *  erreur un instantané complet dans le stockage local. */
  function loadRawDevSettingsOverride() {
    try {
      return JSON.parse(localStorage.getItem(DEV_SETTINGS_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveDevSettings(settings) {
    settings.updatedAt = new Date().toISOString();
    localStorage.setItem(DEV_SETTINGS_KEY, JSON.stringify(settings));
    scheduleDevSettingsPush();
  }
  // Poussée retardée (item 1 — synchro des réglages développeur) :
  // beaucoup d'appels à saveDevSettings coup sur coup en bougeant un
  // curseur de couleur enverraient sinon une requête réseau par pixel de
  // déplacement — un seul envoi group  é, un court instant après la
  // dernière modification.
  let devSettingsPushTimer = null;
  function scheduleDevSettingsPush() {
    if (typeof Sync === "undefined" || !Sync.isConfigured || !Sync.isConfigured()) return;
    clearTimeout(devSettingsPushTimer);
    devSettingsPushTimer = setTimeout(async () => {
      // Cloisonné par Compte connecté depuis le round 6 (voir
      // currentAccountEmailForSync) — corrige une fuite entre deux
      // Comptes utilisant le même code de synchro perso.
      const accountEmail = await currentAccountEmailForSync();
      Sync.pushDevSettings({ ...loadDevSettings(), appPrefs: gatherAppPrefs() }, accountEmail);
    }, 900);
  }
  /** Réglages de la page "Réglages" (item — jusqu'ici jamais synchronisés
   *  du tout, contrairement aux couleurs/icônes) : mode bonus, jours
   *  d'hibernation, affichage des jours sur les boutons, histogramme de
   *  Réviser, boîte mémorisée pour "Nouvelle fiche". Regroupés à part
   *  ici et glissés dans le MÊME envoi que les réglages développeur (pas
   *  besoin d'une deuxième table Supabase pour si peu de valeurs). */
  function gatherAppPrefs() {
    return {
      bonusDays: localStorage.getItem("fiches_bonus_days"),
      bonusAgainMode: localStorage.getItem("fiches_bonus_again_mode"),
      hibernateDays: localStorage.getItem("fiches_hibernate_days"),
      showRatingDays: localStorage.getItem("fiches_show_rating_days"),
      showReviewChart: localStorage.getItem("fiches_show_review_chart"),
      newCardSubjectId: localStorage.getItem("fiches_new_card_subject_id"),
      cardFontSize: localStorage.getItem("fiches_card_font_size"),
      calendarEvents: localStorage.getItem("fiches_calendar_events"),
      nightModeActive: localStorage.getItem("fiches_night_mode"),
    };
  }
  function applyAppPrefsFromRemote(prefs) {
    if (!prefs) return;
    const setIfPresent = (key, value) => {
      if (value === null || value === undefined) return;
      localStorage.setItem(key, value);
    };
    setIfPresent("fiches_bonus_days", prefs.bonusDays);
    setIfPresent("fiches_bonus_again_mode", prefs.bonusAgainMode);
    setIfPresent("fiches_hibernate_days", prefs.hibernateDays);
    setIfPresent("fiches_show_rating_days", prefs.showRatingDays);
    setIfPresent("fiches_show_review_chart", prefs.showReviewChart);
    setIfPresent("fiches_new_card_subject_id", prefs.newCardSubjectId);
    setIfPresent("fiches_card_font_size", prefs.cardFontSize);
    setIfPresent("fiches_calendar_events", prefs.calendarEvents);
    // Bug corrigé (item 1) : si l'utilisateur vient tout juste de changer
    // ce réglage LUI-MÊME (les quelques secondes qui suivent), on ignore
    // un écho de synchro qui reviendrait entre-temps avec l'ANCIENNE
    // valeur — le contraire ferait clignoter le bouton juste après l'avoir
    // pressé.
    if (Date.now() - lastLocalNightModeChangeAt > 4000) {
      setIfPresent("fiches_night_mode", prefs.nightModeActive);
    }
    loadBonusDaysSettings();
    loadBonusAgainMode();
    loadHibernateDays();
    newCardSubjectId = localStorage.getItem("fiches_new_card_subject_id") || null;
    applyShowRatingDays();
    applyShowReviewChart();
    applyCardFontSize();
    if (el("view-calendar") && el("view-calendar").classList.contains("is-active")) renderCalendarEvents();
    applyColorSettings();
    const nmBtn = el("night-mode-toggle-btn");
    document.documentElement.classList.toggle("is-night-mode", isNightModeActive());
    if (nmBtn) nmBtn.classList.toggle("is-active", isNightModeActive());
    renderSettingsView();
  }
  function getFactoryDefaults() {
    return loadDevSettings().factoryDefaults;
  }

  /** Couleur d'un mode personnalisé précis (item 16) — contrairement aux 3
   *  modes fixes (une couleur chacun), TOUS les modes personnalisés
   *  partageaient auparavant une seule et même couleur "custom". Chaque
   *  mode personnalisé a maintenant la sienne, réglable depuis la page
   *  Développeur, distincte de la couleur "custom" par défaut qui sert de
   *  repli pour un mode qui n'a pas encore de couleur assignée. */
  function getCustomModeColor(modeId) {
    const settings = loadDevSettings();
    return (settings.customModeColors || {})[modeId] || settings.modeColors.custom;
  }
  function setCustomModeColor(modeId, hex) {
    const settings = loadDevSettings();
    if (!settings.customModeColors) settings.customModeColors = {};
    settings.customModeColors[modeId] = hex;
    saveDevSettings(settings);
  }

  /** Applique la classe ET (pour un mode personnalisé) la couleur propre à
   *  CE mode précis sur un badge de mode (item 16) — un seul endroit pour
   *  les 2 emplacements où un badge de mode est affiché (page Gérer et
   *  fiche de révision). */
  function applyModeBadgeStyle(badgeEl, modeId) {
    if (!badgeEl) return;
    const key = algoModeCssKey(modeId);
    Object.values(ALGO_MODE_KEY_TO_CLASS).forEach((c) => badgeEl.classList.remove(c));
    badgeEl.classList.add(ALGO_MODE_KEY_TO_CLASS[key]);
    if (key === "custom") {
      // Item 3 : seule la couleur de l'icône reflète le mode personnalisé
      // choisi, le fond reste neutre (comme les autres modes).
      const color = getCustomModeColor(modeId);
      badgeEl.style.background = "";
      badgeEl.style.borderColor = "";
      badgeEl.style.color = color;
    } else {
      badgeEl.style.background = "";
      badgeEl.style.borderColor = "";
      badgeEl.style.color = "";
    }
  }

  /** Applique les émoticônes/texte des boutons de notation (item 19) —
   *  appelé au démarrage et après chaque modification sur la page
   *  Développeur. */
  function applyRatingLabels() {
    const settings = loadDevSettings();
    const icons = settings.ratingIcons;
    ["again", "hard", "good", "easy"].forEach((r) => {
      const el2 = document.querySelector(`.stamp--${r} .stamp-label`);
      if (el2 && icons[r] && ICON_LIBRARY[icons[r]]) el2.innerHTML = iconSvgMarkup(icons[r], "icon-inline-svg");
    });
  }
  /** Applique les émoticônes/texte du menu principal (item 19). */
  function applyNavLabels() {
    const settings = loadDevSettings();
    const labels = settings.navLabels;
    Object.keys(labels).forEach((view) => {
      const tab = document.querySelector(`.tab[data-view="${view}"]`);
      if (!tab) return;
      // Une vraie personnalisation texte/émoticône (page Développeur)
      // l'emporte sur tout. Sinon, l'icône choisie dans la banque
      // s'applique (par défaut, celle déjà en place).
      if (labels[view] !== DEFAULT_NAV_LABELS[view]) {
        tab.textContent = labels[view];
      } else {
        const iconId = settings.navIcons[view];
        if (iconId && ICON_LIBRARY[iconId]) tab.innerHTML = iconSvgMarkup(iconId);
      }
    });
  }

  /** Applique les couleurs des notes et des modes (item 2) : posées comme
   *  variables CSS sur :root, que la feuille de style référence désormais
   *  (voir .stamp--again, .is-cool, etc.) — un seul endroit à mettre à
   *  jour pour que ça se répercute partout où ces couleurs sont utilisées. */
  /** Conversions hex <-> TSL (teinte/saturation/lumière), item 17 — pour
   *  proposer un réglage par curseurs H/S/L en plus (ou à la place) du
   *  sélecteur natif <input type="color">, qui ne le propose pas partout
   *  de la même façon selon le navigateur/l'OS. */
  function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = 60 * (((g - b) / d) % 6); break;
        case g: h = 60 * ((b - r) / d + 2); break;
        case b: h = 60 * ((r - g) / d + 4); break;
      }
    }
    if (h < 0) h += 360;
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r1 = 0, g1 = 0, b1 = 0;
    if (h < 60) { r1 = c; g1 = x; } else if (h < 120) { r1 = x; g1 = c; }
    else if (h < 180) { g1 = c; b1 = x; } else if (h < 240) { g1 = x; b1 = c; }
    else if (h < 300) { r1 = x; b1 = c; } else { r1 = c; b1 = x; }
    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
  }

  const COLOR_SLIDER_MODE_KEY = "fiches_color_slider_mode";
  /** "none" | "rgb" | "tsl" — item : remplace la simple case à cocher par
   *  un vrai choix entre deux jeux de curseurs personnalisés, en plus du
   *  sélecteur natif de l'appareil (qui propose ses propres onglets
   *  Grille/Spectre/Curseurs, mais ceux-là appartiennent à l'OS et ne
   *  peuvent pas être renommés ni complétés depuis une page web). */
  function loadColorSliderMode() {
    const v = localStorage.getItem(COLOR_SLIDER_MODE_KEY);
    return v === "rgb" || v === "tsl" ? v : "none";
  }
  function saveColorSliderMode(value) {
    localStorage.setItem(COLOR_SLIDER_MODE_KEY, value);
  }

  /** Remplace le sélecteur natif <input type="color"> par un popup
   *  personnalisé (item 2 — clarifié : le choix RVB/TSL doit vivre DANS le
   *  popup qui s'ouvre au clic sur une couleur, pas à côté sous forme de
   *  réglage séparé). Chaque couleur de la page Développeur (et de la
   *  page Modes d'apprentissage pour les modes personnalisés) devient une
   *  pastille cliquable ; le popup contient l'aperçu, les curseurs
   *  (RVB ou TSL selon le dernier choix fait, mémorisé), et un bouton pour
   *  basculer entre les deux à tout moment. */
  let colorPopupEl = null;
  /** Popup de sélection dans la banque d'icônes (grille), même principe
   *  que le popup de couleur : un seul popup partagé, repositionné et
   *  re-rempli à chaque ouverture. */
  let iconPopupEl = null;
  function ensureIconPopup() {
    if (iconPopupEl) return iconPopupEl;
    iconPopupEl = document.createElement("div");
    iconPopupEl.className = "icon-popup";
    iconPopupEl.hidden = true;
    document.body.appendChild(iconPopupEl);
    // "pointerdown" plutôt que "click" (bug corrigé) : sur iOS Safari, un
    // clic sur un élément qui n'est pas nativement "cliquable" (un simple
    // <body>/<div> sans gestionnaire dessus) ne remonte pas toujours
    // fiablement jusqu'à un écouteur "click" posé sur document — le popup
    // semblait alors ne jamais se refermer au clic en dehors.
    // "pointerdown" est délivré de façon bien plus fiable, quel que soit
    // l'élément visé.
    document.addEventListener("pointerdown", (e) => {
      if (iconPopupEl.hidden) return;
      if (iconPopupEl.contains(e.target) || e.target.closest(".icon-picker-btn")) return;
      iconPopupEl.hidden = true;
    });
    return iconPopupEl;
  }
  function openIconPopup(anchorBtn, currentIconId, onPick) {
    const popup = ensureIconPopup();
    const rect = anchorBtn.getBoundingClientRect();
    const popupWidth = 240;
    popup.style.position = "fixed";
    popup.style.top = `${rect.bottom + 6}px`;
    popup.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 8))}px`;
    popup.hidden = false;
    popup.innerHTML = Object.keys(ICON_LIBRARY)
      .map(
        (id) =>
          `<button type="button" class="icon-bank-btn${id === currentIconId ? " is-active" : ""}" data-icon="${id}">${iconSvgMarkup(id, "icon-bank-svg")}</button>`
      )
      .join("");
    popup.querySelectorAll(".icon-bank-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        onPick(btn.dataset.icon);
        popup.hidden = true;
      });
    });
  }

  /** Éditeur des icônes du menu principal (banque d'icônes). */
  /** Éditeur générique "banque d'icônes" (item : réutilisé pour le menu
   *  principal ET les icônes de la fiche/arborescence) — une ligne par
   *  emplacement, avec un aperçu cliquable ouvrant la grille de choix. */
  function renderIconBankPicker(wrapId, slots, titles, settingsKey, onApplied) {
    const wrap = el(wrapId);
    if (!wrap) return;
    const settings = loadDevSettings();
    wrap.innerHTML = slots
      .map(
        (slot) => `<div class="dev-nav-icon-row">
          <span>${titles[slot] || slot}</span>
          <button type="button" class="icon-picker-btn" data-slot="${slot}">${iconSvgMarkup(settings[settingsKey][slot], "icon-bank-svg")}</button>
        </div>`
      )
      .join("");
    wrap.querySelectorAll(".icon-picker-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const slot = btn.dataset.slot;
        const current = loadDevSettings()[settingsKey][slot];
        openIconPopup(btn, current, (iconId) => {
          const s = loadDevSettings();
          s[settingsKey][slot] = iconId;
          saveDevSettings(s);
          onApplied();
          renderIconBankPicker(wrapId, slots, titles, settingsKey, onApplied);
        });
      });
    });
  }

  /** Applique les icônes choisies aux carrés de la page d'accueil (item
   *  2c) — même réglage "navIcons" que l'ancien menu principal, maintenant
   *  invisible, mais bien réel pour l'accueil. */
  function applyHomeIcons() {
    const settings = loadDevSettings();
    Object.keys(DEFAULT_NAV_ICONS).forEach((view) => {
      const square = document.querySelector(`.home-circle[data-key="${view}"] .home-circle-icon`);
      const iconId = settings.navIcons[view];
      if (square && iconId && ICON_LIBRARY[iconId]) {
        square.outerHTML = iconSvgMarkup(iconId, "home-circle-icon");
      }
    });
  }

  function renderNavIconsEditor() {
    renderIconBankPicker(
      "dev-nav-icons-list",
      Object.keys(DEFAULT_NAV_ICONS),
      { review: "Réviser", manage: "Gérer", cards: "Fiches", stats: "Stats", settings: "Réglages", addCard: "Ajouter une fiche", calendar: "Calendrier", sync: "Synchronisation", dev: "Développeur" },
      "navIcons",
      () => {
        applyNavLabels();
        applyHomeIcons();
      }
    );
  }

  function renderIconBankEditor() {
    renderIconBankPicker(
      "dev-icon-bank-list",
      Object.keys(DEFAULT_ICON_BANK_CHOICES),
      { hibernate: "Hibernation", edit: "Éditer", construction: "Chantier", undo: "Annuler" },
      "iconBank",
      applyIconSettings
    );
  }

  /** Icônes de la page Organisation (item 3) : renommer/déplacer/
   *  supprimer. */
  function renderOrgIconBankEditor() {
    renderIconBankPicker(
      "dev-org-icon-bank-list",
      Object.keys(DEFAULT_ORG_ICON_BANK_CHOICES),
      { orgRename: "Renommer", orgMove: "Déplacer", orgDelete: "Supprimer", orgBoite: "Icône des boîtes" },
      "orgIconBank",
      renderManageList
    );
  }

  /** Icônes des boutons d'évaluation (item 2a) — plus d'émoticônes libres. */
  function renderRatingIconsEditor() {
    renderIconBankPicker(
      "dev-rating-icons-list",
      Object.keys(DEFAULT_RATING_ICONS),
      { again: "Encore", hard: "Difficile", good: "Bien", easy: "Facile" },
      "ratingIcons",
      applyRatingLabels
    );
  }

  /** Liste verticale intitulé/sélecteur de couleur (items 2h/2i) —
   *  générique, réutilisée pour "Couleurs des fonds" et "Couleurs des
   *  textes" : un ordre précis de clés, avec leur intitulé affiché. */
  function renderColorListPicker(wrapId, order, titles, settingsKey, onApplied) {
    const wrap = el(wrapId);
    if (!wrap) return;
    const settings = loadDevSettings();
    wrap.innerHTML = order
      .map(
        (key) => `<div class="dev-color-row dev-color-row--daynight">
          <span>${titles[key] || key}</span>
          <span class="dev-color-daynight-pair">
            <input type="text" class="dev-color-value" data-key="${key}" data-variant="day" title="Mode jour" value="${settings[settingsKey][key]}" />
            <input type="text" class="dev-color-value" data-key="${key}" data-variant="night" title="Mode nuit" value="${(settings.nightColors[settingsKey] || {})[key]}" />
          </span>
        </div>`
      )
      .join("");
    wrap.querySelectorAll("input.dev-color-value").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        if (input.dataset.variant === "night") {
          if (!s.nightColors[settingsKey]) s.nightColors[settingsKey] = {};
          s.nightColors[settingsKey][input.dataset.key] = input.value;
        } else {
          s[settingsKey][input.dataset.key] = input.value;
        }
        saveDevSettings(s);
        onApplied();
      });
    });
    enhanceColorInputsWithHsl();
  }

  const BG_COLORS_ORDER = [
    "appBg", "homeBg", "homeSquareBg", "homeAddCardBg", "cardFormBg", "richEditorBg", "homeBtnBg", "cardBg",
    "subjectSelectBg", "syncStatusBg", "folderBg", "folderL1Bg", "folderL2Bg", "folderL3Bg",
    "subjectRowBg", "addBtnBg", "chartWrapBg", "svgChartBg", "dueBarColor", "todayBarColor", "reviewedBarColor",
    "skipProgramBg",
  ];
  const BG_COLORS_TITLES = {
    appBg: "Fond de l'appli (toutes pages sauf accueil)",
    homeBg: "Fond de la page d'accueil",
    homeSquareBg: "Boutons de la page d'accueil",
    homeAddCardBg: "Bouton « Ajouter une fiche » de l'accueil",
    cardFormBg: "Fond des cadres (blocs)",
    richEditorBg: "Fond des zones de texte",
    homeBtnBg: "Bouton home",
    cardBg: "Fond des fiches (recto & verso)",
    subjectSelectBg: "Fond des sélecteurs de boîtes",
    syncStatusBg: "Fond de la pastille synchronisé",
    folderBg: "Fond des dossiers",
    folderL1Bg: "Fond des sous-dossiers de niveau 1",
    folderL2Bg: "Fond des sous-dossiers de niveau 2",
    folderL3Bg: "Fond des sous-dossiers de niveau 3",
    subjectRowBg: "Fond des boîtes",
    addBtnBg: "Fond des boutons (nouveau dossier / nouvelle boîte)",
    chartWrapBg: "Fond des histogrammes",
    svgChartBg: "Fond des graphiques",
    dueBarColor: "Barres « à revoir »",
    todayBarColor: "Barre « Aujourd'hui »",
    reviewedBarColor: "Barres « révisées »",
    skipProgramBg: "Fond du bouton « Ne pas suivre le programme »",
  };
  function renderBgColorsEditor() {
    renderColorListPicker("dev-bg-colors-list", BG_COLORS_ORDER, BG_COLORS_TITLES, "bgColors", applyColorSettings);
  }

  const TEXT_COLORS_SET_ORDER = [
    "homeTitle", "titles", "generalText", "folderSubjectNames", "cardText",
    "chartValues", "chartLabels", "chartTodayLabel", "selectorText", "syncText",
  ];
  const TEXT_COLORS_SET_TITLES = {
    homeTitle: "Titre de la page d'accueil",
    titles: "Titres (toutes les pages)",
    generalText: "Textes (autres que titres)",
    folderSubjectNames: "Intitulés dossiers et boîtes",
    cardText: "Texte fiches",
    chartValues: "Valeurs graphiques",
    chartLabels: "Étiquettes graphiques",
    chartTodayLabel: "Étiquette « Aujourd'hui »",
    selectorText: "Texte sélecteurs",
    syncText: "Texte « synchroniser »",
  };
  function renderTextColorsSetEditor() {
    renderColorListPicker("dev-text-colors-set-list", TEXT_COLORS_SET_ORDER, TEXT_COLORS_SET_TITLES, "textColorsSet", applyColorSettings);
  }

  /** Applique (ou retire) l'ombrage de chaque élément réglable (item 5). */
  /** Positionne chaque cercle de l'accueil selon x/y/diamètre réglés
   *  (item 3). */
  function applyHomeLayout() {
    const layout = loadDevSettings().homeLayout;
    document.querySelectorAll(".home-circle[data-key]").forEach((circle) => {
      const pos = layout[circle.dataset.key];
      if (!pos) return;
      // Pourcentage de la zone d'accueil (bug corrigé) : suit la largeur
      // réelle de l'écran au lieu d'un pixel fixe pensé pour un iPhone,
      // qui décalait tout à gauche sur un PC plus large. X/Y visent
      // maintenant le CENTRE du cercle (translate -50%/-50%), plus
      // intuitif que le coin haut-gauche, surtout pour aligner des
      // cercles de tailles différentes entre eux.
      circle.style.left = `${pos.x}%`;
      circle.style.top = `${pos.y}%`;
      circle.style.width = `${pos.d}px`;
      circle.style.height = `${pos.d}px`;
      circle.style.transform = "translate(-50%, -50%)";
    });
    // Items 1/2 (logo) : position/taille du logo sur la page d'accueil,
    // réglables depuis le mode développeur.
    const logo = loadDevSettings().homeLogo;
    const bodyLogo = loadDevSettings().bodyLogo;
    const root = document.documentElement.style;
    // Bug corrigé (round 5) : le logo est positionné en absolu par rapport
    // à #view-home (dont la largeur suit .desk — jusqu'à 560px sur PC,
    // la largeur réelle de l'écran sur iPhone), alors que les cercles
    // ci-dessus sont positionnés par rapport à .home-scatter (largeur
    // FIXE, 354px au maximum, la même partout — voir HOME_SCATTER_MAX_WIDTH
    // ci-dessous, doit rester synchronisé avec le "width" de .home-scatter
    // dans style.css). Tant que le logo restait pile centré (x=50%) ça ne
    // se voyait pas, mais dès qu'on le décale, son offset horizontal
    // n'était pas calculé sur la même base que les cercles, donc pas le
    // même écart entre iPhone et PC.
    // Bug corrigé (round 5, 2e passage) : un premier correctif mesurait la
    // position RÉELLE de .home-scatter sur la page (getBoundingClientRect)
    // — correct uniquement quand la page d'accueil est actuellement
    // affichée. Or applyHomeLayout() s'exécute aussi à chaque changement
    // dans l'éditeur du mode développeur, PAGE DÉVELOPPEUR ACTIVE — la
    // page d'accueil est alors masquée (display:none), et un élément
    // masqué a un rectangle de 0×0 : le calcul retombait sur une valeur
    // dégénérée, ce qui rendait le glissement du réglage X sans aucun
    // effet visible tant qu'on ne retournait pas manuellement sur
    // l'accueil (et donnait des résultats différents iPhone/PC selon la
    // page qui se trouvait être affichée au moment du calcul). Recalculé
    // maintenant uniquement à partir de la largeur de .desk (TOUJOURS
    // visible, quelle que soit la page affichée) et des mêmes règles que
    // le CSS de .home-scatter (largeur dispo = .desk moins les 18px de
    // padding de #view-home de chaque côté, plafonnée à 354px) — plus
    // aucune dépendance à ce qui est affiché à l'écran au moment du calcul.
    const HOME_SCATTER_MAX_WIDTH = 354;
    const VIEW_HOME_SIDE_PADDING = 18;
    const deskWidthForLogo = document.querySelector(".desk")?.getBoundingClientRect().width || window.innerWidth;
    const viewHomeContentWidth = Math.max(0, deskWidthForLogo - VIEW_HOME_SIDE_PADDING * 2);
    const scatterWidthForLogo = Math.min(HOME_SCATTER_MAX_WIDTH, viewHomeContentWidth);
    // "left" d'un élément en position absolue se mesure depuis le bord
    // EXTÉRIEUR de la boîte de padding du référent (#view-home), donc
    // depuis avant son propre padding — il faut le rajouter ici pour que
    // 0px corresponde bien au tout début de la zone de contenu.
    const scatterLeftOffset = VIEW_HOME_SIDE_PADDING + (viewHomeContentWidth - scatterWidthForLogo) / 2;
    const logoLeftPx = scatterLeftOffset + (logo.x / 100) * scatterWidthForLogo;
    root.setProperty("--home-logo-x", `${Math.round(logoLeftPx)}px`);
    root.setProperty("--home-logo-y", `${logo.y}%`);
    root.setProperty("--home-logo-size", `${logo.size}px`);
    root.setProperty("--home-logo-shadow", logo.shadow ? LOGO_SHADOW_FILTER : "none");
    root.setProperty("--body-logo-size", `${bodyLogo.size}px`);
    root.setProperty("--body-logo-shadow", bodyLogo.shadow ? LOGO_SHADOW_FILTER : "none");
  }

  /** Retourne le temps de retournement de fiche réglé (item 1c), en
   *  millisecondes — utilisé à la fois pour la durée de transition CSS et
   *  pour savoir combien de temps attendre en JS avant d'échanger le
   *  contenu de la fiche (voir showNextCard). */
  function getFlipDurationMs() {
    return Math.max(150, Number(loadDevSettings().reviewLayout.flipDurationSec) * 1000 || 700);
  }

  /** Disposition de la page Réviser (item 1c) : taille/position de la
   *  fiche et des boutons d'évaluation, toutes en % de l'écran. */
  /** Positions/tailles de la page Réviser en pixels, calculées en JS
   *  (item — bug persistant malgré des corrections qui fonctionnaient en
   *  test : très probablement `max()`/`calc()` imbriqués, mal supportés
   *  sur certaines versions d'iOS Safari, silencieusement ignorés par le
   *  navigateur si c'est le cas — la fiche retombait alors sur une
   *  position par défaut qui pouvait chevaucher la barre de boîte.
   *  Cette version n'utilise plus AUCUNE fonction CSS de calcul : tout est
   *  calculé ici en JavaScript ordinaire, puis posé en pixels bruts,
   *  beaucoup plus difficile à mal interpréter pour un navigateur. */
  function applyReviewLayout() {
    const r = loadDevSettings().reviewLayout;
    const root = document.documentElement.style;
    // Bug corrigé (round 4, partie 4) : ce calcul se basait sur la hauteur
    // RÉELLE de la fenêtre (window.innerHeight) — cohérent tant qu'on reste
    // sur le même iPhone que celui utilisé pour régler la disposition, mais
    // plus du tout dès qu'on change d'appareil : un PC (fenêtre bien plus
    // haute), ou même un autre iPhone plus grand/petit, donnait alors des %
    // calculés sur un total différent, donc des positions visuellement
    // décalées par rapport à ce qui avait été réglé. Comme pour la largeur
    // juste en dessous (déjà plafonnée à celle de .desk), on plafonne
    // maintenant la hauteur de référence à REVIEW_LAYOUT_REF_HEIGHT (la
    // hauteur de l'appareil sur lequel la disposition par défaut a été
    // pensée) : sur tout écran AU MOINS aussi haut (PC, iPhone Pro Max...),
    // le calcul retombe toujours sur la même référence fixe, donc le même
    // rendu que sur l'iPhone d'origine. Sur un écran plus petit qu'elle
    // (vieux téléphone, fenêtre PC réduite), on garde la hauteur réelle
    // comme avant, pour ne rien faire déborder.
    const vh = Math.min(window.innerHeight, REVIEW_LAYOUT_REF_HEIGHT) / 100;
    // Bug corrigé (item 3, dernier lot) : ce calcul se basait sur la
    // largeur TOTALE de la fenêtre (window.innerWidth) — correcte sur
    // iPhone, où l'appli occupe tout l'écran, mais pas sur un écran large
    // (PC), où .desk est plafonné à 560px et centré. La fiche calculait
    // alors sa largeur en pourcentage d'un espace bien plus large que
    // celui réellement disponible, et débordait jusqu'à occuper toute la
    // largeur de la fenêtre. On se base maintenant sur la largeur RÉELLE
    // de .desk, la même quel que soit l'appareil.
    // Correctif 5 (ratio largeur/hauteur) : .desk peut aller jusqu'à 560px
    // sur PC (voir CSS) contre ~390px sur iPhone, donc utiliser sa largeur
    // réelle telle quelle déformait le ratio par rapport à la hauteur
    // (plafonnée, elle, à REVIEW_LAYOUT_REF_HEIGHT). On plafonne de la même
    // façon la largeur à REVIEW_LAYOUT_REF_WIDTH, pour retomber sur le même
    // gabarit fixe 390×844 sur tout écran au moins aussi grand.
    const deskWidth = document.querySelector(".desk")?.getBoundingClientRect().width || window.innerWidth;
    const vw = Math.min(deskWidth, REVIEW_LAYOUT_REF_WIDTH) / 100;
    // Marge de sécurité fixe sous la barre du haut + la barre de boîte
    // (elle-même posée à 54px + l'encoche) — 110px couvre confortablement
    // les deux sur la quasi-totalité des appareils.
    const MIN_CARD_TOP_PX = 110;
    const cardTopPx = Math.max(r.cardTopPct * vh, MIN_CARD_TOP_PX);
    root.setProperty("--review-card-height", `${Math.round(r.cardHeightPct * vh)}px`);
    root.setProperty("--review-card-width", `${Math.round(r.cardWidthPct * vw)}px`);
    root.setProperty("--review-card-top", `${Math.round(cardTopPx)}px`);
    root.setProperty("--review-rating-row-top", `${Math.round(r.ratingRowTopPct * vh)}px`);
    root.setProperty("--review-score-info-top", `${Math.round(r.scoreInfoTopPct * vh)}px`);
    root.setProperty("--review-gauge-top", `${Math.round(r.gaugeTopPct * vh)}px`);
    // Bug corrigé (item 2) : la durée CSS utilisait la valeur BRUTE du
    // réglage, alors que le calcul JS (voir getFlipDurationMs) applique un
    // minimum de 150ms — avec un réglage très court, la fiche changeait
    // alors de contenu à un instant qui ne correspondait plus du tout au
    // milieu RÉEL de l'animation. Les deux utilisent maintenant exactement
    // la même valeur, plafonnée de la même façon.
    root.setProperty("--review-flip-duration", `${getFlipDurationMs() / 1000}s`);
  }

  function renderHomeLayoutEditor() {
    const wrap = el("dev-home-layout-list");
    if (!wrap) return;
    const settings = loadDevSettings();
    wrap.innerHTML = Object.keys(DEFAULT_HOME_LAYOUT)
      .map((key) => {
        const pos = settings.homeLayout[key];
        return `<div class="dev-home-layout-row">
          <span class="dev-home-layout-title">${HOME_LAYOUT_TITLES[key] || key}</span>
          <label>X % <input type="number" step="0.1" class="dev-home-layout-input" data-key="${key}" data-field="x" value="${Math.round(pos.x * 10) / 10}" /></label>
          <label>Y % <input type="number" step="0.1" class="dev-home-layout-input" data-key="${key}" data-field="y" value="${Math.round(pos.y * 10) / 10}" /></label>
          <label>Ø px <input type="number" class="dev-home-layout-input" data-key="${key}" data-field="d" value="${pos.d}" /></label>
        </div>`;
      })
      .join("");
    wrap.querySelectorAll(".dev-home-layout-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        s.homeLayout[input.dataset.key][input.dataset.field] = Number(input.value) || 0;
        saveDevSettings(s);
        applyHomeLayout();
      });
    });
  }

  /** Items 1/2 : position/taille du logo sur la page d'accueil. */
  function renderHomeLogoEditor() {
    const wrap = el("dev-home-logo-list");
    if (!wrap) return;
    const logo = loadDevSettings().homeLogo;
    const bodyLogo = loadDevSettings().bodyLogo;
    wrap.innerHTML = `<div class="dev-home-layout-row">
      <span class="dev-home-layout-title">Logo (accueil)</span>
      <label>X % <input type="number" step="0.1" class="dev-home-logo-input" data-field="x" value="${logo.x}" /></label>
      <label>Y % <input type="number" step="0.1" class="dev-home-logo-input" data-field="y" value="${logo.y}" /></label>
      <label>Taille px <input type="number" class="dev-home-logo-input" data-field="size" value="${logo.size}" /></label>
    </div>
    <div class="dev-home-layout-row">
      <span class="dev-home-layout-title">Logo (autres pages)</span>
      <label>Taille px <input type="number" class="dev-body-logo-input" data-field="size" value="${bodyLogo.size}" /></label>
    </div>`;
    wrap.querySelectorAll(".dev-home-logo-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        s.homeLogo[input.dataset.field] = Number(input.value) || 0;
        saveDevSettings(s);
        applyHomeLayout();
      });
    });
    wrap.querySelectorAll(".dev-body-logo-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        s.bodyLogo[input.dataset.field] = Number(input.value) || 0;
        saveDevSettings(s);
        applyHomeLayout();
      });
    });
  }

  // Item 6 (dernier lot) : ombres du logo — réglages utilisateur
  // (Réglages), la donnée reste dans devSettings pour réutiliser
  // applyHomeLayout tel quel.
  const settingBodyLogoShadowEl = el("setting-body-logo-shadow");
  if (settingBodyLogoShadowEl) {
    settingBodyLogoShadowEl.addEventListener("change", () => {
      const s = loadDevSettings();
      s.bodyLogo.shadow = settingBodyLogoShadowEl.checked;
      saveDevSettings(s);
      applyHomeLayout();
    });
  }
  const settingHomeLogoShadowEl = el("setting-home-logo-shadow");
  if (settingHomeLogoShadowEl) {
    settingHomeLogoShadowEl.addEventListener("change", () => {
      const s = loadDevSettings();
      s.homeLogo.shadow = settingHomeLogoShadowEl.checked;
      saveDevSettings(s);
      applyHomeLayout();
    });
  }

  /** Disposition de la page Réviser (item 1b/1c). */
  const REVIEW_LAYOUT_FIELDS = [
    { key: "cardHeightPct", title: "Hauteur de la fiche", unit: "% de l'écran" },
    { key: "cardWidthPct", title: "Largeur de la fiche", unit: "% de l'écran" },
    { key: "cardTopPct", title: "Position Y du bord haut de la fiche", unit: "% de l'écran" },
    { key: "ratingRowTopPct", title: "Position Y des boutons d'évaluation", unit: "% de l'écran" },
    { key: "scoreInfoTopPct", title: "Position Y des infos de score de la fiche", unit: "% de l'écran" },
    { key: "gaugeTopPct", title: "Position Y de la jauge", unit: "% de l'écran" },
    { key: "flipDurationSec", title: "Temps de retournement de la fiche", unit: "secondes" },
  ];
  function renderReviewLayoutEditor() {
    const wrap = el("dev-review-layout-list");
    if (!wrap) return;
    const settings = loadDevSettings();
    wrap.innerHTML = REVIEW_LAYOUT_FIELDS.map(
      ({ key, title, unit }) => `<div class="dev-color-row">
        <span>${title} (${unit})</span>
        <input type="number" step="${key === "flipDurationSec" ? "0.1" : "1"}" class="dev-review-layout-input" data-key="${key}" value="${settings.reviewLayout[key]}" style="width:70px;" />
      </div>`
    ).join("");
    wrap.querySelectorAll(".dev-review-layout-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        s.reviewLayout[input.dataset.key] = Number(input.value) || 0;
        saveDevSettings(s);
        applyReviewLayout();
      });
    });
  }
  const devReviewLayoutResetBtn = el("dev-review-layout-reset");
  if (devReviewLayoutResetBtn) {
    devReviewLayoutResetBtn.addEventListener("click", () => {
      const s = loadDevSettings();
      s.reviewLayout = { ...DEFAULT_REVIEW_LAYOUT };
      saveDevSettings(s);
      applyReviewLayout();
      renderDevView();
    });
  }

  /** Nouvel algorithme de révision : COEF_TE/COEF_DD/PLAFOND/PLANCHER/ABAT
   *  par bouton (indices 0-3), délai initial, et les 3 paliers (en jours)
   *  des jauges de persistance. */
  const REVISION_ALGO_FIELD_DEFS = [
    { key: "coefTe", title: "COEF_TE (coefficient sur le temps écoulé)", step: "0.01" },
    { key: "coefDd", title: "COEF_DD (coefficient sur le dernier délai)", step: "0.01" },
    { key: "plafondMin", title: "PLAFOND (délai maximal, en minutes)", step: "1" },
    { key: "plancherMin", title: "PLANCHER (délai minimal, en minutes)", step: "1" },
    { key: "abat", title: "ABAT (abattement pour la persistance)", step: "0.01" },
  ];
  function renderRevisionAlgoEditor() {
    const wrap = el("dev-revision-algo-list");
    if (wrap) {
      const settings = loadDevSettings().revisionAlgo;
      wrap.innerHTML = REVISION_ALGO_FIELD_DEFS.map(
        ({ key, title, step }) => `<div class="dev-color-row">
          <span>${title}</span>
          <span class="algo-grid algo-grid--4" style="flex:1;">
            ${REVISION_ALGO_RATING_ORDER.map(
              (rating, idx) =>
                `<label class="field settings-bonus-field">
                  <span>${REVISION_ALGO_RATING_LABELS[rating]}</span>
                  <input type="number" step="${step}" class="dev-revision-algo-input" data-key="${key}" data-idx="${idx}" value="${settings[key][idx]}" />
                </label>`
            ).join("")}
          </span>
        </div>`
      ).join("");
      wrap.querySelectorAll(".dev-revision-algo-input").forEach((input) => {
        input.addEventListener("input", () => {
          const s = loadDevSettings();
          const idx = Number(input.dataset.idx);
          s.revisionAlgo[input.dataset.key][idx] = Number(input.value) || 0;
          saveDevSettings(s);
          updateRatingPreviews();
        });
      });
    }
    const initialInput = el("dev-revision-algo-initial-delay");
    if (initialInput) initialInput.value = loadDevSettings().revisionAlgo.initialDelayMin;
    ["palierCourtTermeJ", "palierMoyenTermeJ", "palierLongTermeJ"].forEach((k) => {
      const input = el(`dev-revision-algo-${k}`);
      if (input) input.value = loadDevSettings().revisionAlgo[k];
    });
  }
  function saveRevisionAlgoFromInputs() {
    const settings = loadDevSettings();
    const initialInput = el("dev-revision-algo-initial-delay");
    if (initialInput) settings.revisionAlgo.initialDelayMin = Number(initialInput.value) || DEFAULT_REVISION_ALGO_SETTINGS.initialDelayMin;
    ["palierCourtTermeJ", "palierMoyenTermeJ", "palierLongTermeJ"].forEach((k) => {
      const input = el(`dev-revision-algo-${k}`);
      if (input) settings.revisionAlgo[k] = Number(input.value) || DEFAULT_REVISION_ALGO_SETTINGS[k];
    });
    saveDevSettings(settings);
    renderManageList();
    updateRatingPreviews();
    renderReviewGauge();
    renderRevisionProgramList();
  }
  ["dev-revision-algo-initial-delay", "dev-revision-algo-palierCourtTermeJ", "dev-revision-algo-palierMoyenTermeJ", "dev-revision-algo-palierLongTermeJ"].forEach((id) => {
    const input = el(id);
    if (input) input.addEventListener("input", saveRevisionAlgoFromInputs);
  });
  const devRevisionAlgoResetBtn = el("dev-revision-algo-reset");
  if (devRevisionAlgoResetBtn) {
    devRevisionAlgoResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.revisionAlgo = { ...DEFAULT_REVISION_ALGO_SETTINGS };
      settings.persGaugeColors = { ...DEFAULT_PERS_GAUGE_COLORS };
      saveDevSettings(settings);
      renderDevView();
      renderManageList();
      updateRatingPreviews();
      renderReviewGauge();
      renderRevisionProgramList();
    });
  }
  function renderPersGaugeColorsEditor() {
    const wrap = el("dev-pers-gauge-colors-list");
    if (!wrap) return;
    const settings = loadDevSettings();
    wrap.innerHTML = PERS_GAUGE_ZONE_ORDER.map(
      (key) => `<div class="dev-color-row">
        <span>${PERS_GAUGE_ZONE_LABELS[key]}</span>
        <input type="text" class="dev-pers-gauge-color-input" data-key="${key}" value="${settings.persGaugeColors[key]}" />
      </div>`
    ).join("");
    wrap.querySelectorAll(".dev-pers-gauge-color-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        s.persGaugeColors[input.dataset.key] = input.value;
        saveDevSettings(s);
        renderManageList();
        renderReviewGauge();
        renderRevisionProgramList();
      });
    });
    enhanceColorInputsWithHsl();
  }

  /** Score des fiches (items 1a/1d/2) : P, B, seuils de jauge V1-V4, et
   *  les deux cases "masquer". */
  function renderCardScoreEditor() {
    const s = loadDevSettings().cardScore;
    const pInput = el("dev-score-p");
    const bInput = el("dev-score-b");
    if (pInput) pInput.value = s.p;
    if (bInput) bInput.value = s.b;
    ["v1", "v2", "v3", "v4", "v5"].forEach((k) => {
      const input = el(`dev-score-${k}`);
      if (input) input.value = s[k];
    });
    const fontSizeInput = el("dev-score-program-target-font-size");
    if (fontSizeInput) fontSizeInput.value = s.programTargetFontSize;
    const hideInfo = el("dev-score-hide-info");
    if (hideInfo) hideInfo.checked = s.hideReviewScoreInfo;
    const hideSubject = el("dev-score-hide-subject");
    if (hideSubject) hideSubject.checked = s.hideSubjectScoreOnReview;
  }
  function saveCardScoreFromInputs() {
    const settings = loadDevSettings();
    const pInput = el("dev-score-p");
    const bInput = el("dev-score-b");
    if (pInput) settings.cardScore.p = Number(pInput.value) || DEFAULT_CARD_SCORE_SETTINGS.p;
    if (bInput) settings.cardScore.b = Number(bInput.value) || DEFAULT_CARD_SCORE_SETTINGS.b;
    ["v1", "v2", "v3", "v4", "v5"].forEach((k) => {
      const input = el(`dev-score-${k}`);
      if (input) settings.cardScore[k] = Number(input.value) || DEFAULT_CARD_SCORE_SETTINGS[k];
    });
    const fontSizeInput = el("dev-score-program-target-font-size");
    if (fontSizeInput) settings.cardScore.programTargetFontSize = Number(fontSizeInput.value) || DEFAULT_CARD_SCORE_SETTINGS.programTargetFontSize;
    const hideInfo = el("dev-score-hide-info");
    if (hideInfo) settings.cardScore.hideReviewScoreInfo = hideInfo.checked;
    const hideSubject = el("dev-score-hide-subject");
    if (hideSubject) settings.cardScore.hideSubjectScoreOnReview = hideSubject.checked;
    saveDevSettings(settings);
    renderManageList();
    updateRatingPreviews();
    renderReviewSubjectScore();
    renderReviewGauge();
    renderRevisionProgramList();
  }
  ["dev-score-p", "dev-score-b", "dev-score-v1", "dev-score-v2", "dev-score-v3", "dev-score-v4", "dev-score-v5", "dev-score-program-target-font-size", "dev-score-hide-info", "dev-score-hide-subject"].forEach((id) => {
    const input = el(id);
    if (input) input.addEventListener("input", saveCardScoreFromInputs);
  });
  const devScoreResetBtn = el("dev-score-reset");
  if (devScoreResetBtn) {
    devScoreResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.cardScore = { ...DEFAULT_CARD_SCORE_SETTINGS };
      settings.gaugeColors = { ...DEFAULT_GAUGE_COLORS };
      settings.nightColors.gaugeColors = { ...DEFAULT_GAUGE_COLORS };
      saveDevSettings(settings);
      renderDevView();
      renderManageList();
      updateRatingPreviews();
      renderReviewSubjectScore();
      renderReviewGauge();
    });
  }

  /** Couleurs des zones de la jauge (item 4). */
  const GAUGE_COLORS_TITLES = Object.fromEntries(GAUGE_ZONE_DEFS.map((z) => [z.key, z.label]));
  function renderGaugeColorsEditor() {
    renderColorListPicker(
      "dev-gauge-colors-list",
      GAUGE_ZONE_DEFS.map((z) => z.key),
      GAUGE_COLORS_TITLES,
      "gaugeColors",
      () => {
        renderReviewGauge();
        renderManageList();
      }
    );
  }

  function applyShadowSettings() {
    const settings = loadDevSettings();
    const root = document.documentElement.style;
    Object.keys(SHADOW_ELEMENTS).forEach((key) => {
      const varName = SHADOW_ELEMENTS[key].varName;
      if (settings.shadows[key] === false) root.setProperty(varName, "none");
      else root.removeProperty(varName);
    });
  }

  function renderShadowsEditor() {
    const wrap = el("dev-shadows-list");
    if (!wrap) return;
    const settings = loadDevSettings();
    wrap.innerHTML = Object.keys(SHADOW_ELEMENTS)
      .map((key) => {
        const { title } = SHADOW_ELEMENTS[key];
        const checked = settings.shadows[key] !== false;
        return `<label class="settings-toggle-row">
          <input type="checkbox" class="dev-shadow-toggle" data-key="${key}" ${checked ? "checked" : ""} />
          <span>${title}</span>
        </label>`;
      })
      .join("");
    wrap.querySelectorAll(".dev-shadow-toggle").forEach((cb) => {
      cb.addEventListener("change", () => {
        const s = loadDevSettings();
        s.shadows[cb.dataset.key] = cb.checked;
        saveDevSettings(s);
        applyShadowSettings();
      });
    });
  }

  function ensureColorPopup() {
    if (colorPopupEl) return colorPopupEl;
    colorPopupEl = document.createElement("div");
    colorPopupEl.className = "color-popup";
    colorPopupEl.hidden = true;
    document.body.appendChild(colorPopupEl);
    // Même correctif que le popup d'icônes : "pointerdown" plutôt que
    // "click", plus fiable sur iOS Safari pour détecter un clic "en
    // dehors".
    document.addEventListener("pointerdown", (e) => {
      if (colorPopupEl.hidden) return;
      if (colorPopupEl.contains(e.target) || e.target.classList.contains("color-swatch-btn")) return;
      colorPopupEl.hidden = true;
    });
    return colorPopupEl;
  }

  /** Décompose une valeur de couleur (6 chiffres hex opaque, 8 chiffres
   *  hex avec alpha, ou l'ancien mot-clé "transparent") en teinte opaque +
   *  transparence 0-100 (item 2 : curseur réglable plutôt qu'un simple
   *  interrupteur tout ou rien). */
  function parseColorValue(value) {
    if (value === "transparent") return { hex6: "#000000", alpha: 0 };
    if (/^#[0-9a-fA-F]{8}$/i.test(value)) {
      return { hex6: value.slice(0, 7), alpha: Math.round((parseInt(value.slice(7, 9), 16) / 255) * 100) };
    }
    if (/^#[0-9a-fA-F]{6}$/i.test(value)) return { hex6: value, alpha: 100 };
    return { hex6: "#000000", alpha: 100 };
  }
  function buildColorValue(hex6, alpha) {
    const a = Math.max(0, Math.min(100, Math.round(alpha)));
    if (a >= 100) return hex6;
    const aHex = Math.round((a / 100) * 255).toString(16).padStart(2, "0");
    return `${hex6}${aHex}`;
  }

  function openColorPopup(input, anchorBtn) {
    const popup = ensureColorPopup();
    const rect = anchorBtn.getBoundingClientRect();
    const popupWidth = 260;
    popup.style.position = "fixed";
    popup.style.top = `${rect.bottom + 6}px`;
    popup.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 8))}px`;
    popup.hidden = false;

    function render() {
      const mode = loadColorSliderMode() === "rgb" ? "rgb" : "tsl";
      const { hex6: hex, alpha } = parseColorValue(input.value);
      let slidersHtml;
      if (mode === "rgb") {
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 0;
        const bch = parseInt(hex.slice(5, 7), 16) || 0;
        slidersHtml = `
          <div class="hsl-slider-row"><span>R</span><input type="range" min="0" max="255" value="${r}" data-c="r" /><span class="hsl-slider-value" data-cv="r">${r}</span></div>
          <div class="hsl-slider-row"><span>V</span><input type="range" min="0" max="255" value="${g}" data-c="v" /><span class="hsl-slider-value" data-cv="v">${g}</span></div>
          <div class="hsl-slider-row"><span>B</span><input type="range" min="0" max="255" value="${bch}" data-c="b" /><span class="hsl-slider-value" data-cv="b">${bch}</span></div>
        `;
      } else {
        const hsl = hexToHsl(hex);
        slidersHtml = `
          <div class="hsl-slider-row"><span>T</span><input type="range" min="0" max="360" value="${hsl.h}" data-c="h" /><span class="hsl-slider-value" data-cv="h">${hsl.h}</span></div>
          <div class="hsl-slider-row"><span>S</span><input type="range" min="0" max="100" value="${hsl.s}" data-c="s" /><span class="hsl-slider-value" data-cv="s">${hsl.s}</span></div>
          <div class="hsl-slider-row"><span>L</span><input type="range" min="0" max="100" value="${hsl.l}" data-c="l" /><span class="hsl-slider-value" data-cv="l">${hsl.l}</span></div>
        `;
      }
      popup.innerHTML = `
        <div class="color-popup-preview color-popup-preview--checker" style="--swatch-color:${hex6WithAlpha(hex, alpha)}"></div>
        <label class="color-popup-hex-row">
          <span>Hex</span>
          <input type="text" class="color-popup-hex-input" value="${hex}" placeholder="#rrggbb" maxlength="7" />
        </label>
        <div class="color-popup-sliders">${slidersHtml}</div>
        <div class="hsl-slider-row color-popup-alpha-row">
          <span>Opacité</span>
          <input type="range" min="0" max="100" value="${alpha}" id="color-popup-alpha" />
          <span class="hsl-slider-value" id="color-popup-alpha-value">${alpha}%</span>
        </div>
        <div class="color-popup-mode-toggle">
          <button type="button" class="color-popup-mode-btn${mode === "rgb" ? " is-active" : ""}" data-mode="rgb">RVB</button>
          <button type="button" class="color-popup-mode-btn${mode === "tsl" ? " is-active" : ""}" data-mode="tsl">TSL</button>
        </div>
      `;
      const commit = (newHex6, newAlpha) => {
        const value = buildColorValue(newHex6, newAlpha);
        input.value = value;
        setSwatchVisual(anchorBtn, value);
        const preview = popup.querySelector(".color-popup-preview");
        if (preview) preview.style.setProperty("--swatch-color", hex6WithAlpha(newHex6, newAlpha));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
      popup.querySelectorAll('input[type="range"]:not(#color-popup-alpha)').forEach((slider) => {
        slider.addEventListener("input", () => {
          // Affiche la valeur en direct à côté du curseur qu'on bouge,
          // sans attendre le prochain rendu complet (item 1).
          const valueSpan = popup.querySelector(`[data-cv="${slider.dataset.c}"]`);
          if (valueSpan) valueSpan.textContent = slider.value;
          let newHex;
          if (mode === "rgb") {
            const toHex = (v) => Number(v).toString(16).padStart(2, "0");
            newHex = `#${toHex(popup.querySelector('[data-c="r"]').value)}${toHex(popup.querySelector('[data-c="v"]').value)}${toHex(popup.querySelector('[data-c="b"]').value)}`;
          } else {
            newHex = hslToHex(
              Number(popup.querySelector('[data-c="h"]').value),
              Number(popup.querySelector('[data-c="s"]').value),
              Number(popup.querySelector('[data-c="l"]').value)
            );
          }
          const hexInput = popup.querySelector(".color-popup-hex-input");
          if (hexInput) hexInput.value = newHex;
          const curAlpha = Number(popup.querySelector("#color-popup-alpha").value);
          commit(newHex, curAlpha);
        });
      });
      // Opacité (item 2) : curseur réglable de 0 à 100%, plutôt qu'un
      // simple "transparent" tout ou rien.
      const alphaSlider = popup.querySelector("#color-popup-alpha");
      if (alphaSlider) {
        alphaSlider.addEventListener("input", () => {
          const valueSpan = popup.querySelector("#color-popup-alpha-value");
          if (valueSpan) valueSpan.textContent = `${alphaSlider.value}%`;
          const hexInput = popup.querySelector(".color-popup-hex-input");
          const curHex = hexInput ? hexInput.value : hex;
          commit(curHex, Number(alphaSlider.value));
        });
      }
      // Code hex tapé/collé directement (item 1).
      const hexInput = popup.querySelector(".color-popup-hex-input");
      if (hexInput) {
        hexInput.addEventListener("change", () => {
          const v = hexInput.value.trim();
          const curAlpha = Number(popup.querySelector("#color-popup-alpha").value);
          if (/^#[0-9a-fA-F]{6}$/.test(v)) commit(v, curAlpha);
          else hexInput.value = hex;
        });
      }
      popup.querySelectorAll(".color-popup-mode-btn").forEach((b) => {
        b.addEventListener("click", (e) => {
          // Bug corrigé (item 6) : sans stopPropagation, le clic remontait
          // jusqu'au document APRÈS que render() ait déjà remplacé le
          // contenu du popup (donc l'ancien bouton cliqué n'existait plus
          // dans le DOM) — le test "clic en dehors du popup" se trompait
          // et refermait le popup juste après l'avoir redessiné.
          e.stopPropagation();
          saveColorSliderMode(b.dataset.mode);
          render();
        });
      });
    }
    render();
  }

  /** Transforme chaque <input class="dev-color-value"> pertinent en
   *  pastille cliquable ouvrant le popup ci-dessus — appelé après chaque
   *  rendu (les pastilles de couleur des modes personnalisés étant
   *  régénérées dynamiquement). L'input reste dans le DOM (caché) : il
   *  continue de porter la valeur et de déclencher les mêmes événements
   *  "input" que tout le reste du code attend déjà — en <input type="text">
   *  plutôt que type="color" (item 1) pour pouvoir aussi porter la valeur
   *  spéciale "transparent", que le sélecteur natif refuserait. */
  function enhanceColorInputsWithHsl() {
    document.querySelectorAll('#view-dev input.dev-color-value, #algo-custom-picker-list input.dev-color-value').forEach((input) => {
      if (input.dataset.swatchUpgraded) {
        const btn = input.nextElementSibling;
        if (btn && btn.classList.contains("color-swatch-btn")) setSwatchVisual(btn, input.value);
        return;
      }
      input.dataset.swatchUpgraded = "true";
      input.style.display = "none";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "color-swatch-btn" + (input.className.includes("algo-custom-picker-color") ? " algo-custom-picker-color" : "");
      setSwatchVisual(btn, input.value);
      btn.title = input.title || "";
      input.insertAdjacentElement("afterend", btn);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openColorPopup(input, btn);
      });
    });
  }

  /** Affiche un damier (case transparente) plutôt qu'un simple à-plat de
   *  couleur quand la valeur est "transparent" (item 1 : couleur
   *  transparente possible partout). */
  /** Convertit hex6 + opacité (0-100) en rgba() utilisable dans un style
   *  inline (item 2 — curseur de transparence réglable). */
  function hex6WithAlpha(hex6, alpha) {
    const r = parseInt(hex6.slice(1, 3), 16) || 0;
    const g = parseInt(hex6.slice(3, 5), 16) || 0;
    const b = parseInt(hex6.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(100, alpha)) / 100})`;
  }

  /** Affiche un damier en dessous de la couleur dès qu'elle n'est pas
   *  totalement opaque (item 2), pour que le niveau de transparence choisi
   *  soit visible sur la pastille elle-même — pas seulement à 0%. */
  function setSwatchVisual(btn, value) {
    const { hex6, alpha } = parseColorValue(value);
    if (alpha >= 100) {
      btn.classList.remove("color-swatch-btn--transparent");
      btn.style.removeProperty("--swatch-color");
      btn.style.background = hex6;
    } else {
      btn.classList.add("color-swatch-btn--transparent");
      btn.style.background = "";
      btn.style.setProperty("--swatch-color", hex6WithAlpha(hex6, alpha));
    }
  }

  // Item 4 : mode nuit — bouton en topbar, bascule quel jeu de couleurs
  // (jour ou nuit, réglés séparément dans le mode développeur) est
  // effectivement appliqué.
  const NIGHT_MODE_KEY = "fiches_night_mode";
  function isNightModeActive() {
    return localStorage.getItem(NIGHT_MODE_KEY) === "true";
  }
  function effectiveColors(settings) {
    if (!isNightModeActive()) {
      return {
        bgColors: settings.bgColors,
        textColorsSet: settings.textColorsSet,
        ratingColors: settings.ratingColors,
        ratingBtnBgColor: settings.ratingBtnBgColor,
        modeColors: settings.modeColors,
        gaugeColors: settings.gaugeColors,
      };
    }
    return settings.nightColors;
  }
  let lastLocalNightModeChangeAt = 0;
  function setNightModeActive(value) {
    localStorage.setItem(NIGHT_MODE_KEY, String(value));
    document.documentElement.classList.toggle("is-night-mode", value);
    lastLocalNightModeChangeAt = Date.now();
    // Bug corrigé (item 1) : ce réglage ne passait pas par saveDevSettings,
    // donc son horodatage de synchro n'était jamais mis à jour — un échange
    // de données (même sans rapport direct) pouvait alors réappliquer un
    // état de synchro plus ancien et faire "clignoter" le bouton entre nuit
    // et jour juste après l'avoir pressé. saveDevSettings met à jour cet
    // horodatage à chaque fois, donc ce changement est toujours reconnu
    // comme le plus récent.
    // Bug corrigé (round 4, partie 3) : cette fonction tourne à CHAQUE
    // démarrage, pour tout le monde (elle fixe le mode nuit selon l'heure)
    // — en repartant de loadDevSettings() (l'instantané COMPLET, valeurs
    // par défaut + réglages publiés compris), elle figeait par erreur cet
    // instantané entier dans le stockage strictement local dès le tout
    // premier démarrage, ce qui bloquait ensuite toute réception d'un
    // réglage publié pour tout le monde. On repart maintenant de ce qui
    // est VRAIMENT propre à cet appareil, sans y mélanger le reste.
    const settings = loadRawDevSettingsOverride();
    settings.nightMode = value;
    saveDevSettings(settings);
    applyColorSettings();
    renderManageList();
    renderReviewGauge();
    const btn = el("night-mode-toggle-btn");
    if (btn) btn.classList.toggle("is-active", value);
  }
  const nightModeToggleBtn = el("night-mode-toggle-btn");
  // Item 7 (dernier lot) : l'appli s'ouvre en mode nuit ou jour selon
  // l'heure réelle à chaque lancement — avant 7h ou après 20h, c'est la
  // nuit. Le bouton reste utilisable ensuite pour changer d'avis le temps
  // de cette session. Bug corrigé : appeler setNightModeActive() ICI (au
  // moment où ce bouton s'initialise, tôt dans le script) atteignait des
  // réglages déclarés plus bas (cardsScopeFilter) avant leur
  // initialisation — l'appli ne démarrait plus du tout. On se contente
  // ici d'un simple bascule de classe (sans dépendance), l'appel complet
  // est déplacé dans la séquence de démarrage, en bas de fichier.
  const hourNow = new Date().getHours();
  const isNightByClock = hourNow < 7 || hourNow >= 20;
  document.documentElement.classList.toggle("is-night-mode", isNightByClock);
  if (nightModeToggleBtn) {
    nightModeToggleBtn.classList.toggle("is-active", isNightByClock);
    nightModeToggleBtn.addEventListener("click", () => setNightModeActive(!isNightModeActive()));
  }

  function applyColorSettings() {
    const settings = loadDevSettings();
    const eff = effectiveColors(settings);
    const root = document.documentElement.style;
    root.setProperty("--rating-again-color", eff.ratingColors.again);
    root.setProperty("--rating-hard-color", eff.ratingColors.hard);
    root.setProperty("--rating-good-color", eff.ratingColors.good);
    root.setProperty("--rating-easy-color", eff.ratingColors.easy);
    root.setProperty("--rating-btn-bg-color", eff.ratingBtnBgColor);
    root.setProperty("--mode-cool-color", eff.modeColors.cool);
    root.setProperty("--mode-normal-color", eff.modeColors.normal);
    root.setProperty("--mode-renforce-color", eff.modeColors.renforce);
    root.setProperty("--mode-custom-color", eff.modeColors.custom);
    root.setProperty("--app-bg-color", settings.appBgColor);
    root.setProperty("--construction-active-color", settings.constructionActiveColor);
    root.setProperty("--due-pill-bonus-color", settings.bonusPillColor);
    root.setProperty("--empty-bar-color", settings.emptyBarColor);
    // Items 2h/2i : nouveaux blocs "Couleurs des fonds"/"Couleurs des
    // textes", chacun avec son propre nom de réglage direct — remplacent
    // les anciens réglages ci-dessus repris un par un (appBgColor,
    // cardFormBgColor, richEditorBgColor, cardBgColor, chartWrapBgColor,
    // svgChartBgColor, dueBarColor, todayBarColor, mainTextColor,
    // cardTextColor), qui restent lus pour la compatibilité mais ne sont
    // plus la source appliquée.
    // Items 2h/2i : nouveaux blocs "Couleurs des fonds"/"Couleurs des
    // textes", chacun avec son propre nom de réglage direct.
    const bg = eff.bgColors;
    root.setProperty("--home-square-bg-color", bg.homeSquareBg);
    root.setProperty("--home-add-card-bg-color", bg.homeAddCardBg);
    root.setProperty("--home-btn-bg-color", bg.homeBtnBg);
    root.setProperty("--subject-select-bg-color", bg.subjectSelectBg);
    root.setProperty("--sync-status-bg-color", bg.syncStatusBg);
    root.setProperty("--folder-bg-color", bg.folderBg);
    root.setProperty("--folder-l1-bg-color", bg.folderL1Bg);
    root.setProperty("--folder-l2-bg-color", bg.folderL2Bg);
    root.setProperty("--folder-l3-bg-color", bg.folderL3Bg);
    root.setProperty("--subject-row-bg-color", bg.subjectRowBg);
    root.setProperty("--add-btn-bg-color", bg.addBtnBg);
    root.setProperty("--reviewed-bar-color", bg.reviewedBarColor);
    root.setProperty("--skip-program-bg-color", bg.skipProgramBg);
    root.setProperty("--home-bg-color", bg.homeBg);
    // Les 4 réglages ci-dessous partagent leur nom avec d'anciennes clés
    // (appBgColor/cardFormBgColor/richEditorBgColor/dueBarColor/
    // todayBarColor/chartWrapBgColor/svgChartBgColor déjà posées plus haut)
    // — bgColors sert désormais de source pour ceux-là aussi, pour n'avoir
    // qu'un seul endroit où les régler dans la page développeur.
    root.setProperty("--app-bg-color", bg.appBg);
    root.setProperty("--card-form-bg-color", bg.cardFormBg);
    root.setProperty("--rich-editor-bg-color", bg.richEditorBg);
    root.setProperty("--card-bg-color", bg.cardBg);
    root.setProperty("--chart-wrap-bg-color", bg.chartWrapBg);
    root.setProperty("--svg-chart-bg-color", bg.svgChartBg);
    root.setProperty("--due-bar-color", bg.dueBarColor);
    root.setProperty("--today-bar-color", bg.todayBarColor);

    const tx = eff.textColorsSet;
    root.setProperty("--home-title-color", tx.homeTitle);
    root.setProperty("--main-text-color", tx.titles);
    root.setProperty("--general-text-color", tx.generalText);
    root.setProperty("--folder-subject-name-color", tx.folderSubjectNames);
    root.setProperty("--card-text-color", tx.cardText);
    root.setProperty("--chart-value-color", tx.chartValues);
    root.setProperty("--chart-label-color", tx.chartLabels);
    root.setProperty("--chart-today-label-color", tx.chartTodayLabel);
    root.setProperty("--selector-text-color", tx.selectorText);
    root.setProperty("--sync-text-color", tx.syncText);
  }

  /** Applique les émoticônes des icônes de la fiche/de l'arborescence
   *  (item 2) : hibernation, édition, chantier, annuler, dossier. */
  /** Icône (émoticône personnalisée OU SVG de la banque) pour un réglage
   *  précis parmi hibernate/edit/construction/undo (item 1 — bug corrigé) :
   *  centralisé ici pour que TOUS les endroits de l'appli qui affichent
   *  cette icône (la fiche de révision, mais aussi le bouton "chantier" de
   *  chaque ligne dans la liste de Fiches) suivent bien le même réglage —
   *  jusqu'ici seule la fiche de révision le faisait, la liste affichait
   *  toujours l'émoticône brute. */
  function getIconMarkupFor(key) {
    const settings = loadDevSettings();
    if (settings.icons[key] !== DEFAULT_ICONS[key]) return escapeHtml(settings.icons[key]);
    const iconId = settings.iconBank[key];
    if (iconId && ICON_LIBRARY[iconId]) return iconSvgMarkup(iconId, "icon-inline-svg");
    return escapeHtml(settings.icons[key]);
  }

  function applyIconSettings() {
    const settings = loadDevSettings();
    const icons = settings.icons;
    const iconBank = settings.iconBank;
    // Applique l'icône SVG de la banque si CE réglage précis n'a jamais
    // été personnalisé en émoticône/texte (sinon la personnalisation reste
    // prioritaire, comme pour le menu principal).
    const applyOne = (elId, key) => {
      const target = el(elId);
      if (!target) return;
      target.innerHTML = getIconMarkupFor(key);
    };
    applyOne("hibernate-current-btn", "hibernate");
    applyOne("edit-current-btn", "edit");
    applyOne("construction-current-btn", "construction");
    applyOne("undo-rating-btn", "undo");
    applyOne("construction-filter-icon", "construction");
  }

  /** Regénère les pastilles de couleur de texte de la barre d'outils de
   *  mise en forme (item 2/20) à partir de la palette réglable. */
  function folderIcon() {
    return loadDevSettings().icons.folder;
  }

  function applyTextColorPalette() {
    const group = document.querySelector(".rt-color-group");
    if (!group) return;
    const colors = loadDevSettings().textColors;
    group.innerHTML = colors
      .map(
        (c) =>
          `<button type="button" class="rt-color" data-color="${c.hex}" style="background:${c.hex}" title="Texte ${escapeHtml(c.label)}"></button>`
      )
      .join("");
    group.querySelectorAll(".rt-color[data-color]").forEach((btn) => {
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", () => {
        focusLastEditor();
        document.execCommand("foreColor", false, btn.dataset.color);
      });
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
        updatedAt: (stored[id] && stored[id].updatedAt) || new Date(0).toISOString(),
        ...clampModeProfile(stored[id], id),
      };
    });
    Object.values(stored).forEach((m) => {
      if (m && m.id && !BUILTIN_MODE_IDS.includes(m.id)) {
        modes[m.id] = {
          id: m.id,
          name: (m.name || "Sans nom").trim() || "Sans nom",
          builtin: false,
          updatedAt: m.updatedAt || new Date(0).toISOString(),
          ...clampModeProfile(m, "normal"),
        };
      }
    });
    return modes;
  }
  function saveLearningModes(modes) {
    localStorage.setItem(LEARNING_MODES_KEY, JSON.stringify(modes));
    touchAppSettingsTimestamp();
  }
  /** Enregistre localement ET envoie ce mode précis vers Supabase (item 1,
   *  audit synchro : jusqu'ici jamais synchronisé du tout). */
  function persistModeChange(modes, modeId) {
    modes[modeId].updatedAt = new Date().toISOString();
    saveLearningModes(modes);
    if (Sync.isConfigured()) Sync.pushLearningMode(modes[modeId]);
  }

  function createCustomMode(name, basedOnId) {
    const modes = loadLearningModes();
    const id = "custom-" + uid();
    const base = modes[basedOnId] || modes.normal;
    modes[id] = { id, name: (name || "Nouveau mode").trim(), builtin: false, ...clampModeProfile(base, "normal") };
    persistModeChange(modes, id);
    return id;
  }
  function renameCustomMode(modeId, name) {
    const modes = loadLearningModes();
    if (!modes[modeId] || modes[modeId].builtin || !name || !name.trim()) return;
    modes[modeId].name = name.trim();
    persistModeChange(modes, modeId);
  }
  async function deleteCustomMode(modeId) {
    const modes = loadLearningModes();
    if (!modes[modeId] || modes[modeId].builtin) return;
    const deletedMode = { ...modes[modeId], deleted: true, updatedAt: new Date().toISOString() };
    delete modes[modeId];
    saveLearningModes(modes);
    if (Sync.isConfigured()) Sync.pushLearningMode(deletedMode);
    // Toute boîte qui utilisait ce mode supprimé retombe sur "Normal".
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
    persistModeChange(modes, modeId);
  }

  /** Mode effectif d'une boîte (objet complet, avec Ka..Me) — "Normal" si
   *  la boîte n'a pas encore de mode affecté ou si son mode a disparu. */
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
  /** Affecte un mode à une boîte (utilisé aussi en boucle pour affecter un
   *  dossier entier — voir assignModeToFolder). */
  async function assignModeToSubject(subjectId, modeId) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    s.modeId = modeId;
    s.updatedAt = new Date().toISOString();
    await persistSubject(s);
  }
  /** "quand on affecte un mode à un sous dossier ou un dossier, ça
   *  s'applique à toutes les boîtes contenues dedans" (item 1/2) : un
   *  affectage en bloc, immédiat, pas une référence permanente au dossier —
   *  déplacer ensuite une boîte hors du dossier ne lui retire pas le mode
   *  déjà affecté. */
  async function assignModeToFolder(folderId, modeId) {
    for (const id of subjectIdsInFolder(folderId)) {
      await assignModeToSubject(id, modeId);
    }
  }

  /** Migration ponctuelle depuis l'ancien système (4 emplacements de
   *  réglages PAR MATIÈRE, clé localStorage "fiches_subject_algo") vers les
   *  modes globaux nommés (item 2). Pour chaque boîte ayant un réglage
   *  dans l'ancien format : si son mode actif à l'époque correspondait
   *  exactement à un préréglage fixe, elle est simplement affectée à ce
   *  mode ; sinon (c'était un "Personnalisé" propre à cette boîte), un
   *  nouveau mode personnalisé est créé avec ces valeurs, nommé d'après la
   *  boîte, pour ne rien perdre de ses réglages existants. Ne s'exécute
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
  /** Score d'apprentissage d'une fiche (item 1), de 0 à 100 (entier) :
   *  S = ((D-1)^P)/((D-1)^P+B), D = délai actuel (en jours) avant la
   *  prochaine interrogation. D est ramené à 1 minimum (fiche due
   *  aujourd'hui ou en retard) pour éviter une puissance d'un nombre
   *  négatif avec un exposant non entier (NaN sinon). */
  function computeCardScore(card, intervalOverride) {
    const settings = loadDevSettings().cardScore;
    const D = Math.max(1, intervalOverride !== undefined ? intervalOverride : card.interval || 1);
    const base = Math.pow(D - 1, settings.p);
    const S = base / (base + settings.b);
    return Math.round(S * 100);
  }

  /** Nouvel algorithme de révision (remplace le système de modes K/M
   *  ci-dessus pour le CALCUL de l'échéance — celui-ci reste en mémoire,
   *  encore éditable dans le mode développeur, mais n'influence plus la
   *  planification réelle : décision à trancher avec l'utilisateur). Voir
   *  DEFAULT_REVISION_ALGO_SETTINGS pour le détail de la formule. */
  function revisionAlgoPaliersMin(settings) {
    return {
      court: (settings.palierCourtTermeJ || 0) * 1440,
      moyen: (settings.palierMoyenTermeJ || 0) * 1440,
      long: (settings.palierLongTermeJ || 0) * 1440,
    };
  }
  /** Palier (court/moyen/long/tresLong) dans lequel tombe la persistance
   *  (en minutes) d'une fiche — utilisé par la jauge à 4 segments. */
  function classifyPersBracket(persMin, settings) {
    const p = revisionAlgoPaliersMin(settings);
    if (persMin < p.court) return "court";
    if (persMin < p.moyen) return "moyen";
    if (persMin < p.long) return "long";
    return "tresLong";
  }
  /** Temps écoulé (minutes) depuis la dernière interrogation d'une fiche
   *  — depuis sa création si elle n'a encore jamais été révisée. */
  function cardElapsedMinutes(card, now) {
    const ref = card.lastReviewed || card.createdAt;
    if (!ref) return 0;
    return Math.max(0, (now.getTime() - new Date(ref).getTime()) / 60000);
  }
  function computeAlgoNext(card, rating, subjectId) {
    const settings = loadDevSettings().revisionAlgo;
    const idx = REVISION_ALGO_RATING_ORDER.indexOf(rating);
    if (idx < 0) return { dd: settings.initialDelayMin, pers: 0, interval: 1, dueDate: new Date().toISOString() };
    const now = new Date();
    const dd = typeof card.dd === "number" && Number.isFinite(card.dd) ? card.dd : settings.initialDelayMin;
    const te = cardElapsedMinutes(card, now);
    const coefTe = settings.coefTe[idx] || 0;
    const coefDd = settings.coefDd[idx] || 0;
    const plafond = settings.plafondMin[idx];
    const plancher = settings.plancherMin[idx];
    const abat = settings.abat[idx] || 0;

    const ddTerm = dd * coefDd;
    const raw = Math.max(ddTerm, te * coefTe);
    const ceiling = Math.min(plafond, ddTerm);
    let ndi = Math.min(raw, ceiling);
    if (ndi < plancher) ndi = plancher;
    const pers = ndi * abat;

    const due = new Date(now.getTime() + ndi * 60000);
    // `interval` (jours, arrondi) et `deadlineDaysRaw` sont dérivés pour la
    // compatibilité des affichages/fonctions encore en jours (histogrammes,
    // score legacy) — ils ne pilotent plus la planification elle-même.
    return {
      dd: Math.round(ndi * 100) / 100,
      pers: Math.round(pers * 100) / 100,
      interval: Math.max(0, Math.round(ndi / 1440)),
      deadlineDaysRaw: Math.round((ndi / 1440) * 1000) / 1000,
      dueDate: due.toISOString(),
    };
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


  const subjectListEl = el("subject-list");
  const subjectBarCountEl = el("subject-bar-count");

  const uid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  function newCard(question, answer, subjectId = currentSubjectId) {
    const now = new Date();
    const nowIso = now.toISOString();
    const initialDelayMin = loadDevSettings().revisionAlgo.initialDelayMin;
    const due = new Date(now.getTime() + initialDelayMin * 60000);
    return {
      id: uid(),
      subject: subjectId,
      question,
      answer,
      createdAt: nowIso,
      dueDate: due.toISOString(), // maintenant + délai initial (5 min par défaut)
      lastReviewed: null,
      reviewCount: 0,
      updatedAt: nowIso,
      deleted: false,
      // Chantier (item 16) : fiche marquée à corriger/compléter plus tard.
      underConstruction: false,
      // Nouvel algorithme de révision : dd/pers en MINUTES (voir
      // computeAlgoNext). `interval`/`deadlineDaysRaw` (jours) restent
      // dérivés pour compat avec les affichages non encore migrés.
      dd: initialDelayMin,
      pers: 0,
      interval: 0,
      deadlineDaysRaw: Math.round((initialDelayMin / 1440) * 1000) / 1000,
    };
  }

  /* ---------------------------------------------------------
     Boîtes (subjects) et dossiers (folders) — item 1 : arborescence
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
    // Garde-fou (bug corrigé) : si un cycle de dossiers existe jamais
    // (ex. via une fusion de synchro malheureuse — deux appareils qui
    // déplacent des dossiers l'un dans l'autre en même temps), cette
    // boucle tournait à l'infini et figeait l'appli. "visited" empêche de
    // retraiter deux fois le même dossier, cycle ou pas.
    const visited = new Set();
    while (stack.length) {
      const id = stack.pop();
      if (visited.has(id)) continue;
      visited.add(id);
      folders.forEach((f) => {
        if (f.parentId === id && !visited.has(f.id)) {
          out.push(f.id);
          stack.push(f.id);
        }
      });
    }
    return out;
  }

  /** Identifiants de toutes les boîtes contenues dans un dossier, y
   *  compris dans ses sous-dossiers à n'importe quelle profondeur. */
  function subjectIdsInFolder(folderId) {
    const ids = new Set([folderId, ...folderDescendantIds(folderId)]);
    return subjects.filter((s) => ids.has(s.folderId)).map((s) => s.id);
  }

  /* ---------------------------------------------------------
     Item 1 : fusion dossier / boîte. On ne crée plus que des dossiers —
     un dossier VIDE devient automatiquement une boîte dès qu'on y ajoute
     une première fiche, et inversement redevient un dossier dès que sa
     dernière fiche est supprimée. Pour rester à faible risque (ne pas
     toucher à la programmation des révisions ni à la synchro, qui
     reposent sur les boîtes existantes), une boîte "née" de cette façon
     PARTAGE le même identifiant que son dossier (deux enregistrements
     distincts — un dossier, une boîte — juste avec le même id) plutôt que
     d'être une nouvelle entité à part. Les boîtes créées avant cet item
     restent des entités indépendantes classiques ; les deux cohabitent
     sans souci, chacune reconnue différemment (voir folderSelfSubject).
  --------------------------------------------------------- */
  /** La boîte "auto-liée" à ce dossier (même id), si elle existe. */
  function folderSelfSubject(folderId) {
    return subjects.find((s) => s.id === folderId) || null;
  }
  /** Ce dossier est-il actuellement affiché comme une boîte (a une boîte
   *  auto-liée ET au moins une fiche) ? */
  function isFolderABoite(folderId) {
    const s = folderSelfSubject(folderId);
    if (!s) return false;
    return cards.some((c) => !c.deleted && c.subject === s.id);
  }
  /** Un dossier est "vide" (éligible pour devenir une boîte) s'il n'a NI
   *  sous-dossier NI boîte parmi ses enfants directs. */
  function folderIsEmpty(folderId) {
    const hasSubFolders = folders.some((f) => f.parentId === folderId);
    const hasSubjectChildren = subjects.some((s) => s.folderId === folderId && !folders.some((f) => f.id === s.id));
    return !hasSubFolders && !hasSubjectChildren;
  }
  /** Crée (si besoin) la boîte auto-liée à un dossier vide, prête à
   *  recevoir des fiches — c'est cet appel qui fait "devenir boîte" un
   *  dossier au sens de l'item 1. */
  async function ensureFolderIsBoite(folderId) {
    const existing = folderSelfSubject(folderId);
    if (existing) return existing;
    const f = folders.find((x) => x.id === folderId);
    if (!f) return null;
    const now = new Date().toISOString();
    const s = { id: f.id, name: f.name, folderId: f.parentId, createdAt: now, updatedAt: now };
    await persistSubject(s);
    subjects.push(s);
    return s;
  }
  /** Après suppression/déplacement d'une fiche : si la boîte concernée
   *  est une boîte auto-liée et n'a plus aucune fiche, on la supprime pour
   *  que son dossier redevienne un dossier normal (item 1, dernier point).
   *  Ne touche jamais aux boîtes "classiques" (créées avant cet item),
   *  qui peuvent rester vides sans redevenir quoi que ce soit d'autre. */
  async function revertFolderIfBoiteEmptied(subjectId) {
    const isSelfLinked = folders.some((f) => f.id === subjectId);
    if (!isSelfLinked) return;
    const stillHasCards = cards.some((c) => !c.deleted && c.subject === subjectId);
    if (stillHasCards) return;
    const idx = subjects.findIndex((s) => s.id === subjectId);
    if (idx === -1) return;
    const s = subjects[idx];
    subjects.splice(idx, 1);
    await DB.removeSubject(subjectId);
    await pushSubjectDeleted(s);
    if (currentSubjectId === subjectId && subjects.length > 0) {
      currentSubjectId = subjects[0].id;
      localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
    }
  }

  /** Score moyen d'une boîte (item 2) : moyenne des scores de ses fiches
   *  (non supprimées). null si la boîte n'a aucune fiche — pas de score
   *  à afficher dans ce cas plutôt qu'un 0% trompeur. */
  function computeSubjectScore(subjectId) {
    const own = cards.filter((c) => !c.deleted && c.subject === subjectId);
    if (own.length === 0) return null;
    const sum = own.reduce((acc, c) => acc + computeCardScore(c), 0);
    return Math.round(sum / own.length);
  }

  /** Score moyen d'un dossier (item 2) : moyenne des scores de TOUTES les
   *  fiches des boîtes qu'il contient, y compris dans ses sous-dossiers
   *  — pas une moyenne des scores de boîtes (ce qui pondérerait à tort
   *  une boîte à 2 fiches autant qu'une à 200). */
  function computeFolderScore(folderId) {
    const subjectIds = subjectIdsInFolder(folderId);
    const own = cards.filter((c) => !c.deleted && subjectIds.includes(c.subject));
    if (own.length === 0) return null;
    const sum = own.reduce((acc, c) => acc + computeCardScore(c), 0);
    return Math.round(sum / own.length);
  }

  /** Nouvelle jauge de persistance (remplace le score 0-100 dans les 3
   *  emplacements où il s'affichait) : renvoie le POOL de fiches d'une
   *  boîte/dossier (ou null si vide), à passer à buildPersGaugeSvg. */
  function subjectCardsPool(subjectId) {
    const own = cards.filter((c) => !c.deleted && c.subject === subjectId);
    return own.length > 0 ? own : null;
  }
  function folderCardsPool(folderId) {
    const subjectIds = subjectIdsInFolder(folderId);
    const own = cards.filter((c) => !c.deleted && subjectIds.includes(c.subject));
    return own.length > 0 ? own : null;
  }

  /** Lit le résultat RÉEL d'un picker multi-boîtes/dossiers (bug corrigé
   *  — items 2/4) : jusqu'ici, le résultat final était recalculé en
   *  ré-étendant chaque dossier COCHÉ à toutes ses boîtes, ignorant
   *  silencieusement toute boîte qu'on avait décochée individuellement à
   *  l'intérieur — décocher une boîte précise pendant qu'un dossier
   *  reste coché n'avait donc AUCUN effet. La seule source de vérité est
   *  maintenant l'état réel de CHAQUE case à cocher "boîte" (déjà
   *  répercuté correctement par la cascade dossier -> descendants) ; les
   *  dossiers cochés ne servent plus qu'à décider l'AFFICHAGE (le nom du
   *  dossier si sa sélection correspond exactement à tout son contenu). */
  /** Item 1 (nouveau lot) : la sélection est maintenant portée par un vrai
   *  Set JS (mutable, transmis par référence aux sélecteurs), plutôt que
   *  déduite des cases cochées dans le DOM — nécessaire depuis que les
   *  dossiers peuvent rester repliés (leurs cases à cocher descendantes
   *  n'existent alors pas dans le DOM). Cette fonction ne fait plus que
   *  déterminer l'étiquette à afficher (nom d'un dossier si sa sélection
   *  correspond exactement à tout son contenu, etc.) à partir de ce Set. */
  function computeMultiPickerResult(selectedSubjectIds) {
    const resultIds = [...selectedSubjectIds];
    // Un dossier compte comme "coché" si TOUT son contenu (à toute
    // profondeur) est dans la sélection — exactement le calcul utilisé
    // pour cocher visuellement sa case dans l'arbre.
    const checkedFolders = folders.filter((f) => {
      if (isFolderABoite(f.id)) return false; // se comporte comme une boîte, pas comme un dossier
      const ids = subjectIdsInFolder(f.id);
      return ids.length > 0 && ids.every((id) => selectedSubjectIds.has(id));
    });
    let label = "";
    // Bug corrigé (item 2, lot précédent) : un dossier qui ne contient
    // qu'UNE seule boîte tombait dans le cas "une seule boîte cochée"
    // ci-dessous AVANT même d'être reconnu comme un dossier — le
    // sélecteur affichait alors le nom de la boîte à l'intérieur plutôt
    // que celui du dossier choisi. Il faut donc vérifier le dossier
    // D'ABORD.
    if (checkedFolders.length === 1) {
      const folderSubjectIds = subjectIdsInFolder(checkedFolders[0].id);
      const matchesExactly =
        resultIds.length === folderSubjectIds.length && folderSubjectIds.every((id) => resultIds.includes(id));
      if (matchesExactly) label = checkedFolders[0].name;
    }
    if (!label && resultIds.length === 1) {
      label = null; // signale "une seule boîte" à l'appelant (bascule directe)
    }
    return { resultIds, singleSubjectId: resultIds.length === 1 && label === null ? resultIds[0] : null, label };
  }

  /** Un dossier ne peut être supprimé que s'il est vide (item 1) : ni
   *  sous-dossier, ni boîte directement dedans. */
  function folderIsEmpty(folderId) {
    return (
      !folders.some((f) => f.parentId === folderId) &&
      !subjects.some((s) => s.folderId === folderId)
    );
  }

  function subjectName(id) {
    if (id === ALL_SUBJECTS_ID) return "Toutes les boîtes";
    if (id === MULTI_SUBJECTS_ID) {
      // Item 18 : le nom du dossier si un seul dossier a été sélectionné,
      // sinon le libellé générique.
      return loadMultiSelectionLabel() || "Sélection de boîtes";
    }
    const s = subjects.find((x) => x.id === id);
    return s ? s.name : "Boîte inconnue";
  }

  /** Affiche la question d'une fiche — précédée de "Nom de la boîte :" +
   *  deux sauts de ligne UNIQUEMENT quand on révise plusieurs boîtes
   *  confondues (item 2) : ça n'a pas d'intérêt quand une seule boîte est
   *  affichée à la fois, et ça ne doit jamais apparaître côté réponse.
   *  Rafraîchit aussi le bouton mode d'apprentissage sur CETTE fiche
   *  précise (sa propre boîte), pas sur la sélection globale — utile en
   *  mode "toutes boîtes"/"sélection", où chaque fiche peut appartenir à
   *  une boîte différente avec son propre mode. */
  function renderQuestionText(card) {
    if (!card) return;
    // Le préfixe "Nom de la boîte :" reste toujours en texte échappé (pas
    // question qu'un nom de boîte contenant "<" casse l'affichage) ; la
    // question elle-même passe par toDisplayHtml (item 13 : contenu riche).
    questionTextEl.innerHTML = isSentinelSubject(currentSubjectId)
      ? `<strong class="card-subject-hint">${escapeHtml(subjectName(card.subject))}</strong><br><br>${toDisplayHtml(card.question)}`
      : toDisplayHtml(card.question);
    renderSubjectAlgoBadge(card.subject);
    const constructionBtn = el("construction-current-btn");
    if (constructionBtn) {
      constructionBtn.hidden = false;
      constructionBtn.classList.toggle("is-active-construction", !!card.underConstruction);
    }
  }

  /** Exposé pour que sync.js puisse dénormaliser le nom de la boîte sur chaque ligne envoyée. */
  window.getSubjectName = subjectName;

  /** Charge les boîtes depuis IndexedDB ; en crée une par défaut si aucune n'existe encore. */
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

  /** Fiches créées avant l'introduction des boîtes (ou reçues d'un vieil export) :
   *  on les rattache à une boîte fixe et déterministe (la première par ordre
   *  alphabétique) plutôt qu'à "la boîte actuellement affichée", qui peut varier
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

  /** Nettoyage ponctuel (exécuté à chaque démarrage) : fusionne les boîtes
   *  strictement homonymes lorsque certaines n'ont aucune fiche — séquelle du
   *  bug de synchronisation ci-dessus, qui pouvait laisser une boîte
   *  "Général" fantôme et vide sur un appareil après une synchro. On ne
   *  touche jamais à une boîte qui contient des fiches. */
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
    // Réviser (item 18) : le bouton affiche le nom courant (boîte,
    // dossier, "Toutes les boîtes" ou "Sélection de boîtes") — plus de
    // liste déroulante native listant chaque boîte une par une, voir le
    // menu à 3 choix (#subject-choice-menu) ouvert au clic.
    if (subjectSelectBtn) subjectSelectBtn.textContent = subjectName(currentSubjectId);
    // Second sélecteur, en tête de la page Fiches (item 2) : boîtes
    // réelles uniquement (pas de dossier ni de mode "toutes boîtes"),
    // même mise en forme que les autres boutons de sélection mais choix
    // unique direct (pas de "toutes"/"sélection", ça n'aurait pas de sens
    // pour la boîte où atterrit une nouvelle fiche).
    const cardsSubjectSelectBtnEl = el("cards-subject-select-btn");
    if (cardsSubjectSelectBtnEl) {
      cardsSubjectSelectBtnEl.textContent = newCardSubjectId ? subjectName(newCardSubjectId) : "Sélection de la boîte";
    }

    // Le sélecteur d'import propose en plus la création d'une nouvelle boîte à la volée.
    const importOpts =
      opts + `<option value="__new__">+ Nouvelle boîte…</option>`;
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
   *  ralentissement dès que la boîte contient beaucoup de fiches. Le
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
    // Même garde-fou anti-cycle qu'au-dessus (bug corrigé — c'est CETTE
    // fonction précisément qui figeait l'appli sur la page Fiches : elle
    // est appelée pour CHAQUE dossier à chaque fois que le sélecteur de
    // périmètre de recherche se redessine).
    const visited = new Set();
    while (cur && !visited.has(cur)) {
      visited.add(cur);
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
   *  place, sans changer de page. Les nouvelles boîtes/dossiers sont
   *  créés à la racine (déplaçables ensuite via ↔️). */
  const expandedManageFolders = new Set();

  function renderSubjectManageList() {
    subjectListEl.innerHTML = "";
    renderTreeLevel(ROOT_FOLDER_ID, 0, subjectListEl);
    if (folders.length === 0 && subjects.length === 0) {
      const empty = document.createElement("p");
      empty.className = "field-hint";
      empty.textContent = "Aucune boîte pour l'instant.";
      subjectListEl.appendChild(empty);
    }
    // Item 4 (dernier lot) : les blocs enfants restent visuellement
    // contenus dans leur parent (légèrement plus étroits, en particulier
    // à droite) — ce calcul recale juste l'emplacement nombre/mode/jauge
    // de chaque ligne pour qu'il tombe pile à la même position partout,
    // sans avoir à sacrifier cet effet de blocs imbriqués.
    requestAnimationFrame(alignOrgInfoSlots);
  }

  function alignOrgInfoSlots() {
    if (!subjectListEl) return;
    const rootRight = subjectListEl.getBoundingClientRect().right;
    subjectListEl.querySelectorAll(".org-info-slot").forEach((slot) => {
      slot.style.marginRight = "0px";
      const rowMain = slot.closest(".org-row-main");
      if (!rowMain) return;
      const diff = rootRight - rowMain.getBoundingClientRect().right;
      if (diff > 0.5) slot.style.marginRight = `-${diff.toFixed(1)}px`;
    });
  }

  /** Icône sobre pour un des 3 boutons d'action de l'Organisation, reprend
   *  le même principe que getIconMarkupFor : reste en émoticône si jamais
   *  personnalisée en tant que telle, sinon SVG de la banque. */
  function orgIconMarkup(key) {
    const iconId = loadDevSettings().orgIconBank[key];
    if (iconId && ICON_LIBRARY[iconId]) return iconSvgMarkup(iconId, "icon-inline-svg");
    return escapeHtml(DEFAULT_ORG_ICON_BANK_CHOICES[key] || "");
  }

  // Ferme n'importe quel popover d'actions ouvert (item 4) quand on clique
  // ailleurs, ou avant d'en ouvrir un autre.
  function closeAllOrgActionPopovers() {
    document.querySelectorAll(".org-actions-popover").forEach((p) => (p.hidden = true));
  }
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".org-deploy-btn") || e.target.closest(".org-actions-popover")) return;
    closeAllOrgActionPopovers();
  });

  /** Ligne unique (item 4) pour un dossier ou une boîte : à gauche
   *  triangle/flèche de dépli (dossiers), icône + nom, nombre de
   *  fiches/boîtes ; à droite (de droite à gauche) le bouton de dépli des
   *  actions (éditer/déplacer/supprimer, empilées verticalement dans un
   *  petit panneau), la jauge (plus courte/fine), le picto du mode. */
  function buildRowBody({ nameBtnEl, expandBtnEl, countLabel, score: persPool, mode, onRename, onMove, onDelete, onAlgo, onShare, deleteTitle }) {
    const main = document.createElement("div");
    main.className = "org-row-main";
    if (expandBtnEl) {
      expandBtnEl.classList.add("org-expand-btn");
      main.appendChild(expandBtnEl);
    }
    main.appendChild(nameBtnEl);

    const spacer = document.createElement("span");
    spacer.className = "org-row-spacer";
    main.appendChild(spacer);

    // Item 4 (dernier lot) : le nombre, le mode et la jauge ne tiennent
    // plus tous les trois à la fois — ils se relaient chacun leur tour,
    // synchronisés sur toutes les lignes à la fois (voir orgCarouselSlot),
    // pour laisser bien plus de place au nom du dossier/de la boîte.
    const slot = document.createElement("span");
    slot.className = "org-info-slot";

    const countEl = document.createElement("span");
    countEl.className = "org-info-slot-item org-count";
    countEl.dataset.slot = "0";
    countEl.textContent = countLabel;
    slot.appendChild(countEl);

    const algoWrap = document.createElement("span");
    algoWrap.className = "org-info-slot-item";
    algoWrap.dataset.slot = "1";
    const algoBtn = document.createElement("button");
    algoBtn.type = "button";
    algoBtn.className = "subject-row-algo-btn subject-row-algo-btn--compact org-mode-icon";
    algoBtn.innerHTML = iconSvgMarkup("gradCap", "icon-inline-svg");
    algoBtn.title = `Mode d'apprentissage : ${modeDisplayName(mode)}`;
    algoBtn.addEventListener("click", onAlgo);
    applyModeBadgeStyle(algoBtn, mode);
    algoWrap.appendChild(algoBtn);
    slot.appendChild(algoWrap);

    if (persPool !== null) {
      const gaugeEl = document.createElement("span");
      gaugeEl.className = "org-info-slot-item org-gauge-inline";
      gaugeEl.dataset.slot = "2";
      gaugeEl.innerHTML = buildPersGaugeSvg(persPool, { width: 70, barHeight: 8 });
      slot.appendChild(gaugeEl);
    }
    main.appendChild(slot);

    const deployBtn = document.createElement("button");
    deployBtn.type = "button";
    deployBtn.className = "org-deploy-btn";
    deployBtn.title = "Actions";
    deployBtn.innerHTML = iconSvgMarkup("chevronDown", "icon-inline-svg");
    const popover = document.createElement("div");
    popover.className = "org-actions-popover";
    popover.hidden = true;
    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "org-actions-popover-item";
    renameBtn.innerHTML = `${orgIconMarkup("orgRename")}<span>Éditer</span>`;
    renameBtn.addEventListener("click", () => {
      closeAllOrgActionPopovers();
      onRename();
    });
    const moveBtn = document.createElement("button");
    moveBtn.type = "button";
    moveBtn.className = "org-actions-popover-item";
    moveBtn.innerHTML = `${orgIconMarkup("orgMove")}<span>Déplacer</span>`;
    moveBtn.addEventListener("click", () => {
      closeAllOrgActionPopovers();
      onMove();
    });
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "org-actions-popover-item org-actions-popover-item--danger";
    delBtn.innerHTML = `${orgIconMarkup("orgDelete")}<span>Supprimer</span>`;
    delBtn.title = deleteTitle;
    delBtn.addEventListener("click", () => {
      closeAllOrgActionPopovers();
      onDelete();
    });
    popover.appendChild(renameBtn);
    popover.appendChild(moveBtn);
    // Partager dans la bibliothèque (uniquement pour une boîte — voir
    // appendBoiteRow, qui est le seul appelant à fournir `onShare`).
    if (onShare) {
      const shareBtn = document.createElement("button");
      shareBtn.type = "button";
      shareBtn.className = "org-actions-popover-item";
      shareBtn.innerHTML = `${iconSvgMarkup("share", "icon-inline-svg")}<span>Partager dans la bibliothèque</span>`;
      shareBtn.addEventListener("click", () => {
        closeAllOrgActionPopovers();
        onShare();
      });
      popover.appendChild(shareBtn);
    }
    popover.appendChild(delBtn);
    deployBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = popover.hidden;
      closeAllOrgActionPopovers();
      popover.hidden = !willOpen;
    });
    main.appendChild(deployBtn);

    const wrap = document.createElement("div");
    wrap.className = "org-row-wrap";
    wrap.appendChild(main);
    wrap.appendChild(popover);
    return wrap;
  }

  function renderTreeLevel(parentId, depth, container) {
    const childFolders = folders
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    // Item 1 : une boîte "auto-liée" (même id qu'un dossier) ne doit
    // jamais être rendue ici comme boîte indépendante — c'est le dossier
    // correspondant, plus bas, qui la représente.
    const childSubjects = subjects
      .filter((s) => s.folderId === parentId && !folders.some((f) => f.id === s.id))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    /** Ligne "boîte" (item 1) — utilisée aussi bien pour une boîte
     *  classique (entité indépendante) que pour un dossier devenu boîte
     *  (même id qu'une boîte auto-liée) : dans les deux cas, le nom, le
     *  score, le mode et les actions viennent de l'ENTITÉ BOÎTE, mais une
     *  boîte auto-liée supprime aussi son dossier associé. */
    function appendBoiteRow(subjectId, displayName, isSelfLinkedFolder) {
      const li = document.createElement("li");
      li.className = "subject-row" + (subjectId === currentSubjectId ? " is-active" : "");

      const subjectForIcon = subjects.find((x) => x.id === subjectId);
      // Icône en réseau (au lieu de l'icône de boîte habituelle) pour une
      // collection prise dans la Bibliothèque — pour la reconnaître d'un
      // coup d'œil dans Mes collections, comme demandé.
      const boiteIconMarkup = subjectForIcon && subjectForIcon.fromLibrary ? iconSvgMarkup("share", "icon-inline-svg") : orgIconMarkup("orgBoite");
      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "subject-row-name";
      nameBtn.innerHTML = `${boiteIconMarkup} <span>${escapeHtml(displayName)}</span>`;
      nameBtn.title = "Réviser cette boîte";
      // Item 7 (lot précédent) : un clic sur une boîte mène directement à
      // la page Réviser correspondante (au lieu de la page Fiches). Item 3
      // (nouveau lot) : le bouton Accueil de Réviser doit alors ramener ici
      // (Organisation) plutôt qu'au programme de révision.
      nameBtn.addEventListener("click", () => {
        reviewEntryFromManage = true;
        goToReviewFor(`subject:${subjectId}`);
      });

      const n = cards.filter((c) => !c.deleted && c.subject === subjectId).length;
      const subjScore = subjectCardsPool(subjectId);
      const body = buildRowBody({
        nameBtnEl: nameBtn,
        countLabel: `${n} fiche${n > 1 ? "s" : ""}`,
        score: subjScore,
        mode: getSubjectAlgoMode(subjectId),
        onRename: () => (isSelfLinkedFolder ? renameFolder(subjectId) : renameSubject(subjectId)),
        onMove: async () => {
          // Round 3, item 1 : une boîte partagée par un professeur reste
          // là où LUI l'a organisée — on ne peut pas la déplacer ici.
          if (!isSelfLinkedFolder && (await blockIfSharedReadonly(subjectId))) return;
          openMovePicker(isSelfLinkedFolder ? "folder" : "subject", subjectId);
        },
        onDelete: () => deleteSubject(subjectId),
        onAlgo: () => openSubjectAlgoView(subjectId),
        onShare: () => shareSubjectToLibrary(subjectId),
        deleteTitle: "Supprimer cette boîte",
      });
      li.appendChild(body);
      container.appendChild(li);
    }

    childFolders.forEach((f) => {
      // Item 1 : ce dossier a une fiche → il EST une boîte, rendu comme
      // telle (nom, score, mode, actions de boîte) plutôt que comme
      // dossier — jamais de sous-dossier ni de repli pour une boîte.
      if (isFolderABoite(f.id)) {
        appendBoiteRow(f.id, f.name, true);
        return;
      }

      const expanded = expandedManageFolders.has(f.id);
      const li = document.createElement("li");
      li.className = `subject-row folder-row folder-row-depth-${Math.min(depth, 3)}`;

      // Item 4 : flèche de dépli plus grosse et épurée (banque d'icônes),
      // à la place du triangle texte.
      const expandBtn = document.createElement("button");
      expandBtn.type = "button";
      expandBtn.title = expanded ? "Replier ce dossier" : "Déplier ce dossier";
      expandBtn.innerHTML = iconSvgMarkup(expanded ? "chevronDown" : "chevronRight", "icon-inline-svg");
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (expandedManageFolders.has(f.id)) expandedManageFolders.delete(f.id);
        else expandedManageFolders.add(f.id);
        renderSubjectManageList();
      });

      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "subject-row-name";
      nameBtn.title = "Réviser ce dossier";
      // Round 3, item 1 : le dossier racine d'une classe (créé
      // automatiquement chez l'élève) porte l'icône "classe" plutôt que
      // l'icône dossier classique, pour qu'on le distingue au premier coup
      // d'œil dans l'arborescence.
      const folderIconMarkup = f.sharedClassRoot ? CLASSES_ROW_ICON : iconSvgMarkup("folder", "icon-inline-svg");
      nameBtn.innerHTML = `${folderIconMarkup} <span>${escapeHtml(f.name)}</span>`;
      // Item 7 (lot précédent) : un clic sur un dossier mène directement à
      // la page Réviser correspondante (au lieu de la page Fiches). Item 3
      // (nouveau lot) : Accueil depuis Réviser ramène alors ici.
      nameBtn.addEventListener("click", () => {
        reviewEntryFromManage = true;
        goToReviewFor(`folder:${f.id}`);
      });

      const childCount = folders.filter((x) => x.parentId === f.id).length + subjects.filter((x) => x.folderId === f.id).length;
      // Item 5 : effet de pile quand ce dossier est replié ET n'est pas
      // vide, pour montrer qu'il contient bien quelque chose en dessous.
      if (!expanded && childCount > 0) li.classList.add("folder-row--stacked");

      const n = subjectIdsInFolder(f.id).length;
      const folderScore = folderCardsPool(f.id);
      const body = buildRowBody({
        nameBtnEl: nameBtn,
        expandBtnEl: expandBtn,
        countLabel: `${n} boîte${n > 1 ? "s" : ""}`,
        score: folderScore,
        mode: "normal",
        // Round 3, item 1 : un dossier de classe (racine ou reconstitué)
        // reste organisé par le professeur — le mode d'apprentissage
        // (onAlgo) reste, lui, un réglage personnel, donc autorisé.
        onRename: async () => {
          if (await blockIfSharedClassFolder(f.id)) return;
          await renameFolder(f.id);
        },
        onMove: async () => {
          if (await blockIfSharedClassFolder(f.id)) return;
          openMovePicker("folder", f.id);
        },
        onDelete: async () => {
          if (await blockIfSharedClassFolder(f.id)) return;
          await deleteFolder(f.id);
        },
        onAlgo: () => openAssignView("folder", f.id, "manage"),
        deleteTitle: "Supprimer ce dossier (doit être vide)",
      });
      li.appendChild(body);

      // Item 2 : les enfants sont maintenant imbriqués VISUELLEMENT dans le
      // bloc du dossier parent (une <ul> nichée dedans), plutôt qu'une
      // simple indentation à plat dans la même liste.
      if (expanded) {
        const childrenUl = document.createElement("ul");
        childrenUl.className = "org-children";
        li.appendChild(childrenUl);
        renderTreeLevel(f.id, depth + 1, childrenUl);
      }

      container.appendChild(li);
    });

    for (const s of childSubjects) {
      appendBoiteRow(s.id, s.name, false);
    }
  }


  /* ---------------------------------------------------------
     Gestion des dossiers (créer, renommer, supprimer, déplacer) — item 1
  --------------------------------------------------------- */
  async function createFolderFlow() {
    const name = prompt("Nom du nouveau dossier :");
    if (!name || !name.trim()) return;
    const folder = newFolder(name, ROOT_FOLDER_ID);
    await persistFolder(folder);
    folders.push(folder);
    renderSubjectManageList();
    // Item 8 : demande tout de suite où le ranger, plutôt que de le créer
    // silencieusement à la racine en laissant l'utilisateur le déplacer
    // ensuite lui-même via ↔️.
    openMovePicker("folder", folder.id);
  }

  async function renameFolder(folderId) {
    const f = folders.find((x) => x.id === folderId);
    if (!f) return;
    const name = prompt("Nouveau nom du dossier :", f.name);
    if (!name || !name.trim() || name.trim() === f.name) return;
    f.name = name.trim();
    f.updatedAt = new Date().toISOString();
    await persistFolder(f);
    // Item 1 : si ce dossier est actuellement une boîte (même id), son nom
    // doit rester synchronisé avec elle.
    const selfSubject = folderSelfSubject(folderId);
    if (selfSubject) {
      selfSubject.name = f.name;
      selfSubject.updatedAt = f.updatedAt;
      await persistSubject(selfSubject);
    }
    // Round 3, item 1 : ce renommage peut changer le chemin affiché d'une
    // boîte partagée nichée plus bas dans ce dossier.
    await pushSharedBoxUpdatesForAllSharedSubjects();
    renderSubjectManageList();
  }

  async function deleteFolder(folderId) {
    // Item 1 : un dossier devenu boîte se supprime via deleteSubject (qui
    // nettoie aussi ce dossier) — garde-fou si jamais atteint autrement.
    if (isFolderABoite(folderId)) {
      await deleteSubject(folderId);
      return;
    }
    if (!folderIsEmpty(folderId)) {
      await robotAlert("Ce dossier n'est pas vide : déplace ou supprime d'abord ce qu'il contient.");
      return;
    }
    const f = folders.find((x) => x.id === folderId);
    if (!(await robotConfirm(`Supprimer le dossier « ${f ? f.name : ""} » ?`, { danger: true }))) return;
    folders = folders.filter((x) => x.id !== folderId);
    if (f) await pushFolderDeleted(f);
    await DB.removeFolder(folderId);
    renderSubjectManageList();
  }

  /* ---------------------------------------------------------
     Déplacer un dossier ou une boîte vers un autre dossier
  --------------------------------------------------------- */
  function openMovePicker(kind, targetId) {
    // Pour un dossier, on exclut lui-même et tous ses descendants de la
    // liste des destinations possibles (on ne peut pas le déplacer dans
    // lui-même ou l'un de ses propres sous-dossiers).
    const excluded = kind === "folder" ? new Set([targetId, ...folderDescendantIds(targetId)]) : new Set();
    // Round 3, item 1 : le dossier racine d'une classe (et donc tout son
    // sous-arbre, jamais atteint puisqu'on ne descend pas dedans) n'est
    // jamais une destination valide — cette organisation appartient au
    // professeur, on n'y dépose rien depuis ici.
    folders.forEach((f) => {
      if (f.sharedClassRoot) excluded.add(f.id);
    });
    const name = kind === "folder" ? (folders.find((f) => f.id === targetId) || {}).name : (subjects.find((s) => s.id === targetId) || {}).name;

    openBoitePickerView({
      mode: "single",
      title: `Déplacer « ${name || ""} » vers :`,
      excludedFolderIds: excluded,
      onPick: async (kindPicked, destId) => {
        if (kind === "folder") {
          const f = folders.find((x) => x.id === targetId);
          if (f) {
            f.parentId = destId;
            f.updatedAt = new Date().toISOString();
            await persistFolder(f);
          }
        } else if (kind === "subject") {
          const s = subjects.find((x) => x.id === targetId);
          if (s) {
            s.folderId = destId;
            s.updatedAt = new Date().toISOString();
            await persistSubject(s);
          }
        }
        // Round 3, item 1 : ce déplacement peut changer le chemin affiché
        // d'une (ou, pour un dossier déplacé, plusieurs) boîte(s) partagée(s).
        await pushSharedBoxUpdatesForAllSharedSubjects();
        closeBoitePickerView();
        renderSubjectManageList();
      },
    });
  }

  const manageAddFolderBtn = el("manage-add-folder-btn");
  if (manageAddFolderBtn) manageAddFolderBtn.addEventListener("click", createFolderFlow);

  /* ---------------------------------------------------------
     Vue globale "Modes d'apprentissage" (item 2) : édite un mode (3 fixes +
     personnalisés créables/renommables/supprimables) — les réglages sont
     globaux, partagés par toutes les boîtes qui utilisent ce mode.
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
    // Bug corrigé (item 2) : reprenait une constante figée (ALGO_MODE_COLORS),
    // jamais connectée aux couleurs réellement réglables — le curseur
    // ignorait donc toute personnalisation des couleurs de mode.
    const settings = loadDevSettings();
    const color = key === "custom" ? getCustomModeColor(algoEditingModeId) : settings.modeColors[key];
    if (slider) slider.style.setProperty("--algo-slider-color", color);
    const ticksWrap = el("algo-mode-ticks");
    if (ticksWrap) ticksWrap.style.setProperty("--algo-tick-color", color);
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
      // Couleur propre à ce mode (item : réglable directement ici plutôt
      // que seulement dans la page Développeur).
      const colorInput = document.createElement("input");
      colorInput.type = "text";
      colorInput.className = "algo-custom-picker-color dev-color-value";
      colorInput.value = getCustomModeColor(m.id);
      colorInput.title = `Couleur du mode « ${m.name} »`;
      colorInput.addEventListener("click", (e) => e.stopPropagation());
      colorInput.addEventListener("input", () => {
        setCustomModeColor(m.id, colorInput.value);
        renderSubjectManageList();
        renderSubjectAlgoBadge(currentCard ? currentCard.subject : undefined);
      });
      label.appendChild(colorInput);
      list.appendChild(label);
      cb.addEventListener("change", () => loadModeFormIntoInputs(m.id));
    });
    enhanceColorInputsWithHsl();
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

  /** Couleur d'accent des curseurs de réglage d'un mode (item 6 — bug
   *  corrigé) : reprend la couleur du mode en cours d'édition (Cool/
   *  Normal/Renforcé/personnalisé), posée comme variable CSS sur le
   *  conteneur des curseurs, plutôt que 4 couleurs fixes par note qui
   *  n'avaient aucun rapport avec le mode affecté. */
  function applyModeSliderColor(modeId) {
    const panel = el("algo-advanced-panel");
    if (!panel) return;
    const key = algoModeCssKey(modeId);
    const settings = loadDevSettings();
    const color = key === "custom" ? getCustomModeColor(modeId) : settings.modeColors[key];
    panel.style.setProperty("--mode-editing-color", color);
  }

  function loadModeFormIntoInputs(modeId) {
    const modes = loadLearningModes();
    const m = modes[modeId] || modes.normal;
    algoEditingModeId = m.id;
    // Les curseurs reprennent la couleur du mode en cours d'édition (item
    // 6 — bug corrigé : ils étaient colorés par note (Encore/Difficile/
    // Bien/Facile), sans rapport avec le mode réellement affecté).
    applyModeSliderColor(m.id);
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
  const ALGO_CHART_COLORS = {
    again: "var(--rating-again-color, var(--terracotta))",
    hard: "var(--rating-hard-color, var(--amber))",
    good: "var(--rating-good-color, var(--sage))",
    easy: "var(--rating-easy-color, var(--teal))",
  };
  // Le graphique d'aperçu de la page "Modes d'apprentissage" garde ses
  // couleurs par défaut (item 2e), indépendamment du réglage "Couleurs des
  // notes" qui ne doit affecter QUE les boutons d'évaluation.
  const ALGO_PREVIEW_CHART_COLORS = {
    again: "var(--terracotta)",
    hard: "var(--amber)",
    good: "var(--sage)",
    easy: "var(--teal)",
  };
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
          <span class="algo-chart-legend-dot" style="background:${ALGO_PREVIEW_CHART_COLORS[r]}"></span>${ALGO_CHART_RATING_LABELS[r]}
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

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:var(--svg-chart-bg-color, var(--desk));border-radius:8px;">`;
    svg += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="rgba(31,41,55,0.3)" stroke-width="1"/>`;
    svg += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="rgba(31,41,55,0.3)" stroke-width="1"/>`;

    [0, yMax / 3, (2 * yMax) / 3, yMax].forEach((t) => {
      const y = yPos(t);
      svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(31,41,55,0.1)" stroke-width="1"/>`;
      svg += `<text x="${padL - 4}" y="${y + 3}" font-size="8" fill="var(--chart-value-color, #6b7280)" text-anchor="end">${Math.round(t)}</text>`;
    });

    const labelDx = { again: -9, hard: -3, good: 3, easy: 9 };
    visibleRatings.forEach((r) => {
      const s = seriesByRating[r];
      const pts = s.map((v, i) => `${xPos(i)},${yPos(v)}`).join(" ");
      svg += `<polyline points="${pts}" fill="none" stroke="${ALGO_PREVIEW_CHART_COLORS[r]}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      s.forEach((v, i) => {
        // Sur les longs graphiques, on n'étiquette la valeur qu'aux mêmes
        // points que l'axe, plus le tout dernier (le plafond atteint).
        if (i % xLabelStep !== 0 && i !== s.length - 1) return;
        const x = xPos(i), y = yPos(v);
        svg += `<circle cx="${x}" cy="${y}" r="2.4" fill="${ALGO_PREVIEW_CHART_COLORS[r]}"/>`;
        svg += `<text x="${x + labelDx[r]}" y="${y - 5}" font-size="7.5" fill="${ALGO_PREVIEW_CHART_COLORS[r]}" text-anchor="middle" font-family="var(--font-mono)">${v}</text>`;
      });
    });
    for (let i = 0; i < N; i += xLabelStep) {
      svg += `<text x="${xPos(i)}" y="${H - padB + 12}" font-size="8" fill="var(--chart-label-color, #6b7280)" text-anchor="middle">${i + 1}</text>`;
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
      if (!(await robotConfirm(`Supprimer le mode « ${m.name} » ? Les boîtes qui l'utilisent repasseront en mode Normal.`, { danger: true }))) return;
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
    algoResetBtn.addEventListener("click", async () => {
      const modes = loadLearningModes();
      const m = modes[algoEditingModeId];
      if (!m || !m.builtin) return;
      if (!(await robotConfirm(`Remettre le mode ${m.name} à ses valeurs d'origine ? Toutes les boîtes qui l'utilisent seront concernées.`))) return;
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
     Vue "Affecter un mode" (par boîte OU par dossier entier — item 1/2),
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
      // Pas de présélection pour un dossier (bug corrigé — item 3) : les
      // boîtes qu'il contient peuvent très bien ne pas être en "Normal"
      // du tout, présélectionner ce mode par défaut était trompeur.
      const f = folders.find((x) => x.id === targetId);
      title = `Affecter un mode — ${folderIcon()} ${f ? f.name : ""}`;
      currentModeId = null;
    }
    const titleEl = el("assign-target-title");
    if (titleEl) titleEl.textContent = title;
    assignCurrentModeId = currentModeId;
    renderAssignModeList(currentModeId);
    if (currentModeId) {
      renderAssignChart(currentModeId);
    } else {
      const wrap = el("assign-chart-wrap");
      if (wrap) wrap.innerHTML = `<p class="field-hint">Choisis un mode ci-dessus pour l'affecter à tout le dossier.</p>`;
    }
    const reviewOldBlock = el("assign-review-old-block");
    if (reviewOldBlock) reviewOldBlock.hidden = kind !== "subject";

    const backBtn = el("assign-back-btn");
    if (backBtn) backBtn.textContent = algoOpenedFromView === "review" ? "← Retour à Réviser" : "← Retour à Gérer";

    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-mode-assign").classList.add("is-active");
    applyBodyLogoSpeech("mode-assign");
  }

  // Conservé pour compatibilité avec les anciens appels (page Réviser) —
  // ouvre désormais la vue d'affectation plutôt que d'édition directe,
  // puisque les réglages ne se modifient plus boîte par boîte.
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
    applyBodyLogoSpeech(targetView);
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
        await robotAlert("Aucune fiche de cette boîte n'a une prochaine interrogation prévue dans plus de 10 jours.");
        return;
      }
      const msg =
        `Attention : cette action va ramener l'échéance et la date de prochaine ` +
        `interrogation à 10 jours pour ${targets.length} fiche${targets.length > 1 ? "s" : ""} ` +
        `de « ${subject ? subject.name : ""} » (celles actuellement prévues dans plus de 10 jours). ` +
        `Cette action est irréversible. Continuer ?`;
      if (!(await robotConfirm(msg, { danger: true }))) return;

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
      await robotAlert(`${targets.length} fiche${targets.length > 1 ? "s" : ""} ramenée${targets.length > 1 ? "s" : ""} à 10 jours.`);
    });
  }


  async function createSubjectFlow() {
    const name = prompt("Nom de la nouvelle boîte :");
    if (!name || !name.trim()) return null;
    const subject = newSubject(name, ROOT_FOLDER_ID);
    await persistSubject(subject);
    subjects.push(subject);
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    renderStatsSubjectSelect();
    return subject;
  }

  /** item 3 (2e lot, Classes) : une boîte reçue d'un prof (via une classe)
   *  est un miroir en lecture seule — son contenu (fiches, nom) suit les
   *  modifications du prof automatiquement, un élève ne peut donc ni le
   *  renommer, ni le supprimer, ni ajouter/modifier/supprimer une fiche à
   *  l'intérieur. Seule sa progression personnelle (SM-2) lui appartient. */
  function isSharedReadonlySubject(subjectId) {
    const s = subjects.find((x) => x.id === subjectId);
    return !!(s && s.sharedBoxId);
  }
  async function blockIfSharedReadonly(subjectId) {
    if (isSharedReadonlySubject(subjectId)) {
      await robotAlert("Cette boîte est partagée par ton professeur : elle se met à jour toute seule, tu ne peux pas la modifier ici.");
      return true;
    }
    return false;
  }
  /** Round 3, item 1 : un dossier fait partie du miroir en lecture seule
   *  d'une classe (dossier racine de la classe, ou sous-dossier reconstitué
   *  pour suivre l'organisation du prof) si `sharedClassId` est posé dessus
   *  — toute réorganisation y est bloquée, même logique que pour une boîte
   *  partagée (voir isSharedReadonlySubject ci-dessus). */
  function isSharedClassFolder(folderId) {
    const f = folders.find((x) => x.id === folderId);
    return !!(f && f.sharedClassId);
  }
  async function blockIfSharedClassFolder(folderId) {
    if (isSharedClassFolder(folderId)) {
      await robotAlert("Ce dossier fait partie d'une classe : son organisation est gérée par ton professeur, tu ne peux pas la modifier ici.");
      return true;
    }
    return false;
  }

  async function renameSubject(id) {
    if (await blockIfSharedReadonly(id)) return;
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    const name = prompt("Nouveau nom de la boîte :", s.name);
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
    if (await blockIfSharedReadonly(id)) return;
    if (subjects.length <= 1) {
      await robotAlert("Impossible de supprimer la dernière boîte restante.");
      return;
    }
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    const n = cards.filter((c) => !c.deleted && c.subject === id).length;
    const confirmMsg =
      n > 0
        ? `Supprimer la boîte « ${s.name} » et ses ${n} fiche(s) ? Cette action est irréversible.`
        : `Supprimer la boîte « ${s.name} » ?`;
    if (!(await robotConfirm(confirmMsg, { danger: true }))) return;

    // Suppression douce des fiches de cette boîte (cohérent avec la sync).
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
    // Item 1 : si cette boîte était auto-liée à un dossier (même id), on
    // supprime aussi ce dossier — les deux ne font qu'un pour qui l'a
    // créée.
    const linkedFolder = folders.find((x) => x.id === id);
    if (linkedFolder) {
      folders = folders.filter((x) => x.id !== id);
      await pushFolderDeleted(linkedFolder);
      await DB.removeFolder(id);
    }

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

    // On repart d'une session de révision propre pour la nouvelle boîte.
    reviewSessionStarted = false;
    reviewQueue = [];
    currentCard = null;
    isBonusMode = false;

    renderSubjectSelect();
    renderAll();
    renderReviewSubjectScore();
    renderReviewGauge();

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
  document.addEventListener("pointerdown", (e) => {
    if (!subjectChoiceMenu || subjectChoiceMenu.hidden) return;
    if (subjectChoiceMenu.contains(e.target) || e.target === subjectSelectBtn) return;
    closeSubjectChoiceMenu();
  });

  /* ---------------------------------------------------------
     Sélection de plusieurs boîtes confondues (item 1)
  --------------------------------------------------------- */
  /** Construit récursivement l'arbre dossiers/boîtes dans le sélecteur
   *  multi-boîtes (item 1) : cocher un dossier inclut TOUTES les boîtes
   *  qu'il contient (y compris dans ses sous-dossiers), sans avoir besoin
   *  de les cocher une par une. */
  /** État plié/déplié des dossiers dans TOUS les sélecteurs de boîtes
   *  (item 1, nouveau lot) — partagé entre eux, séparé de celui de la page
   *  Organisation elle-même (expandedManageFolders), pour un comportement
   *  d'ouverture/fermeture identique (dossiers repliés par défaut, chevron
   *  qui plie/déplie, effet de pile) sans lier les deux pages entre elles. */
  const pickerExpandedFolders = new Set();

  /** Construit une ligne de sélecteur dans le même style que les blocs de
   *  la page Organisation (item 1) : flèche de dépli, icône + nom,
   *  compteur, éventuelle case à cocher — identique à
   *  buildRowBody/renderTreeLevel de la page Organisation, juste sans les
   *  actions Éditer/Déplacer/Supprimer (pas de sens dans un sélecteur). */
  function buildPickerRow({ depth, isFolder, iconMarkup, nameText, countLabel, expandable, expanded, onToggleExpand, selectControl, checked, dataKind, value, onRowSelect, rowSelectable }) {
    const li = document.createElement("li");
    li.className = "subject-row picker-row" + (isFolder ? ` folder-row folder-row-depth-${Math.min(depth, 3)}` : "");
    const main = document.createElement(selectControl === "checkbox" ? "label" : "div");
    main.className = "org-row-main picker-row-main";

    if (expandable) {
      const expandBtn = document.createElement("button");
      expandBtn.type = "button";
      expandBtn.className = "org-expand-btn";
      expandBtn.title = expanded ? "Replier ce dossier" : "Déplier ce dossier";
      expandBtn.innerHTML = iconSvgMarkup(expanded ? "chevronDown" : "chevronRight", "icon-inline-svg");
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onToggleExpand();
      });
      main.appendChild(expandBtn);
    }

    let cb = null;
    if (selectControl === "checkbox") {
      cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "picker-row-checkbox";
      cb.dataset.kind = dataKind;
      cb.value = value;
      cb.checked = checked;
      main.appendChild(cb);
    }

    const nameWrap = document.createElement("span");
    nameWrap.className = "subject-row-name";
    nameWrap.innerHTML = `${iconMarkup} <span>${escapeHtml(nameText)}</span>`;
    main.appendChild(nameWrap);

    const spacer = document.createElement("span");
    spacer.className = "org-row-spacer";
    main.appendChild(spacer);

    if (countLabel) {
      const count = document.createElement("span");
      count.className = "org-count";
      count.textContent = countLabel;
      main.appendChild(count);
    }

    if (rowSelectable) {
      main.classList.add("picker-row-main--selectable");
      main.addEventListener("click", (e) => {
        if (e.target.closest(".org-expand-btn")) return;
        onRowSelect();
      });
    }

    li.appendChild(main);
    return { li, cb, main };
  }

  /** Construit récursivement l'arbre dossiers/boîtes utilisé par TOUS les
   *  sélecteurs de boîtes de l'appli (item 1, nouveau lot) : Réviser,
   *  Fiches (recherche), Stats, "Nouvelle fiche" et création d'un
   *  événement de calendrier — présentation, plié/déplié et effet de pile
   *  strictement identiques à la page Organisation.
   *  - mode "multi" : case à cocher, cocher un dossier coche tout son
   *    contenu (item 7 du lot précédent).
   *  - mode "single" : clic direct sur le nom = choix immédiat. Les
   *    dossiers non vides ne sont sélectionnables que si
   *    folderAlwaysSelectable est vrai (événement de calendrier, qui peut
   *    lier un dossier entier) ; sinon (choix de boîte pour une nouvelle
   *    fiche) seuls une boîte ou un dossier VIDE (qui deviendra boîte) le
   *    sont — un dossier non vide reste un simple repère à déplier. */
  function renderFolderTreeForPicker(container, parentId, depth, ctx) {
    const excluded = ctx.excludedFolderIds;
    let childFolders = folders.filter((f) => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (excluded) childFolders = childFolders.filter((f) => !excluded.has(f.id));
    // Une boîte auto-liée (même id qu'un dossier) est rendue via la boucle
    // des dossiers ci-dessous — jamais listée deux fois ici (item 1). Quand
    // ctx.hideBoites est vrai (sélecteur de destination de déplacement),
    // aucune boîte n'est un dossier valide où déplacer quoi que ce soit :
    // on les masque entièrement, elles et les fiches qu'elles contiennent.
    const childSubjects = ctx.hideBoites
      ? []
      : subjects
          .filter((s) => s.folderId === parentId && !folders.some((f) => f.id === s.id))
          .filter((s) => !ctx.excludeSubjectIds || !ctx.excludeSubjectIds.has(s.id))
          .sort((a, b) => a.name.localeCompare(b.name, "fr"));

    childFolders.forEach((f) => {
      if (isFolderABoite(f.id)) {
        if (ctx.hideBoites) return;
        if (ctx.excludeSubjectIds && ctx.excludeSubjectIds.has(f.id)) return;
        const n = cards.filter((c) => !c.deleted && c.subject === f.id).length;
        appendPickerBoiteRow(container, depth, f.id, f.name, n, ctx);
        return;
      }
      const childCount = folders.filter((x) => x.parentId === f.id).length + subjects.filter((x) => x.folderId === f.id).length;
      const expanded = pickerExpandedFolders.has(f.id);
      const ids = subjectIdsInFolder(f.id);
      const isEmpty = folderIsEmpty(f.id);
      // Round 3, item 1 : un dossier vide de classe ne doit jamais pouvoir
      // devenir une boîte via ce raccourci (sélecteur "Nouvelle fiche") —
      // seule une sélection "dossier entier" (folderAlwaysSelectable, ex.
      // Réviser/événement de calendrier) reste possible dessus.
      const rowSelectable =
        ctx.mode === "single" && (ctx.folderAlwaysSelectable || (isEmpty && !f.sharedClassId));
      const { li, cb } = buildPickerRow({
        depth,
        isFolder: true,
        expandable: true,
        expanded,
        onToggleExpand: () => {
          if (expanded) pickerExpandedFolders.delete(f.id);
          else pickerExpandedFolders.add(f.id);
          ctx.rerenderRoot();
        },
        iconMarkup: iconSvgMarkup("folder", "icon-inline-svg"),
        nameText: f.name + (ctx.mode === "single" && isEmpty ? " (dossier vide)" : ""),
        countLabel: `${ids.length} boîte${ids.length > 1 ? "s" : ""}`,
        selectControl: ctx.mode === "multi" ? "checkbox" : "none",
        checked: ctx.mode === "multi" && ids.length > 0 && ids.every((id) => ctx.selectedSubjectIds.has(id)),
        dataKind: "folder",
        value: f.id,
        rowSelectable,
        onRowSelect: async () => {
          if (ctx.folderAlwaysSelectable) {
            ctx.onPick("folder", f.id);
            return;
          }
          // Dossier vide (item 1 du lot précédent) : devient boîte à cet
          // instant précis, puis se comporte comme n'importe quelle boîte.
          const s = await ensureFolderIsBoite(f.id);
          if (s) ctx.onPick("subject", s.id);
        },
      });
      if (!expanded && childCount > 0) li.classList.add("folder-row--stacked");
      if (cb) {
        // Item 1 (nouveau lot) : la sélection vit dans un vrai Set JS
        // (ctx.selectedSubjectIds, muté en place puis re-rendu) plutôt que
        // déduite des cases cochées visibles dans le DOM — nécessaire
        // puisqu'un dossier replié peut cocher des boîtes qui n'ont pas
        // (encore) de case affichée à l'écran.
        cb.addEventListener("change", () => {
          if (cb.checked) ids.forEach((id) => ctx.selectedSubjectIds.add(id));
          else ids.forEach((id) => ctx.selectedSubjectIds.delete(id));
          if (ctx.onSelectionChange) ctx.onSelectionChange();
          ctx.rerenderRoot();
        });
      }
      if (expanded) {
        const childrenUl = document.createElement("ul");
        childrenUl.className = "org-children";
        li.appendChild(childrenUl);
        renderFolderTreeForPicker(childrenUl, f.id, depth + 1, ctx);
      }
      container.appendChild(li);
    });

    childSubjects.forEach((s) => {
      const n = cards.filter((c) => !c.deleted && c.subject === s.id).length;
      appendPickerBoiteRow(container, depth, s.id, s.name, n, ctx);
    });
  }

  function appendPickerBoiteRow(container, depth, subjectId, name, cardCount, ctx) {
    const { li, cb } = buildPickerRow({
      depth,
      isFolder: false,
      iconMarkup: orgIconMarkup("orgBoite"),
      nameText: name,
      countLabel: `${cardCount} fiche${cardCount > 1 ? "s" : ""}`,
      selectControl: ctx.mode === "multi" ? "checkbox" : "none",
      checked: ctx.mode === "multi" && ctx.selectedSubjectIds.has(subjectId),
      dataKind: "subject",
      value: subjectId,
      rowSelectable: ctx.mode === "single",
      onRowSelect: () => ctx.onPick("subject", subjectId),
    });
    if (cb) {
      cb.addEventListener("change", () => {
        if (cb.checked) ctx.selectedSubjectIds.add(subjectId);
        else ctx.selectedSubjectIds.delete(subjectId);
        if (ctx.onSelectionChange) ctx.onSelectionChange();
        ctx.rerenderRoot();
      });
    }
    container.appendChild(li);
  }

  /** Ajoute, tout en haut d'un sélecteur multi-boîtes, le pseudo-dossier
   *  racine "Toutes les boîtes" (item 1) : le cocher sélectionne tout,
   *  exactement comme cocher un dossier normal sélectionne son contenu. */
  function prependAllBoxesRootRow(container, ctx) {
    const allIds = subjectIdsInFolder(ROOT_FOLDER_ID);
    const { li, cb } = buildPickerRow({
      depth: 0,
      isFolder: true,
      iconMarkup: iconSvgMarkup("folder", "icon-inline-svg"),
      nameText: "Toutes les boîtes",
      countLabel: `${allIds.length} boîte${allIds.length > 1 ? "s" : ""}`,
      selectControl: "checkbox",
      checked: allIds.length > 0 && allIds.every((id) => ctx.selectedSubjectIds.has(id)),
      dataKind: "all",
      value: "",
    });
    li.classList.add("picker-row--all");
    cb.addEventListener("change", () => {
      if (cb.checked) allIds.forEach((id) => ctx.selectedSubjectIds.add(id));
      else allIds.forEach((id) => ctx.selectedSubjectIds.delete(id));
      if (ctx.onSelectionChange) ctx.onSelectionChange();
      ctx.rerenderRoot();
    });
    container.appendChild(li);
  }

  /** Point d'entrée commun (item 1) pour peupler un sélecteur MULTI-boîtes
   *  dans son style Organisation, pseudo-dossier racine inclus. Le Set
   *  passé en argument est muté EN PLACE au fil des cases cochées/décochées
   *  — l'appelant le relit directement (plus besoin de relire le DOM). */
  function renderMultiBoitePicker(container, selectedSubjectIds, onChange) {
    const ctx = { mode: "multi", selectedSubjectIds, rerenderRoot: rerender, onSelectionChange: onChange };
    function rerender() {
      container.innerHTML = "";
      container.classList.add("picker-tree");
      prependAllBoxesRootRow(container, ctx);
      renderFolderTreeForPicker(container, ROOT_FOLDER_ID, 0, ctx);
    }
    rerender();
  }

  /** Point d'entrée commun (item 1, nouveau lot) pour un sélecteur à choix
   *  UNIQUE dans le même style Organisation — réutilisé par "Nouvelle
   *  fiche" (folderAlwaysSelectable: false, boîtes/dossiers vides
   *  seulement) et par la création d'un événement de calendrier
   *  (folderAlwaysSelectable: true, un dossier entier est un lien valide). */
  function renderSingleBoitePicker(container, onPick, folderAlwaysSelectable, excludeSubjectIds) {
    function rerender() {
      container.innerHTML = "";
      container.classList.add("picker-tree");
      renderFolderTreeForPicker(container, ROOT_FOLDER_ID, 0, { mode: "single", onPick, folderAlwaysSelectable, excludeSubjectIds, container, rerenderRoot: rerender });
    }
    rerender();
  }

  /** Sélecteur de destination pour "Déplacer vers..." (item 1, 3e lot) :
   *  même arbre Organisation que les autres, mais dossiers UNIQUEMENT
   *  (aucune boîte n'est une destination valide) et sans le(s) dossier(s)
   *  exclu(s) (l'élément qu'on déplace, et ses descendants s'il s'agit d'un
   *  dossier). Ajoute une ligne "Racine" tout en haut : la racine est une
   *  destination valide mais n'existe pas dans le tableau `folders`. Choix
   *  immédiat au clic, comme les autres sélecteurs à choix unique. */
  function renderMoveDestinationPicker(container, excludedFolderIds, onPick) {
    function rerender() {
      container.innerHTML = "";
      container.classList.add("picker-tree");
      const { li } = buildPickerRow({
        depth: 0,
        isFolder: true,
        iconMarkup: iconSvgMarkup("folder", "icon-inline-svg"),
        nameText: "Racine",
        selectControl: "none",
        rowSelectable: true,
        onRowSelect: () => onPick(ROOT_FOLDER_ID),
      });
      li.classList.add("picker-row--all");
      container.appendChild(li);
      renderFolderTreeForPicker(container, ROOT_FOLDER_ID, 0, {
        mode: "single",
        onPick: (kind, id) => onPick(id),
        folderAlwaysSelectable: true,
        hideBoites: true,
        excludedFolderIds,
        container,
        rerenderRoot: rerender,
      });
    }
    rerender();
  }

  /* ---------------------------------------------------------
     Page UNIQUE de sélection de boîte(s) (item 1, 4e lot) : remplace tous
     les anciens panneaux flottants (Réviser, Fiches, Stats, Nouvelle
     fiche, Calendrier, "Déplacer vers..." depuis Organisation) par une
     VRAIE page — #view-boite-picker devient la vue active exactement
     comme n'importe quel autre onglet ou sous-page (view-mode-assign,
     view-new-card), donc l'en-tête de l'appli (logo, bouton Home...) reste
     visible au-dessus, et la liste dessous est rigoureusement celle
     utilisée par la page Organisation. Au retour ("← Retour" ou choix
     terminé), on réaffiche la vue d'où on venait. */
  let boitePickerReturnViewId = "view-home";

  function boitePickerActivateView(viewId) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    const target = el(viewId);
    if (target) target.classList.add("is-active");
    const shortName = viewId.replace(/^view-/, "");
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t.dataset.view === shortName));
  }

  /** ctx attendu :
   *  - mode: "multi" | "single"
   *  - title: titre affiché en haut de la page
   *  - hint: phrase d'aide optionnelle sous le titre
   *  - initialSelection (multi) : Set/array des ids déjà sélectionnés
   *  - onConfirm(selectedSet) (multi) : appelé au clic sur "Valider"
   *  - folderAlwaysSelectable, excludedFolderIds, hideBoites (single) :
   *    mêmes réglages que renderFolderTreeForPicker/renderMoveDestinationPicker
   *  - onPick(kind, id) (single) : appelé dès qu'une ligne est choisie
   *  - showNoneButton + onNone (single, optionnel) : bouton "Aucun lien"
   *    (utilisé par le sélecteur de la fiche calendrier). */
  function openBoitePickerView(ctx) {
    const view = el("view-boite-picker");
    const list = el("boite-picker-list");
    if (!view || !list) return;

    const current = document.querySelector(".view.is-active");
    boitePickerReturnViewId = current ? current.id : "view-home";

    const titleEl = el("boite-picker-title");
    if (titleEl) titleEl.textContent = ctx.title || "Choisir une boîte";
    const hintEl = el("boite-picker-hint");
    if (hintEl) {
      hintEl.textContent = ctx.hint || "";
      hintEl.hidden = !ctx.hint;
    }

    const actions = el("boite-picker-actions");
    const confirmBtn = el("boite-picker-confirm");
    const noneBtn = el("boite-picker-none");

    if (ctx.mode === "multi") {
      const selection = new Set(ctx.initialSelection || []);
      renderMultiBoitePicker(list, selection);
      if (actions) actions.hidden = false;
      if (confirmBtn) {
        confirmBtn.hidden = false;
        confirmBtn.onclick = () => ctx.onConfirm(selection);
      }
      if (noneBtn) noneBtn.hidden = true;
    } else {
      if (ctx.excludedFolderIds) {
        renderMoveDestinationPicker(list, ctx.excludedFolderIds, (destId) => ctx.onPick("folder", destId));
      } else {
        renderSingleBoitePicker(list, (kind, id) => ctx.onPick(kind, id), !!ctx.folderAlwaysSelectable, ctx.excludeSubjectIds);
      }
      if (confirmBtn) confirmBtn.hidden = true;
      if (noneBtn) {
        noneBtn.hidden = !ctx.showNoneButton;
        noneBtn.onclick = ctx.showNoneButton ? ctx.onNone : null;
      }
      if (actions) actions.hidden = !ctx.showNoneButton;
    }

    boitePickerActivateView("view-boite-picker");
    // Comme toute autre page indépendante (Nouvelle fiche, Affecter un
    // mode...), l'en-tête de l'appli (bouton Accueil, logo) reste visible.
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
    applyBodyLogoSpeech("boite-picker");
  }

  function closeBoitePickerView() {
    const returnViewId = boitePickerReturnViewId || "view-home";
    boitePickerActivateView(returnViewId);
    // Round 4, partie 2 : en revenant sur la page d'où on est parti, la
    // bulle d'aide doit refléter CETTE page, pas garder le message (ou
    // l'absence de message) du sélecteur de boîte(s).
    if (returnViewId !== "view-home") {
      applyBodyLogoSpeech(returnViewId.replace(/^view-/, ""));
    }
  }

  const boitePickerBackBtn = el("boite-picker-back-btn");
  if (boitePickerBackBtn) boitePickerBackBtn.addEventListener("click", () => closeBoitePickerView());

  // Item 6 (nouveau lot) : quand ce sélecteur est ouvert depuis "Sélection
  // manuelle" (programme de révision), il faut, une fois la sélection
  // validée, aussi amener sur la page Réviser (pas seulement changer la
  // boîte en cours) — ce drapeau le signale au bouton "Valider".
  let multiPickerNavigateToReviewOnConfirm = false;
  function openMultiSubjectPicker() {
    openBoitePickerView({
      mode: "multi",
      title: "Choisir les boîtes à réviser",
      hint: "Choisis les boîtes à réviser confondues :",
      initialSelection: loadMultiSelection(),
      onConfirm: async (selection) => {
        const { resultIds, singleSubjectId, label } = computeMultiPickerResult(selection);
        if (resultIds.length === 0) {
          await robotAlert("Choisis au moins une boîte ou un dossier.");
          return;
        }
        const shouldNavigateToReview = multiPickerNavigateToReviewOnConfirm;
        multiPickerNavigateToReviewOnConfirm = false;

        // Affichage intelligent (item 18) : une seule boîte au final -> on
        // bascule directement dessus (son nom s'affiche naturellement,
        // inutile de passer par le mode "sélection"). Sélection qui
        // correspond exactement à un seul dossier -> son nom. Sinon,
        // libellé générique "Sélection de boîtes".
        if (singleSubjectId) {
          switchSubject(singleSubjectId, true);
        } else {
          saveMultiSelection(resultIds);
          saveMultiSelectionLabel(label || "");
          switchSubject(MULTI_SUBJECTS_ID, true);
        }
        // Item 6 (nouveau lot) : "Sélection manuelle" (programme de
        // révision) amène directement à la page Réviser une fois la
        // sélection validée ; sinon on revient simplement à la page d'où
        // on venait (ex. Réviser elle-même).
        if (shouldNavigateToReview) {
          boitePickerActivateView("view-review");
        } else {
          closeBoitePickerView();
        }
      },
    });
  }

  /** Item 1 (nouveau lot) : le choix de la boîte pour une nouvelle fiche
   *  reprend maintenant le même sélecteur Organisation que partout
   *  ailleurs (renderSingleBoitePicker) — seules une boîte, ou un dossier
   *  VIDE (qui deviendra boîte à cet instant), sont sélectionnables ; un
   *  dossier non vide ne sert qu'à déplier/replier, comme sur Organisation. */
  function openCardsSubjectChoiceMenu() {
    openBoitePickerView({
      mode: "single",
      title: "Choisir la boîte de cette fiche",
      // item 3 (2e lot, Classes) : une boîte partagée par un prof est en
      // lecture seule côté élève — on ne peut pas y ajouter de fiche
      // manuellement, seul le prof la fait évoluer.
      excludeSubjectIds: new Set(subjects.filter((s) => s.sharedBoxId).map((s) => s.id)),
      onPick: (kind, subjectId) => {
        saveNewCardSubjectId(subjectId);
        const btn = el("cards-subject-select-btn");
        if (btn) btn.textContent = subjectName(subjectId);
        closeBoitePickerView();
      },
    });
  }
  const cardsSubjectSelectBtn = el("cards-subject-select-btn");
  if (cardsSubjectSelectBtn) {
    cardsSubjectSelectBtn.addEventListener("click", () => openCardsSubjectChoiceMenu());
  }

  const cardsSearchInputEl = el("cards-search-input");
  if (cardsSearchInputEl) {
    // Débounce (item 10) : sans lui, chaque frappe relançait un filtrage +
    // un rendu complet de la liste — perceptible comme un ralentissement
    // sur une boîte avec beaucoup de fiches, en tapant vite.
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

  // Item 1 : "+ Nouvelle boîte" retiré — une boîte ne naît plus que d'un
  // dossier vide auquel on ajoute une première fiche (voir
  // ensureFolderIsBoite, utilisé par le sélecteur de la page Fiches).

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

  /** Même principe que `persist` pour les fiches, mais pour les boîtes et
   *  les dossiers (item 1/8) : jusqu'ici jamais vraiment synchronisés (une
   *  boîte créée ou déplacée sur un appareil n'apparaissait jamais, ou
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

  /** item 3 (2e lot, Classes) : si cette boîte (côté prof) a été partagée à
   *  une ou plusieurs classes (`subject.sharedShares`), on repousse
   *  l'intégralité de son contenu actuel vers chaque boîte partagée liée —
   *  c'est ce qui fait qu'un ajout/modif/suppression de fiche par le prof
   *  se répercute ensuite chez les élèves (voir `syncSharedBoxesForStudent`
   *  côté élève, qui compare ce même tableau par id). Ne fait rien si Sync
   *  n'est pas configurée ou si la boîte n'est liée à aucune classe. */
  async function pushSharedBoxUpdatesForSubject(subjectId) {
    if (!Sync.isConfigured()) return;
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject || !subject.sharedShares || !subject.sharedShares.length) return;
    const boxCards = cards.filter((c) => !c.deleted && c.subject === subjectId);
    // Round 3, item 1 : le chemin de dossiers actuel (côté prof) est
    // repoussé en même temps que les fiches, pour que l'élève reconstitue
    // la même arborescence même après une réorganisation.
    const folderPathNames = folderPath(subject.folderId).map((f) => f.name);
    for (const share of subject.sharedShares) {
      try {
        await Sync.classes.updateSharedBoxCards(share.boxId, boxCards, folderPathNames);
      } catch (e) {
        console.warn("Classes: échec de la mise à jour de la boîte partagée", e);
      }
    }
  }
  /** Round 3, item 1 : à appeler après tout changement de structure de
   *  dossiers (renommage, déplacement) qui pourrait affecter le chemin
   *  d'une ou plusieurs boîtes partagées — re-pousse toutes les boîtes
   *  partagées d'un coup (simple et largement suffisant à cette échelle,
   *  plutôt que de calculer précisément lesquelles sont concernées). */
  async function pushSharedBoxUpdatesForAllSharedSubjects() {
    if (!Sync.isConfigured()) return;
    const sharedSubjects = subjects.filter((s) => s.sharedShares && s.sharedShares.length);
    for (const s of sharedSubjects) {
      await pushSharedBoxUpdatesForSubject(s.id);
    }
  }
  /** Suppression douce envoyée aux autres appareils AVANT le retrait local
   *  (voir schéma Supabase : "deleted": true plutôt qu'un vrai DELETE, pour
   *  que le pull suivant sache retirer la boîte/le dossier au lieu de le
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
    renderReviewSubjectScore();
    renderReviewGauge();
    // Passe systématiquement la boîte de la fiche AFFICHÉE (item 2 —
    // bug corrigé) : sans ça, en mode "toutes boîtes"/"sélection",
    // l'appel masquait le badge de mode faute de savoir quelle boîte
    // afficher, avant qu'un autre rendu ne le réaffiche juste après — d'où
    // le clignotement observé (par ex. en appuyant sur "chantier").
    renderSubjectAlgoBadge(currentCard ? currentCard.subject : undefined);
  }

  /** Badge "mode d'apprentissage" de la boîte active, affiché dans la
   *  barre déjà existante en haut (voir item 7) — jamais de ligne en plus.
   *  Libellé court (juste "Normal", pas "Apprentissage normal") : la place
   *  disponible à côté du sélecteur est trop réduite pour le nom complet,
   *  qui se faisait tronquer en "Apprentissage n…", peu lisible. */
  const ALGO_MODE_KEY_TO_CLASS = { cool: "is-cool", normal: "is-normal", renforce: "is-renforce", custom: "is-custom" };
  /** Rafraîchit tout ce qui dépend de la boîte active en dehors de sa
   *  propre page : le nombre de fiches + bouton mode dans la barre de
   *  Réviser (item 1, mêmes couleurs que le curseur du mode d'apprentissage
   *  — voir ALGO_MODE_COLORS), et le récapitulatif d'export/import dans
   *  Réglages (item 6). */
  /** `cardSubjectId` (optionnel) : quand on révise "toutes boîtes" ou une
   *  "sélection", chaque fiche affichée a sa propre boîte — c'est ELLE
   *  qui doit déterminer le mode affiché/édité par le bouton, pas la
   *  sélection globale (item 2). Sans cet argument (autres pages, ou mode
   *  normal), on retombe sur `currentSubjectId` comme avant. */
  const cardAlgoBtn = el("card-algo-btn");

  function renderSubjectAlgoBadge(cardSubjectId) {
    const sentinel = isSentinelSubject(currentSubjectId);
    const n = currentSubjectId ? subjectCards().length : 0;
    const effectiveSubjectId = sentinel && cardSubjectId ? cardSubjectId : currentSubjectId;

    if (subjectBarCountEl) subjectBarCountEl.textContent = `${n} fiche${n > 1 ? "s" : ""}`;
    // Un vrai identifiant de boîte (jamais un sentinel) est toujours
    // disponible dès qu'une fiche est affichée à l'écran (item 17 : le
    // badge de mode vit maintenant sur la fiche elle-même, plus à côté du
    // sélecteur de boîte — ça n'avait plus de sens avec le multi-boîtes).
    const showBtn = !sentinel || !!cardSubjectId;
    if (cardAlgoBtn) cardAlgoBtn.hidden = !showBtn;
    if (showBtn && effectiveSubjectId) {
      const key = getSubjectAlgoMode(effectiveSubjectId);
      if (cardAlgoBtn) {
        // Item 13 : icône épurée (banque) plutôt que l'émoticône 🎓, comme
        // sur la page Organisation.
        cardAlgoBtn.innerHTML = iconSvgMarkup("gradCap", "icon-inline-svg");
        applyModeBadgeStyle(cardAlgoBtn, key);
        cardAlgoBtn.dataset.subjectId = effectiveSubjectId;
        cardAlgoBtn.title = `Mode d'apprentissage : ${modeDisplayName(key)}`;
      }
    }
  }

  if (cardAlgoBtn) {
    cardAlgoBtn.addEventListener("click", () => {
      // En mode "toutes boîtes"/"sélection", `dataset.subjectId` porte la
      // vraie boîte de la fiche actuellement affichée (voir
      // renderSubjectAlgoBadge) ; sinon, la boîte active classique.
      const targetId = cardAlgoBtn.dataset.subjectId || currentSubjectId;
      if (targetId && !isSentinelSubject(targetId)) openSubjectAlgoView(targetId, "review");
    });
  }

  /** Toutes les fiches non supprimées de la boîte actuellement active —
   *  gère aussi les deux modes "toutes boîtes" / "sélection de boîtes"
   *  (item 1), chaque fiche gardant alors le mode d'apprentissage de SA
   *  propre boîte (voir computeAlgoNext, qui utilise card.subject). */
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

  /** Score de la boîte/sélection en cours sur Réviser (item 2), à côté
   *  du sélecteur — masquable depuis le mode développeur. */
  function renderReviewSubjectScore() {
    const el2 = el("review-subject-score");
    if (!el2) return;
    const settings = loadDevSettings().cardScore;
    if (settings.hideSubjectScoreOnReview) {
      el2.hidden = true;
      return;
    }
    const pool = subjectCards();
    if (pool.length === 0) {
      el2.hidden = true;
      return;
    }
    const avg = Math.round(pool.reduce((acc, c) => acc + computeCardScore(c), 0) / pool.length);
    el2.hidden = false;
    el2.textContent = `${avg}`;
  }

  /** Item 4 : toutes les jauges (Organisation, Programme de révision,
   *  Réviser) sont désormais des barres linéaires horizontales plutôt que
   *  des anneaux/demi-cercles — même principe partout (couleur = zone
   *  actuelle du score, remplissage proportionnel), avec en option les
   *  points de zone + intitulés (Réviser) et/ou un repère d'objectif
   *  (Programme de révision). */
  /** Limites (en %) des 6 zones de la jauge, à partir des seuils réglés
   *  dans le mode développeur. */
  function gaugeBounds(cardScoreSettings) {
    return [0, cardScoreSettings.v1, cardScoreSettings.v2, cardScoreSettings.v3, cardScoreSettings.v4, cardScoreSettings.v5, 100];
  }
  function currentGaugeZoneColor(score, colors, bounds) {
    let zoneKey = GAUGE_ZONE_DEFS[0].key;
    for (let i = 0; i < GAUGE_ZONE_DEFS.length; i++) {
      if (score >= bounds[i]) zoneKey = GAUGE_ZONE_DEFS[i].key;
    }
    return colors[zoneKey] || DEFAULT_GAUGE_COLORS[zoneKey];
  }
  function buildLinearGaugeSvg(score, { width = 200, barHeight = 14, showZoneLabels = false, targetValue = null, targetFontSize = 8, scoreFontSize = 15, scoreOnLeft = false, targetLabel = "Objectif : ", targetStyle = "circle" } = {}) {
    const settings = loadDevSettings().cardScore;
    const colors = effectiveColors(loadDevSettings()).gaugeColors;
    const bounds = gaugeBounds(settings);
    const color = currentGaugeZoneColor(score, colors, bounds);
    const clampedScore = Math.max(0, Math.min(100, score));
    // Item 10 : le "objectif du jour" (triangle + texte au-dessus) a besoin
    // de plus de marge en haut que le simple repère en cercle.
    const topPad = targetValue !== null && targetStyle === "triangle" ? 34 : 20;
    const bottomPad = showZoneLabels ? 30 : 4;
    const height = topPad + barHeight + bottomPad;
    const barY = topPad;
    // Item 10 : le score se lit à gauche de la jauge — la barre elle-même
    // est donc décalée pour lui laisser la place, plutôt que d'écrire le
    // score PAR-DESSUS le début de la barre.
    const leftPad = scoreOnLeft ? Math.max(28, scoreFontSize * 1.8) : 0;
    const barX0 = leftPad;
    const barWidth = width - leftPad;
    const pctX = (pct) => barX0 + (Math.max(0, Math.min(100, pct)) / 100) * barWidth;
    const fillW = Math.max((clampedScore / 100) * barWidth, clampedScore > 0 ? barHeight : 0);

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="linear-gauge-svg">`;
    svg += `<rect x="${barX0}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${barHeight / 2}" fill="rgba(0,0,0,0.08)" />`;
    if (fillW > 0) svg += `<rect x="${barX0}" y="${barY}" width="${fillW}" height="${barHeight}" rx="${barHeight / 2}" fill="${color}" />`;
    if (scoreOnLeft) {
      svg += `<text x="0" y="${barY + barHeight / 2 + scoreFontSize * 0.35}" text-anchor="start" font-size="${scoreFontSize}" font-weight="700" fill="${color}" font-family="sans-serif">${score}</text>`;
    } else {
      const scoreX = Math.min(Math.max(barX0 + fillW, barX0 + 22), width - 4);
      svg += `<text x="${scoreX}" y="${barY - 6}" text-anchor="middle" font-size="${scoreFontSize}" font-weight="700" fill="${color}" font-family="sans-serif">${score}</text>`;
    }

    if (showZoneLabels) {
      // Item 10 : les traits de niveau deviennent des ronds DIRECTEMENT sur
      // la jauge (même diamètre que son épaisseur), contour noir, remplis
      // de la couleur de la zone qu'ils terminent — avec les étoiles
      // centrées horizontalement au-dessus de chaque rond (item 8).
      const cr = barHeight / 2;
      for (let i = 0; i < GAUGE_ZONE_DEFS.length; i++) {
        const boundary = bounds[i + 1];
        if (boundary === undefined) continue;
        const cx = pctX(boundary);
        const zc = colors[GAUGE_ZONE_DEFS[i].key] || DEFAULT_GAUGE_COLORS[GAUGE_ZONE_DEFS[i].key];
        const clampedCx = Math.max(barX0 + cr, Math.min(barX0 + barWidth - cr, cx));
        svg += `<circle cx="${clampedCx.toFixed(1)}" cy="${barY + barHeight / 2}" r="${cr}" fill="${zc}" stroke="#000" stroke-width="1.2" />`;
        svg += `<text x="${clampedCx.toFixed(1)}" y="${barY + barHeight + 14}" text-anchor="middle" font-size="7" font-family="sans-serif" fill="${zc}">${gaugeZoneStarText(GAUGE_ZONE_DEFS[i].stars)}</text>`;
      }
    }
    if (targetValue !== null) {
      const tx = pctX(targetValue);
      if (targetStyle === "triangle") {
        // Item 10 : triangle noir juste au-dessus de la jauge, avec
        // "Objectif du jour : X" écrit au-dessus du triangle.
        const triY = barY - 4;
        svg += `<polygon points="${tx.toFixed(1)},${triY} ${(tx - 6).toFixed(1)},${triY - 9} ${(tx + 6).toFixed(1)},${triY - 9}" fill="#000" />`;
        const anchor = tx > barX0 + barWidth - 60 ? "end" : tx < barX0 + 60 ? "start" : "middle";
        svg += `<text x="${tx.toFixed(1)}" y="${triY - 13}" text-anchor="${anchor}" font-size="${targetFontSize}" font-weight="700" fill="var(--ink, #1f2937)" font-family="sans-serif">${targetLabel}${targetValue}</text>`;
      } else {
        // Item 9 : simple rond noir directement sur la jauge, de diamètre
        // égal à son épaisseur — sans trait en dessous.
        svg += `<circle cx="${tx.toFixed(1)}" cy="${barY + barHeight / 2}" r="${barHeight / 2}" fill="#000" />`;
        const anchor = tx > barX0 + barWidth - 45 ? "end" : tx < barX0 + 45 ? "start" : "middle";
        svg += `<text x="${tx.toFixed(1)}" y="${barY - 6}" text-anchor="${anchor}" font-size="${targetFontSize}" font-weight="700" fill="var(--ink-soft, #64748b)" font-family="sans-serif">${targetLabel}${targetValue}</text>`;
      }
    }
    svg += `</svg>`;
    return svg;
  }
  /** Nouvelle jauge de persistance (remplace la jauge de score 0-100 dans
   *  les 3 emplacements où elle apparaissait — Organisation, Réviser,
   *  Programme de révision) : une barre à 4 segments contigus, proportionnels
   *  au nombre de fiches du `pool` dont la persistance (PERS, en minutes)
   *  tombe dans chacun des 4 paliers réglables (gris clair/vert clair/vert/
   *  vert foncé). `pool` peut être null/vide : jauge grise pleine. */
  function buildPersGaugeSvg(pool, { width = 200, barHeight = 14, showLabels = false } = {}) {
    const settings = loadDevSettings();
    const colors = settings.persGaugeColors;
    const list = pool || [];
    const counts = { court: 0, moyen: 0, long: 0, tresLong: 0 };
    for (const c of list) {
      const persMin = typeof c.pers === "number" ? c.pers : 0;
      counts[classifyPersBracket(persMin, settings.revisionAlgo)] += 1;
    }
    const total = list.length;
    const barY = 2;
    const height = barY * 2 + barHeight + (showLabels ? 14 : 0);
    let svg = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect x="0" y="${barY}" width="${width}" height="${barHeight}" rx="${barHeight / 2}" fill="${colors.court}" />`;
    if (total > 0) {
      let x = 0;
      for (const key of PERS_GAUGE_ZONE_ORDER) {
        const w = (counts[key] / total) * width;
        if (w > 0) {
          svg += `<rect x="${x.toFixed(1)}" y="${barY}" width="${w.toFixed(1)}" height="${barHeight}" fill="${colors[key]}" />`;
        }
        x += w;
      }
      // Coins arrondis par-dessus (masque le rectangle plein sous-jacent).
      svg += `<rect x="0" y="${barY}" width="${width}" height="${barHeight}" rx="${barHeight / 2}" fill="none" stroke="var(--paper, #fff)" stroke-width="0" />`;
    }
    if (showLabels) {
      const pct = (key) => (total > 0 ? Math.round((counts[key] / total) * 100) : 0);
      svg += `<text x="0" y="${barY + barHeight + 12}" font-size="9" font-family="sans-serif" fill="var(--ink-soft, #64748b)">${PERS_GAUGE_ZONE_ORDER.map((k) => `${PERS_GAUGE_ZONE_LABELS[k]} ${pct(k)}%`).join(" · ")}</text>`;
    }
    svg += `</svg>`;
    return svg;
  }
  /** Jauge compacte (Organisation) : juste la barre + le score, sans
   *  point de zone ni objectif. */
  function renderMiniGaugeRing(score) {
    return buildLinearGaugeSvg(score, { width: 120, barHeight: 12, scoreFontSize: 13 });
  }
  /** Même jauge, avec en plus un repère indiquant le score OBJECTIF à
   *  atteindre — utilisée dans le Programme de révision. */
  function renderMiniGaugeRingWithTarget(score, target) {
    const fontSize = loadDevSettings().cardScore.programTargetFontSize;
    return buildLinearGaugeSvg(score, { width: 190, barHeight: 12, scoreFontSize: 13, targetValue: target, targetFontSize: fontSize });
  }
  /** Grande jauge de la page Réviser : les 6 points de zone avec leurs
   *  intitulés (Débutant, Fragile, etc.), comme le demandait l'item 4. */
  /** Item 10 : "objectif du jour" pour la jauge de Réviser — reprend la
   *  même logique que le Programme de révision (échéance la plus proche
   *  liée à la boîte actuellement révisée), affiché seulement quand une
   *  boîte précise (pas "toutes"/sélection) est en cours et qu'elle a
   *  effectivement une échéance à venir. */
  function computeTodayTargetForCurrentSubject() {
    if (!currentSubjectId || currentSubjectId === ALL_SUBJECTS_ID || currentSubjectId === MULTI_SUBJECTS_ID) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    const linkId = `subject:${currentSubjectId}`;
    const upcoming = loadCalendarEvents()
      .filter((ev) => ev.linkId === linkId && ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (upcoming.length === 0) return null;
    return REVISION_PROGRAM_TARGET_SCORE;
  }
  function renderReviewGauge() {
    const wrap = el("review-gauge-wrap");
    if (!wrap) return;
    const pool = subjectCards();
    wrap.innerHTML = buildPersGaugeSvg(pool, { width: 300, barHeight: 18, showLabels: true });
  }

  function renderDuePill() {
    const due = dueCards().length;
    dueCountEl.textContent = String(due);

    // Item 5 (dernier lot) : la pastille ne s'affiche plus que sur la
    // page Réviser (elle restait visible partout auparavant).
    const onReview = el("view-review") && el("view-review").classList.contains("is-active");
    duePillEl.hidden = !onReview;
    if (!onReview) return;

    // Dès que le compteur atteint 0, la pastille passe en blanc (comme en
    // mode bonus) — que l'on soit ou non dans une session de révision.
    if (isBonusMode || due === 0) {
      duePillEl.classList.add("is-bonus");
      duePillEl.style.removeProperty("background");
      duePillEl.style.removeProperty("color");
      return;
    }

    duePillEl.classList.remove("is-bonus");
    // Item 5 : couleur unie et réglable (Réglages), plus de dégradé
    // rouge → vert selon la proportion de fiches à revoir.
    duePillEl.style.background = loadDuePillColor();
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
   *  boîte. */
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
    const wasFlipped = isFlipped;
    isFlipped = false;

    if (wasFlipped) {
      // Item 2 : le contenu change au MILIEU du retournement (la fiche est
      // alors de profil, aucune face n'est vraiment visible) plutôt qu'à
      // la toute fin — on ne voit donc plus le changement de question se
      // produire, la fiche semble "révéler" la nouvelle question en
      // continuant simplement son mouvement.
      flipCardEl.classList.remove("is-flipped");
      setTimeout(finishShowNextCard, getFlipDurationMs() / 2);
    } else {
      flipCardEl.classList.add("no-flip-transition");
      flipCardEl.classList.remove("is-flipped");
      void flipCardEl.offsetWidth; // force l'application de la classe avant la suite
      requestAnimationFrame(() => flipCardEl.classList.remove("no-flip-transition"));
      finishShowNextCard();
    }
  }

  function finishShowNextCard() {
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
      renderReviewSubjectScore();
      renderReviewGauge();
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
      if (el("review-score-info")) el("review-score-info").hidden = true;
      reviewProgressEl.textContent = "";
      renderDuePill();
      renderReviewChart();
      renderReviewSubjectScore();
      renderReviewGauge();
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
    renderReviewSubjectScore();
    renderReviewGauge();
  }

  function updateRatingPreviews() {
    if (!currentCard) return;
    if (isBonusMode) {
      el("sub-again").textContent =
        bonusAgainMode === "increment" ? "+1 j" : "→ demain";
      el("sub-hard").textContent = `+${bonusDaysSettings.hard} j`;
      el("sub-good").textContent = `+${bonusDaysSettings.good} j`;
      el("sub-easy").textContent = `+${bonusDaysSettings.easy} j`;
      updateReviewScoreInfo({
        again: bonusAgainMode === "increment" ? 1 : 1,
        hard: bonusDaysSettings.hard,
        good: bonusDaysSettings.good,
        easy: bonusDaysSettings.easy,
      });
      return;
    }
    el("sub-again").textContent = "…";
    const previews = {};
    const futureDelaysMin = {};
    for (const rating of ["again", "hard", "good", "easy"]) {
      const next = computeAlgoNext(currentCard, rating, currentCard.subject);
      previews[rating] = formatDelayMinutes(next.dd);
      futureDelaysMin[rating] = next.dd;
    }
    el("sub-again").textContent = previews.again;
    el("sub-hard").textContent = previews.hard;
    el("sub-good").textContent = previews.good;
    el("sub-easy").textContent = previews.easy;
    updateReviewScoreInfo(futureDelaysMin);
  }

  /** Item 1d : délai précédent et, pour chaque note, le futur délai — sous
   *  le nouvel algorithme de révision (minutes), masquable depuis le mode
   *  développeur. Le "score" 0-100 historique n'a plus grand sens sous ce
   *  nouvel algorithme (délais très majoritairement sous 1 jour) : cette
   *  ligne n'affiche donc plus que les délais, pas de score — voir aussi
   *  la nouvelle jauge de persistance (buildPersGaugeSvg) qui remplace
   *  l'ancienne jauge de score ailleurs dans l'appli. */
  function updateReviewScoreInfo(futureDelaysMin) {
    const wrap = el("review-score-info");
    if (!wrap || !currentCard) return;
    const settings = loadDevSettings().cardScore;
    if (settings.hideReviewScoreInfo) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    const prevDelay = typeof currentCard.dd === "number" ? currentCard.dd : currentCard.interval * 1440 || 0;
    el("score-info-prev-delay").textContent = formatDelayMinutes(prevDelay);
    el("score-info-current").textContent = "";
    const labels = { again: "Encore", hard: "Difficile", good: "Bien", easy: "Excellent" };
    ["again", "hard", "good", "easy"].forEach((r) => {
      const cell = el(`score-info-${r}`);
      if (!cell) return;
      cell.textContent = `${labels[r]} : ${formatDelayMinutes(futureDelaysMin[r])}`;
    });
  }

  /** Formatage minute/heure/jour-aware du délai d'interrogation (nouvel
   *  algorithme de révision, granularité minute) — remplace formatInterval
   *  (jours uniquement) pour les aperçus sous les boutons d'évaluation. */
  function formatDelayMinutes(minutes) {
    const m = Math.round(minutes || 0);
    if (m < 60) return `${m} min`;
    if (m < 1440) {
      const h = Math.round(m / 60);
      return `${h} h`;
    }
    const j = Math.round(m / 1440);
    return `${j} j`;
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
  /** Jeton incrémenté à chaque nouvelle vague déclenchée (item 1 — bug
   *  corrigé) : si une deuxième notation arrive avant que l'animation de la
   *  première ne soit terminée, les callbacks de fin d'animation de
   *  l'ancienne vague se reconnaissent périmés et n'agissent plus (ne
   *  remettent pas le graphique à l'échelle normale ni ne re-scrollent),
   *  pour ne jamais interférer avec la vague la plus récente en cours. */
  let reviewWaveToken = 0;

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
    // Annulable comme une notation (item 9 — bug corrigé : jusqu'ici
    // l'hibernation n'était pas du tout capturée par "Annuler la dernière
    // évaluation", qui restaurait alors le mauvais état).
    captureRatingSnapshot(null);
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
    // Même animation que pour une notation (item 9 — bug corrigé :
    // l'hibernation n'animait jamais le graphique).
    requestAnimationFrame(() => triggerReviewChartWave(0, updated.interval));
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
      if (!(await robotConfirm(msg))) return;
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
  /** Retenu pour "Retour" (item 2) : permet de revenir à l'onglet d'où on
   *  venait, plutôt que toujours atterrir sur Fiches. */
  let previousViewBeforeNewCard = "review";
  function openNewCardView() {
    const activeTab = document.querySelector(".tab.is-active");
    // Par défaut "home" (pas de tab actif = on venait de l'accueil, seul
    // point d'entrée normal désormais vers "+ Ajouter une fiche").
    previousViewBeforeNewCard = activeTab ? activeTab.dataset.view : "home";
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    const target = el("view-new-card");
    if (target) target.classList.add("is-active");
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    // Item 2 (dernier lot) : le logo (avec sa zone de parole) apparaît
    // aussi sur "Ajouter une fiche", qui ne passe pas par le clic sur un
    // onglet normal.
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
    applyBodyLogoSpeech("new-card");
  }
  function closeNewCardView(toView) {
    const dest = toView || previousViewBeforeNewCard || "home";
    if (dest === "home") {
      goHome();
      return;
    }
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    const target = el(`view-${dest}`);
    if (target) target.classList.add("is-active");
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t.dataset.view === dest));
  }

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
        if (await blockIfSharedReadonly(cards[idx].subject)) return;
        const updated = touch({ ...cards[idx], question, answer });
        await persist(updated);
        cards[idx] = updated;
        syncCardEverywhere(updated);
        await pushSharedBoxUpdatesForSubject(updated.subject);
      }
      exitEditMode();
      resetCardForm();
      renderAll();
      if (editReturnToReview) {
        editReturnToReview = false;
        closeNewCardView("review");
      } else {
        closeNewCardView();
      }
    } else {
      // Item 5 : la boîte est désormais obligatoire et explicite (bug
      // corrigé — la fiche partait auparavant toujours dans la boîte
      // active de Réviser, sans lien avec ce sélecteur).
      if (!newCardSubjectId || !subjects.some((s) => s.id === newCardSubjectId)) {
        await robotAlert("Choisis d'abord une boîte pour cette fiche.");
        return;
      }
      if (await blockIfSharedReadonly(newCardSubjectId)) return;
      const card = newCard(question, answer, newCardSubjectId);
      await persist(card);
      cards.push(card);
      await pushSharedBoxUpdatesForSubject(newCardSubjectId);
      renderAll();
      // Item 5 : on reste sur cette page pour enchaîner la création d'une
      // autre fiche, la boîte choisie est conservée.
      resetCardForm();
      showToast("Fiche ajoutée");
      if (inputQuestion) inputQuestion.focus();
      if (!currentCard) startReviewSession();
    }
  });

  const newCardBackBtn = el("new-card-back-btn");
  if (newCardBackBtn) {
    newCardBackBtn.addEventListener("click", () => {
      editReturnToReview = false;
      exitEditMode();
      resetCardForm();
      closeNewCardView();
    });
  }

  cancelEditBtn.addEventListener("click", () => {
    if (editingId) {
      // Annuler une MODIFICATION : rien à garder, on repart d'où on venait.
      editReturnToReview = false;
      exitEditMode();
      resetCardForm();
      closeNewCardView();
    } else {
      // Item 7 : annuler une CRÉATION efface juste le contenu (question/
      // réponse), garde la boîte choisie, et reste sur cette page.
      resetCardForm();
      if (inputQuestion) inputQuestion.focus();
    }
  });

  const deleteEditingCardBtn = el("delete-editing-card");

  async function enterEditMode(card) {
    if (await blockIfSharedReadonly(card.subject)) return;
    openNewCardView();
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
      if (!(await robotConfirm("Supprimer définitivement cette fiche ? Cette action est irréversible.", { danger: true }))) return;
      const id = editingId;
      editReturnToReview = false;
      exitEditMode();
      resetCardForm();
      await deleteCard(id, true);
      closeNewCardView();
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
   *  de la boîte choisie pour la CRÉATION d'une nouvelle fiche
   *  (`cardsSubjectSelectEl`, qui doit toujours rester une boîte réelle
   *  unique) : par défaut "cette boîte" suit ce choix, mais peut être
   *  élargi à un dossier entier, toutes les boîtes, ou une sélection
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

  const CARDS_SCOPE_MULTI_LABEL_KEY = "fiches_cards_multi_label";
  function loadCardsMultiLabel() {
    return localStorage.getItem(CARDS_SCOPE_MULTI_LABEL_KEY) || "";
  }
  function saveCardsMultiLabel(label) {
    localStorage.setItem(CARDS_SCOPE_MULTI_LABEL_KEY, label || "");
  }

  /** Libellé affiché sur le bouton de périmètre (item : même principe que
   *  Réviser). */
  function cardsScopeLabel() {
    if (cardsScopeFilter === CARDS_SCOPE_CURRENT) return subjectName(currentSubjectId);
    if (cardsScopeFilter === ALL_SUBJECTS) return "Toutes les boîtes";
    if (cardsScopeFilter === CARDS_SCOPE_MULTI) return loadCardsMultiLabel() || "Sélection de boîtes";
    if (typeof cardsScopeFilter === "string" && cardsScopeFilter.startsWith("folder:")) {
      const f = folders.find((x) => x.id === cardsScopeFilter.slice(7));
      return f ? f.name : "Dossier inconnu";
    }
    const s = subjects.find((x) => x.id === cardsScopeFilter);
    return s ? s.name : "Cette boîte";
  }

  function renderCardsScopeSelect() {
    const btn = el("cards-scope-select-btn");
    if (!btn) return;
    // Valide encore le périmètre choisi (dossier/boîte supprimé entre
    // temps ?), comme le faisait l'ancien <select>.
    const isFolderOpt =
      typeof cardsScopeFilter === "string" &&
      cardsScopeFilter.startsWith("folder:") &&
      folders.some((f) => `folder:${f.id}` === cardsScopeFilter);
    const valid =
      cardsScopeFilter === CARDS_SCOPE_CURRENT ||
      cardsScopeFilter === ALL_SUBJECTS ||
      cardsScopeFilter === CARDS_SCOPE_MULTI ||
      isFolderOpt ||
      subjects.some((s) => s.id === cardsScopeFilter);
    if (!valid) cardsScopeFilter = CARDS_SCOPE_CURRENT;
    btn.textContent = cardsScopeLabel();
    // Item 10 : rappel des boîtes/dossiers réellement choisis quand la
    // combinaison ne rentre pas dans un simple nom (le bouton lui-même
    // affiche alors juste "Sélection de boîtes", trop vague).
    const summaryEl = el("cards-scope-summary");
    if (summaryEl) {
      if (cardsScopeFilter === CARDS_SCOPE_MULTI) {
        const names = loadCardsMultiSelection().map((id) => subjectName(id)).filter(Boolean);
        // Item 11 : chaque dossier/boîte choisi sur sa propre ligne (liste
        // verticale), plutôt qu'une seule ligne avec des virgules.
        summaryEl.innerHTML = names.length > 0 ? names.map((n) => `<span class="cards-scope-summary-item">${escapeHtml(n)}</span>`).join("") : "";
        summaryEl.hidden = names.length === 0;
      } else {
        summaryEl.hidden = true;
      }
    }
  }

  function openCardsScopeChoiceMenu() {
    const menu = el("cards-scope-choice-menu");
    if (menu) menu.hidden = false;
  }
  function closeCardsScopeChoiceMenu() {
    const menu = el("cards-scope-choice-menu");
    if (menu) menu.hidden = true;
  }
  const cardsScopeSelectBtn = el("cards-scope-select-btn");
  if (cardsScopeSelectBtn) {
    cardsScopeSelectBtn.addEventListener("click", () => {
      openCardsScopeChoiceMenu();
    });
  }
  const cardsScopeChoiceCurrentBtn = el("cards-scope-choice-current");
  if (cardsScopeChoiceCurrentBtn) {
    cardsScopeChoiceCurrentBtn.addEventListener("click", () => {
      closeCardsScopeChoiceMenu();
      cardsScopeFilter = CARDS_SCOPE_CURRENT;
      renderManageList();
    });
  }
  const cardsScopeChoiceAllBtn = el("cards-scope-choice-all");
  if (cardsScopeChoiceAllBtn) {
    cardsScopeChoiceAllBtn.addEventListener("click", () => {
      closeCardsScopeChoiceMenu();
      cardsScopeFilter = ALL_SUBJECTS;
      renderManageList();
    });
  }
  const cardsScopeChoiceSelectionBtn = el("cards-scope-choice-selection");
  if (cardsScopeChoiceSelectionBtn) {
    cardsScopeChoiceSelectionBtn.addEventListener("click", () => {
      closeCardsScopeChoiceMenu();
      openBoitePickerView({
        mode: "multi",
        title: "Choisir des boîtes et/ou dossiers",
        hint: "Coche des boîtes et/ou dossiers à combiner :",
        initialSelection: loadCardsMultiSelection(),
        onConfirm: async (selection) => {
          const { resultIds, singleSubjectId, label } = computeMultiPickerResult(selection);
          if (resultIds.length === 0) {
            await robotAlert("Choisis au moins une boîte ou un dossier.");
            return;
          }
          saveCardsMultiSelection(resultIds);
          // Une seule boîte au final -> son nom directement
          // (computeMultiPickerResult renvoie label=null dans ce cas,
          // réservé ailleurs à un vrai changement de boîte active — ici on
          // reste en mode "sélection", donc on affiche juste son nom au
          // lieu du libellé générique).
          saveCardsMultiLabel(singleSubjectId ? subjectName(singleSubjectId) : label || "");
          cardsScopeFilter = CARDS_SCOPE_MULTI;
          closeBoitePickerView();
          renderManageList();
        },
      });
    });
  }
  const cardsScopeChoiceCancelBtn = el("cards-scope-choice-cancel");
  if (cardsScopeChoiceCancelBtn) {
    cardsScopeChoiceCancelBtn.addEventListener("click", () => closeCardsScopeChoiceMenu());
  }
  document.addEventListener("pointerdown", (e) => {
    const menu = el("cards-scope-choice-menu");
    if (!menu || menu.hidden) return;
    if (menu.contains(e.target) || e.target === cardsScopeSelectBtn) return;
    closeCardsScopeChoiceMenu();
  });

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

      // Score d'apprentissage (item 1c), coin supérieur droit de la ligne.
      const scoreBadge = document.createElement("span");
      scoreBadge.className = "card-row-score";
      scoreBadge.textContent = `${computeCardScore(card)}`;
      li.appendChild(scoreBadge);

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
      // Nom de la boîte (item 11) : seulement utile quand la liste mélange
      // plusieurs boîtes (dossier / toutes / sélection) — inutile et
      // redondant quand on est déjà filtré sur "cette boîte".
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
      constructionBtn.innerHTML = getIconMarkupFor("construction");
      constructionBtn.title = card.underConstruction ? "Retirer le signalement « à corriger »" : "Signaler comme fiche à corriger";
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
        moveSelect.title = "Déplacer vers une autre boîte";
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

  /** Reclasse manuellement une fiche vers une autre boîte (utile pour
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
    if (await blockIfSharedReadonly(card.subject)) return;
    if (!skipConfirm && !(await robotConfirm("Supprimer définitivement cette fiche ? Cette action est irréversible.", { danger: true }))) {
      return;
    }
    const updated = touch({ ...card, deleted: true });
    await persist(updated);

    const idx = cards.findIndex((c) => c.id === id);
    if (idx >= 0) cards[idx] = updated;
    reviewQueue = reviewQueue.filter((c) => c.id !== id);
    await pushSharedBoxUpdatesForSubject(card.subject);
    // Item 1 : si c'était la dernière fiche d'une boîte "née" d'un dossier
    // vide, ce dossier redevient un dossier normal.
    await revertFolderIfBoiteEmptied(card.subject);
    if (currentCard && currentCard.id === id) {
      showNextCard();
    }
    renderAll();
  }

  /* ---------------------------------------------------------
     Import / export JSON (item 8 : sélecteur de boîte dédié à l'export,
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
      await robotAlert(`${normalized.length} fiche(s) ajoutée(s) à « ${subjectName(targetId)} ». Les fiches existantes n'ont pas été touchées.`);
    } catch (err) {
      await robotAlert("Import impossible : le fichier ne semble pas être un export valide.");
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

  /** Étend le sélecteur Stats (item 15) : boîtes individuelles (comme
   *  avant), mais aussi des dossiers entiers ("folder:<id>", toutes les
   *  boîtes qu'ils contiennent, sous-dossiers compris) et une sélection
   *  libre combinant plusieurs boîtes et/ou dossiers. */
  const STATS_MULTI_LABEL_KEY = "fiches_stats_multi_label";
  function loadStatsMultiLabel() {
    return localStorage.getItem(STATS_MULTI_LABEL_KEY) || "";
  }
  function saveStatsMultiLabel(label) {
    localStorage.setItem(STATS_MULTI_LABEL_KEY, label || "");
  }

  function statsScopeLabel() {
    if (statsSubjectFilter === ALL_SUBJECTS) return "Toutes les boîtes";
    if (statsSubjectFilter === STATS_MULTI_ID) return loadStatsMultiLabel() || "Sélection de boîtes";
    if (typeof statsSubjectFilter === "string" && statsSubjectFilter.startsWith("folder:")) {
      const f = folders.find((x) => x.id === statsSubjectFilter.slice(7));
      return f ? f.name : "Dossier inconnu";
    }
    const s = subjects.find((x) => x.id === statsSubjectFilter);
    return s ? s.name : "Toutes les boîtes";
  }

  function renderStatsSubjectSelect() {
    const btn = el("stats-subject-select-btn");
    if (!btn) return;
    const isFolderOpt =
      typeof statsSubjectFilter === "string" &&
      statsSubjectFilter.startsWith("folder:") &&
      folders.some((f) => `folder:${f.id}` === statsSubjectFilter);
    const valid =
      statsSubjectFilter === ALL_SUBJECTS ||
      statsSubjectFilter === STATS_MULTI_ID ||
      isFolderOpt ||
      subjects.some((s) => s.id === statsSubjectFilter);
    if (!valid) statsSubjectFilter = ALL_SUBJECTS;
    btn.textContent = statsScopeLabel();
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

  /** Mêmes identifiants de boîtes que statsScopeCards, mais pour filtrer
   *  le journal des notes (ratingLog), qui référence subjectId et non les
   *  fiches elles-mêmes (une fiche déplacée entre-temps ne fausse donc pas
   *  l'historique : chaque entrée garde la boîte qu'elle avait au moment
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
    openBoitePickerView({
      mode: "multi",
      title: "Choisir les boîtes pour les statistiques",
      hint: "Choisis les boîtes et/ou dossiers à combiner :",
      initialSelection: loadStatsMultiSelection(),
      onConfirm: async (selection) => {
        const { resultIds, singleSubjectId, label } = computeMultiPickerResult(selection);
        if (resultIds.length === 0) {
          await robotAlert("Choisis au moins une boîte ou un dossier.");
          return;
        }
        closeBoitePickerView();
        if (singleSubjectId) {
          statsSubjectFilter = singleSubjectId;
          renderStats();
          return;
        }
        saveStatsMultiSelection(resultIds);
        saveStatsMultiLabel(label || "");
        statsSubjectFilter = STATS_MULTI_ID;
        renderStats();
      },
    });
  }

  function openStatsScopeChoiceMenu() {
    const menu = el("stats-scope-choice-menu");
    if (menu) menu.hidden = false;
  }
  function closeStatsScopeChoiceMenu() {
    const menu = el("stats-scope-choice-menu");
    if (menu) menu.hidden = true;
  }
  const statsSubjectSelectBtn = el("stats-subject-select-btn");
  if (statsSubjectSelectBtn) {
    statsSubjectSelectBtn.addEventListener("click", () => {
      openStatsScopeChoiceMenu();
    });
  }
  const statsScopeChoiceAllBtn = el("stats-scope-choice-all");
  if (statsScopeChoiceAllBtn) {
    statsScopeChoiceAllBtn.addEventListener("click", () => {
      closeStatsScopeChoiceMenu();
      statsSubjectFilter = ALL_SUBJECTS;
      renderStats();
    });
  }
  const statsScopeChoiceSelectionBtn = el("stats-scope-choice-selection");
  if (statsScopeChoiceSelectionBtn) {
    statsScopeChoiceSelectionBtn.addEventListener("click", () => {
      closeStatsScopeChoiceMenu();
      openStatsMultiPicker();
    });
  }
  const statsScopeChoiceCancelBtn = el("stats-scope-choice-cancel");
  if (statsScopeChoiceCancelBtn) {
    statsScopeChoiceCancelBtn.addEventListener("click", () => closeStatsScopeChoiceMenu());
  }
  document.addEventListener("pointerdown", (e) => {
    const menu = el("stats-scope-choice-menu");
    if (!menu || menu.hidden) return;
    if (menu.contains(e.target) || e.target === statsSubjectSelectBtn) return;
    closeStatsScopeChoiceMenu();
  });


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

  /** Fusionne les deux histogrammes (item 9) en un seul, "aujourd'hui" fixé
   *  à l'extrémité GAUCHE de la zone visible par défaut (comme l'ancien
   *  graphique "à revoir" seul) : les jours à venir (fiches dues) s'étalent
   *  normalement vers la droite, et l'historique des fiches RÉVISÉES
   *  s'étend vers la gauche, hors champ par défaut — on ne le découvre
   *  qu'en faisant défiler le graphique vers la gauche (voir le scroll
   *  initial appliqué après le rendu). */
  function computeMergedHistogram(pool, futureDays, pastDays) {
    const dueBuckets = computeDueHistogram(pool, futureDays);
    const reviewedBuckets = computeReviewedHistogram(pool, pastDays);
    const merged = [];
    // Passé, du plus ancien au plus récent — on saute l'indice 0 de
    // reviewedBuckets ("aujourd'hui" côté révisé) puisque le jour même est
    // déjà représenté par le premier bucket "due" juste après.
    for (let i = pastDays - 1; i >= 1; i--) {
      merged.push({ date: reviewedBuckets[i].date, count: reviewedBuckets[i].count, kind: "reviewed" });
    }
    dueBuckets.forEach((b, i) => {
      merged.push({ date: b.date, count: b.count, kind: i === 0 ? "today" : "due" });
    });
    return merged;
  }

  const MONTH_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  // Index 0 = dimanche (convention JS Date#getDay()).
  const WEEKDAY_SHORT = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
  // Une seule lettre (item 13), utilisée à l'échelle "1 mois" spécifiquement
  // — assez de colonnes sur cette échelle pour que "lun"/"mar" se chevauchent
  // visuellement, une seule lettre reste lisible.
  const WEEKDAY_SINGLE = ["D", "L", "M", "M", "J", "V", "S"];
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
   *  et le mini graphique de la page Réviser (boîte en cours). */
  function renderHistogramInto(chartEl, emptyEl, wrapEl, pool, rangeKey, maxBarPx, computeFn, todayAtEnd, suppressChangeFlash, mergedPastDays, minTotalDays) {
    if (!chartEl) return;
    const baseCfg = RANGE_CONFIG[rangeKey] || { visible: rangeKey, total: rangeKey };
    // Étend temporairement le nombre de colonnes générées (sans changer
    // combien tiennent à l'écran) si on doit absolument pouvoir animer
    // jusqu'à un jour au-delà de la fenêtre habituelle (voir
    // triggerReviewChartWave) — sinon la vague ciblait la dernière colonne
    // VISIBLE plutôt que la vraie nouvelle échéance de la fiche.
    const cfg =
      minTotalDays !== undefined && minTotalDays > baseCfg.total
        ? { ...baseCfg, total: minTotalDays }
        : baseCfg;
    const days = cfg.total;
    let buckets;
    let todayIdx;
    if (mergedPastDays !== undefined) {
      // Histogramme fusionné (item 9) : "aujourd'hui" n'est ni au tout début
      // ni à la toute fin du tableau, mais à un index calculé — voir
      // computeMergedHistogram pour le détail de la construction.
      buckets = computeMergedHistogram(pool, days, mergedPastDays);
      todayIdx = mergedPastDays - 1;
    } else {
      buckets = (computeFn || computeDueHistogram)(pool, days);
      // Historique des fiches révisées (item 21) : présent à droite, passé à
      // gauche — sens inverse du graphique "à revoir" (présent à gauche,
      // futur à droite). On inverse simplement l'ordre des colonnes déjà
      // calculées (index 0 = aujourd'hui devient la DERNIÈRE colonne) plutôt
      // que de dupliquer toute la logique de calcul.
      if (todayAtEnd) buckets = [...buckets].reverse();
      todayIdx = todayAtEnd ? buckets.length - 1 : 0;
    }
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
      // Le mini graphique de Réviser (item 4) désactive ce flash "diff" :
      // il a sa propre animation en vague bien plus riche (voir
      // triggerReviewChartWave), et les deux en même temps se marchaient
      // dessus — la case cible semblait "déjà" s'allumer dès le début,
      // avant même que la vague ne l'atteigne.
      const changed = !suppressChangeFlash && prevCounts !== null && prevCounts[i] !== b.count;
      const col = document.createElement("div");
      col.className =
        "chart-col" + (i === todayIdx ? " is-today" : "") + (changed ? " chart-col--changed" : "");
      col.style.flex = `0 0 ${colWidth}px`;
      col.style.width = `${colWidth}px`;

      const value = document.createElement("span");
      value.className = "chart-value";
      value.textContent = dense ? "" : b.count > 0 ? String(b.count) : "";

      const bar = document.createElement("div");
      bar.className = "chart-bar" + (b.count === 0 ? " chart-bar--zero" : "") + (b.kind === "reviewed" ? " chart-bar--reviewed" : "");
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
        label.textContent = rangeKey === 30 ? WEEKDAY_SINGLE[b.date.getDay()] : WEEKDAY_SHORT[b.date.getDay()];
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
    const cfg = RANGE_CONFIG[statsRangeDays] || { visible: statsRangeDays, total: statsRangeDays };
    // Fenêtre d'historique (fiches révisées, vers la gauche) de la même
    // ampleur que la fenêtre future (fiches à revoir, vers la droite) —
    // item 9 : histogramme fusionné.
    const pastDays = cfg.total;
    renderHistogramInto(
      dueChartEl,
      chartEmptyEl,
      el("chart-wrap"),
      pool,
      statsRangeDays,
      CHART_MAX_BAR_PX,
      undefined,
      false,
      false,
      pastDays
    );
    // Cale "aujourd'hui" à l'extrémité GAUCHE de la zone visible par défaut
    // (item 9) : l'historique des fiches révisées reste hors champ tant
    // qu'on ne fait pas défiler volontairement vers la gauche.
    requestAnimationFrame(() => {
      const todayCol = dueChartEl.querySelector(".chart-col.is-today");
      const wrap = el("chart-wrap");
      if (todayCol && wrap) wrap.scrollLeft = todayCol.offsetLeft;
    });
  }

  /** Tape sur l'histogramme de la page Stats : passe à l'échelle
   *  supérieure (boucle) — item 9 : plus de menu déroulant séparé, tout
   *  se règle au tap, comme sur le mini graphique de la page Réviser. Sans
   *  "1 an" (item 8, voir STATS_CHART_STEPS). */
  function cycleStatsChartRange() {
    const idx = STATS_CHART_STEPS.indexOf(statsRangeDays);
    statsRangeDays = STATS_CHART_STEPS[(idx + 1) % STATS_CHART_STEPS.length];
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
    renderStatsScaleSelect();
    // 6a : toujours toutes boîtes confondues, indépendant du sélecteur
    // de boîte ci-dessous (qui ne pilote que ce qui suit les flammes).
    const allCards = cards.filter((c) => !c.deleted);
    statTotal.textContent = String(allCards.length);
    if (statReviewedToday) statReviewedToday.textContent = String(reviewedTodayCount(allCards));
    renderDueChart();
    renderCreatedChart();
    renderRatingsChart();
    renderRatingsHistoryChart();
    renderStreak();
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

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:var(--svg-chart-bg-color, var(--desk));border-radius:8px;">`;
    svg += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="rgba(31,41,55,0.3)" stroke-width="1"/>`;
    ratings.forEach((r, i) => {
      const v = counts[r];
      const h = (v / yMax) * plotH;
      const x = padL + gap * i + (gap - barW) / 2;
      const y = H - padB - h;
      svg += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(1, h)}" rx="4" fill="${ALGO_CHART_COLORS[r]}"/>`;
      svg += `<text x="${x + barW / 2}" y="${y - 5}" font-size="10" fill="${ALGO_CHART_COLORS[r]}" text-anchor="middle" font-family="var(--font-mono)">${v}</text>`;
      svg += `<text x="${x + barW / 2}" y="${H - padB + 14}" font-size="9" fill="var(--chart-label-color, #6b7280)" text-anchor="middle">${ALGO_CHART_RATING_LABELS[r]}</text>`;
    });
    svg += `</svg>`;
    wrap.innerHTML = svg;
  }

  let ratingsPeriod = "byday";

  /** Calcule numBuckets tranches de bucketDays jours chacune, la dernière
   *  (index numBuckets-1) correspondant à AUJOURD'HUI — items 10/11 :
   *  remplace les anciennes options "semaine dernière"/"mois dernier" par
   *  des vues défilables (par jour/semaine/mois) sur une vingtaine de
   *  tranches, plutôt qu'une fenêtre fixe. */
  function computeScrollableBuckets(entries, numBuckets, bucketDays) {
    const today = startOfDay(new Date());
    const end = new Date(today);
    end.setDate(end.getDate() + 1); // exclusive
    const bucketMs = bucketDays * 86400000;
    const rangeStart = new Date(end.getTime() - numBuckets * bucketMs);
    const buckets = Array.from({ length: numBuckets }, () => ({ again: 0, hard: 0, good: 0, easy: 0 }));
    entries.forEach((e) => {
      const t = new Date(e.at).getTime();
      if (t < rangeStart.getTime() || t >= end.getTime()) return;
      let idx = Math.floor((t - rangeStart.getTime()) / bucketMs);
      if (idx >= numBuckets) idx = numBuckets - 1;
      if (idx < 0) idx = 0;
      if (buckets[idx][e.rating] !== undefined) buckets[idx][e.rating] += 1;
    });
    return { buckets, rangeStart };
  }

  function scrollableBucketLabel(periodKind, date) {
    if (periodKind === "byday") return WEEKDAY_SHORT[date.getDay()];
    if (periodKind === "byweek") return formatShortDateLabel(date);
    return MONTH_SHORT[date.getMonth()];
  }

  function renderRatingsChart() {
    const wrap = el("ratings-chart-wrap");
    if (!wrap) return;
    const scoped = ratingLogInScope();
    if (ratingsPeriod === "today" || ratingsPeriod === "yesterday") {
      const filtered = filterEntriesByPeriod(scoped, ratingsPeriod);
      renderRatingsSimpleChart(wrap, filtered, ["again", "hard", "good", "easy"]);
      return;
    }
    const bucketDaysMap = { byday: 1, byweek: 7, bymonth: 30 };
    const bucketDays = bucketDaysMap[ratingsPeriod] || 1;
    const NUM_BUCKETS = 20;
    const { buckets, rangeStart } = computeScrollableBuckets(scoped, NUM_BUCKETS, bucketDays);
    renderRatingsScrollableChart(wrap, buckets, rangeStart, bucketDays, ratingsPeriod);
  }

  /** Vue défilable (items 10/11) : "aujourd'hui" toujours visible sans
   *  défiler (dernière tranche, à droite), on remonte dans le temps en
   *  faisant défiler vers la gauche — largeur FIXE par tranche (pas de
   *  redimensionnement à la largeur de l'écran) pour que le défilement ait
   *  un sens. */
  function renderRatingsScrollableChart(wrap, buckets, rangeStart, bucketDays, periodKind) {
    const ratings = ["again", "hard", "good", "easy"];
    const numBuckets = buckets.length;
    const legend = ratings
      .map((r) => `<span class="algo-chart-legend-item"><span class="algo-chart-legend-dot" style="background:${ALGO_CHART_COLORS[r]}"></span>${ALGO_CHART_RATING_LABELS[r]}</span>`)
      .join("");
    const anyData = buckets.some((b) => ratings.some((r) => b[r] > 0));
    if (!anyData) {
      wrap.innerHTML = `<div class="algo-chart-legend">${legend}</div><p class="field-hint algo-chart-empty">Aucune note enregistrée sur cette période.</p>`;
      return;
    }
    const max = Math.max(1, ...buckets.flatMap((b) => ratings.map((r) => b[r])));
    const yMax = Math.max(4, Math.ceil(max * 1.15));
    const BUCKET_W = 46;
    const padL = 22, padR = 8, padT = 10, padB = 20;
    const H = 190;
    const plotH = H - padT - padB;
    const W = padL + padR + numBuckets * BUCKET_W;
    const barW = (BUCKET_W * 0.7) / ratings.length;
    const bucketMs = bucketDays * 86400000;

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:${W}px;height:auto;background:var(--svg-chart-bg-color, var(--desk));border-radius:8px;display:block;">`;
    svg += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="rgba(31,41,55,0.3)" stroke-width="1"/>`;
    for (let i = 0; i < numBuckets; i++) {
      const bucketX = padL + i * BUCKET_W;
      const bucketDate = new Date(rangeStart.getTime() + i * bucketMs);
      ratings.forEach((r, ri) => {
        const v = buckets[i][r];
        const h = (v / yMax) * plotH;
        const x = bucketX + (BUCKET_W - barW * ratings.length) / 2 + barW * ri;
        const y = H - padB - h;
        svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, barW - 1).toFixed(1)}" height="${Math.max(v > 0 ? 1 : 0, h).toFixed(1)}" rx="1.5" fill="${ALGO_CHART_COLORS[r]}"/>`;
      });
      const isToday = i === numBuckets - 1;
      const label = isToday ? "Auj" : scrollableBucketLabel(periodKind, bucketDate);
      svg += `<text x="${(bucketX + BUCKET_W / 2).toFixed(1)}" y="${H - padB + 11}" font-size="7" fill="${isToday ? "var(--chart-today-label-color, var(--ink))" : "var(--chart-label-color, #6b7280)"}" text-anchor="middle" font-weight="${isToday ? "700" : "400"}">${label}</text>`;
    }
    svg += `</svg>`;

    wrap.innerHTML = `<div class="algo-chart-legend">${legend}</div><div class="ratings-scroll-wrap">${svg}</div>`;
    const scrollWrap = wrap.querySelector(".ratings-scroll-wrap");
    if (scrollWrap) scrollWrap.scrollLeft = scrollWrap.scrollWidth;
  }

  /** Version à une seule couleur du graphique défilable ci-dessus (item
   *  6e — "Fiches créées"), un seul total par tranche plutôt que 4 notes
   *  empilées. */
  function renderSingleSeriesScrollableChart(wrap, values, rangeStart, bucketDays, periodKind, color, emptyMsg) {
    const numBuckets = values.length;
    const anyData = values.some((v) => v > 0);
    if (!anyData) {
      wrap.innerHTML = `<p class="field-hint algo-chart-empty">${emptyMsg}</p>`;
      return;
    }
    const max = Math.max(1, ...values);
    const yMax = Math.max(4, Math.ceil(max * 1.15));
    const BUCKET_W = 46;
    const padL = 22, padR = 8, padT = 10, padB = 20;
    const H = 160;
    const plotH = H - padT - padB;
    const W = padL + padR + numBuckets * BUCKET_W;
    const barW = BUCKET_W * 0.55;
    const bucketMs = bucketDays * 86400000;

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:${W}px;height:auto;background:var(--svg-chart-bg-color, var(--desk));border-radius:8px;display:block;">`;
    svg += `<line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="rgba(31,41,55,0.3)" stroke-width="1"/>`;
    for (let i = 0; i < numBuckets; i++) {
      const bucketX = padL + i * BUCKET_W;
      const bucketDate = new Date(rangeStart.getTime() + i * bucketMs);
      const v = values[i];
      const h = (v / yMax) * plotH;
      const x = bucketX + (BUCKET_W - barW) / 2;
      const y = H - padB - h;
      svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(v > 0 ? 1 : 0, h).toFixed(1)}" rx="1.5" fill="${color}"/>`;
      if (v > 0) svg += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" font-size="7" fill="var(--chart-value-color, #6b7280)" text-anchor="middle">${v}</text>`;
      const isToday = i === numBuckets - 1;
      const label = isToday ? "Auj" : scrollableBucketLabel(periodKind, bucketDate);
      svg += `<text x="${(bucketX + BUCKET_W / 2).toFixed(1)}" y="${H - padB + 11}" font-size="7" fill="${isToday ? "var(--chart-today-label-color, var(--ink))" : "var(--chart-label-color, #6b7280)"}" text-anchor="middle" font-weight="${isToday ? "700" : "400"}">${label}</text>`;
    }
    svg += `</svg>`;
    wrap.innerHTML = `<div class="ratings-scroll-wrap">${svg}</div>`;
    const scrollWrap2 = wrap.querySelector(".ratings-scroll-wrap");
    if (scrollWrap2) scrollWrap2.scrollLeft = scrollWrap2.scrollWidth;
  }

  /** Histogramme "Fiches créées" (item 6e) : même principe défilable que
   *  les graphiques de notes juste en dessous, piloté par la même échelle
   *  partagée (byday/byweek/bymonth) et le même sélecteur de boîte. */
  function renderCreatedChart() {
    const wrap = el("created-chart-wrap");
    if (!wrap) return;
    const bucketDaysMap = { byday: 1, byweek: 7, bymonth: 30 };
    const bucketDays = bucketDaysMap[ratingsPeriod] || 1;
    const NUM_BUCKETS = 20;
    const today = startOfDay(new Date());
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    const bucketMs = bucketDays * 86400000;
    const rangeStart = new Date(end.getTime() - NUM_BUCKETS * bucketMs);
    const scopeIds = statsScopeSubjectIds();
    const values = Array.from({ length: NUM_BUCKETS }, () => 0);
    cards.forEach((c) => {
      if (c.deleted) return;
      if (scopeIds !== null && !scopeIds.has(c.subject)) return;
      const t = new Date(c.createdAt).getTime();
      if (t < rangeStart.getTime() || t >= end.getTime()) return;
      let idx = Math.floor((t - rangeStart.getTime()) / bucketMs);
      if (idx >= NUM_BUCKETS) idx = NUM_BUCKETS - 1;
      if (idx < 0) idx = 0;
      values[idx] += 1;
    });
    renderSingleSeriesScrollableChart(wrap, values, rangeStart, bucketDays, ratingsPeriod, "var(--due-bar-color, var(--teal))", "Aucune fiche créée sur cette période.");
  }

  /* ---------------------------------------------------------
     Évolution des notes dans le temps (item 6) : histogramme à barres
     empilées en pourcentage, avec des cases à cocher pour choisir quelles
     notes combiner dans une même barre (ex. cocher seulement 🙂 et 😎 pour
     voir leur part combinée plutôt que les 4 séparément).
  --------------------------------------------------------- */
  /* ---------------------------------------------------------
     Évolution des notes dans le temps : histogramme à barres empilées en
     pourcentage. La fusion par cases à cocher a été retirée (repli plus
     simple : toujours les 4 notes séparées) au profit d'un pourcentage
     affiché directement dans chaque segment.
  --------------------------------------------------------- */
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
    const ratings = ["again", "hard", "good", "easy"];
    const legend = ratings
      .map(
        (r) => `<span class="algo-chart-legend-item"><span class="algo-chart-legend-dot" style="background:${ALGO_CHART_COLORS[r]}"></span>${ALGO_CHART_RATING_LABELS[r]}</span>`
      )
      .join("");

    // Items 10/11 : mêmes échelles que le graphique juste au-dessus —
    // aujourd'hui/hier restent un simple découpage en 10 tranches sur la
    // période ; par jour/semaine/mois deviennent des vues défilables sur
    // 20 tranches, aujourd'hui toujours visible sans défiler.
    let buckets, rangeStart, bucketMs, numBuckets, dateForBucket;
    if (ratingsPeriod === "today" || ratingsPeriod === "yesterday") {
      const { start, end } = periodToRange(ratingsPeriod);
      const filtered = filterEntriesByPeriod(scoped, ratingsPeriod);
      numBuckets = 10;
      const built = bucketEntriesByPeriod(filtered, start, end, numBuckets);
      buckets = built;
      rangeStart = start;
      bucketMs = (end.getTime() - start.getTime()) / numBuckets;
      dateForBucket = (i) => new Date(rangeStart.getTime() + bucketMs * i);
    } else {
      const bucketDaysMap = { byday: 1, byweek: 7, bymonth: 30 };
      const bucketDays = bucketDaysMap[ratingsPeriod] || 1;
      numBuckets = 20;
      const result = computeScrollableBuckets(scoped, numBuckets, bucketDays);
      buckets = result.buckets;
      rangeStart = result.rangeStart;
      bucketMs = bucketDays * 86400000;
      dateForBucket = (i) => new Date(rangeStart.getTime() + bucketMs * i);
    }

    const anyData = buckets.some((b) => ratings.some((r) => b[r] > 0));
    if (!anyData) {
      wrap.innerHTML = `<div class="algo-chart-legend">${legend}</div><p class="field-hint algo-chart-empty">Aucune note enregistrée sur cette période.</p>`;
      return;
    }

    const scrollable = ratingsPeriod !== "today" && ratingsPeriod !== "yesterday";
    const BUCKET_W = scrollable ? 46 : (320 - 28 - 8) / numBuckets;
    const padL = scrollable ? 22 : 28, padR = 8, padT = 10, padB = scrollable ? 20 : 24;
    const H = scrollable ? 190 : 210;
    const plotH = H - padT - padB;
    const W = scrollable ? padL + padR + numBuckets * BUCKET_W : 320;
    const barW = BUCKET_W * (scrollable ? 0.7 : 0.7);

    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:${scrollable ? W + "px" : "100%"};height:auto;background:var(--svg-chart-bg-color, var(--desk));border-radius:8px;${scrollable ? "display:block;" : ""}">`;
    if (!scrollable) {
      [0, 50, 100].forEach((pct) => {
        const y = padT + (1 - pct / 100) * plotH;
        svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(31,41,55,0.1)" stroke-width="1"/>`;
        svg += `<text x="${padL - 4}" y="${y + 3}" font-size="7" fill="var(--chart-value-color, #6b7280)" text-anchor="end">${pct}%</text>`;
      });
    }

    buckets.forEach((b, i) => {
      const x = padL + BUCKET_W * i + (BUCKET_W - barW) / 2;
      const total = ratings.reduce((s, r) => s + b[r], 0);
      const bucketDate = dateForBucket(i);
      const isToday = scrollable && i === numBuckets - 1;
      if (scrollable) {
        const label = isToday ? "Auj" : scrollableBucketLabel(ratingsPeriod, bucketDate);
        svg += `<text x="${(x + barW / 2).toFixed(1)}" y="${H - padB + 11}" font-size="7" fill="${isToday ? "var(--chart-today-label-color, var(--ink))" : "var(--chart-label-color, #6b7280)"}" text-anchor="middle" font-weight="${isToday ? "700" : "400"}">${label}</text>`;
      } else if (i === 0 || i === numBuckets - 1 || i === Math.floor(numBuckets / 2)) {
        svg += `<text x="${(x + barW / 2).toFixed(1)}" y="${H - padB + 13}" font-size="7" fill="var(--chart-label-color, #6b7280)" text-anchor="middle">${formatShortDateLabel(bucketDate)}</text>`;
      }
      if (total === 0) return;
      let yCursor = padT + plotH;
      ratings.forEach((r) => {
        const count = b[r];
        if (count === 0) return;
        const share = count / total;
        const segH = share * plotH;
        const y = yCursor - segH;
        svg += `<rect x="${x}" y="${y}" width="${barW}" height="${segH}" fill="${ALGO_CHART_COLORS[r]}"/>`;
        // Pourcentage affiché dans le segment — seulement s'il y a assez de
        // place pour rester lisible.
        const pctLabel = Math.round(share * 100);
        if (segH >= 10) {
          svg += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y + segH / 2 + 2.5).toFixed(1)}" font-size="6.5" fill="var(--desk)" text-anchor="middle" font-weight="700">${pctLabel}%</text>`;
        }
        yCursor = y;
      });
    });
    svg += `</svg>`;

    const axisLabel = `<p class="algo-chart-axis-x">Temps, du début à la fin de la période choisie ci-dessus</p>`;
    if (scrollable) {
      wrap.innerHTML = `<div class="algo-chart-legend">${legend}</div><div class="ratings-scroll-wrap">${svg}</div>${axisLabel}`;
      const scrollWrap = wrap.querySelector(".ratings-scroll-wrap");
      if (scrollWrap) scrollWrap.scrollLeft = scrollWrap.scrollWidth;
    } else {
      wrap.innerHTML = `<div class="algo-chart-legend">${legend}</div>${svg}${axisLabel}`;
    }
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
    // Toujours toutes boîtes confondues (item : indépendant des choix de
    // boîte/période plus bas sur la page).
    const { days, hotDays, streak } = computeStreakData(null);
    summaryEl.innerHTML = `🔥 Jours d'utilisation : <span class="streak-number-value">${streak}</span> jour${streak > 1 ? "s" : ""} d'affilée`;
    const todayIdx = days.length - 1;
    // "Auj" sur la colonne d'aujourd'hui (item 10), une colonne par jour
    // qui se partagent toute la largeur disponible (voir CSS) plutôt
    // qu'une largeur fixe qui débordait et forçait à défiler.
    const cells = days
      .map(
        (d, i) =>
          `<div class="streak-day-col">
            <div class="streak-day${hotDays[i] ? " is-hot" : ""}${i === todayIdx ? " is-today" : ""}" title="${formatShortDateLabel(d)}"></div>
            <span class="streak-day-label">${i === todayIdx ? "Auj" : ""}</span>
          </div>`
      )
      .join("");
    streakChartEl.innerHTML = `<div class="streak-row">${cells}</div>`;
  }

  /* ---------------------------------------------------------
     Échelle partagée (byday/byweek/bymonth) pilotant le graphique
     "à revoir/révisées", "fiches créées", "notes données" et
     "évolution des notes" (item 6c) — même bouton/menu que le sélecteur
     de boîte juste au-dessus (item 6), plutôt qu'un menu déroulant natif.
  --------------------------------------------------------- */
  const STATS_SCALE_TITLES = { byday: "Par jour", byweek: "Par semaine", bymonth: "Par mois" };
  function renderStatsScaleSelect() {
    const btn = el("stats-scale-select-btn");
    if (btn) btn.textContent = STATS_SCALE_TITLES[ratingsPeriod] || "Par jour";
  }
  function openStatsScaleChoiceMenu() {
    const menu = el("stats-scale-choice-menu");
    if (menu) menu.hidden = false;
  }
  function closeStatsScaleChoiceMenu() {
    const menu = el("stats-scale-choice-menu");
    if (menu) menu.hidden = true;
  }
  const statsScaleSelectBtn = el("stats-scale-select-btn");
  if (statsScaleSelectBtn) {
    statsScaleSelectBtn.addEventListener("click", () => openStatsScaleChoiceMenu());
  }
  document.querySelectorAll('#stats-scale-choice-menu [data-scale]').forEach((btn) => {
    btn.addEventListener("click", () => {
      closeStatsScaleChoiceMenu();
      ratingsPeriod = btn.dataset.scale;
      renderStatsScaleSelect();
      renderDueChart();
      renderCreatedChart();
      renderRatingsChart();
      renderRatingsHistoryChart();
    });
  });
  const statsScaleChoiceCancelBtn = el("stats-scale-choice-cancel");
  if (statsScaleChoiceCancelBtn) statsScaleChoiceCancelBtn.addEventListener("click", closeStatsScaleChoiceMenu);
  document.addEventListener("pointerdown", (e) => {
    const menu = el("stats-scale-choice-menu");
    if (!menu || menu.hidden) return;
    if (menu.contains(e.target) || e.target === statsScaleSelectBtn) return;
    closeStatsScaleChoiceMenu();
  });

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

  /* ---------------------------------------------------------
     Mini histogramme de la page Réviser (boîte en cours)
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

  /** Empêche un rendu EXTÉRIEUR (ex. mise à jour reçue en temps réel d'un
   *  autre appareil, ou tout autre appel à renderAll() qui passerait par
   *  là) d'interrompre une vague en cours (bug corrigé — item 1 : c'était
   *  la cause la plus probable des animations qui s'arrêtaient net ou ne
   *  se voyaient pas du tout, y compris sur de courtes durées : n'importe
   *  quel autre rendu survenant PENDANT l'animation remplaçait les
   *  éléments DOM sur lesquels la vague était en train de jouer, la
   *  coupant silencieusement). Les rendus déclenchés par la vague
   *  ELLE-MÊME (extension temporaire, retour à la normale) passent outre
   *  via reviewWaveInternalCall. */
  let reviewWaveInProgress = false;
  let reviewWaveInternalCall = false;

  function renderReviewChart(minTotalDays) {
    if (!reviewChartEl) return;
    if (reviewWaveInProgress && !reviewWaveInternalCall) return;
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
      undefined,
      false,
      true, // suppressChangeFlash (item 4) : la vague gère tout l'effet visuel
      undefined,
      minTotalDays
    );
  }

  /** Anime en vague, de gauche à droite, toutes les colonnes entre
   *  `fromIdx` (aujourd'hui) et `toIdx` (nouvelle date de la fiche notée) —
   *  item 4/9 : chaque barre intermédiaire s'allume brièvement l'une après
   *  l'autre (léger décalage croissant), et la barre CIBLE (nouvelle date)
   *  ne s'allume qu'en DERNIER, une fois la vague arrivée jusqu'à elle —
   *  puis reste allumée et haute environ 1,5 seconde avant de revenir à la
   *  normale. Si la cible dépasse le nombre de jours actuellement RENDUS
   *  (fréquent avec un mode à croissance rapide sur l'échelle "15 jours"
   *  par défaut : quelques bonnes réponses suffisent à dépasser 60 jours),
   *  le graphique est d'abord redessiné avec assez de colonnes pour
   *  l'inclure vraiment — sans ça, la vague animait la dernière colonne
   *  visible, une position qui n'avait rien à voir avec la vraie nouvelle
   *  échéance de la fiche. Revient à l'échelle normale une fois terminé. */
  /** Attend qu'un défilement fluide (smooth) ait eu le temps de se
   *  terminer visuellement avant de continuer — plus simple et plus fiable
   *  d'un navigateur à l'autre qu'un événement "scrollend" (pas encore
   *  supporté partout). */
  function waitForSmoothScroll(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Anime en vague, de gauche à droite, toutes les colonnes entre
   *  `fromIdx` (aujourd'hui) et `toIdx` (nouvelle date de la fiche notée) —
   *  chaque barre intermédiaire s'allume brièvement l'une après l'autre
   *  (léger décalage croissant), et la barre CIBLE (nouvelle date) ne
   *  s'allume qu'en DERNIER, une fois la vague arrivée jusqu'à elle — puis
   *  reste allumée et haute environ 1,5 seconde avant de revenir à la
   *  normale.
   *
   *  Réécriture complète (bug corrigé — l'animation restait imprévisible :
   *  vitesse qui variait, pause parfois absente, et surtout un vrai
   *  problème quand un défilement était nécessaire, la vague démarrant
   *  AVANT que le défilement (asynchrone, ~300-400ms) n'ait fini, ce qui
   *  faisait tout jouer en même temps de façon chaotique. Désormais tout
   *  se déroule dans un ordre strict et prévisible :
   *  1. Si besoin, on redessine le graphique en élargi (fiche qui dépasse
   *     la fenêtre actuellement affichée).
   *  2. Si besoin, on défile jusqu'à la position finale et on ATTEND que ce
   *     défilement soit terminé avant de passer à la suite (plus jamais en
   *     même temps que la vague).
   *  3. La vague se joue, avec un minutage entièrement fixé À L'AVANCE
   *     (calculé une seule fois, jamais recalculé en cours de route).
   *  4. Un SEUL minuteur global (pas un par barre) nettoie tout et revient
   *     à la position de départ, calé sur la durée totale exacte —
   *     indépendant des événements CSS "animationend", qui pouvaient être
   *     manqués si quoi que ce soit d'autre redessinait le graphique pile
   *     pendant l'animation. */
  async function triggerReviewChartWave(fromIdx, toIdx) {
    if (!reviewChartEl) return;
    reviewWaveToken += 1;
    const myToken = reviewWaveToken;
    reviewWaveInProgress = true;

    const bail = () => {
      // Périmé (une vague plus récente a pris le relais) OU rien à animer :
      // on relâche le verrou pour ne jamais bloquer les rendus suivants.
      if (myToken === reviewWaveToken) reviewWaveInProgress = false;
    };

    let cols = reviewChartEl.querySelectorAll(".chart-col");
    if (cols.length === 0 || toIdx > cols.length - 1) {
      reviewWaveInternalCall = true;
      renderReviewChart(toIdx + 3);
      reviewWaveInternalCall = false;
      cols = reviewChartEl.querySelectorAll(".chart-col");
    }
    if (cols.length === 0) {
      bail();
      return;
    }

    const lo = Math.max(0, Math.min(fromIdx, toIdx));
    const hi = Math.min(cols.length - 1, Math.max(fromIdx, toIdx));
    const wasExtended = cols.length > (RANGE_CONFIG[reviewChartRangeDays] || {}).total;

    // Étape 1/2 : défilement d'ABORD, jusqu'au bout, avant de commencer
    // quoi que ce soit d'autre.
    const scroller = reviewChartWrapEl;
    const originalScrollLeft = scroller ? scroller.scrollLeft : 0;
    let scrolledAway = false;
    if (scroller) {
      const targetCol = cols[hi];
      const targetLeft = targetCol.offsetLeft;
      const targetRight = targetLeft + targetCol.offsetWidth;
      const viewLeft = scroller.scrollLeft;
      const viewRight = viewLeft + scroller.clientWidth;
      if (targetRight > viewRight || targetLeft < viewLeft) {
        scrolledAway = true;
        const dest = Math.max(0, targetLeft - scroller.clientWidth * 0.7);
        scroller.scrollTo({ left: dest, behavior: "smooth" });
        await waitForSmoothScroll(420);
      }
    }
    // Une vague plus récente a démarré pendant qu'on attendait le
    // défilement (nouvelle notation très rapprochée) : on s'efface,
    // silencieusement, sans toucher à rien.
    if (myToken !== reviewWaveToken) return;

    // Étape 3 : minutage entièrement fixé à l'avance, une seule fois.
    const span = hi - lo;
    const MAX_SWEEP_MS = 650;
    const STEP_MS = span > 0 ? Math.min(55, MAX_SWEEP_MS / span) : 55;
    const HOLD_MS = 1800;
    let maxTotalMs = 0;
    for (let i = lo; i <= hi; i++) {
      const bar = cols[i].querySelector(".chart-bar");
      if (!bar) continue;
      const isTarget = i === hi;
      const delay = Math.round((i - lo) * STEP_MS);
      const animMs = isTarget ? HOLD_MS : 450;
      maxTotalMs = Math.max(maxTotalMs, delay + animMs);
      bar.classList.remove("chart-bar-wave", "chart-bar-wave-hold");
      void bar.offsetWidth;
      bar.style.animationDelay = `${delay}ms`;
      bar.classList.add(isTarget ? "chart-bar-wave-hold" : "chart-bar-wave");
    }

    // Étape 4 : un seul minuteur global, calé sur la durée totale exacte —
    // ni plus tôt (couperait la pause), ni plus tard (délai visible avant
    // le retour à la normale). Relâche aussi le verrou anti-interruption :
    // les rendus externes reçus PENDANT l'animation (et donc ignorés)
    // pourront enfin s'appliquer.
    setTimeout(() => {
      if (myToken !== reviewWaveToken) return;
      cols.forEach((col) => {
        const bar = col.querySelector(".chart-bar");
        if (bar) {
          bar.classList.remove("chart-bar-wave", "chart-bar-wave-hold");
          bar.style.animationDelay = "";
        }
      });
      reviewWaveInternalCall = true;
      if (wasExtended) {
        renderReviewChart();
      } else if (scrolledAway && scroller) {
        scroller.scrollTo({ left: originalScrollLeft, behavior: "smooth" });
      }
      reviewWaveInternalCall = false;
      reviewWaveInProgress = false;
      // Un rendu externe a pu être ignoré pendant l'animation (ex. fiche
      // ajoutée/synchronisée par un autre appareil) : on rattrape avec un
      // rendu normal maintenant que la voie est libre.
      renderReviewChart();
    }, maxTotalMs + 60);
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
    scheduleDevSettingsPush();
  }

  function loadBonusAgainMode() {
    const raw = localStorage.getItem(BONUS_AGAIN_MODE_KEY);
    bonusAgainMode = raw === "increment" ? "increment" : DEFAULT_BONUS_AGAIN_MODE;
  }

  function saveBonusAgainMode() {
    localStorage.setItem(BONUS_AGAIN_MODE_KEY, bonusAgainMode);
    touchAppSettingsTimestamp();
    scheduleDevSettingsPush();
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
    scheduleDevSettingsPush();
  }

  const SHOW_RATING_DAYS_KEY = "fiches_show_rating_days";
  function loadShowRatingDays() {
    const raw = localStorage.getItem(SHOW_RATING_DAYS_KEY);
    return raw === null ? true : raw === "true";
  }
  function saveShowRatingDays(value) {
    localStorage.setItem(SHOW_RATING_DAYS_KEY, String(value));
    scheduleDevSettingsPush();
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

  // Histogramme de la page Réviser (item 1c) : masqué par défaut, un
  // réglage l'affiche si on le souhaite.
  const SHOW_REVIEW_CHART_KEY = "fiches_show_review_chart";
  function loadShowReviewChart() {
    return localStorage.getItem(SHOW_REVIEW_CHART_KEY) === "true";
  }
  function saveShowReviewChart(value) {
    localStorage.setItem(SHOW_REVIEW_CHART_KEY, String(value));
    scheduleDevSettingsPush();
  }
  function applyShowReviewChart() {
    const section = el("review-chart-section");
    if (section) section.hidden = !loadShowReviewChart();
  }
  const settingShowReviewChartEl = el("setting-show-review-chart");
  if (settingShowReviewChartEl) {
    settingShowReviewChartEl.addEventListener("change", () => {
      saveShowReviewChart(settingShowReviewChartEl.checked);
      applyShowReviewChart();
    });
  }

  // Taille de police des fiches (item 2) : réglable depuis Réglages.
  const CARD_FONT_SIZE_KEY = "fiches_card_font_size";
  const DEFAULT_CARD_FONT_SIZE = 19;
  function loadCardFontSize() {
    const raw = Number(localStorage.getItem(CARD_FONT_SIZE_KEY));
    return raw > 0 ? raw : DEFAULT_CARD_FONT_SIZE;
  }
  function saveCardFontSize(value) {
    localStorage.setItem(CARD_FONT_SIZE_KEY, String(value));
    scheduleDevSettingsPush();
  }
  function applyCardFontSize() {
    document.documentElement.style.setProperty("--card-font-size", `${loadCardFontSize()}px`);
  }
  const settingCardFontSizeEl = el("setting-card-font-size");
  if (settingCardFontSizeEl) {
    settingCardFontSizeEl.addEventListener("change", () => {
      const v = Number(settingCardFontSizeEl.value) || DEFAULT_CARD_FONT_SIZE;
      saveCardFontSize(v);
      applyCardFontSize();
    });
  }

  // Item 5 (dernier lot) : couleur unie de la pastille "à revoir",
  // réglable dans Réglages — remplace l'ancien dégradé rouge → vert.
  const DUE_PILL_COLOR_KEY = "fiches_due_pill_color";
  const DEFAULT_DUE_PILL_COLOR = "#c25b4a";
  function loadDuePillColor() {
    return localStorage.getItem(DUE_PILL_COLOR_KEY) || DEFAULT_DUE_PILL_COLOR;
  }
  function saveDuePillColor(value) {
    localStorage.setItem(DUE_PILL_COLOR_KEY, value);
    scheduleDevSettingsPush();
  }
  const settingDuePillColorEl = el("setting-due-pill-color");
  if (settingDuePillColorEl) {
    settingDuePillColorEl.value = loadDuePillColor();
    settingDuePillColorEl.addEventListener("input", () => {
      saveDuePillColor(settingDuePillColorEl.value);
      renderDuePill();
    });
  }

  /* ---------------------------------------------------------
     Item 3 (dernier lot) : plus d'auto-défilement — 3 pictos en haut de la
     page choisissent MANUELLEMENT ce qui s'affiche (nombre / mode /
     jauge), synchronisé sur toutes les lignes à la fois via un attribut
     sur <body>, lu par CSS partout en même temps.
  --------------------------------------------------------- */
  const ORG_DISPLAY_KEY = "fiches_org_display_mode";
  const ORG_DISPLAY_MODES = ["count", "mode", "gauge"];
  function loadOrgDisplayMode() {
    const raw = localStorage.getItem(ORG_DISPLAY_KEY);
    return ORG_DISPLAY_MODES.includes(raw) ? raw : "count";
  }
  function setOrgDisplayMode(mode) {
    if (!ORG_DISPLAY_MODES.includes(mode)) return;
    localStorage.setItem(ORG_DISPLAY_KEY, mode);
    document.body.dataset.orgCarouselSlot = String(ORG_DISPLAY_MODES.indexOf(mode));
    document.querySelectorAll(".org-display-toggle-btn").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.orgDisplay === mode);
    });
    scheduleDevSettingsPush();
  }
  document.querySelectorAll(".org-display-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => setOrgDisplayMode(btn.dataset.orgDisplay));
  });
  setOrgDisplayMode(loadOrgDisplayMode());

  function renderSettingsView() {
    if (settingBonusHardEl) settingBonusHardEl.value = bonusDaysSettings.hard;
    if (settingBonusGoodEl) settingBonusGoodEl.value = bonusDaysSettings.good;
    if (settingBonusEasyEl) settingBonusEasyEl.value = bonusDaysSettings.easy;
    if (settingBonusAgainModeEl) settingBonusAgainModeEl.value = bonusAgainMode;
    if (settingHibernateDaysEl) settingHibernateDaysEl.value = hibernateDays;
    if (settingShowRatingDaysEl) settingShowRatingDaysEl.checked = loadShowRatingDays();
    if (settingShowReviewChartEl) settingShowReviewChartEl.checked = loadShowReviewChart();
    if (settingCardFontSizeEl) settingCardFontSizeEl.value = loadCardFontSize();
    if (settingBodyLogoShadowEl) settingBodyLogoShadowEl.checked = loadDevSettings().bodyLogo.shadow;
    if (settingHomeLogoShadowEl) settingHomeLogoShadowEl.checked = loadDevSettings().homeLogo.shadow;
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
      settings.navIcons = { ...DEFAULT_NAV_ICONS };
      saveDevSettings(settings);
      applyNavLabels();
      renderDevView();
    });
  }

  /* ---------------------------------------------------------
     Icônes, couleurs des notes/modes, palette de texte (item 2) — étoffe
     le mode développeur avec un maximum de choix d'émoticônes/couleurs.
  --------------------------------------------------------- */
  function saveIconsFromInputs() {
    const settings = loadDevSettings();
    Object.keys(DEFAULT_ICONS).forEach((k) => {
      const input = el(`dev-icon-${k}`);
      if (input && input.value.trim()) settings.icons[k] = input.value.trim();
    });
    saveDevSettings(settings);
    applyIconSettings();
  }
  Object.keys(DEFAULT_ICONS).forEach((k) => {
    const input = el(`dev-icon-${k}`);
    if (input) input.addEventListener("change", saveIconsFromInputs);
  });
  const devIconsResetBtn = el("dev-icons-reset");
  if (devIconsResetBtn) {
    devIconsResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.icons = { ...DEFAULT_ICONS };
      saveDevSettings(settings);
      applyIconSettings();
      renderDevView();
    });
  }

  /** Couleurs des notes (item 4 — paires jour/nuit, via le même mécanisme
   *  générique que fonds/textes/jauges). */
  const RATING_COLORS_TITLES = { again: "Encore", hard: "Difficile", good: "Bien", easy: "Facile" };
  function renderRatingColorsEditor() {
    renderColorListPicker("dev-rating-colors-list", ["again", "hard", "good", "easy"], RATING_COLORS_TITLES, "ratingColors", applyColorSettings);
  }
  function saveRatingBtnBgFromInputs() {
    const settings = loadDevSettings();
    const dayInput = el("dev-color-rating-btn-bg");
    const nightInput = el("dev-color-rating-btn-bg-night");
    if (dayInput) settings.ratingBtnBgColor = dayInput.value;
    if (nightInput) settings.nightColors.ratingBtnBgColor = nightInput.value;
    saveDevSettings(settings);
    applyColorSettings();
  }
  const ratingBtnBgInputEl = el("dev-color-rating-btn-bg");
  if (ratingBtnBgInputEl) ratingBtnBgInputEl.addEventListener("input", saveRatingBtnBgFromInputs);
  const ratingBtnBgNightInputEl = el("dev-color-rating-btn-bg-night");
  if (ratingBtnBgNightInputEl) ratingBtnBgNightInputEl.addEventListener("input", saveRatingBtnBgFromInputs);
  const devRatingColorsResetBtn = el("dev-rating-colors-reset");
  if (devRatingColorsResetBtn) {
    devRatingColorsResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.ratingColors = { ...DEFAULT_RATING_COLORS };
      settings.ratingBtnBgColor = DEFAULT_RATING_BTN_BG_COLOR;
      settings.nightColors.ratingColors = { ...DEFAULT_RATING_COLORS };
      settings.nightColors.ratingBtnBgColor = DEFAULT_NIGHT_RATING_BTN_BG_COLOR;
      saveDevSettings(settings);
      applyColorSettings();
      renderDevView();
    });
  }

  /** Couleurs des modes d'apprentissage (item 4 — paires jour/nuit). */
  const MODE_COLORS_TITLES = { cool: "Cool", normal: "Normal", renforce: "Renforcé", custom: "Personnalisé" };
  function renderModeColorsEditor() {
    renderColorListPicker("dev-mode-colors-list", ["cool", "normal", "renforce", "custom"], MODE_COLORS_TITLES, "modeColors", applyColorSettings);
  }
  const devModeColorsResetBtn = el("dev-mode-colors-reset");
  if (devModeColorsResetBtn) {
    devModeColorsResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.modeColors = { ...DEFAULT_MODE_COLORS };
      settings.nightColors.modeColors = { ...DEFAULT_MODE_COLORS };
      saveDevSettings(settings);
      applyColorSettings();
      renderDevView();
    });
  }

  /** Couleurs des fonds / des textes (items 2h/2i) — remplace les anciens
   *  blocs "Autres couleurs"/"Textes, histogrammes et fonds de zones". */
  const devBgColorsResetBtn = el("dev-bg-colors-reset");
  if (devBgColorsResetBtn) {
    devBgColorsResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.bgColors = { ...DEFAULT_BG_COLORS };
      saveDevSettings(settings);
      applyColorSettings();
      renderDevView();
    });
  }
  const devTextColorsSetResetBtn = el("dev-text-colors-set-reset");
  if (devTextColorsSetResetBtn) {
    devTextColorsSetResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.textColorsSet = { ...DEFAULT_TEXT_COLORS_SET };
      saveDevSettings(settings);
      applyColorSettings();
      renderDevView();
    });
  }

  const devHomeLayoutResetBtn = el("dev-home-layout-reset");
  if (devHomeLayoutResetBtn) {
    devHomeLayoutResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.homeLayout = JSON.parse(JSON.stringify(DEFAULT_HOME_LAYOUT));
      saveDevSettings(settings);
      applyHomeLayout();
      renderDevView();
    });
  }

  /** Liste éditable de couleurs de texte (item 2) : ajouter/renommer/
   *  changer la couleur/retirer, appliqué en direct à la barre d'outils de
   *  mise en forme des fiches. */
  function renderTextColorsEditor() {
    const wrap = el("dev-text-colors-list");
    if (!wrap) return;
    const colors = loadDevSettings().textColors;
    wrap.innerHTML = colors
      .map(
        (c, i) => `<div class="dev-text-color-row" data-idx="${i}">
          <input type="color" class="dev-text-color-swatch" value="${c.hex}" />
          <input type="text" class="dev-text-color-label" value="${escapeHtml(c.label)}" maxlength="16" />
          <button type="button" class="icon-btn icon-btn--danger dev-text-color-remove">🗑️</button>
        </div>`
      )
      .join("");

    function saveFromRows() {
      const rows = [...wrap.querySelectorAll(".dev-text-color-row")];
      const newColors = rows.map((row) => ({
        hex: row.querySelector(".dev-text-color-swatch").value,
        label: row.querySelector(".dev-text-color-label").value.trim() || "Couleur",
      }));
      const settings = loadDevSettings();
      settings.textColors = newColors;
      saveDevSettings(settings);
      applyTextColorPalette();
    }

    wrap.querySelectorAll(".dev-text-color-swatch, .dev-text-color-label").forEach((input) => {
      input.addEventListener("input", saveFromRows);
    });
    wrap.querySelectorAll(".dev-text-color-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const settings = loadDevSettings();
        const idx = Number(btn.closest(".dev-text-color-row").dataset.idx);
        settings.textColors = settings.textColors.filter((_, i) => i !== idx);
        if (settings.textColors.length === 0) settings.textColors = [{ ...DEFAULT_TEXT_COLORS[0] }];
        saveDevSettings(settings);
        applyTextColorPalette();
        renderTextColorsEditor();
        enhanceColorInputsWithHsl();
      });
    });
  }
  const devTextColorAddBtn = el("dev-text-color-add");
  if (devTextColorAddBtn) {
    devTextColorAddBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.textColors = [...settings.textColors, { label: "Nouvelle", hex: "#888888" }];
      saveDevSettings(settings);
      applyTextColorPalette();
      renderTextColorsEditor();
      enhanceColorInputsWithHsl();
    });
  }
  const devTextColorsResetBtn = el("dev-text-colors-reset");
  if (devTextColorsResetBtn) {
    devTextColorsResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.textColors = DEFAULT_TEXT_COLORS.map((c) => ({ ...c }));
      saveDevSettings(settings);
      applyTextColorPalette();
      renderTextColorsEditor();
      enhanceColorInputsWithHsl();
    });
  }

  /** Éditeur des valeurs "usine" des 3 modes fixes (item 19) : mêmes 12
   *  valeurs discrètes que partout ailleurs (ALGO_K_VALUES/ALGO_M_VALUES),
   *  ici via de simples menus déroulants (page technique, pas besoin de
   *  curseurs tactiles soignés). */
  /** Éditeur des couleurs des modes personnalisés (item 16) : une pastille
   *  par mode réellement créé, à côté de son nom. */
  function renderCustomModeColorsEditor() {
    const wrap = el("dev-custom-mode-colors");
    if (!wrap) return;
    const modes = loadLearningModes();
    const customModes = Object.values(modes).filter((m) => !m.builtin);
    if (customModes.length === 0) {
      wrap.innerHTML = `<p class="field-hint">Aucun mode personnalisé créé pour l'instant.</p>`;
      return;
    }
    wrap.innerHTML = customModes
      .map(
        (m) => `<label class="field settings-bonus-field dev-custom-mode-color-row">
          <span>${escapeHtml(m.name)}</span>
          <input type="color" data-mode-id="${m.id}" class="dev-custom-mode-color-input" value="${getCustomModeColor(m.id)}" />
        </label>`
      )
      .join("");
    wrap.querySelectorAll(".dev-custom-mode-color-input").forEach((input) => {
      input.addEventListener("input", () => {
        setCustomModeColor(input.dataset.modeId, input.value);
        renderSubjectManageList();
        renderSubjectAlgoBadge(currentCard ? currentCard.subject : undefined);
      });
    });
  }

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
    const devSettings = loadDevSettings();
    const ratingBtnBgInput = el("dev-color-rating-btn-bg");
    if (ratingBtnBgInput) ratingBtnBgInput.value = devSettings.ratingBtnBgColor;
    const ratingBtnBgNightInput = el("dev-color-rating-btn-bg-night");
    if (ratingBtnBgNightInput) ratingBtnBgNightInput.value = devSettings.nightColors.ratingBtnBgColor;
    renderRatingColorsEditor();
    renderModeColorsEditor();
    renderRatingIconsEditor();
    renderNavIconsEditor();
    renderIconBankEditor();
    renderOrgIconBankEditor();
    renderBgColorsEditor();
    renderTextColorsSetEditor();
    renderShadowsEditor();
    renderHomeLayoutEditor();
    renderHomeLogoEditor();
    renderReviewLayoutEditor();
    renderRevisionAlgoEditor();
    renderPersGaugeColorsEditor();
    renderCardScoreEditor();
    renderGaugeColorsEditor();
    renderFactoryDefaultsEditor();
    renderHelpMessagesEditor();
    // Après TOUS les autres rendus ci-dessus : ils régénèrent leurs propres
    // <input class="dev-color-value"> dynamiquement, donc les pastilles
    // (et curseurs T/S/L) doivent être posées en tout dernier pour ne
    // rater aucun d'entre eux.
    enhanceColorInputsWithHsl();
  }

  /** Round 4, partie 2 : éditeur des messages d'aide du robot, une textarea
   *  par page (une ligne = un message, dans l'ordre du bouton "Suite"). */
  function renderHelpMessagesEditor() {
    const wrap = el("dev-help-messages-list");
    if (!wrap) return;
    const settings = loadDevSettings();
    const viewKeys = Object.keys(DEFAULT_HELP_MESSAGES_BY_VIEW);
    wrap.innerHTML = viewKeys
      .map((key) => {
        const messages = settings.helpMessagesByView[key] || [];
        const value = messages.join("\n");
        return `<div class="dev-help-messages-row">
          <span class="dev-help-messages-title">${HELP_VIEW_LABELS[key] || key}</span>
          <textarea class="dev-help-messages-textarea" data-key="${key}" placeholder="Aucun message — pas de bulle d'aide sur cette page.">${value.replace(/</g, "&lt;")}</textarea>
        </div>`;
      })
      .join("");
    wrap.querySelectorAll(".dev-help-messages-textarea").forEach((textarea) => {
      textarea.addEventListener("change", () => {
        const s = loadDevSettings();
        const lines = textarea.value.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
        s.helpMessagesByView[textarea.dataset.key] = lines;
        saveDevSettings(s);
        // La page actuellement affichée peut être celle qu'on vient
        // d'éditer : on rafraîchit sa bulle d'aide tout de suite plutôt
        // que d'attendre le prochain changement de page.
        const activeView = document.querySelector(".view.is-active");
        if (activeView && activeView.id === `view-${textarea.dataset.key}`) {
          applyBodyLogoSpeech(textarea.dataset.key);
        }
      });
    });
  }


  /** Bouton de dépannage manuel : désinscrit le(s) service worker(s) et vide
   *  le Cache Storage de l'appli, sans toucher IndexedDB (les fiches) ni
   *  localStorage (réglages). Sert de filet de sécurité
   *  accessible sans les outils de développement, pour les cas où la
   *  détection automatique de nouvelle version reste bloquée (observé sur
   *  GitHub Pages, qui ne permet pas de fixer nous-mêmes les en-têtes de
   *  cache HTTP — voir aussi updateViaCache: "none" plus bas). */
  const devPublishPublicBtn = el("dev-publish-public-btn");
  const devPublishPublicResultEl = el("dev-publish-public-result");
  if (devPublishPublicBtn) {
    devPublishPublicBtn.addEventListener("click", async () => {
      devPublishPublicBtn.disabled = true;
      const originalLabel = devPublishPublicBtn.textContent;
      devPublishPublicBtn.textContent = "Publication…";
      if (devPublishPublicResultEl) devPublishPublicResultEl.textContent = "";
      const settings = loadDevSettings();
      const result = await Sync.pushPublicDevSettings(settings);
      devPublishPublicBtn.disabled = false;
      devPublishPublicBtn.textContent = originalLabel;
      if (result && result.error) {
        // Round 4, partie 3 (correctif) : on affiche désormais le texte
        // d'erreur réel renvoyé par Supabase (au lieu d'un message générique
        // qui masquait la vraie cause), pour pouvoir diagnostiquer ce genre
        // de souci sans avoir à ouvrir la console.
        if (devPublishPublicResultEl) {
          devPublishPublicResultEl.textContent =
            "Échec — " + result.error + " (vérifie aussi que tu es connecté avec ton compte, page Compte).";
        }
        robotAlert("La publication a échoué : " + result.error);
      } else {
        publicDevSettingsOverride = settings;
        if (devPublishPublicResultEl) {
          devPublishPublicResultEl.textContent = "Publié — tout le monde recevra ces réglages à son prochain démarrage.";
        }
        robotAlert("Réglages publiés ! Toutes les installations (élèves, profs, nouveaux appareils) les recevront désormais au démarrage.");
      }
    });
  }

  const devHideDevModeBtn = el("dev-hide-dev-mode-btn");
  if (devHideDevModeBtn) {
    devHideDevModeBtn.addEventListener("click", () => {
      setDevUnlocked(false);
      const homeBtnEl = el("home-btn");
      if (homeBtnEl) homeBtnEl.click();
    });
  }

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
     Navigation par onglets (désormais déclenchée depuis les carrés de la
     page d'accueil plutôt qu'un menu visible — item 1b/1c) — la logique
     de bascule elle-même ne change pas, seul le déclencheur change.
  --------------------------------------------------------- */
  const homeBtn = el("home-btn");
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
      // Bouton "retour à l'accueil" (item 1e) : visible partout SAUF sur
      // l'accueil lui-même.
      if (homeBtn) homeBtn.hidden = false;
      // Items 1/2 (dernier lot) : le logo (en haut du corps de la page)
      // n'apparaît que sur les pages autres que l'accueil, qui a déjà son
      // propre grand logo.
      if (el("body-logo-row")) el("body-logo-row").hidden = false;
      applyBodyLogoSpeech(view);

      if (view === "review") {
        if (!reviewSessionStarted) {
          startReviewSession();
        } else {
          syncCurrentCardFromStore();
        }
        renderReviewChart();
        renderReviewSubjectScore();
        renderReviewGauge();
      }
      if (view === "stats") renderStats();
      if (view === "dev") renderDevView();
      if (view === "sync") renderSyncView();
      if (view === "account") renderAccountView();
      if (view === "classes") renderClassesView();
      if (view === "messages") renderMessagesView();
      if (view === "library") renderLibraryView();
      if (view === "calendar") renderCalendarEvents();
      if (view === "revision-program") renderRevisionProgramList();
      if (view === "settings") {
        renderSettingsView();
        // Item 8 : le contenu de l'ancienne page "Modes d'apprentissage"
        // vit maintenant dans Réglages — on le peuple à chaque ouverture.
        loadModeFormIntoInputs(algoEditingModeId || "normal");
      }
      renderDuePill();
    });
  });

  /** Retourne à l'accueil (item 1e) — bouton toujours présent en haut de
   *  chaque page, sauf sur l'accueil lui-même. */
  // Item 5 : quand on arrive sur Fiches en cliquant un dossier/une boîte
  // depuis Organisation, le bouton Accueil de cette page ramène à
  // Organisation plutôt qu'au véritable accueil — remis à false dès
  // qu'on entre sur Fiches par un autre chemin (voir plus bas).
  let cardsEntryFromManage = false;
  // Item 3 (nouveau lot) : si on est arrivé sur Réviser en cliquant un
  // dossier/une boîte depuis Organisation, Accueil doit y ramener plutôt
  // qu'au Programme de révision (comportement par défaut, conservé quand
  // c'est bien par le Programme — ou "Sélection manuelle" — qu'on est
  // passé).
  let reviewEntryFromManage = false;
  function goHome() {
    if (cardsEntryFromManage && el("view-cards") && el("view-cards").classList.contains("is-active")) {
      cardsEntryFromManage = false;
      const tab = document.querySelector('.tab[data-view="manage"]');
      if (tab) tab.click();
      return;
    }
    // Item 8 (lot précédent) : Réviser se rejoint désormais toujours en
    // passant par le Programme de révision (ou "Sélection manuelle") —
    // Accueil y ramène par défaut. Item 3 (nouveau lot) : sauf si on est
    // arrivé par Organisation, auquel cas Accueil y ramène plutôt.
    if (el("view-review") && el("view-review").classList.contains("is-active")) {
      if (reviewEntryFromManage) {
        reviewEntryFromManage = false;
        const manageTab = document.querySelector('.tab[data-view="manage"]');
        if (manageTab) manageTab.click();
        return;
      }
      const tab = document.querySelector('.tab[data-view="revision-program"]');
      if (tab) tab.click();
      return;
    }
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-home").classList.add("is-active");
    if (homeBtn) homeBtn.hidden = true;
    if (el("body-logo-row")) el("body-logo-row").hidden = true;
  }
  if (homeBtn) homeBtn.addEventListener("click", goHome);

  // Carrés de la page d'accueil (item 1a) : réutilisent directement la
  // logique des onglets ci-dessus (chaque carré déclenche le même
  // .tab[data-view=...].click()) plutôt que de dupliquer la bascule de vue.
  document.querySelectorAll(".home-circle[data-go]").forEach((square) => {
    square.addEventListener("click", () => {
      // Item 5 : n'importe quel autre chemin vers Fiches (bouton d'accueil
      // dédié, etc.) repart sur le comportement normal du bouton Accueil.
      if (square.dataset.go === "cards") cardsEntryFromManage = false;
      const tab = document.querySelector(`.tab[data-view="${square.dataset.go}"]`);
      if (tab) tab.click();
    });
  });
  const homeNewCardBtn = el("home-new-card-btn");
  if (homeNewCardBtn) {
    homeNewCardBtn.addEventListener("click", () => {
      exitEditMode();
      resetCardForm();
      cancelEditBtn.hidden = false;
      openNewCardView();
      if (inputQuestion) inputQuestion.focus();
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
  let unsubscribeSubjectsRealtime = null;
  let unsubscribeFoldersRealtime = null;
  let unsubscribeLearningModesRealtime = null;
  let unsubscribeDevSettingsRealtime = null;
  let syncAutoRetrying = false;

  /* ---------------------------------------------------------
     Vue Calendrier (item 9, revue item 2) — événements liés à une
     boîte/dossier, pensés comme base pour une future génération de
     programme de révision. Stockage simple en localStorage (pas encore
     dans IndexedDB, le volume attendu est faible).
  --------------------------------------------------------- */
  const CALENDAR_EVENTS_KEY = "fiches_calendar_events";
  function loadCalendarEvents() {
    try {
      const raw = JSON.parse(localStorage.getItem(CALENDAR_EVENTS_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }
  function saveCalendarEvents(events) {
    localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
    scheduleDevSettingsPush();
  }
  let calendarEventLinkId = null; // "subject:ID" ou "folder:ID" ou null
  let calendarEditingEventId = null; // null = ajout, sinon modification (item 2)
  let calendarViewMode = "list"; // "list" | "months" | "year" (item 2)
  let calendarMonthsAnchor = new Date();
  let calendarYearAnchor = new Date().getFullYear();

  function calendarLinkLabel(linkId) {
    if (!linkId) return "Aucune boîte/dossier liés";
    const [type, id] = linkId.split(":");
    if (type === "subject") return subjectName(id);
    const f = folders.find((x) => x.id === id);
    return f ? `${f.name} (dossier)` : "Aucune boîte/dossier liés";
  }

  // Item 1 (4e lot) : ce sélecteur utilise désormais la page partagée
  // #view-boite-picker (rendu de l'arbre identique à Organisation) — ici
  // un dossier ENTIER reste un lien valide (même non vide), donc
  // folderAlwaysSelectable est activé, et un bouton "Aucun lien" permet de
  // retirer le lien existant.
  const calendarEventSubjectBtn = el("calendar-event-subject-btn");
  if (calendarEventSubjectBtn) {
    calendarEventSubjectBtn.addEventListener("click", () => {
      openBoitePickerView({
        mode: "single",
        title: "Choisir la boîte ou le dossier lié",
        folderAlwaysSelectable: true,
        showNoneButton: true,
        onPick: (kind, id) => {
          calendarEventLinkId = `${kind}:${id}`;
          calendarEventSubjectBtn.textContent = calendarLinkLabel(calendarEventLinkId);
          closeBoitePickerView();
        },
        onNone: () => {
          calendarEventLinkId = null;
          calendarEventSubjectBtn.textContent = calendarLinkLabel(null);
          closeBoitePickerView();
        },
      });
    });
  }

  // Item 2 : le bouton de date ouvre le sélecteur natif (plus explicite
  // qu'un simple champ texte) et affiche la date choisie en toutes lettres.
  const calendarEventDateInput = el("calendar-event-date");
  function formatCalendarDate(raw) {
    const d = new Date(raw + "T00:00:00");
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }
  if (calendarEventDateInput) {
    // Item 3 : plus besoin d'appeler showPicker() nous-mêmes — l'input
    // natif recouvre directement tout le bouton (voir CSS), c'est donc lui
    // qui reçoit le clic et ouvre son sélecteur de date lui-même.
    calendarEventDateInput.addEventListener("change", () => {
      const label = el("calendar-event-date-label");
      if (label && calendarEventDateInput.value) label.textContent = formatCalendarDate(calendarEventDateInput.value);
    });
  }

  // Item 2 : le panneau d'ajout reste caché tant qu'on n'a pas cliqué sur
  // "+ Ajouter un événement" — et sert aussi à MODIFIER un événement
  // existant (même formulaire, prérempli).
  async function openCalendarEventForm(eventToEdit) {
    const form = el("calendar-event-form");
    if (!form) return;
    form.hidden = false;
    const title = el("calendar-event-form-title");
    const submitBtn = el("calendar-event-submit");
    if (eventToEdit) {
      calendarEditingEventId = eventToEdit.id;
      el("calendar-event-title").value = eventToEdit.title;
      el("calendar-event-date").value = eventToEdit.date;
      el("calendar-event-date-label").textContent = formatCalendarDate(eventToEdit.date);
      calendarEventLinkId = eventToEdit.linkId || null;
      el("calendar-event-subject-btn").textContent = calendarLinkLabel(calendarEventLinkId);
      if (title) title.textContent = "Modifier l'événement";
      if (submitBtn) submitBtn.textContent = "Enregistrer les modifications";
    } else {
      calendarEditingEventId = null;
      form.reset();
      el("calendar-event-date-label").textContent = "Choisir une date";
      calendarEventLinkId = null;
      el("calendar-event-subject-btn").textContent = calendarLinkLabel(null);
      if (title) title.textContent = "Ajouter un événement";
      if (submitBtn) submitBtn.textContent = "Ajouter à mon calendrier";
    }
    await populateCalendarEventClassSelect(eventToEdit);
  }
  /** Round 3, item 4 (squelette) : remplit le sélecteur "Partager avec une
   *  classe" avec les classes dont l'utilisateur est prof — masqué s'il
   *  n'en a aucune (rien à partager) ou si Sync/Compte ne sont pas prêts. */
  async function populateCalendarEventClassSelect(eventToEdit) {
    const field = el("calendar-event-class-field");
    const select = el("calendar-event-class-select");
    if (!field || !select) return;
    if (!Sync.isConfigured() || !accountCurrentUser) {
      field.hidden = true;
      return;
    }
    const myClasses = await Sync.classes.listAsTeacher();
    if (!myClasses.length) {
      field.hidden = true;
      select.value = "";
      return;
    }
    field.hidden = false;
    select.innerHTML =
      `<option value="">Ne pas partager</option>` +
      myClasses.map((k) => `<option value="${k.id}">${escapeHtml(k.name)}</option>`).join("");
    select.value = eventToEdit && eventToEdit.classShare ? eventToEdit.classShare.classId : "";
  }
  /** Garde-fou supplémentaire (round 6, "attention qu'un élève ne puisse
   *  rien modifier de ce qui est partagé par un prof") : la corbeille
   *  n'est déjà PAS affichée pour un événement reçu (isReceived, voir
   *  buildCalendarEventRow) et le clic sur la ligne est déjà bloqué par
   *  blockIfSharedReadonlyEvent — mais on ajoute ici une deuxième
   *  barrière, directement à la source de la suppression elle-même,
   *  pour qu'un événement marqué `sharedEventId` reste structurellement
   *  impossible à supprimer par ce chemin, même si un futur appel
   *  oubliait la vérification côté interface. */
  async function deleteOwnCalendarEvent(ev) {
    if (isSharedReadonlyEvent(ev)) return;
    saveCalendarEvents(loadCalendarEvents().filter((x) => x.id !== ev.id));
    if (ev.classShare && Sync.isConfigured()) {
      try { await Sync.classes.deleteSharedEvent(ev.classShare.remoteId); } catch (e) { /* best-effort */ }
    }
  }
  function closeCalendarEventForm() {
    const form = el("calendar-event-form");
    if (form) form.hidden = true;
    calendarEditingEventId = null;
  }
  const calendarAddEventBtn = el("calendar-add-event-btn");
  if (calendarAddEventBtn) calendarAddEventBtn.addEventListener("click", () => openCalendarEventForm(null));
  const calendarEventCancelBtn = el("calendar-event-cancel");
  if (calendarEventCancelBtn) calendarEventCancelBtn.addEventListener("click", closeCalendarEventForm);

  const calendarEventForm = el("calendar-event-form");
  if (calendarEventForm) {
    calendarEventForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titleInput = el("calendar-event-title");
      const dateInput = el("calendar-event-date");
      if (!titleInput.value.trim() || !dateInput.value) return;
      const titleVal = titleInput.value.trim();
      const dateVal = dateInput.value;
      const events = loadCalendarEvents();
      const classSelect = el("calendar-event-class-select");
      const selectedClassId = classSelect && !el("calendar-event-class-field").hidden ? classSelect.value : "";

      let ev;
      let idx = -1;
      if (calendarEditingEventId) {
        idx = events.findIndex((x) => x.id === calendarEditingEventId);
        ev = idx >= 0 ? { ...events[idx], title: titleVal, date: dateVal, linkId: calendarEventLinkId } : null;
      } else {
        ev = { id: uid(), title: titleVal, date: dateVal, linkId: calendarEventLinkId };
      }
      if (!ev) return;

      // Round 3, item 4 (squelette) : synchronise le partage avec la
      // classe choisie (aucune, une nouvelle, ou la même déjà en place).
      if (Sync.isConfigured() && ev.classShare && ev.classShare.classId !== selectedClassId) {
        // Classe retirée ou changée : on retire d'abord l'ancien partage.
        try { await Sync.classes.deleteSharedEvent(ev.classShare.remoteId); } catch (err) { /* best-effort */ }
        delete ev.classShare;
      }
      if (Sync.isConfigured() && selectedClassId) {
        if (ev.classShare && ev.classShare.classId === selectedClassId) {
          await Sync.classes.updateSharedEvent(ev.classShare.remoteId, titleVal, dateVal);
        } else {
          const klass = (await Sync.classes.listAsTeacher()).find((k) => k.id === selectedClassId);
          const { data, error } = await Sync.classes.shareEvent(selectedClassId, titleVal, dateVal);
          if (!error && data) {
            ev.classShare = { classId: selectedClassId, className: klass ? klass.name : "", remoteId: data.id };
          }
        }
      }

      if (idx >= 0) events[idx] = ev;
      else events.push(ev);
      saveCalendarEvents(events);
      const wasEditing = !!calendarEditingEventId;
      closeCalendarEventForm();
      renderCalendarEvents();
      showToast(wasEditing ? "Événement modifié" : "Événement ajouté");
    });
  }

  /** Ligne d'événement partagée (item 2) : liste ET popup de jour, avec
   *  modifier + supprimer. */
  /** Round 3, item 4 (squelette) : un événement REÇU d'une classe (marqué
   *  sharedEventId) est en lecture seule côté élève, même logique que pour
   *  une boîte partagée — il se met à jour tout seul, on ne le modifie ni
   *  ne le supprime ici. */
  function isSharedReadonlyEvent(ev) {
    return !!(ev && ev.sharedEventId);
  }
  async function blockIfSharedReadonlyEvent(ev) {
    if (isSharedReadonlyEvent(ev)) {
      await robotAlert("Cet événement est partagé par ton professeur : il se met à jour tout seul, tu ne peux pas le modifier ici.");
      return true;
    }
    return false;
  }
  function buildCalendarEventRow(ev, { onEdit, onDelete }) {
    const li = document.createElement("li");
    // Item 2 (demande de Stéphane) : distinction visuelle nette entre un
    // événement PERSONNEL (aucune classe liée), un événement PARTAGÉ PAR
    // MOI (côté prof, ev.classShare) et un événement REÇU d'un prof (côté
    // élève, ev.sharedEventId, lecture seule) — liseré de couleur + fond
    // légèrement teinté distincts pour chacun (voir style.css), en plus du
    // badge texte déjà existant.
    const isReceived = isSharedReadonlyEvent(ev);
    const isSharedByMe = !!ev.classShare;
    li.className =
      "card-row" +
      (isReceived ? " calendar-event-row--received" : isSharedByMe ? " calendar-event-row--shared-mine" : "");
    li.style.cssText = "flex-direction:row; align-items:center; justify-content:space-between; cursor:pointer;";
    // Item 6 : cliquer sur l'événement l'ouvre directement en modification
    // — plus besoin d'un bouton crayon séparé.
    li.title = isReceived ? "Événement partagé par ton professeur (lecture seule)" : "Modifier cet événement";
    li.addEventListener("click", async () => {
      if (await blockIfSharedReadonlyEvent(ev)) return;
      onEdit();
    });
    const main = document.createElement("div");
    main.className = "card-row-main";
    const sharedBadge = isReceived
      ? ` <span class="classes-shared-badge classes-shared-badge--received">${iconSvgMarkup("lock", "icon-inline-svg")} ${escapeHtml(ev.sharedClassName)}</span>`
      : isSharedByMe
      ? ` <span class="classes-shared-badge">Partagé : ${escapeHtml(ev.classShare.className)}</span>`
      : "";
    main.innerHTML = `<strong>${escapeHtml(ev.title)}</strong>${sharedBadge}<br><span class="card-row-meta">${escapeHtml(formatCalendarDate(ev.date))}${ev.linkId ? ` · ${escapeHtml(calendarLinkLabel(ev.linkId))}` : ""}</span>`;
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex; gap:4px; flex-shrink:0;";
    if (isReceived) {
      // Un événement reçu ne peut pas être supprimé (voir
      // blockIfSharedReadonlyEvent) : plus de bouton corbeille trompeur ici
      // (auparavant présent mais toujours bloqué au clic), remplacé par un
      // simple cadenas qui rappelle pourquoi, sans action au clic.
      const lockBadge = document.createElement("span");
      lockBadge.className = "icon-btn icon-btn--static";
      lockBadge.title = "Géré par ton professeur";
      lockBadge.innerHTML = iconSvgMarkup("lock", "icon-inline-svg");
      actions.appendChild(lockBadge);
    } else {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "icon-btn icon-btn--danger";
      delBtn.innerHTML = iconSvgMarkup("trash", "icon-inline-svg");
      delBtn.title = "Supprimer cet événement";
      // Item 4 : confirmation avant suppression, comme pour les fiches et
      // les boîtes ailleurs dans l'appli.
      delBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (await robotConfirm(`Supprimer l'événement « ${ev.title} » ?`, { danger: true })) onDelete();
      });
      actions.appendChild(delBtn);
    }
    li.appendChild(main);
    li.appendChild(actions);
    return li;
  }

  function renderCalendarListView() {
    const list = el("calendar-event-list");
    const empty = el("calendar-event-empty");
    if (!list) return;
    const events = loadCalendarEvents().slice().sort((a, b) => a.date.localeCompare(b.date));
    list.innerHTML = "";
    if (events.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    events.forEach((ev) => {
      list.appendChild(
        buildCalendarEventRow(ev, {
          onEdit: () => openCalendarEventForm(ev),
          onDelete: async () => {
            await deleteOwnCalendarEvent(ev);
            renderCalendarEvents();
          },
        })
      );
    });
  }

  // Item 2 : affichages calendrier (2 mois) et année, avec des points sur
  // les jours ayant un événement.
  const CALENDAR_DOW_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
  function calendarEventsByDay(year, month) {
    const map = {};
    loadCalendarEvents().forEach((ev) => {
      const d = new Date(ev.date + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        (map[d.getDate()] = map[d.getDate()] || []).push(ev);
      }
    });
    return map;
  }
  function buildMiniMonthEl(year, month, compact) {
    const wrap = document.createElement("div");
    wrap.className = "calendar-mini-month";
    const title = document.createElement("div");
    title.className = "calendar-mini-month-title";
    title.textContent = new Date(year, month, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    wrap.appendChild(title);
    const grid = document.createElement("div");
    grid.className = "calendar-mini-month-grid";
    if (!compact) {
      CALENDAR_DOW_LABELS.forEach((l) => {
        const dow = document.createElement("div");
        dow.className = "calendar-mini-month-dow";
        dow.textContent = l;
        grid.appendChild(dow);
      });
    }
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const eventMap = calendarEventsByDay(year, month);
    const today = new Date();
    for (let i = 0; i < firstDow; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day-cell is-empty";
      grid.appendChild(cell);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day-cell";
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === day) cell.classList.add("is-today");
      const dayLabel = document.createElement("span");
      dayLabel.className = "calendar-day-num";
      dayLabel.textContent = String(day);
      cell.appendChild(dayLabel);
      if (eventMap[day]) {
        // Item 3 : jour en gras + légèrement entouré, en plus du point,
        // pour qu'un jour avec événement(s) ressorte nettement mieux.
        // Item 4 : un point par événement (jusqu'à 3, plus au-delà juste
        // un point légèrement plus large en dernière position pour ne
        // pas surcharger une petite case).
        cell.classList.add("has-event");
        const dotsWrap = document.createElement("span");
        dotsWrap.className = "calendar-day-dots";
        const count = Math.min(eventMap[day].length, 3);
        for (let i = 0; i < count; i++) {
          const dot = document.createElement("span");
          dot.className = "calendar-day-dot";
          // Item 2 (demande de Stéphane) : point de couleur différente pour
          // un événement lié à une classe (reçu OU partagé par moi), pour
          // repérer un jour de classe d'un simple coup d'œil sur la grille,
          // avant même d'ouvrir le jour.
          const dayEv = eventMap[day][i];
          // Round 6 : couleur différente reçu (sauge) / partagé par moi
          // (bleu), même distinction qu'en vue liste (voir style.css).
          if (dayEv && dayEv.sharedEventId) dot.classList.add("calendar-day-dot--shared");
          else if (dayEv && dayEv.classShare) dot.classList.add("calendar-day-dot--shared-mine");
          if (eventMap[day].length > 3 && i === count - 1) dot.classList.add("calendar-day-dot--more");
          dotsWrap.appendChild(dot);
        }
        cell.appendChild(dotsWrap);
        cell.addEventListener("click", () => openCalendarDayPopup(year, month, day, eventMap[day]));
      }
      grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    return wrap;
  }
  // Item 5 : les mois s'empilent verticalement (pleine largeur) et on peut
  // défiler aussi loin que l'on veut vers le futur — plus de pagination
  // "précédent/suivant" à deux mois fixes.
  let calendarMonthsRenderedCount = 3;
  function renderCalendarMonthsView() {
    const grid = el("calendar-months-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const y = calendarMonthsAnchor.getFullYear();
    const m = calendarMonthsAnchor.getMonth();
    for (let i = 0; i < calendarMonthsRenderedCount; i++) {
      const d = new Date(y, m + i, 1);
      grid.appendChild(buildMiniMonthEl(d.getFullYear(), d.getMonth(), false));
    }
  }
  const calendarMonthsView = el("calendar-months-grid");
  if (calendarMonthsView) {
    calendarMonthsView.addEventListener("scroll", () => {
      const nearBottom = calendarMonthsView.scrollTop + calendarMonthsView.clientHeight >= calendarMonthsView.scrollHeight - 300;
      if (nearBottom) {
        calendarMonthsRenderedCount = Math.min(calendarMonthsRenderedCount + 2, 36);
        renderCalendarMonthsView();
      }
    });
  }
  // Repli : sur certains agencements, c'est la PAGE entière qui défile,
  // pas ce panneau en particulier — on écoute donc aussi le scroll général.
  // Bug corrigé (item 2) : cet écouteur est GLOBAL et permanent, mais ne
  // vérifiait que la variable d'état "calendarViewMode" — qui ne revient
  // JAMAIS à sa valeur par défaut en quittant la page Calendrier. Résultat
  // : après être passé une fois par "Calendrier" (vue mensuelle), N'IMPORTE
  // QUEL scroll ailleurs dans l'appli (y compris le simple défilement
  // provoqué par le clavier qui s'ouvre au clic dans un champ de
  // recherche) relançait un rendu de calendrier de plus en plus lourd en
  // arrière-plan, invisible, jusqu'à un vrai figement. On vérifie
  // maintenant explicitement que la page Calendrier est bien la page
  // ACTIVE, pas seulement que son dernier mode connu était "months".
  window.addEventListener("scroll", () => {
    if (calendarViewMode !== "months") return;
    const calendarViewEl = el("view-calendar");
    if (!calendarViewEl || !calendarViewEl.classList.contains("is-active")) return;
    const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 400;
    if (nearBottom) {
      // Garde-fou supplémentaire : inutile de charger des dizaines
      // d'années d'avance même en cas d'usage légitime intensif.
      calendarMonthsRenderedCount = Math.min(calendarMonthsRenderedCount + 2, 36);
      renderCalendarMonthsView();
    }
  });
  function renderCalendarYearView() {
    const grid = el("calendar-year-grid");
    const label = el("calendar-year-label");
    if (!grid) return;
    if (label) label.textContent = String(calendarYearAnchor);
    grid.innerHTML = "";
    for (let m = 0; m < 12; m++) grid.appendChild(buildMiniMonthEl(calendarYearAnchor, m, true));
  }
  const calendarYearPrevBtn = el("calendar-year-prev");
  if (calendarYearPrevBtn) calendarYearPrevBtn.addEventListener("click", () => { calendarYearAnchor -= 1; renderCalendarYearView(); });
  const calendarYearNextBtn = el("calendar-year-next");
  if (calendarYearNextBtn) calendarYearNextBtn.addEventListener("click", () => { calendarYearAnchor += 1; renderCalendarYearView(); });

  function openCalendarDayPopup(year, month, day, events) {
    const popup = el("calendar-day-popup");
    const title = el("calendar-day-popup-title");
    const list = el("calendar-day-popup-list");
    if (!popup || !list) return;
    if (title) title.textContent = new Date(year, month, day).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    list.innerHTML = "";
    events.forEach((ev) => {
      list.appendChild(
        buildCalendarEventRow(ev, {
          onEdit: () => {
            popup.hidden = true;
            openCalendarEventForm(ev);
          },
          onDelete: async () => {
            await deleteOwnCalendarEvent(ev);
            popup.hidden = true;
            renderCalendarEvents();
          },
        })
      );
    });
    popup.hidden = false;
  }
  const calendarDayPopupCloseBtn = el("calendar-day-popup-close");
  if (calendarDayPopupCloseBtn) {
    calendarDayPopupCloseBtn.addEventListener("click", () => {
      const popup = el("calendar-day-popup");
      if (popup) popup.hidden = true;
    });
  }

  // Item 2 : bascule liste / calendrier / année.
  document.querySelectorAll(".calendar-view-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      calendarViewMode = btn.dataset.calview;
      document.querySelectorAll(".calendar-view-toggle-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      if (el("calendar-list-view")) el("calendar-list-view").hidden = calendarViewMode !== "list";
      if (el("calendar-months-view")) el("calendar-months-view").hidden = calendarViewMode !== "months";
      if (el("calendar-year-view")) el("calendar-year-view").hidden = calendarViewMode !== "year";
      renderCalendarEvents();
    });
  });

  function renderCalendarEvents() {
    renderCalendarListView();
    renderCalendarMonthsView();
  }

  /* ---------------------------------------------------------
     Vue Programme de révision (item 7) — étape intermédiaire avant
     Réviser : conseille les boîtes/dossiers à exercer en priorité en
     fonction des échéances du calendrier (les plus proches d'abord), avec
     un objectif de score à atteindre. Version volontairement simple pour
     l'instant : l'objectif est fixe (80%) et la priorité suit juste la
     date de l'échéance la plus proche pour ce dossier/boîte — assez pour
     poser la structure, à affiner plus tard (item 7 du départ).
  --------------------------------------------------------- */
  const REVISION_PROGRAM_TARGET_SCORE = 80;
  function computeRevisionProgramItems() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const upcoming = loadCalendarEvents().filter((ev) => ev.linkId && ev.date >= todayStr);
    // Un seul point de programme par boîte/dossier : celui dont
    // l'échéance est la plus proche fait foi.
    const byLink = {};
    upcoming.forEach((ev) => {
      if (!byLink[ev.linkId] || ev.date < byLink[ev.linkId].date) byLink[ev.linkId] = ev;
    });
    const items = Object.values(byLink).map((ev) => {
      const [type, id] = ev.linkId.split(":");
      const isFolder = type === "folder";
      const pool = isFolder ? folderCardsPool(id) : subjectCardsPool(id);
      const daysLeft = Math.round((new Date(ev.date + "T00:00:00") - new Date(todayStr + "T00:00:00")) / 86400000);
      // Nouvel algorithme : plus de score 0-100 — le "score" utilisé pour
      // le tri à égalité de date devient la proportion (%) de fiches déjà
      // en persistance moyen/long/très long terme (donc pas "court terme").
      const list = pool || [];
      const wellPersisted = list.filter((c) => classifyPersBracket(typeof c.pers === "number" ? c.pers : 0, loadDevSettings().revisionAlgo) !== "court").length;
      const score = list.length > 0 ? Math.round((wellPersisted / list.length) * 100) : 0;
      return {
        linkId: ev.linkId,
        type,
        id,
        label: calendarLinkLabel(ev.linkId),
        eventTitle: ev.title,
        eventDate: ev.date,
        daysLeft,
        pool,
        score,
        target: REVISION_PROGRAM_TARGET_SCORE,
      };
    });
    // Priorité (item 7) : échéance la plus proche d'abord, à égalité de
    // date c'est l'écart au score cible qui départage (le plus loin de
    // l'objectif remonte en premier).
    items.sort((a, b) => a.daysLeft - b.daysLeft || (b.target - b.score) - (a.target - a.score));
    return items;
  }

  function goToReviewFor(linkId) {
    if (linkId) {
      const [type, id] = linkId.split(":");
      if (type === "subject") {
        switchSubject(id);
      } else if (type === "folder") {
        // Bug corrigé (item 7) : un dossier entier n'était jamais vraiment
        // sélectionné (juste ignoré) — on bascule maintenant sur le mode
        // "sélection de boîtes" avec TOUTES les boîtes de ce dossier (et
        // sous-dossiers) déjà cochées, nommé d'après le dossier, exactement
        // comme si on l'avait choisi à la main dans le sélecteur.
        const ids = subjectIdsInFolder(id);
        const f = folders.find((x) => x.id === id);
        saveMultiSelection(ids);
        saveMultiSelectionLabel(f ? f.name : "");
        switchSubject(MULTI_SUBJECTS_ID, true);
      }
    } else {
      // Item 6 : "Ne pas suivre le programme" repart sur "Toutes les
      // boîtes", plutôt que de laisser la dernière boîte active
      // (potentiellement peu pertinente/oubliée depuis longtemps).
      switchSubject(ALL_SUBJECTS_ID);
    }
    const tab = document.querySelector('.tab[data-view="review"]');
    if (tab) tab.click();
  }

  function renderRevisionProgramList() {
    const list = el("revision-program-list");
    const empty = el("revision-program-empty");
    if (!list) return;
    const items = computeRevisionProgramItems();
    list.innerHTML = "";
    if (items.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "card-row revision-program-row";
      li.style.cssText = "flex-direction:row; align-items:center; justify-content:space-between;";
      const dueLabel = it.daysLeft === 0 ? "aujourd'hui" : it.daysLeft === 1 ? "demain" : `dans ${it.daysLeft} j`;
      li.innerHTML = `
        <div class="card-row-main">
          <strong>${escapeHtml(it.label)}</strong>
          <span class="card-row-meta">« ${escapeHtml(it.eventTitle)} » — ${dueLabel}</span>
        </div>
        <div class="revision-program-gauge-col">${buildPersGaugeSvg(it.pool, { width: 190, barHeight: 12 })}</div>
      `;
      li.addEventListener("click", () => {
        reviewEntryFromManage = false;
        goToReviewFor(it.linkId);
      });
      list.appendChild(li);
    });
  }

  const revisionProgramSkipBtn = el("revision-program-skip");
  if (revisionProgramSkipBtn) {
    // Item 6 (nouveau lot) : "Sélection manuelle" ouvre directement le
    // sélecteur de boîtes/dossiers (item 1), puis amène à la page Réviser
    // une fois la sélection validée (voir multiPickerNavigateToReviewOnConfirm).
    revisionProgramSkipBtn.addEventListener("click", () => {
      reviewEntryFromManage = false;
      multiPickerNavigateToReviewOnConfirm = true;
      openMultiSubjectPicker();
    });
  }

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

  disconnectBtn.addEventListener("click", async () => {
    if (!(await robotConfirm("Se déconnecter ? Tes fiches restent sur cet appareil, mais ne seront plus synchronisées tant que tu ne reconnectes pas un code."))) {
      return;
    }
    if (unsubscribeRealtime) unsubscribeRealtime();
    if (unsubscribeSubjectsRealtime) unsubscribeSubjectsRealtime();
    if (unsubscribeFoldersRealtime) unsubscribeFoldersRealtime();
    if (unsubscribeLearningModesRealtime) unsubscribeLearningModesRealtime();
    if (unsubscribeDevSettingsRealtime) unsubscribeDevSettingsRealtime();
    Sync.clearConfig();
    syncForm.reset();
    renderSyncView();
    updateSyncStatus();
  });

  /* ---------------------------------------------------------
     Classes (exploration) : partage prof -> élèves. Contrairement à la
     Sync perso (un simple code partagé, sans identité), nécessite un
     vrai compte (email + mot de passe) — voir Sync.auth / Sync.classes
     dans sync.js, et supabase/classes_schema.sql pour le schéma à créer
     une fois côté Supabase (même projet que la Sync).
  --------------------------------------------------------- */
  /** ---------------------------------------------------------------
   *  Compte (page dédiée "Se connecter / Créer un compte") — item 1 :
   *  toute la partie identité (connexion/inscription) vit ici, plus dans
   *  Classes, qui suppose désormais qu'on est déjà connecté. `accountCurrentUser`
   *  est LE point d'état global de connexion, lu aussi bien par la page
   *  Compte que par la page Classes et par le bouton d'accueil.
   *  ------------------------------------------------------------- */
  let accountCurrentUser = null;
  let classesAuthMode = "signin"; // "signin" | "signup"

  /** Correctif (round 6, demande de Stéphane) : les réglages développeur
   *  personnels (couleurs, icônes... y compris le mode nuit, qui en fait
   *  partie intégrante — voir setNightModeActive) n'étaient synchronisés
   *  QUE par code de synchro perso (`dev_settings.sync_code`),
   *  totalement indépendant du Compte Supabase Auth connecté. Deux
   *  Comptes différents (ex. un compte prof et un compte élève de test)
   *  utilisant le MÊME code de synchro perso partageaient donc
   *  automatiquement ces réglages, y compris en temps réel (abonnement
   *  Realtime) — même avant tout clic sur "Publier", qui lui ne concerne
   *  qu'un canal totalement différent (dev_settings_public, round 4).
   *  Ce canal personnel est maintenant cloisonné par (code de synchro +
   *  Compte connecté) : `Sync.auth.getUser()` est interrogé directement
   *  ici, plutôt que de lire la variable `accountCurrentUser`, qui n'est
   *  pas forcément déjà résolue au tout premier démarrage (connectSync()
   *  s'exécute avant initAccountState(), voir plus bas) — pour être sûr
   *  d'avoir la valeur à jour à chaque appel. Chaîne vide si aucun
   *  Compte n'est connecté, pour ne rien changer à quelqu'un qui
   *  n'utilise que la synchro perso sans jamais toucher aux
   *  Comptes/Classes (comportement identique à avant round 6 dans ce cas).
   */
  async function currentAccountEmailForSync() {
    if (!Sync.isConfigured()) return "";
    try {
      const u = await Sync.auth.getUser();
      return u && u.email ? u.email.toLowerCase() : "";
    } catch (e) {
      return "";
    }
  }

  /** Reflète l'état de connexion sur le bouton d'accueil (item 1/2) : son
   *  libellé change tout seul, avant même d'avoir ouvert la page Compte. */
  function updateAccountHomeButton() {
    const label = document.querySelector('.home-circle[data-key="account"] span');
    if (label) label.textContent = accountCurrentUser ? "Mon compte" : "Se connecter";
    const emailEl = el("account-user-email");
    if (emailEl) emailEl.textContent = (accountCurrentUser && accountCurrentUser.email) || "";
    const classesEmailEl = el("classes-connected-as");
    if (classesEmailEl) {
      classesEmailEl.hidden = !accountCurrentUser;
      classesEmailEl.textContent = accountCurrentUser ? `Connecté en tant que ${accountCurrentUser.email}` : "";
    }
    // Round 6, item 5 : la pastille de notifications de la Messagerie doit
    // rester à jour dès que l'état de connexion change (connexion,
    // déconnexion, changement de Compte), pas seulement à l'ouverture de
    // la page — c'est cette même fonction qui est appelée à chacun de ces
    // moments (voir initAccountState / Sync.auth.onChange).
    refreshMessagesBadge();
  }

  /** item 2 : appelé une seule fois au démarrage — supabase-js garde la
   *  session dans le stockage local du téléphone et la retrouve tout
   *  seul ; il suffit de la lire ici pour que l'appli sache déjà "qui
   *  c'est" sans repasser par un écran de connexion à chaque ouverture,
   *  et de rester à l'écoute (`onChange`) pour le reste de la session. */
  async function initAccountState() {
    if (!Sync.isConfigured()) return;
    accountCurrentUser = await Sync.auth.getUser();
    updateAccountHomeButton();
    if (accountCurrentUser) syncSharedBoxesForStudent();
    Sync.auth.onChange((user) => {
      accountCurrentUser = user;
      updateAccountHomeButton();
      if (el("view-account") && el("view-account").classList.contains("is-active")) renderAccountView();
      if (el("view-classes") && el("view-classes").classList.contains("is-active")) renderClassesView();
      if (el("view-classes-student") && el("view-classes-student").classList.contains("is-active")) renderStudentClasses();
      if (el("view-classes-teacher") && el("view-classes-teacher").classList.contains("is-active")) renderTeacherClasses();
      if (el("view-messages") && el("view-messages").classList.contains("is-active")) renderMessagesView();
      if (user) syncSharedBoxesForStudent();
      // Correctif (round 6) : les réglages dev perso (dont le mode nuit)
      // sont maintenant cloisonnés par Compte connecté (voir
      // currentAccountEmailForSync) — un changement de Compte EN COURS DE
      // SESSION (connexion, déconnexion, changement de compte) doit donc
      // recharger et se réabonner avec le bon cloisonnement, sinon
      // l'appareil resterait accroché aux réglages de l'ancien Compte (ou
      // d'aucun Compte) jusqu'au prochain redémarrage complet de l'appli.
      if (Sync.isConfigured()) {
        (async () => {
          try {
            await reconcileDevSettings();
            applyAllDevSettings();
            await subscribeDevSettingsForCurrentAccount();
          } catch (e) {
            // Best-effort : un accroc réseau ici ne doit jamais faire
            // planter le reste de la gestion du changement de Compte.
            console.warn("Réglages dev : échec du rechargement après changement de Compte", e);
          }
        })();
      }
    });
  }

  async function renderAccountView() {
    const needsSync = el("account-needs-sync");
    const authBlock = el("account-auth-block");
    const connectedBlock = el("account-connected-block");
    if (!needsSync || !authBlock || !connectedBlock) return;
    if (!Sync.isConfigured()) {
      needsSync.hidden = false;
      authBlock.hidden = true;
      connectedBlock.hidden = true;
      return;
    }
    needsSync.hidden = true;
    accountCurrentUser = await Sync.auth.getUser();
    updateAccountHomeButton();
    if (!accountCurrentUser) {
      authBlock.hidden = false;
      connectedBlock.hidden = true;
      return;
    }
    authBlock.hidden = true;
    connectedBlock.hidden = false;
  }

  function setClassesAuthMode(mode) {
    classesAuthMode = mode;
    const tabIn = el("account-auth-tab-signin");
    const tabUp = el("account-auth-tab-signup");
    if (tabIn) tabIn.classList.toggle("is-active", mode === "signin");
    if (tabUp) tabUp.classList.toggle("is-active", mode === "signup");
    const submitBtn = el("account-auth-submit");
    if (submitBtn) submitBtn.textContent = mode === "signin" ? "Se connecter" : "Créer le compte";
    const note = el("account-auth-note");
    if (note) note.hidden = true;
  }
  const accountAuthTabSignin = el("account-auth-tab-signin");
  if (accountAuthTabSignin) accountAuthTabSignin.addEventListener("click", () => setClassesAuthMode("signin"));
  const accountAuthTabSignup = el("account-auth-tab-signup");
  if (accountAuthTabSignup) accountAuthTabSignup.addEventListener("click", () => setClassesAuthMode("signup"));

  const accountAuthSubmitBtn = el("account-auth-submit");
  if (accountAuthSubmitBtn) {
    accountAuthSubmitBtn.addEventListener("click", async () => {
      const emailInput = el("account-auth-email");
      const passwordInput = el("account-auth-password");
      const note = el("account-auth-note");
      const email = (emailInput.value || "").trim();
      const password = passwordInput.value || "";
      if (!email || !password) {
        if (note) {
          note.hidden = false;
          note.textContent = "Email et mot de passe requis.";
        }
        return;
      }
      accountAuthSubmitBtn.disabled = true;
      const result =
        classesAuthMode === "signin"
          ? await Sync.auth.signIn(email, password)
          : await Sync.auth.signUp(email, password);
      accountAuthSubmitBtn.disabled = false;
      if (result.error) {
        if (note) {
          note.hidden = false;
          note.textContent = result.error;
        }
        return;
      }
      if (classesAuthMode === "signup") {
        if (note) {
          note.hidden = false;
          note.textContent = "Compte créé — vérifie ta boîte mail si une confirmation est demandée, puis connecte-toi.";
        }
        setClassesAuthMode("signin");
        return;
      }
      passwordInput.value = "";
      await renderAccountView();
      await syncSharedBoxesForStudent();
    });
  }

  const accountSignoutBtn = el("account-signout-btn");
  if (accountSignoutBtn) {
    accountSignoutBtn.addEventListener("click", async () => {
      await Sync.auth.signOut();
      accountCurrentUser = null;
      updateAccountHomeButton();
      await renderAccountView();
    });
  }

  const accountGotoSyncBtn = el("account-goto-sync-btn");
  if (accountGotoSyncBtn) {
    accountGotoSyncBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="sync"]');
      if (tab) tab.click();
    });
  }

  const accountGotoClassesBtn = el("account-goto-classes-btn");
  if (accountGotoClassesBtn) {
    accountGotoClassesBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="classes"]');
      if (tab) tab.click();
    });
  }

  /** ---------------------------------------------------------------
   *  Classes — suppose maintenant qu'on est déjà connecté (voir Compte
   *  ci-dessus). item 3 : plus aucune action manuelle côté élève — dès
   *  qu'il fait partie d'une classe, les boîtes partagées de cette classe
   *  apparaissent toutes seules dans ses boîtes (voir
   *  `syncSharedBoxesForStudent`), et restent lecture seule + toujours à
   *  jour avec ce que fait le prof.
   *  ------------------------------------------------------------- */
  /** Round 3, item 2 : la page Classes est désormais un simple palier
   *  ("landing page") avec deux boutons ronds "J'apprends" / "J'enseigne",
   *  chacun menant à sa propre page complète — remplace les deux anciens
   *  onglets dans une seule page. */
  async function renderClassesView() {
    const needsSync = el("classes-needs-sync");
    const needsAccount = el("classes-needs-account");
    const mainBlock = el("classes-main-block");
    if (!needsSync || !needsAccount || !mainBlock) return;

    if (!Sync.isConfigured()) {
      needsSync.hidden = false;
      needsAccount.hidden = true;
      mainBlock.hidden = true;
      return;
    }
    needsSync.hidden = true;

    accountCurrentUser = await Sync.auth.getUser();
    updateAccountHomeButton();
    if (!accountCurrentUser) {
      needsAccount.hidden = false;
      mainBlock.hidden = true;
      return;
    }
    needsAccount.hidden = true;
    mainBlock.hidden = false;

    // item 3 (lot précédent) : synchro automatique, sans action de
    // l'élève, dès qu'on ouvre la page Classes (palier ou sous-page).
    await syncSharedBoxesForStudent();
  }

  /** Bascule vers une des deux pages complètes "J'apprends" (which="student")
   *  ou "J'enseigne" (which="teacher"), et y peuple la liste correspondante. */
  async function openClassesSubView(which) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el(which === "teacher" ? "view-classes-teacher" : "view-classes-student").classList.add("is-active");
    applyBodyLogoSpeech(which === "teacher" ? "classes-teacher" : "classes-student");
    if (which === "teacher") {
      await renderTeacherClasses();
    } else {
      await syncSharedBoxesForStudent();
      await renderStudentClasses();
    }
  }
  function closeClassesSubView() {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-classes").classList.add("is-active");
    applyBodyLogoSpeech("classes");
    renderClassesView();
  }
  const classesGotoStudentBtn = el("classes-goto-student-btn");
  if (classesGotoStudentBtn) classesGotoStudentBtn.addEventListener("click", () => openClassesSubView("student"));
  const classesGotoTeacherBtn = el("classes-goto-teacher-btn");
  if (classesGotoTeacherBtn) classesGotoTeacherBtn.addEventListener("click", () => openClassesSubView("teacher"));
  const classesStudentBackBtn = el("classes-student-back-btn");
  if (classesStudentBackBtn) classesStudentBackBtn.addEventListener("click", closeClassesSubView);
  const classesTeacherBackBtn = el("classes-teacher-back-btn");
  if (classesTeacherBackBtn) classesTeacherBackBtn.addEventListener("click", closeClassesSubView);

  /** Icône dédiée aux classes (item 5) — un petit groupe de personnes,
   *  dans le même style épuré (traits fins, coins arrondis) que les
   *  autres pictos de l'appli. Utilisée sur le bouton d'accueil (HTML)
   *  et ici, en tête de chaque ligne de classe. */
  const CLASSES_ROW_ICON =
    '<svg class="icon-inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3.6 2.5-6.2 5.5-6.2s5.5 2.6 5.5 6.2"/><circle cx="17" cy="9" r="2.2"/><path d="M15.3 14.3c2.5.5 4.2 2.7 4.2 5.7"/></svg>';

  /** item 3 : un élève reçoit un MIROIR en lecture seule de la boîte du
   *  prof, jamais une copie figée — appelé silencieusement (pas de bouton
   *  à cliquer) au démarrage, à la connexion, et à chaque ouverture de la
   *  page Classes. Le contenu (question/réponse) est comparé par id à ce
   *  que le prof a en ligne : ajouté si nouveau, mis à jour si changé,
   *  repassé en "supprimé" localement si le prof l'a retiré — la
   *  progression SM-2 de chaque fiche, elle, n'est jamais touchée. */
  async function syncSharedBoxesForStudent() {
    if (!Sync.isConfigured()) return;
    if (!accountCurrentUser) return;
    try {
      const myClasses = await Sync.classes.listAsStudent();
      // Round 3, item 1 : dossiers de miroir de classe encore utiles à la
      // fin de cette synchro (racine de chaque classe + tous les
      // sous-dossiers reconstitués depuis les chemins reçus) — tout dossier
      // marqué sharedClassId qui n'y figure plus a été vidé par le prof
      // (boîte déplacée ailleurs/retirée) et peut être supprimé localement.
      const usedMirrorFolderIds = new Set();
      // Round 3, item 4 (squelette) : événements de calendrier reçus des
      // classes suivies, mêmes id que côté prof (sharedEventId).
      const remoteEventIds = new Set();
      // Bug corrigé (item 3, demande de Stéphane) : liste des classes pour
      // lesquelles la récupération des événements partagés a VRAIMENT
      // réussi cette fois-ci — sert à ne purger localement que les
      // événements des classes effectivement interrogées avec succès (voir
      // pruneStaleSharedEvents ci-dessous et le correctif dans sync.js).
      const fetchedEventClassIds = new Set();
      for (const klass of myClasses) {
        const rootId = await ensureClassMirrorFolder(klass);
        usedMirrorFolderIds.add(rootId);
        const boxes = await Sync.classes.listSharedBoxes(klass.id);
        for (const box of boxes) {
          const pathNames = Array.isArray(box.folder_path) ? box.folder_path : [];
          const targetFolderId = await ensureClassMirrorFolderPath(klass, rootId, pathNames, usedMirrorFolderIds);
          await reconcileSharedBox(klass, box, targetFolderId);
        }
        try {
          const remoteEvents = await Sync.classes.listSharedEvents(klass.id);
          fetchedEventClassIds.add(klass.id);
          for (const re of remoteEvents) {
            remoteEventIds.add(re.id);
            reconcileSharedEvent(klass, re);
          }
        } catch (e) {
          // Échec ponctuel (réseau, jeton...) : on ne touche à AUCUN
          // événement déjà reçu de cette classe plutôt que de risquer de
          // les supprimer localement à tort — voir le correctif dans
          // sync.js (listSharedEventsForClass lève désormais une erreur au
          // lieu de rendre un tableau vide indiscernable d'une absence
          // réelle d'événements).
          console.warn("Classes: échec du chargement des événements partagés pour cette classe, ignorée pour cette synchro", e);
        }
      }
      pruneStaleSharedEvents(remoteEventIds, fetchedEventClassIds);
      await pruneStaleClassMirrorFolders(usedMirrorFolderIds);
      renderAll();
      renderSubjectManageList();
      renderCalendarEvents();
    } catch (e) {
      console.warn("Classes: échec de la synchro des boîtes partagées", e);
    }
  }

  /** Round 3, item 4 (squelette) : ajoute ou met à jour, dans le calendrier
   *  local (localStorage), la copie en lecture seule d'un événement partagé
   *  par le prof — même id que côté prof (sharedEventId), pour repérer un
   *  changement de titre/date au prochain passage. */
  function reconcileSharedEvent(klass, re) {
    const events = loadCalendarEvents();
    const idx = events.findIndex((x) => x.sharedEventId === re.id);
    if (idx >= 0) {
      if (events[idx].title !== re.title || events[idx].date !== re.date) {
        events[idx] = { ...events[idx], title: re.title, date: re.date };
        saveCalendarEvents(events);
      }
    } else {
      events.push({
        id: uid(),
        title: re.title,
        date: re.date,
        linkId: null,
        sharedEventId: re.id,
        sharedClassId: klass.id,
        sharedClassName: klass.name,
      });
      saveCalendarEvents(events);
    }
  }
  /** Le prof a retiré/supprimé l'événement partagé : suppression locale
   *  (un événement reçu n'a pas de progression à préserver, contrairement
   *  à une fiche — contrairement aux boîtes, un vrai delete suffit ici). */
  function pruneStaleSharedEvents(remoteEventIds, fetchedEventClassIds) {
    const events = loadCalendarEvents();
    const kept = events.filter((x) => {
      if (!x.sharedEventId) return true;
      // Bug corrigé (item 3, demande de Stéphane) : si la récupération des
      // événements de CETTE classe a échoué cette fois-ci (réseau, jeton
      // pas encore prêt...), on garde l'événement tel quel plutôt que de le
      // supprimer — sinon un simple accroc réseau pendant une synchro
      // silencieuse en tâche de fond suffisait à faire disparaître un
      // événement partagé, sans qu'un élève n'ait rien supprimé lui-même.
      if (!fetchedEventClassIds.has(x.sharedClassId)) return true;
      return remoteEventIds.has(x.sharedEventId);
    });
    if (kept.length !== events.length) saveCalendarEvents(kept);
  }

  /** Round 3, item 1 : dossier racine (auto-créé, une fois par classe) qui
   *  représente une classe suivie dans l'arborescence Organisation — porte
   *  l'icône "classe" (voir renderTreeLevel) et sert de racine à la
   *  reconstitution de l'organisation du prof. */
  async function ensureClassMirrorFolder(klass) {
    let root = folders.find((f) => f.sharedClassId === klass.id && f.sharedClassRoot);
    if (!root) {
      root = newFolder(klass.name, ROOT_FOLDER_ID);
      root.sharedClassId = klass.id;
      root.sharedClassRoot = true;
      await persistFolder(root);
      folders.push(root);
    } else if (root.name !== klass.name) {
      root.name = klass.name;
      root.updatedAt = new Date().toISOString();
      await persistFolder(root);
    }
    return root.id;
  }

  /** Round 3, item 1 : recrée (ou réutilise) la chaîne de sous-dossiers
   *  `pathNames` sous le dossier racine de la classe, chacun marqué
   *  `sharedClassId` (donc en lecture seule côté élève) — reflète
   *  l'organisation faite par le prof, sans que l'élève ait la main
   *  dessus. Retourne l'id du dossier local où placer la boîte. */
  async function ensureClassMirrorFolderPath(klass, rootId, pathNames, usedMirrorFolderIds) {
    let parentId = rootId;
    for (const name of pathNames) {
      let f = folders.find((x) => x.sharedClassId === klass.id && x.parentId === parentId && x.name === name);
      if (!f) {
        f = newFolder(name, parentId);
        f.sharedClassId = klass.id;
        await persistFolder(f);
        folders.push(f);
      }
      usedMirrorFolderIds.add(f.id);
      parentId = f.id;
    }
    return parentId;
  }

  /** Round 3, item 1 : nettoie les dossiers de miroir de classe qu'une
   *  réorganisation côté prof a rendus obsolètes (boîte déplacée ailleurs,
   *  classe quittée...). Ne supprime que des dossiers effectivement vides
   *  — une incohérence momentanée se corrige simplement au prochain appel. */
  async function pruneStaleClassMirrorFolders(usedMirrorFolderIds) {
    const stale = folders.filter((f) => f.sharedClassId && !usedMirrorFolderIds.has(f.id));
    // Des enfants avant leurs parents, pour laisser folderIsEmpty() voir un
    // dossier vidé de ses propres sous-dossiers obsolètes dans la même passe.
    stale.sort((a, b) => folderPath(b.id).length - folderPath(a.id).length);
    for (const f of stale) {
      if (!folderIsEmpty(f.id)) continue;
      folders = folders.filter((x) => x.id !== f.id);
      await DB.removeFolder(f.id);
    }
  }

  async function reconcileSharedBox(klass, box, targetFolderId) {
    let subject = subjects.find((s) => s.sharedBoxId === box.id);
    if (!subject) {
      subject = newSubject(box.subject_name, targetFolderId != null ? targetFolderId : ROOT_FOLDER_ID);
      subject.sharedBoxId = box.id;
      subject.sharedClassId = klass.id;
      subject.sharedClassName = klass.name;
      await persistSubject(subject);
      subjects.push(subject);
    } else {
      let changed = false;
      if (subject.name !== box.subject_name) {
        // Le prof a renommé sa boîte : la copie miroir suit.
        subject.name = box.subject_name;
        changed = true;
      }
      if (targetFolderId != null && subject.folderId !== targetFolderId) {
        // Le prof a réorganisé ses dossiers : la copie miroir suit aussi.
        subject.folderId = targetFolderId;
        changed = true;
      }
      if (changed) {
        subject.updatedAt = new Date().toISOString();
        await persistSubject(subject);
      }
    }

    const remoteCards = Array.isArray(box.cards) ? box.cards : [];
    const remoteIds = new Set(remoteCards.map((c) => c.id).filter(Boolean));
    const localCardsHere = cards.filter((c) => c.subject === subject.id);

    for (const rc of remoteCards) {
      if (!rc.id) continue;
      // Comparaison bornée à CETTE boîte miroir (et pas juste par id global)
      // : un id de fiche est unique en pratique (uid() aléatoire), mais
      // rester borné à `subject.id` évite tout risque de confusion avec
      // une fiche locale sans rapport qui porterait le même id.
      const idx = cards.findIndex((c) => c.id === rc.id && c.subject === subject.id);
      if (idx >= 0) {
        const existing = cards[idx];
        const contentChanged = existing.question !== (rc.question || "") || existing.answer !== (rc.answer || "");
        if (existing.deleted || contentChanged) {
          const updated = {
            ...existing,
            question: rc.question || "",
            answer: rc.answer || "",
            deleted: false,
            updatedAt: new Date().toISOString(),
          };
          await persist(updated);
          cards[idx] = updated;
        }
      } else {
        const card = { ...newCard(rc.question || "", rc.answer || "", subject.id), id: rc.id };
        await persist(card);
        cards.push(card);
      }
    }
    // Le prof a retiré une fiche : suppression douce locale (jamais un
    // vrai delete, pour rester cohérent avec le reste de l'appli).
    for (const c of localCardsHere) {
      if (!c.deleted && !remoteIds.has(c.id)) {
        const updated = touch({ ...c, deleted: true });
        await persist(updated);
        const idx = cards.findIndex((x) => x.id === c.id);
        if (idx >= 0) cards[idx] = updated;
      }
    }
  }

  /** Round 6, item 4 : les classes apparaissent désormais en ronds (même
   *  esprit visuel que les boutons de l'accueil), chacun affichant le nom
   *  de la classe, le nombre d'élèves et le nombre d'échéances en cours
   *  (évènements à venir) — le détail (boîtes partagées, évènements...)
   *  a été déplacé dans la page dédiée view-class-detail, ouverte au clic. */
  function classCircleHtml(klass, count, upcoming) {
    return `
      ${CLASSES_ROW_ICON}
      <span class="classes-class-circle-name">${escapeHtml(klass.name)}</span>
      <span class="classes-class-circle-meta">${count} élève${count > 1 ? "s" : ""}</span>
      <span class="classes-class-circle-meta">${upcoming} échéance${upcoming > 1 ? "s" : ""}</span>
    `;
  }

  async function renderStudentClasses() {
    const list = el("classes-student-list");
    const empty = el("classes-student-empty");
    if (!list) return;
    list.innerHTML = "";
    const myClasses = await Sync.classes.listAsStudent();
    if (empty) empty.hidden = myClasses.length > 0;
    for (const klass of myClasses) {
      const count = await Sync.classes.memberCount(klass.id);
      const upcoming = classUpcomingEvents(klass.id, "student").length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "classes-class-circle";
      btn.innerHTML = classCircleHtml(klass, count, upcoming);
      btn.addEventListener("click", () => openClassDetailView(klass, "student"));
      list.appendChild(btn);
    }
  }

  async function renderTeacherClasses() {
    const list = el("classes-teacher-list");
    const empty = el("classes-teacher-empty");
    if (!list) return;
    list.innerHTML = "";
    const myClasses = await Sync.classes.listAsTeacher();
    if (empty) empty.hidden = myClasses.length > 0;
    for (const klass of myClasses) {
      const count = await Sync.classes.memberCount(klass.id);
      const upcoming = classUpcomingEvents(klass.id, "teacher").length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "classes-class-circle";
      btn.innerHTML = classCircleHtml(klass, count, upcoming);
      btn.addEventListener("click", () => openClassDetailView(klass, "teacher"));
      list.appendChild(btn);
    }
  }

  const classesJoinBtn = el("classes-join-btn");
  if (classesJoinBtn) {
    classesJoinBtn.addEventListener("click", async () => {
      const input = el("classes-join-code-input");
      const note = el("classes-join-note");
      const code = (input.value || "").trim();
      if (!code) return;
      classesJoinBtn.disabled = true;
      const { error } = await Sync.classes.join(code);
      classesJoinBtn.disabled = false;
      if (error) {
        if (note) {
          note.hidden = false;
          note.textContent = error;
        }
        return;
      }
      if (note) note.hidden = true;
      input.value = "";
      await syncSharedBoxesForStudent();
      await renderStudentClasses();
    });
  }

  const classesCreateBtn = el("classes-create-btn");
  if (classesCreateBtn) {
    classesCreateBtn.addEventListener("click", async () => {
      const input = el("classes-create-name-input");
      const name = (input.value || "").trim();
      if (!name) return;
      classesCreateBtn.disabled = true;
      const { error } = await Sync.classes.create(name);
      classesCreateBtn.disabled = false;
      if (error) {
        await robotAlert("Erreur : " + error);
        return;
      }
      input.value = "";
      await renderTeacherClasses();
    });
  }

  const classesGotoSyncBtn = el("classes-goto-sync-btn");
  if (classesGotoSyncBtn) {
    classesGotoSyncBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="sync"]');
      if (tab) tab.click();
    });
  }

  const classesGotoAccountBtn = el("classes-goto-account-btn");
  if (classesGotoAccountBtn) {
    classesGotoAccountBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="account"]');
      if (tab) tab.click();
    });
  }

  /** ---------------------------------------------------------------
   *  Round 6, item 4 : page dédiée à une classe, ouverte en cliquant son
   *  rond depuis J'apprends ou J'enseigne — infos, arborescence des
   *  boîtes partagées et liste des évènements à venir.
   *  ------------------------------------------------------------- */
  // {klass, role: "student"|"teacher"} de la classe actuellement ouverte,
  // ou null si aucune (sert au bouton "Retour" pour savoir où revenir).
  let classDetailContext = null;

  /** Nombre d'évènements de calendrier à venir liés à cette classe — côté
   *  prof (ev.classShare.classId) ou côté élève (ev.sharedClassId), selon
   *  le rôle sous lequel la classe est consultée ici. */
  function classUpcomingEvents(classId, role) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return loadCalendarEvents()
      .filter((e) => {
        if (role === "teacher") {
          if (!e.classShare || e.classShare.classId !== classId) return false;
        } else {
          if (e.sharedClassId !== classId) return false;
        }
        if (!e.date) return false;
        return new Date(e.date + "T00:00:00") >= today;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Regroupe une liste de boîtes partagées (chacune avec `folder_path`,
   *  un tableau de noms de dossiers) en arbre, pour un rendu indenté sans
   *  dépendre de l'arborescence Organisation (qui n'existe que côté prof
   *  — côté élève, elle est reconstituée en local mais pas nécessairement
   *  à jour au moment d'ouvrir cette page). */
  function buildSharedBoxesTree(boxes) {
    const root = { name: null, children: new Map(), boxes: [] };
    for (const box of boxes) {
      let node = root;
      for (const segment of Array.isArray(box.folder_path) ? box.folder_path : []) {
        if (!node.children.has(segment)) node.children.set(segment, { name: segment, children: new Map(), boxes: [] });
        node = node.children.get(segment);
      }
      node.boxes.push(box);
    }
    return root;
  }
  function renderSharedBoxesTreeHtml(node, depth) {
    let html = "";
    for (const box of node.boxes) {
      const n = (box.cards || []).length;
      html += `<div class="classes-shared-box-row" style="padding-left:${depth * 16}px">${CLASSES_ROW_ICON}<span>${escapeHtml(box.subject_name)} <span class="classes-card-count">(${n} fiche${n > 1 ? "s" : ""})</span></span></div>`;
    }
    for (const child of node.children.values()) {
      html += `<div class="classes-tree-folder" style="padding-left:${depth * 16}px;font-weight:600;">📁 ${escapeHtml(child.name)}</div>`;
      html += renderSharedBoxesTreeHtml(child, depth + 1);
    }
    return html;
  }

  async function openClassDetailView(klass, role) {
    classDetailContext = { klass, role };
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-class-detail").classList.add("is-active");
    applyBodyLogoSpeech("class-detail");
    await renderClassDetailView();
  }
  function closeClassDetailView() {
    const role = classDetailContext ? classDetailContext.role : "student";
    classDetailContext = null;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el(role === "teacher" ? "view-classes-teacher" : "view-classes-student").classList.add("is-active");
    applyBodyLogoSpeech(role === "teacher" ? "classes-teacher" : "classes-student");
  }
  async function renderClassDetailView() {
    if (!classDetailContext) return;
    const { klass, role } = classDetailContext;
    const titleEl = el("class-detail-title");
    if (titleEl) titleEl.textContent = klass.name;

    const [count, sharedBoxes] = await Promise.all([
      Sync.classes.memberCount(klass.id),
      Sync.classes.listSharedBoxes(klass.id),
    ]);

    const statsEl = el("class-detail-stats");
    if (statsEl) statsEl.innerHTML = `<p class="field-hint">${count} élève${count > 1 ? "s" : ""}</p>`;

    const inviteRow = el("class-detail-invite-row");
    const shareBtn = el("class-detail-share-btn");
    const isTeacher = role === "teacher";
    if (inviteRow) {
      inviteRow.hidden = !isTeacher;
      const strong = inviteRow.querySelector("strong");
      if (strong) strong.textContent = klass.invite_code || "";
    }
    if (shareBtn) shareBtn.hidden = !isTeacher;

    const boxesEl = el("class-detail-boxes");
    if (boxesEl) {
      boxesEl.innerHTML =
        sharedBoxes.length === 0
          ? `<p class="field-hint">Aucune boîte partagée pour l'instant.</p>`
          : renderSharedBoxesTreeHtml(buildSharedBoxesTree(sharedBoxes), 0);
    }

    const events = classUpcomingEvents(klass.id, role);
    const eventsList = el("class-detail-events");
    const eventsEmpty = el("class-detail-events-empty");
    if (eventsList) {
      eventsList.innerHTML = "";
      for (const ev of events) {
        const li = document.createElement("li");
        li.className = "subject-row";
        li.innerHTML = `<span>${escapeHtml(ev.title)}</span><span class="field-hint">${formatCalendarDate(ev.date)}</span>`;
        eventsList.appendChild(li);
      }
    }
    if (eventsEmpty) eventsEmpty.hidden = events.length > 0;
  }

  const classDetailBackBtn = el("class-detail-back-btn");
  if (classDetailBackBtn) classDetailBackBtn.addEventListener("click", closeClassDetailView);

  const classDetailShareBtn = el("class-detail-share-btn");
  if (classDetailShareBtn) {
    classDetailShareBtn.addEventListener("click", () => {
      if (!classDetailContext) return;
      const klass = classDetailContext.klass;
      openBoitePickerView({
        mode: "single",
        title: `Partager une boîte à « ${klass.name} »`,
        folderAlwaysSelectable: false,
        excludeSubjectIds: new Set(subjects.filter((s) => s.sharedBoxId).map((s) => s.id)),
        onPick: async (kind, subjectId) => {
          const subject = subjects.find((s) => s.id === subjectId);
          if (!subject) return;
          const boxCards = cards.filter((c) => !c.deleted && c.subject === subjectId);
          const folderPathNames = folderPath(subject.folderId).map((f) => f.name);
          const { data, error } = await Sync.classes.shareBox(klass.id, subject.name, boxCards, folderPathNames);
          closeBoitePickerView();
          if (error) {
            await robotAlert("Erreur lors du partage : " + error);
            return;
          }
          subject.sharedShares = subject.sharedShares || [];
          subject.sharedShares.push({ classId: klass.id, className: klass.name, boxId: data.id });
          subject.updatedAt = new Date().toISOString();
          await persistSubject(subject);
          renderClassDetailView();
        },
      });
    });
  }

  /** ---------------------------------------------------------------
   *  Round 6, item 5 : messagerie par classe, façon groupe WhatsApp — le
   *  prof et tous les élèves d'une classe sont automatiquement membres de
   *  la même discussion. Messages des élèves alignés à gauche, ceux du
   *  prof à droite (décidé selon l'expéditeur, pas selon qui regarde) ;
   *  les messages de l'utilisateur lui-même ressortent en plus dans une
   *  couleur différente.
   *  ------------------------------------------------------------- */
  const MESSAGES_LAST_READ_KEY = "fiches_messages_last_read";
  function loadMessagesLastRead() {
    try {
      const raw = JSON.parse(localStorage.getItem(MESSAGES_LAST_READ_KEY) || "{}");
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    } catch {
      return {};
    }
  }
  function markClassMessagesRead(classId) {
    const map = loadMessagesLastRead();
    map[classId] = new Date().toISOString();
    localStorage.setItem(MESSAGES_LAST_READ_KEY, JSON.stringify(map));
  }

  /** Met à jour la pastille de notifications du bouton d'accueil
   *  "Messagerie" — appelée à chaque changement d'état de connexion (voir
   *  updateAccountHomeButton) et après lecture/envoi d'un message. */
  async function refreshMessagesBadge() {
    const badge = el("home-messages-badge");
    if (!badge) return;
    if (!Sync.isConfigured() || !accountCurrentUser) {
      badge.hidden = true;
      return;
    }
    try {
      const classes = await Sync.messages.listClasses();
      const lastReadMap = loadMessagesLastRead();
      let total = 0;
      for (const k of classes) {
        total += await Sync.messages.countUnread(k.id, lastReadMap[k.id]);
      }
      badge.hidden = total <= 0;
      badge.textContent = total > 99 ? "99+" : String(total);
    } catch (e) {
      console.warn("Messagerie : échec du calcul des notifications", e);
    }
  }

  async function renderMessagesView() {
    const needsAccount = el("messages-needs-account");
    const list = el("messages-class-list");
    const empty = el("messages-empty");
    if (!list) return;
    if (!Sync.isConfigured() || !accountCurrentUser) {
      if (needsAccount) needsAccount.hidden = false;
      list.innerHTML = "";
      if (empty) empty.hidden = true;
      return;
    }
    if (needsAccount) needsAccount.hidden = true;
    list.innerHTML = "";
    const classes = await Sync.messages.listClasses();
    if (empty) empty.hidden = classes.length > 0;
    const lastReadMap = loadMessagesLastRead();
    for (const klass of classes) {
      const unread = await Sync.messages.countUnread(klass.id, lastReadMap[klass.id]);
      const li = document.createElement("li");
      li.className = "subject-row messages-class-row";
      li.innerHTML = `
        <span class="subject-row-name">${CLASSES_ROW_ICON} <span>${escapeHtml(klass.name)}</span></span>
        ${unread > 0 ? `<span class="home-circle-badge messages-class-row-badge">${unread > 99 ? "99+" : unread}</span>` : ""}
      `;
      li.addEventListener("click", () => openMessageThread(klass));
      list.appendChild(li);
    }
    refreshMessagesBadge();
  }

  /** Bibliothèque : collections de fiches partagées publiquement (table
   *  Supabase `library_collections`, lecture publique). Contrairement à
   *  une boîte partagée avec une classe (miroir en lecture seule, mis à
   *  jour en direct), "Prendre" ici fait une COPIE INDÉPENDANTE, à un
   *  instant T, comme un modèle qu'on reprend et qu'on peut ensuite
   *  modifier librement — cohérent avec l'usage "bibliothèque". */
  async function renderLibraryView() {
    const needsSync = el("library-needs-sync");
    const list = el("library-list");
    const empty = el("library-empty");
    if (!list) return;
    if (!Sync.isConfigured()) {
      if (needsSync) needsSync.hidden = false;
      list.innerHTML = "";
      if (empty) empty.hidden = true;
      return;
    }
    if (needsSync) needsSync.hidden = true;
    list.innerHTML = `<li class="field-hint">Chargement…</li>`;
    const collections = await Sync.library.list();
    list.innerHTML = "";
    if (empty) empty.hidden = collections.length > 0;
    for (const col of collections) {
      const n = Array.isArray(col.cards) ? col.cards.length : 0;
      const li = document.createElement("li");
      li.className = "subject-row library-row";
      li.innerHTML = `
        <span class="subject-row-name">${iconSvgMarkup("share", "icon-inline-svg")} <span>${escapeHtml(col.name)}</span></span>
        <span class="card-row-meta">${n} fiche${n > 1 ? "s" : ""} — par ${escapeHtml(col.owner_email || "quelqu'un")}</span>
        <button type="button" class="btn btn--small library-take-btn">Prendre</button>
      `;
      const takeBtn = li.querySelector(".library-take-btn");
      if (takeBtn) {
        takeBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          takeBtn.disabled = true;
          await takeLibraryCollection(col);
          takeBtn.disabled = false;
        });
      }
      list.appendChild(li);
    }
  }

  /** Copie une collection de la bibliothèque dans Mes collections : une
   *  nouvelle boîte (`fromLibrary: true`, icône en réseau — voir
   *  `appendBoiteRow`), avec une copie indépendante de chaque fiche
   *  (nouveaux id locaux, via `newCard` — pas de lien maintenu avec la
   *  collection d'origine, contrairement aux boîtes partagées par
   *  classe). */
  async function takeLibraryCollection(col) {
    const cardsToCopy = Array.isArray(col.cards) ? col.cards : [];
    if (cardsToCopy.length === 0) {
      await robotAlert("Cette collection ne contient aucune fiche.");
      return;
    }
    const subject = newSubject(col.name, ROOT_FOLDER_ID);
    subject.fromLibrary = true;
    subject.libraryOriginId = col.id || null;
    await persistSubject(subject);
    subjects.push(subject);
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    for (const rc of cardsToCopy) {
      const card = newCard(rc.question || "", rc.answer || "", subject.id);
      await persist(card);
      cards.push(card);
    }
    renderStatsSubjectSelect();
    renderSubjectSelect();
    renderSubjectManageList();
    renderStats();
    await robotAlert(`« ${subject.name} » a été ajoutée à Mes collections (${cardsToCopy.length} fiche${cardsToCopy.length > 1 ? "s" : ""}).`);
  }

  /** Partage une boîte existante dans la bibliothèque publique : nécessite
   *  d'être connecté avec un Compte (sert d'identité/attribution, comme
   *  pour le partage avec une classe). Simple copie à l'instant du partage
   *  — republier après modification n'est pas proposé pour l'instant (pas
   *  demandé), contrairement aux boîtes partagées avec une classe. */
  async function shareSubjectToLibrary(subjectId) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    if (!Sync.isConfigured()) {
      await robotAlert("Active d'abord la synchronisation (page Synchronisation) pour pouvoir partager dans la bibliothèque.");
      return;
    }
    if (!accountCurrentUser) {
      await robotAlert("Connecte-toi avec un Compte (page Compte) pour partager dans la bibliothèque.");
      return;
    }
    const boxCards = cards.filter((c) => !c.deleted && c.subject === subjectId);
    if (boxCards.length === 0) {
      await robotAlert("Cette boîte est vide : ajoute des fiches avant de la partager.");
      return;
    }
    const name = prompt("Nom de la collection à partager :", s.name);
    if (!name || !name.trim()) return;
    const { error } = await Sync.library.share(name.trim(), boxCards);
    if (error) {
      await robotAlert(`Le partage a échoué : ${error}`);
      return;
    }
    await robotAlert(`« ${name.trim()} » a été partagée dans la bibliothèque.`);
  }

  // {klass} de la discussion actuellement ouverte, ou null.
  let messageThreadContext = null;
  let unsubscribeMessageThreadRealtime = null;
  // Id des messages déjà affichés dans le fil ouvert — évite un doublon
  // quand le message qu'on vient d'envoyer nous revient aussi par le
  // canal temps réel (voir sendClassMessage plus bas).
  let messageThreadRenderedIds = new Set();

  function formatMessageTime(iso) {
    try {
      return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }
  function messageBubbleHtml(msg, klass) {
    const isMine = !!(accountCurrentUser && msg.sender_id === accountCurrentUser.id);
    const isTeacherMsg = msg.sender_id === klass.teacher_id;
    const side = isTeacherMsg ? "right" : "left";
    const cls = ["message-bubble", `message-bubble--${side}`, isMine ? "message-bubble--mine" : ""].filter(Boolean).join(" ");
    return `
      <div class="${cls}">
        ${!isMine ? `<span class="message-bubble-sender">${escapeHtml(msg.sender_email || "")}</span>` : ""}
        <span class="message-bubble-body">${escapeHtml(msg.body || "")}</span>
        <span class="message-bubble-time">${formatMessageTime(msg.created_at)}</span>
      </div>
    `;
  }
  function appendMessageToThread(msg) {
    if (!msg || !msg.id || messageThreadRenderedIds.has(msg.id) || !messageThreadContext) return;
    messageThreadRenderedIds.add(msg.id);
    const listEl = el("message-thread-list");
    if (!listEl) return;
    listEl.insertAdjacentHTML("beforeend", messageBubbleHtml(msg, messageThreadContext.klass));
    listEl.scrollTop = listEl.scrollHeight;
  }
  async function renderMessageThread() {
    if (!messageThreadContext) return;
    const { klass } = messageThreadContext;
    const listEl = el("message-thread-list");
    if (!listEl) return;
    const messages = await Sync.messages.list(klass.id);
    messageThreadRenderedIds = new Set(messages.map((m) => m.id));
    listEl.innerHTML = messages.map((m) => messageBubbleHtml(m, klass)).join("");
    listEl.scrollTop = listEl.scrollHeight;
  }

  async function openMessageThread(klass) {
    messageThreadContext = { klass };
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-message-thread").classList.add("is-active");
    applyBodyLogoSpeech("message-thread");
    const titleEl = el("message-thread-title");
    if (titleEl) titleEl.textContent = klass.name;
    await renderMessageThread();
    markClassMessagesRead(klass.id);
    refreshMessagesBadge();
    if (unsubscribeMessageThreadRealtime) {
      unsubscribeMessageThreadRealtime();
      unsubscribeMessageThreadRealtime = null;
    }
    unsubscribeMessageThreadRealtime = Sync.messages.subscribeRealtime(klass.id, (msg) => {
      appendMessageToThread(msg);
      markClassMessagesRead(klass.id);
      refreshMessagesBadge();
    });
  }
  function closeMessageThread() {
    if (unsubscribeMessageThreadRealtime) {
      unsubscribeMessageThreadRealtime();
      unsubscribeMessageThreadRealtime = null;
    }
    messageThreadContext = null;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-messages").classList.add("is-active");
    applyBodyLogoSpeech("messages");
    renderMessagesView();
  }

  const messagesGotoAccountBtn = el("messages-goto-account-btn");
  if (messagesGotoAccountBtn) {
    messagesGotoAccountBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="account"]');
      if (tab) tab.click();
    });
  }
  const messageThreadBackBtn = el("message-thread-back-btn");
  if (messageThreadBackBtn) messageThreadBackBtn.addEventListener("click", closeMessageThread);

  const messageThreadForm = el("message-thread-form");
  if (messageThreadForm) {
    messageThreadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!messageThreadContext) return;
      const input = el("message-thread-input");
      const body = (input.value || "").trim();
      if (!body) return;
      input.value = "";
      const { data, error } = await Sync.messages.send(messageThreadContext.klass.id, body);
      if (error) {
        await robotAlert("Erreur d'envoi : " + error);
        return;
      }
      if (data) {
        appendMessageToThread(data);
        markClassMessagesRead(messageThreadContext.klass.id);
      }
    });
  }

  /** Trouve (ou crée) localement la boîte référencée par une fiche distante, à partir de son id + nom dénormalisé. */
  async function ensureLocalSubjectFor(remote) {
    if (remote.subject && subjects.some((s) => s.id === remote.subject)) {
      return remote.subject;
    }
    if (remote.subject) {
      // Boîte inconnue sur cet appareil (créée ailleurs) : on la recrée avec le même id
      // pour que les deux appareils convergent vers la même boîte.
      const remoteName = remote.subjectName || "Boîte importée";

      // Évite les doublons "fantômes" : si une boîte locale du même nom
      // existe déjà mais n'a encore aucune fiche (typiquement le "Général"
      // créé automatiquement au tout premier lancement de l'appli, avant la
      // toute première synchronisation), on la remplace par celle du serveur
      // au lieu d'en garder deux — sinon chaque nouvel appareil qui se
      // connecte fait apparaître une boîte "Général" vide supplémentaire.
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
    // Fiche distante ancienne, sans boîte renseignée : on la range dans "Général".
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
   *  Règle importante : une ligne distante sans boîte renseignée (donnée
   *  ancienne, d'avant l'introduction des boîtes) ne doit jamais dégrader
   *  une fiche déjà correctement classée localement — sinon une simple
   *  synchronisation peut faire "retomber" une fiche dans Général. */
  async function mergeRemoteCard(remote) {
    const idx = cards.findIndex((c) => c.id === remote.id);
    const local = idx >= 0 ? cards[idx] : null;

    if (remote.deleted) {
      // Fiche supprimée : elle ne sera jamais affichée (partout on filtre sur
      // !c.deleted), donc pas besoin de résoudre une vraie boîte pour elle.
      // Important : si on appelait ensureLocalSubjectFor ici, une boîte
      // qu'on vient de supprimer localement (avec toutes ses fiches) serait
      // recréée dès qu'on récupère ces mêmes fiches (supprimées) depuis
      // Supabase — c'est ce qui faisait "réapparaître" la boîte supprimée
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

  /** Ajoute discrètement à la file en cours les fiches dues de la boîte active
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

  /** Fusionne une boîte reçue de Supabase : adoptée si plus récente que
   *  la version locale, retirée localement si marquée supprimée là-bas
   *  (voir pushSubjectDeleted) — jamais l'inverse (une suppression locale
   *  ne doit pas ressusciter une boîte plus récente créée ailleurs). */
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

  /** Fusionne un mode d'apprentissage reçu de Supabase (item 1, audit
   *  synchro) : jamais synchronisé avant — un mode personnalisé créé sur un
   *  appareil restait invisible sur les autres, qui retombaient
   *  silencieusement sur "Normal" pour toute boîte qui l'utilisait. */
  async function mergeRemoteLearningMode(remote) {
    const modes = loadLearningModes();
    if (remote.deleted) {
      if (modes[remote.id] && !modes[remote.id].builtin) {
        delete modes[remote.id];
        saveLearningModes(modes);
      }
      return;
    }
    const local = modes[remote.id];
    if (!local || new Date(remote.updatedAt || 0) > new Date(local.updatedAt || 0)) {
      modes[remote.id] = { ...remote };
      saveLearningModes(modes);
    }
  }

  async function reconcileLearningModes() {
    const remoteModes = await Sync.pullLearningModes();
    const remoteById = new Map(remoteModes.map((r) => [r.id, r]));
    const localModes = loadLearningModes();
    for (const local of Object.values(localModes)) {
      const remote = remoteById.get(local.id);
      if (!remote || new Date(local.updatedAt || 0) > new Date(remote.updatedAt || 0)) {
        Sync.pushLearningMode(local);
      }
    }
    for (const remote of remoteModes) {
      await mergeRemoteLearningMode(remote);
    }
  }

  /** Vérifie qu'accepter ce parentId ne créerait pas de cycle (dossier qui
   *  finit par être son propre ancêtre) — peut arriver après une fusion de
   *  synchro malheureuse (deux appareils qui déplacent des dossiers l'un
   *  dans l'autre en même temps). Si un cycle serait créé, on rattache le
   *  dossier à la racine à la place plutôt que de risquer de figer l'appli
   *  partout où l'arborescence est parcourue. */
  function wouldCreateFolderCycle(folderId, candidateParentId, folderList) {
    let cur = candidateParentId;
    const visited = new Set();
    while (cur) {
      if (cur === folderId || visited.has(cur)) return true;
      visited.add(cur);
      const f = folderList.find((x) => x.id === cur);
      if (!f) break;
      cur = f.parentId;
    }
    return false;
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
      const candidateFolders = idx >= 0 ? folders.map((f, i) => (i === idx ? remote : f)) : [...folders, remote];
      if (remote.parentId && wouldCreateFolderCycle(remote.id, remote.parentId, candidateFolders)) {
        remote = { ...remote, parentId: ROOT_FOLDER_ID };
      }
      await DB.putFolder(remote);
      if (idx >= 0) folders[idx] = remote;
      else folders.push(remote);
    }
  }

  /** Même logique que reconcileWithRemote (fiches), pour les boîtes et
   *  les dossiers (item 1/8). Dossiers d'abord : une boîte peut référencer
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

  /** Applique TOUS les réglages du mode développeur d'un coup (item —
   *  centralisé pour la synchro) : à chaque fois qu'on adopte des réglages
   *  reçus d'un autre appareil, il faut rejouer exactement les mêmes
   *  fonctions qu'au démarrage local, sinon certains réglages plus
   *  récemment ajoutés (ombrage, disposition de l'accueil...) restent
   *  ignorés après une synchro — c'était le bug : la fonction de synchro
   *  n'avait pas été tenue à jour à chaque nouveau réglage ajouté. */
  function applyAllDevSettings() {
    applyRatingLabels();
    applyNavLabels();
    applyHomeIcons();
    applyHomeLayout();
    applyReviewLayout();
    applyShowRatingDays();
    applyShowReviewChart();
    applyColorSettings();
    applyShadowSettings();
    applyIconSettings();
    applyTextColorPalette();
  }
  // Bug corrigé (item 6) : cet écouteur vivait DANS applyAllDevSettings, qui
  // peut s'exécuter plusieurs fois (démarrage, synchro) — il s'accumulait
  // donc en plusieurs exemplaires. Pire : il recalculait la disposition de
  // Réviser sur CHAQUE redimensionnement, y compris ceux causés par
  // l'ouverture du clavier virtuel en tapant dans un tout autre champ (par
  // ex. un réglage numérique du mode développeur) — le clavier réduit
  // alors window.innerHeight, et les positions de la fiche (en pixels,
  // calculées depuis cette hauteur réduite) restaient figées ainsi même
  // une fois le clavier refermé : fiche minuscule, tout serré en haut de
  // l'écran. Un seul écouteur, posé une fois pour toutes, qui ne
  // recalcule que si Réviser est la page réellement affichée.
  window.addEventListener("resize", () => {
    if (el("view-review") && el("view-review").classList.contains("is-active")) applyReviewLayout();
  });

  /** Fusionne les réglages développeur reçus (item 1) : le plus récent
   *  (comparé via updatedAt) l'emporte intégralement — contrairement aux
   *  fiches, il n'y a pas de fusion champ par champ ici, un réglage de
   *  couleurs est cohérent seulement pris comme un tout. */
  async function reconcileDevSettings() {
    // Round 4, partie 3 : un appareil qui n'a JAMAIS personnalisé le mode
    // développeur (immense majorité des élèves/profs, mais aussi
    // Stéphane sur un tout nouvel appareil pas encore touché) n'a rien
    // de "personnel" à synchroniser ici — le laisser participer quand
    // même figerait, dès sa toute première connexion, un instantané
    // complet (valeurs par défaut + réglages publics du moment) dans son
    // stockage local, qui empêcherait ensuite toute future publication
    // de s'y appliquer (voir loadDevSettings : le local l'emporte
    // toujours sur le public). On ne pousse donc RIEN côté serveur tant
    // qu'il n'y a pas de VRAIE personnalisation locale.
    // Cloisonné par Compte connecté depuis le round 6 (voir
    // currentAccountEmailForSync) — corrige une fuite entre deux Comptes
    // utilisant le même code de synchro perso.
    const accountEmail = await currentAccountEmailForSync();
    const hasLocalCustomization = localStorage.getItem(DEV_SETTINGS_KEY) !== null;
    const remote = await Sync.pullDevSettings(accountEmail);
    const local = loadDevSettings();
    if (!remote) {
      if (hasLocalCustomization) {
        // Rien côté serveur : on y pousse notre réglage local tel quel.
        Sync.pushDevSettings({ ...local, appPrefs: gatherAppPrefs() }, accountEmail);
      }
      return;
    }
    const remoteTime = new Date(remote.updatedAt || 0).getTime();
    const localTime = hasLocalCustomization ? new Date(local.updatedAt || 0).getTime() : 0;
    if (remoteTime > localTime) {
      // Un autre de TES appareils (même code de synchro ET même Compte
      // connecté) a poussé une vraie personnalisation plus récente : on
      // l'adopte.
      localStorage.setItem(DEV_SETTINGS_KEY, JSON.stringify(remote.payload));
      applyAllDevSettings();
      applyAppPrefsFromRemote(remote.payload.appPrefs);
    } else if (hasLocalCustomization && localTime > remoteTime) {
      Sync.pushDevSettings({ ...local, appPrefs: gatherAppPrefs() }, accountEmail);
    }
  }

  async function reconcileWithRemote() {
    await reconcileDevSettings();
    await reconcileLearningModes();
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

    // Item 6 (dernier lot) : bug corrigé — la boîte "Général" créée
    // automatiquement au tout premier lancement (avant toute connexion)
    // restait ensuite comme un dossier fantôme vide une fois la vraie
    // synchro établie, même quand elle apportait ses propres données.
    await cleanupPlaceholderGeneral();

    renderAll();
    updateSyncStatus();
  }

  /** Supprime la boîte "Général" issue du tout premier démarrage si elle
   *  est toujours vide une fois que de vraies données (autre boîte ou
   *  dossier) sont là — sans jamais toucher une boîte "Général" que
   *  l'utilisateur aurait lui-même gardée ou remplie. */
  async function cleanupPlaceholderGeneral() {
    const candidates = subjects.filter((s) => s.name === "Général" && s.folderId === ROOT_FOLDER_ID);
    if (candidates.length !== 1) return; // rien à nettoyer, ou pas notre affaire (dédup gère les doublons)
    const general = candidates[0];
    const hasCards = cards.some((c) => c.subject === general.id && !c.deleted);
    if (hasCards) return;
    const hasOtherData = subjects.length > 1 || folders.length > 0;
    if (!hasOtherData) return;
    await DB.removeSubject(general.id);
    subjects = subjects.filter((x) => x.id !== general.id);
    if (currentSubjectId === general.id && subjects.length > 0) {
      currentSubjectId = subjects[0].id;
      localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
    }
  }

  async function connectSync() {
    if (!Sync.isConfigured()) return;
    if (unsubscribeRealtime) unsubscribeRealtime();
    if (unsubscribeSubjectsRealtime) unsubscribeSubjectsRealtime();
    if (unsubscribeFoldersRealtime) unsubscribeFoldersRealtime();
    if (unsubscribeLearningModesRealtime) unsubscribeLearningModesRealtime();
    if (unsubscribeDevSettingsRealtime) unsubscribeDevSettingsRealtime();

    // Round 4, partie 3 : réglages développeur publiés pour tout le
    // monde — récupérés AVANT le reste, pour que la synchro perso
    // (reconcileWithRemote, juste après) parte déjà d'une base à jour.
    await loadPublicDevSettingsForEveryone();

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
    unsubscribeLearningModesRealtime = Sync.subscribeLearningModesRealtime(async (remote) => {
      await mergeRemoteLearningMode(remote);
      renderSubjectManageList();
      renderSubjectAlgoBadge();
    });
    await subscribeDevSettingsForCurrentAccount();

    updateSyncStatus();
  }

  /** Callback de l'abonnement Realtime aux réglages développeur perso —
   *  factorisé (round 6) pour être réutilisé aussi bien au démarrage
   *  (connectSync) qu'à un changement de Compte en cours de session (voir
   *  subscribeDevSettingsForCurrentAccount / Sync.auth.onChange). */
  function handleRemoteDevSettings(remote) {
    // Dernier écrit gagne (item 1) : un autre appareil vient de changer
    // un réglage (couleur, icône...), on adopte tel quel si plus récent.
    const local = loadDevSettings();
    if (new Date(remote.updatedAt || 0) > new Date(local.updatedAt || 0)) {
      localStorage.setItem(DEV_SETTINGS_KEY, JSON.stringify(remote.payload));
      applyAllDevSettings();
      applyAppPrefsFromRemote(remote.payload.appPrefs);
      // Bug corrigé (items 1/2) : si l'utilisateur est EN TRAIN de taper
      // dans un champ du mode développeur, reconstruire toute la liste
      // (renderDevView) à cet instant précis lui fait perdre le focus en
      // plein milieu de la frappe — ou, pour le mode nuit, fait
      // clignoter l'état si l'écho de sa propre modification revient
      // alors qu'il vient justement de la changer. On saute ce rendu
      // tant qu'un champ de ce panneau a le focus ; il se remettra à
      // jour de toute façon au prochain rendu normal (changement de
      // page, nouvelle modification, etc.).
      const devViewActive = el("view-dev") && el("view-dev").classList.contains("is-active");
      const editingInDevView = document.activeElement && el("view-dev") && el("view-dev").contains(document.activeElement) && document.activeElement.tagName === "INPUT";
      if (devViewActive && !editingInDevView) renderDevView();
    }
  }
  /** (Ré)abonne le canal Realtime des réglages développeur perso avec le
   *  Compte ACTUELLEMENT connecté (round 6) — désabonne d'abord l'ancien
   *  abonnement s'il y en avait un, pour ne jamais en garder deux en
   *  parallèle (ex. juste après un changement de Compte). */
  async function subscribeDevSettingsForCurrentAccount() {
    if (unsubscribeDevSettingsRealtime) {
      unsubscribeDevSettingsRealtime();
      unsubscribeDevSettingsRealtime = null;
    }
    if (!Sync.isConfigured()) return;
    try {
      const accountEmail = await currentAccountEmailForSync();
      unsubscribeDevSettingsRealtime = Sync.subscribeDevSettingsRealtime(handleRemoteDevSettings, accountEmail);
    } catch (e) {
      // Best-effort, comme le reste de la synchro temps réel : sans
      // abonnement Realtime, les réglages dev restent quand même à jour
      // au prochain reconcileDevSettings() (démarrage, changement de
      // Compte, ouverture de la page Développeur...).
      console.warn("Réglages dev : échec de l'abonnement temps réel", e);
    }
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
      if (el("view-stats") && el("view-stats").classList.contains("is-active")) { renderDueChart(); }
      if (el("view-review") && el("view-review").classList.contains("is-active")) renderReviewChart();
    }, 150);
  });

  /* ---------------------------------------------------------
     Service worker (hors-ligne + mise à jour automatique)
  --------------------------------------------------------- */
  const appVersionLabelEl = el("app-version-label");
  if (appVersionLabelEl) appVersionLabelEl.textContent = `Version installée : ${APP_VERSION}`;
  // Round 4, partie 2 : geste discret pour débloquer le mode développeur
  // sur cet appareil (7 appuis rapides sur le numéro de version) — le
  // bouton/onglet "Développeur" reste caché pour tout le monde tant que ce
  // geste n'a pas été fait.
  if (appVersionLabelEl) {
    let devTapCount = 0;
    let devTapTimer = null;
    appVersionLabelEl.style.cursor = "pointer";
    appVersionLabelEl.addEventListener("click", () => {
      if (isDevUnlocked()) return;
      devTapCount += 1;
      clearTimeout(devTapTimer);
      devTapTimer = setTimeout(() => {
        devTapCount = 0;
      }, 1500);
      if (devTapCount >= 7) {
        devTapCount = 0;
        setDevUnlocked(true);
        robotAlert("Mode développeur débloqué sur cet appareil.");
      }
    });
  }
  updateDevModeVisibility();
  const checkUpdateBtn = el("check-update-btn");
  const checkUpdateResultEl = el("check-update-result");
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

          // Bouton "Vérifier les mises à jour" (Réglages) : les
          // déclencheurs automatiques ci-dessus ne se déclenchent pas
          // toujours de façon fiable sur iPhone quand l'appli est
          // rouverte depuis le multitâche plutôt qu'à froid — ce bouton
          // permet de forcer la vérification et donne un retour explicite.
          if (checkUpdateBtn) {
            checkUpdateBtn.addEventListener("click", async () => {
              if (checkUpdateResultEl) checkUpdateResultEl.textContent = "Vérification…";
              try {
                await registration.update();
                // Si une mise à jour est trouvée, elle passe par "installing"
                // puis "waiting"/"activating" — skipWaiting() côté sw.js
                // l'active tout de suite, ce qui déclenche déjà
                // controllerchange (rechargement automatique). On ne voit
                // donc ce message QUE si aucune mise à jour n'a été trouvée.
                setTimeout(() => {
                  if (checkUpdateResultEl) checkUpdateResultEl.textContent = "Déjà à jour (aucune nouvelle version trouvée).";
                }, 1200);
              } catch {
                if (checkUpdateResultEl) checkUpdateResultEl.textContent = "Échec de la vérification — vérifie ta connexion.";
              }
            });
          }
        })
        .catch(() => {
          /* l'appli reste utilisable même si le SW échoue à s'enregistrer */
        });
    });
  } else if (checkUpdateBtn) {
    checkUpdateBtn.disabled = true;
    if (checkUpdateResultEl) checkUpdateResultEl.textContent = "Non pris en charge par ce navigateur.";
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
    applyAllDevSettings();
    applyCardFontSize();
    // (Item 3 : l'affichage Organisation est initialisé plus haut, au
    // moment où ses boutons pictos s'accrochent — plus besoin d'appel ici.)
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
    // Item 7 : appel complet maintenant que tout est chargé (voir plus haut
    // pour le pourquoi du report).
    setNightModeActive(new Date().getHours() < 7 || new Date().getHours() >= 20);
    startReviewSession();
    updateSyncStatus();
    // L'essentiel de l'UI est rendu et interactif : on désarme le filet de
    // sécurité anti-écran-blanc (voir le <script> tout en haut du <head>).
    // La synchro Supabase qui suit peut échouer sans que ça bloque l'appli.
    if (window.__clearBootWatchdog) window.__clearBootWatchdog();
    if (window.__clearBootRetryFlag) window.__clearBootRetryFlag();
    if (Sync.isConfigured()) {
      // Correctif : ce bloc n'était protégé par aucun try/catch — un
      // accroc réseau ponctuel pendant connectSync() (ou l'une des étapes
      // suivantes) levait une exception qui interrompait silencieusement
      // TOUT le reste du démarrage, y compris ce qui suit (dont, plus bas,
      // la reconnexion automatique au compte Classes). On l'isole donc
      // pour que la sync perso ne puisse plus jamais bloquer le reste.
      try {
        await connectSync();
        // Doublons "Général" : reconcileWithRemote() peut faire apparaître un
        // second sujet "Général" arrivé du serveur (fiches distantes sans
        // boîte) en plus de celui créé localement par défaut avant même que
        // la synchro n'ait eu le temps de tourner (voir loadSubjects) — d'où
        // la boîte "Générale" qui apparaissait parfois à la toute première
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
      } catch (e) {
        console.warn("Sync perso : échec au démarrage (l'appli continue en local)", e);
      }
    }
    // Item 1/2 (Classes) : retrouve une éventuelle session déjà ouverte
    // (compte Supabase persistant) et lance en tâche de fond la synchro
    // des boîtes partagées d'un élève — indépendant du reste de la sync
    // perso ci-dessus, peut échouer sans bloquer l'appli.
    initAccountState();
  })();
})();
