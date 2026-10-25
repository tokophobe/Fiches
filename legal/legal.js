// darwin — pages légales : bandeau « brouillon » affiché tant qu'il reste
// des cases à compléter (<mark class="todo">), et lien « Retour » vers la
// page précédente quand on vient de l'appli ou du site.
(function () {
  var embedded = /[?&]embed=1/.test(location.search);
  if (embedded) {
    document.documentElement.classList.add("is-embedded");
    // Les liens entre pages légales gardent le mode « dans l'appli ».
    Array.prototype.forEach.call(document.querySelectorAll('a[href$=".html"]'), function (a) {
      var h = a.getAttribute("href");
      if (/^(\.\.\/[a-z]+\/)?[a-z-]+\.html$/.test(h)) a.setAttribute("href", h + "?embed=1");
    });
  }
  var todo = document.querySelectorAll("mark.todo").length;
  var banner = document.getElementById("draft-banner");
  if (banner) {
    banner.hidden = todo === 0;
    var n = banner.querySelector("[data-count]");
    if (n) n.textContent = String(todo);
  }
  var back = document.getElementById("legal-back");
  if (back) {
    back.addEventListener("click", function (e) {
      if (history.length > 1 && document.referrer) {
        e.preventDefault();
        history.back();
      }
    });
  }
})();
