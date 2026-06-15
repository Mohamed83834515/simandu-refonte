import { apiClient } from '@/axios/api'
import type { SuiviTacheActivite } from '../allTypes'
import type { SuiviTacheActiviteProjetPayload } from '../schemas/suiviTacheActiviteProjetSchemas'
import { mapSuiviTacheActiviteFromApi } from './suiviTacheActiviteService'

const ENDPOINT = '/suivi-tache-activites-projets/'

function normalizeList(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) return response as Record<string, unknown>[]
  if (
    response &&
    typeof response === 'object' &&
    'results' in response &&
    Array.isArray((response as { results: unknown }).results)
  ) {
    return (response as { results: Record<string, unknown>[] }).results
  }
  return []
}

export function mapSuiviTacheActiviteProjetFromApi(
  raw: Record<string, unknown>
): SuiviTacheActivite {
  return mapSuiviTacheActiviteFromApi({
    ...raw,
    id_suivi_groupe_tache:
      raw.id_suivi_groupe_tache ??
      raw.id_suivi_tache_activite_projet ??
      raw.id,
  })
}

function toApiPayload(data: SuiviTacheActiviteProjetPayload): Record<string, unknown> {
  return {
    id_activite_ptba: data.id_activite_ptba,
    id_groupe_tache: data.id_groupe_tache,
    date_reele: data.date_reele,
    observation_suivi: data.observation_suivi,
    lot_realisee: data.proportion_realisee,
    valide: data.valide,
  }
}

const suiviTacheActiviteProjetService = {
  async getByActivite(idActivite: number): Promise<SuiviTacheActivite[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { id_activite_ptba: idActivite },
    })
    return normalizeList(response).map(mapSuiviTacheActiviteProjetFromApi)
  },

  async create(data: SuiviTacheActiviteProjetPayload): Promise<SuiviTacheActivite> {
    const raw = await apiClient.request<Record<string, unknown>>(ENDPOINT, {
      method: 'POST',
      data: toApiPayload(data),
    })
    return mapSuiviTacheActiviteProjetFromApi(raw)
  },

  async update(
    id: number,
    data: SuiviTacheActiviteProjetPayload
  ): Promise<SuiviTacheActivite> {
    const raw = await apiClient.request<Record<string, unknown>>(
      `${ENDPOINT}${id}/`,
      {
        method: 'PUT',
        data: toApiPayload(data),
      }
    )
    return mapSuiviTacheActiviteProjetFromApi(raw)
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default suiviTacheActiviteProjetService
