// ProjetDashboard.tsx
import { useState } from 'react'
import {
  Activity,
  BarChart3,
  DollarSign,
  Target,
  Wallet,
  Calendar,
  FileText,
  PieChart as PieChartIcon,
  Gauge,
  Rocket,
  Shield,
  Zap,
  TrendingUp,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/Progress'

interface ProjetDashboardProps {
  codeProjet: string
}

// Données fictives pour la démonstration
const DEMO_DATA = {
  ptbaStats: {
    realises: 12,
    encours: 8,
    planifies: 15,
  },
  budgetParAnnee: [
    { year: 2024, prevu: 250, execute: 180 },
    { year: 2025, prevu: 320, execute: 245 },
    { year: 2026, prevu: 280, execute: 210 },
    { year: 2027, prevu: 200, execute: 95 },
  ],
  kpiIndicateurs: [
    { id: 1, label: 'Ménages sensibilisés', current: 3240, target: 5000, unit: 'ménages' },
    { id: 2, label: 'Km de pistes rurales', current: 78, target: 120, unit: 'km' },
    { id: 3, label: 'Formations réalisées', current: 18, target: 24, unit: 'formations' },
    { id: 4, label: 'Points d\'eau construits', current: 12, target: 20, unit: 'points' },
    { id: 5, label: 'Ha reboisés', current: 450, target: 1000, unit: 'ha' },
    { id: 6, label: 'Emplois créés', current: 156, target: 300, unit: 'emplois' },
  ],
  stats: {
    totalActivites: 45,
    activitesTerminees: 28,
    tauxExecution: 62,
    budgetTotal: 1_250_000_000,
    budgetConsomme: 680_000_000,
    tauxDecaissement: 54,
    totalPtbas: 35,
  }
}

export default function ProjetDashboard({ codeProjet }: ProjetDashboardProps) {
  const [selectedYear, setSelectedYear] = useState(2026)
  const availableYears = [2024, 2025, 2026, 2027]
  console.log(codeProjet)
  const selectedYearData = DEMO_DATA.budgetParAnnee.find(d => d.year === selectedYear)
  const budgetPct = selectedYearData
    ? Math.round((selectedYearData.execute / selectedYearData.prevu) * 100)
    : 0

  const totalPtba = DEMO_DATA.ptbaStats.realises + DEMO_DATA.ptbaStats.encours + DEMO_DATA.ptbaStats.planifies
  const ptbaRealisationPct = Math.round((DEMO_DATA.ptbaStats.realises / totalPtba) * 100)

  const maxBudget = Math.max(...DEMO_DATA.budgetParAnnee.map(d => d.prevu))

  return (
    <div className='space-y-6 p-2'>
      {/* En-tête */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            Tableau de bord
          </h2>
          <p className='text-sm text-muted-foreground'>
            Vue d'ensemble de l'avancement du projet
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className='w-[130px] border-0 bg-transparent'>
                <SelectValue placeholder='Année' />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cartes KPI principales */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-l-4 border-l-blue-500'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>Activités</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.totalActivites}</p>
                <p className='text-xs text-muted-foreground'>{DEMO_DATA.stats.activitesTerminees} terminées</p>
              </div>
              <div className='rounded-full bg-blue-500/10 p-3'>
                <Activity className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-emerald-500'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>PTBA</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.totalPtbas}</p>
                <p className='text-xs text-muted-foreground'>activités planifiées</p>
              </div>
              <div className='rounded-full bg-emerald-500/10 p-3'>
                <FileText className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-amber-500'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>Exécution</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.tauxExecution}%</p>
                <Progress value={DEMO_DATA.stats.tauxExecution} className='mt-1' />
              </div>
              <div className='rounded-full bg-amber-500/10 p-3'>
                <Gauge className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-600'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>Décaissement</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.tauxDecaissement}%</p>
                <Progress value={DEMO_DATA.stats.tauxDecaissement} className='mt-1' />
              </div>
              <div className='rounded-full bg-green-600/10 p-3'>
                <DollarSign className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jauge circulaire CSS */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Rocket className='h-4 w-4 text-primary' />
              Taux d'exécution global
            </CardTitle>
            <CardDescription>Progression des activités projet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center'>
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted-foreground/20"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-emerald-500 transition-all duration-1000"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - DEMO_DATA.stats.tauxExecution / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-foreground">
                    {DEMO_DATA.stats.tauxExecution}%
                  </text>
                </svg>
              </div>
              <p className='mt-4 text-sm text-muted-foreground'>
                {DEMO_DATA.stats.activitesTerminees} / {DEMO_DATA.stats.totalActivites} activités réalisées
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Camembert CSS */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChartIcon className='h-4 w-4 text-primary' />
              Répartition PTBA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-center justify-center gap-6'>
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="#3B82F6" />
                  <path
                    fill="#10B981"
                    d={`M50 10 A 40 40 0 0 1 ${50 + 40 * Math.sin(2 * Math.PI * DEMO_DATA.ptbaStats.realises / totalPtba)} ${50 - 40 * Math.cos(2 * Math.PI * DEMO_DATA.ptbaStats.realises / totalPtba)} L 50 50 Z`}
                  />
                  <path
                    fill="#F59E0B"
                    d={`M50 50 L ${50 + 40 * Math.sin(2 * Math.PI * (DEMO_DATA.ptbaStats.realises + DEMO_DATA.ptbaStats.encours) / totalPtba)} ${50 - 40 * Math.cos(2 * Math.PI * (DEMO_DATA.ptbaStats.realises + DEMO_DATA.ptbaStats.encours) / totalPtba)} A 40 40 0 0 1 ${50 + 40 * Math.sin(2 * Math.PI * DEMO_DATA.ptbaStats.realises / totalPtba)} ${50 - 40 * Math.cos(2 * Math.PI * DEMO_DATA.ptbaStats.realises / totalPtba)} Z`}
                  />
                </svg>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 rounded-full bg-green-500' />
                  <span className='text-sm'>Réalisées ({DEMO_DATA.ptbaStats.realises})</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 rounded-full bg-amber-500' />
                  <span className='text-sm'>En cours ({DEMO_DATA.ptbaStats.encours})</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-3 w-3 rounded-full bg-blue-500' />
                  <span className='text-sm'>Planifiées ({DEMO_DATA.ptbaStats.planifies})</span>
                </div>
              </div>
            </div>
            <div className='mt-4'>
              <div className='flex justify-between text-sm mb-1'>
                <span>Taux de réalisation PTBA</span>
                <span className='font-semibold'>{ptbaRealisationPct}%</span>
              </div>
              <Progress value={ptbaRealisationPct} />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Avancement global par année */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <TrendingUp className='h-4 w-4 text-primary' />
            Avancement global par année
          </CardTitle>
          <CardDescription>Taux d'exécution budgétaire annuel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {DEMO_DATA.budgetParAnnee.map((item) => {
              const taux = Math.round((item.execute / item.prevu) * 100)

              // Couleur selon le taux
              const getTauxColor = () => {
                if (taux >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                if (taux >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                if (taux >= 40) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                return 'text-red-600 bg-red-50 dark:bg-red-950/30'
              }

              const getProgressColor = () => {
                if (taux >= 80) return 'bg-emerald-500'
                if (taux >= 60) return 'bg-blue-500'
                if (taux >= 40) return 'bg-amber-500'
                return 'bg-red-500'
              }

              return (
                <div key={item.year} className='rounded-lg border p-4 hover:shadow-md transition-all'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-sm font-semibold text-foreground'>{item.year}</p>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTauxColor()}`}>
                      {taux}%
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className='mb-3'>
                    <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                      <div
                        className={`h-full rounded-full ${getProgressColor()} transition-all duration-500`}
                        style={{ width: `${taux}%` }}
                      />
                    </div>
                  </div>

                  {/* Montants */}
                  <div className='flex justify-between text-xs'>
                    <div>
                      <p className='text-muted-foreground'>Prévu</p>
                      <p className='font-semibold text-blue-600'>{item.prevu} M GNF</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-muted-foreground'>Exécuté</p>
                      <p className='font-semibold text-emerald-600'>{item.execute} M GNF</p>
                    </div>
                  </div>

                  {/* Écart */}
                  <div className='mt-2 pt-2 border-t text-center'>
                    <p className='text-[10px] text-muted-foreground'>
                      Écart: {Math.abs(item.prevu - item.execute)} M GNF
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      {/* Graphique à barres CSS */}
      <Card className='shadow-sm overflow-hidden'>
        <CardHeader className='pb-2 border-b bg-muted/20'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <BarChart3 className='h-4 w-4 text-primary' />
            Budget par année
          </CardTitle>
          <CardDescription>Comparaison prévu vs exécuté (millions GNF)</CardDescription>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex items-end justify-between gap-4'>
            {DEMO_DATA.budgetParAnnee.map((item) => {
              const prevuHeight = (item.prevu / maxBudget) * 180
              const executeHeight = (item.execute / maxBudget) * 180
              const executePct = Math.round((item.execute / item.prevu) * 100)

              // Couleur selon le taux
              const getExecuteColor = () => {
                if (executePct >= 75) return 'bg-emerald-500'
                if (executePct >= 50) return 'bg-amber-500'
                return 'bg-red-500'
              }

              return (
                <div key={item.year} className='flex-1 flex flex-col items-center group'>
                  {/* Barres groupées */}
                  <div className='relative w-full flex justify-center gap-3 mb-2'>
                    <div className='flex flex-col items-center'>
                      <div className='w-10 rounded-t-lg bg-blue-400/60 transition-all duration-300 group-hover:bg-blue-500'
                        style={{ height: `${prevuHeight}px`, minHeight: '4px' }} />
                      <span className='text-[9px] text-muted-foreground mt-1'>prévu</span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <div className={`w-10 rounded-t-lg ${getExecuteColor()} transition-all duration-300 group-hover:opacity-80`}
                        style={{ height: `${executeHeight}px`, minHeight: '4px' }} />
                      <span className='text-[9px] text-muted-foreground mt-1'>exécuté</span>
                    </div>
                  </div>

                  {/* Valeurs */}
                  <div className='text-center space-y-0.5'>
                    <p className='text-sm font-bold text-foreground'>{item.year}</p>
                    <div className='flex items-center justify-center gap-2'>
                      <span className='text-[10px] text-blue-600 font-medium'>{item.prevu}M</span>
                      <span className='text-[10px] text-muted-foreground'>/</span>
                      <span className={`text-[10px] font-medium ${getExecuteColor().replace('bg-', 'text-')}`}>
                        {item.execute}M
                      </span>
                    </div>
                    <div className='mt-1'>
                      <div className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50'>
                        <span className='text-[9px] text-muted-foreground'>taux</span>
                        <span className={`text-[10px] font-bold ${getExecuteColor().replace('bg-', 'text-')}`}>
                          {executePct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Légende stylisée */}
          <div className='mt-8 pt-3 border-t flex justify-center gap-8'>
            <div className='flex items-center gap-2'>
              <div className='h-2.5 w-8 rounded-full bg-blue-400/60' />
              <span className='text-xs text-muted-foreground'>Prévu (GNF)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-2.5 w-8 rounded-full bg-emerald-500' />
              <span className='text-xs text-muted-foreground'>Exécuté (GNF)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget année sélectionnée */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Wallet className='h-4 w-4 text-primary' />
            Budget {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Consommation</span>
            <span className='font-semibold'>{budgetPct}%</span>
          </div>
          <Progress value={budgetPct} />
          <div className='rounded-lg bg-muted/50 p-3 space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Décaissé</span>
              <span className='font-semibold text-emerald-600'>
                {selectedYearData?.execute.toLocaleString()} M FCFA
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Prévu</span>
              <span className='font-semibold'>
                {selectedYearData?.prevu.toLocaleString()} M FCFA
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs clés */}
      <div>
        <div className='mb-4 flex items-center gap-2'>
          <Shield className='h-5 w-5 text-primary' />
          <h3 className='font-semibold'>Indicateurs clés de performance</h3>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {DEMO_DATA.kpiIndicateurs.map((ind) => {
            const pct = Math.min(Math.round((ind.current / ind.target) * 100), 100)
            return (
              <Card key={ind.id}>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='text-xs font-semibold uppercase text-muted-foreground'>
                        {ind.label}
                      </p>
                      <div className='mt-2 flex items-baseline gap-2'>
                        <span className='text-2xl font-bold'>{ind.current.toLocaleString()}</span>
                        <span className='text-sm text-muted-foreground'>/ {ind.target.toLocaleString()}</span>
                      </div>
                      <div className='mt-2'>
                        <div className='flex justify-between text-xs mb-1'>
                          <span>Progression</span>
                          <span className='font-semibold'>{pct}%</span>
                        </div>
                        <Progress value={pct} />
                      </div>
                      <p className='mt-2 text-xs text-muted-foreground'>Unité: {ind.unit}</p>
                    </div>
                    <div className='rounded-full bg-primary/10 p-2'>
                      <Target className='h-4 w-4 text-primary' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <Card className='bg-gradient-to-br from-blue-50 to-blue-100/50'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-blue-700'>Budget total projet</p>
                <p className='text-2xl font-bold text-blue-800'>
                  {new Intl.NumberFormat('fr-FR').format(DEMO_DATA.stats.budgetTotal)} FCFA
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {new Intl.NumberFormat('fr-FR').format(DEMO_DATA.stats.budgetConsomme)} FCFA consommé
                </p>
              </div>
              <div className='rounded-full bg-blue-500/20 p-3'>
                <Wallet className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-green-50 to-green-100/50'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-green-700'>Performance globale</p>
                <p className='text-2xl font-bold text-green-800'>{DEMO_DATA.stats.tauxExecution}% exécution</p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {DEMO_DATA.stats.tauxDecaissement}% décaissement
                </p>
              </div>
              <div className='rounded-full bg-green-500/20 p-3'>
                <Zap className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}