import AddTypeFinancementPPM from '@/simadou/allfonctionalities/ppm/type-financement/AddTypeFinancementPPM'
import ListeTypeFinancementPPM from '@/simadou/allfonctionalities/ppm/type-financement/ListeTypeFinancementPPM'
import { TypeFinancementPPM } from '@/simadou/allTypes/typeFinancementPPM'
import { FileText } from 'lucide-react'
import { useState } from 'react'

type Mode = 'list' | 'add' | 'edit'

export function TypeFinancementPPMPage() {
  const [mode, setMode] = useState<Mode>('list')
  const [currentRow, setCurrentRow] = useState<TypeFinancementPPM | null>(null)

  const goList = () => {
    setMode('list')
    setCurrentRow(null)
  }
  const goAdd = () => {
    setMode('add')
    setCurrentRow(null)
  }
  const goEdit = (row: TypeFinancementPPM) => {
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
              ? 'Types de financement PPM'
              : mode === 'add'
                ? 'Ajouter un type de financement PPM'
                : 'Modifier un type de financement PPM'}
          </h2>
          <p className='mt-1 text-xs text-muted-foreground'>
            {mode === 'list'
              ? 'Gérez les types de financement PPM'
              : mode === 'add'
                ? 'Renseignez les informations du nouveau type de financement PPM'
                : `Modification de « ${currentRow?.code_type_financement_ppm} - ${currentRow?.intitule_type_financement_ppm} »`}
          </p>
        </div>
      </div>

      {mode === 'list' && (
        <ListeTypeFinancementPPM key='list' onAdd={goAdd} onEdit={goEdit} />
      )}

      {mode === 'add' && (
        <AddTypeFinancementPPM
          key='add'
          currentRow={null}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}

      {mode === 'edit' && currentRow && (
        <AddTypeFinancementPPM
          key={`edit-${currentRow.id_type_financement_ppm}`}
          currentRow={currentRow}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}
    </div>
  )
}
