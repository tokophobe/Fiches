#!/usr/bin/env python3
"""Fiches à vérifier chaque année (boîtes toutes prêtes).

Certaines fiches contiennent des faits qui changent avec le temps : nombre
de pays de la zone euro ou de l'Union européenne, population, chiffres du
tourisme, concentration de CO₂, membres des BRICS… Ce script les retrouve
dans bibliotheque.json (copie de travail à la racine du dépôt) à partir
des THÈMES ci-dessous, et écrit la liste à relire.

Utilisation (depuis la racine du dépôt) :
  python3 tools/fiches_a_verifier.py                       -> affiche la liste
  python3 tools/fiches_a_verifier.py ../fiches-contenu/A-VERIFIER-CHAQUE-ANNEE.md
                                                          -> l'écrit dans le dépôt privé

La liste contient le texte des fiches (contenu payant) : elle s'écrit dans
le dépôt PRIVÉ Fiches-contenu, jamais dans ce dépôt-ci.
Quand on écrit une nouvelle fiche datée, vérifier qu'un thème la retrouve,
sinon en ajouter un.
"""
import datetime
import json
import re
import sys
from pathlib import Path

FICHIER = Path(__file__).resolve().parent.parent / "bibliotheque.json"

# (thème, motif recherché dans la question, la réponse et « En savoir plus »,
#  ce qu'il faut vérifier et où)
THEMES = [
    ("Zone euro", r"zone euro|utilisent l'euro",
     "Nombre de pays de la zone euro (site de la Banque centrale européenne)."),
    ("Union européenne : pays membres", r"(pays|États membres)\b.{0,40}(Union européenne|l'UE)|Union européenne (compte|aujourd'hui)|Brexit",
     "Nombre d'États membres (27 depuis 2020) ; élargissements en cours."),
    ("Population mondiale et pays les plus peuplés", r"habitants.{0,30}(Terre|monde)|plus peuplé|population (de la Chine|mondiale)|milliards? d'habitants|mégapole|métropoles les plus peuplées",
     "Chiffres de l'ONU (World Population Prospects)."),
    ("Population de la France, de l'UE, de Paris", r"habitants (compte|environ compte) (la France|l'Union|l'aire)|aire (urbaine|d'attraction) de Paris|habitants l'Union européenne",
     "Chiffres de l'INSEE et d'Eurostat."),
    ("Migrations et tourisme", r"migrants internationaux|touristes internationaux|destination touristique|plus visité|touristes étrangers",
     "Chiffres de l'ONU (migrations) et de l'ONU Tourisme ; rang de la France."),
    ("Climat : CO₂", r"ppm|CO₂ atmosphérique|part de l'air actuel",
     "Concentration actuelle de CO₂ (NOAA, rapports du GIEC)."),
    ("BRICS", r"BRICS",
     "Liste des membres (élargie depuis 2024)."),
    ("France : chiffres et statuts récents", r"(nombre|combien)\b.{0,30}(agriculteurs|exploitants)|(rang|superficie|2e)\b.{0,40}ZEE|ZEE\b.{0,30}(rang|superficie|2e)|statut de « métropole »|aujourd'hui \d+ métropoles|(combien|compte)\b.{0,30}régions|vols intérieurs|indice de (réparabilité|durabilité)|rang .{0,40}producteurs agricoles",
     "INSEE, Agreste, textes de loi : chiffres, nombre de métropoles et de régions, lois récentes."),
    ("Mots « aujourd'hui », « actuel », « en 202x »", r"(?<!, )\b(aujourd'hui|actuellement|actuelle?)\b(?!, c'est).{0,60}\d|\ben 202\d\b|depuis 202\d",
     "Toute fiche qui donne un chiffre « actuel » ou une année récente."),
]


def fiches():
    d = json.loads(FICHIER.read_text(encoding="utf-8"))
    for b in d["boxes"]:
        for i, c in enumerate(b["cards"]):
            yield b, i, c


def main():
    vues, sortie = set(), []
    total = 0
    for theme, motif, quoi in THEMES:
        rx = re.compile(motif, re.I)
        lignes = []
        for b, i, c in fiches():
            texte = " ".join([c["question"], c["answer"], c.get("more", "")])
            if (b["key"], i) in vues or not rx.search(texte):
                continue
            vues.add((b["key"], i))
            rep = " ".join(c["answer"].split())
            lignes.append(f"- [ ] `{b['key']}` fiche {i + 1} : {c['question']} → **{rep}**")
        if lignes:
            total += len(lignes)
            sortie += [f"\n## {theme} ({len(lignes)})\n", f"À vérifier : {quoi}\n"] + lignes
    tete = [
        "# Fiches à vérifier chaque année",
        "",
        "> Liste produite par `python3 tools/fiches_a_verifier.py` (dépôt Fiches) "
        f"le {datetime.date.today().strftime('%d/%m/%Y')} : **{total} fiches**.",
        "> À relire chaque été, avant la rentrée (feuille de route d'exploitation, §4).",
        "> Cocher chaque fiche relue ; corriger avec `tools/maj_boites.py`, puis relancer le script.",
    ]
    texte = "\n".join(tete + sortie) + "\n"
    if len(sys.argv) > 1:
        Path(sys.argv[1]).write_text(texte, encoding="utf-8")
        print(f"{total} fiches à vérifier, écrites dans {sys.argv[1]}")
    else:
        print(texte)


if __name__ == "__main__":
    main()
