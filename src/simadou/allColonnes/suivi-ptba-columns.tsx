import { type ColumnDef } from '@tanstack/react-table'
import { ClipboardList, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import type { Ptba, TacheActivitePtba, SuiviAvancementContrat } from '@/simadou/allTypes'
import TacheAvancementProgressBar from '@/simadou/allfonctionalities/suivi-ptba/TacheAvancementProgressBar'

export type SuiviPtbaColumnHandlers = {
  onOpenSuivi: (activite: Ptba) => void
  onOpenObservations: (activite: Ptba) => void
  tachesByActivite: Map<number, TacheActivitePtba[]>
  avancementByActivite: Map<number, number>
  progressLoading: boolean
  observationsByActivite: Map<number, SuiviAvancementContrat[]>
  isLoadingObservations: boolean
}

export function buildSuiviPtbaColumns(
  handlers: SuiviPtbaColumnHandlers
): ColumnDef<Ptba>[] {
  const {
    onOpenSuivi,
    onOpenObservations,
    tachesByActivite,
    avancementByActivite,
    progressLoading,
    observationsByActivite,
    isLoadingObservations,
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

  // Colonne Avancement des tâches
  const avancementColumn: ColumnDef<Ptba> = {
    id: 'avancement_taches',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Avancement des tâches' />
    ),
    cell: ({ row }) => {
      const id = row.original.id_ptba
      if (progressLoading) {
        return <div className='h-2 max-w-[120px] animate-pulse rounded-full bg-muted' />
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
    maxSize: 150,
    enableSorting: false,
    enableHiding: false,
  }

  // Colonne État d'avancement (dernière observation)
  const etatAvancementColumn: ColumnDef<Ptba> = {
    id: 'etat_avancement',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='État avancement' />
    ),
    cell: ({ row }) => {
      const id = row.original.id_ptba
      const observations = observationsByActivite.get(id) ?? []
      
      if (isLoadingObservations) {
        return <div className='h-2 max-w-[120px] animate-pulse rounded-full bg-muted' />
      }
      
      if (observations.length === 0) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }
      
      const dernier = [...observations].sort((a, b) => 
        new Date(b.date_suivi).getTime() - new Date(a.date_suivi).getTime()
      )[0]
      
      return (
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm font-medium'>{dernier.etat_avancement || '—'}</span>
          <span className='text-[10px] text-muted-foreground'>
            {new Date(dernier.date_suivi).toLocaleDateString('fr-FR')}
          </span>
        </div>
      )
    },
    maxSize: 200,
    enableSorting: false,
    enableHiding: false,
  }

  // Colonne Difficultés rencontrées (dernière observation)
  const difficulteColumn: ColumnDef<Ptba> = {
    id: 'difficultes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Difficultés' />
    ),
    cell: ({ row }) => {
      const id = row.original.id_ptba
      const observations = observationsByActivite.get(id) ?? []
      
      if (isLoadingObservations) {
        return <div className='h-2 max-w-[120px] animate-pulse rounded-full bg-muted' />
      }
      
      if (observations.length === 0) {
        return <span className='text-xs text-muted-foreground'>—</span>
      }
      
      const dernier = [...observations].sort((a, b) => 
        new Date(b.date_suivi).getTime() - new Date(a.date_suivi).getTime()
      )[0]
      
      return (
        <span className='text-sm text-amber-600 dark:text-amber-400'>
          {dernier.difficultes_rencontrees && dernier.difficultes_rencontrees !== 'N/A' 
            ? dernier.difficultes_rencontrees 
            : '—'}
        </span>
      )
    },
    maxSize: 200,
    enableSorting: false,
    enableHiding: false,
  }

  // Colonne Suivi (bouton)
  const suiviColumn: ColumnDef<Ptba> = {
    id: 'suivi',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Suivi' className='text-center' />
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
            aria-label='Ouvrir le suivi'
            title='Suivi des tâches et indicateurs'
          >
            <ClipboardList className='h-4 w-4' />
            <span className='text-xs font-medium'>Suivre</span>
          </Button>
        </div>
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    size: 100,
    enableSorting: false,
    enableHiding: false,
  }

  // Colonne Observations (bouton)
  const observationsColumn: ColumnDef<Ptba> = {
    id: 'observations',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Observations' className='text-center' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='gap-1'
          onClick={() => onOpenObservations(row.original)}
        >
          <Eye className='h-4 w-4' />
          <span className='text-xs'>Voir</span>
        </Button>
      </div>
    ),
    meta: { thClassName: 'text-center', className: 'text-center' },
    size: 100,
    enableSorting: false,
    enableHiding: false,
  }

  return [...baseColumns, avancementColumn, etatAvancementColumn, difficulteColumn, suiviColumn, observationsColumn]
}