#!/usr/bin/env python3
"""Vérifie les vidéos YouTube des boîtes toutes prêtes (bibliotheque.json).

Pour chaque lien YouTube (lien de boîte et liens de fiches), interroge
YouTube (adresse « oEmbed », publique, sans clé) : la vidéo doit exister,
être publique et pouvoir être intégrée dans une autre appli. Donne aussi la
chaîne et le titre, pour repérer ce qui ne vient pas d'une chaîne
d'enseignement (webinaire, rediffusion en direct, interview…).

Utilisation (depuis la racine du dépôt, bibliotheque.json copié à côté) :
  python3 tools/verifier_videos.py                 -> résumé + vidéos en erreur
  python3 tools/verifier_videos.py --liste         -> aussi boîte | chaîne | titre

Codes : 200 = OK ; 401 / 403 = privée ou intégration interdite ;
404 = supprimée ou inexistante. Nécessite l'accès réseau à www.youtube.com.
"""
import concurrent.futures as cf
import json
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

FICHIER = Path(__file__).resolve().parent.parent / "bibliotheque.json"


def video_id(url):
    m = re.search(r"(?:v=|youtu\.be/|embed/|shorts/)([\w-]{11})", url or "")
    return m.group(1) if m else None


def liens(d):
    for b in d["boxes"]:
        candidats = [("boîte", b.get("link"))] + [(f"fiche {i}", c.get("link")) for i, c in enumerate(b["cards"])]
        for ou, lien in candidats:
            if lien and "youtu" in lien:
                yield b["key"], ou, lien


def verifie(item):
    cle, ou, lien = item
    v = video_id(lien)
    if not v:
        return dict(key=cle, where=ou, link=lien, status="lien illisible")
    url = "https://www.youtube.com/oembed?format=json&url=" + urllib.request.quote("https://www.youtube.com/watch?v=" + v, safe="")
    erreur = ""
    for _ in range(3):
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                j = json.load(r)
                return dict(key=cle, where=ou, link=lien, status=200, author=j.get("author_name"), title=j.get("title"))
        except urllib.error.HTTPError as e:
            return dict(key=cle, where=ou, link=lien, status=e.code)
        except Exception as e:  # réseau
            erreur = str(e)
            time.sleep(2)
    return dict(key=cle, where=ou, link=lien, status="réseau", err=erreur)


def main():
    d = json.loads(FICHIER.read_text(encoding="utf-8"))
    with cf.ThreadPoolExecutor(8) as ex:
        res = list(ex.map(verifie, list(liens(d))))
    print(len(res), "vidéos :", dict(Counter(str(r["status"]) for r in res)))
    for r in res:
        if r["status"] != 200:
            print("À REMPLACER", r["status"], r["key"], r["where"], r["link"])
    if "--liste" in sys.argv:
        for r in res:
            if r["status"] == 200:
                print(f"{r['key'][:40]:40} | {(r['author'] or '')[:28]:28} | {(r['title'] or '')[:80]}")


if __name__ == "__main__":
    main()
