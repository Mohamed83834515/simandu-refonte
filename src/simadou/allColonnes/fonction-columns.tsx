// simadou/allColonnes/uglColumns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { Trash2, UserPen } from 'lucide-react'
import { Fonction } from '../allTypes'

type FonctionDialogType = 'delete' | 'edit'

export const buildFonctionColumns = (
    setOpen: (dialog: FonctionDialogType | null) => void,
    setCurrentRow: React.Dispatch<React.SetStateAction<Fonction | null>>
): ColumnDef<Fonction>[] => {
    return [
        {
            id: 'nom_fonction',
            accessorKey: 'nom_fonction',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Nom ' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>{row.original.nom_fonction}</div>
            ),
        },
        {
            id: 'description_fonction',
            accessorKey: 'description_fonction',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Description' />
            ),
            cell: ({ row }) => (
                <div className='max-w-md whitespace-normal'>{row.original.description_fonction}</div>
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
                                setOpen('edit')
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