import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet } from '@/simadou/allTypes'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import { buildPtbasColumns } from '@/simadou/allColonnes/ptbas-columns'
import {
  useDeletePtbaProjet,
  useGetPtbasProjet,
} from '@/simadou/allHooks/admin/ptbaProjetHooks'
import ActiviteTabbedDialog from '@/simadou/allfonctionalities/ptba/ActiviteTabbedDialog'
import IndicateurTacheManager from '@/simadou/allfonctionalities/ptba/indicateur-tache/IndicateurTacheManager'
import TacheActiviteManager from '@/simadou/allfonctionalities/ptba/tache-activite/TacheActiviteManager'
import AddPtbaProjet from './AddPtbaProjet'

type ProjetPtbaPanelProps = {
  projet: Projet
}

export default function ProjetPtbaPanel({ projet }: ProjetPtbaPanelProps) {
  const codeProjet = projet.code_projet
  const { search, navigate } = useEmbeddedTableState()
  const { data: ptbas = [] } = useGetPtbasProjet(codeProjet)
  const deleteMutation = useDeletePtbaProjet(codeProjet)

  const [planifierActivite, setPlanifierActivite] = useState<PtbaProjet | null>(
    null
  )
  const [showPlanificationModal, setShowPlanificationModal] = useState(false)
  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] = useState<PtbaProjet | null>(null)

  const onOpenPlanification = useCallback((activite: PtbaProjet) => {
    setPlanifierActivite(activite)
    setShowPlanificationModal(true)
  }, [])

  const columns = useMemo(
    () => buildPtbasColumns(setOpen, setCurrentRow, onOpenPlanification),
    [setOpen, setCurrentRow, onOpenPlanification]
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Planification PTBA des activités rattachées à ce projet.
        </p>
        <Button type='button' onClick={() => setOpen('add')}>
          <Plus className='h-4 w-4' />
          Ajouter PTBA
        </Button>
      </div>

      <GenericTable<PtbaProjet>
        data={ptbas}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_activite_ptba'
        searchPlaceholder='Filtrer les activités PTBA…'
        urlFilterConfig={[
          {
            columnId: 'intitule_activite_ptba',
            searchKey: 'intitule_activite_ptba',
            type: 'string',
          },
        ]}
        showViewOptions={false}
        emptyMessage='Aucune activité PTBA pour ce projet.'
      />

      <ActiviteTabbedDialog
        activite={planifierActivite}
        open={showPlanificationModal}
        onOpenChange={(isOpen) => {
          setShowPlanificationModal(isOpen)
          if (!isOpen) setPlanifierActivite(null)
        }}
        defaultTab='taches'
        tabs={
          planifierActivite
            ? [
                {
                  value: 'taches',
                  label: 'Planification des tâches',
                  content: (
                    <TacheActiviteManager activite={planifierActivite} />
                  ),
                },
                {
                  value: 'indicateurs',
                  label: 'Planification des indicateurs',
                  content: (
                    <IndicateurTacheManager activite={planifierActivite} />
                  ),
                },
              ]
            : []
        }
      />

      <AddPtbaProjet
        projet={projet}
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      <GenericDialogs<PtbaProjet, 'add' | 'edit' | 'delete'>
        open={open}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        rowRequiredDialogs={['edit', 'delete']}
        dialogMap={{
          edit: (props) => (
            <AddPtbaProjet
              key={`ptba-projet-edit-${currentRow?.id_ptba}`}
              projet={projet}
              open={props.open}
              onOpenChange={props.onOpenChange}
              currentRow={props.currentRow as PtbaProjet}
            />
          ),
          delete: (props) => (
            <GenericDeleteDialog<PtbaProjet>
              key={`ptba-projet-delete-${currentRow?.id_ptba}`}
              {...props}
              currentRow={props.currentRow as PtbaProjet}
              entityName='activité PTBA'
              getEntityLabel={(row) => row.intitule_activite_ptba}
              onDelete={(row) => deleteMutation.mutate(row.id_ptba)}
            />
          ),
        }}
      />
    </div>
  )
}
