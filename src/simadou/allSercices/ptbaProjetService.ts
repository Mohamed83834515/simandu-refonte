import { apiClient } from '@/axios/api'
import type { PtbaProjet } from '../allTypes/ptbaProjet'
import type { PtbaProjetFormData } from '../schemas/ptbaProjetSchemas'

const ENDPOINT = '/ptbas-projets/'

function resolveCodeProjet(ptba: PtbaProjet): string | null {
  if (typeof ptba.code_projet === 'string') return ptba.code_projet
  if (
    typeof ptba.code_projet === 'object' &&
    ptba.code_projet &&
    'code_projet' in ptba.code_projet
  ) {
    return ptba.code_projet.code_projet
  }
  return null
}

const ptbaProjetService = {
  async getAll(): Promise<PtbaProjet[]> {
    return apiClient.request(ENDPOINT, { method: 'GET' })
  },

  async getByProjet(codeProjet: string): Promise<PtbaProjet[]> {
    try {
      const byParam = await apiClient.request<PtbaProjet[]>(ENDPOINT, {
        method: 'GET',
        params: { code_projet: codeProjet },
      })
      if (byParam.length > 0) return byParam
    } catch {
      // Repli filtrage client
    }

    const all = await this.getAll()
    return all.filter((ptba) => resolveCodeProjet(ptba) === codeProjet)
  },

  async getById(id: number): Promise<PtbaProjet> {
    return apiClient.request(`${ENDPOINT}${id}/`, { method: 'GET' })
  },

  async create(data: PtbaProjetFormData): Promise<PtbaProjet> {
    return apiClient.request(ENDPOINT, { method: 'POST', data })
  },

  async update(
    id: number,
    data: Partial<PtbaProjetFormData>
  ): Promise<PtbaProjet> {
    return apiClient.request(`${ENDPOINT}${id}/`, { method: 'PUT', data })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default ptbaProjetService
