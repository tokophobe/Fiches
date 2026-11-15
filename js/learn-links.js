/* ============================================================
   Fiches — v237 : liens « Pour aller plus loin » (fiche ou boîte).

   Un lien pointe vers un contenu qui existe déjà ailleurs (vidéo,
   animation, page) : darwin ne copie rien. Les vidéos YouTube, Vimeo et
   Dailymotion s'ouvrent dans l'appli, avec le lecteur officiel de la
   plateforme (aucun contournement) ; les autres pages s'ouvrent dans le
   navigateur intégré du téléphone, au-dessus de l'appli.

   Partagé par l'appli et Darwin Admin : window.LearnLinks.
   ============================================================ */
(function () {
  "use strict";
  var MAX_LEN = 500;

  /** Adresse saisie → adresse propre en https, "" si vide, null si
   *  invalide. */
  function normalize(raw) {
    var s = String(raw == null ? "" : raw).trim();
    if (!s) return "";
    if (/\s/.test(s)) return null;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = "https://" + s.replace(/^\/+/, "");
    var u;
    try {
      u = new URL(s);
    } catch (e) {
      return null;
    }
    if (u.protocol === "http:") u.protocol = "https:";
    if (u.protocol !== "https:") return null;
    if (!u.hostname || u.hostname.indexOf(".") < 0) return null;
    if (u.username || u.password) return null;
    var out = u.toString();
    return out.length > MAX_LEN ? null : out;
  }

  function host(u) {
    return u.hostname.replace(/^www\./, "").replace(/^m\./, "");
  }
  /** « 1h2m30s », « 90s », « 90 » → secondes. */
  function seconds(t) {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return Number(t);
    var m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
    if (!m) return 0;
    return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
  }
  /** v295 : 95 → « 1:35 », 3725 → « 1:02:05 ». */
  function clock(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var two = function (n) {
      return (n < 10 ? "0" : "") + n;
    };
    return h ? h + ":" + two(m) + ":" + two(s) : m + ":" + two(s);
  }
  var YT_ID = /^[A-Za-z0-9_-]{6,20}$/;

  /** Ce que l'appli sait faire de ce lien :
   *  { url, host, provider, kind: "video"|"playlist"|"page", embed, label } */
  function info(raw) {
    var url = normalize(raw);
    if (!url) return null;
    var u = new URL(url);
    var h = host(u);
    var res = { url: url, host: h, provider: "", kind: "page", embed: null, label: h };
    var id = "";
    var list = "";
    var start = 0;
    var end = 0;
    if (h === "youtube.com" || h === "music.youtube.com" || h === "youtube-nocookie.com") {
      var p = u.pathname.split("/").filter(Boolean);
      if (p[0] === "watch") id = u.searchParams.get("v") || "";
      else if (p[0] === "shorts" || p[0] === "embed" || p[0] === "live" || p[0] === "v") id = p[1] || "";
      list = u.searchParams.get("list") || "";
      start = seconds(u.searchParams.get("t") || u.searchParams.get("start") || "");
    } else if (h === "youtu.be") {
      id = u.pathname.split("/").filter(Boolean)[0] || "";
      list = u.searchParams.get("list") || "";
      start = seconds(u.searchParams.get("t") || u.searchParams.get("start") || "");
    }
    // v295 : fin d'un extrait (« &end=170 ») ; ignorée si elle n'est pas
    // après le début.
    end = seconds(u.searchParams.get("end") || "");
    if (end <= start) end = 0;
    if (id && YT_ID.test(id)) {
      res.provider = "YouTube";
      res.kind = "video";
      res.ytId = id; // v274 : miniature de la vidéo dans la Librairie
      res.embed = "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&modestbranding=1&playsinline=1&autoplay=1" + (start ? "&start=" + start : "") + (end ? "&end=" + end : "");
      res.label = end ? "Extrait vidéo (" + clock(start) + " → " + clock(end) + ")" : "Vidéo YouTube";
      if (end) {
        res.start = start;
        res.end = end;
      }
      return res;
    }
    if (!id && list && /^[A-Za-z0-9_-]{10,64}$/.test(list)) {
      res.provider = "YouTube";
      res.kind = "playlist";
      res.embed = "https://www.youtube-nocookie.com/embed/videoseries?list=" + list + "&rel=0&modestbranding=1&playsinline=1&autoplay=1";
      res.label = "Vidéos YouTube";
      return res;
    }
    if (h === "vimeo.com" || h === "player.vimeo.com") {
      var vm = /(?:^|\/)(\d{5,12})(?:\/|$)/.exec(u.pathname);
      if (vm) {
        res.provider = "Vimeo";
        res.kind = "video";
        res.embed = "https://player.vimeo.com/video/" + vm[1] + "?dnt=1&autoplay=1";
        res.label = "Vidéo Vimeo";
        return res;
      }
    }
    if (h === "dailymotion.com" || h === "dai.ly") {
      var dm = h === "dai.ly" ? /^\/([A-Za-z0-9]{5,12})/.exec(u.pathname) : /\/video\/([A-Za-z0-9]{5,12})/.exec(u.pathname);
      if (dm) {
        res.provider = "Dailymotion";
        res.kind = "video";
        res.embed = "https://www.dailymotion.com/embed/video/" + dm[1] + "?autoplay=1";
        res.label = "Vidéo Dailymotion";
        return res;
      }
    }
    return res;
  }

  var api = { normalize: normalize, info: info, MAX_LEN: MAX_LEN };
  // v295 : chargeable aussi par les tests (node).
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else window.LearnLinks = api;
})();
