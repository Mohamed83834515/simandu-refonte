import { buildColumns } from '@/Global/Tableaux/column-builder'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { Trash2, UserPen } from 'lucide-react'

type TypeFinancementDialogType = 'add' | 'edit' | 'delete'

export const buildTypeFinancementPPMColumns = (
  setOpen: (dialog: TypeFinancementDialogType | null) => void,
  setCurrentRow: any,
  onEdit?: (row: any) => void
) => [
  ...buildColumns([
    {
      type: 'text',
      key: 'code_type_financement_ppm',
      title: 'Code ',
    },
    {
      type: 'text',
      key: 'intitule_type_financement_ppm',
      title: 'Intitulé',
    },
  ]),
  {
    id: 'actions',
    cell: ({ row }: any) => (
      <GenericRowActions
        row={row}
        actions={[
          {
            label: 'Modifier',
            icon: <UserPen size={16} />,
            onClick: (item) => {
              setCurrentRow(item)
              if (onEdit) onEdit(item)
              else setOpen('edit')
            },
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
