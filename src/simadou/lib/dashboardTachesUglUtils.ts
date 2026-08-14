import type {
  AvancementTachesPlanSiteChartRow,
  TacheActiviteByUglGroup,
} from '@/simadou/allTypes/dashboardType'
import { computeDashboardRate } from '@/simadou/lib/dashboardPaoStatsUtils'

export function buildAvancementTachesUglChartData(
  groups: TacheActiviteByUglGroup[]
): AvancementTachesPlanSiteChartRow[] {
  return groups.map((group) => {
    const nbTaches = Number(group.nb_taches) || 0
    const nbTachesValidees = Number(group.nb_taches_validees) || 0

    return {
      service:
        group.ugl.abrege_ugl?.trim() ||
        group.ugl.nom_ugl?.trim() ||
        'Non défini',
      nbTaches,
      nbTachesValidees,
      pourcentageValide: computeDashboardRate(nbTachesValidees, nbTaches),
    }
  })
}
