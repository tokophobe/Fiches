#!/usr/bin/env python3
"""v305 : remarques de l'administrateur sur les fiches et les boîtes
(table admin_remarks, supabase/v305_remarques_migration.sql).

Utilisation :
  python3 tools/remarques.py nouvelles          -> remarques en attente (lancé tout seul
                                                   au début de chaque demande, voir
                                                   .claude/settings.json) ; n'affiche
                                                   rien s'il n'y en a pas
  python3 tools/remarques.py toutes             -> toutes les remarques
  python3 tools/remarques.py repond ID STATUT "réponse" [--base test|reel]
                                                -> STATUT : traitee ou question

Les deux bases (réelle et test) sont lues ; l'accès se fait par les
fonctions claude_remarks / claude_remark_reply, protégées par le code
d'accès envoyé dans l'en-tête x-remarques-token. Ce code n'est jamais
écrit ici : il est enregistré dans l'environnement (« secret réseau »)
et ajouté automatiquement aux requêtes vers chaque base.
"""
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.request

ICI = os.path.dirname(os.path.abspath(__file__))
FORMES = {"a": "QCM", "b": "question", "c": "texte à trous", "cbis": "texte à trous sans propositions", "d": "question poussée"}


def bases():
    """{nom: (url, clé anon)} lus dans js/config.js (clés publiques)."""
    txt = open(os.path.join(ICI, "..", "js", "config.js"), encoding="utf-8").read()
    out = {}
    for nom, var in (("reel", "REAL"), ("test", "TEST")):
        m = re.search(var + r"\s*=\s*\{\s*supabaseUrl:\s*\"([^\"]+)\",\s*supabaseAnonKey:\s*\"([^\"]+)\"", txt)
        if m:
            out[nom] = (m.group(1), m.group(2))
    return out


def contexte_ssl():
    for ca in (os.environ.get("SSL_CERT_FILE"), os.environ.get("REQUESTS_CA_BUNDLE"), "/root/.ccr/ca-bundle.crt"):
        if ca and os.path.exists(ca):
            return ssl.create_default_context(cafile=ca)
    return ssl.create_default_context()


def rpc(base, fonction, args, delai=6):
    url, cle = bases()[base]
    req = urllib.request.Request(
        f"{url}/rest/v1/rpc/{fonction}",
        data=json.dumps(args).encode("utf-8"),
        headers={"apikey": cle, "Authorization": f"Bearer {cle}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=delai, context=contexte_ssl()) as r:
        corps = r.read().decode("utf-8")
        return json.loads(corps) if corps.strip() else None


def lire(toutes, silencieux):
    trouvees = []
    for base in bases():
        try:
            lignes = rpc(base, "claude_remarks", {"p_all": toutes}) or []
        except (urllib.error.URLError, OSError, ValueError) as e:
            if not silencieux:
                print(f"[{base}] lecture impossible : {e}", file=sys.stderr)
            continue
        for r in lignes:
            r["_base"] = base
            trouvees.append(r)
    return trouvees


def affiche(r):
    snap = r.get("card_snapshot") or {}
    lieu = "boîte" if r.get("scope") == "boite" else ("révision" if r.get("context") == "revision" else "page de la boîte")
    if snap.get("lieu") == "librairie":  # v306 : remarque faite dans la Librairie
        lieu += " (Librairie)"
    forme = f", forme affichée : {FORMES.get(r.get('form'), r.get('form'))}" if r.get("form") else ""
    print(f"- id {r['id']} (base {r['_base']}, {r.get('created_at', '')[:16]}, {lieu}{forme}, statut {r.get('status')})")
    print(f"  Boîte : {r.get('box_name') or '?'}")
    if snap.get("question"):
        print(f"  Fiche : {snap.get('question', '')} → {str(snap.get('answer', '')).splitlines()[0] if snap.get('answer') else ''}")
        if snap.get("cloze"):
            print(f"  Texte à trous : {snap['cloze'].get('text', '')}")
        if snap.get("q2"):
            print(f"  Question poussée : {snap['q2']}")
    print(f"  Remarque : {r.get('body', '')}")
    if r.get("reply"):
        print(f"  Réponse déjà donnée : {r['reply']}")


def main(argv):
    cmd = argv[1] if len(argv) > 1 else "nouvelles"
    if cmd in ("nouvelles", "toutes"):
        liste = lire(cmd == "toutes", silencieux=(cmd == "nouvelles"))
        if not liste:
            if cmd == "toutes":
                print("Aucune remarque.")
            return 0
        if cmd == "nouvelles":
            print(f"REMARQUES DU PROPRIÉTAIRE EN ATTENTE ({len(liste)}) — à traiter en priorité, puis "
                  "« python3 tools/remarques.py repond ID traitee|question \"réponse courte\" --base … » :")
        for r in liste:
            affiche(r)
        return 0
    if cmd == "repond" and len(argv) >= 5:
        rid, statut, texte = argv[2], argv[3], argv[4]
        base = "reel"
        if "--base" in argv:
            base = argv[argv.index("--base") + 1]
        rpc(base, "claude_remark_reply", {"p_id": rid, "p_status": statut, "p_reply": texte})
        print(f"Remarque {rid} ({base}) : {statut}.")
        return 0
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
