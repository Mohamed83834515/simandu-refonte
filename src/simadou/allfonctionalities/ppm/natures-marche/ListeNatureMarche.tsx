import { useCallback, useMemo, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildNatureMarcheColumns } from '@/simadou/allColonnes/nature-marche-columns'
import {
  useDeleteNatureMarche,
  useGetNaturesMarche,
} from '@/simadou/allHooks/admin/natureMarcheHooks'

export default function ListeNatureMarche({
  onAdd,
  onEdit,
}: {
  onAdd: () => void
  onEdit: (row: any) => void
}) {
  const { data = [] } = useGetNaturesMarche()
  const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
  const [currentRow, setCurrentRow] = useState<any>(null)
  const { search, navigate } = useEmbeddedTableState()
  const deleteMutation = useDeleteNatureMarche()

  const handleEdit = useCallback(
    (row: any) => {
      setCurrentRow(row)
      onEdit(row)
    },
    [onEdit]
  )

  const columns = useMemo(
    () => buildNatureMarcheColumns(setOpen, setCurrentRow, handleEdit),
    [handleEdit]
  )

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Natures de marché</CardTitle>
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
          searchKey='intitule_nature_marche'
          searchPlaceholder='Filtrer les natures de marché...'
          defaultPageSize={10}
          showViewOptions={false}
          emptyMessage='Aucune nature de marché trouvée.'
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
                entityName='nature de marché'
                currentRow={props.currentRow}
                getEntityLabel={(row: any) =>
                  `${row.code_nature_marche} - ${row.intitule_nature_marche}`
                }
                onDelete={(row) =>
                  deleteMutation.mutate(row?.id_nature_marche ?? 0)
                }
              />
            ),
          }}
        />
      </CardContent>
    </Card>
  )
}
