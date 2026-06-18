import type { ColumnFilterConfig } from '@/Global/Generic/Generictable'
import type { Ptba } from '@/simadou/allTypes'

export const EMPTY_PTBA_LIST: Ptba[] = []

export const RAPPORT_PTBA_URL_FILTER_CONFIG: ColumnFilterConfig[] = [
  {
    columnId: 'intitule_activite_ptba',
    searchKey: 'intitule_activite_ptba',
    type: 'string',
  },
]

export const RAPPORT_PTBA_TABLE_INITIAL_STATE = {
  columnVisibility: {
    version_ptba: false,
  },
} as const

/** Valeur temporaire en attendant l’API décaissement par activité. */
export const PLACEHOLDER_DECAISSEMENT_MONTANT = 1_000_000

export function resolvePtbaActiviteId(
  ptba: Pick<Ptba, 'id_ptba'>
): number | undefined {
  const id = Number(ptba.id_ptba)
  return Number.isFinite(id) ? id : undefined
}

export function filterPtbasByVersion(
  ptbas: Ptba[],
  selectedVersionId: string | null
): Ptba[] {
  if (!selectedVersionId) return ptbas
  return ptbas.filter(
    (ptba) => ptba.version_ptba?.toString() === selectedVersionId
  )
}

export function buildPlaceholderDecaissementMap(
  ptbas: Ptba[]
): Map<number, number> {
  const map = new Map<number, number>()
  for (const ptba of ptbas) {
    const id = resolvePtbaActiviteId(ptba)
    if (id == null) continue
    map.set(id, PLACEHOLDER_DECAISSEMENT_MONTANT)
  }
  return map
}
