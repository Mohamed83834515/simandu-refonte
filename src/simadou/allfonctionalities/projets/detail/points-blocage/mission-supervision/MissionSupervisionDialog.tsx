import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import type { Projet } from '@/simadou/allTypes'
import type { MissionSupervisionProjet } from '@/simadou/allTypes/missionSupervisionProjet'
import AddMissionSupervisionProjet from './AddMissionSupervisionProjet'
import ListeMissionSupervisionProjet from './ListeMissionSupervisionProjet'

type Mode = 'list' | 'add' | 'edit'

type Props = {
  projet: Projet
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MissionSupervisionDialog({
  projet,
  open,
  onOpenChange,
}: Props) {
  const [mode, setMode] = useState<Mode>('list')
  const [currentRow, setCurrentRow] = useState<MissionSupervisionProjet | null>(
    null
  )

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMode('list')
      setCurrentRow(null)
    }
    onOpenChange(newOpen)
  }

  const goList = () => {
    setMode('list')
    setCurrentRow(null)
  }

  const goAdd = () => {
    setMode('add')
    setCurrentRow(null)
  }

  const goEdit = (row: MissionSupervisionProjet) => {
    setMode('edit')
    setCurrentRow(row)
  }

  const isListMode = mode === 'list'

  const title =
    mode === 'list'
      ? 'Missions de supervision'
      : mode === 'add'
        ? 'Ajouter une mission'
        : 'Modifier la mission'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          isListMode
            ? cn(DIALOG_SIZES.formWide, 'sm:max-w-[50rem]')
            : DIALOG_SIZES.lg,
          'flex flex-col gap-0 overflow-hidden p-0 transition-[max-width] duration-200',
          isListMode
            ? 'min-h-[min(72vh,32rem)] max-h-[min(90vh,42rem)]'
            : 'max-h-[min(90vh,36rem)]'
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className='shrink-0 border-b px-4 py-3 pr-12'>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-3',
            isListMode ? 'overflow-hidden' : 'overflow-y-auto'
          )}
        >
          {mode === 'list' && (
            <ListeMissionSupervisionProjet
              key='list-mode'
              projet={projet}
              onAdd={goAdd}
              onEdit={goEdit}
            />
          )}

          {mode === 'add' && (
            <AddMissionSupervisionProjet
              key='add-mode'
              projet={projet}
              currentRow={null}
              onBack={goList}
              onSuccess={goList}
            />
          )}

          {mode === 'edit' && currentRow && (
            <AddMissionSupervisionProjet
              key={`edit-${currentRow.id_mission}`}
              projet={projet}
              currentRow={currentRow}
              onBack={goList}
              onSuccess={goList}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
