import { apiClient } from '@/axios/api'
import type { SuiviAvancementConvention } from '../allTypes/suiviAvancementConvention'
import type {
  ETAT_SUIVI_VALUES,
  STATUT_ACTIVITE_VALUES,
} from '../schemas/suiviAvancementContratSchemas'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/suivis-avancement-conventions/'

export type SuiviAvancementConventionPayload = {
  id_suivi?: number
  date_suivi: string
  code_suivi?: string | null
  statut_activite: (typeof STATUT_ACTIVITE_VALUES)[number]
  etat_avancement: string
  retard_accuse: string
  difficultes_rencontrees: string
  pistes_solutions: string
  observation: string
  etat: (typeof ETAT_SUIVI_VALUES)[number]
  convention: number
  id_personnel: number
  modifier_par: string
}

const suiviAvancementConventionService = {
  async getByConvention(
    idConvention: number
  ): Promise<SuiviAvancementConvention[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { convention: idConvention },
    })
    return normalizeApiList<SuiviAvancementConvention>(response)
  },

  async create(
    payload: SuiviAvancementConventionPayload
  ): Promise<SuiviAvancementConvention> {
    return apiClient.request<SuiviAvancementConvention>(ENDPOINT, {
      method: 'POST',
      data: payload,
    })
  },

  async update(
    id: number,
    payload: SuiviAvancementConventionPayload
  ): Promise<SuiviAvancementConvention> {
    return apiClient.request<SuiviAvancementConvention>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data: { ...payload, id_suivi: id },
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default suiviAvancementConventionService
