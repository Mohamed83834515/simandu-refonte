// simadou/allfonctionalities/ugl/UglList.tsx
import { useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { UGL } from '@/simadou/allTypes/ugl'
import useDialogState from '@/hooks/use-dialog-state'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { useDeleteUgl, useGetUgls } from '@/simadou/allHooks/admin/uglHooks'
import { buildUglColumns } from '@/simadou/allColonnes/ugl-columns'
import AddUgl from './AddUgl'
import { GenericDialogs } from '@/Global/Generic/Genericdialogs'

export function ListeUgl() {
    const { search, navigate } = useEmbeddedTableState()
    const [open, setOpen] = useDialogState<'add' | 'edit' | 'delete'>(null)
    const [currentRow, setCurrentRow] = useState<UGL | null>(null)
    const columns = useMemo(
        () => buildUglColumns(setOpen, setCurrentRow),
        [setOpen, setCurrentRow]
    )

    const deleteMutation = useDeleteUgl()
    const { data: ugls = [] } = useGetUgls()

    return (
        <>
            <div className='space-y-4'>
                <GenericTable
                    data={ugls}
                    columns={columns}
                    search={search}
                    navigate={navigate}
                    searchKey='nom_ugl'
                    searchPlaceholder='Filtrer les UGL...'
                    urlFilterConfig={[
                        {
                            columnId: 'nom_ugl',
                            searchKey: 'nom_ugl',
                            type: 'string',
                        },
                    ]}
                    defaultPageSize={10}
                    showViewOptions={true}
                    emptyMessage='Aucune unité de gestion trouvée.'
                />
            </div>

            {currentRow && (
                <GenericDialogs<UGL, 'add' | 'edit' | 'delete'>
                    open={open}
                    setOpen={setOpen}
                    currentRow={currentRow}
                    setCurrentRow={setCurrentRow}
                    rowRequiredDialogs={['edit', 'delete']}
                    dialogMap={{
                        edit: (props) => (
                            <AddUgl
                                key={`ugl-edit-${currentRow?.id_ugl}`}
                                open={props.open}
                                onOpenChange={props.onOpenChange}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                currentRow={props.currentRow as any}
                            />
                        ),
                        delete: (props) => (
                            <GenericDeleteDialog<UGL>
                                key={`ugl-delete-${currentRow?.id_ugl}`}
                                {...props}
                                currentRow={props.currentRow as UGL}
                                entityName='ugl'
                                getEntityLabel={(row) => row.nom_ugl}
                                onDelete={(row) => deleteMutation.mutate(row.id_ugl)}
                            />
                        ),
                    }}
                />
            )}
        </>
    )
}