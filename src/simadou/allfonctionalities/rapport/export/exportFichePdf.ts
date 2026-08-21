import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

const ACCENT = `#${theme.green}`
const TEXT = `#${theme.text}`
const MUTED = `#${theme.textMuted}`
const BORDER = `#${theme.border}`
const KPI_BG = `#${theme.white}`
const CONTEXT_BG = `#${theme.greenMuted}`
const NARRATIVE_BG = `#${theme.greenLight}`

function hexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

function resolveFiche(payload: RapportExportPayload): RapportExportFiche {
  if (payload.fiche) return payload.fiche
  throw new Error('exportFichePdf: payload.fiche manquant')
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

function buildAutoTableBody(
  table: RapportExportFicheTable
): (string | { content: string; rowSpan?: number; styles?: object })[][] {
  const rows = [...table.rows]
  if (table.totalRow) rows.push(table.totalRow)
  if (!rows.length) {
    return [[table.headers[0] ? 'Aucune donnée' : '—']]
  }

  const separator = table.boldPrefixSeparator
  const formatCell = (text: string) => {
    if (!separator) return text
    const split = splitCellBoldPrefix(text, separator)
    if (!split) return text
    // autoTable ne gère pas le gras partiel : on garde le texte complet.
    return text
  }

  if (!table.mergeFirstColumn) {
    return rows.map((row) => row.map((c) => formatCell(c ?? '')))
  }

  const spans = computeFirstColSpans(rows)
  return rows.map((row, i) => {
    const rest = row.slice(1).map((c) => formatCell(c ?? ''))
    if (spans[i]! > 0) {
      return [
        {
          content: row[0] ?? '',
          rowSpan: spans[i],
          styles: { fontStyle: 'bold', valign: 'middle' },
        },
        ...rest,
      ]
    }
    return rest
  })
}

type YState = { y: number }

function renderRepartition(
  doc: jsPDF,
  items: { label: string; value: string }[],
  title: string | undefined,
  marginX: number,
  pageWidth: number,
  pageHeight: number,
  state: YState
) {
  if (!items.length) return
  const ensureSpace = (needed: number) => {
    if (state.y + needed > pageHeight - 18) {
      doc.addPage()
      state.y = 16
    }
  }
  ensureSpace(10)
  if (title) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...hexRgb(TEXT))
    doc.text(title.toUpperCase(), marginX, state.y)
    state.y += 5
  }
  for (const item of items) {
    ensureSpace(6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...hexRgb(TEXT))
    doc.text(item.label, marginX, state.y)
    doc.setFont('helvetica', 'bold')
    doc.text(item.value, pageWidth - marginX, state.y, { align: 'right' })
    doc.setDrawColor(...hexRgb(BORDER))
    doc.setLineWidth(0.2)
    doc.line(marginX, state.y + 1.5, pageWidth - marginX, state.y + 1.5)
    state.y += 5.5
  }
  state.y += 3
}

function renderTables(
  doc: jsPDF,
  tables: RapportExportFicheTable[],
  marginX: number,
  contentWidth: number,
  pageHeight: number,
  state: YState
) {
  for (const table of tables) {
    if (state.y + 20 > pageHeight - 18) {
      doc.addPage()
      state.y = 16
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...hexRgb(TEXT))
    doc.text(table.title.toUpperCase(), marginX, state.y)
    state.y += 4

    if (table.description) {
      const descLines: string[] = doc.splitTextToSize(
        table.description,
        contentWidth
      )
      if (state.y + descLines.length * 4 + 2 > pageHeight - 18) {
        doc.addPage()
        state.y = 16
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...hexRgb(MUTED))
      doc.text(descLines, marginX, state.y)
      state.y += descLines.length * 3.8 + 2
    }

    const body = buildAutoTableBody(table)
    const groupEndRows = new Set<number>()
    if (table.mergeFirstColumn) {
      const spans = computeFirstColSpans(table.rows)
      for (let i = 0; i < spans.length; i++) {
        if (spans[i]! > 0) groupEndRows.add(i + spans[i]! - 1)
      }
    }

    autoTable(doc, {
      startY: state.y,
      head: [table.headers],
      body,
      margin: { left: marginX, right: marginX },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        textColor: hexRgb(TEXT),
        cellPadding: 2.2,
        lineColor: hexRgb(BORDER),
        lineWidth: 0.15,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: hexRgb(CONTEXT_BG),
        textColor: hexRgb(MUTED),
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: { fillColor: hexRgb(KPI_BG) },
      didParseCell: (data) => {
        if (
          table.totalRow &&
          data.section === 'body' &&
          data.row.index === table.rows.length
        ) {
          data.cell.styles.fontStyle = 'bold'
        }
      },
      didDrawCell: (data) => {
        if (
          data.section !== 'body' ||
          !groupEndRows.has(data.row.index) ||
          data.column.index !== data.table.columns.length - 1
        ) {
          return
        }
        // Une seule ligne pleine largeur sous chaque groupe de niveau.
        const y = data.cell.y + data.cell.height
        if (!Number.isFinite(y)) return
        const x1 = marginX
        const x2 = marginX + contentWidth
        data.doc.setDrawColor(...hexRgb(`#${theme.greenDark}`))
        data.doc.setLineWidth(0.45)
        data.doc.line(x1, y, x2, y)
      },
    })

    state.y =
      ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? state.y) + 8
  }
}

function renderSection(
  doc: jsPDF,
  section: RapportExportFicheSection,
  marginX: number,
  contentWidth: number,
  pageWidth: number,
  pageHeight: number,
  state: YState
) {
  if (state.y + 16 > pageHeight - 18) {
    doc.addPage()
    state.y = 16
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...hexRgb(`#${theme.greenDark}`))
  doc.text(section.title.toUpperCase(), marginX, state.y)
  state.y += 6

  if (section.narrative) {
    const lines: string[] = doc.splitTextToSize(
      section.narrative,
      contentWidth - 8
    )
    const blockH = lines.length * 4.2 + 6
    if (state.y + blockH > pageHeight - 18) {
      doc.addPage()
      state.y = 16
    }
    doc.setFillColor(...hexRgb(NARRATIVE_BG))
    doc.rect(marginX, state.y, contentWidth, blockH, 'F')
    doc.setFillColor(...hexRgb(ACCENT))
    doc.rect(marginX, state.y, 1.6, blockH, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...hexRgb(TEXT))
    doc.text(lines, marginX + 5, state.y + 5)
    state.y += blockH + 6
  }

  renderRepartition(
    doc,
    section.repartition ?? [],
    section.repartitionTitle,
    marginX,
    pageWidth,
    pageHeight,
    state
  )
  renderTables(
    doc,
    section.tables ?? [],
    marginX,
    contentWidth,
    pageHeight,
    state
  )
}

export async function exportFichePdf(payload: RapportExportPayload) {
  const fiche = resolveFiche(payload)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 16
  const contentWidth = pageWidth - marginX * 2
  const state: YState = { y: 16 }

  const orgTitle = fiche.orgTitle ?? 'SIMANDOU'
  const orgSubtitle =
    fiche.orgSubtitle ?? 'Plateforme de suivi des projets et programmes'
  const badge = (fiche.badge ?? 'Fiche de synthèse').toUpperCase()

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...hexRgb(TEXT))
  doc.text(orgTitle, marginX, state.y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...hexRgb(MUTED))
  doc.text(orgSubtitle, marginX, state.y + 4.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...hexRgb(ACCENT))
  doc.text(badge, pageWidth - marginX, state.y, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...hexRgb(TEXT))
  const titleLines: string[] = doc.splitTextToSize(
    fiche.title,
    contentWidth * 0.55
  )
  doc.text(titleLines, pageWidth - marginX, state.y + 6, { align: 'right' })

  const genLine = [
    fiche.generatedAtLabel
      ? `Générée le ${fiche.generatedAtLabel}`
      : `Générée le ${new Date().toLocaleString('fr-FR')}`,
    fiche.generatedBy ? `par ${fiche.generatedBy}` : null,
  ]
    .filter(Boolean)
    .join(' ')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...hexRgb(MUTED))
  const genLines: string[] = doc.splitTextToSize(genLine, contentWidth * 0.55)
  doc.text(genLines, pageWidth - marginX, state.y + 6 + titleLines.length * 5.5, {
    align: 'right',
  })

  state.y = Math.max(
    state.y + 12,
    state.y + 6 + titleLines.length * 5.5 + genLines.length * 3.5 + 4
  )

  doc.setFillColor(...hexRgb(ACCENT))
  doc.rect(marginX, state.y, contentWidth, 1.2, 'F')
  state.y += 8

  const context = fiche.contextItems ?? []
  if (context.length > 0) {
    const boxH = 14
    doc.setFillColor(...hexRgb(CONTEXT_BG))
    doc.setDrawColor(...hexRgb(BORDER))
    doc.roundedRect(marginX, state.y, contentWidth, boxH, 1.5, 1.5, 'FD')

    const colW = contentWidth / Math.min(context.length, 3)
    context.slice(0, 3).forEach((item, i) => {
      const x = marginX + 3 + i * colW
      if (i > 0) {
        doc.setDrawColor(...hexRgb(BORDER))
        doc.line(
          marginX + i * colW,
          state.y + 2.5,
          marginX + i * colW,
          state.y + boxH - 2.5
        )
      }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(...hexRgb(MUTED))
      doc.text(item.label.toUpperCase(), x, state.y + 5)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...hexRgb(TEXT))
      const valLines: string[] = doc.splitTextToSize(item.value, colW - 6)
      doc.text(valLines[0] ?? '—', x, state.y + 10)
    })
    state.y += boxH + 6
  }

  const kpis = fiche.kpis ?? []
  if (kpis.length > 0) {
    const cols = Math.min(kpis.length, 4)
    const gap = 3
    const cardW = (contentWidth - gap * (cols - 1)) / cols
    const cardH = 18

    kpis.slice(0, 4).forEach((kpi, i) => {
      const x = marginX + i * (cardW + gap)
      const accent = kpi.accent ?? ACCENT
      doc.setFillColor(...hexRgb(KPI_BG))
      doc.setDrawColor(...hexRgb(BORDER))
      doc.roundedRect(x, state.y, cardW, cardH, 1.5, 1.5, 'FD')
      doc.setFillColor(...hexRgb(accent))
      doc.rect(x, state.y, cardW, 1.4, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(...hexRgb(MUTED))
      doc.text(kpi.label.toUpperCase(), x + 2.5, state.y + 6, {
        maxWidth: cardW - 5,
      })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...hexRgb(TEXT))
      const valueLines: string[] = doc.splitTextToSize(kpi.value, cardW - 5)
      doc.text(valueLines[0] ?? '—', x + 2.5, state.y + 13)
    })
    state.y += cardH + 6
  }

  if (fiche.narrative) {
    const lines: string[] = doc.splitTextToSize(
      fiche.narrative,
      contentWidth - 8
    )
    const blockH = lines.length * 4.2 + 6
    doc.setFillColor(...hexRgb(NARRATIVE_BG))
    doc.rect(marginX, state.y, contentWidth, blockH, 'F')
    doc.setFillColor(...hexRgb(ACCENT))
    doc.rect(marginX, state.y, 1.6, blockH, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...hexRgb(TEXT))
    doc.text(lines, marginX + 5, state.y + 5)
    state.y += blockH + 6
  }

  renderRepartition(
    doc,
    fiche.repartition ?? [],
    fiche.repartitionTitle,
    marginX,
    pageWidth,
    pageHeight,
    state
  )
  renderTables(
    doc,
    fiche.tables ?? [],
    marginX,
    contentWidth,
    pageHeight,
    state
  )

  for (const section of fiche.sections ?? []) {
    renderSection(
      doc,
      section,
      marginX,
      contentWidth,
      pageWidth,
      pageHeight,
      state
    )
  }

  if (state.y + 12 > pageHeight - 18) {
    doc.addPage()
    state.y = 16
  }
  doc.setDrawColor(...hexRgb(BORDER))
  doc.line(marginX, state.y, pageWidth - marginX, state.y)
  state.y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...hexRgb(MUTED))
  const footer =
    fiche.footerNote ??
    'Document généré automatiquement — données issues du projet au moment de la génération.'
  const footerLines: string[] = doc.splitTextToSize(footer, contentWidth * 0.7)
  doc.text(footerLines, marginX, state.y)
  doc.setFont('helvetica', 'bold')
  doc.text(fiche.footerCode ?? 'MINAGRI-RAPPORT-OR', pageWidth - marginX, state.y, {
    align: 'right',
  })

  const blob = doc.output('blob')
  downloadBlob(
    blob,
    buildExportFilename(slugifyRapportTitle(payload.pageTitle), 'pdf')
  )
}
