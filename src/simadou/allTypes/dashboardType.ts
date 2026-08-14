import { VersionPtba } from "./versionPtba"
import type { PlanSite } from "./planSite"

export interface AvancementDirection {
  version_info: VersionPtba
  code_ugl: string
  abrege_ugl: string
  nom_ugl: string
  nb_ptbas: number
  taux_execution_moyen: number
}

export interface TacheActiviteByPlanSiteSummary {
  id_groupe_tache: number
  proportion_gt: string
  date_debut_gt: string
  date_fin_gt: string
  valide: boolean
  nb_lots_realises: number
}

export interface TacheActiviteByPlanSiteGroup {
  service: Pick<PlanSite, 'id_ds' | 'code_ds' | 'intutile_ds'>
  nb_taches: number
  nb_taches_validees: number
  taches: TacheActiviteByPlanSiteSummary[]
}

export interface TacheActiviteByUglGroup {
  ugl: {
    id_ugl: number
    code_ugl: string
    nom_ugl: string
    abrege_ugl: string
  }
  nb_taches: number
  nb_taches_validees: number
  taches: TacheActiviteByPlanSiteSummary[]
}

export interface AvancementTachesPlanSiteChartRow {
  service: string
  nbTaches: number
  nbTachesValidees: number
  pourcentageValide: number
}
