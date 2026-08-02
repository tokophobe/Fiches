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
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * newEasiness);
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
