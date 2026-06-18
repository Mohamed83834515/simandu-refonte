import ExcelJS from 'exceljs'
import {
  buildExportFilename,
  buildRapportDocumentMeta,
  downloadBlob,
  filterExportRows,
} from './rapportExportUtils'
import type { RapportExportPayload } from './rapportExportTypes'
import {
  estimateExcelColumnWidth,
  estimateExcelRowHeight,
  estimateSubtitleRowHeight,
  EXPORT_CELL_ALIGN,
} from './rapportExportLayout'
import { hexArgb, RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'

function applyHeaderStyle(cell: ExcelJS.Cell) {
  cell.font = { bold: true, color: { argb: hexArgb(theme.white) }, size: 11 }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(theme.green) },
  }
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  cell.border = {
    top: { style: 'thin', color: { argb: hexArgb(theme.greenDark) } },
    bottom: { style: 'thin', color: { argb: hexArgb(theme.greenDark) } },
    left: { style: 'thin', color: { argb: hexArgb(theme.greenDark) } },
    right: { style: 'thin', color: { argb: hexArgb(theme.greenDark) } },
  }
}

function applyBodyStyle(
  cell: ExcelJS.Cell,
  shaded: boolean,
  horizontal: 'left' | 'center' | 'right'
) {
  cell.alignment = {
    vertical: 'middle',
    horizontal,
    wrapText: true,
  }
  cell.font = { size: 10, color: { argb: hexArgb(theme.text) } }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(shaded ? theme.greenMuted : theme.white) },
  }
  cell.border = {
    top: { style: 'thin', color: { argb: hexArgb(theme.border) } },
    bottom: { style: 'thin', color: { argb: hexArgb(theme.border) } },
    left: { style: 'thin', color: { argb: hexArgb(theme.border) } },
    right: { style: 'thin', color: { argb: hexArgb(theme.border) } },
  }
}

export async function exportRapportExcel(payload: RapportExportPayload) {
  const meta = buildRapportDocumentMeta(payload.pageTitle)

  const { columns, rows } = filterExportRows(
    payload.rows,
    payload.columns,
    payload.visibleColumnIds
  )

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Simandu'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Rapport', {
    views: [{ state: 'frozen', ySplit: 5 }],
  })

  const colCount = Math.max(columns.length, 1)
  sheet.mergeCells(1, 1, 1, colCount)
  sheet.mergeCells(2, 1, 2, colCount)
  sheet.mergeCells(3, 1, 3, colCount)

  const titleCell = sheet.getCell(1, 1)
  titleCell.value = meta.title
  titleCell.font = { bold: true, size: 18, color: { argb: hexArgb(theme.white) } }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(theme.green) },
  }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  sheet.getRow(1).height = 34

  const subtitleCell = sheet.getCell(2, 1)
  subtitleCell.value = meta.subtitle
  subtitleCell.font = { size: 10, color: { argb: hexArgb(theme.textMuted) } }
  subtitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(theme.greenLight) },
  }
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  sheet.getRow(2).height = estimateSubtitleRowHeight(meta.subtitle, colCount)

  const stripeCell = sheet.getCell(3, 1)
  stripeCell.value = ''
  stripeCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(theme.yellow) },
  }
  sheet.getRow(3).height = 4

  const columnWidths = columns.map((column, index) => {
    const values = rows.map((row) => row[index] ?? '')
    return estimateExcelColumnWidth(column.header, values, column.width ?? 16, 52)
  })

  columnWidths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width
  })

  const headerRow = sheet.getRow(5)
  columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = column.header
    applyHeaderStyle(cell)
  })
  headerRow.height = 28

  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(6 + rowIndex)
    const isAlt = rowIndex % 2 === 1

    row.forEach((value, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1)
      cell.value = value
      applyBodyStyle(cell, isAlt, EXPORT_CELL_ALIGN)
    })

    excelRow.height = estimateExcelRowHeight(row, columnWidths)
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    buildExportFilename(meta.filenameSlug, 'xlsx')
  )
}
