import JSZip from 'jszip'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportRapportWord } from './exportRapportWord'
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

/** Exécute l'export et retourne le document.xml du .docx produit. */
async function exportAndReadXml(payload: RapportExportPayload) {
  const blobs: Blob[] = []

  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob)
    return 'blob:mock'
  })
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  await exportRapportWord(payload)

  expect(blobs).toHaveLength(1)

  const zip = await JSZip.loadAsync(await blobs[0].arrayBuffer())
  return zip.file('word/document.xml')!.async('string')
}

/** Colonnes du grid occupées par une ligne : nb de tc + gridSpans. */
function occupiedGridColumns(rowXml: string): number {
  const cellCount = (rowXml.match(/<w:tc>/g) ?? []).length
  const spans = [...rowXml.matchAll(/<w:gridSpan w:val="(\d+)"/g)]
  const spanExtra = spans.reduce((sum, m) => sum + Number(m[1]) - 1, 0)
  return cellCount + spanExtra
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exportRapportWord', () => {
  it('chaque ligne (sections comprises) occupe exactement le grid du tableau', async () => {
    const xml = await exportAndReadXml(
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

    // Le tableau de données est le second (le premier est le bandeau titre).
    const grids = [...xml.matchAll(/<w:tblGrid>.*?<\/w:tblGrid>/gs)]
    expect(grids.length).toBeGreaterThanOrEqual(2)

    const dataTableXml = xml.slice(grids[1].index)
    const gridColumns = (
      grids[1][0].match(/<w:gridCol/g) ?? []
    ).length
    // 1 colonne d'indentation (niveau max = 1) + 3 colonnes de données
    // + 3 mois de Gantt
    expect(gridColumns).toBe(7)

    const rows = [...dataTableXml.matchAll(/<w:tr\b.*?<\/w:tr>/gs)]
    expect(rows.length).toBeGreaterThanOrEqual(4) // en-tête + 3 lignes

    // Régression : les cellules couvertes par un gridSpan ne doivent pas
    // être émises, sinon la ligne déborde du grid et écrase les colonnes.
    rows.forEach((row) => {
      expect(occupiedGridColumns(row[0])).toBe(gridColumns)
    })

    // La ligne de section (ligne 1, après l'en-tête) garde son libellé en
    // tête de la zone « Activité » (fusion des colonnes d'indentation),
    // sans déborder sur les colonnes de données.
    const sectionRow = rows[1][0]
    const sectionCells = [...sectionRow.matchAll(/<w:tc>.*?<\/w:tc>/gs)]
    expect(sectionCells.length).toBe(6)
    expect(sectionCells[0][0]).toContain('Composante 1')
    expect(sectionCells[0][0]).toMatch(/<w:gridSpan w:val="2"/)
    expect(sectionCells[1][0]).not.toContain('Composante 1')
  })

  it('section : libellé indenté dans la colonne Activité, code en gras', async () => {
    const xml = await exportAndReadXml(
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

    // 2 colonnes d'indentation (niveau max = 2) + 3 colonnes de données :
    // l'indentation est portée par de vraies colonnes bordées, comme dans
    // l'export Excel.
    const grids = [...xml.matchAll(/<w:tblGrid>.*?<\/w:tblGrid>/gs)]
    const dataTableXml = xml.slice(grids[1].index)
    const gridColumns = (grids[1][0].match(/<w:gridCol/g) ?? []).length
    expect(gridColumns).toBe(5)

    const rows = [...dataTableXml.matchAll(/<w:tr\b.*?<\/w:tr>/gs)]
    rows.forEach((row) => {
      expect(occupiedGridColumns(row[0])).toBe(gridColumns)
    })

    // Section niveau 0 : libellé en tête, fusionné sur toute la zone (3).
    const section0Cells = [...rows[1][0].matchAll(/<w:tc>.*?<\/w:tc>/gs)]
    expect(section0Cells[0][0]).toContain('Composante 1')
    expect(section0Cells[0][0]).toMatch(/<w:gridSpan w:val="3"/)

    // Section niveau 1 : une cellule d'indentation vide puis le libellé
    // fusionné sur le reste de la zone (2).
    const section1Cells = [...rows[2][0].matchAll(/<w:tc>.*?<\/w:tc>/gs)]
    expect(section1Cells[0][0]).not.toContain('1A')
    expect(section1Cells[1][0]).toContain('1A')
    expect(section1Cells[1][0]).toMatch(/<w:gridSpan w:val="2"/)

    // Activité (niveau cadre + 1 = 2) : deux cellules d'indentation vides
    // puis le libellé dans la colonne principale.
    const dataCells = [...rows[3][0].matchAll(/<w:tc>.*?<\/w:tc>/gs)]
    expect(dataCells[0][0]).not.toContain('1.1.1')
    expect(dataCells[1][0]).not.toContain('1.1.1')
    expect(dataCells[2][0]).toContain('1.1.1')

    const runs = [...xml.matchAll(/<w:r>.*?<\/w:r>/gs)].map((m) => m[0])

    // Code « 1A » en gras, reste du libellé en normal.
    const codeRun = runs.find((run) => run.includes('>1A<'))
    expect(codeRun).toBeDefined()
    expect(codeRun).toContain('<w:b/>')

    const restRun = runs.find((run) =>
      run.includes('Promotion des entreprises')
    )
    expect(restRun).toBeDefined()
    expect(restRun).not.toContain('<w:b/>')

    // Libellé sans code : tout en gras.
    const plainRun = runs.find((run) => run.includes('Composante 1'))
    expect(plainRun).toBeDefined()
    expect(plainRun).toContain('<w:b/>')

    // Code d'activité en gras aussi.
    const activiteCodeRun = runs.find((run) => run.includes('>1.1.1<'))
    expect(activiteCodeRun).toBeDefined()
    expect(activiteCodeRun).toContain('<w:b/>')
  })

  it('en-têtes fusionnés + préambule : deux lignes d’en-tête et section portrait', async () => {
    const xml = await exportAndReadXml(
      buildPayload({
        headerGroups: [{ header: 'Détail', columnIds: ['activite', 'tache'] }],
        preamble: [
          { type: 'title', text: 'PREAMBULE' },
          {
            type: 'paragraph',
            text: 'Considérant le Programme SIMANDOU 2040 ;',
          },
        ],
      })
    )

    // Deux sections : préambule en portrait, tableau en paysage.
    expect((xml.match(/<w:sectPr/g) ?? []).length).toBe(2)
    expect(xml).toContain('PREAMBULE')
    expect(xml).toContain('Considérant le Programme SIMANDOU 2040 ;')
    expect(xml).toMatch(/w:orient="landscape"/)

    // La bannière d'en-tête ouvre le document, avant le préambule.
    expect(xml.indexOf('Rapport — Tâches PTBA')).toBeGreaterThanOrEqual(0)
    expect(xml.indexOf('Rapport — Tâches PTBA')).toBeLessThan(
      xml.indexOf('PREAMBULE')
    )

    const grids = [...xml.matchAll(/<w:tblGrid>.*?<\/w:tblGrid>/gs)]
    expect(grids.length).toBeGreaterThanOrEqual(2)

    const dataTableXml = xml.slice(grids[1].index)
    const gridColumns = (grids[1][0].match(/<w:gridCol/g) ?? []).length
    expect(gridColumns).toBe(3)

    const rows = [...dataTableXml.matchAll(/<w:tr\b.*?<\/w:tr>/gs)]
    // 2 lignes d'en-tête + 1 section + 2 lignes de données
    expect(rows.length).toBe(5)

    // Chaque ligne (en-têtes fusionnés compris) occupe exactement le grid.
    rows.forEach((row) => {
      expect(occupiedGridColumns(row[0])).toBe(gridColumns)
    })

    // Groupe fusionné horizontalement sur la première ligne d'en-tête,
    // colonne hors groupe fusionnée verticalement sur les deux lignes.
    expect(rows[0][0]).toMatch(/<w:gridSpan w:val="2"/)
    expect(rows[0][0]).toMatch(/<w:vMerge w:val="restart"/)
    expect(rows[1][0]).toMatch(/<w:vMerge/)

    // Le texte de la colonne mère fusionnée est centré.
    expect(rows[0][0]).toMatch(/<w:jc w:val="center"/)
  })

  it('mergeSubHeaders : la colonne mère couvre aussi les deux lignes d’en-tête', async () => {
    const xml = await exportAndReadXml(
      buildPayload({
        headerGroups: [
          {
            header: 'Détail',
            columnIds: ['activite', 'tache'],
            mergeSubHeaders: true,
          },
        ],
      })
    )

    const grids = [...xml.matchAll(/<w:tblGrid>.*?<\/w:tblGrid>/gs)]
    const dataTableXml = xml.slice(grids[1].index)
    const gridColumns = (grids[1][0].match(/<w:gridCol/g) ?? []).length
    expect(gridColumns).toBe(3)

    const rows = [...dataTableXml.matchAll(/<w:tr\b.*?<\/w:tr>/gs)]
    // 2 lignes d'en-tête + 1 section + 2 lignes de données
    expect(rows.length).toBe(5)

    rows.forEach((row) => {
      expect(occupiedGridColumns(row[0])).toBe(gridColumns)
    })

    // Ligne 1 : le groupe fusionne horizontalement ET démarre la fusion
    // verticale. Ligne 2 : cellule de continuation avec le même gridSpan,
    // sans le nom des sous-colonnes.
    expect(rows[0][0]).toMatch(/<w:gridSpan w:val="2"/)
    expect(rows[1][0]).toMatch(/<w:gridSpan w:val="2"/)
    expect(rows[1][0]).not.toContain('Activité')
    expect(rows[1][0]).not.toContain('Intitulé tâche')
  })

  it('boldPrefixSeparator : le code est en gras, le reste en normal', async () => {
    const xml = await exportAndReadXml(
      buildPayload({
        rows: [['O1 : Étude de faisabilité', 'x', 'y']],
        rowMetas: [{ type: 'data' }],
      })
    )

    const runs = [...xml.matchAll(/<w:r>.*?<\/w:r>/gs)].map((m) => m[0])

    const codeRun = runs.find((run) => run.includes('>O1<'))
    expect(codeRun).toBeDefined()
    expect(codeRun).toContain('<w:b/>')

    const restRun = runs.find((run) => run.includes('Étude de faisabilité'))
    expect(restRun).toBeDefined()
    expect(restRun).not.toContain('<w:b/>')
  })

  it('mergeKeys : fusion verticale indépendante par colonne', async () => {
    const xml = await exportAndReadXml(
      buildPayload({
        rows: [
          ['Objectifs', 'O1 : premier', 'x'],
          ['Objectifs', 'O2 : second', 'y'],
        ],
        rowMetas: [
          { type: 'data', mergeKeys: { 0: 'niveau-1', 1: 'cadre-1' } },
          { type: 'data', mergeKeys: { 0: 'niveau-1', 1: 'cadre-2' } },
        ],
      })
    )

    const grids = [...xml.matchAll(/<w:tblGrid>.*?<\/w:tblGrid>/gs)]
    const dataTableXml = xml.slice(grids[1].index)
    const gridColumns = (grids[1][0].match(/<w:gridCol/g) ?? []).length
    expect(gridColumns).toBe(3)

    const rows = [...dataTableXml.matchAll(/<w:tr\b.*?<\/w:tr>/gs)]
    // 1 ligne d'en-tête + 2 lignes de données
    expect(rows.length).toBe(3)

    rows.forEach((row) => {
      expect(occupiedGridColumns(row[0])).toBe(gridColumns)
    })

    // Colonne 0 (niveau) fusionnée sur les 2 lignes : restart puis continue.
    // Colonne 1 (cadres différents) : pas de fusion, les deux valeurs
    // restent visibles.
    expect(rows[1][0]).toMatch(/<w:vMerge w:val="restart"/)
    expect(rows[2][0]).toMatch(/<w:vMerge\/>|<w:vMerge w:val="continue"/)
    expect(rows[1][0]).toContain('premier')
    expect(rows[2][0]).toContain('second')
    expect(rows[2][0]).not.toContain('Objectifs')
  })
})
