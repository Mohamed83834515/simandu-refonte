// ProjetDashboard.tsx
import { useMemo, useState } from 'react'
import {
  Activity, BarChart3, DollarSign, Wallet,
  Calendar, FileText, Gauge, Rocket,
 CheckCircle2, Clock, Circle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Projet } from '@/simadou/allTypes'
import { useGetActivitesProjet } from '@/simadou/allHooks/admin/activiteProjetHooks'
import { useGetPtbasProjet } from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { formatNumber } from '@/simadou/allSercices/montantFormater'
import { KpiIndicateurs } from './KpiIndicateurs'
import { cn } from '@/lib/utils'

interface ProjetDashboardProps { projet: Projet }

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTauxColor(taux: number) {
  if (taux >= 80) return { bg: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Bon' }
  if (taux >= 50) return { bg: 'bg-amber-500',   bar: 'bg-amber-500',   text: 'text-amber-600',   badge: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500',   label: 'Moyen' }
  if (taux >= 20) return { bg: 'bg-orange-500',  bar: 'bg-orange-500',  text: 'text-orange-600',  badge: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-500',  label: 'Faible' }
  return           { bg: 'bg-red-500',    bar: 'bg-red-500',    text: 'text-red-600',    badge: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500',     label: 'Critique' }
}

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className='relative h-2 w-full rounded-full bg-muted overflow-hidden'>
      <div
        className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function GaugeCircle({ value, size = 160, stroke = '#10B981', label = 'exécution' }: {
  value: number; size?: number; stroke?: string; label?: string
}) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  return (
    <svg width={size} height={size} viewBox='0 0 100 100'>
      <circle cx='50' cy='50' r={r} fill='transparent' stroke='currentColor' strokeWidth='7' className='text-muted/40' />
      <circle
        cx='50' cy='50' r={r} fill='transparent'
        stroke={stroke} strokeWidth='7' strokeLinecap='round'
        strokeDasharray={circ} strokeDashoffset={offset}
        transform='rotate(-90 50 50)'
        style={{ transition: 'stroke-dashoffset .8s ease' }}
      />
      <text x='50' y='45' textAnchor='middle' dominantBaseline='middle' fontSize='17' fontWeight='700' className='fill-foreground'>{value}%</text>
      <text x='50' y='59' textAnchor='middle' fontSize='6.5' className='fill-muted-foreground'>{label}</text>
    </svg>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon,
  accentClass, iconBgClass, iconColorClass,
}: {
  label: string; value: React.ReactNode; sub?: string
  icon: React.ElementType; accentClass: string; iconBgClass: string; iconColorClass: string
}) {
  return (
    <Card className={cn('border-0 shadow-sm overflow-hidden', accentClass)}>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2'>{label}</p>
            <div className='text-2xl font-bold leading-none truncate'>{value}</div>
            {sub && <p className='mt-1.5 text-xs text-muted-foreground truncate'>{sub}</p>}
          </div>
          <div className={cn('rounded-xl p-2.5 flex-shrink-0', iconBgClass)}>
            <Icon className={cn('h-5 w-5', iconColorClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetDetailCard({
  montantDecaisseTotal, budget_total, budgetPct,
  tauxDecaissement, budgetColor, decaissementColor,
}: {
  montantDecaisseTotal: number; budget_total: number; budgetPct: number
  tauxDecaissement: number; budgetColor: ReturnType<typeof getTauxColor>; decaissementColor: ReturnType<typeof getTauxColor>
}) {
  const ecart = budget_total - montantDecaisseTotal
  return (
    <Card className='shadow-sm border-0 bg-gradient-to-br from-background to-muted/20'>
      <CardHeader className='pb-3 border-b'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='rounded-lg bg-primary/10 p-1.5'>
              <Wallet className='h-4 w-4 text-primary' />
            </div>
            <div>
              <CardTitle className='text-sm font-semibold'>Détail budget</CardTitle>
              <CardDescription className='text-xs'>Montants et écarts cumulés</CardDescription>
            </div>
          </div>
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', budgetColor.badge)}>
            {budgetColor.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className='pt-5 space-y-5'>

        {/* Taux de consommation */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Consommation budget</span>
            <span className={cn('text-lg font-bold', budgetColor.text)}>{budgetPct}%</span>
          </div>
          <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
            <div className={cn('h-full rounded-full transition-all duration-700', budgetColor.bar)} style={{ width: `${budgetPct}%` }} />
          </div>
        </div>

        {/* Grille montants */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 border border-emerald-100 dark:border-emerald-900'>
            <p className='text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1'>Décaissé</p>
            <p className='text-sm font-bold text-emerald-700 dark:text-emerald-300 leading-tight'>{formatNumber(montantDecaisseTotal)}</p>
            <p className='text-[10px] text-emerald-600/70 mt-0.5'>GNF</p>
          </div>
          <div className='rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 border border-slate-100 dark:border-slate-800'>
            <p className='text-[10px] uppercase tracking-widest text-muted-foreground mb-1'>Prévu</p>
            <p className='text-sm font-bold leading-tight'>{formatNumber(budget_total)}</p>
            <p className='text-[10px] text-muted-foreground/70 mt-0.5'>GNF</p>
          </div>
          <div className='rounded-xl bg-red-50 dark:bg-red-950/30 p-3 border border-red-100 dark:border-red-900'>
            <p className='text-[10px] uppercase tracking-widest text-red-500 mb-1'>Écart</p>
            <p className='text-sm font-bold text-red-600 dark:text-red-400 leading-tight'>{formatNumber(ecart)}</p>
            <p className='text-[10px] text-red-500/70 mt-0.5'>GNF</p>
          </div>
          <div className='rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-100 dark:border-amber-900'>
            <p className='text-[10px] uppercase tracking-widest text-amber-600 mb-1'>Reste à décaisser</p>
            <p className='text-sm font-bold text-amber-700 dark:text-amber-400 leading-tight'>{100 - budgetPct}%</p>
            <p className='text-[10px] text-amber-600/70 mt-0.5'>du budget</p>
          </div>
        </div>

        {/* Taux de décaissement */}
        <div className='space-y-2 pt-1 border-t'>
          <div className='flex justify-between items-center'>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Taux de décaissement</span>
            <span className={cn('text-lg font-bold', decaissementColor.text)}>{tauxDecaissement}%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
            <div className={cn('h-full rounded-full transition-all duration-700', decaissementColor.bar)} style={{ width: `${tauxDecaissement}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BarChartCard({
  data, maxVal, selectedYear, onSelectYear,
}: {
  data: { annee: number; taux: number; total: number }[]
  maxVal: number; selectedYear: number; onSelectYear: (y: number) => void
}) {
  return (
    <Card className='shadow-sm border-0'>
      <CardHeader className='pb-3 border-b'>
        <div className='flex items-center gap-2'>
          <div className='rounded-lg bg-primary/10 p-1.5'>
            <BarChart3 className='h-4 w-4 text-primary' />
          </div>
          <div>
            <CardTitle className='text-sm font-semibold'>Décaissement par année</CardTitle>
            <CardDescription className='text-xs'>Taux annuel — cliquez pour filtrer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-5'>
        <div className='flex items-end justify-around gap-2 h-52'>
          {data.map((item) => {
            const h = maxVal > 0 ? (item.taux / maxVal) * 160 : 0
            const col = getTauxColor(item.taux)
            const isSel = item.annee === selectedYear
            return (
              <button
                key={item.annee}
                onClick={() => onSelectYear(item.annee)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 flex-1 transition-all duration-200 rounded-lg p-1.5',
                  isSel ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'
                )}
              >
                {/* Valeur */}
                <span className={cn('text-[11px] font-bold transition-colors', col.text)}>
                  {item.taux > 0 ? `${item.taux}%` : '—'}
                </span>
                {/* Barre */}
                <div className='relative w-full flex justify-center'>
                  <div
                    className={cn('w-10 rounded-t-md transition-all duration-500', col.bg, isSel && 'ring-2 ring-offset-1 ring-primary/30')}
                    style={{ height: `${Math.max(h, 6)}px`, minHeight: '6px' }}
                  />
                </div>
                {/* Année */}
                <span className={cn('text-[11px] font-semibold', isSel ? 'text-primary' : 'text-muted-foreground')}>
                  {item.annee}
                </span>
                <span className='text-[9px] text-muted-foreground/70'>{item.total} PTBA</span>
              </button>
            )
          })}
        </div>
        {/* Légende */}
        <div className='mt-4 pt-3 border-t flex flex-wrap gap-3 justify-center'>
          {[['bg-emerald-500','≥ 80%'],['bg-amber-500','50–79%'],['bg-orange-500','20–49%'],['bg-red-500','< 20%']].map(([c,l])=>(
            <div key={l} className='flex items-center gap-1.5'>
              <div className={cn('h-2.5 w-2.5 rounded-sm', c)} />
              <span className='text-[10px] text-muted-foreground'>{l}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PtbaExecutionCard({
  data, globalTaux, activitesRealisees, totalPtbas,
}: {
  data: {
    annee: number; taux: number; totalActivites: number; terminees: number
    col: { bg: string; badge: string }; Icon: React.ElementType; iconColor: string
    hasActivites: boolean; budgetPrevu: number; budgetExecute: number
  }[]
  globalTaux: number; activitesRealisees: number; totalPtbas: number
}) {
  const strokeColor = globalTaux >= 80 ? '#10B981' : globalTaux >= 50 ? '#F59E0B' : globalTaux >= 20 ? '#F97316' : '#EF4444'
  return (
    <Card className='shadow-sm border-0'>
      <CardHeader className='pb-3 border-b'>
        <div className='flex items-center gap-2'>
          <div className='rounded-lg bg-primary/10 p-1.5'>
            <Rocket className='h-4 w-4 text-primary' />
          </div>
          <div>
            <CardTitle className='text-sm font-semibold'>Exécution globale & par PTBA</CardTitle>
            <CardDescription className='text-xs'>Taux de réalisation physique</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-5'>
        <div className='flex gap-5 items-start'>
          {/* Jauge */}
          <div className='flex flex-col items-center gap-1 flex-shrink-0'>
            <GaugeCircle value={globalTaux} size={130} stroke={strokeColor} label='global' />
            <p className='text-[10px] text-muted-foreground text-center'>
              {activitesRealisees}/{totalPtbas} réalisées
            </p>
          </div>
          {/* Liste PTBA */}
          <div className='flex-1 space-y-3 min-w-0'>
            {data.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>Aucune donnée disponible</p>
            ) : data.map((ptba) => {
              const inactive = !ptba.hasActivites
              const taux = inactive ? 0 : ptba.taux
              return (
                <div key={ptba.annee} className={cn('space-y-1.5', inactive && 'opacity-50')}>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-1.5 min-w-0'>
                      <ptba.Icon className={cn('h-3.5 w-3.5 flex-shrink-0', ptba.iconColor)} />
                      <span className='text-sm font-semibold truncate'>PTBA {ptba.annee}</span>
                      {inactive && <span className='text-[10px] text-muted-foreground'>(vide)</span>}
                    </div>
                    <div className='flex items-center gap-1.5 flex-shrink-0'>
                      <span className='text-[10px] text-muted-foreground'>{inactive ? '0' : ptba.terminees}/{inactive ? '0' : ptba.totalActivites}</span>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', ptba.col.badge)}>{taux}%</span>
                    </div>
                  </div>
                  <StatBar value={taux} max={100} color={ptba.col.bg} />
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function ProjetDashboard({ projet }: ProjetDashboardProps) {

  const projectYears = useMemo(() => {
    if (!projet?.date_demarrage_projet || !projet?.duree_projet) return [new Date().getFullYear()]
    const start = new Date(projet.date_demarrage_projet)
    const startYear = start.getFullYear()
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + projet.duree_projet)
    const endYear = endDate.getFullYear()
    const years: number[] = []
    for (let y = startYear; y <= endYear; y++) years.push(y)
    return years
  }, [projet])

  const defaultYear = projectYears[projectYears.length - 1] || new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(defaultYear)

  const { data: activites = [] } = useGetActivitesProjet(projet?.code_projet)
  const { data: ptbas = [] } = useGetPtbasProjet(projet?.code_projet)

  const budget_total = useMemo(() =>
    activites.reduce((s, a) => s + (Number(a.budget) || 0), 0), [activites])

  const budget_decaisse = useMemo(() =>
    ptbas.reduce((s, p) => s + (Number(p.montant_decaisse_ptba) || 0), 0), [ptbas])

  const ptbasFiltres = useMemo(() =>
    ptbas.filter(p => p.version_info?.annee_ptba === selectedYear), [ptbas, selectedYear])

  const tauxRealisationMoyen = useMemo(() => {
    if (!ptbasFiltres.length) return 0
    return Math.round(ptbasFiltres.reduce((s, p) => s + (Number(p.taux_execution_ptba) || 0), 0) / ptbasFiltres.length)
  }, [ptbasFiltres])

  const tauxExecutionGlobale = useMemo(() => {
    if (!ptbas.length) return 0
    return Math.round(ptbas.reduce((s, p) => s + (Number(p.taux_execution_ptba) || 0), 0) / ptbas.length)
  }, [ptbas])

  const activitesRealisees = useMemo(() =>
    ptbas.filter(p => Number(p.taux_execution_ptba) >= 100).length, [ptbas])

  const tauxDecaissementMoyen = useMemo(() => {
    if (!ptbasFiltres.length) return 0
    return Math.round(ptbasFiltres.reduce((s, p) => s + (Number(p.taux_decaissement_ptba) || 0), 0) / ptbasFiltres.length)
  }, [ptbasFiltres])

  const montantDecaisseTotal = useMemo(() =>
    ptbasFiltres.reduce((s, p) => s + (Number(p.montant_decaisse_ptba) || 0), 0), [ptbasFiltres])

  const budgetPct = useMemo(() =>
    budget_total === 0 ? 0 : Math.round((budget_decaisse / budget_total) * 100), [budget_total, budget_decaisse])

  const tauxDecaissement = useMemo(() =>
    budget_total === 0 ? 0 : Math.round((montantDecaisseTotal / budget_total) * 100), [budget_total, montantDecaisseTotal])

  const budgetColor = getTauxColor(budgetPct)
  const decaissementColor = getTauxColor(tauxDecaissement)

  const decaissementParAnnee = useMemo(() => {
    const grouped = ptbas.reduce((acc, ptba) => {
      const annee = ptba.version_info?.annee_ptba
      if (!annee) return acc
      if (!acc[annee]) acc[annee] = []
      acc[annee].push(ptba)
      return acc
    }, {} as Record<number, typeof ptbas>)

    return projectYears
      .filter(y => y <= Math.max(...Object.keys(grouped).map(Number), projectYears[0]))
      .map(annee => {
        const items = grouped[annee] || []
        if (!items.length) return { annee, taux: 0, total: 0 }
        const tauxMoyen = Math.round(items.reduce((s, p) => s + (Number(p.taux_decaissement_ptba) || 0), 0) / items.length)
        return { annee, taux: tauxMoyen, total: items.length }
      })
  }, [ptbas, projectYears])

  const maxDecaissement = Math.max(...decaissementParAnnee.map(d => d.taux), 1)

  const yearsToShow = useMemo(() => {
    const anneesAvecPtbas = ptbas
      .map(p => p.version_info?.annee_ptba)
      .filter((a): a is number => a !== undefined && !isNaN(a))
    if (!anneesAvecPtbas.length) return [projectYears[0] || new Date().getFullYear()]
    const anneeMax = Math.max(...anneesAvecPtbas)
    return projectYears.filter(y => y <= anneeMax)
  }, [ptbas, projectYears])

  const ptbaExecutionData = useMemo(() => {
    const grouped = ptbas.reduce((acc, ptba) => {
      const annee = ptba.version_info?.annee_ptba
      if (!annee) return acc
      if (!acc[annee]) acc[annee] = []
      acc[annee].push(ptba)
      return acc
    }, {} as Record<number, typeof ptbas>)

    return yearsToShow.map(year => {
      const items = grouped[year] || []
      const totalActivites = items.length
      const terminees = items.filter(p => Number(p.taux_execution_ptba) >= 100).length
      const tauxMoyen = totalActivites > 0
        ? Math.round(items.reduce((s, p) => s + (Number(p.taux_execution_ptba) || 0), 0) / totalActivites)
        : 0

      const getColor = (t: number) => {
        if (t >= 80) return { bg: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
        if (t >= 50) return { bg: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 border border-amber-200' }
        if (t === 0 && totalActivites === 0) return { bg: 'bg-gray-300', badge: 'bg-gray-50 text-gray-400 border border-gray-200' }
        return           { bg: 'bg-red-400',    badge: 'bg-red-50 text-red-700 border border-red-200' }
      }

      let Icon: React.ElementType = Circle
      let iconColor = 'text-gray-400'
      if (totalActivites === 0) { Icon = Circle; iconColor = 'text-gray-300' }
      else if (tauxMoyen >= 80) { Icon = CheckCircle2; iconColor = 'text-emerald-500' }
      else if (tauxMoyen >= 40) { Icon = Clock; iconColor = 'text-amber-500' }
      else { Icon = Circle; iconColor = 'text-red-400' }

      return {
        annee: year, taux: tauxMoyen, totalActivites, terminees,
        col: getColor(tauxMoyen), Icon, iconColor,
        hasActivites: totalActivites > 0,
        budgetPrevu: items.reduce((s, p) => s + (Number(p.cout_ptba) || 0), 0),
        budgetExecute: items.reduce((s, p) => s + (Number(p.montant_decaisse_ptba) || 0), 0),
      }
    })
  }, [ptbas, yearsToShow])

  return (
    <div className='space-y-6 p-1'>

      {/* ── En-tête ── */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight text-foreground'>
            Tableau de bord
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>Vue d'ensemble — avancement et finances du projet</p>
        </div>
        <div className='flex items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm'>
          <Calendar className='h-4 w-4 text-muted-foreground flex-shrink-0' />
          <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className='w-[110px] border-0 bg-transparent h-auto p-0 shadow-none focus:ring-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectYears.map(y => (
                <SelectItem key={y} value={String(y)}>PTBA {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className='grid gap-3 grid-cols-2 lg:grid-cols-5'>
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
          value={<span className='text-lg'>{formatNumber(budget_total)}<span className='text-xs ml-1 font-normal text-muted-foreground'>GNF</span></span>}
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
            <span className={getTauxColor(tauxRealisationMoyen).text}>{tauxRealisationMoyen}%</span>
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
            <span className={getTauxColor(tauxDecaissementMoyen).text}>{tauxDecaissementMoyen}%</span>
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
        <PtbaExecutionCard
          data={ptbaExecutionData}
          globalTaux={tauxExecutionGlobale}
          activitesRealisees={activitesRealisees}
          totalPtbas={ptbas.length}
        />
        <BarChartCard
          data={decaissementParAnnee}
          maxVal={maxDecaissement}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
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