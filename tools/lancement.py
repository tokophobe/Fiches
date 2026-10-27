#!/usr/bin/env python3
"""Kit « jour du lancement » (v240).

Deux usages, depuis la racine du dépôt :

  python3 tools/lancement.py
      Bilan : ce qui reste à faire dans les fichiers avant l'ouverture au
      public (pages encore « noindex », cases à compléter dans les pages
      légales, adresse du site, robots.txt…). Ne modifie rien.

  python3 tools/lancement.py --go https://www.darwin-revision.fr/
      Bascule en mode « public », en une fois :
        - retire la ligne « noindex » du site, des pages légales et de
          l'aide (Darwin Admin et la page de l'accord parental restent
          non indexées) ;
        - met l'adresse du site dans tools/build_site_pages.py, régénère
          les pages matière/niveau (indexables) et sitemap.xml ;
        - ajoute l'adresse « canonical » des pages d'accueil et du défi ;
        - écrit robots.txt (site et appli).
      L'adresse donnée est celle de la page d'accueil du SITE (dossier
      site/), avec https et une barre oblique finale.
      Pour revenir en arrière : git checkout -- . (avant de commiter).

Les étapes qui ne se font pas dans les fichiers (Supabase, Stripe,
Darwin Admin, nom de domaine…) sont rappelées à la fin du bilan.
"""
import glob
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, "tools", "build_site_pages.py")
ROBOTS_META = re.compile(r'[ \t]*<meta name="robots" content="noindex, nofollow"\s*/?>\n?')
DRAFT_COMMENT = re.compile(r"<!-- BROUILLON :.*?-->\n?", re.S)
# Pages qui doivent rester hors des moteurs de recherche, même après le lancement.
KEEP_NOINDEX = {"admin/index.html", "legal/accord-parental.html"}
PLACEHOLDER = "https://exemple.fr/"


def rel(p):
    return os.path.relpath(p, ROOT)


def read(p):
    with open(p, encoding="utf-8") as fh:
        return fh.read()


def write(p, s):
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(s)


def public_pages():
    """Pages publiques écrites à la main (le site matière/niveau est généré)."""
    pats = ["site/index.html", "site/defi.html", "legal/*.html", "guide/*.html", "index.html"]
    out = []
    for pat in pats:
        out += sorted(glob.glob(os.path.join(ROOT, pat)))
    return [p for p in out if rel(p) not in KEEP_NOINDEX]


def build_settings():
    s = read(BUILD)
    noindex = re.search(r"^NOINDEX = (True|False)", s, re.M).group(1) == "True"
    base = re.search(r'^BASE_URL = "([^"]*)"', s, re.M).group(1)
    return noindex, base


def report():
    todo = []
    ok = []
    noindex_pages = [rel(p) for p in public_pages() if ROBOTS_META.search(read(p))]
    if noindex_pages:
        todo.append("Pages encore « noindex » (non indexées) : " + ", ".join(noindex_pages))
    else:
        ok.append("Plus aucune page publique en « noindex ».")
    noindex, base = build_settings()
    if noindex:
        todo.append("Pages matière/niveau du site encore « noindex » (NOINDEX = True dans tools/build_site_pages.py).")
    if base == PLACEHOLDER:
        todo.append("Adresse du site à renseigner (BASE_URL dans tools/build_site_pages.py) : sitemap.xml pointe vers exemple.fr.")
    else:
        ok.append(f"Adresse du site : {base}")
    for p in ("site/robots.txt", "robots.txt"):
        if os.path.exists(os.path.join(ROOT, p)):
            ok.append(f"{p} présent.")
        else:
            todo.append(f"{p} absent.")
    marks = []
    for p in sorted(glob.glob(os.path.join(ROOT, "legal", "*.html")) + glob.glob(os.path.join(ROOT, "guide", "*.html"))):
        n = read(p).count('class="todo"')
        if n:
            marks.append(f"{rel(p)} ({n})")
    if marks:
        todo.append("Cases surlignées à compléter (éditeur, SIREN, adresse, contact, médiateur…) : " + ", ".join(marks))
    else:
        ok.append("Pages légales et aide complètes.")
    cfg = read(os.path.join(ROOT, "js", "config.js"))
    if re.search(r'supabaseUrl:\s*""', cfg):
        todo.append("js/config.js : adresse Supabase vide.")
    stats = os.path.join(ROOT, "site", "assets", "stats-config.js")
    if os.path.exists(stats) and re.search(r'url:\s*""', read(stats)):
        todo.append("site/assets/stats-config.js vide : les visites du site ne sont pas comptées.")
    for p in ("site/index.html", "site/defi.html"):
        if 'rel="canonical"' not in read(os.path.join(ROOT, p)):
            todo.append(f"{p} : adresse « canonical » absente.")

    print("=== Lancement : bilan des fichiers ===\n")
    for x in ok:
        print("  ✓", x)
    for x in todo:
        print("  ✗", x)
    print(
        """
=== Hors fichiers (voir claude/checklist-mise-en-ligne.md) ===
  • Supabase : toutes les migrations jusqu'à round80, formule Pro et
    sauvegardes, URL du site (Authentication → URL Configuration),
    SMTP de l'authentification, captcha.
  • Fonctions serveur à jour ; tâche de nuit « inactive-accounts »
    (README-stripe §13).
  • Stripe en réel : clés live, prix live, webhook live.
  • Darwin Admin :
      - Abonnements → « Réserver les boîtes de la Librairie aux abonnés » ;
      - Abonnements → « Ouvrir les paiements » ;
      - Suivi → Comptes inactifs → « Suppression automatique activée » ;
      - Comptes → supprimer les comptes de test (bouton en bas de la fiche) ;
      - Librairie → retirer les collections de test.
  • Retirer packs/ de l'hébergement (le contenu passe par Darwin Admin).
  • Google Search Console : déclarer le site et sitemap.xml.
"""
    )
    return not todo


def go(site_url):
    if not re.match(r"^https://[a-z0-9.-]+\.[a-z]{2,}(/[^\s]*)?/$", site_url) or site_url == PLACEHOLDER:
        sys.exit("Adresse invalide : donne l'adresse https de l'accueil du site, terminée par « / ».")
    changed = []
    for p in public_pages():
        s = read(p)
        s2 = DRAFT_COMMENT.sub("", ROBOTS_META.sub("", s))
        if s2 != s:
            write(p, s2)
            changed.append(rel(p))
    for name in ("index.html", "defi.html"):
        p = os.path.join(ROOT, "site", name)
        s = read(p)
        url = site_url + ("" if name == "index.html" else name)
        tag = f'<link rel="canonical" href="{url}" />'
        if 'rel="canonical"' in s:
            s2 = re.sub(r'<link rel="canonical" href="[^"]*"\s*/?>', tag, s)
        else:
            s2 = s.replace("<title>", tag + "\n<title>", 1)
        s2 = s2.replace('content="assets/robot.png"', f'content="{site_url}assets/robot.png"')
        if s2 != s:
            write(p, s2)
            changed.append(rel(p))
    b = read(BUILD)
    b2 = re.sub(r"^NOINDEX = True", "NOINDEX = False", b, flags=re.M)
    b2 = re.sub(r'^BASE_URL = "[^"]*"', f'BASE_URL = "{site_url}"', b2, flags=re.M)
    if b2 != b:
        write(BUILD, b2)
        changed.append(rel(BUILD))
    subprocess.run([sys.executable, BUILD], check=True, cwd=ROOT)
    write(os.path.join(ROOT, "site", "robots.txt"), f"User-agent: *\nAllow: /\n\nSitemap: {site_url}sitemap.xml\n")
    write(
        os.path.join(ROOT, "robots.txt"),
        "User-agent: *\nDisallow: /admin/\nDisallow: /legal/accord-parental.html\nDisallow: /supabase/\nDisallow: /tools/\n\n"
        f"Sitemap: {site_url}sitemap.xml\n",
    )
    changed += ["site/robots.txt", "robots.txt", "site/revision/*.html", "site/sitemap.xml"]
    print("Modifié :\n  " + "\n  ".join(changed) + "\n")
    report()


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--go"] and len(args) == 2:
        go(args[1])
    elif not args:
        sys.exit(0 if report() else 1)
    else:
        sys.exit(__doc__)
