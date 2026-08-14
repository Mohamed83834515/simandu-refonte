import { apiClient } from '@/axios/api'
import type { PartBailleur, PartBailleurApiPayload } from '@/simadou/allTypes/partBailleur'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/parts-bailleurs/'

export type PartBailleurActiviteQuery = {
  activitePtbaId: number
  projetId: number
  versionPtbaId: number
  codeProjet?: string
  anneePtbaYear?: number
}

const partBailleurService = {
  async getAll(): Promise<PartBailleur[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, { method: 'GET' })
    return normalizeApiList<PartBailleur>(response)
  },
  async getByActivite(idActivite: number, idProjet: number): Promise<PartBailleur[]> {
    const response = await apiClient.request<PartBailleur[]>
      (`${ENDPOINT}?activite_ptba=${idActivite}&projet=${idProjet}`);
    return response;
  },
  async create(data: PartBailleurApiPayload): Promise<PartBailleur> {
    return apiClient.request<PartBailleur>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: PartBailleurApiPayload
  ): Promise<PartBailleur> {
    return apiClient.request<PartBailleur>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default partBailleurService
