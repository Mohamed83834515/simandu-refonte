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
import type { PartBailleur } from '@/simadou/allTypes/partBailleur'
import type { Projet } from '@/simadou/allTypes/projet'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { useGetFinancementsProjet } from '@/simadou/allHooks/admin/financementProjetHooks'
import {
  useCreatePartBailleur,
  useDeletePartBailleur,
  useGetPartsBailleursByActivite,
  useUpdatePartBailleur,
} from '@/simadou/allHooks/admin/partBailleurHooks'
import type { PartBailleurActiviteQuery } from '@/simadou/allSercices/partBailleurService'
import {
  buildPartBailleurGridColumns,
  buildPartBailleurGridKey,
  buildPartBailleurGridRows,
  buildPartBailleurGridState,
  buildPartBailleurPayloadFromGridCell,
  hasPartBailleurGridChanges,
  isPartBailleurGridCellDirty,
  parseGridCellValue,
  type PartBailleurGridCell,
  type PartBailleurGridColumn,
  type PartBailleurGridRow,
} from '@/simadou/lib/partBailleurGridUtils'

const DEFAULT_PAGE_SIZE = 10
const COLUMN_SCROLL_THRESHOLD = 6
const ZONE_COLUMN_MIN_PX = 120
const FINANCEMENT_COLUMN_MIN_PX = 100

type Props = {
  activite: PtbaProjet
  projet: Projet
  versionPtbaId: number
  anneePtbaYear?: number
}

export default function CoutActivitePtbaGridPanel({
  activite,
  projet,
  versionPtbaId,
  anneePtbaYear,
}: Props) {
  const idActivite = activite.id_ptba
  const idProjet = projet.id_projet
  const codeProjet = projet.code_projet

  const partsQuery = useMemo<PartBailleurActiviteQuery>(
    () => ({
      activitePtbaId: idActivite,
      projetId: idProjet,
      versionPtbaId,
      codeProjet,
      anneePtbaYear,
    }),
    [idActivite, idProjet, versionPtbaId, codeProjet, anneePtbaYear]
  )

  const { data: user } = useMe()
  const idPersonnel = user?.n_personnel ?? 0
  const modifierPar = user?.n_personnel ?? 0

  const { data: financements = [], isLoading: isLoadingFinancements } =
    useGetFinancementsProjet(idProjet)
  const {
    data: parts = [],
    isLoading: isLoadingParts,
    refetch: refetchParts,
  } = useGetPartsBailleursByActivite(partsQuery)

  const createMutation = useCreatePartBailleur(partsQuery)
  const updateMutation = useUpdatePartBailleur(partsQuery)
  const deleteMutation = useDeletePartBailleur(partsQuery)

  const gridRows = useMemo(
    () => buildPartBailleurGridRows(projet.zone_projet),
    [projet.zone_projet]
  )

  const gridColumns = useMemo(
    () => buildPartBailleurGridColumns(financements),
    [financements]
  )

  const initialGrid = useMemo(
    () =>
      buildPartBailleurGridState({
        parts,
        gridRows,
        gridColumns,
      }),
    [parts, gridRows, gridColumns]
  )

  const [grid, setGrid] =
    useState<Record<string, PartBailleurGridCell>>(initialGrid)
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

  const needsHorizontalScroll =
    gridColumns.length > COLUMN_SCROLL_THRESHOLD

  const handleCellChange = useCallback(
    (row: PartBailleurGridRow, column: PartBailleurGridColumn, value: string) => {
      const key = buildPartBailleurGridKey(row.rowId, column.columnId)
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

  const isLoading = isLoadingFinancements || isLoadingParts
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const handleSave = async () => {
    if (!hasPartBailleurGridChanges(grid, initialGrid)) {
      toast.info('Aucune modification à enregistrer')
      return
    }

    if (!idPersonnel || !modifierPar) {
      toast.error('Utilisateur non identifié')
      return
    }

    const operations: Promise<PartBailleur | void>[] = []

    for (const row of gridRows) {
      for (const column of gridColumns) {
        const key = buildPartBailleurGridKey(row.rowId, column.columnId)
        if (!isPartBailleurGridCellDirty(grid, initialGrid, key)) continue

        const cell = grid[key]
        const parsedValue = parseGridCellValue(cell?.value ?? '')
        const existingId = cell?.partId ?? initialGrid[key]?.partId

        if (parsedValue == null) {
          if (existingId != null) {
            operations.push(deleteMutation.mutateAsync(existingId))
          }
          continue
        }

        const payload = buildPartBailleurPayloadFromGridCell({
          regionId: row.regionId,
          typePartId: column.typePartId,
          montant: parsedValue,
          activitePtbaId: idActivite,
          projetId: idProjet,
          annee: versionPtbaId,
          idPersonnel,
          modifierPar,
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
      await refetchParts()
      toast.success('Coûts activité PTBA enregistrés')
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Erreur lors de l’enregistrement des coûts activité PTBA'
        )
      )
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Chargement des zones et financements…
      </div>
    )
  }

  if (!versionPtbaId) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Sélectionnez une version PTBA pour saisir les coûts activité.
      </p>
    )
  }

  if (gridRows.length === 0) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Aucune zone n&apos;est configurée sur ce projet. Renseignez les zones
        dans les attributs du projet.
      </p>
    )
  }

  if (gridColumns.length === 0) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>
        Aucun financement n&apos;est configuré pour ce projet. Ajoutez des
        financements dans l&apos;onglet Financements.
      </p>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-center'>
        <p className='w-full rounded-md border bg-primary/5 px-4 py-3 text-center text-sm font-medium text-primary'>
          Coûts activité PTBA par zone et financement
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
                    ZONE_COLUMN_MIN_PX +
                    gridColumns.length * FINANCEMENT_COLUMN_MIN_PX,
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
            {gridColumns.map((column) => (
              <col key={column.columnId} />
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
              {gridColumns.map((column) => (
                <th
                  key={column.columnId}
                  className='border-b px-1 py-1.5 text-center text-xs font-semibold'
                  style={
                    needsHorizontalScroll
                      ? { minWidth: FINANCEMENT_COLUMN_MIN_PX }
                      : undefined
                  }
                  title={column.label}
                >
                  <span className='line-clamp-2'>{column.label}</span>
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
                {gridColumns.map((column) => {
                  const key = buildPartBailleurGridKey(
                    row.rowId,
                    column.columnId
                  )
                  const cell = grid[key]
                  return (
                    <td
                      key={column.columnId}
                      className='px-1 py-1 align-middle'
                      style={
                        needsHorizontalScroll
                          ? { minWidth: FINANCEMENT_COLUMN_MIN_PX }
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
                          handleCellChange(row, column, e.target.value)
                        }
                        className='h-7 w-full min-w-0 px-1 text-center text-xs tabular-nums'
                        aria-label={`Montant ${row.label} — ${column.label}`}
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
            <p className='hidden text-sm font-medium sm:block'>
              Zones par page
            </p>
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
        <Button type='button' onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  )
}
