import type { ColumnDef } from '@tanstack/react-table'
import type { Dispatch, SetStateAction } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'

export function buildContratPerformanceColumns(
    setOpen: (dialog: 'add' | 'edit' | 'delete' | null) => void,
    setCurrentRow: Dispatch<SetStateAction<ContratPerformance | null>>,
    onDetail?: (contrat: ContratPerformance) => void
): ColumnDef<ContratPerformance>[] {
    return [
        {
            id: 'code_contrat',
            accessorKey: 'code_contrat',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />,
            cell: ({ row }) => <span className='font-medium'>{row.original.code_contrat}</span>,
        },
        {
            id: 'intitule_contrat',
            accessorKey: 'intitule_contrat',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Intitulé' />,
            cell: ({ row }) => <span>{row.original.intitule_contrat}</span>,
        },
        {
            id: 'date_signature',
            accessorKey: 'date_signature',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date de signature' />,
            cell: ({ row }) => <span>{row.original.date_signature}</span>,
        },
        {
            id: 'duree',
            accessorKey: 'duree_contrat',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Durée du contrat' />,
            cell: ({ row }) => {
                const dateDebut = new Date(row.original.date_debut)
                const dateFin = new Date(row.original.date_fin)
                const dureeEnMois = (dateFin.getFullYear() - dateDebut.getFullYear()) * 12 + (dateFin.getMonth() - dateDebut.getMonth())
                return <span>{dureeEnMois} mois</span>
            },
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
            cell: ({ row }) => (
                <GenericRowActions
                    row={row}
                    actions={[
                        {
                            label: 'Détail',
                            icon: <Eye size={16} />,
                            onClick: (contrat) => onDetail?.(contrat),
                        },
                        {
                            label: 'Modifier',
                            icon: <Pencil size={16} />,
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
