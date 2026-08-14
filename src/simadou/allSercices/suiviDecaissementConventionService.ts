import { apiClient } from '@/axios/api'
import type { SuiviDecaissementConvention } from '../allTypes/suiviDecaissementConvention'
import type { SuiviDecaissementConventionFormData } from '../schemas/suiviDecaissementConventionSchemas'
import { resolveRelationId } from '../lib/resolveApiRelation'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/suivis-decaissement-conventions/'

function toDateInput(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10)
  return parsed.toISOString().split('T')[0]
}

function mapFromApi(raw: Record<string, unknown>): SuiviDecaissementConvention {
  return {
    id_suivi_dec: Number(raw.id_suivi_dec ?? raw.id ?? 0),
    montant_decaisse: Number(raw.montant_decaisse ?? 0),
    date_suivi_dec: toDateInput(raw.date_suivi_dec),
    observation: String(raw.observation ?? ''),
    document_fichier:
      typeof raw.document_fichier === 'string' ? raw.document_fichier : null,
    date_enregistrement: toDateInput(raw.date_enregistrement) || null,
    date_modification: toDateInput(raw.date_modification) || null,
    convention: resolveRelationId(raw.convention, 'id_convention'),
  }
}

function toFormData(
  data: SuiviDecaissementConventionFormData,
  idConvention: number,
  file?: File | null
): FormData {
  const fd = new FormData()
  fd.append('montant_decaisse', String(data.montant_decaisse))
  fd.append('date_suivi_dec', data.date_suivi_dec)
  fd.append('observation', data.observation)
  fd.append('convention', String(idConvention))
  if (file) {
    fd.append('document_fichier', file, file.name)
  }
  return fd
}

function toJsonPayload(
  data: SuiviDecaissementConventionFormData,
  idConvention: number
): Record<string, unknown> {
  return {
    montant_decaisse: data.montant_decaisse,
    date_suivi_dec: data.date_suivi_dec,
    observation: data.observation,
    convention: idConvention,
    document_fichier:
      typeof data.document_fichier === 'string' ? data.document_fichier : null,
  }
}

const suiviDecaissementConventionService = {
  async getByConvention(
    idConvention: number
  ): Promise<SuiviDecaissementConvention[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { convention: idConvention },
    })
    return normalizeApiList<Record<string, unknown>>(response).map(mapFromApi)
  },

  async create(
    idConvention: number,
    data: SuiviDecaissementConventionFormData
  ): Promise<SuiviDecaissementConvention> {
    const file =
      data.document_fichier instanceof File ? data.document_fichier : null
    const raw = await apiClient.request<Record<string, unknown>>(ENDPOINT, {
      method: 'POST',
      data: file
        ? toFormData(data, idConvention, file)
        : toJsonPayload(data, idConvention),
    })
    return mapFromApi(raw)
  },

  async update(
    id: number,
    idConvention: number,
    data: SuiviDecaissementConventionFormData
  ): Promise<SuiviDecaissementConvention> {
    const file =
      data.document_fichier instanceof File ? data.document_fichier : null
    const raw = await apiClient.request<Record<string, unknown>>(
      `${ENDPOINT}${id}/`,
      {
        method: 'PUT',
        data: file
          ? toFormData(data, idConvention, file)
          : toJsonPayload(data, idConvention),
      }
    )
    return mapFromApi(raw)
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default suiviDecaissementConventionService
