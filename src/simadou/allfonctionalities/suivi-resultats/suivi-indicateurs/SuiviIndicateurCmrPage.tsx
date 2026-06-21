import { useMemo, useRef, useState } from 'react'
import { Link, getRouteApi } from '@tanstack/react-router'
import { ArrowLeft, LineChart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGetIndicateurCmr } from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetPeriodesIndicateur } from '@/simadou/allHooks/admin/periodeIndicateurHooks'
import SuiviIndicateurCmrAddPeriodeDialog from './periode/SuiviIndicateurCmrAddPeriodeDialog'
import SuiviIndicateurCmrPeriodeHeader from './periode/SuiviIndicateurCmrPeriodeHeader'
import SuiviIndicateurCmrPeriodeWorkspace, {
  type SuiviIndicateurCmrPeriodeWorkspaceHandle,
} from './periode/SuiviIndicateurCmrPeriodeWorkspace'
import { resolvePeriodeIndicateurSelectValue } from './periode/periodeIndicateurFormUtils'
import SuiviIndicateurCmrSummary from './SuiviIndicateurCmrSummary'

const route = getRouteApi('/_authenticated/suivi-resultats/suivi-indicateurs/$id')

export default function SuiviIndicateurCmrPage() {
  const { id } = route.useParams()
  const indicateurId = Number(id)
  const validId = Number.isFinite(indicateurId) ? indicateurId : null

  const { data: indicateur, isLoading, isError } = useGetIndicateurCmr(validId)
  const {
    data: periodes = [],
    isLoading: isLoadingPeriodes,
    isError: isPeriodesError,
  } = useGetPeriodesIndicateur(validId)

  const workspaceRef = useRef<SuiviIndicateurCmrPeriodeWorkspaceHandle>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [preferredPeriodeKey, setPreferredPeriodeKey] = useState('')

  const selectedPeriodeKey = useMemo(() => {
    if (periodes.length === 0) return ''

    if (
      preferredPeriodeKey &&
      periodes.some(
        (periode) =>
          resolvePeriodeIndicateurSelectValue(periode) === preferredPeriodeKey
      )
    ) {
      return preferredPeriodeKey
    }

    return resolvePeriodeIndicateurSelectValue(periodes[0])
  }, [periodes, preferredPeriodeKey])

  const selectedPeriode = useMemo(
    () =>
      periodes.find(
        (periode) =>
          resolvePeriodeIndicateurSelectValue(periode) === selectedPeriodeKey
      ) ?? null,
    [periodes, selectedPeriodeKey]
  )

  return (
    <div className='space-y-2 px-4 py-2'>
      <div className='flex items-center justify-between gap-4'>
        <Button variant='outline' size='sm' asChild className='shrink-0'>
          <Link to='/suivi-resultats/suivi-indicateurs'>
            <ArrowLeft className='me-2 h-4 w-4' />
            Retour
          </Link>
        </Button>

        <h2 className='flex min-w-0 flex-1 items-center justify-center gap-2 text-center text-lg font-semibold'>
          <LineChart className='hidden h-5 w-5 shrink-0 text-muted-foreground sm:inline' />
          <span className='truncate'>
            Suivi de l&apos;indicateur
            {indicateur?.code_ref_ind ? (
              <>
                {' '}
                <span className='font-mono text-primary'>
                  {indicateur.code_ref_ind}
                </span>
              </>
            ) : null}
          </span>
        </h2>

        <div className='flex shrink-0 justify-end'>
          {indicateur ? (
            <Button
              type='button'
              size='sm'
              onClick={() => setAddDialogOpen(true)}
            >
              Suivi de l&apos;Indicateur ({indicateur.code_ref_ind})
            </Button>
          ) : (
            <div className='w-[88px]' aria-hidden />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : isError || !indicateur ? (
        <Card className='border-dashed p-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            Impossible de charger l&apos;indicateur #{id}.
          </p>
        </Card>
      ) : (
        <>
          <div className='grid gap-3 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] lg:items-start'>
            <SuiviIndicateurCmrSummary indicateur={indicateur} />
            <SuiviIndicateurCmrPeriodeHeader
              periodes={periodes}
              selectedPeriodeKey={selectedPeriodeKey}
              onSelectedPeriodeKeyChange={(key) => {
                setPreferredPeriodeKey(key)
                workspaceRef.current?.setActiveTab('source')
              }}
              isLoading={isLoadingPeriodes}
              isError={isPeriodesError}
            />
            <div className='min-w-0 lg:col-span-2'>
              <SuiviIndicateurCmrPeriodeWorkspace
                key={indicateur.id_ref_ind_cmr}
                ref={workspaceRef}
                refIndicateur={indicateur.id_ref_ind_cmr}
                indicateurCode={indicateur.code_ref_ind}
                selectedPeriode={selectedPeriode}
                onPeriodeDeleted={() => setPreferredPeriodeKey('')}
              />
            </div>
          </div>

          {addDialogOpen ? (
            <SuiviIndicateurCmrAddPeriodeDialog
              key={indicateur.id_ref_ind_cmr}
              open
              onOpenChange={setAddDialogOpen}
              refIndicateur={indicateur.id_ref_ind_cmr}
              indicateurCode={indicateur.code_ref_ind}
              onCreated={(idPeriode) => {
                setPreferredPeriodeKey(String(idPeriode))
                workspaceRef.current?.selectPeriode(idPeriode)
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
