import { type ColumnDef } from '@tanstack/react-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { ActiviteProjet, NiveauActiviteProjet } from '@/simadou/allTypes'
import { Button } from '@/components/ui/button'
import {  List } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'

export function buildActiviteProjetColumns({
  showParent,
  getParentAtLevel,
  niveaux, // Tous les niveaux avec leurs libellés
  niveauActuel,
  onEdit,
  onDeleteRequest,
  onOpenPlanification,
  onOpenPlanificationIndicateur,
  getIndicateurCount,
  isLastLevel,
}: {
  showParent: boolean
  getParentAtLevel?: (row: ActiviteProjet, niveau: number) => string
  niveaux: NiveauActiviteProjet[] // Liste des niveaux avec libellés
  niveauActuel?: number
  onEdit: (row: ActiviteProjet) => void
  onDeleteRequest: (row: ActiviteProjet) => void
  onOpenPlanification: (activite: ActiviteProjet) => void
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

  // Construire dynamiquement les colonnes des parents avec leurs vrais libellés
  const parentColumns: ColumnDef<ActiviteProjet>[] = []

  if (niveaux && niveauActuel && getParentAtLevel) {
    // Filtrer les niveaux inférieurs au niveau actuel
    const niveauxInferieurs = niveaux
      .filter(n => n.nombre_niveau_activite_projet < niveauActuel)
      .sort((a, b) => a.nombre_niveau_activite_projet - b.nombre_niveau_activite_projet)

    for (const niveau of niveauxInferieurs) {
      parentColumns.push({
        id: `parent_niveau_${niveau.nombre_niveau_activite_projet}`,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={niveau.libelle_niveau_activite_projet} // Utilise le vrai libellé
          />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>
            {getParentAtLevel(row.original, niveau.nombre_niveau_activite_projet)}
          </span>
        ),
        enableSorting: false,
      })
    }
  }

  // Colonne Planification des sources
  const planificationColumn: ColumnDef<ActiviteProjet> = {
    id: 'planification_source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Planification' className='text-center' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
          onClick={() => onOpenPlanification(row.original)}
        >{row.original.budget}
        </Button>
      </div>
    ),
    meta: { thClassName: 'text-center', className: 'text-center' },
    size: 100,
    enableSorting: false,
  }

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

  const columns = []

  // Ajouter les colonnes des parents avec leurs libellés
  if (showParent && niveauActuel && niveauActuel > 1) {
    columns.push(...parentColumns,...baseColumns)
  } else {
    columns.push(...baseColumns, planificationColumn)

  }


  if (isLastLevel) {
    columns.push(planificationIndicateurColumn)
  }

  columns.push(actionsColumn)

  return columns
}