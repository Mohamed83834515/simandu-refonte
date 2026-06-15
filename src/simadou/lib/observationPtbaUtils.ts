import type { ObservationPtba, Ptba } from '@/simadou/allTypes'

export function resolveObservationPtbaCode(
  value: ObservationPtba['ptba']
): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'string') return value.trim() || null
  if (typeof value === 'object' && 'code_activite_ptba' in value) {
    const code = (value as Ptba).code_activite_ptba
    return code?.trim() || null
  }
  return null
}

export function filterObservationsByActiviteCode(
  items: ObservationPtba[],
  codeActivite: string
): ObservationPtba[] {
  const normalizedCode = codeActivite.trim()
  if (!normalizedCode) return []

  return items.filter(
    (item) => resolveObservationPtbaCode(item.ptba) === normalizedCode
  )
}
