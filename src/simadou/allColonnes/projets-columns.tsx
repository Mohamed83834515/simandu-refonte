import { type ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2, UserPen, Lock, Unlock } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import type { Projet } from '@/simadou/allTypes/projet'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'

type ProjetDialogType = 'add' | 'edit' | 'delete'

type BuildProjetsColumnsOptions = {
  setOpen: (dialog: ProjetDialogType | null) => void
  setCurrentRow: React.Dispatch<React.SetStateAction<Projet | null>>
  onDetail: (projet: Projet) => void
  handleClotureClick: (projet: Projet) => void
  currencyCode?: string
  userLevel?: number // ✅ Ajout du niveau d'accès
}

export function buildProjetsColumns({
  setOpen,
  setCurrentRow,
  onDetail,
  handleClotureClick,
  currencyCode,
  userLevel = 1, // Par défaut admin
}: BuildProjetsColumnsOptions): ColumnDef<Projet>[] {
  // ✅ Vérifier si l'utilisateur est niveau 3 (Consultant)
  const isLevel3 = userLevel === 3

  return [
    {
      id: 'code_projet',
      accessorKey: 'code_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs font-semibold text-muted-foreground'>
          #{row.original.code_projet}
        </span>
      ),
      meta: { thClassName: 'ps-4', className: 'ps-4' },
      enableHiding: false,
    },
    {
      id: 'sigle_projet',
      accessorKey: 'sigle_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sigle' />
      ),
      cell: ({ row }) => (
        <span className='font-semibold'>{row.original.sigle_projet}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intitule_projet',
      accessorKey: 'intitule_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-md text-muted-foreground'>
          {row.original.intitule_projet}
        </LongText>
      ),
      enableHiding: false,
    },
    {
      id: 'duree_projet',
      accessorKey: 'duree_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Durée' />
      ),
      cell: ({ row }) => (
        <span className='tabular-nums text-muted-foreground'>
          {row.original.duree_projet} mois
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'signataires_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partenaires Financier" />
      ),
      cell: ({ row }) => {
        const partenaires = row.original.signataires_projet
        if (!partenaires || partenaires.length === 0) {
          return <span className='text-muted-foreground'>—</span>
        }
        return (
          <div className='flex flex-row gap-0.5'>
            {partenaires.map((partenaire, idx) => (
              <span key={idx} className='text-sm text-muted-foreground'>
                {partenaire.code_acteur?.trim()}, 
              </span>
            ))}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'partenaires_execution_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partenaires d'exécution" />
      ),
      cell: ({ row }) => {
        const partenaires = row.original.partenaires_execution_projet
        if (!partenaires || partenaires.length === 0) {
          return <span className='text-muted-foreground'>—</span>
        }
        return (
          <div className='flex flex-row gap-0.5'>
            {partenaires.map((partenaire, idx) => (
              <span key={idx} className='text-sm text-muted-foreground bg-blue'>
                {partenaire.code_acteur?.trim()}, 
              </span>
            ))}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'budget',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`Budget(${currencyCode})`} />
      ),
      cell: ({ row }) => {
        const budget = row.original.budget_projet

        if (!budget || budget === 0) {
          return (
            <div className='flex justify-center'>
              <span className='text-sm text-muted-foreground'>—</span>
            </div>
          )
        }

        return (
          <div className='flex justify-center'>
            <span className='inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'>
              {new Intl.NumberFormat('fr-FR').format(budget)}
            </span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => {
        const projet = row.original
        const isCloture = projet.is_cloture

        // ✅ Si niveau 3, seulement l'action "Détail"
        if (isLevel3) {
          return (
            <GenericRowActions
              row={row}
              actions={[
                {
                  label: 'Détail',
                  icon: <Eye size={16} />,
                  onClick: () => {
                    onDetail(row.original)
                  }
                },
              ]}
            />
          )
        }

        // ✅ Pour les autres niveaux, toutes les actions
        return (
          <GenericRowActions
            row={row}
            actions={[
              {
                label: 'Détail',
                icon: <Eye size={16} />,
                onClick: () => {
                  onDetail(row.original)
                }
              },
              {
                label: isCloture ? 'Déclôturer' : 'Clôturer',
                icon: isCloture ? <Unlock size={16} /> : <Lock size={16} />,
                onClick: () => {
                  setCurrentRow(row.original)
                  handleClotureClick(row.original)
                },
                className: isCloture ? 'text-green-600!' : 'text-amber-600!',
                separator: true,
              },
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
                icon: <Trash2 size={16} />,
                onClick: () => {
                  setCurrentRow(row.original)
                  setOpen('delete')
                },
                className: 'text-red-500!',
                separator: true,
              },
            ]}
          />
        )
      },
    },
  ]
}