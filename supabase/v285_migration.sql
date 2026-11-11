-- ============================================================
-- darwin — v285 (11 nov. 2026) : texte de l'accord reformulé
-- ============================================================
-- QUOI FAIRE : copier ce fichier dans l'éditeur SQL de Supabase, d'abord
-- dans le projet de TEST (darwin-test), puis dans le projet RÉEL AU MOMENT
-- de fusionner la version v285 de l'appli (l'appli v285 affiche ce texte ;
-- sans lui, elle ne peut pas recueillir l'accord). « Run ».
-- Le script peut être relancé sans risque (idempotent).
--
-- CONTENU : nouvelle version « 2026-11-11-v2 » du texte de l'accord, plus
-- claire : les deux cases sont à cocher pour pouvoir partager ou publier ;
-- la 2e est l'autorisation donnée à darwin de proposer la boîte dans son
-- abonnement (l'abonnement sert à réviser les boîtes de la Librairie,
-- partager ou publier n'en demande aucun). Même règle qu'avant ; la version
-- précédente reste gardée, et les accords déjà donnés restent valables.
-- ============================================================
insert into public.library_license_texts (version, body, sha256)
select v, b, encode(sha256(convert_to(b, 'UTF8')), 'hex')
from (values ('2026-11-11-v2', $txt$1. Licence de partage (case à cocher pour pouvoir partager ou publier ta boîte)
En partageant cette boîte avec une classe ou en la publiant, tu accordes à darwin, pour cette boîte et ses versions successives que tu partages, une licence non exclusive, gratuite et mondiale, pour toute la durée des droits d'auteur : darwin peut la reproduire, l'héberger, la corriger, la compléter, la traduire, la réorganiser, la classer et la mettre à disposition de ses utilisateurs dans sa Librairie, directement ou par ses prestataires. Ces adaptations améliorent la qualité, l'exactitude ou l'organisation de la boîte ; elles en respectent le sens et la finalité et ne la dénaturent pas. Cette licence n'est pas une renonciation à tes droits moraux.
Ta boîte reste à toi : tu peux continuer à l'utiliser, à la modifier et à la diffuser ailleurs. Par défaut ton nom n'est pas affiché ; tu peux demander à tout moment qu'il le soit (ou un pseudonyme).
Tu confirmes avoir le droit de la partager : contenu écrit par toi ou utilisé avec l'autorisation de ses auteurs (citer une source ne suffit pas) ; si tu es agent public, dans le respect des droits de ton employeur sur les contenus créés dans le cadre de tes fonctions.

2. Utilisation de ta boîte dans l'abonnement darwin (case à cocher pour pouvoir partager ou publier ta boîte)
L'abonnement darwin donne accès, pour réviser, à toutes les boîtes de la Librairie, sans achat à l'unité. En cochant cette case, tu autorises gratuitement darwin à y proposer ta boîte, et tu reconnais que darwin tire des revenus de ses abonnements sans rémunération attachée à ta boîte, sous réserve des dispositions légales impératives. Partager ou publier ne demande aucun abonnement de ta part.$txt$)) t(v, b)
on conflict (version) do nothing;
