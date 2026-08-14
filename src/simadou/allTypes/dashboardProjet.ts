import type { Projet } from './projet'

export type ProjetDashboardStatut =
  | 'actif'
  | 'critique'
  | 'retard'
  | 'clôturé'
  | 'suspendu'

/** Projet API avec champs optionnels utilisés par le tableau de bord. */
export type ProjetDashboardSource = Projet & {
  logo_projet?: string
  taux_avancement_technique?: number
  montant_decaisse?: number
  taux_decaissement?: number
  statut_projet?: string
}

export interface ProjetDashboardRow {
  id: string | number
  sigle: string
  nom_projet: string
  logo?: string
  date_demarrage: string
  date_cloture: string
  date_fin?: string
  delai_consomme: number
  budget_prevu: number
  montant_decaisse: number
  taux_decaissement: number
  taux_avancement_technique: number
  statut: ProjetDashboardStatut
  bailleur?: string
}

export interface ProjetProgrammeDashboardStats {
  total: number
  enRetard: number
  pourcentageRetard: number
  critiques: number
  pourcentageCritique: number
}

export interface PaoMinagriDashboardStats {
  annee: number
  montantTotalPrevu: number
  montantTotalDecaisse: number
  tauxDecaissement: number
  totalActivites: number
  activitesRealisees: number
  tauxRealisationActivites: number
}
