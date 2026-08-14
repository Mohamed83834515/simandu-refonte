// simadou/allColonnes/uglColumns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { Trash2, UserPen } from 'lucide-react'
import { VersionPPM } from '../allTypes/versionPPM'

type VersionPPMDialogType = 'delete' | 'edit'

export const buildVersionPPMColumns = (
    setOpen: (dialog: VersionPPMDialogType | null) => void,
    setCurrentRow: React.Dispatch<React.SetStateAction<VersionPPM | null>>,
    onEdit?: (row: any) => void
): ColumnDef<VersionPPM>[] => {
    return [
        {
            id: 'numero_version_ppm',
            accessorKey: 'numero_version_ppm',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Numéro de la Version' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>{row.original.numero_version_ppm}</div>
            ),
        },
        {
            id: 'date_version',
            accessorKey: 'date_version',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Date de la Version' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>{row.original.date_version}</div>
            ),
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
                            onClick: () => {
                                setCurrentRow(row.original)
                                if (onEdit) onEdit(row.original)
                                else setOpen('edit')
                            },
                        },
                        {
                            label: 'Supprimer',
                            icon: <Trash2 size={16} />,
                            onClick: () => {
                                setCurrentRow(row.original)
                                setOpen('delete')
                            },
                            className: 'text-red-500!',
                            separator: true,
                        },
                    ]}
                />
            ),
        },
    ]
}