// components/KpiIndicateurs.tsx
import { useMemo } from 'react'
import { Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useIndicateursPerformanceByProjet } from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import type { Projet } from '@/simadou/allTypes'

type KpiIndicateursProps = {
  projet: Projet | undefined
}

export function KpiIndicateurs({ projet }: KpiIndicateursProps) {
  // Récupérer tous les indicateurs du projet (sans filtre par année)
  const { indicateurs, isLoading } = useIndicateursPerformanceByProjet(
    projet
  )

  // Calculer les données des KPI
  const kpiData = useMemo(() => {
    return indicateurs.map((ind: any) => {
      const target = ind.valeurCible || 1
      const current = ind.valeurActuelle || 0
      const pct = Math.min(Math.round((current / target) * 100), 100)
      
      const getColor = (taux: number) => {
        if (taux >= 80) return { 
          bg: 'bg-emerald-500', 
          badge: 'bg-emerald-100 text-emerald-700',
          text: 'text-emerald-600'
        }
        if (taux >= 50) return { 
          bg: 'bg-amber-500', 
          badge: 'bg-amber-100 text-amber-700',
          text: 'text-amber-600'
        }
        if (taux >= 20) return { 
          bg: 'bg-orange-500', 
          badge: 'bg-orange-100 text-orange-700',
          text: 'text-orange-600'
        }
        return { 
          bg: 'bg-red-500', 
          badge: 'bg-red-100 text-red-700',
          text: 'text-red-600'
        }
      }
      
      const col = getColor(pct)
      
      let unit = ''
      if (ind.unite_indicateur_performance) {
        if (typeof ind.unite_indicateur_performance === 'object') {
          unit = ind.unite_indicateur_performance.unite_ui || ''
        }
      }
      
      return {
        id: ind.id_indicateur_performance,
        label: ind.intitule_indicateur_tache || 'Indicateur',
        code: ind.code_indicateur_performance,
        target,
        current,
        unit,
        pct,
        col,
        hasCible: ind.hasCible,
        type: ind.type_ind === 1 ? 'Quantitatif' : 'Qualitatif',
        anneeCible: ind.anneeCible,
        totalCibles: ind.totalCibles,
      }
    })
  }, [indicateurs])

  // Filtrer pour n'afficher que les indicateurs avec des cibles
  const kpiAvecCibles = kpiData.filter(k => k.hasCible)

  return (
    <div>
      <div className='mb-3 flex items-center gap-2'>
        <Shield className='h-4 w-4 text-primary' />
        <h3 className='text-sm font-semibold'>Indicateurs clés de performance</h3>
        {isLoading && (
          <span className='text-xs text-muted-foreground ml-2'>Chargement...</span>
        )}
        {!isLoading && (
          <span className='text-xs text-muted-foreground ml-2'>
            ({kpiAvecCibles.length} {kpiAvecCibles.length > 1 ? 'indicateurs' : 'indicateur'})
          </span>
        )}
      </div>
      
      {!isLoading && kpiAvecCibles.length === 0 ? (
        <div className='text-center py-6 bg-muted/20 rounded-lg'>
          <p className='text-sm text-muted-foreground'>
            Aucun indicateur de performance pour ce projet
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Ajoutez des indicateurs avec des cibles pour ce projet
          </p>
        </div>
      ) : (
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {kpiAvecCibles.map((ind) => (
            <Card key={ind.id} className='border-0 shadow-sm bg-muted/30 hover:bg-muted/40 transition-colors'>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between mb-2'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-semibold uppercase text-muted-foreground leading-tight truncate'>
                      {ind.label}
                    </p>
                    <div className='flex items-center gap-2 mt-0.5'>
                      {ind.code && (
                        <p className='text-[10px] text-muted-foreground/60'>
                          {ind.code}
                        </p>
                      )}
                      {ind.anneeCible && (
                        <p className='text-[10px] text-muted-foreground/60'>
                          • Cible {ind.anneeCible}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${ind.col.badge} ml-2 flex-shrink-0`}>
                    {ind.pct}%
                  </span>
                </div>
                <div className='flex items-baseline gap-1 mb-2'>
                  <span className='text-xl font-bold'>
                    {ind.current.toLocaleString('fr-FR')}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    / {ind.target.toLocaleString('fr-FR')} {ind.unit}
                  </span>
                </div>
                <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                  <div 
                    className={`h-full rounded-full ${ind.col.bg} transition-all duration-700`} 
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
          ))}
        </div>
      )}
    </div>
  )
}