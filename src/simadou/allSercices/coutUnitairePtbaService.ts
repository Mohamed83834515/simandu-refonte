import { apiClient } from '@/axios/api'
import type { CoutUnitairePtba } from '../allTypes/coutUnitairePtba'
import {
  filterCoutsUnitairesByActivite,
  type CoutUnitairePtbaApiPayload,
} from '../lib/coutUnitairePtbaUtils'

class CoutUnitairePtbaService {
  async getAll(url: string): Promise<CoutUnitairePtba[]> {
    return apiClient.request<CoutUnitairePtba[]>(url)
  }

  async getByActivite(
    url: string,
    idActivite: number
  ): Promise<CoutUnitairePtba[]> {
    const response = await apiClient.request<CoutUnitairePtba[]>(url)
    return filterCoutsUnitairesByActivite(response, idActivite)
  }

  async create(
    url: string,
    data: CoutUnitairePtbaApiPayload
  ): Promise<CoutUnitairePtba> {
    return apiClient.request<CoutUnitairePtba>(url, {
      method: 'POST',
      data,
    })
  }

  async update(
    url: string,
    id: number,
    data: CoutUnitairePtbaApiPayload
  ): Promise<CoutUnitairePtba> {
    return apiClient.request<CoutUnitairePtba>(`${url}${id}/`, {
      method: 'PUT',
      data,
    })
  }

  async delete(url: string, id: number): Promise<void> {
    await apiClient.request(`${url}${id}/`, {
      method: 'DELETE',
    })
  }
}

export default new CoutUnitairePtbaService()
