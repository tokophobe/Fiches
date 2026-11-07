#!/usr/bin/env python3
"""Mise à jour des boîtes toutes prêtes (bibliotheque.json), par lots.

Utilisation :
  python3 tools/maj_boites.py liste [N]          -> les N prochaines boîtes à revoir
  python3 tools/maj_boites.py montre CLE...      -> fiches des boîtes (pour relecture)
  python3 tools/maj_boites.py applique LOT.json  -> applique un lot de corrections
  python3 tools/maj_boites.py verifie [CLE...]   -> contrôles (QCM complets, questions)

Format d'un lot (LOT.json) :
  { "cle-de-boite": {
      "link": "https://…",                    (lien « Pour aller plus loin » de la boîte)
      "cards": {
        "3": {"wrongs": ["…", "…", "…"]},      (fiche n° 3 : réponses fausses)
        "4": {"q": "…", "a": "…", "wrongs": […], "more": "…", "link": "…"},
        "5": [ {fiche 1}, {fiche 2} ],         (fiche coupée en plusieurs)
        "6": null                              (fiche supprimée)
      } } }

Les marqueurs `w` / `wq` (empreintes des anciennes versions de la fiche)
sont tenus à jour comme le fait Darwin Admin, pour que les boîtes déjà
publiées retrouvent leurs fiches. Une fiche coupée garde ses marqueurs sur
la première partie ; les autres sont nouvelles.
"""
import json
import re
import sys
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
    return out


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
                continue
            elif isinstance(cards[k], list):
                for j, part in enumerate(cards[k]):
                    new.append(nouvelle_fiche(c if j == 0 else None, part, j == 0))
            else:
                new.append(nouvelle_fiche(c, cards[k], True))
        b["cards"] = new
    sauve(d)
    verifie(list(lot.keys()))


def verifie(keys=None):
    d = charge()
    pb = 0
    qs, where = [], []
    for b in d["boxes"]:
        if keys and b["key"] not in keys:
            continue
        if keys and not b.get("link"):
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


if __name__ == "__main__":
    main()
