import type { PaoMinagriDashboardStats } from '@/simadou/allTypes/dashboardProjet'
import type { Ptba } from '@/simadou/allTypes/ptba'

export function filterPtbasByVersionId(
  ptbas: Ptba[],
  versionId: number | null | undefined
): Ptba[] {
  if (versionId == null) return ptbas
  const versionKey = versionId.toString()
  return ptbas.filter((ptba) => ptba.version_ptba?.toString() === versionKey)
}

/** Montant total prévu = somme des cout_total_ptba des PAO filtrés par version. */
export function sumMontantTotalPrevuPtbas(ptbas: Ptba[]): number {
  return ptbas.reduce((total, ptba) => {
    const montant = Number(ptba.cout_total_ptba ?? 0)
    return total + (Number.isFinite(montant) ? montant : 0)
  }, 0)
}

/** Montant total décaissé = somme des montant_decaisse_ptba des PAO filtrés par version. */
export function sumMontantTotalDecaissePtbas(ptbas: Ptba[]): number {
  return ptbas.reduce((total, ptba) => {
    const montant = Number(ptba.montant_decaisse_ptba ?? 0)
    return total + (Number.isFinite(montant) ? montant : 0)
  }, 0)
}

/** Taux (%) = (partie × 100) / total */
export function computeDashboardRate(part: number, total: number): number {
  if (total <= 0) return 0
  const raw = (part * 100) / total
  return Math.round(raw * 100) / 100
}

export function formatDashboardPercent(taux: number): string {
  return taux.toFixed(2)
}

export function countActivitesRealiseesPtbas(ptbas: Ptba[]): number {
  return ptbas.filter((ptba) => {
    const taux = Number(ptba.taux_execution_ptba ?? 0)
    return Number.isFinite(taux) && taux >= 100
  }).length
}

export function buildPaoMinagriDashboardStats(
  ptbas: Ptba[],
  versionId: number | null | undefined,
  annee: number
): PaoMinagriDashboardStats {
  const ptbasVersion = filterPtbasByVersionId(ptbas, versionId)
  const montantTotalPrevu = sumMontantTotalPrevuPtbas(ptbasVersion)
  const montantTotalDecaisse = sumMontantTotalDecaissePtbas(ptbasVersion)
  const totalActivites = ptbasVersion.length
  const activitesRealisees = countActivitesRealiseesPtbas(ptbasVersion)

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
