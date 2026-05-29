import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ProjetMiniProgress from './ProjetMiniProgress'

/** Données de démonstration — brancher l’API plus tard (branche amadou). */
const DEMO = {
  totalActivites: 48,
  activitesTerminees: 32,
  tauxExecution: 67,
  tauxDecaissement: 54,
  budgetConsomme: 1_250_000_000,
  budgetTotal: 2_500_000_000,
  recommandationsOuvertes: 5,
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
}) {
  return (
    <Card>
      <CardContent className='flex items-start justify-between gap-3 p-4'>
        <div>
          <p className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
            {title}
          </p>
          <p className='mt-1 text-2xl font-extrabold tabular-nums'>{value}</p>
          {subtitle && (
            <p className='mt-0.5 text-[11px] text-muted-foreground'>{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className='h-5 w-5 text-primary-foreground' />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjetDashboard() {
  const budgetPct = Math.round(
    (DEMO.budgetConsomme / DEMO.budgetTotal) * 100
  )

  return (
    <div className='space-y-4'>
      <p className='text-xs text-muted-foreground'>
        Indicateurs illustratifs — connexion API à venir.
      </p>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          title='Activités'
          value={DEMO.totalActivites}
          subtitle={`${DEMO.activitesTerminees} terminées`}
          icon={Activity}
          iconClassName='bg-blue-500'
        />
        <StatCard
          title='Exécution physique'
          value={`${DEMO.tauxExecution}%`}
          icon={TrendingUp}
          iconClassName='bg-emerald-500'
        />
        <StatCard
          title='Décaissement'
          value={`${DEMO.tauxDecaissement}%`}
          icon={DollarSign}
          iconClassName='bg-green-600'
        />
        <StatCard
          title='Recommandations'
          value={DEMO.recommandationsOuvertes}
          subtitle='ouvertes'
          icon={AlertTriangle}
          iconClassName='bg-amber-500'
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <BarChart3 className='h-4 w-4 text-primary' />
              Avancement PTBA par année
            </CardTitle>
            <CardDescription>Millions XOF (démo)</CardDescription>
          </CardHeader>
          <CardContent className='flex h-40 items-end justify-between gap-3'>
            {[
              { year: '2022', prevu: 85, execute: 62 },
              { year: '2023', prevu: 100, execute: 78 },
              { year: '2024', prevu: 95, execute: 88 },
              { year: '2025', prevu: 110, execute: 45 },
            ].map((item) => (
              <div
                key={item.year}
                className='flex flex-1 flex-col items-center gap-1'
              >
                <div className='flex h-28 w-full items-end gap-1'>
                  <div
                    className='flex-1 rounded-t bg-blue-400/80'
                    style={{ height: `${item.prevu}%` }}
                  />
                  <div
                    className='flex-1 rounded-t bg-green-400/80'
                    style={{ height: `${item.execute}%` }}
                  />
                </div>
                <span className='text-[10px] font-bold text-muted-foreground'>
                  {item.year}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Target className='h-4 w-4 text-primary' />
              Budget consommé
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Consommé</span>
              <span className='font-semibold tabular-nums'>{budgetPct}%</span>
            </div>
            <ProjetMiniProgress value={budgetPct} colorClassName='bg-green-500' />
            <p className='text-xs text-muted-foreground'>
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(DEMO.budgetConsomme)}{' '}
              /{' '}
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(DEMO.budgetTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        {[
          { label: 'Ménages sensibilisés', target: 5000, current: 3200, unit: '' },
          { label: 'Km de pistes', target: 120, current: 78, unit: 'km' },
          { label: 'Formations réalisées', target: 24, current: 18, unit: '' },
        ].map((ind) => {
          const pct =
            ind.target > 0 ? Math.round((ind.current / ind.target) * 100) : 0
          return (
            <Card key={ind.label}>
              <CardContent className='space-y-2 p-4'>
                <div className='flex justify-between gap-2'>
                  <span className='truncate text-xs font-semibold'>
                    {ind.label}
                  </span>
                  <span className='shrink-0 text-xs font-bold text-primary'>
                    {pct}%
                  </span>
                </div>
                <ProjetMiniProgress value={pct} />
                <p className='text-[10px] text-muted-foreground'>
                  {ind.current} / {ind.target} {ind.unit}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-sm'>
            <FileText className='h-4 w-4' />
            Dernières missions
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          {[
            { titre: 'Supervision Q1', statut: 'Terminée', date: '15/03/2025' },
            { titre: 'Évaluation mi-parcours', statut: 'En cours', date: '01/05/2025' },
            { titre: 'Atelier parties prenantes', statut: 'Planifiée', date: '20/06/2025' },
          ].map((m) => (
            <div
              key={m.titre}
              className='flex items-center justify-between rounded-lg border px-3 py-2 text-sm'
            >
              <span className='font-medium'>{m.titre}</span>
              <div className='flex items-center gap-2'>
                <span className='rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold'>
                  {m.statut}
                </span>
                <span className='text-xs text-muted-foreground'>{m.date}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Card>
          <CardContent className='flex items-center gap-3 p-4'>
            <CheckCircle2 className='h-8 w-8 text-green-500' />
            <div>
              <p className='text-xs text-muted-foreground'>Taux de réalisation</p>
              <p className='text-lg font-bold'>{DEMO.tauxExecution}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-center gap-3 p-4'>
            <Users className='h-8 w-8 text-primary' />
            <div>
              <p className='text-xs text-muted-foreground'>Équipe terrain</p>
              <p className='text-lg font-bold'>12 agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='flex items-center gap-3 p-4'>
            <Clock className='h-8 w-8 text-orange-500' />
            <div>
              <p className='text-xs text-muted-foreground'>Délai consommé</p>
              <p className='text-lg font-bold'>—</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
