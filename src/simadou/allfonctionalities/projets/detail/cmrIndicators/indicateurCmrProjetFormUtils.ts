import type { SelectOption } from '@/Global/types/formConfig'
import type { IndicateurCadreResultat } from '@/simadou/allTypes'
import type { IndicateurCmrProjet } from '@/simadou/allTypes/indicateurCmrProjet'
import type { IndicateurCmrCreateData } from '@/simadou/schemas/indicateursSchemas'
import { resolveRelationCode, resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import {
  buildDictionnaireIndicateurSelectOptions,
  resolveReferentielCmrId,
} from '@/simadou/allfonctionalities/politique/indicateurs-cmr/indicateurCmrFormUtils'

export { buildDictionnaireIndicateurSelectOptions, resolveReferentielCmrId }

export function filterIndicateursCadreResultatByNiveau(
  indicateurs: IndicateurCadreResultat[],
  niveauNombre: number,
  codeProjet?: string | null
): IndicateurCadreResultat[] {
  return indicateurs.filter((indicateur) => {
    if (Number(indicateur.niveau_iop) !== niveauNombre) return false

    if (codeProjet) {
      const projetCode =
        resolveRelationCode(indicateur.projet_iop, 'code_projet') ??
        (typeof indicateur.projet_iop === 'string' ? indicateur.projet_iop : null)
      if (projetCode && projetCode !== codeProjet) return false
    }

    return true
  })
}

export function resolveResultatCmrProjetId(
  indicateur?: IndicateurCmrProjet | null
): number | null {
  if (!indicateur) return null
  const value = indicateur.resultat_cmr
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return resolveRelationId(value, 'id_indicateur_cr_iop')
}

export function resolveResultatCmrProjetLabel(
  value: IndicateurCmrProjet['resultat_cmr']
): string {
  if (value == null) return ''
  if (typeof value === 'object') {
    const code = value.code_indicateur_cr_iop
    const intitule = value.intitule_indicateur_cr_iop
    if (code && intitule) return `${code} — ${intitule}`
    return intitule ?? code ?? ''
  }
  return String(value)
}

export function buildIndicateurCadreResultatSelectOptions(
  indicateurs: IndicateurCadreResultat[],
  currentResultatId?: number | null
): SelectOption[] {
  const options = indicateurs
    .filter((ind) => ind.id_indicateur_cr_iop != null)
    .map((ind) => ({
      value: ind.id_indicateur_cr_iop,
      label: `${ind.code_indicateur_cr_iop} — ${ind.intitule_indicateur_cr_iop}`,
    }))

  if (
    currentResultatId != null &&
    !options.some((opt) => Number(opt.value) === currentResultatId)
  ) {
    options.unshift({
      value: currentResultatId,
      label: `Indicateur cadre résultat #${currentResultatId}`,
    })
  }

  return options
}

export function indicateurCmrProjetToFormValues(
  indicateur?: IndicateurCmrProjet | null
): IndicateurCmrCreateData {
  return {
    code_ref_ind: indicateur?.code_ref_ind ?? '',
    resultat_cmr: resolveResultatCmrProjetId(indicateur) ?? 0,
    intitule_ref_ind: indicateur?.intitule_ref_ind ?? '',
    reference_cmr: indicateur?.reference_cmr ?? '',
    annee_reference: indicateur?.annee_reference ?? new Date().getFullYear(),
    responsable_collecte_cmr: indicateur?.responsable_collecte_cmr ?? '',
    cible_cmr: indicateur?.cible_cmr ?? '',
    fonction_agregat_cmr: indicateur?.fonction_agregat_cmr ?? '',
    referentiel_cmr: resolveReferentielCmrId(indicateur),
  }
}
