import { apiClient } from '@/axios/api'
import type {
  DossierProjet,
  DossierProjetWritePayload,
} from '@/simadou/allTypes/dossierProjet'
import { filterDossiersByProjet } from '@/simadou/lib/dossierProjetUtils'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/dossiers-projets/'

const dossierProjetService = {
  async getAll(): Promise<DossierProjet[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, { method: 'GET' })
    return normalizeApiList<DossierProjet>(response)
  },

  async getByProjet(idProjet: number): Promise<DossierProjet[]> {
    try {
      const byParam = await apiClient.request<unknown>(ENDPOINT, {
        method: 'GET',
        params: { projet: idProjet },
      })
      const items = normalizeApiList<DossierProjet>(byParam)
      if (items.length > 0) return items
    } catch {
      // Repli filtrage client
    }

    const all = await this.getAll()
    return filterDossiersByProjet(all, idProjet)
  },

  async getById(id: number): Promise<DossierProjet> {
    return apiClient.request<DossierProjet>(`${ENDPOINT}${id}/`)
  },

  async create(data: DossierProjetWritePayload): Promise<DossierProjet> {
    return apiClient.request<DossierProjet>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: DossierProjetWritePayload
  ): Promise<DossierProjet> {
    return apiClient.request<DossierProjet>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default dossierProjetService
