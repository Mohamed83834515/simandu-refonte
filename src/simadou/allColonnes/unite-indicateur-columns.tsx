// simadou/allColonnes/uniteIndicateur-columns.tsx
import { buildColumns } from "@/Global/Tableaux/column-builder"
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import { UserPen, Trash2 } from "lucide-react"

type UniteDialogType = 'add' | 'edit' | 'delete'

export const buildUniteIndicateurColumns = (
  setOpen: (dialog: UniteDialogType | null) => void,
  setCurrentRow: any,
  onEdit?: (row: any) => void
) => [
  ...buildColumns([
    {
      type: "text",
      key: "unite_ui",
      title: "Unité",
    },
    {
      type: "text",
      key: "definition_ui",
      title: "Définition",
      maxWidth: "max-w-md",
    },
  ]),
  {
    id: "actions",
    cell: ({ row }: any) => (
      <GenericRowActions
        row={row}
        actions={[
          {
            label: "Modifier",
            icon: <UserPen size={16} />,
            onClick: (item) => {
              setCurrentRow(item)
              if (onEdit) onEdit(item)
              else setOpen('edit')
            },
          },
          {
            label: "Supprimer",
            icon: <Trash2 size={16} />,
            className: "text-red-500!",
            separator: true,
            onClick: (item) => {
              setCurrentRow(item)
              setOpen("delete")
            },
          },
        ]}
      />
    ),
  },
]