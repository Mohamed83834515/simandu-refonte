// simadou/allColonnes/categorieActeur-columns.tsx
import { buildColumns } from "@/Global/Tableaux/column-builder"
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import { UserPen, Trash2 } from "lucide-react"
import { CategorieActeur } from "@/simadou/allTypes/categorieActeur"

type CategorieDialogType = 'add' | 'edit' | 'delete'

export const buildCategorieActeurColumns = (
  setOpen: (dialog: CategorieDialogType | null) => void,
  setCurrentRow: React.Dispatch<React.SetStateAction<CategorieActeur | null>>,
  onEdit?: (row: CategorieActeur) => void
) => [
  ...buildColumns([
    {
      type: "text",
      key: "code_cat",
      title: "Code",
    },
    {
      type: "text",
      key: "nom_categorie",
      title: "Nom catégorie",
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
            onClick: (item: CategorieActeur) => {
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
            onClick: (item: CategorieActeur) => {
              setCurrentRow(item)
              setOpen("delete")
            },
          },
        ]}
      />
    ),
  },
]