import type { RapportExportColumn } from './rapportExportTypes'

export const EXPORT_CELL_ALIGN = 'center' as const

export function estimateExcelColumnWidth(
  header: string,
  values: string[],
  min = 14,
  max = 48
): number {
  const longest = Math.max(header.length, ...values.map((value) => value.length))
  return Math.min(max, Math.max(min, Math.ceil(longest * 0.95) + 3))
}

export function estimateExcelRowHeight(
  values: string[],
  columnWidths: number[]
): number {
  let maxLines = 1

  values.forEach((value, index) => {
    const width = columnWidths[index] ?? 18
    const charsPerLine = Math.max(10, Math.floor(width * 1.15))
    const lines = Math.max(1, Math.ceil(value.length / charsPerLine))
    maxLines = Math.max(maxLines, lines)
  })

  return Math.max(22, maxLines * 16)
}

export function estimateSubtitleRowHeight(text: string, columnCount: number): number {
  const avgColumnWidth = 18
  const totalWidth = Math.max(avgColumnWidth * columnCount, 80)
  const charsPerLine = Math.max(40, Math.floor(totalWidth * 1.1))
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine))
  return Math.max(28, lines * 16)
}

/** Largeur utile A4 paysage en DXA (twips), marges 0,5" de chaque côté. */
export const WORD_LANDSCAPE_CONTENT_WIDTH = 15398

export function computeWordColumnWidthsDxa(
  columns: RapportExportColumn[],
  rows: string[][],
  contentWidth = WORD_LANDSCAPE_CONTENT_WIDTH
): number[] {
  const weights = columns.map((column, index) => {
    const values = rows.map((row) => row[index] ?? '')
    return estimateExcelColumnWidth(column.header, values, column.width ?? 16, 52)
  })
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1

  const rawWidths = weights.map((weight) =>
    Math.max(800, Math.round((weight / totalWeight) * contentWidth))
  )

  const actualTotal = rawWidths.reduce((sum, width) => sum + width, 0)
  const diff = contentWidth - actualTotal

  if (diff !== 0 && rawWidths.length > 0) {
    rawWidths[rawWidths.length - 1] += diff
  }

  return rawWidths
}
