import { apiClient } from '@/axios/api'
import type { CibleCmr } from '../allTypes/cibleCmr'
import { normalizeApiList } from './apiListUtils'

export interface CibleCmrFormData {
  annee: number
  valeur_cible_indcateur_cmr: number
  code_indicateur_cmr: number
  localite: number
  programme?: string | null
}

const BASE_URL = '/cibles-cmrs/'

function sortByAnnee(a: CibleCmr, b: CibleCmr): number {
  return Number(a.annee) - Number(b.annee)
}

export const cibleCmrService = {
  async getAll(): Promise<CibleCmr[]> {
    const response = await apiClient.request<unknown>(BASE_URL)
    return normalizeApiList<CibleCmr>(response).sort(sortByAnnee)
  },

  async getById(id: number): Promise<CibleCmr> {
    return await apiClient.request<CibleCmr>(`${BASE_URL}${id}/`)
  },

  async create(data: CibleCmrFormData): Promise<CibleCmr> {
    return await apiClient.request<CibleCmr>(BASE_URL, {
      method: 'POST',
      data,
    })
  },

  async update(id: number, data: CibleCmrFormData): Promise<CibleCmr> {
    return await apiClient.request<CibleCmr>(`${BASE_URL}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: 'DELETE',
    })
  },

  async getByIndicateur(code_indicateur_cmr: number): Promise<CibleCmr[]> {
    const response = await apiClient.request<unknown>(
      `${BASE_URL}?code_indicateur_cmr=${code_indicateur_cmr}`
    )
    return normalizeApiList<CibleCmr>(response).sort(sortByAnnee)
  },
}