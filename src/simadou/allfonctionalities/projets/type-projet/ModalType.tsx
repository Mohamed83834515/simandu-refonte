// simadou/allfonctionalities/parametrage/categorie-acteur/TypeProjetDialog.tsx
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { DIALOG_SIZES } from "@/Global/Forms/dialog"
import AddTypeProjet from "./AddType"
import ListeTypeProjet from "./ListeType"
import { TypeProjet } from "@/simadou/allTypes/typeProjet"

export default function TypeProjetDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list")
  const [currentRow, setCurrentRow] = useState<TypeProjet | null>(null)

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

  const goEdit = (row: TypeProjet) => {
    setMode("edit")
    setCurrentRow(row)
  }

  const isListMode = mode === "list"

  const title =
    mode === "list"
      ? "types de projets"
      : mode === "add"
        ? "Ajouter un type"
        : "Modifier un type" 

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
        <DialogHeader className="shrink-0 border-b px-4 py-3 pr-12">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-3",
            mode !== "list" && "overflow-y-auto"
          )}
        >
          {mode === "list" && (
            <ListeTypeProjet
              key="list-mode"
              onAdd={goAdd}
              onEdit={goEdit}
            />
          )}

          {mode === "add" && (
            <AddTypeProjet
              key="add-mode"
              currentRow={null}
              onBack={goList}
              onCancel={goList}
              onSuccess={goList}
            />
          )}

          {mode === "edit" && currentRow && (
            <AddTypeProjet
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
