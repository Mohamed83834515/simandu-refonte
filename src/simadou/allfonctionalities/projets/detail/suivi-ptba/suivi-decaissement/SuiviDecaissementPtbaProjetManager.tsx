import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Projet } from '@/simadou/allTypes'
import type { Ptba } from '@/simadou/allTypes'
import type { SuiviDecaissementPtbaProjet } from '@/simadou/allTypes/suiviDecaissementPtbaProjet'
import { sumSuiviDecaissementMontant } from '@/simadou/allColonnes/suivi-decaissement-ptba-projet-columns'
import { useGetSuiviDecaissementProjetByActivite } from '@/simadou/allHooks/admin/suiviPtbaProjetHooks'
import { useGetFinancementsProjet } from '@/simadou/allHooks/admin/financementProjetHooks'
import {
  buildSuiviDecaissementRegionOptions,
  buildSuiviDecaissementTypePartOptions,
  toRegionLabelMap,
  toTypePartLabelMap,
} from '@/simadou/lib/suiviDecaissementPtbaProjetUtils'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
} from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedDialogContext'
import ActiviteTabbedFormPanel from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedFormPanel'
import SuiviDecaissementPtbaProjetForm from './SuiviDecaissementPtbaProjetForm'
import SuiviDecaissementPtbaProjetList from './SuiviDecaissementPtbaProjetList'

type Props = {
  projet: Projet
  activite: Ptba
}

function formatTotalMontant(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function SuiviDecaissementPtbaProjetManager({
  projet,
  activite,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SuiviDecaissementPtbaProjet | undefined>()

  useActiviteTabbedSubView(showForm)

  const { data: financements = [] } = useGetFinancementsProjet(projet.id_projet)
  const { data: suivis = [], isLoading } = useGetSuiviDecaissementProjetByActivite(
    activite.id_ptba
  )

  const regionLabelById = useMemo(
    () => toRegionLabelMap(buildSuiviDecaissementRegionOptions(projet.zone_projet)),
    [projet.zone_projet]
  )
  const financementLabelById = useMemo(
    () => toTypePartLabelMap(buildSuiviDecaissementTypePartOptions(financements)),
    [financements]
  )

  const totalMontant = useMemo(() => sumSuiviDecaissementMontant(suivis), [suivis])

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: SuiviDecaissementPtbaProjet) => {
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
      {showForm ? (
        <ActiviteTabbedFormPanel
          header={
            <ActiviteTabbedSubViewHeader
              sectionLabel='Suivi décaissement'
              className='shrink-0 border-0 px-0 pb-0 text-base font-semibold text-foreground'
            />
          }
        >
          <SuiviDecaissementPtbaProjetForm
            projet={projet}
            idActivite={activite.id_ptba}
            suivi={editing}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </ActiviteTabbedFormPanel>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
          <SuiviDecaissementPtbaProjetList
            suivis={suivis}
            idActivite={activite.id_ptba}
            regionLabelById={regionLabelById}
            financementLabelById={financementLabelById}
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
