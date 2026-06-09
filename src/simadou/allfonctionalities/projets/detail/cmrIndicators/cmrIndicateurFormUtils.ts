import type { CibleCmrProjet, IndicateurCmr, IndicateurCadreResultat } from '@/simadou/allTypes'
import { resolveCodeIndicateurCrpForForm } from '@/simadou/schemas/cibleCmrProjetSchema'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

/** PK utilisée dans code_indicateur_crp pour les cibles liées à un indicateur CMR référentiel. */
export function resolveFixedCodeIndicateurCrpFromCmr(
  indicateurCmr: IndicateurCmr
): number {
  return indicateurCmr.id_ref_ind_cmr
}

export function filterCiblesForIndicateurCmr(
  cibles: CibleCmrProjet[],
  indicateurCmr: IndicateurCmr,
  indicateursCadreResultat: IndicateurCadreResultat[] = [],
  codeProjet?: string | null
): CibleCmrProjet[] {
  const linkedIds = new Set<number>([indicateurCmr.id_ref_ind_cmr])

  for (const i of indicateursCadreResultat) {
    if (i.code_indicateur_cr_iop === indicateurCmr.code_ref_ind) {
      linkedIds.add(i.id_indicateur_cr_iop)
    }
    if (i.intitule_indicateur_cr_iop === indicateurCmr.intitule_ref_ind) {
      linkedIds.add(i.id_indicateur_cr_iop)
    }
  }

  return cibles.filter((cible) => {
    if (codeProjet) {
      const cibleProjet =
        resolveRelationCode(cible.code_projet, 'code_projet') ??
        (typeof cible.code_projet === 'string' ? cible.code_projet : null)
      if (cibleProjet !== codeProjet) return false
    }

    const cibleIndicateurId = resolveCodeIndicateurCrpForForm(cible)
    if (cibleIndicateurId != null && linkedIds.has(cibleIndicateurId)) {
      return true
    }

    const nested = cible.indicateur_crp as IndicateurCadreResultat | null | undefined
    if (nested?.code_indicateur_cr_iop === indicateurCmr.code_ref_ind) {
      return true
    }
    if (nested?.intitule_indicateur_cr_iop === indicateurCmr.intitule_ref_ind) {
      return true
    }

    return false
  })
}
