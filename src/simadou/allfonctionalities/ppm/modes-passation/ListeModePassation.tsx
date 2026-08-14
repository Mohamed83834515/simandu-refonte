import { useCallback, useMemo, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildModePassationColumns } from '@/simadou/allColonnes/mode-passation-columns'
import {
  useDeleteModePassation,
  useGetModesPassation,
} from '@/simadou/allHooks/admin/modePassationHooks'

export default function ListeModePassation({
  onAdd,
  onEdit,
}: {
  onAdd: () => void
  onEdit: (row: any) => void
}) {
  const { data = [] } = useGetModesPassation()
  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] = useState<any>(null)
  const { search, navigate } = useEmbeddedTableState()
  const deleteMutation = useDeleteModePassation()

  const handleEdit = useCallback(
    (row: any) => {
      setCurrentRow(row)
      onEdit(row)
    },
    [onEdit]
  )

  const columns = useMemo(
    () => buildModePassationColumns(setOpen, setCurrentRow, handleEdit),
    [handleEdit]
  )

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Modes de passation</CardTitle>
        <DataTableToolbarOutlineButton onClick={onAdd}>
          Ajouter
        </DataTableToolbarOutlineButton>
      </CardHeader>
      <CardContent>
        <GenericTable
          data={data}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='intitule_mode_passation'
          searchPlaceholder='Filtrer les modes de passation...'
          defaultPageSize={10}
          showViewOptions={false}
          emptyMessage='Aucun mode de passation trouvé.'
        />

        <GenericDialogs
          open={open}
          setOpen={setOpen}
          currentRow={currentRow}
          setCurrentRow={setCurrentRow}
          rowRequiredDialogs={['edit', 'delete']}
          dialogMap={{
            delete: (props) => (
              <GenericDeleteDialog
                {...props}
                entityName='mode de passation'
                currentRow={props.currentRow}
                getEntityLabel={(row: any) =>
                  `${row.code_mode_passation} - ${row.intitule_mode_passation}`
                }
                onDelete={(row) =>
                  deleteMutation.mutate(row?.id_mode_passation ?? 0)
                }
              />
            ),
          }}
        />
      </CardContent>
    </Card>
  )
}
