import type { CadreResultat, NiveauCadreResultat } from '@/simadou/allTypes'
import {
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

export function buildCadreParentOptions({
  cadres,
  parentId,
  excludeCadreId,
}: {
  cadres: CadreResultat[]
  parentId?: number
  excludeCadreId?: string
}) {
  return cadres
    .filter((cadre) => {
      const cadreNiveauId =
        typeof cadre.niveau_cr === 'object'
          ? cadre.niveau_cr?.id_ncr
          : Number(cadre.niveau_cr)

      return (
        cadreNiveauId != null &&
        cadreNiveauId === parentId &&
        cadre.code_cr !== excludeCadreId
      )
    })
    .map((cadre) => ({
      value: cadre.code_cr,
      label: `${cadre.code_cr} - ${cadre.intutile_cr}`,
    }))
}

export function getFixedCodeLengthForNiveauCr(
  niveaux: NiveauCadreResultat[],
  niveauId: number
): number {
  const niveauConfig = niveaux.find((n) => n.id_ncr === niveauId)
  return Number(niveauConfig?.code_number_ncr) || 2
}
