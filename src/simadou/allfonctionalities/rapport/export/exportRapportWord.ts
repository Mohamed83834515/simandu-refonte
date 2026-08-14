import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  PageOrientation,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TableLayoutType,
  TextRun,
  VerticalAlignTable,
  VerticalMergeType,
  WidthType,
} from 'docx'
import {
  mergeGanttColumns,
  type MergedGanttTable,
} from './rapportExportGanttColumns'
import {
  computeWordColumnWidthsDxa,
  WORD_LANDSCAPE_CONTENT_WIDTH,
} from './rapportExportLayout'
import { RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'
import type {
  RapportExportPayload,
  RapportExportPreambleBlock,
  RapportExportRowMeta,
} from './rapportExportTypes'
import {
  buildExportFilename,
  buildRapportDocumentMeta,
  detectAlignment,
  downloadBlob,
  filterExportRows,
  findSectionColumnIndex,
  resolveCellMerges,
  resolveHeaderGroupRanges,
  SECTION_LABEL_SEPARATOR,
  splitCellBoldPrefix,
  type ResolvedHeaderGroupRange,
} from './rapportExportUtils'

const PAGE_MARGIN = 720
const FONT_TITLE = 32
const FONT_SUBTITLE = 20
const FONT_HEADER = 22
const FONT_BODY = 20

/** Largeur utile A4 portrait en DXA, marges 1" de chaque côté. */
const WORD_PORTRAIT_CONTENT_WIDTH = 11906 - PAGE_MARGIN * 4

function noBorder() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: theme.white },
    bottom: { style: BorderStyle.NONE, size: 0, color: theme.white },
    left: { style: BorderStyle.NONE, size: 0, color: theme.white },
    right: { style: BorderStyle.NONE, size: 0, color: theme.white },
  }
}

function dataCellBorders(isHeader = false) {
  const color = isHeader ? theme.greenDark : theme.border
  const size = isHeader ? 4 : 1

  return {
    top: { style: BorderStyle.SINGLE, size, color },
    bottom: { style: BorderStyle.SINGLE, size, color },
    left: { style: BorderStyle.SINGLE, size, color },
    right: { style: BorderStyle.SINGLE, size, color },
  }
}

function toDocxAlignment(align: 'left' | 'center' | 'right') {
  if (align === 'center') return AlignmentType.CENTER
  if (align === 'right') return AlignmentType.RIGHT
  return AlignmentType.LEFT
}

function cellParagraph(
  text: string,
  options: {
    align?: 'left' | 'center' | 'right'
    bold?: boolean
    color?: string
    size?: number
    /** Retrait hiérarchique (niveau × SECTION_INDENT_DXA). */
    indentNiveau?: number
  } = {}
) {
  const align = options.align ? options.align : detectAlignment(text)
  return new Paragraph({
    alignment: toDocxAlignment(align),
    indent: options.indentNiveau
      ? { left: options.indentNiveau * SECTION_INDENT_DXA }
      : undefined,
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      new TextRun({
        text,
        bold: options.bold,
        color: options.color ?? theme.text,
        size: options.size ?? FONT_BODY,
        font: 'Calibri',
      }),
    ],
  })
}

function bannerCell(
  children: Paragraph[],
  fill: string,
  options: { height?: number; borders?: ReturnType<typeof noBorder> } = {}
) {
  return new TableCell({
    shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
    borders: options.borders ?? noBorder(),
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    verticalAlign: VerticalAlignTable.CENTER,
    children,
  })
}

function buildBannerTable(
  title: string,
  subtitle: string,
  width = WORD_LANDSCAPE_CONTENT_WIDTH
) {
  return new Table({
    width: { size: width, type: WidthType.DXA },
    columnWidths: [width],
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          bannerCell(
            [
              cellParagraph(title, {
                bold: true,
                color: theme.white,
                size: FONT_TITLE,
                align: 'center',
              }),
            ],
            theme.green
          ),
        ],
      }),
      new TableRow({
        children: [
          bannerCell(
            [
              cellParagraph(subtitle, {
                color: theme.textMuted,
                size: FONT_SUBTITLE,
                align: 'center',
              }),
            ],
            theme.greenLight
          ),
        ],
      }),
      new TableRow({
        height: { value: 100, rule: HeightRule.EXACT },
        children: [
          bannerCell(
            [cellParagraph('', { size: 2, align: 'center' })],
            theme.yellow,
            {
              height: 100,
            }
          ),
        ],
      }),
    ],
  })
}

function headerCell(
  text: string,
  width: number,
  options: {
    columnSpan?: number
    verticalMerge?: (typeof VerticalMergeType)[keyof typeof VerticalMergeType]
    align?: 'left' | 'center' | 'right'
  } = {}
) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: options.columnSpan,
    verticalMerge: options.verticalMerge,
    shading: { fill: theme.green, type: ShadingType.CLEAR, color: 'auto' },
    borders: dataCellBorders(true),
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    verticalAlign: VerticalAlignTable.CENTER,
    children: [
      cellParagraph(text, {
        bold: true,
        color: theme.white,
        size: FONT_HEADER,
        align: options.align,
      }),
    ],
  })
}

/**
 * Ligne(s) d'en-tête du tableau : une seule ligne sans groupes, deux lignes
 * quand des en-têtes fusionnés sont définis (groupe fusionné horizontalement,
 * colonnes hors groupe fusionnées verticalement).
 */
function buildHeaderRows(
  columns: { header: string }[],
  columnWidths: number[],
  groupRanges: ResolvedHeaderGroupRange[],
  sectionColumnIndex = 0,
  indentColumnCount = 0
): TableRow[] {
  if (groupRanges.length === 0) {
    const cells: TableCell[] = []

    columns.forEach((column, index) => {
      // En-tête « Activité » fusionné au-dessus des colonnes
      // d'indentation et de la colonne principale.
      if (index === sectionColumnIndex && indentColumnCount > 0) {
        const regionWidth = columnWidths
          .slice(
            sectionColumnIndex,
            sectionColumnIndex + indentColumnCount + 1
          )
          .reduce((sum, w) => sum + (w ?? 1800), 0)

        cells.push(
          headerCell(column.header, regionWidth, {
            columnSpan: indentColumnCount + 1,
          })
        )
        return
      }

      const gridIndex =
        index < sectionColumnIndex ? index : index + indentColumnCount
      cells.push(headerCell(column.header, columnWidths[gridIndex] ?? 1800))
    })

    return [
      new TableRow({ tableHeader: true, cantSplit: true, children: cells }),
    ]
  }

  const rangeByColumn = new Map<number, ResolvedHeaderGroupRange>()
  groupRanges.forEach((range) => {
    for (let i = range.start; i <= range.end; i += 1) {
      rangeByColumn.set(i, range)
    }
  })

  const topCells: TableCell[] = []
  columns.forEach((column, index) => {
    const range = rangeByColumn.get(index)

    if (!range) {
      topCells.push(
        headerCell(column.header, columnWidths[index] ?? 1800, {
          verticalMerge: VerticalMergeType.RESTART,
        })
      )
      return
    }

    // Les cellules couvertes par le columnSpan ne sont pas émises.
    if (index === range.start) {
      const spanWidth = columnWidths
        .slice(range.start, range.end + 1)
        .reduce((sum, w) => sum + (w ?? 1800), 0)

      // Colonne mère fusionnée sur plusieurs filles → texte centré ; avec
      // mergeSubHeaders elle couvre aussi les deux lignes d'en-tête.
      topCells.push(
        headerCell(range.header, spanWidth, {
          columnSpan: range.end - range.start + 1,
          align: 'center',
          verticalMerge: range.mergeSubHeaders
            ? VerticalMergeType.RESTART
            : undefined,
        })
      )
    }
  })

  const bottomCells: TableCell[] = []
  columns.forEach((column, index) => {
    const range = rangeByColumn.get(index)

    if (!range) {
      bottomCells.push(
        headerCell('', columnWidths[index] ?? 1800, {
          verticalMerge: VerticalMergeType.CONTINUE,
        })
      )
      return
    }

    // Groupe fusionné verticalement : une seule cellule de continuation
    // couvrant toute la largeur du groupe, sous-colonnes non affichées.
    if (range.mergeSubHeaders) {
      if (index === range.start) {
        const spanWidth = columnWidths
          .slice(range.start, range.end + 1)
          .reduce((sum, w) => sum + (w ?? 1800), 0)

        bottomCells.push(
          headerCell('', spanWidth, {
            columnSpan: range.end - range.start + 1,
            verticalMerge: VerticalMergeType.CONTINUE,
          })
        )
      }
      return
    }

    bottomCells.push(headerCell(column.header, columnWidths[index] ?? 1800))
  })

  return [
    new TableRow({ tableHeader: true, cantSplit: true, children: topCells }),
    new TableRow({ tableHeader: true, cantSplit: true, children: bottomCells }),
  ]
}

/** Cellule mensuelle du Gantt : vide, la couleur porte l'information. */
function ganttCell(width: number, active: boolean, shaded: boolean) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: {
      fill: active ? theme.green : shaded ? theme.greenMuted : theme.white,
      type: ShadingType.CLEAR,
      color: 'auto',
    },
    borders: dataCellBorders(false),
    children: [new Paragraph('')],
  })
}

/**
 * Paragraphe d'une cellule de données : quand la colonne définit
 * boldPrefixSeparator, le code (avant le séparateur) est en gras.
 * indentNiveau porte le retrait hiérarchique (activité sous son cadre).
 */
function bodyCellParagraph(
  text: string,
  column?: { boldPrefixSeparator?: string },
  indentNiveau?: number
) {
  const split = column?.boldPrefixSeparator
    ? splitCellBoldPrefix(text, column.boldPrefixSeparator)
    : null

  if (!split) {
    return cellParagraph(text, { size: FONT_BODY, indentNiveau })
  }

  return new Paragraph({
    alignment: toDocxAlignment(detectAlignment(text)),
    indent: indentNiveau
      ? { left: indentNiveau * SECTION_INDENT_DXA }
      : undefined,
    spacing: { before: 40, after: 40, line: 260 },
    children: [
      new TextRun({
        text: split.prefix,
        bold: true,
        color: theme.text,
        size: FONT_BODY,
        font: 'Calibri',
      }),
      new TextRun({
        text: `${column!.boldPrefixSeparator}${split.rest}`,
        color: theme.text,
        size: FONT_BODY,
        font: 'Calibri',
      }),
    ],
  })
}

/** Retrait (dxa) par niveau de cadre des libellés de section (~0,5 cm). */
const SECTION_INDENT_DXA = 283

/** Largeur (dxa) d'une colonne d'indentation hiérarchique (~5 mm). */
const WORD_INDENT_COLUMN_WIDTH = 300

/** Cellule vide bordée (colonnes d'indentation, cellules de section). */
function emptyBodyCell(width: number, fill: string) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
    borders: dataCellBorders(false),
    children: [new Paragraph('')],
  })
}

/**
 * Paragraphe d'un libellé de section : code en gras + reste en normal
 * (séparateur ' : '), tout en gras sinon ; retrait proportionnel au niveau.
 */
function sectionLabelParagraph(label: string, niveau: number) {
  const split = splitCellBoldPrefix(label, SECTION_LABEL_SEPARATOR)

  const children = split
    ? [
        new TextRun({
          text: split.prefix,
          bold: true,
          color: theme.text,
          size: FONT_BODY,
          font: 'Calibri',
        }),
        new TextRun({
          text: `${SECTION_LABEL_SEPARATOR}${split.rest}`,
          color: theme.text,
          size: FONT_BODY,
          font: 'Calibri',
        }),
      ]
    : [
        new TextRun({
          text: label,
          bold: true,
          color: theme.text,
          size: FONT_BODY,
          font: 'Calibri',
        }),
      ]

  return new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: niveau > 0 ? { left: niveau * SECTION_INDENT_DXA } : undefined,
    spacing: { before: 40, after: 40, line: 260 },
    children,
  })
}

function bodyCell(
  text: string,
  width: number,
  shaded: boolean,
  column?: { boldPrefixSeparator?: string },
  indentNiveau?: number
) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: {
      fill: shaded ? theme.greenMuted : theme.white,
      type: ShadingType.CLEAR,
      color: 'auto',
    },
    borders: dataCellBorders(false),
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    verticalAlign: VerticalAlignTable.CENTER,
    children: [bodyCellParagraph(text, column, indentNiveau)],
  })
}

function buildDataTable(
  merged: MergedGanttTable,
  columnWidths: number[],
  rowMetas?: RapportExportRowMeta[],
  headerGroupRanges: ResolvedHeaderGroupRange[] = [],
  indentColumnCount = 0
) {
  const { columns, rows, ganttStartIndex, isGanttActive } = merged
  // GROUPING PTBA (comme PDF)
  const groupSpans = new Map<string | number, number>()
  const groupSeen = new Set<string | number>()

  rows.forEach((_, i) => {
    const meta = rowMetas?.[i]
    if (!meta || meta.type !== 'data') return
    if (!meta.groupKey) return

    groupSpans.set(meta.groupKey, (groupSpans.get(meta.groupKey) ?? 0) + 1)
  })

  // Fusions verticales par colonne (mergeKeys)
  const cellMerges = resolveCellMerges(rowMetas)

  // Colonne « Activité » qui accueille les libellés de section indentés.
  const sectionColumnIndex = findSectionColumnIndex(columns)

  /** Index grid (0-based) d'une colonne de données hors zone Activité. */
  const toGridIndex = (colIndex: number) =>
    colIndex < sectionColumnIndex ? colIndex : colIndex + indentColumnCount

  /** Largeur (dxa) de la zone Activité fusionnée depuis un niveau donné. */
  const regionWidth = (startOffset: number) =>
    columnWidths
      .slice(
        sectionColumnIndex + startOffset,
        sectionColumnIndex + indentColumnCount + 1
      )
      .reduce((sum, w) => sum + (w ?? 1800), 0)

  return new Table({
    width: { size: WORD_LANDSCAPE_CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,

    rows: [
      // HEADER (1 ligne, ou 2 lignes avec en-têtes fusionnés)
      ...buildHeaderRows(
        columns,
        columnWidths,
        headerGroupRanges,
        sectionColumnIndex,
        indentColumnCount
      ),

      // BODY
      ...rows.map((row, rowIndex) => {
        const meta = rowMetas?.[rowIndex]
        const shaded = rowIndex % 2 === 1

        // SECTION (CADRE ANALYTIQUE) : cellules d'indentation bordées
        // (comme l'export Excel) puis libellé fusionné sur toutes les
        // colonnes restantes à droite.
        if (meta?.type === 'section') {
          const niveau = meta.niveau ?? 0
          const startOffset = Math.min(niveau, indentColumnCount)
          const labelGridStart = sectionColumnIndex + startOffset
          const spanCount = columnWidths.length - labelGridStart

          const cells: TableCell[] = []

          // Colonnes de données avant la zone Activité (aucune dans les
          // rapports actuels, l'Activité est en tête).
          for (let colIndex = 0; colIndex < sectionColumnIndex; colIndex += 1) {
            cells.push(
              emptyBodyCell(columnWidths[colIndex] ?? 1800, theme.greenMuted)
            )
          }

          // Cellules d'indentation avant le libellé.
          for (let k = 0; k < startOffset; k += 1) {
            cells.push(
              emptyBodyCell(
                columnWidths[sectionColumnIndex + k] ??
                  WORD_INDENT_COLUMN_WIDTH,
                theme.greenMuted
              )
            )
          }

          const labelWidth = columnWidths
            .slice(labelGridStart)
            .reduce((sum, w) => sum + (w ?? 1800), 0)

          cells.push(
            new TableCell({
              width: { size: labelWidth, type: WidthType.DXA },
              columnSpan: spanCount > 1 ? spanCount : undefined,
              shading: {
                fill: theme.greenMuted,
                type: ShadingType.CLEAR,
                color: 'auto',
              },
              borders: dataCellBorders(false),
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              verticalAlign: VerticalAlignTable.CENTER,
              children: [
                sectionLabelParagraph(
                  meta.label ?? '',
                  indentColumnCount === 0 ? niveau : 0
                ),
              ],
            })
          )

          return new TableRow({ cantSplit: true, children: cells })
        }

        // DATA ROW (fusions verticales par colonne via mergeKeys)

        if (meta?.type === 'data' && meta.mergeKeys) {
          const startOffset = Math.min(meta.niveau ?? 0, indentColumnCount)
          const spanCount = indentColumnCount - startOffset + 1
          const rowFill = shaded ? theme.greenMuted : theme.white

          const cells: TableCell[] = []

          row.forEach((value, colIndex) => {
            const cellId = `${rowIndex}:${colIndex}`

            // Zone « Activité » : cellules d'indentation puis libellé
            // fusionné jusqu'à la colonne principale.
            if (colIndex === sectionColumnIndex) {
              for (let k = 0; k < startOffset; k += 1) {
                cells.push(
                  emptyBodyCell(
                    columnWidths[sectionColumnIndex + k] ??
                      WORD_INDENT_COLUMN_WIDTH,
                    rowFill
                  )
                )
              }

              const width = regionWidth(startOffset)
              const columnSpan = spanCount > 1 ? spanCount : undefined

              // Ligne suivante d'une fusion verticale.
              if (cellMerges.covered.has(cellId)) {
                cells.push(
                  new TableCell({
                    width: { size: width, type: WidthType.DXA },
                    columnSpan,
                    verticalMerge: VerticalMergeType.CONTINUE,
                    shading: {
                      fill: rowFill,
                      type: ShadingType.CLEAR,
                      color: 'auto',
                    },
                    borders: dataCellBorders(false),
                    children: [new Paragraph('')],
                  })
                )
                return
              }

              const span = cellMerges.spans.get(cellId) ?? 1

              cells.push(
                new TableCell({
                  width: { size: width, type: WidthType.DXA },
                  columnSpan,
                  verticalMerge:
                    span > 1 ? VerticalMergeType.RESTART : undefined,
                  shading: {
                    fill: rowFill,
                    type: ShadingType.CLEAR,
                    color: 'auto',
                  },
                  borders: dataCellBorders(false),
                  margins: { top: 80, bottom: 80, left: 100, right: 100 },
                  verticalAlign: VerticalAlignTable.CENTER,
                  children: [
                    bodyCellParagraph(
                      value,
                      columns[colIndex],
                      indentColumnCount === 0 ? meta.niveau : undefined
                    ),
                  ],
                })
              )
              return
            }

            const width = columnWidths[toGridIndex(colIndex)] ?? 1800

            // Cellule couverte par une fusion démarrée plus haut.
            if (cellMerges.covered.has(cellId)) {
              cells.push(
                new TableCell({
                  width: { size: width, type: WidthType.DXA },
                  verticalMerge: VerticalMergeType.CONTINUE,
                  shading: {
                    fill: rowFill,
                    type: ShadingType.CLEAR,
                    color: 'auto',
                  },
                  borders: dataCellBorders(false),
                  children: [new Paragraph('')],
                })
              )
              return
            }

            // Première cellule d'un groupe fusionné.
            if ((cellMerges.spans.get(cellId) ?? 1) > 1) {
              cells.push(
                new TableCell({
                  width: { size: width, type: WidthType.DXA },
                  verticalMerge: VerticalMergeType.RESTART,
                  shading: {
                    fill: rowFill,
                    type: ShadingType.CLEAR,
                    color: 'auto',
                  },
                  borders: dataCellBorders(false),
                  verticalAlign: VerticalAlignTable.CENTER,
                  children: [bodyCellParagraph(value, columns[colIndex])],
                })
              )
              return
            }

            if (colIndex >= ganttStartIndex) {
              cells.push(
                ganttCell(width, isGanttActive(rowIndex, colIndex), shaded)
              )
              return
            }

            cells.push(bodyCell(value, width, shaded, columns[colIndex]))
          })

          return new TableRow({ cantSplit: true, children: cells })
        }

        // DATA ROW (PTBA GROUPING — fusion legacy des colonnes 0 et 1,
        // plus émise par les pages et jamais combinée à l'indentation
        // structurelle)

        if (
          meta?.type === 'data' &&
          meta.groupKey != null &&
          indentColumnCount === 0
        ) {
          const groupKey = meta.groupKey
          const isFirst = !groupSeen.has(groupKey)

          if (isFirst) {
            groupSeen.add(groupKey)

            return new TableRow({
              cantSplit: true,
              children: row.map((value, colIndex) => {
                const width = columnWidths[colIndex] ?? 1800
                const indentNiveau =
                  colIndex === sectionColumnIndex ? meta.niveau : undefined

                // fusion Code + Activité
                if (colIndex === 0 || colIndex === 1) {
                  return new TableCell({
                    width: { size: width, type: WidthType.DXA },
                    verticalMerge: VerticalMergeType.RESTART,
                    shading: {
                      fill: shaded ? theme.greenMuted : theme.white,
                      type: ShadingType.CLEAR,
                      color: 'auto',
                    },
                    borders: dataCellBorders(false),
                    verticalAlign: VerticalAlignTable.CENTER,
                    children: [
                      bodyCellParagraph(
                        value,
                        columns[colIndex],
                        indentNiveau
                      ),
                    ],
                  })
                }

                if (colIndex >= ganttStartIndex) {
                  return ganttCell(
                    width,
                    isGanttActive(rowIndex, colIndex),
                    shaded
                  )
                }

                return bodyCell(
                  value,
                  width,
                  shaded,
                  columns[colIndex],
                  indentNiveau
                )
              }),
            })
          }

          return new TableRow({
            cantSplit: true,
            children: row.map((value, colIndex) => {
              const width = columnWidths[colIndex] ?? 1800

              if (colIndex === 0 || colIndex === 1) {
                return new TableCell({
                  width: { size: width, type: WidthType.DXA },
                  verticalMerge: VerticalMergeType.CONTINUE,
                  shading: {
                    fill: shaded ? theme.greenMuted : theme.white,
                    type: ShadingType.CLEAR,
                    color: 'auto',
                  },
                  borders: dataCellBorders(false),
                  children: [new Paragraph('')],
                })
              }

              if (colIndex >= ganttStartIndex) {
                return ganttCell(
                  width,
                  isGanttActive(rowIndex, colIndex),
                  shaded
                )
              }

              return bodyCell(value, width, shaded, columns[colIndex])
            }),
          })
        }

        // NORMAL ROW

        const startOffset = Math.min(
          meta?.type === 'data' ? (meta.niveau ?? 0) : 0,
          indentColumnCount
        )
        const spanCount = indentColumnCount - startOffset + 1
        const rowFill = shaded ? theme.greenMuted : theme.white

        const cells: TableCell[] = []

        row.forEach((value, colIndex) => {
          if (colIndex === sectionColumnIndex) {
            for (let k = 0; k < startOffset; k += 1) {
              cells.push(
                emptyBodyCell(
                  columnWidths[sectionColumnIndex + k] ??
                    WORD_INDENT_COLUMN_WIDTH,
                  rowFill
                )
              )
            }

            cells.push(
              new TableCell({
                width: {
                  size: regionWidth(startOffset),
                  type: WidthType.DXA,
                },
                columnSpan: spanCount > 1 ? spanCount : undefined,
                shading: {
                  fill: rowFill,
                  type: ShadingType.CLEAR,
                  color: 'auto',
                },
                borders: dataCellBorders(false),
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                verticalAlign: VerticalAlignTable.CENTER,
                children: [
                  bodyCellParagraph(
                    value,
                    columns[colIndex],
                    indentColumnCount === 0 && meta?.type === 'data'
                      ? meta.niveau
                      : undefined
                  ),
                ],
              })
            )
            return
          }

          const width = columnWidths[toGridIndex(colIndex)] ?? 1800

          if (colIndex >= ganttStartIndex) {
            cells.push(
              ganttCell(width, isGanttActive(rowIndex, colIndex), shaded)
            )
            return
          }

          cells.push(bodyCell(value, width, shaded, columns[colIndex]))
        })

        return new TableRow({ cantSplit: true, children: cells })
      }),
    ],
  })
}

/** Paragraphes du préambule (section portrait avant le tableau). */
function buildPreambleParagraphs(
  blocks: RapportExportPreambleBlock[]
): Paragraph[] {
  return blocks.map((block) => {
    switch (block.type) {
      case 'title':
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 320 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: FONT_TITLE - 4,
              font: 'Calibri',
              color: theme.text,
            }),
          ],
        })
      case 'heading':
        return new Paragraph({
          spacing: { before: 280, after: 140 },
          children: [
            new TextRun({
              text: block.text,
              bold: true,
              size: FONT_HEADER,
              font: 'Calibri',
              color: theme.text,
            }),
          ],
        })
      case 'list':
        return new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 480 },
          spacing: { after: 80, line: 300 },
          children: [
            new TextRun({
              text: block.text,
              size: FONT_BODY,
              font: 'Calibri',
              color: theme.text,
            }),
          ],
        })
      default:
        return new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 140, line: 300 },
          children: [
            new TextRun({
              text: block.text,
              size: FONT_BODY,
              font: 'Calibri',
              color: theme.text,
            }),
          ],
        })
    }
  })
}

/** Largeur max (dxa) d'une colonne mensuelle du Gantt. */
const GANTT_WORD_COLUMN_WIDTH = 400
/** Part max de la largeur utile réservée aux colonnes du Gantt. */
const GANTT_WORD_MAX_WIDTH_RATIO = 0.5

export async function exportRapportWord(payload: RapportExportPayload) {
  const meta = buildRapportDocumentMeta(payload.pageTitle)

  const filtered = filterExportRows(
    payload.rows,
    payload.columns,
    payload.visibleColumnIds,
    payload.rowMetas
  )

  const merged = mergeGanttColumns(
    filtered.columns,
    filtered.rows,
    payload.gantt
  )
  const rowMetas = filtered.rowMetas
  const headerGroupRanges = resolveHeaderGroupRanges(
    filtered.columns,
    payload.headerGroups
  )

  // Indentation structurelle (comme l'export Excel) : colonnes étroites
  // insérées avant la colonne « Activité » — non combinable avec les
  // en-têtes fusionnés (aucun rapport ne cumule les deux).
  const baseSectionIndex = findSectionColumnIndex(merged.columns)
  const maxNiveau = (rowMetas ?? []).reduce(
    (max, rowMeta) => Math.max(max, rowMeta.niveau ?? 0),
    0
  )
  const indentColumnCount = headerGroupRanges.length === 0 ? maxNiveau : 0

  // Colonnes du Gantt étroites (plafonnées à la moitié de la page), le
  // reste de la largeur est réparti entre les colonnes de données.
  const ganttColWidth =
    merged.ganttColumnCount > 0
      ? Math.min(
          GANTT_WORD_COLUMN_WIDTH,
          Math.floor(
            (WORD_LANDSCAPE_CONTENT_WIDTH * GANTT_WORD_MAX_WIDTH_RATIO) /
              merged.ganttColumnCount
          )
        )
      : 0

  const dataColumnWidths = computeWordColumnWidthsDxa(
    filtered.columns,
    filtered.rows,
    WORD_LANDSCAPE_CONTENT_WIDTH -
      ganttColWidth * merged.ganttColumnCount -
      indentColumnCount * WORD_INDENT_COLUMN_WIDTH
  )

  const columnWidths: number[] = []
  dataColumnWidths.forEach((width, index) => {
    if (index === baseSectionIndex) {
      for (let k = 0; k < indentColumnCount; k += 1) {
        columnWidths.push(WORD_INDENT_COLUMN_WIDTH)
      }
    }
    columnWidths.push(width)
  })
  columnWidths.push(
    ...Array.from({ length: merged.ganttColumnCount }, () => ganttColWidth)
  )

  const hasPreamble = Boolean(payload.preamble?.length)

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: FONT_BODY,
            color: theme.text,
          },
        },
      },
    },
    sections: [
      // Préambule : bannière d'en-tête puis texte, pages en portrait.
      ...(hasPreamble
        ? [
            {
              properties: {
                page: {
                  size: {
                    orientation: PageOrientation.PORTRAIT,
                  },
                  margin: {
                    top: PAGE_MARGIN * 2,
                    right: PAGE_MARGIN * 2,
                    bottom: PAGE_MARGIN * 2,
                    left: PAGE_MARGIN * 2,
                  },
                },
              },
              children: [
                buildBannerTable(
                  meta.title,
                  meta.subtitle,
                  WORD_PORTRAIT_CONTENT_WIDTH
                ),
                new Paragraph({
                  spacing: { after: 240 },
                  children: [],
                }),
                ...buildPreambleParagraphs(payload.preamble!),
              ],
            },
          ]
        : []),
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: PAGE_MARGIN,
              right: PAGE_MARGIN,
              bottom: PAGE_MARGIN,
              left: PAGE_MARGIN,
            },
          },
        },
        children: [
          // La bannière est déjà en tête de la section préambule.
          ...(hasPreamble
            ? []
            : [
                buildBannerTable(meta.title, meta.subtitle),
                new Paragraph({
                  spacing: { after: 160 },
                  children: [],
                }),
              ]),
          buildDataTable(
            merged,
            columnWidths,
            rowMetas,
            headerGroupRanges,
            indentColumnCount
          ),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, buildExportFilename(meta.filenameSlug, 'docx'))
}
