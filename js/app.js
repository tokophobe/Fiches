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

  /* Échelles des histogrammes : `visible` = nombre de colonnes qui tiennent
     sur la largeur de l'écran (calculé dynamiquement à partir de la largeur
     réelle disponible), `total` = nombre de jours réellement chargés dans le
     graphique, sur lesquels on peut ensuite défiler horizontalement. Avant,
     les deux étaient confondus (un seul `days`), ce qui fait qu'à l'échelle
     "3 mois" par exemple, il n'y avait justement que 3 mois de données —
     aucun défilement possible au-delà. */
  const RANGE_CONFIG = {
    15: { visible: 15, total: 60 },     // 15 jours à l'écran, défilement sur 2 mois
    30: { visible: 30, total: 120 },    // 1 mois à l'écran, défilement sur 4 mois
    90: { visible: 90, total: 365 },    // 3 mois à l'écran, défilement sur 1 an
    182: { visible: 180, total: 548 },  // 6 mois à l'écran, défilement sur 1,5 an
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
  const settingTamaFoodValueEl = el("setting-tama-food-value");
  const settingTamaGiftQtyMinEl = el("setting-tama-gift-qty-min");
  const settingTamaGiftQtyMaxEl = el("setting-tama-gift-qty-max");

  /** Appelée après chaque changement d'échéance issu d'une vraie révision
   *  (algorithme SM-2 normal ou mode bonus — pas l'hibernation, qui ne
   *  compte volontairement pas comme une révision). Met à jour le record
   *  personnel de la fiche (conservé pour historique / usages futurs). */
  function trackCardInterval(card, intervalDays) {
    if (!Number.isFinite(intervalDays)) return;
    card.maxIntervalReached = Math.max(card.maxIntervalReached || 0, intervalDays);
  }

  /* ---------------------------------------------------------
     Tamagotchi : un foyer de compagnons qui grandissent tout seuls.

     Chaque compagnon n'a plus qu'UNE seule jauge : sa "vie" (0 → un maximum
     qui grandit avec le stade). Cette vie baisse en continu (-1 point par
     heure, quelle que soit l'appli ouverte ou non — rattrapé au prochain
     lancement). Cycle de stades :

       œuf (20/100) -> poussin qui éclot (30/150) -> poussin (40/200)
       -> chenille (50/250) -> papillon (60/300) -> animal (70/350, espèce
       révélée au hasard et gravée pour toujours dans les "trophées")

     Vie à 0 : le compagnon redescend d'un stade (sauf l'œuf et l'animal,
     qui passent directement en "œuf au plat" 🍳 et disparaissent 1 jour
     après que la personne les a vus dans cet état). Vie au maximum du
     stade : promotion au stade suivant. Plus la vie est haute, plus le
     compagnon est affiché grand ; l'anneau autour de lui va du rouge (vie
     basse) au vert (vie haute), et sa longueur suit le même pourcentage.

     Les cadeaux ne se règlent plus directement sur l'histogramme : les
     toucher les fait simplement atterrir dans une pile "à ouvrir" sur la
     page Tamagotchi. Les ouvrir là-bas tire au sort un œuf (nouveau
     compagnon) ou de la nourriture (un besoin de vie aléatoire, donné à un
     compagnon vivant tiré au hasard) — la probabilité d'œuf chute vite à
     mesure que le foyer grossit (voir `tamaEggProbability`).

     Sur l'histogramme de la page Réviser, il y a en permanence un objectif
     par catégorie (= palier de rareté commune/rare/épique/légendaire) : une
     échéance entre 3 et 15 jours, un palier à atteindre calculé depuis les
     données réelles. Dès qu'il est récolté, un nouveau le remplace aussitôt.
     Vider la pile du jour (0 fiche à revoir) offre un cadeau bonus par
     catégorie. Une journée sans le moindre cadeau donne droit à un cadeau
     de rattrapage le lendemain, cumulable.

     État synchronisé (une ligne JSON par code de synchro, voir js/sync.js) :
     `tamaState` (compagnons, trophées, pile à ouvrir, compteurs) et
     `tamaGoals` (objectifs en cours par matière + catégorie).
  --------------------------------------------------------- */
  const TAMA_STATE_KEY = "fiches_tama_state";
  const TAMA_GOALS_KEY = "fiches_tama_goals";
  const TAMA_FOOD_VALUE_KEY = "fiches_tama_food_value";
  const TAMA_GIFT_QTY_MIN_KEY = "fiches_tama_gift_qty_min";
  const TAMA_GIFT_QTY_MAX_KEY = "fiches_tama_gift_qty_max";

  /** Un très large pool "nourriture et boissons" : n'importe quel emoji de
   *  repas, fruit, boisson chaude ou fraîche peut sortir d'un cadeau. */
  const FOOD_EMOJI_POOL = ["🍎","🍏","🍊","🍋","🍌","🍉","🍇","🍓","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🥕","🌽","🥒","🥦","🍞","🥐","🥖","🧀","🍕","🍔","🍣","🍰","🎂","🍫","🍩","🍯","☕","🍵","🧃","🥤","🥛","🧋","🍶","🫖","🍹","🧉","🫙","🍧","🍦","🍿","🥞","🧇","🥯","🥨","🌮","🌯","🥙","🍜","🍝","🍛","🍱","🍤","🍗","🍖","🥩","🍮","🍬","🍭"];

  /** Les 6 stades du cycle de vie, dans l'ordre. `start` = vie de départ en
   *  arrivant dans ce stade (par le haut comme par le bas), `max` = vie à
   *  atteindre pour passer au suivant, `baseSize` = taille de référence
   *  à l'écran (px), modulée ensuite par le pourcentage de vie du moment. */
  const STAGE_ORDER = ["oeuf", "poussin_oeuf", "poussin", "chenille", "papillon", "animal"];
  const STAGE_DEFS = {
    oeuf: { name: "Œuf", emoji: "🥚", start: 20, max: 100, baseSize: 34 },
    poussin_oeuf: { name: "Poussin (éclosion)", emoji: "🐥", start: 30, max: 150, baseSize: 38 },
    poussin: { name: "Poussin", emoji: "🐤", start: 40, max: 200, baseSize: 42 },
    chenille: { name: "Chenille", emoji: "🐛", start: 50, max: 250, baseSize: 46 },
    papillon: { name: "Papillon", emoji: "🦋", start: 60, max: 300, baseSize: 50 },
    animal: { name: "Animal", emoji: null, start: 70, max: 350, baseSize: 58 },
  };

  /** Noms attribués par l'appli à chaque nouveau compagnon (jamais choisis
   *  par la personne) — un nom différent pour chaque compagnon actuellement
   *  vivant dans le foyer. Plus de 500 noms répartis par thème pour limiter
   *  au maximum les répétitions même avec plusieurs compagnons à la fois. */
  const PET_NAME_POOL = [
    // Gourmandises et sucreries
    "Nougat", "Praline", "Biscotte", "Pixel", "Cannelle", "Griotte", "Réglisse",
    "Câpre", "Nashi", "Pruneau", "Coquelicot", "Chamallow", "Éclair", "Bretzel",
    "Churro", "Wasabi", "Miso", "Sushi", "Fondant", "Praliné", "Marmelade",
    "Guimauve", "Meringue", "Financier", "Sablé", "Cajou", "Pistache",
    "Noisette", "Amande", "Cornichon", "Radis", "Groseille", "Mirabelle",
    "Poivron", "Safran", "Muscade", "Popcorn", "Biscuit", "Caramel", "Sorbet",
    "Nectarine", "Abricot", "Framboise", "Myrtille", "Cassis", "Litchi",
    "Kiwi", "Ananas", "Papaye", "Mangue", "Grenade", "Clémentine",
    "Mandarine", "Kumquat", "Physalis", "Datte", "Figue", "Rhubarbe",
    "Coing", "Nèfle", "Prunelle", "Airelle", "Sureau", "Pamplemousse",
    "Bergamote", "Yuzu", "Combava", "Vanille", "Chocolat", "Nougatine",
    "Calisson", "Berlingot", "Papillote", "Dragée", "Macaron", "Cupcake",
    "Brownie", "Cookie", "Gaufre", "Crêpe", "Beignet", "Pancake", "Muffin",
    "Cannelé", "Kouglof", "Croquant", "Nonnette", "Speculoos", "Panettone",
    "Tiramisu", "Cheesecake", "Flan", "Clafoutis", "Frangipane", "Massepain",
    "Nanan", "Chouquette", "Religieuse", "Paris-Brest", "Baba", "Savarin",
    "Tartelette", "Gourmandise", "Confiserie", "Berlingot2", "Sucette",
    "Guimauve2", "Barbapapa",
    // Épices et aromates
    "Curcuma", "Gingembre", "Cardamome", "Girofle", "Anis", "Fenouil",
    "Basilic", "Thym", "Romarin", "Origan", "Sauge", "Persil", "Ciboulette",
    "Estragon", "Coriandre", "Cumin", "Paprika", "Piment", "Poivre", "Sel",
    "Menthe", "Lavande", "Verveine", "Camomille", "Tilleul", "Hibiscus",
    "Jasmin", "Citronnelle", "Aneth", "Livèche", "Absinthe", "Armoise",
    "Bourrache", "Consoude", "Achillée",
    // Fleurs et plantes
    "Pâquerette", "Pissenlit", "Trèfle", "Chardon", "Bruyère", "Genêt",
    "Mimosa", "Glycine", "Iris", "Tulipe", "Pivoine", "Dahlia", "Bleuet",
    "Violette", "Muguet", "PerceNeige", "Crocus", "Jonquille", "Narcisse",
    "Freesia", "Camélia", "Azalée", "Rhododendron", "Magnolia",
    "Chèvrefeuille", "Clématite", "Anémone", "Renoncule", "Ancolie",
    "Delphinium", "Œillet", "Zinnia", "Cosmos", "Capucine", "Bégonia",
    "Fuchsia", "Géranium", "Hortensia", "Lilas", "Jacinthe", "Amaryllis",
    "Orchidée", "Edelweiss", "Gentiane", "Myosotis", "Digitale", "Volubilis",
    "Belle-de-jour", "Immortelle", "Lotus", "Nénuphar", "Papyrus", "Fougère",
    "Mousse", "Lichen", "Gui", "Houx", "Bambou", "Saule", "Chêne", "Érable",
    "Bouleau", "Sapin", "Cèdre", "Séquoia", "Aubépine", "Prunellier",
    "Sorbier", "Noisetier", "Charme", "Hêtre", "Frêne", "Platane",
    // Minéraux, couleurs et matières douces
    "Opale", "Jade", "Onyx", "Ambre", "Topaze", "Émeraude", "Saphir",
    "Rubis", "Perle", "Nacre", "Cristal", "Quartz", "Grenat", "Corail",
    "Turquoise", "Ivoire", "Argent", "Bronze", "Cuivre", "Étain", "Platine",
    "Acier", "Plume", "Duvet", "Cocon", "Bulle", "Écume", "Rosée", "Brume",
    "Buée", "Flocon", "Grelot", "Ruban", "Pompon", "Volute", "Étincelle",
    "Lueur", "Éclat", "Reflet", "Murmure", "Soupir", "Frisson", "Câlin",
    "Doudou", "Cocotte", "Velours", "Satin", "Soie", "Mousseline", "Dentelle",
    "Organza", "Taffetas", "Cachemire", "Angora", "Mohair", "Feutrine",
    // Petits objets, jouets et lieux
    "Bilboquet", "Toupie", "Origami", "Confetti", "Ballon", "CerfVolant",
    "Marionnette", "Diabolo", "Kaléidoscope", "Boussole", "Lanterne",
    "Lampion", "Carillon", "Girouette", "Moulin", "Nichoir", "Cabane",
    "Grenier", "Terrier", "Nid", "Coquille", "Galet", "Caillou", "Rocher",
    "Ruisseau", "Cascade", "Source", "Étang", "Marais", "Clairière",
    "Sentier", "Chemin", "Vallée", "Colline", "Sommet", "Falaise", "Grotte",
    "Caverne", "Récif", "Lagune", "Archipel", "Presqu'île", "Îlot", "Dune",
    "Oasis", "Mirage", "Horizon", "Méridien", "Zénith", "Aurore", "Crépuscule",
    "Équinoxe", "Solstice", "Comète", "Météore", "Nébuleuse", "Constellation",
    "Satellite", "Astéroïde", "Éclipse", "Firmament",
    // Onomatopées, mots doux et esprits facétieux
    "Bidule", "Trucmuche", "Farfelu", "Zigzag", "Gribouille", "Chatouille",
    "Pagaille", "Cabriole", "Pirouette", "Galipette", "Frimousse", "Bouille",
    "Minois", "Fripon", "Coquin", "Espiègle", "Guilleret", "Rigolo",
    "Loufoque", "Farceur", "Polisson", "Chenapan", "Gredin", "Lutin",
    "Farfadet", "Elfe", "Gnome", "Korrigan", "Follet", "Sylphe", "Ondine",
    "Naïade", "Dryade", "Nymphe", "Sirène", "Griffon", "Phénix", "Pégase",
    "Chimère", "Sphinx", "Hippogriffe", "Kraken", "Yéti", "Farandole",
    "Sarabande", "Ribambelle", "Batifole", "Cabriolet", "Girondin", "Falbala",
    "Tourbillon", "Vadrouille", "Gambade", "Cavalcade", "Sautillon",
    "Trottinette", "Culbute", "Chamboule", "Vagabond", "Baladin", "Troubadour",
    "Ménestrel", "Jongleur", "Acrobate", "Funambule", "Équilibriste",
    "Prestidigitateur", "Illusionniste", "Magicien", "Sorcier", "Enchanteur",
    "Devin", "Oracle", "Augure", "Présage", "Talisman", "Grigri", "Porte-bonheur",
    // Mots doux additionnels et petits êtres
    "Pompette", "Frisette", "Bouclette", "Pétale", "Bourgeon", "Germe",
    "Pousse", "Rameau", "Brindille", "Feuillage", "Ramure", "Racine",
    "Écorce", "Sève", "Nectar", "Pollen", "Etamine", "Corolle", "Calice",
    "Pistil", "Bractée", "Involucre", "Stipule", "Vrille", "Tige", "Chaton",
    "Épi", "Grain", "Semence", "Graine", "Noyau", "Pépin", "Zeste", "Écale",
    "Coque", "Cosse", "Gousse", "Silique", "Baie", "Drupe", "Akène",
    "Samare", "Capsule", "Follicule",
    // Petits objets du quotidien, façon comptine
    "Dé", "Bouton", "Perlette", "Épingle", "Aiguille", "Fil", "Écheveau",
    "Pelote", "Bobine", "Fuseau", "Quenouille", "Métier", "Navette",
    "Tricot", "Crochet", "Ourlet", "Fronce", "Pli", "Volant", "Falbala2",
    "Jabot", "Col", "Manchette", "Empiècement", "Empeigne", "Semelle",
    "Talon", "Boucle", "Lacet", "Cordon", "Ganse", "Passepoil", "Liseré",
    "Galon", "Franges", "Pompon2", "Grelot2", "Sonnette", "Clochette",
    "Cymbale", "Tambourin", "Castagnette", "Maracas", "Xylophone",
    "Harmonica", "Ocarina", "Flûteau", "Pipeau", "Chalumeau",
    // Petites gourmandises salées et pain
    "Croûton", "Biscotte2", "Tartine", "Baguette", "Pain", "Toast",
    "Crouton2", "Croustille", "Gressin", "Fougasse", "Chapata", "Naan",
    "Pita", "Tortilla", "Falafel", "Houmous", "Tzatziki", "Guacamole",
    "Salsa", "Pesto", "Chimichurri", "Vinaigrette", "Rémoulade",
    // Mots-valises et petits noms rigolos
    "Pompon3", "Choupinou", "Croquignou", "Mignoux", "Chouette2", "Câlinou",
    "Doudoux", "Bibou", "Fripouille", "Coquinou", "Câlinet", "Poupoune",
    "Chatoune", "Minoune", "Loulou", "Coco", "Zaza", "Titi", "Pompomette",
    "Câpucine2", "Biboune", "Chouchou", "Pitchoune", "Marmiton", "Bambin",
    "Poupon", "Bambino", "Chérubin", "Angelot", "Séraphin", "Étoilon",
    "Lunette", "Soleillou", "Nuageon", "Plumette", "Ailette", "Papillote2",
    "Cocorico", "Coucou", "Zinzin", "Guili", "Chatouilli", "Rigolette",
    "Farfouille", "Gribouillis", "Barbouille", "Patouille", "Cabosse",
    "Pomponette", "Frimoussette", "Câlinette",
  ];
  const BROKEN_EGG_EMOJI = "🍳";
  const LIFE_DECAY_PER_HOUR = 1;
  const BROKEN_EGG_LINGER_HOURS = 24;
  /** Poids utilisés dans la probabilité d'obtenir un œuf plutôt qu'à manger
   *  (voir tamaEggProbability) : un foyer plein d'œufs/poussins pèse très
   *  lourd, un foyer d'animaux adultes presque rien. */
  const GIFT_EGG_WEIGHTS = { oeuf: 15, poussin_oeuf: 8, poussin: 2, chenille: 1, papillon: 0.7, animal: 0.5 };

  /** Espèces à découvrir au stade "animal" (tirage uniforme, gravé dans les
   *  trophées pour toujours, même si le compagnon disparaît ensuite).
   *  Couvre la quasi-totalité des emoji animaux usuels (mammifères,
   *  oiseaux, mer, reptiles/insectes, créatures fantastiques) — 🐛 et 🦋
   *  sont volontairement exclus : ils désignent déjà les stades de
   *  croissance "chenille"/"papillon", les réutiliser comme espèces finales
   *  aurait prêté à confusion. */
  const SPECIES = [
    { id: "chat", name: "Chat", emoji: "🐱" },
    { id: "chien", name: "Chien", emoji: "🐶" },
    { id: "lapin", name: "Lapin", emoji: "🐰" },
    { id: "renard", name: "Renard", emoji: "🦊" },
    { id: "panda", name: "Panda", emoji: "🐼" },
    { id: "koala", name: "Koala", emoji: "🐨" },
    { id: "lion", name: "Lion", emoji: "🦁" },
    { id: "tortue", name: "Tortue", emoji: "🐢" },
    { id: "pingouin", name: "Pingouin", emoji: "🐧" },
    { id: "poulpe", name: "Poulpe", emoji: "🐙" },
    { id: "dragon", name: "Dragon", emoji: "🐲" },
    { id: "licorne", name: "Licorne", emoji: "🦄" },
    { id: "souris", name: "Souris", emoji: "🐭" },
    { id: "hamster", name: "Hamster", emoji: "🐹" },
    { id: "ours", name: "Ours", emoji: "🐻" },
    { id: "tigre", name: "Tigre", emoji: "🐯" },
    { id: "vache", name: "Vache", emoji: "🐮" },
    { id: "cochon", name: "Cochon", emoji: "🐷" },
    { id: "grenouille", name: "Grenouille", emoji: "🐸" },
    { id: "singe", name: "Singe", emoji: "🐵" },
    { id: "poule", name: "Poule", emoji: "🐔" },
    { id: "oiseau", name: "Oiseau", emoji: "🐦" },
    { id: "poussin", name: "Poussin", emoji: "🐤" },
    { id: "canard", name: "Canard", emoji: "🦆" },
    { id: "aigle", name: "Aigle", emoji: "🦅" },
    { id: "hibou", name: "Hibou", emoji: "🦉" },
    { id: "chauve_souris", name: "Chauve-souris", emoji: "🦇" },
    { id: "loup", name: "Loup", emoji: "🐺" },
    { id: "sanglier", name: "Sanglier", emoji: "🐗" },
    { id: "cheval", name: "Cheval", emoji: "🐴" },
    { id: "abeille", name: "Abeille", emoji: "🐝" },
    { id: "escargot", name: "Escargot", emoji: "🐌" },
    { id: "coccinelle", name: "Coccinelle", emoji: "🐞" },
    { id: "fourmi", name: "Fourmi", emoji: "🐜" },
    { id: "scarabee", name: "Scarabée", emoji: "🪲" },
    { id: "araignee", name: "Araignée", emoji: "🕷️" },
    { id: "scorpion", name: "Scorpion", emoji: "🦂" },
    { id: "serpent", name: "Serpent", emoji: "🐍" },
    { id: "lezard", name: "Lézard", emoji: "🦎" },
    { id: "trex", name: "T-Rex", emoji: "🦖" },
    { id: "sauropode", name: "Dinosaure", emoji: "🦕" },
    { id: "calamar", name: "Calamar", emoji: "🦑" },
    { id: "crevette", name: "Crevette", emoji: "🦐" },
    { id: "homard", name: "Homard", emoji: "🦞" },
    { id: "crabe", name: "Crabe", emoji: "🦀" },
    { id: "poisson_globe", name: "Poisson-globe", emoji: "🐡" },
    { id: "poisson_tropical", name: "Poisson tropical", emoji: "🐠" },
    { id: "poisson", name: "Poisson", emoji: "🐟" },
    { id: "dauphin", name: "Dauphin", emoji: "🐬" },
    { id: "baleine", name: "Baleine", emoji: "🐳" },
    { id: "requin", name: "Requin", emoji: "🦈" },
    { id: "crocodile", name: "Crocodile", emoji: "🐊" },
    { id: "leopard", name: "Léopard", emoji: "🐆" },
    { id: "zebre", name: "Zèbre", emoji: "🦓" },
    { id: "gorille", name: "Gorille", emoji: "🦍" },
    { id: "orang_outan", name: "Orang-outan", emoji: "🦧" },
    { id: "elephant", name: "Éléphant", emoji: "🐘" },
    { id: "mammouth", name: "Mammouth", emoji: "🦣" },
    { id: "hippopotame", name: "Hippopotame", emoji: "🦛" },
    { id: "rhinoceros", name: "Rhinocéros", emoji: "🦏" },
    { id: "dromadaire", name: "Dromadaire", emoji: "🐪" },
    { id: "chameau", name: "Chameau", emoji: "🐫" },
    { id: "girafe", name: "Girafe", emoji: "🦒" },
    { id: "kangourou", name: "Kangourou", emoji: "🦘" },
    { id: "bison", name: "Bison", emoji: "🦬" },
    { id: "buffle", name: "Buffle", emoji: "🐃" },
    { id: "belier", name: "Bélier", emoji: "🐏" },
    { id: "mouton", name: "Mouton", emoji: "🐑" },
    { id: "lama", name: "Lama", emoji: "🦙" },
    { id: "chevre", name: "Chèvre", emoji: "🐐" },
    { id: "cerf", name: "Cerf", emoji: "🦌" },
    { id: "caniche", name: "Caniche", emoji: "🐩" },
    { id: "coq", name: "Coq", emoji: "🐓" },
    { id: "dinde", name: "Dinde", emoji: "🦃" },
    { id: "dodo", name: "Dodo", emoji: "🦤" },
    { id: "paon", name: "Paon", emoji: "🦚" },
    { id: "perroquet", name: "Perroquet", emoji: "🦜" },
    { id: "cygne", name: "Cygne", emoji: "🦢" },
    { id: "flamant", name: "Flamant rose", emoji: "🦩" },
    { id: "colombe", name: "Colombe", emoji: "🕊️" },
    { id: "raton_laveur", name: "Raton laveur", emoji: "🦝" },
    { id: "moufette", name: "Moufette", emoji: "🦨" },
    { id: "blaireau", name: "Blaireau", emoji: "🦡" },
    { id: "castor", name: "Castor", emoji: "🦫" },
    { id: "loutre", name: "Loutre", emoji: "🦦" },
    { id: "paresseux", name: "Paresseux", emoji: "🦥" },
    { id: "rat", name: "Rat", emoji: "🐀" },
    { id: "ecureuil", name: "Écureuil", emoji: "🐿️" },
    { id: "herisson", name: "Hérisson", emoji: "🦔" },
  ];

  function speciesById(id) {
    return SPECIES.find((s) => s.id === id) || null;
  }

  function uidTama() {
    return `tama_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function todayISODate() {
    return startOfDay(new Date()).toISOString().slice(0, 10);
  }

  /** Choisit un nom pour un nouveau compagnon, différent de tous les noms
   *  actuellement portés par les autres compagnons vivants du foyer. Si le
   *  pool est épuisé (beaucoup de compagnons en même temps), on numérote. */
  function pickPetName(existingPets) {
    const used = new Set((existingPets || []).map((p) => p.name).filter(Boolean));
    const free = PET_NAME_POOL.filter((n) => !used.has(n));
    if (free.length > 0) return free[Math.floor(Math.random() * free.length)];
    const base = PET_NAME_POOL[Math.floor(Math.random() * PET_NAME_POOL.length)];
    let i = 2;
    while (used.has(`${base} ${i}`)) i += 1;
    return `${base} ${i}`;
  }

  function makeEgg(existingPets) {
    const now = new Date().toISOString();
    return {
      id: uidTama(),
      name: pickPetName(existingPets),
      stage: "oeuf",
      life: STAGE_DEFS.oeuf.start,
      species: null,
      lastDecayAt: now,
      createdAt: now,
      brokenSeenAt: null,
    };
  }

  function defaultTamaState() {
    const today = todayISODate();
    return {
      pets: [makeEgg([])],
      foods: [], // { id, emoji, total, remaining, x, y, eatenBy, createdAt } — posées dans le pré
      trophies: [], // { species, dateReached }
      pendingGifts: [], // { id, source, createdAt } — à ouvrir sur la page Tamagotchi
      zeroBonusGivenDates: {}, // { subjectId: dateISO }
      lastGiftCollectedDate: null,
      lastBookkeepingDate: today,
      catchupCredits: 0,
      createdAt: new Date().toISOString(),
      // Volontairement très ancien (et non "maintenant") : un foyer neuf
      // créé localement (première ouverture sur un appareil qui n'a encore
      // jamais synchronisé) ne doit JAMAIS être considéré comme "plus
      // récent" qu'un état déjà présent côté serveur lors de la première
      // connexion — sinon ce foyer vide écraserait la vraie progression
      // distante (voir pullAndMergeTama).
      updatedAt: new Date(0).toISOString(),
    };
  }

  let tamaState = null;
  /** { "<subjectId>": { threshold, createdAt } } */
  let tamaGoals = {};
  let tamaSyncUnsub = null;

  /** Écrit l'état en local SANS toucher `updatedAt` — à réserver aux cas où
   *  l'écriture ne reflète pas une "vraie" nouvelle progression (création
   *  du foyer par défaut, migration de forme des données) : la comparer
   *  aux timestamps distants lors de la prochaine synchro doit continuer à
   *  refléter la dernière fois où quelque chose s'est *réellement* passé,
   *  pas la dernière fois où l'appli a juste été ouverte. Pour toute vraie
   *  évolution du foyer (temps qui passe, cadeau, repas...), utiliser
   *  saveTamaState() à la place. */
  function persistTamaStateOnly() {
    localStorage.setItem(TAMA_STATE_KEY, JSON.stringify(tamaState));
  }

  /** Migration depuis les anciens formats (v25 mono-compagnon à besoins, ou
   *  v26 foyer à besoins/inventaire) : on repart d'un foyer neuf plutôt que
   *  d'essayer de transposer des jauges qui n'ont plus de sens ici. */
  function loadTamaState() {
    try {
      const raw = localStorage.getItem(TAMA_STATE_KEY);
      tamaState = raw ? JSON.parse(raw) : null;
    } catch {
      tamaState = null;
    }
    const looksCurrent = tamaState && Array.isArray(tamaState.pets) && tamaState.pets.every((p) => p.stage);
    if (!looksCurrent) {
      tamaState = defaultTamaState();
      persistTamaStateOnly();
    }
    if (!tamaState.trophies) tamaState.trophies = [];
    if (!tamaState.pendingGifts) tamaState.pendingGifts = [];
    if (!tamaState.zeroBonusGivenDates) tamaState.zeroBonusGivenDates = {};
    if (!tamaState.foods) tamaState.foods = [];
    // Migration : compagnons créés avant l'introduction des noms.
    let namedSomeone = false;
    tamaState.pets.forEach((p) => {
      if (!p.name) {
        p.name = pickPetName(tamaState.pets);
        namedSomeone = true;
      }
    });
    if (namedSomeone) persistTamaStateOnly();
  }

  function saveTamaState() {
    tamaState.updatedAt = new Date().toISOString();
    localStorage.setItem(TAMA_STATE_KEY, JSON.stringify(tamaState));
  }

  /** Ne garde que les clés au nouveau format (une par matière). Les clés
   *  composites "subjectId::tier" d'avant la simplification des cadeaux
   *  sont abandonnées : un nouvel objectif propre est recalculé pour
   *  chaque matière au prochain rendu de son histogramme. */
  function sanitizeTamaGoals(goals) {
    const clean = {};
    for (const [key, value] of Object.entries(goals || {})) {
      if (!key.includes("::") && value && typeof value.threshold === "number") {
        clean[key] = value;
      }
    }
    return clean;
  }

  function loadTamaGoals() {
    try {
      const raw = localStorage.getItem(TAMA_GOALS_KEY);
      tamaGoals = sanitizeTamaGoals(raw ? JSON.parse(raw) : {});
    } catch {
      tamaGoals = {};
    }
  }

  function saveTamaGoals() {
    localStorage.setItem(TAMA_GOALS_KEY, JSON.stringify(tamaGoals));
  }

  /** Valeur nutritive : FIXE pour tout aliment (même valeur d'un cadeau à
   *  l'autre) — c'est la quantité d'aliments par cadeau qui varie (voir
   *  ci-dessous), pas leur valeur individuelle. Le but est qu'on puisse
   *  reconnaître d'un coup d'œil qu'un aliment donné "vaut" toujours pareil. */
  function getFoodValue() {
    const v = Number(localStorage.getItem(TAMA_FOOD_VALUE_KEY));
    return Number.isFinite(v) && v > 0 ? v : 15;
  }
  function setFoodValue(v) {
    localStorage.setItem(TAMA_FOOD_VALUE_KEY, String(v));
    touchAppSettingsTimestamp();
    if (Sync.isConfigured()) pushTamaBlob();
  }

  /** Quantité d'aliments déposés dans le pré par un même cadeau de
   *  nourriture : tirée uniformément entre ces deux bornes réglables. */
  function getGiftQtyMin() {
    const v = Number(localStorage.getItem(TAMA_GIFT_QTY_MIN_KEY));
    return Number.isFinite(v) && v >= 1 ? v : 1;
  }
  function getGiftQtyMax() {
    const v = Number(localStorage.getItem(TAMA_GIFT_QTY_MAX_KEY));
    return Number.isFinite(v) && v >= 1 ? v : 3;
  }
  function setGiftQtyMin(v) {
    localStorage.setItem(TAMA_GIFT_QTY_MIN_KEY, String(v));
    touchAppSettingsTimestamp();
    if (Sync.isConfigured()) pushTamaBlob();
  }
  function setGiftQtyMax(v) {
    localStorage.setItem(TAMA_GIFT_QTY_MAX_KEY, String(v));
    touchAppSettingsTimestamp();
    if (Sync.isConfigured()) pushTamaBlob();
  }

  /** Recale un compagnon dont la vie vient de changer : fait redescendre
   *  ou remonter en cascade d'autant de stades que nécessaire (utile après
   *  une longue absence, où plusieurs paliers peuvent être franchis d'un
   *  coup). Révèle l'espèce et grave le trophée en entrant dans "animal". */
  function normalizePetLife(pet) {
    // Cascade vers le bas : vie ≤ 0.
    while (pet.stage !== "broken" && pet.life <= 0) {
      if (pet.stage === "oeuf" || pet.stage === "animal") {
        pet.stage = "broken";
        pet.life = 0;
        pet.brokenSeenAt = null;
        return;
      }
      const idx = STAGE_ORDER.indexOf(pet.stage);
      const overflow = -pet.life;
      pet.stage = STAGE_ORDER[idx - 1];
      pet.life = STAGE_DEFS[pet.stage].max - overflow;
    }
    // Cascade vers le haut : vie ≥ maximum du stade.
    while (pet.stage !== "broken" && pet.stage !== "animal" && pet.life >= STAGE_DEFS[pet.stage].max) {
      const idx = STAGE_ORDER.indexOf(pet.stage);
      const overflow = pet.life - STAGE_DEFS[pet.stage].max;
      pet.stage = STAGE_ORDER[idx + 1];
      pet.life = STAGE_DEFS[pet.stage].start + overflow;
      if (pet.stage === "animal" && !pet.species) {
        const choice = SPECIES[Math.floor(Math.random() * SPECIES.length)];
        pet.species = choice.id;
        tamaState.trophies.push({ species: choice.id, dateReached: new Date().toISOString() });
      }
    }
    if (pet.stage === "animal" && pet.life > STAGE_DEFS.animal.max) pet.life = STAGE_DEFS.animal.max;
  }

  /** Applique la baisse continue de vie (-1/h) depuis la dernière fois
   *  qu'on s'en est occupé, en une fois même après une longue absence. */
  function applyHourlyDecay(pet, nowMs) {
    if (pet.stage === "broken") return;
    const last = new Date(pet.lastDecayAt).getTime();
    const elapsedHours = Math.max(0, (nowMs - last) / 3600000);
    if (elapsedHours <= 0) return;
    pet.life -= elapsedHours * LIFE_DECAY_PER_HOUR;
    pet.lastDecayAt = new Date(nowMs).toISOString();
    normalizePetLife(pet);
  }

  /** Fait avancer l'horloge du foyer : vie de chaque compagnon, disparition
   *  des œufs au plat vus depuis plus de 24h, et comptabilité quotidienne
   *  des cadeaux de rattrapage. Appelée à l'ouverture et à chaque rendu de
   *  la page Tamagotchi. */
  function applyTamaUpkeep() {
    const now = Date.now();
    let changed = false;

    tamaState.pets.forEach((pet) => {
      if (pet.stage !== "broken") {
        applyHourlyDecay(pet, now);
        changed = true;
      }
    });

    const before = tamaState.pets.length;
    tamaState.pets = tamaState.pets.filter((pet) => {
      if (pet.stage === "broken" && pet.brokenSeenAt) {
        const elapsedH = (now - new Date(pet.brokenSeenAt).getTime()) / 3600000;
        return elapsedH < BROKEN_EGG_LINGER_HOURS;
      }
      return true;
    });
    if (tamaState.pets.length !== before) changed = true;

    // Comptabilité des jours sans cadeau -> cadeaux de rattrapage cumulables.
    // Bornée à 30 itérations (30 jours) : si `lastBookkeepingDate` arrivait
    // corrompue ou aberrante (ex. via la synchro, une donnée ancienne ou mal
    // formée), cette boucle pouvait auparavant tourner des dizaines de
    // milliers de fois sans jamais lever d'erreur — un gel silencieux et
    // total du navigateur (écran figé/blanc, aucun message, le
    // "chien de garde" anti-écran-blanc lui-même ne peut pas se déclencher
    // tant que la boucle synchrone ne rend pas la main). Au-delà de 30 jours
    // d'écart, on saute directement à aujourd'hui plutôt que d'accumuler des
    // centaines de cadeaux de rattrapage, ce qui n'aurait de toute façon
    // aucun sens pour l'utilisateur.
    const today = todayISODate();
    let cursor = tamaState.lastBookkeepingDate || today;
    let bookkeepingSteps = 0;
    const MAX_BOOKKEEPING_STEPS = 30;
    while (cursor < today && bookkeepingSteps < MAX_BOOKKEEPING_STEPS) {
      if (tamaState.lastGiftCollectedDate !== cursor) {
        tamaState.catchupCredits = (tamaState.catchupCredits || 0) + 1;
      }
      const d = new Date(cursor + "T00:00:00");
      d.setDate(d.getDate() + 1);
      cursor = d.toISOString().slice(0, 10);
      changed = true;
      bookkeepingSteps += 1;
    }
    tamaState.lastBookkeepingDate = today;
    // Même logique de plafond pour la distribution des cadeaux accumulés :
    // au-delà d'une trentaine, ça n'a plus de sens et ça bloquerait le rendu
    // de la pile de cadeaux (voir renderGiftsTray) pour rien.
    if (tamaState.catchupCredits > MAX_BOOKKEEPING_STEPS) {
      tamaState.catchupCredits = MAX_BOOKKEEPING_STEPS;
    }
    while (tamaState.catchupCredits > 0) {
      tamaState.catchupCredits -= 1;
      tamaState.pendingGifts.push({ id: uidTama(), source: "catchup", createdAt: new Date().toISOString() });
      changed = true;
    }

    if (changed) {
      saveTamaState();
      scheduleTamaPush();
    }
  }

  /** Marque un œuf au plat comme "vu" par la personne : déclenche le compte
   *  à rebours de 24h avant disparition. Appelé au rendu de la page. */
  function markBrokenEggsSeen() {
    let changed = false;
    tamaState.pets.forEach((pet) => {
      if (pet.stage === "broken" && !pet.brokenSeenAt) {
        pet.brokenSeenAt = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) {
      saveTamaState();
      scheduleTamaPush();
    }
  }

  function tamaPetLifeFraction(pet) {
    if (pet.stage === "broken") return 0;
    return Math.max(0, Math.min(1, pet.life / STAGE_DEFS[pet.stage].max));
  }

  function tamaPetDisplayEmoji(pet) {
    if (pet.stage === "broken") return BROKEN_EGG_EMOJI;
    if (pet.stage === "animal") {
      const species = speciesById(pet.species);
      return species ? species.emoji : "❓";
    }
    return STAGE_DEFS[pet.stage].emoji;
  }

  function tamaPetDisplayName(pet) {
    if (pet.stage === "broken") return "Œuf au plat";
    if (pet.stage === "animal") {
      const species = speciesById(pet.species);
      return species ? species.name : "Animal";
    }
    return STAGE_DEFS[pet.stage].name;
  }

  /** Âge du compagnon depuis sa création (l'œuf initial), affiché sous son
   *  nom à la place de l'espèce/du stade (retiré : superflu à côté du nom,
   *  et ça élargissait inutilement l'étiquette — voir tamaPetDisplayName,
   *  toujours utilisée ailleurs, ex. pour l'annonce d'un nouveau cadeau). */
  function tamaPetAgeLabel(pet) {
    const created = pet.createdAt ? new Date(pet.createdAt) : null;
    if (!created || Number.isNaN(created.getTime())) return "";
    const days = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000));
    if (days < 1) return "né aujourd'hui";
    if (days === 1) return "1 jour";
    if (days < 31) return `${days} jours`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "1 mois" : `${months} mois`;
    const years = Math.floor(months / 12);
    return years === 1 ? "1 an" : `${years} ans`;
  }

  function tamaPetAgeLabel(pet) {
    const ms = Date.now() - new Date(pet.createdAt).getTime();
    const hours = ms / 3600000;
    if (hours < 1) return "< 1 h";
    if (hours < 48) return `${Math.floor(hours)} h`;
    return `${Math.floor(hours / 24)} j`;
  }

  /** Probabilité d'obtenir un œuf (plutôt que de la nourriture) à
   *  l'ouverture d'un cadeau : chute très vite à mesure que le foyer
   *  s'agrandit, pondérée par stade (les œufs/poussins comptent plus lourd
   *  que les animaux adultes, déjà "réussis"). */
  function tamaEggProbability() {
    const counts = {};
    STAGE_ORDER.forEach((s) => (counts[s] = 0));
    tamaState.pets.forEach((p) => {
      if (counts[p.stage] !== undefined) counts[p.stage] += 1;
    });
    const weighted = STAGE_ORDER.reduce((acc, s) => acc + (GIFT_EGG_WEIGHTS[s] || 0) * counts[s], 0);
    return 1 / (1 + weighted * weighted);
  }

  /** Capacité de vie restante d'un compagnon avant qu'il n'ait "plus
   *  besoin" de nourriture pour l'instant : illimitée tant qu'il peut
   *  encore grandir/évoluer, plafonnée au maximum du stade une fois au
   *  stade final ("animal") — le surplus de nourriture reste alors
   *  disponible dans le pré pour le prochain compagnon qui la trouvera. */
  function tamaPetCapacity(pet) {
    if (pet.stage === "broken") return 0;
    if (pet.stage === "animal") return Math.max(0, STAGE_DEFS.animal.max - pet.life);
    return Infinity;
  }

  /** Résout le contenu d'un cadeau : un œuf tout neuf, ou une quantité
   *  aléatoire (entre les bornes réglables) d'aliments — chacun à la même
   *  valeur nutritive fixe (également réglable) — posés au hasard dans le
   *  pré. C'est le premier compagnon qui tombera dessus en se baladant qui
   *  les mangera (voir stepTamaSimulation). */
  function resolveTamaGift() {
    const alive = tamaState.pets.filter((p) => p.stage !== "broken");
    const pEgg = alive.length === 0 ? 1 : tamaEggProbability();

    if (Math.random() < pEgg) {
      const pet = makeEgg(tamaState.pets);
      tamaState.pets.push(pet);
      saveTamaState();
      return { type: "egg", petId: pet.id, petName: pet.name };
    }

    const emoji = FOOD_EMOJI_POOL[Math.floor(Math.random() * FOOD_EMOJI_POOL.length)];
    const value = getFoodValue();
    const qtyMin = getGiftQtyMin();
    const qtyMax = Math.max(qtyMin, getGiftQtyMax());
    const qty = qtyMin + Math.floor(Math.random() * (qtyMax - qtyMin + 1));
    const foodIds = [];
    for (let i = 0; i < qty; i++) {
      const food = {
        id: uidTama(),
        emoji,
        total: value,
        remaining: value,
        x: 12 + Math.random() * 76,
        y: 18 + Math.random() * 64,
        eatenBy: null,
        createdAt: new Date().toISOString(),
      };
      tamaState.foods.push(food);
      foodIds.push(food.id);
    }
    saveTamaState();
    return { type: "food", emoji, qty, value, foodIds };
  }

  /** Ouvre un cadeau de la pile "à ouvrir" (page Tamagotchi uniquement). */
  function openPendingTamaGift(giftId) {
    const idx = tamaState.pendingGifts.findIndex((g) => g.id === giftId);
    if (idx < 0) return null;
    tamaState.pendingGifts.splice(idx, 1);
    const result = resolveTamaGift();
    saveTamaState();
    if (Sync.isConfigured()) pushTamaBlob();
    return result;
  }

  /** Objectif-cadeau en cours pour une matière : une seule ligne à
   *  franchir, fixée à 80% de la barre la plus haute au moment où elle est
   *  tracée. `goalBuckets` doit couvrir au moins 16 jours (voir
   *  renderReviewChart), indépendamment du zoom actuellement affiché, pour
   *  que le seuil ne dépende pas de l'échelle regardée sur le moment. */
  function ensureSubjectGoal(subjectId, goalBuckets) {
    if (tamaGoals[subjectId]) return tamaGoals[subjectId];
    const max = Math.max(0, ...goalBuckets.map((b) => b.count));
    const threshold = Math.max(0, Math.floor(max * 0.8));
    // `max` est conservé en plus de `threshold` : il sert à positionner la
    // ligne d'objectif visuellement à 80% de la hauteur RENDUE de la barre
    // la plus haute (voir renderHistogramInto), plutôt qu'à 80% de l'échelle
    // arrondie du graphique (qui donnait une ligne bien plus basse que 80%,
    // ex. 50% de hauteur pour un maximum de 7 fiches).
    const goal = { threshold, max, createdAt: new Date().toISOString() };
    tamaGoals[subjectId] = goal;
    saveTamaGoals();
    return goal;
  }

  /** Récolte l'objectif atteint pour une matière : il part dans la pile "à
   *  ouvrir" du Tamagotchi, et un nouvel objectif est immédiatement
   *  recalculé (nouvelle ligne à 80% du nouveau maximum). */
  function collectSubjectGoal(subjectId) {
    if (!tamaGoals[subjectId]) return;
    delete tamaGoals[subjectId];
    saveTamaGoals();
    tamaState.pendingGifts.push({ id: uidTama(), source: "goal", createdAt: new Date().toISOString() });
    tamaState.lastGiftCollectedDate = todayISODate();
    saveTamaState();
    if (Sync.isConfigured()) pushTamaBlob();
    refreshTamaTabIcon();
  }

  /** Cadeau bonus quand la file du jour tombe à zéro pour la matière en
   *  cours — une seule fois par jour et par matière. */
  function maybeGrantZeroDueBonus(subjectId, dueTodayCount) {
    if (dueTodayCount !== 0) return;
    const today = todayISODate();
    if (tamaState.zeroBonusGivenDates[subjectId] === today) return;
    tamaState.zeroBonusGivenDates[subjectId] = today;
    tamaState.pendingGifts.push({ id: uidTama(), source: "zero-bonus", createdAt: new Date().toISOString() });
    tamaState.lastGiftCollectedDate = today;
    saveTamaState();
    if (Sync.isConfigured()) pushTamaBlob();
    refreshTamaTabIcon();
  }

  /** Un objectif est-il actuellement atteint et prêt à être récolté, dans le
   *  graphique actuellement affiché ? Mis à jour à chaque rendu du mini
   *  histogramme de la page Réviser ; sert au petit point de notification
   *  sur l'onglet Tamagotchi (avec la pile de cadeaux en attente). */
  let reviewChartHasReadyGoal = false;

  /** L'icône de l'onglet Tamagotchi fait double usage : elle affiche
   *  l'humeur du compagnon qui va le moins bien (comme l'ancien bouton du
   *  header, retiré), sauf s'il y a un cadeau en attente — auquel cas
   *  celui-ci prend la priorité, pour rester bien visible. */
  function refreshTamaTabIcon() {
    const iconEl = el("tab-tamagotchi-icon");
    const pending = (tamaState.pendingGifts || []).length;
    if (iconEl) {
      if (pending > 0) {
        iconEl.textContent = "🎁";
      } else {
        const worst = [...tamaState.pets]
          .filter((p) => p.stage !== "broken")
          .sort((a, b) => tamaPetLifeFraction(a) - tamaPetLifeFraction(b))[0];
        iconEl.textContent = worst ? tamaPetDisplayEmoji(worst) : "🥚";
      }
    }
    const tabEl = el("tab-tamagotchi");
    if (tabEl) {
      tabEl.classList.toggle("has-pending-gift", pending > 0);
      tabEl.title = pending > 0 ? "Un cadeau t'attend !" : "Humeur du compagnon";
    }
  }

  /* ---------------------------------------------------------
     Synchro multi-appareils de l'état du foyer (compagnons, trophées, pile
     à ouvrir + objectifs regroupés dans un seul blob JSON, sync.js).
  --------------------------------------------------------- */
  function mergeTamaGoals(remoteGoals) {
    let changed = false;
    for (const [key, remote] of Object.entries(sanitizeTamaGoals(remoteGoals))) {
      if (!tamaGoals[key]) {
        tamaGoals[key] = remote;
        changed = true;
      }
    }
    if (changed) saveTamaGoals();
    return changed;
  }

  /** Réglages persistés localement (jours de rattrapage, mode "encore",
   *  jours avant hibernation, valeur nutritive / quantité des cadeaux) :
   *  embarqués dans le même blob que le foyer Tamagotchi pour voyager d'un
   *  appareil à l'autre — et donc survivre à un changement d'hébergement/URL
   *  entre deux versions livrées, pas seulement au localStorage d'un
   *  appareil. */
  function collectAppSettings() {
    return {
      bonusDays: bonusDaysSettings,
      bonusAgainMode,
      hibernateDays,
      foodValue: getFoodValue(),
      giftQtyMin: getGiftQtyMin(),
      giftQtyMax: getGiftQtyMax(),
      updatedAt: getAppSettingsTimestamp(),
    };
  }

  function applyAppSettings(settings) {
    if (!settings) return;
    if (settings.bonusDays) {
      bonusDaysSettings = settings.bonusDays;
      localStorage.setItem(BONUS_DAYS_KEY, JSON.stringify(bonusDaysSettings));
    }
    if (settings.bonusAgainMode) {
      bonusAgainMode = settings.bonusAgainMode;
      localStorage.setItem(BONUS_AGAIN_MODE_KEY, bonusAgainMode);
    }
    if (Number.isFinite(settings.hibernateDays)) {
      hibernateDays = clampHibernateDays(settings.hibernateDays, DEFAULT_HIBERNATE_DAYS);
      localStorage.setItem(HIBERNATE_DAYS_KEY, String(hibernateDays));
    }
    if (Number.isFinite(settings.foodValue)) localStorage.setItem(TAMA_FOOD_VALUE_KEY, String(settings.foodValue));
    if (Number.isFinite(settings.giftQtyMin)) localStorage.setItem(TAMA_GIFT_QTY_MIN_KEY, String(settings.giftQtyMin));
    if (Number.isFinite(settings.giftQtyMax)) localStorage.setItem(TAMA_GIFT_QTY_MAX_KEY, String(settings.giftQtyMax));
    if (settings.updatedAt) localStorage.setItem(APP_SETTINGS_TS_KEY, settings.updatedAt);
    renderSettingsView();
  }

  /** Vrai tant que cet appareil n'a jamais terminé de premier tirage
   *  ("pull") réussi de l'état distant. Sert de garde-fou au tout premier
   *  branchement de la synchro sur un appareil neuf (ou après effacement
   *  des données) : dans ce cas précis, on adopte TOUJOURS l'état distant
   *  tel quel, sans comparaison de date — un foyer local qui vient d'être
   *  créé localement (donc sans aucun historique réel) ne doit jamais
   *  pouvoir "gagner" face à une vraie progression déjà synchronisée,
   *  même si son horodatage local paraît plus récent. C'est précisément
   *  ce qui provoquait la remise à zéro constatée en connectant un second
   *  appareil : le foyer flambant neuf du second appareil écrasait le
   *  foyer distant, qui écrasait ensuite le premier appareil à son tour. */
  const TAMA_SYNCED_ONCE_KEY = "fiches_tama_synced_once";

  async function pushTamaBlob() {
    if (!Sync.isConfigured()) return false;
    return Sync.pushTamaState({ pet: tamaState, goals: tamaGoals, settings: collectAppSettings() });
  }

  /** La simulation du foyer (déplacement, faim qui décroît, repas...) tourne
   *  en continu toutes les 220ms (TAMA_TICK_MS) — pousser un blob complet à
   *  chaque changement inonderait Supabase et gênerait la synchro des
   *  fiches. `saveTamaState()` seul écrit en local à chaque tick, mais
   *  jusqu'ici RIEN ne renvoyait ensuite ces changements vers le serveur :
   *  décroissance de vie et repas ne se propageaient donc jamais à un autre
   *  appareil (seuls les cadeaux ouverts et les réglages déclenchaient un
   *  envoi). On regroupe donc les changements et on envoie au plus une fois
   *  toutes les quelques secondes. */
  const TAMA_PUSH_THROTTLE_MS = 6000;
  let tamaPushTimer = null;
  let tamaPushPending = false;
  function scheduleTamaPush() {
    if (!Sync.isConfigured()) return;
    tamaPushPending = true;
    if (tamaPushTimer) return; // déjà programmé, se déclenchera bientôt
    tamaPushTimer = setTimeout(() => {
      tamaPushTimer = null;
      if (tamaPushPending) {
        tamaPushPending = false;
        pushTamaBlob();
      }
    }, TAMA_PUSH_THROTTLE_MS);
  }
  /** Envoie immédiatement s'il y a un changement en attente (ex. : la page
   *  passe en arrière-plan) plutôt que d'attendre le prochain palier —
   *  évite de perdre les toutes dernières secondes de simulation. */
  function flushTamaPush() {
    if (tamaPushTimer) {
      clearTimeout(tamaPushTimer);
      tamaPushTimer = null;
    }
    if (tamaPushPending) {
      tamaPushPending = false;
      pushTamaBlob();
    }
  }

  async function pullAndMergeTama() {
    if (!Sync.isConfigured()) return;
    const remote = await Sync.pullTamaState();
    const firstSyncOnThisDevice = !localStorage.getItem(TAMA_SYNCED_ONCE_KEY);

    if (remote) {
      mergeTamaGoals(remote.goals);
      // État du foyer : on garde le plus récemment mis à jour dans son
      // ensemble (compagnons + compteurs forment un tout cohérent, les
      // fusionner champ à champ donnerait un état incohérent) — sauf lors
      // du tout premier branchement sur cet appareil, où le distant gagne
      // toujours (voir note ci-dessus).
      const adoptRemotePet =
        firstSyncOnThisDevice ||
        new Date(remote.pet && remote.pet.updatedAt || 0) > new Date(tamaState.updatedAt || 0);
      if (remote.pet && adoptRemotePet) {
        tamaState = remote.pet;
        if (!tamaState.foods) tamaState.foods = [];
        saveTamaState();
      }
      // Réglages : même logique.
      if (remote.settings) {
        const adoptRemoteSettings =
          firstSyncOnThisDevice ||
          new Date(remote.settings.updatedAt || 0) > new Date(getAppSettingsTimestamp());
        if (adoptRemoteSettings) applyAppSettings(remote.settings);
      }
    }

    localStorage.setItem(TAMA_SYNCED_ONCE_KEY, "1");
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
    questionTextEl.textContent = currentCard.question;
    answerTextEl.textContent = currentCard.answer;
    reviewProgressEl.textContent = "Fiches du jour terminées — révision libre";
    if (enteringBonusMode) {
      showTamaToast("🔁 Fiches du jour terminées — passage en révision libre", false);
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
  function renderHistogramInto(chartEl, emptyEl, wrapEl, pool, rangeKey, maxBarPx, giftOpts) {
    if (!chartEl) return;
    const cfg = RANGE_CONFIG[rangeKey] || { visible: rangeKey, total: rangeKey };
    const days = cfg.total;
    const buckets = computeDueHistogram(pool, days);
    const max = Math.max(0, ...buckets.map((b) => b.count));
    // L'objectif-cadeau n'a de sens que sur les échelles rapprochées
    // (15 / 30 jours) : au-delà, les colonnes sont trop tassées pour rester
    // lisibles avec un repère en plus.
    const showGoals = !!giftOpts && cfg.visible <= 31;
    // Réinitialisé à chaque rendu (y compris quand giftOpts est absent, ex.
    // hors révision libre) pour ne jamais laisser l'icône d'onglet Tamagotchi
    // afficher un "cadeau prêt" qui ne correspond plus au graphique affiché.
    reviewChartHasReadyGoal = false;

    // Un seul objectif par matière, sur une fenêtre fixe de 16 jours,
    // indépendante du zoom / de l'échelle actuellement affichée (sinon le
    // seuil dépendrait de la portion défilée regardée sur le moment).
    let goal = null;
    let goalReady = false;
    if (showGoals) {
      const goalBuckets = computeDueHistogram(pool, 16);
      goal = ensureSubjectGoal(giftOpts.subjectId, goalBuckets);
      goalReady = goalBuckets.every((b) => b.count <= goal.threshold);
      if (goalReady) reviewChartHasReadyGoal = true;
    }

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
      label.textContent = i === 0 ? "Auj." : "";

      col.appendChild(value);
      col.appendChild(bar);
      col.appendChild(label);

      frag.appendChild(col);
    });
    chartEl.appendChild(frag);
    chartEl._prevCounts = buckets.map((b) => b.count);

    // Ligne d'objectif unique, sur toute la largeur du graphique (y compris
    // la partie qui déborde hors écran si l'histogramme est plus large que
    // sa carte) : cliquable dès que toutes les barres sont retombées à son
    // niveau ou en dessous.
    if (goal) {
      // Position de la ligne : 80% de la hauteur à laquelle s'afficherait
      // (sur l'échelle ACTUELLE, scaleMax) une barre valant `goal.max`, le
      // maximum au moment où l'objectif a été fixé — et non 80% de
      // `scaleMax` lui-même, qui est arrondi au multiple de 5 supérieur et
      // fait donc paraître la ligne bien plus basse que 80%.
      const goalRefMax = typeof goal.max === "number" ? goal.max : goal.threshold / 0.8;
      const goalBarPx = (goalRefMax / scaleMax) * maxBarPx;
      const targetPx = Math.min(maxBarPx, Math.max(0, Math.round(goalBarPx * 0.8)));
      const marker = document.createElement(goalReady ? "button" : "div");
      if (goalReady) marker.type = "button";
      marker.className = `chart-goal-bar ${goalReady ? "is-ready" : "is-locked"}`;
      marker.style.bottom = `${targetPx}px`;
      marker.title = goalReady
        ? "Objectif atteint — touche pour envoyer le cadeau sur la page Tamagotchi"
        : `Objectif : faire retomber toutes les barres à ${goal.threshold} fiche(s) ou moins`;

      const emoji = document.createElement("span");
      emoji.className = "chart-goal-bar-gift";
      emoji.textContent = "🎁";
      marker.appendChild(emoji);

      if (goalReady) {
        marker.addEventListener("click", (e) => {
          e.stopPropagation();
          collectSubjectGoal(giftOpts.subjectId);
          if (giftOpts.onCollect) giftOpts.onCollect(marker);
        });
      }
      chartEl.appendChild(marker);
    }

    refreshTamaTabIcon();
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
     Vue Tamagotchi : le foyer en vrac, un anneau de vie par compagnon,
     la pile de cadeaux à ouvrir, et les trophées des animaux obtenus.
  --------------------------------------------------------- */
  const tamaPetsListEl = el("tama-pets-list");
  const tamaGiftsTrayEl = el("tama-gifts-tray");
  const tamaEmptyHintEl = el("tama-empty-hint");

  function tamaPetSizePx(pet) {
    const def = STAGE_DEFS[pet.stage === "broken" ? "oeuf" : pet.stage];
    const frac = pet.stage === "broken" ? 0.5 : tamaPetLifeFraction(pet);
    return Math.round(def.baseSize * (0.7 + 0.6 * frac));
  }

  function tamaPetRingColor(pet) {
    if (pet.stage === "broken") return "hsl(0, 0%, 55%)";
    const frac = tamaPetLifeFraction(pet);
    return `hsl(${Math.round(120 * frac)}, 70%, 45%)`;
  }

  function renderPetTile(pet) {
    const size = tamaPetSizePx(pet);
    const ringSize = size + 14;
    const frac = pet.stage === "broken" ? 1 : tamaPetLifeFraction(pet);
    const color = tamaPetRingColor(pet);

    const tile = document.createElement("div");
    tile.className = "tama-pet-tile";

    const ring = document.createElement("div");
    ring.className = "tama-pet-ring";
    ring.style.width = `${ringSize}px`;
    ring.style.height = `${ringSize}px`;
    ring.style.background = pet.stage === "broken"
      ? "rgba(255,255,255,0.12)"
      : `conic-gradient(${color} ${Math.round(frac * 360)}deg, rgba(255,255,255,0.12) 0)`;

    const inner = document.createElement("div");
    inner.className = "tama-pet-inner";
    inner.style.width = `${size}px`;
    inner.style.height = `${size}px`;
    inner.style.fontSize = `${Math.round(size * 0.62)}px`;
    inner.textContent = tamaPetDisplayEmoji(pet);
    ring.appendChild(inner);
    tile.appendChild(ring);

    const label = document.createElement("span");
    label.className = "tama-pet-label";
    const nameLine = document.createElement("span");
    nameLine.className = "tama-pet-label-name";
    nameLine.textContent = pet.stage === "broken" ? "Œuf au plat" : pet.name;
    label.appendChild(nameLine);
    if (pet.stage !== "broken") {
      const ageLine = document.createElement("span");
      ageLine.className = "tama-pet-label-age";
      ageLine.textContent = tamaPetAgeLabel(pet);
      label.appendChild(ageLine);
    }
    tile.appendChild(label);

    return tile;
  }

  /** Rafraîchit un tama-pet-tile déjà présent dans le DOM sans le recréer
   *  (anneau de vie, émoji, étiquette) — utilisé par la boucle de
   *  simulation à chaque battement, beaucoup moins coûteux qu'un rendu
   *  complet de la vue à chaque frame. */
  function updatePetTileVisual(pet, tile) {
    const size = tamaPetSizePx(pet);
    const ringSize = size + 14;
    const frac = pet.stage === "broken" ? 1 : tamaPetLifeFraction(pet);
    const color = tamaPetRingColor(pet);

    const ring = tile.querySelector(".tama-pet-ring");
    const inner = tile.querySelector(".tama-pet-inner");
    const label = tile.querySelector(".tama-pet-label");
    if (ring) {
      ring.style.width = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.background = pet.stage === "broken"
        ? "rgba(255,255,255,0.12)"
        : `conic-gradient(${color} ${Math.round(frac * 360)}deg, rgba(255,255,255,0.12) 0)`;
    }
    if (inner) {
      inner.style.width = `${size}px`;
      inner.style.height = `${size}px`;
      inner.style.fontSize = `${Math.round(size * 0.62)}px`;
      inner.textContent = tamaPetDisplayEmoji(pet);
    }
    if (label) {
      const nameLine = label.querySelector(".tama-pet-label-name");
      let ageLine = label.querySelector(".tama-pet-label-age");
      if (nameLine) nameLine.textContent = pet.stage === "broken" ? "Œuf au plat" : pet.name;
      if (pet.stage !== "broken") {
        if (!ageLine) {
          ageLine = document.createElement("span");
          ageLine.className = "tama-pet-label-age";
          label.appendChild(ageLine);
        }
        ageLine.textContent = tamaPetAgeLabel(pet);
      } else if (ageLine) {
        ageLine.remove();
      }
    }
  }

  function renderFoodTile(food) {
    const tile = document.createElement("div");
    tile.className = "tama-food";
    tile.dataset.foodId = food.id;

    const emoji = document.createElement("span");
    emoji.className = "tama-food-emoji";
    emoji.textContent = food.emoji;
    tile.appendChild(emoji);

    const track = document.createElement("div");
    track.className = "tama-food-bar-track";
    const fill = document.createElement("div");
    fill.className = "tama-food-bar-fill";
    fill.style.width = `${Math.max(0, Math.min(100, (food.remaining / food.total) * 100))}%`;
    track.appendChild(fill);
    tile.appendChild(track);

    return tile;
  }

  function renderGiftsTray() {
    if (!tamaGiftsTrayEl) return;
    const pending = tamaState.pendingGifts || [];
    tamaGiftsTrayEl.innerHTML = "";
    tamaGiftsTrayEl.hidden = pending.length === 0;
    if (pending.length === 0) return;

    const title = document.createElement("p");
    title.className = "tama-gifts-title";
    title.textContent = `${pending.length} cadeau(x) à ouvrir`;
    tamaGiftsTrayEl.appendChild(title);

    const row = document.createElement("div");
    row.className = "tama-gifts-row";
    pending.forEach((gift) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tama-gift-box";
      btn.textContent = "🎁";
      btn.title = "Touche pour ouvrir";
      btn.addEventListener("click", () => openGiftWithAnimation(gift.id, btn));
      row.appendChild(btn);
    });
    tamaGiftsTrayEl.appendChild(row);
  }

  /** Affiche un message de confirmation bien visible, en bas d'écran.
   *  `big` = variante plus grande / plus longue (ouverture de cadeau). */
  function showTamaToast(message, big) {
    const toast = document.createElement("div");
    toast.className = big ? "tama-toast tama-toast--gift" : "tama-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), big ? 4500 : 3400);
  }

  /** Ouvre un cadeau de la pile et affiche en direct ce qui vient de se
   *  passer (nouvel œuf, ou nourriture posée quelque part dans le pré). */
  function openGiftWithAnimation(giftId, anchorEl) {
    const result = openPendingTamaGift(giftId);
    if (!result) return;

    showTamaToast(
      result.type === "egg"
        ? `🥚 Un nouvel œuf a rejoint le foyer !`
        : `${result.emoji} ${result.qty} aliment${result.qty > 1 ? "s" : ""} (+${result.value} chacun) posé${result.qty > 1 ? "s" : ""} dans le pré — un compagnon va les trouver`,
      true
    );

    renderTamagotchiView();

    // Met brièvement en évidence ce qui vient d'apparaître.
    requestAnimationFrame(() => {
      if (result.type === "egg") {
        const tile = tamaPetsListEl && tamaPetsListEl.querySelector(`[data-pet-id="${result.petId}"]`);
        if (tile) {
          tile.classList.add("tama-pet-tile--flash");
          setTimeout(() => tile.classList.remove("tama-pet-tile--flash"), 900);
        }
      } else {
        (result.foodIds || []).forEach((foodId) => {
          const tile = tamaPetsListEl && tamaPetsListEl.querySelector(`[data-food-id="${foodId}"]`);
          if (tile) {
            tile.classList.add("tama-pet-tile--flash");
            setTimeout(() => tile.classList.remove("tama-pet-tile--flash"), 900);
          }
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Simulation du pré : déplacement continu, lent et aléatoire des
     compagnons, évitement mutuel, et repérage/consommation de la
     nourriture posée par les cadeaux. Ne tourne que pendant que la page
     Tamagotchi est affichée (voir la navigation par onglets).
  --------------------------------------------------------- */
  let tamaSimTimer = null;
  let petRuntime = {}; // id -> { x, y, vx, vy, nextTurnAt } — coordonnées en % du pré
  const TAMA_TICK_MS = 220;
  const TAMA_PEN_MIN_X = 8, TAMA_PEN_MAX_X = 92;
  const TAMA_PEN_MIN_Y = 12, TAMA_PEN_MAX_Y = 88;
  const TAMA_EAT_RATE_PER_SEC = 4; // points de vie transférés par seconde de "contact"

  function ensurePetRuntime(pet) {
    let rt = petRuntime[pet.id];
    if (!rt) {
      rt = {
        x: TAMA_PEN_MIN_X + Math.random() * (TAMA_PEN_MAX_X - TAMA_PEN_MIN_X),
        y: TAMA_PEN_MIN_Y + Math.random() * (TAMA_PEN_MAX_Y - TAMA_PEN_MIN_Y),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        nextTurnAt: Date.now() + 1500 + Math.random() * 3000,
      };
      petRuntime[pet.id] = rt;
    }
    return rt;
  }

  /** Un battement de la simulation : fait avancer chaque compagnon d'un
   *  petit pas, gère l'évitement mutuel, l'attraction douce vers la
   *  nourriture la plus proche, et la consommation ("vases communicants"
   *  entre la barre de nourriture restante et la vie du compagnon). */
  function stepTamaSimulation() {
    if (!tamaState || tamaState.pets.length === 0) return;
    const alive = tamaState.pets.filter((p) => p.stage !== "broken");
    const foods = tamaState.foods || [];
    let dataChanged = false;
    const dtSec = TAMA_TICK_MS / 1000;

    alive.forEach((pet) => {
      const rt = ensurePetRuntime(pet);

      // Change de direction de temps en temps ("aléatoirement").
      if (Date.now() > rt.nextTurnAt) {
        rt.vx = (Math.random() - 0.5) * 0.5;
        rt.vy = (Math.random() - 0.5) * 0.5;
        rt.nextTurnAt = Date.now() + 2000 + Math.random() * 3500;
      }

      // Évitement mutuel ("sans se rentrer dedans") : légère répulsion vis-
      // à-vis de chaque autre compagnon trop proche.
      alive.forEach((other) => {
        if (other === pet) return;
        const ort = ensurePetRuntime(other);
        const dx = rt.x - ort.x, dy = rt.y - ort.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minDist = 14;
        if (dist < minDist) {
          rt.vx += (dx / dist) * 0.06;
          rt.vy += (dy / dist) * 0.06;
        }
      });

      // Légère attraction vers la nourriture disponible la plus proche —
      // sans quoi, dans un pré assez grand, un compagnon pourrait ne
      // jamais croiser la nourriture posée par hasard.
      let nearestFood = null;
      let nearestDist = Infinity;
      foods.forEach((food) => {
        if (food.eatenBy && food.eatenBy !== pet.id) return;
        const dx = food.x - rt.x, dy = food.y - rt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestFood = food;
        }
      });
      if (nearestFood && nearestDist > 3) {
        const dx = nearestFood.x - rt.x, dy = nearestFood.y - rt.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        rt.vx += (dx / dist) * 0.045;
        rt.vy += (dy / dist) * 0.045;
      }

      // Vitesse plafonnée ("lentement").
      const speed = Math.sqrt(rt.vx * rt.vx + rt.vy * rt.vy);
      const maxSpeed = 0.85;
      if (speed > maxSpeed) {
        rt.vx = (rt.vx / speed) * maxSpeed;
        rt.vy = (rt.vy / speed) * maxSpeed;
      }

      rt.x += rt.vx;
      rt.y += rt.vy;
      if (rt.x < TAMA_PEN_MIN_X) { rt.x = TAMA_PEN_MIN_X; rt.vx = Math.abs(rt.vx); }
      if (rt.x > TAMA_PEN_MAX_X) { rt.x = TAMA_PEN_MAX_X; rt.vx = -Math.abs(rt.vx); }
      if (rt.y < TAMA_PEN_MIN_Y) { rt.y = TAMA_PEN_MIN_Y; rt.vy = Math.abs(rt.vy); }
      if (rt.y > TAMA_PEN_MAX_Y) { rt.y = TAMA_PEN_MAX_Y; rt.vy = -Math.abs(rt.vy); }

      // "Tombe dessus" -> mange : la barre de nourriture se vide pendant
      // que la vie du compagnon se remplit d'autant (vases communicants).
      if (nearestFood && nearestDist <= 5) {
        if (!nearestFood.eatenBy) nearestFood.eatenBy = pet.id;
        if (nearestFood.eatenBy === pet.id) {
          const capacity = tamaPetCapacity(pet);
          if (capacity > 0) {
            const bite = Math.min(nearestFood.remaining, capacity, TAMA_EAT_RATE_PER_SEC * dtSec);
            if (bite > 0) {
              pet.life += bite;
              nearestFood.remaining -= bite;
              normalizePetLife(pet);
              dataChanged = true;
            }
          }
          // Nourriture épuisée, ou compagnon repu (déjà au maximum du
          // dernier stade) : elle disparaît — s'il en restait, elle reste
          // disponible dans le pré pour un autre compagnon.
          if (nearestFood.remaining <= 0.05) {
            tamaState.foods = tamaState.foods.filter((f) => f.id !== nearestFood.id);
            dataChanged = true;
          } else if (tamaPetCapacity(pet) <= 0) {
            nearestFood.eatenBy = null;
          }
        }
      }
    });

    // Nettoyage des positions de compagnons disparus (œuf au plat effacé).
    Object.keys(petRuntime).forEach((id) => {
      if (!tamaState.pets.some((p) => p.id === id)) delete petRuntime[id];
    });

    renderPetPositions();
    if (dataChanged) {
      saveTamaState();
      refreshTamaTabIcon();
      scheduleTamaPush();
    }
  }

  /** Applique les positions courantes (calculées par stepTamaSimulation)
   *  aux tuiles déjà présentes dans le DOM, et met à jour les barres de
   *  nourriture — sans reconstruire la liste à chaque battement. */
  function renderPetPositions() {
    if (!tamaPetsListEl) return;
    tamaState.pets.forEach((pet) => {
      const tile = tamaPetsListEl.querySelector(`[data-pet-id="${pet.id}"]`);
      if (!tile) return;
      if (pet.stage === "broken") {
        tile.style.left = "50%";
        tile.style.top = "50%";
      } else {
        const rt = ensurePetRuntime(pet);
        tile.style.left = `${rt.x}%`;
        tile.style.top = `${rt.y}%`;
      }
      updatePetTileVisual(pet, tile);
    });
    (tamaState.foods || []).forEach((food) => {
      const tile = tamaPetsListEl.querySelector(`[data-food-id="${food.id}"]`);
      if (!tile) return;
      tile.style.left = `${food.x}%`;
      tile.style.top = `${food.y}%`;
      const fill = tile.querySelector(".tama-food-bar-fill");
      if (fill) fill.style.width = `${Math.max(0, Math.min(100, (food.remaining / food.total) * 100))}%`;
    });
    // Nourriture épuisée (retirée de tamaState.foods dans stepTamaSimulation) :
    // sa tuile DOM devait auparavant attendre un changement de page pour
    // disparaître, puisque renderPetPositions ne faisait que mettre à jour
    // les tuiles encore présentes dans l'état — jamais retirer celles qui ne
    // le sont plus. On nettoie donc ici toute tuile de nourriture orpheline.
    const liveFoodIds = new Set((tamaState.foods || []).map((f) => f.id));
    tamaPetsListEl.querySelectorAll("[data-food-id]").forEach((tile) => {
      if (!liveFoodIds.has(tile.dataset.foodId)) tile.remove();
    });
  }

  function startTamaSimulation() {
    if (tamaSimTimer) return;
    tamaSimTimer = setInterval(stepTamaSimulation, TAMA_TICK_MS);
  }

  function stopTamaSimulation() {
    if (tamaSimTimer) {
      clearInterval(tamaSimTimer);
      tamaSimTimer = null;
    }
  }

  function renderTamagotchiView() {
    applyTamaUpkeep();
    markBrokenEggsSeen();

    if (tamaPetsListEl) {
      tamaPetsListEl.innerHTML = "";
      const frag = document.createDocumentFragment();
      tamaState.pets.forEach((pet) => {
        const tile = renderPetTile(pet);
        tile.dataset.petId = pet.id;
        const rt = pet.stage === "broken" ? null : ensurePetRuntime(pet);
        tile.style.left = rt ? `${rt.x}%` : "50%";
        tile.style.top = rt ? `${rt.y}%` : "50%";
        frag.appendChild(tile);
      });
      (tamaState.foods || []).forEach((food) => {
        const tile = renderFoodTile(food);
        tile.style.left = `${food.x}%`;
        tile.style.top = `${food.y}%`;
        frag.appendChild(tile);
      });
      tamaPetsListEl.appendChild(frag);
    }

    if (tamaEmptyHintEl) tamaEmptyHintEl.hidden = tamaState.pets.length > 0;

    renderGiftsTray();

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
    // La barre d'objectif-cadeau (et la possibilité de récolter un cadeau)
    // n'a de sens qu'en révision libre (isBonusMode) : c'est seulement là
    // qu'on continue de piocher des fiches déjà à jour pour faire "fondre"
    // l'histogramme sous la ligne. En file du jour normale, on ne passe pas
    // giftOpts pour que la ligne et le mécanisme de cadeau n'apparaissent pas.
    renderHistogramInto(
      reviewChartEl,
      reviewChartEmptyEl,
      reviewChartWrapEl,
      pool,
      reviewChartRangeDays,
      REVIEW_CHART_MAX_BAR_PX,
      isBonusMode ? { subjectId: currentSubjectId, onCollect: showTamaGiftToast } : null
    );
    maybeGrantZeroDueBonus(currentSubjectId, computeDueHistogram(pool, 1)[0].count);
  }

  /** Petit toast qui confirme qu'un cadeau vient de partir dans la pile "à
   *  ouvrir" de la page Tamagotchi, sans changer la mise en page ici. */
  function showTamaGiftToast() {
    refreshTamaTabIcon();
    renderReviewChart(); // fait disparaître le repère tout juste récolté, en affiche un nouveau
    showTamaToast("🎁 Cadeau envoyé vers la page Tamagotchi", false);
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
    if (Sync.isConfigured()) pushTamaBlob();
  }

  function loadBonusAgainMode() {
    const raw = localStorage.getItem(BONUS_AGAIN_MODE_KEY);
    bonusAgainMode = raw === "increment" ? "increment" : DEFAULT_BONUS_AGAIN_MODE;
  }

  function saveBonusAgainMode() {
    localStorage.setItem(BONUS_AGAIN_MODE_KEY, bonusAgainMode);
    touchAppSettingsTimestamp();
    if (Sync.isConfigured()) pushTamaBlob();
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
    if (Sync.isConfigured()) pushTamaBlob();
  }

  function renderSettingsView() {
    if (settingBonusHardEl) settingBonusHardEl.value = bonusDaysSettings.hard;
    if (settingBonusGoodEl) settingBonusGoodEl.value = bonusDaysSettings.good;
    if (settingBonusEasyEl) settingBonusEasyEl.value = bonusDaysSettings.easy;
    if (settingBonusAgainModeEl) settingBonusAgainModeEl.value = bonusAgainMode;
    if (settingHibernateDaysEl) settingHibernateDaysEl.value = hibernateDays;
    if (settingTamaFoodValueEl) settingTamaFoodValueEl.value = getFoodValue();
    if (settingTamaGiftQtyMinEl) settingTamaGiftQtyMinEl.value = getGiftQtyMin();
    if (settingTamaGiftQtyMaxEl) settingTamaGiftQtyMaxEl.value = getGiftQtyMax();
  }

  if (settingTamaFoodValueEl) {
    settingTamaFoodValueEl.addEventListener("change", () => {
      const v = Math.max(1, Math.round(Number(settingTamaFoodValueEl.value)) || 15);
      setFoodValue(v);
      settingTamaFoodValueEl.value = v;
    });
  }
  if (settingTamaGiftQtyMinEl) {
    settingTamaGiftQtyMinEl.addEventListener("change", () => {
      let v = Math.max(1, Math.round(Number(settingTamaGiftQtyMinEl.value)) || 1);
      // Le minimum ne doit jamais dépasser le maximum courant : on relève
      // celui-ci plutôt que de laisser une plage invalide (min > max).
      if (v > getGiftQtyMax()) {
        setGiftQtyMax(v);
        if (settingTamaGiftQtyMaxEl) settingTamaGiftQtyMaxEl.value = v;
      }
      setGiftQtyMin(v);
      settingTamaGiftQtyMinEl.value = v;
    });
  }
  if (settingTamaGiftQtyMaxEl) {
    settingTamaGiftQtyMaxEl.addEventListener("change", () => {
      let v = Math.max(1, Math.round(Number(settingTamaGiftQtyMaxEl.value)) || 3);
      if (v < getGiftQtyMin()) {
        setGiftQtyMin(v);
        if (settingTamaGiftQtyMinEl) settingTamaGiftQtyMinEl.value = v;
      }
      setGiftQtyMax(v);
      settingTamaGiftQtyMaxEl.value = v;
    });
  }

  /** Bouton de dépannage manuel : désinscrit le(s) service worker(s) et vide
   *  le Cache Storage de l'appli, sans toucher IndexedDB (les fiches) ni
   *  localStorage (réglages, foyer Tamagotchi). Sert de filet de sécurité
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
      if (view === "tamagotchi") renderTamagotchiView();
      if (view === "sync") renderSyncView();
      if (view === "settings") renderSettingsView();
      renderDuePill();

      if (view === "tamagotchi") {
        startTamaSimulation();
      } else {
        stopTamaSimulation();
      }
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
    if (tamaSyncUnsub) tamaSyncUnsub();
    Sync.clearConfig();
    // Si un code est reconnecté plus tard (même celui-ci ou un autre), on
    // doit retraiter ça comme un tout premier branchement (voir
    // pullAndMergeTama) plutôt que de comparer des horodatages locaux
    // désormais hors-contexte.
    localStorage.removeItem(TAMA_SYNCED_ONCE_KEY);
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
      const changedGoals = mergeTamaGoals(remoteBlob.goals);
      if (remoteBlob.pet && new Date(remoteBlob.pet.updatedAt || 0) > new Date(tamaState.updatedAt || 0)) {
        tamaState = remoteBlob.pet;
        if (!tamaState.foods) tamaState.foods = [];
        saveTamaState();
      }
      if (remoteBlob.settings && new Date(remoteBlob.settings.updatedAt || 0) > new Date(getAppSettingsTimestamp())) {
        applyAppSettings(remoteBlob.settings);
      }
      if (changedGoals || remoteBlob.pet) {
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

  // Envoie immédiatement tout changement du foyer Tamagotchi en attente
  // (voir scheduleTamaPush) quand l'app passe en arrière-plan ou se ferme,
  // pour ne pas perdre les dernières secondes de simulation (repas,
  // décroissance de vie) côté serveur en cas de fermeture avant le prochain
  // envoi groupé.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushTamaPush();
  });
  window.addEventListener("pagehide", flushTamaPush);

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
    loadTamaState();
    loadTamaGoals();
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
