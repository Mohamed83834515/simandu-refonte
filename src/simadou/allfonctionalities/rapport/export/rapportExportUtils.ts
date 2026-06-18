import type { RapportExportColumn, RapportExportDocumentMeta } from './rapportExportTypes'

export function slugifyRapportTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildRapportDocumentMeta(pageTitle: string): RapportExportDocumentMeta {
  const generatedAt = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    title: pageTitle.startsWith('Rapport') ? pageTitle : `Rapport — ${pageTitle}`,
    subtitle: `Généré le ${generatedAt}`,
    filenameSlug: slugifyRapportTitle(pageTitle),
  }
}

export function filterExportRows(
  rows: string[][],
  columns: RapportExportColumn[],
  visibleColumnIds?: string[]
): { columns: RapportExportColumn[]; rows: string[][] } {
  if (!visibleColumnIds?.length || visibleColumnIds.length === columns.length) {
    return { columns, rows }
  }

  const visible = new Set(visibleColumnIds)
  const visibleColumns = columns.filter((column) => visible.has(column.id))
  const indices = visibleColumns.map((column) =>
    columns.findIndex((source) => source.id === column.id)
  )

  return {
    columns: visibleColumns,
    rows: rows.map((row) => indices.map((index) => row[index] ?? '')),
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function buildExportFilename(slug: string, extension: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${slug}_${date}.${extension}`
}
