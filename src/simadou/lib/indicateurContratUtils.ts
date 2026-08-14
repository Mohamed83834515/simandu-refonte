import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { IndicateurContrat } from '@/simadou/allTypes/indicateurContrat'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { resolveNiveauClcId } from './cadreLogiqueClcpUtils'

export function resolveClcpId(
  value: IndicateurContrat['clcp'] | CadreLogiqueClcp | number | null | undefined
): number | null {
  return resolveRelationId(value, 'id_clc')
}

export function filterCadresByNiveauClcp(
  cadres: CadreLogiqueClcp[],
  niveauId: number
): CadreLogiqueClcp[] {
  return cadres.filter(
    (cadre) => resolveNiveauClcId(cadre.niveau_clc) === niveauId
  )
}

export function filterIndicateursByNiveauClcp(
  indicateurs: IndicateurContrat[],
  cadres: CadreLogiqueClcp[],
  niveauId: number
): IndicateurContrat[] {
  const cadreIds = new Set(
    filterCadresByNiveauClcp(cadres, niveauId).map((c) => c.id_clc)
  )
  return indicateurs.filter((ind) => {
    const clcpId = resolveClcpId(ind.clcp)
    return clcpId != null && cadreIds.has(clcpId)
  })
}

export function resolveClcpLabel(
  clcpRef: IndicateurContrat['clcp'],
  cadres: CadreLogiqueClcp[]
): string {
  const id = resolveClcpId(clcpRef)
  if (id == null) return '—'
  const cadre = cadres.find((c) => c.id_clc === id)
  if (!cadre) return String(id)
  return `${cadre.code_clc} — ${cadre.intitule_clc}`
}
