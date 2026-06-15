import { apiClient } from '@/axios/api'
import type { SuiviDecaissementPtba } from '../allTypes/decaissementPtba'
import type { Ptba } from '../allTypes/ptba'
import { resolveActivitePtbaId } from '../allTypes/suiviAvancementContrat'
import type { SuiviDecaissementPtbaFormData } from '../schemas/suiviDecaissementPtbaSchemas'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/suivi_decaissement_ptba/'

/** POST/PUT body for programme PTBA (distinct from projet `activite_ptba_projet`). */
type SuiviDecaissementPtbaApiPayload = {
  periode_suivi_dec: string
  montant_decaisse: number
  taux_dollars_jour: number
  date_suivi_dec: string
  observation: string
  activite_ptba: number
  programme: string
}

function toDateInput(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10)
  return parsed.toISOString().split('T')[0]
}

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0]
}

function resolveProgrammeCode(raw: unknown): string | null {
  if (raw == null) return null
  if (typeof raw === 'string') return raw.trim() || null
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const code = obj.code_programme ?? obj.programme
    if (typeof code === 'string' && code.trim()) return code.trim()
  }
  return String(raw).trim() || null
}

function mapSuiviDecaissementPtbaFromApi(
  raw: Record<string, unknown>
): SuiviDecaissementPtba {
  const idRaw = raw.id_suivi_dec ?? raw.id ?? 0

  return {
    id_suivi_dec: Number(idRaw),
    sources: Array.isArray(raw.sources)
      ? raw.sources.map((source) => {
          const s = source as Record<string, unknown>
          return {
            id_source_verif: Number(s.id_source_verif ?? 0),
            fichier_join: String(s.fichier_join ?? ''),
            suivi_decaissement:
              s.suivi_decaissement != null
                ? Number(s.suivi_decaissement)
                : null,
          }
        })
      : [],
    periode_suivi_dec: toDateInput(raw.periode_suivi_dec),
    montant_decaisse: Number(raw.montant_decaisse ?? 0),
    taux_dollars_jour: Number(raw.taux_dollars_jour ?? 0),
    date_suivi_dec: toDateInput(raw.date_suivi_dec),
    observation: String(raw.observation ?? ''),
    date_enregistrement: toDateInput(raw.date_enregistrement) || '',
    date_modification: toDateInput(raw.date_modification) || '',
    activite_ptba:
      resolveActivitePtbaId(
        raw.activite_ptba as number | Ptba | null | undefined
      ) ?? null,
    programme: resolveProgrammeCode(raw.programme),
  }
}

function toApiPayload(
  data: SuiviDecaissementPtbaFormData,
  idActivite: number,
  codeProgramme: string,
  existing?: Pick<
    SuiviDecaissementPtba,
    'periode_suivi_dec' | 'taux_dollars_jour' | 'programme'
  >
): SuiviDecaissementPtbaApiPayload {
  const today = todayIsoDate()

  return {
    periode_suivi_dec: existing?.periode_suivi_dec?.trim() || today,
    montant_decaisse: data.montant_decaisse,
    taux_dollars_jour: existing?.taux_dollars_jour ?? 0,
    date_suivi_dec: data.date_suivi_dec,
    observation: data.observation,
    activite_ptba: idActivite,
    programme: existing?.programme?.trim() || codeProgramme,
  }
}

const suiviDecaissementPtbaService = {
  async getByActivite(idActivite: number): Promise<SuiviDecaissementPtba[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: 'GET',
      params: { activite_ptba: idActivite },
    })
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapSuiviDecaissementPtbaFromApi
    )
  },

  async create(
    idActivite: number,
    data: SuiviDecaissementPtbaFormData,
    codeProgramme: string
  ): Promise<SuiviDecaissementPtba> {
    const raw = await apiClient.request<Record<string, unknown>>(ENDPOINT, {
      method: 'POST',
      data: toApiPayload(data, idActivite, codeProgramme),
    })
    return mapSuiviDecaissementPtbaFromApi(raw)
  },

  async update(
    id: number,
    idActivite: number,
    data: SuiviDecaissementPtbaFormData,
    codeProgramme: string,
    existing?: Pick<
      SuiviDecaissementPtba,
      'periode_suivi_dec' | 'taux_dollars_jour' | 'programme'
    >
  ): Promise<SuiviDecaissementPtba> {
    const raw = await apiClient.request<Record<string, unknown>>(
      `${ENDPOINT}${id}/`,
      {
        method: 'PUT',
        data: toApiPayload(data, idActivite, codeProgramme, existing),
      }
    )
    return mapSuiviDecaissementPtbaFromApi(raw)
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default suiviDecaissementPtbaService
