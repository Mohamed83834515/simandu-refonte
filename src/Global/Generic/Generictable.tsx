import { useEffect, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import {
  type Cell,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { detectAlignment } from '@/simadou/allfonctionalities/rapport/export/rapportExportUtils'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { TableLoadingOverlay } from './table-loading-overlay'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColumnFilterConfig = {
  columnId: string
  searchKey: string
  type: 'string' | 'array'
}

export type FacetedFilterOption = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export type FacetedFilter = {
  columnId: string
  title: string
  options: FacetedFilterOption[]
}

type GenericTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  search: Record<string, unknown>
  navigate: NavigateFn
  searchKey?: string
  searchPlaceholder?: string
  urlFilterConfig?: ColumnFilterConfig[]
  facetedFilters?: FacetedFilter[]
  bulkActionsSlot?: (
    table: ReturnType<typeof useReactTable<TData>>
  ) => React.ReactNode
  defaultPageSize?: number
  emptyMessage?: string
  showViewOptions?: boolean
  showSearch?: boolean
  showPagination?: boolean
  /** Pagination compacte (sans libellés « Page X sur Y » / « Lignes par page »). */
  compactPagination?: boolean
  /** Classes appliquées au conteneur du tableau (ex. min-h + overflow pour scroll). */
  tableContainerClassName?: string
  toolbarEndSlot?: React.ReactNode
  onRowClick?: (row: TData) => void
  /** Données filtrées visibles (hors pagination) pour l'export. */
  onExportContext?: (context: {
    filteredData: TData[]
    visibleColumnIds: string[]
  }) => void
  isLoading?: boolean
  initialState?: Partial<{
    columnVisibility: Record<string, boolean>
    sorting: SortingState
  }>
  customRowRenderer?: (
    row: TData,
    index: number,
    options: {
      rowClassName: string
      cellClassName: (cellIdx?: number) => string
    }
  ) => React.ReactNode
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function GenericTable<TData>({
  data,
  columns,
  search,
  navigate,
  searchKey,
  searchPlaceholder = 'Filtrer…',
  urlFilterConfig = [],
  facetedFilters = [],
  bulkActionsSlot,
  defaultPageSize = 10,
  emptyMessage = 'Aucun résultat.',
  showViewOptions = true,
  showSearch = true,
  showPagination = true,
  compactPagination = false,
  tableContainerClassName,
  toolbarEndSlot,
  onRowClick,
  onExportContext,
  isLoading: isLoadingProp = false,
  initialState,
  customRowRenderer,
}: GenericTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState?.columnVisibility ?? {}
  )
  const [sorting, setSorting] = useState<SortingState>(
    initialState?.sorting ?? []
  )

  const routerState = useRouterState()
  const isRouterPending = routerState.status === 'pending'
  const isLoading = isRouterPending || isLoadingProp

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize },
    globalFilter: { enabled: false },
    columnFilters: urlFilterConfig,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const pageCount = table.getPageCount()
  const exportSnapshotRef = useRef<{
    filteredData: TData[]
    visibleColumnIds: string[]
  } | null>(null)

  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  useEffect(() => {
    if (!onExportContext) return

    const filteredData = table
      .getFilteredRowModel()
      .rows.map((row) => row.original)
    const visibleColumnIds = table
      .getVisibleLeafColumns()
      .map((column) => column.id)

    const prev = exportSnapshotRef.current
    if (
      prev &&
      prev.filteredData.length === filteredData.length &&
      prev.visibleColumnIds.length === visibleColumnIds.length &&
      prev.filteredData.every((row, index) => row === filteredData[index]) &&
      prev.visibleColumnIds.every(
        (columnId, index) => columnId === visibleColumnIds[index]
      )
    ) {
      return
    }

    exportSnapshotRef.current = { filteredData, visibleColumnIds }
    onExportContext({ filteredData, visibleColumnIds })
  }, [onExportContext, data, columnFilters, columnVisibility, sorting])

  const showToolbar =
    showSearch ||
    showViewOptions ||
    !!toolbarEndSlot ||
    facetedFilters.length > 0

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col',
        showToolbar ? 'gap-4' : 'gap-0',
        tableContainerClassName && 'min-h-0'
      )}
    >
      {showToolbar ? (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          searchKey={searchKey}
          filters={facetedFilters}
          showViewOptions={showViewOptions}
          showSearch={showSearch}
          toolbarEndSlot={toolbarEndSlot}
        />
      ) : null}

      {/* ── Wrapper unique — overflow-x-auto pour scroll horizontal si nécessaire ── */}
      <div
        className={cn(
          'relative w-full min-w-0',
          'rounded-xl border border-border/60 shadow-sm',
          'overflow-x-auto', // scroll horizontal si contenu dépasse (ex: dialog étroit)
          isLoading &&
            'pointer-events-none opacity-50 transition-opacity duration-200 select-none',
          tableContainerClassName
        )}
      >
        {isLoadingProp && <TableLoadingOverlay />}

        {/* Bande couleur système */}
        <div className='h-1 w-full bg-primary' />

        <Table
          className='w-full min-w-full table-auto border-collapse'
          style={{ tableLayout: 'auto' }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, groupIndex, headerGroups) => (
              <TableRow
                key={headerGroup.id}
                className='border-b border-border/60 bg-muted/60 hover:bg-muted/60'
              >
                {headerGroup.headers.map((header) => {
                  // Sous-colonnes d'une colonne mère fusionnée verticalement
                  // (meta.mergeSubHeaders) : couvertes par le rowSpan du
                  // parent, elles ne sont pas rendues.
                  if (header.column.parent?.columnDef.meta?.mergeSubHeaders) {
                    return null
                  }

                  const mergeSubHeaders = Boolean(
                    header.column.columnDef.meta?.mergeSubHeaders
                  )

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      rowSpan={
                        mergeSubHeaders
                          ? headerGroups.length - groupIndex
                          : undefined
                      }
                      className={cn(
                        // py-1.5 → header compact, pas d'espace inutile
                        'px-4 py-1.5 text-xs font-semibold tracking-wider uppercase',
                        'align-middle break-words whitespace-normal text-muted-foreground',
                        'border-r border-border/30 last:border-r-0',
                        // Colonne mère fusionnée sur plusieurs filles → centrée
                        header.colSpan > 1 && 'text-center',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIdx) => {
                const rowClassName = cn(
                  'group/row border-b border-border/40 last:border-b-0',
                  'transition-colors duration-100',
                  rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                  'hover:bg-primary/5 data-[state=selected]:bg-primary/10',
                  onRowClick && 'cursor-pointer'
                )

                const cellClassName = (
                  cell?: Cell<TData, unknown> | number
                ) => {
                  const cll =
                    typeof cell === 'number' ? row.getAllCells()[cell] : cell
                  const align = detectAlignment(cll?.getValue())

                  return cn(
                    'px-4 py-2.5 align-top text-sm',
                    // Force l'affichage complet du texte — écrase truncate/whitespace-nowrap des colonnes enfants
                    'break-words whitespace-normal',
                    '[&_*]:!overflow-visible [&_*]:!text-clip [&_*]:!whitespace-normal',
                    'border-r border-border/20 last:border-r-0',
                    `text-${align} justify-${align}`,
                    typeof cell === 'number'
                      ? ''
                      : cell?.column.columnDef.meta?.className,
                    typeof cell === 'number'
                      ? ''
                      : cell?.column.columnDef.meta?.tdClassName
                  )
                }

                if (customRowRenderer) {
                  return customRowRenderer(row.original, rowIdx, {
                    rowClassName,
                    cellClassName: (cellIdx) => cellClassName(cellIdx),
                  })
                }

                return (
                  <TableRow key={row.id} className={rowClassName}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cellClassName(cell)}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='py-16 text-center text-sm text-muted-foreground'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <div className='rounded-full bg-muted p-3'>
                      <svg
                        className='h-5 w-5 text-muted-foreground'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                      </svg>
                    </div>
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <DataTablePagination
          table={table}
          compact={compactPagination}
          className='mt-auto shrink-0'
        />
      )}

      {bulkActionsSlot?.(table)}
    </div>
  )
}
