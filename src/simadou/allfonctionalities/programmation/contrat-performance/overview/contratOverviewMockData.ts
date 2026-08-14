import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'

export type ContratKpiIndicateurMock = {
  id: number
  label: string
  code: string
  target: number
  current: number
  unit: string
  pct: number
  type: string
  anneeCible: number
}

export type ContratYearStatsMock = {
  tauxRealisationMoyen: number
  nbrePtbaEnCours: number
  nbrePtbaRealise: number
  nbrePtbaEchus: number
  nbPtba: number
  tauxDecaissementMoyen: number
  montantDecaisseTotalAnnuel: number
  montantPrevuPtba: number
}

export type ContratAnnuelPointMock = {
  annee: number
  cible: number
  realise: number
}

export type ContratDashboardMockData = {
  availableYears: number[]
  tauxExecutionGlobal: number
  totalActivites: number
  activitesRealisees: number
  budget_total: number
  budget_decaisse: number
  budgetPct: number
  montantDecaisseTotal: number
  tauxDecaissement: number
  yearStats: Record<number, ContratYearStatsMock>
  avancementAnnuelData: ContratAnnuelPointMock[]
  decaissementParAnnee: ContratAnnuelPointMock[]
  indicateursCles: ContratKpiIndicateurMock[]
}

function parseYear(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = new Date(value.includes('T') ? value : `${value}T00:00:00`)
  const year = parsed.getFullYear()
  return Number.isFinite(year) ? year : fallback
}

function getContractYears(contrat: ContratPerformance): number[] {
  const currentYear = new Date().getFullYear()
  const startYear = parseYear(contrat.date_debut, currentYear - 1)
  const endYear = parseYear(contrat.date_fin, currentYear + 1)
  const years: number[] = []
  for (let year = startYear; year <= endYear; year++) years.push(year)
  return years.length > 0 ? years : [currentYear - 1, currentYear, currentYear + 1]
}

export function getContratDashboardMockData(
  contrat: ContratPerformance
): ContratDashboardMockData {
  const seed = contrat.id_contrat ?? 1
  const availableYears = getContractYears(contrat)
  const lastYear = availableYears[availableYears.length - 1] ?? 2026
  const firstYear = availableYears[0] ?? 2024

  const yearStats = Object.fromEntries(
    availableYears.map((year, index) => [
      year,
      {
        tauxRealisationMoyen: 58 + ((seed + index * 7) % 30),
        nbrePtbaEnCours: 4 + (index % 3),
        nbrePtbaRealise: 6 + (index % 2),
        nbrePtbaEchus: 1 + (index % 2),
        nbPtba: 12 + (index % 4),
        tauxDecaissementMoyen: 52 + ((seed + index * 5) % 35),
        montantDecaisseTotalAnnuel: 1_250_000_000 + index * 320_000_000,
        montantPrevuPtba: 1_800_000_000 + index * 280_000_000,
      } satisfies ContratYearStatsMock,
    ])
  )

  const avancementAnnuelData = availableYears.map((annee, index) => ({
    annee,
    cible: 45 + index * 12,
    realise: 38 + index * 10 + (seed % 5),
  }))

  const decaissementParAnnee = availableYears.map((annee, index) => ({
    annee,
    cible: 1_500_000_000 + index * 400_000_000,
    realise: 980_000_000 + index * 350_000_000,
  }))

  const budget_total = 5_400_000_000 + seed * 120_000_000
  const budget_decaisse = 3_120_000_000 + seed * 85_000_000

  return {
    availableYears,
    tauxExecutionGlobal: 64 + (seed % 22),
    totalActivites: 28 + (seed % 6),
    activitesRealisees: 16 + (seed % 5),
    budget_total,
    budget_decaisse,
    budgetPct: Math.round((budget_decaisse / budget_total) * 100),
    montantDecaisseTotal: budget_decaisse,
    tauxDecaissement: Math.round((budget_decaisse / budget_total) * 100),
    yearStats,
    avancementAnnuelData,
    decaissementParAnnee,
    indicateursCles: [
      {
        id: 1,
        label: 'Taux de réalisation des indicateurs de résultat',
        code: 'IND-CR-01',
        target: 100,
        current: 78,
        unit: '%',
        pct: 78,
        type: 'Quantitatif',
        anneeCible: lastYear,
      },
      {
        id: 2,
        label: 'Cadres logiques avec cibles trimestrielles',
        code: 'IND-CR-02',
        target: 24,
        current: 19,
        unit: 'cadres',
        pct: 79,
        type: 'Quantitatif',
        anneeCible: lastYear,
      },
      {
        id: 3,
        label: 'Indicateurs disposant d’un moyen de vérification',
        code: 'IND-CR-03',
        target: 100,
        current: 92,
        unit: '%',
        pct: 92,
        type: 'Qualitatif',
        anneeCible: lastYear,
      },
      {
        id: 4,
        label: 'Délai moyen de validation des rapports',
        code: 'IND-CR-04',
        target: 15,
        current: 18,
        unit: 'jours',
        pct: 67,
        type: 'Quantitatif',
        anneeCible: firstYear,
      },
      {
        id: 5,
        label: 'Taux de couverture des zones cibles',
        code: 'IND-CR-05',
        target: 100,
        current: 84,
        unit: '%',
        pct: 84,
        type: 'Quantitatif',
        anneeCible: lastYear,
      },
      {
        id: 6,
        label: 'Satisfaction des parties prenantes',
        code: 'IND-CR-06',
        target: 4,
        current: 3.7,
        unit: '/5',
        pct: 93,
        type: 'Qualitatif',
        anneeCible: lastYear,
      },
    ],
  }
}
