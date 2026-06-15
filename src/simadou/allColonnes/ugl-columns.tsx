// simadou/allColonnes/uglColumns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { Trash2, UserPen } from 'lucide-react'
import { UGL } from '@/simadou/allTypes/ugl'
import { Badge } from '@/components/ui/badge'

type UglDialogType = 'delete' | 'edit'

export const buildUglColumns = (
    setOpen: (dialog: UglDialogType | null) => void,
    setCurrentRow: React.Dispatch<React.SetStateAction<UGL | null>>
): ColumnDef<UGL>[] => {
    return [
        {
            id: 'code_ugl',
            accessorKey: 'code_ugl',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Code' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>{row.original.code_ugl}</div>
            ),
        },
        {
            id: 'abrege_ugl',
            accessorKey: 'abrege_ugl',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Abréviation' />
            ),
        },
        {
            id: 'nom_ugl',
            accessorKey: 'nom_ugl',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Libellé' />
            ),
            cell: ({ row }) => (
                <div className='max-w-md whitespace-normal'>{row.original.nom_ugl}</div>
            ),
        },
        {
            id: 'chef_lieu_ugl',
            accessorKey: 'chef_lieu_ugl',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Zone d’intervention' />
            ),
            cell: ({ row }) => {
                const chefLieu = row.original.chef_lieu_ugl
                const label =
                    typeof chefLieu === 'object' && chefLieu !== null
                        ? (chefLieu as any)?.intitule_loca
                        : chefLieu || 'N/A'
                return <span>{label}</span>
            },
        },
        {
            id: 'region_concerne_ugl',
            accessorKey: 'region_concerne_ugl',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Régions concernées' />
            ),
            cell: ({ row }) => {
                const regions = row.original.region_concerne_ugl
                const regionList = Array.isArray(regions) ? regions : []
                return (
                    <div className='flex flex-wrap gap-1'>
                        {regionList.map((reg: any, idx: number) => (
                            <Badge key={idx} variant='secondary' className='text-xs'>
                                {typeof reg === 'object' ? reg.intitule_loca : reg}
                            </Badge>
                        ))}
                    </div>
                )
            },
        },
        {
            id: 'couleur_ugl',
            accessorKey: 'couleur_ugl',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Couleur' />
            ),
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <div
                        className='h-6 w-6 rounded-full border'
                        style={{ backgroundColor: row.original.couleur_ugl }}
                    />
                    <span className='text-sm'>{row.original.couleur_ugl}</span>
                </div>
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