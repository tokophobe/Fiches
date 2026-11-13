/* darwin — fiche jouable du site (accueil, défi du jour, pages par matière).
   DarwinDeck.mount(conteneur, fiches, options) crée la pile, la fiche qui se
   retourne et les quatre visages ; DarwinDeck.robot(conteneur) le robot et sa
   bulle. Une fiche = { theme, q, a, more }. */
(function () {
  const FACES = {
    again: '<circle cx="12" cy="12" r="9"/><path d="M8 16s1.5-2.5 4-2.5 4 2.5 4 2.5"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    hard: '<circle cx="12" cy="12" r="9"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    good: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    easy: '<circle cx="12" cy="12" r="9"/><path d="M7.5 13c0 2 2 4.5 4.5 4.5s4.5-2.5 4.5-4.5z"/><line x1="7.5" y1="13" x2="16.5" y2="13"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  };
  const LABELS = { again: "Je ne savais pas", hard: "Vague idée", good: "Je savais", easy: "Parfait" };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function robot(container, assetsBase) {
    container.innerHTML = `<div class="robot-row"><img class="robot" src="${assetsBase || "assets/"}robot.png" alt="" /><p class="bubble" aria-live="polite"></p></div>`;
    const img = container.querySelector(".robot");
    const bubble = container.querySelector(".bubble");
    return {
      say: (t) => (bubble.textContent = t),
      happy: () => {
        img.classList.remove("is-happy");
        void img.offsetWidth;
        img.classList.add("is-happy");
      },
    };
  }

  /** options : shuffle (true), limit (nombre de fiches, sinon sans fin),
   *  onFlip(fiche), onRate(note, fiche, n), onEnd(), hint (texte sous la question). */
  function mount(container, cards, options) {
    const o = Object.assign({ shuffle: true, hint: "Touche la fiche pour voir la réponse" }, options || {});
    const order = cards.map((_, i) => i);
    if (o.shuffle) order.sort(() => Math.random() - 0.5);
    container.classList.add("deck");
    container.innerHTML = `
      <div class="stack">
        <button type="button" class="card" aria-label="Retourner la fiche">
          <span class="face front">
            <span class="kind"><span>Question</span><span class="theme" data-f="theme"></span></span>
            <span class="text" data-f="q"></span>
            <span class="sub">${esc(o.hint)}</span>
          </span>
          <span class="face back">
            <span class="kind"><span>Réponse</span><span class="theme" data-f="theme"></span></span>
            <span class="text" data-f="a"></span>
            <span class="more" data-f="more"></span>
            <span class="sub">Alors, tu savais ?</span>
          </span>
        </button>
      </div>
      <div class="stamps" role="group" aria-label="Évaluer ta réponse">
        ${["again", "hard", "good", "easy"]
          .map((r) => `<button type="button" class="stamp stamp--${r}" data-r="${r}" aria-label="${LABELS[r]}" title="${LABELS[r]}" disabled><svg viewBox="0 0 24 24">${FACES[r]}</svg></button>`)
          .join("")}
      </div>`;
    const card = container.querySelector(".card");
    const stamps = [...container.querySelectorAll(".stamp")];
    let pos = 0;
    let busy = false;
    let done = false;
    const current = () => cards[order[pos % order.length]];
    function fill() {
      const c = current();
      container.querySelectorAll('[data-f="theme"]').forEach((n) => (n.textContent = c.theme || ""));
      container.querySelector('[data-f="q"]').textContent = c.q;
      container.querySelector('[data-f="a"]').textContent = c.a;
      container.querySelector('[data-f="more"]').textContent = c.more || "";
    }
    let seenAnswer = false;
    /* Toucher la fiche la retourne ; la toucher encore revient à la
       question, comme dans l'appli. Les visages restent actifs une fois la
       réponse vue. */
    function flip() {
      if (busy || done) return;
      if (card.classList.contains("is-flipped")) {
        card.classList.remove("is-flipped");
        return;
      }
      card.classList.add("is-flipped");
      stamps.forEach((s) => (s.disabled = false));
      if (!seenAnswer && o.onFlip) o.onFlip(current());
      seenAnswer = true;
    }
    function rate(r) {
      if (busy || done || !seenAnswer) return;
      busy = true;
      const c = current();
      stamps.forEach((s) => (s.disabled = true));
      pos += 1;
      if (o.onRate) o.onRate(r, c, pos);
      if (o.limit && pos >= o.limit) {
        done = true;
        busy = false;
        if (o.onEnd) o.onEnd();
        return;
      }
      card.classList.add("is-leaving");
      setTimeout(() => {
        card.classList.remove("is-leaving", "is-flipped");
        seenAnswer = false;
        card.classList.add("is-entering");
        fill();
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            card.classList.remove("is-entering");
            busy = false;
          })
        );
      }, 380);
    }
    card.addEventListener("click", flip);
    stamps.forEach((s) => s.addEventListener("click", () => rate(s.dataset.r)));
    fill();
    return { flip, rate };
  }

  window.DarwinDeck = { mount, robot, FACES };
})();
