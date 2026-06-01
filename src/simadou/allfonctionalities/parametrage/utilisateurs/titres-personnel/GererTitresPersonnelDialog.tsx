import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import type { TitrePersonnel } from '@/simadou/allTypes'
import ListeTitresPersonnel from './ListeTitresPersonnel'
import TitrePersonnelFormPanel from './TitrePersonnelFormPanel'

type Mode = 'list' | 'add' | 'edit'

export default function GererTitresPersonnelDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<Mode>('list')
  const [currentRow, setCurrentRow] = useState<TitrePersonnel | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMode('list')
      setCurrentRow(null)
    }
    onOpenChange(nextOpen)
  }

  const goList = () => {
    setMode('list')
    setCurrentRow(null)
  }

  const title =
    mode === 'list'
      ? 'Gérer les titres'
      : mode === 'add'
        ? 'Ajouter un titre'
        : 'Modifier le titre'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={DIALOG_SIZES.xl}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {mode === 'list' && (
          <ListeTitresPersonnel
            onAdd={() => {
              setCurrentRow(null)
              setMode('add')
            }}
            onEdit={(row) => {
              setCurrentRow(row)
              setMode('edit')
            }}
          />
        )}

        {mode === 'add' && (
          <TitrePersonnelFormPanel onClose={goList} onSuccess={goList} />
        )}

        {mode === 'edit' && currentRow && (
          <TitrePersonnelFormPanel
            key={currentRow.id_titre}
            titre={currentRow}
            onClose={goList}
            onSuccess={goList}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
