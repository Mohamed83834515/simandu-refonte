// ─── Hook à ajouter dans projetHooks.ts ─────────────────────────────────────
//
// export const useGetTauxGlobalActiviteProjet = (projetId: number | string | undefined) => {
//   return useQuery({
//     queryKey: ['taux-global-activite', projetId],
//     queryFn: () => projetService.getTauxGlobalAct(projetId!),
//     enabled: !!projetId,
//   })
// }

// ProjetDashboard.tsx
import { useMemo, useState, useEffect } from 'react'
// import { useGetActivitesProjet } from '@/simadou/allHooks/admin/activiteProjetHooks'
import {
  useGetBudgetAnnuel,
  useGetProjetAvancementAnnuelStats,
  useGetTauxGlobalActiviteProjet,
} from '@/simadou/allHooks/admin/projetHooks'
import { useGetPtbasProjet } from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import { formatNumber } from '@/simadou/allSercices/montantFormater'
import { type Projet } from '@/simadou/allTypes'
import { BarChart3, DollarSign, Wallet, Calendar, Activity, TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig, ChartContainer, ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KpiIndicateurs } from './KpiIndicateurs'
import { buildDecaissementAnnuelFromPtbas } from '@/simadou/lib/ptbaProjetStatsUtils'

interface ProjetDashboardProps {
  projet: Projet
}

function getTauxColor(taux: number) {
  if (taux >= 80) return { bg: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Bon', stroke: '#10b981', light: 'bg-emerald-500/10', hex: '#10b981' }
  if (taux >= 50) return { bg: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Moyen', stroke: '#f59e0b', light: 'bg-amber-500/10', hex: '#f59e0b' }
  if (taux >= 20) return { bg: 'bg-orange-500', bar: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Faible', stroke: '#f97316', light: 'bg-orange-500/10', hex: '#f97316' }
  return { bg: 'bg-red-500', bar: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-50 text-red-700 border-red-200', label: 'Critique', stroke: '#ef4444', light: 'bg-red-500/10', hex: '#ef4444' }
}

// ─── Gauge circulaire ────────────────────────────────────────────────────────

function GaugeCircle({ value, size = 120, stroke = '#10B981', label = 'exécution' }: {
  value: number; size?: number; stroke?: string; label?: string
}) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(value, 100) / 100)
  return (
    <svg width={size} height={size} viewBox='0 0 100 100'>
      <circle cx='50' cy='50' r={r} fill='transparent' stroke='currentColor' strokeWidth='7' className='text-muted/30' />
      <circle cx='50' cy='50' r={r} fill='transparent' stroke={stroke} strokeWidth='7' strokeLinecap='round'
        strokeDasharray={circ} strokeDashoffset={offset} transform='rotate(-90 50 50)'
        style={{ transition: 'stroke-dashoffset .8s ease' }} />
      <text x='50' y='46' textAnchor='middle' dominantBaseline='middle' fontSize='16' fontWeight='700' fill='currentColor' className='fill-foreground'>{value}%</text>
      <text x='50' y='60' textAnchor='middle' fontSize='6' className='fill-muted-foreground'>{label}</text>
    </svg>
  )
}

// ─── Card 1 : Exécution physique globale ────────────────────────────────────

function TauxGlobalCard({ taux, totalActivites, activitesRealisees }: {
  taux: number; totalActivites: number; activitesRealisees: number
}) {
  const col = {
    bg: 'bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/30 dark:bg-rose-950/30 dark:text-rose-400',
    bar: 'bg-rose-500',
    hex: '#F43F5E',
    label: taux >= 80 ? 'Élevé' : taux >= 50 ? 'Moyen' : 'Faible'
  }

  const restantes = totalActivites - activitesRealisees

  return (
    <Card className='relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-950/20'>
      <div className={cn('absolute inset-x-0 top-0 h-1', col.bg)} />
      <Activity className='absolute right-3 top-4 h-16 w-16 opacity-[0.06] text-rose-500' strokeWidth={1.5} />
      <CardContent className='pt-5 pb-4 px-5'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='rounded-full bg-rose-100 p-1 dark:bg-rose-900/30'>
            <Activity className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
          </div>
          <p className='text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
            Exécution physique globale
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <GaugeCircle value={taux} size={90} stroke={col.hex} label='global' />
          <div className='flex-1 space-y-2.5 min-w-0'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-xs text-muted-foreground'>Réalisées</span>
              <span className='text-sm font-bold text-emerald-600'>{activitesRealisees}</span>
            </div>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-xs text-muted-foreground'>Restantes</span>
              <span className='text-sm font-bold text-amber-600'>{restantes}</span>
            </div>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-xs text-muted-foreground'>Total</span>
              <span className='text-sm font-bold'>{totalActivites}</span>
            </div>
            <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', col.badge)}>
              {col.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Card 2 : Budget global ──────────────────────────────────────────────────

function BudgetKpiCard({ budgetTotal, budgetDecaisse, budgetPct }: {
  budgetTotal: number; budgetDecaisse: number; budgetPct: number
}) {
  const col = {
    bg: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    badge: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800/30 dark:bg-cyan-950/30 dark:text-cyan-400',
    bar: 'bg-cyan-500',
    hex: '#06B6D4',
    label: budgetPct >= 80 ? 'Élevé' : budgetPct >= 50 ? 'Moyen' : 'Faible'
  }

  const ecart = budgetTotal - budgetDecaisse

  return (
    <Card className='relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-950/20'>
      <div className={cn('absolute inset-x-0 top-0 h-1', col.bg)} />
      <Wallet className='absolute right-3 top-4 h-16 w-16 opacity-[0.06] text-cyan-500' strokeWidth={1.5} />
      <CardContent className='pt-5 pb-4 px-5'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='rounded-full bg-cyan-100 p-1 dark:bg-cyan-900/30'>
            <Wallet className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400' />
          </div>
          <p className='text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
            Budget global du projet
          </p>
        </div>
        <div className='space-y-2.5'>
          <div className='flex items-start justify-between gap-2'>
            <span className='text-xs text-muted-foreground shrink-0'>Prévu</span>
            <span className='text-sm font-bold text-right break-all leading-tight'>
              {formatNumber(budgetTotal)}
              <span className='ml-1 text-[10px] font-normal text-muted-foreground'>GNF</span>
            </span>
          </div>
          <div className='flex items-start justify-between gap-2'>
            <span className='text-xs text-muted-foreground shrink-0'>Décaissé</span>
            <span className={cn('text-sm font-bold text-right break-all leading-tight', col.text)}>
              {formatNumber(budgetDecaisse)}
              <span className='ml-1 text-[10px] font-normal text-muted-foreground'>GNF</span>
            </span>
          </div>
          <div className='flex items-start justify-between gap-2'>
            <span className='text-xs text-muted-foreground shrink-0'>Reste à décaisser</span>
            <span className='text-sm font-bold text-right break-all leading-tight text-red-500'>
              {formatNumber(ecart)}
              <span className='ml-1 text-[10px] font-normal text-muted-foreground'>GNF</span>
            </span>
          </div>
          <div className='pt-1 space-y-1'>
            <div className='flex justify-between items-center'>
              <span className='text-[10px] text-muted-foreground'>Taux de décaissement</span>
              <span className={cn('text-xs font-bold', col.text)}>{budgetPct}%</span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div className={cn('h-full rounded-full transition-all duration-700', col.bar)} style={{ width: `${budgetPct}%` }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Card 3 : Taux exécution PTBA (Avancement) ─────────────────────────────

function TauxExecutionPtbaCard({ taux, nbrePtbaEnCours, nbrePtbaRealise, nbrePtbaEchus, selectedYear, nbPtba }: {
  taux: number; nbrePtbaEnCours: number; nbrePtbaRealise: number; nbrePtbaEchus: number; selectedYear: number; nbPtba: number;
}) {
  const col = {
    bg: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/30 dark:bg-blue-950/30 dark:text-blue-400',
    bar: 'bg-blue-500',
    label: 'Avancement'
  }

  return (
    <Card className='relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20'>
      <div className={cn('absolute inset-x-0 top-0 h-1', col.bg)} />
      <TrendingUp className='absolute right-3 top-4 h-16 w-16 opacity-[0.06] text-blue-500' strokeWidth={1.5} />
      <CardContent className='pt-5 pb-4 px-5'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='rounded-full bg-blue-100 p-1 dark:bg-blue-900/30'>
              <TrendingUp className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
            </div>
            <p className='text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
              Avancement PTBA
            </p>
          </div>
          <span className='text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
            {selectedYear}
          </span>
        </div>
        <div className='space-y-2.5'>
          <div className='flex items-end gap-2'>
            <span className={cn('text-2xl font-bold leading-none', col.text)}>{taux}%</span>
            <span className={cn('mb-0.5 inline-flex rounded-full border px-2 py-0.5 text-[8px] font-semibold', col.badge)}>
              {taux >= 80 ? 'Élevé' : taux >= 50 ? 'Moyen' : 'Faible'}
            </span>
          </div>
          <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-muted'>
            <div className={cn('h-full rounded-full transition-all duration-700', col.bar)} style={{ width: `${taux}%` }} />
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50' />
          </div>
          <div className='flex items-center justify-between pt-0.5'>
            <span className='text-xs text-muted-foreground'>{nbPtba} Activités PTBA</span>
            <span className='text-xs text-muted-foreground'>
              {taux >= 80 ? '✅ Bonne avancement' : taux >= 50 ? '⚡ En cours' : '⏳ À accélérer'}
            </span>
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <div className='relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/60 px-2 py-2 text-center dark:border-emerald-900 dark:from-emerald-950/40'>
              <p className='text-[9px] font-bold uppercase tracking-widest text-emerald-600'>Réalisés</p>
              <p className='text-xl font-black text-emerald-700 tabular-nums'>{nbrePtbaRealise}</p>
            </div>
            <div className='relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/60 px-2 py-2 text-center dark:border-blue-900 dark:from-blue-950/40'>
              <p className='text-[9px] font-bold uppercase tracking-widest text-blue-600'>En cours</p>
              <p className='text-xl font-black text-blue-700 tabular-nums'>{nbrePtbaEnCours}</p>
            </div>
            <div className='relative overflow-hidden rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-rose-100/60 px-2 py-2 text-center dark:border-rose-900 dark:from-rose-950/40'>
              <p className='text-[9px] font-bold uppercase tracking-widest text-rose-600'>Échues</p>
              <p className='text-xl font-black text-rose-700 tabular-nums'>{nbrePtbaEchus}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Card 4 : Taux décaissement PTBA ─────────────────────────────────────────

function TauxDecaissementPtbaCard({ taux, montantDecaisse, montantPrevu, selectedYear, nbPtba }: {
  taux: number; montantDecaisse: number; montantPrevu: number; selectedYear: number; nbPtba: number
}) {
  const col = {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-950/30 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    label: 'Décaissement'
  }

  return (
    <Card className='relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20'>
      <div className={cn('absolute inset-x-0 top-0 h-1', col.bg)} />
      <DollarSign className='absolute right-3 top-4 h-16 w-16 opacity-[0.06] text-emerald-500' strokeWidth={1.5} />
      <CardContent className='pt-5 pb-4 px-5'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='rounded-full bg-emerald-100 p-1 dark:bg-emerald-900/30'>
              <DollarSign className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
            </div>
            <p className='text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
              Décaissement PTBA
            </p>
          </div>
          <span className='text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
            {selectedYear}
          </span>
        </div>
        <div className='space-y-2.5'>
          <div className='flex items-end gap-2'>
            <span className={cn('text-2xl font-bold leading-none', col.text)}>{taux}%</span>
            <span className={cn('mb-0.5 inline-flex rounded-full border px-2 py-0.5 text-[8px] font-semibold', col.badge)}>
              {taux >= 80 ? 'Élevé' : taux >= 50 ? 'Moyen' : 'Faible'}
            </span>
          </div>
          <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-muted'>
            <div className={cn('h-full rounded-full transition-all duration-700', col.bar)} style={{ width: `${taux}%` }} />
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50' />
          </div>
          <div className='flex items-center justify-between pt-0.5'>
            <span className='text-xs text-muted-foreground'>{nbPtba} Activités PTBA</span>
            <span className='text-xs text-muted-foreground'>
              {taux >= 80 ? '💰 Bien décaissé' : taux >= 50 ? '💳 En cours' : '⏳ À décaisser'}
            </span>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='rounded-lg bg-emerald-50/70 px-2.5 py-1.5 dark:bg-emerald-950/20'>
              <p className='text-[9px] text-muted-foreground uppercase tracking-wide'>Prévu</p>
              <p className='text-xs font-bold break-all leading-tight text-muted-foreground'>
                {formatNumber(montantPrevu)}
                <span className='text-[9px] font-normal text-muted-foreground'> GNF</span>
              </p>
            </div>
            <div className='rounded-lg bg-emerald-50/70 px-2.5 py-1.5 dark:bg-emerald-950/20'>
              <p className='text-[9px] text-muted-foreground uppercase tracking-wide'>Décaissé</p>
              <p className={cn('text-xs font-bold break-all leading-tight', col.text)}>
                {formatNumber(montantDecaisse)}
                <span className='text-[9px] font-normal text-muted-foreground'> GNF</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Légende custom ───────────────────────────────────────────────────────────

function CustomLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className='flex items-center justify-center gap-4 pt-2'>
      {items.map((item) => (
        <div key={item.label} className='flex items-center gap-1.5'>
          <div className='h-2.5 w-2.5 rounded-sm flex-shrink-0' style={{ backgroundColor: item.color }} />
          <span className='text-xs text-muted-foreground'>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Configs graphiques ──────────────────────────────────────────────────────

const avancementChartConfig = {
  realise: { label: 'Taux Réalisé (Physique)', color: 'var(--color-chart-1)' },
  cible: { label: 'Taux Cible (Prévu)', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

const decaissementChartConfig = {
  realise: { label: 'Réalisé (GNF)', color: 'var(--color-chart-1)' },
  cible: { label: 'Prévu (GNF)', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

// ─── Graphiques ──────────────────────────────────────────────────────────────

function DecaissementComparatifCard({ data, isLoading }: {
  data: { annee: number; realise: number; cible: number; }[]; isLoading: boolean
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
          <div className='rounded-lg bg-blue-500/10 p-1.5'>
            <DollarSign className='h-4 w-4 text-blue-500' />
          </div>
          <div>
            <CardTitle className='text-sm font-semibold'>Décaissement par année</CardTitle>
            <CardDescription className='text-xs'>Montant réalisé vs prévu (GNF) — toutes années</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-5'>
        {isLoading ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>Chargement...</div>
        ) : data.length === 0 ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>Aucune donnée</div>
        ) : (
          <div className='w-full overflow-x-auto'>
            <div style={{ minWidth: '300px' }}>
              <ChartContainer config={decaissementChartConfig} className='h-[240px] w-full'>
                <BarChart accessibilityLayer data={data} margin={{ top: 28, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' className='stroke-muted/40' />
                  <XAxis dataKey='annee' tickLine={false} tickMargin={10} axisLine={false} className='fill-muted-foreground text-xs' />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={fmt} className='fill-muted-foreground text-[10px]' />
                  <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTooltipContent formatter={(v) => `${formatNumber(Number(v))} GNF`} />} />
                  <Bar dataKey='cible' fill='#FCD116' radius={[4, 4, 0, 0]}>
                    <LabelList dataKey='cible' position='top' className='fill-muted-foreground text-[9px] font-bold' formatter={(v: any) => fmt(Number(v))} />
                  </Bar>
                  <Bar dataKey='realise' fill='#10b981' radius={[4, 4, 0, 0]}>
                    <LabelList dataKey='realise' position='top' className='fill-muted-foreground text-[9px] font-bold' formatter={(v: any) => fmt(Number(v))} />
                  </Bar>
                </BarChart>
              </ChartContainer>
              <CustomLegend items={[
                { color: '#FCD116', label: 'Prévu (GNF)' },
                { color: '#10b981', label: 'Réalisé (GNF) ' },
              ]} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProjetAvancementAnnuelCard({ data, isLoading }: {
  data: { annee: number; cible: number; realise: number }[]; isLoading: boolean
}) {
  const cumulativeData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.annee - b.annee)

    let cumulCible = 0
    let cumulRealise = 0

    return sorted.map((item) => {
      cumulCible = Math.round((cumulCible + (item.cible ?? 0)) * 100) / 100
      cumulRealise = Math.round((cumulRealise + (item.realise ?? 0)) * 100) / 100
      return {
        annee: item.annee,
        cible: cumulCible,
        realise: cumulRealise,
      }
    })
  }, [data])

  return (
    <Card className='border-0 shadow-sm'>
      <CardHeader className='border-b pb-3'>
        <div className='flex items-center gap-2'>
          <div className='rounded-lg bg-emerald-500/10 p-1.5'>
            <BarChart3 className='h-4 w-4 text-emerald-600' />
          </div>
          <div>
            <CardTitle className='text-sm font-semibold'>Avancement physique par année</CardTitle>
            <CardDescription className='text-xs'>Taux réalisé vs cible (%) — cumulé</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-5'>
        {isLoading ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>Chargement...</div>
        ) : cumulativeData.length === 0 ? (
          <div className='flex h-[240px] items-center justify-center text-sm text-muted-foreground'>Aucune donnée</div>
        ) : (
          <div className='w-full overflow-x-auto'>
            <div style={{ minWidth: '300px' }}>
              <ChartContainer config={avancementChartConfig} className='h-[240px] w-full'>
                <BarChart accessibilityLayer data={cumulativeData} margin={{ top: 30, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray='3 3' className='stroke-muted/40' />
                  <XAxis dataKey='annee' tickLine={false} tickMargin={10} axisLine={false} className='fill-muted-foreground text-xs' />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v.toFixed(0)}%`} className='fill-muted-foreground text-[10px]' />
                  <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<ChartTooltipContent formatter={(v) => `${Number(v).toFixed(0)}%`} />} />
                  <Bar dataKey='cible' fill='#FCD116' radius={[4, 4, 0, 0]}>
                    <LabelList dataKey='cible' position='top' className='fill-muted-foreground text-[10px] font-bold' formatter={(v: any) => `${Number(v).toFixed(0)}%`} />
                  </Bar>
                  <Bar dataKey='realise' fill='#10b981' radius={[4, 4, 0, 0]}>
                    <LabelList dataKey='realise' position='top' className='fill-muted-foreground text-[10px] font-bold' formatter={(v: any) => `${Number(v).toFixed(0)}%`} />
                  </Bar>
                </BarChart>
              </ChartContainer>
              <CustomLegend items={[
                { color: '#FCD116', label: 'Taux Cible (Prévu)' },
                { color: '#10b981', label: 'Taux Réalisé (Physique)' },
              ]} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── BudgetDetailCard ─────────────────────────────────────────────────────────

function BudgetDetailCard({
  montantDecaisseTotal, budget_total, budgetPct, tauxDecaissement, budgetColor, decaissementColor,
}: {
  montantDecaisseTotal: number; budget_total: number; budgetPct: number
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
            <div className='rounded-lg bg-primary/10 p-1.5'><Wallet className='h-4 w-4 text-primary' /></div>
            <div>
              <CardTitle className='text-sm font-semibold'>Détail budget</CardTitle>
              <CardDescription className='text-xs'>Montants et écarts cumulés</CardDescription>
            </div>
          </div>
          <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', budgetColor.badge)}>{budgetColor.label}</span>
        </div>
      </CardHeader>
      <CardContent className='space-y-5 pt-5'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>Consommation budget</span>
            <span className={cn('text-lg font-bold', budgetColor.text)}>{budgetPct}%</span>
          </div>
          <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
            <div className={cn('h-full rounded-full transition-all duration-700', budgetColor.bar)} style={{ width: `${budgetPct}%` }} />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30'>
            <p className='mb-1 text-[10px] tracking-widest text-emerald-600 uppercase'>Décaissé</p>
            <p className='text-sm leading-tight font-bold text-emerald-700 break-all'>{formatNumber(montantDecaisseTotal)}</p>
            <p className='mt-0.5 text-[10px] text-emerald-600/70'>GNF</p>
          </div>
          <div className='rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50'>
            <p className='mb-1 text-[10px] tracking-widest text-muted-foreground uppercase'>Prévu</p>
            <p className='text-sm leading-tight font-bold break-all'>{formatNumber(budget_total)}</p>
            <p className='mt-0.5 text-[10px] text-muted-foreground/70'>GNF</p>
          </div>
          <div className='rounded-xl border border-red-100 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30'>
            <p className='mb-1 text-[10px] tracking-widest text-red-500 uppercase'>Reste à décaisser</p>
            <p className='text-sm leading-tight font-bold text-red-600 break-all'>{formatNumber(ecart)}</p>
            <p className='mt-0.5 text-[10px] text-red-500/70'>GNF</p>
          </div>
          <div className='rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30'>
            <p className='mb-1 text-[10px] tracking-widest text-amber-600 uppercase'>Reste à décaisser</p>
            <p className='text-sm leading-tight font-bold text-amber-700'>{100 - budgetPct}%</p>
            <p className='mt-0.5 text-[10px] text-amber-600/70'>du budget</p>
          </div>
        </div>
        <div className='space-y-2 border-t pt-1'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>Taux de décaissement</span>
            <span className={cn('text-lg font-bold', decaissementColor.text)}>{tauxDecaissement}%</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
            <div className={cn('h-full rounded-full transition-all duration-700', decaissementColor.bar)} style={{ width: `${tauxDecaissement}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function ProjetDashboard({ projet }: ProjetDashboardProps) {

  const codeProgramme = useActiveProgrammeCode()

  // ── Récupérer les versions PTBA ────────────────────────────────────────────
  const { versionOptions } = usePtbaVersionSelection(codeProgramme)

  // ── Années du projet (date début → date fin) ──────────────────────────────
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

  // ── Années disponibles dans les versions PTBA ──────────────────────────────
  const versionYears = useMemo(() => {
    return versionOptions
      .map((opt) => {
        const match = opt.label.match(/\d{4}/)
        return match ? Number(match[0]) : null
      })
      .filter((y): y is number => y !== null)
  }, [versionOptions])

  // ── Années disponibles (intersection entre projet et versions) ─────────────
  const availableYears = useMemo(() => {
    if (versionYears.length === 0) return projectYears

    const versionSet = new Set(versionYears)
    const intersection = projectYears.filter((y) => versionSet.has(y))

    return intersection.length > 0 ? intersection : projectYears
  }, [projectYears, versionYears])

  const defaultYear = availableYears[availableYears.length - 1] || new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(defaultYear)

  useEffect(() => {
    setSelectedYear(defaultYear)
  }, [defaultYear])

  // const { data: activites = [] } = useGetActivitesProjet(projet?.code_projet)
  const { data: ptbas = [], isLoading: isLoadingPtbas } = useGetPtbasProjet(projet?.code_projet)

  // ── Taux global (vue taux_an_activite → moyenne par projet) ──────────────
  const { data: tauxGlobalData = [] } = useGetTauxGlobalActiviteProjet(projet?.id_projet)

  const tauxExecutionGlobal = useMemo(() => {
    if (!tauxGlobalData.length) return 0
    return Math.round(tauxGlobalData.reduce((s, v) => s + (Number(v.taux_an_activite) || 0), 0) / tauxGlobalData.length)
  }, [tauxGlobalData])

  const activitesRealisees = useMemo(
    () => tauxGlobalData.filter((v) => Number(v.taux_an_activite) >= 100).length,
    [tauxGlobalData]
  )

  // ── Budget global ─────────────────────────────────────────────────────────
  const budget_total = useMemo(
    () => projet.budget_projet, [projet]
  )
  const budget_decaisse = useMemo(
    () => ptbas.reduce((s, p) => s + (Number(p.montant_decaisse_ptba) || 0), 0), [ptbas]
  )
  const budgetPct = useMemo(() => {
    const total = Number(budget_total) || 0
    const decaisse = Number(budget_decaisse) || 0
    if (total === 0) return 0
    return Math.round((decaisse / total) * 100)
  }, [budget_total, budget_decaisse])

  // ── PTBA filtrés par année sélectionnée ──────────────────────────────────
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

  const NbrePtbaEnCours = useMemo(() => {
    if (!ptbasFiltres.length) return 0
    return ptbasFiltres.filter((p) => {
      const taux = Number(p.taux_execution_ptba) || 0
      return taux >= 1 && taux < 100
    }).length
  }, [ptbasFiltres])

  const NbrePtbaRealise = useMemo(() => {
    if (!ptbasFiltres.length) return 0
    return ptbasFiltres.filter((p) => {
      const taux = Number(p.taux_execution_ptba) || 0
      return taux >= 100
    }).length
  }, [ptbasFiltres])

  const isTimestamp = (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && value > 0
  }

  const getDateFromDelais = (delais: any): Date | null => {
    if (!delais) return null
    if (isTimestamp(delais)) {
      const date = new Date(delais)
      return !isNaN(date.getTime()) ? date : null
    }
    if (typeof delais === 'string') {
      const date = new Date(delais)
      return !isNaN(date.getTime()) ? date : null
    }
    if (delais instanceof Date) {
      return !isNaN(delais.getTime()) ? delais : null
    }
    return null
  }

  const NbrePtbaEchus = useMemo(() => {
    if (!ptbasFiltres.length) return 0
    const now = new Date()
    return ptbasFiltres.filter((p) => {
      const taux = Number(p.taux_execution_ptba) || 0
      const dateFin = getDateFromDelais(p.delais)
      if (taux > 0) return false
      if (dateFin && dateFin < now) return true
      return false
    }).length
  }, [ptbasFiltres])

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
    () => ptbas.reduce((s, p) => s + (Number(p.montant_decaisse_ptba) || 0), 0),
    [ptbas]
  )
  const montantDecaisseTotalAnnuel = useMemo(
    () => ptbasFiltres.reduce((s, p) => s + (Number(p.montant_decaisse_ptba) || 0), 0),
    [ptbasFiltres]
  )

  const montantPrevuPtba = useMemo(
    () => ptbasFiltres.reduce((s, p) => s + (Number(p.cout_ptba) || 0), 0),
    [ptbasFiltres]
  )

  const tauxDecaissement = useMemo(
    () => budget_total === 0 ? 0 : Math.round((montantDecaisseTotal / (budget_total || 0)) * 100),
    [budget_total, montantDecaisseTotal]
  )

  const budgetColor = getTauxColor(budgetPct)
  const decaissementColor = getTauxColor(tauxDecaissement)

  // ── Graphiques — données filtrées sur les années du projet uniquement ─────
  const { data: avancementAnnuelRaw = [], isLoading: isLoadingAvancement } =
    useGetProjetAvancementAnnuelStats(projet?.id_projet, projectYears)
  const { data: budgetsAnnuels = [] } = useGetBudgetAnnuel(projet.id_projet)

  // Filtrer sur les années réelles du projet
  const avancementAnnuelData = useMemo(() => {
    const filtered = avancementAnnuelRaw.filter((d) => projectYears.includes(d.annee))
    const sorted = [...filtered].sort((a, b) => a.annee - b.annee)
    const currentYear = new Date().getFullYear()
    let cumulCible = 0
    let cumulRealise = 0

    return sorted.map(({ annee, cible, realise }) => {
      if (annee >= currentYear) {
        cumulCible += cible
        cumulRealise += realise
        return {
          annee,
          cible: Math.round(cumulCible * 100) / 100,
          realise: Math.round(cumulRealise * 100) / 100,
        }
      }
      return {
        annee,
        cible: Math.round(cible * 100) / 100,
        realise: Math.round(realise * 100) / 100,
      }
    })
  }, [avancementAnnuelRaw, projectYears])

  const decaissementParAnneeBrut = useMemo(
    () => buildDecaissementAnnuelFromPtbas(ptbas, budgetsAnnuels),
    [budgetsAnnuels, ptbas]
  )

  const decaissementParAnnee = useMemo(() => {
    const currentYear = new Date().getFullYear()
    let cumulCible = 0
    let cumulRealise = 0
    let lastRealise = 0
    let lastCible = 0

    // ✅ Créer un Map des données existantes par année
    const dataMap = new Map(decaissementParAnneeBrut.map(item => [item.annee, item]))

    // ✅ Parcourir toutes les années du projet
    return projectYears.map((annee) => {
      const existing = dataMap.get(annee)
      const cible = existing?.cible ?? 0
      const realise = existing?.realise ?? 0

      if (annee > currentYear) {
        cumulCible += cible
        cumulRealise += realise
        const finalRealise = cumulRealise === 0 ? lastRealise : cumulRealise
        const finalCible = cumulCible === 0 ? lastCible : cumulCible
        if (cumulRealise !== 0) lastRealise = cumulRealise
        if (cumulCible !== 0) lastCible = cumulCible
        return {
          annee,
          cible: Math.round(finalCible * 100) / 100,
          realise: Math.round(finalRealise * 100) / 100,
        }
      }
      if (realise !== 0) lastRealise = realise
      if (cible !== 0) lastCible = cible
      return {
        annee,
        cible: Math.round(cible * 100) / 100,
        realise: Math.round(realise * 100) / 100,
      }
    })
  }, [decaissementParAnneeBrut, projectYears])

  return (
    <div className='space-y-6 p-1'>
      {/* ── En-tête ── */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight text-foreground'>Tableau de bord</h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>Vue d'ensemble — avancement et finances du projet</p>
        </div>
        <div className='flex items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm'>
          <Calendar className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className='h-auto w-[110px] border-0 bg-transparent p-0 shadow-none focus:ring-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>PTBA {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <TauxGlobalCard
          taux={tauxExecutionGlobal}
          totalActivites={tauxGlobalData.length}
          activitesRealisees={activitesRealisees}
        />
        <BudgetKpiCard
          budgetTotal={budget_total || 0}
          budgetDecaisse={budget_decaisse}
          budgetPct={budgetPct}
        />
        <TauxExecutionPtbaCard
          taux={tauxRealisationMoyen}
          nbrePtbaEnCours={NbrePtbaEnCours}
          nbrePtbaRealise={NbrePtbaRealise}
          nbrePtbaEchus={NbrePtbaEchus}
          selectedYear={selectedYear}
          nbPtba={ptbasFiltres.length}
        />
        <TauxDecaissementPtbaCard
          taux={tauxDecaissementMoyen}
          montantDecaisse={montantDecaisseTotalAnnuel}
          montantPrevu={montantPrevuPtba}
          selectedYear={selectedYear}
          nbPtba={ptbasFiltres.length}
        />
      </div>

      {/* ── Graphiques comparatifs ── */}
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

      {/* ── Budget détail ── */}
      <BudgetDetailCard
        montantDecaisseTotal={montantDecaisseTotal}
        budget_total={budget_total || 0}
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