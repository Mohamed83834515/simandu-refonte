import { apiClient } from '@/axios/api'
import type { Ppm } from '@/simadou/allTypes/ppm'
import type { PpmFormData } from '@/simadou/schemas/ppmSchema'

const ENDPOINT = '/ppms/'

export const ppmService = {
  async getAll(): Promise<Ppm[]> {
    return apiClient.request<Ppm[]>(ENDPOINT, { method: 'GET' })
  },

  async getById(id: number): Promise<Ppm> {
    return apiClient.request<Ppm>(`${ENDPOINT}${id}/`, { method: 'GET' })
  },

  async create(data: PpmFormData): Promise<Ppm> {
    return apiClient.request<Ppm>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(id: number, data: Partial<PpmFormData>): Promise<Ppm> {
    return apiClient.request<Ppm>(`${ENDPOINT}${id}/`, {
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
