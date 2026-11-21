#!/usr/bin/env python3
"""Mise à jour des boîtes toutes prêtes (bibliotheque.json), par lots.

Utilisation :
  python3 tools/maj_boites.py liste [N]          -> les N prochaines boîtes à revoir
  python3 tools/maj_boites.py montre CLE...      -> fiches des boîtes (pour relecture)
  python3 tools/maj_boites.py applique LOT.json  -> applique un lot de corrections, puis lance
                                                   tout seul les contrôles ET la qualité (19 nov. 2026)
  python3 tools/maj_boites.py verifie [CLE...]   -> contrôles (QCM complets, questions)
  python3 tools/maj_boites.py qualite [CLE...]   -> alertes à relire : indice dans la question,
                                                    bonne réponse trop détaillée, texte à trous
  python3 tools/maj_boites.py accepte CLE#N...   -> alerte de qualité relue et acceptée
  python3 tools/maj_boites.py decoupe PLAN.json  -> découpe des boîtes trop larges

Format d'un lot (LOT.json) :
  { "cle-de-boite": {
      "link": "https://…",                    (lien « Pour aller plus loin » de la boîte)
      "cards": {
        "3": {"wrongs": ["…", "…", "…"]},      (fiche n° 3 : réponses fausses)
        "4": {"q": "…", "a": "…", "wrongs": […], "more": "…", "link": "…"},
        "5": [ {fiche 1}, {fiche 2} ],         (fiche coupée en plusieurs)
        "6": null,                             (fiche supprimée)
        "7": {"q2": "…", "a2": "…"}            (question poussée, spéc. §4.7)
      } } }

Format d'un plan de découpage (PLAN.json, 16 nov. 2026) — chaque fiche de la
boîte d'origine va dans exactement une partie :
  { "cle-de-boite": {
      "garde": {"name": "…", "description": "…", "link": "…", "fiches": [0, 1, …]},
      "nouvelles": [ {"key": "…", "name": "…", "description": "…", "link": "…",
                      "soustheme": "Titre court", "fiches": [12, 13, …]} ] } }
La boîte d'origine garde sa clé (et sa place dans le programme) avec les
fiches de « garde » ; les autres fiches y sont notées « retirées » (Darwin
Admin les enlève de la boîte publiée) et passent dans les nouvelles boîtes,
ajoutées juste après elle et rangées comme sous-thèmes du même chapitre dans
data/programme.json.

Les marqueurs `w` / `wq` (empreintes des anciennes versions de la fiche)
sont tenus à jour comme le fait Darwin Admin, pour que les boîtes déjà
publiées retrouvent leurs fiches. Une fiche coupée garde ses marqueurs sur
la première partie ; les autres sont nouvelles.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

FICHIER = Path(__file__).resolve().parent.parent / "bibliotheque.json"


def norm(s):
    s = str(s or "").replace("\r\n", "\n").replace("\r", "\n")
    return "\n".join(l.strip() for l in s.split("\n")).strip()


def fnv(s):
    h = 0x811C9DC5
    for ch in s:
        # même calcul que packHash (admin/admin.js) : charCodeAt = unités UTF-16
        for u in utf16_units(ch):
            h ^= u
            h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def utf16_units(ch):
    b = ch.encode("utf-16-le")
    return [b[i] | (b[i + 1] << 8) for i in range(0, len(b), 2)]


def pack_hash(s):
    return fnv(norm(s))


def pack_qa_hash(q, a):
    return fnv(norm(q) + "\u0001" + norm(a))


def as_list(v):
    return v if isinstance(v, list) else ([v] if v else [])


# Même détecteur que qcmQuestionNeedsChoices (js/settings-model.js), lancé
# avec node pour ne pas le réécrire.
def questions_a_revoir(questions):
    import subprocess

    racine = FICHIER.parent
    code = (
        "global.window=global;require('./js/settings-model.js');"
        "const f=(global.FichesSettingsModel||global.SettingsModel||{}).qcmQuestionNeedsChoices;"
        "const qs=JSON.parse(require('fs').readFileSync(0,'utf8'));"
        "if(!f){console.log('[]');process.exit(0);}"
        "console.log(JSON.stringify(qs.map((q,i)=>f(q)?i:-1).filter(i=>i>=0)));"
    )
    r = subprocess.run(["node", "-e", code], input=json.dumps(questions), capture_output=True, text=True, cwd=racine)
    try:
        return json.loads(r.stdout.strip() or "[]")
    except ValueError:
        print("détecteur QCM indisponible :", r.stderr[:300])
        return []


def plusieurs_questions(q):
    """Repère les fiches qui posent sans doute plusieurs questions."""
    q = q.replace("\n", " ")
    if q.count("?") > 1:
        return True
    return bool(re.search(r"\b(où et quand|quand et où|qui et quand|et pourquoi|et comment|et quand|et où|et qui|et quel(le)?s?)\b", q, re.I))


# Fiches « hors sujet » (14 nov. 2026, spéc. §5.7 règle 8) : une fiche doit
# porter sur le savoir de la boîte, pas sur l'organisation de l'école
# (nombre d'axes, de thèmes ou de notions d'un programme, déroulement d'une
# épreuve…). Ces questions sont admises seulement dans les boîtes de méthode.
HORS_SUJET = re.compile(
    r"(combien (d'|de )?(axes|thèmes|notions|entrées|chapitres|objets d'étude|questionnements)\b.*programme"
    r"|\b(axes?|thèmes?|notions?|entrées?|objets? d'étude) (du|de ce|d'un) programme"
    r"|programme (officiel |de [a-zé]+ )?(de|du|des) (cycle|seconde|première|terminale|[0-9]e\b|6e|5e|4e|3e)"
    r"|(fait|font)(-elle|-il)? partie du programme|une entrée du programme|cycle terminal"
    r"|(épreuve|sujets?) (de [a-zé]+ )?(du|au) (brevet|bac(calauréat)?)\b|coefficient de l'épreuve)",
    re.I)
# 16 nov. 2026 : les fiches de méthode d'exercice (dissertation,
# commentaire, introduction, problématique, plan…) n'ont leur place que
# dans une boîte de méthode, pas dans une boîte de connaissances.
METHODE_FICHE = re.compile(
    r"(dissertation|commentaire (de texte|composé|littéraire)|explication de texte|analyse linéaire"
    r"|étude (critique )?de documents?|paragraphe argumenté|réponse organisée"
    r"|(introduction|conclusion|problématique|annonce du plan|accroche)\b.*\b(copie|dissertation|commentaire|devoir|sujet)"
    r"|(étapes?|parties?) d'une (introduction|conclusion|dissertation)|plan (dialectique|thématique|analytique))",
    re.I)
BOITE_METHODE = re.compile(r"méthod|épreuve|oral\b|réussir|révisions? du|automatism|dissertation|commentaire|écrit d", re.I)


def hors_sujet(question, nom_boite):
    """Vrai si la fiche parle de l'organisation de l'école (ou de la méthode
    d'un exercice) dans une boîte qui n'est pas une boîte de méthode."""
    return bool(HORS_SUJET.search(question) or METHODE_FICHE.search(question)) and not BOITE_METHODE.search(nom_boite)


def charge():
    return json.loads(FICHIER.read_text(encoding="utf-8"))


def sauve(d):
    FICHIER.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def a_revoir(b):
    return (not b.get("link")) or any(not c.get("wrongs") for c in b["cards"])


def nouvelle_fiche(src, ch, garder_marques):
    q = ch.get("q", src.get("question", "") if src else "")
    a = ch.get("a", src.get("answer", "") if src else "")
    out = {"question": q, "answer": a}
    if src and garder_marques:
        old_qa, old_q = pack_qa_hash(src["question"], src["answer"]), pack_hash(src["question"])
        new_qa, new_q = pack_qa_hash(q, a), pack_hash(q)
        ws = ([old_qa] if old_qa != new_qa else []) + [x for x in as_list(src.get("w")) if x not in (old_qa, new_qa)]
        wqs = ([old_q] if old_q != new_q else []) + [x for x in as_list(src.get("wq")) if x not in (old_q, new_q)]
        if ws:
            out["w"] = ws if len(ws) > 1 else ws[0]
        if wqs:
            out["wq"] = wqs if len(wqs) > 1 else wqs[0]
    more = ch.get("more", src.get("more") if src else None)
    if more:
        out["more"] = more
    wrongs = ch.get("wrongs", src.get("wrongs") if src else None)
    if wrongs:
        out["wrongs"] = wrongs
    link = ch.get("link", src.get("link") if src else None)
    if link:
        out["link"] = link
    # Formes poussées (spéc. §4.7, v296) : question poussée q2/a2 et texte à
    # trous cloze ; gardées si le lot ne les change pas.
    for champ in ("q2", "a2", "cloze"):
        val = ch.get(champ, src.get(champ) if src else None)
        if val:
            out[champ] = val
    return out


def retire(box, card):
    """Note l'empreinte d'une fiche retirée (et de ses anciennes versions)."""
    deja = as_list(box.get("retirees"))
    for h in [pack_qa_hash(card["question"], card["answer"])] + as_list(card.get("w")):
        if h not in deja:
            deja.append(h)
    box["retirees"] = deja


def applique(lot_path):
    d = charge()
    lot = json.loads(Path(lot_path).read_text(encoding="utf-8"))
    boxes = {b["key"]: b for b in d["boxes"]}
    for key, ch in lot.items():
        b = boxes.get(key)
        if not b:
            print("boîte inconnue :", key)
            continue
        if ch.get("link"):
            b["link"] = ch["link"]
        if ch.get("description"):
            b["description"] = ch["description"]
        cards = ch.get("cards", {})
        new = []
        for i, c in enumerate(b["cards"]):
            k = str(i)
            if k not in cards:
                new.append(c)
            elif cards[k] is None:
                # v291 : fiche retirée — son empreinte est notée dans la
                # boîte (« retirees ») pour que Darwin Admin la supprime
                # aussi de la collection déjà publiée.
                retire(b, c)
                continue
            elif isinstance(cards[k], list):
                for j, part in enumerate(cards[k]):
                    new.append(nouvelle_fiche(c if j == 0 else None, part, j == 0))
            else:
                new.append(nouvelle_fiche(c, cards[k], True))
        b["cards"] = new
    sauve(d)
    controles_apres_enregistrement(list(lot.keys()))


def decoupe(plan_path):
    d = charge()
    plan = json.loads(Path(plan_path).read_text(encoding="utf-8"))
    prog_path = FICHIER.parent / "data" / "programme.json"
    prog = json.loads(prog_path.read_text(encoding="utf-8"))
    cles = {b["key"] for b in d["boxes"]}
    touchees = []
    for key, p in plan.items():
        i = next(j for j, b in enumerate(d["boxes"]) if b["key"] == key)
        b = d["boxes"][i]
        parts = [p["garde"]] + p["nouvelles"]
        vus = sorted(n for part in parts for n in part["fiches"])
        assert vus == list(range(len(b["cards"]))), f"{key} : chaque fiche doit aller dans une seule partie"
        cartes = b["cards"]
        nouvelles = []
        for part in p["nouvelles"]:
            assert part["key"] not in cles, part["key"]
            cles.add(part["key"])
            nb = {
                "key": part["key"], "name": part["name"], "level": b.get("level"),
                "description": part["description"], "link": part["link"],
                "cards": [cartes[n] for n in part["fiches"]],
                "priceTokens": b.get("priceTokens", 0),
                "taxonomy": b.get("taxonomy"), "tags": part.get("tags", b.get("tags", [])),
            }
            nouvelles.append({k: v for k, v in nb.items() if v is not None})
            for n in part["fiches"]:
                retire(b, cartes[n])
        b["name"], b["description"], b["link"] = p["garde"]["name"], p["garde"]["description"], p["garde"]["link"]
        b["cards"] = [cartes[n] for n in p["garde"]["fiches"]]
        d["boxes"][i + 1:i + 1] = nouvelles
        touchees += [key] + [nb["key"] for nb in nouvelles]
        # Programme : nouvelles boîtes en sous-thèmes du chapitre d'origine.
        place = False
        for niv in prog["niveaux"]:
            for m in niv["matieres"]:
                for c in m["chapitres"]:
                    dans_sous = next((k for k, st in enumerate(c.get("sousthemes", [])) if any(x["cle"] == key for x in st["boites"])), None)
                    if any(x["cle"] == key for x in c["boites"]) or dans_sous is not None:
                        st = c.setdefault("sousthemes", [])
                        pos = len(st) if dans_sous is None else dans_sous + 1
                        st[pos:pos] = [{"titre": part["soustheme"], "boites": [{"cle": part["key"], "titre": part["name"], "fiches": len(part["fiches"])}]} for part in p["nouvelles"]]
                        place = True
        if not place:
            print(f"(boîte {key} absente du programme : nouvelles boîtes à ranger à la main)")
    sauve(d)
    prog_path.write_text(json.dumps(prog, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    controles_apres_enregistrement(touchees)


def probleme_texte_a_trous(cloze):
    """Défauts d'un texte à trous (forme c, spéc. §4.7) : même règle que
    validCloze dans js/card-forms.js, plus les propositions en double."""
    if not isinstance(cloze, dict) or not isinstance(cloze.get("blanks"), list) or not cloze["blanks"]:
        return ["format incorrect"]
    out = []
    trous = len(re.findall(r"_{3,}", str(cloze.get("text", ""))))
    if trous != len(cloze["blanks"]):
        out.append(f"{trous} trou(s) « ___ » dans le texte pour {len(cloze['blanks'])} réponse(s)")
    for k, t in enumerate(cloze["blanks"], 1):
        props = [str(t.get("answer", "")).strip()] + [str(w).strip() for w in t.get("wrongs") or []]
        if len(props) != 4 or not all(props):
            out.append(f"trou {k} : il faut 1 réponse et 3 mauvaises réponses")
        elif len({norm(x).lower() for x in props}) != 4:
            out.append(f"trou {k} : propositions en double")
    texte = str(cloze.get("text", ""))
    if re.search(r"_{3,}\s*_{3,}", texte):
        out.append("deux trous collés (garder des mots visibles entre les trous)")
    # Article élidé ou non devant un trou, que les propositions ne suivent
    # pas toutes (« l'___ » avec une proposition qui commence par une
    # consonne) : la bonne réponse se devine. Mettre l'article DANS le trou.
    for k, (avant, t) in enumerate(zip(re.split(r"_{3,}", texte), cloze["blanks"]), 1):
        props = [str(t.get("answer", "")).strip()] + [str(w).strip() for w in t.get("wrongs") or []]
        voyelles = [commence_par_voyelle(x) for x in props if x]
        if re.search(r"(?:^|[\s(«])[lLdDjJ][’']\s*$", avant) and not all(voyelles):
            out.append(f"trou {k} : « {avant.strip()[-2:]} » devant le trou, mais toutes les propositions ne commencent pas par une voyelle (mettre l'article dans le trou)")
        elif re.search(r"(?:^|\s)(le|la|de|du|au|que|ce)\s*$", avant, re.I) and any(voyelles):
            out.append(f"trou {k} : « {avant.split()[-1]} » devant le trou, mais une proposition commence par une voyelle (mettre l'article dans le trou)")
    return out


VOYELLES = "aeiouyhàâäéèêëîïôöùûüœæ"


def commence_par_voyelle(t):
    t = str(t).strip().lower()
    return bool(t) and t[0] in VOYELLES


MOTS_VIDES = {"comment", "quelle", "quels", "quelles", "pourquoi", "combien", "dans", "avec", "pour", "entre", "leurs", "selon",
              "cette", "cela", "sont", "était", "étaient", "appelle", "appellent", "appelle-t-on", "nomme", "est-ce", "elles",
              "aussi", "plus", "moins", "après", "avant", "depuis", "pendant", "sous", "contre", "chez", "vers", "toute", "tous",
              "quand", "quelle", "quels", "lequel", "laquelle"}


def mots(t):
    """Mots significatifs (5 lettres ou plus, sans accents ni majuscules)."""
    t = unicodedata.normalize("NFD", str(t or "").lower())
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")
    return {m for m in re.findall(r"[a-z]{5,}", t) if m not in MOTS_VIDES}


def question_alternative(q, props):
    """Propositions du QCM citées dans la question sous forme d'alternative
    (« A ou B »), quand toutes ne le sont pas ; liste vide sinon."""
    props = [re.sub(r"<[^>]+>", " ", str(x)).split("\n")[0].strip() for x in props if str(x).strip()]
    if len(props) < 3:
        return []
    low = q.lower()
    def pos(x):
        m = re.search(r"(?<!\w)" + re.escape(x.lower()) + r"(?!\w)", low)
        return m.start() if m else -1
    cites = [x for x in props if pos(x) >= 0]
    if len(cites) < 2 or len(cites) == len(props):
        return []
    cites.sort(key=pos)
    for x, y in zip(cites, cites[1:]):
        entre = low[pos(x) + len(x):pos(y)]
        if len(entre) <= 12 and re.search(r"\bou\b|\bor\b", entre):
            return [x, y]
    return []


def qualite(keys=None):
    """Défauts de qualité des fiches QCM (remarques du 18 nov. 2026, spéc.
    §5.7) : indice dans la question, bonne réponse plus détaillée que les
    fausses ; et textes à trous (article qui trahit, trous collés).
    Liste à relire : une alerte n'est pas toujours une erreur."""
    d = charge()
    stats = {"indice": 0, "détail": 0, "forme": 0, "texte à trous": 0, "formes poussées": 0}
    for b in d["boxes"]:
        if keys and b["key"] not in keys:
            continue
        acceptees = set(as_list(b.get("qualite_ok")))
        # Noms déjà présents dans la boîte (titre, description, fiches (a)/(b)).
        contexte = " ".join([b.get("name", ""), b.get("description", "")] + [x["question"] + " " + x["answer"] + " " + (x.get("more") or "") for x in b["cards"]])
        for i, c in enumerate(b["cards"]):
            w = c.get("wrongs") or []
            # 21 nov. 2026 (remarque du propriétaire) : une question qui
            # propose une alternative tirée des propositions (« for ou
            # since ? ») laisse éliminer les autres sans réfléchir. Cette
            # alerte ne s'accepte pas : il faut reformuler la question.
            alt = question_alternative(c["question"], [c["answer"]] + w)
            if alt:
                stats["indice"] += 1
                print(f"[{b['key']}#{i}] la question propose une alternative ({' ou '.join(alt)}) : reformuler sans citer les propositions : {c['question'][:70]}")
            if c["question"] in acceptees:
                continue  # alerte relue et acceptée (commande « accepte »)
            principale = re.sub(r"<[^>]+>", " ", c["answer"]).split("\n")[0].strip()
            if w:
                # Indice : un mot de la question qu'on retrouve dans la bonne
                # réponse et dans AUCUNE des fausses (sinon rien ne se devine).
                dans_fausses = set().union(*({m[:6] for m in mots(x)} for x in w))
                commun = ({m[:6] for m in mots(principale)} & {m[:6] for m in mots(c["question"])}) - dans_fausses
                if dans_fausses & {m[:6] for m in mots(c["question"])}:
                    commun = set()  # la question cite aussi des propositions fausses
                if commun:
                    stats["indice"] += 1
                    print(f"[{b['key']}#{i}] indice dans la question ({', '.join(sorted(commun))}) : {c['question'][:70]} → {principale[:40]}")
                plus_long = max(len(x) for x in w)
                if len(principale) > 1.6 * plus_long and len(principale) - plus_long > 15:
                    stats["détail"] += 1
                    print(f"[{b['key']}#{i}] bonne réponse plus détaillée que les fausses ({len(principale)} / {plus_long} caractères) : {principale[:60]}")
                # 19 nov. 2026 (remarques du propriétaire) : un mot présent
                # dans les 3 fausses et absent de la bonne (« seulement »…)
                # donne la forme de la bonne réponse.
                forme = set.intersection(*({m[:6] for m in mots(x)} for x in w)) - {m[:6] for m in mots(c["answer"])}
                forme &= {"seulem", "unique", "toujou", "jamais", "aucune"}  # mots qui restreignent
                if len(w) == 3 and forme:
                    stats["forme"] += 1
                    print(f"[{b['key']}#{i}] fausses réponses de même forme ({', '.join(sorted(forme))}) : {c['question'][:70]}")
            if c.get("cloze"):
                for msg in probleme_texte_a_trous(c["cloze"]):
                    stats["texte à trous"] += 1
                    print(f"[{b['key']}#{i}] texte à trous : {msg}")
            for msg in probleme_formes_poussees(c, contexte):
                stats["formes poussées"] += 1
                print(f"[{b['key']}#{i}] {msg} : {c['question'][:60]}")
    print("alertes :", ", ".join(f"{k} {v}" for k, v in stats.items()))
    return sum(stats.values())


def controles_apres_enregistrement(keys):
    """19 nov. 2026 (demande du propriétaire) : à chaque enregistrement de
    boîtes, contrôles de base ET contrôles de qualité (spéc. §5.7, règles
    9 à 11) sur les boîtes touchées. S'il reste des alertes, l'outil le dit
    clairement et se termine en erreur : le lot est enregistré, mais il
    faut corriger chaque alerte ou l'accepter (« accepte CLE#N ») après
    relecture."""
    verifie(keys)
    print("\n— Contrôles de qualité (spéc. §5.7, règles 9 à 11) —")
    n = qualite(keys)
    if n:
        print(f"\n⚠ {n} alerte(s) de qualité sur les boîtes enregistrées : à corriger, "
              "ou à accepter après relecture (commande « accepte CLE#N »).")
        sys.exit(2)
    print("Qualité : aucune alerte.")


def texte_complete(cloze):
    """Texte à trous rempli avec les bonnes réponses."""
    morceaux = re.split(r"_{3,}", str(cloze.get("text", "")))
    out = morceaux[0]
    for t, suite in zip(cloze.get("blanks", []), morceaux[1:]):
        out += str(t.get("answer", "")) + suite
    return out


def infos(t):
    """Mots significatifs et nombres (dates…) d'un texte."""
    return mots(t) | set(re.findall(r"\d{3,}", t or ""))


def probleme_formes_poussees(c, contexte=""):
    """Règles des formes (c) et (d) (spéc. §5.7 règle 11, 19 nov. 2026)."""
    out = []
    q2, a2, cloze = c.get("q2") or "", c.get("a2") or "", c.get("cloze")
    if q2:
        mq, mq2 = mots(c["question"]), mots(q2)
        if mq and mq2 and len(mq & mq2) / len(mq | mq2) >= 0.6:
            out.append("question poussée trop proche de la question")
    if a2:
        # 19 nov. 2026 (2e remarques) : la forme poussée doit demander plus
        # que la question (b), pas redire sa réponse.
        ia2 = infos(a2)
        if ia2 and len(ia2 & infos(c["question"] + " " + c["answer"])) / len(ia2) >= 0.7:
            out.append("réponse poussée presque identique à la question et à la réponse (b)")
    if q2:
        # Un nom propre qui « tombe du ciel » dans la question poussée doit
        # d'abord apparaître dans la fiche (question, réponse ou complément).
        connu = norm(" ".join([c["question"], c["answer"], c.get("more") or "", contexte])).lower()
        # 21 nov. 2026 : le premier mot d'une phrase citée (« Regarde ! … »,
        # phrase à traduire d'une boîte de langue) n'est pas un nom.
        noms = {m for m in re.findall(r"(?<![.?!«]\s)(?<!^)\b([A-ZÉÈ][a-zéèêëïîôûç]{3,})", q2)}
        nouveaux = sorted(n for n in noms if norm(n).lower() not in connu)
        if nouveaux:
            out.append(f"nom nouveau dans la question poussée, absent du reste de la boîte ({', '.join(nouveaux)})")
    if cloze and a2:
        # 21 nov. 2026 : dans un exercice de langue, le verbe à employer est
        # donné entre parenthèses (« (go) ») ; il ne compte pas dans la phrase.
        rempli = mots(re.sub(r"\([^()]*\)", " ", texte_complete(cloze)))
        if rempli and len(rempli & mots(a2)) / len(rempli) < 0.7:
            out.append("réponse poussée trop éloignée du texte à trous")
    if cloze and q2:
        devoile = set()
        for t in cloze.get("blanks", []):
            devoile |= infos(str(t.get("answer", ""))) & infos(q2)
        if devoile:
            out.append(f"question poussée qui donne une réponse du texte à trous ({', '.join(sorted(devoile))})")
    return out


def accepte(refs):
    """Marque des alertes de qualité comme relues et acceptées (le mot
    commun fait partie de la notion à apprendre, la question cite ses
    propositions…) : « CLE#N » ; la question est notée dans le champ
    « qualite_ok » de la boîte, et la commande « qualite » ne la signale
    plus (tant que la question ne change pas)."""
    d = charge()
    boites = {b["key"]: b for b in d["boxes"]}
    for ref in refs:
        cle, _, n = ref.partition("#")
        b = boites[cle]
        q = b["cards"][int(n)]["question"]
        ok = as_list(b.get("qualite_ok"))
        if q not in ok:
            b["qualite_ok"] = ok + [q]
        print(f"accepté : [{ref}] {q[:70]}")
    sauve(d)


def verifie(keys=None):
    d = charge()
    pb = 0
    qs, where = [], []
    for b in d["boxes"]:
        if keys and b["key"] not in keys:
            continue
        # 18 nov. 2026 : toutes les boîtes ont une vidéo ; le contrôle vaut
        # désormais pour toute la Librairie (avant, seulement les boîtes modifiées).
        if not b.get("link"):
            print(f"[{b['key']}] pas de lien de boîte")
            pb += 1
        for i, c in enumerate(b["cards"]):
            w = c.get("wrongs")
            if keys:
                if not w or len(w) != 3:
                    print(f"[{b['key']}#{i}] QCM incomplet : {c['question'][:60]}")
                    pb += 1
                elif len({norm(x) for x in w} | {norm(c["answer"])}) != 4:
                    print(f"[{b['key']}#{i}] réponses en double : {c['question'][:60]}")
                    pb += 1
            if hors_sujet(c["question"], b.get("name", "")) or (c.get("q2") and hors_sujet(c["q2"], b.get("name", ""))):
                print(f"[{b['key']}#{i}] fiche hors sujet (programme, épreuve…) : {c['question'][:80]}")
                pb += 1
            if bool(c.get("q2", "").strip()) != bool(c.get("a2", "").strip()):
                print(f"[{b['key']}#{i}] question poussée sans réponse (ou l'inverse) : {c['question'][:60]}")
                pb += 1
            if c.get("cloze") is not None:
                for msg in probleme_texte_a_trous(c["cloze"]):
                    print(f"[{b['key']}#{i}] texte à trous : {msg} : {c['question'][:60]}")
                    pb += 1
            if w:
                qs.append(c["question"])
                where.append(f"{b['key']}#{i}")
    for i in questions_a_revoir(qs):
        print(f"[{where[i]}] question QCM qui renvoie aux propositions : {qs[i][:80]}")
        pb += 1
    print("contrôles :", "aucun problème" if not pb else f"{pb} problème(s)")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "liste"
    if cmd == "liste":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        d = charge()
        todo = [b for b in d["boxes"] if a_revoir(b)]
        print(f"{len(todo)} boîtes à revoir")
        for b in todo[:n]:
            print(b["key"], len(b["cards"]), "fiches", "" if b.get("link") else "(sans lien)")
    elif cmd in ("montre", "montre-reste"):
        d = charge()
        for b in d["boxes"]:
            if b["key"] not in sys.argv[2:]:
                continue
            print(f"=== {b['key']} | {b['name']} | {b.get('level','')} | {len(b['cards'])} fiches | lien: {b.get('link','')}")
            for i, c in enumerate(b["cards"]):
                if cmd == "montre-reste" and c.get("wrongs") and not plusieurs_questions(c["question"]):
                    continue
                q = c["question"].replace("\n", " / ")
                a = c["answer"].replace("\n", " / ")
                print(f"{i}. Q: {q}\n   R: {a}" + ("" if not c.get("wrongs") else f"\n   F: {' | '.join(c['wrongs'])}"))
    elif cmd == "applique":
        applique(sys.argv[2])
    elif cmd == "verifie":
        verifie(sys.argv[2:] or None)
    elif cmd == "qualite":
        qualite(sys.argv[2:] or None)
    elif cmd == "accepte":
        accepte(sys.argv[2:])
    elif cmd == "decoupe":
        decoupe(sys.argv[2])


if __name__ == "__main__":
    main()
