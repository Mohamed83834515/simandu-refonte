import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import type { Ptba } from '@/simadou/allTypes'
import type { SuiviDecaissementPtba } from '@/simadou/allTypes/decaissementPtba'
import { sumSuiviDecaissementMontant } from '@/simadou/allColonnes/suivi-decaissement-ptba-columns'
import { useGetSuiviDecaissementByActivite } from '@/simadou/allHooks/admin/suiviPtbaHooks'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
} from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedDialogContext'
import ActiviteTabbedFormPanel from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedFormPanel'
import SuiviDecaissementPtbaForm from './SuiviDecaissementPtbaForm'
import SuiviDecaissementPtbaList from './SuiviDecaissementPtbaList'

type Props = {
  activite: Ptba
}

function formatTotalMontant(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function SuiviDecaissementPtbaManager({ activite }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SuiviDecaissementPtba | undefined>()
  const activeProgrammeCode = useActiveProgrammeCode()
  const codeProgramme = activite.code_programme ?? activeProgrammeCode

  useActiviteTabbedSubView(showForm)

  const { data: suivis = [], isLoading } = useGetSuiviDecaissementByActivite(
    activite.id_ptba
  )

  const totalMontant = useMemo(() => sumSuiviDecaissementMontant(suivis), [suivis])

  const handleAdd = () => {
    if (!codeProgramme?.trim()) return
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: SuiviDecaissementPtba) => {
    setEditing(row)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(undefined)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {showForm && codeProgramme ? (
        <ActiviteTabbedFormPanel
          header={
            <ActiviteTabbedSubViewHeader
              sectionLabel='Suivi décaissement'
              className='shrink-0 border-0 px-0 pb-0 text-base font-semibold text-foreground'
            />
          }
        >
          <SuiviDecaissementPtbaForm
            idActivite={activite.id_ptba}
            codeProgramme={codeProgramme}
            suivi={editing}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </ActiviteTabbedFormPanel>
      ) : showForm ? (
        <div className='px-4 py-6 text-sm text-muted-foreground'>
          Impossible d&apos;enregistrer un décaissement sans programme actif.
        </div>
      ) : (
        <div className='flex min-h-0 flex-1 flex-col px-3 py-2 sm:px-4 sm:py-3'>
          <SuiviDecaissementPtbaList
            key={activite.id_ptba}
            activite={activite}
            suivis={suivis}
            onEdit={handleEdit}
            onAdd={handleAdd}
          />
        </div>
      )}

      {!showForm && (
        <div className='shrink-0 border-t bg-muted/40 px-3 py-2 text-sm sm:px-4'>
          <span className='font-medium text-foreground'>Total montant :</span>{' '}
          <span className='font-mono'>{formatTotalMontant(totalMontant)}</span>
        </div>
      )}
    </div>
  )
}
