import type { ColumnDef } from '@tanstack/react-table'
import {  Trash2, UserPen } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { RecommandationMissionProjet } from '@/simadou/allTypes/recommandationMissionProjet'
import {  formatTypeRecommandation } from '@/simadou/lib/missionRecommandationUtils'
import { resolvePersonnelLabel } from '@/simadou/lib/resolveApiRelation'

type RecommandationDialogType = 'edit' | 'delete'

type BuildRecommandationMissionProjetColumnsProps = {
  setOpen: (dialog: RecommandationDialogType | null) => void
  setCurrentRow: React.Dispatch<
    React.SetStateAction<RecommandationMissionProjet | null>
  >
  personnelsById?: Map<
    number,
    { prenom_perso?: string; nom_perso?: string }
  >
}

export function buildRecommandationMissionProjetColumns({
  setOpen,
  setCurrentRow,
  personnelsById,
}: BuildRecommandationMissionProjetColumnsProps): ColumnDef<RecommandationMissionProjet>[] {
  return [
    {
      id: 'numero',
      accessorKey: 'numero',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='N°' />
      ),
      cell: ({ row }) => row.original.numero || '—',
    },
    {
      id: 'volet_recommandation',
      accessorKey: 'volet_recommandation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Volet' />
      ),
      cell: ({ row }) => row.original.volet_recommandation || '—',
    },
    {
      id: 'ref_no',
      accessorKey: 'ref_no',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Réf.' />
      ),
      cell: ({ row }) => row.original.ref_no || '—',
    },

    {
      id: 'recommandation',
      accessorKey: 'recommandation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Recommandation' />
      ),
      cell: ({ row }) => (
        <div className='max-w-md whitespace-normal'>
          {row.original.recommandation || '—'}
        </div>
      ),
    },

    {
      id: 'date_buttoir',
      accessorKey: 'date_buttoir',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date butoir' />
      ),
      cell: ({ row }) =>
        row.original.date_buttoir
          ? new Date(row.original.date_buttoir).toLocaleDateString('fr-FR')
          : '—',
    },
    {
      id: 'type_recommandation',
      accessorKey: 'type_recommandation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) =>
        formatTypeRecommandation(row.original.type_recommandation),
    },
    {
      id: 'responsable',
      accessorKey: 'responsable',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Responsable' />
      ),
      cell: ({ row }) =>
        resolvePersonnelLabel(row.original.responsable, personnelsById) || '—',
    },
    // {
    //   id: 'rapport',
    //   accessorKey: 'rapport',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title='Rapport' />
    //   ),
    //   cell: ({ row }) => {
    //     const url = row.original.rapport
    //     if (!url || typeof url !== 'string') {
    //       return <span className='text-muted-foreground'>—</span>
    //     }
    //     return (
    //       <Button variant='ghost' size='sm' className='gap-2' asChild>
    //         <a href={url} target='_blank' rel='noreferrer'>
    //           <Download className='h-4 w-4' />
    //           Télécharger
    //         </a>
    //       </Button>
    //     )
    //   },
    // },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <GenericRowActions
          row={row}
          actions={[
            {
              label: 'Modifier',
              icon: <UserPen size={16} />,
              onClick: () => {
                setCurrentRow(row.original)
                setOpen('edit')
              },
            },
            {
              label: 'Supprimer',
              icon: <Trash2 size={16} className='text-red-500' />,
              className: 'text-red-500!',
              separator: true,
              onClick: () => {
                setCurrentRow(row.original)
                setOpen('delete')
              },
            },
          ]}
        />
      ),
    },
  ]
}
