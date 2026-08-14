import { buildColumns } from '@/Global/Tableaux/column-builder'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import { Trash2, UserPen } from 'lucide-react'

type ModePassationDialogType = 'add' | 'edit' | 'delete'

export const buildModePassationColumns = (
  setOpen: (dialog: ModePassationDialogType | null) => void,
  setCurrentRow: any,
  onEdit?: (row: any) => void
) => [
  ...buildColumns([
    {
      type: 'text',
      key: 'code_mode_passation',
      title: 'Code',
    },
    {
      type: 'text',
      key: 'intitule_mode_passation',
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
