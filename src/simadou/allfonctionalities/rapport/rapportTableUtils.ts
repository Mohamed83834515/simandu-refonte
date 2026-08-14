import type { ColumnFilterConfig } from '@/Global/Generic/Generictable'
import type { CadreAnalytique, Ptba } from '@/simadou/allTypes'
import { SECTION_LABEL_SEPARATOR } from './export/rapportExportUtils'

export const EMPTY_PTBA_LIST: Ptba[] = []

/**
 * Libellé d'une ligne de cadre : « CODE : Intitulé ». Le séparateur ' : '
 * permet aux rendus (écran et exports) de mettre le code en gras ; le code
 * est omis quand le cadre n'en a pas. Limite assumée : un intitulé sans
 * code qui contient lui-même ' : ' verra sa première partie rendue en
 * gras comme un code.
 */
export function formatCadreSectionLabel(cadre: CadreAnalytique): string {
  const code = cadre.code_ca?.trim()
  const intitule = cadre.intutile_ca?.trim() ?? ''
  if (!intitule) return code ?? ''
  return code ? `${code}${SECTION_LABEL_SEPARATOR}${intitule}` : intitule
}

/** Padding gauche de base des cellules (aligné sur le px-4 de cellClassName). */
const BASE_PADDING_PX = 16
/** Retrait horizontal (px) ajouté par niveau de cadre. */
export const NIVEAU_INDENT_PX = 24

/**
 * Retrait hiérarchique d'une cellule de la colonne Activité : les cadres
 * utilisent leur niveau, les activités le niveau de leur cadre + 1.
 */
export function niveauIndentStyle(niveau: number) {
  return { paddingLeft: BASE_PADDING_PX + niveau * NIVEAU_INDENT_PX }
}

/**
 * Libellé d'une activité : « CODE : Intitulé » (code omis s'il est absent).
 * Remplace les anciennes colonnes séparées Code / Activité.
 */
export function formatActiviteLabel(
  ptba: Pick<Ptba, 'code_activite_ptba' | 'intitule_activite_ptba'>
): string {
  const code = ptba.code_activite_ptba?.trim()
  const intitule = ptba.intitule_activite_ptba?.trim() ?? ''
  if (!intitule) return code ?? ''
  return code ? `${code}${SECTION_LABEL_SEPARATOR}${intitule}` : intitule
}

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
