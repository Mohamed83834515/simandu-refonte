import { apiClient } from '@/axios/api'
import type {
  SuiviIndicateurContrat,
  SuiviIndicateurContratPayload,
} from '../allTypes/suiviIndicateurContrat'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/suivis-contrats/'

function resolveIndicateurContratId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (
    typeof value === 'object' &&
    value &&
    'id_indicateur_contrat' in value
  ) {
    return Number(
      (value as { id_indicateur_contrat: unknown }).id_indicateur_contrat
    )
  }
  if (value != null && value !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function mapSuiviIndicateurContratFromApi(
  raw: Record<string, unknown>
): SuiviIndicateurContrat {
  return {
    id_suivi_contrat: Number(raw.id_suivi_contrat ?? raw.id ?? 0),
    trimestre: String(raw.trimestre ?? ''),
    valeur_realisee: Number(raw.valeur_realisee ?? 0),
    observation: String(raw.observation ?? ''),
    date_enregistrement:
      typeof raw.date_enregistrement === 'string'
        ? raw.date_enregistrement
        : undefined,
    modifier_le:
      typeof raw.modifier_le === 'string' ? raw.modifier_le : undefined,
    etat: typeof raw.etat === 'boolean' ? raw.etat : true,
    indicateur_contrat: resolveIndicateurContratId(raw.indicateur_contrat) ?? 0,
    id_personnel:
      raw.id_personnel != null ? Number(raw.id_personnel) : null,
    modifier_par:
      raw.modifier_par != null ? Number(raw.modifier_par) : null,
  }
}

function toApiPayload(
  data: SuiviIndicateurContratPayload
): Record<string, unknown> {
  return {
    trimestre: data.trimestre,
    valeur_realisee: data.valeur_realisee,
    observation: data.observation,
    etat: data.etat,
    indicateur_contrat: data.indicateur_contrat,
    id_personnel: data.id_personnel,
    modifier_par: data.modifier_par,
  }
}

export const suiviIndicateurContratService = {
  async getByIndicateur(
    idIndicateur: number
  ): Promise<SuiviIndicateurContrat[]> {
    let items: SuiviIndicateurContrat[] = []

    try {
      const response = await apiClient.request<unknown>(ENDPOINT, {
        method: 'GET',
        params: { indicateur_contrat: idIndicateur },
      })
      items = normalizeApiList<Record<string, unknown>>(response).map(
        mapSuiviIndicateurContratFromApi
      )
    } catch {
      // fallback below
    }

    if (items.length === 0) {
      try {
        const response = await apiClient.request<unknown>(ENDPOINT, {
          method: 'GET',
        })
        items = normalizeApiList<Record<string, unknown>>(response)
          .map(mapSuiviIndicateurContratFromApi)
          .filter((item) => item.indicateur_contrat === idIndicateur)
      } catch {
        return []
      }
    }

    return items.filter((item) => item.indicateur_contrat === idIndicateur)
  },

  async create(
    data: SuiviIndicateurContratPayload
  ): Promise<SuiviIndicateurContrat> {
    const raw = await apiClient.request<Record<string, unknown>>(ENDPOINT, {
      method: 'POST',
      data: toApiPayload(data),
    })
    return mapSuiviIndicateurContratFromApi(raw)
  },

  async update(
    id: number,
    data: SuiviIndicateurContratPayload
  ): Promise<SuiviIndicateurContrat> {
    const raw = await apiClient.request<Record<string, unknown>>(
      `${ENDPOINT}${id}/`,
      {
        method: 'PUT',
        data: toApiPayload(data),
      }
    )
    return mapSuiviIndicateurContratFromApi(raw)
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}
