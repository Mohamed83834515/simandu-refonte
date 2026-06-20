import type {
  PeriodeIndicateur,
  PeriodeIndicateurFormData,
  PeriodeIndicateurWritePayload,
} from '@/simadou/allTypes/periodeIndicateur'

export function resolvePeriodeIndicateurSelectValue(
  periode: PeriodeIndicateur
): string {
  return String(periode.id_periode)
}

export function resolvePeriodeIndicateurLabel(periode: PeriodeIndicateur): string {
  if (periode.periode_collecte?.trim()) return periode.periode_collecte.trim()
  return `Période #${periode.id_periode}`
}

export function periodeIndicateurToFormValues(
  periode?: PeriodeIndicateur | null
): PeriodeIndicateurFormData {
  return {
    periode_collecte: periode?.periode_collecte ?? '',
    source_donnees: periode?.source_donnees ?? '',
    date_validation: periode?.date_validation ?? '',
    valeur_periode: periode?.valeur_periode ?? 0,
    observation: periode?.observation ?? '',
  }
}

export function emptyPeriodeIndicateurFormValues(): PeriodeIndicateurFormData {
  return periodeIndicateurToFormValues(null)
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function buildPeriodeIndicateurWritePayload({
  form,
  refIndicateur,
  personnelId,
  existingPeriode,
  isEdit,
}: {
  form: PeriodeIndicateurFormData
  refIndicateur: number
  personnelId: number
  existingPeriode?: PeriodeIndicateur | null
  isEdit: boolean
}): PeriodeIndicateurWritePayload {
  const today = todayIsoDate()
  const selectedPeriodeId = existingPeriode?.id_periode ?? 0

  return {
    id_periode: isEdit ? selectedPeriodeId : 0,
    periode_collecte: form.periode_collecte,
    source_donnees: form.source_donnees,
    date_validation: form.date_validation,
    valeur_periode: Number(form.valeur_periode) || 0,
    observation: form.observation,
    date_enregistrement: today,
    etat: isEdit ? 'Modifier' : 'Ajouter',
    modifier_le: today,
    ref_indicateur: refIndicateur,
    periode: isEdit ? selectedPeriodeId : 0,
    id_personnel: personnelId,
    modifier_par: personnelId,
  }
}
