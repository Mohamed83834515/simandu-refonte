import type { ColumnDef } from '@tanstack/react-table'
import {  Trash2, UserPen } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { MissionSupervisionProjet } from '@/simadou/allTypes/missionSupervisionProjet'
import { Badge } from '@/components/ui/badge'
import { typeMissionSupervisionOptions } from '../schemas/missionRecommandationSchemas'

type BuildMissionSupervisionProjetColumnsProps = {
  setDeleteOpen: (open: boolean) => void
  setCurrentRow: React.Dispatch<
    React.SetStateAction<MissionSupervisionProjet | null>
  >
  onEdit: (row: MissionSupervisionProjet) => void
}

export function buildMissionSupervisionProjetColumns({
  setDeleteOpen,
  setCurrentRow,
  onEdit,
}: BuildMissionSupervisionProjetColumnsProps): ColumnDef<MissionSupervisionProjet>[] {
  return [
    {
      id: 'code_ms',
      accessorKey: 'code_ms',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.code_ms}</div>
      ),
    },
    {
      id: 'type_mission',
      accessorKey: 'type_mission',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        const type_mission = row.original.type_mission
        const typeFound = typeMissionSupervisionOptions.find(
          (type) => type.value === type_mission
        )

        return (
          <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
            {typeFound?.label || type_mission || 'Non défini'}
          </Badge>
        )
      },
    },
    {
      id: 'objet',
      accessorKey: 'objet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Objet' />
      ),
      cell: ({ row }) => (
        <div className='max-w-md whitespace-normal'>
          {row.original.objet || '—'}
        </div>
      ),
    },
    {
      id: 'debut',
      accessorKey: 'debut',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Début' />
      ),
      cell: ({ row }) =>
        row.original.debut
          ? new Date(row.original.debut).toLocaleDateString('fr-FR')
          : '—',
    },
    {
      id: 'fin',
      accessorKey: 'fin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fin' />
      ),
      cell: ({ row }) =>
        row.original.fin
          ? new Date(row.original.fin).toLocaleDateString('fr-FR')
          : '—',
    },
    // {
    //   id: 'document',
    //   accessorKey: 'document',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title='Document' />
    //   ),
    //   cell: ({ row }) => {
    //     const url = row.original.document
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
              onClick: () => onEdit(row.original),
            },
            {
              label: 'Supprimer',
              icon: <Trash2 size={16} className='text-red-500' />,
              className: 'text-red-500!',
              separator: true,
              onClick: () => {
                setCurrentRow(row.original)
                setDeleteOpen(true)
              },
            },
          ]}
        />
      ),
    },
  ]
}
