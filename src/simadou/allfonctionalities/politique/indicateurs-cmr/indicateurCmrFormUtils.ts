import type { SelectOption } from '@/Global/types/formConfig'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { DictionnaireIndicateur, IndicateurCmr } from '@/simadou/allTypes'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import type { IndicateurCmrProgrammeCreateData } from '@/simadou/schemas/indicateurCmrProgrammeSchemas'
import {
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'

function resolvePopulatedIndicateurStrategique(
  indicateur?: IndicateurCmr | null
): IndicateurStrategique | null {
  if (!indicateur) return null

  const resultat = indicateur.resultat_cmr
  if (
    resultat != null &&
    typeof resultat === 'object' &&
    ('id_indicateur_str' in resultat || 'code_indicateur_istr' in resultat)
  ) {
    return resultat as IndicateurStrategique
  }

  return null
}

function resolveResultatCmrId(
  indicateur?: IndicateurCmr | null
): number | null {
  if (!indicateur) return null
  const value = indicateur.resultat_cmr
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return resolveRelationId(value, 'id_indicateur_str')
}

export function resolveIndicateurStrategiqueId(
  indicateur?: IndicateurCmr | null
): number | null {
  if (!indicateur) return null

  const populated = resolvePopulatedIndicateurStrategique(indicateur)
  if (populated?.id_indicateur_str != null) {
    return populated.id_indicateur_str
  }

  return resolveResultatCmrId(indicateur)
}

export function resolveCadreIdForIndicateurCmr(
  indicateur?: IndicateurCmr | null,
  cadresStrategiques: CadreStrategique[] = []
): number | null {
  if (!indicateur) return null

  const populatedIndicateur = resolvePopulatedIndicateurStrategique(indicateur)
  if (populatedIndicateur) {
    const linkedId = resolveRelationId(populatedIndicateur.code_istr, 'id_cs')
    if (linkedId != null) return linkedId

    const linkedCode =
      resolveRelationCode(populatedIndicateur.code_istr, 'code_cs') ??
      (typeof populatedIndicateur.code_istr === 'string'
        ? populatedIndicateur.code_istr
        : null)

    if (linkedCode) {
      const cadre = cadresStrategiques.find((item) => item.code_cs === linkedCode)
      if (cadre) return cadre.id_cs
    }
  }

  return null
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

export function indicateurCmrProgrammeToFormValues(
  indicateur?: IndicateurCmr | null,
  cadresStrategiques: CadreStrategique[] = []
): IndicateurCmrProgrammeCreateData {
  return {
    code_ref_ind: indicateur?.code_ref_ind ?? '',
    resultat_cmr: resolveCadreIdForIndicateurCmr(indicateur, cadresStrategiques) ?? 0,
    indicateur_istr: resolveIndicateurStrategiqueId(indicateur) ?? 0,
    intitule_ref_ind: indicateur?.intitule_ref_ind ?? '',
    reference_cmr: indicateur?.reference_cmr ?? '',
    annee_reference: indicateur?.annee_reference ?? new Date().getFullYear(),
    responsable_collecte_cmr: indicateur?.responsable_collecte_cmr ?? '',
    cible_cmr: indicateur?.cible_cmr ?? '',
    fonction_agregat_cmr: indicateur?.fonction_agregat_cmr ?? '',
    referentiel_cmr: resolveReferentielCmrId(indicateur),
  }
}

function resolveIndicateurCmrNiveauCode(
  indicateur: IndicateurCmr,
  indicateursStrategiques: IndicateurStrategique[] = []
): number | null {
  const populated = resolvePopulatedIndicateurStrategique(indicateur)
  if (
    populated?.niveau_istr != null &&
    Number.isFinite(Number(populated.niveau_istr))
  ) {
    return Number(populated.niveau_istr)
  }

  const indicateurStrId = resolveIndicateurStrategiqueId(indicateur)
  if (indicateurStrId != null) {
    const linked = indicateursStrategiques.find(
      (item) => item.id_indicateur_str === indicateurStrId
    )
    if (
      linked?.niveau_istr != null &&
      Number.isFinite(Number(linked.niveau_istr))
    ) {
      return Number(linked.niveau_istr)
    }
  }

  return null
}

export function filterIndicateursCmrByNiveau(
  indicateurs: IndicateurCmr[],
  niveauCodeNumber: number,
  indicateursStrategiques: IndicateurStrategique[] = []
): IndicateurCmr[] {
  return indicateurs.filter(
    (indicateur) =>
      resolveIndicateurCmrNiveauCode(indicateur, indicateursStrategiques) ===
      niveauCodeNumber
  )
}

export function countIndicateursCmrByNiveau(
  indicateurs: IndicateurCmr[],
  indicateursStrategiques: IndicateurStrategique[] = []
): Record<number, number> {
  const counts: Record<number, number> = {}

  for (const indicateur of indicateurs) {
    const niveauCode = resolveIndicateurCmrNiveauCode(
      indicateur,
      indicateursStrategiques
    )
    if (niveauCode == null) continue
    counts[niveauCode] = (counts[niveauCode] ?? 0) + 1
  }

  return counts
}
