import AddModePassation from '@/simadou/allfonctionalities/ppm/modes-passation/AddModePassation'
import ListeModePassation from '@/simadou/allfonctionalities/ppm/modes-passation/ListeModePassation'
import type { ModePassation } from '@/simadou/allTypes/modePassation'
import { FileText } from 'lucide-react'
import { useState } from 'react'
type Mode = 'list' | 'add' | 'edit'

export function ModesPassationPage() {
  const [mode, setMode] = useState<Mode>('list')
  const [currentRow, setCurrentRow] = useState<ModePassation | null>(null)

  const goList = () => {
    setMode('list')
    setCurrentRow(null)
  }
  const goAdd = () => {
    setMode('add')
    setCurrentRow(null)
  }
  const goEdit = (row: ModePassation) => {
    setMode('edit')
    setCurrentRow(row)
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-3'>
        <div className='flex size-9 items-center justify-center rounded-lg border border-border bg-muted'>
          <FileText className='size-4 text-muted-foreground' />
        </div>
        <div>
          <h2 className='text-sm font-medium leading-none'>
            {mode === 'list'
              ? 'Modes de passation'
              : mode === 'add'
                ? 'Ajouter un mode de passation'
                : 'Modifier un mode de passation'}
          </h2>
          <p className='mt-1 text-xs text-muted-foreground'>
            {mode === 'list'
              ? 'Gérez les modes de passation des marchés (AO, AON, ED, etc.)'
              : mode === 'add'
                ? 'Renseignez les informations du nouveau mode de passation'
                : `Modification de « ${currentRow?.code_mode_passation} - ${currentRow?.intitule_mode_passation} »`}
          </p>
        </div>
      </div>

      {mode === 'list' && (
        <ListeModePassation key='list' onAdd={goAdd} onEdit={goEdit} />
      )}

      {mode === 'add' && (
        <AddModePassation
          key='add'
          currentRow={null}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}

      {mode === 'edit' && currentRow && (
        <AddModePassation
          key={`edit-${currentRow.id_mode_passation}`}
          currentRow={currentRow}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}
    </div>
  )
}
