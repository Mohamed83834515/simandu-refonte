import { apiClient } from '@/axios/api'
import type {
  NiveauConfigClcp,
  NiveauConfigClcpPayload,
} from '../allTypes/niveauConfigClcp'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/niveaux-config-clcp/'

export const niveauConfigClcpService = {
  async getByContrat(idContrat: number): Promise<NiveauConfigClcp[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { contrat: idContrat },
    })
    const items = normalizeApiList<NiveauConfigClcp>(response)
    return [...items]
      .map((n) => ({ ...n, nombre_ncl: Number(n.nombre_ncl) }))
      .filter((n) => Number.isFinite(n.nombre_ncl))
      .sort((a, b) => a.nombre_ncl - b.nombre_ncl)
  },

  async create(data: NiveauConfigClcpPayload): Promise<NiveauConfigClcp> {
    return apiClient.request<NiveauConfigClcp>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: Partial<NiveauConfigClcpPayload>
  ): Promise<NiveauConfigClcp> {
    return apiClient.request<NiveauConfigClcp>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}
