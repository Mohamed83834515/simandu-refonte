import type { ColumnDef, Row } from '@tanstack/react-table'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { Personnel } from '@/simadou/allTypes'
import {
  formatNiveauAcces,
  formatPersonnelNom,
  formatStatutPersonnel,
  isPersonnelActif,
} from '@/simadou/allfonctionalities/parametrage/utilisateurs/personnelFormUtils'

function PersonnelRowActions({
  row,
  onEdit,
  onToggleStatus,
  onDeleteRequest,
}: {
  row: Row<Personnel>
  onEdit: (row: Personnel) => void
  onToggleStatus: (row: Personnel) => void
  onDeleteRequest: (row: Personnel) => void
}) {
  const personnel = row.original
  const actif = isPersonnelActif(personnel.statut)

  return (
    <GenericRowActions
      row={row}
      actions={[
        {
          label: 'Modifier',
          icon: <Pencil size={16} />,
          onClick: onEdit,
        },
        {
          label: actif ? 'Désactiver' : 'Activer',
          icon: actif ? <X size={16} /> : <Check size={16} />,
          onClick: onToggleStatus,
          className: actif ? 'text-orange-600!' : 'text-green-600!',
        },
        {
          label: 'Supprimer',
          icon: <Trash2 size={16} />,
          onClick: onDeleteRequest,
          className: 'text-red-500!',
          separator: true,
        },
      ]}
    />
  )
}

export function buildPersonnelColumns({
  onEdit,
  onToggleStatus,
  onDeleteRequest,
}: {
  onEdit: (row: Personnel) => void
  onToggleStatus: (row: Personnel) => void
  onDeleteRequest: (row: Personnel) => void
}): ColumnDef<Personnel>[] {
  return [
    {
      accessorKey: 'id_personnel_perso',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Identifiant' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>
          {row.original.id_personnel_perso ?? '—'}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'nom_complet',
      accessorFn: (row) => formatPersonnelNom(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nom complet' />
      ),
      cell: ({ row }) => (
        <div className='min-w-[10rem]'>
          <p className='font-medium'>{formatPersonnelNom(row.original)}</p>
          {row.original.titre_personnel?.libelle_titre ? (
            <p className='text-xs text-muted-foreground'>
              {row.original.titre_personnel.libelle_titre}
            </p>
          ) : null}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => (
        <span className='block max-w-[14rem] truncate text-sm'>
          {row.original.email ?? '—'}
        </span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'contact_perso',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Contact' />
      ),
      cell: ({ row }) => (
        <span className='text-sm tabular-nums'>
          {row.original.contact_perso ?? '—'}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'fonction',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fonction' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.fonction_perso?.nom_fonction ?? '—'}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'region',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Région' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {row.original.region_perso?.intitule_loca ?? '—'}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'niveau_perso',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Niveau d'accès" />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>
          {formatNiveauAcces(row.original.niveau_perso)}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'statut',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Statut' />
      ),
      cell: ({ row }) => {
        const actif = isPersonnelActif(row.original.statut)
        return (
          <Badge variant={actif ? 'default' : 'secondary'}>
            {formatStatutPersonnel(row.original.statut)}
          </Badge>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <PersonnelRowActions
          row={row}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDeleteRequest={onDeleteRequest}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
