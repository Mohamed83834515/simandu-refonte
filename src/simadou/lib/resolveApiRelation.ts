export function isEmptyRelationValue(
  value: unknown
): value is null | undefined | '' {
  return value == null || value === ''
}

/** Resolves a string code from a scalar or nested API relation (e.g. code_projet, code_cr). */
export function resolveRelationCode(
  value: unknown,
  codeKey: string
): string | null {
  if (isEmptyRelationValue(value)) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && codeKey in value) {
    const code = (value as Record<string, unknown>)[codeKey]
    if (code == null || code === '') return null
    return String(code)
  }
  return null
}

/** Resolves a numeric id from a scalar or nested API relation (e.g. id_ncr, id_acteur). */
export function resolveRelationId(value: unknown, idKey: string): number | null {
  if (isEmptyRelationValue(value)) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === 'object' && idKey in value) {
    const id = Number((value as Record<string, unknown>)[idKey])
    return Number.isFinite(id) ? id : null
  }
  return null
}

export function resolveActeurLabel(value: unknown): string | null {
  if (isEmptyRelationValue(value)) return null
  if (typeof value === 'object' && 'nom_acteur' in value) {
    const name = (value as { nom_acteur?: string }).nom_acteur
    return name?.trim() || null
  }
  if (typeof value === 'string') return value
  return null
}

export function parseOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}
