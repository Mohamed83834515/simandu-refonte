export type ExportFormat = 'word' | 'excel' | 'pdf'

export type RapportExportColumn = {
  id: string
  header: string
  width?: number
}

export type RapportExportTableData = {
  columns: RapportExportColumn[]
  rows: string[][]
  visibleColumnIds?: string[]
}

export type RapportExportRegistration = {
  buildExportTable: () => RapportExportTableData
  isLoading?: boolean
}

/** Payload résolu au moment du clic sur Exporter. */
export type RapportExportPayload = {
  pageTitle: string
  columns: RapportExportColumn[]
  rows: string[][]
  visibleColumnIds?: string[]
  isLoading?: boolean
}

export type RapportExportDocumentMeta = {
  title: string
  subtitle: string
  filenameSlug: string
}
