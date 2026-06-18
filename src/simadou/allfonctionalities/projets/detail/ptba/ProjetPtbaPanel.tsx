import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet } from '@/simadou/allTypes'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import {
  useDeletePtbaProjet,
  useGetPtbasProjet,
} from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { resolvePersonnelLabel } from '@/simadou/lib/resolveApiRelation'
import ActiviteTabbedDialog from '@/simadou/allfonctionalities/ptba/ActiviteTabbedDialog'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import AddPtbaProjet from './AddPtbaProjet'
import TacheActiviteProjetManager from './tache-activite-projet/TacheActiviteManager'
import IndicateurTacheProjetManager from './indicateur-tache-projet/IndicateurTacheManager'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { buildPtbasProjetColumns } from '@/simadou/allColonnes/ptbas-projet-columns'

type ProjetPtbaPanelProps = {
  projet: Projet
}

export default function ProjetPtbaPanel({ projet }: ProjetPtbaPanelProps) {
  const codeProjet = projet.code_projet
  const activeProgrammeCode = useActiveProgrammeCode()
  const codeProgramme =
    typeof projet.programme_projet === 'object' &&
      projet.programme_projet?.code_programme
      ? projet.programme_projet.code_programme
      : activeProgrammeCode
  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePtbaVersionSelection(codeProgramme)
  const { search, navigate } = useEmbeddedTableState()
  const { data: ptbas = [] } = useGetPtbasProjet(codeProjet)
  const { data: personnels = [] } = useGetPersonnels()
  const deleteMutation = useDeletePtbaProjet(codeProjet)

  const personnelsById = useMemo(
    () =>
      new Map(
        personnels
          .filter((p) => p.n_personnel != null)
          .map((p) => [p.n_personnel!, p])
      ),
    [personnels]
  )

  const getResponsableLabel = useCallback(
    (ptba: PtbaProjet) =>
      resolvePersonnelLabel(ptba.responsable_ptba, personnelsById),
    [personnelsById]
  )

  const filteredPtbas = useMemo(() => {
    if (!selectedVersionId) return ptbas
    return ptbas.filter(
      (ptba) => ptba.version_ptba?.toString() === selectedVersionId
    )
  }, [ptbas, selectedVersionId])

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
    [setOpen, setCurrentRow, onOpenPlanification, getResponsableLabel, currencyCode]
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
        data={filteredPtbas}
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
          <PtbaVersionSelect
            options={versionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
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
