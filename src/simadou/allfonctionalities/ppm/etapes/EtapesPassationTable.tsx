import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { EtapePassation } from '@/simadou/allTypes/etapePassation'
import { buildEtapePassationColumns } from '@/simadou/allColonnes/etape-passation-columns'
import {
    useDeleteEtapePassation,
    useGetGroupesEtapesPassation,
} from '@/simadou/allHooks/admin/etapePassationHooks'

type EtapesPassationTableProps = {
    etapes: EtapePassation[]
    idPpm: number
    onEdit: (row: EtapePassation) => void
}

export default function EtapesPassationTable({
    etapes,
    idPpm,
    onEdit,
}: EtapesPassationTableProps) {
    const { search, navigate } = useEmbeddedTableState()
    const [open, setOpen] = useDialogState<'delete'>(null)
    const [currentRow, setCurrentRow] = useState<EtapePassation | null>(null)

    const { data: groupes = [] } = useGetGroupesEtapesPassation()
    const groupesById = useMemo(
        () => new Map(groupes.map((g) => [g.id_groupe_etape, g])),
        [groupes]
    )

    const deleteMutation = useDeleteEtapePassation(idPpm)

    const columns = useMemo(
        () =>
            buildEtapePassationColumns(onEdit, setOpen, setCurrentRow, groupesById),
        [onEdit, groupesById]
    )

    const handleConfirmDelete = (row: EtapePassation) => {
        deleteMutation.mutate(row.id_etape, {
            onSuccess: () => toast.success('Étape supprimée'),
            onError: () => toast.error("Erreur lors de la suppression de l'étape"),
        })
    }

    return (
        <>
            <GenericTable<EtapePassation>
                data={etapes}
                columns={columns}
                search={search}
                navigate={navigate}
                searchKey='etape'
                searchPlaceholder='Filtrer les étapes...'
                defaultPageSize={5}
                showViewOptions={false}
                emptyMessage='Aucune étape pour ce PPM'
            />

            {currentRow && (
                <GenericDeleteDialog<EtapePassation>
                    open={open === 'delete'}
                    onOpenChange={(isOpen) => setOpen(isOpen ? 'delete' : null)}
                    currentRow={currentRow}
                    entityName="l'étape"
                    getEntityLabel={(row) => row.etape}
                    onDelete={handleConfirmDelete}
                />
            )}
        </>
    )
}