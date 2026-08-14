import { apiClient } from '@/axios/api'
import { normalizeApiList } from './apiListUtils'
import type {
  ContratPerformance,
  ContratPerformancePayload,
} from '@/simadou/allTypes/contratPerformance'

const ENDPOINT = '/contrats-performance/'

function normalizePayload(data: ContratPerformancePayload): Record<string, unknown> {
  return {
    ...data,
    programme: data.programme ?? 0,
    structure: data.structure ?? 0,
    id_personnel: data.id_personnel ?? 0,
    etat: data.etat ?? 'Ajouter',
    note_globale: data.note_globale ?? '0',
  }
}

export const contratPerformanceService = {
  async getAll(programmeId?: number): Promise<ContratPerformance[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: programmeId ? { programme: programmeId } : undefined,
    })
    return normalizeApiList<ContratPerformance>(response)
  },

  async getById(id: number): Promise<ContratPerformance> {
    return apiClient.request<ContratPerformance>(`${ENDPOINT}${id}/`, {
      method: 'GET',
    })
  },

  async create(data: ContratPerformancePayload): Promise<ContratPerformance> {
    return apiClient.request<ContratPerformance>(ENDPOINT, {
      method: 'POST',
      data: normalizePayload(data),
    })
  },

  async update(id: number, data: ContratPerformancePayload): Promise<ContratPerformance> {
    return apiClient.request<ContratPerformance>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data: normalizePayload(data),
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${ENDPOINT}${id}/`, {
      method: 'DELETE',
    })
  },
}

export default contratPerformanceService
