import AddNatureMarche from '@/simadou/allfonctionalities/ppm/natures-marche/AddNatureMarche'
import ListeNatureMarche from '@/simadou/allfonctionalities/ppm/natures-marche/ListeNatureMarche'
import type { NatureMarche } from '@/simadou/allTypes/natureMarche'
import { createFileRoute } from '@tanstack/react-router'
import { Tags } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
  '/_authenticated/programmation/parametrage-marches/natures-marche/',
)({
  component: NaturesMarchePage,
})

type Mode = 'list' | 'add' | 'edit'

function NaturesMarchePage() {
  const [mode, setMode] = useState<Mode>('list')
  const [currentRow, setCurrentRow] = useState<NatureMarche | null>(null)

  const goList = () => {
    setMode('list')
    setCurrentRow(null)
  }
  const goAdd = () => {
    setMode('add')
    setCurrentRow(null)
  }
  const goEdit = (row: NatureMarche) => {
    setMode('edit')
    setCurrentRow(row)
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-3'>
        <div className='flex size-9 items-center justify-center rounded-lg border border-border bg-muted'>
          <Tags className='size-4 text-muted-foreground' />
        </div>
        <div>
          <h2 className='text-sm font-medium leading-none'>
            {mode === 'list'
              ? 'Natures de marché'
              : mode === 'add'
                ? 'Ajouter une nature de marché'
                : 'Modifier une nature de marché'}
          </h2>
          <p className='mt-1 text-xs text-muted-foreground'>
            {mode === 'list'
              ? 'Gérez les natures de marché (Travaux, Fournitures, Services, etc.)'
              : mode === 'add'
                ? 'Renseignez les informations de la nouvelle nature de marché'
                : `Modification de « ${currentRow?.code_nature_marche} - ${currentRow?.intitule_nature_marche} »`}
          </p>
        </div>
      </div>

      {mode === 'list' && (
        <ListeNatureMarche key='list' onAdd={goAdd} onEdit={goEdit} />
      )}

      {mode === 'add' && (
        <AddNatureMarche
          key='add'
          currentRow={null}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}

      {mode === 'edit' && currentRow && (
        <AddNatureMarche
          key={`edit-${currentRow.id_nature_marche}`}
          currentRow={currentRow}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}
    </div>
  )
}
