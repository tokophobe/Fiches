#!/usr/bin/env python3
"""Génère les pages publiques « Fiches de révision — <matière> <niveau> »
du site (site/revision/), à partir des boîtes de la Librairie
(packs/bibliotheque.json), ainsi que la page d'index et site/sitemap.xml.

Usage (depuis la racine du dépôt) :  python3 tools/build_site_pages.py

À relancer après chaque mise à jour du pack. Tant que le site n'est pas
lancé, NOINDEX = True (pages non indexées) ; à la mise en ligne, passer à
False et renseigner BASE_URL (adresse définitive du site).
"""
import html
import json
import os
import re
import unicodedata
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.path.join(ROOT, "packs", "bibliotheque.json")
OUT = os.path.join(ROOT, "site", "revision")
SITEMAP = os.path.join(ROOT, "site", "sitemap.xml")

NOINDEX = True
BASE_URL = "https://exemple.fr/"  # à remplacer par l'adresse définitive du site
SAMPLE_CARDS = 12  # fiches jouables par page

LEVELS = [
    # (valeur dans le pack, slug, libellé, cycle)
    ("CP", "cp", "CP", "Primaire"),
    ("CE1", "ce1", "CE1", "Primaire"),
    ("CE2", "ce2", "CE2", "Primaire"),
    ("CM1", "cm1", "CM1", "Primaire"),
    ("CM2", "cm2", "CM2", "Primaire"),
    ("6ème", "6e", "6e", "Collège"),
    ("5ème", "5e", "5e", "Collège"),
    ("4ème", "4e", "4e", "Collège"),
    ("3ème", "3e", "3e", "Collège"),
    ("2nde", "seconde", "seconde", "Lycée"),
    ("1ère", "premiere", "1re", "Lycée"),
    ("terminale", "terminale", "terminale", "Lycée"),
]
LEVEL = {v: (slug, label, cycle) for v, slug, label, cycle in LEVELS}
LEVEL_ORDER = [v for v, *_ in LEVELS]
ACRONYMS = {"SVT", "EMC", "SES", "NSI", "HGGSP", "HLP", "SNT", "LLCER", "DGEMC"}


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def subject_title(m):
    return m if m in ACRONYMS else m[:1].upper() + m[1:]


def de(m):
    """« de mathématiques », « d'anglais », « d'EMC »."""
    first = m[:1].lower()
    return ("d'" if first in "aeéèêiouh" else "de ") + (m if m in ACRONYMS else m)


def en(level_label):
    return f"en {level_label}"


def plain(s):
    s = re.sub(r"<br\s*/?>", "\n", s or "", flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()


def esc(s):
    return html.escape(s or "", quote=True)


def page(title, description, body, depth=1, extra_head=""):
    up = "../" * depth
    robots = '<meta name="robots" content="noindex, nofollow" />\n' if NOINDEX else ""
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
{robots}<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}" />
<meta property="og:title" content="{esc(title)}" />
<meta property="og:description" content="{esc(description)}" />
<meta property="og:image" content="{up}assets/robot.png" />
<link rel="icon" href="{up}../icons/icon-192.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="{up}assets/site.css" />
<style>
  .crumbs {{ font-size: 15px; color: var(--slate); margin: 0 0 12px; }}
  .crumbs a {{ color: var(--slate); }}
  .subject-hero {{ display: grid; grid-template-columns: 1fr 1fr; column-gap: 40px; align-items: center; padding: 6px 0 56px; grid-template-areas: "title play" "copy play"; }}
  .sh-title {{ grid-area: title; align-self: end; }}
  .sh-copy {{ grid-area: copy; align-self: start; }}
  .subject-hero .play {{ grid-area: play; }}
  .facts {{ display: flex; gap: 28px; margin: 6px 0 26px; }}
  .facts b {{ display: block; font-size: 34px; line-height: 1; color: var(--sky); }}
  .facts span {{ font-size: 15px; color: var(--slate); }}
  .boxes {{ list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }}
  .boxes li {{ background: var(--paper); border-radius: 16px; padding: 18px 20px; box-shadow: 0 8px 22px rgba(30, 60, 100, 0.07); }}
  .boxes h3 {{ margin: 0 0 6px; font-size: 18px; line-height: 1.3; }}
  .boxes p {{ margin: 0; color: var(--body); font-size: 16px; }}
  .boxes .n {{ display: inline-block; margin-top: 10px; font-size: 14px; color: var(--slate); }}
  .links {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 26px; padding: 0; list-style: none; }}
  .links a {{ display: inline-block; padding: 7px 14px; border-radius: 999px; background: var(--paper); text-decoration: none; font-size: 16px; box-shadow: 0 3px 10px rgba(30, 60, 100, 0.06); }}
  .links a small {{ color: var(--slate); }}
  .idx-hero {{ display: grid; grid-template-columns: 1.4fr 1fr; gap: 40px; align-items: center; padding: 6px 0 40px; }}
  .idx-stats {{ display: flex; gap: 14px; flex-wrap: wrap; }}
  .idx-stats div {{ background: var(--paper); border-radius: 16px; padding: 16px 20px; box-shadow: 0 8px 22px rgba(30, 60, 100, 0.08); min-width: 120px; }}
  .idx-stats b {{ display: block; font-size: 30px; line-height: 1.05; color: var(--sky); }}
  .idx-stats span {{ font-size: 15px; color: var(--slate); }}
  .jump {{ display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 8px; padding: 0; list-style: none; }}
  .jump a {{ display: inline-block; padding: 8px 16px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 16px; color: #fff; }}
  .cycle {{ padding: 44px 0 10px; scroll-margin-top: 10px; }}
  .cycle-head {{ display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; }}
  .cycle-head h2 {{ margin: 0; }}
  .cycle-head span {{ color: var(--slate); font-size: 16px; }}
  .levels {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }}
  .level {{ background: var(--paper); border-radius: 20px; padding: 20px 22px 22px; box-shadow: 0 10px 26px rgba(30, 60, 100, 0.08); border-top: 6px solid var(--accent); }}
  .level h3 {{ margin: 0; font-size: 26px; line-height: 1.1; }}
  .level .meta {{ margin: 4px 0 14px; font-size: 15px; color: var(--slate); }}
  .subjects {{ list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }}
  .subjects a {{ display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 10px; background: var(--mist); text-decoration: none; font-size: 15.5px; line-height: 1.25; transition: background 0.15s ease; }}
  .subjects a:hover {{ background: var(--sky-soft); }}
  .subjects i {{ width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }}
  .subjects small {{ color: var(--slate); font-size: 13px; }}
  .primaire {{ --accent: #e0a23a; }} .college {{ --accent: var(--sky); }} .lycee {{ --accent: var(--violet); }}
  .jump .primaire {{ background: #e0a23a; }} .jump .college {{ background: var(--sky); }} .jump .lycee {{ background: var(--violet); }}
  @media (max-width: 860px) {{
    .subject-hero {{ grid-template-columns: 1fr; row-gap: 18px; grid-template-areas: "title" "play" "copy"; }}
    .boxes {{ grid-template-columns: 1fr; gap: 16px; }}
    .idx-hero {{ grid-template-columns: 1fr; gap: 20px; }}
    .levels {{ grid-template-columns: 1fr; }}
    .idx-stats {{ flex-wrap: nowrap; gap: 10px; }}
    .idx-stats div {{ min-width: 0; flex: 1; padding: 12px 14px; }}
    .idx-stats b {{ font-size: 24px; }}
  }}
</style>
{extra_head}</head>
<body>
<div class="wrap">
  <header class="top">
    <a href="{up}index.html" aria-label="Accueil darwin"><img class="logo" src="{up}assets/darwin-logo-blue.png" alt="darwin" /></a>
    <nav class="top-links">
      <a href="{up}defi.html">Défi du jour</a>
      <a href="{up}revision/index.html">Fiches par matière</a>
      <a class="install-link" href="{up}../index.html">Ouvrir l'appli</a>
    </nav>
  </header>
{body}
  <footer>
    <a href="{up}index.html" aria-label="Accueil darwin"><img class="logo" src="{up}assets/darwin-logo-blue.png" alt="darwin" /></a>
    <nav><a href="{up}index.html">Accueil</a><a href="{up}defi.html">Défi du jour</a><a href="{up}revision/index.html">Fiches par matière et niveau</a><a href="{up}../index.html">Ouvrir l'appli</a></nav>
  </footer>
</div>
</body>
</html>
"""


def main():
    boxes = json.load(open(PACK, encoding="utf-8"))["boxes"]
    groups = defaultdict(list)
    for b in boxes:
        t = b.get("taxonomy") or {}
        lv, m = t.get("niveau"), t.get("matiere")
        if lv in LEVEL and m:
            groups[(lv, m)].append(b)

    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith(".html"):
            os.remove(os.path.join(OUT, f))

    def fname(lv, m):
        return f"{slugify(m)}-{LEVEL[lv][0]}.html"

    by_level = defaultdict(list)
    by_subject = defaultdict(list)
    for (lv, m) in groups:
        by_level[lv].append(m)
        by_subject[m].append(lv)

    urls = []
    for (lv, m), bxs in sorted(groups.items(), key=lambda kv: (LEVEL_ORDER.index(kv[0][0]), kv[0][1])):
        slug, label, cycle = LEVEL[lv]
        n_cards = sum(len(b["cards"]) for b in bxs)
        title = f"Fiches de révision {de(m)} {en(label)} — darwin"
        h1 = f"Fiches de révision {de(m)} {en(label)}"
        desc = (f"{len(bxs)} boîte{'s' if len(bxs) > 1 else ''} et {n_cards} fiches {de(m)} {en(label)}, prêtes à réviser "
                f"avec darwin : l'appli te fait revoir chaque fiche juste avant que tu l'oublies.")
        # Fiches jouables : quelques-unes de chaque boîte, réparties.
        sample = []
        per = max(1, -(-SAMPLE_CARDS // len(bxs)))
        for b in bxs:
            for c in b["cards"][:per]:
                q, a = plain(c.get("question")), plain(c.get("answer"))
                if q and a:
                    theme = b["name"].split("—")[-1].strip()
                    theme = re.sub(r"^" + re.escape(m) + r"\s*:\s*", "", theme, flags=re.I)
                    sample.append({"theme": theme[:1].upper() + theme[1:], "q": q, "a": a, "more": ""})
        sample = sample[:SAMPLE_CARDS]
        box_items = "\n".join(
            f"""        <li><h3>{esc(b['name'])}</h3><p>{esc(b.get('summary') or '')}</p><span class="n">{len(b['cards'])} fiches</span></li>"""
            for b in sorted(bxs, key=lambda x: x["name"])
        )
        same_level = sorted(x for x in by_level[lv] if x != m)
        same_subject = sorted((x for x in by_subject[m] if x != lv), key=LEVEL_ORDER.index)
        links_level = "".join(f'<li><a href="{fname(lv, x)}">{esc(subject_title(x))}</a></li>' for x in same_level)
        links_subject = "".join(f'<li><a href="{fname(x, m)}">{esc(subject_title(m))} <small>{esc(LEVEL[x][1])}</small></a></li>' for x in same_subject)
        body = f"""  <main>
    <p class="crumbs"><a href="index.html">Fiches de révision</a> › {esc(cycle)} › {esc(label)} › {esc(subject_title(m))}</p>
    <section class="subject-hero">
      <div class="sh-title">
        <h1>{esc(h1)}</h1>
        <div class="facts">
          <div><b>{len(bxs)}</b><span>boîte{'s' if len(bxs) > 1 else ''}</span></div>
          <div><b>{n_cards}</b><span>fiches</span></div>
        </div>
      </div>
      <div class="sh-copy">
        <p class="lead">Des fiches question / réponse prêtes à l'emploi, conformes au programme {en(label)}. Ajoute-les à tes révisions dans darwin : l'appli te les repose au bon moment, juste avant que tu les oublies.</p>
        <a class="cta" href="../../index.html">Réviser avec darwin</a>
        <span class="cta-note">Essaie quelques fiches ici, sans inscription.</span>
      </div>
      <div class="play">
        <div id="robot"></div>
        <div id="deck"></div>
        <p class="score" id="score"></p>
      </div>
    </section>
    <section class="band">
      <h2>Les boîtes {de(m)} {en(label)}</h2>
      <p class="intro">Toutes ces boîtes sont dans la Librairie de darwin.</p>
      <ul class="boxes">
{box_items}
      </ul>
    </section>
    <section class="band">
      {f'<h2>Autres matières {en(label)}</h2><ul class="links">{links_level}</ul>' if links_level else ''}
      {f'<h2>{esc(subject_title(m))} : autres niveaux</h2><ul class="links">{links_subject}</ul>' if links_subject else ''}
    </section>
  </main>
  <script src="../assets/deck.js"></script>
  <script>
  (() => {{
    const CARDS = {json.dumps(sample, ensure_ascii=False)};
    const robot = DarwinDeck.robot(document.getElementById("robot"), "../assets/");
    const score = document.getElementById("score");
    let known = 0;
    robot.say("Essaie une fiche de cette matière : touche-la pour voir la réponse.");
    DarwinDeck.mount(document.getElementById("deck"), CARDS, {{
      onFlip: () => robot.say("Alors, tu savais ?"),
      onRate: (r, _c, n) => {{
        if (r === "good" || r === "easy") {{ known += 1; robot.happy(); }}
        robot.say(r === "again" || r === "hard" ? "Dans l'appli, je te la reposerais bientôt." : "Bien joué ! Dans l'appli, elle attendrait quelques jours.");
        score.textContent = `${{n}} fiche${{n > 1 ? "s" : ""}} · ${{known}} sue${{known > 1 ? "s" : ""}}`;
      }},
    }});
  }})();
  </script>
"""
        with open(os.path.join(OUT, fname(lv, m)), "w", encoding="utf-8") as fh:
            fh.write(page(title, desc, body, depth=1))
        urls.append(f"revision/{fname(lv, m)}")

    # Index : par cycle, puis par niveau.
    def sort_key(m):
        return slugify(m)
    def dot(m):
        palette = ["#4a9fe0", "#8a63c9", "#3e7c6b", "#cf9a4d", "#b6604a", "#6f8b5c", "#d0679b", "#5a6fd6"]
        return palette[sum(map(ord, slugify(m))) % len(palette)]
    cycles = defaultdict(list)
    for v, slug, label, cycle in LEVELS:
        if by_level.get(v):
            cycles[cycle].append(v)
    blocks = []
    jump = []
    for cycle in ["Primaire", "Collège", "Lycée"]:
        cid = slugify(cycle)
        cards = []
        n_cycle = 0
        for v in cycles.get(cycle, []):
            nb = sum(len(groups[(v, m)]) for m in by_level[v])
            nc = sum(len(b["cards"]) for m in by_level[v] for b in groups[(v, m)])
            n_cycle += nb
            items = "".join(
                f'<li><a href="{fname(v, m)}"><i style="background:{dot(m)}"></i>{esc(subject_title(m))} <small>{len(groups[(v, m)])}</small></a></li>'
                for m in sorted(by_level[v], key=sort_key)
            )
            lab = LEVEL[v][1]
            cards.append(f'<div class="level"><h3>{esc(lab[:1].upper() + lab[1:])}</h3>'
                         f'<p class="meta">{nb} boîtes · {nc} fiches</p><ul class="subjects">{items}</ul></div>')
        blocks.append(f'<section class="cycle {cid}" id="{cid}"><div class="cycle-head"><h2>{cycle}</h2><span>{n_cycle} boîtes</span></div>'
                      f'<div class="levels">{"".join(cards)}</div></section>')
        jump.append(f'<li><a class="{cid}" href="#{cid}">{cycle}</a></li>')
    total_boxes = sum(len(v) for v in groups.values())
    total_cards = sum(len(b["cards"]) for v in groups.values() for b in v)
    n_subjects = len(by_subject)
    fmt = lambda n: f"{n:,}".replace(",", "\u202f")
    body = f"""  <main>
    <section class="idx-hero">
      <div>
        <h1>Fiches de révision par matière et par niveau</h1>
        <p class="lead">Des fiches toutes prêtes, du CP à la terminale. Choisis ta classe et ta matière, essaie quelques fiches, puis révise-les avec darwin.</p>
        <ul class="jump">{"".join(jump)}</ul>
      </div>
      <div class="idx-stats">
        <div><b>{fmt(total_boxes)}</b><span>boîtes</span></div>
        <div><b>{fmt(total_cards)}</b><span>fiches</span></div>
        <div><b>{n_subjects}</b><span>matières</span></div>
      </div>
    </section>
    {"".join(blocks)}
  </main>
"""
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(page("Fiches de révision par matière et par niveau — darwin",
                      f"{total_boxes} boîtes de fiches de révision du CP à la terminale, par matière et par niveau.", body, depth=1))

    pages = ["", "defi.html", "revision/"] + urls
    with open(SITEMAP, "w", encoding="utf-8") as fh:
        fh.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u in pages:
            fh.write(f"  <url><loc>{BASE_URL}{u}</loc></url>\n")
        fh.write("</urlset>\n")
    print(f"{len(urls)} pages matière/niveau, index et sitemap générés dans {OUT}")


if __name__ == "__main__":
    main()
