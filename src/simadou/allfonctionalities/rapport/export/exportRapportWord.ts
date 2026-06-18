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
  WidthType,
} from 'docx'
import {
  buildExportFilename,
  buildRapportDocumentMeta,
  downloadBlob,
  filterExportRows,
} from './rapportExportUtils'
import type { RapportExportColumn, RapportExportPayload } from './rapportExportTypes'
import {
  computeWordColumnWidthsDxa,
  WORD_LANDSCAPE_CONTENT_WIDTH,
} from './rapportExportLayout'
import { RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'

const PAGE_MARGIN = 720
const FONT_TITLE = 32
const FONT_SUBTITLE = 20
const FONT_HEADER = 22
const FONT_BODY = 20

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
  } = {}
) {
  return new Paragraph({
    alignment: toDocxAlignment(options.align ?? 'center'),
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

function buildBannerTable(title: string, subtitle: string) {
  return new Table({
    width: { size: WORD_LANDSCAPE_CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [WORD_LANDSCAPE_CONTENT_WIDTH],
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
              }),
            ],
            theme.greenLight
          ),
        ],
      }),
      new TableRow({
        height: { value: 100, rule: HeightRule.EXACT },
        children: [
          bannerCell([cellParagraph('', { size: 2 })], theme.yellow, {
            height: 100,
          }),
        ],
      }),
    ],
  })
}

function headerCell(text: string, width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: theme.green, type: ShadingType.CLEAR, color: 'auto' },
    borders: dataCellBorders(true),
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    verticalAlign: VerticalAlignTable.CENTER,
    children: [
      cellParagraph(text, {
        bold: true,
        color: theme.white,
        size: FONT_HEADER,
      }),
    ],
  })
}

function bodyCell(text: string, width: number, shaded: boolean) {
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
    children: [
      cellParagraph(text, {
        size: FONT_BODY,
      }),
    ],
  })
}

function buildDataTable(
  columns: RapportExportColumn[],
  rows: string[][],
  columnWidths: number[]
) {
  return new Table({
    width: { size: WORD_LANDSCAPE_CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: columns.map((column, index) =>
          headerCell(column.header, columnWidths[index] ?? 1800)
        ),
      }),
      ...rows.map(
        (row, rowIndex) =>
          new TableRow({
            cantSplit: true,
            children: row.map((value, colIndex) =>
              bodyCell(
                value,
                columnWidths[colIndex] ?? 1800,
                rowIndex % 2 === 1
              )
            ),
          })
      ),
    ],
  })
}

export async function exportRapportWord(payload: RapportExportPayload) {
  const meta = buildRapportDocumentMeta(payload.pageTitle)

  const { columns, rows } = filterExportRows(
    payload.rows,
    payload.columns,
    payload.visibleColumnIds
  )

  const columnWidths = computeWordColumnWidthsDxa(columns, rows)

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
          buildBannerTable(meta.title, meta.subtitle),
          new Paragraph({
            spacing: { after: 160 },
            children: [],
          }),
          buildDataTable(columns, rows, columnWidths),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, buildExportFilename(meta.filenameSlug, 'docx'))
}
