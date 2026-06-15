import { type ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import type { Ptba, TacheActivitePtba } from '@/simadou/allTypes'
import TacheAvancementProgressBar from '@/simadou/allfonctionalities/suivi-ptba/TacheAvancementProgressBar'

export type SuiviPtbaColumnHandlers = {
  onOpenSuivi: (activite: Ptba) => void
  onOpenObservations: (activite: Ptba) => void
  tachesByActivite: Map<number, TacheActivitePtba[]>
  avancementByActivite: Map<number, number>
  progressLoading: boolean
}

export function buildSuiviPtbaProjetColumns(
  handlers: SuiviPtbaColumnHandlers
): ColumnDef<Ptba>[] {
  const {
    onOpenSuivi,
    onOpenObservations,
    tachesByActivite,
    avancementByActivite,
    progressLoading,
  } = handlers

  const baseColumns = buildColumns<Ptba>([
    {
      type: 'text',
      key: 'code_activite_ptba',
      title: 'Code',
      sticky: true,
    },
    {
      type: 'text',
      key: 'intitule_activite_ptba',
      title: 'Activité',
      maxWidth: 'max-w-md',
    },
    { type: 'plain', key: 'version_ptba', title: 'Version PTBA' },
  ])

  const avancementColumn: ColumnDef<Ptba> = {
    id: 'avancement_taches',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Avancement des tâches' />
    ),
    cell: ({ row }) => {
      const id = row.original.id_ptba
      if (progressLoading) {
        return (
          <div className='h-2 max-w-[120px] animate-pulse rounded-full bg-muted' />
        )
      }
      if ((tachesByActivite.get(id) ?? []).length === 0) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }
      return (
        <TacheAvancementProgressBar
          percent={avancementByActivite.get(id) ?? 0}
          compact
        />
      )
    },
    maxSize:150,
    enableSorting: false,
    enableHiding: false,
  }

  const suiviColumn: ColumnDef<Ptba> = {
    id: 'suivi',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Suivis des resultats'
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
            className='gap-2 border-yellow-200 bg-yellow-50 text-yellow-700 transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-950/50'
            onClick={() => onOpenSuivi(activite)}
            aria-label='Ouvrir le suivi des tâches et indicateurs'
            title='Suivi des tâches et indicateurs'
          >
            <ClipboardList className='h-4 w-4' />
            <span className='text-xs font-medium'>Suivre</span>
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


  const observationsColumn: ColumnDef<Ptba> = {
    id: 'observations',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Observations' />
    ),
    cell: ({ row }) => (
      <Button
        type='button'
        variant='link'
        className='h-auto p-0 text-xs'
        onClick={() => onOpenObservations(row.original)}
      >
        Observations
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  }

  return [...baseColumns, avancementColumn, suiviColumn,  observationsColumn]
}
