import type { CadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import {
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'
import { resolvePersonnelFormValue } from '@/simadou/lib/tacheActivitePtbaUtils'
import type { PtbaFormData } from '@/simadou/schemas/ptbaSchemas'
import type { PtbaProjetFormData } from '@/simadou/schemas/ptbaProjetSchemas'

export type PtbaApiPayload = Record<string, unknown>

export function resolveResponsablePtbaFormValue(
  row: Record<string, unknown> | null | undefined
): number | undefined {
  if (!row) return undefined
  const raw = row.responsable_ptba ?? row.responsable
  const fromPersonnel = resolvePersonnelFormValue(raw)
  if (fromPersonnel != null) return fromPersonnel

  const fromId = resolveRelationId(raw, 'id_personnel')
  return fromId != null && fromId > 0 ? fromId : undefined
}

export function resolveUglPtbaFormValue(
  row: Record<string, unknown> | null | undefined
): string {
  if (!row) return ''
  const raw = row.ugl_ptba ?? row.ugl
  const code = resolveRelationCode(raw, 'code_ugl')
  if (code) return code
  if (typeof raw === 'string') return raw.trim()
  return ''
}

export function resolveTypeActiviteFormValue(value: unknown): string {
  const code = resolveRelationCode(value, 'code_type')
  if (code) return code
  if (typeof value === 'string') return value
  return ''
}

export function resolveCodeCrpFormValue(value: unknown): number | undefined {
  const id = resolveRelationId(value, 'id_cs')
  if (id != null && id > 0) return id
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return undefined
}

export function resolveCadreAnalytiqueFormValue(
  value: unknown,
  cadres: CadreAnalytique[] = []
): number | undefined {
  const id = resolveRelationId(value, 'id_ca')
  if (id != null && id > 0) return id

  const code = resolveRelationCode(value, 'code_ca')
  if (code) {
    const match = cadres.find((cadre) => cadre.code_ca === code)
    if (match) return match.id_ca
  }

  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      return cadres.some((cadre) => cadre.id_ca === parsed) ? parsed : undefined
    }
  }

  return undefined
}

export function resolveVersionPtbaFormValue(
  row: Record<string, unknown> | null | undefined,
  selectedVersionId?: string | null
): number | undefined {
  const fromRow = row?.version_ptba
  if (typeof fromRow === 'number' && Number.isFinite(fromRow) && fromRow > 0) {
    return fromRow
  }
  if (typeof fromRow === 'string' && fromRow.trim()) {
    const parsed = Number(fromRow)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  if (selectedVersionId?.trim()) {
    const parsed = Number(selectedVersionId)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return undefined
}

function appendOptionalString(
  payload: PtbaApiPayload,
  key: string,
  value: string | undefined
) {
  const trimmed = value?.trim()
  if (trimmed) payload[key] = trimmed
}

function appendOptionalFkNumber(
  payload: PtbaApiPayload,
  key: string,
  value: number | null | undefined
) {
  if (value != null && value > 0) payload[key] = value
}

/** Payload POST/PUT /ptbas/ — champs vides omis, FK numériques normalisées. */
export function buildPtbaApiPayload(data: PtbaFormData): PtbaApiPayload {
  const payload: PtbaApiPayload = {
    localites_ptba: data.localites_ptba,
    partenaire_conserne_ptba: data.partenaire_conserne_ptba,
    code_activite_ptba: data.code_activite_ptba.trim(),
    intitule_activite_ptba: data.intitule_activite_ptba.trim(),
    chronogramme: data.chronogramme,
    statut_activite: data.statut_activite,
    version_ptba: data.version_ptba,
    type_activite: data.type_activite,
  }

  appendOptionalString(payload, 'observation', data.observation)
  appendOptionalFkNumber(payload, 'cadre_analytique', data.cadre_analytique)
  appendOptionalString(payload, 'ugl_ptba', data.ugl_ptba)
  appendOptionalString(payload, 'code_programme', data.code_programme)
  appendOptionalFkNumber(payload, 'responsable_ptba', data.responsable_ptba)
  appendOptionalFkNumber(payload, 'code_crp', data.code_crp)

  return payload
}

/** Payload POST/PUT /ptbas-projets/ — champs vides omis. */
export function buildPtbaProjetApiPayload(
  data: PtbaProjetFormData
): PtbaApiPayload {
  const payload: PtbaApiPayload = {
    localites_ptba: data.localites_ptba,
    partenaire_conserne_ptba: data.partenaire_conserne_ptba,
    code_activite_ptba: data.code_activite_ptba.trim(),
    intitule_activite_ptba: data.intitule_activite_ptba.trim(),
    chronogramme: data.chronogramme,
    statut_activite: data.statut_activite,
    code_actvite_projet: data.code_actvite_projet,
    code_projet: data.code_projet.trim(),
  }

  if (data.version_ptba != null && data.version_ptba > 0) {
    payload.version_ptba = data.version_ptba
  }

  appendOptionalString(payload, 'observation', data.observation)
  appendOptionalFkNumber(payload, 'cadre_analytique', data.cadre_analytique)
  appendOptionalString(payload, 'ugl_ptba', data.ugl_ptba)
  appendOptionalFkNumber(payload, 'responsable_ptba', data.responsable_ptba)
  appendOptionalFkNumber(payload, 'code_crp', data.code_crp)

  return payload
}
