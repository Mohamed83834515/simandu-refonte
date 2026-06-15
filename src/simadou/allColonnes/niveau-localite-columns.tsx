import { buildColumns } from "@/Global/Tableaux/column-builder"
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import { Trash2 } from "lucide-react"

type NiveauDialogType = 'delete'

export const buildNiveauLocaliteColumns = (
  setOpen: (dialog: NiveauDialogType | null) => void,
  setCurrentRow: any,
) => [
  ...buildColumns([
    {
      type: "text",
      key: "nombre_nlc",
      title: "Niveau",
    },
    {
      type: "text",
      key: "libelle_nlc",
      title: "Libellé",
    },
    {
      type: "text",
      key: "Code_number_nlc",
      title: "Taille code",
    },
  ]),
  {
    id: "actions",
    cell: ({ row }: any) => (
      <GenericRowActions
        row={row}
        actions={[
          {
            label: "Supprimer",
            icon: <Trash2 size={16} />,
            className: "text-red-500!",
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