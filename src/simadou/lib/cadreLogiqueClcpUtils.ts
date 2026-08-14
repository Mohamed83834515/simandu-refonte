import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { NiveauConfigClcp } from '@/simadou/allTypes/niveauConfigClcp'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

const NIVEAU_CLCP_SEP = '::'

export function parseNiveauClcpCode(code_number_ncl: string | undefined): {
  libelle: string
  codeNumber: number
} {
  const raw = code_number_ncl?.trim() ?? ''
  if (!raw) return { libelle: '', codeNumber: 1 }

  if (raw.includes(NIVEAU_CLCP_SEP)) {
    const [libelle, codeStr] = raw.split(NIVEAU_CLCP_SEP)
    const codeNumber = Number(codeStr)
    return {
      libelle: libelle.trim(),
      codeNumber: Number.isFinite(codeNumber) && codeNumber > 0 ? codeNumber : 1,
    }
  }

  const asNum = Number(raw)
  if (Number.isFinite(asNum) && asNum > 0) {
    return { libelle: `Niveau ${asNum}`, codeNumber: asNum }
  }

  return { libelle: raw, codeNumber: Math.max(raw.length, 1) }
}

export function encodeNiveauClcpCode(
  libelle: string,
  codeNumber: number
): string {
  return `${libelle.trim()}${NIVEAU_CLCP_SEP}${codeNumber}`
}

export function sortNiveauxConfigClcp(
  niveaux: NiveauConfigClcp[]
): NiveauConfigClcp[] {
  return [...niveaux]
    .map((n) => ({ ...n, nombre_ncl: Number(n.nombre_ncl) }))
    .filter((n) => Number.isFinite(n.nombre_ncl))
    .sort((a, b) => a.nombre_ncl - b.nombre_ncl)
}

export function resolveNiveauClcId(
  value: CadreLogiqueClcp['niveau_clc'] | null | undefined
): number | null {
  return resolveRelationId(value, 'id_niveau_ncl')
}

export function resolveParentClcId(
  value: CadreLogiqueClcp['parent_clc'] | undefined
): number | null {
  return resolveRelationId(value, 'id_clc')
}

export function getNiveauClcpLabel(niveau: NiveauConfigClcp): string {
  const { libelle } = parseNiveauClcpCode(niveau.code_number_ncl)
  return libelle || `Niveau ${niveau.nombre_ncl}`
}

export function getFixedCodeLengthForNiveauClcp(
  niveaux: NiveauConfigClcp[],
  niveauId: number
): number {
  const niveauConfig = niveaux.find((n) => n.id_niveau_ncl === niveauId)
  return parseNiveauClcpCode(niveauConfig?.code_number_ncl).codeNumber || 2
}

export function buildCadreParentClcpOptions({
  cadres,
  parentNiveauId,
  excludeCadreId,
}: {
  cadres: CadreLogiqueClcp[]
  parentNiveauId?: number
  excludeCadreId?: number
}) {
  return cadres
    .filter((cadre) => {
      const cadreNiveauId = resolveNiveauClcId(cadre.niveau_clc)
      return (
        cadreNiveauId != null &&
        cadreNiveauId === parentNiveauId &&
        cadre.id_clc !== excludeCadreId
      )
    })
    .map((cadre) => ({
      value: cadre.id_clc,
      label: `${cadre.code_clc} - ${cadre.intitule_clc}`,
    }))
}
