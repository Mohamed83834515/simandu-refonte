


import AddUniteIndicateur from '@/simadou/allfonctionalities/parametrage/autres/unite-indicateurs/AddUniteIndicateur'
import ListeUniteIndicateur from '@/simadou/allfonctionalities/parametrage/autres/unite-indicateurs/ListeUniteIndicateur'
import { createFileRoute } from '@tanstack/react-router'
import {  Ruler, } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
  '/_authenticated/parametrage/autres/unites-indicateur/',
)({
  component: UnitesIndicateurPage,
})

type Mode = 'list' | 'add' | 'edit'

function UnitesIndicateurPage() {
  const [mode, setMode]           = useState<Mode>('list')
  const [currentRow, setCurrentRow] = useState<any | null>(null)

  const goList = () => { setMode('list'); setCurrentRow(null) }
  const goAdd  = () => { setMode('add');  setCurrentRow(null) }
  const goEdit = (row: any) => { setMode('edit'); setCurrentRow(row) }

  return (
    <div className="flex flex-col gap-6">

      {/* Header — changes with mode */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
          <Ruler className="size-4 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-medium leading-none">
            {mode === 'list' ? "Unités d'indicateur"
            : mode === 'add'  ? "Ajouter une unité"
            :                   "Modifier une unité"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === 'list'
              ? "Gérez les unités de mesure pour les indicateurs (%, Kg, Nombre…)"
              : mode === 'add'
              ? "Renseignez les informations de la nouvelle unité"
              : `Modification de « ${currentRow?.unite_ui ?? ''} »`}
          </p>
        </div>
      </div>

      {/* Content */}
      {mode === 'list' && (
        <ListeUniteIndicateur
          key="list"
          onAdd={goAdd}
          onEdit={goEdit}
        />
      )}

      {mode === 'add' && (
        <AddUniteIndicateur
          key="add"
          currentRow={null}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}

      {mode === 'edit' && currentRow && (
        <AddUniteIndicateur
          key={`edit-${currentRow.id_unite}`}
          currentRow={currentRow}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}

    </div>
  )
}