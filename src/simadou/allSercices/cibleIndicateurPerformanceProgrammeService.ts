import { apiClient } from '@/axios/api'
import type {
  CibleIndicateurPerformanceProgramme,
  CibleIndicateurPerformanceProgrammePayload,
} from '@/simadou/allTypes/cibleIndicateurPerformanceProgramme'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/cibles-indicateurs-performances-programmes/'

const cibleIndicateurPerformanceProgrammeService = {
  async getAll(): Promise<CibleIndicateurPerformanceProgramme[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, { method: 'GET' })
    return normalizeApiList<CibleIndicateurPerformanceProgramme>(response)
  },

  async getByProgramme(
    programmeId: number
  ): Promise<CibleIndicateurPerformanceProgramme[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { programme: programmeId },
    })
    return normalizeApiList<CibleIndicateurPerformanceProgramme>(response)
  },

  async create(
    data: CibleIndicateurPerformanceProgrammePayload
  ): Promise<CibleIndicateurPerformanceProgramme> {
    return apiClient.request<CibleIndicateurPerformanceProgramme>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: Partial<CibleIndicateurPerformanceProgrammePayload>
  ): Promise<CibleIndicateurPerformanceProgramme> {
    return apiClient.request<CibleIndicateurPerformanceProgramme>(
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

export default cibleIndicateurPerformanceProgrammeService
