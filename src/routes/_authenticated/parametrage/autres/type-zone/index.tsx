import AddTypeZone from '@/simadou/allfonctionalities/parametrage/autres/type-zones/AddTypeZone'
import ListeTypeZone from '@/simadou/allfonctionalities/parametrage/autres/type-zones/ListeTypeZone'
import { createFileRoute } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
  '/_authenticated/parametrage/autres/type-zone/',
)({
  component: TypeZonePage,
})

type Mode = 'list' | 'add' | 'edit'

function TypeZonePage() {
  const [mode, setMode]             = useState<Mode>('list')
  const [currentRow, setCurrentRow] = useState<any | null>(null)

  const goList = () => { setMode('list'); setCurrentRow(null) }
  const goAdd  = () => { setMode('add');  setCurrentRow(null) }
  const goEdit = (row: any) => { setMode('edit'); setCurrentRow(row) }

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
          <MapPin className="size-4 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-medium leading-none">
            {mode === 'list' ? 'Types de zones'
            : mode === 'add'  ? 'Ajouter un type de zone'
            :                   'Modifier un type de zone'}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === 'list'
              ? 'Gérez les types de zones géographiques (Région, District, etc.)'
              : mode === 'add'
              ? 'Renseignez les informations du nouveau type de zone'
              : `Modification de « ${currentRow?.code_type_zone} - ${currentRow?.nom_type_zone} »`}
          </p>
        </div>
      </div>

      {mode === 'list' && (
        <ListeTypeZone
          key="list"
          onAdd={goAdd}
          onEdit={goEdit}
        />
      )}

      {mode === 'add' && (
        <AddTypeZone
          key="add"
          currentRow={null}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}

      {mode === 'edit' && currentRow && (
        <AddTypeZone
          key={`edit-${currentRow.id_type_zone}`}
          currentRow={currentRow}
          onBack={goList}
          onCancel={goList}
          onSuccess={goList}
        />
      )}

    </div>
  )
}