/** Normalise les réponses liste (tableau direct ou pagination DRF `{ results }`). */
export function normalizeApiList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[]
  if (
    response &&
    typeof response === 'object' &&
    'results' in response &&
    Array.isArray((response as { results: unknown }).results)
  ) {
    return (response as { results: T[] }).results
  }
  return []
}
