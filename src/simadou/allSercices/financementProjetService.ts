import { apiClient } from '@/axios/api'
import type {
  FinancementProjet,
  FinancementProjetApiPayload,
} from '@/simadou/allTypes/financementProjet'
import { filterFinancementsByProjet } from '@/simadou/lib/financementProjetUtils'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/types-parts/'

const financementProjetService = {
  async getAll(): Promise<FinancementProjet[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, { method: 'GET' })
    return normalizeApiList<FinancementProjet>(response)
  },

  async getByProjet(idProjet: number): Promise<FinancementProjet[]> {
    try {
      const byParam = await apiClient.request<unknown>(ENDPOINT, {
        method: 'GET',
        params: { projet: idProjet },
      })
      const items = normalizeApiList<FinancementProjet>(byParam)
      if (items.length > 0) return items
    } catch {
      // Repli filtrage client
    }

    const all = await this.getAll()
    return filterFinancementsByProjet(all, idProjet)
  },

  async create(data: FinancementProjetApiPayload): Promise<FinancementProjet> {
    return apiClient.request<FinancementProjet>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: FinancementProjetApiPayload
  ): Promise<FinancementProjet> {
    return apiClient.request<FinancementProjet>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default financementProjetService
