import type { DocumentProjet } from '@/simadou/allTypes/documentProjet'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export type DocumentProjetApiPayload = {
  description_document?: string
  projet: number
}

export function resolveDocumentProjetId(
  value: DocumentProjet['projet']
): number | undefined {
  const id =
    resolveRelationId(value, 'id_projet') ?? resolveRelationId(value, 'id')
  return id ?? undefined
}

export function filterDocumentsByProjet(
  items: DocumentProjet[],
  idProjet: number
): DocumentProjet[] {
  return items.filter(
    (item) => resolveDocumentProjetId(item.projet) === idProjet
  )
}

export function resolveDocumentUrl(document: string | undefined): string | null {
  if (!document?.trim()) return null
  if (/^https?:\/\//i.test(document)) return document
  const base =
    (import.meta.env.VITE_API_BASE_URL as string) ||
    'https://api.ruche-sectoriel.net/api/'
  const origin = base.replace(/\/api\/?$/, '')
  return document.startsWith('/') ? `${origin}${document}` : `${base}${document}`
}

export function resolveDocumentFileName(document: string | undefined): string {
  if (!document?.trim()) return 'Document'
  const parts = document.split('/')
  return decodeURIComponent(parts[parts.length - 1] || 'Document')
}
