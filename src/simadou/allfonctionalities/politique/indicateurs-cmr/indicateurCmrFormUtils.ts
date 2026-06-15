import type { SelectOption } from '@/Global/types/formConfig'
import type { DictionnaireIndicateur, IndicateurCmr } from '@/simadou/allTypes'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import type { IndicateurCmrCreateData } from '@/simadou/schemas/indicateursSchemas'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function filterIndicateursStrategiqueByNiveau(
  indicateurs: IndicateurStrategique[],
  niveauCodeNumber: number
): IndicateurStrategique[] {
  return indicateurs.filter(
    (ind) => Number(ind.niveau_istr) === niveauCodeNumber
  )
}

export function resolveResultatCmrId(
  indicateur?: IndicateurCmr | null
): number | null {
  if (!indicateur) return null
  const value = indicateur.resultat_cmr
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return resolveRelationId(value, 'id_indicateur_str')
}

export function resolveResultatCmrLabel(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const code =
      (typeof record.code_indicateur_istr === 'string'
        ? record.code_indicateur_istr
        : null) ??
      (typeof record.code_indicateur_cr_iop === 'string'
        ? record.code_indicateur_cr_iop
        : null)
    const intitule =
      (typeof record.intitule_indicateur_istr === 'string'
        ? record.intitule_indicateur_istr
        : null) ??
      (typeof record.intitule_indicateur_cr_iop === 'string'
        ? record.intitule_indicateur_cr_iop
        : null)
    if (code && intitule) return `${code} — ${intitule}`
    return intitule ?? code ?? ''
  }
  return String(value)
}

export function buildIndicateurStrategiqueSelectOptions(
  indicateurs: IndicateurStrategique[],
  currentResultatId?: number | null
): SelectOption[] {
  const options = indicateurs
    .filter((ind) => ind.id_indicateur_str != null)
    .map((ind) => ({
      value: ind.id_indicateur_str,
      label: `${ind.code_indicateur_istr} — ${ind.intitule_indicateur_istr}`,
    }))

  if (
    currentResultatId != null &&
    !options.some((opt) => Number(opt.value) === currentResultatId)
  ) {
    options.unshift({
      value: currentResultatId,
      label: `Indicateur stratégique #${currentResultatId}`,
    })
  }

  return options
}

export function buildDictionnaireIndicateurSelectOptions(
  dictionnaires: DictionnaireIndicateur[],
  currentReferentielId?: number | null
): SelectOption[] {
  const options = dictionnaires
    .filter((item) => item.id_ref_ind_ref != null)
    .map((item) => ({
      value: item.id_ref_ind_ref,
      label: `${item.code_ref_ind} — ${item.intitule_ref_ind}`,
    }))

  if (
    currentReferentielId != null &&
    !options.some((opt) => Number(opt.value) === currentReferentielId)
  ) {
    options.unshift({
      value: currentReferentielId,
      label: `Référentiel #${currentReferentielId}`,
    })
  }

  return options
}

export function resolveReferentielCmrId(
  indicateur?: { referentiel_cmr?: unknown } | null
): number | null {
  return resolveRelationId(indicateur?.referentiel_cmr, 'id_ref_ind_ref')
}

export function indicateurCmrToFormValues(
  indicateur?: IndicateurCmr | null
): IndicateurCmrCreateData {
  return {
    code_ref_ind: indicateur?.code_ref_ind ?? '',
    resultat_cmr: resolveResultatCmrId(indicateur) ?? 0,
    intitule_ref_ind: indicateur?.intitule_ref_ind ?? '',
    reference_cmr: indicateur?.reference_cmr ?? '',
    annee_reference: indicateur?.annee_reference ?? new Date().getFullYear(),
    responsable_collecte_cmr: indicateur?.responsable_collecte_cmr ?? '',
    cible_cmr: indicateur?.cible_cmr ?? '',
    fonction_agregat_cmr: indicateur?.fonction_agregat_cmr ?? '',
    referentiel_cmr: resolveReferentielCmrId(indicateur),
  }
}