-- ============================================================
-- Fiches — Round 23 : Librairie — classement des collections d'après la
-- taxonomie Excel (catégorie → cycle → niveau → année → spécialité →
-- matière) et tags libres.
--
-- À exécuter UNE FOIS dans l'éditeur SQL de ton projet Supabase, APRÈS
-- library_collections_schema.sql et
-- library_collections_ratings_level_price_migration.sql.
-- Idempotent : peut être relancé sans risque.
--
-- `taxonomy` : { "categorie": { "id": "CAT001", "label": "école & études" },
--               "cycle": {...}, "niveau": {...}, "annee": {...},
--               "specialite": {...}, "matiere": {...} }
--              (seuls les champs qui avaient des choix possibles).
-- `tags`     : liste de mots-clés en minuscules.
-- Les collections publiées avant ce round gardent leur ancien `level`,
-- que l'appli convertit à l'affichage et au filtrage.
-- ============================================================

alter table public.library_collections
  add column if not exists taxonomy jsonb not null default '{}'::jsonb;
alter table public.library_collections
  add column if not exists tags text[] not null default '{}';

create index if not exists library_collections_taxonomy_idx
  on public.library_collections using gin (taxonomy);
create index if not exists library_collections_tags_idx
  on public.library_collections using gin (tags);

-- Recharge le schéma côté API (sinon les nouvelles colonnes sont
-- refusées pendant quelques minutes).
notify pgrst, 'reload schema';
