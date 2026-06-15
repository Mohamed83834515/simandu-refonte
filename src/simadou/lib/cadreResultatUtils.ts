import type { CadreResultat, NiveauCadreResultat } from '@/simadou/allTypes'
import {
  resolveActeurLabel,
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'

export function sortNiveauxCadreResultat(
  niveaux: NiveauCadreResultat[]
): NiveauCadreResultat[] {
  return [...niveaux]
    .map((n) => ({ ...n, nombre_ncr: Number(n.nombre_ncr) }))
    .filter((n) => Number.isFinite(n.nombre_ncr))
    .sort((a, b) => a.nombre_ncr - b.nombre_ncr)
}

export function resolveNiveauCrId(
  value: CadreResultat['niveau_cr']
): number | null {
  return resolveRelationId(value, 'id_ncr')
}

export function resolveProjetCr(
  value: CadreResultat['projet_cr']
): string | null {
  return resolveRelationCode(value, 'code_projet')
}

export function resolveParentCrCode(
  value: CadreResultat['parent_cr']
): string | null {
  return resolveRelationCode(value, 'code_cr')
}

export function resolvePartenaireCode(
  value: CadreResultat['partenaire_cr']
): string | null {
  return resolveRelationCode(value, 'code_acteur')
}

export function resolvePartenaireLabel(
  value: CadreResultat['partenaire_cr']
): string {
  return resolveActeurLabel(value) ?? 'Non défini'
}

export function buildCadreParentOptions({
  cadres,
  niveaux,
  selectedNiveauId,
  excludeCadreId,
}: {
  cadres: CadreResultat[]
  niveaux: NiveauCadreResultat[]
  selectedNiveauId: number | null
  excludeCadreId?: number
}) {
  if (!selectedNiveauId) return []

  const selectedNiveau = niveaux.find((n) => n.id_ncr === selectedNiveauId)
  if (!selectedNiveau) return []

  const niveauById = new Map(niveaux.map((n) => [n.id_ncr, n]))

  return cadres
    .filter((cadre) => {
      const cadreNiveauId = resolveNiveauCrId(cadre.niveau_cr)
      const candidateNiveau = cadreNiveauId
        ? niveauById.get(cadreNiveauId)
        : undefined

      return (
        candidateNiveau != null &&
        Number(candidateNiveau.nombre_ncr) < Number(selectedNiveau.nombre_ncr) &&
        cadre.id_cr !== excludeCadreId
      )
    })
    .map((cadre) => ({
      value: cadre.code_cr,
      label: `${cadre.code_cr} - ${cadre.intutile_cr}`,
    }))
}
