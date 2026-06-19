import { apiClient } from '@/axios/api'
import type {
  PeriodeIndicateur,
  PeriodeIndicateurWritePayload,
} from '@/simadou/allTypes/periodeIndicateur'
import { filterPeriodesByIndicateur } from '@/simadou/lib/periodeIndicateurUtils'
import { normalizeApiList } from './apiListUtils'

const BASE_URL = '/periodes-indicateurs/'
const INDICATEUR_BASE_URL = '/indicateurs-cmr/'

export const periodeIndicateurService = {
  getByIndicateur: async (refIndicateur: number): Promise<PeriodeIndicateur[]> => {
    try {
      const nestedResponse = await apiClient.request<unknown>(
        `${INDICATEUR_BASE_URL}${refIndicateur}/periodes/`
      )
      const nestedList = normalizeApiList<PeriodeIndicateur>(nestedResponse)
      if (nestedList.length > 0) {
        return filterPeriodesByIndicateur(nestedList, refIndicateur)
      }
    } catch {
      // Fallback to filtered flat list below.
    }

    const response = await apiClient.request<unknown>(
      `${BASE_URL}?ref_indicateur=${refIndicateur}`
    )
    return filterPeriodesByIndicateur(
      normalizeApiList<PeriodeIndicateur>(response),
      refIndicateur,
      { trustQueryFilter: true }
    )
  },

  create: async (data: PeriodeIndicateurWritePayload): Promise<PeriodeIndicateur> => {
    return await apiClient.request<PeriodeIndicateur>(BASE_URL, {
      method: 'POST',
      data,
    })
  },

  update: async (
    id: number,
    data: PeriodeIndicateurWritePayload
  ): Promise<PeriodeIndicateur> => {
    return await apiClient.request<PeriodeIndicateur>(`${BASE_URL}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: 'DELETE',
    })
  },
}
