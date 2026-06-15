// simadou/allfonctionalities/parametrage/unite-indicateur/UniteIndicateurDialog.tsx
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIALOG_SIZES } from "@/Global/Forms/dialog"
import ListeUniteIndicateur from "./ListeUniteIndicateur"
import AddUniteIndicateur from "./AddUniteIndicateur"

export default function UniteIndicateurDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list")
  const [currentRow, setCurrentRow] = useState<any | null>(null)

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

  const goEdit = (row: any) => {
    setMode("edit")
    setCurrentRow(row)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={DIALOG_SIZES.lg}>
        <DialogHeader>
          <DialogTitle>
            {mode === "list"
              ? "Unités d'indicateur"
              : mode === "add"
                ? "Ajouter une unité"
                : "Modifier une unité"}
          </DialogTitle>
        </DialogHeader>

        {mode === "list" && (
          <ListeUniteIndicateur
            key="list-mode"
            onAdd={goAdd}
            onEdit={goEdit}
          />
        )}

        {mode === "add" && (
          <AddUniteIndicateur
            key="add-mode"
            currentRow={null}
            onBack={goList}
            onCancel={goList}
            onSuccess={goList}
          />
        )}

        {mode === "edit" && currentRow && (
          <AddUniteIndicateur
            key={`edit-mode-${currentRow.id_unite}`}
            currentRow={currentRow}
            onBack={goList}
            onCancel={goList}
            onSuccess={goList}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}