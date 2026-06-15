import { z } from 'zod'

function normalizeDateInput(value: unknown): string {
  if (value == null || value === '') return ''
  const raw = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  if (/^\d{4}$/.test(raw)) return `${raw}-01-01`
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return ''
}

const requiredString = (message: string) =>
  z.preprocess(
    (val) => (val == null ? '' : String(val)),
    z.string().trim().min(1, message)
  )

const dateInputString = (message: string) =>
  z.preprocess(
    (val) => normalizeDateInput(val),
    z.string().min(1, message)
  )

export const programmeWriteSchema = z.object({
  code_programme: requiredString('Le code est obligatoire'),
  sigle_programme: requiredString('Le sigle est obligatoire'),
  nom_programme: requiredString('Le nom est obligatoire'),
  vision_programme: requiredString('La vision est obligatoire'),
  objectif_programme: requiredString("L'objectif est obligatoire"),
  annee_debut_programme: dateInputString('La date de début est obligatoire'),
  annee_fin_programme: dateInputString('La date de fin est obligatoire'),
  actif_programme: z.preprocess(
    (val) => {
      if (val === true || val === 1 || val === '1' || val === 'true') return true
      if (val === false || val === 0 || val === '0' || val === 'false') return false
      return val ?? true
    },
    z.boolean()
  ),
})

export type ProgrammeWriteData = z.infer<typeof programmeWriteSchema>
