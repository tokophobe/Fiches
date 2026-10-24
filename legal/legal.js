// darwin — pages légales : bandeau « brouillon » affiché tant qu'il reste
// des cases à compléter (<mark class="todo">), et lien « Retour » vers la
// page précédente quand on vient de l'appli ou du site.
(function () {
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
