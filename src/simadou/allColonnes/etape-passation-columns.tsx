import { ColumnDef } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import type { EtapePassation } from '@/simadou/allTypes/etapePassation'
import type { GroupeEtapePassation } from '@/simadou/allTypes/groupeEtapePassation'
import EtapeSourcesCell from '@/simadou/allfonctionalities/ppm/etapes/EtapeSourcesCell'

type EtapeDialogType = 'delete'

function formatDateLabel(value: string | null | undefined): string {
    if (value == null || value === '') return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export const buildEtapePassationColumns = (
    onEdit: (row: EtapePassation) => void,
    setOpen: (dialog: EtapeDialogType | null) => void,
    setCurrentRow: React.Dispatch<React.SetStateAction<EtapePassation | null>>,
    groupesById: Map<number, GroupeEtapePassation>
): ColumnDef<EtapePassation>[] => [
        {
            id: 'etape',
            accessorKey: 'etape',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Étape' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>{row.original.etape}</div>
            ),
        },
        {
            id: 'groupe_etape',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Groupe d'étape" />
            ),
            cell: ({ row }) => {
                const id = resolveRelationId(row.original.groupe_etape, 'id_groupe_etape')
                if (id == null) return <div>—</div>
                const groupe = groupesById.get(id)
                return (
                    <div>
                        {groupe?.intitule_groupe_etape ?? groupe?.code_groupe_etape ?? id}
                    </div>
                )
            },
        },
        {
            id: 'date_prevu',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Date prévue' />
            ),
            cell: ({ row }) => <div>{formatDateLabel(row.original.date_prevu)}</div>,
        },
        {
            id: 'date_realise',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Date réalisée' />
            ),
            cell: ({ row }) => <div>{formatDateLabel(row.original.date_realise)}</div>,
        },
        {
            id: 'fichiers',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Fichiers' />
            ),
            cell: ({ row }) => <EtapeSourcesCell idEtape={row.original.id_etape} />,
            enableSorting: false,
        },
        {
            id: 'actions',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Actions' />
            ),
            cell: ({ row }) => (
                <GenericRowActions
                    row={row}
                    actions={[
                        {
                            label: 'Modifier',
                            icon: <UserPen size={16} />,
                            onClick: (item) => onEdit(item),
                        },
                        {
                            label: 'Supprimer',
                            icon: <Trash2 size={16} />,
                            className: 'text-red-500!',
                            separator: true,
                            onClick: (item) => {
                                setCurrentRow(item)
                                setOpen('delete')
                            },
                        },
                    ]}
                />
            ),
        },
    ]