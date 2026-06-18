import { useMemo, useState } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { buildRecommandationMissionProjetColumns } from '@/simadou/allColonnes/recommandation-mission-projet-columns'
import {
  useDeleteRecommandationMissionProjet,
  useGetRecommandationsMissionProjet,
} from '@/simadou/allHooks/admin/recommandationMissionProjetHooks'
import { useMissionSupervisionSelection } from '@/simadou/allHooks/admin/missionSupervisionProjetHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import type { Projet } from '@/simadou/allTypes'
import type { RecommandationMissionProjet } from '@/simadou/allTypes/recommandationMissionProjet'
import { filterRecommandationsByMission, filterRecommandationsByProjet } from '@/simadou/lib/missionRecommandationUtils'
import MissionSupervisionDialog from './mission-supervision/MissionSupervisionDialog'
import { MissionSupervisionSelect } from './mission-supervision/MissionSupervisionSelect'
import AddRecommandationMissionProjet from './recommandations/AddRecommandationMissionProjet'

type ProjetPointsBlocagePanelProps = {
  projet: Projet
}

export default function ProjetPointsBlocagePanel({
  projet,
}: ProjetPointsBlocagePanelProps) {
  const idProjet = projet.id_projet
  const { search, navigate } = useEmbeddedTableState()
  const { data: recommandations = [] } =
    useGetRecommandationsMissionProjet(idProjet)
  const deleteMutation = useDeleteRecommandationMissionProjet(idProjet)
  const {
    selectedMissionId,
    handleChangeMission,
    missionOptions,
  } = useMissionSupervisionSelection(idProjet)
  const { data: personnels = [] } = useGetPersonnels()

  const personnelsById = useMemo(
    () =>
      new Map(
        personnels
          .filter((p) => p.n_personnel != null)
          .map((p) => [p.n_personnel!, p])
      ),
    [personnels]
  )

  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] =
    useState<RecommandationMissionProjet | null>(null)
  const [showMissionDialog, setShowMissionDialog] = useState(false)

  const recommandationsForProjet = useMemo(
    () => filterRecommandationsByProjet(recommandations, idProjet),
    [recommandations, idProjet]
  )

  const filteredRecommandations = useMemo(() => {
    const byMission = filterRecommandationsByMission(
      recommandationsForProjet,
      selectedMissionId ? Number(selectedMissionId) : null
    )
    return [...byMission].sort((a, b) => {
      const dateA = a.date_buttoir ? new Date(a.date_buttoir).getTime() : 0
      const dateB = b.date_buttoir ? new Date(b.date_buttoir).getTime() : 0
      return dateB - dateA
    })
  }, [recommandationsForProjet, selectedMissionId])

  const columns = useMemo(
    () =>
      buildRecommandationMissionProjetColumns({
        setOpen: (dialog) => {
          if (dialog === 'edit') setOpen('edit')
          if (dialog === 'delete') setOpen('delete')
        },
        setCurrentRow,
        personnelsById,
      }),
    [setOpen, personnelsById]
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Recommandations issues des missions de supervision du projet.
        </p>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setShowMissionDialog(true)}
          >
            <ClipboardList className='h-4 w-4' />
            Missions de supervision
          </Button>
          <Button type='button' onClick={() => setOpen('add')}>
            <Plus className='h-4 w-4' />
            Ajouter une recommandation
          </Button>
        </div>
      </div>

      <GenericTable<RecommandationMissionProjet>
        data={filteredRecommandations}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='recommandation'
        searchPlaceholder='Filtrer les recommandations…'
        urlFilterConfig={[
          {
            columnId: 'recommandation',
            searchKey: 'recommandation',
            type: 'string',
          },
          {
            columnId: 'rubrique',
            searchKey: 'rubrique',
            type: 'string',
          },
        ]}
        toolbarEndSlot={
          <MissionSupervisionSelect
            options={missionOptions}
            value={selectedMissionId}
            onChange={handleChangeMission}
          />
        }
        showViewOptions={false}
        emptyMessage={
          selectedMissionId
            ? 'Aucune recommandation pour cette mission.'
            : 'Aucune recommandation pour ce projet.'
        }
      />

      <AddRecommandationMissionProjet
        projet={projet}
        selectedMissionId={selectedMissionId}
        missionOptions={missionOptions}
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
      />

      <GenericDialogs<RecommandationMissionProjet, 'edit' | 'delete'>
        open={open as any}
        setOpen={setOpen}
        currentRow={currentRow}
        setCurrentRow={setCurrentRow}
        rowRequiredDialogs={['edit', 'delete']}
        dialogMap={{
          edit: (props) => (
            <AddRecommandationMissionProjet
              key={`recommandation-edit-${currentRow?.id_recommandation}`}
              projet={projet}
              currentRow={props.currentRow as RecommandationMissionProjet}
              selectedMissionId={selectedMissionId}
              missionOptions={missionOptions}
              open={props.open}
              onOpenChange={props.onOpenChange}
            />
          ),
          delete: (props) => (
            <GenericDeleteDialog<RecommandationMissionProjet>
              key={`recommandation-delete-${currentRow?.id_recommandation}`}
              {...props}
              currentRow={props.currentRow as RecommandationMissionProjet}
              entityName='recommandation'
              getEntityLabel={(row) =>
                row.recommandation?.slice(0, 80) ||
                row.numero ||
                `Recommandation ${row.id_recommandation}`
              }
              onDelete={(row) =>
                deleteMutation.mutate(row.id_recommandation)
              }
            />
          ),
        }}
      />

      <MissionSupervisionDialog
        projet={projet}
        open={showMissionDialog}
        onOpenChange={setShowMissionDialog}
      />
    </div>
  )
}
