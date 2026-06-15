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
    (a, b) => Number(a.code_number_nsc) - Number(b.code_number_nsc)
  )
}

export function getNextNiveauCadreStrategique(
  niveaux: NiveauCadreStrategique[],
  currentNiveauCodeNumber: number
): NiveauCadreStrategique | null {
  const sorted = sortNiveauxCadreStrategique(niveaux)
  const index = sorted.findIndex(
    (n) => Number(n.code_number_nsc) === currentNiveauCodeNumber
  )
  if (index < 0 || index >= sorted.length - 1) return null
  return sorted[index + 1] ?? null
}

export function buildChildCountByParentCsId(
  cadres: CadreStrategique[],
  nextNiveauCodeNumber: number
): Map<number, number> {
  const counts = new Map<number, number>()
  for (const cadre of cadres) {
    if (resolveNiveauCsNumber(cadre.niveau_cs) !== nextNiveauCodeNumber) continue
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
  niveauCodeNumber,
  excludeCadreId,
}: {
  cadres: CadreStrategique[]
  niveauCodeNumber: number
  excludeCadreId?: number
}) {
  return cadres
    .filter((cadre) => {
      const cadreNiveau = resolveNiveauCsNumber(cadre.niveau_cs)
      return (
        cadreNiveau != null &&
        cadreNiveau === niveauCodeNumber - 1 &&
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
  niveauCodeNumber: number,
  codeProgramme?: string
): number {
  const scoped = codeProgramme?.trim()
    ? filterNiveauxByProgramme(niveaux, codeProgramme)
    : niveaux

  const niveauConfig = scoped.find(
    (n) => Number(n.code_number_nsc) === niveauCodeNumber
  )
  return Number(niveauConfig?.nombre_nsc) || 2
}

export function getNiveauCadreStrategiqueLibelle(
  niveaux: NiveauCadreStrategique[],
  niveauCodeNumber: number,
  codeProgramme?: string
): string {
  const scoped = codeProgramme?.trim()
    ? filterNiveauxByProgramme(niveaux, codeProgramme)
    : niveaux

  const niveauConfig = scoped.find(
    (n) => Number(n.code_number_nsc) === niveauCodeNumber
  )
  return niveauConfig?.libelle_nsc ?? ''
}
