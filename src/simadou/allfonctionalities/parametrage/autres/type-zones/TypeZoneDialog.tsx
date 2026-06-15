// simadou/allfonctionalities/parametrage/type-zone/TypeZoneDialog.tsx
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIALOG_SIZES } from "@/Global/Forms/dialog"
import ListeTypeZone from "./ListeTypeZone"
import AddTypeZone from "./AddTypeZone"

export default function TypeZoneDialog({
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
      <DialogContent className={DIALOG_SIZES.md}>
        <DialogHeader>
          <DialogTitle>
            {mode === "list"
              ? "Types de zones"
              : mode === "add"
                ? "Ajouter un type de zone"
                : "Modifier un type de zone"}
          </DialogTitle>
        </DialogHeader>

        {mode === "list" && (
          <ListeTypeZone
            key="list-mode"
            onAdd={goAdd}
            onEdit={goEdit}
          />
        )}

        {mode === "add" && (
          <AddTypeZone
            key="add-mode"
            currentRow={null}
            onBack={goList}
            onCancel={goList}
            onSuccess={goList}
          />
        )}

        {mode === "edit" && currentRow && (
          <AddTypeZone
            key={`edit-mode-${currentRow.id_type_zone}`}
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