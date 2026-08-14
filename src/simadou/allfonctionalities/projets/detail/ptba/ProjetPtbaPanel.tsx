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
import {
  useDeletePtbaProjet,
  useGetPtbasProjetsByVersion,
} from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { useProjetPtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import ActiviteTabbedDialog from '@/simadou/allfonctionalities/ptba/ActiviteTabbedDialog'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import AddPtbaProjet from './AddPtbaProjet'
import TacheActiviteProjetManager from './tache-activite-projet/TacheActiviteManager'
import IndicateurTacheProjetManager from './indicateur-tache-projet/IndicateurTacheManager'
import CoutActivitePtbaGridPanel from './cout-activite/CoutActivitePtbaGridPanel'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { buildPtbasProjetColumns } from '@/simadou/allColonnes/ptbas-projet-columns'

type ProjetPtbaPanelProps = {
  projet: Projet
}

const EMPTY_PTBAS: PtbaProjet[] = []

export default function ProjetPtbaPanel({ projet }: ProjetPtbaPanelProps) {
  const codeProjet = projet.code_projet
  const {
    selectedVersionId,
    handleChangeVersion,
    filteredVersionOptions,
    selectedVersionPtbaId,
    selectedVersion,
  } = useProjetPtbaVersionSelection(projet)

  const { search, navigate } = useEmbeddedTableState()
  const deleteMutation = useDeletePtbaProjet(codeProjet)

  const { data: ptbasByVersion } = useGetPtbasProjetsByVersion(
    selectedVersionPtbaId > 0 ? selectedVersionPtbaId : undefined,
    codeProjet
  )
  const ptbas = ptbasByVersion?.ptbas_projets ?? EMPTY_PTBAS

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

  const { data: config } = useGeneralParamsQuery()
  const currencyCode = config?.currencyCode

  const columns = useMemo(
    () =>
      buildPtbasProjetColumns(
        setOpen,
        setCurrentRow,
        onOpenPlanification,
        currencyCode
      ),
    [setOpen, setCurrentRow, onOpenPlanification, currencyCode]
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
        toolbarEndSlot={
          filteredVersionOptions.length > 0 ? (
            <PtbaVersionSelect
              options={filteredVersionOptions}
              value={selectedVersionId}
              onChange={handleChangeVersion}
            />
          ) : null
        }
        showViewOptions={false}
        initialState={{
          columnVisibility: {
            version_ptba: false,
          },
        }}
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
                    <TacheActiviteProjetManager activite={planifierActivite} />
                  ),
                },
                {
                  value: 'indicateurs',
                  label: 'Planification des indicateurs',
                  content: (
                    <IndicateurTacheProjetManager activite={planifierActivite} />
                  ),
                },
                {
                  value: 'cout-activite',
                  label: 'Coût activité PTBA',
                  content: (
                    <CoutActivitePtbaGridPanel
                      activite={planifierActivite}
                      projet={projet}
                      versionPtbaId={
                        Number(planifierActivite.version_ptba) ||
                        selectedVersionPtbaId
                      }
                      anneePtbaYear={selectedVersion?.annee_ptba}
                    />
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