import { type ColumnDef } from '@tanstack/react-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { ActiviteProjet } from '@/simadou/allTypes'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'

export function buildActiviteProjetColumns({
  showParent,
  getParentLabel,
  onEdit,
  onDeleteRequest,
  onOpenPlanification
}: {
  showParent: boolean
  getParentLabel: (row: ActiviteProjet) => string
  onEdit: (row: ActiviteProjet) => void
  onDeleteRequest: (row: ActiviteProjet) => void,
  onOpenPlanification: (activite: ActiviteProjet) => void
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
  const planificationColumn: ColumnDef<ActiviteProjet> = {
    id: 'planification',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Planification'
        className='w-full text-center'
      />
    ),
    cell: ({ row }) => {
      const activite = row.original
      return (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2 border-blue-200 bg-blue-50 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50'
            onClick={() => onOpenPlanification(activite)}
            aria-label='Ouvrir le suivi des tâches et indicateurs'
            title='Suivi des tâches et indicateurs'
          >
            <DollarSign className='h-4 w-4' />
            <span className='text-xs font-medium'>304000</span>
          </Button>
        </div>
      )
    },
    meta: {
      thClassName: 'text-center w-[100px]',
      className: 'text-center align-middle',
    },
    size: 100,
    enableSorting: false,
    enableHiding: false,
  }
  const parentColumn: ColumnDef<ActiviteProjet> = {
    id: 'parent_activite_projet',
    accessorKey: 'parent_activite_projet',
    header: 'Parent',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>{getParentLabel(row.original)}</span>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const actionsColumn = buildEditDeleteActionsColumn({
    onEdit,
    onDeleteRequest,
  })

  return showParent
    ? [...baseColumns, parentColumn, actionsColumn]
    : [...baseColumns, planificationColumn, actionsColumn]
}
