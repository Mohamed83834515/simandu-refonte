// simadou/allColonnes/acteur-columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { Acteur } from '@/simadou/allTypes/acteur'
import { Badge } from '@/components/ui/badge'


export const buildPartenaireFinancierColumns = (
): ColumnDef<Acteur>[] => {
  return [
    {
      id: 'code_acteur',
      accessorKey: 'code_acteur',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.code_acteur}</div>
      ),
    },
    {
      id: 'nom_acteur',
      accessorKey: 'nom_acteur',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nom' />
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.nom_acteur}</div>
      ),
    },
    {
      id: 'personne_responsable',
      accessorKey: 'personne_responsable',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Responsable' />
      ),
      cell: ({ row }) => (
        <div className='text-gray-600'>{row.original.personne_responsable || '-'}</div>
      ),
    },
    {
      id: 'contact',
      accessorKey: 'contact',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Contact' />
      ),
      cell: ({ row }) => (
        <div className='text-gray-600'>{row.original.contact || '-'}</div>
      ),
    },
    {
      id: 'adresse_email',
      accessorKey: 'adresse_email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => (
        <div className='text-gray-600'>{row.original.adresse_email || '-'}</div>
      ),
    },
    {
      id: 'categorie_acteur',
      accessorKey: 'categorie_acteur',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Catégorie' />
      ),
      cell: ({ row }) => {
        const cat = row.original.categorie_acteur
        const label = cat && typeof cat === 'object' 
          ? `${cat.code_cat}-${cat.nom_categorie}` 
          : '-'
        return (
          <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
            {label}
          </Badge>
        )
      },
    },
    
  ]
}