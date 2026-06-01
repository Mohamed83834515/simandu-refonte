import { BookOpen, BarChart3, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DictionnaireIndicateur } from '@/simadou/allTypes'

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
}) {
  return (
    <Card className='border-border/60 shadow-none'>
      <CardContent className='flex items-start justify-between gap-3 p-4'>
        <div>
          <p className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
            {title}
          </p>
          <p className='mt-1 text-2xl font-extrabold tabular-nums'>{value}</p>
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

export default function DictionnaireIndicateurStats({
  dictionnaires,
}: {
  dictionnaires: DictionnaireIndicateur[]
}) {
  const total = dictionnaires.length
  const avecUnite = dictionnaires.filter((d) => d.unite_cmr).length
  const impact = dictionnaires.filter((d) => d.typologie === 'Impact').length
  const effet = dictionnaires.filter((d) => d.typologie === 'Effet').length

  return (
    <div className='mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      <StatCard
        title='Total indicateurs'
        value={total}
        icon={BookOpen}
        iconClassName='bg-blue-500'
      />
      <StatCard
        title='Avec unité'
        value={avecUnite}
        icon={BarChart3}
        iconClassName='bg-emerald-500'
      />
      <StatCard
        title='Impact'
        value={impact}
        icon={Target}
        iconClassName='bg-violet-500'
      />
      <StatCard
        title='Effet'
        value={effet}
        icon={TrendingUp}
        iconClassName='bg-orange-500'
      />
    </div>
  )
}
