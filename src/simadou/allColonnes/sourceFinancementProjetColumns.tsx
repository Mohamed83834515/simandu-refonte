import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { Trash2, UserPen } from 'lucide-react'
import { SourFinancementProjet } from '../allTypes/sourceFinancemanetProjet'

type SourceFinancementDialogType = 'delete'

export const buildSourceFinancementProjetColumns = (
  setOpen: (dialog: SourceFinancementDialogType | null) => void,
  setCurrentRow: React.Dispatch<React.SetStateAction<SourFinancementProjet | null>>,
  onEdit: (tache: SourFinancementProjet) => void,
  currencyCode?: string
): ColumnDef<SourFinancementProjet>[] => {

  return [
    {
      id: 'intitule_source_financement',
      accessorKey: 'intitule_source_financement',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.intitule_source_financement}</div>
      ),
    },
    {
      id: 'montant_source_financement',
      accessorKey: 'montant_source_financement',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Montant' />
      ),
      cell: ({ row }) => (
        <div className='font-mono tabular-nums'>
          {new Intl.NumberFormat('fr-FR').format(Number(row.original.montant_source_financement))} {currencyCode || "GNF"}
        </div>
      ),
    },
    {
      id: 'date_signature_convention',
      accessorKey: 'date_signature_convention',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date signature' />
      ),
      cell: ({ row }) => (
        <div>{new Date(row.original.date_signature_convention).toLocaleDateString('fr-FR')}</div>
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
              onClick: onEdit,
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