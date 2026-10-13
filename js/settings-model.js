/* ============================================================
   Fiches — modèle des réglages communs (« réglages développeur »).

   Fichier PARTAGÉ entre l'appli Fiches (index.html) et l'appli
   d'administration Darwin Admin (admin/) : valeurs par défaut, libellés,
   banque d'icônes et construction de l'objet complet des réglages à
   partir de ce qui est enregistré sur le serveur (table
   dev_settings_public, ligne « global »). Aucune dépendance au reste de
   l'appli : uniquement des constantes et des fonctions pures.
   ============================================================ */
(function () {
  "use strict";

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
    creations: "pencil",
    reports: "flag",
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
    review: "Réviser", manage: "Organiser mes boîtes de révision", addCard: "Ajouter une fiche",
    creations: "Créer mes propres boîtes de révision",
    reports: "Signalements",
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
    manage: { x: 79.8, y: 59.0, d: 105 },
    // Round 47 : « Créer mes propres boîtes de révision » (ex-« Mes
    // créations de fiches » du hub Gérer mes fiches, supprimé).
    creations: { x: 47.0, y: 73.0, d: 105 },
    // Round 49 : Signalements (visible seulement s'il y en a).
    reports: { x: 80.0, y: 94.0, d: 90 },
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
    // Round 47 : un message par page (bulle « … » partout), modifiable dans
    // le mode développeur.
    "review-hub": ["Choisis comment réviser : les révisions prioritaires préparent tes prochaines échéances (c'est ce que je te conseille), le renforcement fait travailler les boîtes où tu es le plus en retard, et la sélection manuelle te laisse choisir toi-même."],
    "revision-program": ["A ta place, voici ce que je réviserais en priorité : les boîtes de tes prochaines échéances, la plus proche d'abord. Décoche ce que tu ne veux pas réviser."],
    "revision-reinforce": ["Voici tes boîtes, celles sur lesquelles tu es le plus en retard d'abord. La barre montre où tu en es dans l'apprentissage de chacune."],
    review: ["Touche la fiche pour voir la réponse, puis dis-moi si tu la savais. Je m'occupe de te la reposer au bon moment."],
    manage: ["Range ici tes boîtes de révision dans des dossiers. Touche une boîte pour voir son résumé. Pour créer une nouvelle boîte, passe par « Créer mes propres boîtes de révision »."],
    creations: ["Ici, toutes les boîtes que tu as créées. Publie-les dans la Librairie, ou ajoute-les à tes révisions pour les ranger dans l'organisation de tes boîtes."],
    "creation-detail": ["Le résumé de ta boîte : ses fiches, son classement, sa place dans tes révisions. Le bouton + ajoute une fiche."],
    "box-create": ["Donne un nom à ta boîte et classe-la : ce classement servira aux filtres, et sera repris si tu la publies dans la Librairie."],
    "report-card": ["Explique à l'auteur ce qui ne va pas dans cette fiche : il recevra ton message et pourra la corriger."],
    reports: ["Voici les fiches que d'autres utilisateurs t'ont signalées. Corrige-les, écris si besoin à la personne qui les a signalées, puis marque le signalement comme traité : elle en sera informée."],
    "reports-hub": ["Retrouve ici les fiches que tu as signalées à leur auteur, et celles que d'autres t'ont signalées."],
    "reports-sent": ["Les fiches que tu as signalées : tu vois ici quand l'auteur les a corrigées, ce qu'il a changé, et son message."],
    cards: ["Toutes les fiches de cette boîte. Le drapeau signale une fiche à corriger ; la flèche ouvre les autres actions (éditer, déplacer, supprimer)."],
    "new-card": ["Écris la question et la réponse : je te poserai la question et tu me diras si tu connaissais la réponse."],
    stats: ["Tes statistiques : combien de fiches tu révises, et comment tu progresses."],
    calendar: ["Note ici tes échéances (contrôle, interrogation, partiels, bac...) liées à une boîte ou un dossier : je m'en sers pour te préparer les révisions prioritaires."],
    "calendar-event-form": ["Donne un titre et une date à ton échéance, puis choisis les boîtes à réviser pour elle."],
    "calendar-event-detail": ["Le détail de cette échéance et des boîtes à réviser pour elle."],
    sync: ["L'état de la synchronisation de tes données entre tes appareils."],
    account: ["Ton compte : ton nom, ton niveau scolaire et la façon dont tu utilises l'appli."],
    "school-hub": ["Retrouve ici tes classes, la messagerie de tes classes et ton calendrier."],
    classes: ["Choisis ton rôle : élève (tu rejoins une classe avec un code) ou enseignant (tu crées tes classes)."],
    "classes-student": ["Les classes que tu as rejointes. Touche une classe pour voir ses boîtes et ses évènements."],
    "classes-teacher": ["Les classes que tu as créées. Donne leur code à tes élèves pour qu'ils les rejoignent."],
    "classes-join": ["Entre le code que ton enseignant t'a donné pour rejoindre sa classe."],
    "classes-create": ["Donne un nom à ta classe."],
    "class-detail": ["La page de la classe : ses boîtes partagées, ses évènements à venir et la liste des élèves."],
    "class-share": ["Partage une de tes boîtes avec la classe, ou une boîte de la Librairie (seuls les élèves abonnés y auront accès)."],
    subscriptions: ["Bientôt, l'abonnement te donnera accès à toutes les boîtes de la Librairie."],
    messages: ["Une discussion par classe : touche une classe pour lire et écrire les messages."],
    "message-thread": ["Écris ton message en bas de la page : toute la classe le verra."],
    library: ["Ici, tu peux prendre des collections de fiches partagées par d'autres — elles s'ajoutent à tes boîtes, avec cette icône en réseau pour les reconnaître."],
    "library-detail": ["La présentation de cette collection : son auteur, son classement et sa note."],
    "library-cards": ["Un aperçu des fiches de cette collection."],
    "library-share": ["Publie ta boîte dans la Librairie : donne-lui un nom, un classement et des mots clés pour qu'on la trouve facilement."],
    settings: ["Tes réglages : l'apparence des fiches, l'import et l'export de tes boîtes."],
    dev: ["Le mode développeur : les réglages de présentation, communs à tous les utilisateurs."],
    "boite-picker": ["Choisis une boîte ou un dossier dans la liste."],
  };
  // Round 4, partie 2 : intitulés amicaux de chaque page, pour l'éditeur du
  // mode développeur — mêmes clés que DEFAULT_HELP_MESSAGES_BY_VIEW.
  const HELP_VIEW_LABELS = {
    "review-hub": "Réviser (choix)",
    "revision-program": "Révisions prioritaires",
    "revision-reinforce": "Renforcer mes connaissances",
    review: "Réviser (fiches)",
    manage: "Organisation des boîtes de révision",
    creations: "Mes créations de boîtes de révision",
    "creation-detail": "Résumé d'une boîte",
    "box-create": "Créer / classer une boîte",
    "report-card": "Signaler une fiche à son auteur",
    reports: "Signalements reçus",
    "reports-hub": "Signalements (choix)",
    "reports-sent": "Signalements émis",
    cards: "Fiches d'une boîte",
    "new-card": "Nouvelle fiche",
    stats: "Statistiques",
    calendar: "Calendrier",
    "calendar-event-form": "Calendrier — ajouter/modifier un évènement",
    "calendar-event-detail": "Calendrier — détail d'un évènement",
    sync: "Synchronisation",
    account: "Compte",
    "school-hub": "École",
    classes: "Mes classes (choix du rôle)",
    "classes-student": "Classes — Élève",
    "classes-teacher": "Classes — Enseignant",
    "classes-join": "Rejoindre une classe",
    "classes-create": "Créer une classe",
    "class-detail": "Page d'une classe",
    "class-share": "Classe — partager une boîte",
    subscriptions: "Abonnements",
    messages: "Messagerie",
    "message-thread": "Messagerie — discussion",
    library: "Librairie",
    "library-detail": "Librairie — présentation d'une collection",
    "library-cards": "Librairie — fiches d'une collection",
    "library-share": "Librairie — publier une boîte",
    settings: "Réglages",
    dev: "Développeur",
    "boite-picker": "Sélecteur de boîte(s)",
  };

  const DEFAULT_AUTO_ZOOM_REF_WIDTH = 390;
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
    gaugeTopPct: 80, // Round 52 : plus utilisé (ancienne jauge sous la fiche)
    flipDurationSec: 0.7,
    // Round 52 : nombre de fiches à revoir sous la fiche, jauge de la boîte
    // sous le titre, animation de changement de boîte.
    statusTopPct: 77,
    gaugeWidthPx: 160,
    gaugeHeightPx: 10,
    boxChangeAnimSec: 0.6,
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
      // Round 51 : l'ancien score des fiches (jauge à étoiles, réglages
      // cardScore / gaugeColors) a été retiré. Seul réglage gardé : masquer
      // les délais sous les boutons d'évaluation (ex-cardScore.hideReviewScoreInfo).
      reviewInfo: {
        hideDelays:
          parsed.reviewInfo && typeof parsed.reviewInfo.hideDelays === "boolean"
            ? parsed.reviewInfo.hideDelays
            : !!(parsed.cardScore && parsed.cardScore.hideReviewScoreInfo === true),
      },
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
      },
      icons: { ...DEFAULT_ICONS, ...(parsed.icons || {}) },
      // Round 50 : zoom automatique des téléphones (largeur de référence
      // en px, 0 = pas de zoom), commun à tous les appareils — réglé dans
      // l'appli d'administration (avant : réglage propre à chaque appareil).
      autoZoom: {
        refWidth: (() => {
          const v = parsed.autoZoom ? Number(parsed.autoZoom.refWidth) : NaN;
          return Number.isFinite(v) && v >= 0 && v <= 1000 ? Math.round(v) : DEFAULT_AUTO_ZOOM_REF_WIDTH;
        })(),
      },
      // Round 50 : accès aux boîtes de la Librairie. false = tout compte
      // connecté y a accès (en attendant le paiement), sauf compte marqué
      // « sans abonnement » dans l'administration ; true = réservé aux
      // comptes dont l'abonnement est actif (ou à l'essai).
      subscriptionPolicy: {
        enforce: !!(parsed.subscriptionPolicy && parsed.subscriptionPolicy.enforce === true),
      },
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

  const REVIEW_LAYOUT_FIELDS = [
    { key: "cardHeightPct", title: "Hauteur de la fiche", unit: "% de l'écran" },
    { key: "cardWidthPct", title: "Largeur de la fiche", unit: "% de l'écran" },
    { key: "cardTopPct", title: "Position Y du bord haut de la fiche", unit: "% de l'écran" },
    { key: "ratingRowTopPct", title: "Position Y des boutons d'évaluation", unit: "% de l'écran" },
    { key: "scoreInfoTopPct", title: "Position Y des délais sous les boutons", unit: "% de l'écran" },
    { key: "statusTopPct", title: "Position Y du nombre de fiches à revoir", unit: "% de l'écran" },
    { key: "gaugeWidthPx", title: "Largeur de la jauge de la boîte", unit: "px" },
    { key: "gaugeHeightPx", title: "Hauteur de la jauge de la boîte", unit: "px" },
    { key: "flipDurationSec", title: "Temps de retournement de la fiche", unit: "secondes", step: 0.1 },
    { key: "boxChangeAnimSec", title: "Durée de l'animation de changement de boîte", unit: "secondes", step: 0.1 },
  ];

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


  const RATING_COLORS_TITLES = { again: "Encore", hard: "Difficile", good: "Bien", easy: "Facile" };

  window.FichesSettingsModel = {
    DEFAULT_AUTO_ZOOM_REF_WIDTH,
    BG_COLORS_ORDER,
    BG_COLORS_TITLES,
    DEFAULT_APP_BG_COLOR,
    DEFAULT_BG_COLORS,
    DEFAULT_BODY_LOGO,
    DEFAULT_BONUS_PILL_COLOR,
    DEFAULT_CARD_BG_COLOR,
    DEFAULT_CARD_FORM_BG_COLOR,
    DEFAULT_CARD_TEXT_COLOR,
    DEFAULT_CHART_WRAP_BG_COLOR,
    DEFAULT_CONSTRUCTION_ACTIVE_COLOR,
    DEFAULT_DARWIN_LOGO,
    DEFAULT_DARWIN_TEXT,
    DEFAULT_DUE_BAR_COLOR,
    DEFAULT_EMPTY_BAR_COLOR,
    DEFAULT_HELP_MESSAGES_BY_VIEW,
    DEFAULT_HOME_LAYOUT,
    DEFAULT_HOME_LOGO,
    DEFAULT_ICONS,
    DEFAULT_ICON_BANK_CHOICES,
    DEFAULT_MAIN_TEXT_COLOR,
    DEFAULT_NAV_ICONS,
    DEFAULT_NAV_LABELS,
    DEFAULT_NIGHT_BG_COLORS,
    DEFAULT_NIGHT_RATING_BTN_BG_COLOR,
    DEFAULT_NIGHT_TEXT_COLORS_SET,
    DEFAULT_ORG_ICON_BANK_CHOICES,
    DEFAULT_PERS_GAUGE_COLORS,
    DEFAULT_RATING_BTN_BG_COLOR,
    DEFAULT_RATING_COLORS,
    DEFAULT_RATING_ICONS,
    DEFAULT_RATING_LABELS,
    DEFAULT_REVIEW_LAYOUT,
    DEFAULT_REVISION_ALGO_SETTINGS,
    DEFAULT_RICH_EDITOR_BG_COLOR,
    DEFAULT_SHADOWS,
    DEFAULT_SVG_CHART_BG_COLOR,
    DEFAULT_TEXT_COLORS,
    DEFAULT_TEXT_COLORS_SET,
    DEFAULT_TODAY_BAR_COLOR,
    HELP_VIEW_LABELS,
    HOME_LAYOUT_LEGACY_REF_HEIGHT,
    HOME_LAYOUT_LEGACY_REF_WIDTH,
    HOME_LAYOUT_TITLES,
    ICON_LIBRARY,
    LOGO_SHADOW_FILTER,
    PERS_GAUGE_ZONE_LABELS,
    PERS_GAUGE_ZONE_ORDER,
    RATING_COLORS_TITLES,
    REVIEW_LAYOUT_FIELDS,
    REVIEW_LAYOUT_REF_HEIGHT,
    REVIEW_LAYOUT_REF_WIDTH,
    REVISION_ALGO_FIELD_DEFS,
    REVISION_ALGO_RATING_LABELS,
    REVISION_ALGO_RATING_ORDER,
    REVISION_ALGO_VERSION,
    SESSION_MIN_GAP,
    SHADOW_ELEMENTS,
    SPRINT_EVENT_DAY_DELAY_MIN,
    SPRINT_EVENT_HOUR,
    TEXT_COLORS_SET_ORDER,
    TEXT_COLORS_SET_TITLES,
    buildDevSettings,
    buildRevisionAlgoSettings,
    iconSvgMarkup,
    migrateHomeLayoutToPercent,
    revisionAlgoValueError,
  };
})();
