import { Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ContratKpiIndicateurMock } from './contratOverviewMockData'

export function ContratKpiIndicateurs({
  indicateurs,
}: {
  indicateurs: ContratKpiIndicateurMock[]
}) {
  const getColor = (taux: number) => {
    if (taux >= 80) {
      return {
        bg: 'bg-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700',
      }
    }
    if (taux >= 50) {
      return {
        bg: 'bg-amber-500',
        badge: 'bg-amber-100 text-amber-700',
      }
    }
    if (taux >= 20) {
      return {
        bg: 'bg-orange-500',
        badge: 'bg-orange-100 text-orange-700',
      }
    }
    return {
      bg: 'bg-red-500',
      badge: 'bg-red-100 text-red-700',
    }
  }

  return (
    <div>
      <div className='mb-3 flex items-center gap-2'>
        <Shield className='h-4 w-4 text-primary' />
        <h3 className='text-sm font-semibold'>Indicateurs clés de performance</h3>
        <span className='ml-2 text-xs text-muted-foreground'>
          ({indicateurs.length}{' '}
          {indicateurs.length > 1 ? 'indicateurs' : 'indicateur'})
        </span>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {indicateurs.map((ind) => {
          const col = getColor(ind.pct)
          return (
            <Card
              key={ind.id}
              className='border-0 bg-muted/30 shadow-sm transition-colors hover:bg-muted/40'
            >
              <CardContent className='p-4'>
                <div className='mb-2 flex items-start justify-between'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs leading-tight font-semibold text-muted-foreground uppercase'>
                      {ind.label}
                    </p>
                    <div className='mt-0.5 flex items-center gap-2'>
                      <p className='text-[10px] text-muted-foreground/60'>
                        {ind.code}
                      </p>
                      <p className='text-[10px] text-muted-foreground/60'>
                        • Cible {ind.anneeCible}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-xs font-bold ${col.badge}`}
                  >
                    {ind.pct}%
                  </span>
                </div>
                <div className='mb-2 flex items-baseline gap-1'>
                  <span className='text-xl font-bold'>
                    {ind.current.toLocaleString('fr-FR')}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    / {ind.target.toLocaleString('fr-FR')} {ind.unit}
                  </span>
                </div>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                  <div
                    className={`h-full rounded-full ${col.bg} transition-all duration-700`}
                    style={{ width: `${ind.pct}%` }}
                  />
                </div>
                <div className='mt-1.5 flex justify-between'>
                  <span className='text-[10px] text-muted-foreground'>
                    {ind.type}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>
                    {ind.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
