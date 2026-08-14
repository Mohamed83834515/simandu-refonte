import { Fragment, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useActiveProgramme } from '@/hooks/use-active-programme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import type { IndicateurPerformanceProgramme } from '@/simadou/allTypes'
import {
  formatCibleDisplayValue,
  formatIndicateurUniteLabel,
} from '@/simadou/lib/indicateurPerformanceUtils'
import {
  getBudgetProgrammeValueForYear,
  getCibleProgrammeValueForYear,
} from '@/simadou/lib/indicateurPerformanceProgrammeUtils'
import { getProgrammeYearRange } from '@/simadou/lib/cibleCmrGridUtils'
import { cn } from '@/lib/utils'

type Props = {
  indicateurs: IndicateurPerformanceProgramme[]
  onEdit: (row: IndicateurPerformanceProgramme) => void
  onDeleteRequest: (row: IndicateurPerformanceProgramme) => void
  onAdd: () => void
}

const YEAR_COLUMN_MIN_PX = 58
const LABEL_COLUMN_MIN_PX = 72

export default function IndicateurPerformanceCadreAnalytiqueTable({
  indicateurs,
  onEdit,
  onDeleteRequest,
  onAdd,
}: Props) {
  const programme = useActiveProgramme()
  const { data: unites = [] } = useGetUnitesIndicateur()
  const [search, setSearch] = useState('')

  const years = useMemo(() => getProgrammeYearRange(programme), [programme])

  const filteredIndicateurs = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return indicateurs

    return indicateurs.filter((indicateur) =>
      (indicateur.intitule_indicateur_tache ?? '').toLowerCase().includes(query)
    )
  }, [indicateurs, search])

  return (
    <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-hidden'>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Filtrer les indicateurs…'
          className='h-8 w-full max-w-sm'
        />
        <DataTableToolbarOutlineButton className='ms-auto' onClick={onAdd}>
          Ajouter
        </DataTableToolbarOutlineButton>
      </div>

      <div className='overflow-x-auto rounded-md border'>
        <table className='w-full min-w-max border-collapse text-sm'>
          <thead className='bg-muted/50'>
            <tr className='border-b'>
              <th className='sticky left-0 z-20 min-w-[140px] border-r bg-muted/50 px-3 py-2 text-left font-semibold'>
                Intitulé indicateur
              </th>
              <th className='sticky left-[140px] z-20 min-w-[110px] border-r bg-muted/50 px-3 py-2 text-center font-semibold'>
                Unité
              </th>
              <th
                className='border-r px-2 py-2 text-left font-semibold'
                style={{ minWidth: LABEL_COLUMN_MIN_PX }}
              />
              {years.map((year) => (
                <th
                  key={year}
                  className='border-r px-2 py-2 text-center font-semibold last:border-r-0'
                  style={{ minWidth: YEAR_COLUMN_MIN_PX }}
                >
                  {year}
                </th>
              ))}
              <th className='sticky right-0 z-20 min-w-[88px] border-l bg-muted/50 px-2 py-2 text-center font-semibold'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredIndicateurs.length === 0 ? (
              <tr>
                <td
                  colSpan={years.length + 4}
                  className='px-4 py-8 text-center text-muted-foreground'
                >
                  Aucun indicateur de performance pour ce cadre analytique.
                </td>
              </tr>
            ) : (
              filteredIndicateurs.map((indicateur) => (
                <Fragment key={indicateur.id_indicateur_performance}>
                  <tr className='border-b'>
                    <td
                      rowSpan={2}
                      className='sticky left-0 z-10 border-r bg-background px-3 py-2 align-middle font-medium'
                    >
                      {indicateur.intitule_indicateur_tache}
                    </td>
                    <td
                      rowSpan={2}
                      className='sticky left-[140px] z-10 border-r bg-background px-3 py-2 text-center align-middle text-muted-foreground'
                    >
                      {formatIndicateurUniteLabel(
                        indicateur as never,
                        unites
                      )}
                    </td>
                    <td className='border-r px-2 py-1.5 text-muted-foreground'>
                      Valeur Cible
                    </td>
                    {years.map((year) => (
                      <td
                        key={`${indicateur.id_indicateur_performance}-cible-${year}`}
                        className='border-r px-2 py-1.5 text-center tabular-nums last:border-r-0'
                      >
                        {formatCibleDisplayValue(
                          getCibleProgrammeValueForYear(indicateur, year)
                        )}
                      </td>
                    ))}
                    <td
                      rowSpan={2}
                      className='sticky right-0 z-10 border-l bg-background px-2 py-2 align-middle'
                    >
                      <div className='flex items-center justify-center gap-1'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => onEdit(indicateur)}
                          aria-label="Modifier l'indicateur"
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className={cn('h-8 w-8 text-red-500 hover:text-red-600')}
                          onClick={() => onDeleteRequest(indicateur)}
                          aria-label="Supprimer l'indicateur"
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className='border-b last:border-b-0'>
                    <td className='border-r px-2 py-1.5 text-muted-foreground'>
                      Budget (GNF)
                    </td>
                    {years.map((year) => (
                      <td
                        key={`${indicateur.id_indicateur_performance}-budget-${year}`}
                        className='border-r px-2 py-1.5 text-center tabular-nums last:border-r-0'
                      >
                        {formatCibleDisplayValue(
                          getBudgetProgrammeValueForYear(indicateur, year)
                        )}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
