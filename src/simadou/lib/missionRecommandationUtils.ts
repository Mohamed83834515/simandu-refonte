import type { MissionSupervisionProjet } from '@/simadou/allTypes/missionSupervisionProjet'
import type {
  RecommandationMissionProjet,
  RecommandationMissionProjetApiPayload,
} from '@/simadou/allTypes/recommandationMissionProjet'
import type { RecommandationMissionProjetFormData } from '@/simadou/schemas/missionRecommandationSchemas'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function toApiRelationId(value: unknown): number {
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : 0
}

export function buildRecommandationMissionProjetPayload(
  data: RecommandationMissionProjetFormData,
  options: {
    idProjet: number
    personnelId?: number
    /** URL existante du rapport (édition sans nouveau fichier). */
    rapportUrl?: string
  }
): RecommandationMissionProjetApiPayload {
  const missionId = toApiRelationId(data.mission)

  return {
    volet_recommandation: data.volet_recommandation?.trim() ?? '',
    rubrique: data.rubrique?.trim() ?? '',
    numero: data.numero?.trim() ?? '',
    ref_no: data.ref_no?.trim() ?? '',
    date_buttoir: data.date_buttoir ?? '',
    recommandation: data.recommandation?.trim() ?? '',
    type_recommandation: data.type_recommandation?.trim() ?? '',
    observation: data.observation?.trim() ?? '',
    rapport: options.rapportUrl ?? '',
    etat: data.etat ?? 'en cours',
    modifier_le: new Date().toISOString(),
    modifier_par: options.personnelId ?? 0,
    mission: missionId,
    responsable: data.responsable || "0",
    responsable_interne: data.responsable_interne || "0",
    projet: options.idProjet,
    structure: toApiRelationId(data.structure),
    id_personnel: options.personnelId ?? 0,
  }
}

export function filterMissionsByProjet(
  missions: MissionSupervisionProjet[],
  idProjet: number
): MissionSupervisionProjet[] {
  return missions.filter(
    (mission) =>
      resolveRelationId(mission.projet, 'id_projet') === idProjet
  )
}

export function filterRecommandationsByProjet(
  recommandations: RecommandationMissionProjet[],
  idProjet: number
): RecommandationMissionProjet[] {
  return recommandations.filter(
    (row) => resolveRelationId(row.projet, 'id_projet') === idProjet
  )
}

export function filterRecommandationsByMission(
  recommandations: RecommandationMissionProjet[],
  idMission: number | null
): RecommandationMissionProjet[] {
  if (!idMission) return recommandations
  return recommandations.filter(
    (row) => resolveRelationId(row.mission, 'id_mission') === idMission
  )
}

export const TYPE_RECOMMANDATION_LABELS: Record<string, string> = {
  a_echeance: 'À échéance',
  continu: 'Continu',
  immediat: 'Immédiat',
  immediate_continu: 'Immédiat continu',
}

export function formatTypeRecommandation(value?: string | null): string {
  if (!value) return '—'
  return TYPE_RECOMMANDATION_LABELS[value] ?? value
}

export function formatEtatLabel(value?: string | null): string {
  if (!value) return '—'
  const normalized = value.trim().toLowerCase()
  const labels: Record<string, string> = {
    'en cours': 'En cours',
    'en attente': 'En attente',
    réalisé: 'Réalisé',
    realise: 'Réalisé',
    realisé: 'Réalisé',
  }
  return labels[normalized] ?? value
}

export function formatMissionLabel(mission: MissionSupervisionProjet): string {
  const parts = [mission.code_ms]
  if (mission.type_mission?.trim()) parts.push(mission.type_mission.trim())
  if (mission.debut) {
    parts.push(
      `(${new Date(mission.debut).toLocaleDateString('fr-FR')})`
    )
  }
  return parts.join(' — ')
}
