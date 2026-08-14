import ExcelJS from 'exceljs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportRapportExcel } from './exportRapportExcel'
import { hexArgb, RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'
import type { RapportExportPayload } from './rapportExportTypes'

function buildPayload(
  overrides: Partial<RapportExportPayload> = {}
): RapportExportPayload {
  return {
    pageTitle: 'Tâches PTBA',
    columns: [
      { id: 'code', header: 'Code' },
      { id: 'activite', header: 'Activité' },
      { id: 'tache', header: 'Intitulé tâche' },
    ],
    rows: [
      ['', 'Composante 1', ''],
      ['1.1.1', 'Étude de faisabilité', 'Recrutement du consultant'],
      ['1.1.1', 'Étude de faisabilité', 'Validation du rapport'],
    ],
    rowMetas: [
      { type: 'section', niveau: 0, label: 'Composante 1' },
      { type: 'data', groupKey: '1' },
      { type: 'data', groupKey: '1' },
    ],
    ...overrides,
  }
}

/** Exécute l'export et retourne le classeur re-parsé depuis le blob produit. */
async function exportAndReload(payload: RapportExportPayload) {
  const blobs: Blob[] = []

  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob)
    return 'blob:mock'
  })
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  await exportRapportExcel(payload)

  expect(blobs).toHaveLength(1)

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await blobs[0].arrayBuffer())
  return workbook
}

function cellFillColor(cell: ExcelJS.Cell): string | undefined {
  const fill = cell.fill
  if (fill?.type !== 'pattern') return undefined
  return fill.fgColor?.argb
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exportRapportExcel', () => {
  it('rend le Gantt en colonnes mensuelles colorées à droite du tableau', async () => {
    const workbook = await exportAndReload(
      buildPayload({
        gantt: {
          columns: [
            { id: '2025-01', header: 'janv. 25' },
            { id: '2025-02', header: 'févr. 25' },
            { id: '2025-03', header: 'mars 25' },
          ],
          activeByRow: [[], [0, 1], [2]],
        },
      })
    )

    const sheet = workbook.getWorksheet('Rapport')
    expect(sheet).toBeDefined()

    // Aucune image : le Gantt est porté par les colonnes.
    expect(sheet!.getImages()).toHaveLength(0)

    // En-têtes mensuels après les 3 colonnes de données (ligne 5).
    expect(sheet!.getCell(5, 4).value).toBe('janv. 25')
    expect(sheet!.getCell(5, 5).value).toBe('févr. 25')
    expect(sheet!.getCell(5, 6).value).toBe('mars 25')

    // Ligne 7 (1re tâche) : janv. + févr. actifs, mars inactif.
    const green = hexArgb(theme.green)
    expect(cellFillColor(sheet!.getCell(7, 4))).toBe(green)
    expect(cellFillColor(sheet!.getCell(7, 5))).toBe(green)
    expect(cellFillColor(sheet!.getCell(7, 6))).not.toBe(green)

    // Ligne 8 (2e tâche) : seul mars actif.
    expect(cellFillColor(sheet!.getCell(8, 4))).not.toBe(green)
    expect(cellFillColor(sheet!.getCell(8, 6))).toBe(green)

    // Les cellules Gantt restent vides : seule la couleur porte l'information.
    expect(sheet!.getCell(7, 4).value ?? '').toBe('')
  })

  it("n'ajoute rien sans données de Gantt (autres rapports inchangés)", async () => {
    const workbook = await exportAndReload(buildPayload())

    const sheet = workbook.getWorksheet('Rapport')
    expect(sheet!.getImages()).toHaveLength(0)
    expect(sheet!.getCell(5, 4).value ?? '').toBe('')
    expect(workbook.worksheets).toHaveLength(1)
  })
})
