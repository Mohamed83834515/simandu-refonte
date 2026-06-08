import {
  STATUT_ACTIVITE_VALUES,
  type SuiviAvancementContratSuiviPtbaFormData,
} from '@/simadou/schemas/suiviAvancementContratSchemas'
import type { SuiviAvancementContrat } from '@/simadou/allTypes'

export function asFormText(value: unknown): string {
  if (value == null) return ''
  const text = String(value).trim()
  return text === 'null' || text === 'undefined' ? '' : text
}

export function asFormDateInput(value: unknown): string {
  if (value == null || value === '') return ''
  const raw = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return ''
}

export function resolveStatutActivite(
  value: string | undefined
): (typeof STATUT_ACTIVITE_VALUES)[number] {
  const normalized = asFormText(value).toLowerCase()
  if (!normalized) return 'en cours'
  if (
    normalized === 'realise' ||
    normalized === 'réalisé' ||
    normalized === 'realisé'
  ) {
    return 'réalisé'
  }
  const match = STATUT_ACTIVITE_VALUES.find(
    (v) => v.toLowerCase() === normalized
  )
  return match ?? 'en cours'
}

export function buildSuiviAvancementDefaultValues(
  suivi: SuiviAvancementContrat | undefined,
  documentUrls: string[] = []
): SuiviAvancementContratSuiviPtbaFormData {
  return {
    date_suivi: asFormDateInput(suivi?.date_suivi),
    statut_activite: resolveStatutActivite(suivi?.statut_activite),
    etat_avancement: asFormText(suivi?.etat_avancement),
    difficultes_rencontrees: asFormText(suivi?.difficultes_rencontrees),
    pistes_solutions: asFormText(suivi?.pistes_solutions),
    observation: asFormText(suivi?.observation),
    documents_fichiers: documentUrls,
  }
}

export function pickNewDocumentFiles(
  items: SuiviAvancementContratSuiviPtbaFormData['documents_fichiers']
): File[] {
  return (items ?? []).filter((item): item is File => item instanceof File)
}

export function pickExistingDocumentSources(
  items: SuiviAvancementContratSuiviPtbaFormData['documents_fichiers'],
  idSuivi: number
): { fichier_join: string; suivi_avancement_contrat: number }[] {
  return (items ?? [])
    .filter((item): item is string => typeof item === 'string' && !!item.trim())
    .map((fichier_join) => ({
      fichier_join,
      suivi_avancement_contrat: idSuivi,
    }))
}
