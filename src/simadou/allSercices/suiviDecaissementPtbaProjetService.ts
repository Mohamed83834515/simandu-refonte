import { apiClient } from '@/axios/api'
import type { SuiviDecaissementPtbaProjet } from '../allTypes/suiviDecaissementPtbaProjet'
import type { SuiviDecaissementPtbaProjetFormData } from '../schemas/suiviDecaissementPtbaProjetSchemas'
import { resolveRelationId } from '../lib/resolveApiRelation'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/suivi-decaissement-ptba-projets/'

function toDateInput(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10)
  return parsed.toISOString().split('T')[0]
}

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0]
}

function resolveActivitePtbaProjetId(value: unknown): number | null {
  return resolveRelationId(value, 'id_ptba')
}

function mapSuiviDecaissementPtbaProjetFromApi(
  raw: Record<string, unknown>
): SuiviDecaissementPtbaProjet {
  const idRaw = raw.id_suivi_dec ?? raw.id ?? 0

  return {
    id_suivi_dec: Number(idRaw),
    periode_suivi_dec: toDateInput(raw.periode_suivi_dec),
    montant_decaisse: Number(raw.montant_decaisse ?? 0),
    taux_dollars_jour: Number(raw.taux_dollars_jour ?? 0),
    date_suivi_dec: toDateInput(raw.date_suivi_dec),
    observation: String(raw.observation ?? ''),
    date_enregistrement: toDateInput(raw.date_enregistrement) || null,
    date_modification: toDateInput(raw.date_modification) || null,
    region:
      resolveRelationId(raw.region, 'id_loca') ??
      resolveRelationId(raw.region, 'id'),
    type_part:
      resolveRelationId(raw.type_part, 'id_part') ??
      resolveRelationId(raw.type_part, 'id'),
    activite_ptba_projet: resolveActivitePtbaProjetId(raw.activite_ptba_projet),
  }
}

function toApiPayload(
  data: SuiviDecaissementPtbaProjetFormData,
  idActivite: number,
  existing?: Pick<
    SuiviDecaissementPtbaProjet,
    'periode_suivi_dec' | 'taux_dollars_jour'
  >
): Record<string, unknown> {
  const today = todayIsoDate()

  return {
    date_suivi_dec: data.date_suivi_dec,
    observation: data.observation,
    montant_decaisse: data.montant_decaisse,
    region: data.region,
    type_part: data.type_part,
    activite_ptba_projet: idActivite,
    periode_suivi_dec: existing?.periode_suivi_dec?.trim() || today,
    taux_dollars_jour: existing?.taux_dollars_jour ?? 0,
  }
}

const suiviDecaissementPtbaProjetService = {
  async getByActivite(
    idActivite: number
  ): Promise<SuiviDecaissementPtbaProjet[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
          method: 'GET',
          params: { activite_ptba_projet: idActivite },
        })
    const items = normalizeApiList<Record<string, unknown>>(response).map(
      mapSuiviDecaissementPtbaProjetFromApi
    )
    return items
  },

  async create(
    idActivite: number,
    data: SuiviDecaissementPtbaProjetFormData
  ): Promise<SuiviDecaissementPtbaProjet> {
    const raw = await apiClient.request<Record<string, unknown>>(ENDPOINT, {
      method: 'POST',
      data: toApiPayload(data, idActivite),
    })
    return mapSuiviDecaissementPtbaProjetFromApi(raw)
  },

  async update(
    id: number,
    idActivite: number,
    data: SuiviDecaissementPtbaProjetFormData,
    existing?: Pick<
      SuiviDecaissementPtbaProjet,
      'periode_suivi_dec' | 'taux_dollars_jour'
    >
  ): Promise<SuiviDecaissementPtbaProjet> {
    const raw = await apiClient.request<Record<string, unknown>>(
      `${ENDPOINT}${id}/`,
      {
        method: 'PUT',
        data: toApiPayload(data, idActivite, existing),
      }
    )
    return mapSuiviDecaissementPtbaProjetFromApi(raw)
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default suiviDecaissementPtbaProjetService
