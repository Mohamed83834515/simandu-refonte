import { apiClient } from '@/axios/api'
import type {
  RecommandationMissionProjet,
  RecommandationMissionProjetApiPayload,
} from '../allTypes/recommandationMissionProjet'
import { filterRecommandationsByProjet } from '../lib/missionRecommandationUtils'

const ENDPOINT = '/recommandations-missions-projets/'

function toFormData(
  data: RecommandationMissionProjetApiPayload,
  file?: File
): FormData {
  const fd = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'rapport' && file) return
    fd.append(key, String(value ?? ''))
  })
  if (file) {
    fd.append('rapport', file, file.name)
  }
  return fd
}

const recommandationMissionProjetService = {
  async getAll(): Promise<RecommandationMissionProjet[]> {
    return apiClient.request<RecommandationMissionProjet[]>(ENDPOINT, {
      method: 'GET',
    })
  },

  async getByProjet(idProjet: number): Promise<RecommandationMissionProjet[]> {
    try {
      const byParam = await apiClient.request<RecommandationMissionProjet[]>(
        ENDPOINT,
        {
          method: 'GET',
          params: { projet: idProjet },
        }
      )
      return filterRecommandationsByProjet(byParam, idProjet)
    } catch {
      const all = await this.getAll()
      return filterRecommandationsByProjet(all, idProjet)
    }
  },

  async create(
    data: RecommandationMissionProjetApiPayload,
    file?: File
  ): Promise<RecommandationMissionProjet> {
    if (file) {
      return apiClient.request<RecommandationMissionProjet>(ENDPOINT, {
        method: 'POST',
        data: toFormData(data, file),
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    return apiClient.request<RecommandationMissionProjet>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: Partial<RecommandationMissionProjetApiPayload>,
    file?: File
  ): Promise<RecommandationMissionProjet> {
    if (file) {
      return apiClient.request<RecommandationMissionProjet>(
        `${ENDPOINT}${id}/`,
        {
          method: 'PUT',
          data: toFormData(data as RecommandationMissionProjetApiPayload, file),
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
    }

    return apiClient.request<RecommandationMissionProjet>(
      `${ENDPOINT}${id}/`,
      {
        method: 'PUT',
        data,
      }
    )
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default recommandationMissionProjetService
