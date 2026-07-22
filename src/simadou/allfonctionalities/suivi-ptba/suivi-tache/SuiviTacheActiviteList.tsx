import { type ColumnDef } from '@tanstack/react-table'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Ptba, TacheActivitePtba } from '@/simadou/allTypes'
import {
  findSuiviForTache,
  type SuiviTacheActivite,
} from '@/simadou/allTypes/suiviTacheActivite'

type SuiviTacheActiviteListProps = {
  activite: Ptba
  taches: TacheActivitePtba[]
  suivis: SuiviTacheActivite[]
  onSuivre: (tache: TacheActivitePtba, suivi?: SuiviTacheActivite) => void
}

const colWide = 'max-w-[220px] whitespace-normal'

function formatDateRealisation(value: string | undefined | null): string {
  if (!value?.trim()) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SuiviTacheActiviteList({
  activite,
  taches,
  suivis,
  onSuivre,
}: SuiviTacheActiviteListProps) {
  const { search, navigate } = useEmbeddedTableState()

  // Colonnes activité (code, intitulé) d'abord, puis colonnes tâches.
  const columns: ColumnDef<TacheActivitePtba>[] = [
    {
      id: 'code',
      header: 'Code',
      accessorFn: () => activite.code_activite_ptba ?? '',
      meta: { thClassName: 'ps-4' },
    },
    {
      id: 'activite',
      header: 'Activité',
      accessorFn: () => activite.intitule_activite_ptba ?? '',
    },
    {
      id: 'intutile_tache_gt',
      header: 'Tâche',
      accessorFn: (row) => row.intutile_tache_gt ?? '',
    },
    {
      id: 'lot',
      header: 'Lot',
      accessorFn: (row) => row.n_lot_gt,
      meta: { thClassName: 'text-center' },
    },
    {
      id: 'proportion',
      header: 'P%',
      accessorFn: (row) => row.proportion_gt ?? '',
      meta: { thClassName: 'text-center' },
    },
    {
      id: 'date_realisation',
      header: 'Date réalisation',
      accessorFn: () => '',
      meta: { thClassName: 'text-center' },
    },
    {
      id: 'valide',
      header: 'Validé',
      accessorFn: () => '',
      meta: { thClassName: 'text-center' },
    },
    {
      id: 'suivi_action',
      header: 'Suivi',
      accessorFn: () => '',
      meta: { thClassName: 'text-center' },
    },
    {
      id: 'observation',
      header: 'Observation',
      accessorFn: () => '',
      meta: { thClassName: 'pe-4' },
    },
  ]

  return (
    <GenericTable<TacheActivitePtba>
      data={taches}
      columns={columns}
      search={search}
      navigate={navigate}
      showSearch={false}
      showViewOptions={false}
      showPagination={false}
      defaultPageSize={Math.max(taches.length, 1)}
      emptyMessage='Aucune tâche pour cette activité.'
      customRowRenderer={(tache, i, { rowClassName, cellClassName }) => {
        const suivi = findSuiviForTache(suivis, tache.id_groupe_tache)
        const proportion = tache.proportion_gt?.trim()
        const proportionLabel = proportion
          ? proportion.endsWith('%')
            ? proportion
            : `${proportion}%`
          : null
        const observation = suivi?.observation_suivi?.trim()

        return (
          <TableRow className={rowClassName} key={i}>
            <TableCell className={cellClassName(0)}>
              {activite.code_activite_ptba}
            </TableCell>

            <TableCell className={cellClassName(1)}>
              {activite.intitule_activite_ptba}
            </TableCell>

            <TableCell className={cellClassName(2)}>
              <div className={cn('min-w-0 space-y-0.5', colWide)}>
                <p className='font-medium leading-snug'>
                  {tache.intutile_tache_gt}
                </p>
                {tache.code_tache_gt && (
                  <p className='text-xs text-muted-foreground'>
                    {tache.code_tache_gt}
                  </p>
                )}
              </div>
            </TableCell>

            <TableCell className={cellClassName(3)}>
              <span className='tabular-nums'>{tache.n_lot_gt}</span>
            </TableCell>

            <TableCell className={cellClassName(4)}>
              {proportionLabel ? (
                <span className='font-semibold tabular-nums'>
                  {proportionLabel}
                </span>
              ) : (
                <span className='text-muted-foreground'>—</span>
              )}
            </TableCell>

            <TableCell className={cellClassName(5)}>
              <span className='whitespace-nowrap text-muted-foreground'>
                {formatDateRealisation(suivi?.date_reele)}
              </span>
            </TableCell>

            <TableCell className={cellClassName(6)}>
              {suivi ? (
                <Badge
                  variant={suivi.valide ? 'default' : 'secondary'}
                  className='min-w-[48px] justify-center'
                >
                  {suivi.valide ? 'Oui' : 'Non'}
                </Badge>
              ) : (
                <span className='text-muted-foreground'>—</span>
              )}
            </TableCell>

            <TableCell className={cellClassName(7)}>
              <Button
                variant='outline'
                size='sm'
                className='h-8 min-w-[84px] px-2.5'
                onClick={() => onSuivre(tache, suivi)}
              >
                {suivi ? 'Modifier' : 'Suivre'}
              </Button>
            </TableCell>

            <TableCell className={cellClassName(8)}>
              <p
                className={cn(
                  colWide,
                  'line-clamp-3 leading-relaxed text-muted-foreground'
                )}
                title={observation}
              >
                {observation || '—'}
              </p>
            </TableCell>
          </TableRow>
        )
      }}
    />
  )
}
