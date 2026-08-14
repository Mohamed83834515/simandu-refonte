import type { PaoMinagriDashboardStats } from '@/simadou/allTypes/dashboardProjet'
import type {
  PtbaProjet,
  VersionPtbasProjetsResponse,
} from '@/simadou/allTypes/ptbaProjet'
import { computeDashboardRate } from '@/simadou/lib/dashboardPaoStatsUtils'

function sumPtbaProjetMontant(
  ptbas: PtbaProjet[],
  field: 'cout_ptba' | 'montant_decaisse_ptba'
): number {
  return ptbas.reduce((total, ptba) => {
    const montant = Number(ptba[field] ?? 0)
    return total + (Number.isFinite(montant) ? montant : 0)
  }, 0)
}

function countActivitesRealiseesPtbasProjets(ptbas: PtbaProjet[]): number {
  return ptbas.filter((ptba) => {
    const taux = Number(ptba.taux_execution_ptba ?? 0)
    return Number.isFinite(taux) && taux >= 100
  }).length
}

export function buildPtbaProjetsDashboardStats(
  data: VersionPtbasProjetsResponse | null | undefined,
  annee: number
): PaoMinagriDashboardStats {
  const ptbas = data?.ptbas_projets ?? []
  const totalActivites = data?.nb_ptbas_projets ?? ptbas.length
  const montantTotalPrevu = sumPtbaProjetMontant(ptbas, 'cout_ptba')
  const montantTotalDecaisse = sumPtbaProjetMontant(
    ptbas,
    'montant_decaisse_ptba'
  )
  const activitesRealisees = countActivitesRealiseesPtbasProjets(ptbas)

  return {
    annee,
    montantTotalPrevu,
    montantTotalDecaisse,
    tauxDecaissement: computeDashboardRate(
      montantTotalDecaisse,
      montantTotalPrevu
    ),
    totalActivites,
    activitesRealisees,
    tauxRealisationActivites: computeDashboardRate(
      activitesRealisees,
      totalActivites
    ),
  }
}
