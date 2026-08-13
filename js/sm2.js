/**
 * Algorithme SM-2 (SuperMemo 2), tel qu'utilisé historiquement par Anki
 * pour les répétitions "hors apprentissage".
 *
 * Chaque fiche porte trois valeurs :
 *  - easiness   : facteur de facilité (EF), démarre à 2.5, jamais < 1.3
 *  - interval   : intervalle en jours avant la prochaine question
 *  - repetitions: nombre de bonnes réponses consécutives
 *
 * On note la réponse sur une échelle de qualité 0-5 :
 *   0 = à revoir tout de suite (Again)
 *   3 = correct mais difficile (Hard)
 *   4 = correct (Good)
 *   5 = trop facile (Easy)
 */

const SM2_DEFAULTS = Object.freeze({
  easiness: 2.5,
  interval: 0,
  repetitions: 0,
});

const RATING_TO_QUALITY = Object.freeze({
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
});

function createSm2State() {
  return { ...SM2_DEFAULTS };
}

/**
 * Calcule le nouvel état SM-2 d'une fiche après une réponse.
 * @param {{easiness:number, interval:number, repetitions:number}} state
 * @param {'again'|'hard'|'good'|'easy'} rating
 * @returns {{easiness:number, interval:number, repetitions:number, dueDate:string}}
 */
function sm2Next(state, rating) {
  const quality = RATING_TO_QUALITY[rating];
  if (quality === undefined) {
    throw new Error(`Note inconnue: ${rating}`);
  }

  let { easiness, interval, repetitions } = {
    ...SM2_DEFAULTS,
    ...state,
  };

  // Le nouveau facteur de facilité (EF') doit être calculé AVANT l'intervalle :
  // c'est lui qui sert à multiplier l'intervalle précédent (formule SM-2
  // standard). Le calculer après faisait que Difficile/Bien/Facile
  // utilisaient tous l'ancien EF, identique — et donc affichaient le même
  // nombre de jours dès qu'une fiche avait déjà 2 révisions réussies.
  let newEasiness =
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEasiness < 1.3) newEasiness = 1.3;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      // Première bonne réponse : le SM-2 classique fixe ici un intervalle
      // de 1 jour quelle que soit la note (Difficile/Bien/Facile), donc
      // les 3 boutons affichaient la même durée pour toute fiche neuve.
      // On différencie dès la première répétition pour que les boutons
      // aient toujours des durées distinctes.
      interval = quality === 3 ? 1 : quality === 4 ? 2 : 3;
    } else if (repetitions === 2) {
      // Même souci pour la deuxième répétition (6 jours fixes en SM-2
      // classique) : on différencie aussi ce palier.
      interval = quality === 3 ? 4 : quality === 4 ? 6 : 10;
    } else {
      // À partir de la 3e répétition, se contenter de multiplier par le
      // facteur de facilité (EF) donnait des écarts minuscules entre
      // Difficile/Bien/Facile : l'EF varie peu d'une note à l'autre, donc
      // après arrondi, les 3 boutons affichaient souvent le même nombre de
      // jours (ou 1 jour d'écart). On applique des multiplicateurs distincts
      // (à la manière d'Anki : "hard interval" et "easy bonus") en plus de
      // l'EF pour garantir un écart net et croissant entre les 3 notes.
      const HARD_FACTOR = 1.2;
      const EASY_BONUS = 1.3;
      if (quality === 3) {
        interval = Math.round(interval * HARD_FACTOR);
      } else if (quality === 4) {
        interval = Math.round(interval * newEasiness);
      } else {
        interval = Math.round(interval * newEasiness * EASY_BONUS);
      }
    }
  }

  const due = new Date();
  due.setHours(0, 0, 0, 0);
  due.setDate(due.getDate() + interval);

  return {
    easiness: Math.round(newEasiness * 100) / 100,
    interval,
    repetitions,
    dueDate: due.toISOString(),
  };
}

/** Une fiche est due si sa dueDate est aujourd'hui ou dans le passé (ou jamais révisée). */
function isDue(card, now = new Date()) {
  if (!card.dueDate) return true;
  return new Date(card.dueDate).getTime() <= now.getTime();
}

window.SM2 = { createSm2State, sm2Next, isDue, RATING_TO_QUALITY };
