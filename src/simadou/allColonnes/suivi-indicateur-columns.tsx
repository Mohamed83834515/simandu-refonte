import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import type { SuiviIndicateurActivite } from '@/simadou/allTypes/suiviIndicateurActivite'

export type SuiviIndicateurTableRow = IndicateurTache

export type SuiviIndicateurColumnHandlers = {
  onSuivre: (indicateur: IndicateurTache) => void
  suivisByIndicateur: Map<string, SuiviIndicateurActivite[]>
  resolveIndicateurKey?: (indicateur: IndicateurTache) => string
}

function getIndicateurKey(
  indicateur: IndicateurTache,
  resolveIndicateurKey?: (indicateur: IndicateurTache) => string
): string {
  return resolveIndicateurKey?.(indicateur) ?? resolveIndicateurCode(indicateur)
}

const colWide = 'max-w-[240px] whitespace-normal'

export function resolveIndicateurCode(indicateur: IndicateurTache): string {
  return indicateur.code_indicateur_ptba
}

/** Valeur cible : somme des trimestres renseignés ; si un seul, ce trimestre seul. */
export function getValeurCibleIndicateur(
  indicateur: IndicateurTache
): string | null {
  const trimestres = [
    indicateur.trimestre_1,
    indicateur.trimestre_2,
    indicateur.trimestre_3,
    indicateur.trimestre_4,
  ]

  const values: number[] = []
  for (const t of trimestres) {
    const raw = typeof t === 'string' ? t.trim() : t != null ? String(t).trim() : ''
    if (!raw) continue
    const n = Number(raw.replace(/\s/g, '').replace(',', '.'))
    if (Number.isFinite(n)) values.push(n)
  }

  if (values.length === 0) return null
  if (values.length === 1) return String(values[0])

  const sum = values.reduce((acc, n) => acc + n, 0)
  return Number.isInteger(sum) ? String(sum) : sum.toFixed(2)
}

export function countSuivisForIndicateur(
  suivisByIndicateur: Map<string, SuiviIndicateurActivite[]>,
  indicateur: IndicateurTache,
  resolveIndicateurKey?: (indicateur: IndicateurTache) => string
): number {
  return (
    suivisByIndicateur.get(getIndicateurKey(indicateur, resolveIndicateurKey))
      ?.length ?? 0
  )
}

export function buildSuiviIndicateurColumns(
  handlers: SuiviIndicateurColumnHandlers
): ColumnDef<SuiviIndicateurTableRow>[] {
  const { onSuivre, suivisByIndicateur, resolveIndicateurKey } = handlers

  return [
    {
      id: 'intitule_indicateur_tache',
      accessorKey: 'intitule_indicateur_tache',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Indicateur' />
      ),
      cell: ({ row }) => {
        const indicateur = row.original
        return (
          <div className={cn('flex items-start gap-2.5', colWide)}>
            <span className='mt-0.5 shrink-0 text-sm font-semibold text-muted-foreground'>
              {row.index + 1}.
            </span>
            <div className='min-w-0 space-y-0.5'>
              <p className='font-medium leading-snug'>
                {indicateur.intitule_indicateur_tache}
              </p>
              {indicateur.code_indicateur_ptba && (
                <p className='text-xs text-muted-foreground'>
                  {indicateur.code_indicateur_ptba}
                </p>
              )}
            </div>
          </div>
        )
      },
      meta: { thClassName: 'ps-4', className: 'ps-4' },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'unite_ind_tache',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Unité' />
      ),
      cell: ({ row }) => (
        <span className='text-muted-foreground tabular-nums'>
          {row.original.unite_ind_tache || '—'}
        </span>
      ),
      meta: { thClassName: 'text-center', className: 'text-center' },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'valeur_cible',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Valeur cible' />
      ),
      cell: ({ row }) => {
        const valeur = getValeurCibleIndicateur(row.original)
        return (
          <span className='font-semibold tabular-nums'>
            {valeur ?? '—'}
          </span>
        )
      },
      meta: { thClassName: 'text-center', className: 'text-center' },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'suivi_action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Suivi' />
      ),
      cell: ({ row }) => {
        const indicateur = row.original
        const count = countSuivisForIndicateur(
          suivisByIndicateur,
          indicateur,
          resolveIndicateurKey
        )
        return (
          <Button
            variant='outline'
            size='sm'
            className='h-8 min-w-[84px] px-2.5'
            onClick={() => onSuivre(indicateur)}
          >
            {count > 0 ? 'Voir / Ajouter' : 'Suivre'}
          </Button>
        )
      },
      meta: { thClassName: 'text-center pe-4', className: 'text-center pe-4' },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
