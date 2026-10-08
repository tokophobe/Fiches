(() => {
  "use strict";

  // Version affichée dans Réglages (bouton "Vérifier les mises à jour") —
  // à garder alignée avec CACHE_NAME dans sw.js à chaque livraison, pour
  // que l'utilisateur puisse vérifier facilement s'il a bien la dernière
  // version installée.
  const APP_VERSION = "v199";

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
    // Round 21, item 5 : pièce de jeton — un cercle simple (contour de
    // pièce) + un repère central, pour rester dans le même style
    // monochrome/traits que le reste de la banque plutôt qu'un émoji
    // (dont la couleur ne peut pas se régler en CSS) ; coloré en "or" via
    // `color` sur l'élément englobant (voir .token-chip).
    coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 8.3v7.4"/>',
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
  // Round 39 : déclaré tôt (utilisé par renderManageList dès le démarrage).
  let cardsEntryFromCreations = false;
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
  // Round 42 : hibernation supprimée (bouton retiré de la page).
  const hibernateCurrentBtn = null;

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

  // Round 26, item 5 : les modes d'apprentissage (Cool/Normal/Renforcé/
  // personnalisés, coefficients K/M par boîte) sont abandonnés — la
  // planification passe entièrement par le nouvel algorithme global
  // (computeAlgoNext, réglages "revisionAlgo" du mode développeur).
  // Couleurs/libellés des 4 notes dans les graphiques de Statistiques
  // (conservés : ils étaient définis avec l'ancienne page des modes).
  const ALGO_CHART_COLORS = {
    again: "var(--rating-again-color, var(--terracotta))",
    hard: "var(--rating-hard-color, var(--amber))",
    good: "var(--rating-good-color, var(--sage))",
    easy: "var(--rating-easy-color, var(--teal))",
  };
  const ALGO_CHART_RATING_LABELS = { again: "Encore", hard: "Difficile", good: "Bien", easy: "Facile" };


  /* ---------------------------------------------------------
     Page Développeur (item 19) : réglages internes — émoticônes/texte des
     boutons de notation et du menu principal, couleurs, algorithme de
     révision… Cachée derrière un simple onglet pour l'instant ; une
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
  // Round 13 : "cards" et "sync" ne sont plus des cercles d'accueil (Fiches
  // se rejoint désormais via Mon bureau, Synchronisation via Mon compte) —
  // retirés d'ici pour ne plus proposer une icône éditable pour un cercle
  // qui n'existe plus sur l'accueil.
  const DEFAULT_NAV_ICONS = {
    review: "cards", manage: "folder", stats: "barChart", settings: "settings",
    addCard: "plus", calendar: "calendar", dev: "code", library: "book",
  };
  // Couleurs des 4 notes (boutons d'évaluation + graphiques) — item 2 :
  // rendues éditables depuis la page Développeur plutôt que codées en dur
  // dans la feuille de style.
  const DEFAULT_RATING_COLORS = { again: "#b6604a", hard: "#cf9a4d", good: "#6f8b5c", easy: "#3e7c6b" };
  // Fond partagé des 4 boutons d'évaluation (item 4) — une seule couleur,
  // désormais séparée de la couleur de chaque note (qui teinte l'icône).
  const DEFAULT_RATING_BTN_BG_COLOR = "#ffffff";
  const DEFAULT_NIGHT_RATING_BTN_BG_COLOR = "#1c2330";
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
    // Round 30 : bouton « Librairie » de l'accueil (déplacé depuis Fiches),
    // avec sa propre couleur.
    homeLibraryBg: "#8a63c9",
    // Round 31 : fond de la page Librairie (par défaut, celui des autres pages).
    libraryPageBg: "#eef2f8",
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
    homeLibraryBg: "#6d4fa3",
    libraryPageBg: "#11151c",
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

  // Algorithme de révision v2 (round 42, spécification « algo_new3 »
  // validée par Stéphane le 7 octobre). Toutes les durées en MINUTES.
  // Chaque fiche porte :
  //  - dd         : dernier délai d'interrogation appliqué
  //  - lastReviewed : date de la dernière interrogation (TE = maintenant − elle)
  //  - lastRating : dernière note (0 à 3) — jauge 4 couleurs
  //  - inSprint / ddBeforeSprint / sprintNext / sprintUntil : mode sprint
  // Boutons : 0 = je ne sais pas (again), 1 = vague idée (hard),
  // 2 = je sais (good), 3 = je sais parfaitement (easy).
  //  Mode fond : NDI = (DD − TE) + TE × COEF_FOND, borné [PLANCHER ; PLAFOND]
  //  Mode sprint (au moins une échéance à venir pour la boîte) :
  //    NDI = mini(D_P_ECH − D_P_ECH / COEF_SPRINT ; NDI fond), D_P_ECH =
  //    temps restant jusqu'à 8 h le jour de l'échéance la plus proche
  //    (le jour même : 30 min fixes).
  const REVISION_ALGO_RATING_ORDER = ["again", "hard", "good", "easy"];
  const REVISION_ALGO_RATING_LABELS = {
    again: "0 — Je ne sais pas",
    hard: "1 — Vague idée",
    good: "2 — Je sais",
    easy: "3 — Parfaitement",
  };
  const REVISION_ALGO_VERSION = 2;
  const DEFAULT_REVISION_ALGO_SETTINGS = {
    version: REVISION_ALGO_VERSION,
    coefSprint: [1.03, 1.05, 2, 3],
    coefFond: [0, 0, 2, 3],
    plancherMin: [4320, 1440, 4320, 7200],
    plafondMin: [4320, 1440, 43200, 172800],
  };
  // Heure (locale) de référence d'une échéance, et délai fixe le jour même.
  const SPRINT_EVENT_HOUR = 8;
  const SPRINT_EVENT_DAY_DELAY_MIN = 30;
  // Nombre minimal d'autres fiches entre deux passages d'une même fiche.
  const SESSION_MIN_GAP = 10;
  // Jauge 4 couleurs : proportion des fiches selon leur dernière note
  // (jamais notée = 0). Dégradé du gris vers un joli vert. Les clés
  // historiques (court/moyen/long/tresLong) sont gardées pour la synchro
  // des réglages et correspondent aux notes 0/1/2/3.
  const DEFAULT_PERS_GAUGE_COLORS = {
    court: "#B8BEC6", // 0 — gris
    moyen: "#9DB5A2", // 1 — gris-vert
    long: "#86D69B", // 2 — vert clair
    tresLong: "#22C55E", // 3 — vert vif
  };
  const PERS_GAUGE_ZONE_ORDER = ["court", "moyen", "long", "tresLong"];
  const PERS_GAUGE_ZONE_LABELS = {
    court: "Je ne sais pas",
    moyen: "Vague idée",
    long: "Je sais",
    tresLong: "Parfait",
  };
  // Disposition dispersée de la page d'accueil (item 3) : position (x,y en
  // pixels, coin haut-gauche du cercle) + diamètre (px) par bouton — tailles
  // différentes selon l'importance (Réviser le plus grand, Développeur le
  // plus petit). Repères en pourcentage de la zone d'accueil (item — bug
  // corrigé : des pixels fixes, pensés pour ~390px de large, décalaient
  // tout vers la gauche sur un écran plus large comme un PC, puisque
  // l'appli s'adapte elle en largeur — le pourcentage, lui, suit toujours
  // la largeur réelle quel que soit l'appareil).
  // Round 13 : "cards", "sync", "messages" et "library" ne sont plus des
  // cercles d'accueil (retirés du DOM — voir index.html) ; conservés ici
  // uniquement s'ils restent référencés ailleurs, sinon retirés. Libellés
  // mis à jour pour "manage" (Mon bureau) et "classes" (École).
  const HOME_LAYOUT_TITLES = {
    review: "Réviser", manage: "Gérer mes fiches", addCard: "Ajouter une fiche",
    stats: "Statistiques", settings: "Réglages", calendar: "Calendrier",
    dev: "Développeur", classes: "École", account: "Compte",
    library: "Librairie",
  };
  // Largeur/hauteur de référence utilisées uniquement pour convertir une
  // seule fois d'anciens réglages enregistrés en pixels (avant ce
  // correctif) vers des pourcentages équivalents.
  const HOME_LAYOUT_LEGACY_REF_WIDTH = 354;
  const HOME_LAYOUT_LEGACY_REF_HEIGHT = 640;
  // Round 13 : 9 cercles d'accueil seulement (cards/sync/messages/library
  // retirés — voir index.html) ; positions reprises au plus proche de
  // l'ancien agencement.
  const DEFAULT_HOME_LAYOUT = {
    addCard: { x: 73.4, y: 14.9, d: 110 },
    review: { x: 26.1, y: 13.7, d: 155 },
    manage: { x: 79.8, y: 59.0, d: 95 },
    classes: { x: 50.0, y: 26.5, d: 95 },
    calendar: { x: 39.5, y: 54.7, d: 100 },
    stats: { x: 77.7, y: 37.5, d: 100 },
    settings: { x: 16.2, y: 73.8, d: 85 },
    account: { x: 15.0, y: 90.0, d: 70 },
    dev: { x: 89.0, y: 79.0, d: 80 },
    // Round 30 : Librairie, déplacée de la page Fiches vers l'accueil.
    library: { x: 17.0, y: 40.0, d: 90 },
  };
  // Items 1/2 (logo) : position (X/Y en %, centre du logo) et taille (px)
  // du logo sur la page d'accueil.
  const DEFAULT_HOME_LOGO = { x: 50, y: 7, size: 64, shadow: false };
  // Items 1/2/6 (dernier lot) : logo affiché en haut du corps de chaque
  // autre page (taille + ombre, indépendantes de celles de l'accueil).
  const DEFAULT_BODY_LOGO = { size: 40, shadow: false };
  // Round 14 : logo "darwin" affiché en plus du robot sur l'accueil —
  // position/taille/ombre TOUTES réglables en mode développeur (à la
  // différence du logo robot ci-dessus, dont l'ombre est un réglage
  // utilisateur séparé dans Réglages).
  // Placé par défaut sous les cercles (zone dédiée par le padding-bottom
  // supplémentaire de #view-home, voir css/style.css), pour ne chevaucher
  // aucun cercle avec la disposition par défaut.
  // Round 15, item 2 : couleur du logo darwin (partagée avec sa petite
  // version dans le bandeau du haut) — bleu par défaut (--blue), le noir
  // d'origine ayant été jugé trop dur ; réglable en mode développeur.
  const DEFAULT_DARWIN_LOGO = { x: 50, y: 88, size: 70, shadow: false, color: "#4a90d9" };
  // Round 14 : texte optionnel sous le logo darwin — contenu/position/
  // taille réglables en mode développeur ; vide par défaut (masqué tant
  // que rien n'est saisi).
  const DEFAULT_DARWIN_TEXT = { x: 50, y: 95, size: 11, content: "" };
  // Items 4 et 5 : le robot (logo en haut du corps de page) peut porter un
  // ou plusieurs messages d'aide selon la page — un tableau permet une
  // petite série façon tuto (voir bouton "Suite", round 4), une simple
  // chaîne reste acceptée pour un message unique.
  const DEFAULT_HELP_MESSAGES_BY_VIEW = {
    manage: ["Range ici tes boîtes dans des dossiers. Pour créer une nouvelle boîte, passe par « Mes créations de fiches »."],
    "manage-creations": ["Ici, seulement les boîtes que tu as créées toi-même. L'interrupteur ne garde que celles publiées dans la Librairie."],
    "creation-detail": [],
    "report-card": ["Explique à l'auteur ce qui ne va pas dans cette fiche : il recevra ton message et pourra la corriger."],
    reports: ["Voici les fiches que d'autres utilisateurs t'ont signalées. Corrige-les, puis marque le signalement comme traité."],
    "box-create": ["Donne un nom à ta boîte et classe-la : ce classement servira aux filtres, et sera repris si tu la publies dans la Librairie."],
    creations: ["Ici, toutes les boîtes que tu as créées. Publie-les dans la Librairie, ou ajoute-les à tes révisions pour les ranger dans Mes fiches de révision."],
    "fiches-hub": [],
    "review-hub": [],
    "revision-program": ["A ta place, voici ce que je réviserais en priorité, dans l'ordre :"],
    review: [],
    cards: [],
    stats: [],
    sync: [],
    // Round 18, item 12 : texte d'intro déplacé de la page vers le robot
    // (message d'aide par défaut, éditable en mode développeur).
    calendar: ["Note ici tes échéances (contrôle, interrogation, partiels, bac...) liées à une boîte ou un dossier. De quoi, plus tard, générer automatiquement un programme de révision."],
    classes: [],
    "classes-student": [],
    "classes-teacher": [],
    "class-detail": [],
    account: [],
    settings: [],
    dev: [],
    "new-card": [],
    "boite-picker": [],
    "calendar-event-form": [],
    messages: [],
    "message-thread": [],
    library: ["Ici, tu peux prendre des collections de fiches partagées par d'autres — elles s'ajoutent à tes collections, avec cette icône en réseau pour les reconnaître."],
  };
  // Round 4, partie 2 : intitulés amicaux de chaque page, pour l'éditeur du
  // mode développeur — mêmes clés que DEFAULT_HELP_MESSAGES_BY_VIEW.
  const HELP_VIEW_LABELS = {
    review: "Réviser",
    manage: "Mes fiches de révision (Organisation)",
    "manage-creations": "Mes créations de fiches (ancienne page)",
    creations: "Mes créations de fiches",
    "box-create": "Mes créations — créer une boîte",
    "creation-detail": "Mes créations — page d'une boîte",
    "report-card": "Signaler une fiche à son auteur",
    reports: "Signalements reçus",
    "fiches-hub": "Gérer mes fiches (choix)",
    cards: "Fiches",
    stats: "Statistiques",
    sync: "Synchronisation",
    calendar: "Calendrier",
    "review-hub": "Réviser (choix)",
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
    "calendar-event-form": "Calendrier — ajouter/modifier un événement",
    messages: "Messagerie",
    "message-thread": "Messagerie — discussion",
    library: "Librairie",
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
    // Round 45 : le titre de la page laisse sa place à la bulle du robot.
    const pageTitleEl = el("page-header-title");
    if (pageTitleEl) pageTitleEl.hidden = isOpen || !pageTitleEl.textContent;
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
    // "Précédent"/"Suite"/"Fermer", qui ont leur propre comportement).
    bodyLogoSpeechEl.addEventListener("click", (e) => {
      if (
        e.target.closest("#body-logo-speech-next") ||
        e.target.closest("#body-logo-speech-prev") ||
        e.target.closest("#body-logo-speech-close")
      )
        return;
      renderBodyLogoSpeechState(false);
    });
  }
  // Round 18, item 6 : bouton fermer explicite, en plus du clic sur la
  // bulle elle-même (peu évident sans le savoir).
  const bodyLogoSpeechCloseBtn = el("body-logo-speech-close");
  if (bodyLogoSpeechCloseBtn) {
    bodyLogoSpeechCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
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
  /** Round 11 (suite de l'item 6, round 10) : Stéphane a signalé qu'un
   *  second robot, distinct de celui déjà affiché en haut de la page
   *  (#body-logo hors accueil, #home-logo sur l'accueil), apparaissait
   *  dans la modale — un logo dupliqué codé en dur dans son balisage. Ici,
   *  on repère plutôt le robot RÉELLEMENT visible à l'écran à cet instant
   *  et on épingle la bulle juste en dessous de lui (ou au-dessus, s'il
   *  n'y a pas la place en bas de l'écran), en le faisant ressortir
   *  au-dessus de l'assombrissement (même z-index que la bulle) — c'est
   *  bien LUI qui "parle", l'effet d'assombrissement du reste de la page
   *  restant identique à avant. Repli (très rare, ex. tout premier rendu
   *  avant que la page ait affiché un logo) : bulle centrée sans flèche,
   *  comme avant round 11 mais toujours sans logo dupliqué. */
  let robotModalHighlightedLogo = null;
  function clearRobotModalHighlight() {
    if (robotModalHighlightedLogo) {
      robotModalHighlightedLogo.style.visibility = "";
      robotModalHighlightedLogo = null;
    }
    const clone = document.getElementById("robot-modal-logo-clone");
    if (clone) clone.remove();
  }
  /* Round 39 : seul le robot reste éclairé au-dessus de l'assombrissement
     (avant, tout le bandeau du haut passait devant). On pose une copie du
     robot, en position fixe, exactement à sa place et au-dessus du voile ;
     l'original reste dans le bandeau, assombri avec le reste. */
  function showRobotLogoClone(logo, rect) {
    const clone = logo.cloneNode(true);
    clone.id = "robot-modal-logo-clone";
    clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    clone.classList.add("robot-modal-logo-clone");
    Object.assign(clone.style, {
      position: "fixed",
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
      margin: "0",
      zIndex: "2003",
      pointerEvents: "none",
    });
    document.body.appendChild(clone);
    logo.style.visibility = "hidden";
  }
  function findVisibleRobotLogo() {
    const homeView = el("view-home");
    if (homeView && homeView.classList.contains("is-active")) {
      const homeLogo = el("home-logo");
      if (homeLogo && homeLogo.offsetParent !== null) return homeLogo;
    }
    const bodyLogoRow = el("body-logo-row");
    if (bodyLogoRow && !bodyLogoRow.hidden) {
      const bodyLogo = el("body-logo");
      if (bodyLogo && bodyLogo.offsetParent !== null) return bodyLogo;
    }
    return null;
  }
  function positionRobotModal() {
    const modal = el("robot-modal");
    const bubble = el("robot-modal-bubble");
    if (!modal || !bubble) return;
    clearRobotModalHighlight();
    const logo = findVisibleRobotLogo();
    bubble.classList.remove("robot-modal-bubble--arrow-top", "robot-modal-bubble--arrow-bottom");
    if (!logo) {
      modal.classList.remove("robot-modal--anchored");
      modal.style.position = "";
      modal.style.left = "";
      modal.style.top = "";
      modal.style.width = "";
      return;
    }
    const rect = logo.getBoundingClientRect();
    const margin = 12;
    const maxWidth = Math.min(420, window.innerWidth - margin * 2);
    let left = rect.left - 8;
    left = Math.max(margin, Math.min(left, window.innerWidth - maxWidth - margin));
    // Round 19, item 9 : bug corrigé — sur certaines pages (ex.
    // "Fiches"/organisation, dont le bandeau fixe est plus haut que sur
    // les autres : il y intègre en plus + Nouveau dossier/Bibliothèque/
    // les 3 pictos, sous le robot), le bas RÉEL du robot ne correspond
    // plus au bas RÉEL du bandeau fixe — la bulle, positionnée juste sous
    // le robot, se retrouvait donc partiellement sous ce contenu
    // supplémentaire du bandeau (qui reste, lui, au-dessus en z-index).
    // On ne descend donc jamais la bulle plus haut que le vrai bas du
    // bandeau fixe entier, quel que soit son contenu.
    // Round 39 : le bandeau est maintenant assombri comme le reste — la
    // bulle peut se placer juste sous le robot.
    const effectiveTop = rect.bottom;
    const spaceBelow = window.innerHeight - effectiveTop;
    let top;
    modal.style.transform = "";
    if (spaceBelow >= 140 || rect.top < 140) {
      top = effectiveTop + 14;
      bubble.classList.add("robot-modal-bubble--arrow-top");
    } else {
      // Pas assez de place en dessous (le robot est bas dans la page) :
      // la bulle remonte au-dessus de lui à la place.
      top = Math.max(margin, rect.top - 14);
      modal.style.transform = "translateY(-100%)";
      bubble.classList.add("robot-modal-bubble--arrow-bottom");
    }
    modal.classList.add("robot-modal--anchored");
    modal.style.position = "fixed";
    modal.style.left = left + "px";
    modal.style.top = top + "px";
    modal.style.width = maxWidth + "px";
    const arrowX = Math.max(16, Math.min(rect.left + rect.width / 2 - left, maxWidth - 16));
    bubble.style.setProperty("--robot-arrow-x", arrowX + "px");
    showRobotLogoClone(logo, rect);
    robotModalHighlightedLogo = logo;
  }
  // Repositionne si la fenêtre change de taille (rotation d'écran, resize
  // PC) pendant qu'un message du robot est affiché.
  window.addEventListener("resize", () => {
    const overlay = el("robot-modal-overlay");
    if (overlay && !overlay.hidden) positionRobotModal();
  });
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
    const inputEl = el("robot-modal-input");
    if (!overlay || !textEl || !actions) {
      // Repli très défensif si jamais le balisage manque (ne devrait pas
      // arriver) : on ne bloque pas l'appli, on résout juste positivement.
      return Promise.resolve(buttons[buttons.length - 1].value);
    }
    return new Promise((resolve) => {
      textEl.textContent = text;
      actions.innerHTML = "";
      // Round 10, item 6 : variante "prompt" — un champ de saisie apparaît
      // au-dessus des boutons, et le bouton principal résout avec sa
      // valeur (trim) plutôt qu'avec `value` tel quel.
      const hasInput = !!opts.input;
      if (inputEl) {
        inputEl.hidden = !hasInput;
        if (hasInput) {
          inputEl.value = opts.input.defaultValue || "";
          inputEl.placeholder = opts.input.placeholder || "";
        }
      }
      let settled = false;
      function close(value) {
        if (settled) return;
        settled = true;
        overlay.hidden = true;
        clearRobotModalHighlight();
        document.removeEventListener("keydown", onKeydown, true);
        resolve(value);
      }
      function onKeydown(e) {
        if (e.key === "Escape") {
          e.preventDefault();
          close(opts.cancelValue !== undefined ? opts.cancelValue : false);
        } else if (hasInput && e.key === "Enter") {
          e.preventDefault();
          const primaryBtn = actions.querySelector(".robot-modal-btn--primary");
          if (primaryBtn) primaryBtn.click();
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
        btn.addEventListener("click", () => {
          if (hasInput && b.value === true) close((inputEl.value || "").trim() || null);
          else close(b.value);
        });
        actions.appendChild(btn);
      });
      overlay.hidden = false;
      positionRobotModal();
      document.addEventListener("keydown", onKeydown, true);
      requestAnimationFrame(() => {
        if (hasInput && inputEl) {
          inputEl.focus();
          inputEl.select();
          return;
        }
        const first = actions.querySelector(".robot-modal-btn--primary") || actions.querySelector("button");
        if (first) first.focus();
      });
    });
  }
  /** Remplace prompt("...") : un champ de saisie + Annuler/Valider, résout
   *  avec le texte saisi (trim) ou `null` si annulé/vide — même signature
   *  d'usage qu'un prompt() natif (`await robotPrompt(question, défaut)`). */
  function robotPrompt(text, defaultValue) {
    return showRobotMessage(text, {
      input: { defaultValue: defaultValue || "" },
      cancelValue: null,
      buttons: [
        { label: "Annuler", value: null },
        { label: "Valider", value: true, primary: true },
      ],
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
    hibernate: "💤", edit: "✎", construction: "🚩", undo: "◀️", folder: "📁",
  };
  // Choix par défaut dans la banque d'icônes pour ces mêmes réglages
  // (utilisé seulement pour les 4 premiers — le dossier reste en
  // émoticône, utilisé comme simple texte à trop d'endroits pour basculer
  // en SVG sans tout casser).
  const DEFAULT_ICON_BANK_CHOICES = { hibernate: "sleep", edit: "pencil", construction: "flag", undo: "undo" };
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

  // Round 16 : SIMPLIFICATION demandée par Stéphane suite au bug de
  // synchro du round 15 (deux canaux séparés — réglages "personnels" par
  // (code de synchro + Compte) ET réglages "publiés pour tous" — avec une
  // logique de fusion "le plus récent gagne" fragile, qui a fini par
  // laisser un ancien réglage local écraser silencieusement la bonne
  // version publiée). Il n'existe plus maintenant qu'UNE seule source de
  // vérité : la table Supabase `dev_settings_public` (une seule ligne,
  // id="global"), que seul le Compte de Stéphane peut modifier (RLS).
  // - `localStorage` ne sert plus qu'à AFFICHER quelque chose hors ligne
  //   (miroir du dernier contenu connu du serveur) — il n'est plus jamais
  //   considéré comme "plus à jour" que le serveur : dès qu'une connexion
  //   est possible, le serveur écrase toujours le local, sans comparaison
  //   de date. Plus de notion de "réglage personnel" ni de cloisonnement
  //   par Compte : tout le monde (élèves, profs, Stéphane lui-même sur
  //   n'importe quel appareil) voit exactement la même chose.
  // - Modifier un réglage en mode développeur (saveDevSettings) écrit
  //   directement vers ce même canal public : plus besoin d'un bouton
  //   "Publier" séparé, chaque changement est déjà la version de tout le
  //   monde.
  /* Round 33 : réglages partagés entre appareils — bug corrigé. Avant,
     chaque appareil ne relisait le serveur qu'au DÉMARRAGE de l'appli (pas
     au retour depuis l'arrière-plan, fréquent sur iPhone), et chaque
     modification renvoyait l'objet COMPLET des réglages de l'appareil :
     un appareil resté sur d'anciens réglages écrasait donc, à sa
     prochaine modification, tout ce qui avait été changé ailleurs (ex.
     couleurs réglées sur le PC, puis un bouton déplacé sur l'iPhone →
     les couleurs du PC disparaissent du serveur).
     Désormais : on garde la dernière version reçue du serveur (« base ») ;
     les changements faits sur l'appareil = différence entre la base et
     les réglages locaux ; à chaque envoi, on relit le serveur et on n'y
     applique QUE ces changements. Relecture aussi au retour au premier
     plan, et à chaque changement temps réel. */
  const DEV_SETTINGS_BASE_KEY = "fiches_dev_settings_base";
  const devSyncStatus = { at: null, error: null, pending: false };
  let devSyncChain = Promise.resolve();
  function devSyncQueue(fn) {
    devSyncChain = devSyncChain.then(fn, fn).catch((e) => console.warn("Réglages : synchro", e));
    return devSyncChain;
  }
  function devIsPlainObj(v) {
    return !!v && typeof v === "object" && !Array.isArray(v);
  }
  const DEV_DIFF_IGNORED = new Set(["updatedAt", "appPrefs", "appPrefsOwner"]);
  /** Liste des changements [chemin, valeur, supprimé] de `base` à `local`. */
  function devSettingsDiff(base, local, path, out) {
    path = path || [];
    out = out || [];
    const b = devIsPlainObj(base) ? base : {};
    const l = devIsPlainObj(local) ? local : {};
    new Set([...Object.keys(b), ...Object.keys(l)]).forEach((key) => {
      if (path.length === 0 && DEV_DIFF_IGNORED.has(key)) return;
      const bv = b[key];
      const lv = l[key];
      if (devIsPlainObj(bv) && devIsPlainObj(lv)) devSettingsDiff(bv, lv, path.concat(key), out);
      else if (JSON.stringify(bv) !== JSON.stringify(lv)) out.push([path.concat(key), lv === undefined ? null : lv, lv === undefined]);
    });
    return out;
  }
  function devSettingsApplyPatch(target, patch) {
    const out = JSON.parse(JSON.stringify(devIsPlainObj(target) ? target : {}));
    patch.forEach(([p, v, del]) => {
      let o = out;
      for (let n = 0; n < p.length - 1; n++) {
        if (!devIsPlainObj(o[p[n]])) o[p[n]] = {};
        o = o[p[n]];
      }
      if (del) delete o[p[p.length - 1]];
      else o[p[p.length - 1]] = JSON.parse(JSON.stringify(v));
    });
    return out;
  }
  function readDevSettingsBase() {
    const raw = localStorage.getItem(DEV_SETTINGS_BASE_KEY);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) || {};
    } catch (e) {
      return null;
    }
  }
  /** Changements faits sur cet appareil depuis la dernière version reçue
   *  du serveur (comparés sur les réglages complets, valeurs par défaut
   *  comprises, pour qu'une nouvelle valeur par défaut ne passe pas pour
   *  une modification). null = pas encore de base (1er lancement). */
  function localDevSettingsChanges() {
    const base = readDevSettingsBase();
    if (base === null) return null;
    if (base && base.__firstMergePending) {
      // 1er lancement de cette version sur un appareil en mode développeur :
      // tous ses réglages qui diffèrent du serveur sont fusionnés (voir
      // adoptServerDevSettings), rien n'est perdu.
      const real = { ...base };
      delete real.__firstMergePending;
      return devSettingsDiff(buildDevSettings(real), buildDevSettings(loadRawDevSettingsOverride()));
    }
    return devSettingsDiff(buildDevSettings(base), buildDevSettings(loadRawDevSettingsOverride()));
  }
  function storeLocalDevSettings(obj) {
    localStorage.setItem(DEV_SETTINGS_KEY, JSON.stringify(obj));
    _devSettingsCacheRaw = undefined;
    _devSettingsCache = undefined;
  }
  /** Réglages de la page Réglages (bonus, hibernation…) : propres au compte
   *  qui les a envoyés — jamais appliqués chez un autre compte. */
  function applyOwnAppPrefs(settings) {
    if (!settings || !settings.appPrefs) return;
    const uidNow = Sync.currentUid && Sync.currentUid();
    if (!settings.appPrefsOwner || settings.appPrefsOwner !== uidNow) return;
    applyAppPrefsFromRemote(settings.appPrefs);
  }
  function refreshDevViewIfIdle() {
    const devView = el("view-dev");
    if (!devView || !devView.classList.contains("is-active")) return;
    const ae = document.activeElement;
    if (ae && devView.contains(ae) && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.tagName === "SELECT")) return;
    renderDevView();
  }
  /** Adopte une version du serveur en y réappliquant les changements
   *  locaux pas encore envoyés. Renvoie true s'il en reste à envoyer. */
  /* Round 35 : les réglages développeur sont COMMUNS à tous les
     utilisateurs et ne se modifient que depuis le compte développeur (celui
     qui a envoyé la dernière version : `updated_by`). Sur tout autre
     compte, la version du serveur s'applique toujours telle quelle — un
     appareil où l'on aurait bricolé des réglages en local (mode
     développeur ouvert sur un 2e compte, par exemple) ne garde plus ses
     propres valeurs « en attente » à vie. */
  let devSettingsWriterUid = null;
  function isDevSettingsWriter() {
    const uidNow = (Sync.currentUid && Sync.currentUid()) || null;
    return !devSettingsWriterUid || (uidNow && uidNow === devSettingsWriterUid);
  }
  function isDevPermissionError(msg) {
    return /row-level security|refus|permission|not allowed|42501/i.test(String(msg || ""));
  }
  function forceServerDevSettings(serverRaw) {
    const server = devIsPlainObj(serverRaw) ? serverRaw : {};
    localStorage.setItem(DEV_SETTINGS_BASE_KEY, JSON.stringify(server));
    storeLocalDevSettings(server);
    applyAllDevSettings();
    applyOwnAppPrefs(server);
    refreshDevViewIfIdle();
  }
  function adoptServerDevSettings(serverRaw) {
    const server = devIsPlainObj(serverRaw) ? serverRaw : {};
    if (!isDevSettingsWriter()) {
      forceServerDevSettings(server);
      return false;
    }
    // Round 33 : 1er lancement de cette version (pas encore de « base ») sur
    // un appareil où le mode développeur est déverrouillé — ses réglages
    // n'avaient peut-être jamais atteint le serveur (ancien bug) : on les
    // fusionne avec ceux du serveur au lieu de les écraser. Ailleurs (élèves…),
    // le serveur fait foi, comme avant.
    if (readDevSettingsBase() === null && isDevUnlocked() && localStorage.getItem(DEV_SETTINGS_KEY)) {
      localStorage.setItem(DEV_SETTINGS_BASE_KEY, JSON.stringify({ ...server, __firstMergePending: true }));
    }
    const changes = localDevSettingsChanges();
    const merged = changes && changes.length ? devSettingsApplyPatch(server, changes) : server;
    localStorage.setItem(DEV_SETTINGS_BASE_KEY, JSON.stringify(server));
    storeLocalDevSettings(merged);
    applyAllDevSettings();
    applyOwnAppPrefs(server);
    refreshDevViewIfIdle();
    return !!(changes && changes.length);
  }
  function syncDevSettingsFromServer() {
    return devSyncQueue(async () => {
      if (typeof Sync === "undefined" || !Sync.isConfigured()) return;
      const res = await Sync.fetchPublicDevSettingsResult();
      if (res.error) {
        devSyncStatus.error = `lecture impossible (${res.error})`;
        renderDevSyncStatus();
        return;
      }
      if (res.updatedBy) devSettingsWriterUid = res.updatedBy;
      if (!res.settings) {
        // Rien encore sur le serveur : on garde ce qu'on a (envoyé à la
        // prochaine modification).
        renderDevSyncStatus();
        return;
      }
      const pending = adoptServerDevSettings(res.settings);
      devSyncStatus.error = null;
      devSyncStatus.at = new Date();
      if (pending) await pushDevSettingsNow(true);
      renderDevSyncStatus();
    });
  }
  /** Envoi : relit le serveur, y applique les changements de cet appareil,
   *  puis renvoie le tout (et adopte localement le résultat). */
  async function pushDevSettingsNow(alreadyQueued) {
    const run = async (attempt) => {
      attempt = attempt || 0;
      if (typeof Sync === "undefined" || !Sync.isConfigured()) return;
      const res = await Sync.fetchPublicDevSettingsResult();
      if (res.error) {
        devSyncStatus.error = `envoi impossible (${res.error})`;
        devSyncStatus.pending = true;
        renderDevSyncStatus();
        return;
      }
      const server = devIsPlainObj(res.settings) ? res.settings : {};
      if (res.updatedBy) devSettingsWriterUid = res.updatedBy;
      if (res.settings && !isDevSettingsWriter()) {
        // Pas le compte développeur : rien à envoyer, réglages communs rétablis.
        forceServerDevSettings(server);
        devSyncStatus.error = "ce compte ne peut pas modifier les réglages communs (réservé au compte développeur) — réglages communs rétablis";
        devSyncStatus.pending = false;
        renderDevSyncStatus();
        return;
      }
      let changes = localDevSettingsChanges();
      // 1er envoi sans base connue : l'appareil fait foi (ancien comportement).
      if (changes === null) changes = devSettingsDiff(buildDevSettings(server), buildDevSettings(loadRawDevSettingsOverride()));
      // Objet complet (valeurs par défaut comprises, marqueurs de format
      // de la disposition de l'accueil…) : le serveur reste lisible tel quel.
      const merged = devSettingsApplyPatch(buildDevSettings(server), changes);
      merged.updatedAt = new Date().toISOString();
      merged.appPrefs = gatherAppPrefs();
      merged.appPrefsOwner = (Sync.currentUid && Sync.currentUid()) || null;
      const pushRes = await Sync.pushPublicDevSettings(merged, res.settings ? res.updatedAt : null);
      // Un autre appareil a écrit entre notre lecture et notre envoi : on
      // recommence (relecture + fusion), pour ne rien écraser.
      if (pushRes.conflict) {
        if (attempt < 4) return run(attempt + 1);
        devSyncStatus.error = "envoi impossible (le serveur change trop souvent, réessai plus tard)";
        devSyncStatus.pending = true;
        renderDevSyncStatus();
        return;
      }
      const error = pushRes.error;
      if (error && isDevPermissionError(error)) {
        // Compte sans droit d'écriture : les réglages communs s'appliquent.
        forceServerDevSettings(server);
        devSyncStatus.error = "ce compte ne peut pas modifier les réglages communs (réservé au compte développeur) — réglages communs rétablis";
        devSyncStatus.pending = false;
      } else if (error) {
        // Hors ligne / erreur passagère : on garde les changements de
        // l'appareil, à renvoyer plus tard.
        localStorage.setItem(DEV_SETTINGS_BASE_KEY, JSON.stringify(server));
        storeLocalDevSettings(devSettingsApplyPatch(server, changes));
        applyAllDevSettings();
        devSyncStatus.error = `envoi refusé (${error})`;
        devSyncStatus.pending = true;
      } else {
        devSettingsWriterUid = (Sync.currentUid && Sync.currentUid()) || devSettingsWriterUid;
        localStorage.setItem(DEV_SETTINGS_BASE_KEY, JSON.stringify(merged));
        storeLocalDevSettings(merged);
        applyAllDevSettings();
        devSyncStatus.error = null;
        devSyncStatus.pending = false;
        devSyncStatus.at = new Date();
      }
      renderDevSyncStatus();
    };
    if (alreadyQueued) return run(0);
    return devSyncQueue(() => run(0));
  }
  function renderDevSyncStatus() {
    const out = el("dev-settings-sync-status");
    if (!out) return;
    if (typeof Sync === "undefined" || !Sync.isConfigured()) {
      out.textContent = "Synchronisation non configurée : réglages gardés sur cet appareil.";
      return;
    }
    const changes = localDevSettingsChanges();
    const nPending = changes ? changes.length : 0;
    if (devSyncStatus.error) {
      out.textContent = `⚠ ${devSyncStatus.error}${nPending ? ` — ${nPending} changement(s) en attente sur cet appareil` : ""}.`;
      out.classList.add("is-error");
      return;
    }
    out.classList.remove("is-error");
    const time = devSyncStatus.at ? devSyncStatus.at.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;
    out.textContent = nPending
      ? `${nPending} changement(s) en cours d'envoi…`
      : time
      ? `À jour avec le serveur (dernière synchro à ${time}).`
      : "En attente de la première synchro…";
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
    const built = buildDevSettings(parsed);
    _devSettingsCacheRaw = raw;
    _devSettingsCache = built;
    return built;
  }
  /** Réglages complets (valeurs par défaut du code + personnalisations)
   *  à partir d'un objet stocké — sans effet de bord (round 33 : sert
   *  aussi à comparer deux versions des réglages). */
  /** Réglages de l'algorithme v2, normalisés (4 valeurs numériques par
   *  paramètre). Toute version antérieure repart des valeurs par défaut. */
  function buildRevisionAlgoSettings(raw) {
    const d = DEFAULT_REVISION_ALGO_SETTINGS;
    const ok = raw && raw.version === REVISION_ALGO_VERSION;
    const arr = (key) =>
      d[key].map((def, i) => {
        const v = ok && Array.isArray(raw[key]) ? Number(raw[key][i]) : NaN;
        return Number.isFinite(v) ? v : def;
      });
    return {
      version: REVISION_ALGO_VERSION,
      coefSprint: arr("coefSprint"),
      coefFond: arr("coefFond"),
      plancherMin: arr("plancherMin"),
      plafondMin: arr("plafondMin"),
    };
  }
  function buildDevSettings(parsed) {
    parsed = parsed && typeof parsed === "object" ? parsed : {};
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
      // Round 19, item 2 : correctif d'un vrai bug — `saveDevSettings`
      // écrit toujours l'objet `helpMessagesByView` COMPLET (toutes les
      // pages, pas seulement celle éditée), donc éditer N'IMPORTE QUEL
      // réglage développeur ne serait-ce qu'une fois fige, ce jour-là, un
      // instantané de TOUTES les pages — y compris celles jamais
      // vraiment personnalisées, restées à `[]` (valeur par défaut de
      // l'époque). Si un nouveau texte par défaut est ajouté PLUS TARD
      // pour l'une de ces pages (ex. l'intro du Calendrier, round 18,
      // item 12), cet instantané figé (`[]`) masque silencieusement le
      // nouveau texte pour toujours, sur ce compte. Un tableau stocké
      // vide alors que le texte par défaut actuel ne l'est pas ne peut
      // donc pas être une vraie personnalisation volontaire (l'éditeur
      // n'a alors jamais affiché ce nouveau texte à effacer) — on
      // l'ignore et on retombe sur le texte par défaut à jour.
      helpMessagesByView: (() => {
        const stored = parsed.helpMessagesByView || {};
        const cleaned = {};
        Object.keys(stored).forEach((key) => {
          const storedVal = stored[key];
          const storedEmpty = !Array.isArray(storedVal) || storedVal.length === 0;
          const defaultVal = DEFAULT_HELP_MESSAGES_BY_VIEW[key];
          const defaultNonEmpty = Array.isArray(defaultVal) && defaultVal.length > 0;
          if (storedEmpty && defaultNonEmpty) return; // instantané figé obsolète, ignoré
          cleaned[key] = storedVal;
        });
        return { ...DEFAULT_HELP_MESSAGES_BY_VIEW, ...cleaned };
      })(),
      ratingBtnBgColor: parsed.ratingBtnBgColor || DEFAULT_RATING_BTN_BG_COLOR,
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
      darwinLogo: { ...DEFAULT_DARWIN_LOGO, ...(parsed.darwinLogo || {}) },
      darwinText: { ...DEFAULT_DARWIN_TEXT, ...(parsed.darwinText || {}) },
      homeLayoutUnit: "percent",
      homeLayoutAnchor: "center",
      reviewLayout: { ...DEFAULT_REVIEW_LAYOUT, ...(parsed.reviewLayout || {}) },
      cardScore: { ...DEFAULT_CARD_SCORE_SETTINGS, ...(parsed.cardScore || {}) },
      gaugeColors: { ...DEFAULT_GAUGE_COLORS, ...(parsed.gaugeColors || {}) },
      // Round 42 : nouvel algorithme. D'anciens réglages (version < 2,
      // coefTe/coefDd/abat…) sont remplacés par les valeurs par défaut,
      // couleurs de la jauge comprises. Tableaux clonés (jamais partagés
      // avec les valeurs par défaut).
      revisionAlgo: buildRevisionAlgoSettings(parsed.revisionAlgo),
      persGaugeColors:
        parsed.revisionAlgo && parsed.revisionAlgo.version === REVISION_ALGO_VERSION
          ? { ...DEFAULT_PERS_GAUGE_COLORS, ...(parsed.persGaugeColors || {}) }
          : { ...DEFAULT_PERS_GAUGE_COLORS },
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
        gaugeColors: { ...DEFAULT_GAUGE_COLORS, ...((parsed.nightColors || {}).gaugeColors || {}) },
      },
      icons: { ...DEFAULT_ICONS, ...(parsed.icons || {}) },
      textColors: Array.isArray(parsed.textColors) && parsed.textColors.length > 0 ? parsed.textColors : DEFAULT_TEXT_COLORS,
      // Horodatage de la dernière modification (posé par saveDevSettings) —
      // affiché nulle part mais conservé pour référence/débogage.
      updatedAt: parsed.updatedAt,
    };
    // Round 41 : le mode « chantier » devient « signaler » — anciennes
    // icônes (barrière / cône) remplacées par le drapeau.
    if (built.icons && built.icons.construction === "🚧") built.icons.construction = "🚩";
    if (built.iconBank && built.iconBank.construction === "cone") built.iconBank.construction = "flag";
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
  // déplacement — un seul envoi groupé, un court instant après la
  // dernière modification. Round 16 : envoi direct vers l'UNIQUE canal
  // partagé (`dev_settings_public`) — plus de notion de Compte à
  // résoudre au préalable, ni de bouton "Publier" séparé : ce qui est
  // sauvegardé ici EST déjà la version que tout le monde va recevoir.
  let devSettingsPushTimer = null;
  function scheduleDevSettingsPush() {
    if (typeof Sync === "undefined" || !Sync.isConfigured || !Sync.isConfigured()) return;
    clearTimeout(devSettingsPushTimer);
    devSettingsPushTimer = setTimeout(() => {
      devSettingsPushTimer = null;
      pushDevSettingsNow();
    }, 900);
    renderDevSyncStatus();
  }
  // Round 33 : au retour au premier plan (iPhone : l'appli n'est souvent pas
  // relancée), on relit les réglages partagés ; en passant en arrière-plan,
  // on envoie tout de suite ce qui attendait encore.
  let devSettingsLastResumeSync = 0;
  function onDevSettingsVisibility() {
    if (document.visibilityState === "hidden") {
      if (devSettingsPushTimer) {
        clearTimeout(devSettingsPushTimer);
        devSettingsPushTimer = null;
        pushDevSettingsNow();
      }
      return;
    }
    if (Date.now() - devSettingsLastResumeSync < 5000) return;
    devSettingsLastResumeSync = Date.now();
    syncDevSettingsFromServer();
  }
  document.addEventListener("visibilitychange", onDevSettingsVisibility);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) onDevSettingsVisibility();
  });
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
      // Round 22, item 4 : bug corrigé — RETIRÉ d'ici. Cette fonction
      // alimente le canal `dev_settings_public` (une seule ligne "global",
      // voir Sync.pushPublicDevSettings côté sync.js), conçu pour des
      // réglages d'affichage VALIDÉS PAR STÉPHANE et partagés à toute
      // installation de l'appli — pas pour des données personnelles. Les
      // évènements du calendrier y transitaient par erreur : n'importe
      // quelle installation de l'appli (y compris sans Compte connecté,
      // y compris celle d'un autre utilisateur) les recevait donc au
      // démarrage (voir syncDevSettingsFromServer), ce qui est exactement
      // le bug signalé ("j'avais tous mes évènements alors que je n'étais
      // pas connecté"). Les évènements sont maintenant stockés localement
      // par Compte connecté (voir CALENDAR_EVENTS_KEY / loadCalendarEvents)
      // plutôt que diffusés à tout le monde par ce canal.
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
    // Round 22, item 4 : "fiches_calendar_events" n'est plus appliqué
    // depuis ce canal public partagé (voir le commentaire dans
    // gatherAppPrefs ci-dessus) — un ancien blob `prefs.calendarEvents`
    // encore présent côté serveur (poussé par une version antérieure de
    // l'appli) est donc désormais ignoré ici plutôt que réappliqué.
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

  /** Applique les couleurs des notes (item 2) : posées comme
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
   *  réglage séparé). Chaque couleur de la page Développeur devient une
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
      { review: "Réviser", manage: "Gérer", stats: "Stats", settings: "Réglages", addCard: "Ajouter une fiche", calendar: "Calendrier", dev: "Développeur", library: "Librairie" },
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
      Object.keys(DEFAULT_ICON_BANK_CHOICES).filter((k) => k !== "hibernate"),
      { edit: "Éditer", construction: "Signaler", undo: "Annuler" },
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
    "appBg", "homeBg", "homeSquareBg", "homeAddCardBg", "homeLibraryBg", "libraryPageBg", "cardFormBg", "richEditorBg", "homeBtnBg", "cardBg",
    "subjectSelectBg", "syncStatusBg", "folderBg", "folderL1Bg", "folderL2Bg", "folderL3Bg",
    "subjectRowBg", "addBtnBg", "chartWrapBg", "svgChartBg", "dueBarColor", "todayBarColor", "reviewedBarColor",
    "skipProgramBg",
  ];
  const BG_COLORS_TITLES = {
    appBg: "Fond de l'appli (toutes pages sauf accueil)",
    homeBg: "Fond de la page d'accueil",
    homeSquareBg: "Boutons de la page d'accueil",
    homeAddCardBg: "Bouton « Ajouter une fiche » de l'accueil",
    homeLibraryBg: "Bouton « Librairie » de l'accueil",
    libraryPageBg: "Fond de la page Librairie",
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

    // Round 14 : logo "darwin" + texte sous lui, même système de
    // coordonnées que le logo robot ci-dessus (X/Y en % de la même zone,
    // converti en px pour X pour la même raison — voir les commentaires
    // au-dessus).
    const darwinLogo = loadDevSettings().darwinLogo;
    const darwinText = loadDevSettings().darwinText;
    const darwinLogoLeftPx = scatterLeftOffset + (darwinLogo.x / 100) * scatterWidthForLogo;
    root.setProperty("--darwin-logo-x", `${Math.round(darwinLogoLeftPx)}px`);
    root.setProperty("--darwin-logo-y", `${darwinLogo.y}%`);
    root.setProperty("--darwin-logo-size", `${darwinLogo.size}px`);
    root.setProperty("--darwin-logo-shadow", darwinLogo.shadow ? LOGO_SHADOW_FILTER : "none");
    // Round 15, item 2 : couleur du logo darwin (topbar + accueil, même
    // variable pour les deux — voir .topbar-darwin-logo/.darwin-home-logo
    // en CSS).
    root.setProperty("--darwin-logo-color", darwinLogo.color || "#4a90d9");
    const darwinTextLeftPx = scatterLeftOffset + (darwinText.x / 100) * scatterWidthForLogo;
    root.setProperty("--darwin-text-x", `${Math.round(darwinTextLeftPx)}px`);
    root.setProperty("--darwin-text-y", `${darwinText.y}%`);
    root.setProperty("--darwin-text-size", `${darwinText.size}px`);
    const darwinTextEl = el("darwin-home-text");
    if (darwinTextEl) {
      const content = (darwinText.content || "").trim();
      darwinTextEl.textContent = content;
      darwinTextEl.hidden = content.length === 0;
    }
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
    // Marge de sécurité sous la barre du haut + la barre de boîte (round
    // 15 : le bandeau du haut est désormais fixe et sa hauteur réelle
    // varie — titre de page, bulle d'aide ouverte, etc. — --sticky-
    // header-h, mesurée en JS via ResizeObserver, remplace donc la valeur
    // fixe utilisée avant ; +60px couvre la barre de boîte elle-même
    // (posée juste sous ce bandeau) plus une marge confortable.
    const stickyHeaderH =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sticky-header-h")) || 96;
    const MIN_CARD_TOP_PX = stickyHeaderH + 60;
    const cardTopPctPx = r.cardTopPct * vh;
    const cardTopPx = Math.max(cardTopPctPx, MIN_CARD_TOP_PX);
    // Round 15 (suite) : quand le plancher ci-dessus pousse la fiche plus
    // bas que sa position en % d'origine, la barre de notation/le résumé
    // de score/la jauge (positionnés chacun par leur propre % de l'écran,
    // indépendamment de la fiche) doivent redescendre d'AUTANT — sinon ils
    // restent à leur ancienne hauteur et se retrouvent sous la fiche,
    // désormais plus basse (bug constaté : bouton de notation caché sous
    // la fiche). Même décalage appliqué aux quatre pour garder leur
    // espacement relatif d'origine.
    const extraOffsetPx = cardTopPx - cardTopPctPx;
    root.setProperty("--review-card-height", `${Math.round(r.cardHeightPct * vh)}px`);
    root.setProperty("--review-card-width", `${Math.round(r.cardWidthPct * vw)}px`);
    root.setProperty("--review-card-top", `${Math.round(cardTopPx)}px`);
    root.setProperty("--review-rating-row-top", `${Math.round(r.ratingRowTopPct * vh + extraOffsetPx)}px`);
    root.setProperty("--review-score-info-top", `${Math.round(r.scoreInfoTopPct * vh + extraOffsetPx)}px`);
    root.setProperty("--review-gauge-top", `${Math.round(r.gaugeTopPct * vh + extraOffsetPx)}px`);
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

  // Round 14 : logo "darwin" — position/taille/ombre TOUTES réglables
  // ici (contrairement au logo robot, dont seule l'ombre vit dans
  // Réglages ; voir DEFAULT_DARWIN_LOGO plus haut).
  function renderDarwinLogoEditor() {
    const wrap = el("dev-darwin-logo-list");
    if (!wrap) return;
    const logo = loadDevSettings().darwinLogo;
    wrap.innerHTML = `<div class="dev-home-layout-row">
      <span class="dev-home-layout-title">Logo darwin</span>
      <label>X % <input type="number" step="0.1" class="dev-darwin-logo-input" data-field="x" value="${logo.x}" /></label>
      <label>Y % <input type="number" step="0.1" class="dev-darwin-logo-input" data-field="y" value="${logo.y}" /></label>
      <label>Taille px <input type="number" class="dev-darwin-logo-input" data-field="size" value="${logo.size}" /></label>
    </div>
    <label class="settings-toggle-row">
      <input type="checkbox" id="dev-darwin-logo-shadow" ${logo.shadow ? "checked" : ""} />
      <span>Ombre sous le logo darwin</span>
    </label>
    <!-- Round 15, item 2 : couleur du logo darwin (topbar + accueil),
         noir d'origine jugé trop dur — bleu par défaut, réglable ici. -->
    <label class="field">
      <span>Couleur du logo darwin</span>
      <input type="color" id="dev-darwin-logo-color" value="${logo.color || "#4a90d9"}" />
    </label>`;
    wrap.querySelectorAll(".dev-darwin-logo-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        s.darwinLogo[input.dataset.field] = Number(input.value) || 0;
        saveDevSettings(s);
        applyHomeLayout();
      });
    });
    const shadowEl = el("dev-darwin-logo-shadow");
    if (shadowEl) {
      shadowEl.addEventListener("change", () => {
        const s = loadDevSettings();
        s.darwinLogo.shadow = shadowEl.checked;
        saveDevSettings(s);
        applyHomeLayout();
      });
    }
    const colorEl = el("dev-darwin-logo-color");
    if (colorEl) {
      colorEl.addEventListener("input", () => {
        const s = loadDevSettings();
        s.darwinLogo.color = colorEl.value;
        saveDevSettings(s);
        applyHomeLayout();
      });
    }
  }

  // Round 14 : texte sous le logo darwin — contenu/position/taille.
  function renderDarwinTextEditor() {
    const wrap = el("dev-darwin-text-list");
    if (!wrap) return;
    const text = loadDevSettings().darwinText;
    wrap.innerHTML = `<label class="field">
      <span>Texte (vide = masqué)</span>
      <input type="text" id="dev-darwin-text-content" value="${escapeHtml(text.content || "")}" placeholder="Ex. Fiches by darwin" />
    </label>
    <div class="dev-home-layout-row">
      <span class="dev-home-layout-title">Position</span>
      <label>X % <input type="number" step="0.1" class="dev-darwin-text-input" data-field="x" value="${text.x}" /></label>
      <label>Y % <input type="number" step="0.1" class="dev-darwin-text-input" data-field="y" value="${text.y}" /></label>
      <label>Taille px <input type="number" class="dev-darwin-text-input" data-field="size" value="${text.size}" /></label>
    </div>`;
    const contentEl = el("dev-darwin-text-content");
    if (contentEl) {
      contentEl.addEventListener("input", () => {
        const s = loadDevSettings();
        s.darwinText.content = contentEl.value;
        saveDevSettings(s);
        applyHomeLayout();
      });
    }
    wrap.querySelectorAll(".dev-darwin-text-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        s.darwinText[input.dataset.field] = Number(input.value) || 0;
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

  /** Algorithme v2 : COEF_SPRINT / COEF_FOND / PLANCHER_FOND / PLAFOND_FOND
   *  par bouton (indices 0-3). Contrôles : COEF_SPRINT > 1, PLANCHER ≤
   *  PLAFOND, valeurs positives — une valeur refusée n'est pas enregistrée
   *  (champ en rouge, message sous le tableau). */
  const REVISION_ALGO_FIELD_DEFS = [
    { key: "coefSprint", title: "COEF_SPRINT (mode sprint, > 1)", step: "0.01" },
    { key: "coefFond", title: "COEF_FOND (mode fond)", step: "0.01" },
    { key: "plancherMin", title: "PLANCHER_FOND (minutes)", step: "1" },
    { key: "plafondMin", title: "PLAFOND_FOND (minutes)", step: "1" },
  ];
  function revisionAlgoValueError(algo, key, idx, value) {
    if (!Number.isFinite(value) || value < 0) return "Valeur positive attendue.";
    if (key === "coefSprint" && value <= 1) return "COEF_SPRINT doit être strictement supérieur à 1.";
    if (key === "plancherMin" && value > algo.plafondMin[idx]) return "Le PLANCHER ne peut pas dépasser le PLAFOND.";
    if (key === "plafondMin" && value < algo.plancherMin[idx]) return "Le PLAFOND ne peut pas être inférieur au PLANCHER.";
    if ((key === "plancherMin" || key === "plafondMin") && value < 1) return "1 minute minimum.";
    return "";
  }
  function renderRevisionAlgoEditor() {
    const wrap = el("dev-revision-algo-list");
    if (!wrap) return;
    const settings = loadDevSettings().revisionAlgo;
    wrap.innerHTML =
      REVISION_ALGO_FIELD_DEFS.map(
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
      ).join("") + `<p class="field-hint dev-revision-algo-error" id="dev-revision-algo-error" hidden></p>`;
    const errEl = el("dev-revision-algo-error");
    wrap.querySelectorAll(".dev-revision-algo-input").forEach((input) => {
      input.addEventListener("input", () => {
        const s = loadDevSettings();
        const idx = Number(input.dataset.idx);
        const key = input.dataset.key;
        const value = input.value === "" ? NaN : Number(input.value);
        const err = revisionAlgoValueError(s.revisionAlgo, key, idx, value);
        input.classList.toggle("is-invalid", !!err);
        if (errEl) {
          errEl.hidden = !err;
          errEl.textContent = err ? `${REVISION_ALGO_RATING_LABELS[REVISION_ALGO_RATING_ORDER[idx]]} : ${err} (non enregistré)` : "";
        }
        if (err) return;
        s.revisionAlgo[key][idx] = value;
        saveDevSettings(s);
        updateRatingPreviews();
      });
    });
  }
  const devRevisionAlgoResetBtn = el("dev-revision-algo-reset");
  if (devRevisionAlgoResetBtn) {
    devRevisionAlgoResetBtn.addEventListener("click", () => {
      const settings = loadDevSettings();
      settings.revisionAlgo = buildRevisionAlgoSettings(null);
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
    root.setProperty("--home-library-bg-color", bg.homeLibraryBg || DEFAULT_BG_COLORS.homeLibraryBg);
    root.setProperty("--library-page-bg-color", bg.libraryPageBg || bg.appBg);
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

  /* ---------------------------------------------------------
     Algorithme de révision v2 (round 42) — voir
     DEFAULT_REVISION_ALGO_SETTINGS pour la spécification.
  --------------------------------------------------------- */
  function ratingIndex(rating) {
    return REVISION_ALGO_RATING_ORDER.indexOf(rating);
  }
  /** Dernière note (0-3) des fiches qui n'ont pas encore `lastRating`
   *  (notées avant ce round) : reprise du journal des notes, sinon 0. */
  let lastRatingFromLogCache = { len: -1, map: new Map() };
  function lastRatingFromLog() {
    if (lastRatingFromLogCache.len === ratingLog.length) return lastRatingFromLogCache.map;
    const map = new Map();
    const sorted = [...ratingLog].sort((x, y) => String(x.at).localeCompare(String(y.at)));
    sorted.forEach((e) => {
      const i = ratingIndex(e.rating);
      if (i >= 0) map.set(e.cardId, i);
    });
    lastRatingFromLogCache = { len: ratingLog.length, map };
    return map;
  }
  function cardLastRating(card) {
    if (typeof card.lastRating === "number" && card.lastRating >= 0 && card.lastRating <= 3) return card.lastRating;
    const fromLog = lastRatingFromLog().get(card.id);
    return typeof fromLog === "number" ? fromLog : 0;
  }
  /** Temps écoulé (minutes) depuis la dernière interrogation — 0 pour une
   *  fiche jamais interrogée. */
  function cardElapsedMinutes(card, now) {
    if (!card.lastReviewed) return 0;
    return Math.max(0, (now.getTime() - new Date(card.lastReviewed).getTime()) / 60000);
  }
  function localDateStr(d) {
    const x = d || new Date();
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  }
  /** Échéances à venir (pas encore terminées : une échéance se termine le
   *  lendemain de sa date) par boîte : Map id de boîte -> { next, last }
   *  (dates "AAAA-MM-JJ"). Mis en cache quelques secondes, invalidé à chaque
   *  enregistrement du calendrier. */
  let subjectEventsCache = null;
  function invalidateSubjectEventsCache() {
    subjectEventsCache = null;
  }
  function subjectEventsMap() {
    const today = localDateStr();
    if (subjectEventsCache && subjectEventsCache.today === today && Date.now() - subjectEventsCache.at < 5000) {
      return subjectEventsCache.map;
    }
    const map = new Map();
    loadCalendarEvents()
      .filter((ev) => ev && ev.date && ev.date >= today && eventLinkIds(ev).length > 0)
      .forEach((ev) => {
        revisionTreeBoxIds(revisionTreeForEvent(ev)).forEach((id) => {
          const cur = map.get(id);
          if (!cur) map.set(id, { next: ev.date, last: ev.date });
          else {
            if (ev.date < cur.next) cur.next = ev.date;
            if (ev.date > cur.last) cur.last = ev.date;
          }
        });
      });
    subjectEventsCache = { today, at: Date.now(), map };
    return map;
  }
  function eventReferenceTime(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d, SPRINT_EVENT_HOUR, 0, 0, 0);
  }
  function dayAfter(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  }

  /** Délai (minutes) en mode fond pour l'indice de note `idx`. */
  function fondDelayMinutes(card, idx, settings, now) {
    const dd = typeof card.dd === "number" && Number.isFinite(card.dd) ? Math.max(0, card.dd) : 0;
    const te = cardElapsedMinutes(card, now);
    const raw = dd - te + te * (settings.coefFond[idx] || 0);
    return Math.min(settings.plafondMin[idx], Math.max(settings.plancherMin[idx], raw));
  }

  /** Nouveau délai et champs à fusionner dans la fiche après la note
   *  `rating`. `mode` vaut "fond" ou "sprint". */
  function computeAlgoNext(card, rating) {
    const settings = loadDevSettings().revisionAlgo;
    const now = new Date();
    let idx = ratingIndex(rating);
    if (idx < 0) idx = 0;
    const fond = fondDelayMinutes(card, idx, settings, now);
    let ndi = fond;
    let mode = "fond";
    const ev = subjectEventsMap().get(card.subject);
    if (ev) {
      mode = "sprint";
      const dpEch = (eventReferenceTime(ev.next).getTime() - now.getTime()) / 60000;
      const coef = settings.coefSprint[idx];
      let sprint;
      if (dpEch <= 0) sprint = SPRINT_EVENT_DAY_DELAY_MIN;
      else if (coef > 1) sprint = dpEch - dpEch / coef;
      else sprint = fond;
      ndi = Math.min(sprint, fond);
    }
    ndi = Math.max(1, ndi);
    const due = new Date(now.getTime() + ndi * 60000);
    const out = {
      dd: Math.round(ndi * 100) / 100,
      interval: Math.max(0, Math.round(ndi / 1440)),
      deadlineDaysRaw: Math.round((ndi / 1440) * 1000) / 1000,
      dueDate: due.toISOString(),
      lastRating: idx,
      mode,
    };
    if (ev && !card.inSprint) {
      // Entrée en sprint au moment de la note (le calendrier n'avait pas
      // encore été rapproché) : on mémorise le délai d'avant.
      out.inSprint = true;
      out.ddBeforeSprint = card.dd > 0 ? card.dd : null;
      out.sprintNext = ev.next;
      out.sprintUntil = ev.last;
    } else if (ev) {
      out.sprintNext = ev.next;
      out.sprintUntil = ev.last;
    }
    return out;
  }

  /** Rapproche l'état sprint/fond de toutes les fiches de mes révisions
   *  avec le calendrier :
   *   - entrée en sprint (ou nouvelle échéance plus proche) : délai actuel
   *     mémorisé, fiche à interroger tout de suite ;
   *   - plus aucune échéance à venir : retour en fond, prochaine
   *     interrogation = fin de la dernière échéance (le lendemain de sa
   *     date) + délai d'avant le sprint (ou plancher de la dernière note).
   *  Ne réécrit que les fiches qui changent. */
  let reconcilingSprint = false;
  async function reconcileSprintState() {
    if (reconcilingSprint) return 0;
    reconcilingSprint = true;
    try {
      invalidateSubjectEventsCache();
      const map = subjectEventsMap();
      const settings = loadDevSettings().revisionAlgo;
      const now = new Date();
      const nowIso = now.toISOString();
      const changed = [];
      revisionCards().forEach((card) => {
        const ev = map.get(card.subject);
        let upd = null;
        if (ev) {
          if (!card.inSprint) {
            upd = { inSprint: true, ddBeforeSprint: card.dd > 0 ? card.dd : null, sprintNext: ev.next, sprintUntil: ev.last };
            if (!card.dueDate || new Date(card.dueDate) > now) upd.dueDate = nowIso;
          } else if (card.sprintNext !== ev.next || card.sprintUntil !== ev.last) {
            upd = { sprintNext: ev.next, sprintUntil: ev.last };
            // Nouvelle échéance plus proche que celle connue : tout de suite.
            if ((!card.sprintNext || ev.next < card.sprintNext) && (!card.dueDate || new Date(card.dueDate) > now)) {
              upd.dueDate = nowIso;
            }
          }
        } else if (card.inSprint) {
          const end = card.sprintUntil ? dayAfter(card.sprintUntil) : now;
          const base = end < now ? end : now;
          const delay =
            typeof card.ddBeforeSprint === "number" && card.ddBeforeSprint > 0
              ? card.ddBeforeSprint
              : settings.plancherMin[cardLastRating(card)];
          upd = {
            inSprint: false,
            ddBeforeSprint: null,
            sprintNext: null,
            sprintUntil: null,
            dd: delay,
            interval: Math.max(0, Math.round(delay / 1440)),
            dueDate: new Date(base.getTime() + delay * 60000).toISOString(),
          };
        }
        if (upd) changed.push(touch({ ...card, ...upd }));
      });
      if (changed.length === 0) return 0;
      const byId = new Map(changed.map((c) => [c.id, c]));
      cards = cards.map((c) => byId.get(c.id) || c);
      if (currentCard && byId.has(currentCard.id)) currentCard = byId.get(currentCard.id);
      reviewQueue = reviewQueue.map((c) => byId.get(c.id) || c);
      await DB.bulkPut(changed);
      if (Sync.isConfigured()) Sync.pushCardsBulk(changed).finally(updateSyncStatus);
      return changed.length;
    } catch (e) {
      console.warn("Sprint : rapprochement impossible", e);
      return 0;
    } finally {
      reconcilingSprint = false;
    }
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
    return {
      id: uid(),
      subject: subjectId,
      question,
      answer,
      createdAt: nowIso,
      dueDate: nowIso, // round 42 : une nouvelle fiche est à interroger tout de suite
      lastReviewed: null,
      reviewCount: 0,
      updatedAt: nowIso,
      deleted: false,
      // Chantier (item 16) : fiche marquée à corriger/compléter plus tard.
      underConstruction: false,
      // Algorithme v2 : dd en MINUTES (voir computeAlgoNext) ; jamais
      // notée (lastRating absent = 0 pour la jauge).
      dd: 0,
      interval: 0,
      deadlineDaysRaw: 0,
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
    return subjects.filter((s) => ids.has(s.folderId) && isSubjectInRevisions(s)).map((s) => s.id);
  }

  /* Round 30 : une boîte peut exister SANS être dans « Mes fiches de
     révision » (créée depuis Mes créations de fiches et pas encore rangée,
     ou retirée de mes révisions). Elle garde ses fiches et reste visible
     dans Mes créations, mais n'apparaît plus dans l'organisation, les
     sélecteurs ni les révisions (drapeau `outOfRevisions`, synchronisé
     avec le reste de la boîte). */
  function isSubjectInRevisions(s) {
    return !!s && !s.outOfRevisions;
  }
  function isSubjectIdInRevisions(id) {
    const s = subjects.find((x) => x.id === id);
    return !s || !s.outOfRevisions;
  }
  /** Fiches non supprimées des boîtes présentes dans mes révisions. */
  function revisionCards() {
    const out = new Set(subjects.filter((s) => s.outOfRevisions).map((s) => s.id));
    return cards.filter((c) => !c.deleted && !out.has(c.subject));
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
    // Round 30 : un dossier-boîte vidé de ses fiches reste une boîte
    // (keepAsBox) — on ne transforme plus un dossier en boîte, ni l'inverse.
    return !!s.keepAsBox || cards.some((c) => !c.deleted && c.subject === s.id);
  }
  /** Un dossier est "vide" (éligible pour devenir une boîte) s'il n'a NI
   *  sous-dossier NI boîte parmi ses enfants directs. */
  function folderIsEmpty(folderId) {
    const hasSubFolders = folders.some((f) => f.parentId === folderId);
    const hasSubjectChildren = subjects.some((s) => s.folderId === folderId && isSubjectInRevisions(s) && !folders.some((f) => f.id === s.id));
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
    const s = subjects.find((x) => x.id === subjectId);
    if (!s || s.keepAsBox) return;
    // Round 30 : un dossier ne se transforme plus en boîte (et donc ne
    // redevient plus dossier) : la boîte vidée reste une boîte.
    s.keepAsBox = true;
    s.updatedAt = new Date().toISOString();
    await persistSubject(s);
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
   *  affichée à la fois, et ça ne doit jamais apparaître côté réponse. */
  function renderQuestionText(card) {
    if (!card) return;
    // Le préfixe "Nom de la boîte :" reste toujours en texte échappé (pas
    // question qu'un nom de boîte contenant "<" casse l'affichage) ; la
    // question elle-même passe par toDisplayHtml (item 13 : contenu riche).
    questionTextEl.innerHTML = isSentinelSubject(currentSubjectId)
      ? `<strong class="card-subject-hint">${escapeHtml(subjectName(card.subject))}</strong><br><br>${toDisplayHtml(card.question)}`
      : toDisplayHtml(card.question);
    renderSubjectBarCount();
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
    // Round 34 : plus de boîte « Général » créée d'office quand il n'y en a
    // aucune (elle revenait à chaque démarrage / nouvelle version). Les
    // boîtes se créent depuis Mes créations de fiches.
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));

    const saved = localStorage.getItem(CURRENT_SUBJECT_KEY);
    if (saved && (isSentinelSubject(saved) || subjects.some((s) => s.id === saved))) {
      currentSubjectId = saved;
    } else {
      currentSubjectId = subjects[0] ? subjects[0].id : ALL_SUBJECTS_ID;
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
    // Des fiches sans boîte : là seulement, une boîte « Général » les accueille.
    if (subjects.length === 0) {
      const general = newSubject("Général");
      await persistSubject(general);
      subjects = [general];
    }
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
        await removeSubjectEverywhere(s);
        if (currentSubjectId === s.id) {
          currentSubjectId = keep.id;
          localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
        }
      }
    }
  }
  /** Round 34 : retrait d'une boîte vide AUSSI sur le serveur (suppression
   *  douce). Avant, les nettoyages ne la retiraient que de l'appareil : la
   *  synchro suivante la faisait revenir (la boîte « Général » fantôme). */
  async function removeSubjectEverywhere(s) {
    await DB.removeSubject(s.id);
    subjects = subjects.filter((x) => x.id !== s.id);
    await pushSubjectDeleted(s);
  }
  /** Round 34 : boîtes « Général » créées automatiquement par les anciennes
   *  versions (vides, jamais classées ni publiées) — retirées partout. */
  async function purgeAutoGeneralBoxes() {
    const autos = subjects.filter(
      (s) =>
        s.name === "Général" &&
        !s.deleted &&
        !s.sharedBoxId &&
        !s.fromLibrary &&
        !(s.taxonomy && Object.keys(s.taxonomy).length) &&
        !folders.some((f) => f.id === s.id) &&
        !myPublishedSourceIds.has(s.id) &&
        !cards.some((c) => c.subject === s.id && !c.deleted)
    );
    for (const s of autos) await removeSubjectEverywhere(s);
    if (autos.length && (!currentSubjectId || (!isSentinelSubject(currentSubjectId) && !subjects.some((x) => x.id === currentSubjectId)))) {
      currentSubjectId = subjects[0] ? subjects[0].id : ALL_SUBJECTS_ID;
      localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
    }
    return autos.length;
  }

  /** Round 18, item 3 (suite) : nettoie les doublons de boîtes MIROIR
   *  (boîte de classe partagée ou collection prise en Bibliothèque) déjà
   *  créés par le bug de synchros concurrentes corrigé ci-dessus (voir
   *  syncSharedBoxesForStudent) — sans ce nettoyage, les utilisateurs déjà
   *  touchés garderaient leurs doublons pour toujours. Regroupe par
   *  sharedBoxId puis par libraryOriginId ; garde la plus ancienne de
   *  chaque groupe (celle que les autres écrans référencent déjà le plus
   *  souvent) et supprime les autres, dont le contenu est par définition
   *  un miroir identique de la même source distante. */
  async function dedupeDuplicateMirrorSubjects() {
    const groupsByKey = (keyFn) => {
      const map = new Map();
      for (const s of subjects) {
        const key = keyFn(s);
        if (!key) continue;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(s);
      }
      return map;
    };
    const allGroups = [
      ...groupsByKey((s) => s.sharedBoxId).values(),
      ...groupsByKey((s) => s.libraryOriginId).values(),
    ];
    for (const group of allGroups) {
      if (group.length < 2) continue;
      const sorted = [...group].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      const keep = sorted[0];
      for (const dup of sorted.slice(1)) {
        const toDelete = cards.filter((c) => !c.deleted && c.subject === dup.id);
        for (const c of toDelete) {
          const updated = touch({ ...c, deleted: true });
          await persist(updated);
          const idx = cards.findIndex((x) => x.id === c.id);
          if (idx >= 0) cards[idx] = updated;
        }
        await DB.removeSubject(dup.id);
        subjects = subjects.filter((x) => x.id !== dup.id);
        if (currentSubjectId === dup.id) {
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
    if (typeof updateImportTargetLabel === "function") updateImportTargetLabel();

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

  /* ---- Page Fiches : deux façons d'afficher l'organisation.
     "all"       : Mes fiches de révision (tout, comme avant).
     "creations" : Mes créations de fiches — seulement les boîtes créées
                   par l'utilisateur (ni boîtes de classe, ni collections
                   prises dans la Librairie), avec un interrupteur pour ne
                   garder que celles publiées dans la Librairie. ---- */
  let manageMode = "all";
  let manageOnlyPublished = false;
  let myPublishedSourceIds = new Set();
  let myPublishedLegacyNames = new Set();

  function isOwnCreatedSubject(s) {
    return !!s && !s.deleted && !s.sharedBoxId && !s.fromLibrary;
  }
  function isSubjectPublishedInLibrary(s) {
    if (!s) return false;
    // Collections partagées avant le lien vers la boîte d'origine (round
    // 20) : reconnues par leur nom, faute de mieux.
    return myPublishedSourceIds.has(s.id) || myPublishedLegacyNames.has(s.name);
  }
  function subjectPassesManageFilter(subjectId) {
    if (manageMode !== "creations") return true;
    const s = subjects.find((x) => x.id === subjectId);
    if (!isOwnCreatedSubject(s)) return false;
    return manageOnlyPublished ? isSubjectPublishedInLibrary(s) : true;
  }
  function folderPassesManageFilter(folderId) {
    if (manageMode !== "creations") return true;
    const f = folders.find((x) => x.id === folderId);
    if (!f || f.sharedClassId || f.sharedClassRoot) return false;
    if (isFolderABoite(folderId)) return subjectPassesManageFilter(folderId);
    const inside = subjectIdsInFolder(folderId);
    const boitesInside = folderDescendantIds(folderId).filter((id) => isFolderABoite(id));
    if (inside.some(subjectPassesManageFilter) || boitesInside.some(subjectPassesManageFilter)) return true;
    // Dossier vide (le sien) : visible tant qu'on ne filtre pas sur les
    // boîtes publiées — il pourra recevoir de nouvelles créations.
    return !manageOnlyPublished && inside.length === 0 && boitesInside.length === 0;
  }

  async function refreshMyPublishedSubjects() {
    myPublishedSourceIds = new Set();
    myPublishedLegacyNames = new Set();
    if (!Sync.isConfigured() || !accountCurrentUser) return;
    try {
      const cols = await Sync.library.list();
      cols
        .filter((c) => c.owner_id === accountCurrentUser.id)
        .forEach((c) => {
          if (c.source_subject_id) myPublishedSourceIds.add(c.source_subject_id);
          else if (c.name) myPublishedLegacyNames.add(c.name);
        });
    } catch (e) {
      console.warn("Librairie : échec du chargement de mes publications", e);
    }
  }

  function updateManagePublishedToggle() {
    const t = el("manage-published-toggle");
    if (!t) return;
    t.hidden = manageMode !== "creations" || !accountCurrentUser;
    t.classList.toggle("is-active", manageOnlyPublished);
    t.setAttribute("aria-pressed", String(manageOnlyPublished));
  }

  function openManageInMode(mode) {
    manageMode = mode;
    if (mode !== "creations") manageOnlyPublished = false;
    updateManagePublishedToggle();
    const tab = document.querySelector('.tab[data-view="manage"]');
    if (tab) tab.click();
    if (mode === "creations") {
      refreshMyPublishedSubjects().then(() => {
        if (manageMode === "creations") renderSubjectManageList();
      });
    }
  }

  /** Bandeau défilant (texte qui défile de droite à gauche, en boucle).
   *  Deux copies du texte côte à côte, translatées de -50 % : la boucle est
   *  continue, sans à-coup. `always` : défile même si le texte tient (bandeau
   *  d'alerte de l'accueil) ; sinon, seulement s'il dépasse (noms de boîtes). */
  const MARQUEE_SPEED_PX_PER_S = 32;
  function applyMarquee(textEl, options) {
    if (!textEl) return;
    const always = !!(options && options.always);
    const text = textEl.dataset.marqueeText != null ? textEl.dataset.marqueeText : textEl.textContent;
    textEl.dataset.marqueeText = text;
    textEl.classList.remove("is-marquee");
    textEl.textContent = text;
    if (!text) return;
    if (!always && (textEl.clientWidth === 0 || textEl.scrollWidth <= textEl.clientWidth + 1)) return;
    textEl.classList.add("is-marquee");
    const safe = escapeHtml(text);
    textEl.innerHTML = `<span class="marquee-track"><span class="marquee-item">${safe}</span><span class="marquee-item" aria-hidden="true">${safe}</span></span>`;
    const item = textEl.querySelector(".marquee-item");
    const track = textEl.querySelector(".marquee-track");
    const distance = item ? item.getBoundingClientRect().width : 0;
    if (track) track.style.animationDuration = `${Math.max(5, distance / MARQUEE_SPEED_PX_PER_S).toFixed(1)}s`;
  }


  function renderSubjectManageList() {
    subjectListEl.innerHTML = "";
    renderTreeLevel(ROOT_FOLDER_ID, 0, subjectListEl);
    updateManagePublishedToggle();
    if ((folders.length === 0 && subjects.length === 0) || subjectListEl.children.length === 0) {
      const empty = document.createElement("p");
      empty.className = "field-hint";
      empty.textContent =
        manageMode !== "creations"
          ? "Aucune boîte pour l'instant."
          : manageOnlyPublished
          ? "Aucune de tes boîtes n'est encore publiée dans la Librairie."
          : "Tu n'as pas encore créé de boîte.";
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
   *  petit panneau), la jauge (plus courte/fine). Round 26, item 5 : le
   *  picto du mode d'apprentissage (abandonné) est retiré. */
  function buildRowBody({ nameBtnEl, expandBtnEl, countLabel, score: persPool, onRename, onMove, onDelete, onShare, deleteTitle, deleteLabel }) {
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

    if (persPool !== null) {
      const gaugeEl = document.createElement("span");
      gaugeEl.className = "org-info-slot-item org-gauge-inline";
      gaugeEl.dataset.slot = "1";
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
    delBtn.innerHTML = `${orgIconMarkup("orgDelete")}<span>${escapeHtml(deleteLabel || "Supprimer")}</span>`;
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
      shareBtn.innerHTML = `${iconSvgMarkup("share", "icon-inline-svg")}<span>Partager dans la librairie</span>`;
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
      // Round 19, item 8 : bug corrigé — le menu s'ouvrait toujours VERS
      // LE BAS (top:100%) ; pour un bloc tout en bas de la liste, il
      // dépassait alors du bas de l'écran, tronqué, sans que la page ne
      // défile pour le révéler. On mesure la place réellement disponible
      // sous le bouton juste avant l'ouverture, et on bascule le menu
      // au-dessus du bouton (voir .org-actions-popover--flip-up) s'il n'y
      // a pas assez de place en dessous.
      if (willOpen) {
        const btnRect = deployBtn.getBoundingClientRect();
        const estimatedHeight = popover.offsetHeight || popover.children.length * 40 + 12;
        const spaceBelow = window.innerHeight - btnRect.bottom;
        popover.classList.toggle("org-actions-popover--flip-up", spaceBelow < estimatedHeight + 12);
      }
    });
    main.appendChild(deployBtn);

    const wrap = document.createElement("div");
    wrap.className = "org-row-wrap";
    wrap.appendChild(main);
    wrap.appendChild(popover);
    return wrap;
  }

  function renderTreeLevel(parentId, depth, container) {
    // Round 10, item 1 : à la racine, les classes (dossier racine d'une
    // classe suivie) doivent toujours apparaître APRÈS les dossiers et
    // collections propres de l'utilisateur — auparavant, tout était trié
    // ensemble par ordre alphabétique, donc une classe pouvait se
    // retrouver mélangée au milieu. On ne sépare qu'au niveau racine : les
    // sous-dossiers d'une classe sont de toute façon reconstitués SOUS son
    // dossier racine (voir ensureClassMirrorFolderPath), l'ordre n'y a donc
    // pas de sens à changer.
    const isRootLevel = parentId === ROOT_FOLDER_ID;
    let childFolders = folders.filter((f) => f.parentId === parentId);
    let childSubjects = subjects.filter((s) => s.folderId === parentId && isSubjectInRevisions(s) && !folders.some((f) => f.id === s.id));
    if (isRootLevel) {
      const ownFolders = childFolders.filter((f) => !f.sharedClassId && !f.sharedClassRoot).sort((a, b) => a.name.localeCompare(b.name, "fr"));
      const classFolders = childFolders.filter((f) => f.sharedClassId || f.sharedClassRoot).sort((a, b) => a.name.localeCompare(b.name, "fr"));
      childFolders = [...ownFolders, ...classFolders];
      const ownSubjects = childSubjects.filter((s) => !s.sharedBoxId).sort((a, b) => a.name.localeCompare(b.name, "fr"));
      const classSubjects = childSubjects.filter((s) => s.sharedBoxId).sort((a, b) => a.name.localeCompare(b.name, "fr"));
      childSubjects = [...ownSubjects, ...classSubjects];
    } else {
      childFolders = childFolders.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      // Item 1 : une boîte "auto-liée" (même id qu'un dossier) ne doit
      // jamais être rendue ici comme boîte indépendante — c'est le dossier
      // correspondant, plus bas, qui la représente.
      childSubjects = childSubjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }
    // Mes créations de fiches : seulement les boîtes de l'utilisateur.
    if (manageMode === "creations") {
      childFolders = childFolders.filter((f) => folderPassesManageFilter(f.id));
      childSubjects = childSubjects.filter((x) => subjectPassesManageFilter(x.id));
    }

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
      nameBtn.title = "Voir les fiches de cette boîte";
      // Round 13, item 3-2 : un clic sur une boîte mène désormais à la page
      // Fiches (au lieu de Réviser) — le bouton Accueil depuis Fiches
      // ramène alors ici (Mon bureau) plutôt qu'au véritable accueil
      // (cardsEntryFromManage, déjà géré par goHome()).
      nameBtn.addEventListener("click", () => {
        cardsEntryFromManage = true;
        cardsEntryFromCreations = false;
        goToCardsFor(`subject:${subjectId}`);
      });

      const n = cards.filter((c) => !c.deleted && c.subject === subjectId).length;
      const subjScore = subjectCardsPool(subjectId);
      const body = buildRowBody({
        nameBtnEl: nameBtn,
        countLabel: `${n} fiche${n > 1 ? "s" : ""}`,
        score: subjScore,
        onRename: () => (isSelfLinkedFolder ? renameFolder(subjectId) : renameSubject(subjectId)),
        onMove: async () => {
          // Round 3, item 1 : une boîte partagée par un professeur reste
          // là où LUI l'a organisée — on ne peut pas la déplacer ici.
          if (!isSelfLinkedFolder && (await blockIfSharedReadonly(subjectId))) return;
          openMovePicker(isSelfLinkedFolder ? "folder" : "subject", subjectId);
        },
        // Round 31 : « Supprimer » devient « Retirer de mes révisions » — une
        // boîte à soi n'est pas supprimée, elle reste dans Mes créations de
        // fiches et garde en mémoire son emplacement (proposé si on l'y
        // remet). Boîte de classe / collection de la Librairie : même
        // libellé, effet inchangé (bloqué / retirée, reprenable en Librairie).
        onDelete: () => (isOwnCreatedSubject(subjectForIcon) ? removeSubjectFromRevisions(subjectId) : deleteSubject(subjectId)),
        // Round 31 : « Partager dans la librairie » retiré de ce menu — la
        // publication se fait depuis Mes créations de fiches.
        onShare: null,
        deleteLabel: "Retirer de mes révisions",
        deleteTitle: "Retirer cette boîte de mes révisions (elle n'est pas supprimée)",
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
      nameBtn.title = "Voir les fiches de ce dossier";
      // Round 3, item 1 : le dossier racine d'une classe (créé
      // automatiquement chez l'élève) porte l'icône "classe" plutôt que
      // l'icône dossier classique, pour qu'on le distingue au premier coup
      // d'œil dans l'arborescence.
      const folderIconMarkup = f.sharedClassRoot ? CLASSES_ROW_ICON : iconSvgMarkup("folder", "icon-inline-svg");
      nameBtn.innerHTML = `${folderIconMarkup} <span>${escapeHtml(f.name)}</span>`;
      // Round 13, item 3-2 : un clic sur un dossier mène désormais à la
      // page Fiches (au lieu de Réviser) — Accueil depuis Fiches ramène
      // alors ici.
      nameBtn.addEventListener("click", () => {
        cardsEntryFromManage = true;
        goToCardsFor(`folder:${f.id}`);
      });

      const childCount = folders.filter((x) => x.parentId === f.id).length + subjects.filter((x) => x.folderId === f.id && isSubjectInRevisions(x)).length;
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
        // Round 3, item 1 : un dossier de classe (racine ou reconstitué)
        // reste organisé par le professeur.
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
    const name = await robotPrompt("Nom du nouveau dossier :");
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
    const name = await robotPrompt("Nouveau nom du dossier :", f.name);
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
      // Round 18, item 7 : ce message est désormais donné par le robot
      // (bulle de parole) plutôt qu'en simple titre de page, et le bouton
      // de retour de cette page devient "Annuler" (on choisit une
      // destination, on ne "revient" pas en arrière).
      robotMessage: `Déplacer « ${name || ""} » vers :`,
      backLabel: "Annuler",
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

  async function createSubjectFlow() {
    const name = await robotPrompt("Nom de la nouvelle boîte :");
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

  /** Round 10, item 2 : une collection PRISE dans la Bibliothèque devient
   *  elle aussi un miroir en lecture seule (même principe que
   *  isSharedReadonlySubject pour une boîte de classe, voir plus haut) —
   *  son contenu suit les modifications de l'auteur automatiquement (voir
   *  reconcileLibraryCollection/syncLibraryMirrorsForUser plus bas), donc
   *  on ne peut ni la renommer ni la repartager. Contrairement à une boîte
   *  de classe, en revanche : (a) elle reste déplaçable entre dossiers
   *  (demandé explicitement), et (b) "Supprimer" reste possible — ça la
   *  retire seulement de Mes collections, sans toucher à la collection
   *  publique dans la Bibliothèque (voir deleteSubject plus bas). */
  function isLibraryMirrorSubject(subjectId) {
    const s = subjects.find((x) => x.id === subjectId);
    return !!(s && s.fromLibrary && s.libraryOriginId);
  }
  async function blockIfLibraryMirror(subjectId, action) {
    if (isLibraryMirrorSubject(subjectId)) {
      await robotAlert(`Cette collection vient de la Librairie : elle se met à jour toute seule, tu ne peux pas la ${action} ici.`);
      return true;
    }
    return false;
  }

  async function renameSubject(id) {
    if (await blockIfSharedReadonly(id)) return;
    if (await blockIfLibraryMirror(id, "renommer")) return;
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    const name = await robotPrompt("Nouveau nom de la boîte :", s.name);
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
    const s = subjects.find((x) => x.id === id);
    if (!s) return;
    const isLibMirror = isLibraryMirrorSubject(id);
    const n = cards.filter((c) => !c.deleted && c.subject === id).length;
    const confirmMsg = isLibMirror
      ? `Retirer « ${s.name} » de Mes collections ? Elle restera disponible dans la Librairie, tu pourras la reprendre plus tard.`
      : n > 0
        ? `Supprimer la boîte « ${s.name} » et ses ${n} fiche(s) ? Cette action est irréversible.`
        : `Supprimer la boîte « ${s.name} » ?`;
    if (!(await robotConfirm(confirmMsg, { danger: !isLibMirror, okLabel: isLibMirror ? "Retirer" : undefined }))) return;

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
      currentSubjectId = subjects[0] ? subjects[0].id : ALL_SUBJECTS_ID;
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
          .filter((s) => s.folderId === parentId && isSubjectInRevisions(s) && !folders.some((f) => f.id === s.id))
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
      const childCount = folders.filter((x) => x.parentId === f.id).length + subjects.filter((x) => x.folderId === f.id && isSubjectInRevisions(x)).length;
      const expanded = pickerExpandedFolders.has(f.id);
      const ids = subjectIdsInFolder(f.id);
      const isEmpty = folderIsEmpty(f.id);
      // Round 3, item 1 : un dossier vide de classe ne doit jamais pouvoir
      // devenir une boîte via ce raccourci (sélecteur "Nouvelle fiche") —
      // seule une sélection "dossier entier" (folderAlwaysSelectable, ex.
      // Réviser/événement de calendrier) reste possible dessus.
      // Round 30 : un dossier (même vide) ne se transforme plus en boîte —
      // il n'est sélectionnable que là où un dossier entier est un choix
      // valable (évènement de calendrier, destination d'un déplacement).
      const rowSelectable = ctx.mode === "single" && !!ctx.folderAlwaysSelectable;
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
        nameText: f.name,
        countLabel: `${ids.length} boîte${ids.length > 1 ? "s" : ""}`,
        selectControl: ctx.mode === "multi" ? "checkbox" : "none",
        checked: ctx.mode === "multi" && ids.length > 0 && ids.every((id) => ctx.selectedSubjectIds.has(id)),
        dataKind: "folder",
        value: f.id,
        rowSelectable,
        onRowSelect: async () => {
          if (ctx.folderAlwaysSelectable) ctx.onPick("folder", f.id);
        },
      });
      if (!expanded && childCount > 0) li.classList.add("folder-row--stacked");
      if (cb) {
        // Round 34 : dossier dont une partie seulement est sélectionnée →
        // case partiellement cochée.
        const nSel = ids.filter((id) => ctx.selectedSubjectIds.has(id)).length;
        cb.indeterminate = nSel > 0 && nSel < ids.length;
        if (cb.indeterminate) li.classList.add("picker-row--partial");
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
    {
      const nSel = allIds.filter((id) => ctx.selectedSubjectIds.has(id)).length;
      cb.indeterminate = nSel > 0 && nSel < allIds.length;
    }
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
  function renderSingleBoitePicker(container, onPick, folderAlwaysSelectable, excludeSubjectIds, libraryOptions, includeOutOfRevisions) {
    function rerender() {
      container.innerHTML = "";
      container.classList.add("picker-tree");
      // Round 11, item 1 : quand des collections de la Bibliothèque sont
      // proposées (partage vers une classe), elles apparaissent en tête,
      // sous leur propre intitulé, AVANT l'arbre des boîtes perso — avec la
      // même icône en réseau que partout ailleurs dans l'appli pour une
      // collection de la Bibliothèque (voir appendBoiteRow/renderLibraryList),
      // pas l'icône de boîte habituelle.
      if (libraryOptions && libraryOptions.length > 0) {
        const sectionTitle = document.createElement("li");
        sectionTitle.className = "picker-section-title";
        sectionTitle.textContent = "Depuis la Librairie";
        container.appendChild(sectionTitle);
        libraryOptions.forEach((col) => {
          const n = Array.isArray(col.cards) ? col.cards.length : 0;
          const { li } = buildPickerRow({
            depth: 0,
            isFolder: false,
            iconMarkup: iconSvgMarkup("share", "icon-inline-svg"),
            nameText: col.name,
            countLabel: `${n} fiche${n > 1 ? "s" : ""} — ${col.owner_email || "quelqu'un"}`,
            selectControl: "none",
            dataKind: "library",
            value: col.id,
            rowSelectable: true,
            onRowSelect: () => onPick("library", col.id),
          });
          container.appendChild(li);
        });
        const boxesTitle = document.createElement("li");
        boxesTitle.className = "picker-section-title";
        boxesTitle.textContent = "Mes boîtes";
        container.appendChild(boxesTitle);
      }
      renderFolderTreeForPicker(container, ROOT_FOLDER_ID, 0, { mode: "single", onPick, folderAlwaysSelectable, excludeSubjectIds, container, rerenderRoot: rerender });
      // Round 30 : mes boîtes hors révisions (Mes créations de fiches, pas
      // encore rangées) restent des destinations possibles pour une fiche.
      if (includeOutOfRevisions) {
        const outs = subjects
          .filter((x) => x.outOfRevisions && !x.deleted && (!excludeSubjectIds || !excludeSubjectIds.has(x.id)))
          .sort((a, b) => a.name.localeCompare(b.name, "fr"));
        if (outs.length > 0) {
          const t = document.createElement("li");
          t.className = "picker-section-title";
          t.textContent = "Hors de mes révisions";
          container.appendChild(t);
          outs.forEach((x) => {
            const n = cards.filter((c) => !c.deleted && c.subject === x.id).length;
            appendPickerBoiteRow(container, 0, x.id, x.name, n, { mode: "single", onPick });
          });
        }
      }
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
     comme n'importe quel autre onglet ou sous-page (
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
    // Round 22, item 7 : bug corrigé — contrairement au clic sur un onglet
    // normal (et à goHome()), cette fonction ne touchait jusqu'ici ni le
    // bouton "Accueil" du bandeau ni la ligne du robot (logo + bulle
    // d'aide). Conséquence concrète : en revenant à l'accueil PAR le
    // sélecteur de boîte(s) lui-même (son propre bouton "Annuler"/retour,
    // voir closeBoitePickerView — ex. sélecteur ouvert directement depuis
    // l'accueil), la bulle du robot du sélecteur restait affichée à
    // l'écran au lieu de disparaître avec le reste du bandeau, puisque
    // rien ne masquait plus la ligne qui la contient. On réplique donc ici
    // exactement ce que fait déjà tout autre chemin de navigation pour ces
    // deux éléments, quelle que soit la vue de destination.
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = shortName === "home";
    const bodyLogoRowEl = el("body-logo-row");
    if (bodyLogoRowEl) bodyLogoRowEl.hidden = shortName === "home";
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
    // Round 18, item 7/13 : quand ctx.robotMessage est fourni, c'est le
    // ROBOT qui annonce ce texte (bulle de parole) plutôt qu'un simple
    // titre de page — le titre visuel est alors masqué pour ne pas se
    // répéter (le texte reste tout de même posé dedans, pour l'accessibilité).
    if (titleEl) {
      titleEl.textContent = ctx.title || ctx.robotMessage || "Choisir une boîte";
      titleEl.hidden = !!ctx.robotMessage;
    }
    const hintEl = el("boite-picker-hint");
    if (hintEl) {
      hintEl.textContent = ctx.hint || "";
      hintEl.hidden = !ctx.hint;
    }
    const backBtnEl = el("boite-picker-back-btn");
    if (backBtnEl) backBtnEl.textContent = ctx.backLabel || "← Retour";

    const actions = el("boite-picker-actions");
    const confirmBtn = el("boite-picker-confirm");
    const noneBtn = el("boite-picker-none");

    // Round 18, item 13 : le bouton (déplacé au-dessus de la liste, voir
    // index.html) est maintenant indépendant de la barre d'actions du bas
    // (qui ne porte plus que "Valider", mode multi) — disponible aussi
    // bien en mode "single" (Calendrier, avant) qu'en mode "multi"
    // (Calendrier, maintenant qu'on peut lier plusieurs boîtes/dossiers à
    // la fois).
    // Round 19, item 3 : renommé "Tout désélectionner" en mode multi —
    // vide la sélection SANS quitter la page (avant : fermait la page
    // comme "Aucun lien", ce qui obligeait à rouvrir le sélecteur pour
    // vérifier qu'il était bien vide). Le mode "single" garde l'ancien
    // comportement (ctx.onNone, ferme la page), pas concerné ici.
    if (noneBtn) {
      noneBtn.hidden = !ctx.showNoneButton;
      noneBtn.textContent = ctx.mode === "multi" ? "Tout désélectionner" : "Aucun lien";
    }

    if (ctx.mode === "multi") {
      const selection = new Set(ctx.initialSelection || []);
      renderMultiBoitePicker(list, selection);
      if (actions) actions.hidden = false;
      if (confirmBtn) {
        confirmBtn.hidden = false;
        confirmBtn.textContent = ctx.confirmLabel || "Valider";
        confirmBtn.onclick = () => ctx.onConfirm(selection);
      }
      if (noneBtn) {
        noneBtn.onclick = ctx.showNoneButton
          ? () => {
              selection.clear();
              renderMultiBoitePicker(list, selection);
            }
          : null;
      }
    } else {
      if (noneBtn) noneBtn.onclick = ctx.showNoneButton ? ctx.onNone : null;
      if (ctx.excludedFolderIds) {
        renderMoveDestinationPicker(list, ctx.excludedFolderIds, (destId) => ctx.onPick("folder", destId));
      } else {
        renderSingleBoitePicker(list, (kind, id) => ctx.onPick(kind, id), !!ctx.folderAlwaysSelectable, ctx.excludeSubjectIds, ctx.libraryOptions, !!ctx.includeOutOfRevisions);
      }
      if (confirmBtn) confirmBtn.hidden = true;
      if (actions) actions.hidden = true;
    }

    boitePickerActivateView("view-boite-picker");
    // Comme toute autre page indépendante (Nouvelle fiche, Affecter un
    // mode...), l'en-tête de l'appli (bouton Accueil, logo) reste visible.
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
    if (ctx.robotMessage) {
      // Round 18, item 7/13 : message ponctuel et dynamique (nom du
      // dossier/de la boîte concernée), affiché tout de suite (pas besoin
      // de cliquer sur le bouton d'aide) plutôt que le message générique
      // habituel de cette page.
      bodyLogoSpeechMessages = [ctx.robotMessage];
      bodyLogoSpeechIndex = 0;
      renderBodyLogoSpeechState(true);
    } else {
      applyBodyLogoSpeech("boite-picker");
    }
  }

  function closeBoitePickerView() {
    const returnViewId = boitePickerReturnViewId || "view-home";
    boitePickerActivateView(returnViewId);
    if (returnViewId === "view-creations") renderCreationsList();
    if (returnViewId === "view-creation-detail") renderCreationDetail();
    // Round 4, partie 2 : en revenant sur la page d'où on est parti, la
    // bulle d'aide doit refléter CETTE page, pas garder le message (ou
    // l'absence de message) du sélecteur de boîte(s).
    if (returnViewId !== "view-home") {
      applyBodyLogoSpeech(returnViewId.replace(/^view-/, ""));
    } else {
      // Round 22, item 7 : même en repartant vers l'accueil (qui n'affiche
      // de toute façon plus le robot, voir le correctif de
      // boitePickerActivateView ci-dessus), on vide le message du
      // sélecteur pour ne rien laisser trainer en mémoire pour la
      // prochaine fois.
      bodyLogoSpeechMessages = [];
      bodyLogoSpeechIndex = 0;
      renderBodyLogoSpeechState(false);
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
      // Round 39 : depuis « Sélection manuelle », le bouton lance directement la révision.
      confirmLabel: multiPickerNavigateToReviewOnConfirm ? "Lancer la révision" : "Valider",
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
        // Bug corrigé (round 17, item 4) : `boitePickerActivateView`
        // bascule juste les classes CSS "is-active" — contrairement au
        // clic sur l'onglet Réviser (voir plus bas, ".tab" click), elle
        // ne (re)démarre PAS la session de révision. Comme switchSubject
        // ci-dessus vient de vider la file (reviewQueue = [], voir
        // switchSubject) SANS la reconstruire (la page Réviser n'était
        // pas encore active à cet instant-là, condition ratée), la page
        // s'affichait donc avec une file vide ("rien à réviser" sur
        // iPhone) ou une fiche non réinitialisée correctement (fiche qui
        // ne pivote pas, observé sur PC). Cliquer le VRAI onglet Réviser
        // (comme partout ailleurs, voir goToReviewFor) plutôt que
        // basculer les classes à la main garantit exactement le même
        // chemin que n'importe quelle autre arrivée sur cette page.
        if (shouldNavigateToReview) {
          const reviewTab = document.querySelector('.tab[data-view="review"]');
          if (reviewTab) reviewTab.click();
          else boitePickerActivateView("view-review");
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
      includeOutOfRevisions: true,
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
    renderSubjectBarCount();
  }

  /** Nombre de fiches de la boîte active, dans la barre de Réviser.
   *  Round 26, item 5 : l'ancien badge "mode d'apprentissage" (bouton sur
   *  la fiche) est retiré avec les modes. */
  function renderSubjectBarCount() {
    const n = currentSubjectId ? subjectCards().length : 0;
    if (subjectBarCountEl) subjectBarCountEl.textContent = `${n} fiche${n > 1 ? "s" : ""}`;
  }

  /** Toutes les fiches non supprimées de la boîte actuellement active —
   *  gère aussi les deux modes "toutes boîtes" / "sélection de boîtes"
   *  (item 1). */
  function subjectCards() {
    if (currentSubjectId === ALL_SUBJECTS_ID) {
      return revisionCards();
    }
    if (currentSubjectId === MULTI_SUBJECTS_ID) {
      const set = new Set(loadMultiSelection());
      return revisionCards().filter((c) => set.has(c.subject));
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
    // Round 42 : proportion des fiches selon leur DERNIÈRE NOTE (0 à 3,
    // jamais notée = 0) — dégradé gris -> vert vif.
    const counts = { court: 0, moyen: 0, long: 0, tresLong: 0 };
    for (const c of list) {
      counts[PERS_GAUGE_ZONE_ORDER[cardLastRating(c)]] += 1;
    }
    const total = list.length;
    const barY = 2;
    const height = barY * 2 + barHeight + (showLabels ? 14 : 0);
    // Round 22, item 1 : les extrémités de la barre (gauche ET droite)
    // doivent être arrondies, comme sur l'image de référence — les
    // segments individuels restent carrés entre eux (jointures nettes),
    // seuls les deux bouts de la barre entière sont ronds. Un simple
    // `rx` sur chaque `<rect>` de segment ne suffit pas (seul le
    // segment tout à droite se retrouverait arrondi, et seulement
    // partiellement puisqu'un rect avec `rx` est arrondi des DEUX
    // côtés) : la barre entière est donc dessinée dans un groupe
    // découpé (`clip-path`) par un rectangle à coins arrondis de la
    // largeur totale, qui masque proprement les coins carrés des
    // rectangles de segments qui dépassent de cette forme.
    const clipId = `pers-gauge-clip-${Math.random().toString(36).slice(2, 9)}`;
    let svg = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs><clipPath id="${clipId}"><rect x="0" y="${barY}" width="${width}" height="${barHeight}" rx="${barHeight / 2}" /></clipPath></defs>`;
    svg += `<g clip-path="url(#${clipId})">`;
    svg += `<rect x="0" y="${barY}" width="${width}" height="${barHeight}" fill="${colors.court}" />`;
    if (total > 0) {
      let x = 0;
      for (const key of PERS_GAUGE_ZONE_ORDER) {
        const w = (counts[key] / total) * width;
        if (w > 0) {
          svg += `<rect x="${x.toFixed(1)}" y="${barY}" width="${w.toFixed(1)}" height="${barHeight}" fill="${colors[key]}" />`;
        }
        x += w;
      }
    }
    svg += `</g>`;
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
      .filter((ev) => eventLinkIds(ev).includes(linkId) && ev.date >= todayStr)
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
  /* ---------------------------------------------------------
     Séance de révision continue (round 42) : tant qu'on répond, l'appli
     continue. Ordre : d'abord les fiches dues (la plus en retard en
     premier), puis les fiches notées 0 ou 1 dans la séance et pas encore
     revues deux fois, puis toutes les autres par date prévue. Au moins
     SESSION_MIN_GAP autres fiches entre deux passages d'une même fiche
     (ou toutes les autres s'il y en a moins). Plus de révision libre ni de
     mode bonus.
  --------------------------------------------------------- */
  function freshSessionState() {
    return {
      seen: new Map(), // id -> nombre de passages notés dans la séance
      low: new Set(), // fiches notées 0 ou 1 dans la séance
      recent: [], // derniers ids notés (règle des 10 fiches)
      dueAtStart: new Set(),
      dueDoneToastShown: false,
      proposalShown: false,
      proposalArmed: false,
    };
  }
  let sessionState = freshSessionState();
  function cloneSessionState(st) {
    return {
      ...st,
      seen: new Map(st.seen),
      low: new Set(st.low),
      recent: [...st.recent],
      dueAtStart: new Set(st.dueAtStart),
    };
  }

  function startReviewSession() {
    reviewSessionStarted = true;
    // Rapprochement sprint/fond avec le calendrier : la partie en mémoire
    // est synchrone (seul l'enregistrement est asynchrone), les fiches
    // dues ci-dessous en tiennent donc déjà compte.
    reconcileSprintState();
    const due = dueCards();
    sessionState = freshSessionState();
    due.forEach((c) => sessionState.dueAtStart.add(c.id));
    reviewQueue = due;
    sessionTotalDue = due.length;
    currentCard = null;
    // Une nouvelle session invalide l'annulation en attente (item 2) : la
    // fiche à restaurer n'est plus forcément dans la nouvelle file.
    lastRatingSnapshot = null;
    const undoBtn = el("undo-rating-btn");
    if (undoBtn) undoBtn.hidden = true;
    showNextCard();
  }

  function cardDueTime(c) {
    return c.dueDate ? new Date(c.dueDate).getTime() : 0;
  }
  /** Prochaine fiche de la séance parmi `pool` (voir ci-dessus). */
  function pickNextSessionCard(pool) {
    if (pool.length === 0) return null;
    const gap = Math.min(SESSION_MIN_GAP, pool.length - 1);
    const blocked = new Set(gap > 0 ? sessionState.recent.slice(-gap) : []);
    let candidates = pool.filter((c) => !blocked.has(c.id));
    if (candidates.length === 0) candidates = pool;
    const now = Date.now();
    const tier = (c) => {
      if (cardDueTime(c) <= now) return 0;
      if (sessionState.low.has(c.id) && (sessionState.seen.get(c.id) || 0) < 2) return 1;
      return 2;
    };
    let best = null;
    let bestTier = 9;
    let bestDue = Infinity;
    candidates.forEach((c) => {
      const t = tier(c);
      const d = cardDueTime(c);
      if (t < bestTier || (t === bestTier && d < bestDue)) {
        best = c;
        bestTier = t;
        bestDue = d;
      }
    });
    return best;
  }
  /** Texte de progression sous la fiche. */
  function renderSessionProgress() {
    const remaining = reviewQueue.length;
    if (sessionTotalDue > 0 && remaining > 0) {
      reviewProgressEl.textContent = `${sessionTotalDue - remaining}/${sessionTotalDue} fiches dues revues`;
    } else if (sessionTotalDue > 0) {
      reviewProgressEl.textContent = "Fiches dues terminées — tu continues en avance";
      if (!sessionState.dueDoneToastShown) {
        sessionState.dueDoneToastShown = true;
        showCenterToast("✅ Fiches dues terminées — tu continues en avance");
      }
    } else {
      reviewProgressEl.textContent = "Aucune fiche due — tu révises en avance";
    }
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
      reviewQueue = reviewQueue.filter((c) => c.id !== currentCard.id);
      showNextCard();
      return;
    }
    currentCard = fresh;
    renderQuestionText(currentCard);
    answerTextEl.innerHTML = toDisplayHtml(currentCard.answer);
    updateRatingPreviews();
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
    isBonusMode = false;
    const pool = subjectCards();
    if (pool.length === 0) {
      currentCard = null;
      emptyStateEl.hidden = false;
      cardStackEl.hidden = true;
      editCurrentBtn.hidden = true;
      if (el("construction-current-btn")) el("construction-current-btn").hidden = true;
      ratingRowEl.hidden = true;
      if (el("review-score-info")) el("review-score-info").hidden = true;
      reviewProgressEl.textContent = "";
      renderDuePill();
      renderReviewChart();
      renderReviewSubjectScore();
      renderReviewGauge();
      return;
    }
    currentCard = pickNextSessionCard(pool);
    emptyStateEl.hidden = true;
    cardStackEl.hidden = false;
    editCurrentBtn.hidden = false;
    // Les boutons d'évaluation restent affichés en permanence (côté
    // question comme côté réponse) : on ne les cache plus au retournement.
    ratingRowEl.hidden = false;
    renderQuestionText(currentCard);
    answerTextEl.innerHTML = toDisplayHtml(currentCard.answer);
    renderSessionProgress();
    updateRatingPreviews();
    renderDuePill();
    renderReviewChart();
    renderReviewSubjectScore();
    renderReviewGauge();
  }

  function updateRatingPreviews() {
    if (!currentCard) return;
    el("sub-again").textContent = "…";
    const previews = {};
    const futureDelaysMin = {};
    for (const rating of ["again", "hard", "good", "easy"]) {
      const next = computeAlgoNext(currentCard, rating);
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
    const labels = { again: "Je ne sais pas", hard: "Vague idée", good: "Je sais", easy: "Parfait" };
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
      sessionState: cloneSessionState(sessionState),
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
    if (snap.sessionState) sessionState = snap.sessionState;
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
    const updated = await rateScheduledCard(rating);
    // Suivi de la séance (règle des 10 fiches, fiches à revoir deux fois,
    // proposition de passer à la boîte suivante).
    const id = updated.id;
    sessionState.seen.set(id, (sessionState.seen.get(id) || 0) + 1);
    if (ratingIndex(rating) <= 1) sessionState.low.add(id);
    sessionState.recent.push(id);
    if (sessionState.recent.length > 50) sessionState.recent.splice(0, sessionState.recent.length - 50);
    reviewQueue = reviewQueue.filter((c) => c.id !== id);
    showNextCard();
    // Anime le mini graphique (item 9) : la barre "aujourd'hui" et toutes
    // les barres jusqu'à la nouvelle date de la fiche s'allument en vague,
    // de gauche à droite.
    requestAnimationFrame(() => triggerReviewChartWave(0, updated.interval));
    maybeProposeNextBox();
  }

  async function rateScheduledCard(rating) {
    const next = computeAlgoNext(currentCard, rating);
    delete next.mode;
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

    renderStats();
    renderManageList();
    return updated;
  }

  /* ---------------------------------------------------------
     « Dois-je continuer ? » (round 42) : une fois toutes les fiches dues
     vues et les fiches notées 0 ou 1 dans la séance revues deux fois, le
     robot propose la boîte suivante des révisions conseillées (ou dit que
     tout est fait). S'il continue, il ne repropose que lorsque la condition
     redevient vraie après de nouvelles fiches ratées.
  --------------------------------------------------------- */
  function sessionProposalConditionMet() {
    const alive = new Set(subjectCards().map((c) => c.id));
    for (const id of sessionState.dueAtStart) {
      if (alive.has(id) && !(sessionState.seen.get(id) >= 1)) return false;
    }
    for (const id of sessionState.low) {
      if (alive.has(id) && (sessionState.seen.get(id) || 0) < 2) return false;
    }
    return true;
  }
  /** Boîtes des révisions conseillées dans l'ordre : échéances proches
   *  (cases cochées), puis « Renforcer mes connaissances ». */
  function advisedBoxOrder() {
    const out = [];
    upcomingEventsWithBoxes().forEach((ev) => {
      const unchecked = revisionProgramUnchecked.get(ev.id) || new Set();
      revisionTreeBoxIds(revisionTreeForEvent(ev)).forEach((id) => {
        if (!unchecked.has(id) && !out.includes(id)) out.push(id);
      });
    });
    computeReinforceItems().forEach((it) => {
      if (!out.includes(it.id)) out.push(it.id);
    });
    return out;
  }
  function nextAdvisedBox() {
    const inScope = new Set(subjectCards().map((c) => c.subject));
    for (const id of advisedBoxOrder()) {
      if (inScope.has(id)) continue;
      const due = cards.filter((c) => !c.deleted && c.subject === id && SM2.isDue(c)).length;
      if (due > 0) return { id, name: subjectName(id), due };
    }
    return null;
  }
  let proposalOpen = false;
  async function maybeProposeNextBox() {
    if (proposalOpen || !currentCard) return;
    const met = sessionProposalConditionMet();
    if (!met) {
      if (sessionState.proposalShown) sessionState.proposalArmed = true;
      return;
    }
    if (sessionState.proposalShown && !sessionState.proposalArmed) return;
    sessionState.proposalShown = true;
    sessionState.proposalArmed = false;
    const scope = currentSubjectId === ALL_SUBJECTS_ID || currentSubjectId === MULTI_SUBJECTS_ID ? "de ta sélection" : "de cette boîte";
    const head =
      sessionState.low.size > 0
        ? `Bravo ! Tu as vu toutes les fiches dues ${scope}, et revu deux fois celles que tu ne savais pas.`
        : `Bravo ! Tu as vu toutes les fiches dues ${scope}.`;
    const next = nextAdvisedBox();
    proposalOpen = true;
    try {
      if (next) {
        const ok = await robotConfirm(
          `${head}\n\nJe te propose de passer à la boîte suivante des révisions conseillées : « ${next.name} » (${next.due} fiche${next.due > 1 ? "s" : ""} à revoir).`,
          { okLabel: "Passer à cette boîte", cancelLabel: "Continuer ici" }
        );
        if (ok) {
          reviewEntryFromManage = false;
          reviewEntryFromProgram = true;
          switchSubject(next.id);
        }
      } else {
        await robotAlert(`${head}\n\nTes révisions conseillées sont terminées pour le moment : tu peux t'arrêter là, ou continuer à réviser en avance.`);
      }
    } finally {
      proposalOpen = false;
    }
  }

  const constructionCurrentBtn = el("construction-current-btn");
  if (constructionCurrentBtn) {
    constructionCurrentBtn.addEventListener("click", async () => {
      if (!currentCard) return;
      await signalCard(currentCard.id);
      constructionCurrentBtn.classList.toggle("is-active-construction", !!currentCard.underConstruction);
    });
  }

  /** cardForm.reset() natif ne touche pas les champs contenteditable (item
   *  13) — seuls les vrais éléments de formulaire (input/textarea/select).
   *  On les vide donc à la main partout où l'ancien reset() était appelé. */
  /** Retenu pour "Retour" (item 2) : permet de revenir à l'onglet d'où on
   *  venait, plutôt que toujours atterrir sur Fiches. */
  let previousViewBeforeNewCard = "review";
  /* Round 39 : « + Ajouter une fiche » depuis une boîte (page de la boîte
     dans Mes créations, ou ses fiches) — la boîte est déjà connue : pas de
     sélecteur de boîte sur la page de création, et retour à la page d'où
     l'on vient. Le choix mémorisé pour « Ajouter une fiche » de l'accueil
     n'est pas modifié. */
  let newCardFixedSubject = null; // { id, prevSubjectId, returnView }
  function openNewCardForSubject(subjectId, returnView) {
    if (!subjects.some((x) => x.id === subjectId)) return;
    exitEditMode();
    resetCardForm();
    newCardFixedSubject = { id: subjectId, prevSubjectId: newCardSubjectId, returnView };
    newCardSubjectId = subjectId;
    const bar = el("cards-subject-bar");
    if (bar) bar.hidden = true;
    if (cancelEditBtn) cancelEditBtn.hidden = false;
    openNewCardView();
    previousViewBeforeNewCard = returnView;
    if (inputQuestion) inputQuestion.focus();
  }
  function releaseNewCardFixedSubject() {
    if (!newCardFixedSubject) return;
    newCardSubjectId = newCardFixedSubject.prevSubjectId;
    newCardFixedSubject = null;
    const bar = el("cards-subject-bar");
    if (bar) bar.hidden = false;
    const btn = el("cards-subject-select-btn");
    if (btn) btn.textContent = newCardSubjectId ? subjectName(newCardSubjectId) : "Sélection de la boîte";
  }
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
    releaseNewCardFixedSubject();
    if (dest === "creation-detail") {
      boitePickerActivateView("view-creation-detail");
      applyBodyLogoSpeech("creation-detail");
      renderCreationDetail();
      return;
    }
    if (dest === "cards") renderManageList();
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
    if (cardsScopeFilter === ALL_SUBJECTS) return revisionCards();
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
    // Round 39 : fiches d'une boîte ouverte depuis Mes créations — bouton
    // rond « + Ajouter une fiche » et pas de sélecteur de périmètre.
    {
      const fromBox = cardsEntryFromCreations && subjects.some((x) => x.id === cardsScopeFilter);
      const addWrap = el("cards-add-card-wrap");
      // Round 41 : plus de sélecteur de périmètre — juste le nom du dossier
      // ou de la boîte.
      const scopeRow = document.querySelector("#view-cards .cards-scope-row");
      if (scopeRow) scopeRow.hidden = true;
      const scopeTitle = el("cards-scope-title");
      if (scopeTitle) {
        const isFolder = typeof cardsScopeFilter === "string" && cardsScopeFilter.startsWith("folder:");
        scopeTitle.innerHTML = `${isFolder ? iconSvgMarkup("folder", "icon-inline-svg") : orgIconMarkup("orgBoite")} <span>${escapeHtml(cardsScopeLabel())}</span>`;
      }
      if (addWrap) {
        addWrap.hidden = !fromBox;
        if (fromBox && !addWrap.firstChild) addWrap.innerHTML = roundAddCardButtonHtml();
        const b = addWrap.querySelector("button");
        if (b) b.onclick = () => openNewCardForSubject(cardsScopeFilter, "cards");
      }
    }
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
        ? "Aucune fiche signalée dans ce périmètre."
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
      q.innerHTML = (card.underConstruction ? "🚩 " : "") + toDisplayHtml(card.question);

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
      constructionBtn.title = isReadonlyMirrorCard(card) ? "Signaler cette fiche à son auteur" : card.underConstruction ? "Retirer le signalement" : "Signaler cette fiche (à corriger)";
      constructionBtn.addEventListener("click", () => signalCard(card.id));

      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn icon-btn--danger";
      delBtn.type = "button";
      delBtn.textContent = "suppr.";
      delBtn.addEventListener("click", () => deleteCard(card.id));

      actions.appendChild(editBtn);
      actions.appendChild(constructionBtn);

      // Round 26, item 4 : "déplacer" ouvre l'explorateur (page de
      // sélection, comme partout ailleurs) au lieu d'une liste déroulante.
      if (subjects.length > 1 || folders.length > 0) {
        const moveBtn = document.createElement("button");
        moveBtn.type = "button";
        moveBtn.className = "icon-btn card-row-move";
        moveBtn.title = "Déplacer vers une autre boîte";
        moveBtn.textContent = "déplacer";
        moveBtn.addEventListener("click", () => openCardMovePicker(card.id));
        actions.appendChild(moveBtn);
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

  /** Round 26, item 4 : choix de la boîte de destination d'une fiche dans
   *  l'explorateur. Exclut sa boîte actuelle et les boîtes en lecture
   *  seule (classe, Librairie) ; un dossier vide choisi devient boîte. */
  function openCardMovePicker(cardId) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const excluded = new Set(subjects.filter((s) => s.sharedBoxId || s.fromLibrary).map((s) => s.id));
    excluded.add(card.subject);
    const label = (card.question || "").replace(/\s+/g, " ").trim();
    openBoitePickerView({
      mode: "single",
      robotMessage: `Déplacer la fiche « ${label.length > 40 ? label.slice(0, 40) + "…" : label} » vers :`,
      excludeSubjectIds: excluded,
      includeOutOfRevisions: true,
      onPick: async (kind, id) => {
        let destId = id;
        if (kind === "folder") {
          const s = await ensureFolderIsBoite(id);
          if (!s) return;
          destId = s.id;
        }
        const fromId = card.subject;
        closeBoitePickerView();
        await moveCardToSubject(cardId, destId);
        await revertFolderIfBoiteEmptied(fromId);
      },
    });
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
    const btn = el("export-subject-btn");
    if (btn) btn.textContent = exportSubjectSelectEl.value ? subjectName(exportSubjectSelectEl.value) : "Choisir la boîte…";
  }
  /** Round 26, item 4 : export et import choisissent leur boîte dans
   *  l'explorateur (la liste déroulante masquée garde la valeur). */
  function openIoSubjectPicker(selectEl, robotMessage, excludeReadonly, onDone) {
    openBoitePickerView({
      mode: "single",
      robotMessage,
      excludeSubjectIds: excludeReadonly ? new Set(subjects.filter((s) => s.sharedBoxId || s.fromLibrary).map((s) => s.id)) : undefined,
      onPick: async (kind, id) => {
        let subjId = id;
        if (kind === "folder") {
          const s = await ensureFolderIsBoite(id);
          if (!s) return;
          subjId = s.id;
          renderSubjectSelect();
        }
        if (![...selectEl.options].some((o) => o.value === subjId)) {
          const opt = document.createElement("option");
          opt.value = subjId;
          opt.textContent = subjectName(subjId);
          selectEl.appendChild(opt);
        }
        selectEl.value = subjId;
        closeBoitePickerView();
        onDone();
      },
    });
  }
  const exportSubjectBtnEl = el("export-subject-btn");
  if (exportSubjectBtnEl && exportSubjectSelectEl) {
    exportSubjectBtnEl.addEventListener("click", () =>
      openIoSubjectPicker(exportSubjectSelectEl, "Quelle boîte exporter ?", false, updateExportCount)
    );
  }
  function updateImportTargetLabel() {
    const btn = el("import-target-btn");
    if (btn) btn.textContent = importTargetSelect.value && importTargetSelect.value !== "__new__" ? subjectName(importTargetSelect.value) : "Choisir la boîte…";
  }
  const importTargetBtnEl = el("import-target-btn");
  if (importTargetBtnEl) {
    importTargetBtnEl.addEventListener("click", () =>
      openIoSubjectPicker(importTargetSelect, "Dans quelle boîte importer les fiches ?", true, updateImportTargetLabel)
    );
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
      return revisionCards();
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
    const allCards = revisionCards();
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
  // Round 26, item 5 : affichage "mode" retiré (modes d'apprentissage
  // abandonnés) — un ancien choix "mode" retombe sur "count".
  const ORG_DISPLAY_MODES = ["count", "gauge"];
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

  function renderDevView() {
    const devSettings = loadDevSettings();
    const ratingBtnBgInput = el("dev-color-rating-btn-bg");
    if (ratingBtnBgInput) ratingBtnBgInput.value = devSettings.ratingBtnBgColor;
    const ratingBtnBgNightInput = el("dev-color-rating-btn-bg-night");
    if (ratingBtnBgNightInput) ratingBtnBgNightInput.value = devSettings.nightColors.ratingBtnBgColor;
    renderRatingColorsEditor();
    renderRatingIconsEditor();
    renderNavIconsEditor();
    renderIconBankEditor();
    renderOrgIconBankEditor();
    renderBgColorsEditor();
    renderTextColorsSetEditor();
    renderShadowsEditor();
    renderHomeLayoutEditor();
    renderHomeLogoEditor();
    renderDarwinLogoEditor();
    renderDarwinTextEditor();
    renderReviewLayoutEditor();
    renderRevisionAlgoEditor();
    renderPersGaugeColorsEditor();
    renderCardScoreEditor();
    renderGaugeColorsEditor();
    renderHelpMessagesEditor();
    renderDevLibraryModerationEditor();
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
  // Round 16 : le bouton "Publier pour tous les utilisateurs" a été retiré —
  // chaque sauvegarde dans le mode développeur écrit désormais directement
  // dans dev_settings_public (voir scheduleDevSettingsPush), donc toute
  // modification est automatiquement "publiée" pour tout le monde sans
  // étape manuelle supplémentaire.

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
      // Round 22, item 4 : connexion obligatoire — masquer les cercles
      // d'accueil (voir CSS body.is-login-locked) suffit contre un usage
      // normal, mais un onglet reste techniquement cliquable par un autre
      // chemin (ex. resté en mémoire depuis avant la déconnexion). On
      // referme donc systématiquement sur le verrou ici aussi, sauf vers
      // les deux pages que le verrou lui-même autorise (Compte/Synchro).
      if (appLoginLocked && tab.dataset.view !== "account" && tab.dataset.view !== "sync") {
        enforceLoginGate();
        return;
      }
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
      applyBodyLogoSpeech(view === "manage" && manageMode === "creations" ? "manage-creations" : view);

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
      if (view === "dev") {
      renderDevView();
      renderDevSyncStatus();
    }
      if (view === "sync") renderSyncView();
      if (view === "account") renderAccountView();
      if (view === "school-hub") {
        refreshMessagesBadge();
        refreshCalendarHubBadge();
      }
      if (view === "classes") renderClassesView();
      if (view === "messages") renderMessagesView();
      if (view === "library") renderLibraryView();
      if (view === "creations") renderCreationsView();
      if (view === "reports") renderReportsView();
      if (view === "fiches-hub") refreshReportsBadge();
      // Round 10, item 2 : resynchronise les collections prises dans la
      // Bibliothèque en ouvrant Mes collections — indépendant d'un Compte
      // connecté (prendre une collection publique n'en demande pas), donc
      // appelé ici plutôt que via syncSharedBoxesForStudent (qui lui exige
      // un Compte, pour les boîtes de classe).
      if (view === "manage") syncLibraryMirrorsForUser().then(() => renderSubjectManageList());
      if (view === "calendar") renderCalendarEvents();
      if (view === "revision-program") renderRevisionProgramList();
      if (view === "review-hub") renderReviewHub();
      if (view === "settings") renderSettingsView();
      renderDuePill();
    });
  });

  /** Round 15, item 1 : nom de la page affiché tout en haut — retiré à
   *  visuellement au round 17, item 3 (jugé inutile, prenait de la
   *  place), mais la liste reste utile pour garder l'onglet du navigateur
   *  à jour (<title>), et le principe (déduit de la vue actuellement
   *  active, via un MutationObserver sur .view.is-active plutôt que
   *  patché à chaque point du code qui change de page) est réutilisé
   *  ci-dessous (round 17) pour d'autres bascules liées à la page
   *  courante : logo darwin du bandeau (masqué sur l'accueil, item 1) et
   *  bloc d'actions de "Mon bureau" intégré au bandeau (item 3). Un seul
   *  point d'entrée couvre TOUS les chemins de bascule de page (clic
   *  d'onglet, goHome, sélecteur de boîte(s)...), sans avoir à les
   *  patcher un par un. */
  const PAGE_TITLES = {
    home: "Accueil",
    "review-hub": "Réviser",
    "revision-program": "Programme",
    review: "Réviser",
    manage: "Fiches",
    "new-card": "Nouvelle fiche",
    cards: "Fiches",
    stats: "Statistiques",
    calendar: "Calendrier",
    sync: "Synchronisation",
    account: "Mon compte",
    "school-hub": "École",
    "fiches-hub": "Gérer mes fiches",
    creations: "Mes créations",
    "box-create": "Nouvelle boîte",
    "creation-detail": "Boîte",
    "report-card": "Signaler",
    reports: "Signalements",
    classes: "Classes",
    "classes-student": "Classes",
    "classes-join": "Rejoindre une classe",
    "classes-teacher": "Classes",
    "classes-create": "Créer une classe",
    "class-detail": "Classe",
    messages: "Messagerie",
    "message-thread": "Messagerie",
    library: "Librairie",
    settings: "Réglages",
    dev: "Développeur",
    "boite-picker": "Sélection",
    "calendar-event-form": "Événement",
  };
  /* ---------------------------------------------------------
     Round 45 : navigation commune à toutes les pages.
     - « ← Retour » (#nav-back-btn) : revient à la page précédente
       (historique des pages visitées). Si la page a son propre bouton de
       retour / d'annulation (il fait aussi le ménage : formulaire,
       sélecteur…), c'est lui qui est utilisé ; ces anciens boutons
       « ← Retour… » sont masqués.
     - Accueil : toujours la page d'accueil (goHome).
     - Titre de la page à droite du robot (#page-header-title) ; le titre
       qui était dans la page est masqué (ou recopié s'il change, ex. nom
       de la classe).
  --------------------------------------------------------- */
  const navStack = [];
  let navLastKey = "home";
  let navBackUntil = 0;
  // Pages de passage (formulaires, sélecteurs) : jamais rouvertes par
  // « ← Retour », on revient à la page d'avant.
  const NAV_TRANSIENT = new Set(["boite-picker", "calendar-event-form", "new-card", "box-create", "report-card", "library-share", "classes-join", "classes-create"]);
  const NAV_OWN_BACK = {
    "calendar-event-detail": "calendar-detail-back-btn",
    "creation-detail": "creation-detail-back-btn",
    "classes-join": "classes-join-back-btn",
    "classes-create": "classes-create-back-btn",
    "class-detail": "class-detail-back-btn",
    "message-thread": "message-thread-back-btn",
    "boite-picker": "boite-picker-back-btn",
    "library-detail": "library-detail-back-btn",
    "library-cards": "library-cards-back-btn",
    "calendar-event-form": "calendar-event-cancel",
    "report-card": "report-card-cancel",
    "box-create": "box-create-cancel-btn",
    "library-share": "library-share-back-btn",
  };
  ["calendar-detail-back-btn", "creation-detail-back-btn", "classes-join-back-btn", "classes-create-back-btn", "class-detail-back-btn", "message-thread-back-btn", "boite-picker-back-btn", "library-detail-back-btn", "library-cards-back-btn"].forEach((id) => {
    const b = el(id);
    if (b) b.classList.add("nav-legacy-back");
  });
  function navOnViewChanged(key) {
    if (!key || key === navLastKey) return;
    if (key === "home") {
      navStack.length = 0;
    } else if (Date.now() < navBackUntil) {
      const i = navStack.lastIndexOf(key);
      if (i >= 0) navStack.length = i;
    } else if (navLastKey && !NAV_TRANSIENT.has(navLastKey)) {
      if (navStack[navStack.length - 1] !== navLastKey) navStack.push(navLastKey);
      if (navStack.length > 40) navStack.splice(0, navStack.length - 40);
    }
    navLastKey = key;
    // (classe CSS plutôt que appLoginLocked : cette fonction tourne dès le
    // chargement, avant la déclaration de cette variable.)
    const locked = document.body.classList.contains("is-login-locked");
    const backBtn = el("nav-back-btn");
    if (backBtn) backBtn.hidden = key === "home" || locked;
    if (homeBtn && key !== "home" && !locked) homeBtn.hidden = false;
    if (key !== "home" && el("body-logo-row")) el("body-logo-row").hidden = false;
  }
  function navActivate(key) {
    if (key === "home") {
      goHome();
      return;
    }
    if (key === "classes-student" || key === "classes-teacher") {
      openClassesSubView(key === "classes-teacher" ? "teacher" : "student");
      return;
    }
    if (key === "class-detail" && classDetailContext) {
      openClassDetailView(classDetailContext.klass, classDetailContext.role);
      return;
    }
    if (key === "creation-detail" && creationDetailSubjectId && subjects.some((x) => x.id === creationDetailSubjectId)) {
      openCreationDetail(creationDetailSubjectId);
      return;
    }
    const tab = document.querySelector(`.tab[data-view="${key}"]`);
    if (tab) {
      tab.click();
      return;
    }
    const target = el(`view-${key}`);
    if (!target) {
      goHome();
      return;
    }
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    target.classList.add("is-active");
    applyBodyLogoSpeech(key);
  }
  function navBack() {
    if (appLoginLocked) {
      enforceLoginGate();
      return;
    }
    const active = document.querySelector(".view.is-active");
    const key = active ? active.id.replace(/^view-/, "") : "home";
    if (key === "home") return;
    navBackUntil = Date.now() + 600;
    if (key === "cards") {
      cardsEntryFromManage = false;
      cardsEntryFromCreations = false;
    }
    const own = NAV_OWN_BACK[key] && el(NAV_OWN_BACK[key]);
    if (own) {
      own.click();
      return;
    }
    if (key === "new-card") {
      closeNewCardView();
      return;
    }
    while (navStack.length && (NAV_TRANSIENT.has(navStack[navStack.length - 1]) || navStack[navStack.length - 1] === key)) navStack.pop();
    if (navStack.length) {
      navActivate(navStack[navStack.length - 1]);
      return;
    }
    // Pas d'historique (ex. après un rechargement) : page « parente ».
    goBackHierarchical();
  }
  const navBackBtn = el("nav-back-btn");
  if (navBackBtn) navBackBtn.addEventListener("click", navBack);

  /** Titre de la page : texte fixe, ou recopié d'un élément de la page
   *  (`from`, qui est alors masqué) ; `hide` = titres d'origine à masquer. */
  const PAGE_HEADER_TITLES = {
    "review-hub": "Réviser",
    "revision-program": "Révisions conseillées",
    review: "Réviser",
    manage: "Mes fiches de révision",
    "new-card": { from: "#view-new-card .card-form-header h2.section-title" },
    cards: { from: "#cards-scope-title", fallback: "Liste des fiches", hide: ["#view-cards .cards-list-big-title"] },
    stats: "Statistiques",
    calendar: "Calendrier",
    "calendar-event-form": { from: "#calendar-event-form-title" },
    "calendar-event-detail": { from: "#view-calendar-event-detail .view-title" },
    sync: "Synchronisation",
    account: { text: "Mon compte", hide: ["#view-account > h2.section-title"] },
    "school-hub": "École",
    "fiches-hub": "Gérer mes fiches",
    creations: { text: "Mes créations de fiches", hide: ["#view-creations .library-title-row"] },
    "box-create": { from: "#box-create-title" },
    "creation-detail": "Ma boîte",
    "report-card": { text: "Signaler une fiche", hide: ["#view-report-card .settings-block-title"] },
    reports: { text: "Signalements", hide: ["#view-reports > h2.section-title"] },
    classes: { text: "Mes classes", hide: ["#view-classes > h2.section-title"] },
    "classes-student": { text: "Élève", hide: ["#view-classes-student > h2.section-title"] },
    "classes-join": { text: "Rejoindre une classe", hide: ["#view-classes-join > h2.section-title"] },
    "classes-teacher": { text: "Enseignant", hide: ["#view-classes-teacher > h2.section-title"] },
    "classes-create": { text: "Créer une classe", hide: ["#view-classes-create > h2.section-title"] },
    "class-detail": { from: "#class-detail-title" },
    messages: { text: "Messagerie", hide: ["#view-messages > h2.section-title"] },
    "message-thread": { from: "#message-thread-title" },
    library: { text: "Librairie", hide: ["#view-library .library-title-row > h2.section-title"] },
    settings: { text: "Réglages", hide: ["#view-settings > h2.section-title"] },
    dev: { text: "Développeur", hide: ["#view-dev > h2.section-title"] },
    "boite-picker": { from: "#boite-picker-title" },
    "library-detail": { from: "#view-library-detail .view-title" },
    "library-cards": { from: "#view-library-cards .view-title" },
    "library-share": { from: "#view-library-share .settings-block-title" },
  };
  let pageHeaderKey = "";
  function pageHeaderTitleText(key) {
    const cfg = PAGE_HEADER_TITLES[key];
    if (!cfg) return PAGE_TITLES[key] || "";
    if (typeof cfg === "string") return cfg;
    if (cfg.from) {
      const src = document.querySelector(cfg.from);
      const t = src ? src.textContent.trim() : "";
      return t || cfg.fallback || PAGE_TITLES[key] || "";
    }
    return cfg.text || "";
  }
  function updatePageHeaderTitle(key) {
    if (key !== undefined) pageHeaderKey = key;
    const t = el("page-header-title");
    if (!t) return;
    const text = pageHeaderKey === "home" ? "" : pageHeaderTitleText(pageHeaderKey);
    if (t.textContent !== text) t.textContent = text;
    const speechOpen = el("body-logo-speech") && !el("body-logo-speech").hidden;
    t.hidden = !text || speechOpen;
  }
  // Titres d'origine masqués (classe CSS) ; ceux qui sont recopiés sont
  // surveillés pour suivre leurs changements (nom de classe, etc.).
  Object.values(PAGE_HEADER_TITLES).forEach((cfg) => {
    if (typeof cfg !== "object") return;
    (cfg.hide || []).forEach((sel) => document.querySelectorAll(sel).forEach((n) => n.classList.add("page-title-moved")));
    if (cfg.from) {
      const src = document.querySelector(cfg.from);
      if (!src) return;
      src.classList.add("page-title-moved");
      new MutationObserver(() => updatePageHeaderTitle()).observe(src, { childList: true, characterData: true, subtree: true });
    }
  });

  const topbarDarwinLogoEl = el("topbar-darwin-logo");
  const manageStickyActionsEl = el("manage-sticky-actions");
  function onActiveViewChanged() {
    const activeView = document.querySelector(".view.is-active");
    const key = activeView ? activeView.id.replace(/^view-/, "") : "";
    document.title = PAGE_TITLES[key] ? `${PAGE_TITLES[key]} — Fiches` : "Fiches";
    navOnViewChanged(key);
    updatePageHeaderTitle(key);
    // Round 17, item 1 : logo darwin du bandeau masqué UNIQUEMENT sur
    // l'accueil (qui a déjà son propre grand logo darwin).
    if (topbarDarwinLogoEl) topbarDarwinLogoEl.hidden = key === "home";
    // Round 17, item 3 : bloc d'actions de "Mon bureau" visible
    // UNIQUEMENT sur cette page.
    if (manageStickyActionsEl) manageStickyActionsEl.hidden = key !== "manage";
    // Round 31 : fond propre à la page Librairie (voir css, body.is-view-library).
    document.body.classList.toggle("is-view-library", key === "library");
    setTimeout(refreshHomeEventWarning, 0);
  }
  document.querySelectorAll(".view").forEach((v) => {
    new MutationObserver(onActiveViewChanged).observe(v, { attributes: true, attributeFilter: ["class"] });
  });
  onActiveViewChanged();

  /** Round 15, item 5 : hauteur RÉELLE du bandeau fixe (topbar + titre de
   *  page + robot), mesurée en JS et posée en variable CSS
   *  (--sticky-header-h) pour pousser <main> d'autant — la hauteur varie
   *  selon la page (titre plus ou moins long, robot présent ou non sur
   *  l'accueil...) donc ne peut pas être une constante fixe en CSS.
   *  ResizeObserver se redéclenche tout seul à chaque changement de
   *  hauteur du bandeau, sans avoir besoin d'être rappelé manuellement à
   *  chaque endroit qui pourrait la faire varier. */
  (function () {
    const header = el("app-sticky-header");
    if (!header || typeof ResizeObserver === "undefined") return;
    const rootStyle = document.documentElement.style;
    function syncStickyHeaderHeight() {
      rootStyle.setProperty("--sticky-header-h", `${Math.ceil(header.getBoundingClientRect().height)}px`);
      // La fiche (page Réviser) a sa marge haute minimale calculée à
      // partir de cette même hauteur (voir applyReviewLayout) — on la
      // resynchronise ici pour rester cohérent si le bandeau change de
      // taille (rotation d'écran, titre qui passe sur 2 lignes...).
      if (typeof applyReviewLayout === "function") applyReviewLayout();
    }
    new ResizeObserver(syncStickyHeaderHeight).observe(header);
    syncStickyHeaderHeight();
  })();

  /** Round 15, item 6 : aide CONTEXTUELLE — en plus de la bulle d'aide
   *  générique par page (body-logo-help-btn, déjà existante), ce bouton
   *  bascule un mode "pointer" : le PROCHAIN clic sur n'importe quel
   *  élément de la page est intercepté (au lieu de déclencher son action
   *  normale) et le robot affiche une explication pour CET élément-là.
   *  L'explication est celle déjà portée par l'élément (attribut
   *  data-help dédié en priorité, sinon aria-label/title/texte déjà
   *  utilisés partout dans l'appli pour l'accessibilité) — pas besoin de
   *  tout redocumenter à la main pour que ce soit déjà utile partout. */
  function getContextualHelpText(target) {
    const withData = target.closest("[data-help]");
    if (withData) return withData.getAttribute("data-help");
    const interactive = target.closest(
      "button, a, input, select, textarea, [role='button'], .home-circle, .tab"
    );
    if (!interactive) return null;
    const aria = interactive.getAttribute("aria-label");
    if (aria && aria.trim()) return aria.trim();
    const title = interactive.getAttribute("title");
    if (title && title.trim()) return title.trim();
    const span = interactive.querySelector("span");
    if (span && span.textContent && span.textContent.trim()) return span.textContent.trim();
    const text = interactive.textContent && interactive.textContent.trim();
    if (text) return text.slice(0, 140);
    return null;
  }
  let contextualHelpActive = false;
  function stopContextualHelp() {
    contextualHelpActive = false;
    document.body.classList.remove("is-contextual-help-picking");
    const btn = el("contextual-help-toggle-btn");
    if (btn) btn.classList.remove("is-active");
    const hint = el("contextual-help-hint");
    if (hint) hint.hidden = true;
    document.removeEventListener("click", onContextualHelpClick, true);
    document.removeEventListener("keydown", onContextualHelpKeydown, true);
  }
  function onContextualHelpClick(e) {
    // Le bouton qui active/désactive ce mode, et la bannière de guidage,
    // ne doivent pas se déclencher eux-mêmes comme cible d'aide.
    if (e.target.closest("#contextual-help-toggle-btn") || e.target.closest("#contextual-help-hint")) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    const text = getContextualHelpText(e.target);
    stopContextualHelp();
    robotAlert(
      text ||
        "Je n'ai pas encore d'explication toute prête pour cet élément précis — mais n'hésite pas à me demander directement !"
    );
  }
  function onContextualHelpKeydown(e) {
    if (e.key === "Escape") stopContextualHelp();
  }
  function startContextualHelp() {
    contextualHelpActive = true;
    document.body.classList.add("is-contextual-help-picking");
    const btn = el("contextual-help-toggle-btn");
    if (btn) btn.classList.add("is-active");
    const hint = el("contextual-help-hint");
    if (hint) hint.hidden = false;
    document.addEventListener("click", onContextualHelpClick, true);
    document.addEventListener("keydown", onContextualHelpKeydown, true);
  }
  const contextualHelpToggleBtn = el("contextual-help-toggle-btn");
  if (contextualHelpToggleBtn) {
    contextualHelpToggleBtn.addEventListener("click", () => {
      if (contextualHelpActive) stopContextualHelp();
      else startContextualHelp();
    });
  }

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
  // Round 25, item 2 : Réviser atteint via "Révisions conseillées" (true)
  // ou via "Sélection manuelle" (false) — décide où ramène Accueil.
  let reviewEntryFromProgram = false;
  function goBackHierarchical() {
    // Round 22, item 4 : connexion obligatoire — tant que l'appli est
    // verrouillée, "Accueil" ne doit jamais en sortir (le bouton lui-même
    // est déjà masqué par enforceLoginGate(), ceci est une défense
    // supplémentaire si jamais goHome() est appelé autrement).
    if (appLoginLocked) {
      enforceLoginGate();
      return;
    }
    if (cardsEntryFromManage && el("view-cards") && el("view-cards").classList.contains("is-active")) {
      cardsEntryFromManage = false;
      const tab = document.querySelector('.tab[data-view="manage"]');
      if (tab) tab.click();
      return;
    }
    if (newCardFixedSubject && el("view-new-card") && el("view-new-card").classList.contains("is-active")) {
      closeNewCardView();
      return;
    }
    if (cardsEntryFromCreations && el("view-cards") && el("view-cards").classList.contains("is-active")) {
      cardsEntryFromCreations = false;
      const tab = document.querySelector('.tab[data-view="creations"]');
      if (tab) tab.click();
      // Round 34 : retour sur la page détaillée de la boîte d'où l'on venait.
      if (creationDetailSubjectId && subjects.some((x) => x.id === creationDetailSubjectId)) openCreationDetail(creationDetailSubjectId);
      return;
    }
    if (el("view-reports") && el("view-reports").classList.contains("is-active")) {
      const tab = document.querySelector('.tab[data-view="fiches-hub"]');
      if (tab) tab.click();
      return;
    }
    if (el("view-report-card") && el("view-report-card").classList.contains("is-active")) {
      closeReportCardView();
      return;
    }
    if (el("view-creation-detail") && el("view-creation-detail").classList.contains("is-active")) {
      creationDetailSubjectId = null;
      const tab = document.querySelector('.tab[data-view="creations"]');
      if (tab) tab.click();
      return;
    }
    // Mes fiches de révision / Mes créations se rejoignent par le hub
    // Fiches : Accueil y ramène. Round 30 : la Librairie, elle, est
    // désormais sur l'accueil (Accueil y ramène directement).
    if (
      (el("view-manage") && el("view-manage").classList.contains("is-active")) ||
      (el("view-creations") && el("view-creations").classList.contains("is-active"))
    ) {
      const tab = document.querySelector('.tab[data-view="fiches-hub"]');
      if (tab) tab.click();
      return;
    }
    // Round 13, item 4 : Classes et Messagerie ne se rejoignent plus que
    // via le nouveau hub École — Accueil y ramène plutôt qu'au véritable
    // accueil, comme pour Organisation/Fiches ci-dessus.
    if (
      (el("view-classes") && el("view-classes").classList.contains("is-active")) ||
      (el("view-messages") && el("view-messages").classList.contains("is-active")) ||
      // Round 25, item 3 : en mode « Calendrier à l'accueil », le
      // Calendrier ramène au véritable accueil (le hub École n'y mène plus).
      (el("view-calendar") && el("view-calendar").classList.contains("is-active") && !homeCalendarModeActive())
    ) {
      const tab = document.querySelector('.tab[data-view="school-hub"]');
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
      // Round 25, item 2 : retour au Programme si on y est passé, sinon au
      // palier Réviser (Sélection manuelle).
      const tab = document.querySelector(`.tab[data-view="${reviewEntryFromProgram ? "revision-program" : "review-hub"}"]`);
      if (tab) tab.click();
      return;
    }
    if (el("view-revision-program") && el("view-revision-program").classList.contains("is-active")) {
      const tab = document.querySelector('.tab[data-view="review-hub"]');
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
    // Round 22, item 7 : filet de sécurité en plus du masquage de la ligne
    // ci-dessus — vide aussi le message de la bulle du robot elle-même
    // (pas seulement son conteneur), pour qu'aucune page suivante n'hérite
    // par erreur d'un message resté en mémoire depuis avant ce retour à
    // l'accueil.
    bodyLogoSpeechMessages = [];
    bodyLogoSpeechIndex = 0;
    renderBodyLogoSpeechState(false);
  }
  /** Round 45 : Accueil ramène TOUJOURS à la page d'accueil (le retour
   *  d'une page en arrière est porté par « ← Retour », voir navBack). */
  function goHome() {
    if (appLoginLocked) {
      enforceLoginGate();
      return;
    }
    cardsEntryFromManage = false;
    cardsEntryFromCreations = false;
    if (newCardFixedSubject) releaseNewCardFixedSubject();
    creationDetailSubjectId = null;
    reportCardContext = null;
    calendarFormReturnToClass = null;
    calendarEditingEventId = null;
    reviewEntryFromManage = false;
    reviewEntryFromProgram = false;
    navStack.length = 0;
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-home").classList.add("is-active");
    if (homeBtn) homeBtn.hidden = true;
    if (el("body-logo-row")) el("body-logo-row").hidden = true;
    bodyLogoSpeechMessages = [];
    bodyLogoSpeechIndex = 0;
    renderBodyLogoSpeechState(false);
  }
  if (homeBtn) homeBtn.addEventListener("click", goHome);

  // Carrés de la page d'accueil (item 1a) : réutilisent directement la
  // logique des onglets ci-dessus (chaque carré déclenche le même
  // .tab[data-view=...].click()) plutôt que de dupliquer la bascule de vue.
  document.querySelectorAll(".home-circle[data-go]").forEach((square) => {
    square.addEventListener("click", () => {
      // Round 22, item 4 : même garde-fou que sur les onglets eux-mêmes.
      if (appLoginLocked && square.dataset.go !== "account" && square.dataset.go !== "sync") {
        enforceLoginGate();
        return;
      }
      // Item 5 : n'importe quel autre chemin vers Fiches (bouton d'accueil
      // dédié, etc.) repart sur le comportement normal du bouton Accueil.
      if (square.dataset.go === "cards") {
        cardsEntryFromManage = false;
        cardsEntryFromCreations = false;
      }
      const tab = document.querySelector(`.tab[data-view="${square.dataset.go}"]`);
      if (tab) tab.click();
    });
  });
  const homeEventWarningBtn = el("home-event-warning");
  if (homeEventWarningBtn) {
    homeEventWarningBtn.addEventListener("click", () => {
      if (appLoginLocked) {
        enforceLoginGate();
        return;
      }
      homeTickerOpenCurrent();
    });
  }
  const homeNewCardBtn = el("home-new-card-btn");
  if (homeNewCardBtn) {
    homeNewCardBtn.addEventListener("click", () => {
      releaseNewCardFixedSubject();
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
  const currentSyncAccountEl = el("current-sync-account");
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
  let unsubscribeDevSettingsRealtime = null;
  let syncAutoRetrying = false;

  /* ---------------------------------------------------------
     Vue Calendrier (item 9, revue item 2) — événements liés à une
     boîte/dossier, pensés comme base pour une future génération de
     programme de révision. Stockage simple en localStorage (pas encore
     dans IndexedDB, le volume attendu est faible).
  --------------------------------------------------------- */
  const CALENDAR_EVENTS_KEY = "fiches_calendar_events";
  /** Round 22, item 4 : bug corrigé — les évènements étaient soit (a) dans
   *  cet espace localStorage UNIQUE par appareil (donc partagés entre
   *  n'importe quels Comptes utilisés sur le même téléphone), soit (b, le
   *  vrai coupable du bug signalé par Stéphane) diffusés à TOUTE
   *  installation de l'appli via le canal `dev_settings_public` (voir le
   *  correctif dans gatherAppPrefs/applyAppPrefsFromRemote plus haut).
   *  Ils sont maintenant propres au Compte connecté (il y en a toujours un
   *  dès que l'appli est utilisable, voir enforceLoginGate) : chaque
   *  Compte a sa propre clé localStorage, dérivée de son identifiant
   *  Supabase Auth. */
  function calendarEventsStorageKey() {
    // Round 29 : l'id du compte est connu dès le démarrage (session
    // enregistrée sur l'appareil, voir js/user-scope.js), sans attendre
    // la réponse du serveur.
    const uid = (window.UserScope && window.UserScope.uid) || (accountCurrentUser && accountCurrentUser.id);
    return uid ? `${CALENDAR_EVENTS_KEY}__${uid}` : CALENDAR_EVENTS_KEY;
  }
  function loadCalendarEvents() {
    const key = calendarEventsStorageKey();
    // Migration ponctuelle, une seule fois par Compte : reprend les
    // évènements de l'ancien espace partagé (ex. les siens, créés avant ce
    // round) plutôt que de les perdre silencieusement au premier lancement
    // sous le nouveau stockage par Compte.
    if (key !== CALENDAR_EVENTS_KEY && localStorage.getItem(key) === null) {
      const legacy = localStorage.getItem(CALENDAR_EVENTS_KEY);
      if (legacy !== null) {
        localStorage.setItem(key, legacy);
        // Migration à USAGE UNIQUE (pas juste une copie) : l'ancien espace
        // partagé est vidé aussitôt repris par un premier Compte, pour
        // qu'un DEUXIÈME Compte se connectant ensuite sur ce même appareil
        // ne récupère pas à son tour les mêmes évènements (qui ne sont pas
        // les siens).
        localStorage.removeItem(CALENDAR_EVENTS_KEY);
      }
    }
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }
  /** Round 29 : enregistrement local + envoi au serveur des seuls
   *  évènements ajoutés, modifiés ou supprimés (comparés à la version
   *  précédente), horodatés pour la fusion entre appareils. */
  function saveCalendarEvents(events) {
    const before = new Map(loadCalendarEvents().map((ev) => [ev.id, ev]));
    const strip = (ev) => JSON.stringify({ ...ev, updatedAt: undefined });
    const now = new Date().toISOString();
    const changed = [];
    events.forEach((ev) => {
      const prev = before.get(ev.id);
      if (!prev || strip(prev) !== strip(ev)) {
        ev.updatedAt = now;
        changed.push(ev);
      }
      before.delete(ev.id);
    });
    const removed = [...before.values()].map((ev) => ({ ...ev, updatedAt: now }));
    saveCalendarEventsLocal(events);
    changed.forEach((ev) => pushCalendarEventSafe(ev, false));
    removed.forEach((ev) => pushCalendarEventSafe(ev, true));
  }
  function saveCalendarEventsLocal(events) {
    localStorage.setItem(calendarEventsStorageKey(), JSON.stringify(events));
    // Round 42 : une échéance créée, modifiée ou supprimée fait entrer ou
    // sortir des fiches du mode sprint.
    invalidateSubjectEventsCache();
    if (Array.isArray(cards) && cards.length > 0) {
      reconcileSprintState().then((n) => {
        if (n > 0) {
          renderAll();
          mergeNewDueCardsIntoQueue();
        }
      });
    }
    if (el("view-home") && el("view-home").classList.contains("is-active")) setTimeout(refreshHomeEventWarning, 0);
  }
  /* File d'attente des évènements à renvoyer (hors-ligne), par compte. */
  const CALENDAR_PENDING_KEY = "fiches_calendar_pending";
  function loadCalendarPending() {
    try {
      const raw = JSON.parse(localStorage.getItem(CALENDAR_PENDING_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }
  function saveCalendarPending(list) {
    localStorage.setItem(CALENDAR_PENDING_KEY, JSON.stringify(list));
  }
  async function pushCalendarEventSafe(ev, deleted) {
    if (!Sync.isConfigured() || !Sync.currentUid()) return;
    const ok = await Sync.pushCalendarEvent(ev, deleted);
    const pending = loadCalendarPending().filter((x) => x.ev.id !== ev.id);
    if (!ok) pending.push({ ev, deleted: !!deleted });
    saveCalendarPending(pending);
  }
  async function flushCalendarPending() {
    for (const { ev, deleted } of loadCalendarPending()) await pushCalendarEventSafe(ev, deleted);
  }
  /** Fusion d'un évènement venu du serveur : le plus récent gagne. */
  function mergeRemoteCalendarEvent(remote) {
    const events = loadCalendarEvents();
    const idx = events.findIndex((x) => x.id === remote.id);
    const local = idx >= 0 ? events[idx] : null;
    const newer = !local || new Date(remote.updatedAt || 0) >= new Date(local.updatedAt || 0);
    if (!newer) return false;
    if (remote.deleted) {
      if (idx < 0) return false;
      events.splice(idx, 1);
    } else {
      const clean = { ...remote };
      delete clean.deleted;
      if (idx >= 0) {
        if (JSON.stringify(local) === JSON.stringify(clean)) return false;
        events[idx] = clean;
      } else {
        events.push(clean);
      }
    }
    saveCalendarEventsLocal(events);
    return true;
  }
  /** Au démarrage de la synchro : récupère les évènements du compte et
   *  envoie ceux de l'appareil que le serveur n'a pas encore. */
  async function reconcileCalendarWithRemote() {
    if (!Sync.isConfigured() || !Sync.currentUid()) return;
    const remote = await Sync.pullCalendarEvents();
    const remoteIds = new Set(remote.map((r) => r.id));
    remote.forEach((r) => mergeRemoteCalendarEvent(r));
    for (const ev of loadCalendarEvents()) {
      if (!remoteIds.has(ev.id)) {
        if (!ev.updatedAt) ev.updatedAt = new Date().toISOString();
        await pushCalendarEventSafe(ev, false);
      }
    }
    await flushCalendarPending();
    if (el("view-calendar") && el("view-calendar").classList.contains("is-active")) renderCalendarEvents();
    refreshHomeEventWarning();
  }
  /** Round 21, item 3 : un élève peut désormais supprimer un évènement
   *  REÇU d'un prof une fois sa date passée (voir deleteOwnCalendarEvent).
   *  Comme cet évènement est un miroir resynchronisé à chaque passage
   *  (reconcileSharedEvent le recrée tant que le prof ne l'a pas retiré
   *  lui-même), une suppression locale simple ne "tiendrait" pas — l'id
   *  distant (`sharedEventId`) est donc gardé dans une liste locale
   *  d'évènements "écartés par l'élève", vérifiée avant toute recréation. */
  const CALENDAR_DISMISSED_SHARED_KEY = "fiches_calendar_dismissed_shared_events";
  // Round 22, item 4 : même correctif que calendarEventsStorageKey —
  // propre au Compte connecté plutôt qu'à l'appareil.
  function dismissedSharedEventsStorageKey() {
    const uid = (window.UserScope && window.UserScope.uid) || (accountCurrentUser && accountCurrentUser.id);
    return uid ? `${CALENDAR_DISMISSED_SHARED_KEY}__${uid}` : CALENDAR_DISMISSED_SHARED_KEY;
  }
  function loadDismissedSharedEventIds() {
    try {
      const raw = JSON.parse(localStorage.getItem(dismissedSharedEventsStorageKey()) || "[]");
      return new Set(Array.isArray(raw) ? raw : []);
    } catch {
      return new Set();
    }
  }
  function saveDismissedSharedEventIds(set) {
    localStorage.setItem(dismissedSharedEventsStorageKey(), JSON.stringify(Array.from(set)));
  }
  // Round 18, item 13 : un événement peut désormais être lié à PLUSIEURS
  // boîtes/dossiers à la fois — `calendarEventLinkIds` est un Set
  // d'identifiants "subject:ID" (cocher un dossier dans le sélecteur
  // multi-choix coche automatiquement toutes les boîtes qu'il contient,
  // même mécanisme que "Sélection de boîtes" en Réviser). Ancien format
  // "folder:ID" conservé en LECTURE pour les événements déjà enregistrés
  // avant ce round (voir eventLinkIds ci-dessous).
  let calendarEventLinkIds = new Set();
  let calendarEditingEventId = null; // null = ajout, sinon modification (item 2)
  let calendarViewMode = "list"; // "list" | "months" | "year" (item 2)
  let calendarMonthsAnchor = new Date();
  let calendarYearAnchor = new Date().getFullYear();

  function calendarLinkLabel(linkId) {
    if (!linkId) return "Aucune boîte/dossier liés";
    const [type, id] = linkId.split(":");
    if (type === "subject") return subjectName(id);
    const f = folders.find((x) => x.id === id);
    if (!f && subjects.some((x) => x.id === id)) return subjectName(id);
    return f ? `${f.name} (dossier)` : "Aucune boîte/dossier liés";
  }
  /** Round 18, item 13 : libellé du bouton pour un ENSEMBLE de liens
   *  (0, 1 ou plusieurs boîtes) — "Aucune boîte/dossier liés" si vide, le
   *  nom direct s'il n'y en a qu'un, sinon un décompte. */
  function calendarLinkIdsLabel(linkIds) {
    const arr = Array.from(linkIds || []);
    if (arr.length === 0) return "Aucune boîte/dossier liés";
    if (arr.length === 1) return calendarLinkLabel(arr[0]);
    return `${arr.length} boîtes liées`;
  }
  /** Round 18, item 13 (compat) : renvoie la liste des liens "subject:ID"
   *  d'un événement, qu'il ait été enregistré avant ce round (un seul
   *  `linkId`, éventuellement "folder:ID") ou depuis (`linkIds`, un
   *  tableau de "subject:ID"). */
  function eventLinkIds(ev) {
    if (Array.isArray(ev.linkIds)) return ev.linkIds;
    return ev.linkId ? [ev.linkId] : [];
  }
  /** Round 21, item 1 : noms des boîtes/dossiers liés à un évènement, un par
   *  ligne sous "Fiches à réviser :" (remplace le libellé condensé
   *  `calendarLinkIdsLabel`, gardé pour le bouton du formulaire). */
  function eventLinkedBoxNames(ev) {
    return eventLinkIds(ev).map((linkId) => calendarLinkLabel(linkId));
  }

  /** Round 21, item 1 : nombre de jours (entiers, signé) entre AUJOURD'HUI
   *  (heure locale, minuit) et la date de l'évènement — base du "compte à
   *  rebours" affiché à droite de chaque évènement. */
  function calendarDiffDays(dateStr) {
    const target = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }
  /** Round 21, item 1 : "compte à rebours" en toutes lettres (demande de
   *  Stéphane) — granularité qui se resserre à l'approche de la date :
   *  mois, puis semaines, puis "15 jours" (quinzaine, expression courante),
   *  puis jour par jour, demain, aujourd'hui, passé. */
  function calendarCountdownLabel(dateStr) {
    const diff = calendarDiffDays(dateStr);
    if (diff < 0) return "Passé";
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Demain";
    if (diff <= 13) return `Dans ${diff} jours`;
    if (diff <= 15) return "Dans 15 jours";
    if (diff < 30) {
      const weeks = Math.max(2, Math.round(diff / 7));
      return `Dans ${weeks} semaines`;
    }
    if (diff < 60) return "Dans 1 mois";
    const months = Math.round(diff / 30);
    return `Dans ${months} mois`;
  }

  /** Un évènement est "sans boîte" s'il n'a aucun lien, ou seulement des
   *  liens vers des boîtes/dossiers qui n'existent plus. */
  function calendarLinkExists(linkId) {
    if (!linkId) return false;
    const [type, id] = linkId.split(":");
    if (type === "subject") return subjects.some((x) => x.id === id && !x.deleted);
    if (type === "folder") return folders.some((x) => x.id === id && !x.deleted) || subjects.some((x) => x.id === id && !x.deleted);
    return false;
  }
  function calendarEventHasNoBox(ev) {
    return !eventLinkIds(ev).some(calendarLinkExists);
  }
  /** Évènements à venir (aujourd'hui compris) sans boîte associée, du plus
   *  proche au plus lointain — base de l'alerte du Calendrier et du bandeau
   *  défilant de l'accueil. */
  function upcomingEventsWithoutBox() {
    return loadCalendarEvents()
      .filter((ev) => ev && ev.date && calendarDiffDays(ev.date) >= 0 && calendarEventHasNoBox(ev))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Pastille grise du bouton Calendrier (hub École) : nombre
   *  d'évènements à venir (aujourd'hui compris). */
  function refreshCalendarHubBadge() {
    const badge = el("school-hub-calendar-badge");
    if (!badge) return;
    const n = loadCalendarEvents().filter((ev) => ev && ev.date && calendarDiffDays(ev.date) >= 0).length;
    badge.hidden = n <= 0;
    badge.textContent = n > 99 ? "99+" : String(n);
  }

  // Bandeau défilant d'alerte en haut de l'accueil. Pas d'alerte tant que
  // les boîtes ne sont pas chargées (sinon tous les liens paraîtraient
  // cassés au démarrage).
  let homeEventWarningReady = false;
  /* Round 26, item 3 : bandeau d'alertes de l'accueil en "carrousel".
     Chaque alerte s'affiche seule : courte pause au début, défilement
     horizontal jusqu'à la fin du texte s'il dépasse, courte pause à la fin,
     puis glissement vertical vers l'alerte suivante (et ainsi de suite, en
     boucle). Un appui mène là où l'alerte AFFICHÉE à ce moment-là le dit
     (Mon compte pour les usages, la fiche de l'évènement concerné pour un
     évènement sans boîte). */
  const HOME_TICKER_PAUSE_MS = 1500;
  const HOME_TICKER_SPEED_PX_PER_S = 32;
  const HOME_TICKER_SLIDE_MS = 450;
  const homeTicker = { items: [], key: "", index: 0, token: 0, timer: null, current: null };

  function homeTickerItems() {
    const onHome = !!(el("view-home") && el("view-home").classList.contains("is-active"));
    if (!onHome) return [];
    const items = [];
    const usages = currentUsages();
    if (usages && usages.length === 0) {
      items.push({
        text: "Dis-moi comment tu utilises l'appli : choisis un ou plusieurs usages (élève, enseignant, usage personnel) dans Mon compte.",
        target: { kind: "account" },
      });
    }
    if (homeEventWarningReady) {
      const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      upcomingEventsWithoutBox().forEach((ev) => {
        items.push({
          text: `L'évènement « ${ev.title || "Sans titre"} » (${fmt(ev.date)}) n'a pas de boîte associée : ajoute les fiches à réviser.`,
          target: { kind: "event", eventId: ev.id },
        });
      });
    }
    return items;
  }

  function homeTickerStop() {
    homeTicker.token++;
    clearTimeout(homeTicker.timer);
    homeTicker.timer = null;
  }
  function homeTickerWait(ms, token) {
    return new Promise((resolve) => {
      homeTicker.timer = setTimeout(() => resolve(token === homeTicker.token), ms);
    });
  }
  function homeTickerReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function homeTickerMakeLine(item) {
    const line = document.createElement("span");
    line.className = "home-ticker-line";
    line.textContent = item.text;
    return line;
  }
  /** Boucle d'affichage, annulée dès que `token` change (nouvelle liste,
   *  départ de l'accueil). */
  async function homeTickerRun(token) {
    const textEl = el("home-event-warning-text");
    if (!textEl) return;
    const reduce = homeTickerReducedMotion();
    textEl.innerHTML = "";
    let line = homeTickerMakeLine(homeTicker.items[homeTicker.index]);
    textEl.appendChild(line);
    homeTicker.current = homeTicker.items[homeTicker.index];
    while (token === homeTicker.token) {
      const overflow = Math.max(0, line.scrollWidth - textEl.clientWidth);
      textEl.classList.toggle("is-overflowing", overflow > 0);
      if (!(await homeTickerWait(HOME_TICKER_PAUSE_MS, token))) return;
      if (overflow > 0 && !reduce) {
        const duration = (overflow / HOME_TICKER_SPEED_PX_PER_S) * 1000;
        line.style.transition = `transform ${duration}ms linear`;
        line.style.transform = `translateX(-${overflow + 8}px)`;
        if (!(await homeTickerWait(duration, token))) return;
        if (!(await homeTickerWait(HOME_TICKER_PAUSE_MS, token))) return;
        // Round 41 : puis retour vers la gauche du texte (début du message),
        // et nouvelle pause avant le message suivant.
        line.style.transform = "translateX(0)";
        if (!(await homeTickerWait(duration, token))) return;
        if (!(await homeTickerWait(HOME_TICKER_PAUSE_MS, token))) return;
      } else if (!(await homeTickerWait(HOME_TICKER_PAUSE_MS, token))) {
        return;
      }
      // Alerte suivante (ou la même, revenue au début s'il n'y en a qu'une).
      homeTicker.index = (homeTicker.index + 1) % homeTicker.items.length;
      const next = homeTickerMakeLine(homeTicker.items[homeTicker.index]);
      if (homeTicker.items.length > 1 && !reduce) {
        next.style.transform = "translateY(100%)";
        textEl.appendChild(next);
        // force le calcul de la position de départ avant la transition
        void next.offsetHeight;
        line.style.transition = `transform ${HOME_TICKER_SLIDE_MS}ms ease, opacity ${HOME_TICKER_SLIDE_MS}ms ease`;
        next.style.transition = `transform ${HOME_TICKER_SLIDE_MS}ms ease`;
        line.style.transform = `${line.style.transform || ""} translateY(-100%)`;
        line.style.opacity = "0";
        next.style.transform = "translateY(0)";
        homeTicker.current = homeTicker.items[homeTicker.index];
        if (!(await homeTickerWait(HOME_TICKER_SLIDE_MS, token))) return;
        line.remove();
      } else {
        textEl.innerHTML = "";
        textEl.appendChild(next);
        homeTicker.current = homeTicker.items[homeTicker.index];
      }
      line = next;
    }
  }

  function refreshHomeEventWarning() {
    const wrap = el("home-event-warning");
    const textEl = el("home-event-warning-text");
    if (!wrap || !textEl) return;
    const items = homeTickerItems();
    const key = JSON.stringify(items);
    if (items.length === 0) {
      homeTickerStop();
      homeTicker.items = [];
      homeTicker.key = "";
      homeTicker.current = null;
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    // Même liste qu'avant, déjà en cours : on ne relance pas (évite un
    // retour au début à chaque rafraîchissement de l'accueil).
    if (key === homeTicker.key && homeTicker.timer) return;
    homeTickerStop();
    homeTicker.items = items;
    homeTicker.key = key;
    homeTicker.index = 0;
    homeTickerRun(homeTicker.token);
  }

  /** Appui sur le bandeau : destination de l'alerte affichée. */
  function homeTickerOpenCurrent() {
    const item = homeTicker.current || homeTicker.items[0];
    if (!item) return;
    if (item.target.kind === "account") {
      const tab = document.querySelector('.tab[data-view="account"]');
      if (tab) tab.click();
      return;
    }
    const calTab = document.querySelector('.tab[data-view="calendar"]');
    if (calTab) calTab.click();
    const ev = loadCalendarEvents().find((x) => x.id === item.target.eventId);
    if (ev) openCalendarEventDetailView(ev);
  }

  // Item 1 (4e lot) : ce sélecteur utilise désormais la page partagée
  // #view-boite-picker (rendu de l'arbre identique à Organisation), en
  // mode multi-choix (round 18, item 13) — cocher un dossier lie toutes
  // les boîtes qu'il contient ; le bouton "Aucun lien" (au-dessus de la
  // liste) vide la sélection entière.
  const calendarEventSubjectBtn = el("calendar-event-subject-btn");
  if (calendarEventSubjectBtn) {
    calendarEventSubjectBtn.addEventListener("click", () => {
      openBoitePickerView({
        mode: "multi",
        // Round 18, item 13 : ce message est donné par le robot plutôt
        // qu'en simple titre de page.
        robotMessage: "Choisir la boîte ou le dossier lié",
        // Le picker multi-choix travaille avec des ids de BOÎTE nus (pas
        // le préfixe "subject:") — voir renderMultiBoitePicker.
        initialSelection: Array.from(calendarEventLinkIds).map((linkId) => linkId.split(":")[1]),
        showNoneButton: true,
        onConfirm: (selection) => {
          calendarEventLinkIds = new Set(Array.from(selection).map((id) => `subject:${id}`));
          calendarEventSubjectBtn.textContent = calendarLinkIdsLabel(calendarEventLinkIds);
          closeBoitePickerView();
        },
        onNone: () => {
          calendarEventLinkIds = new Set();
          calendarEventSubjectBtn.textContent = calendarLinkIdsLabel(calendarEventLinkIds);
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
    // Round 27 : bug corrigé sur ordinateur — l'input transparent n'ouvre
    // son calendrier que si l'on clique pile sur sa petite icône (au bord
    // droit) ; ailleurs, le clic sélectionnait juste le jour/mois/année
    // (invisibles), donc "rien ne se passait". Avec une souris, on ouvre
    // maintenant explicitement le calendrier (showPicker) quel que soit
    // l'endroit cliqué. Le toucher (iPhone) n'est pas concerné : il
    // ouvrait déjà le sélecteur natif tout seul.
    const isMousePointer = () => !!(window.matchMedia && window.matchMedia("(pointer: fine)").matches);
    calendarEventDateInput.addEventListener("click", (e) => {
      if (!isMousePointer() || typeof calendarEventDateInput.showPicker !== "function") return;
      try {
        e.preventDefault();
        calendarEventDateInput.showPicker();
      } catch {
        /* navigateur qui refuse showPicker : comportement natif inchangé */
      }
    });
    calendarEventDateInput.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && typeof calendarEventDateInput.showPicker === "function") {
        try {
          e.preventDefault();
          calendarEventDateInput.showPicker();
        } catch {
          /* idem */
        }
      }
    });
    calendarEventDateInput.addEventListener("change", () => {
      const label = el("calendar-event-date-label");
      if (label && calendarEventDateInput.value) label.textContent = formatCalendarDate(calendarEventDateInput.value);
    });
  }

  // Item 2 : le panneau d'ajout reste caché tant qu'on n'a pas cliqué sur
  // "+ Ajouter un événement" — et sert aussi à MODIFIER un événement
  // existant (même formulaire, prérempli).
  /** Round 10, item 5 : `presetClassId` optionnel, utilisé quand le
   *  formulaire est ouvert depuis le bouton "Ajouter un évènement" de la
   *  page d'une classe (voir classDetailAddEventBtn plus bas) — pré-
   *  sélectionne cette classe dans "Partager avec une classe" sans que
   *  l'utilisateur n'ait à la rechoisir. */
  async function openCalendarEventForm(eventToEdit, presetClassId) {
    const form = el("calendar-event-form");
    if (!form) return;
    // Round 18, item 13 : le formulaire vit maintenant dans sa propre
    // page (#view-calendar-event-form) plutôt que dans un panneau déplié
    // sur la page Calendrier elle-même.
    boitePickerActivateView("view-calendar-event-form");
    // Comme toute autre page indépendante (Nouvelle fiche, Sélecteur de
    // boîte(s)...), l'en-tête de l'appli (bouton Accueil, logo) reste
    // visible.
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
    applyBodyLogoSpeech("calendar-event-form");
    const title = el("calendar-event-form-title");
    const submitBtn = el("calendar-event-submit");
    // Round 21, item 2 : champ "Commentaires" (libre, optionnel).
    const commentInput = el("calendar-event-comment");
    if (eventToEdit) {
      calendarEditingEventId = eventToEdit.id;
      el("calendar-event-title").value = eventToEdit.title;
      el("calendar-event-date").value = eventToEdit.date;
      el("calendar-event-date-label").textContent = formatCalendarDate(eventToEdit.date);
      calendarEventLinkIds = new Set(eventLinkIds(eventToEdit));
      el("calendar-event-subject-btn").textContent = calendarLinkIdsLabel(calendarEventLinkIds);
      if (commentInput) commentInput.value = eventToEdit.comment || "";
      if (title) title.textContent = "Modifier l'événement";
      if (submitBtn) submitBtn.textContent = "Enregistrer les modifications";
    } else {
      calendarEditingEventId = null;
      form.reset();
      el("calendar-event-date-label").textContent = "Choisir une date";
      calendarEventLinkIds = new Set();
      el("calendar-event-subject-btn").textContent = calendarLinkIdsLabel(calendarEventLinkIds);
      if (commentInput) commentInput.value = "";
      if (title) title.textContent = "Ajouter un événement";
      if (submitBtn) submitBtn.textContent = "Ajouter à mon calendrier";
    }
    await populateCalendarEventClassSelect(eventToEdit, presetClassId);
  }
  /** Round 3, item 4 (squelette) : remplit le sélecteur "Partager avec une
   *  classe" avec les classes dont l'utilisateur est prof — masqué s'il
   *  n'en a aucune (rien à partager) ou si Sync/Compte ne sont pas prêts. */
  async function populateCalendarEventClassSelect(eventToEdit, presetClassId) {
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
    select.value = eventToEdit && eventToEdit.classShare ? eventToEdit.classShare.classId : presetClassId || "";
  }
  /** Garde-fou supplémentaire (round 6, "attention qu'un élève ne puisse
   *  rien modifier de ce qui est partagé par un prof") : la corbeille
   *  n'est déjà PAS affichée pour un événement reçu NON PASSÉ (isReceived,
   *  voir buildCalendarEventRow) et le clic sur la ligne est déjà bloqué
   *  par blockIfSharedReadonlyEvent — mais on ajoute ici une deuxième
   *  barrière, directement à la source de la suppression elle-même, pour
   *  qu'un événement marqué `sharedEventId` reste structurellement
   *  impossible à MODIFIER par ce chemin, même si un futur appel oubliait
   *  la vérification côté interface.
   *  Round 21, item 3 : un évènement reçu peut en revanche être supprimé
   *  par l'élève UNE FOIS SA DATE PASSÉE (demande de Stéphane) — dans ce
   *  cas, on retire la copie locale et on mémorise son id distant pour
   *  qu'il ne soit plus jamais recréé par la resynchro (voir
   *  reconcileSharedEvent). Rien n'est supprimé côté prof : sa propre
   *  copie n'est pas touchée. */
  async function deleteOwnCalendarEvent(ev) {
    if (isSharedReadonlyEvent(ev)) {
      if (calendarDiffDays(ev.date) < 0 && ev.sharedEventId) {
        const dismissed = loadDismissedSharedEventIds();
        dismissed.add(ev.sharedEventId);
        saveDismissedSharedEventIds(dismissed);
        saveCalendarEvents(loadCalendarEvents().filter((x) => x.id !== ev.id));
      }
      return;
    }
    saveCalendarEvents(loadCalendarEvents().filter((x) => x.id !== ev.id));
    if (ev.classShare && Sync.isConfigured()) {
      try { await Sync.classes.deleteSharedEvent(ev.classShare.remoteId); } catch (e) { /* best-effort */ }
    }
  }
  // Round 44 : formulaire ouvert depuis la page d'une classe -> on y revient.
  let calendarFormReturnToClass = null;
  function closeCalendarEventForm() {
    calendarEditingEventId = null;
    if (calendarFormReturnToClass) {
      const ctx = calendarFormReturnToClass;
      calendarFormReturnToClass = null;
      openClassDetailView(ctx.klass, ctx.role);
      return;
    }
    // Round 18, item 13 : retour à la page Calendrier.
    boitePickerActivateView("view-calendar");
    applyBodyLogoSpeech("calendar");
  }

  /** Round 21, item 3 : page de présentation d'un évènement — tous ses
   *  éléments proprement mis en forme (titre, badge, compte à rebours,
   *  boîtes liées, commentaire), avec un bouton "Modifier" qui n'apparaît
   *  que si l'évènement est effectivement modifiable, et un bouton
   *  "Supprimer" repris des mêmes règles que la ligne de liste
   *  (buildCalendarEventRow) : un évènement reçu d'un prof ne peut être ni
   *  modifié ni supprimé, SAUF suppression une fois sa date passée. */
  /** Round 26, item 2 : origine d'un évènement reçu — classe + professeur
   *  ("Maths 4B · par Mme Durand"), classe seule si le nom n'est pas connu. */
  function sharedEventOriginLabel(ev) {
    const cls = ev.sharedClassName || "";
    const who = ev.sharedByName || "";
    return who ? `${cls}${cls ? " · " : ""}par ${who}` : cls;
  }
  let calendarDetailEvent = null;
  function openCalendarEventDetailView(ev) {
    calendarDetailEvent = ev;
    const isReceived = isSharedReadonlyEvent(ev);
    const isSharedByMe = !!ev.classShare;
    const isPast = calendarDiffDays(ev.date) < 0;

    const titleEl = el("calendar-detail-title");
    if (titleEl) titleEl.textContent = ev.title;
    const badgeEl = el("calendar-detail-badge");
    if (badgeEl) {
      if (isReceived) {
        badgeEl.hidden = false;
        badgeEl.className = "classes-shared-badge classes-shared-badge--received";
        badgeEl.innerHTML = `${iconSvgMarkup("lock", "icon-inline-svg")} ${escapeHtml(sharedEventOriginLabel(ev))}`;
      } else if (isSharedByMe) {
        badgeEl.hidden = false;
        badgeEl.className = "classes-shared-badge";
        badgeEl.textContent = `Partagé : ${ev.classShare.className || ""}`;
      } else {
        badgeEl.hidden = true;
      }
    }
    const dateEl = el("calendar-detail-date");
    if (dateEl) {
      dateEl.textContent = `${formatCalendarDate(ev.date)} — ${calendarCountdownLabel(ev.date)}`;
    }
    const boxesWrap = el("calendar-detail-boxes");
    const boxesList = el("calendar-detail-boxes-list");
    const boxNames = eventLinkedBoxNames(ev);
    if (boxesWrap && boxesList) {
      boxesWrap.hidden = boxNames.length === 0;
      boxesList.innerHTML = boxNames.map((n) => `<li>${escapeHtml(n)}</li>`).join("");
    }
    const commentWrap = el("calendar-detail-comment-wrap");
    const commentEl = el("calendar-detail-comment");
    if (commentWrap && commentEl) {
      commentWrap.hidden = !ev.comment;
      commentEl.textContent = ev.comment || "";
    }
    const editBtn = el("calendar-detail-edit-btn");
    if (editBtn) editBtn.hidden = isReceived;
    const deleteBtn = el("calendar-detail-delete-btn");
    const lockNote = el("calendar-detail-lock-note");
    if (deleteBtn) deleteBtn.hidden = isReceived && !isPast;
    if (lockNote) lockNote.hidden = !(isReceived && !isPast);

    boitePickerActivateView("view-calendar-event-detail");
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
  }
  function closeCalendarEventDetailView() {
    boitePickerActivateView("view-calendar");
    applyBodyLogoSpeech("calendar");
    calendarDetailEvent = null;
  }
  const calendarDetailBackBtn = el("calendar-detail-back-btn");
  if (calendarDetailBackBtn) calendarDetailBackBtn.addEventListener("click", closeCalendarEventDetailView);
  const calendarDetailEditBtn = el("calendar-detail-edit-btn");
  if (calendarDetailEditBtn) {
    calendarDetailEditBtn.addEventListener("click", async () => {
      if (!calendarDetailEvent) return;
      if (await blockIfSharedReadonlyEvent(calendarDetailEvent)) return;
      openCalendarEventForm(calendarDetailEvent);
    });
  }
  const calendarDetailDeleteBtn = el("calendar-detail-delete-btn");
  if (calendarDetailDeleteBtn) {
    calendarDetailDeleteBtn.addEventListener("click", async () => {
      if (!calendarDetailEvent) return;
      const ev = calendarDetailEvent;
      if (await robotConfirm(`Supprimer l'événement « ${ev.title} » ?`, { danger: true })) {
        await deleteOwnCalendarEvent(ev);
        closeCalendarEventDetailView();
        renderCalendarEvents();
      }
    });
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
      // Round 21, item 2 : champ "Commentaires", libre et optionnel.
      const commentInput = el("calendar-event-comment");
      const commentVal = commentInput ? commentInput.value.trim() : "";
      const events = loadCalendarEvents();
      const classSelect = el("calendar-event-class-select");
      const selectedClassId = classSelect && !el("calendar-event-class-field").hidden ? classSelect.value : "";

      let ev;
      let idx = -1;
      // Round 18, item 13 : plusieurs liens possibles désormais — stockés
      // sous `linkIds` (tableau), l'ancien champ `linkId` (un seul) est
      // supprimé pour ne pas laisser une valeur périmée traîner à côté.
      const linkIdsArr = Array.from(calendarEventLinkIds);
      if (calendarEditingEventId) {
        idx = events.findIndex((x) => x.id === calendarEditingEventId);
        ev = idx >= 0 ? { ...events[idx], title: titleVal, date: dateVal, linkIds: linkIdsArr, comment: commentVal } : null;
        if (ev) delete ev.linkId;
      } else {
        ev = { id: uid(), title: titleVal, date: dateVal, linkIds: linkIdsArr, comment: commentVal };
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
        // Round 44 : les boîtes liées partent avec l'évènement (ids de leurs
        // partages avec cette classe — une boîte pas encore partagée l'est
        // automatiquement).
        const klassForBoxes = (await Sync.classes.listAsTeacher()).find((k) => k.id === selectedClassId);
        const boxIds = await ensureEventBoxesSharedWithClass(ev, selectedClassId, klassForBoxes ? klassForBoxes.name : "");
        if (ev.classShare && ev.classShare.classId === selectedClassId) {
          const res = await Sync.classes.updateSharedEvent(ev.classShare.remoteId, titleVal, dateVal, boxIds);
          if (res && !res.error) ev.classShare = { ...ev.classShare, boxIds: res.boxIdsMissing ? null : boxIds };
          if (res && res.boxIdsMissing) warnSharedEventBoxesMigration();
        } else {
          const klass = klassForBoxes;
          const { data, error, boxIdsMissing } = await Sync.classes.shareEvent(selectedClassId, titleVal, dateVal, boxIds);
          if (boxIdsMissing) warnSharedEventBoxesMigration();
          if (!error && data) {
            ev.classShare = { classId: selectedClassId, className: klass ? klass.name : "", remoteId: data.id, boxIds: boxIdsMissing ? null : boxIds };
            // Round 10, item 10 : message automatique dans la messagerie de
            // la classe quand un prof y ajoute un évènement.
            try {
              await Sync.messages.send(selectedClassId, `📅 Nouvel évènement : « ${titleVal} » le ${formatCalendarDate(dateVal)}.`);
            } catch (e) { /* best-effort, ne doit jamais bloquer la création de l'évènement */ }
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
  /** Round 21, item 1 (refonte) : plus de liseré de couleur sur le côté —
   *  la distinction personnel/partagé/reçu ne repose plus que sur le badge
   *  texte. La date est remplacée par un compte à rebours affiché à
   *  droite, et la liste des boîtes/dossiers liés ("Fiches à réviser :")
   *  s'affiche désormais en clair sous le titre, une par ligne, plutôt
   *  qu'en un libellé condensé dans le "meta".
   *  Round 21, item 3 : cliquer sur la ligne ouvre maintenant une page de
   *  PRÉSENTATION de l'évènement (voir openCalendarEventDetailView), pas
   *  directement le formulaire de modification — le bouton "Modifier" de
   *  cette page fait ensuite ce que faisait ce clic auparavant. La
   *  suppression reste possible directement depuis la ligne (corbeille),
   *  désormais aussi pour un évènement REÇU une fois sa date passée. */
  function buildCalendarEventRow(ev, { onOpen, onDelete }) {
    const li = document.createElement("li");
    const isReceived = isSharedReadonlyEvent(ev);
    const isSharedByMe = !!ev.classShare;
    const isPast = calendarDiffDays(ev.date) < 0;
    li.className = "card-row calendar-event-row" + (isReceived ? " calendar-event-row--received" : "");
    // Round 22, item 5 : la poubelle (ou le cadenas) passe en bas à
    // droite du bloc plutôt qu'en haut à droite, à côté du titre — la
    // ligne bascule donc en colonne (contenu en haut, actions dessous,
    // alignées à droite) plutôt qu'en rangée.
    li.style.cssText = "flex-direction:column; align-items:stretch; cursor:pointer;";
    li.title = "Voir le détail de cet évènement";
    li.addEventListener("click", () => onOpen());
    const main = document.createElement("div");
    main.className = "card-row-main calendar-event-main";
    const sharedBadge = isReceived
      ? ` <span class="classes-shared-badge classes-shared-badge--received">${iconSvgMarkup("lock", "icon-inline-svg")} ${escapeHtml(sharedEventOriginLabel(ev))}</span>`
      : isSharedByMe
      ? ` <span class="classes-shared-badge">Partagé : ${escapeHtml(ev.classShare.className)}</span>`
      : "";
    const boxNames = eventLinkedBoxNames(ev);
    const boxesHtml =
      boxNames.length > 0
        ? `<div class="calendar-event-boxes"><p class="calendar-event-boxes-label">Fiches à réviser :</p><ul class="calendar-event-boxes-list">${boxNames
            .map((n) => `<li>${escapeHtml(n)}</li>`)
            .join("")}</ul></div>`
        : "";
    // Alerte : évènement à venir sans boîte associée (rien à réviser pour
    // s'y préparer — il n'apparaît pas non plus dans le Programme).
    const noBoxWarningHtml =
      !isPast && calendarEventHasNoBox(ev)
        ? `<p class="calendar-event-warning">${iconSvgMarkup("alertTriangle", "icon-inline-svg")}<span>Aucune boîte associée : ajoute les fiches à réviser pour cet évènement.</span></p>`
        : "";
    main.innerHTML = `
      <div class="calendar-event-top-row">
        <strong>${escapeHtml(ev.title)}</strong>
        <span class="calendar-event-countdown${isPast ? " calendar-event-countdown--past" : ""}">${calendarCountdownLabel(ev.date)}</span>
      </div>
      ${sharedBadge ? `<div class="calendar-event-origin">${sharedBadge}</div>` : ""}
      ${boxesHtml}
      ${noBoxWarningHtml}
    `;
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex; gap:4px; flex-shrink:0; justify-content:flex-end; margin-top:6px;";
    if (isReceived && !isPast) {
      // Toujours en lecture seule tant que la date n'est pas passée (voir
      // deleteOwnCalendarEvent) : simple cadenas, sans action au clic.
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
          onOpen: () => openCalendarEventDetailView(ev),
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
          onOpen: () => {
            popup.hidden = true;
            openCalendarEventDetailView(ev);
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
    const upcoming = loadCalendarEvents().filter((ev) => eventLinkIds(ev).length > 0 && ev.date >= todayStr);
    // Un seul point de programme par boîte/dossier : celui dont
    // l'échéance est la plus proche fait foi. Round 18, item 13 : un
    // événement peut maintenant porter PLUSIEURS liens — chacun devient
    // son propre point de programme (comme si c'était autant d'événements
    // distincts, un par boîte/dossier concerné).
    const byLink = {};
    upcoming.forEach((ev) => {
      eventLinkIds(ev).forEach((linkId) => {
        if (!byLink[linkId] || ev.date < byLink[linkId].ev.date) byLink[linkId] = { ev, linkId };
      });
    });
    const items = Object.values(byLink).map(({ ev, linkId }) => {
      const [type, id] = linkId.split(":");
      const isFolder = type === "folder";
      const pool = isFolder ? folderCardsPool(id) : subjectCardsPool(id);
      const daysLeft = Math.round((new Date(ev.date + "T00:00:00") - new Date(todayStr + "T00:00:00")) / 86400000);
      // Nouvel algorithme : plus de score 0-100 — le "score" utilisé pour
      // le tri à égalité de date devient la proportion (%) de fiches déjà
      // en persistance moyen/long/très long terme (donc pas "court terme").
      const list = pool || [];
      // Round 42 : part des fiches dont la dernière note est 2 ou 3.
      const wellPersisted = list.filter((c) => cardLastRating(c) >= 2).length;
      const score = list.length > 0 ? Math.round((wellPersisted / list.length) * 100) : 0;
      return {
        linkId,
        type,
        id,
        label: calendarLinkLabel(linkId),
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

  // Round 13, item 3-2 : mène à la page Fiches, filtrée sur le
  // dossier/la boîte cliqué·e depuis Mon bureau — mirroring de
  // goToReviewFor ci-dessus, mais vers "cards" plutôt que "review".
  // cardsScopeFilter accepte déjà un id de boîte littéral ou une chaîne
  // "folder:<id>" (cardsScopeCards, plus bas) : rien à changer côté
  // filtrage, juste le déclenchement.
  function goToCardsFor(linkId) {
    if (!linkId) return;
    const [type, id] = linkId.split(":");
    cardsScopeFilter = type === "folder" ? `folder:${id}` : id;
    renderManageList();
    const tab = document.querySelector('.tab[data-view="cards"]');
    if (tab) tab.click();
  }

  /* ---------------------------------------------------------
     Programme de révision : UN bloc par évènement à venir (le plus proche
     d'abord), avec les boîtes/dossiers liés présentés en arborescence
     (comme l'explorateur de Fiches) et des cases à cocher pour choisir ce
     qu'on révise. Tout est coché par défaut ; un dossier coche/décoche
     tout ce qu'il contient. "Réviser" lance une session sur la sélection.
  --------------------------------------------------------- */
  // Boîtes décochées par évènement (mémorisées le temps de la session de
  // l'appli, pour retrouver ses choix en revenant sur la page).
  const revisionProgramUnchecked = new Map();

  function upcomingEventsWithBoxes() {
    return loadCalendarEvents()
      .filter((ev) => ev && ev.date && calendarDiffDays(ev.date) >= 0 && !calendarEventHasNoBox(ev))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Arbre d'un lien d'évènement : { kind: "box", id, name } ou
   *  { kind: "folder", id, name, children: [...] } — un dossier devenu
   *  boîte (même id qu'une boîte, voir isFolderABoite) est une boîte. */
  function revisionTreeForFolder(folderId) {
    const f = folders.find((x) => x.id === folderId);
    const children = [];
    folders
      .filter((x) => x.parentId === folderId && !x.deleted)
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      .forEach((sub) => {
        if (isFolderABoite(sub.id)) children.push({ kind: "box", id: sub.id, name: sub.name });
        else {
          const node = revisionTreeForFolder(sub.id);
          if (node.children.length > 0) children.push(node);
        }
      });
    subjects
      .filter((x) => x.folderId === folderId && !x.deleted && isSubjectInRevisions(x) && !folders.some((ff) => ff.id === x.id))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      .forEach((x) => children.push({ kind: "box", id: x.id, name: x.name }));
    return { kind: "folder", id: folderId, name: f ? f.name : "Dossier", children };
  }
  function revisionTreeForEvent(ev) {
    const roots = [];
    eventLinkIds(ev).forEach((linkId) => {
      if (!calendarLinkExists(linkId)) return;
      const [type, id] = linkId.split(":");
      if (type === "subject") {
        const subj = subjects.find((x) => x.id === id);
        if (subj && !isSubjectInRevisions(subj)) return;
        roots.push({ kind: "box", id, name: subj ? subj.name : subjectName(id) });
      } else if (type === "folder") {
        // Round 30 : un dossier-boîte retiré de mes révisions n'a plus de
        // dossier (la boîte seule subsiste) — le lien vise alors la boîte.
        const selfBox = subjects.find((x) => x.id === id);
        if (!folders.some((x) => x.id === id) && selfBox) {
          if (isSubjectInRevisions(selfBox)) roots.push({ kind: "box", id, name: selfBox.name });
          return;
        }
        if (isFolderABoite(id)) {
          const f = folders.find((x) => x.id === id);
          roots.push({ kind: "box", id, name: f ? f.name : subjectName(id) });
        } else {
          roots.push(revisionTreeForFolder(id));
        }
      }
    });
    return roots;
  }
  function revisionTreeBoxIds(nodes, out) {
    out = out || [];
    nodes.forEach((n) => {
      if (n.kind === "box") {
        if (!out.includes(n.id)) out.push(n.id);
      } else revisionTreeBoxIds(n.children, out);
    });
    return out;
  }

  function renderRevisionProgramList() {
    const list = el("revision-program-list");
    const empty = el("revision-program-empty");
    if (!list) return;
    const events = upcomingEventsWithBoxes();
    list.innerHTML = "";
    if (empty) empty.hidden = events.length > 0;
    events.forEach((ev) => list.appendChild(buildRevisionEventBlock(ev)));
    renderReinforceList();
  }

  /* Round 42 : 2e partie des révisions conseillées, « Renforcer mes
     connaissances » — les boîtes de mes révisions qui ne sont pas déjà
     dans la 1re partie, triées par retard relatif moyen de leurs fiches :
     (maintenant − date prévue) / max(DD ; 1 jour), positif en retard,
     négatif en avance. */
  const REINFORCE_PAGE_SIZE = 10;
  let reinforceShown = REINFORCE_PAGE_SIZE;
  function computeReinforceItems() {
    const inEvents = new Set();
    upcomingEventsWithBoxes().forEach((ev) => revisionTreeBoxIds(revisionTreeForEvent(ev)).forEach((id) => inEvents.add(id)));
    const now = Date.now();
    const bySubject = new Map();
    revisionCards().forEach((c) => {
      if (inEvents.has(c.subject)) return;
      let arr = bySubject.get(c.subject);
      if (!arr) bySubject.set(c.subject, (arr = []));
      arr.push(c);
    });
    const items = [];
    bySubject.forEach((pool, id) => {
      const subj = subjects.find((x) => x.id === id);
      if (!subj || subj.deleted) return;
      let sum = 0;
      let due = 0;
      pool.forEach((c) => {
        const dd = Math.max(typeof c.dd === "number" && c.dd > 0 ? c.dd : 0, 1440);
        const late = (now - cardDueTime(c)) / 60000;
        sum += late / dd;
        if (cardDueTime(c) <= now) due += 1;
      });
      items.push({ id, name: subj.name, pool, due, lateness: sum / pool.length });
    });
    items.sort((a, b) => b.lateness - a.lateness || a.name.localeCompare(b.name, "fr"));
    return items;
  }
  function renderReinforceList() {
    const list = el("revision-reinforce-list");
    const empty = el("revision-reinforce-empty");
    const more = el("revision-reinforce-more");
    if (!list) return;
    const items = computeReinforceItems();
    list.innerHTML = "";
    if (empty) empty.hidden = items.length > 0;
    items.slice(0, reinforceShown).forEach((it) => {
      const li = document.createElement("li");
      li.className = "revision-event-block revision-reinforce-block";
      li.dataset.subjectId = it.id;
      const n = it.pool.length;
      li.innerHTML = `
        <div class="revision-event-head">
          <span class="revision-event-title">${escapeHtml(it.name)}</span>
          <span class="revision-event-when${it.due > 0 ? " is-soon" : ""}">${
            it.due > 0 ? `${it.due} fiche${it.due > 1 ? "s" : ""} à revoir` : "À jour"
          }</span>
        </div>
        <div class="revision-event-date">${n} fiche${n > 1 ? "s" : ""}</div>
        <div class="revision-event-gauge">${buildPersGaugeSvg(it.pool, { width: 260, barHeight: 10 })}</div>
        <button type="button" class="btn btn--primary revision-event-go">Réviser cette boîte</button>
      `;
      li.querySelector(".revision-event-go").addEventListener("click", () => {
        reviewEntryFromManage = false;
        reviewEntryFromProgram = true;
        switchSubject(it.id);
        const tab = document.querySelector('.tab[data-view="review"]');
        if (tab) tab.click();
      });
      list.appendChild(li);
    });
    if (more) {
      more.hidden = items.length <= reinforceShown;
      more.textContent = `Voir plus de boîtes (${items.length - Math.min(reinforceShown, items.length)} autres)`;
    }
  }
  const reinforceMoreBtn = el("revision-reinforce-more");
  if (reinforceMoreBtn) {
    reinforceMoreBtn.addEventListener("click", () => {
      reinforceShown += REINFORCE_PAGE_SIZE;
      renderReinforceList();
    });
  }

  function buildRevisionEventBlock(ev) {
    const tree = revisionTreeForEvent(ev);
    const allIds = revisionTreeBoxIds(tree);
    if (!revisionProgramUnchecked.has(ev.id)) revisionProgramUnchecked.set(ev.id, new Set());
    const unchecked = revisionProgramUnchecked.get(ev.id);
    const isChecked = (id) => !unchecked.has(id);

    const li = document.createElement("li");
    li.className = "revision-event-block";
    const diff = calendarDiffDays(ev.date);
    li.innerHTML = `
      <div class="revision-event-head">
        <span class="revision-event-title">${escapeHtml(ev.title || "Évènement")}</span>
        <span class="revision-event-when${diff <= 3 ? " is-soon" : ""}">${calendarCountdownLabel(ev.date)}</span>
      </div>
      <div class="revision-event-date">${formatCalendarDate(ev.date)}</div>
      <div class="revision-event-tree"></div>
      <div class="revision-event-gauge"></div>
      <button type="button" class="btn btn--primary revision-event-go"></button>
    `;
    const treeEl = li.querySelector(".revision-event-tree");
    const gaugeEl = li.querySelector(".revision-event-gauge");
    const goBtn = li.querySelector(".revision-event-go");

    function selectedIds() {
      return allIds.filter(isChecked);
    }
    function nodeState(node) {
      const ids = node.kind === "box" ? [node.id] : revisionTreeBoxIds(node.children);
      const n = ids.filter(isChecked).length;
      return n === 0 ? "none" : n === ids.length ? "all" : "some";
    }
    function refresh() {
      treeEl.querySelectorAll("input[type=checkbox]").forEach((cb) => {
        const node = cb._node;
        const st = nodeState(node);
        cb.checked = st === "all";
        cb.indeterminate = st === "some";
      });
      const ids = selectedIds();
      const pool = cards.filter((c) => !c.deleted && ids.includes(c.subject));
      gaugeEl.innerHTML = pool.length > 0 ? buildPersGaugeSvg(pool, { width: 260, barHeight: 10 }) : "";
      goBtn.disabled = pool.length === 0;
      goBtn.textContent =
        ids.length === 0
          ? "Coche au moins une boîte"
          : pool.length === 0
          ? "Aucune fiche dans la sélection"
          : `Réviser la sélection (${pool.length} fiche${pool.length > 1 ? "s" : ""})`;
    }
    function toggleNode(node, checked) {
      const ids = node.kind === "box" ? [node.id] : revisionTreeBoxIds(node.children);
      ids.forEach((id) => (checked ? unchecked.delete(id) : unchecked.add(id)));
      refresh();
    }
    function renderNodes(nodes, depth) {
      nodes.forEach((node) => {
        const row = document.createElement("label");
        row.className = "revision-tree-row" + (node.kind === "folder" ? " revision-tree-row--folder" : "");
        row.style.setProperty("--depth", depth);
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb._node = node;
        cb.addEventListener("change", () => toggleNode(node, cb.checked));
        row.appendChild(cb);
        const icon = node.kind === "folder" ? iconSvgMarkup("folder", "icon-inline-svg") : orgIconMarkup("orgBoite");
        const n = node.kind === "box" ? cards.filter((c) => !c.deleted && c.subject === node.id).length : null;
        row.insertAdjacentHTML(
          "beforeend",
          `<span class="revision-tree-icon">${icon}</span><span class="revision-tree-name">${escapeHtml(node.name)}</span>${
            n !== null ? `<span class="revision-tree-count">${n} fiche${n > 1 ? "s" : ""}</span>` : ""
          }`
        );
        treeEl.appendChild(row);
        if (node.kind === "folder") renderNodes(node.children, depth + 1);
      });
    }
    renderNodes(tree, 0);
    goBtn.addEventListener("click", () => {
      const ids = selectedIds();
      if (ids.length === 0) return;
      reviewEntryFromManage = false;
      reviewEntryFromProgram = true;
      if (ids.length === 1) {
        switchSubject(ids[0]);
      } else {
        saveMultiSelection(ids);
        saveMultiSelectionLabel(ev.title || "Sélection");
        switchSubject(MULTI_SUBJECTS_ID, true);
      }
      const tab = document.querySelector('.tab[data-view="review"]');
      if (tab) tab.click();
    });
    refresh();
    return li;
  }

  /** Round 25, item 2 : palier Réviser. "Révisions conseillées" n'est
   *  utilisable que s'il existe au moins un évènement à venir AVEC des
   *  boîtes associées (sinon le programme serait vide) — désactivé sinon,
   *  avec la raison sous le libellé, répétée par le robot au clic. */
  function reviewHubAdvisedBlockReason() {
    // Round 42 : la page a aussi « Renforcer mes connaissances », utile même
    // sans échéance — bloquée seulement s'il n'y a aucune fiche à réviser.
    if (revisionCards().length === 0) return "Tu n'as encore aucune fiche dans tes révisions.";
    return "";
  }
  function renderReviewHub() {
    const btn = el("review-hub-advised-btn");
    const note = el("review-hub-advised-note");
    if (!btn) return;
    const reason = reviewHubAdvisedBlockReason();
    btn.classList.toggle("is-disabled", !!reason);
    btn.setAttribute("aria-disabled", reason ? "true" : "false");
    const btn2 = el("review-hub-advised2-btn");
    if (btn2) {
      btn2.classList.toggle("is-disabled", !!reason);
      btn2.setAttribute("aria-disabled", reason ? "true" : "false");
    }
    if (note) {
      note.hidden = !reason;
      note.textContent = reason;
    }
  }
  const reviewHubAdvisedBtn = el("review-hub-advised-btn");
  if (reviewHubAdvisedBtn) {
    reviewHubAdvisedBtn.addEventListener("click", async () => {
      const reason = reviewHubAdvisedBlockReason();
      if (reason) {
        renderReviewHub();
        await robotAlert(`${reason} Ajoute des boîtes à tes révisions pour que je te propose un programme.`);
        return;
      }
      const tab = document.querySelector('.tab[data-view="revision-program"]');
      if (tab) tab.click();
    });
  }
  const reviewHubManualBtn = el("review-hub-manual-btn");
  if (reviewHubManualBtn) {
    // Équivalent de l'ancien bouton "Sélection manuelle" du Programme :
    // ouvre le sélecteur de boîtes/dossiers, puis Réviser une fois validé
    // (voir multiPickerNavigateToReviewOnConfirm).
    reviewHubManualBtn.addEventListener("click", () => {
      reviewEntryFromManage = false;
      reviewEntryFromProgram = false;
      multiPickerNavigateToReviewOnConfirm = true;
      openMultiSubjectPicker();
    });
  }

  function renderSyncView() {
    const configured = Sync.isConfigured();
    syncUnconfiguredEl.hidden = configured;
    syncConfiguredEl.hidden = !configured;

    if (configured) {
      if (currentSyncAccountEl) {
        currentSyncAccountEl.textContent = accountCurrentUser ? accountCurrentUser.email || "" : "Aucun compte connecté";
      }
      // Le serveur intégré à l'appli (js/config.js) ne se change pas ici.
      if (disconnectBtn) disconnectBtn.hidden = !!Sync.getConfig().builtIn;
      if (Sync.accountMigrationMissing()) {
        syncErrorNoteEl.hidden = false;
        syncErrorNoteEl.textContent = "La base Supabase n'est pas à jour pour les comptes : exécute supabase/account_scoping_migration.sql.";
        return;
      }
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

  syncForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    Sync.saveConfig({
      url: syncUrlInput.value,
      key: syncKeyInput.value,
    });
    // Round 29 : serveur renseigné -> on passe à la connexion au compte
    // (rechargement : le client Supabase et l'espace local repartent
    // proprement).
    window.location.reload();
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
    if (!(await robotConfirm("Changer de serveur ? Tu seras déconnecté de ton compte sur cet appareil."))) {
      return;
    }
    try {
      await Sync.auth.signOut();
    } catch (e) {
      /* déjà déconnecté */
    }
    if (unsubscribeRealtime) unsubscribeRealtime();
    if (unsubscribeSubjectsRealtime) unsubscribeSubjectsRealtime();
    if (unsubscribeFoldersRealtime) unsubscribeFoldersRealtime();
    if (unsubscribeDevSettingsRealtime) unsubscribeDevSettingsRealtime();
    Sync.clearConfig();
    syncForm.reset();
    renderSyncView();
    updateSyncStatus();
    // Round 22, item 4 : la Synchronisation étant le prérequis technique
    // d'un Compte (même projet Supabase), la déconnecter revient aussi à
    // perdre la connexion au Compte — reverrouille donc l'appli plutôt que
    // de laisser croire qu'elle reste utilisable.
    accountCurrentUser = null;
    updateAccountHomeButton();
    enforceLoginGate();
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
  // Round 22, item 4 : connexion obligatoire — décision explicite de
  // Stéphane ("le but c'est que l'appli soit utilisée par des milliers
  // d'utilisateurs, il faut donc que chacun ait ses propres évènements et
  // aussi dossiers et boites"). `appLoginLocked` reflète si l'appli est
  // actuellement verrouillée (aucun Compte connecté) — lu par goHome() et
  // les clics de navigation pour refuser d'en sortir tant que ce n'est pas
  // résolu.
  let appLoginLocked = false;

  /** Verrouille (ou déverrouille) l'appli selon l'état de connexion :
   *  masque toute la navigation (cercles d'accueil sauf "Compte", bouton
   *  Accueil) et force la page Synchronisation (si même ça manque encore)
   *  ou Compte (connexion/inscription) tant qu'aucun Compte Supabase Auth
   *  n'est connecté. C'est ce même mécanisme, appliqué de façon générale à
   *  TOUTE la navigation plutôt qu'à un seul chemin, qui corrige le bug
   *  d'origine signalé par Stéphane ("j'avais tous mes évènements alors
   *  que je n'étais pas connecté") : sans Compte connecté, il n'y a tout
   *  simplement plus d'usage possible de l'appli, donc plus moyen de voir
   *  les évènements (ou fiches/dossiers/boîtes) de quelqu'un d'autre resté
   *  ouvert sur le même appareil. Appelée au démarrage, après
   *  connexion/inscription/déconnexion (Compte ou Sync), et par
   *  Sync.auth.onChange en défense supplémentaire. */
  function enforceLoginGate() {
    const shouldLock = !accountCurrentUser;
    const wasLocked = appLoginLocked;
    appLoginLocked = shouldLock;
    document.body.classList.toggle("is-login-locked", shouldLock);
    if (el("nav-back-btn") && shouldLock) el("nav-back-btn").hidden = true;
    // Round 22, item 4 : à la levée du verrou (connexion/inscription tout
    // juste réussie), la page Compte forcée jusqu'ici n'a plus de bouton
    // Accueil pour en sortir (masqué pendant le verrou) — on ramène donc
    // directement à l'accueil plutôt que de laisser la personne bloquée
    // là où le verrou l'avait placée.
    if (wasLocked && !shouldLock) {
      goHome();
      return;
    }
    // Un Compte a besoin de la Synchronisation configurée d'abord (même
    // projet Supabase, voir account-needs-sync) — on force donc cette page
    // en premier si ce n'est pas encore fait, sinon la page Compte.
    const targetView = Sync.isConfigured() ? "account" : "sync";
    const accountBanner = el("account-login-gate-banner");
    if (accountBanner) accountBanner.hidden = !shouldLock || targetView !== "account";
    const syncBanner = el("sync-login-gate-banner");
    if (syncBanner) syncBanner.hidden = !shouldLock || targetView !== "sync";
    if (!shouldLock) return;
    document.querySelectorAll(".tab").forEach((t) => {
      const isTarget = t.dataset.view === targetView;
      t.classList.toggle("is-active", isTarget);
      t.setAttribute("aria-selected", String(isTarget));
    });
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    const target = el(`view-${targetView}`);
    if (target) target.classList.add("is-active");
    if (homeBtn) homeBtn.hidden = true;
    if (el("body-logo-row")) el("body-logo-row").hidden = true;
    if (targetView === "account") renderAccountView();
    else renderSyncView();
  }

  /** Reflète l'état de connexion sur le bouton d'accueil (item 1/2) : son
   *  libellé change tout seul, avant même d'avoir ouvert la page Compte. */
  /* ---------------- Round 25, item 3 : usages ----------------
     `user_metadata.usages` ⊂ ["eleve", "enseignant", "perso"], au moins un
     une fois choisis. null = pas de Compte connu (on ne change rien). */
  const USAGE_KEYS = ["eleve", "enseignant", "perso"];
  function currentUsages() {
    if (!accountCurrentUser) return null;
    const u = (accountCurrentUser.user_metadata || {}).usages;
    return Array.isArray(u) ? u.filter((k) => USAGE_KEYS.includes(k)) : [];
  }
  /** Ni élève ni enseignant (y compris aucun usage choisi) : le bouton
   *  d'accueil École devient Calendrier. */
  function homeCalendarModeActive() {
    const u = currentUsages();
    return !!u && !u.includes("eleve") && !u.includes("enseignant");
  }
  /** Élève OU (exclusif) enseignant : Classes mène directement à la page
   *  correspondante. */
  function classesShortcutRole() {
    const u = currentUsages();
    if (!u) return null;
    const eleve = u.includes("eleve");
    const prof = u.includes("enseignant");
    if (eleve && !prof) return "student";
    if (prof && !eleve) return "teacher";
    return null;
  }
  let homeSchoolCircleOriginal = null;
  function applyUsageEffects() {
    const circle = document.querySelector('.home-circle[data-key="classes"]');
    if (circle) {
      if (!homeSchoolCircleOriginal) {
        homeSchoolCircleOriginal = { html: circle.innerHTML, go: circle.dataset.go };
      }
      const calendarMode = homeCalendarModeActive();
      if (calendarMode && circle.dataset.go !== "calendar") {
        const iconId = (loadDevSettings().navIcons || {}).calendar || DEFAULT_NAV_ICONS.calendar;
        circle.innerHTML = `${iconSvgMarkup(ICON_LIBRARY[iconId] ? iconId : "calendar", "home-circle-icon")}<span>Calendrier</span><span class="home-circle-badge home-circle-badge--neutral" id="home-calendar-badge" hidden>0</span>`;
        circle.dataset.go = "calendar";
      } else if (!calendarMode && circle.dataset.go === "calendar") {
        circle.innerHTML = homeSchoolCircleOriginal.html;
        circle.dataset.go = homeSchoolCircleOriginal.go;
      }
      const calBadge = el("home-calendar-badge");
      if (calBadge) {
        const n = loadCalendarEvents().filter((ev) => ev && ev.date && calendarDiffDays(ev.date) >= 0).length;
        calBadge.hidden = n <= 0;
        calBadge.textContent = n > 99 ? "99+" : String(n);
      }
    }
    refreshHomeEventWarning();
  }
  function renderAccountUsages() {
    const wrap = el("account-usages");
    if (!wrap) return;
    const u = currentUsages() || [];
    wrap.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = u.includes(cb.value);
    });
    const note = el("account-usages-note");
    if (note) {
      note.hidden = u.length > 0;
      note.textContent = u.length > 0 ? "" : "Choisis au moins un usage.";
    }
  }
  const accountUsagesWrap = el("account-usages");
  if (accountUsagesWrap) {
    accountUsagesWrap.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", async () => {
        const checked = [...accountUsagesWrap.querySelectorAll('input[type="checkbox"]')].filter((x) => x.checked).map((x) => x.value);
        if (checked.length === 0) {
          cb.checked = true;
          await robotAlert("Garde au moins un usage : élève, enseignant ou usage personnel.");
          return;
        }
        const note = el("account-usages-note");
        const res = await Sync.auth.updateMetadata({ usages: checked });
        if (res && res.error) {
          if (note) {
            note.hidden = false;
            note.textContent = `Échec de l'enregistrement : ${res.error}`;
          }
          return;
        }
        accountCurrentUser = (await Sync.auth.getUser()) || accountCurrentUser;
        if (note) {
          note.hidden = false;
          note.textContent = "Enregistré.";
        }
        applyUsageEffects();
      });
    });
  }

  function updateAccountHomeButton() {
    const label = document.querySelector('.home-circle[data-key="account"] span');
    if (label) label.textContent = accountCurrentUser ? "Mon compte" : "Se connecter";
    const emailEl = el("account-user-email");
    if (emailEl) emailEl.textContent = (accountCurrentUser && accountCurrentUser.email) || "";
    // Round 18, item 10 : ligne "Connecté en tant que [email]" (page
    // Classes) retirée, y compris sa mise à jour ici.
    // Round 6, item 5 : la pastille de notifications de la Messagerie doit
    // rester à jour dès que l'état de connexion change (connexion,
    // déconnexion, changement de Compte), pas seulement à l'ouverture de
    // la page — c'est cette même fonction qui est appelée à chacun de ces
    // moments (voir initAccountState / Sync.auth.onChange).
    refreshMessagesBadge();
    // Round 25, item 3 : même moments -> bouton École/Calendrier + bandeau.
    applyUsageEffects();
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
    // Round 26, item 2 : complète le nom du prof sur ses anciens partages.
    if (accountCurrentUser && Sync.classes.backfillSharedEventsTeacherName) {
      Sync.classes.backfillSharedEventsTeacherName().catch(() => {});
    }
    Sync.auth.onChange((user) => {
      // Round 29 : chaque compte a son propre espace de données sur
      // l'appareil (voir js/user-scope.js) — changer de compte (connexion,
      // déconnexion, autre compte) recharge l'appli sur le bon espace.
      const newUid = user ? user.id : null;
      const bootUid = (window.UserScope && window.UserScope.uid) || null;
      if (newUid !== bootUid) {
        setTimeout(() => window.location.reload(), 150);
        return;
      }
      accountCurrentUser = user;
      updateAccountHomeButton();
      // Les évènements du calendrier sont propres à chaque Compte.
      refreshHomeEventWarning();
      if (el("view-account") && el("view-account").classList.contains("is-active")) renderAccountView();
      if (el("view-classes") && el("view-classes").classList.contains("is-active")) renderClassesView();
      if (el("view-classes-student") && el("view-classes-student").classList.contains("is-active")) renderStudentClasses();
      if (el("view-classes-teacher") && el("view-classes-teacher").classList.contains("is-active")) renderTeacherClasses();
      if (el("view-messages") && el("view-messages").classList.contains("is-active")) renderMessagesView();
      if (user) syncSharedBoxesForStudent();
      // Round 16 : les réglages développeur ne sont plus cloisonnés par
      // Compte (un seul canal partagé pour tout le monde, voir
      // syncDevSettingsFromServer) — un changement de Compte connecté
      // n'a donc plus besoin de recharger ni de se réabonner à quoi que
      // ce soit ici.
      // Round 22, item 4 : filet de sécurité — reflète tout changement de
      // Compte (déconnexion externe, session expirée...) sur le verrou de
      // connexion obligatoire, même si ce changement n'est pas passé par
      // les boutons Se connecter/Créer un compte/Se déconnecter ci-dessous
      // (qui l'appellent déjà directement).
      enforceLoginGate();
    });
  }

  let accountSchoolCascade = null;
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
    // Round 10, item 7 : préremplit nom/prénom depuis les métadonnées du
    // compte (déjà connues si renseignées à l'inscription, ou lors d'un
    // enregistrement précédent depuis cette page).
    const meta = accountCurrentUser.user_metadata || {};
    const firstEl = el("account-profile-firstname");
    const lastEl = el("account-profile-lastname");
    if (firstEl) firstEl.value = meta.first_name || "";
    if (lastEl) lastEl.value = meta.last_name || "";
    // Round 25, item 3 : usages.
    renderAccountUsages();
    // Round 25, item 4 : niveau scolaire en cascade d'après la taxonomie
    // (remplace la liste courte LIBRARY_LEVELS du round 19).
    const schoolTaxEl = el("account-school-taxonomy");
    if (schoolTaxEl) {
      await Taxonomy.load();
      accountSchoolCascade = createTaxonomyCascade(schoolTaxEl, {
        mode: "profile",
        sel: profileSchoolSelection(meta),
        hiddenKeys: ["categorie"],
        excludeKeys: ["matiere"],
      });
    }
    const profileNote = el("account-profile-note");
    if (profileNote) profileNote.hidden = true;
    // Round 18, item 16 : crédit de jetons (affichage seul, cf. commentaire
    // HTML sur account-token-balance-row).
    const tokenEl = el("account-token-balance");
    if (tokenEl) tokenEl.textContent = String(meta.token_balance || 0);
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
    // Round 10, item 7 : nom/prénom demandés uniquement à la création du
    // compte, masqués en mode "Se connecter".
    const firstField = el("account-auth-firstname-field");
    const lastField = el("account-auth-lastname-field");
    if (firstField) firstField.hidden = mode !== "signup";
    if (lastField) lastField.hidden = mode !== "signup";
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
          : await Sync.auth.signUp(
              email,
              password,
              (el("account-auth-firstname").value || "").trim(),
              (el("account-auth-lastname").value || "").trim()
            );
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
      // Round 22, item 4 : lève le verrou de connexion obligatoire tout de
      // suite après une connexion réussie (renderAccountView() ci-dessus a
      // déjà rafraîchi accountCurrentUser) — sans attendre un éventuel
      // déclenchement de Sync.auth.onChange, pas garanti selon la
      // bibliothèque/le contexte.
      enforceLoginGate();
    });
  }

  const accountSignoutBtn = el("account-signout-btn");
  if (accountSignoutBtn) {
    accountSignoutBtn.addEventListener("click", async () => {
      await Sync.auth.signOut();
      accountCurrentUser = null;
      updateAccountHomeButton();
      await renderAccountView();
      // Round 22, item 4 : reverrouille immédiatement l'appli (connexion
      // obligatoire) — sans Compte connecté, plus aucun usage n'est
      // possible, y compris rester sur une autre page déjà ouverte.
      enforceLoginGate();
    });
  }

  /** Round 10, item 7 : nom/prénom modifiables après coup depuis la page
   *  Mon Compte (comptes créés avant ce round, ou correction d'une
   *  saisie), via Sync.auth.updateProfile (métadonnées Supabase Auth). */
  const accountProfileSaveBtn = el("account-profile-save-btn");
  if (accountProfileSaveBtn) {
    accountProfileSaveBtn.addEventListener("click", async () => {
      const note = el("account-profile-note");
      const firstName = (el("account-profile-firstname").value || "").trim();
      const lastName = (el("account-profile-lastname").value || "").trim();
      // Round 25, item 4 : niveau scolaire détaillé (`school_taxonomy`,
      // { cycle: { id, label }, niveau: ..., annee: ..., specialite: ... })
      // + `school_level` (libellé du niveau) gardé pour compatibilité.
      const schoolTaxonomy = taxonomyValueFromSelection(accountSchoolCascade ? accountSchoolCascade.getSelection() : {});
      delete schoolTaxonomy.matiere;
      const hasSchool = !!(schoolTaxonomy.cycle || schoolTaxonomy.niveau);
      const schoolLevel = schoolTaxonomy.niveau ? schoolTaxonomy.niveau.label : "";
      accountProfileSaveBtn.disabled = true;
      const result = await Sync.auth.updateProfile(firstName, lastName);
      const levelResult = !result.error
        ? await Sync.auth.updateMetadata({ school_level: schoolLevel, school_taxonomy: hasSchool ? schoolTaxonomy : {} })
        : {};
      accountProfileSaveBtn.disabled = false;
      if (note) {
        note.hidden = false;
        const err = result.error || levelResult.error;
        note.textContent = err ? `Échec de l'enregistrement : ${err}` : "Enregistré.";
      }
      if (!result.error) accountCurrentUser = await Sync.auth.getUser();
    });
  }

  const accountGotoSyncBtn = el("account-goto-sync-btn");
  if (accountGotoSyncBtn) {
    accountGotoSyncBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="sync"]');
      if (tab) tab.click();
    });
  }

  // Round 18, item 17 : bouton "Aller à Classes" (Mon compte) retiré, y
  // compris son gestionnaire de clic (voir index.html).

  // Round 13, item 8 : bouton "Synchronisation" toujours visible sur Mon
  // compte (avant : uniquement proposé quand la synchro n'était pas encore
  // configurée).
  const accountGotoSyncBtn2 = el("account-goto-sync-btn2");
  if (accountGotoSyncBtn2) {
    accountGotoSyncBtn2.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="sync"]');
      if (tab) tab.click();
    });
  }

  // Round 13, item 3-1 : bouton "Bibliothèque" sur Mon bureau.
  // Round 36 : serveur intégré à l'appli (js/config.js) → rien à régler
  // côté utilisateur : le raccourci « Synchronisation » de la page Compte
  // n'a plus lieu d'être (il ne ferait que dérouter un nouvel utilisateur).
  if (Sync.getConfig && Sync.getConfig().builtIn && el("account-goto-sync-btn2")) el("account-goto-sync-btn2").hidden = true;
  const manageGotoLibraryBtn = el("manage-goto-library-btn");
  if (manageGotoLibraryBtn) {
    manageGotoLibraryBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="library"]');
      if (tab) tab.click();
    });
  }

  // Hub Fiches : Mes fiches de révision / Mes créations de fiches / Librairie.
  const fichesHubRevisionBtn = el("fiches-hub-revision-btn");
  if (fichesHubRevisionBtn) fichesHubRevisionBtn.addEventListener("click", () => openManageInMode("all"));
  const fichesHubCreationsBtn = el("fiches-hub-creations-btn");
  if (fichesHubCreationsBtn) {
    fichesHubCreationsBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="creations"]');
      if (tab) tab.click();
    });
  }
  const fichesHubLibraryBtn = el("fiches-hub-library-btn");
  if (fichesHubLibraryBtn) {
    fichesHubLibraryBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="library"]');
      if (tab) tab.click();
    });
  }
  const managePublishedToggle = el("manage-published-toggle");
  if (managePublishedToggle) {
    managePublishedToggle.addEventListener("click", () => {
      manageOnlyPublished = !manageOnlyPublished;
      renderSubjectManageList();
    });
  }

  // Round 13, item 4 : hub École — deux boutons ronds vers Messagerie et
  // Mes classes.
  const schoolHubMessagesBtn = el("school-hub-messages-btn");
  if (schoolHubMessagesBtn) {
    schoolHubMessagesBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="messages"]');
      if (tab) tab.click();
    });
  }
  const schoolHubCalendarBtn = el("school-hub-calendar-btn");
  if (schoolHubCalendarBtn) {
    schoolHubCalendarBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="calendar"]');
      if (tab) tab.click();
    });
  }
  const schoolHubClassesBtn = el("school-hub-classes-btn");
  if (schoolHubClassesBtn) {
    schoolHubClassesBtn.addEventListener("click", () => {
      // Round 26, item 1 : bug corrigé — avec un seul usage élève OU
      // enseignant, la page Classes s'affichait un instant avant la bascule
      // (la décision n'était prise qu'après le chargement asynchrone du
      // compte). Quand le compte est déjà connu, on va maintenant
      // directement sur la bonne page, sans jamais afficher Classes.
      const shortcut = Sync.isConfigured() && accountCurrentUser ? classesShortcutRole() : null;
      if (shortcut) {
        applyBodyLogoSpeech(shortcut === "teacher" ? "classes-teacher" : "classes-student");
        openClassesSubView(shortcut);
        return;
      }
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
    // Round 26, item 1 : masqué d'emblée si un raccourci est probable (le
    // bloc pouvait rester visible depuis une visite précédente).
    if (classesShortcutRole()) mainBlock.hidden = true;

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

    // Round 25, item 3 : usage élève OU enseignant (pas les deux) -> la
    // page Classes est court-circuitée, on arrive directement sur la page
    // correspondante (qui fait elle-même la synchro côté élève). Round 26,
    // item 1 : les boutons Élève/Enseignant ne sont affichés qu'APRÈS cette
    // décision, pour ne jamais les faire apparaître un instant.
    const shortcut = classesShortcutRole();
    if (shortcut && el("view-classes") && el("view-classes").classList.contains("is-active")) {
      mainBlock.hidden = true;
      await openClassesSubView(shortcut);
      return;
    }
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
      syncTeacherEventBoxes();
    } else {
      await syncSharedBoxesForStudent();
      await renderStudentClasses();
    }
  }
  // Round 18, item 11 : boutons "← Retour à Classes" (Élève/Enseignant)
  // retirés, y compris closeClassesSubView (n'était plus utilisée que par
  // eux).
  const classesGotoStudentBtn = el("classes-goto-student-btn");
  if (classesGotoStudentBtn) classesGotoStudentBtn.addEventListener("click", () => openClassesSubView("student"));
  const classesGotoTeacherBtn = el("classes-goto-teacher-btn");
  if (classesGotoTeacherBtn) classesGotoTeacherBtn.addEventListener("click", () => openClassesSubView("teacher"));

  /* ---------------------------------------------------------
     Round 44 : pages « 2 » — mises en page de test, plus épurées
     (inspirées de la Messagerie et du Calendrier en liste), sans toucher
     aux pages d'origine. Chaque bouton « … 2 » ouvre la MÊME page (mêmes
     données, mêmes actions) avec le mode `layout-v2` sur <body> : toute
     la nouvelle présentation est dans css/style.css sous
     `body.layout-v2 #view-…`. Le mode s'éteint en revenant à l'accueil ou
     en ouvrant une page par son bouton d'origine. Pour revenir en arrière :
     retirer les boutons « 2 » (index.html) et ce bloc CSS.
  --------------------------------------------------------- */
  let layoutV2 = false;
  let layoutV2Entering = false;
  function setLayoutV2(on) {
    layoutV2 = !!on;
    document.body.classList.toggle("layout-v2", layoutV2);
  }
  [
    ["fiches-hub-revision-btn", "fiches-hub-revision2-btn"],
    ["fiches-hub-creations-btn", "fiches-hub-creations2-btn"],
    ["review-hub-advised-btn", "review-hub-advised2-btn"],
    ["review-hub-manual-btn", "review-hub-manual2-btn"],
    ["classes-goto-student-btn", "classes-goto-student2-btn"],
    ["classes-goto-teacher-btn", "classes-goto-teacher2-btn"],
  ].forEach(([origId, v2Id]) => {
    const orig = el(origId);
    const v2 = el(v2Id);
    if (!orig || !v2) return;
    orig.addEventListener(
      "click",
      () => {
        if (!layoutV2Entering) setLayoutV2(false);
      },
      true
    );
    v2.addEventListener("click", () => {
      setLayoutV2(true);
      layoutV2Entering = true;
      try {
        orig.click();
      } finally {
        layoutV2Entering = false;
      }
    });
  });
  if (el("view-home")) {
    new MutationObserver(() => {
      if (el("view-home").classList.contains("is-active")) setLayoutV2(false);
    }).observe(el("view-home"), { attributes: true, attributeFilter: ["class"] });
  }

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
  // Round 18, item 3 : bug corrigé — "des boîtes qui se multiplient".
  // Cause : Sync.auth.onChange (Supabase) peut déclencher plusieurs
  // événements truthy coup sur coup pour une seule connexion réelle
  // (session initiale retrouvée au démarrage + événement immédiat du
  // listener qui vient de s'abonner, ou un cycle déconnexion/reconnexion
  // rapide) — chaque appel de syncSharedBoxesForStudent() tournait alors
  // EN PARALLÈLE des autres. Comme reconcileSharedBox() décide de créer
  // une nouvelle boîte miroir en cherchant d'abord dans le tableau
  // `subjects` en mémoire, deux appels concurrents pouvaient tous les
  // deux ne rien y trouver (l'un n'avait pas encore fini de pousser sa
  // création) et créer chacun sa propre copie de la même boîte partagée.
  // On sérialise donc les appels : un appel démarré pendant qu'un autre
  // est encore en cours réutilise la même promesse au lieu d'en relancer
  // un second en parallèle.
  let syncSharedBoxesForStudentInFlight = null;
  async function syncSharedBoxesForStudent() {
    if (syncSharedBoxesForStudentInFlight) return syncSharedBoxesForStudentInFlight;
    syncSharedBoxesForStudentInFlight = syncSharedBoxesForStudentImpl().finally(() => {
      syncSharedBoxesForStudentInFlight = null;
    });
    return syncSharedBoxesForStudentInFlight;
  }
  async function syncSharedBoxesForStudentImpl() {
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
      // Round 10, item 2 : les collections prises dans la Bibliothèque sont
      // maintenant, elles aussi, des miroirs en lecture seule — synchronisées
      // aux mêmes moments que les boîtes de classe (connexion, reprise,
      // intervalle), puisque cette fonction est déjà appelée à tous ces
      // moments-là.
      await syncLibraryMirrorsForUser();
      // Round 18, item 3 (suite) : nettoie d'éventuels doublons déjà créés
      // (avant ce correctif, ou par une synchro externe) à chaque passage.
      await dedupeDuplicateMirrorSubjects();
      renderAll();
      renderSubjectManageList();
      renderCalendarEvents();
    } catch (e) {
      console.warn("Classes: échec de la synchro des boîtes partagées", e);
    }
  }

  /** Round 10, item 2 : reconciliation périodique d'un miroir de
   *  bibliothèque — même principe que reconcileSharedBox (classes) plus
   *  haut, mais sans notion de dossier/chemin à reconstituer : la
   *  collection reste où l'utilisateur l'a rangée dans Mes collections,
   *  elle reste déplaçable entre dossiers (demandé explicitement, à la
   *  différence des boîtes de classe). */
  async function reconcileLibraryCollection(subject, col) {
    // Collection introuvable (p. ex. supprimée côté auteur) : on laisse la
    // copie locale telle quelle, sans la supprimer toute seule — aucune
    // suppression automatique n'a été demandée pour ce cas.
    if (!col) return;
    let changed = false;
    if (col.name && subject.name !== col.name) {
      subject.name = col.name;
      changed = true;
    }
    if (changed) {
      subject.updatedAt = new Date().toISOString();
      await persistSubject(subject);
    }
    const remoteCards = Array.isArray(col.cards) ? col.cards : [];
    const remoteIds = new Set(remoteCards.map((c) => c.id).filter(Boolean));
    const localCardsHere = cards.filter((c) => c.subject === subject.id);

    for (const rc of remoteCards) {
      if (!rc.id) continue;
      const idx = cards.findIndex((c) => c.id === rc.id && c.subject === subject.id);
      if (idx >= 0) {
        const existing = cards[idx];
        const contentChanged = existing.question !== (rc.question || "") || existing.answer !== (rc.answer || "");
        if (existing.deleted || contentChanged) {
          const updated = { ...existing, question: rc.question || "", answer: rc.answer || "", deleted: false, updatedAt: new Date().toISOString() };
          await persist(updated);
          cards[idx] = updated;
        }
      } else {
        const card = { ...newCard(rc.question || "", rc.answer || "", subject.id), id: rc.id };
        await persist(card);
        cards.push(card);
      }
    }
    for (const c of localCardsHere) {
      if (!c.deleted && !remoteIds.has(c.id)) {
        const updated = touch({ ...c, deleted: true });
        await persist(updated);
        const idx = cards.findIndex((x) => x.id === c.id);
        if (idx >= 0) cards[idx] = updated;
      }
    }
  }

  /** Parcourt toutes les collections locales prises dans la Bibliothèque et
   *  les recale sur leur source (nom + fiches) — une collection supprimée
   *  localement (voir deleteSubject) n'est plus dans `subjects`, donc plus
   *  jamais reconsidérée ici : la suppression locale reste bien
   *  définitive côté appareil, sans jamais "revenir toute seule". */
  async function syncLibraryMirrorsForUser() {
    if (!Sync.isConfigured()) return;
    const mirrors = subjects.filter((s) => s.fromLibrary && s.libraryOriginId);
    if (mirrors.length === 0) return;
    for (const subject of mirrors) {
      try {
        const col = await Sync.library.get(subject.libraryOriginId);
        await reconcileLibraryCollection(subject, col);
      } catch (e) {
        console.warn("Librairie : échec de la synchro d'une collection prise", e);
      }
    }
  }

  /* ---------------------------------------------------------
     Round 44 : boîtes à réviser des évènements de classe.
     Côté enseignant, les boîtes liées à un évènement partagé avec une
     classe sont envoyées avec lui (ids des boîtes partagées avec cette
     classe, `shared_boxes`) ; une boîte liée pas encore partagée avec la
     classe l'est automatiquement. Côté élève, ces ids sont traduits en
     boîtes miroirs locales (`sharedBoxId`) et deviennent les boîtes liées
     de l'évènement reçu (Révisions conseillées, mode sprint).
  --------------------------------------------------------- */
  function eventOwnBoxSubjectIds(ev) {
    return revisionTreeBoxIds(revisionTreeForEvent(ev)).filter((id) => {
      const s = subjects.find((x) => x.id === id);
      return s && !s.deleted && !s.sharedBoxId && !(s.fromLibrary && s.libraryOriginId);
    });
  }
  async function ensureEventBoxesSharedWithClass(ev, classId, className) {
    const out = [];
    for (const id of eventOwnBoxSubjectIds(ev)) {
      const subject = subjects.find((x) => x.id === id);
      subject.sharedShares = subject.sharedShares || [];
      let share = subject.sharedShares.find((x) => x.classId === classId);
      if (!share) {
        const boxCards = cards.filter((c) => !c.deleted && c.subject === id);
        const folderPathNames = folderPath(subject.folderId).map((f) => f.name);
        const { data, error } = await Sync.classes.shareBox(classId, subject.name, boxCards, folderPathNames);
        if (error || !data) continue;
        share = { classId, className, boxId: data.id };
        subject.sharedShares.push(share);
        subject.updatedAt = new Date().toISOString();
        await persistSubject(subject);
        try {
          await Sync.messages.send(classId, `📚 « ${subject.name} » a été partagée dans la classe.`);
        } catch (e) { /* best-effort */ }
      }
      if (share.boxId && !out.includes(share.boxId)) out.push(share.boxId);
    }
    return out;
  }
  let sharedEventBoxesMigrationWarned = false;
  function warnSharedEventBoxesMigration() {
    if (sharedEventBoxesMigrationWarned) return;
    sharedEventBoxesMigrationWarned = true;
    robotAlert("L'évènement est bien partagé, mais pas encore ses boîtes à réviser : la base Supabase n'est pas à jour. Exécute supabase/shared_events_boxes_migration.sql, puis rouvre la page de la classe.");
  }
  /** Rattrapage côté enseignant (ouverture de Mes classes / d'une classe) :
   *  renvoie les boîtes des évènements de classe à venir dont la liste a
   *  changé depuis le dernier envoi (ex. boîte ajoutée avant ce round). */
  let syncTeacherEventBoxesInFlight = null;
  function syncTeacherEventBoxes() {
    if (syncTeacherEventBoxesInFlight) return syncTeacherEventBoxesInFlight;
    syncTeacherEventBoxesInFlight = (async () => {
      if (!Sync.isConfigured() || !accountCurrentUser) return;
      const events = loadCalendarEvents();
      let changed = false;
      for (const ev of events) {
        if (!ev.classShare || !ev.classShare.remoteId || !ev.date || calendarDiffDays(ev.date) < 0) continue;
        const boxIds = await ensureEventBoxesSharedWithClass(ev, ev.classShare.classId, ev.classShare.className || "");
        if (JSON.stringify(ev.classShare.boxIds || null) === JSON.stringify(boxIds)) continue;
        const res = await Sync.classes.updateSharedEvent(ev.classShare.remoteId, ev.title, ev.date, boxIds);
        if (!res || res.error) continue;
        if (res.boxIdsMissing) {
          warnSharedEventBoxesMigration();
          break;
        }
        ev.classShare = { ...ev.classShare, boxIds };
        changed = true;
      }
      if (changed) saveCalendarEvents(events);
    })().catch((e) => console.warn("Classes : rattrapage des boîtes des évènements impossible", e))
      .finally(() => {
        syncTeacherEventBoxesInFlight = null;
      });
    return syncTeacherEventBoxesInFlight;
  }
  /** Côté élève : boîtes miroirs locales correspondant aux `box_ids` reçus. */
  function sharedEventLocalLinkIds(re) {
    const ids = Array.isArray(re.box_ids) ? re.box_ids : [];
    const out = [];
    ids.forEach((bid) => {
      const s = subjects.find((x) => x.sharedBoxId === bid && !x.deleted);
      if (s && !out.includes(`subject:${s.id}`)) out.push(`subject:${s.id}`);
    });
    return out;
  }

  /** Round 3, item 4 (squelette) : ajoute ou met à jour, dans le calendrier
   *  local (localStorage), la copie en lecture seule d'un événement partagé
   *  par le prof — même id que côté prof (sharedEventId), pour repérer un
   *  changement de titre/date au prochain passage. */
  function reconcileSharedEvent(klass, re) {
    // Round 21, item 3 : un évènement passé, déjà supprimé par l'élève, ne
    // doit plus jamais être recréé tant que le prof ne l'a pas lui-même
    // modifié/retiré puis re-partagé (nouvel id côté prof).
    if (loadDismissedSharedEventIds().has(re.id)) return;
    const events = loadCalendarEvents();
    const idx = events.findIndex((x) => x.sharedEventId === re.id);
    // Round 26, item 2 : identité du professeur (vide pour un évènement
    // partagé avant la migration, tant que le prof n'a pas rouvert l'appli).
    const teacherName = re.shared_by_name || "";
    // Round 44 : boîtes à réviser envoyées par le prof (miroirs locaux).
    const linkIds = sharedEventLocalLinkIds(re);
    if (idx >= 0) {
      const cur = events[idx];
      const curLinks = JSON.stringify(eventLinkIds(cur));
      if (cur.title !== re.title || cur.date !== re.date || (cur.sharedByName || "") !== teacherName || cur.sharedClassName !== klass.name || curLinks !== JSON.stringify(linkIds)) {
        const next = { ...cur, title: re.title, date: re.date, sharedByName: teacherName, sharedClassName: klass.name, linkIds };
        delete next.linkId;
        events[idx] = next;
        saveCalendarEvents(events);
      }
    } else {
      events.push({
        id: uid(),
        title: re.title,
        date: re.date,
        linkIds,
        sharedEventId: re.id,
        sharedClassId: klass.id,
        sharedClassName: klass.name,
        sharedByName: teacherName,
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
    // Lisibilité : une carte par classe (nom en clair, infos sur une ligne
    // dessous) plutôt qu'un petit rond à trois lignes de texte.
    const meta = [`${count} élève${count > 1 ? "s" : ""}`];
    meta.push(upcoming > 0 ? `${upcoming} échéance${upcoming > 1 ? "s" : ""} à venir` : "aucune échéance");
    return `
      <span class="class-card-icon">${CLASSES_ROW_ICON}</span>
      <span class="class-card-main">
        <span class="class-card-name">${escapeHtml(klass.name)}</span>
        <span class="class-card-meta">${meta.join(" · ")}</span>
      </span>
      ${iconSvgMarkup("chevronRight", "class-card-chevron")}
    `;
  }

  async function renderStudentClasses() {
    const list = el("classes-student-list");
    const empty = el("classes-student-empty");
    if (!list) return;
    list.innerHTML = "";
    const myClasses = await Sync.classes.listAsStudent();
    if (empty) empty.hidden = myClasses.length > 0;
    if (list.previousElementSibling) list.previousElementSibling.hidden = myClasses.length === 0;
    for (const klass of myClasses) {
      const count = await Sync.classes.memberCount(klass.id);
      const upcoming = classUpcomingEvents(klass.id, "student").length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "class-card";
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
    if (list.previousElementSibling) list.previousElementSibling.hidden = myClasses.length === 0;
    for (const klass of myClasses) {
      const count = await Sync.classes.memberCount(klass.id);
      const upcoming = classUpcomingEvents(klass.id, "teacher").length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "class-card";
      btn.innerHTML = classCircleHtml(klass, count, upcoming);
      btn.addEventListener("click", () => openClassDetailView(klass, "teacher"));
      list.appendChild(btn);
    }
  }

  // Round 13 : "rejoindre une classe" vit maintenant dans une page dédiée
  // (view-classes-join), ouverte/fermée depuis la page Élève.
  function openClassesJoinView() {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-classes-join").classList.add("is-active");
  }
  function closeClassesJoinView() {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-classes-student").classList.add("is-active");
  }
  const classesGotoJoinBtn = el("classes-goto-join-btn");
  if (classesGotoJoinBtn) classesGotoJoinBtn.addEventListener("click", openClassesJoinView);
  const classesJoinBackBtn = el("classes-join-back-btn");
  if (classesJoinBackBtn) classesJoinBackBtn.addEventListener("click", closeClassesJoinView);

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
      closeClassesJoinView();
    });
  }

  // Round 13 : "créer une classe" vit maintenant dans une page dédiée
  // (view-classes-create), ouverte/fermée depuis la page Enseignant.
  function openClassesCreateView() {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-classes-create").classList.add("is-active");
  }
  function closeClassesCreateView() {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-classes-teacher").classList.add("is-active");
  }
  const classesGotoCreateBtn = el("classes-goto-create-btn");
  if (classesGotoCreateBtn) classesGotoCreateBtn.addEventListener("click", openClassesCreateView);
  const classesCreateBackBtn = el("classes-create-back-btn");
  if (classesCreateBackBtn) classesCreateBackBtn.addEventListener("click", closeClassesCreateView);

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
      closeClassesCreateView();
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
    // Même logique visuelle que l'explorateur de Fiches : dossiers d'abord,
    // puis boîtes ; nom aligné à gauche, nombre de fiches à droite.
    let html = "";
    for (const child of node.children.values()) {
      html += `<div class="class-tree-row class-tree-row--folder" style="--depth:${depth}">${iconSvgMarkup("folder", "class-tree-icon")}<span class="class-tree-name">${escapeHtml(child.name)}</span></div>`;
      html += renderSharedBoxesTreeHtml(child, depth + 1);
    }
    for (const box of node.boxes) {
      const n = (box.cards || []).length;
      html += `<div class="class-tree-row" style="--depth:${depth}">${orgIconMarkup("orgBoite")}<span class="class-tree-name">${escapeHtml(box.subject_name)}</span><span class="class-tree-count">${n} fiche${n > 1 ? "s" : ""}</span></div>`;
    }
    return html;
  }

  async function openClassDetailView(klass, role) {
    classDetailContext = { klass, role };
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("is-active"));
    el("view-class-detail").classList.add("is-active");
    applyBodyLogoSpeech("class-detail");
    await renderClassDetailView();
    if (role === "teacher") {
      syncTeacherEventBoxes().then(() => {
        if (classDetailContext && classDetailContext.klass.id === klass.id) renderClassDetailView();
      });
    }
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

    const shareBtn = el("class-detail-share-btn");
    const isTeacher = role === "teacher";
    const statsEl = el("class-detail-stats");
    if (statsEl) {
      const chips = [
        `<span class="class-chip">${isTeacher ? "Enseignant" : "Élève"}</span>`,
        `<span class="class-chip">${count} élève${count > 1 ? "s" : ""}</span>`,
      ];
      if (isTeacher && klass.invite_code) {
        chips.push(`<span class="class-chip class-chip--code">Code : <strong>${escapeHtml(klass.invite_code)}</strong></span>`);
      }
      statsEl.innerHTML = chips.join("");
    }
    if (shareBtn) shareBtn.hidden = !isTeacher;
    const addEventBtn = el("class-detail-add-event-btn");
    if (addEventBtn) addEventBtn.hidden = !isTeacher;

    const boxesEl = el("class-detail-boxes");
    if (boxesEl) {
      boxesEl.innerHTML =
        sharedBoxes.length === 0
          ? `<p class="class-detail-empty">Aucune boîte partagée pour l'instant.</p>`
          : renderSharedBoxesTreeHtml(buildSharedBoxesTree(sharedBoxes), 0);
    }

    const events = classUpcomingEvents(klass.id, role);
    const eventsList = el("class-detail-events");
    const eventsEmpty = el("class-detail-events-empty");
    if (eventsList) {
      eventsList.innerHTML = "";
      for (const ev of events) {
        const li = document.createElement("li");
        li.className = "class-event-row";
        // Round 44 : boîtes à réviser de l'évènement, sous son titre ; côté
        // enseignant, un clic ouvre la modification de l'évènement.
        const boxNames = eventLinkedBoxNames(ev);
        li.innerHTML = `<span class="class-event-main"><span class="class-event-title">${escapeHtml(ev.title)}</span>${
          boxNames.length
            ? `<span class="class-event-boxes">${orgIconMarkup("orgBoite")} ${boxNames.map(escapeHtml).join(", ")}</span>`
            : `<span class="class-event-boxes class-event-boxes--none">Aucune boîte à réviser</span>`
        }</span><span class="class-event-when"><span>${formatCalendarDate(ev.date)}</span><span class="class-event-countdown">${calendarCountdownLabel(ev.date)}</span></span>`;
        if (isTeacher) {
          li.classList.add("class-event-row--editable");
          li.setAttribute("role", "button");
          li.tabIndex = 0;
          li.title = "Modifier cet évènement";
          li.insertAdjacentHTML("beforeend", `<span class="class-event-edit" aria-hidden="true">${iconSvgMarkup("pencil", "icon-inline-svg")}</span>`);
          const open = () => {
            calendarFormReturnToClass = { klass, role };
            openCalendarEventForm(ev, klass.id);
          };
          li.addEventListener("click", open);
          li.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          });
        }
        eventsList.appendChild(li);
      }
    }
    if (eventsEmpty) eventsEmpty.hidden = events.length > 0;
  }

  const classDetailBackBtn = el("class-detail-back-btn");
  if (classDetailBackBtn) classDetailBackBtn.addEventListener("click", closeClassDetailView);

  const classDetailShareBtn = el("class-detail-share-btn");
  if (classDetailShareBtn) {
    classDetailShareBtn.addEventListener("click", async () => {
      if (!classDetailContext) return;
      const klass = classDetailContext.klass;
      // Round 11, item 1 : le bouton dédié "Partager depuis la
      // Bibliothèque" (round 10) est retiré — ce même sélecteur "Partager
      // une boîte" propose maintenant, en plus des boîtes perso, les
      // collections de la Bibliothèque comme options (ctx.libraryOptions).
      const libraryOptions = await Sync.library.list();
      openBoitePickerView({
        mode: "single",
        title: `Partager une boîte à « ${klass.name} »`,
        folderAlwaysSelectable: false,
        excludeSubjectIds: new Set(subjects.filter((s) => s.sharedBoxId).map((s) => s.id)),
        libraryOptions,
        includeOutOfRevisions: true,
        onPick: async (kind, id) => {
          let name, boxCards, folderPathNames, afterShare;
          if (kind === "library") {
            const col = libraryOptions.find((c) => c.id === id);
            if (!col) return;
            name = col.name;
            boxCards = Array.isArray(col.cards) ? col.cards : [];
            folderPathNames = [];
            afterShare = async () => {
              try {
                await Sync.messages.send(klass.id, `📚 « ${name} » a été partagée dans la classe (depuis la Librairie).`);
              } catch (e) { /* best-effort */ }
            };
          } else {
            const subject = subjects.find((s) => s.id === id);
            if (!subject) return;
            name = subject.name;
            boxCards = cards.filter((c) => !c.deleted && c.subject === id);
            folderPathNames = folderPath(subject.folderId).map((f) => f.name);
            afterShare = async (data) => {
              subject.sharedShares = subject.sharedShares || [];
              subject.sharedShares.push({ classId: klass.id, className: klass.name, boxId: data.id });
              subject.updatedAt = new Date().toISOString();
              await persistSubject(subject);
              // Round 10, item 10 : message automatique dans la messagerie
              // de la classe quand un prof y partage une boîte.
              try {
                await Sync.messages.send(klass.id, `📚 « ${name} » a été partagée dans la classe.`);
              } catch (e) { /* best-effort */ }
            };
          }
          const { data, error } = await Sync.classes.shareBox(klass.id, name, boxCards, folderPathNames);
          closeBoitePickerView();
          if (error) {
            await robotAlert("Erreur lors du partage : " + error);
            return;
          }
          await afterShare(data);
          renderClassDetailView();
        },
      });
    });
  }

  /** Round 10, item 5 : créer un évènement directement depuis la page de la
   *  classe — réutilise le formulaire existant de Calendrier (bascule vers
   *  cette page, puis ouvre le formulaire avec cette classe déjà présélectionnée
   *  dans "Partager avec une classe"), plutôt que de dupliquer un formulaire. */
  const classDetailAddEventBtn = el("class-detail-add-event-btn");
  if (classDetailAddEventBtn) {
    classDetailAddEventBtn.addEventListener("click", () => {
      if (!classDetailContext) return;
      const klass = classDetailContext.klass;
      const ctx = { klass, role: classDetailContext.role };
      const calendarTab = document.querySelector('.tab[data-view="calendar"]');
      if (calendarTab) calendarTab.click();
      calendarFormReturnToClass = ctx;
      openCalendarEventForm(null, klass.id);
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
  /* Round 41 : « messages lus » gardés AUSSI dans le compte (métadonnées
     de l'utilisateur), pas seulement sur l'appareil : avant, une
     reconnexion (ou un autre appareil/navigateur) faisait réapparaître des
     notifications pour des messages déjà lus. On garde, par discussion, la
     date la plus récente entre l'appareil et le compte. */
  function loadMessagesLastRead() {
    let local = {};
    try {
      const raw = JSON.parse(localStorage.getItem(MESSAGES_LAST_READ_KEY) || "{}");
      local = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    } catch {
      local = {};
    }
    const remote = (accountCurrentUser && accountCurrentUser.user_metadata && accountCurrentUser.user_metadata.messages_last_read) || {};
    const merged = { ...local };
    Object.keys(remote).forEach((k) => {
      if (!merged[k] || String(remote[k]) > String(merged[k])) merged[k] = remote[k];
    });
    return merged;
  }
  let messagesLastReadPushTimer = null;
  function markClassMessagesRead(classId) {
    const map = loadMessagesLastRead();
    map[classId] = new Date().toISOString();
    localStorage.setItem(MESSAGES_LAST_READ_KEY, JSON.stringify(map));
    if (accountCurrentUser) {
      accountCurrentUser.user_metadata = { ...(accountCurrentUser.user_metadata || {}), messages_last_read: map };
      clearTimeout(messagesLastReadPushTimer);
      messagesLastReadPushTimer = setTimeout(() => {
        if (Sync.auth && Sync.auth.updateMetadata) Sync.auth.updateMetadata({ messages_last_read: map }).catch(() => {});
      }, 800);
    }
  }

  /** Met à jour la pastille de notifications du bouton d'accueil
   *  "Messagerie" — appelée à chaque changement d'état de connexion (voir
   *  updateAccountHomeButton) et après lecture/envoi d'un message. */
  // Round 13, item 4 : la pastille de notifications de messagerie migre du
  // cercle d'accueil "Messagerie" (retiré) vers le cercle "École" et
  // apparaît aussi sur le bouton rond "Messagerie" du nouveau hub École.
  async function refreshMessagesBadge() {
    refreshReportsBadge().catch(() => {});
    const homeBadge = el("home-school-badge");
    const hubBadge = el("school-hub-messages-badge");
    if (!homeBadge && !hubBadge) return;
    if (!Sync.isConfigured() || !accountCurrentUser) {
      if (homeBadge) homeBadge.hidden = true;
      if (hubBadge) hubBadge.hidden = true;
      return;
    }
    try {
      const classes = await Sync.messages.listClasses();
      const lastReadMap = loadMessagesLastRead();
      let total = 0;
      for (const k of classes) {
        total += await Sync.messages.countUnread(k.id, lastReadMap[k.id]);
      }
      const text = total > 99 ? "99+" : String(total);
      if (homeBadge) {
        homeBadge.hidden = total <= 0;
        homeBadge.textContent = text;
      }
      if (hubBadge) {
        hubBadge.hidden = total <= 0;
        hubBadge.textContent = text;
      }
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
      // Round 10, item 11 : date/heure du dernier message reçu ou envoyé,
      // affichée sous le nom de la classe. Un accroc réseau sur la lecture
      // du dernier message ne doit jamais empêcher la ligne de s'afficher
      // (juste sans cette date en plus).
      // Les deux lectures sont indépendantes : un accroc sur l'une ne doit
      // pas priver l'autre de son résultat (sinon la pastille de non-lus
      // retomberait à 0 juste parce que la date du dernier message a
      // échoué à charger, ou l'inverse).
      const [unreadResult, lastMsgResult] = await Promise.allSettled([
        Sync.messages.countUnread(klass.id, lastReadMap[klass.id]),
        Sync.messages.getLastMessage(klass.id),
      ]);
      const unread = unreadResult.status === "fulfilled" ? unreadResult.value : 0;
      const lastMsg = lastMsgResult.status === "fulfilled" ? lastMsgResult.value : null;
      const li = document.createElement("li");
      li.className = "subject-row messages-class-row";
      li.innerHTML = `
        <span class="messages-class-row-meta">
          <span class="subject-row-name">${CLASSES_ROW_ICON} <span>${escapeHtml(klass.name)}</span></span>
          ${lastMsg && lastMsg.created_at ? `<span class="messages-class-row-last">${formatSmartMessageTime(lastMsg.created_at)}</span>` : ""}
        </span>
        ${unread > 0 ? `<span class="home-circle-badge messages-class-row-badge">${unread > 99 ? "99+" : unread}</span>` : ""}
      `;
      li.addEventListener("click", () => openMessageThread(klass));
      list.appendChild(li);
    }
    refreshMessagesBadge();
  }

  /** Bibliothèque : collections de fiches partagées publiquement (table
   *  Supabase `library_collections`, lecture publique). Round 10, item 2 :
   *  "Prendre" fait maintenant un miroir en LECTURE SEULE, mis à jour en
   *  direct — même principe que les boîtes de classe (voir
   *  reconcileLibraryCollection/syncLibraryMirrorsForUser) — plutôt qu'une
   *  copie figée comme avant. */
  let libraryCollectionsCache = [];
  let libraryRatingsCache = [];
  let librarySearchQuery = "";
  // Round 23 : filtres en cascade (taxonomie Excel) + tags, remplacent
  // l'ancien filtre "niveau" unique. `libraryTaxFilter` = { categorie: id,
  // cycle: id, ... } ; `libraryTagFilter` = tags exigés (TOUS).
  let libraryTaxFilter = {};
  let libraryTagFilter = [];
  let libraryFilterCascade = null;
  let libraryFilterTagInput = null;
  // Round 19, item 5 : le préréglage automatique depuis le profil ne doit
  // se faire qu'UNE FOIS (au premier passage sur la page pendant cette
  // session) — sans ça, il écraserait à chaque réouverture un choix que
  // l'utilisateur aurait fait exprès entre-temps.
  let libraryLevelFilterAutoApplied = false;
  // Round 20, item 4 : filtre "Mes partages" — ne montre que MES propres
  // collections partagées (comparaison sur owner_id).
  let libraryOnlyMine = false;

  // Round 18, item 15 : niveaux scolaires proposés au partage et au tri —
  // liste reprise telle que demandée ("6ème, 5ème,..., 2nd, 1ère,
  // Terminale, ... prépa, BTS, IUT, licence etc...").
  const LIBRARY_LEVELS = [
    "6ème", "5ème", "4ème", "3ème",
    "2nde", "1ère", "Terminale",
    "Prépa", "BTS", "IUT", "Licence", "Master", "Autre",
  ];

  /* ---------------- Round 23 : taxonomie + tags ----------------
     La taxonomie (catégorie → cycle → niveau → année / spécialité →
     matière) est lue dans data/taxonomie.xlsx par js/taxonomy.js. Une
     collection publiée garde, pour chaque champ, l'id ET le libellé
     ({ id, label }) : l'id sert au filtrage, le libellé à l'affichage et de
     repli si un id change un jour dans l'Excel. */

  // Anciennes valeurs de LIBRARY_LEVELS -> libellé de niveau dans l'Excel.
  const LEGACY_LEVEL_TO_NIVEAU = { "prépa": "CPGE", "iut": "BUT" };

  /** Sélection d'ids ({ categorie: id, ... }) -> valeur stockée
   *  ({ categorie: { id, label }, ... }). */
  function taxonomyValueFromSelection(sel) {
    const tax = Taxonomy.get();
    const out = {};
    Taxonomy.FIELDS.forEach((f) => {
      const item = sel && sel[f.key] ? Taxonomy.findItem(tax, f.key, sel[f.key]) : null;
      if (item) out[f.key] = { id: item.id, label: item.label };
    });
    return out;
  }

  /** Ancien champ `level` (avant la taxonomie) -> sélection d'ids,
   *  remontée jusqu'à la catégorie. "Autre" ou inconnu -> {}. */
  function legacyLevelSelection(level) {
    const tax = Taxonomy.get();
    if (!tax || !level) return {};
    const key = Taxonomy.norm(level);
    const niveau = Taxonomy.findByLabel(tax, "niveau", LEGACY_LEVEL_TO_NIVEAU[key] || level);
    return niveau ? Taxonomy.selectionFromNiveau(tax, niveau.id) : {};
  }

  /** Classement d'une collection publiée ({ categorie: { id, label }, ... }) —
   *  repli sur l'ancien champ `level` pour les collections d'avant. */
  function collectionTaxonomy(col) {
    const t = col && col.taxonomy;
    if (t && typeof t === "object" && Object.keys(t).length > 0) return t;
    return taxonomyValueFromSelection(legacyLevelSelection(col && col.level));
  }

  /** Libellé court pour la liste : niveau (+ année) · matière, ou à défaut
   *  le champ le plus précis disponible. */
  function taxonomyShortLabel(t) {
    if (!t) return "";
    const parts = [];
    if (t.niveau) parts.push(t.annee ? `${t.niveau.label} (${t.annee.label})` : t.niveau.label);
    if (t.matiere) parts.push(t.matiere.label);
    else if (t.specialite) parts.push(t.specialite.label);
    if (parts.length === 0) {
      const last = [...Taxonomy.FIELDS].reverse().find((f) => t[f.key]);
      if (last) parts.push(t[last.key].label);
    }
    return parts.join(" · ");
  }

  /** Chemin complet pour la page de détail. */
  function taxonomyFullLabel(t) {
    if (!t) return "";
    return Taxonomy.FIELDS.filter((f) => t[f.key]).map((f) => t[f.key].label).join(" › ");
  }

  /** Une collection correspond-elle aux filtres de taxonomie choisis ?
   *  Comparaison par id, avec repli sur le libellé. */
  function collectionMatchesTaxFilter(col, filterSel) {
    const keys = Object.keys(filterSel || {}).filter((k) => filterSel[k]);
    if (keys.length === 0) return true;
    const t = collectionTaxonomy(col);
    const tax = Taxonomy.get();
    return keys.every((k) => {
      const v = t[k];
      if (!v) return false;
      if (v.id === filterSel[k]) return true;
      const item = Taxonomy.findItem(tax, k, filterSel[k]);
      return !!item && Taxonomy.norm(item.label) === Taxonomy.norm(v.label);
    });
  }

  /** Classement d'une boîte toute prête (packs/bibliotheque.json) :
   *  `taxonomy` en libellés ({ niveau: "4ème", specialite: "...", matiere:
   *  "anglais" }) si présent, sinon l'ancien `level`. Chaque libellé n'est
   *  retenu que s'il est cohérent avec ceux déjà retenus au-dessus. */
  function libraryPackSelection(box) {
    const tax = Taxonomy.get();
    if (!tax || !box) return {};
    const labels = box.taxonomy && typeof box.taxonomy === "object" ? box.taxonomy : {};
    let sel = labels.niveau ? legacyLevelSelection(labels.niveau) : legacyLevelSelection(box.level);
    Taxonomy.FIELDS.forEach((f) => {
      if (!labels[f.key] || sel[f.key]) return;
      const item = Taxonomy.options(tax, f.key, sel).find((o) => Taxonomy.norm(o.label) === Taxonomy.norm(labels[f.key]));
      if (item) sel = { ...sel, [f.key]: item.id };
    });
    return sel;
  }

  /** Message d'erreur Supabase plus parlant quand la migration du round 23
   *  (colonnes taxonomy/tags) n'a pas encore été exécutée. */
  function libraryShareErrorHint(error) {
    const msg = String(error || "");
    if (/taxonomy|tags/i.test(msg) && /column|colonne|schema/i.test(msg)) {
      return `${msg}\n(La base n'a pas encore les colonnes « taxonomy »/« tags » : exécute supabase/library_collections_taxonomy_tags_migration.sql dans Supabase.)`;
    }
    return msg;
  }

  /** Round 25, item 4 : id de la catégorie « école & études » (celle du
   *  niveau scolaire du profil) — repérée par son libellé, sinon la
   *  première catégorie qui a des cycles. */
  function schoolCategoryId() {
    const tax = Taxonomy.get();
    if (!tax) return null;
    const cats = tax.lists.categories || [];
    const byLabel = cats.find((c) => Taxonomy.norm(c.label).startsWith("ecole"));
    const withCycles = cats.find((c) => Taxonomy.options(tax, "cycle", { categorie: c.id }).length > 0);
    return (byLabel || withCycles || {}).id || null;
  }

  /** Niveau scolaire du profil -> sélection d'ids (catégorie école
   *  comprise, jamais de matière). Repli sur l'ancien `school_level`. */
  function profileSchoolSelection(meta) {
    meta = meta || {};
    const t = meta.school_taxonomy;
    let sel = {};
    if (t && typeof t === "object" && Object.keys(t).length > 0) {
      Taxonomy.FIELDS.forEach((f) => {
        if (t[f.key] && t[f.key].id) sel[f.key] = t[f.key].id;
      });
    } else {
      sel = legacyLevelSelection(meta.school_level);
    }
    delete sel.matiere;
    const catId = schoolCategoryId();
    if (catId) sel.categorie = catId;
    return sel;
  }

  /** Tag normalisé : minuscules, espaces simples, sans "#" initial. */
  function normalizeTag(raw) {
    return String(raw || "")
      .replace(/^#+/, "")
      .replace(/[,;]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .slice(0, 40);
  }

  function collectionTags(col) {
    return Array.isArray(col && col.tags) ? col.tags.map(normalizeTag).filter(Boolean) : [];
  }

  /** Tous les tags déjà utilisés dans la Librairie, du plus fréquent au
   *  moins fréquent — source de la saisie semi-automatique. */
  function libraryKnownTags() {
    const counts = new Map();
    libraryCollectionsCache.forEach((col) => {
      new Set(collectionTags(col)).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
      .map(([tag, count]) => ({ tag, count }));
  }

  const TAX_ALL_LABELS = {
    categorie: "Toutes catégories",
    cycle: "Tous cycles",
    niveau: "Tous niveaux",
    annee: "Toutes années",
    specialite: "Toutes spécialités",
    matiere: "Toutes matières",
  };

  /** Champs en cascade. mode "publish" : un champ par ligne avec son
   *  libellé, "Choisir…" en tête ; mode "filter" : selects compacts sur deux
   *  colonnes, "Tous…" en tête. Un champ sans aucun choix possible (parent
   *  non choisi, ou pas de correspondance dans l'Excel) est masqué. */
  function createTaxonomyCascade(container, opts) {
    const mode = (opts && opts.mode) || "publish";
    // Round 25 : `hiddenKeys` = champs fixés d'avance, non affichés (ex.
    // catégorie « école & études » du profil) ; `excludeKeys` = champs
    // jamais proposés (ex. matière dans le profil).
    const hiddenKeys = (opts && opts.hiddenKeys) || [];
    const excludeKeys = (opts && opts.excludeKeys) || [];
    let sel = { ...((opts && opts.sel) || {}) };
    function draw() {
      const tax = Taxonomy.get();
      container.innerHTML = "";
      Taxonomy.FIELDS.forEach((f) => {
        if (excludeKeys.includes(f.key)) {
          delete sel[f.key];
          return;
        }
        const options = Taxonomy.options(tax, f.key, sel);
        if (sel[f.key] && !options.some((o) => o.id === sel[f.key])) delete sel[f.key];
        if (options.length === 0 || hiddenKeys.includes(f.key)) return;
        const select = document.createElement("select");
        select.dataset.taxKey = f.key;
        const first = document.createElement("option");
        first.value = "";
        first.textContent = mode === "filter" ? TAX_ALL_LABELS[f.key] || "Tous" : mode === "profile" ? "Non renseigné" : "Choisir…";
        select.appendChild(first);
        options.forEach((o) => {
          const opt = document.createElement("option");
          opt.value = o.id;
          opt.textContent = o.label;
          select.appendChild(opt);
        });
        select.value = sel[f.key] || "";
        select.addEventListener("change", () => {
          if (select.value) sel[f.key] = select.value;
          else delete sel[f.key];
          draw();
          if (opts && opts.onChange) opts.onChange({ ...sel });
        });
        if (mode === "filter") {
          select.className = "library-taxonomy-select";
          select.setAttribute("aria-label", f.label);
          select.classList.toggle("is-set", !!sel[f.key]);
          container.appendChild(select);
        } else {
          const label = document.createElement("label");
          label.className = "field taxonomy-field";
          const span = document.createElement("span");
          span.textContent = f.label;
          label.appendChild(span);
          label.appendChild(select);
          container.appendChild(label);
        }
      });
    }
    draw();
    return {
      getSelection: () => ({ ...sel }),
      setSelection: (next) => {
        sel = { ...(next || {}) };
        draw();
      },
      /** Libellés des champs affichés mais pas encore remplis. */
      missingFields: () => {
        const tax = Taxonomy.get();
        return Taxonomy.FIELDS.filter(
          (f) => !excludeKeys.includes(f.key) && !sel[f.key] && Taxonomy.options(tax, f.key, sel).length > 0
        ).map((f) => f.label);
      },
      redraw: draw,
    };
  }

  /** Saisie de tags en "pastilles" avec suggestions. `getSuggestions()`
   *  renvoie [{ tag, count }] ; `allowNew` = accepte un tag inédit (publication)
   *  ou seulement des tags existants (recherche). */
  function createTagInput(container, opts) {
    const allowNew = !!(opts && opts.allowNew);
    let tags = ((opts && opts.tags) || []).map(normalizeTag).filter(Boolean);
    container.innerHTML = `
      <div class="tag-input-box">
        <span class="tag-input-chips"></span>
        <input type="text" class="tag-input-field" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="${escapeHtml((opts && opts.placeholder) || "Ajouter un tag…")}" />
      </div>
      <ul class="tag-suggestions" hidden></ul>`;
    const chipsEl = container.querySelector(".tag-input-chips");
    const input = container.querySelector(".tag-input-field");
    const sugEl = container.querySelector(".tag-suggestions");
    const notify = () => opts && opts.onChange && opts.onChange([...tags]);
    function drawChips() {
      chipsEl.innerHTML = "";
      tags.forEach((t) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "tag-chip tag-chip--removable";
        chip.innerHTML = `#${escapeHtml(t)} <span class="tag-chip-x" aria-hidden="true">×</span>`;
        chip.setAttribute("aria-label", `Retirer le tag ${t}`);
        chip.addEventListener("click", (e) => {
          e.preventDefault();
          tags = tags.filter((x) => x !== t);
          drawChips();
          notify();
        });
        chipsEl.appendChild(chip);
      });
    }
    function suggestions() {
      const q = normalizeTag(input.value);
      const known = ((opts && opts.getSuggestions && opts.getSuggestions()) || []).filter((s) => !tags.includes(s.tag));
      const starts = known.filter((s) => !q || s.tag.startsWith(q));
      const contains = q ? known.filter((s) => !s.tag.startsWith(q) && s.tag.includes(q)) : [];
      const list = [...starts, ...contains].slice(0, 8);
      return { q, list };
    }
    function drawSuggestions() {
      const { q, list } = suggestions();
      sugEl.innerHTML = "";
      const showNew = allowNew && q && !tags.includes(q) && !list.some((s) => s.tag === q);
      if (list.length === 0 && !showNew) {
        if (q && !allowNew) {
          sugEl.innerHTML = `<li class="tag-suggestion tag-suggestion--empty">Aucun tag existant</li>`;
          sugEl.hidden = false;
        } else {
          sugEl.hidden = true;
        }
        return;
      }
      list.forEach((s) => {
        const li = document.createElement("li");
        li.className = "tag-suggestion";
        li.innerHTML = `#${escapeHtml(s.tag)} <span class="tag-suggestion-count">${s.count}</span>`;
        li.addEventListener("mousedown", (e) => e.preventDefault());
        li.addEventListener("click", () => addTag(s.tag));
        sugEl.appendChild(li);
      });
      if (showNew) {
        const li = document.createElement("li");
        li.className = "tag-suggestion tag-suggestion--new";
        li.textContent = `+ nouveau tag « ${q} »`;
        li.addEventListener("mousedown", (e) => e.preventDefault());
        li.addEventListener("click", () => addTag(q));
        sugEl.appendChild(li);
      }
      sugEl.hidden = false;
    }
    function addTag(raw) {
      const t = normalizeTag(raw);
      if (!t) return;
      if (!tags.includes(t)) tags.push(t);
      input.value = "";
      drawChips();
      drawSuggestions();
      input.focus();
      notify();
    }
    /** Valide le texte en cours : tag tel quel (publication) ou meilleure
     *  suggestion existante (recherche). */
    function commitTyped() {
      const q = normalizeTag(input.value);
      if (!q) return false;
      if (allowNew) {
        addTag(q);
        return true;
      }
      const { list } = suggestions();
      const exact = list.find((s) => s.tag === q);
      if (exact || list[0]) {
        addTag((exact || list[0]).tag);
        return true;
      }
      return false;
    }
    input.addEventListener("input", () => {
      if (/[,;]/.test(input.value)) {
        input.value.split(/[,;]/).slice(0, -1).forEach((part) => {
          if (allowNew) addTag(part);
        });
        input.value = input.value.split(/[,;]/).pop();
      }
      drawSuggestions();
    });
    input.addEventListener("focus", drawSuggestions);
    input.addEventListener("blur", () => setTimeout(() => (sugEl.hidden = true), 150));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        // Entrée ne doit jamais soumettre le formulaire de partage.
        e.preventDefault();
        commitTyped();
      } else if (e.key === "Backspace" && !input.value && tags.length > 0) {
        tags.pop();
        drawChips();
        notify();
      }
    });
    drawChips();
    return {
      /** Tags choisis, plus le texte en cours de saisie (publication) pour
       *  ne pas perdre un tag tapé sans avoir appuyé sur Entrée. */
      getTags: () => {
        const pending = allowNew ? normalizeTag(input.value) : "";
        return pending && !tags.includes(pending) ? [...tags, pending] : [...tags];
      },
      setTags: (next) => {
        tags = (next || []).map(normalizeTag).filter(Boolean);
        input.value = "";
        drawChips();
      },
    };
  }

  function tagChipsHtml(tags) {
    return tags.map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`).join("");
  }

  /** Nombre de pouces levés pour une collection, et si le Compte connecté
   *  fait partie des personnes ayant déjà mis un pouce — à partir du cache
   *  de toutes les notes (une seule requête pour toute la Bibliothèque,
   *  voir renderLibraryView). Round 22, item 8 : remplace l'ancienne
   *  moyenne 1-5 étoiles — chaque ligne de `library_ratings` (mise par
   *  `Sync.library.rate(id, 1)`) vaut désormais un simple "pouce", sans
   *  changement de schéma côté Supabase. */
  function libraryCollectionLikeStats(collectionId) {
    const ratings = libraryRatingsCache.filter((r) => r.collection_id === collectionId);
    const liked = !!(accountCurrentUser && ratings.some((r) => r.user_id === accountCurrentUser.id));
    return { count: ratings.length, liked };
  }

  /** Pouce (vers le haut uniquement) cliquable pour liker/unliker une
   *  collection, avec le nombre total de personnes l'ayant déjà mis.
   *  Round 22, item 8 : remplace les 5 étoiles (libraryStarsHtml). */
  function libraryThumbHtml(count, liked, interactiveId) {
    const icon = iconSvgMarkup("thumbsUp", "icon-inline-svg");
    const countLabel = count > 0 ? ` <span class="library-thumb-count">${count}</span>` : "";
    return `<span class="library-thumb${liked ? " library-thumb--active" : ""}"${interactiveId ? ` data-like-collection="${interactiveId}"` : ""} title="${liked ? "Retirer mon pouce" : "Mettre un pouce"}">${icon}${countLabel}</span>`;
  }

  /** Round 22, item 6 : icône de pièce d'or réaliste (dégradé radial +
   *  anneau en relief + reflet) pour le bouton de prix de la Bibliothèque —
   *  remplace l'icône plate monochrome `coin` de ICON_LIBRARY (round 21),
   *  jugée trop peu réaliste ("il faut vraiment que ça ressemble à une
   *  pièce en or"). Un `<radialGradient>` a besoin de plusieurs couleurs et
   *  d'un id unique par instance, ce que le pochoir `currentColor` à un
   *  seul trait de ICON_LIBRARY ne permet pas — d'où ce petit SVG à part. */
  function libraryCoinIconSvg(size) {
    const s = size || 15;
    const gid = `lib-coin-grad-${Math.random().toString(36).slice(2, 9)}`;
    return `<svg class="library-coin-icon" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <radialGradient id="${gid}" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="#fff3c4" />
          <stop offset="45%" stop-color="#f3c545" />
          <stop offset="100%" stop-color="#b8860b" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#${gid})" stroke="#8a6103" stroke-width="1" />
      <circle cx="12" cy="12" r="7.3" fill="none" stroke="#8a6103" stroke-width="0.8" opacity="0.55" />
      <ellipse cx="9" cy="8.3" rx="3.1" ry="1.7" fill="#ffffff" opacity="0.45" />
    </svg>`;
  }

  /** Round 22, item 6 : libellé du bouton de prix — icône pièce + nombre,
   *  sans le mot "jeton" (demande explicite de Stéphane), ou "Gratuit" en
   *  texte simple (pas d'icône, rien à payer). */
  function libraryPriceButtonHtml(priceTokens) {
    return priceTokens > 0 ? `${libraryCoinIconSvg()}${priceTokens}` : "Gratuit";
  }

  /** Bascule le pouce du Compte connecté sur une collection (pose s'il n'y
   *  était pas, retire s'il y était déjà), puis rafraîchit le cache de
   *  notes et rappelle `onDone` pour ré-afficher le nombre à jour. */
  async function toggleLibraryLike(col, liked, onDone) {
    if (!accountCurrentUser) {
      await robotAlert("Connecte-toi avec un Compte (page Compte) pour mettre un pouce à une collection.");
      return;
    }
    if (liked) {
      await Sync.library.unrate(col.id);
    } else {
      await Sync.library.rate(col.id, 1);
    }
    libraryRatingsCache = await Sync.library.listRatings();
    onDone();
  }

  async function renderLibraryView() {
    const needsSync = el("library-needs-sync");
    const list = el("library-list");
    const empty = el("library-empty");
    const searchInput = el("library-search-input");
    const taxFilterEl = el("library-filter-taxonomy");
    const tagFilterEl = el("library-filter-tags");
    const tokenRow = el("library-token-balance-row");
    if (!list) return;
    if (!Sync.isConfigured()) {
      if (needsSync) needsSync.hidden = false;
      list.innerHTML = "";
      if (empty) empty.hidden = true;
      if (searchInput) searchInput.hidden = true;
      if (taxFilterEl) taxFilterEl.hidden = true;
      if (tagFilterEl) tagFilterEl.hidden = true;
      if (tokenRow) tokenRow.hidden = true;
      return;
    }
    if (needsSync) needsSync.hidden = true;
    if (searchInput) searchInput.hidden = false;
    // Round 19, items 5/6 : un seul appel pour le crédit de jetons ET le
    // préréglage du niveau scolaire, plutôt qu'un par fonctionnalité.
    const freshUser = (await Sync.auth.getUser()) || accountCurrentUser;
    // Round 19, item 6 : crédit de jetons, visible seulement une fois
    // connecté (comme dans Mon compte).
    if (tokenRow) {
      if (freshUser) {
        tokenRow.hidden = false;
        const tokenEl = el("library-token-balance");
        if (tokenEl) tokenEl.textContent = String((freshUser.user_metadata || {}).token_balance || 0);
      } else {
        tokenRow.hidden = true;
      }
    }
    // Round 20, item 4 : bouton "Mes partages", visible seulement une fois
    // connecté (rien à filtrer sinon) ; se désactive tout seul en se
    // déconnectant, pour ne pas laisser un filtre actif mais invisible.
    const mineToggle = el("library-mine-toggle");
    if (mineToggle) {
      if (freshUser) {
        mineToggle.hidden = false;
      } else {
        mineToggle.hidden = true;
        libraryOnlyMine = false;
      }
      mineToggle.classList.toggle("is-active", libraryOnlyMine);
      mineToggle.setAttribute("aria-pressed", String(libraryOnlyMine));
    }
    list.innerHTML = `<li class="field-hint">Chargement…</li>`;
    // Round 23 : la taxonomie (Excel) est chargée en même temps que les
    // collections — nécessaire aux filtres ET au classement des anciennes
    // collections (champ `level`).
    await Taxonomy.load();
    if (taxFilterEl) {
      taxFilterEl.hidden = false;
      // Round 19, item 5 (adapté) : préréglage une seule fois sur le niveau
      // scolaire du profil, converti en niveau de la taxonomie.
      if (!libraryLevelFilterAutoApplied) {
        libraryLevelFilterAutoApplied = true;
        // Round 25, item 4 : niveau scolaire détaillé du profil (cycle,
        // niveau, année, spécialité), repli sur l'ancien school_level.
        const preset = profileSchoolSelection((freshUser && freshUser.user_metadata) || {});
        if (preset.cycle || preset.niveau) libraryTaxFilter = preset;
      }
      if (!libraryFilterCascade) {
        libraryFilterCascade = createTaxonomyCascade(taxFilterEl, {
          mode: "filter",
          sel: libraryTaxFilter,
          onChange: (sel) => {
            libraryTaxFilter = sel;
            renderLibraryList();
          },
        });
      } else {
        libraryFilterCascade.setSelection(libraryTaxFilter);
      }
    }
    if (tagFilterEl) {
      tagFilterEl.hidden = false;
      if (!libraryFilterTagInput) {
        libraryFilterTagInput = createTagInput(tagFilterEl, {
          allowNew: false,
          tags: libraryTagFilter,
          placeholder: "Filtrer par tags…",
          getSuggestions: libraryKnownTags,
          onChange: (tags) => {
            libraryTagFilter = tags;
            renderLibraryList();
          },
        });
      }
    }
    const [collections, ratings] = await Promise.all([Sync.library.list(), Sync.library.listRatings()]);
    libraryCollectionsCache = collections;
    libraryRatingsCache = ratings;
    renderLibraryList();
  }

  /** Round 10, item 3 : filtrage local par mots-clés (nom de la collection
   *  ou email de l'auteur), sans re-requêter à chaque frappe — séparée de
   *  renderLibraryView pour être appelée seule depuis l'écouteur de saisie
   *  et après une prise (pour rafraîchir "Déjà pris" sans re-télécharger). */
  function renderLibraryList() {
    const list = el("library-list");
    const empty = el("library-empty");
    if (!list) return;
    const q = librarySearchQuery.trim().toLowerCase();
    let collections = libraryCollectionsCache;
    // Round 20, item 4 : "Mes partages" — ne garde que MES collections
    // (comparaison sur owner_id, pas sur le nom/email, plus fiable).
    if (libraryOnlyMine && accountCurrentUser) {
      collections = collections.filter((col) => col.owner_id === accountCurrentUser.id);
    }
    collections = collections.filter((col) => collectionMatchesTaxFilter(col, libraryTaxFilter));
    if (libraryTagFilter.length > 0) {
      collections = collections.filter((col) => {
        const t = collectionTags(col);
        return libraryTagFilter.every((tag) => t.includes(tag));
      });
    }
    if (q) {
      collections = collections.filter((col) => {
        const ownerName = `${col.owner_first_name || ""} ${col.owner_last_name || ""}`.trim();
        // Round 23 : la recherche texte porte aussi sur les tags et le
        // classement (ex. "anglais", "terminale").
        return (
          (col.name || "").toLowerCase().includes(q) ||
          ownerName.toLowerCase().includes(q) ||
          (col.owner_email || "").toLowerCase().includes(q) ||
          collectionTags(col).some((t) => t.includes(q)) ||
          taxonomyFullLabel(collectionTaxonomy(col)).toLowerCase().includes(q)
        );
      });
    }
    list.innerHTML = "";
    if (empty) empty.hidden = libraryCollectionsCache.length > 0;
    if (libraryCollectionsCache.length > 0 && collections.length === 0) {
      list.innerHTML = `<li class="field-hint">Aucun résultat.</li>`;
      return;
    }
    for (const col of collections) {
      const n = Array.isArray(col.cards) ? col.cards.length : 0;
      // Round 10, item 6 : "Déjà pris" (désactivé, fond différent) si une
      // collection de Mes collections est déjà un miroir de celle-ci.
      const alreadyTaken = subjects.some((s) => s.fromLibrary && s.libraryOriginId === col.id);
      // Round 18, item 15 : prénom/nom plutôt que l'email brut (repli sur
      // l'email pour les collections partagées avant ce round, quand le
      // prénom/nom de l'auteur n'était pas encore connu).
      const ownerName = `${col.owner_first_name || ""} ${col.owner_last_name || ""}`.trim() || col.owner_email || "quelqu'un";
      const priceTokens = Number(col.price_tokens) || 0;
      const taxLabel = taxonomyShortLabel(collectionTaxonomy(col));
      const levelLabel = taxLabel ? ` · ${escapeHtml(taxLabel)}` : "";
      const rowTags = collectionTags(col);
      const { count: likeCount, liked } = libraryCollectionLikeStats(col.id);
      const li = document.createElement("li");
      li.className = "subject-row library-row";
      // Round 21, item 6 : notation déplacée sur la même ligne que le nom
      // (alignée à droite du bloc). Round 22, item 6/8 : le bouton de prix
      // (icône pièce + nombre, sans le mot "jeton") passe en bas à droite
      // du bloc, à côté de "Détails" ; les 5 étoiles sont remplacées par un
      // pouce cliquable (voir libraryThumbHtml).
      li.innerHTML = `
        <div class="library-row-head">
          <span class="subject-row-name">${iconSvgMarkup("share", "icon-inline-svg")} <span>${escapeHtml(col.name)}</span></span>
          <span class="library-rating-row">${libraryThumbHtml(likeCount, liked, col.id)}</span>
        </div>
        <span class="card-row-meta">${n} fiche${n > 1 ? "s" : ""} — par ${escapeHtml(ownerName)}${levelLabel}</span>
        ${rowTags.length ? `<span class="tag-chips tag-chips--row">${tagChipsHtml(rowTags)}</span>` : ""}
        <div class="library-row-actions">
          <button type="button" class="btn btn--small library-price-btn${alreadyTaken ? " library-price-btn--taken" : ""}" ${alreadyTaken ? "disabled" : ""}>${alreadyTaken ? "Déjà pris" : libraryPriceButtonHtml(priceTokens)}</button>
          <button type="button" class="btn btn--small btn--ghost library-details-btn">Détails</button>
        </div>
      `;
      const priceBtn = li.querySelector(".library-price-btn");
      if (priceBtn && !alreadyTaken) {
        priceBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          await confirmAndTakeLibraryCollection(col, () => renderLibraryList());
        });
      }
      const detailsBtn = li.querySelector(".library-details-btn");
      if (detailsBtn) {
        detailsBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openLibraryDetailView(col);
        });
      }
      const thumbEl = li.querySelector(".library-thumb");
      if (thumbEl) {
        thumbEl.addEventListener("click", async (e) => {
          e.stopPropagation();
          await toggleLibraryLike(col, liked, () => renderLibraryList());
        });
      }
      // Round 19, item 11 : le reste de la ligne ouvre la page de détail
      // de la collection (les boutons gardent leur clic propre grâce à
      // e.stopPropagation() ci-dessus).
      li.addEventListener("click", () => openLibraryDetailView(col));
      list.appendChild(li);
    }
  }

  /** Round 19, item 11 : page de détail d'une collection partagée — nom,
   *  auteur, niveau, nombre de fiches, prix, notation — puis un bouton vers
   *  un aperçu épuré des fiches (question/réponse uniquement). */
  let libraryDetailCollection = null;

  function openLibraryDetailView(col) {
    libraryDetailCollection = col;
    const n = Array.isArray(col.cards) ? col.cards.length : 0;
    const ownerName = `${col.owner_first_name || ""} ${col.owner_last_name || ""}`.trim() || col.owner_email || "quelqu'un";
    const priceTokens = Number(col.price_tokens) || 0;
    // Round 22, item 6 : icône pièce + nombre, sans le mot "jeton" (voir
    // libraryPriceButtonHtml, partagé avec la liste et le bouton "Prendre"
    // ci-dessous).
    const priceLabel = libraryPriceButtonHtml(priceTokens);
    const { count, liked } = libraryCollectionLikeStats(col.id);

    const titleEl = el("library-detail-title");
    if (titleEl) titleEl.textContent = col.name || "Collection";
    const metaEl = el("library-detail-meta");
    if (metaEl) {
      metaEl.innerHTML = `
        ${n} fiche${n > 1 ? "s" : ""}<br>
        Par ${escapeHtml(ownerName)}<br>
        ${priceLabel}
      `;
    }
    // Round 23 : classement complet (catégorie › … › matière) et tags.
    const detailTax = taxonomyFullLabel(collectionTaxonomy(col));
    const taxEl = el("library-detail-taxonomy");
    if (taxEl) {
      taxEl.hidden = !detailTax;
      taxEl.textContent = detailTax;
    }
    const detailTags = collectionTags(col);
    const tagsEl = el("library-detail-tags");
    if (tagsEl) {
      tagsEl.hidden = detailTags.length === 0;
      tagsEl.innerHTML = tagChipsHtml(detailTags);
    }
    // Round 20, item 2 : résumé/description, restitués ici tels que saisis
    // au partage — masqués quand absents (collections d'avant ce round, ou
    // champs laissés vides).
    const summaryEl = el("library-detail-summary");
    if (summaryEl) {
      summaryEl.hidden = !col.summary;
      summaryEl.textContent = col.summary || "";
    }
    const descriptionEl = el("library-detail-description");
    if (descriptionEl) {
      descriptionEl.hidden = !col.description;
      descriptionEl.textContent = col.description || "";
    }
    const ratingEl = el("library-detail-rating");
    if (ratingEl) {
      ratingEl.innerHTML = libraryThumbHtml(count, liked, col.id);
      const thumbEl = ratingEl.querySelector(".library-thumb");
      if (thumbEl) {
        thumbEl.addEventListener("click", async () => {
          await toggleLibraryLike(col, liked, () => {
            openLibraryDetailView(col);
            renderLibraryList();
          });
        });
      }
    }
    const alreadyTaken = subjects.some((s) => s.fromLibrary && s.libraryOriginId === col.id);
    // Round 21, item 6 : même bouton "prix" que dans la liste, avec la
    // même confirmation d'achat (voir confirmAndTakeLibraryCollection).
    // Round 22, item 6 : innerHTML (pas textContent) car le libellé
    // contient maintenant l'icône SVG de la pièce.
    const takeBtn = el("library-detail-take-btn");
    if (takeBtn) {
      takeBtn.classList.add("library-price-btn");
      takeBtn.classList.toggle("library-price-btn--taken", alreadyTaken);
      takeBtn.disabled = alreadyTaken;
      takeBtn.innerHTML = alreadyTaken ? "Déjà pris" : priceLabel;
      takeBtn.onclick = alreadyTaken
        ? null
        : async () => {
            await confirmAndTakeLibraryCollection(col, () => {
              renderLibraryList();
              takeBtn.disabled = true;
              takeBtn.classList.add("library-price-btn--taken");
              takeBtn.innerHTML = "Déjà pris";
            });
          };
    }

    boitePickerActivateView("view-library-detail");
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
  }

  // Round 30 : la fiche détaillée d'une collection s'ouvre aussi depuis Mes
  // créations de fiches (bouton prix d'une boîte publiée).
  let libraryDetailReturnView = "library";
  function closeLibraryDetailView() {
    const back = libraryDetailReturnView || "library";
    libraryDetailReturnView = "library";
    boitePickerActivateView(`view-${back}`);
    applyBodyLogoSpeech(back);
    if (back === "creations") renderCreationsList();
    if (back === "creation-detail") renderCreationDetail();
  }

  /** Round 19, item 11 : aperçu épuré des fiches d'une collection — juste
   *  question/réponse pour chaque fiche, sans les actions habituelles de
   *  la page "Fiches" (éditer, hiberner, algo...). */
  /** Round 20, item 3 : l'aperçu épuré ("Voir les fiches") ne montre plus
   *  la réponse en entier — sans quoi n'importe qui pourrait s'en faire
   *  une copie gratuite fiche par fiche sans jamais "Prendre" la
   *  collection. La réponse est tronquée à peu près à sa moitié (coupée
   *  au dernier espace pour rester lisible), suivie de "…" ; le texte est
   *  aussi rendu non sélectionnable (dissuasif contre un copier-coller en
   *  masse, pas une protection absolue — un aperçu reste un aperçu). */
  /** Round 21, item 7 : correctif — le plancher de 20 caractères (round 20)
   *  faisait qu'une réponse courte (≤ 20 caractères, ou jusqu'à 40 selon le
   *  cas) échappait entièrement à la troncature. Stéphane a signalé que
   *  certaines réponses n'étaient donc PAS tronquées. La règle est
   *  maintenant appliquée SANS EXCEPTION : chaque réponse est coupée à sa
   *  moitié exacte (nombre de caractères divisé par deux, arrondi au-dessus),
   *  quelle que soit sa longueur — seule la coupe au dernier espace (pour
   *  rester lisible) reste une adaptation mineure, sans jamais revenir en
   *  arrière jusqu'à annuler la troncature elle-même. */
  function libraryPreviewAnswerHtml(raw) {
    const plain = stripHtml(toDisplayHtml(raw || "")).trim();
    if (!plain) return "";
    const half = Math.ceil(plain.length / 2);
    if (half <= 0) return "";
    let cut = plain.slice(0, half);
    const lastSpace = cut.lastIndexOf(" ");
    if (lastSpace > half * 0.4) cut = cut.slice(0, lastSpace);
    return `${escapeHtml(cut)}…`;
  }

  function openLibraryCardsView(col) {
    const titleEl = el("library-cards-title");
    if (titleEl) titleEl.textContent = col.name || "Fiches";
    const listEl = el("library-cards-list");
    const cards = Array.isArray(col.cards) ? col.cards : [];
    if (listEl) {
      listEl.innerHTML =
        cards
          .map(
            (c) => `
        <li class="library-card-item">
          <p class="library-card-question">${toDisplayHtml(c.question || "")}</p>
          <p class="library-card-answer">${libraryPreviewAnswerHtml(c.answer || "")}</p>
        </li>
      `
          )
          .join("") || `<li class="field-hint">Aucune fiche dans cette collection.</li>`;
    }
    const noteEl = el("library-cards-note");
    if (noteEl) noteEl.hidden = cards.length === 0;
    boitePickerActivateView("view-library-cards");
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
  }

  function closeLibraryCardsView() {
    boitePickerActivateView("view-library-detail");
  }

  const libraryDetailBackBtn = el("library-detail-back-btn");
  if (libraryDetailBackBtn) libraryDetailBackBtn.addEventListener("click", () => closeLibraryDetailView());
  const libraryCardsBackBtn = el("library-cards-back-btn");
  if (libraryCardsBackBtn) libraryCardsBackBtn.addEventListener("click", () => closeLibraryCardsView());
  const libraryDetailViewCardsBtn = el("library-detail-view-cards-btn");
  if (libraryDetailViewCardsBtn) {
    libraryDetailViewCardsBtn.addEventListener("click", () => {
      if (libraryDetailCollection) openLibraryCardsView(libraryDetailCollection);
    });
  }

  /** Round 20, item 6 : mode développeur — liste toutes les collections de
   *  la Bibliothèque (n'importe quel auteur) avec un bouton "Supprimer"
   *  chacune, pour de la modération (contenu inapproprié, doublon signalé
   *  par un utilisateur...). Repose sur la policy RLS dédiée côté base
   *  (voir supabase/library_collections_summary_share_migration.sql), qui
   *  n'autorise cette suppression que pour le compte de Stéphane. */
  async function renderDevLibraryModerationEditor() {
    const list = el("dev-library-moderation-list");
    if (!list) return;
    if (!Sync.isConfigured()) {
      list.innerHTML = `<li class="field-hint">Active la synchronisation pour accéder à la Librairie.</li>`;
      return;
    }
    list.innerHTML = `<li class="field-hint">Chargement…</li>`;
    const collections = await Sync.library.list();
    list.innerHTML = "";
    if (collections.length === 0) {
      list.innerHTML = `<li class="field-hint">Aucune collection partagée.</li>`;
      return;
    }
    collections.forEach((col) => {
      const ownerName = `${col.owner_first_name || ""} ${col.owner_last_name || ""}`.trim() || col.owner_email || "quelqu'un";
      const n = Array.isArray(col.cards) ? col.cards.length : 0;
      const li = document.createElement("li");
      li.className = "subject-row library-row";
      li.style.cursor = "default";
      li.innerHTML = `
        <span class="subject-row-name">${escapeHtml(col.name)}</span>
        <span class="card-row-meta">${n} fiche${n > 1 ? "s" : ""} — par ${escapeHtml(ownerName)}</span>
      `;
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn--small";
      delBtn.textContent = "Supprimer";
      delBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!(await robotConfirm(`Supprimer définitivement « ${col.name} » (par ${ownerName}) de la Librairie ?`, { danger: true }))) return;
        const { error } = await Sync.library.delete(col.id);
        if (error) {
          await robotAlert(`La suppression a échoué : ${error}`);
          return;
        }
        renderDevLibraryModerationEditor();
      });
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }
  /* ---- Boîtes toutes prêtes pour la Bibliothèque (packs/bibliotheque.json).
     Chaque boîte du pack reçoit un id de boîte fixe ("pack-<clé>") : un
     second import ne crée jamais de doublon (même sur un autre appareil,
     grâce à la synchro), et la publication réutilise le contrôle existant
     "déjà partagée ?" par id de boîte d'origine. ---- */
  const LIBRARY_PACK_PREFIX = "pack-";
  let libraryPackCache = null;

  async function loadLibraryPack() {
    if (libraryPackCache) return libraryPackCache;
    const res = await fetch("./packs/bibliotheque.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    libraryPackCache = await res.json();
    return libraryPackCache;
  }

  function libraryPackSubjectId(box) {
    return `${LIBRARY_PACK_PREFIX}${box.key}`;
  }

  function setLibraryPackStatus(text) {
    const s = el("dev-library-pack-status");
    if (s) s.textContent = text || "";
  }

  async function importLibraryPack() {
    let pack;
    try {
      pack = await loadLibraryPack();
    } catch (e) {
      await robotAlert(`Impossible de charger les boîtes toutes prêtes (${e.message}).`);
      return;
    }
    const boxes = Array.isArray(pack.boxes) ? pack.boxes : [];
    const toImport = boxes.filter((b) => !subjects.some((s) => s.id === libraryPackSubjectId(b)));
    if (toImport.length === 0) {
      const n = await classifyImportedPackSubjects(boxes);
      await robotAlert(`Toutes les boîtes toutes prêtes sont déjà dans Mes collections.${n ? ` ${n} ont reçu leur classement.` : ""}`);
      return;
    }
    const nCards = toImport.reduce((acc, b) => acc + (b.cards || []).length, 0);
    if (!(await robotConfirm(`Importer ${toImport.length} boîte${toImport.length > 1 ? "s" : ""} (${nCards} fiches) dans le dossier « ${pack.folderName} » ?`))) return;

    let folder = folders.find((f) => !f.deleted && f.parentId === ROOT_FOLDER_ID && (f.name === pack.folderName || f.name === "Boîtes Bibliothèque"));
    if (!folder) {
      folder = newFolder(pack.folderName, ROOT_FOLDER_ID);
      await persistFolder(folder);
      folders.push(folder);
    }
    await Taxonomy.load();
    const newCards = [];
    let done = 0;
    for (const box of toImport) {
      const subject = newSubject(box.name, folder.id);
      subject.id = libraryPackSubjectId(box);
      // Round 37 : la boîte arrive déjà classée (classement du pack).
      subject.taxonomy = taxonomyValueFromSelection(libraryPackSelection(box));
      await persistSubject(subject);
      subjects.push(subject);
      for (const c of box.cards || []) newCards.push(newCard(c.question || "", c.answer || "", subject.id));
      done++;
      if (done % 20 === 0) setLibraryPackStatus(`Import : ${done} / ${toImport.length} boîtes…`);
    }
    // Round 37 : fiches enregistrées et envoyées en une fois (plus rapide).
    await DB.bulkPut(newCards);
    newCards.forEach((card) => cards.push(card));
    if (Sync.isConfigured()) Sync.pushCardsBulk(newCards).finally(updateSyncStatus);
    await classifyImportedPackSubjects(boxes);
    subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    renderStatsSubjectSelect();
    renderSubjectSelect();
    renderSubjectManageList();
    renderStats();
    setLibraryPackStatus(`${toImport.length} boîte(s) importée(s) dans « ${pack.folderName} ».`);
    await robotAlert(`${toImport.length} boîte${toImport.length > 1 ? "s" : ""} importée${toImport.length > 1 ? "s" : ""} dans « ${pack.folderName} ». Relis-les puis reviens ici pour les publier.`);
  }

  /** Round 37 : donne aux boîtes toutes prêtes déjà importées le classement
   *  du pack si elles n'en ont pas (ou un incomplet). */
  async function classifyImportedPackSubjects(boxes) {
    await Taxonomy.load();
    let n = 0;
    for (const box of boxes) {
      const s = subjects.find((x) => x.id === libraryPackSubjectId(box));
      if (!s) continue;
      const tax = taxonomyValueFromSelection(libraryPackSelection(box));
      if (JSON.stringify(s.taxonomy || {}) === JSON.stringify(tax)) continue;
      s.taxonomy = tax;
      s.updatedAt = new Date().toISOString();
      await persistSubject(s);
      n++;
    }
    return n;
  }

  async function publishLibraryPack() {
    if (!Sync.isConfigured()) {
      await robotAlert("Active d'abord la synchronisation (page Synchronisation) pour publier dans la Librairie.");
      return;
    }
    if (!accountCurrentUser) {
      await robotAlert("Connecte-toi avec ton Compte (page Compte) pour publier à ton nom.");
      return;
    }
    let pack;
    try {
      pack = await loadLibraryPack();
    } catch (e) {
      await robotAlert(`Impossible de charger les boîtes toutes prêtes (${e.message}).`);
      return;
    }
    const freshUser = (await Sync.auth.getUser()) || accountCurrentUser;
    const meta = (freshUser && freshUser.user_metadata) || {};
    if (!meta.first_name && !meta.last_name) {
      await robotAlert("Renseigne d'abord ton prénom et ton nom dans Mon compte : ils seront affichés comme auteur dans la Librairie.");
      return;
    }
    const local = (pack.boxes || [])
      .map((box) => ({ box, subject: subjects.find((s) => s.id === libraryPackSubjectId(box)) }))
      .filter((x) => x.subject);
    if (local.length === 0) {
      await robotAlert("Importe d'abord les boîtes toutes prêtes (bouton au-dessus).");
      return;
    }
    const author = `${meta.first_name || ""} ${meta.last_name || ""}`.trim();
    if (!(await robotConfirm(`Publier ${local.length} boîte${local.length > 1 ? "s" : ""} dans la Librairie, au nom de ${author} ? Celles déjà publiées y gardent leur place, mais leur classement et leurs tags sont mis à jour.`))) return;

    await Taxonomy.load();
    await classifyImportedPackSubjects(pack.boxes || []);
    // Round 37 : mes collections déjà publiées (pour mettre à jour leur
    // classement au lieu de les ignorer).
    let mine = [];
    try {
      mine = (await Sync.library.list()).filter((c) => c.owner_id === accountCurrentUser.id);
    } catch (e) {
      mine = [];
    }
    let published = 0;
    let skipped = 0;
    let updated = 0;
    const failures = [];
    for (const { box, subject } of local) {
      setLibraryPackStatus(`Publication de « ${subject.name} »…`);
      const existing = mine.find((c) => c.source_subject_id === subject.id) || mine.find((c) => !c.source_subject_id && c.name === subject.name);
      if (existing) {
        const taxonomy = taxonomyValueFromSelection(libraryPackSelection(box));
        const tags = Array.isArray(box.tags) ? box.tags.map(normalizeTag).filter(Boolean) : [];
        const sameTax = JSON.stringify(collectionTaxonomy(existing)) === JSON.stringify(taxonomy) && existing.taxonomy && Object.keys(existing.taxonomy).length;
        const sameTags = JSON.stringify(collectionTags(existing)) === JSON.stringify(tags);
        if (sameTax && (sameTags || !tags.length)) {
          skipped++;
          continue;
        }
        const fields = { taxonomy, level: taxonomy.niveau ? taxonomy.niveau.label : box.level || existing.level || "" };
        if (tags.length) fields.tags = tags;
        if (!existing.source_subject_id) fields.source_subject_id = subject.id;
        const { error } = await Sync.library.updateMeta(existing.id, fields);
        if (error) failures.push(`${subject.name} : ${libraryShareErrorHint(error)}`);
        else updated++;
        continue;
      }
      const boxCards = cards.filter((c) => !c.deleted && c.subject === subject.id);
      if (boxCards.length === 0) {
        skipped++;
        continue;
      }
      const taxonomy = taxonomyValueFromSelection(libraryPackSelection(box));
      const { error } = await Sync.library.share(subject.name, boxCards, {
        level: taxonomy.niveau ? taxonomy.niveau.label : box.level || "",
        taxonomy,
        tags: Array.isArray(box.tags) ? box.tags.map(normalizeTag).filter(Boolean) : [],
        summary: box.summary || "",
        description: box.description || "",
        priceTokens: Number(box.priceTokens) || 0,
        sourceSubjectId: subject.id,
      });
      if (error) failures.push(`${subject.name} : ${libraryShareErrorHint(error)}`);
      else {
        published++;
        myPublishedSourceIds.add(subject.id);
      }
    }
    const lines = [`${published} boîte${published > 1 ? "s" : ""} publiée${published > 1 ? "s" : ""}.`];
    if (updated) lines.push(`${updated} déjà publiée${updated > 1 ? "s" : ""} : classement et tags mis à jour.`);
    if (skipped) lines.push(`${skipped} déjà publiée${skipped > 1 ? "s" : ""} et à jour (ou vide${skipped > 1 ? "s" : ""}), inchangée${skipped > 1 ? "s" : ""}.`);
    if (failures.length) lines.push(`Échecs :\n${failures.join("\n")}`);
    setLibraryPackStatus(lines.join(" "));
    await robotAlert(lines.join("\n"));
  }

  const devLibraryPackImportBtn = el("dev-library-pack-import-btn");
  if (devLibraryPackImportBtn) devLibraryPackImportBtn.addEventListener("click", () => importLibraryPack());
  const devLibraryPackPublishBtn = el("dev-library-pack-publish-btn");
  if (devLibraryPackPublishBtn) devLibraryPackPublishBtn.addEventListener("click", () => publishLibraryPack());

  /** Round 29 : contenu de js/config.js à partir du serveur de cet appareil. */
  function devConfigSnippet() {
    const { url, key } = Sync.getConfig();
    return `window.FICHES_CONFIG = {\n  supabaseUrl: ${JSON.stringify(url)},\n  supabaseAnonKey: ${JSON.stringify(key)},\n};\n`;
  }
  function renderDevConfigSnippet() {
    const pre = el("dev-config-snippet");
    const status = el("dev-config-status");
    if (!pre) return;
    pre.textContent = devConfigSnippet();
    if (status) {
      status.textContent = Sync.getConfig().builtIn
        ? "Le serveur est déjà intégré à l'appli (js/config.js)."
        : "Pas encore intégré : les nouveaux utilisateurs devraient saisir le serveur eux-mêmes.";
    }
  }
  const devConfigCopyBtn = el("dev-config-copy-btn");
  if (devConfigCopyBtn) {
    devConfigCopyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(devConfigSnippet());
        devConfigCopyBtn.textContent = "Copié !";
        setTimeout(() => (devConfigCopyBtn.textContent = "Copier"), 1500);
      } catch {
        /* presse-papier indisponible : le texte reste sélectionnable */
      }
    });
    renderDevConfigSnippet();
  }

  /** Round 25, item 1 : réglage du zoom automatique (par appareil). */
  function renderDevAutoZoom() {
    const z = window.__fichesAutoZoom;
    const input = el("dev-autozoom-ref");
    const status = el("dev-autozoom-status");
    if (!z || !input) return;
    input.value = String(z.refWidth());
    if (status) {
      const shortSide = Math.min(screen.width, screen.height);
      const ref = z.refWidth();
      status.textContent =
        ref > 0 && shortSide < 600
          ? `Écran : ${shortSide} px de large → zoom ${Math.round((shortSide / ref) * 100)} %.`
          : `Écran : ${shortSide} px de large → pas de zoom automatique.`;
    }
  }
  const devAutoZoomSaveBtn = el("dev-autozoom-save-btn");
  if (devAutoZoomSaveBtn) {
    devAutoZoomSaveBtn.addEventListener("click", () => {
      const z = window.__fichesAutoZoom;
      const input = el("dev-autozoom-ref");
      if (!z || !input) return;
      const v = Math.max(0, Math.min(1000, parseInt(input.value, 10) || 0));
      try {
        localStorage.setItem(z.key, String(v));
      } catch {
        /* stockage indisponible */
      }
      z.apply();
      renderDevAutoZoom();
    });
    renderDevAutoZoom();
  }

  /** Round 23 : état de la taxonomie lue dans l'Excel (réglages dév.). */
  function renderDevTaxonomyStatus(tax) {
    const status = el("dev-taxonomy-status");
    if (!status || !tax) return;
    const L = tax.lists || {};
    const n = (k) => (L[k] || []).length;
    const when = tax.loadedAt ? new Date(tax.loadedAt).toLocaleString("fr-FR") : "?";
    status.textContent = tax.error
      ? `Lecture impossible : ${tax.error}`
      : `${n("categories")} catégories, ${n("cycles")} cycles, ${n("niveaux")} niveaux, ${n("annees")} années, ${n("specialites")} spécialités, ${n("matieres")} matières — lu le ${when}.`;
  }
  const devTaxonomyReloadBtn = el("dev-taxonomy-reload-btn");
  if (devTaxonomyReloadBtn) {
    devTaxonomyReloadBtn.addEventListener("click", async () => {
      const status = el("dev-taxonomy-status");
      if (status) status.textContent = "Lecture…";
      const tax = await Taxonomy.load(true);
      renderDevTaxonomyStatus(tax);
      if (libraryFilterCascade) libraryFilterCascade.redraw();
    });
    Taxonomy.load().then(renderDevTaxonomyStatus);
  }

  const devLibraryRefreshBtn = el("dev-library-refresh-btn");
  if (devLibraryRefreshBtn) devLibraryRefreshBtn.addEventListener("click", () => renderDevLibraryModerationEditor());

  const librarySearchInputEl = el("library-search-input");
  if (librarySearchInputEl) {
    librarySearchInputEl.addEventListener("input", () => {
      librarySearchQuery = librarySearchInputEl.value || "";
      renderLibraryList();
    });
  }
  const libraryMineToggleEl = el("library-mine-toggle");
  if (libraryMineToggleEl) {
    libraryMineToggleEl.addEventListener("click", () => {
      libraryOnlyMine = !libraryOnlyMine;
      libraryMineToggleEl.classList.toggle("is-active", libraryOnlyMine);
      libraryMineToggleEl.setAttribute("aria-pressed", String(libraryOnlyMine));
      renderLibraryList();
    });
  }

  /** Prend une collection de la bibliothèque : une nouvelle boîte dans Mes
   *  collections (`fromLibrary: true`, icône en réseau — voir
   *  `appendBoiteRow`), miroir en lecture seule à partir de maintenant
   *  (round 10, item 2) — les fiches gardent le même id que dans la
   *  collection publiée (comme pour une boîte de classe), ce qui permet à
   *  `reconcileLibraryCollection` de la garder à jour ensuite. */
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
      if (!rc.id) continue;
      const card = { ...newCard(rc.question || "", rc.answer || "", subject.id), id: rc.id };
      await persist(card);
      cards.push(card);
    }
    renderStatsSubjectSelect();
    renderSubjectSelect();
    renderSubjectManageList();
    renderStats();
    await robotAlert(
      `« ${subject.name} » a été ajoutée à Mes collections (${cardsToCopy.length} fiche${cardsToCopy.length > 1 ? "s" : ""}). Elle se met à jour automatiquement si son auteur la modifie ; tu peux la déplacer dans un dossier, mais pas la modifier ni la repartager.`
    );
  }

  /** Round 21, item 6 : demande de Stéphane — le bouton "Prendre" affiche
   *  désormais le prix et, au clic, demande confirmation pour l'achat
   *  ("veux-tu acheter cette collection pour N jetons ?"). Le crédit de
   *  jetons (métadonnées du Compte, round 18 item 16) est vérifié et
   *  débité AVANT de prendre la collection ; rien n'est déduit si
   *  l'utilisateur annule, n'a pas assez de jetons, ou si la prise elle-
   *  même échoue. Un `onDone` optionnel est appelé après une prise
   *  réussie (mise à jour de l'affichage à l'appelant). */
  async function confirmAndTakeLibraryCollection(col, onDone) {
    if (!accountCurrentUser) {
      await robotAlert("Connecte-toi avec un Compte (page Compte) pour prendre une collection de la Librairie.");
      return;
    }
    const priceTokens = Number(col.price_tokens) || 0;
    const confirmMsg =
      priceTokens > 0
        ? `Acheter « ${col.name} » pour ${priceTokens} jeton${priceTokens > 1 ? "s" : ""} ?`
        : `Prendre « ${col.name} » gratuitement ?`;
    if (!(await robotConfirm(confirmMsg))) return;
    if (priceTokens > 0) {
      const freshUser = (await Sync.auth.getUser()) || accountCurrentUser;
      const balance = Number((freshUser.user_metadata || {}).token_balance) || 0;
      if (balance < priceTokens) {
        await robotAlert(`Solde de jetons insuffisant : il te faut ${priceTokens} jeton${priceTokens > 1 ? "s" : ""}, tu en as ${balance}.`);
        return;
      }
      const { error } = await Sync.auth.updateTokenBalance(balance - priceTokens);
      if (error) {
        await robotAlert(`Le débit des jetons a échoué : ${error}`);
        return;
      }
      accountCurrentUser = await Sync.auth.getUser();
      // Reflète le nouveau solde partout où il est affiché, sans attendre
      // un rechargement de page.
      const accTokenEl = el("account-token-balance");
      if (accTokenEl) accTokenEl.textContent = String(balance - priceTokens);
      const libTokenEl = el("library-token-balance");
      if (libTokenEl) libTokenEl.textContent = String(balance - priceTokens);
    }
    await takeLibraryCollection(col);
    if (onDone) onDone();
  }

  /** Partage une boîte existante dans la bibliothèque publique : nécessite
   *  d'être connecté avec un Compte (sert d'identité/attribution, comme
   *  pour le partage avec une classe). Round 10, item 2 : une boîte déjà
   *  en lecture seule (miroir de classe ou de bibliothèque) ne peut plus
   *  être proposée au partage — voir aussi appendBoiteRow, qui n'affiche
   *  plus du tout l'action "Partager" pour ces boîtes-là. */
  async function shareSubjectToLibrary(subjectId) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    if (await blockIfSharedReadonly(subjectId)) return;
    if (await blockIfLibraryMirror(subjectId, "partager à nouveau")) return;
    if (!Sync.isConfigured()) {
      await robotAlert("Active d'abord la synchronisation (page Synchronisation) pour pouvoir partager dans la librairie.");
      return;
    }
    if (!accountCurrentUser) {
      await robotAlert("Connecte-toi avec un Compte (page Compte) pour partager dans la librairie.");
      return;
    }
    const boxCards = cards.filter((c) => !c.deleted && c.subject === subjectId);
    if (boxCards.length === 0) {
      await robotAlert("Cette boîte est vide : ajoute des fiches avant de la partager.");
      return;
    }
    // Round 19, item 4 : bug corrigé — la Bibliothèque affiche encore
    // l'email de l'auteur au lieu de son prénom/nom, alors même que la
    // migration SQL a été exécutée. Cause réelle : le prénom/nom affiché
    // vient des métadonnées du COMPTE (Mon compte), lues au moment du
    // partage — la migration SQL ne fait qu'ajouter les colonnes, elle ne
    // peut pas deviner rétroactivement un prénom/nom jamais renseigné. Si
    // le compte n'a encore ni prénom ni nom, on les demande ici, une
    // bonne fois, avant de continuer le partage (et on les enregistre
    // dans Mon compte au passage, comme le fait déjà cette page) — sans
    // ça, le partage continuerait sinon à retomber sur l'email pour
    // toujours, sans que Stéphane comprenne pourquoi.
    const freshUser = (await Sync.auth.getUser()) || accountCurrentUser;
    const freshMeta = (freshUser && freshUser.user_metadata) || {};
    if (!freshMeta.first_name && !freshMeta.last_name) {
      const firstName = await robotPrompt(
        "Pour être crédité·e par ton nom plutôt que ton email dans la Librairie, quel est ton prénom ? (facultatif, laisse vide pour garder l'email)",
        ""
      );
      const lastName = firstName && firstName.trim() ? await robotPrompt("Et ton nom ?", "") : "";
      if (firstName && firstName.trim()) {
        await Sync.auth.updateProfile(firstName.trim(), (lastName || "").trim());
        accountCurrentUser = await Sync.auth.getUser();
      }
    }
    // Round 20, item 5 : empêche de partager deux fois la même boîte (elle
    // apparaissait alors en double dans la Bibliothèque) — vérifié côté
    // serveur (par id de boîte d'origine), pas seulement localement, pour
    // rester valable même après un changement d'appareil.
    const existing = await Sync.library.findBySourceSubject(subjectId);
    if (existing) {
      await robotAlert(`Cette boîte a déjà été partagée dans la Librairie sous le nom « ${existing.name} ». Une même boîte ne peut être partagée qu'une seule fois.`);
      return;
    }
    // Round 20, item 2 : tous les champs du partage (nom, niveau, résumé,
    // description, prix) réunis sur une page dédiée plutôt qu'une série de
    // fenêtres du robot enchaînées (source d'un bug d'affichage signalé
    // par Stéphane sur l'enchaînement précédent).
    await openLibraryShareView(s, boxCards);
    return true;
  }

  /** Round 20, item 2 : page dédiée de partage d'une boîte vers la
   *  Bibliothèque — remplace l'ancien enchaînement de robotPrompt
   *  (nom → niveau → prix), qui présentait un bug d'affichage signalé par
   *  Stéphane, par un vrai formulaire avec tous les champs en même temps
   *  (nom, niveau scolaire en liste déroulante, résumé, description, prix
   *  en jetons). */
  let libraryShareCascade = null;
  let libraryShareTagInput = null;
  async function openLibraryShareView(subject, boxCards) {
    const nameEl = el("library-share-name");
    const taxEl = el("library-share-taxonomy");
    const tagsEl = el("library-share-tags");
    const summaryEl = el("library-share-summary");
    const descriptionEl = el("library-share-description");
    const priceEl = el("library-share-price");
    if (nameEl) nameEl.value = subject.name || "";
    // Round 23 : taxonomie (Excel) + tags. Les collections déjà publiées
    // sont chargées si besoin, pour proposer leurs tags en saisie
    // semi-automatique.
    await Promise.all([
      Taxonomy.load(),
      libraryCollectionsCache.length ? null : Sync.library.list().then((cols) => (libraryCollectionsCache = cols)),
    ]);
    // Round 31 : classement choisi à la création de la boîte, repris d'office.
    const createdSel = {};
    if (subject.taxonomy && typeof subject.taxonomy === "object") {
      Object.keys(subject.taxonomy).forEach((k) => {
        if (subject.taxonomy[k] && subject.taxonomy[k].id) createdSel[k] = subject.taxonomy[k].id;
      });
    }
    if (taxEl) libraryShareCascade = createTaxonomyCascade(taxEl, { mode: "publish", sel: createdSel });
    if (tagsEl) {
      libraryShareTagInput = createTagInput(tagsEl, {
        allowNew: true,
        placeholder: "Ex. vocabulaire, bac, verbes…",
        getSuggestions: libraryKnownTags,
      });
    }
    if (summaryEl) summaryEl.value = "";
    if (descriptionEl) descriptionEl.value = "";
    if (priceEl) priceEl.value = "0";
    // Boîte toute prête : pré-remplit niveau, résumé, description et prix
    // depuis packs/bibliotheque.json (modifiables avant de publier).
    if (String(subject.id || "").startsWith(LIBRARY_PACK_PREFIX)) {
      loadLibraryPack()
        .then((pack) => {
          const box = (pack.boxes || []).find((b) => libraryPackSubjectId(b) === subject.id);
          if (!box) return;
          // Classement : `taxonomy` du pack ({ niveau: "4ème", matiere:
          // "anglais", ... } en libellés) s'il existe, sinon l'ancien `level`.
          if (libraryShareCascade) libraryShareCascade.setSelection(libraryPackSelection(box));
          if (libraryShareTagInput && Array.isArray(box.tags)) libraryShareTagInput.setTags(box.tags);
          if (summaryEl && !summaryEl.value) summaryEl.value = box.summary || "";
          if (descriptionEl && !descriptionEl.value) descriptionEl.value = box.description || "";
          if (priceEl) priceEl.value = String(Number(box.priceTokens) || 0);
        })
        .catch(() => {});
    }
    boitePickerActivateView("view-library-share");
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;

    const form = el("library-share-form");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const name = (nameEl && nameEl.value || "").trim();
        if (!name) {
          await robotAlert("Le nom de la collection est obligatoire.");
          return;
        }
        // Round 23 : tous les champs de classement affichés sont obligatoires.
        const missing = libraryShareCascade ? libraryShareCascade.missingFields() : [];
        if (missing.length > 0) {
          await robotAlert(`Complète le classement de la collection : ${missing.join(", ")}.`);
          return;
        }
        const taxonomy = taxonomyValueFromSelection(libraryShareCascade ? libraryShareCascade.getSelection() : {});
        const tags = libraryShareTagInput ? libraryShareTagInput.getTags() : [];
        const priceTokens = Math.max(0, Math.round(Number(((priceEl && priceEl.value) || "0").replace(",", ".")) || 0));
        const submitBtn = el("library-share-submit");
        if (submitBtn) submitBtn.disabled = true;
        const { error } = await Sync.library.share(name, boxCards, {
          // `level` reste rempli (libellé du niveau) pour les versions
          // précédentes de l'appli, qui ne lisent que ce champ.
          level: taxonomy.niveau ? taxonomy.niveau.label : "",
          taxonomy,
          tags,
          summary: ((summaryEl && summaryEl.value) || "").trim(),
          description: ((descriptionEl && descriptionEl.value) || "").trim(),
          priceTokens,
          sourceSubjectId: subject.id,
        });
        if (submitBtn) submitBtn.disabled = false;
        if (error) {
          await robotAlert(`Le partage a échoué : ${libraryShareErrorHint(error)}`);
          return;
        }
        libraryCollectionsCache = [];
        myPublishedSourceIds.add(subject.id);
        closeLibraryShareView();
        renderSubjectManageList();
        if (el("view-creations") && el("view-creations").classList.contains("is-active")) renderCreationsView();
        if (el("view-creation-detail") && el("view-creation-detail").classList.contains("is-active")) renderCreationsView().then(renderCreationDetail);
        await robotAlert(`« ${name} » a été partagée dans la librairie.`);
      };
    }
  }

  // Round 30 : la publication se lance surtout depuis Mes créations de
  // fiches — on y revient (plutôt que sur Mes fiches de révision).
  let libraryShareReturnView = "manage";
  function closeLibraryShareView() {
    const back = libraryShareReturnView || "manage";
    libraryShareReturnView = "manage";
    boitePickerActivateView(`view-${back}`);
    applyBodyLogoSpeech(back);
    if (back === "creations") renderCreationsList();
    if (back === "creation-detail") renderCreationDetail();
  }

  const libraryShareBackBtn = el("library-share-back-btn");
  if (libraryShareBackBtn) libraryShareBackBtn.addEventListener("click", () => closeLibraryShareView());

  /* ---------------------------------------------------------
     Round 30 : page « Mes créations de fiches » — même présentation et
     mêmes filtres que la Librairie, pour les boîtes créées par
     l'utilisateur (ni boîtes de classe, ni collections prises dans la
     Librairie). Une boîte n'a de classement (taxonomie, tags) qu'une fois
     publiée : les filtres de classement ne retiennent donc que des boîtes
     publiées ; la recherche texte porte aussi sur le nom.
     - « + Créer une boîte » : nom, puis l'explorateur s'ouvre pour la
       ranger dans Mes fiches de révision (« Plus tard » possible).
     - Bouton prix (« Gratuit » / jetons) si publiée, sinon « Publier ».
     - « Ajouter à mes révisions » / « Retirer de mes révisions ».
     - Interrupteur « Publiées dans la librairie » (ex-« Mes partages »).
  --------------------------------------------------------- */
  let creationsTaxFilter = {};
  let creationsTagFilter = [];
  let creationsSearchQuery = "";
  let creationsOnlyPublished = false;
  let creationsFilterCascade = null;
  let creationsFilterTagInput = null;
  let creationsMyCollections = [];

  function creationsSubjects() {
    return subjects
      .filter((s) => {
        if (!isOwnCreatedSubject(s)) return false;
        // Boîte « auto-liée » à un dossier qui n'est pas (ou plus) une
        // boîte : simple trace technique, pas une création.
        if (folders.some((f) => f.id === s.id) && !isFolderABoite(s.id)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }
  /** Classement d'une boîte : celui de sa publication s'il y en a une,
   *  sinon celui choisi à sa création (round 31). */
  function creationsTaxonomyOf(s, col) {
    if (col) {
      const t = collectionTaxonomy(col);
      if (t && Object.keys(t).length) return t;
    }
    return s && s.taxonomy && typeof s.taxonomy === "object" ? s.taxonomy : {};
  }
  function creationsCollectionFor(s) {
    return (
      creationsMyCollections.find((c) => c.source_subject_id === s.id) ||
      creationsMyCollections.find((c) => !c.source_subject_id && c.name === s.name) ||
      null
    );
  }
  /** Emplacement d'une boîte dans Mes fiches de révision (« Racine »,
   *  « Maths › Algèbre »…), ou null si elle n'y est pas. */
  function creationsPlaceLabel(s) {
    if (!isSubjectInRevisions(s)) return null;
    const f = folders.find((x) => x.id === s.id);
    const parentId = f ? f.parentId : s.folderId;
    const path = folderPath(parentId || ROOT_FOLDER_ID).map((x) => x.name);
    return path.length ? path.join(" › ") : "Racine";
  }

  async function renderCreationsView() {
    const taxFilterEl = el("creations-filter-taxonomy");
    const tagFilterEl = el("creations-filter-tags");
    const toggle = el("creations-published-toggle");
    const online = Sync.isConfigured() && !!accountCurrentUser;
    if (toggle) {
      toggle.hidden = !online;
      if (!online) creationsOnlyPublished = false;
      toggle.classList.toggle("is-active", creationsOnlyPublished);
      toggle.setAttribute("aria-pressed", String(creationsOnlyPublished));
    }
    if (taxFilterEl) taxFilterEl.hidden = !online;
    if (tagFilterEl) tagFilterEl.hidden = !online;
    // Affichage immédiat avec ce qu'on sait déjà, puis mise à jour une fois
    // les publications (et la taxonomie) chargées.
    renderCreationsList();
    if (!online) {
      creationsMyCollections = [];
      renderCreationsList();
      return;
    }
    try {
      const [cols] = await Promise.all([Sync.library.list(), Taxonomy.load()]);
      libraryCollectionsCache = cols;
      creationsMyCollections = cols.filter((c) => c.owner_id === accountCurrentUser.id);
      myPublishedSourceIds = new Set();
      myPublishedLegacyNames = new Set();
      creationsMyCollections.forEach((c) => {
        if (c.source_subject_id) myPublishedSourceIds.add(c.source_subject_id);
        else if (c.name) myPublishedLegacyNames.add(c.name);
      });
    } catch (e) {
      console.warn("Mes créations : échec du chargement des publications", e);
    }
    if (taxFilterEl && !creationsFilterCascade) {
      creationsFilterCascade = createTaxonomyCascade(taxFilterEl, {
        mode: "filter",
        sel: creationsTaxFilter,
        onChange: (sel) => {
          creationsTaxFilter = sel;
          renderCreationsList();
        },
      });
    }
    if (tagFilterEl && !creationsFilterTagInput) {
      creationsFilterTagInput = createTagInput(tagFilterEl, {
        allowNew: false,
        tags: creationsTagFilter,
        placeholder: "Filtrer par tags…",
        getSuggestions: libraryKnownTags,
        onChange: (tags) => {
          creationsTagFilter = tags;
          renderCreationsList();
        },
      });
    }
    renderCreationsList();
  }

  // Round 34 : filtres d'état (publication × révisions), combinables.
  let creationsPubFilter = ""; // "" | "published" | "unpublished"
  let creationsRevFilter = ""; // "" | "in" | "out"
  let creationDetailSubjectId = null;

  function updateCreationsStatusChips() {
    document.querySelectorAll("#creations-status-chips .creations-chip").forEach((chip) => {
      const on = chip.dataset.group === "pub" ? creationsPubFilter === chip.dataset.value : creationsRevFilter === chip.dataset.value;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
  }

  function renderCreationsList() {
    const list = el("creations-list");
    const empty = el("creations-empty");
    if (!list) return;
    updateCreationsStatusChips();
    const all = creationsSubjects();
    let items = all.map((s) => ({ s, col: creationsCollectionFor(s) }));
    if (creationsOnlyPublished || creationsPubFilter === "published") items = items.filter((it) => it.col);
    if (creationsPubFilter === "unpublished") items = items.filter((it) => !it.col);
    if (creationsRevFilter === "in") items = items.filter((it) => isSubjectInRevisions(it.s));
    if (creationsRevFilter === "out") items = items.filter((it) => !isSubjectInRevisions(it.s));
    const taxActive = Object.keys(creationsTaxFilter || {}).some((k) => creationsTaxFilter[k]);
    if (taxActive) items = items.filter((it) => collectionMatchesTaxFilter({ taxonomy: creationsTaxonomyOf(it.s, it.col) }, creationsTaxFilter));
    if (creationsTagFilter.length > 0) {
      items = items.filter((it) => {
        if (!it.col) return false;
        const t = collectionTags(it.col);
        return creationsTagFilter.every((tag) => t.includes(tag));
      });
    }
    const q = creationsSearchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(({ s, col }) =>
        (s.name || "").toLowerCase().includes(q) ||
        (col && (col.name || "").toLowerCase().includes(q)) ||
        (col && collectionTags(col).some((t) => t.includes(q))) ||
        taxonomyFullLabel(creationsTaxonomyOf(s, col)).toLowerCase().includes(q)
      );
    }
    list.innerHTML = "";
    if (empty) empty.hidden = all.length > 0;
    if (all.length > 0 && items.length === 0) {
      list.innerHTML = `<li class="field-hint">Aucun résultat.</li>`;
      return;
    }
    // Round 34 : bloc épuré — nom, pastille, nombre de fiches, classement
    // complet (ou « à classer ») ; le détail est sur la page de la boîte.
    for (const { s, col } of items) {
      const n = cards.filter((c) => !c.deleted && c.subject === s.id).length;
      const taxFull = taxonomyFullLabel(creationsTaxonomyOf(s, col));
      const li = document.createElement("li");
      li.className = "subject-row library-row creations-row";
      li.dataset.subjectId = s.id;
      li.innerHTML = `
        <div class="library-row-head">
          <span class="subject-row-name">${orgIconMarkup("orgBoite")} <span>${escapeHtml(s.name)}</span></span>
          <span class="creations-status${col ? " creations-status--published" : ""}">${col ? "Publiée" : "Non publiée"}</span>
        </div>
        <span class="card-row-meta">${n} fiche${n > 1 ? "s" : ""}</span>
        <span class="card-row-meta creations-tax">${taxFull ? escapeHtml(taxFull) : `<span class="creations-unclassified">à classer</span>`}</span>
      `;
      li.addEventListener("click", () => openCreationDetail(s.id));
      list.appendChild(li);
    }
  }

  /** Round 39 : bouton rond « + Ajouter une fiche » (page d'une boîte et
   *  liste de ses fiches). */
  function roundAddCardButtonHtml() {
    return `<button type="button" class="round-add-card-btn" aria-label="Ajouter une fiche dans cette boîte">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="26" height="26"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>Ajouter une fiche</span>
    </button>`;
  }

  /* Round 34 : page détaillée d'une boîte de Mes créations — toutes ses
     infos et toutes ses actions (voir les fiches, publier, révisions,
     classer, supprimer). */
  function openCreationDetail(subjectId) {
    creationDetailSubjectId = subjectId;
    renderCreationDetail();
    boitePickerActivateView("view-creation-detail");
    applyBodyLogoSpeech("creation-detail");
  }
  function closeCreationDetail() {
    creationDetailSubjectId = null;
    boitePickerActivateView("view-creations");
    applyBodyLogoSpeech("creations");
    renderCreationsList();
  }
  function renderCreationDetail() {
    const wrap = el("creation-detail-body");
    if (!wrap) return;
    const s = subjects.find((x) => x.id === creationDetailSubjectId);
    if (!s) {
      wrap.innerHTML = `<p class="field-hint">Cette boîte n'existe plus.</p>`;
      return;
    }
    const col = creationsCollectionFor(s);
    const n = cards.filter((c) => !c.deleted && c.subject === s.id).length;
    const inRev = isSubjectInRevisions(s);
    const place = creationsPlaceLabel(s);
    const taxFull = taxonomyFullLabel(creationsTaxonomyOf(s, col));
    const tags = col ? collectionTags(col) : [];
    const priceTokens = col ? Number(col.price_tokens) || 0 : 0;
    const created = s.createdAt ? new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
    const pool = subjectCardsPool(s.id);
    const remembered = !inRev && s.revisionsPlace ? (s.revisionsPlace.folderId ? folderPath(s.revisionsPlace.folderId).map((x) => x.name).join(" › ") : "Racine") : "";
    const addWrap = el("creation-detail-add");
    if (addWrap) addWrap.innerHTML = roundAddCardButtonHtml();
    if (addWrap) addWrap.querySelector("button").onclick = () => openNewCardForSubject(s.id, "creation-detail");
    wrap.innerHTML = `
      <div class="creation-detail-head">
        <h2 class="section-title creation-detail-title">${escapeHtml(s.name)}</h2>
        <span class="creations-status${col ? " creations-status--published" : ""}">${col ? "Publiée" : "Non publiée"}</span>
      </div>
      <dl class="creation-detail-info">
        <dt>Fiches</dt><dd>${n} fiche${n > 1 ? "s" : ""}</dd>
        <dt>Classement</dt><dd>${taxFull ? escapeHtml(taxFull) : `<span class="creations-unclassified">à classer</span>`}</dd>
        <dt>Mes révisions</dt><dd>${place ? escapeHtml(place) : `Hors de mes révisions${remembered ? ` <span class="field-hint">(avant : ${escapeHtml(remembered)})</span>` : ""}`}</dd>
        ${col ? `<dt>Librairie</dt><dd>${priceTokens > 0 ? `${priceTokens} jeton${priceTokens > 1 ? "s" : ""}` : "Gratuite"}${col.name && col.name !== s.name ? ` · publiée sous le nom « ${escapeHtml(col.name)} »` : ""}</dd>` : ""}
        ${tags.length ? `<dt>Tags</dt><dd><span class="tag-chips tag-chips--row">${tagChipsHtml(tags)}</span></dd>` : ""}
        ${created ? `<dt>Créée le</dt><dd>${escapeHtml(created)}</dd>` : ""}
      </dl>
      ${pool ? `<div class="creation-detail-gauge">${buildPersGaugeSvg(pool, { width: 260, barHeight: 10 })}</div>` : ""}
      <div class="creation-detail-actions">
        <button type="button" class="btn btn--ghost" data-act="cards">Voir les fiches</button>
        <button type="button" class="btn btn--ghost" data-act="publish">${col ? `Voir dans la Librairie · ${priceTokens > 0 ? `${priceTokens} jeton${priceTokens > 1 ? "s" : ""}` : "gratuite"}` : "Publier dans la Librairie"}</button>
        <button type="button" class="btn btn--ghost" data-act="revisions">${inRev ? "Retirer de mes révisions" : "Ajouter à mes révisions"}</button>
        ${col ? "" : `<button type="button" class="btn btn--ghost" data-act="classify">${taxFull ? "Modifier le classement / le nom" : "Classer la boîte"}</button>`}
        <button type="button" class="btn btn--ghost creation-detail-delete" data-act="delete">Supprimer la boîte</button>
      </div>
    `;
    wrap.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const act = btn.dataset.act;
        if (act === "addcard") {
          openNewCardForSubject(s.id, "creation-detail");
        } else if (act === "cards") {
          cardsEntryFromCreations = true;
          cardsEntryFromManage = false;
          goToCardsFor(`subject:${s.id}`);
        } else if (act === "publish") {
          if (col) {
            libraryDetailReturnView = "creation-detail";
            openLibraryDetailView(col);
            return;
          }
          libraryShareReturnView = "creation-detail";
          const opened = await shareSubjectToLibrary(s.id);
          if (!opened) libraryShareReturnView = "manage";
        } else if (act === "revisions") {
          if (inRev) await removeSubjectFromRevisions(s.id);
          else await openAddToRevisionsPicker(s.id);
          renderCreationDetail();
        } else if (act === "classify") {
          await openBoxEditView(s.id);
        } else if (act === "delete") {
          const before = subjects.length;
          await deleteSubjectFromCreations(s.id, !!col);
          if (subjects.length < before) closeCreationDetail();
        }
      });
    });
  }
  const creationDetailBackBtn = el("creation-detail-back-btn");
  if (creationDetailBackBtn) creationDetailBackBtn.addEventListener("click", () => closeCreationDetail());
  document.querySelectorAll("#creations-status-chips .creations-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.dataset.group === "pub") creationsPubFilter = creationsPubFilter === chip.dataset.value ? "" : chip.dataset.value;
      else creationsRevFilter = creationsRevFilter === chip.dataset.value ? "" : chip.dataset.value;
      renderCreationsList();
    });
  });

  /** Range une boîte dans Mes fiches de révision : l'explorateur s'ouvre
   *  sur les dossiers (Racine comprise) pour choisir où la mettre. */
  async function openAddToRevisionsPicker(subjectId, opts) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    // Round 31 : ancien emplacement (boîte retirée des révisions) proposé
    // d'abord, s'il existe toujours.
    const place = s.revisionsPlace;
    if (place && !(opts && opts.justCreated)) {
      const pf = place.folderId ? folders.find((x) => x.id === place.folderId && !x.deleted && !x.sharedClassId) : null;
      if (!place.folderId || pf) {
        const path = place.folderId ? folderPath(place.folderId).map((x) => x.name).join(" › ") : "Racine";
        const back = await robotConfirm(`Remettre « ${s.name} » à son ancien emplacement : ${path} ?`, {
          okLabel: "Oui, à cet endroit",
          cancelLabel: "Choisir un autre dossier",
        });
        if (back) {
          await putSubjectBackInRevisions(s, place.folderId || ROOT_FOLDER_ID);
          return;
        }
      }
    }
    const excluded = new Set();
    folders.forEach((f) => {
      if (f.sharedClassRoot) excluded.add(f.id);
    });
    openBoitePickerView({
      mode: "single",
      robotMessage: `Dans quel dossier de Mes fiches de révision ranger « ${s.name} » ?`,
      backLabel: "Annuler",
      excludedFolderIds: excluded,
      onPick: async (_kind, destId) => {
        closeBoitePickerView();
        await putSubjectBackInRevisions(s, destId);
      },
    });
  }
  async function putSubjectBackInRevisions(s, destId) {
    s.folderId = destId;
    s.outOfRevisions = false;
    s.updatedAt = new Date().toISOString();
    await persistSubject(s);
    renderSubjectManageList();
    renderStatsSubjectSelect();
    renderCreationsList();
    showToast("Boîte ajoutée à tes révisions");
  }

  /** Retire une boîte de Mes fiches de révision (après confirmation) :
   *  elle reste dans Mes créations avec ses fiches et leur progression. */
  async function removeSubjectFromRevisions(subjectId) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    const ok = await robotConfirm(
      `Retirer « ${s.name} » de tes révisions ? Elle n'apparaîtra plus dans Mes fiches de révision ni dans tes révisions, mais elle n'est pas supprimée : elle reste dans Mes créations de fiches, avec toutes ses fiches et leur progression. Tu pourras l'y remettre quand tu veux, à la même place.`,
      { okLabel: "Retirer" }
    );
    if (!ok) return;
    const now = new Date().toISOString();
    // Dossier devenu boîte (ancien fonctionnement) : on retire le dossier,
    // la boîte (même id, mêmes fiches) continue seule.
    const f = folders.find((x) => x.id === s.id);
    if (f) {
      for (const child of folders.filter((x) => x.parentId === f.id)) {
        child.parentId = f.parentId || ROOT_FOLDER_ID;
        child.updatedAt = now;
        await persistFolder(child);
      }
      s.folderId = f.parentId || ROOT_FOLDER_ID;
      folders = folders.filter((x) => x.id !== f.id);
      await pushFolderDeleted(f);
      await DB.removeFolder(f.id);
    }
    s.outOfRevisions = true;
    // Emplacement mémorisé, reproposé si on la remet dans les révisions.
    s.revisionsPlace = { folderId: s.folderId || ROOT_FOLDER_ID };
    s.updatedAt = now;
    await persistSubject(s);
    if (currentSubjectId === s.id) switchSubject(ALL_SUBJECTS_ID, true);
    renderSubjectManageList();
    renderStatsSubjectSelect();
    renderCreationsList();
    showToast("Boîte retirée de tes révisions");
  }

  /* Round 32 : « ⋯ » d'une boîte de Mes créations — classer (ou modifier
     le classement, tant qu'elle n'est pas publiée : une fois publiée, c'est
     le classement de la publication qui fait foi) et supprimer
     définitivement. */
  async function openCreationsMoreMenu(subjectId, published) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    const hasTax = s.taxonomy && Object.keys(s.taxonomy).length > 0;
    const buttons = [{ label: "Annuler", value: null }];
    if (!published) buttons.push({ label: hasTax ? "Modifier le classement" : "Classer la boîte", value: "classify" });
    buttons.push({ label: "Supprimer la boîte", value: "delete", danger: true });
    const choice = await showRobotMessage(`« ${s.name} » :`, { buttons });
    if (choice === "classify") await openBoxEditView(subjectId);
    else if (choice === "delete") await deleteSubjectFromCreations(subjectId, published);
  }

  async function deleteSubjectFromCreations(subjectId, published) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    if (published) {
      const goOn = await robotConfirm(
        `« ${s.name} » est publiée dans la Librairie : la supprimer ici ne la retire pas de la Librairie (ceux qui l'ont prise la gardent). Continuer ?`,
        { okLabel: "Continuer" }
      );
      if (!goOn) return;
    }
    await deleteSubject(subjectId);
    renderCreationsList();
  }

  function taxonomySelectionFromValue(t) {
    const sel = {};
    if (t && typeof t === "object") {
      Object.keys(t).forEach((k) => {
        if (t[k] && t[k].id) sel[k] = t[k].id;
      });
    }
    return sel;
  }

  /** Même page que la création, pour classer une boîte existante (ou
   *  changer son classement / son nom). */
  let boxEditSubjectId = null;
  async function openBoxEditView(subjectId) {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return;
    boxEditSubjectId = subjectId;
    const nameEl = el("box-create-name");
    const taxEl = el("box-create-taxonomy");
    const titleEl = el("box-create-title");
    const submitEl = el("box-create-submit");
    if (titleEl) titleEl.textContent = "Classer la boîte";
    if (submitEl) submitEl.textContent = "Enregistrer";
    if (nameEl) nameEl.value = s.name;
    boitePickerActivateView("view-box-create");
    applyBodyLogoSpeech("box-create");
    if (taxEl) {
      taxEl.innerHTML = `<p class="field-hint">Chargement du classement…</p>`;
      await Taxonomy.load();
      taxEl.innerHTML = "";
      boxCreateCascade = createTaxonomyCascade(taxEl, { mode: "publish", sel: taxonomySelectionFromValue(s.taxonomy) });
    }
  }

  /* Round 31 : création d'une boîte sur une page dédiée — nom + classement
     (taxonomie, tous les champs affichés obligatoires, comme à la
     publication). Puis : « Ajouter cette boîte à tes révisions ? » — oui :
     choix du dossier dans l'arborescence ; non : elle reste hors
     révisions, dans Mes créations. */
  let boxCreateCascade = null;
  async function createBoxFromCreations() {
    creationDetailSubjectId = null;
    const nameEl = el("box-create-name");
    const taxEl = el("box-create-taxonomy");
    boxEditSubjectId = null;
    if (el("box-create-title")) el("box-create-title").textContent = "Créer une boîte";
    if (el("box-create-submit")) el("box-create-submit").textContent = "Créer";
    if (nameEl) nameEl.value = "";
    boitePickerActivateView("view-box-create");
    applyBodyLogoSpeech("box-create");
    if (taxEl) {
      taxEl.innerHTML = `<p class="field-hint">Chargement du classement…</p>`;
      await Taxonomy.load();
      taxEl.innerHTML = "";
      boxCreateCascade = createTaxonomyCascade(taxEl, { mode: "publish", sel: {} });
    }
    if (nameEl) nameEl.focus();
  }
  function closeBoxCreateView() {
    boxEditSubjectId = null;
    if (creationDetailSubjectId && subjects.some((x) => x.id === creationDetailSubjectId)) {
      boitePickerActivateView("view-creation-detail");
      applyBodyLogoSpeech("creation-detail");
      renderCreationDetail();
      return;
    }
    boitePickerActivateView("view-creations");
    applyBodyLogoSpeech("creations");
    renderCreationsList();
  }
  const boxCreateForm = el("box-create-form");
  if (boxCreateForm) {
    boxCreateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameEl = el("box-create-name");
      const name = ((nameEl && nameEl.value) || "").trim();
      if (!name) {
        await robotAlert("Donne un nom à ta boîte.");
        return;
      }
      const missing = boxCreateCascade ? boxCreateCascade.missingFields() : [];
      if (missing.length > 0) {
        await robotAlert(`Complète le classement de la boîte : ${missing.join(", ")}.`);
        return;
      }
      if (boxEditSubjectId) {
        const s = subjects.find((x) => x.id === boxEditSubjectId);
        boxEditSubjectId = null;
        if (s) {
          const now = new Date().toISOString();
          s.taxonomy = taxonomyValueFromSelection(boxCreateCascade ? boxCreateCascade.getSelection() : {});
          if (name !== s.name) {
            s.name = name;
            // Ancien dossier-boîte : le dossier porte le même nom.
            const f = folders.find((x) => x.id === s.id);
            if (f) {
              f.name = name;
              f.updatedAt = now;
              await persistFolder(f);
            }
            subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
          }
          s.updatedAt = now;
          await persistSubject(s);
          renderSubjectManageList();
          renderStatsSubjectSelect();
        }
        closeBoxCreateView();
        showToast("Boîte classée");
        return;
      }
      const subject = newSubject(name, ROOT_FOLDER_ID);
      subject.taxonomy = taxonomyValueFromSelection(boxCreateCascade ? boxCreateCascade.getSelection() : {});
      // Pas encore rangée : elle entre dans Mes fiches de révision quand on
      // choisit son dossier (tout de suite, ou plus tard).
      subject.outOfRevisions = true;
      await persistSubject(subject);
      subjects.push(subject);
      subjects.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      renderStatsSubjectSelect();
      closeBoxCreateView();
      const add = await robotConfirm(`Boîte « ${name} » créée. Veux-tu l'ajouter à tes révisions ?`, {
        okLabel: "Oui",
        cancelLabel: "Non, pas maintenant",
      });
      if (add) openAddToRevisionsPicker(subject.id, { justCreated: true });
    });
  }
  const boxCreateCancelBtn = el("box-create-cancel-btn");
  if (boxCreateCancelBtn) boxCreateCancelBtn.addEventListener("click", () => closeBoxCreateView());

  const creationsCreateBtn = el("creations-create-btn");
  if (creationsCreateBtn) creationsCreateBtn.addEventListener("click", () => createBoxFromCreations());

  /* ---------------------------------------------------------
     Round 41 : « Signaler » (ex-mode chantier).
     - Fiche à soi : même comportement qu'avant (la fiche est marquée 🚩,
       à corriger ; un nouvel appui retire la marque).
     - Fiche de quelqu'un d'autre (boîte de classe, collection de la
       Librairie) : une page s'ouvre pour écrire à l'auteur ; il reçoit le
       message dans « Gérer mes fiches » → « Signalements ».
  --------------------------------------------------------- */
  function isReadonlyMirrorCard(card) {
    const s = card && subjects.find((x) => x.id === card.subject);
    return !!(s && (s.sharedBoxId || (s.fromLibrary && s.libraryOriginId)));
  }
  async function signalCard(cardId) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    if (isReadonlyMirrorCard(card)) {
      await openReportCardView(card);
      return;
    }
    await toggleUnderConstruction(cardId);
  }

  let reportCardContext = null; // { card, row, returnViewId }
  async function openReportCardView(card) {
    const s = subjects.find((x) => x.id === card.subject);
    if (!s) return;
    if (!Sync.isConfigured() || !accountCurrentUser) {
      await robotAlert("Connecte-toi à ton compte pour signaler une fiche à son auteur.");
      return;
    }
    let row = null;
    let authorLabel = "";
    try {
      if (s.fromLibrary && s.libraryOriginId) {
        const col = await Sync.library.get(s.libraryOriginId);
        if (col && col.owner_id) {
          row = { author_id: col.owner_id, source_kind: "library", source_id: String(col.id) };
          authorLabel = `${col.owner_first_name || ""} ${col.owner_last_name || ""}`.trim() || "l'auteur de la collection";
        }
      } else if (s.sharedBoxId) {
        const authorId = await Sync.reports.sharedBoxAuthor(s.sharedBoxId);
        if (authorId) {
          row = { author_id: authorId, source_kind: "class", source_id: String(s.sharedBoxId) };
          authorLabel = s.sharedClassName ? `le professeur de « ${s.sharedClassName} »` : "ton professeur";
        }
      }
    } catch (e) {
      row = null;
    }
    if (!row) {
      await robotAlert("Impossible de retrouver l'auteur de cette fiche (hors ligne ?). Réessaie plus tard.");
      return;
    }
    if (row.author_id === accountCurrentUser.id) {
      // Sa propre collection prise en Librairie : simple marque locale.
      await toggleUnderConstruction(card.id);
      return;
    }
    const current = document.querySelector(".view.is-active");
    reportCardContext = { card, row: { ...row, box_name: s.name }, returnViewId: current ? current.id : "view-home" };
    const meta = el("report-card-meta");
    if (meta) meta.textContent = `Boîte « ${s.name} » — ton message sera envoyé à ${authorLabel}.`;
    const preview = el("report-card-preview");
    if (preview) {
      preview.innerHTML = `<div class="report-card-q">${toDisplayHtml(card.question)}</div><div class="report-card-a">${toDisplayHtml(card.answer)}</div>`;
    }
    const msg = el("report-card-message");
    if (msg) msg.value = "";
    boitePickerActivateView("view-report-card");
    const homeBtnEl = el("home-btn");
    if (homeBtnEl) homeBtnEl.hidden = false;
    if (el("body-logo-row")) el("body-logo-row").hidden = false;
    applyBodyLogoSpeech("report-card");
    if (msg) msg.focus();
  }
  function closeReportCardView() {
    const back = (reportCardContext && reportCardContext.returnViewId) || "view-home";
    reportCardContext = null;
    if (back === "view-home") {
      goHome();
      return;
    }
    boitePickerActivateView(back);
    applyBodyLogoSpeech(back.replace(/^view-/, ""));
  }
  const reportCardForm = el("report-card-form");
  if (reportCardForm) {
    reportCardForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!reportCardContext) return;
      const msgEl = el("report-card-message");
      const message = ((msgEl && msgEl.value) || "").trim();
      if (!message) {
        await robotAlert("Écris quelques mots pour expliquer à l'auteur ce qui ne va pas.");
        return;
      }
      const meta = (accountCurrentUser && accountCurrentUser.user_metadata) || {};
      const reporterName = `${meta.first_name || ""} ${meta.last_name || ""}`.trim() || (accountCurrentUser && accountCurrentUser.email) || "";
      const { card, row } = reportCardContext;
      const submitBtn = el("report-card-submit");
      if (submitBtn) submitBtn.disabled = true;
      const { error } = await Sync.reports.send({
        ...row,
        reporter_name: reporterName,
        card_id: card.id,
        card_question: stripHtmlFast(card.question).slice(0, 1000),
        card_answer: stripHtmlFast(card.answer).slice(0, 1000),
        message,
      });
      if (submitBtn) submitBtn.disabled = false;
      if (error) {
        await robotAlert(/card_reports|schema cache|relation/i.test(error) ? "Les signalements ne sont pas encore activés sur le serveur (supabase/card_reports_migration.sql)." : `Le signalement n'a pas pu être envoyé : ${error}`);
        return;
      }
      closeReportCardView();
      showToast("Signalement envoyé à l'auteur");
    });
  }
  const reportCardCancel = el("report-card-cancel");
  if (reportCardCancel) reportCardCancel.addEventListener("click", () => closeReportCardView());

  /* Côté auteur : bouton rond « Signalements » (Gérer mes fiches), pastille
     rouge des signalements non lus (aussi sur « Gérer mes fiches » de
     l'accueil), et page qui les liste. */
  async function refreshReportsBadge() {
    const hubBtn = el("fiches-hub-reports-btn");
    const hubBadge = el("fiches-hub-reports-badge");
    const homeBadge = el("home-reports-badge");
    if (!Sync.isConfigured() || !accountCurrentUser || !Sync.reports) {
      if (hubBtn) hubBtn.hidden = true;
      if (homeBadge) homeBadge.hidden = true;
      return;
    }
    const { open, unread } = await Sync.reports.countMine();
    const text = unread > 99 ? "99+" : String(unread);
    if (hubBtn) hubBtn.hidden = open <= 0;
    if (hubBadge) {
      hubBadge.hidden = unread <= 0;
      hubBadge.textContent = text;
    }
    if (homeBadge) {
      homeBadge.hidden = unread <= 0;
      homeBadge.textContent = text;
    }
  }
  function formatReportDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  }
  async function renderReportsView() {
    const list = el("reports-list");
    const empty = el("reports-empty");
    if (!list) return;
    list.innerHTML = `<li class="field-hint">Chargement…</li>`;
    const reports = await Sync.reports.listMine();
    list.innerHTML = "";
    if (empty) empty.hidden = reports.length > 0;
    reports.forEach((r) => {
      const local = cards.find((c) => c.id === r.card_id && !c.deleted && !isReadonlyMirrorCard(c));
      const li = document.createElement("li");
      li.className = "subject-row report-row" + (r.read_at ? "" : " report-row--unread");
      li.innerHTML = `
        <div class="report-row-head">
          <span class="report-row-box">${orgIconMarkup("orgBoite")} ${escapeHtml(r.box_name || "Boîte")}</span>
          <span class="report-row-date">${escapeHtml(formatReportDate(r.created_at))}</span>
        </div>
        <div class="report-row-card"><span class="report-row-label">Fiche :</span> ${escapeHtml(r.card_question || "")}</div>
        <blockquote class="report-row-message">${escapeHtml(r.message || "")}</blockquote>
        <div class="report-row-from">— ${escapeHtml(r.reporter_name || "un utilisateur")}</div>
        <div class="library-row-actions">
          ${local ? `<button type="button" class="btn btn--small btn--ghost" data-act="edit">Corriger la fiche</button>` : ""}
          <button type="button" class="btn btn--small btn--ghost" data-act="done">Marquer comme traité</button>
        </div>`;
      const editBtn = li.querySelector('[data-act="edit"]');
      if (editBtn) editBtn.addEventListener("click", () => enterEditMode(local));
      li.querySelector('[data-act="done"]').addEventListener("click", async () => {
        const { error } = await Sync.reports.resolve(r.id);
        if (error) {
          await robotAlert(`Impossible de marquer ce signalement comme traité : ${error}`);
          return;
        }
        li.remove();
        if (empty) empty.hidden = list.children.length > 0;
        refreshReportsBadge();
      });
      list.appendChild(li);
    });
    const unreadIds = reports.filter((r) => !r.read_at).map((r) => r.id);
    if (unreadIds.length) {
      await Sync.reports.markRead(unreadIds);
      refreshReportsBadge();
    }
  }
  const fichesHubReportsBtn = el("fiches-hub-reports-btn");
  if (fichesHubReportsBtn) {
    fichesHubReportsBtn.addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-view="reports"]');
      if (tab) tab.click();
    });
  }

  const creationsSearchToggle = el("creations-search-toggle");
  if (creationsSearchToggle) {
    creationsSearchToggle.addEventListener("click", () => {
      const panel = el("creations-search-panel");
      if (!panel) return;
      panel.hidden = !panel.hidden;
      creationsSearchToggle.setAttribute("aria-expanded", String(!panel.hidden));
      creationsSearchToggle.classList.toggle("is-open", !panel.hidden);
      if (!panel.hidden && el("creations-search-input")) el("creations-search-input").focus();
    });
  }
  const creationsSearchInput = el("creations-search-input");
  if (creationsSearchInput) {
    creationsSearchInput.addEventListener("input", () => {
      creationsSearchQuery = creationsSearchInput.value;
      renderCreationsList();
    });
  }
  const creationsPublishedToggle = el("creations-published-toggle");
  if (creationsPublishedToggle) {
    creationsPublishedToggle.addEventListener("click", () => {
      creationsOnlyPublished = !creationsOnlyPublished;
      creationsPublishedToggle.classList.toggle("is-active", creationsOnlyPublished);
      creationsPublishedToggle.setAttribute("aria-pressed", String(creationsOnlyPublished));
      renderCreationsList();
    });
  }

  // {klass} de la discussion actuellement ouverte, ou null.
  let messageThreadContext = null;
  let unsubscribeMessageThreadRealtime = null;
  // Id des messages déjà affichés dans le fil ouvert — évite un doublon
  // quand le message qu'on vient d'envoyer nous revient aussi par le
  // canal temps réel (voir sendClassMessage plus bas).
  let messageThreadRenderedIds = new Set();

  // Round 18, item 9 : formatage "intelligent" façon WhatsApp — l'heure
  // seule aujourd'hui, le nom du jour ("Hier", "Mardi"...) cette semaine,
  // la date complète au-delà.
  function formatSmartMessageTime(iso) {
    try {
      const d = new Date(iso);
      const now = new Date();
      const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
      const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
      const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      if (diffDays === 0) return time;
      if (diffDays === 1) return "Hier";
      if (diffDays > 1 && diffDays < 7) {
        const day = d.toLocaleDateString("fr-FR", { weekday: "long" });
        return day.charAt(0).toUpperCase() + day.slice(1);
      }
      return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: diffDays >= 365 ? "numeric" : undefined });
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
        <span class="message-bubble-time">${formatSmartMessageTime(msg.created_at)}</span>
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
    if (!reviewSessionStarted) return;
    // Round 42 : la fiche affichée est choisie à chaque question parmi
    // toutes les fiches de la boîte ; on ajoute seulement aux « fiches
    // dues » de la séance celles arrivées par la sync et pas encore vues.
    const queueIds = new Set(reviewQueue.map((c) => c.id));
    const currentId = currentCard ? currentCard.id : null;
    const newlyDue = dueCards().filter(
      (c) => c.id !== currentId && !queueIds.has(c.id) && !sessionState.seen.has(c.id) && !sessionState.dueAtStart.has(c.id)
    );
    if (newlyDue.length === 0) return;
    newlyDue.forEach((c) => sessionState.dueAtStart.add(c.id));
    reviewQueue.push(...newlyDue);
    sessionTotalDue += newlyDue.length;
    renderSessionProgress();
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
          currentSubjectId = subjects[0] ? subjects[0].id : ALL_SUBJECTS_ID;
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

    if (!currentSubjectId || (!isSentinelSubject(currentSubjectId) && !subjects.some((s) => s.id === currentSubjectId))) {
      currentSubjectId = subjects[0] ? subjects[0].id : ALL_SUBJECTS_ID;
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
    await removeSubjectEverywhere(general);
    if (currentSubjectId === general.id && subjects.length > 0) {
      currentSubjectId = subjects[0].id;
      localStorage.setItem(CURRENT_SUBJECT_KEY, currentSubjectId);
    }
  }

  let unsubscribeCalendarRealtime = null;
  let accountMigrationWarned = false;
  /** Round 29 : la base Supabase n'a pas encore les colonnes owner_id /
   *  payload — prévient une fois par session (le robot le dit clairement). */
  function warnIfAccountMigrationMissing() {
    if (accountMigrationWarned || !Sync.accountMigrationMissing()) return;
    accountMigrationWarned = true;
    robotAlert(
      "La base Supabase n'est pas encore à jour pour les comptes : exécute supabase/account_scoping_migration.sql dans l'éditeur SQL de Supabase. En attendant, tes fiches restent sur cet appareil."
    );
  }

  async function connectSync() {
    // Round 29 : les données appartiennent au compte — sans compte
    // connecté, rien à synchroniser.
    if (!Sync.isConfigured() || !Sync.currentUid()) return;
    if (unsubscribeRealtime) unsubscribeRealtime();
    if (unsubscribeSubjectsRealtime) unsubscribeSubjectsRealtime();
    if (unsubscribeFoldersRealtime) unsubscribeFoldersRealtime();
    if (unsubscribeDevSettingsRealtime) unsubscribeDevSettingsRealtime();

    // Round 16 : réglages développeur (canal unique, partagé par tout le
    // monde) — récupérés AVANT le reste.
    await syncDevSettingsFromServer();

    await reconcileWithRemote();
    await Sync.flushPending((id) => cards.find((c) => c.id === id));
    // Round 29 : calendrier synchronisé par compte.
    try {
      await reconcileCalendarWithRemote();
    } catch (e) {
      console.warn("Calendrier : synchro impossible", e);
    }
    if (unsubscribeCalendarRealtime) unsubscribeCalendarRealtime();
    unsubscribeCalendarRealtime = Sync.subscribeCalendarRealtime((remote) => {
      if (mergeRemoteCalendarEvent(remote)) {
        if (el("view-calendar") && el("view-calendar").classList.contains("is-active")) renderCalendarEvents();
        refreshHomeEventWarning();
      }
    });
    warnIfAccountMigrationMissing();

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
    subscribeDevSettingsPublicRealtime();

    updateSyncStatus();
  }

  /** Callback de l'abonnement Realtime au canal UNIQUE des réglages
   *  développeur (round 16) — un autre appareil de Stéphane (le seul à
   *  pouvoir écrire, RLS) vient de changer un réglage : on l'adopte tel
   *  quel, sans comparaison de date (il n'y a plus qu'une seule source de
   *  vérité, donc plus de conflit possible à trancher). */
  function handleRemoteDevSettings(remote) {
    // Round 33 : on réapplique les changements locaux pas encore envoyés
    // par-dessus la version reçue (au lieu de les écraser).
    devSyncQueue(async () => {
      if (remote.updatedBy) devSettingsWriterUid = remote.updatedBy;
      const pending = adoptServerDevSettings(remote.payload);
      devSyncStatus.at = new Date();
      devSyncStatus.error = null;
      if (pending) await pushDevSettingsNow(true);
      renderDevSyncStatus();
    });
    return;
    // Bug corrigé (items 1/2, toujours valable) : si l'utilisateur est EN
    // TRAIN de taper dans un champ du mode développeur, reconstruire toute
    // la liste (renderDevView) à cet instant précis lui fait perdre le
    // focus en plein milieu de la frappe — ou, pour le mode nuit, fait
    // clignoter l'état si l'écho de sa propre modification revient juste
    // après l'avoir changé. On saute ce rendu tant qu'un champ de ce
    // panneau a le focus ; il se remettra à jour de toute façon au
    // prochain rendu normal (changement de page, nouvelle modification...).
    const devViewActive = el("view-dev") && el("view-dev").classList.contains("is-active");
    const editingInDevView = document.activeElement && el("view-dev") && el("view-dev").contains(document.activeElement) && document.activeElement.tagName === "INPUT";
    if (devViewActive && !editingInDevView) renderDevView();
  }
  /** (Ré)abonne le canal Realtime unique des réglages développeur —
   *  désabonne d'abord l'ancien abonnement s'il y en avait un, pour ne
   *  jamais en garder deux en parallèle. */
  function subscribeDevSettingsPublicRealtime() {
    if (unsubscribeDevSettingsRealtime) {
      unsubscribeDevSettingsRealtime();
      unsubscribeDevSettingsRealtime = null;
    }
    if (!Sync.isConfigured()) return;
    try {
      unsubscribeDevSettingsRealtime = Sync.subscribePublicDevSettingsRealtime(handleRemoteDevSettings);
    } catch (e) {
      // Best-effort, comme le reste de la synchro temps réel : sans
      // abonnement Realtime, les réglages dev restent quand même à jour
      // au prochain démarrage (syncDevSettingsFromServer).
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

  /** Round 29 : à la première ouverture d'un compte sur cet appareil, si
   *  l'ancienne base commune (d'avant les comptes) contient des fiches, on
   *  propose de les rattacher à ce compte. Acceptées : copiées dans
   *  l'espace du compte (puis synchronisées), et l'ancienne base est
   *  effacée pour qu'aucun autre compte ne les récupère. Refusées : laissées
   *  de côté (proposées au prochain compte qui se connecte ici). */
  async function offerLegacyLocalData() {
    const scope = window.UserScope;
    if (!scope || !scope.uid) return;
    const doneKey = `fiches_legacy_offer_done__u_${scope.uid}`;
    if (scope.rawGet(doneKey) === "1") return;
    const legacy = await DB.readLegacy();
    const realCards = legacy ? legacy.cards.filter((c) => !c.deleted) : [];
    if (!legacy || realCards.length === 0) {
      scope.rawSet(doneKey, "1");
      return;
    }
    const nBoxes = legacy.subjects.filter((x) => !x.deleted).length;
    const ok = await robotConfirm(
      `Cet appareil contient ${realCards.length} fiche${realCards.length > 1 ? "s" : ""} (${nBoxes} boîte${nBoxes > 1 ? "s" : ""}) créée${realCards.length > 1 ? "s" : ""} avant les comptes, rattachée${realCards.length > 1 ? "s" : ""} à aucun compte. Les ajouter à ton compte ?`,
      { okLabel: "Les ajouter", cancelLabel: "Non" }
    );
    scope.rawSet(doneKey, "1");
    if (!ok) return;
    const now = new Date().toISOString();
    // Horodatage frais : ces fiches doivent partir vers le serveur au
    // prochain échange, comme des modifications récentes.
    const touchAll = (list) => list.map((x) => ({ ...x, updatedAt: x.updatedAt || now }));
    await DB.importAll({
      cards: touchAll(legacy.cards),
      subjects: touchAll(legacy.subjects),
      folders: touchAll(legacy.folders),
      ratingLog: legacy.ratingLog,
    });
    // Réglages personnels de l'ancien espace commun -> espace du compte.
    scope.userKeys.forEach((k) => {
      const old = scope.rawGet(k);
      if (old !== null && localStorage.getItem(k) === null) localStorage.setItem(k, old);
      scope.rawRemove(k);
    });
    await DB.deleteLegacy();
    // Les fiches reprises partiront vers le serveur avec le reste (voir
    // reconcileWithRemote : tout ce qui manque côté serveur y est envoyé).
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
    // Round 29 : données d'avant les comptes restées sur l'appareil.
    try {
      await offerLegacyLocalData();
    } catch (e) {
      console.warn("Reprise des anciennes données locales impossible", e);
    }
    await loadSubjects();
    cards = await DB.getAll();
    ratingLog = await DB.getAllRatingLog();
    await migrateOrphanCards();
    await dedupeEmptySubjects();
    await purgeAutoGeneralBoxes();
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
        await purgeAutoGeneralBoxes();
        await reconcileSprintState();
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
    // Round 22, item 4 : attendu (pas "fire-and-forget" comme avant) pour
    // pouvoir appliquer tout de suite après le verrou de connexion
    // obligatoire (voir enforceLoginGate) — sans quoi l'appli serait
    // brièvement utilisable, sans connexion, entre l'affichage de
    // l'accueil et la résolution de cette promesse.
    await initAccountState();
    enforceLoginGate();
    homeEventWarningReady = true;
    refreshHomeEventWarning();
  })();
})();
