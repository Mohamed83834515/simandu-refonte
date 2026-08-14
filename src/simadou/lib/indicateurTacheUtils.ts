import type { SelectOption } from '@/Global/types/formConfig'
import type {
  IndicateurTache,
  IndicateurTacheRequest,
} from '@/simadou/allTypes/indicateurTache'
import type { UniteIndicateur } from '@/simadou/allTypes/uniteIndicateur'
import type { IndicateurTacheFormData } from '@/simadou/schemas/indicateurTacheSchemas'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { IndicateurPerformanceProgramme, IndicateurPerformanceProjet } from '../allTypes'

function normalizeTrimestre(value: unknown): number {
  if (value == null) return 0
  return Number(value)
}

export function normalizeIndicateurTache(raw: IndicateurTache): IndicateurTache {
  const idActivite =
    resolveRelationId(raw.id_activite, 'id_ptba') ??
    resolveRelationId(raw.id_activite, 'id_activite') ??
    (typeof raw.id_activite === 'number' ? raw.id_activite : null)

  return {
    ...raw,
    id_indicateur_tache: Number(raw.id_indicateur_tache),
    intitule_indicateur_tache: raw.intitule_indicateur_tache ?? '',
    code_indicateur_ptba: raw.code_indicateur_ptba ?? '',
    unite_ind_tache:
      resolveRelationId(raw.unite_ind_tache, 'id_unite') ??
      (typeof raw.unite_ind_tache === 'number' ? raw.unite_ind_tache : 0),
    indicateur_cmr:
      resolveRelationId(raw.indicateur_cmr, 'id_ref_ind_cmr') ??
      (typeof raw.indicateur_cmr === 'number' ? raw.indicateur_cmr : 0),
    id_activite: idActivite ?? 0,
    trimestre_1: normalizeTrimestre(raw.trimestre_1),
    trimestre_2: normalizeTrimestre(raw.trimestre_2),
    trimestre_3: normalizeTrimestre(raw.trimestre_3),
    trimestre_4: normalizeTrimestre(raw.trimestre_4),
  }
}

export function filterIndicateursByActivite(
  items: IndicateurTache[],
  idActivite: number
): IndicateurTache[] {
  return items
    .map(normalizeIndicateurTache)
    .filter((item) => item.id_activite === idActivite)
}

export function buildIndicateurCmrSelectOptions(
  cmrs: IndicateurPerformanceProgramme[]
): SelectOption[] {
  return cmrs.map((cmr) => {
    const code = cmr.id_indicateur_performance?.toString().trim()
    const intitule = cmr.intitule_indicateur_tache?.trim()
    const label =
      [code, intitule].filter(Boolean).join(' — ') || String(cmr.id_indicateur_performance)

    return {
      value: cmr.id_indicateur_performance,
      label,
    }
  })
}
export function buildIndicateurPerforamnceSelectOptions(
  cmrs: IndicateurPerformanceProjet[]
): SelectOption[] {
  return cmrs.map((cmr) => {

    return {
      value: cmr.id_indicateur_performance,
      label:cmr.intitule_indicateur_tache,
    }
  })
}

export function buildUniteIndicateurSelectOptions(
  unites: UniteIndicateur[]
): SelectOption[] {
  return unites.map((unite) => ({
    value: unite.id_unite,
    label:
      unite.definition_ui?.trim() ||
      unite.unite_ui?.trim() ||
      String(unite.id_unite),
  }))
}

export function resolveIndicateurCmrFormValue(
  value: unknown
): number | undefined {
  const id = resolveRelationId(value, 'id_ref_ind_cmr')
  return id != null && id > 0 ? id : undefined
}

export function resolveUniteIndicateurFormValue(
  value: unknown
): number | undefined {
  const id = resolveRelationId(value, 'id_unite')
  return id != null && id > 0 ? id : undefined
}

export function buildIndicateurTachePayload(
  data: IndicateurTacheFormData,
  idActivite: number
): IndicateurTacheRequest {
  return {
    intitule_indicateur_tache: data.intitule_indicateur_tache.trim(),
    code_indicateur_ptba: data.code_indicateur_ptba.trim(),
    unite_ind_tache: data.unite_ind_tache,
    indicateur_cmr: data.indicateur_cmr,
    id_activite: idActivite,
    trimestre_1: data.trimestre_1 ?? 0,
    trimestre_2: data.trimestre_2 ?? 0,
    trimestre_3: data.trimestre_3 ?? 0,
    trimestre_4: data.trimestre_4 ?? 0,
  }
}
