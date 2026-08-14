import type {
  RapportExportColumn,
  RapportExportGantt,
} from './rapportExportTypes'

/**
 * Tableau enrichi des colonnes mensuelles du Gantt : les exports colorent
 * les cellules actives au lieu d'embarquer une image.
 */
export type MergedGanttTable = {
  columns: RapportExportColumn[]
  rows: string[][]
  /** Index de la première colonne Gantt (= columns.length d'origine). */
  ganttStartIndex: number
  /** Nombre de colonnes Gantt ajoutées (0 si pas de Gantt). */
  ganttColumnCount: number
  /** Vrai si la cellule (ligne, colonne fusionnée) est un mois actif. */
  isGanttActive: (rowIndex: number, colIndex: number) => boolean
}

/**
 * Ajoute les colonnes mensuelles du Gantt à droite du tableau exporté.
 * Les cellules ajoutées sont vides : seule la couleur porte l'information.
 */
export function mergeGanttColumns(
  columns: RapportExportColumn[],
  rows: string[][],
  gantt?: RapportExportGantt
): MergedGanttTable {
  if (!gantt || gantt.columns.length === 0) {
    return {
      columns,
      rows,
      ganttStartIndex: columns.length,
      ganttColumnCount: 0,
      isGanttActive: () => false,
    }
  }

  const ganttStartIndex = columns.length
  const emptyCells = gantt.columns.map(() => '')

  const activeSets = gantt.activeByRow.map((indices) => new Set(indices ?? []))

  return {
    columns: [...columns, ...gantt.columns],
    rows: rows.map((row) => [...row, ...emptyCells]),
    ganttStartIndex,
    ganttColumnCount: gantt.columns.length,
    isGanttActive: (rowIndex, colIndex) => {
      if (colIndex < ganttStartIndex) return false
      return activeSets[rowIndex]?.has(colIndex - ganttStartIndex) ?? false
    },
  }
}
