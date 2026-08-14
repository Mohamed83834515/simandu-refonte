import { type ColumnDef } from '@tanstack/react-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { ActiviteProjet, NiveauActiviteProjet } from '@/simadou/allTypes'
import { Button } from '@/components/ui/button'
import { List } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'

export function buildActiviteProjetColumns({
  showParent,
  getParentAtLevel,
  niveaux,
  niveauActuel,
  onEdit,
  onDeleteRequest,
  onOpenPlanificationIndicateur,
  getIndicateurCount,
  isLastLevel,
}: {
  showParent: boolean
  getParentAtLevel?: (row: ActiviteProjet, niveau: number) => string
  niveaux: NiveauActiviteProjet[]
  niveauActuel?: number
  onEdit: (row: ActiviteProjet) => void
  onDeleteRequest: (row: ActiviteProjet) => void
  onOpenPlanification?: (activite: ActiviteProjet) => void
  onOpenPlanificationIndicateur: (activite: ActiviteProjet) => void
  getIndicateurCount?: (activite: ActiviteProjet) => number
  isLastLevel?: boolean
}): ColumnDef<ActiviteProjet>[] {

  const baseColumns = buildColumns<ActiviteProjet>([
    { type: 'text', key: 'code_activite_projet', title: 'Code', sticky: true },
    {
      type: 'text',
      key: 'intitule_activite_projet',
      title: 'Intitulé',
      maxWidth: 'max-w-md',
    },
  ])
  
  // ✅ Colonne du parent immédiat (uniquement le niveau précédent)
  const parentColumn: ColumnDef<ActiviteProjet> | null = (() => {
    // Si on ne doit pas afficher le parent ou qu'on n'a pas les infos nécessaires
    if (!showParent || !niveauActuel || niveauActuel <= 1 || !getParentAtLevel) {
      return null
    }

    // ✅ Trouver le niveau précédent (parent immédiat)
    const parentNiveau = niveaux.find(
      (n) => n.nombre_niveau_activite_projet === niveauActuel - 1
    )

    if (!parentNiveau) return null

    return {
      id: `parent_niveau_${parentNiveau.nombre_niveau_activite_projet}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={parentNiveau.libelle_niveau_activite_projet} // Libellé du parent
        />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {getParentAtLevel(row.original, parentNiveau.nombre_niveau_activite_projet)}
        </span>
      ),
      enableSorting: false,
    }
  })()

  // Colonne Planification des indicateurs (uniquement dernier niveau)
  const planificationIndicateurColumn: ColumnDef<ActiviteProjet> = {
    id: 'planification_indicateur',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Indicateurs' className='text-center' />
    ),
    cell: ({ row }) => {
      const count = getIndicateurCount?.(row.original) ?? 0

      return (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
            onClick={() => onOpenPlanificationIndicateur(row.original)}
          >
            <List className='h-4 w-4' />
            Indicateurs ({count})
          </Button>
        </div>
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    size: 100,
    enableSorting: false,
  }

  const actionsColumn = buildEditDeleteActionsColumn({ onEdit, onDeleteRequest })

  const columns: ColumnDef<ActiviteProjet>[] = []

  // ✅ Ajouter la colonne du parent immédiat si elle existe
  if (parentColumn) {
    columns.push(parentColumn)
  }

  // Ajouter les colonnes de base
  columns.push(...baseColumns)

  // Ajouter la colonne des indicateurs si dernier niveau
  if (isLastLevel) {
    columns.push(planificationIndicateurColumn)
  }

  // Ajouter la colonne des actions
  columns.push(actionsColumn)

  return columns
}