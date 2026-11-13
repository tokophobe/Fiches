#!/usr/bin/env python3
"""Le programme scolaire, classe par classe, et les boîtes qui le couvrent.

Source de vérité : data/programme.json
  niveaux → matières → chapitres → boîtes (clé, titre, nombre de fiches).
Un chapitre sans boîte est « à créer ».

Commandes :
  python3 tools/programme.py genere   met à jour data/programme.json à partir
                                       de bibliotheque.json (s'il est présent
                                       à la racine), puis écrit
                                       docs/PROGRAMME.md et site/programme.html
  python3 tools/programme.py bilan    affiche la couverture par classe

Quand bibliotheque.json est présent, « genere » :
  - met à jour le titre et le nombre de fiches de chaque boîte ;
  - retire les boîtes qui n'existent plus (le chapitre redevient « à créer ») ;
  - ajoute chaque nouvelle boîte comme nouveau chapitre de sa classe et de sa
    matière (à rattacher ensuite à la main à un chapitre « à créer » si elle
    le couvre : déplacer la boîte dans « boites » de ce chapitre et supprimer
    le chapitre ajouté).
bibliotheque.json est du contenu payant : il ne doit JAMAIS être committé ici.
Seuls les titres des boîtes et leur nombre de fiches sont recopiés.
"""
import datetime
import html
import json
import re
import sys
import unicodedata
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PROGRAMME = RACINE / "data" / "programme.json"
BIBLIO = RACINE / "bibliotheque.json"
MD = RACINE / "docs" / "PROGRAMME.md"
PAGE = RACINE / "site" / "programme.html"

# id = valeur « niveau » de la taxonomie des boîtes, en minuscules.
NIVEAUX = [
    ("cp", "CP", "Primaire"), ("ce1", "CE1", "Primaire"), ("ce2", "CE2", "Primaire"),
    ("cm1", "CM1", "Primaire"), ("cm2", "CM2", "Primaire"),
    ("6ème", "6e", "Collège"), ("5ème", "5e", "Collège"), ("4ème", "4e", "Collège"),
    ("3ème", "3e", "Collège"),
    ("2nde", "Seconde", "Lycée"), ("1ère", "Première", "Lycée"),
    ("terminale", "Terminale", "Lycée"),
    ("autres", "Autres boîtes", "Hors programme"),
]
ANCRES = {"6ème": "6e", "5ème": "5e", "4ème": "4e", "3ème": "3e", "1ère": "1re"}

# id = valeur « matiere » de la taxonomie ; ordre d'affichage = ordre de la liste.
MATIERES = [
    ("français", "Français"), ("mathématiques", "Mathématiques"),
    ("mathématiques complémentaires", "Mathématiques complémentaires"),
    ("mathématiques expertes", "Mathématiques expertes"),
    ("philosophie", "Philosophie"),
    ("questionner le monde", "Questionner le monde"), ("sciences", "Sciences"),
    ("histoire", "Histoire"), ("géographie", "Géographie"), ("EMC", "EMC"),
    ("SVT", "SVT"), ("physique", "Physique"), ("chimie", "Chimie"),
    ("technologie", "Technologie"), ("SNT", "SNT"), ("NSI", "NSI"),
    ("SES", "SES"), ("HGGSP", "HGGSP"), ("HLP", "HLP"),
    ("enseignement scientifique", "Enseignement scientifique"),
    ("anglais", "Anglais"), ("LLCER", "LLCER anglais"), ("espagnol", "Espagnol"),
    ("allemand", "Allemand"), ("italien", "Italien"), ("latin", "Latin"),
    ("grec ancien", "Grec ancien"),
    ("éducation artistique", "Éducation artistique"),
    ("arts plastiques", "Arts plastiques"), ("éducation musicale", "Éducation musicale"),
    ("éducation physique", "Éducation physique"),
    ("droit et économie", "Droit et économie"), ("DGEMC", "DGEMC"),
    ("management", "Management"),
    ("sciences de gestion et numérique", "Sciences de gestion et numérique"),
    ("sciences de l'ingénieur", "Sciences de l'ingénieur"),
    ("ingénierie et développement durable (2I2D)", "Ingénierie et développement durable (2I2D)"),
    ("innovation technologique", "Innovation technologique"),
    ("biochimie", "Biochimie"),
    ("biologie et physiopathologie humaines", "Biologie et physiopathologie humaines"),
    ("biotechnologies", "Biotechnologies"),
    ("sciences et techniques sanitaires et sociales", "Sciences et techniques sanitaires et sociales"),
    ("divers", "Divers"),
]
ORDRE_MAT = {m: i for i, (m, _) in enumerate(MATIERES)}
NOM_MAT = dict(MATIERES)
ORDRE_NIV = {n: i for i, (n, _, _) in enumerate(NIVEAUX)}


def niveau_id(valeur):
    v = (valeur or "").strip().lower()
    return v if v in ORDRE_NIV else "autres"


def titre_chapitre(nom_boite):
    """« 6ème — Maths : les fractions » → « Les fractions »."""
    t = re.sub(r"^[^—]*—\s*", "", nom_boite).strip()
    if " : " in t:
        t = t.split(" : ", 1)[1].strip()
    return t[:1].upper() + t[1:]


def charger():
    if PROGRAMME.exists():
        return json.loads(PROGRAMME.read_text(encoding="utf-8"))
    return {"maj": "", "niveaux": []}


def trouver_niveau(prog, nid):
    for n in prog["niveaux"]:
        if n["id"] == nid:
            return n
    _, label, cycle = NIVEAUX[ORDRE_NIV[nid]]
    n = {"id": nid, "label": label, "cycle": cycle, "matieres": []}
    prog["niveaux"].append(n)
    prog["niveaux"].sort(key=lambda x: ORDRE_NIV.get(x["id"], 99))
    return n


def trouver_matiere(niveau, mid):
    for m in niveau["matieres"]:
        if m["id"] == mid:
            return m
    m = {"id": mid, "nom": NOM_MAT.get(mid, mid[:1].upper() + mid[1:]), "chapitres": []}
    niveau["matieres"].append(m)
    niveau["matieres"].sort(key=lambda x: ORDRE_MAT.get(x["id"], 98))
    return m


def synchroniser(prog):
    """Recopie titres et nombres de fiches depuis bibliotheque.json."""
    if not BIBLIO.exists():
        print("(bibliotheque.json absent : titres et fiches non rafraîchis)")
        return
    boites = {b["key"]: b for b in json.loads(BIBLIO.read_text(encoding="utf-8"))["boxes"]}
    vus = set()
    for n in prog["niveaux"]:
        for m in n["matieres"]:
            for c in m["chapitres"]:
                garde = []
                for b in c["boites"]:
                    src = boites.get(b["cle"])
                    if not src:
                        print(f"Boîte disparue, retirée : {b['cle']} ({b['titre']})")
                        continue
                    b["titre"], b["fiches"] = src["name"], len(src.get("cards") or [])
                    vus.add(b["cle"])
                    garde.append(b)
                c["boites"] = garde
    nouvelles = 0
    for cle, src in boites.items():
        if cle in vus:
            continue
        tax = src.get("taxonomy") or {}
        niv = trouver_niveau(prog, niveau_id(tax.get("niveau")))
        mat = trouver_matiere(niv, tax.get("matiere") or "divers")
        mat["chapitres"].append({
            "titre": titre_chapitre(src["name"]),
            "boites": [{"cle": cle, "titre": src["name"], "fiches": len(src.get("cards") or [])}],
        })
        nouvelles += 1
    if nouvelles:
        print(f"{nouvelles} nouvelle(s) boîte(s) ajoutée(s) comme chapitres "
              "(à rattacher à un chapitre « à créer » si besoin).")


def compter(chapitres):
    faits = sum(1 for c in chapitres if c["boites"])
    boites = sum(len(c["boites"]) for c in chapitres)
    fiches = sum(b["fiches"] for c in chapitres for b in c["boites"])
    return faits, len(chapitres), boites, fiches


def tous_chapitres(niveau):
    return [c for m in niveau["matieres"] for c in m["chapitres"]]


def totaux(prog):
    ch = [c for n in prog["niveaux"] if n["id"] != "autres" for c in tous_chapitres(n)]
    faits, total, _, _ = compter(ch)
    toutes = [c for n in prog["niveaux"] for c in tous_chapitres(n)]
    _, _, boites, fiches = compter(toutes)
    return faits, total, boites, fiches


def pourcent(a, b):
    return round(100 * a / b) if b else 0


# ---------------------------------------------------------------- Markdown
def ecrire_md(prog):
    faits, total, boites, fiches = totaux(prog)
    L = [
        "# Le programme, classe par classe",
        "",
        "Fichier **généré** par `python3 tools/programme.py genere` à partir de",
        "`data/programme.json` : ne pas le modifier à la main. La même liste est",
        "présentée sur le site, page `site/programme.html`.",
        "",
        f"Mise à jour : {prog['maj']}. **{faits} chapitres couverts sur {total}** "
        f"({pourcent(faits, total)} %), {boites} boîtes, {fiches} fiches.",
        "",
        "- [x] chapitre couvert — boîte(s) associée(s) et nombre de fiches",
        "- [ ] chapitre **à créer**",
        "",
        "| Classe | Chapitres couverts | À créer | Boîtes | Fiches |",
        "|---|---|---|---|---|",
    ]
    for n in prog["niveaux"]:
        f, t, b, fi = compter(tous_chapitres(n))
        L.append(f"| [{n['label']}](#{ancre_md(n['label'])}) | {f} / {t} | {t - f} | {b} | {fi} |")
    for n in prog["niveaux"]:
        f, t, b, _ = compter(tous_chapitres(n))
        L += ["", f"## {n['label']}", "", f"{n['cycle']} — {f} chapitres couverts sur {t}, {b} boîtes.", ""]
        for m in n["matieres"]:
            mf, mt, _, _ = compter(m["chapitres"])
            L += [f"### {n['label']} — {m['nom']} ({mf} / {mt})", ""]
            for c in m["chapitres"]:
                if not c["boites"]:
                    L.append(f"- [ ] {c['titre']} — *à créer*")
                    continue
                det = " ; ".join(f"{b['titre']} ({b['fiches']} fiches)" for b in c["boites"])
                L.append(f"- [x] {c['titre']} — {det}")
            L.append("")
    MD.write_text("\n".join(L).rstrip() + "\n", encoding="utf-8")


def ancre_md(texte):
    t = texte.lower().replace(" ", "-")
    return re.sub(r"[^\w\-]", "", t)


# ---------------------------------------------------------------- Page du site
def sans_accents(t):
    return "".join(ch for ch in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(ch) != "Mn")


def e(t):
    return html.escape(t, quote=True)


def ecrire_page(prog):
    faits, total, boites, fiches = totaux(prog)
    pills, sections = [], []
    for n in prog["niveaux"]:
        anc = ANCRES.get(n["id"], n["id"])
        f, t, b, _ = compter(tous_chapitres(n))
        cyc = sans_accents(n["cycle"]).split()[0]
        pills.append(f'<a class="pill {cyc}" href="#{e(anc)}">{e(n["label"])}</a>')
        mats = []
        for m in n["matieres"]:
            mf, mt, mb, _ = compter(m["chapitres"])
            items = []
            for c in m["chapitres"]:
                cherche = sans_accents(" ".join([c["titre"]] + [x["titre"] for x in c["boites"]]))
                if c["boites"]:
                    # Nom de la boîte répété seulement s'il diffère du chapitre.
                    bx = "".join(
                        f'<li><span class="bname">'
                        f'{"Boîte toute prête" if titre_chapitre(x["titre"]) == c["titre"] else e(x["titre"])}</span>'
                        f'<span class="nb">{x["fiches"]} fiches</span></li>' for x in c["boites"])
                    items.append(f'<li class="ch ok" data-q="{e(cherche)}"><span class="ct">{e(c["titre"])}</span>'
                                 f'<ul class="boxes">{bx}</ul></li>')
                else:
                    items.append(f'<li class="ch todo" data-q="{e(cherche)}"><span class="ct">{e(c["titre"])}</span>'
                                 f'<span class="tag">à créer</span></li>')
            p = pourcent(mf, mt)
            mats.append(
                f'<details class="subj"><summary><span class="sn">{e(m["nom"])}</span>'
                f'<span class="sc">{mf}/{mt}</span>'
                f'<span class="bar" aria-hidden="true"><i style="width:{p}%"></i></span></summary>'
                f'<ol class="chs">{"".join(items)}</ol></details>')
        sections.append(
            f'<section class="lvl {cyc}" id="{e(anc)}"><div class="lvl-head"><h2>{e(n["label"])}</h2>'
            f'<span class="cyc">{e(n["cycle"])}</span>'
            f'<span class="lvl-stat">{f} / {t} chapitres · {b} boîtes</span></div>'
            f'<div class="subjects">{"".join(mats)}</div></section>')
    page = GABARIT.format(
        maj=e(prog["maj"]), faits=faits, total=total, pc=pourcent(faits, total),
        boites=boites, fiches=f"{fiches:,}".replace(",", " "), acreer=total - faits,
        pills="".join(pills), sections="\n".join(sections))
    PAGE.write_text(page, encoding="utf-8")


GABARIT = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<!-- Page GÉNÉRÉE par tools/programme.py depuis data/programme.json : ne pas modifier à la main. -->
<meta name="robots" content="noindex, nofollow" />
<title>Le programme — darwin</title>
<meta name="description" content="Tout le programme du CP à la Terminale, matière par matière, chapitre par chapitre, avec les boîtes de fiches toutes prêtes de la Librairie." />
<link rel="icon" href="../icons/icon-192.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
<style>
  :root {{
    --sky: #4a9fe0; --ink: #1f2937; --slate: #64748b; --mist: #eef2f8; --paper: #ffffff;
    --ok: #3e7c6b; --todo: #b6604a; --line: rgba(31, 41, 55, 0.12);
    --primaire: #d9922e; --college: #4a9fe0; --lycee: #8a63c9; --hors: #64748b;
  }}
  * {{ box-sizing: border-box; }}
  html {{ -webkit-text-size-adjust: 100%; scroll-padding-top: 130px; }}
  body {{ margin: 0; background: var(--mist); color: var(--ink);
    font-family: "Atkinson Hyperlegible", system-ui, sans-serif; font-size: 17px; line-height: 1.5; }}
  a {{ color: inherit; }}
  :focus-visible {{ outline: 3px solid var(--sky); outline-offset: 3px; border-radius: 4px; }}
  .wrap {{ max-width: 1040px; margin: 0 auto; padding: 0 16px; }}
  header.top {{ display: flex; align-items: center; justify-content: space-between; padding: 22px 0; }}
  header.top .logo {{ display: block; width: 92px; height: 37px; background: var(--sky);
    -webkit-mask: url(darwin-logo.png) left center / contain no-repeat; mask: url(darwin-logo.png) left center / contain no-repeat; }}
  .install-link {{ font-weight: 700; font-size: 16px; text-decoration: none; padding: 9px 16px; border-radius: 999px; background: var(--ink); color: #fff; }}
  h1 {{ font-size: clamp(32px, 5.5vw, 52px); line-height: 1.06; letter-spacing: -0.02em; margin: 8px 0 14px; }}
  .lead {{ font-size: 19px; color: #334155; max-width: 36em; margin: 0 0 24px; }}
  .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 0 0 14px; }}
  .stat {{ background: var(--paper); border-radius: 14px; padding: 14px 16px; }}
  .stat b {{ display: block; font-size: 28px; line-height: 1.1; }}
  .stat span {{ font-size: 14px; color: var(--slate); }}
  .meter {{ height: 10px; border-radius: 99px; background: #dce4f0; overflow: hidden; margin: 4px 0 6px; }}
  .meter i {{ display: block; height: 100%; background: var(--ok); border-radius: 99px; }}
  .note {{ font-size: 14px; color: var(--slate); margin: 0 0 22px; }}

  .bar-tools {{ position: sticky; top: 0; z-index: 5; background: var(--mist); padding: 10px 0 12px; border-bottom: 1px solid var(--line); }}
  .pills {{ display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin; }}
  .pill {{ flex: none; text-decoration: none; font-weight: 700; font-size: 15px; padding: 6px 12px; border-radius: 999px;
    background: var(--paper); border: 2px solid var(--c, var(--sky)); color: var(--ink); }}
  .pill:hover, .pill.on {{ background: var(--c, var(--sky)); color: #fff; }}
  .primaire {{ --c: var(--primaire); }} .college {{ --c: var(--college); }} .lycee {{ --c: var(--lycee); }} .hors {{ --c: var(--hors); }}
  .filters {{ display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }}
  .filters input[type=search] {{ flex: 1 1 220px; min-width: 0; font: inherit; font-size: 16px; padding: 9px 14px;
    border-radius: 12px; border: 1px solid var(--line); background: var(--paper); }}
  .filters label {{ font-size: 15px; display: flex; gap: 6px; align-items: center; cursor: pointer; }}
  .filters button {{ font: inherit; font-size: 15px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--paper); cursor: pointer; }}
  .found {{ font-size: 14px; color: var(--slate); margin: 8px 0 0; min-height: 1em; }}

  .lvl {{ padding: 26px 0 8px; }}
  .lvl-head {{ display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; border-bottom: 4px solid var(--c); padding-bottom: 8px; margin-bottom: 14px; }}
  .lvl-head h2 {{ margin: 0; font-size: 30px; }}
  .cyc {{ font-size: 13px; font-weight: 700; color: #fff; background: var(--c); padding: 2px 10px; border-radius: 999px; }}
  .lvl-stat {{ margin-left: auto; font-size: 15px; color: var(--slate); }}
  .subjects {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start; }}
  .subj {{ background: var(--paper); border-radius: 14px; }}
  .subj[open] {{ grid-column: 1 / -1; }}
  .subj summary {{ list-style: none; cursor: pointer; display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; padding: 12px 16px; }}
  .subj summary::-webkit-details-marker {{ display: none; }}
  .sn {{ font-weight: 700; }}
  .sn::before {{ content: "▸"; display: inline-block; width: 1.1em; color: var(--slate); transition: transform .15s; }}
  .subj[open] .sn::before {{ transform: rotate(90deg); }}
  .sc {{ font-size: 15px; color: var(--slate); font-variant-numeric: tabular-nums; }}
  .bar {{ grid-column: 1 / -1; height: 6px; border-radius: 99px; background: #f3d9d2; overflow: hidden; }}
  .bar i {{ display: block; height: 100%; background: var(--ok); }}
  .chs {{ margin: 0; padding: 4px 16px 14px 16px; list-style: none; columns: 2 340px; column-gap: 28px; }}
  .ch {{ break-inside: avoid; padding: 8px 0 8px 28px; position: relative; border-top: 1px solid var(--line); }}
  .ch::before {{ position: absolute; left: 0; top: 9px; width: 18px; height: 18px; border-radius: 50%;
    display: grid; place-items: center; font-size: 12px; font-weight: 700; }}
  .ch.ok::before {{ content: "✓"; background: var(--ok); color: #fff; }}
  .ch.todo::before {{ content: ""; border: 2px dashed var(--todo); }}
  .ct {{ font-weight: 700; }}
  .todo .ct {{ font-weight: 400; color: #475569; }}
  .tag {{ margin-left: 8px; font-size: 12px; font-weight: 700; color: var(--todo); border: 1px solid currentColor; border-radius: 999px; padding: 0 7px; white-space: nowrap; }}
  .boxes {{ list-style: none; margin: 3px 0 0; padding: 0; font-size: 14px; color: var(--slate); }}
  .boxes li {{ display: flex; gap: 8px; justify-content: space-between; }}
  .boxes .nb {{ white-space: nowrap; font-variant-numeric: tabular-nums; }}
  .hide {{ display: none !important; }}
  footer {{ padding: 36px 0 48px; margin-top: 30px; border-top: 1px solid var(--line); color: var(--slate); font-size: 15px; display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; }}
  @media (max-width: 720px) {{
    .stats {{ grid-template-columns: 1fr 1fr; }}
    .subjects {{ grid-template-columns: 1fr; }}
    .lvl-stat {{ margin-left: 0; width: 100%; }}
    html {{ scroll-padding-top: 150px; }}
  }}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <a href="index.html" class="logo" aria-label="darwin, retour au site"></a>
    <a class="install-link" href="../index.html">Ouvrir l'appli</a>
  </header>
  <main>
    <h1>Le programme, classe par classe</h1>
    <p class="lead">Du CP à la Terminale : chaque matière, chaque chapitre, et les boîtes de fiches toutes prêtes de la Librairie qui le couvrent.</p>
    <div class="stats">
      <div class="stat"><b>{pc} %</b><span>du programme couvert</span></div>
      <div class="stat"><b>{faits} / {total}</b><span>chapitres avec une boîte</span></div>
      <div class="stat"><b>{boites}</b><span>boîtes toutes prêtes</span></div>
      <div class="stat"><b>{fiches}</b><span>fiches</span></div>
    </div>
    <div class="meter" aria-hidden="true"><i style="width:{pc}%"></i></div>
    <p class="note">Mis à jour le {maj}. {acreer} chapitres sont encore à créer : la liste s'enrichit au fil des nouvelles boîtes.</p>

    <div class="bar-tools">
      <nav class="pills" aria-label="Classes">{pills}</nav>
      <div class="filters">
        <input type="search" id="q" placeholder="Chercher un chapitre ou une boîte…" aria-label="Chercher un chapitre ou une boîte" />
        <label><input type="checkbox" id="todo" /> Seulement « à créer »</label>
        <button type="button" id="all">Tout ouvrir</button>
      </div>
      <p class="found" id="found" aria-live="polite"></p>
    </div>
{sections}
  </main>
  <footer>
    <span>darwin — révision par fiches</span>
    <a href="index.html">Retour au site</a>
  </footer>
</div>
<script>
(function () {{
  var q = document.getElementById("q"), todo = document.getElementById("todo"),
      all = document.getElementById("all"), found = document.getElementById("found");
  var subjects = [].slice.call(document.querySelectorAll(".subj"));
  var levels = [].slice.call(document.querySelectorAll(".lvl"));
  function norm(t) {{ return t.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, ""); }}
  function apply() {{
    var words = norm(q.value).split(/\\s+/).filter(Boolean), onlyTodo = todo.checked, active = words.length || onlyTodo, n = 0;
    subjects.forEach(function (s) {{
      var name = norm(s.querySelector(".sn").textContent), shown = 0;
      [].forEach.call(s.querySelectorAll(".ch"), function (c) {{
        var txt = c.getAttribute("data-q") + " " + name;
        var ok = (!onlyTodo || c.classList.contains("todo")) && words.every(function (w) {{ return txt.indexOf(w) >= 0; }});
        c.classList.toggle("hide", !ok); if (ok) shown++;
      }});
      s.classList.toggle("hide", shown === 0);
      if (active) s.open = shown > 0;
      n += shown;
    }});
    levels.forEach(function (l) {{ l.classList.toggle("hide", !l.querySelector(".subj:not(.hide)")); }});
    found.textContent = active ? n + (n > 1 ? " chapitres trouvés" : " chapitre trouvé") : "";
  }}
  q.addEventListener("input", apply); todo.addEventListener("change", apply);
  all.addEventListener("click", function () {{
    var open = all.textContent === "Tout ouvrir";
    subjects.forEach(function (s) {{ if (!s.classList.contains("hide")) s.open = open; }});
    all.textContent = open ? "Tout fermer" : "Tout ouvrir";
  }});
  // Pastille de la classe visible à l'écran.
  var pills = {{}};
  [].forEach.call(document.querySelectorAll(".pill"), function (p) {{ pills[p.getAttribute("href").slice(1)] = p; }});
  if ("IntersectionObserver" in window) {{
    var io = new IntersectionObserver(function (es) {{
      es.forEach(function (en) {{
        if (!en.isIntersecting) return;
        for (var k in pills) pills[k].classList.toggle("on", k === en.target.id);
        var p = pills[en.target.id]; if (p && p.scrollIntoView) p.parentNode.scrollLeft = p.offsetLeft - 16;
      }});
    }}, {{ rootMargin: "-160px 0px -60% 0px" }});
    levels.forEach(function (l) {{ io.observe(l); }});
  }}
}})();
</script>
</body>
</html>
"""


def bilan(prog):
    faits, total, boites, fiches = totaux(prog)
    print(f"{faits}/{total} chapitres couverts ({pourcent(faits, total)} %), {boites} boîtes, {fiches} fiches")
    for n in prog["niveaux"]:
        f, t, b, _ = compter(tous_chapitres(n))
        print(f"  {n['label']:<14} {f:>4}/{t:<4} à créer : {t - f:>3}   boîtes : {b}")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    prog = charger()
    if cmd == "genere":
        synchroniser(prog)
        prog["maj"] = datetime.date.today().strftime("%d/%m/%Y")
        PROGRAMME.write_text(json.dumps(prog, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        ecrire_md(prog)
        ecrire_page(prog)
        bilan(prog)
        print("Écrit : data/programme.json, docs/PROGRAMME.md, site/programme.html")
    elif cmd == "bilan":
        bilan(prog)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
