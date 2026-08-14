import { apiClient } from '@/axios/api'
import type { IndicateurPerformanceProgramme } from '@/simadou/allTypes/indicateurPerformanceProgramme'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/indicateurs-performances-programmes/'

export type IndicateurPerformanceProgrammePayload = {
  type_ind: number
  code_indicateur_performance: string
  intitule_indicateur_tache: string
  cadre_analytique: number
  unite_indicateur_performance: number
  programme: number
  id_personnel?: number
}

const indicateurPerformanceProgrammeService = {
  async getAll(): Promise<IndicateurPerformanceProgramme[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, { method: 'GET' })
    return normalizeApiList<IndicateurPerformanceProgramme>(response)
  },

  async getByCadreAnalytique(
    cadreAnalytiqueId: number
  ): Promise<IndicateurPerformanceProgramme[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { cadre_analytique: cadreAnalytiqueId },
    })
    return normalizeApiList<IndicateurPerformanceProgramme>(response)
  },

  async create(
    data: IndicateurPerformanceProgrammePayload
  ): Promise<IndicateurPerformanceProgramme> {
    return apiClient.request<IndicateurPerformanceProgramme>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(
    id: number,
    data: Partial<IndicateurPerformanceProgrammePayload>
  ): Promise<IndicateurPerformanceProgramme> {
    return apiClient.request<IndicateurPerformanceProgramme>(
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

export default indicateurPerformanceProgrammeService
