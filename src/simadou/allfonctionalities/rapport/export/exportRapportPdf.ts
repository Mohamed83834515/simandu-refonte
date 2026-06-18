import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  buildExportFilename,
  buildRapportDocumentMeta,
  downloadBlob,
  filterExportRows,
} from './rapportExportUtils'
import type { RapportExportPayload } from './rapportExportTypes'
import { EXPORT_CELL_ALIGN } from './rapportExportLayout'
import { RAPPORT_EXPORT_THEME as theme } from './rapportExportTheme'

function hexRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

export function exportRapportPdf(payload: RapportExportPayload) {
  const meta = buildRapportDocumentMeta(payload.pageTitle)

  const { columns, rows } = filterExportRows(
    payload.rows,
    payload.columns,
    payload.visibleColumnIds
  )

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const green = hexRgb(theme.green)
  const yellow = hexRgb(theme.yellow)
  const red = hexRgb(theme.red)
  const greenLight = hexRgb(theme.greenLight)

  doc.setFillColor(...green)
  doc.rect(0, 0, pageWidth, 22, 'F')

  doc.setFillColor(...red)
  doc.rect(0, 22, pageWidth / 3, 2, 'F')
  doc.setFillColor(...yellow)
  doc.rect(pageWidth / 3, 22, pageWidth / 3, 2, 'F')
  doc.setFillColor(...green)
  doc.rect((pageWidth / 3) * 2, 22, pageWidth / 3, 2, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(meta.title, pageWidth / 2, 11, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(meta.subtitle, pageWidth / 2, 18, { align: 'center', maxWidth: pageWidth - 20 })

  autoTable(doc, {
    startY: 28,
    head: [columns.map((column) => column.header)],
    body: rows,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      lineColor: hexRgb(theme.border),
      lineWidth: 0.1,
      textColor: hexRgb(theme.text),
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: green,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: greenLight,
    },
    columnStyles: columns.reduce<
      Record<number, { halign: typeof EXPORT_CELL_ALIGN; cellWidth: 'wrap' }>
    >((acc, _column, index) => {
      acc[index] = {
        halign: EXPORT_CELL_ALIGN,
        cellWidth: 'wrap',
      }
      return acc
    }, {}),
    margin: { top: 28, left: 10, right: 10, bottom: 14 },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(8)
      doc.setTextColor(...hexRgb(theme.textMuted))
      doc.text(
        `Page ${data.pageNumber} sur ${pageCount}`,
        pageWidth - 10,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'right' }
      )
    },
  })

  downloadBlob(doc.output('blob'), buildExportFilename(meta.filenameSlug, 'pdf'))
}
