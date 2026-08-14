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
  findSectionColumnIndex,
  resolveCellMerges,
  resolveHeaderGroupRanges,
  SECTION_LABEL_SEPARATOR,
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
 * Retrait hiérarchique : espaces en tête de texte plutôt qu'attribut
 * OOXML `indent`, ignoré par certains tableurs (Numbers notamment).
 */
const SECTION_EXCEL_INDENT_SPACES = '   '

function excelIndentPrefix(niveau: number | undefined): string {
  return niveau && niveau > 0 ? SECTION_EXCEL_INDENT_SPACES.repeat(niveau) : ''
}

/**
 * Écrit la valeur d'une cellule de données : texte riche (code en gras +
 * reste en normal) quand la colonne définit boldPrefixSeparator.
 * indentNiveau porte le retrait hiérarchique (activité sous son cadre).
 */
function setBodyCellValue(
  cell: ExcelJS.Cell,
  value: string,
  column?: { boldPrefixSeparator?: string },
  indentNiveau?: number
) {
  const prefix = excelIndentPrefix(indentNiveau)

  const split = column?.boldPrefixSeparator
    ? splitCellBoldPrefix(value, column.boldPrefixSeparator)
    : null

  if (!split) {
    cell.value = `${prefix}${value}`
    return
  }

  cell.value = {
    richText: [
      ...(prefix
        ? [
            {
              font: { size: 10, color: { argb: hexArgb(theme.text) } },
              text: prefix,
            },
          ]
        : []),
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

/**
 * Écrit le libellé d'une ligne de section : code en gras + reste en normal
 * quand le libellé contient le séparateur, tout en gras sinon. Le retrait
 * hiérarchique est porté par des espaces en tête de texte.
 */
function setSectionCellValue(
  cell: ExcelJS.Cell,
  label: string,
  niveau: number
) {
  const prefix = excelIndentPrefix(niveau)
  const split = splitCellBoldPrefix(label, SECTION_LABEL_SEPARATOR)

  if (split) {
    cell.value = {
      richText: [
        ...(prefix
          ? [
              {
                font: { size: 10, color: { argb: hexArgb(theme.text) } },
                text: prefix,
              },
            ]
          : []),
        {
          font: { bold: true, size: 10, color: { argb: hexArgb(theme.text) } },
          text: split.prefix,
        },
        {
          font: { size: 10, color: { argb: hexArgb(theme.text) } },
          text: `${SECTION_LABEL_SEPARATOR}${split.rest}`,
        },
      ],
    }
  } else {
    cell.value = `${prefix}${label}`
    cell.font = { bold: true, size: 10, color: { argb: hexArgb(theme.text) } }
  }

  cell.alignment = {
    vertical: 'middle',
    horizontal: 'left',
    wrapText: true,
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
const GANTT_EXCEL_COLUMN_WIDTH = 3

/** Largeur (en caractères) d'une colonne d'indentation hiérarchique. */
const EXCEL_INDENT_COLUMN_WIDTH = 3

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

  // ── INDENTATION STRUCTURELLE ─────────────────────────────────────────
  // L'attribut OOXML `indent` est ignoré par certains tableurs et un
  // préfixe d'espaces n'indente que la première ligne en cas de retour à
  // la ligne. L'indentation est donc matérialisée par de vraies colonnes
  // étroites insérées avant la colonne « Activité » : chaque libellé
  // fusionne de sa colonne de départ (selon son niveau) jusqu'à la colonne
  // principale, et les lignes repliées restent indentées.
  const baseSectionIndex = findSectionColumnIndex(columns)
  const maxNiveau = (rowMetas ?? []).reduce(
    (max, rowMeta) => Math.max(max, rowMeta.niveau ?? 0),
    0
  )
  // Non combinable avec les en-têtes fusionnés (aucun rapport ne cumule
  // les deux) : repli sur le préfixe d'espaces dans ce cas.
  const indentColumnCount = headerGroupRanges.length === 0 ? maxNiveau : 0
  const totalColumnCount = columns.length + indentColumnCount

  /**
   * Index feuille (0-based) d'une colonne de données. La colonne
   * « Activité » pointe sur sa colonne principale (dernière de la zone).
   */
  const toSheetIndex = (colIndex: number) =>
    colIndex < baseSectionIndex ? colIndex : colIndex + indentColumnCount

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

  const colCount = Math.max(totalColumnCount, 1)
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

  const dataColumnWidths = columns.map((column, index) => {
    if (index >= ganttStartIndex) return GANTT_EXCEL_COLUMN_WIDTH

    const values = rows.map((row) => row[index] ?? '')
    return estimateExcelColumnWidth(
      column.header,
      values,
      column.width ?? 16,
      52
    )
  })

  // Largeurs par colonne de la feuille : colonnes d'indentation étroites
  // insérées juste avant la colonne principale « Activité ».
  const sheetColumnWidths: number[] = []
  columns.forEach((_, index) => {
    if (index === baseSectionIndex) {
      for (let k = 0; k < indentColumnCount; k += 1) {
        sheetColumnWidths.push(EXCEL_INDENT_COLUMN_WIDTH)
      }
    }
    sheetColumnWidths.push(dataColumnWidths[index])
  })

  sheetColumnWidths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width
  })

  if (headerRowCount === 1) {
    const headerRow = sheet.getRow(5)
    columns.forEach((column, index) => {
      // En-tête « Activité » fusionné au-dessus des colonnes
      // d'indentation et de la colonne principale.
      if (index === baseSectionIndex && indentColumnCount > 0) {
        for (
          let sheetCol = baseSectionIndex;
          sheetCol <= baseSectionIndex + indentColumnCount;
          sheetCol += 1
        ) {
          applyHeaderStyle(headerRow.getCell(sheetCol + 1))
        }
        headerRow.getCell(baseSectionIndex + 1).value = column.header
        sheet.mergeCells(
          5,
          baseSectionIndex + 1,
          5,
          baseSectionIndex + indentColumnCount + 1
        )
        return
      }

      const cell = headerRow.getCell(toSheetIndex(index) + 1)
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
    const rowNumber = dataStartRow + rowIndex

    /**
     * Largeurs alignées sur les colonnes de données pour l'estimation de
     * hauteur : la zone Activité vaut la somme des colonnes fusionnées.
     */
    const rowHeightWidths = (startOffset: number) =>
      columns.map((_, colIndex) =>
        colIndex === baseSectionIndex
          ? sheetColumnWidths
              .slice(
                baseSectionIndex + startOffset,
                baseSectionIndex + indentColumnCount + 1
              )
              .reduce((sum, width) => sum + width, 0)
          : sheetColumnWidths[toSheetIndex(colIndex)]
      )

    /**
     * Écrit la zone Activité d'une ligne de données : libellé posé sur la
     * colonne correspondant à son niveau puis fusionné jusqu'à la colonne
     * principale — les lignes repliées restent indentées.
     */
    const writeActiviteRegion = (
      value: string,
      niveau: number | undefined,
      verticalSpan: number
    ) => {
      const startOffset = Math.min(niveau ?? 0, indentColumnCount)
      const labelStart = baseSectionIndex + startOffset
      const labelEnd = baseSectionIndex + indentColumnCount

      // Cellules d'indentation (et zone fusionnée) stylées avant fusion.
      for (let sheetCol = baseSectionIndex; sheetCol <= labelEnd; sheetCol += 1) {
        if (sheetCol === labelStart) continue
        const cell = excelRow.getCell(sheetCol + 1)
        cell.value = ''
        applyBodyStyle(cell, isAlt, '')
      }

      const cell = excelRow.getCell(labelStart + 1)
      setBodyCellValue(
        cell,
        value,
        columns[baseSectionIndex],
        indentColumnCount === 0 ? niveau : undefined
      )
      applyBodyStyle(cell, isAlt, value)

      if (verticalSpan > 1 || labelEnd > labelStart) {
        sheet.mergeCells(
          rowNumber,
          labelStart + 1,
          rowNumber + verticalSpan - 1,
          labelEnd + 1
        )
      }
      if (verticalSpan > 1) {
        cell.alignment = { ...cell.alignment, vertical: 'middle' }
      }
    }

    // ── SECTION ROW (cadre analytique) : libellé indenté selon le
    // niveau puis fusionné sur toutes les colonnes restantes à droite.
    if (rowMeta?.type === 'section') {
      const niveau = rowMeta.niveau ?? 0
      const label = rowMeta.label ?? ''
      const startOffset = Math.min(niveau, indentColumnCount)
      const labelStart = baseSectionIndex + startOffset
      const labelEnd = totalColumnCount - 1

      for (let sheetCol = 0; sheetCol < totalColumnCount; sheetCol += 1) {
        if (sheetCol === labelStart) continue
        const cell = excelRow.getCell(sheetCol + 1)
        cell.value = ''
        applyBodyStyle(cell, false, '')
      }

      const labelCell = excelRow.getCell(labelStart + 1)
      applyBodyStyle(labelCell, false, '')
      setSectionCellValue(
        labelCell,
        label,
        indentColumnCount === 0 ? niveau : 0
      )

      if (labelEnd > labelStart) {
        sheet.mergeCells(rowNumber, labelStart + 1, rowNumber, labelEnd + 1)
      }

      const regionWidth = sheetColumnWidths
        .slice(labelStart, labelEnd + 1)
        .reduce((sum, width) => sum + width, 0)
      excelRow.height = estimateExcelRowHeight(
        [`${indentColumnCount === 0 ? excelIndentPrefix(niveau) : ''}${label}`],
        [regionWidth]
      )
      return
    }

    // ── DATA ROW avec mergeKeys (fusion verticale indépendante par colonne)
    if (rowMeta?.type === 'data' && rowMeta.mergeKeys) {
      const startOffset = Math.min(rowMeta.niveau ?? 0, indentColumnCount)

      row.forEach((value, colIndex) => {
        const cellId = `${rowIndex}:${colIndex}`

        // Cellule couverte par une fusion démarrée plus haut : on ne
        // touche pas au rectangle fusionné, seules les cellules
        // d'indentation qui le précèdent sont stylées.
        if (cellMerges.covered.has(cellId)) {
          if (colIndex === baseSectionIndex) {
            for (let k = 0; k < startOffset; k += 1) {
              const cell = excelRow.getCell(baseSectionIndex + k + 1)
              cell.value = ''
              applyBodyStyle(cell, isAlt, '')
            }
          }
          return
        }

        const span = cellMerges.spans.get(cellId) ?? 1

        if (colIndex === baseSectionIndex) {
          writeActiviteRegion(value, rowMeta.niveau, span)
          return
        }

        const sheetCol = toSheetIndex(colIndex)

        if (span > 1) {
          sheet.mergeCells(
            rowNumber,
            sheetCol + 1,
            rowNumber + span - 1,
            sheetCol + 1
          )
        }

        const cell = excelRow.getCell(sheetCol + 1)
        setBodyCellValue(cell, value, columns[colIndex])
        applyBodyStyle(cell, isAlt, value)
        if (isGanttActive(rowIndex, colIndex)) applyGanttActiveStyle(cell)

        if (span > 1) {
          cell.alignment = { ...cell.alignment, vertical: 'middle' }
        }
      })

      excelRow.height = estimateExcelRowHeight(row, rowHeightWidths(startOffset))
      return
    }

    // ── DATA ROW avec groupKey (fusion legacy des colonnes 0 et 1) ──
    // Plus émis par les pages (remplacé par mergeKeys) ; jamais combiné à
    // l'indentation structurelle.
    if (
      rowMeta?.type === 'data' &&
      rowMeta.groupKey != null &&
      indentColumnCount === 0
    ) {
      const groupKey = rowMeta.groupKey
      const isFirst = !groupSeen.has(groupKey)

      if (isFirst) {
        groupSeen.add(groupKey)
        const span = groupSpans.get(groupKey) ?? 1

        // Fusion verticale des colonnes code (1) et activité (2)
        if (span > 1) {
          sheet.mergeCells(rowNumber, 1, rowNumber + span - 1, 1)
          sheet.mergeCells(rowNumber, 2, rowNumber + span - 1, 2)
        }

        // Écriture de toutes les colonnes
        row.forEach((value, colIndex) => {
          const cell = excelRow.getCell(colIndex + 1)
          setBodyCellValue(
            cell,
            value,
            columns[colIndex],
            colIndex === baseSectionIndex ? rowMeta.niveau : undefined
          )
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

      excelRow.height = estimateExcelRowHeight(row, rowHeightWidths(0))
      return
    }

    // NORMAL ROW
    const normalOffset = Math.min(
      rowMeta?.type === 'data' ? (rowMeta.niveau ?? 0) : 0,
      indentColumnCount
    )

    row.forEach((value, colIndex) => {
      if (colIndex === baseSectionIndex) {
        writeActiviteRegion(
          value,
          rowMeta?.type === 'data' ? rowMeta.niveau : undefined,
          1
        )
        return
      }

      const cell = excelRow.getCell(toSheetIndex(colIndex) + 1)
      setBodyCellValue(cell, value, columns[colIndex])
      applyBodyStyle(cell, isAlt, value)
      if (isGanttActive(rowIndex, colIndex)) applyGanttActiveStyle(cell)
    })

    excelRow.height = estimateExcelRowHeight(row, rowHeightWidths(normalOffset))
  })

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    buildExportFilename(meta.filenameSlug, 'xlsx')
  )
}
