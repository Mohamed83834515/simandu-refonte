import { buildColumns } from "@/Global/Tableaux/column-builder"
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import { UserPen, Trash2 } from "lucide-react"
import { TypeProjet } from "../allTypes/typeProjet"

type TypeProjetDialogType = 'add' | 'edit' | 'delete'

export const buildTypeProjetColumns = (
  setOpen: (dialog: TypeProjetDialogType | null) => void,
  setCurrentRow: React.Dispatch<React.SetStateAction<TypeProjet | null>>,
  onEdit?: (row: TypeProjet) => void
) => [
  ...buildColumns([
    {
      type: "text",
      key: "code_type_projet",
      title: "Code",
    },
    {
      type: "text",
      key: "nom_type_projet",
      title: "Nom du Type du projet",
      maxWidth: "max-w-[min(100%,14rem)]",
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
            onClick: (item: TypeProjet) => {
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
            onClick: (item: TypeProjet) => {
              setCurrentRow(item)
              setOpen("delete")
            },
          },
        ]}
      />
    ),
  },
]