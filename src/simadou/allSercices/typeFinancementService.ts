import { apiClient } from '@/axios/api'
import { TypeFinancementPPM } from '../allTypes/typeFinancementPPM'
import { TypeFinancementPPMFormData } from '../schemas/typeFinancementPPM'

const ENDPOINT = '/types-financement-ppm/'

export const typeFinancementPPMService = {
  async getAll(): Promise<TypeFinancementPPM[]> {
    return apiClient.request<TypeFinancementPPM[]>(ENDPOINT, { method: 'GET' })
  },

  async getById(id: number): Promise<TypeFinancementPPM> {
    return apiClient.request<TypeFinancementPPM>(`${ENDPOINT}${id}/`, { method: 'GET' })
  },

  async create(data: TypeFinancementPPMFormData): Promise<TypeFinancementPPM> {
    return apiClient.request<TypeFinancementPPM>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: Partial<TypeFinancementPPMFormData>
  ): Promise<TypeFinancementPPM> {
    return apiClient.request<TypeFinancementPPM>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${ENDPOINT}${id}/`, {
      method: 'DELETE',
    })
  },
}
