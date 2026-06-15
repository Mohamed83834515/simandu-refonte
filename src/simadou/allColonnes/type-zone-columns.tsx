// simadou/allColonnes/typeZone-columns.tsx
import { buildColumns } from "@/Global/Tableaux/column-builder"
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import { UserPen, Trash2 } from "lucide-react"

type TypeZoneDialogType = 'add' | 'edit' | 'delete'

export const buildTypeZoneColumns = (
  setOpen: (dialog: TypeZoneDialogType | null) => void,
  setCurrentRow: any,
  onEdit?: (row: any) => void
) => [
  ...buildColumns([
    {
      type: "text",
      key: "code_type_zone",
      title: "Code",
    },
    {
      type: "text",
      key: "nom_type_zone",
      title: "Nom",
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