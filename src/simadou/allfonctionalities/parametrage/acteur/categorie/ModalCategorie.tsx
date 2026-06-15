// simadou/allfonctionalities/parametrage/categorie-acteur/CategorieActeurDialog.tsx
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { DIALOG_SIZES } from "@/Global/Forms/dialog"
import { CategorieActeur } from "@/simadou/allTypes/categorieActeur"
import ListeCategorieActeur from "./ListeCategorie"
import AddCategorieActeur from "./AddCategorie"

export default function CategorieActeurDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list")
  const [currentRow, setCurrentRow] = useState<CategorieActeur | null>(null)

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMode("list")
      setCurrentRow(null)
    }
    onOpenChange(newOpen)
  }

  const goList = () => {
    setMode("list")
    setCurrentRow(null)
  }

  const goAdd = () => {
    setMode("add")
    setCurrentRow(null)
  }

  const goEdit = (row: CategorieActeur) => {
    setMode("edit")
    setCurrentRow(row)
  }

  const isListMode = mode === "list"

  const title =
    mode === "list"
      ? "Catégories d'acteurs"
      : mode === "add"
        ? "Ajouter une catégorie"
        : "Modifier une catégorie"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          isListMode ? DIALOG_SIZES.formWide : DIALOG_SIZES.form,
          "flex flex-col gap-0 overflow-hidden p-0 transition-[max-width] duration-200",
          isListMode
            ? "min-h-[min(70vh,28rem)] max-h-[min(90vh,40rem)]"
            : "max-h-[min(90vh,36rem)]"
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4 pr-12">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-6 py-4",
            mode !== "list" && "overflow-y-auto"
          )}
        >
          {mode === "list" && (
            <ListeCategorieActeur
              key="list-mode"
              onAdd={goAdd}
              onEdit={goEdit}
            />
          )}

          {mode === "add" && (
            <AddCategorieActeur
              key="add-mode"
              currentRow={null}
              onBack={goList}
              onCancel={goList}
              onSuccess={goList}
            />
          )}

          {mode === "edit" && currentRow && (
            <AddCategorieActeur
              key={`edit-mode-${currentRow.id_categorie}`}
              currentRow={currentRow}
              onBack={goList}
              onCancel={goList}
              onSuccess={goList}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}