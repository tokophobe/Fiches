/* ============================================================
   darwin — algorithme de révision (v252).

   Toute la logique de calcul, sans rien d'autre : pas d'écran, pas de
   stockage, pas de date « cachée » (l'heure courante est toujours passée
   en paramètre). C'est ce qui permet de la vérifier par des tests
   automatiques (dossier tests/, voir tests/README.md).

   Règles décrites dans docs/SPECIFICATION.md, §4. Toutes les durées sont
   en MINUTES. Notes : 0 = je ne sais pas, 1 = vague idée, 2 = je sais,
   3 = parfaitement.

   Utilisé par js/app.js (window.RevisionAlgo) et par les tests (Node).
   ============================================================ */
(function (root) {
  "use strict";

  const MINUTES_PER_DAY = 1440;

  /** Date "AAAA-MM-JJ" -> 8 h (heure locale) ce jour-là. */
  function eventReferenceTime(dateStr, eventHour) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d, eventHour, 0, 0, 0);
  }
  /** Date "AAAA-MM-JJ" -> minuit le lendemain (fin de l'échéance). */
  function dayAfter(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  }

  /** Temps écoulé (minutes) depuis la dernière interrogation — 0 pour une
   *  fiche jamais interrogée. */
  function elapsedMinutes(card, now) {
    if (!card.lastReviewed) return 0;
    return Math.max(0, (now.getTime() - new Date(card.lastReviewed).getTime()) / 60000);
  }

  /** Mode « fond » : (DD − TE) + TE × coefficient, borné entre le plancher
   *  et le plafond de la note. */
  function fondDelayMinutes(card, idx, settings, now) {
    const dd = typeof card.dd === "number" && Number.isFinite(card.dd) ? Math.max(0, card.dd) : 0;
    const te = elapsedMinutes(card, now);
    const raw = dd - te + te * (settings.coefFond[idx] || 0);
    return Math.min(settings.plafondMin[idx], Math.max(settings.plancherMin[idx], raw));
  }

  /** Nouveau délai et champs à fusionner dans la fiche après la note
   *  d'indice `idx` (0 à 3).
   *  - `ev` : échéances à venir de la boîte ({ next, last }, dates
   *    "AAAA-MM-JJ"), ou null (mode fond) ;
   *  - `opts` : { eventHour, eventDayDelayMin } (8 h et 30 min par défaut). */
  function computeNext(card, idx, settings, now, ev, opts) {
    const o = opts || {};
    const eventHour = typeof o.eventHour === "number" ? o.eventHour : 8;
    const eventDayDelayMin = typeof o.eventDayDelayMin === "number" ? o.eventDayDelayMin : 30;
    if (!(idx >= 0 && idx <= 3)) idx = 0;
    const fond = fondDelayMinutes(card, idx, settings, now);
    let ndi = fond;
    let mode = "fond";
    if (ev) {
      mode = "sprint";
      const dpEch = (eventReferenceTime(ev.next, eventHour).getTime() - now.getTime()) / 60000;
      const coef = settings.coefSprint[idx];
      let sprint;
      if (dpEch <= 0) sprint = eventDayDelayMin;
      else if (coef > 1) sprint = dpEch - dpEch / coef;
      else sprint = fond;
      ndi = Math.min(sprint, fond);
    }
    ndi = Math.max(1, ndi);
    const due = new Date(now.getTime() + ndi * 60000);
    const out = {
      dd: Math.round(ndi * 100) / 100,
      interval: Math.max(0, Math.round(ndi / MINUTES_PER_DAY)),
      deadlineDaysRaw: Math.round((ndi / MINUTES_PER_DAY) * 1000) / 1000,
      dueDate: due.toISOString(),
      lastRating: idx,
      mode,
    };
    if (ev && !card.inSprint) {
      // Entrée en sprint au moment de la note : on mémorise le délai d'avant.
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

  /** Rapprochement d'une fiche avec l'agenda (entrée / sortie de sprint).
   *  Renvoie les champs à modifier, ou null si rien ne change.
   *  `lastRatingIdx` : dernière note de la fiche (0 à 3). */
  function sprintUpdate(card, ev, settings, now, lastRatingIdx) {
    const nowIso = now.toISOString();
    if (ev) {
      if (!card.inSprint) {
        const upd = { inSprint: true, ddBeforeSprint: card.dd > 0 ? card.dd : null, sprintNext: ev.next, sprintUntil: ev.last };
        if (!card.dueDate || new Date(card.dueDate) > now) upd.dueDate = nowIso;
        return upd;
      }
      if (card.sprintNext !== ev.next || card.sprintUntil !== ev.last) {
        const upd = { sprintNext: ev.next, sprintUntil: ev.last };
        // Nouvelle échéance plus proche que celle connue : tout de suite.
        if ((!card.sprintNext || ev.next < card.sprintNext) && (!card.dueDate || new Date(card.dueDate) > now)) {
          upd.dueDate = nowIso;
        }
        return upd;
      }
      return null;
    }
    if (!card.inSprint) return null;
    // Plus aucune échéance : retour en fond, à partir de la fin de la
    // dernière échéance (le lendemain de sa date).
    const end = card.sprintUntil ? dayAfter(card.sprintUntil) : now;
    const base = end < now ? end : now;
    const idx = lastRatingIdx >= 0 && lastRatingIdx <= 3 ? lastRatingIdx : 0;
    const delay = typeof card.ddBeforeSprint === "number" && card.ddBeforeSprint > 0 ? card.ddBeforeSprint : settings.plancherMin[idx];
    return {
      inSprint: false,
      ddBeforeSprint: null,
      sprintNext: null,
      sprintUntil: null,
      dd: delay,
      interval: Math.max(0, Math.round(delay / MINUTES_PER_DAY)),
      dueDate: new Date(base.getTime() + delay * 60000).toISOString(),
    };
  }

  /** Prochaine fiche d'une séance parmi `pool` :
   *  1. les fiches dues (la plus en retard d'abord) ;
   *  2. les fiches notées 0 ou 1 dans la séance, pas encore revues deux fois ;
   *  3. les autres, par date prévue.
   *  Au moins `minGap` autres fiches entre deux passages d'une même fiche
   *  (ou toutes les autres s'il y en a moins).
   *  `session` : { seen: Map id -> passages, low: Set d'ids, recent: [ids] }. */
  function pickNextSessionCard(pool, session, now, minGap) {
    if (!pool || pool.length === 0) return null;
    const dueTime = (c) => (c.dueDate ? new Date(c.dueDate).getTime() : 0);
    const gap = Math.min(minGap, pool.length - 1);
    const blocked = new Set(gap > 0 ? session.recent.slice(-gap) : []);
    let candidates = pool.filter((c) => !blocked.has(c.id));
    if (candidates.length === 0) candidates = pool;
    const t = now.getTime();
    const tier = (c) => {
      if (dueTime(c) <= t) return 0;
      if (session.low.has(c.id) && (session.seen.get(c.id) || 0) < 2) return 1;
      return 2;
    };
    let best = null;
    let bestTier = 9;
    let bestDue = Infinity;
    candidates.forEach((c) => {
      const ti = tier(c);
      const d = dueTime(c);
      if (ti < bestTier || (ti === bestTier && d < bestDue)) {
        best = c;
        bestTier = ti;
        bestDue = d;
      }
    });
    return best;
  }

  const api = { eventReferenceTime, dayAfter, elapsedMinutes, fondDelayMinutes, computeNext, sprintUpdate, pickNextSessionCard };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.RevisionAlgo = api;
})(typeof window !== "undefined" ? window : globalThis);
