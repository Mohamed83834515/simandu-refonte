import { apiClient } from '@/axios/api'
import type {
  IndicateurContrat,
  IndicateurContratPayload,
} from '../allTypes/indicateurContrat'
import { resolveClcpId } from '../lib/indicateurContratUtils'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/indicateurs-contrats/'

function filterByCadreIds(
  items: IndicateurContrat[],
  cadreIds: number[]
): IndicateurContrat[] {
  if (cadreIds.length === 0) return items
  const allowed = new Set(cadreIds)
  return items.filter((item) => {
    const clcpId = resolveClcpId(item.clcp)
    return clcpId != null && allowed.has(clcpId)
  })
}

function resolveMoyenVerificationFile(
  value: IndicateurContratPayload['moyen_verification']
): File | null {
  return value instanceof File ? value : null
}

function toFormData(
  data: IndicateurContratPayload,
  file: File
): FormData {
  const fd = new FormData()
  fd.append('intitule_indicateur', data.intitule_indicateur)
  fd.append('valeur_reference', String(data.valeur_reference))
  fd.append('cible_t1', data.cible_t1 ?? '')
  fd.append('cible_t2', data.cible_t2 ?? '')
  fd.append('cible_t3', data.cible_t3 ?? '')
  fd.append('cible_t4', data.cible_t4 ?? '')
  fd.append('moyen_verification', file, file.name)
  fd.append('etat', String(data.etat))
  fd.append('clcp', String(data.clcp))
  fd.append('unite', String(data.unite))
  fd.append('id_personnel', String(data.id_personnel))
  return fd
}

function toJsonPayload(
  data: Partial<IndicateurContratPayload>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    intitule_indicateur: data.intitule_indicateur,
    valeur_reference: data.valeur_reference,
    cible_t1: data.cible_t1 ?? null,
    cible_t2: data.cible_t2 ?? null,
    cible_t3: data.cible_t3 ?? null,
    cible_t4: data.cible_t4 ?? null,
    etat: data.etat,
    clcp: data.clcp,
    unite: data.unite,
    id_personnel: data.id_personnel,
  }

  if (typeof data.moyen_verification === 'string') {
    payload.moyen_verification = data.moyen_verification
  }

  return payload
}

export const indicateurContratService = {
  async getByContrat(
    idContrat: number,
    cadreIds: number[] = []
  ): Promise<IndicateurContrat[]> {
    let items: IndicateurContrat[] = []

    try {
      const response = await apiClient.request<unknown>(ENDPOINT, {
        method: 'GET',
        params: { contrat: idContrat },
      })
      items = normalizeApiList<IndicateurContrat>(response)
    } catch {
      // fallback below
    }

    if (items.length === 0) {
      const response = await apiClient.request<unknown>(ENDPOINT, {
        method: 'GET',
      })
      items = normalizeApiList<IndicateurContrat>(response)
    }

    return filterByCadreIds(items, cadreIds)
  },

  async create(data: IndicateurContratPayload): Promise<IndicateurContrat> {
    const file = resolveMoyenVerificationFile(data.moyen_verification)
    return apiClient.request<IndicateurContrat>(ENDPOINT, {
      method: 'POST',
      data: file ? toFormData(data as IndicateurContratPayload, file) : toJsonPayload(data),
    })
  },

  async update(
    id: number,
    data: Partial<IndicateurContratPayload>
  ): Promise<IndicateurContrat> {
    const file = resolveMoyenVerificationFile(data.moyen_verification)

    return apiClient.request<IndicateurContrat>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data: file ? toFormData(data as IndicateurContratPayload, file) : toJsonPayload(data),
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}
