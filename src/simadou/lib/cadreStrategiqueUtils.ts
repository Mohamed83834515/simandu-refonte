import type { SelectOption } from '@/Global/types/formConfig'
import type { Acteur } from '@/simadou/allTypes/acteur'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { NiveauCadreStrategique } from '@/simadou/allTypes/niveauCadreStrategique'
import type { Programme } from '@/simadou/allTypes/programme'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function resolveProgrammeCode(
  value: NiveauCadreStrategique['programme'] | Programme | undefined
): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object') return value.code_programme ?? null
  return null
}

export function resolveProgrammeId(
  value: NiveauCadreStrategique['programme'] | Programme | undefined
): number | null {
  return resolveRelationId(value, 'id_programme')
}

export function filterNiveauxByProgramme(
  niveaux: NiveauCadreStrategique[],
  codeProgramme: string | undefined,
  programmeId?: number
): NiveauCadreStrategique[] {
  if (!codeProgramme?.trim() && !programmeId) return []
  return niveaux.filter((n) => {
    const code = resolveProgrammeCode(n.programme)
    if (codeProgramme && code === codeProgramme) return true
    const id = resolveProgrammeId(n.programme)
    return programmeId != null && id === programmeId
  })
}

export function sortNiveauxCadreStrategique(
  niveaux: NiveauCadreStrategique[]
): NiveauCadreStrategique[] {
  return [...niveaux].sort(
    (a, b) => Number(a.nombre_nsc) - Number(b.nombre_nsc)
  )
}

export function getNextNiveauCadreStrategique(
  niveaux: NiveauCadreStrategique[],
  currentNiveauId: number
): NiveauCadreStrategique | null {
  const sorted = sortNiveauxCadreStrategique(niveaux)
  const index = sorted.findIndex((n) => n.id_nsc === currentNiveauId)
  if (index < 0 || index >= sorted.length - 1) return null
  return sorted[index + 1] ?? null
}

export function buildChildCountByParentCsId(
  cadres: CadreStrategique[],
  nextNiveauId: number
): Map<number, number> {
  const counts = new Map<number, number>()
  for (const cadre of cadres) {
    if (Number(cadre.id_cs) !== nextNiveauId) continue
    const parentId = resolveParentCsId(cadre.parent_cs)
    if (parentId == null) continue
    counts.set(parentId, (counts.get(parentId) ?? 0) + 1)
  }
  return counts
}

export function resolveNiveauCsNumber(
  value: CadreStrategique['niveau_cs']
): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function resolveParentCsId(
  value: CadreStrategique['parent_cs']
): number | null {
  return resolveRelationId(value, 'id_cs')
}

export function resolvePartenaireCsIds(
  value: CadreStrategique['partenaire_cs']
): number[] {
  if (value == null) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => resolveRelationId(item, 'id_acteur'))
      .filter((id): id is number => id != null)
  }
  const id = resolveRelationId(value, 'id_acteur')
  return id != null ? [id] : []
}

export function toPartenaireCsFormValue(
  value: CadreStrategique['partenaire_cs'] | undefined,
  acteurs: Pick<Acteur, 'id_acteur'>[]
): number[] {
  return resolvePartenaireCsIds(value ?? null).filter((id) =>
    acteurs.some((a) => a.id_acteur === id)
  )
}

export function buildCadreStrategiqueParentOptions({
  cadres,
  parentId,
  excludeCadreId,
}: {
  cadres: CadreStrategique[]
  parentId?: number
  excludeCadreId?: number
}) {
  return cadres
    .filter((cadre) => {
      const cadreNiveau = resolveNiveauCsNumber(cadre.niveau_cs)
      return (
        cadreNiveau != null &&
        cadreNiveau === parentId &&
        cadre.id_cs !== excludeCadreId
      )
    })
    .map((cadre) => ({
      value: cadre.id_cs,
      label: `${cadre.code_cs} - ${cadre.intutile_cs}`,
    }))
}

export function getFixedCodeLengthForNiveauCs(
  niveaux: NiveauCadreStrategique[],
  niveauId: number
): number {
  const niveauConfig = niveaux.find((n) => n.id_nsc === niveauId)
  return Number(niveauConfig?.code_number_nsc) || 2
}

export function getNiveauCadreStrategiqueLibelle(
  niveaux: NiveauCadreStrategique[],
  niveauId: number
): string {
  const niveauConfig = niveaux.find((n) => n.id_nsc === niveauId)
  return niveauConfig?.libelle_nsc ?? ''
}

export function filterCadresStrategiqueByNiveau(
  cadres: CadreStrategique[],
  niveauId: number
): CadreStrategique[] {
  return cadres.filter(
    (cadre) => resolveNiveauCsNumber(cadre.niveau_cs) === niveauId
  )
}

export function resolveCadreStrategiqueById(
  cadres: CadreStrategique[],
  cadreId?: number | null
): CadreStrategique | null {
  if (cadreId == null || !Number.isFinite(cadreId)) return null
  return cadres.find((cadre) => cadre.id_cs === cadreId) ?? null
}

export function buildCadreStrategiqueSelectOptions(
  cadres: CadreStrategique[],
  currentCadreId?: number | null,
  currentCadreLabel?: string | null
): SelectOption[] {
  const options = cadres
    .filter((cadre) => cadre.id_cs != null)
    .map((cadre) => ({
      value: cadre.id_cs,
      label: `${cadre.code_cs} — ${cadre.intutile_cs}`,
    }))

  if (
    currentCadreId != null &&
    !options.some((opt) => Number(opt.value) === currentCadreId)
  ) {
    options.unshift({
      value: currentCadreId,
      label: currentCadreLabel ?? `Cadre stratégique #${currentCadreId}`,
    })
  }

  return options
}
