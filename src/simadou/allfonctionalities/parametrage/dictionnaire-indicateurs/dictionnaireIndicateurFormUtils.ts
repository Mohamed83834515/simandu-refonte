import type { DictionnaireIndicateur } from '@/simadou/allTypes'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import type { DictionnaireIndicateurWriteData } from '@/simadou/schemas/dictionnaireIndicateurSchemas'

export function dictionnaireToFormValues(
  dictionnaire?: DictionnaireIndicateur | null
): DictionnaireIndicateurWriteData {
  if (!dictionnaire) {
    return {
      code_ref_ind: '',
      intitule_ref_ind: '',
      unite_cmr: 0,
      fonction_agregat_cmr: '',
      echelle: 0,
      typologie: '',
      seuil_minimum: 0,
      seuil_maximum: 0,
      responsable_collecte_cmr: 0,
    }
  }

  return {
    code_ref_ind: dictionnaire.code_ref_ind ?? '',
    intitule_ref_ind: dictionnaire.intitule_ref_ind ?? '',
    unite_cmr: resolveRelationId(dictionnaire.unite_cmr, 'id_unite') ?? 0,
    fonction_agregat_cmr: dictionnaire.fonction_agregat_cmr ?? '',
    echelle: resolveRelationId(dictionnaire.echelle, 'id_type_zone') ?? 0,
    typologie: dictionnaire.typologie ?? '',
    seuil_minimum: dictionnaire.seuil_minimum ?? 0,
    seuil_maximum: dictionnaire.seuil_maximum ?? 0,
    responsable_collecte_cmr:
      resolveRelationId(dictionnaire.responsable_collecte_cmr, 'id_acteur') ?? 0,
  }
}
