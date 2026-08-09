import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'
import type {
  RapportExportFiche,
  RapportExportFicheSection,
  RapportExportFicheTable,
  RapportExportPayload,
} from './rapportExportTypes'
import {
  buildExportFilename,
  downloadBlob,
  slugifyRapportTitle,
  splitCellBoldPrefix,
} from './rapportExportUtils'

const ACCENT = theme.green
const TEXT = theme.text
const MUTED = theme.textMuted
const BORDER = theme.border
const CONTEXT_BG = theme.greenMuted
const NARRATIVE_BG = theme.greenLight
const PAGE_MARGIN = 720
const CONTENT_WIDTH = 11906 - PAGE_MARGIN * 2

function noBorder() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  }
}

function thinBorder(color = BORDER) {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color },
    bottom: { style: BorderStyle.SINGLE, size: 4, color },
    left: { style: BorderStyle.SINGLE, size: 4, color },
    right: { style: BorderStyle.SINGLE, size: 4, color },
  }
}

function hBorderOnly(bottomSize = 4, bottomColor = BORDER) {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.SINGLE, size: bottomSize, color: bottomColor },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  }
}

function p(
  text: string,
  opts: {
    bold?: boolean
    size?: number
    color?: string
    align?:
      | typeof AlignmentType.LEFT
      | typeof AlignmentType.RIGHT
      | typeof AlignmentType.CENTER
      | typeof AlignmentType.JUSTIFIED
    before?: number
    after?: number
  } = {}
) {
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 60 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        size: opts.size ?? 18,
        color: opts.color ?? TEXT,
        font: 'Calibri',
      }),
    ],
  })
}

function cellParagraph(
  text: string,
  opts: { bold?: boolean; size?: number; separator?: string } = {}
) {
  const separator = opts.separator
  const split = separator ? splitCellBoldPrefix(text, separator) : null
  if (!split) {
    return p(text, { bold: opts.bold, size: opts.size ?? 16, after: 0 })
  }
  return new Paragraph({
    spacing: { after: 0 },
    children: [
      new TextRun({
        text: split.prefix,
        bold: true,
        size: opts.size ?? 16,
        color: TEXT,
        font: 'Calibri',
      }),
      new TextRun({
        text: `${separator}${split.rest}`,
        bold: false,
        size: opts.size ?? 16,
        color: TEXT,
        font: 'Calibri',
      }),
    ],
  })
}

function resolveFiche(payload: RapportExportPayload): RapportExportFiche {
  if (payload.fiche) return payload.fiche
  throw new Error('exportFicheWord: payload.fiche manquant')
}

function computeFirstColSpans(rows: string[][]): number[] {
  const spans = rows.map(() => 1)
  let i = 0
  while (i < rows.length) {
    let j = i + 1
    while (j < rows.length && rows[j]![0] === rows[i]![0]) j++
    spans[i] = j - i
    for (let k = i + 1; k < j; k++) spans[k] = 0
    i = j
  }
  return spans
}

function buildHeader(fiche: RapportExportFiche): Table {
  const genLine = [
    fiche.generatedAtLabel
      ? `Générée le ${fiche.generatedAtLabel}`
      : `Générée le ${new Date().toLocaleString('fr-FR')}`,
    fiche.generatedBy ? `par ${fiche.generatedBy}` : null,
  ]
    .filter(Boolean)
    .join(' ')

  const badge = (fiche.badge ?? 'Fiche de synthèse').toUpperCase()

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH / 2, CONTENT_WIDTH / 2],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_WIDTH / 2, type: WidthType.DXA },
            borders: noBorder(),
            children: [
              p(fiche.orgTitle ?? 'SIMANDOU', { bold: true, size: 22 }),
              p(
                fiche.orgSubtitle ??
                  'Plateforme de suivi des projets et programmes',
                { size: 16, color: MUTED, after: 0 }
              ),
            ],
          }),
          new TableCell({
            width: { size: CONTENT_WIDTH / 2, type: WidthType.DXA },
            borders: noBorder(),
            children: [
              p(badge, {
                bold: true,
                size: 16,
                color: ACCENT,
                align: AlignmentType.RIGHT,
                after: 40,
              }),
              p(fiche.title, {
                bold: true,
                size: 28,
                align: AlignmentType.RIGHT,
                after: 40,
              }),
              p(genLine, {
                size: 14,
                color: MUTED,
                align: AlignmentType.RIGHT,
                after: 0,
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function buildAccentBar(): Table {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [
      new TableRow({
        height: { value: 80, rule: 'exact' as const },
        children: [
          new TableCell({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            shading: { fill: ACCENT, type: ShadingType.CLEAR, color: 'auto' },
            borders: noBorder(),
            children: [new Paragraph({ children: [] })],
          }),
        ],
      }),
    ],
  })
}

function buildContext(fiche: RapportExportFiche): Table | null {
  const items = (fiche.contextItems ?? []).slice(0, 3)
  if (!items.length) return null
  const colW = Math.floor(CONTENT_WIDTH / items.length)
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: items.map(() => colW),
    rows: [
      new TableRow({
        children: items.map(
          (item) =>
            new TableCell({
              width: { size: colW, type: WidthType.DXA },
              shading: {
                fill: CONTEXT_BG,
                type: ShadingType.CLEAR,
                color: 'auto',
              },
              borders: thinBorder(),
              children: [
                p(item.label.toUpperCase(), {
                  bold: true,
                  size: 14,
                  color: MUTED,
                  after: 40,
                }),
                p(item.value, { bold: true, size: 18, after: 0 }),
              ],
            })
        ),
      }),
    ],
  })
}

function buildKpis(fiche: RapportExportFiche): Table | null {
  const kpis = (fiche.kpis ?? []).slice(0, 4)
  if (!kpis.length) return null
  const colW = Math.floor(CONTENT_WIDTH / kpis.length)
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: kpis.map(() => colW),
    rows: [
      new TableRow({
        children: kpis.map((kpi) => {
          const accent = (kpi.accent ?? `#${ACCENT}`).replace('#', '')
          return new TableCell({
            width: { size: colW, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 24, color: accent },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
              left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
              right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
            },
            children: [
              p(kpi.label.toUpperCase(), {
                bold: true,
                size: 12,
                color: MUTED,
                after: 60,
              }),
              p(kpi.value, { bold: true, size: 24, after: 0 }),
            ],
          })
        }),
      }),
    ],
  })
}

function buildNarrative(text: string): Table {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [80, CONTENT_WIDTH - 80],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 80, type: WidthType.DXA },
            shading: { fill: ACCENT, type: ShadingType.CLEAR, color: 'auto' },
            borders: noBorder(),
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            width: { size: CONTENT_WIDTH - 80, type: WidthType.DXA },
            shading: {
              fill: NARRATIVE_BG,
              type: ShadingType.CLEAR,
              color: 'auto',
            },
            borders: noBorder(),
            children: [
              p(text, {
                size: 18,
                align: AlignmentType.JUSTIFIED,
                before: 80,
                after: 80,
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function buildRepartition(
  title: string | undefined,
  items: { label: string; value: string }[]
): (Paragraph | Table)[] {
  if (!items.length) return []
  const out: (Paragraph | Table)[] = []
  if (title) {
    out.push(
      p(title.toUpperCase(), {
        bold: true,
        size: 16,
        before: 120,
        after: 80,
      })
    )
  }
  out.push(
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [CONTENT_WIDTH * 0.7, CONTENT_WIDTH * 0.3],
      rows: items.map(
        (item) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: CONTENT_WIDTH * 0.7, type: WidthType.DXA },
                borders: hBorderOnly(),
                children: [p(item.label, { size: 18, after: 40 })],
              }),
              new TableCell({
                width: { size: CONTENT_WIDTH * 0.3, type: WidthType.DXA },
                borders: hBorderOnly(),
                children: [
                  p(item.value, {
                    bold: true,
                    size: 18,
                    align: AlignmentType.RIGHT,
                    after: 40,
                  }),
                ],
              }),
            ],
          })
      ),
    })
  )
  return out
}

function buildDataTable(table: RapportExportFicheTable): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    p(table.title.toUpperCase(), { bold: true, size: 16, before: 160, after: 60 }),
  ]
  if (table.description) {
    out.push(p(table.description, { size: 16, color: MUTED, after: 80 }))
  }

  const colCount = Math.max(table.headers.length, 1)
  const colW = Math.floor(CONTENT_WIDTH / colCount)
  const bodyRows = [...table.rows]
  if (table.totalRow) bodyRows.push(table.totalRow)
  if (!bodyRows.length) {
    bodyRows.push(
      table.headers.map((_, i) => (i === 0 ? 'Aucune donnée' : ''))
    )
  }

  const spans = table.mergeFirstColumn
    ? computeFirstColSpans(bodyRows)
    : bodyRows.map(() => 1)

  const groupEndRows = new Set<number>()
  if (table.mergeFirstColumn) {
    for (let i = 0; i < spans.length; i++) {
      if (spans[i]! > 0) groupEndRows.add(i + spans[i]! - 1)
    }
  }

  const headerRow = new TableRow({
    children: table.headers.map(
      (h) =>
        new TableCell({
          width: { size: colW, type: WidthType.DXA },
          shading: {
            fill: CONTEXT_BG,
            type: ShadingType.CLEAR,
            color: 'auto',
          },
          borders: hBorderOnly(),
          children: [
            p(h.toUpperCase(), {
              bold: true,
              size: 14,
              color: MUTED,
              after: 0,
            }),
          ],
        })
    ),
  })

  const dataRows = bodyRows.map((row, rowIndex) => {
    const isTotal =
      Boolean(table.totalRow) && rowIndex === bodyRows.length - 1
    const cells: TableCell[] = []
    const isGroupEnd = groupEndRows.has(rowIndex)
    const rowBorder = isGroupEnd
      ? hBorderOnly(18, theme.greenDark)
      : hBorderOnly()

    for (let i = 0; i < colCount; i++) {
      if (table.mergeFirstColumn && i === 0) {
        if (spans[rowIndex]! === 0) continue
        cells.push(
          new TableCell({
            width: { size: colW, type: WidthType.DXA },
            rowSpan: spans[rowIndex],
            verticalAlign: VerticalAlign.CENTER,
            borders: hBorderOnly(18, theme.greenDark),
            shading: {
              fill: CONTEXT_BG,
              type: ShadingType.CLEAR,
              color: 'auto',
            },
            children: [
              p(row[0] ?? '', {
                bold: true,
                size: 16,
                after: 0,
              }),
            ],
          })
        )
        continue
      }

      cells.push(
        new TableCell({
          width: { size: colW, type: WidthType.DXA },
          borders: rowBorder,
          children: [
            cellParagraph(row[i] ?? '', {
              bold: isTotal,
              size: 16,
              separator:
                i === 1 ? table.boldPrefixSeparator : undefined,
            }),
          ],
        })
      )
    }

    return new TableRow({ children: cells })
  })

  out.push(
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: Array.from({ length: colCount }, () => colW),
      rows: [headerRow, ...dataRows],
    })
  )
  return out
}

function buildSection(section: RapportExportFicheSection): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    p(section.title.toUpperCase(), {
      bold: true,
      size: 20,
      color: theme.greenDark,
      before: 240,
      after: 80,
    }),
  ]
  if (section.narrative) {
    out.push(buildNarrative(section.narrative))
    out.push(new Paragraph({ spacing: { after: 120 }, children: [] }))
  }
  out.push(
    ...buildRepartition(section.repartitionTitle, section.repartition ?? [])
  )
  for (const table of section.tables ?? []) {
    out.push(...buildDataTable(table))
  }
  return out
}

export async function exportFicheWord(payload: RapportExportPayload) {
  const fiche = resolveFiche(payload)
  const children: (Paragraph | Table)[] = [
    buildHeader(fiche),
    new Paragraph({ spacing: { after: 80 }, children: [] }),
    buildAccentBar(),
    new Paragraph({ spacing: { after: 160 }, children: [] }),
  ]

  const context = buildContext(fiche)
  if (context) {
    children.push(context)
    children.push(new Paragraph({ spacing: { after: 160 }, children: [] }))
  }

  const kpis = buildKpis(fiche)
  if (kpis) {
    children.push(kpis)
    children.push(new Paragraph({ spacing: { after: 160 }, children: [] }))
  }

  if (fiche.narrative) {
    children.push(buildNarrative(fiche.narrative))
    children.push(new Paragraph({ spacing: { after: 160 }, children: [] }))
  }

  children.push(
    ...buildRepartition(fiche.repartitionTitle, fiche.repartition ?? [])
  )

  for (const table of fiche.tables ?? []) {
    children.push(...buildDataTable(table))
  }

  for (const section of fiche.sections ?? []) {
    children.push(...buildSection(section))
  }

  children.push(
    new Paragraph({ spacing: { before: 240 }, children: [] }),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [CONTENT_WIDTH * 0.75, CONTENT_WIDTH * 0.25],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: CONTENT_WIDTH * 0.75, type: WidthType.DXA },
              borders: {
                ...noBorder(),
                top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
              },
              children: [
                p(
                  fiche.footerNote ??
                    'Document généré automatiquement — données issues du projet au moment de la génération.',
                  { size: 14, color: MUTED, before: 80, after: 0 }
                ),
              ],
            }),
            new TableCell({
              width: { size: CONTENT_WIDTH * 0.25, type: WidthType.DXA },
              borders: {
                ...noBorder(),
                top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
              },
              children: [
                p(fiche.footerCode ?? 'MMAFP-RAPPORT-OR', {
                  bold: true,
                  size: 14,
                  color: MUTED,
                  align: AlignmentType.RIGHT,
                  before: 80,
                  after: 0,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  )

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 18, color: TEXT },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: PAGE_MARGIN,
              right: PAGE_MARGIN,
              bottom: PAGE_MARGIN,
              left: PAGE_MARGIN,
            },
          },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(
    blob,
    buildExportFilename(slugifyRapportTitle(payload.pageTitle), 'docx')
  )
}
