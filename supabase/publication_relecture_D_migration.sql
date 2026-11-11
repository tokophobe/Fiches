-- ============================================================
-- darwin — chantier « publication avec relecture », ÉTAPE D (10 nov. 2026)
-- ============================================================
-- QUOI FAIRE (après les scripts des étapes A et B) :
--   1. Copier tout ce fichier dans l'éditeur SQL de Supabase du projet de
--      TEST (darwin-test), cliquer « Run ».
--   2. Puis dans le projet RÉEL (à n'importe quel moment : ce script
--      ajoute seulement une fonction, il ne gêne pas l'appli en ligne).
--   Le script peut être relancé sans risque (idempotent).
--
-- CONTENU (docs/SPECIFICATION.md §7.2) : darwin retire une boîte de la
-- Librairie (par exemple après une demande de retrait de l'enseignant) ;
-- l'enseignant est prévenu dans « Messages de darwin ». Ceux qui avaient
-- déjà pris la boîte la gardent.
-- Les messages darwin ↔ enseignant existent depuis l'étape A
-- (table library_submission_messages).
-- ============================================================

create or replace function public.admin_withdraw_submission(p_id uuid, p_note text)
returns void language plpgsql security definer set search_path = public as $f$
declare
  sub public.library_submissions;
begin
  perform public.admin_assert();
  select * into sub from public.library_submissions where id = p_id for update;
  if not found then
    raise exception 'Proposition introuvable';
  end if;
  if sub.status <> 'published' then
    raise exception 'Seule une boîte publiée peut être retirée (état : %)', sub.status;
  end if;
  update public.library_submissions
     set status = 'withdrawn', admin_note = coalesce(p_note, admin_note),
         reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
   where id = p_id;
  -- Les propositions encore ouvertes de la même boîte n'ont plus d'objet.
  if sub.source_subject_id is not null then
    update public.library_submissions
       set status = 'superseded', updated_at = now()
     where owner_id = sub.owner_id and source_subject_id = sub.source_subject_id
       and status in ('pending', 'changes_requested');
  end if;
  insert into public.library_submission_messages (submission_id, from_admin, kind, body)
  values (p_id, true, 'withdrawn', coalesce(p_note, ''));
  if sub.collection_id is not null then
    delete from public.library_collections where id = sub.collection_id;
  end if;
  perform public.admin_log('submission.withdraw', p_id::text,
    jsonb_build_object('collection', sub.collection_id, 'note', p_note));
end;
$f$;
grant execute on function public.admin_withdraw_submission(uuid, text) to authenticated;
