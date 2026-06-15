import { apiClient } from '@/axios/api'
import { SuiviIndicateurTacheProjet } from '../allTypes/suiviIndicateurTacheProjet'
import type { SuiviIndicateurTacheProjetPayload } from '@/simadou/schemas/suiviIndicateurTacheProjetSchemas'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/suivi-indicateur-tache-projets/'

function toDateInput(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10)
  return parsed.toISOString().split('T')[0]
}

export function mapSuiviIndicateurTacheProjetFromApi(
  raw: Record<string, unknown>
): SuiviIndicateurTacheProjet {
  const communeRaw = raw.commune_sit
  const indicateurRaw = raw.indicateur_sit

  return {
    id_suivi_sit: Number(raw.id_suivi_sit ?? raw.id ?? 0),
    valeur_suivi_sit: Number(raw.valeur_suivi_sit ?? 0),
    date_suivi_sit: toDateInput(raw.date_suivi_sit),
    tache_suivi:
      typeof raw.tache_suivi === 'string' ? raw.tache_suivi : null,
    personnel_sit:
      raw.personnel_sit != null ? Number(raw.personnel_sit) : null,
    ugl_sit: raw.ugl_sit != null ? Number(raw.ugl_sit) : null,
    commune_sit:
      typeof communeRaw === 'object' && communeRaw && 'id_loca' in communeRaw
        ? Number((communeRaw as { id_loca: unknown }).id_loca)
        : communeRaw != null
          ? Number(communeRaw)
          : null,
    indicateur_sit:
      typeof indicateurRaw === 'object' &&
      indicateurRaw &&
      'id_indicateur_tache' in indicateurRaw
        ? Number(
            (indicateurRaw as { id_indicateur_tache: unknown })
              .id_indicateur_tache
          )
        : indicateurRaw != null
          ? Number(indicateurRaw)
          : null,
  }
}

function toApiPayload(
  data: SuiviIndicateurTacheProjetPayload
): Record<string, unknown> {
  return {
    date_suivi_sit: data.date_suivi_sit,
    valeur_suivi_sit: data.valeur_suivi_sit,
    commune_sit: data.commune_sit,
    indicateur_sit: data.indicateur_sit,
  }
}

function matchesIndicateur(
  suivi: SuiviIndicateurTacheProjet,
  idIndicateur: number
): boolean {
  return suivi.indicateur_sit === idIndicateur
}

const suiviIndicateurTacheProjetService = {
  async getAll(): Promise<SuiviIndicateurTacheProjet[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, { method: 'GET' })
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapSuiviIndicateurTacheProjetFromApi
    )
  },

  async getByActivite(idActivite: number): Promise<SuiviIndicateurTacheProjet[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { id_activite: idActivite },
    })
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapSuiviIndicateurTacheProjetFromApi
    )
  },

  async getByIndicateur(
    idIndicateur: number
  ): Promise<SuiviIndicateurTacheProjet[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { indicateur_sit: idIndicateur },
    })
    const list = normalizeApiList<Record<string, unknown>>(response).map(
      mapSuiviIndicateurTacheProjetFromApi
    )
    if (list.length > 0) return list
    const all = await this.getAll()
    return all.filter((suivi) => matchesIndicateur(suivi, idIndicateur))
  },

  async create(
    data: SuiviIndicateurTacheProjetPayload
  ): Promise<SuiviIndicateurTacheProjet> {
    const raw = await apiClient.request<Record<string, unknown>>(ENDPOINT, {
      method: 'POST',
      data: toApiPayload(data),
    })
    return mapSuiviIndicateurTacheProjetFromApi(raw)
  },

  async update(
    id: number,
    data: SuiviIndicateurTacheProjetPayload
  ): Promise<SuiviIndicateurTacheProjet> {
    const raw = await apiClient.request<Record<string, unknown>>(
      `${ENDPOINT}${id}/`,
      {
        method: 'PUT',
        data: toApiPayload(data),
      }
    )
    return mapSuiviIndicateurTacheProjetFromApi(raw)
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default suiviIndicateurTacheProjetService
