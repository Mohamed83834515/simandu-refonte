import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CibleCmrProjet, Projet } from '@/simadou/allTypes'
import type { IndicateurCmrProjet } from '@/simadou/allTypes/indicateurCmrProjet'
import {
  useCreateCibleCmrProjet,
  useDeleteCibleCmrProjet,
  useGetAllCiblesCmrProjet,
  useUpdateCibleCmrProjet,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetNiveauxLocalite } from '@/simadou/allHooks/admin/niveauLocaliteHooks'
import { useGetLocalites } from '@/simadou/allHooks/admin/sharedHooks'
import {
  buildCibleCmrProjetGridRows,
  buildCibleCmrProjetGridState,
  buildCibleCmrGridKey,
  buildCibleProjetPayloadFromGridCell,
  filterCiblesForProjetZoneGrid,
  getCibleCmrGridRowId,
  getProjetYearRange,
  hasCibleCmrGridChanges,
  isCibleCmrGridCellDirty,
  parseGridCellValue,
  type CibleCmrGridCell,
  type CibleCmrGridRow,
} from '@/simadou/lib/cibleCmrProjetGridUtils'

const DEFAULT_PAGE_SIZE = 5
const YEAR_SCROLL_THRESHOLD = 10
const ZONE_COLUMN_MIN_PX = 100
const YEAR_COLUMN_MIN_PX = 58

type Props = {
  indicateur: IndicateurCmrProjet
  codeProjet: string
  projet: Projet
  onClose?: () => void
}

export default function CibleCmrProjetGridPanel({
  indicateur,
  codeProjet,
  projet,
  onClose,
}: Props) {
  const { data: localites = [], isLoading: isLoadingLocalites } =
    useGetLocalites()
  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxLocalite()
  const { data: allCibles = [], isLoading: isLoadingCibles } =
    useGetAllCiblesCmrProjet()

  const createMutation = useCreateCibleCmrProjet(codeProjet)
  const updateMutation = useUpdateCibleCmrProjet(codeProjet)
  const deleteMutation = useDeleteCibleCmrProjet(codeProjet)

  const indicateurCmrProjetId = indicateur.id_ref_ind_cmr

  const gridRows = useMemo(
    () => buildCibleCmrProjetGridRows(localites, niveaux),
    [localites, niveaux]
  )

  const years = useMemo(() => getProjetYearRange(projet), [projet])

  const filteredCibles = useMemo(
    () =>
      filterCiblesForProjetZoneGrid(
        allCibles,
        indicateurCmrProjetId,
        codeProjet
      ),
    [allCibles, indicateurCmrProjetId, codeProjet]
  )

  const initialGrid = useMemo(
    () =>
      buildCibleCmrProjetGridState({
        cibles: filteredCibles,
        gridRows,
        years,
      }),
    [filteredCibles, gridRows, years]
  )

  const [grid, setGrid] = useState<Record<string, CibleCmrGridCell>>(initialGrid)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    setGrid(initialGrid)
  }, [initialGrid])

  useEffect(() => {
    setPageIndex(0)
  }, [gridRows.length, pageSize])

  const totalPages = Math.max(1, Math.ceil(gridRows.length / pageSize))
  const currentPage = Math.min(pageIndex + 1, totalPages)
  const safePageIndex = currentPage - 1
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const paginatedGridRows = useMemo(() => {
    const start = safePageIndex * pageSize
    return gridRows.slice(start, start + pageSize)
  }, [gridRows, safePageIndex, pageSize])

  const needsHorizontalScroll = years.length > YEAR_SCROLL_THRESHOLD

  const handleCellChange = useCallback(
    (row: CibleCmrGridRow, year: number, value: string) => {
      const key = buildCibleCmrGridKey(getCibleCmrGridRowId(row), year)
      setGrid((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          value,
        },
      }))
    },
    []
  )

  const isLoading =
    isLoadingLocalites || isLoadingNiveaux || isLoadingCibles
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const handleSave = async () => {
    if (!hasCibleCmrGridChanges(grid, initialGrid)) {
      toast.info('Aucune modification à enregistrer')
      return
    }

    const operations: Promise<CibleCmrProjet | void>[] = []

    for (const row of gridRows) {
      const rowId = getCibleCmrGridRowId(row)

      for (const year of years) {
        const key = buildCibleCmrGridKey(rowId, year)
        if (!isCibleCmrGridCellDirty(grid, initialGrid, key)) continue

        const cell = grid[key]
        const parsedValue = parseGridCellValue(cell?.value ?? '')
        const existingId = cell?.cibleId ?? initialGrid[key]?.cibleId

        if (parsedValue == null) {
          if (existingId != null) {
            operations.push(deleteMutation.mutateAsync(existingId))
          }
          continue
        }

        const payload = buildCibleProjetPayloadFromGridCell({
          localiteId: row.localiteId,
          year,
          value: parsedValue,
          indicateurCmrProjetId,
          codeProjet,
        })

        if (existingId != null) {
          operations.push(
            updateMutation.mutateAsync({
              id: existingId,
              data: payload,
            })
          )
        } else {
          operations.push(createMutation.mutateAsync(payload))
        }
      }
    }

    if (operations.length === 0) {
      toast.info('Aucune modification à enregistrer')
      return
    }

    try {
      await Promise.all(operations)
      toast.success('Cibles CMR enregistrées')
      onClose?.()
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Erreur lors de l’enregistrement des cibles'
        )
      )
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Chargement des zones et cibles…
      </div>
    )
  }

  if (years.length === 0) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        La date de démarrage et la durée du projet sont requises pour générer
        les colonnes annuelles.
      </p>
    )
  }

  if (gridRows.length === 0) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Aucune zone (préfecture) n&apos;est configurée dans les localités.
      </p>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-center'>
        <p className='w-full rounded-md border bg-primary/5 px-4 py-3 text-center text-sm font-medium text-primary'>
          Valeurs cibles annuelles par zone
        </p>
      </div>

      <div
        className={cn(
          'max-h-[min(52vh,480px)] overflow-y-auto rounded-md border',
          needsHorizontalScroll ? 'overflow-x-auto pe-2' : 'overflow-x-hidden'
        )}
      >
        <table
          className={cn(
            'w-full border-collapse text-xs',
            needsHorizontalScroll ? 'min-w-max' : 'table-fixed'
          )}
          style={
            needsHorizontalScroll
              ? {
                  minWidth:
                    ZONE_COLUMN_MIN_PX + years.length * YEAR_COLUMN_MIN_PX,
                }
              : undefined
          }
        >
          <colgroup>
            <col
              style={{
                width: needsHorizontalScroll ? ZONE_COLUMN_MIN_PX : '26%',
              }}
            />
            {years.map((year) => (
              <col key={year} />
            ))}
          </colgroup>
          <thead className='sticky top-0 z-10 bg-muted/95 backdrop-blur'>
            <tr>
              <th
                className='sticky left-0 z-20 border-b border-r bg-muted/95 px-2 py-1.5 text-left text-xs font-semibold'
                style={
                  needsHorizontalScroll
                    ? { minWidth: ZONE_COLUMN_MIN_PX }
                    : undefined
                }
              >
                Zones
              </th>
              {years.map((year) => (
                <th
                  key={year}
                  className='border-b px-1 py-1.5 text-center text-xs font-semibold tabular-nums'
                  style={
                    needsHorizontalScroll
                      ? { minWidth: YEAR_COLUMN_MIN_PX }
                      : undefined
                  }
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedGridRows.map((row) => (
              <tr key={row.rowId} className='border-b last:border-b-0'>
                <td
                  className='sticky left-0 z-10 border-r bg-background px-2 py-1.5 align-middle font-medium'
                  style={
                    needsHorizontalScroll
                      ? {
                          minWidth: ZONE_COLUMN_MIN_PX,
                          maxWidth: ZONE_COLUMN_MIN_PX,
                        }
                      : undefined
                  }
                >
                  <span className='block truncate' title={row.label}>
                    {row.label}
                  </span>
                </td>
                {years.map((year) => {
                  const key = buildCibleCmrGridKey(getCibleCmrGridRowId(row), year)
                  const cell = grid[key]
                  return (
                    <td
                      key={year}
                      className='px-1 py-1 align-middle'
                      style={
                        needsHorizontalScroll
                          ? { minWidth: YEAR_COLUMN_MIN_PX }
                          : undefined
                      }
                    >
                      <Input
                        type='number'
                        inputMode='decimal'
                        min={0}
                        step={1}
                        value={cell?.value ?? ''}
                        onChange={(e) =>
                          handleCellChange(row, year, e.target.value)
                        }
                        className='h-7 w-full min-w-0 px-1 text-center text-xs tabular-nums'
                        aria-label={`Cible ${row.label} ${year}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className={cn(
          'flex w-full flex-col-reverse items-center justify-between gap-4 sm:flex-row'
        )}
      >
        <div className='flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-4'>
          <p className='text-sm font-medium sm:hidden'>
            Page {currentPage} sur {totalPages}
          </p>
          <div className='flex items-center gap-2'>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value))
              }}
            >
              <SelectTrigger className='h-8 w-[4.5rem]'>
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side='top'>
                {[5, 10, 20, 40].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
                <SelectItem value={`${gridRows.length}`}>Tout</SelectItem>
              </SelectContent>
            </Select>
            <p className='hidden text-sm font-medium sm:block'>Zones par page</p>
          </div>
        </div>

        <div className='flex min-w-0 max-w-full items-center gap-4'>
          <p className='hidden shrink-0 text-sm font-medium sm:block'>
            Page {currentPage} sur {totalPages}
          </p>
          <div className='flex min-w-0 items-center gap-1 overflow-x-auto pb-0.5'>
            <Button
              type='button'
              variant='outline'
              className='size-8 p-0'
              onClick={() => setPageIndex(0)}
              disabled={safePageIndex <= 0}
            >
              <span className='sr-only'>Première page</span>
              <DoubleArrowLeftIcon className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              className='size-8 p-0'
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={safePageIndex <= 0}
            >
              <span className='sr-only'>Page précédente</span>
              <ChevronLeftIcon className='h-4 w-4' />
            </Button>
            {pageNumbers.map((pageNumber, index) => (
              <div key={`${pageNumber}-${index}`} className='flex items-center'>
                {pageNumber === '...' ? (
                  <span className='px-1 text-sm text-muted-foreground'>…</span>
                ) : (
                  <Button
                    type='button'
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    className='h-8 min-w-8 px-2'
                    onClick={() => setPageIndex((pageNumber as number) - 1)}
                  >
                    <span className='sr-only'>Aller à la page {pageNumber}</span>
                    {pageNumber}
                  </Button>
                )}
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              className='size-8 p-0'
              onClick={() =>
                setPageIndex((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={safePageIndex >= totalPages - 1}
            >
              <span className='sr-only'>Page suivante</span>
              <ChevronRightIcon className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              className='size-8 p-0'
              onClick={() => setPageIndex(totalPages - 1)}
              disabled={safePageIndex >= totalPages - 1}
            >
              <span className='sr-only'>Dernière page</span>
              <DoubleArrowRightIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-2 border-t pt-4'>
        {onClose ? (
          <Button type='button' variant='outline' onClick={onClose}>
            Annuler
          </Button>
        ) : null}
        <Button type='button' onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  )
}
