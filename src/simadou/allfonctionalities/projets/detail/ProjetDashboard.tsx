// ProjetDashboard.tsx
import { useState } from 'react'
import {
  Activity, BarChart3, DollarSign, Wallet,
  Calendar, FileText, Gauge, Rocket, Shield,
  TrendingUp, CheckCircle2, Clock, Circle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

interface ProjetDashboardProps { codeProjet: string }

const DEMO_DATA = {
  ptbaExecution: [
    { id: 1, annee: 2024, totalActivites: 18, terminees: 16, taux: 89 },
    { id: 2, annee: 2025, totalActivites: 22, terminees: 17, taux: 77 },
    { id: 3, annee: 2026, totalActivites: 20, terminees: 11, taux: 55 },
    { id: 4, annee: 2027, totalActivites: 15, terminees: 4, taux: 27 },
  ],
  budgetParAnnee: [
    { annee: 2024, prevu: 250, execute: 223 },
    { annee: 2025, prevu: 320, execute: 247 },
    { annee: 2026, prevu: 280, execute: 154 },
    { annee: 2027, prevu: 200, execute: 48 },
  ],
  decaissementParAnnee: [
    { annee: 2024, taux: 89 },
    { annee: 2025, taux: 77 },
    { annee: 2026, taux: 55 },
    { annee: 2027, taux: 24 },
  ],
  kpiIndicateurs: [
    { id: 1, label: 'Ménages sensibilisés', current: 3240, target: 5000, unit: 'ménages' },
    { id: 2, label: 'Km de pistes rurales', current: 78, target: 120, unit: 'km' },
    { id: 3, label: 'Formations réalisées', current: 18, target: 24, unit: 'formations' },
    { id: 4, label: "Points d'eau construits", current: 12, target: 20, unit: 'points' },
    { id: 5, label: 'Ha reboisés', current: 450, target: 1000, unit: 'ha' },
    { id: 6, label: 'Emplois créés', current: 156, target: 300, unit: 'emplois' },
  ],
  stats: {
    totalActivites: 75, activitesTerminees: 48,
    tauxExecution: 64, budgetTotal: 1_250_000_000,
    budgetConsomme: 672_000_000, tauxDecaissement: 54, totalPtbas: 4,
  },
}

const c = (taux: number) => {
  if (taux >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' }
  if (taux >= 60) return { text: 'text-blue-600', bg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' }
  if (taux >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' }
  return { text: 'text-red-600', bg: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' }
}

const fmt = (n: number) =>
  n >= 1_000_000_000 ? `${(n / 1_000_000_000).toFixed(2)} Md` : `${(n / 1_000_000).toFixed(0)} M`

const PtbaYear = ({ annee }: { annee: number }) => (
  <span>PTBA <span className='text-primary font-bold'>{annee}</span></span>
)

export default function ProjetDashboard({ codeProjet: _ }: ProjetDashboardProps) {
  const [selectedYear, setSelectedYear] = useState(2026)
  const maxBudget = Math.max(...DEMO_DATA.budgetParAnnee.map((d) => d.prevu))
  const maxDecaissement = Math.max(...DEMO_DATA.decaissementParAnnee.map((d) => d.taux))
  const sel = DEMO_DATA.budgetParAnnee.find((d) => d.annee === selectedYear)
  const budgetPct = sel ? Math.round((sel.execute / sel.prevu) * 100) : 0

  return (
    <div className='space-y-6 p-2'>

      {/* En-tête */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            Tableau de bord
          </h2>
          <p className='text-sm text-muted-foreground'>Vue d'ensemble de l'avancement du projet</p>
        </div>
        <div className='flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5'>
          <Calendar className='h-4 w-4 text-muted-foreground' />
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className='w-[130px] border-0 bg-transparent'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEMO_DATA.budgetParAnnee.map((d) => (
                <SelectItem key={d.annee} value={String(d.annee)}>{d.annee}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* ══ 2. CARTES KPI GLOBAUX (avec Budget total projet remonté) ══ */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        <Card className='border-l-4 border-l-blue-500'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>Activités</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.totalActivites}</p>
                <p className='text-xs text-muted-foreground'>{DEMO_DATA.stats.activitesTerminees} terminées</p>
              </div>
              <div className='rounded-full bg-blue-500/10 p-3'><Activity className='h-5 w-5 text-blue-500' /></div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-emerald-500'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>PTBA</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.totalPtbas}</p>
                <p className='text-xs text-muted-foreground'>plans annuels</p>
              </div>
              <div className='rounded-full bg-emerald-500/10 p-3'><FileText className='h-5 w-5 text-emerald-500' /></div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-amber-500'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>Exécution</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.tauxExecution}%</p>
                <Progress value={DEMO_DATA.stats.tauxExecution} className='mt-1 h-1.5' />
              </div>
              <div className='rounded-full bg-amber-500/10 p-3'><Gauge className='h-5 w-5 text-amber-500' /></div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-green-600'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>Décaissement</p>
                <p className='mt-2 text-2xl font-bold'>{DEMO_DATA.stats.tauxDecaissement}%</p>
                <Progress value={DEMO_DATA.stats.tauxDecaissement} className='mt-1 h-1.5' />
              </div>
              <div className='rounded-full bg-green-600/10 p-3'><DollarSign className='h-5 w-5 text-green-600' /></div>
            </div>
          </CardContent>
        </Card>

        {/* Budget total projet - remonté ici */}
        <Card className='border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase text-muted-foreground'>Budget total</p>
                <p className='mt-2 text-xl font-bold text-purple-700 dark:text-purple-400'>{fmt(DEMO_DATA.stats.budgetTotal)} GNF</p>
                <p className='text-xs text-muted-foreground'>{fmt(DEMO_DATA.stats.budgetConsomme)} consommé</p>
              </div>
              <div className='rounded-full bg-purple-500/20 p-3'><Wallet className='h-5 w-5 text-purple-600' /></div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ══ 7. SYNTHÈSE PERFORMANCE ══ */}
      {/* <div className='grid gap-4 sm:grid-cols-2'>
        <Card className='bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20'>
          <CardContent className='p-4 flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-blue-700 dark:text-blue-400'>Budget total projet</p>
              <p className='text-2xl font-bold text-blue-800 dark:text-blue-300'>{fmt(DEMO_DATA.stats.budgetTotal)} GNF</p>
              <p className='text-xs text-muted-foreground mt-1'>{fmt(DEMO_DATA.stats.budgetConsomme)} consommé</p>
            </div>
            <div className='rounded-full bg-blue-500/20 p-3'><Wallet className='h-6 w-6 text-blue-600' /></div>
          </CardContent>
        </Card>
        <Card className='bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20'>
          <CardContent className='p-4 flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-green-700 dark:text-green-400'>Performance globale</p>
              <p className='text-2xl font-bold text-green-800 dark:text-green-300'>{DEMO_DATA.stats.tauxExecution}% exécution</p>
              <p className='text-xs text-muted-foreground mt-1'>{DEMO_DATA.stats.tauxDecaissement}% décaissement</p>
            </div>
            <div className='rounded-full bg-green-500/20 p-3'><Zap className='h-6 w-6 text-green-600' /></div>
          </CardContent>
        </Card>
      </div> */}


      {/* ══ 3. JAUGE GLOBALE + EXÉCUTION PAR PTBA ══ */}
      <div className='grid gap-6 lg:grid-cols-2'>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Rocket className='h-4 w-4 text-primary' />
              Taux d'exécution global
            </CardTitle>
            <CardDescription>Progression cumulée de toutes les activités</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center'>
            <div className='relative w-44 h-44'>
              <svg className='w-full h-full' viewBox='0 0 100 100'>
                <circle cx='50' cy='50' r='40' fill='transparent' stroke='currentColor'
                  strokeWidth='8' className='text-muted-foreground/20' />
                <circle cx='50' cy='50' r='40' fill='transparent' stroke='#10B981'
                  strokeWidth='8' strokeLinecap='round'
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - DEMO_DATA.stats.tauxExecution / 100)}
                  transform='rotate(-90 50 50)' />
                <text x='50' y='46' textAnchor='middle' dominantBaseline='middle'
                  fontSize='18' fontWeight='bold' className='fill-foreground'>
                  {DEMO_DATA.stats.tauxExecution}%
                </text>
                <text x='50' y='60' textAnchor='middle' fontSize='7' className='fill-muted-foreground'>
                  exécution
                </text>
              </svg>
            </div>
            <p className='mt-3 text-sm text-muted-foreground'>
              {DEMO_DATA.stats.activitesTerminees} / {DEMO_DATA.stats.totalActivites} activités réalisées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <TrendingUp className='h-4 w-4 text-primary' />
              Exécution par PTBA
            </CardTitle>
            <CardDescription>Taux de réalisation par plan annuel</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {DEMO_DATA.ptbaExecution.map((ptba) => {
              const col = c(ptba.taux)
              const Icon = ptba.taux >= 80 ? CheckCircle2 : ptba.taux >= 40 ? Clock : Circle
              const iconColor = ptba.taux >= 80 ? 'text-emerald-500' : ptba.taux >= 40 ? 'text-amber-500' : 'text-red-400'
              return (
                <div key={ptba.id}>
                  <div className='flex items-center justify-between mb-1.5'>
                    <div className='flex items-center gap-1.5 text-sm'>
                      <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                      <PtbaYear annee={ptba.annee} />
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-muted-foreground'>
                        {ptba.terminees}/{ptba.totalActivites} activités
                      </span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>
                        {ptba.taux}%
                      </span>
                    </div>
                  </div>
                  <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
                    <div className={`h-full rounded-full ${col.bg} transition-all duration-700`}
                      style={{ width: `${ptba.taux}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* ══ 4. HISTOGRAMME DÉCAISSEMENT PAR ANNÉE ══ */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <BarChart3 className='h-4 w-4 text-primary' />
            Taux de décaissement par année
          </CardTitle>
          <CardDescription>Évolution du taux de décaissement annuel (%)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-end justify-between gap-4 h-64 px-4'>
            {DEMO_DATA.decaissementParAnnee.map((item) => {
              const height = (item.taux / maxDecaissement) * 180
              const col = c(item.taux)
              return (
                <div key={item.annee} className='flex-1 flex flex-col items-center gap-2 group'>
                  <div className='relative w-full flex justify-center'>
                    <div className='flex flex-col items-center'>
                      <div className='text-[10px] font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        {item.taux}%
                      </div>
                      <div
                        className={`w-12 rounded-t-lg ${col.bg} transition-all duration-500 hover:opacity-80 cursor-pointer`}
                        style={{ height: `${height}px`, minHeight: '4px' }}
                      />
                    </div>
                  </div>
                  <div className='text-center mt-2'>
                    <p className='text-sm font-semibold'>{item.annee}</p>
                    <div className='mt-1'>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                        {item.taux}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className='mt-6 pt-3 border-t flex justify-center gap-8'>
            <div className='flex items-center gap-2'>
              <div className='h-2.5 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-red-500' />
              <span className='text-xs text-muted-foreground'>Taux de décaissement</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══ 5. BUDGET — PTBA sélectionné (graphique + détail côte à côte) ══ */}
      <div className='grid gap-6 lg:grid-cols-2'>

        {/* Partie gauche : Graphique à barres */}
        <Card className='shadow-sm overflow-hidden'>
          <CardHeader className='pb-2 border-b bg-muted/20'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
              <BarChart3 className='h-4 w-4 text-primary' />
              Budget — <PtbaYear annee={selectedYear} />
            </CardTitle>
            <CardDescription>Cliquez sur un PTBA pour voir le détail · Millions GNF</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='flex items-end gap-4 justify-center px-2' style={{ height: 220 }}>
              {DEMO_DATA.budgetParAnnee.map((item) => {
                const prevuH = Math.round((item.prevu / maxBudget) * 170)
                const execH = Math.round((item.execute / maxBudget) * 170)
                const pct = Math.round((item.execute / item.prevu) * 100)
                const col = c(pct)
                const isSel = item.annee === selectedYear
                return (
                  <button
                    key={item.annee}
                    onClick={() => setSelectedYear(item.annee)}
                    className={`flex flex-col items-center gap-2 transition-all duration-200 ${isSel ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-85'
                      }`}
                  >
                    <div className='flex items-end gap-1.5' style={{ height: 180 }}>
                      <div className='flex flex-col items-center'>
                        <span className='text-[8px] text-blue-500 font-semibold mb-0.5'>{item.prevu}M</span>
                        <div
                          className={`w-8 rounded-t-md transition-all duration-300 ${isSel ? 'bg-blue-500/80 shadow-md' : 'bg-blue-400/40'
                            } border border-blue-300/50`}
                          style={{ height: prevuH }}
                        />
                        <span className='text-[8px] text-muted-foreground mt-1'>prévu</span>
                      </div>
                      <div className='flex flex-col items-center'>
                        <span className={`text-[8px] font-semibold mb-0.5 ${col.text}`}>{item.execute}M</span>
                        <div
                          className={`w-8 rounded-t-md ${col.bg} transition-all duration-300 ${isSel ? 'shadow-md' : ''
                            }`}
                          style={{ height: execH }}
                        />
                        <span className='text-[8px] text-muted-foreground mt-1'>exécuté</span>
                      </div>
                    </div>
                    <div className='text-center'>
                      <span className='text-xs font-medium'>
                        PTBA <span className={`font-bold ${isSel ? 'text-primary' : ''}`}>{item.annee}</span>
                      </span>
                      <div className='mt-0.5'>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className='mt-4 pt-3 border-t flex justify-center gap-6'>
              <div className='flex items-center gap-2'>
                <div className='h-2.5 w-6 rounded-full bg-blue-400/50 border border-blue-300' />
                <span className='text-xs text-muted-foreground'>Prévu</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-2.5 w-6 rounded-full bg-emerald-500' />
                <span className='text-xs text-muted-foreground'>Exécuté</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partie droite : Détail budget année sélectionnée */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2 border-b bg-muted/20'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
              <Wallet className='h-4 w-4 text-primary' />
              Détail budget <PtbaYear annee={selectedYear} />
            </CardTitle>
            <CardDescription>Récapitulatif des montants et écarts</CardDescription>
          </CardHeader>
          <CardContent className='pt-6 space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Taux de consommation</span>
              <span className={`text-xl font-bold ${c(budgetPct).text}`}>{budgetPct}%</span>
            </div>
            <div className='h-2.5 w-full rounded-full bg-muted overflow-hidden'>
              <div className={`h-full rounded-full ${c(budgetPct).bg} transition-all duration-700`}
                style={{ width: `${budgetPct}%` }} />
            </div>
            <div className='rounded-lg bg-muted/30 p-4 space-y-3'>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='text-sm text-muted-foreground'>Décaissé</span>
                <span className='text-lg font-bold text-emerald-600'>{sel?.execute.toLocaleString('fr-FR')} M GNF</span>
              </div>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='text-sm text-muted-foreground'>Prévu</span>
                <span className='text-lg font-bold'>{sel?.prevu.toLocaleString('fr-FR')} M GNF</span>
              </div>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='text-sm text-muted-foreground'>Écart</span>
                <span className='text-lg font-bold text-red-500'>
                  {sel ? (sel.prevu - sel.execute).toLocaleString('fr-FR') : 0} M GNF
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Reste à décaisser</span>
                <span className='text-lg font-bold text-amber-600'>{100 - budgetPct}%</span>
              </div>
            </div>
            <div className='text-center text-xs text-muted-foreground pt-2'>
              Cliquez sur une année dans le graphique pour changer la vue
            </div>
          </CardContent>
        </Card>

      </div>


      {/* ══ 1. INDICATEURS CLÉS (KPI) ══ */}
      <div>
        <div className='mb-3 flex items-center gap-2'>
          <Shield className='h-4 w-4 text-primary' />
          <h3 className='text-sm font-semibold'>Indicateurs clés de performance</h3>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {DEMO_DATA.kpiIndicateurs.map((ind) => {
            const pct = Math.min(Math.round((ind.current / ind.target) * 100), 100)
            const col = c(pct)
            return (
              <Card key={ind.id} className='border-0 shadow-sm bg-muted/30'>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between mb-2'>
                    <p className='text-xs font-semibold uppercase text-muted-foreground leading-tight max-w-[160px]'>
                      {ind.label}
                    </p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>{pct}%</span>
                  </div>
                  <div className='flex items-baseline gap-1 mb-2'>
                    <span className='text-xl font-bold'>{ind.current.toLocaleString('fr-FR')}</span>
                    <span className='text-xs text-muted-foreground'>/ {ind.target.toLocaleString('fr-FR')} {ind.unit}</span>
                  </div>
                  <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                    <div className={`h-full rounded-full ${col.bg} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

    </div>
  )
}