import { AxiosError } from 'axios'

export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data

    if (typeof data === 'string' && data.trim()) return data

    if (data && typeof data === 'object') {
      const title = (data as { title?: string }).title
      if (typeof title === 'string' && title.trim()) return title

      const detail = (data as { detail?: string }).detail
      if (typeof detail === 'string' && detail.trim()) return detail

      const fieldMessages = Object.entries(data as Record<string, unknown>).flatMap(
        ([key, value]) => {
          if (Array.isArray(value)) {
            return value.map((msg) =>
              typeof msg === 'string' ? msg : `${key}: ${String(msg)}`
            )
          }
          if (typeof value === 'string') return [value]
          return []
        }
      )

      if (fieldMessages.length > 0) return fieldMessages.join(' ')
    }
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}
