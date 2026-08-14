import { apiClient } from '@/axios/api'
import type {
  MissionSupervisionProjet,
  MissionSupervisionProjetApiPayload,
} from '../allTypes/missionSupervisionProjet'
import { filterMissionsByProjet } from '../lib/missionRecommandationUtils'

const ENDPOINT = '/missions-supervision-projets/'

function toFormData(
  data: MissionSupervisionProjetApiPayload,
  file?: File
): FormData {
  const fd = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value))
    }
  })
  if (file) {
    fd.append('document', file, file.name)
  }
  return fd
}

const missionSupervisionProjetService = {
  async getAll(): Promise<MissionSupervisionProjet[]> {
    return apiClient.request<MissionSupervisionProjet[]>(ENDPOINT, {
      method: 'GET',
    })
  },

  async getByProjet(idProjet: number): Promise<MissionSupervisionProjet[]> {
    try {
      const byParam = await apiClient.request<MissionSupervisionProjet[]>(
        ENDPOINT,
        {
          method: 'GET',
          params: { projet: idProjet },
        }
      )
      if (byParam.length > 0) return byParam
    } catch {
      // Repli filtrage client
    }

    const all = await this.getAll()
    return filterMissionsByProjet(all, idProjet)
  },

  async create(
    data: MissionSupervisionProjetApiPayload,
    file?: File
  ): Promise<MissionSupervisionProjet> {
    if (file) {
      return apiClient.request<MissionSupervisionProjet>(ENDPOINT, {
        method: 'POST',
        data: toFormData(data, file),
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    return apiClient.request<MissionSupervisionProjet>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: Partial<MissionSupervisionProjetApiPayload>,
    file?: File
  ): Promise<MissionSupervisionProjet> {
    if (file) {
      return apiClient.request<MissionSupervisionProjet>(`${ENDPOINT}${id}/`, {
        method: 'PUT',
        data: toFormData(data as MissionSupervisionProjetApiPayload, file),
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    return apiClient.request<MissionSupervisionProjet>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default missionSupervisionProjetService
