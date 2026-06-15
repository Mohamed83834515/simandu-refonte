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

export function resolvePersonnelLabel(
  value: unknown,
  personnelsById?: Map<number, { prenom_perso?: string; nom_perso?: string }>
): string | null {
  if (isEmptyRelationValue(value)) return null

  if (typeof value === 'object' && value !== null) {
    const personnel = value as {
      prenom_perso?: string
      nom_perso?: string
      n_personnel?: number
    }
    const embeddedName =
      `${personnel.prenom_perso ?? ''} ${personnel.nom_perso ?? ''}`.trim()
    if (embeddedName) return embeddedName

    const id = resolveRelationId(value, 'n_personnel')
    if (id != null && personnelsById) {
      const found = personnelsById.get(id)
      if (found) {
        const name =
          `${found.prenom_perso ?? ''} ${found.nom_perso ?? ''}`.trim()
        if (name) return name
      }
    }
    return id != null ? String(id) : null
  }

  const id = resolveRelationId(value, 'n_personnel')
  if (id == null) return null
  if (personnelsById) {
    const found = personnelsById.get(id)
    if (found) {
      const name = `${found.prenom_perso ?? ''} ${found.nom_perso ?? ''}`.trim()
      if (name) return name
    }
  }
  return String(id)
}

export function parseOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}
