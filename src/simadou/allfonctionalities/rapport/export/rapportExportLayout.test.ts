import { describe, expect, it } from 'vitest'
import {
  computeWordColumnWidthsDxa,
  WORD_LANDSCAPE_CONTENT_WIDTH,
} from './rapportExportLayout'
import type { RapportExportColumn } from './rapportExportTypes'

const COLUMNS: RapportExportColumn[] = [
  { id: 'code', header: 'Code' },
  { id: 'activite', header: 'Activité' },
  { id: 'tache', header: 'Intitulé tâche' },
  { id: 'proportion', header: 'Proportion' },
  { id: 'lot', header: 'N° Lot' },
  { id: 'date_debut', header: 'Date début' },
  { id: 'date_fin', header: 'Date fin' },
]

const ROWS: string[][] = [
  [
    '1.1.1',
    "Étude de faisabilité de l'aménagement des pistes rurales",
    'Recrutement du consultant chargé de la supervision des travaux',
    '25',
    '3',
    '15/01/2025',
    '20/03/2025',
  ],
]

describe('computeWordColumnWidthsDxa', () => {
  it('remplit exactement la largeur utile par défaut', () => {
    const widths = computeWordColumnWidthsDxa(COLUMNS, ROWS)

    expect(widths.reduce((sum, w) => sum + w, 0)).toBe(
      WORD_LANDSCAPE_CONTENT_WIDTH
    )
    widths.forEach((w) => expect(w).toBeGreaterThanOrEqual(800))
  })

  it('ne produit jamais de largeur négative quand la place manque (colonnes Gantt)', () => {
    // Régression : la moitié de la page réservée au Gantt laissait le
    // plancher de 800 dxa dépasser le total et la dernière colonne
    // devenait négative (« Invalid value '-157' » dans docx).
    const contentWidth = Math.floor(WORD_LANDSCAPE_CONTENT_WIDTH / 2)
    const widths = computeWordColumnWidthsDxa(COLUMNS, ROWS, contentWidth)

    expect(widths.reduce((sum, w) => sum + w, 0)).toBe(contentWidth)
    widths.forEach((w) => expect(w).toBeGreaterThan(0))
  })
})
