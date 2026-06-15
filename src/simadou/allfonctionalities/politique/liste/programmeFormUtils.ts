import type { Programme } from '@/simadou/allTypes/programme'
import type { ProgrammeWriteData } from '@/simadou/schemas/programmeSchemas'

function asFormText(value: unknown): string {
  if (value == null) return ''
  const text = String(value).trim()
  return text === 'null' || text === 'undefined' ? '' : text
}

/** Valeur compatible avec `<input type="date" />`. */
export function asProgrammeDateInput(value: unknown): string {
  if (value == null || value === '') return ''
  const raw = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  if (/^\d{4}$/.test(raw)) return `${raw}-01-01`
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return ''
}

function asFormBoolean(value: unknown, fallback = true): boolean {
  if (value === true || value === 1 || value === '1' || value === 'true') return true
  if (value === false || value === 0 || value === '0' || value === 'false') return false
  if (value == null) return fallback
  return Boolean(value)
}

export function programmeToFormValues(
  programme?: Programme | null
): ProgrammeWriteData {
  return {
    code_programme: asFormText(programme?.code_programme),
    sigle_programme: asFormText(programme?.sigle_programme),
    nom_programme: asFormText(programme?.nom_programme),
    vision_programme: asFormText(programme?.vision_programme),
    objectif_programme: asFormText(programme?.objectif_programme),
    annee_debut_programme: asProgrammeDateInput(programme?.annee_debut_programme),
    annee_fin_programme: asProgrammeDateInput(programme?.annee_fin_programme),
    actif_programme: asFormBoolean(programme?.actif_programme, true),
  }
}
