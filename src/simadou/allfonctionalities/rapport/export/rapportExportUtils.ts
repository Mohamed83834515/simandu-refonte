import type {
  RapportExportColumn,
  RapportExportDocumentMeta,
  RapportExportHeaderGroup,
  RapportExportRowMeta,
} from './rapportExportTypes'

export function slugifyRapportTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildRapportDocumentMeta(
  pageTitle: string
): RapportExportDocumentMeta {
  const generatedAt = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    title: pageTitle.startsWith('Rapport')
      ? pageTitle
      : `Rapport — ${pageTitle}`,
    subtitle: `Généré le ${generatedAt}`,
    filenameSlug: slugifyRapportTitle(pageTitle),
  }
}

export function filterExportRows(
  rows: string[][],
  columns: RapportExportColumn[],
  visibleColumnIds?: string[],
  rowMetas?: RapportExportRowMeta[]
): {
  columns: RapportExportColumn[]
  rows: string[][]
  rowMetas?: RapportExportRowMeta[]
} {
  if (!visibleColumnIds?.length || visibleColumnIds.length === columns.length) {
    return {
      columns,
      rows,
      rowMetas,
    }
  }

  const visible = new Set(visibleColumnIds)

  const visibleColumns = columns.filter((column) => visible.has(column.id))

  const indices = visibleColumns.map((column) =>
    columns.findIndex((source) => source.id === column.id)
  )

  return {
    columns: visibleColumns,
    rows: rows.map((row) => indices.map((index) => row[index] ?? '')),
    // Les fusions par colonne (mergeKeys) sont réindexées sur les colonnes
    // visibles.
    rowMetas: rowMetas?.map((meta) => {
      if (!meta.mergeKeys) return meta

      const mergeKeys: Record<number, string> = {}
      indices.forEach((sourceIndex, targetIndex) => {
        const key = meta.mergeKeys![sourceIndex]
        if (key != null) mergeKeys[targetIndex] = key
      })

      return { ...meta, mergeKeys }
    }),
  }
}

/** Plage d'indices de colonnes couverte par un en-tête fusionné. */
export type ResolvedHeaderGroupRange = {
  header: string
  /** Index de la première colonne couverte. */
  start: number
  /** Index de la dernière colonne couverte (inclus). */
  end: number
  /** Fusion verticale : les en-têtes des sous-colonnes ne sont pas affichés. */
  mergeSubHeaders: boolean
}

/**
 * Résout les groupes d'en-tête en plages d'indices sur les colonnes
 * effectivement exportées. Un groupe dont les colonnes ne sont plus
 * contiguës (ou plus visibles) après filtrage est ignoré.
 */
export function resolveHeaderGroupRanges(
  columns: RapportExportColumn[],
  headerGroups?: RapportExportHeaderGroup[]
): ResolvedHeaderGroupRange[] {
  if (!headerGroups?.length) return []

  const ranges: ResolvedHeaderGroupRange[] = []

  for (const group of headerGroups) {
    const ids = new Set(group.columnIds)
    const indices = columns
      .map((column, index) => (ids.has(column.id) ? index : -1))
      .filter((index) => index >= 0)

    if (indices.length === 0) continue

    const start = Math.min(...indices)
    const end = Math.max(...indices)
    if (end - start + 1 !== indices.length) continue

    ranges.push({
      header: group.header,
      start,
      end,
      mergeSubHeaders: Boolean(group.mergeSubHeaders),
    })
  }

  return ranges.sort((a, b) => a.start - b.start)
}

/** Fusions verticales par colonne, résolues depuis rowMetas.mergeKeys. */
export type ResolvedCellMerges = {
  /** rowSpan de la première cellule de chaque groupe, clé `row:col`. */
  spans: Map<string, number>
  /** Cellules couvertes par une fusion (à ne pas émettre/écrire). */
  covered: Set<string>
}

/**
 * Résout les fusions verticales par colonne : pour chaque colonne listée
 * dans mergeKeys, les lignes de données consécutives partageant la même
 * clé forment un groupe fusionné.
 */
export function resolveCellMerges(
  rowMetas?: RapportExportRowMeta[]
): ResolvedCellMerges {
  const spans = new Map<string, number>()
  const covered = new Set<string>()

  if (!rowMetas) return { spans, covered }

  rowMetas.forEach((meta, rowIndex) => {
    if (meta.type !== 'data' || !meta.mergeKeys) return

    Object.entries(meta.mergeKeys).forEach(([colStr, key]) => {
      const col = Number(colStr)
      const cellId = `${rowIndex}:${col}`
      if (covered.has(cellId)) return

      let span = 1
      for (let next = rowIndex + 1; next < rowMetas.length; next += 1) {
        const nextMeta = rowMetas[next]
        if (nextMeta?.type !== 'data' || nextMeta.mergeKeys?.[col] !== key) {
          break
        }
        covered.add(`${next}:${col}`)
        span += 1
      }

      spans.set(cellId, span)
    })
  })

  return { spans, covered }
}

/**
 * Découpe une valeur de cellule autour du séparateur pour un rendu
 * « code en gras + reste en normal ». Retourne null si le séparateur est
 * absent ou en tête de valeur.
 */
export function splitCellBoldPrefix(
  value: string,
  separator: string
): { prefix: string; rest: string } | null {
  const index = value.indexOf(separator)
  if (index <= 0) return null
  return {
    prefix: value.slice(0, index),
    rest: value.slice(index + separator.length),
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

export function detectAlignment(value: unknown): 'left' | 'center' {
  if (value == null) return 'left'

  // number réel
  if (typeof value === 'number' && !isNaN(value)) {
    return 'center'
  }

  // string numérique ("123", "12.5", "1 200"), éventuellement suivie
  // d'un symbole d'unité ("25%", "340 kg", "12,5 m²", "3 t/ha")
  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.')
    if (normalized === '') return 'left'
    if (!isNaN(Number(normalized))) return 'center'
    if (/^[-+]?\d+(?:\.\d+)?[a-zµ%°/²³]{1,6}$/i.test(normalized)) {
      return 'center'
    }
  }

  return 'left'
}
