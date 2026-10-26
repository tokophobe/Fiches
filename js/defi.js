/* ============================================================
   darwin — le défi du jour (QCM), commun au site et à l'appli.

   - 10 questions par jour, 2 de chaque niveau (1 → 5), les mêmes pour
     tout le monde : tirage pseudo-aléatoire initialisé avec la date de
     Paris. L'ordre des réponses A, B, C, D est tiré de la même façon.
   - 3 vies. Mauvaise réponse : une vie en moins, la réponse est grisée et
     la question reposée. Plus de vie : la partie s'arrête.
   - La partie est enregistrée après chaque réponse (on ne peut pas
     recommencer en rechargeant la page).

   API : DarwinDefi.today() → { key, num, label }
         DarwinDefi.questionsFor(key) → 10 questions
         DarwinDefi.load(key, store) / DarwinDefi.mount(conteneur, options)
         DarwinDefi.status(store) → "todo" | "playing" | "done"
   `store` : { get(k), set(k, v) } (localStorage protégé, préfixe de compte…).
   Fichier source : js/defi.js (copié dans site/assets/ par
   tools/build_site_pages.py).
   ============================================================ */
(function () {
  "use strict";
  const N = 10;
  const LIVES = 3;
  const LETTERS = ["A", "B", "C", "D"];
  const FIRST_DAY = Date.UTC(2026, 9, 1); // défi n° 1 = 1er octobre 2026

  function rng(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /** Date du jour à Paris (le défi change à minuit, heure française). */
  function today(now) {
    const d = now || new Date();
    const key = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    const [Y, M, D] = key.split("-").map(Number);
    const num = Math.floor((Date.UTC(Y, M - 1, D) - FIRST_DAY) / 86400000) + 1;
    const label = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" }).format(d);
    return { key, num, label, seed: Y * 10000 + M * 100 + D };
  }
  function previousKey(key) {
    const [Y, M, D] = key.split("-").map(Number);
    return new Date(Date.UTC(Y, M - 1, D) - 86400000).toISOString().slice(0, 10);
  }

  /** Les 10 questions du jour `key`, niveau croissant. */
  function questionsFor(key) {
    const bank = window.DARWIN_DEFI_QUESTIONS || [];
    const [Y, M, D] = key.split("-").map(Number);
    const seed = Y * 10000 + M * 100 + D;
    const out = [];
    for (let level = 1; level <= 5; level++) {
      const pool = bank.filter((q) => q[0] === level);
      const picked = shuffle(pool, rng(seed * 7 + level)).slice(0, 2);
      picked.forEach((q, i) => {
        const r = rng(seed * 13 + level * 3 + i);
        const choices = shuffle([q[3]].concat(q[4]), r);
        out.push({ level, theme: q[1], q: q[2], choices, answer: choices.indexOf(q[3]), more: q[5] || "" });
      });
    }
    return out.slice(0, N);
  }

  /* ---- État d'une partie ----
     { v: 1, cur: n° de la question en cours, lives, wrong: [indices
       grisés de la question en cours], res: [ "ok" | "late" | "fail" ],
       done: bool } */
  const KEY = (k) => `darwin_defi2_${k}`;
  const STREAK = "darwin_defi2_streak";
  function fresh() {
    return { v: 1, cur: 0, lives: LIVES, wrong: [], res: [], done: false };
  }
  function load(key, store) {
    const s = store.get(KEY(key));
    return s && s.v === 1 ? s : fresh();
  }
  function status(store, key) {
    const s = store.get(KEY(key || today().key));
    if (!s || s.v !== 1 || (!s.res.length && !s.wrong.length)) return "todo";
    return s.done ? "done" : "playing";
  }
  function score(s) {
    return s.res.filter((r) => r === "ok" || r === "late").length;
  }
  function streakAfterFinish(store, key) {
    const st = store.get(STREAK) || {};
    if (st.last === key) return st.count || 1;
    const count = st.last === previousKey(key) ? (st.count || 0) + 1 : 1;
    store.set(STREAK, { last: key, count });
    return count;
  }
  function currentStreak(store, key) {
    const st = store.get(STREAK) || {};
    if (st.last === key || st.last === previousKey(key)) return st.count || 0;
    return 0;
  }
  const SQ = { ok: "🟩", late: "🟧", fail: "🟥", none: "⬜" };
  function shareText(s, day) {
    const squares = [];
    for (let i = 0; i < N; i++) squares.push(SQ[s.res[i] || "none"]);
    const hearts = "❤️".repeat(s.lives) + "🖤".repeat(LIVES - s.lives);
    return `Défi darwin n° ${day.num} : ${score(s)}/${N} ${hearts}\n${squares.slice(0, 5).join("")}\n${squares.slice(5).join("")}`;
  }
  function message(s) {
    const n = score(s);
    if (n === N && s.lives === LIVES) return "Sans faute ! Dix sur dix sans perdre une seule vie.";
    if (n === N) return "Dix sur dix ! Le défi est relevé.";
    if (n >= 7) return "Très beau parcours ! Les dernières questions étaient coriaces.";
    if (n >= 4) return "Belle partie ! Tu as passé les premiers niveaux.";
    if (n >= 1) return "C'est un début ! Les réponses de ce défi, tu les sauras demain.";
    return "Aïe ! Mais c'est en se trompant qu'on apprend.";
  }

  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.3 4.5 6 4.5c2.2 0 3.6 1.2 4.4 2.5h3.2c.8-1.3 2.2-2.5 4.4-2.5 3.7 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z"/></svg>';

  /** Monte le défi dans `root`.
   *  options : store, day (today()), onEvent({ type, … }) — types :
   *  "question", "correct", "wrong", "gameover", "finish" ;
   *  actions : [{ label, href | onClick, ghost }] (boutons sous le
   *  résultat) ; nextLabel (texte sous le résultat). */
  function mount(root, options) {
    const o = options || {};
    const store = o.store;
    const day = o.day || today();
    const qs = questionsFor(day.key);
    let s = load(day.key, store);
    // Ordre des réponses propre à chaque joueur (tiré au hasard à la
    // première apparition de la question, puis gardé dans la partie) : la
    // bonne réponse n'est pas à la même lettre pour tout le monde.
    function viewOf(i) {
      const q = qs[i];
      if (!s.orders) s.orders = {};
      let perm = s.orders[i];
      if (!Array.isArray(perm) || perm.length !== q.choices.length) {
        perm = shuffle(q.choices.map((_, k) => k), Math.random);
        s.orders[i] = perm;
        store.set(KEY(day.key), s);
      }
      return Object.assign({}, q, { choices: perm.map((k) => q.choices[k]), answer: perm.indexOf(q.answer) });
    }
    const emit = (type, extra) => o.onEvent && o.onEvent(Object.assign({ type, state: s, day }, extra || {}));
    const save = () => store.set(KEY(day.key), s);
    root.classList.add("ddefi");

    function livesHtml() {
      let h = "";
      for (let i = 0; i < LIVES; i++) h += `<span class="ddefi-heart${i < s.lives ? "" : " is-lost"}">${HEART}</span>`;
      return h;
    }
    function progressHtml() {
      let h = "";
      for (let i = 0; i < N; i++) {
        const r = s.res[i];
        h += `<span class="ddefi-step${r ? ` is-${r}` : ""}${!r && i === s.cur && !s.done ? " is-current" : ""}"></span>`;
      }
      return h;
    }
    function levelHtml(level) {
      let h = "";
      for (let i = 1; i <= 5; i++) h += `<i class="${i <= level ? "is-on" : ""}"></i>`;
      return h;
    }

    function renderQuestion(revealed) {
      const q = viewOf(s.cur);
      const failed = s.res[s.cur] === "fail";
      root.innerHTML = `
        <div class="ddefi-top">
          <span class="ddefi-count">Question ${s.cur + 1}<small> / ${N}</small></span>
          <span class="ddefi-level" title="Niveau ${q.level} sur 5">Niveau <span class="ddefi-dots">${levelHtml(q.level)}</span></span>
          <span class="ddefi-lives" role="img" aria-label="${s.lives} vie${s.lives > 1 ? "s" : ""}">${livesHtml()}</span>
        </div>
        <div class="ddefi-progress" aria-hidden="true">${progressHtml()}</div>
        <div class="ddefi-card">
          <span class="ddefi-theme">${esc(q.theme)}</span>
          <p class="ddefi-q">${esc(q.q)}</p>
          <div class="ddefi-choices" role="group" aria-label="Réponses">
            ${q.choices
              .map((c, i) => {
                const wrong = s.wrong.includes(i);
                const right = revealed && i === q.answer;
                const cls = wrong ? " is-wrong" : right ? " is-right" : "";
                const dis = wrong || revealed ? " disabled" : "";
                return `<button type="button" class="ddefi-choice${cls}" data-i="${i}"${dis}><span class="ddefi-letter">${LETTERS[i]}</span><span class="ddefi-text">${esc(c)}</span></button>`;
              })
              .join("")}
          </div>
          <div class="ddefi-feedback"${revealed ? "" : " hidden"}>
            <p class="ddefi-verdict${failed ? " is-fail" : ""}">${failed ? "Plus de vie ! La bonne réponse était :" : s.wrong.length ? "Bonne réponse, même s'il a fallu t'y reprendre !" : "Bonne réponse !"}</p>
            ${q.more ? `<p class="ddefi-more">${esc(q.more)}</p>` : ""}
            <button type="button" class="ddefi-next">${failed || s.cur === N - 1 ? "Voir mon résultat" : "Question suivante →"}</button>
          </div>
        </div>`;
      if (failed) {
        const v = root.querySelector(".ddefi-verdict");
        v.textContent = `Plus de vie ! La bonne réponse était ${LETTERS[q.answer]} : ${q.choices[q.answer]}.`;
      }
      root.querySelectorAll(".ddefi-choice").forEach((b) => b.addEventListener("click", () => answer(Number(b.dataset.i), b)));
      const next = root.querySelector(".ddefi-next");
      if (next) next.addEventListener("click", goNext);
      if (revealed) next.focus({ preventScroll: true });
      else emit("question", { index: s.cur, question: q });
    }

    function answer(i, btn) {
      const q = viewOf(s.cur);
      if (s.res[s.cur] || s.wrong.includes(i)) return;
      if (i === q.answer) {
        s.res[s.cur] = s.wrong.length ? "late" : "ok";
        save();
        renderQuestion(true);
        emit("correct", { index: s.cur, question: q, firstTry: s.res[s.cur] === "ok" });
        return;
      }
      s.lives -= 1;
      s.wrong.push(i);
      if (s.lives <= 0) {
        s.res[s.cur] = "fail";
        s.done = true;
        save();
        renderQuestion(true);
        emit("gameover", { index: s.cur, question: q });
        return;
      }
      save();
      btn.classList.add("is-wrong", "is-shaking");
      btn.disabled = true;
      root.querySelector(".ddefi-lives").innerHTML = livesHtml();
      const lost = root.querySelectorAll(".ddefi-heart.is-lost");
      if (lost.length) lost[0].classList.add("is-breaking");
      emit("wrong", { index: s.cur, question: q });
    }

    function goNext() {
      if (s.res[s.cur] === "fail" || s.cur >= N - 1) {
        s.done = true;
        save();
        renderResult(true);
        return;
      }
      s.cur += 1;
      s.wrong = [];
      save();
      renderQuestion(false);
    }

    function renderResult(justFinished) {
      const streak = justFinished ? streakAfterFinish(store, day.key) : currentStreak(store, day.key);
      const n = score(s);
      const squares = Array.from({ length: N }, (_, i) => `<span class="ddefi-step${s.res[i] ? ` is-${s.res[i]}` : ""}"></span>`).join("");
      root.innerHTML = `
        <div class="ddefi-result">
          <p class="ddefi-result-day">Défi n° ${day.num}</p>
          <div class="ddefi-big">${n}<small> / ${N}</small></div>
          <div class="ddefi-lives ddefi-lives--big">${livesHtml()}</div>
          <div class="ddefi-progress ddefi-progress--result" aria-hidden="true">${squares}</div>
          <p class="ddefi-msg">${esc(message(s))}</p>
          ${streak > 1 ? `<p class="ddefi-streak">${streak} jours de suite !</p>` : ""}
          <div class="ddefi-actions">
            <button type="button" class="ddefi-btn ddefi-share">Partager mon score</button>
            <p class="ddefi-copied" aria-live="polite"></p>
            ${(o.actions || [])
              .map((a, i) => (a.href ? `<a class="ddefi-btn ddefi-btn--ghost" href="${esc(a.href)}">${esc(a.label)}</a>` : `<button type="button" class="ddefi-btn ddefi-btn--ghost" data-action="${i}">${esc(a.label)}</button>`))
              .join("")}
          </div>
          <p class="ddefi-next-day">${esc(o.nextLabel || "Nouveau défi demain à minuit.")}</p>
        </div>`;
      root.querySelectorAll("[data-action]").forEach((b) => b.addEventListener("click", () => o.actions[Number(b.dataset.action)].onClick()));
      root.querySelector(".ddefi-share").addEventListener("click", async () => {
        const text = shareText(s, day);
        const url = o.shareUrl || "";
        const copied = root.querySelector(".ddefi-copied");
        try {
          if (navigator.share) {
            await navigator.share({ title: "Le défi du jour — darwin", text, url: url || undefined });
            return;
          }
          await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
          copied.textContent = "Copié ! Colle-le dans un message.";
        } catch (e) {
          if (e && e.name === "AbortError") return;
          copied.textContent = text;
        }
      });
      if (justFinished) emit("finish", { score: n, streak });
      else emit("result", { score: n, streak });
    }

    // Reprise : partie finie → résultat ; question déjà répondue → son
    // explication ; sinon la question en cours.
    if (s.done) renderResult(false);
    else renderQuestion(!!s.res[s.cur]);
    return {
      state: () => s,
    };
  }

  /** Stockage localStorage protégé (navigation privée…). `suffix` :
   *  distingue les comptes dans l'appli. */
  function localStore(suffix) {
    const k = (key) => (suffix ? `${key}__${suffix}` : key);
    return {
      get(key) {
        try {
          return JSON.parse(localStorage.getItem(k(key)));
        } catch (e) {
          return null;
        }
      },
      set(key, v) {
        try {
          localStorage.setItem(k(key), JSON.stringify(v));
        } catch (e) {
          /* stockage indisponible */
        }
      },
    };
  }

  window.DarwinDefi = { N, LIVES, today, questionsFor, load, status, score, shareText, mount, localStore, currentStreak };
})();
