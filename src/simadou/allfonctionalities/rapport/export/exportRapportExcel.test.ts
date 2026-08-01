import ExcelJS from 'exceljs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportRapportExcel } from './exportRapportExcel'
import { hexArgb, RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'
import type { RapportExportPayload } from './rapportExportTypes'

/**
 * Payload au format produit par les pages rapport : colonne « Activité »
 * en tête (code intégré au libellé, en gras via boldPrefixSeparator),
 * sections indentées par niveau, fusion verticale par activité via
 * mergeKeys sur la colonne 0.
 */
function buildPayload(
  overrides: Partial<RapportExportPayload> = {}
): RapportExportPayload {
  return {
    pageTitle: 'Tâches PTBA',
    columns: [
      { id: 'activite', header: 'Activité', boldPrefixSeparator: ' : ' },
      { id: 'tache', header: 'Intitulé tâche' },
      { id: 'responsable', header: 'Responsable' },
    ],
    rows: [
      ['Composante 1', '', ''],
      ['1.1.1 : Étude de faisabilité', 'Recrutement du consultant', 'A'],
      ['1.1.1 : Étude de faisabilité', 'Validation du rapport', 'B'],
    ],
    rowMetas: [
      { type: 'section', niveau: 0, label: 'Composante 1' },
      { type: 'data', niveau: 1, mergeKeys: { 0: '1' } },
      { type: 'data', niveau: 1, mergeKeys: { 0: '1' } },
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

    // 1 colonne d'indentation (niveau max = 1) + 3 colonnes de données,
    // puis les en-têtes mensuels (ligne 5).
    expect(sheet!.getCell(5, 5).value).toBe('janv. 25')
    expect(sheet!.getCell(5, 6).value).toBe('févr. 25')
    expect(sheet!.getCell(5, 7).value).toBe('mars 25')

    // Ligne 7 (1re tâche) : janv. + févr. actifs, mars inactif.
    const green = hexArgb(theme.green)
    expect(cellFillColor(sheet!.getCell(7, 5))).toBe(green)
    expect(cellFillColor(sheet!.getCell(7, 6))).toBe(green)
    expect(cellFillColor(sheet!.getCell(7, 7))).not.toBe(green)

    // Ligne 8 (2e tâche) : seul mars actif.
    expect(cellFillColor(sheet!.getCell(8, 5))).not.toBe(green)
    expect(cellFillColor(sheet!.getCell(8, 7))).toBe(green)

    // Les cellules Gantt restent vides : seule la couleur porte l'information.
    expect(sheet!.getCell(7, 5).value ?? '').toBe('')
  })

  it("n'ajoute rien sans données de Gantt (autres rapports inchangés)", async () => {
    const workbook = await exportAndReload(buildPayload())

    const sheet = workbook.getWorksheet('Rapport')
    expect(sheet!.getImages()).toHaveLength(0)
    // 1 colonne d'indentation + 3 colonnes de données, rien au-delà.
    expect(sheet!.getCell(5, 5).value ?? '').toBe('')
    expect(workbook.worksheets).toHaveLength(1)
  })

  it('section : libellé dans la colonne Activité, indenté selon le niveau', async () => {
    const workbook = await exportAndReload(
      buildPayload({
        rows: [
          ['Composante 1', '', ''],
          ['1A : Promotion des entreprises', '', ''],
          ['1.1.1 : Étude de faisabilité', 'x', 'y'],
        ],
        rowMetas: [
          { type: 'section', niveau: 0, label: 'Composante 1' },
          {
            type: 'section',
            niveau: 1,
            label: '1A : Promotion des entreprises',
          },
          { type: 'data', niveau: 2, mergeKeys: { 0: '1' } },
        ],
      })
    )

    const sheet = workbook.getWorksheet('Rapport')!

    // Niveau max = 2 → 2 colonnes d'indentation étroites avant la colonne
    // principale : zone Activité = colonnes 1 à 3, données ensuite.
    // L'en-tête « Activité » fusionne toute la zone.
    expect(sheet.getCell(5, 1).value).toBe('Activité')
    expect(sheet.getCell(5, 3).isMerged).toBe(true)
    expect(sheet.getCell(5, 4).value).toBe('Intitulé tâche')

    // dataStartRow = 6 (une seule ligne d'en-tête) → sections lignes 6 et 7.
    // Niveau 0 : libellé posé colonne 1, fusionné jusqu'à la colonne 3 —
    // les lignes repliées restent indentées (fusion, pas espaces).
    expect(sheet.getCell(6, 1).value).toBe('Composante 1')
    expect(sheet.getCell(6, 1).isMerged).toBe(true)
    expect(sheet.getCell(6, 3).isMerged).toBe(true)
    expect(sheet.getCell(6, 1).font?.bold).toBe(true)
    expect(sheet.getCell(6, 4).value ?? '').toBe('')

    // Niveau 1 : libellé posé colonne 2 (1 colonne d'indentation vide),
    // code « 1A » en gras + reste en normal (texte riche).
    expect(sheet.getCell(7, 1).value ?? '').toBe('')

    const richText = (sheet.getCell(7, 2).value as ExcelJS.CellRichTextValue)
      .richText
    expect(richText[0].text).toBe('1A')
    expect(richText[0].font?.bold).toBe(true)
    expect(richText[1].text).toBe(' : Promotion des entreprises')
    expect(richText[1].font?.bold ?? false).toBe(false)
    expect(sheet.getCell(7, 3).isMerged).toBe(true)

    // Ligne d'activité (niveau cadre + 1 = 2) : libellé posé colonne 3
    // (2 colonnes d'indentation vides), code en gras dans le texte riche.
    expect(sheet.getCell(8, 1).value ?? '').toBe('')
    expect(sheet.getCell(8, 2).value ?? '').toBe('')

    const activiteRichText = (
      sheet.getCell(8, 3).value as ExcelJS.CellRichTextValue
    ).richText
    expect(activiteRichText[0].text).toBe('1.1.1')
    expect(activiteRichText[0].font?.bold).toBe(true)
  })
})
