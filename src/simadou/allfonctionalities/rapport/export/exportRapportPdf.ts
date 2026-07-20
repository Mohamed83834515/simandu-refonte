import jsPDF from 'jspdf'
import autoTable, {
  type CellDef,
  type RowInput,
  type Styles,
} from 'jspdf-autotable'
import { mergeGanttColumns } from './rapportExportGanttColumns'
import { EXPORT_CELL_ALIGN } from './rapportExportLayout'
import { RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'
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
  type ResolvedHeaderGroupRange,
} from './rapportExportUtils'

function hexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

/** Largeur max (mm) d'une colonne mensuelle du Gantt. */
const GANTT_PDF_COLUMN_WIDTH = 9
/** Part max de la largeur utile réservée aux colonnes du Gantt. */
const GANTT_PDF_MAX_WIDTH_RATIO = 0.5

/**
 * Lignes d'en-tête autoTable : une seule ligne sans groupes, deux lignes
 * quand des en-têtes fusionnés sont définis (rowSpan pour les colonnes hors
 * groupe, colSpan pour le libellé du groupe).
 */
function buildPdfHead(
  columns: { header: string }[],
  groupRanges: ResolvedHeaderGroupRange[]
): RowInput[] {
  if (groupRanges.length === 0) {
    return [columns.map((c) => c.header)]
  }

  const rangeByColumn = new Map<number, ResolvedHeaderGroupRange>()
  groupRanges.forEach((range) => {
    for (let i = range.start; i <= range.end; i += 1) {
      rangeByColumn.set(i, range)
    }
  })

  const top: CellDef[] = []
  const bottom: CellDef[] = []

  columns.forEach((column, index) => {
    const range = rangeByColumn.get(index)

    if (!range) {
      top.push({ content: column.header, rowSpan: 2 })
      return
    }

    if (index === range.start) {
      top.push({
        content: range.header,
        colSpan: range.end - range.start + 1,
        // Fusion verticale : les sous-colonnes ne sont pas affichées.
        rowSpan: range.mergeSubHeaders ? 2 : 1,
      })
    }
    if (!range.mergeSubHeaders) {
      bottom.push({ content: column.header })
    }
  })

  return [top, bottom]
}

/**
 * Rend le préambule sur des pages en portrait (avec sauts de page), avant
 * le tableau qui, lui, reste en paysage.
 */
function renderPreamblePdf(doc: jsPDF, blocks: RapportExportPreambleBlock[]) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 18
  const maxWidth = pageWidth - marginX * 2
  const bottom = pageHeight - 18

  let y = 36

  const ensureSpace = (needed: number) => {
    if (y + needed > bottom) {
      doc.addPage()
      y = 22
    }
  }

  doc.setTextColor(...hexRgb(theme.text))

  blocks.forEach((block) => {
    const isTitle = block.type === 'title'
    const isHeading = block.type === 'heading'
    const indent = block.type === 'list' ? 6 : 0

    doc.setFont('helvetica', isTitle || isHeading ? 'bold' : 'normal')
    doc.setFontSize(isTitle ? 13 : isHeading ? 10.5 : 10)

    const lineHeight = isTitle ? 6.5 : 5.2
    const lines: string[] = doc.splitTextToSize(block.text, maxWidth - indent)

    ensureSpace(lines.length * lineHeight + (isHeading ? 4 : 0))

    if (isHeading) y += 3

    if (isTitle) {
      doc.text(lines, pageWidth / 2, y, { align: 'center' })
    } else {
      doc.text(lines, marginX + indent, y)
    }

    y += lines.length * lineHeight + (isTitle ? 5 : 2)
  })
}

export async function exportRapportPdf(payload: RapportExportPayload) {
  const meta = buildRapportDocumentMeta(payload.pageTitle)

  const filtered = filterExportRows(
    payload.rows,
    payload.columns,
    payload.visibleColumnIds,
    payload.rowMetas
  )

  const { columns, rows, ganttStartIndex, ganttColumnCount, isGanttActive } =
    mergeGanttColumns(filtered.columns, filtered.rows, payload.gantt)
  const rowMetas = filtered.rowMetas
  const headerGroupRanges = resolveHeaderGroupRanges(
    filtered.columns,
    payload.headerGroups
  )

  const hasPreamble = Boolean(payload.preamble?.length)

  // Avec préambule : pages de texte en portrait, tableau en paysage.
  const doc = new jsPDF({
    orientation: hasPreamble ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Largeur de la première page (portrait avec préambule) pour la bannière.
  const bannerWidth = doc.internal.pageSize.getWidth()

  const green = hexRgb(theme.green)
  const yellow = hexRgb(theme.yellow)
  const red = hexRgb(theme.red)
  const greenLight = hexRgb(theme.greenLight)

  // HEADER DOCUMENT (sur la première page)
  doc.setFillColor(...green)
  doc.rect(0, 0, bannerWidth, 22, 'F')

  doc.setFillColor(...red)
  doc.rect(0, 22, bannerWidth / 3, 2, 'F')

  doc.setFillColor(...yellow)
  doc.rect(bannerWidth / 3, 22, bannerWidth / 3, 2, 'F')

  doc.setFillColor(...green)
  doc.rect((bannerWidth / 3) * 2, 22, bannerWidth / 3, 2, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(meta.title, bannerWidth / 2, 11, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(meta.subtitle, bannerWidth / 2, 18, {
    align: 'center',
    maxWidth: bannerWidth - 20,
  })

  // PREAMBULE (portrait) puis bascule en paysage pour le tableau
  if (hasPreamble) {
    renderPreamblePdf(doc, payload.preamble!)
    doc.addPage('a4', 'landscape')
  }

  // Géométrie du tableau, calculée sur la page paysage courante.
  const pageWidth = doc.internal.pageSize.getWidth()
  const usableWidth = pageWidth - 20

  // Colonnes du Gantt étroites (plafonnées à la moitié de la page), le
  // reste de la largeur est réparti entre les colonnes de données.
  const ganttColWidth =
    ganttColumnCount > 0
      ? Math.min(
          GANTT_PDF_COLUMN_WIDTH,
          (usableWidth * GANTT_PDF_MAX_WIDTH_RATIO) / ganttColumnCount
        )
      : 0
  const dataColWidth =
    (usableWidth - ganttColWidth * ganttColumnCount) / ganttStartIndex

  // Sans bannière sur la page du tableau (cas préambule), on remonte le tableau.
  const tableTop = hasPreamble ? 15 : 28

  // GROUP PTBA (ROWSPAN LOGIC)
  const groupSpans = new Map<string | number, number>()

  rows.forEach((_, i) => {
    const meta = rowMetas?.[i]
    if (!meta || meta.type !== 'data') return
    if (!meta.groupKey) return

    groupSpans.set(meta.groupKey, (groupSpans.get(meta.groupKey) ?? 0) + 1)
  })

  // Fusions verticales par colonne (mergeKeys)
  const cellMerges = resolveCellMerges(rowMetas)

  // Colonnes « code en gras » (boldPrefixSeparator) et cellules concernées.
  const boldPrefixByColumn = new Map<number, string>()
  columns.forEach((column, index) => {
    if (column.boldPrefixSeparator) {
      boldPrefixByColumn.set(index, column.boldPrefixSeparator)
    }
  })

  const boldPrefixCells = new Map<
    string,
    { lines: string[]; boldCount: number }
  >()

  // TABLE
  autoTable(doc, {
    startY: tableTop,

    head: buildPdfHead(columns, headerGroupRanges),
    body: rows.map((row) =>
      row.map((cell) =>
        String(cell ?? '')
          .replace(/\u00A0/g, ' ')
          .replace(/\u202F/g, ' ')
      )
    ),

    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 2,
      lineColor: hexRgb(theme.border),
      lineWidth: 0.1,
      textColor: hexRgb(theme.text),
      overflow: 'linebreak',
      cellWidth: 'auto',
      valign: 'middle',
    },

    headStyles: {
      fillColor: green,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },

    alternateRowStyles: {
      fillColor: greenLight,
    },

    columnStyles: columns.reduce<Record<number, Partial<Styles>>>(
      (acc, _, i) => {
        acc[i] = {
          halign: EXPORT_CELL_ALIGN,
          cellWidth: i >= ganttStartIndex ? ganttColWidth : dataColWidth,
        }
        return acc
      },
      {}
    ),

    margin: { top: tableTop, left: 10, right: 10, bottom: 14 },

    tableWidth: usableWidth,

    // CELL LOGIC
    didParseCell: (data) => {
      if (!rowMetas) return

      // Le hook est aussi appelé pour l'en-tête (row.index repart à 0 par
      // section) : seules les lignes du corps portent des rowMetas.
      if (data.section !== 'body') return

      const rowIndex = data.row.index
      const meta = rowMetas[rowIndex]

      if (!meta) return

      // SECTION CADRE ANALYTIQUE
      if (meta.type === 'section') {
        const totalColumns = columns.length
        const start = meta.niveau ?? 0

        if (data.column.index < start) {
          data.cell.text = ['']
          return
        }

        if (data.column.index === start) {
          data.cell.colSpan = totalColumns - start
          data.cell.text = [meta.label ?? '']
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.halign = 'left'
          return
        }

        data.cell.text = ['']
        data.cell.styles.lineWidth = 0
        return
      }

      // GANTT : cellule colorée si la tâche est active ce mois-là
      if (data.column.index >= ganttStartIndex) {
        if (isGanttActive(rowIndex, data.column.index)) {
          data.cell.styles.fillColor = green
        }
        return
      }

      // ALIGNEMENT TEXTE / NOMBRE
      const value = data.cell.text?.[0]
      data.cell.styles.halign = detectAlignment(value)

      // FUSIONS VERTICALES PAR COLONNE (mergeKeys)
      if (meta.type === 'data' && meta.mergeKeys) {
        const cellId = `${rowIndex}:${data.column.index}`

        if (cellMerges.covered.has(cellId)) {
          // Cellule couverte par une fusion : vidée, sans bordure interne.
          data.cell.text = ['']
          data.cell.styles.lineWidth = 0
        } else {
          const span = cellMerges.spans.get(cellId) ?? 1
          if (span > 1) {
            data.cell.rowSpan = span
            data.cell.styles.valign = 'middle'
          }
        }
      }

      // GROUP PTBA
      // CODE + ACTIVITE MERGE
      if (
        meta.type === 'data' &&
        meta.groupKey &&
        (data.column.index === 0 || data.column.index === 1)
      ) {
        const firstRowIndex = rows.findIndex(
          (_, index) =>
            rowMetas[index]?.type === 'data' &&
            rowMetas[index].groupKey === meta.groupKey
        )

        const isFirst = rowIndex === firstRowIndex

        if (isFirst) {
          const span = groupSpans.get(meta.groupKey) ?? 1

          data.cell.rowSpan = span

          data.cell.styles.valign = 'middle'
        } else {
          data.cell.text = ['']

          data.cell.styles.lineWidth = 0
        }
      }

      // CODE EN GRAS : la colonne définit boldPrefixSeparator → le code
      // (première ligne) sera dessiné en gras, le reste en normal.
      const separator = boldPrefixByColumn.get(data.column.index)
      if (separator && meta.type === 'data') {
        const raw = data.cell.text.join(' ')
        const split = splitCellBoldPrefix(raw, separator)

        if (split) {
          const maxWidth = dataColWidth - 4 // padding 2 mm de chaque côté
          doc.setFontSize(7)

          doc.setFont('helvetica', 'bold')
          const boldLines: string[] = doc.splitTextToSize(
            `${split.prefix}${separator.trimEnd()}`,
            maxWidth
          )

          doc.setFont('helvetica', 'normal')
          const normalLines: string[] = doc.splitTextToSize(
            split.rest,
            maxWidth
          )

          const lines = [...boldLines, ...normalLines]

          // Les lignes calculées servent au calcul de hauteur d'autoTable ;
          // le dessin lui-même est fait manuellement dans didDrawCell.
          data.cell.text = lines
          boldPrefixCells.set(`${rowIndex}:${data.column.index}`, {
            lines,
            boldCount: boldLines.length,
          })
        }
      }
    },

    // Le texte des cellules « code en gras » est dessiné dans didDrawCell.
    willDrawCell: (data) => {
      if (data.section !== 'body') return
      if (boldPrefixCells.has(`${data.row.index}:${data.column.index}`)) {
        data.cell.text = []
      }
    },

    didDrawCell: (data) => {
      if (data.section !== 'body') return

      const entry = boldPrefixCells.get(
        `${data.row.index}:${data.column.index}`
      )
      if (!entry) return

      const fontSize = 7
      const lineHeight =
        (fontSize * doc.getLineHeightFactor()) / doc.internal.scaleFactor
      const totalHeight = entry.lines.length * lineHeight

      const x = data.cell.x + 2
      // Aligné verticalement au centre, comme les autres cellules.
      let y =
        data.cell.y +
        Math.max((data.cell.height - totalHeight) / 2, 1) +
        lineHeight * 0.8

      doc.setFontSize(fontSize)
      doc.setTextColor(...hexRgb(theme.text))

      entry.lines.forEach((line, index) => {
        doc.setFont(
          'helvetica',
          index < entry.boldCount ? 'bold' : 'normal'
        )
        doc.text(line, x, y)
        y += lineHeight
      })
    },
  })

  // FOOTER : passe finale pour un « Page X sur N » exact sur toutes les pages
  // (dimensions relues par page : portrait et paysage peuvent coexister).
  const pageCount = doc.getNumberOfPages()

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    const footerWidth = doc.internal.pageSize.getWidth()
    const footerHeight = doc.internal.pageSize.getHeight()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...hexRgb(theme.textMuted))
    doc.text(
      `Page ${page} sur ${pageCount}`,
      footerWidth - 10,
      footerHeight - 6,
      { align: 'right' }
    )
  }

  downloadBlob(
    doc.output('blob'),
    buildExportFilename(meta.filenameSlug, 'pdf')
  )
}
