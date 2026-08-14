export type DocumentProjetApiPayload = {
  description_document?: string
  projet: number
  dossier: number
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

export function resolveDocumentList(document: unknown): string[] {
  if (document == null) return []
  if (Array.isArray(document)) {
    return document
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof document === 'string' && document.trim()) {
    return [document.trim()]
  }
  return []
}
