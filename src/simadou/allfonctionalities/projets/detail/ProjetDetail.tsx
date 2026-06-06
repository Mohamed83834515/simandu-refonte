import { useEffect, useRef, useState } from 'react'
import { Link, getRouteApi } from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Main } from '@/components/layout/others/main'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetProjet } from '@/simadou/allHooks/admin/projetHooks'
import ProjetDetailTabPanel from './ProjetDetailTabPanel'
import ProjetMiniProgress from './ProjetMiniProgress'
import {
  computeDateFin,
  computeDureeConsommee,
  formatDateFr,
} from './projetDetailUtils'
import {
  projetDetailTabs,
  type ProjetDetailTab,
} from './projetDetailTabs'

const route = getRouteApi('/_authenticated/programmation/projets/$id')

/** Indicateurs démo (branche amadou) — API à brancher. */
const DEMO_EXECUTION = 67
const DEMO_DECAISSEMENT = 54

export default function ProjetDetail() {
  const { id } = route.useParams()
  const { data: projet, isLoading, isError } = useGetProjet(id)
  const [selectedTab, setSelectedTab] = useState<ProjetDetailTab>(
    projetDetailTabs[0]
  )
  const mainContentRef = useRef<HTMLDivElement>(null)
  const mainPanelRef = useRef<HTMLElement>(null)
  const skipTabScrollRef = useRef(true)
  const [isSplitScroll, setIsSplitScroll] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches
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

  if (isError || !projet) {
    return (
      <div className='space-y-4 p-4'>
        <Button variant='outline' size='sm' asChild>
          <Link to='/programmation/projets'>
            <ArrowLeft className='h-4 w-4' />
            Retour aux projets
          </Link>
        </Button>
        <p className='py-12 text-center text-sm text-muted-foreground'>
          Projet introuvable.
        </p>
      </div>
    )
  }

  const duree = computeDureeConsommee(projet)

  return (
    <Main
      fixed={isSplitScroll}
      className={cn('flex flex-col gap-4 py-4', isSplitScroll && 'min-h-0')}
    >
      {/* <div className='flex shrink-0 items-center gap-3'>
        <Button variant='outline' size='icon' className='h-8 w-8 shrink-0' asChild>
          <Link to='/programmation/projets'>
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Retour</span>
          </Link>
        </Button>
        <div>
          <h2 className='text-xl font-bold leading-tight tracking-tight'>
            {projet.sigle_projet}
          </h2>
          <p className='font-mono text-xs text-muted-foreground'>
            #{projet.code_projet}
          </p>
        </div>
      </div> */}

      <div
        className={cn(
          'flex flex-col gap-4',
          isSplitScroll && 'min-h-0 flex-1 lg:flex-row lg:items-stretch'
        )}
      >
        <aside
          className={cn(
            'w-full shrink-0 space-y-3',
            isSplitScroll &&
            'min-h-0 max-h-full overflow-y-auto overscroll-contain lg:w-72'
          )}
        >
          <Card className='shrink-0 gap-0 py-0'>
            <CardHeader className='border-b bg-primary/5 px-3 py-2.5'>
              <div className='flex items-start gap-2.5'>
                <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <Link to='/programmation/projets'>
                    <ArrowLeft className='h-4 w-4' />
                  </Link>
                </div>
                <div className='min-w-0'>
                  <CardTitle className='line-clamp-2 text-xs leading-snug'>
                    {projet.intitule_projet}
                  </CardTitle>
                  <CardDescription className='font-mono text-[9px] font-bold uppercase'>
                    {projet.code_projet}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 px-3 py-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <Calendar className='h-2 w-2 text-primary' />
                    Début
                  </span>
                  <span className='text-[11px] font-semibold'>
                    {formatDateFr(projet.date_demarrage_projet)}
                  </span>
                </div>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <Calendar className='h-2 w-2 text-orange-500' />
                    Fin
                  </span>
                  <span className='text-[11px] font-semibold'>
                    {computeDateFin(projet)}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3 border-t pt-2.5'>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <Clock className='h-2 w-2 text-primary' />
                    Durée
                  </span>
                  <span className='text-[11px] font-semibold'>
                    {projet.duree_projet} mois
                  </span>
                </div>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <DollarSign className='h-2 w-2 text-green-600' />
                    Coût
                  </span>
                  <span className='text-[11px] font-semibold'>
                    {new Intl.NumberFormat('fr-FR', {
                      notation: 'compact',
                      compactDisplay: 'short',
                      style: 'currency',
                      currency: 'XOF',
                      maximumFractionDigits: 1,
                    }).format(0)}
                  </span>
                </div>
              </div>

              <div className='space-y-2.5 border-t pt-2.5'>
                <div className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                      <TrendingUp className='h-2 w-2 text-blue-500' />
                      Exécution physique
                    </span>
                    <span className='text-[9px] font-bold text-blue-600'>
                      {DEMO_EXECUTION}%
                    </span>
                  </div>
                  <ProjetMiniProgress
                    value={DEMO_EXECUTION}
                    colorClassName='bg-blue-500'
                  />
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                      <DollarSign className='h-2 w-2 text-green-600' />
                      Décaissement
                    </span>
                    <span className='text-[9px] font-bold text-green-600'>
                      {DEMO_DECAISSEMENT}%
                    </span>
                  </div>
                  <ProjetMiniProgress
                    value={DEMO_DECAISSEMENT}
                    colorClassName='bg-green-500'
                  />
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                      <Clock className='h-2 w-2 text-orange-500' />
                      Durée consommée
                    </span>
                    <span className='text-[9px] font-bold text-orange-600'>
                      {duree.percent}%
                    </span>
                  </div>
                  <ProjetMiniProgress
                    value={duree.percent}
                    colorClassName='bg-orange-500'
                  />
                  <p className='text-[9px] text-muted-foreground'>
                    {duree.elapsedMonths} mois / {duree.totalMonths} mois
                  </p>
                </div>
              </div>

              {/* <div className='border-t pt-2.5'>
                <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                  <User className='h-2 w-2 text-primary' />
                  Partenaire
                </span>
                <p className='text-[11px] font-semibold leading-snug'>
                  {projet.partenaire_projet?.nom_acteur?.trim() || '—'}
                </p>
              </div>

              <div className='space-y-2 border-t pt-2.5'>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <Users className='h-2 w-2' />
                    Unité de gestion
                  </span>
                  <ActeurList items={structures} emptyLabel='—' />
                </div>
                <div>
                  <span className='mb-0.5 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    Signataires
                  </span>
                  <ActeurList items={signataires} emptyLabel='—' />
                </div>
                <div>
                  <span className='mb-0.5 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    Partenaires d&apos;exécution
                  </span>
                  <ActeurList items={partenairesExec} emptyLabel='—' />
                </div>
                <div>
                  <span className='mb-0.5 flex items-center gap-1 text-[9px] font-bold tracking-tight text-muted-foreground uppercase'>
                    <MapPin className='h-2 w-2' />
                    Zones
                  </span>
                  <ActeurList items={zones} emptyLabel='—' />
                </div> 
              </div>*/}
            </CardContent>
          </Card>

          <Card className='shrink-0 gap-0 py-3 pl-3'>
            <CardHeader className='border-b px-2 pb-2'>
              <CardTitle className='text-[9px] font-bold tracking-widest text-muted-foreground uppercase'>
                Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-0.5 px-1 pb-1'>
              {projetDetailTabs.map((tab) => {
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
                    <TabIcon
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span className='truncate text-start'>{tab.name}</span>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </aside>

        <main
          ref={mainPanelRef}
          className={cn(
            'min-w-0 flex-1',
            isSplitScroll && 'flex min-h-0 flex-col overflow-hidden'
          )}
        >
          <Card
            className={cn(
              isSplitScroll && 'flex min-h-0 flex-1 flex-col overflow-hidden'
            )}
          >
            <CardHeader className='shrink-0 border-b'>
              <CardTitle className='text-base'>{selectedTab.name}</CardTitle>
              <CardDescription>{selectedTab.description}</CardDescription>
            </CardHeader>
            <CardContent
              ref={mainContentRef}
              className={cn(
                'p-5',
                isSplitScroll && 'min-h-0 flex-1 overflow-y-auto'
              )}
            >
              <ProjetDetailTabPanel tab={selectedTab} projet={projet} />
            </CardContent>
          </Card>
        </main>
      </div>
    </Main>
  )
}
