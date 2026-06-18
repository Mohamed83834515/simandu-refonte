import { useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { buildMissionSupervisionProjetColumns } from '@/simadou/allColonnes/mission-supervision-projet-columns'
import {
  useDeleteMissionSupervisionProjet,
  useGetMissionsSupervisionProjet,
} from '@/simadou/allHooks/admin/missionSupervisionProjetHooks'
import type { Projet } from '@/simadou/allTypes'
import type { MissionSupervisionProjet } from '@/simadou/allTypes/missionSupervisionProjet'
import { filterMissionsByProjet } from '@/simadou/lib/missionRecommandationUtils'

type ListeMissionSupervisionProjetProps = {
  projet: Projet
  onAdd: () => void
  onEdit: (row: MissionSupervisionProjet) => void
}

export default function ListeMissionSupervisionProjet({
  projet,
  onAdd,
  onEdit,
}: ListeMissionSupervisionProjetProps) {
  const idProjet = projet.id_projet
  const { search, navigate } = useEmbeddedTableState()
  const { data: missions = [] } = useGetMissionsSupervisionProjet(idProjet)
  const deleteMutation = useDeleteMissionSupervisionProjet(idProjet)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<MissionSupervisionProjet | null>(
    null
  )

  const filteredMissions = useMemo(
    () =>
      [...filterMissionsByProjet(missions, idProjet)].sort(
        (a, b) => new Date(b.debut).getTime() - new Date(a.debut).getTime()
      ),
    [missions, idProjet]
  )

  const columns = useMemo(
    () =>
      buildMissionSupervisionProjetColumns({
        setDeleteOpen,
        setCurrentRow,
        onEdit,
      }),
    [onEdit]
  )

  return (
    <>
      <div className='@container/content flex min-h-[14rem] w-full min-w-0 flex-1 flex-col'>
        <GenericTable<MissionSupervisionProjet>
          data={filteredMissions}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='code_ms'
          searchPlaceholder='Rechercher une mission…'
          urlFilterConfig={[
            { columnId: 'code_ms', searchKey: 'code_ms', type: 'string' },
            {
              columnId: 'type_mission',
              searchKey: 'type_mission',
              type: 'string',
            },
          ]}
          defaultPageSize={5}
          compactPagination
          tableContainerClassName='min-h-[10rem] max-h-[min(45vh,22rem)] flex-1 overflow-y-auto'
          showViewOptions={false}
          emptyMessage='Aucune mission de supervision pour ce projet.'
          toolbarEndSlot={
            <DataTableToolbarOutlineButton
              className='ms-auto shrink-0'
              onClick={onAdd}
            >
              Nouvelle mission
            </DataTableToolbarOutlineButton>
          }
        />
      </div>

      <GenericDeleteDialog<MissionSupervisionProjet>
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        currentRow={currentRow}
        entityName='mission de supervision'
        getEntityLabel={(row) => row?.code_ms || `Mission ${row?.id_mission}`}
        onDelete={(row) => deleteMutation.mutate(row.id_mission)}
      />
    </>
  )
}
