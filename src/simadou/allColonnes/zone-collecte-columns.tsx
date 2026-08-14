// simadou/allColonnes/zoneCollecte-columns.tsx
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import { UserPen, Trash2, Download } from "lucide-react"
import { TypeZone, ZoneCollecte } from "../allTypes"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

type ZoneCollecteDialogType = 'add' | 'edit' | 'delete'

export const buildZoneCollecteColumns = (
    setOpen: (dialog: ZoneCollecteDialogType | null) => void,
    setCurrentRow: React.Dispatch<React.SetStateAction<ZoneCollecte | null>>,
     typeZones?: TypeZone[]
): ColumnDef<ZoneCollecte>[] => {
    return [
        {
            id: 'code_zone',
            accessorKey: 'code_zone',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Code' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>{row.original.code_zone}</div>
            ),
        },
        {
            id: 'nom_zone',
            accessorKey: 'nom_zone',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Nom ' />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>{row.original.nom_zone}</div>
            ),
        },
        {
            id: 'type_zone',
            accessorKey: 'type_zone',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Type de zone' />
            ),
            cell: ({ row }) => {
                // Récupérer l'ID du type de zone
                const typeZoneId = row.original.type_zone;
                
                // Trouver le type de zone correspondant
                const typeZone = typeZones?.find(t => String(t.id_type_zone) === String(typeZoneId));
                
                // Afficher le nom si trouvé, sinon afficher l'ID
                return (
                    <div className='max-w-md whitespace-normal'>
                        {typeZone?.nom_type_zone || typeZoneId || '-'}
                    </div>
                );
            },
        },
        {
            id: 'shape_file',
            accessorKey: 'shape_file',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Shape File' />
            ),
            cell: ({ row }) => {
                const fileUrl = row.original.shape_file as any;
                const fileName = row.original.nom_zone || 'shape_file';

                if (!fileUrl) {
                    return <span className='text-muted-foreground'>-</span>;
                }

                const handleDownload = () => {
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    link.download = `${fileName}.zip`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };

                return (
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='gap-2 text-blue-600 hover:text-blue-800'
                        onClick={handleDownload}
                    >
                        <Download className='h-4 w-4' />
                        Télécharger
                    </Button>
                );
            },
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