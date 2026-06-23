// ProjetDashboard.tsx
import { useMemo, useState } from 'react'
import { useGetActivitesProjet } from '@/simadou/allHooks/admin/activiteProjetHooks'
import {
  useGetBudgetAnnuel,
  useGetProjetAvancementAnnuelStats,
} from '@/simadou/allHooks/admin/projetHooks'
import { useGetPtbasProjet } from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { formatNumber } from '@/simadou/allSercices/montantFormater'
import { type Projet } from '@/simadou/allTypes'
import { buildDecaissementAnnuelFromPtbas } from '@/simadou/lib/ptbaProjetStatsUtils'
import {
  Activity,
  BarChart3,
  DollarSign,
  Wallet,
  Calendar,
  FileText,
  Gauge,
} from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KpiIndicateurs } from './KpiIndicateurs'

interface ProjetDashboardProps {
  projet: Projet
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTauxColor(taux: number) {
  if (taux >= 80)
    return {
      bg: 'bg-emerald-500',
      bar: 'bg-emerald-500',
      text: 'text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Bon',
    }
  if (taux >= 50)
    return {
      bg: 'bg-amber-500',
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Moyen',
    }
  if (taux >= 20)
    return {
      bg: 'bg-orange-500',
      bar: 'bg-orange-500',
      text: 'text-orange-600',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500',
      label: 'Faible',
    }
  return {
    bg: 'bg-red-500',
    bar: 'bg-red-500',
    text: 'text-red-600',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    label: 'Critique',
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accentClass,
  iconBgClass,
  iconColorClass,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  icon: React.ElementType
  accentClass: string
  iconBgClass: string
  iconColorClass: string
}) {
  return (
    <Card className={cn('overflow-hidden border-0 shadow-sm', accentClass)}>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
              {label}
            </p>
            <div className='truncate text-2xl leading-none font-bold'>
              {value}
            </div>
            {sub && (
              <p className='mt-1.5 truncate text-xs text-muted-foreground'>
                {sub}
              </p>
            )}
          </div>
          <div className={cn('flex-shrink-0 rounded-xl p-2.5', iconBgClass)}>
            <Icon className={cn('h-5 w-5', iconColorClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetDetailCard({
  montantDecaisseTotal,
  budget_total,
  budgetPct,
  tauxDecaissement,
  budgetColor,
  decaissementColor,
}: {
  montantDecaisseTotal: number
  budget_total: number
  budgetPct: number
  tauxDecaissement: number
  budgetColor: ReturnType<typeof getTauxColor>
  decaissementColor: ReturnType<typeof getTauxColor>
}) {
  const ecart = budget_total - montantDecaisseTotal
  return (
    <Card className='border-0 bg-gradient-to-br from-background to-muted/20 shadow-sm'>
      <CardHeader className='border-b pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='rounded-lg bg-primary/10 p-1.5'>
              <Wallet className='h-4 w-4 text-primary' />
            </div>
            <div>
              <CardTitle className='text-sm font-semibold'>
                Détail budget
              </CardTitle>
              <CardDescription className='text-xs'>
                Montants et écarts cumulés
              </CardDescription>
            </div>
          </div>
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-semibold',
              budgetColor.badge
            )}
          >
            {budgetColor.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className='space-y-5 pt-5'>
        {/* Taux de consommation */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
              Consommation budget
            </span>
            <span className={cn('text-lg font-bold', budgetColor.text)}>
              {budgetPct}%
            </span>
          </div>
          <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                budgetColor.bar
              )}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>

        {/* Grille montants */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30'>
            <p className='mb-1 text-[10px] tracking-widest text-emerald-600 uppercase dark:text-emerald-400'>
              Décaissé
            </p>
            <p className='text-sm leading-tight font-bold text-emerald-700 dark:text-emerald-300'>
              {formatNumber(montantDecaisseTotal)}
            </p>
            <p className='mt-0.5 text-[10px] text-emerald-600/70'>GNF</p>
          </div>
          <div className='rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
            <p className='mb-1 text-[10px] tracking-widest text-muted-foreground uppercase'>
              Prévu
            </p>
            <p className='text-sm leading-tight font-bold'>
              {formatNumber(budget_total)}
            </p>
            <p className='mt-0.5 text-[10px] text-muted-foreground/70'>GNF</p>
          </div>
          <div className='rounded-xl border border-red-100 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30'>
            <p className='mb-1 text-[10px] tracking-widest text-red-500 uppercase'>
              Écart
            </p>
            <p className='text-sm leading-tight font-bold text-red-600 dark:text-red-400'>
              {formatNumber(ecart)}
            </p>
            <p className='mt-0.5 text-[10px] text-red-500/70'>GNF</p>
          </div>
          <div className='rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30'>
            <p className='mb-1 text-[10px] tracking-widest text-amber-600 uppercase'>
              Reste à décaisser
            </p>
            <p className='text-sm leading-tight font-bold text-amber-700 dark:text-amber-400'>
              {100 - budgetPct}%
            </p>
            <p className='mt-0.5 text-[10px] text-amber-600/70'>du budget</p>
          </div>
        </div>

        {/* Taux de décaissement */}
        <div className='space-y-2 border-t pt-1'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
              Taux de décaissement
            </span>
            <span className={cn('text-lg font-bold', decaissementColor.text)}>
              {tauxDecaissement}%
            </span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                decaissementColor.bar
              )}
              style={{ width: `${tauxDecaissement}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DecaissementComparatifCard({
  data,
  isLoading,
}: {
  data: { annee: number; cible: number; realise: number }[]
  isLoading: boolean
}) {
  const fmt = (v: number) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}Md`
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
    return String(v)
  }
  return (
    <Card className='border-0 shadow-sm'>
      <CardHeader className='border-b pb-3'>
        <div className='flex items-center gap-2'>
          <div className='rounded-lg bg-primary/10 p-1.5'>
            <BarChart3 className='h-4 w-4 text-primary' />
          </div>
          <div>
            <CardTitle className='text-sm font-semibold'>
              Décaissement par année
            </CardTitle>
            <CardDescription className='text-xs'>
              Prévision vs Réalisation (GNF)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-5'>
        {isLoading ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>
            Chargement des données...
          </div>
        ) : data.length === 0 ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>
            Aucune donnée disponible
          </div>
        ) : (
          <ChartContainer
            config={decaissementChartConfig}
            className='h-[240px] w-full'
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 28, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray='3 3'
                className='stroke-muted/40'
              />
              <XAxis
                dataKey='annee'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className='fill-muted-foreground text-xs font-semibold'
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={fmt}
                className='fill-muted-foreground text-[10px] font-semibold'
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${formatNumber(Number(value))} GNF`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey='realise'
                fill='var(--color-chart-1)'
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey='realise'
                  position='top'
                  className='fill-muted-foreground text-[9px] font-bold'
                  formatter={(v: any) => fmt(Number(v))}
                />
              </Bar>
              <Bar
                dataKey='cible'
                fill='var(--color-chart-2)'
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey='cible'
                  position='top'
                  className='fill-muted-foreground text-[9px] font-bold'
                  formatter={(v: any) => fmt(Number(v))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

const avancementChartConfig = {
  cible: {
    label: 'Taux Cible (Prévu)',
    color: 'var(--color-chart-2)',
  },
  realise: {
    label: 'Taux Réalisé (Physique)',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig

const decaissementChartConfig = {
  realise: {
    label: 'Réalisé (GNF)',
    color: 'var(--color-chart-1)',
  },
  cible: {
    label: 'Prévu (GNF)',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig

function ProjetAvancementAnnuelCard({
  data,
  isLoading,
}: {
  data: { annee: number; cible: number; realise: number }[]
  isLoading: boolean
}) {
  return (
    <Card className='border-0 shadow-sm'>
      <CardHeader className='border-b pb-3'>
        <div className='flex items-center gap-2'>
          <div className='rounded-lg bg-primary/10 p-1.5'>
            <BarChart3 className='h-4 w-4 text-primary' />
          </div>
          <div>
            <CardTitle className='text-sm font-semibold'>
              Avancement des projets par année
            </CardTitle>
            <CardDescription className='text-xs'>
              Objectifs (Cibles) vs Réalisations physiques d'activités
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-5'>
        {isLoading ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>
            Chargement des données...
          </div>
        ) : data.length === 0 ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>
            Aucune donnée disponible
          </div>
        ) : (
          <ChartContainer
            config={avancementChartConfig}
            className='h-[240px] w-full'
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 30, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray='3 3'
                className='stroke-muted/40'
              />
              <XAxis
                dataKey='annee'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className='fill-muted-foreground text-xs font-semibold'
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
                className='fill-muted-foreground text-[10px] font-semibold'
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                content={
                  <ChartTooltipContent formatter={(value) => `${value}%`} />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey='realise'
                fill='var(--color-chart-1)'
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey='realise'
                  position='top'
                  className='fill-muted-foreground text-[10px] font-bold'
                  formatter={(value: any) => `${value}%`}
                />
              </Bar>
              <Bar
                dataKey='cible'
                fill='var(--color-chart-2)'
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey='cible'
                  position='top'
                  className='fill-muted-foreground text-[10px] font-bold'
                  formatter={(value: any) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function ProjetDashboard({ projet }: ProjetDashboardProps) {
  const projectYears = useMemo(() => {
    if (!projet?.date_demarrage_projet || !projet?.duree_projet)
      return [new Date().getFullYear()]
    const start = new Date(projet.date_demarrage_projet)
    const startYear = start.getFullYear()
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + projet.duree_projet)
    const endYear = endDate.getFullYear()
    const years: number[] = []
    for (let y = startYear; y <= endYear; y++) years.push(y)
    return years
  }, [projet])

  const defaultYear =
    projectYears[projectYears.length - 1] || new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(defaultYear)

  const { data: activites = [] } = useGetActivitesProjet(projet?.code_projet)
  const { data: ptbas = [], isLoading: isLoadingPtbas } = useGetPtbasProjet(
    projet?.code_projet
  )

  const budget_total = useMemo(
    () => activites.reduce((s, a) => s + (Number(a.budget) || 0), 0),
    [activites]
  )

  const budget_decaisse = useMemo(
    () => ptbas.reduce((s, p) => s + (Number(p.montant_decaisse_ptba) || 0), 0),
    [ptbas]
  )

  const ptbasFiltres = useMemo(
    () => ptbas.filter((p) => p.version_info?.annee_ptba === selectedYear),
    [ptbas, selectedYear]
  )

  const tauxRealisationMoyen = useMemo(() => {
    if (!ptbasFiltres.length) return 0
    return Math.round(
      ptbasFiltres.reduce(
        (s, p) => s + (Number(p.taux_execution_ptba) || 0),
        0
      ) / ptbasFiltres.length
    )
  }, [ptbasFiltres])

  const activitesRealisees = useMemo(
    () => ptbas.filter((p) => Number(p.taux_execution_ptba) >= 100).length,
    [ptbas]
  )

  const tauxDecaissementMoyen = useMemo(() => {
    if (!ptbasFiltres.length) return 0
    return Math.round(
      ptbasFiltres.reduce(
        (s, p) => s + (Number(p.taux_decaissement_ptba) || 0),
        0
      ) / ptbasFiltres.length
    )
  }, [ptbasFiltres])

  const montantDecaisseTotal = useMemo(
    () =>
      ptbasFiltres.reduce(
        (s, p) => s + (Number(p.montant_decaisse_ptba) || 0),
        0
      ),
    [ptbasFiltres]
  )

  const budgetPct = useMemo(
    () =>
      budget_total === 0
        ? 0
        : Math.round((budget_decaisse / budget_total) * 100),
    [budget_total, budget_decaisse]
  )

  const tauxDecaissement = useMemo(
    () =>
      budget_total === 0
        ? 0
        : Math.round((montantDecaisseTotal / budget_total) * 100),
    [budget_total, montantDecaisseTotal]
  )

  const budgetColor = getTauxColor(budgetPct)
  const decaissementColor = getTauxColor(tauxDecaissement)

  const { data: avancementAnnuelData = [], isLoading: isLoadingAvancement } =
    useGetProjetAvancementAnnuelStats(projet?.id_projet, projectYears)
  const { data: budgetsAnnuels = [] } = useGetBudgetAnnuel(projet.id_projet)

  const decaissementParAnnee = useMemo(
    () => buildDecaissementAnnuelFromPtbas(ptbas, budgetsAnnuels),
    [budgetsAnnuels, ptbas]
  )
  console.log('avancementAnnuelData', avancementAnnuelData)
  console.log('decaissementParAnnee', decaissementParAnnee)

  return (
    <div className='space-y-6 p-1'>
      {/* ── En-tête ── */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight text-foreground'>
            Tableau de bord
          </h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            Vue d'ensemble — avancement et finances du projet
          </p>
        </div>
        <div className='flex items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm'>
          <Calendar className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className='h-auto w-[110px] border-0 bg-transparent p-0 shadow-none focus:ring-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  PTBA {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-5'>
        <KpiCard
          label='Activités du projet'
          value={activites.length}
          sub={`${activites.length} au total`}
          icon={Activity}
          accentClass='border-l-4 border-l-blue-500'
          iconBgClass='bg-blue-500/10'
          iconColorClass='text-blue-500'
        />
        <KpiCard
          label='Budget total'
          value={
            <span className='text-lg'>
              {formatNumber(budget_total)}
              <span className='ml-1 text-xs font-normal text-muted-foreground'>
                GNF
              </span>
            </span>
          }
          sub={`${formatNumber(budget_decaisse)} GNF consommé`}
          icon={Wallet}
          accentClass='border-l-4 border-l-violet-500'
          iconBgClass='bg-violet-500/10'
          iconColorClass='text-violet-500'
        />
        <KpiCard
          label={`PTBA ${selectedYear}`}
          value={ptbasFiltres.length}
          sub={`${activitesRealisees} réalisée(s)`}
          icon={FileText}
          accentClass='border-l-4 border-l-emerald-500'
          iconBgClass='bg-emerald-500/10'
          iconColorClass='text-emerald-500'
        />
        <KpiCard
          label="Taux d'exécution"
          value={
            <span className={getTauxColor(tauxRealisationMoyen).text}>
              {tauxRealisationMoyen}%
            </span>
          }
          sub='Physique — PTBA sélectionné'
          icon={Gauge}
          accentClass='border-l-4 border-l-amber-500'
          iconBgClass='bg-amber-500/10'
          iconColorClass='text-amber-500'
        />
        <KpiCard
          label='Taux décaissement'
          value={
            <span className={getTauxColor(tauxDecaissementMoyen).text}>
              {tauxDecaissementMoyen}%
            </span>
          }
          sub={`${formatNumber(montantDecaisseTotal)} GNF`}
          icon={DollarSign}
          accentClass='border-l-4 border-l-teal-500'
          iconBgClass='bg-teal-500/10'
          iconColorClass='text-teal-500'
        />
      </div>

      {/* ── Ligne 2 : Exécution + Graphe ── */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <ProjetAvancementAnnuelCard
          data={avancementAnnuelData}
          isLoading={isLoadingAvancement}
        />
        <DecaissementComparatifCard
          data={decaissementParAnnee}
          isLoading={isLoadingPtbas}
        />
      </div>

      {/* ── Ligne 3 : Budget détail pleine largeur ── */}
      <BudgetDetailCard
        montantDecaisseTotal={montantDecaisseTotal}
        budget_total={budget_total}
        budgetPct={budgetPct}
        tauxDecaissement={tauxDecaissement}
        budgetColor={budgetColor}
        decaissementColor={decaissementColor}
      />

      {/* ── KPI Indicateurs ── */}
      <KpiIndicateurs projet={projet} />
    </div>
  )
}
