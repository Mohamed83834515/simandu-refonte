import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, getRouteApi } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Loader2,
  Star,
  Target,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Main } from '@/components/layout/others/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetContratPerformance } from '@/simadou/allHooks/admin/contratPerformanceHooks'
import ContratDetailPanel from './ContratDetailPanel'
import { contratDetailTabs, type ContratDetailTab } from './contratDetailTabs'
import { useGetPlanSites } from '@/simadou/allHooks/admin/planSiteHooks'
import { PlanSite } from '@/simadou/allTypes'

const APPRECIATION_LABELS: Record<string, string> = {
  excellent: 'Excellent',
  très_bien: 'Très bien',
  bien: 'Bien',
  assez_bien: 'Assez bien',
  passable: 'Passable',
  non_satisfaisant: 'Non satisfaisant',
}

function formatAppreciation(value: string | null | undefined): string {
  if (!value) return '—'
  return APPRECIATION_LABELS[value] ?? value
}

function resolveStructureLabel(
  structure: number | null | undefined | PlanSite,
  plansites: PlanSite[]
): string {
  if (structure == null) return '—'
  if (typeof structure === 'object') {
    return structure.code_ds + ':' + structure.intutile_ds
  }
  const found = plansites.find((u) => u.id_ds === structure)
  return found?.code_ds + ':' + found?.intutile_ds
}

const route = getRouteApi('/_authenticated/programmation/contrat-performance/$id')

export default function ContratDetailPage() {
  const { id } = route.useParams()
  const { data: contrat, isLoading, isError } = useGetContratPerformance(id)
  const { data: plansites = [] } = useGetPlanSites()
  const [selectedTab, setSelectedTab] = useState<ContratDetailTab>(contratDetailTabs[0])
  const mainContentRef = useRef<HTMLDivElement>(null)
  const mainPanelRef = useRef<HTMLElement>(null)
  const skipTabScrollRef = useRef(true)
  const [isSplitScroll, setIsSplitScroll] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )

  const structureLabel = useMemo(
    () => resolveStructureLabel(contrat?.structure, plansites),
    [contrat?.structure, plansites]
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsSplitScroll(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (skipTabScrollRef.current) {
      skipTabScrollRef.current = false
      return
    }
    if (isSplitScroll) {
      mainContentRef.current?.scrollTo({ top: 0 })
    } else {
      mainPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedTab.key, isSplitScroll])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (isError || !contrat) {
    return (
      <div className='space-y-4 p-4'>
        <Button variant='outline' size='sm' asChild>
          <Link to='/programmation/contrat-performance'>
            <ArrowLeft className='h-4 w-4' />
            Retour aux contrats
          </Link>
        </Button>
        <p className='py-12 text-center text-sm text-muted-foreground'>Contrat introuvable.</p>
      </div>
    )
  }

  return (
    <Main fixed={isSplitScroll} className={cn('flex flex-col gap-4 py-4', isSplitScroll && 'min-h-0')}>
      <div className={cn('flex flex-col gap-4', isSplitScroll && 'min-h-0 flex-1 lg:flex-row lg:items-stretch')}>
        <aside className={cn('w-full shrink-0 space-y-3', isSplitScroll && 'min-h-0 max-h-full overflow-y-auto overscroll-contain lg:w-72')}>
          <Card className='shrink-0 gap-0 py-0'>
            <CardHeader className='border-b bg-primary/5 px-3 py-2.5'>
              <div className='flex items-start gap-2.5'>
                <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <Link to='/programmation/contrat-performance'>
                    <ArrowLeft className='h-4 w-4' />
                  </Link>
                </div>
                <div className='min-w-0'>
                  <CardTitle className='line-clamp-2 text-xs leading-snug'>
                    {contrat.intitule_contrat}
                  </CardTitle>
                  <CardDescription className='font-mono text-[9px] font-bold uppercase'>
                    {contrat.code_contrat}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 px-3 py-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <LayoutDashboard className='h-2 w-2 text-primary' />
                    Statut
                  </span>
                  <span className='text-[11px] font-semibold'>{contrat.statut}</span>
                </div>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <Target className='h-2 w-2 text-orange-500' />
                    État
                  </span>
                  <span className='text-[11px] font-semibold'>{contrat.etat ? 'Actif' : 'Inactif'}</span>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3 border-t pt-2.5'>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <ClipboardList className='h-2 w-2 text-primary' />
                    Début
                  </span>
                  <span className='text-[11px] font-semibold'>{contrat.date_debut}</span>
                </div>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <FileText className='h-2 w-2 text-green-600' />
                    Fin
                  </span>
                  <span className='text-[11px] font-semibold'>{contrat.date_fin}</span>
                </div>
              </div>
              <div className='space-y-2.5 border-t pt-2.5'>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <UserRound className='h-2 w-2 text-primary' />
                    Signataire du ministère
                  </span>
                  <span className='block text-[11px] font-semibold leading-snug'>
                    {contrat.signataire_ministere || '—'}
                  </span>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                      <Star className='h-2 w-2 text-amber-500' />
                      Appréciation
                    </span>
                    <span className='text-[11px] font-semibold'>
                      {formatAppreciation(contrat.appreciation)}
                    </span>
                  </div>
                  <div>
                    <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                      <Building2 className='h-2 w-2 text-sky-600' />
                      Structure / UGL
                    </span>
                    <span className='text-[11px] font-semibold'>{structureLabel}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='shrink-0 gap-0 py-3 pl-3'>
            <CardHeader className='border-b px-2 pb-2'>
              <CardTitle className='text-[9px] font-bold tracking-widest text-muted-foreground uppercase'>
                Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-0.5 px-1 pb-1'>
              {contratDetailTabs.map((tab) => {
                const isActive = selectedTab.key === tab.key
                const TabIcon = tab.icon
                return (
                  <Button
                    key={tab.key}
                    type='button'
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'h-auto w-full justify-start gap-2.5 rounded-lg rounded-r-none px-2.5 py-2 text-xs font-semibold',
                      isActive && 'shadow-sm'
                    )}
                    onClick={() => setSelectedTab(tab)}
                  >
                    <TabIcon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                    <span className='truncate text-start'>{tab.name}</span>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </aside>

        <main ref={mainPanelRef} className={cn('min-w-0 flex-1', isSplitScroll && 'flex min-h-0 flex-col overflow-hidden')}>
          <Card className={cn(isSplitScroll && 'flex min-h-0 flex-1 flex-col overflow-hidden')}>
            <CardContent ref={mainContentRef} className={cn('p-3', isSplitScroll && 'min-h-0 flex-1 overflow-y-auto')}>
              <ContratDetailPanel tab={selectedTab} contrat={contrat} />
            </CardContent>
          </Card>
        </main>
      </div>
    </Main>
  )
}
