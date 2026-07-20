import ExcelJS from 'exceljs'
import { mergeGanttColumns } from './rapportExportGanttColumns'
import {
  estimateExcelColumnWidth,
  estimateExcelRowHeight,
  estimateSubtitleRowHeight,
} from './rapportExportLayout'
import { hexArgb, RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'
import type {
  RapportExportPayload,
  RapportExportPreambleBlock,
} from './rapportExportTypes'
import {
  buildExportFilename,
  buildRapportDocumentMeta,
  detectAlignment,
  downloadBlob,
  filterExportRows,
  resolveCellMerges,
  resolveHeaderGroupRanges,
  splitCellBoldPrefix,
} from './rapportExportUtils'

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

function applyBodyStyle(cell: ExcelJS.Cell, shaded: boolean, value: unknown) {
  const horizontal = detectAlignment(value)

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

/**
 * Écrit la valeur d'une cellule de données : texte riche (code en gras +
 * reste en normal) quand la colonne définit boldPrefixSeparator.
 */
function setBodyCellValue(
  cell: ExcelJS.Cell,
  value: string,
  column?: { boldPrefixSeparator?: string }
) {
  const split = column?.boldPrefixSeparator
    ? splitCellBoldPrefix(value, column.boldPrefixSeparator)
    : null

  if (!split) {
    cell.value = value
    return
  }

  cell.value = {
    richText: [
      {
        font: { bold: true, size: 10, color: { argb: hexArgb(theme.text) } },
        text: split.prefix,
      },
      {
        font: { size: 10, color: { argb: hexArgb(theme.text) } },
        text: `${column!.boldPrefixSeparator}${split.rest}`,
      },
    ],
  }
}

/** Cellule Gantt active : remplissage plein, la couleur porte l'information. */
function applyGanttActiveStyle(cell: ExcelJS.Cell) {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(theme.green) },
  }
}

/** Largeur (en caractères) des colonnes mensuelles du Gantt. */
const GANTT_EXCEL_COLUMN_WIDTH = 8

/** Feuille « Préambule » (orientation portrait), placée avant le tableau. */
function addPreambleSheet(
  workbook: ExcelJS.Workbook,
  blocks: RapportExportPreambleBlock[]
) {
  const sheet = workbook.addWorksheet('Préambule', {
    pageSetup: { orientation: 'portrait', paperSize: 9 },
  })

  sheet.getColumn(1).width = 110

  blocks.forEach((block, index) => {
    const cell = sheet.getCell(index + 1, 1)
    cell.value = block.type === 'list' ? `    ${block.text}` : block.text
    cell.alignment = {
      wrapText: true,
      vertical: 'top',
      horizontal: block.type === 'title' ? 'center' : 'left',
    }
    cell.font = {
      size: block.type === 'title' ? 14 : 11,
      bold: block.type === 'title' || block.type === 'heading',
      color: { argb: hexArgb(theme.text) },
    }

    const charsPerLine = 100
    const lines = Math.max(1, Math.ceil(block.text.length / charsPerLine))
    sheet.getRow(index + 1).height = Math.max(18, lines * 15)
  })
}

export async function exportRapportExcel(payload: RapportExportPayload) {
  const meta = buildRapportDocumentMeta(payload.pageTitle)

  const filtered = filterExportRows(
    payload.rows,
    payload.columns,
    payload.visibleColumnIds,
    payload.rowMetas
  )

  const { columns, rows, ganttStartIndex, isGanttActive } = mergeGanttColumns(
    filtered.columns,
    filtered.rows,
    payload.gantt
  )
  const rowMetas = filtered.rowMetas

  const headerGroupRanges = resolveHeaderGroupRanges(
    filtered.columns,
    payload.headerGroups
  )
  // 2 lignes d'en-tête quand des en-têtes fusionnés sont définis.
  const headerRowCount = headerGroupRanges.length > 0 ? 2 : 1
  const dataStartRow = 5 + headerRowCount

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Simandu'
  workbook.created = new Date()

  if (payload.preamble?.length) {
    addPreambleSheet(workbook, payload.preamble)
  }

  const sheet = workbook.addWorksheet('Rapport', {
    views: [{ state: 'frozen', ySplit: dataStartRow - 1 }],
    pageSetup: { orientation: 'landscape', paperSize: 9 },
  })

  const colCount = Math.max(columns.length, 1)
  sheet.mergeCells(1, 1, 1, colCount)
  sheet.mergeCells(2, 1, 2, colCount)
  sheet.mergeCells(3, 1, 3, colCount)

  const titleCell = sheet.getCell(1, 1)
  titleCell.value = meta.title
  titleCell.font = {
    bold: true,
    size: 18,
    color: { argb: hexArgb(theme.white) },
  }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(theme.green) },
  }
  titleCell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true,
  }
  sheet.getRow(1).height = 34

  const subtitleCell = sheet.getCell(2, 1)
  subtitleCell.value = meta.subtitle
  subtitleCell.font = { size: 10, color: { argb: hexArgb(theme.textMuted) } }
  subtitleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: hexArgb(theme.greenLight) },
  }
  subtitleCell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true,
  }
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
    if (index >= ganttStartIndex) return GANTT_EXCEL_COLUMN_WIDTH

    const values = rows.map((row) => row[index] ?? '')
    return estimateExcelColumnWidth(
      column.header,
      values,
      column.width ?? 16,
      52
    )
  })

  columnWidths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width
  })

  if (headerRowCount === 1) {
    const headerRow = sheet.getRow(5)
    columns.forEach((column, index) => {
      const cell = headerRow.getCell(index + 1)
      cell.value = column.header
      applyHeaderStyle(cell)
    })
    headerRow.height = 28
  } else {
    // Deux lignes : groupes fusionnés horizontalement (ligne 5), colonnes
    // hors groupe fusionnées verticalement (lignes 5–6).
    const topRow = sheet.getRow(5)
    const subRow = sheet.getRow(6)

    const rangeByColumn = new Map<number, (typeof headerGroupRanges)[number]>()
    headerGroupRanges.forEach((range) => {
      for (let i = range.start; i <= range.end; i += 1) {
        rangeByColumn.set(i, range)
      }
    })

    columns.forEach((column, index) => {
      const col = index + 1
      const range = rangeByColumn.get(index)

      if (!range) {
        sheet.mergeCells(5, col, 6, col)
        const cell = topRow.getCell(col)
        cell.value = column.header
        applyHeaderStyle(cell)
        applyHeaderStyle(subRow.getCell(col))
        return
      }

      if (index === range.start) {
        // Fusion horizontale du groupe, étendue aux deux lignes d'en-tête
        // quand les sous-colonnes ne doivent pas être affichées.
        sheet.mergeCells(
          5,
          range.start + 1,
          range.mergeSubHeaders ? 6 : 5,
          range.end + 1
        )
        const groupCell = topRow.getCell(range.start + 1)
        groupCell.value = range.header
        applyHeaderStyle(groupCell)
      }
      applyHeaderStyle(topRow.getCell(col))

      const cell = subRow.getCell(col)
      if (!range.mergeSubHeaders) {
        cell.value = column.header
      }
      applyHeaderStyle(cell)
    })

    topRow.height = 22
    subRow.height = 26
  }

  // PRE-PASS : fusions verticales par colonne (mergeKeys)
  const cellMerges = resolveCellMerges(rowMetas)

  // PRE-PASS : calcul des rowSpans par groupKey
  const groupSpans = new Map<string | number, number>()
  const groupSeen = new Set<string | number>()

  rows.forEach((_, i) => {
    const rowMeta = rowMetas?.[i]
    if (!rowMeta || rowMeta.type !== 'data') return
    if (!rowMeta.groupKey) return
    groupSpans.set(
      rowMeta.groupKey,
      (groupSpans.get(rowMeta.groupKey) ?? 0) + 1
    )
  })

  rows.forEach((row, rowIndex) => {
    const rowMeta = rowMetas?.[rowIndex]
    const excelRow = sheet.getRow(dataStartRow + rowIndex)
    const isAlt = rowIndex % 2 === 1

    // ── SECTION ROW (cadre analytique)
    if (rowMeta?.type === 'section') {
      const startCol = (rowMeta.niveau ?? 1) + 1
      const colCount = columns.length
      const rowNumber = dataStartRow + rowIndex

      sheet.mergeCells(rowNumber, startCol, rowNumber, colCount)

      const cell = excelRow.getCell(startCol)
      cell.value = rowMeta.label ?? ''

      applyBodyStyle(cell, false, cell.value)
      cell.font = { bold: true, size: 10, color: { argb: hexArgb(theme.text) } }

      excelRow.height = 22
      return
    }

    // ── DATA ROW avec mergeKeys (fusion verticale indépendante par colonne)
    if (rowMeta?.type === 'data' && rowMeta.mergeKeys) {
      row.forEach((value, colIndex) => {
        const cellId = `${rowIndex}:${colIndex}`

        // Cellule couverte par une fusion démarrée plus haut : on ne la
        // touche pas.
        if (cellMerges.covered.has(cellId)) return

        const cell = excelRow.getCell(colIndex + 1)
        const span = cellMerges.spans.get(cellId) ?? 1

        if (span > 1) {
          const rowNumber = dataStartRow + rowIndex
          sheet.mergeCells(
            rowNumber,
            colIndex + 1,
            rowNumber + span - 1,
            colIndex + 1
          )
        }

        setBodyCellValue(cell, value, columns[colIndex])
        applyBodyStyle(cell, isAlt, value)
        if (isGanttActive(rowIndex, colIndex)) applyGanttActiveStyle(cell)

        if (span > 1) {
          cell.alignment = { ...cell.alignment, vertical: 'middle' }
        }
      })

      excelRow.height = estimateExcelRowHeight(row, columnWidths)
      return
    }

    // ── DATA ROW avec groupKey (code + activité fusionnés verticalement) ──
    //
    //   - première occurrence du groupKey → on fusionne les cellules des
    //     colonnes 0 et 1 sur `span` lignes, on écrit toutes les valeurs
    //   - occurrences suivantes → on saute les colonnes 0 et 1 (déjà
    //     couvertes par la fusion), on écrit uniquement les autres colonnes
    if (rowMeta?.type === 'data' && rowMeta.groupKey != null) {
      const groupKey = rowMeta.groupKey
      const isFirst = !groupSeen.has(groupKey)

      if (isFirst) {
        groupSeen.add(groupKey)
        const span = groupSpans.get(groupKey) ?? 1
        const rowNumber = dataStartRow + rowIndex

        // Fusion verticale des colonnes code (1) et activité (2)
        if (span > 1) {
          sheet.mergeCells(rowNumber, 1, rowNumber + span - 1, 1)
          sheet.mergeCells(rowNumber, 2, rowNumber + span - 1, 2)
        }

        // Écriture de toutes les colonnes
        row.forEach((value, colIndex) => {
          const cell = excelRow.getCell(colIndex + 1)
          setBodyCellValue(cell, value, columns[colIndex])
          applyBodyStyle(cell, isAlt, value)
          if (isGanttActive(rowIndex, colIndex)) applyGanttActiveStyle(cell)

          // Centrage vertical explicite pour les cellules fusionnées
          if ((colIndex === 0 || colIndex === 1) && span > 1) {
            cell.alignment = { ...cell.alignment, vertical: 'middle' }
          }
        })
      } else {
        // Lignes suivantes du groupe : colonnes 0 et 1 appartiennent à la
        // fusion — on ne les touche pas. On écrit uniquement les autres.
        row.forEach((value, colIndex) => {
          if (colIndex === 0 || colIndex === 1) return

          const cell = excelRow.getCell(colIndex + 1)
          setBodyCellValue(cell, value, columns[colIndex])
          applyBodyStyle(cell, isAlt, value)
          if (isGanttActive(rowIndex, colIndex)) applyGanttActiveStyle(cell)
        })
      }

      excelRow.height = estimateExcelRowHeight(row, columnWidths)
      return
    }

    // NORMAL ROW
    row.forEach((value, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1)
      setBodyCellValue(cell, value, columns[colIndex])
      applyBodyStyle(cell, isAlt, value)
      if (isGanttActive(rowIndex, colIndex)) applyGanttActiveStyle(cell)
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
