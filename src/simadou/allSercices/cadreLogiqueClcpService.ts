import { apiClient } from '@/axios/api'
import type {
  CadreLogiqueClcp,
  CadreLogiqueClcpPayload,
} from '../allTypes/cadreLogiqueClcp'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/cadres-logiques-contrats-performance/'

export const cadreLogiqueClcpService = {
  async getByContrat(idContrat: number): Promise<CadreLogiqueClcp[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { contrat: idContrat },
    })
    return normalizeApiList<CadreLogiqueClcp>(response)
  },

  async create(data: CadreLogiqueClcpPayload): Promise<CadreLogiqueClcp> {
    return apiClient.request<CadreLogiqueClcp>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: Partial<CadreLogiqueClcpPayload>
  ): Promise<CadreLogiqueClcp> {
    return apiClient.request<CadreLogiqueClcp>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}
