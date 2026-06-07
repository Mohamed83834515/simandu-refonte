import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import {
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

// ─── Types ───────────────────────────────────────────────────────────────────

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

  bulkActionsSlot?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode

  defaultPageSize?: number

  emptyMessage?: string

  showViewOptions?: boolean
  showSearch?: boolean
  showPagination?: boolean
  toolbarEndSlot?: React.ReactNode

  onRowClick?: (row: TData) => void

  //Prop optionnelle pour signaler un fetch/refetch externe 
  // Indépendante du routerState couvre les cas où la navigation n'est pas impliquée
  isLoading?: boolean

  initialState?: Partial<{
    columnVisibility: Record<string, boolean>
    sorting: SortingState
  }>
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GenericTable<TData>({
  data,
  columns,
  search,
  navigate,
  searchKey,
  searchPlaceholder = 'Filter...',
  urlFilterConfig = [],
  facetedFilters = [],
  bulkActionsSlot,
  defaultPageSize = 10,
  emptyMessage = 'No results.',
  showViewOptions = true,
  showSearch = true,
  showPagination = true,
  toolbarEndSlot,
  onRowClick,
  //Valeur par défaut false, pas de chargement si rien n'est passé
  isLoading: isLoadingProp = false,
  initialState,
}: GenericTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState?.columnVisibility ?? {}
  )
  const [sorting, setSorting] = useState<SortingState>(
    initialState?.sorting ?? []
  )

  const routerState = useRouterState()
  // chargement global déclenché si :
  //   • la navigation est en cours (changement de route, de filtres URL...)
  //   • ou si le parent signale un chargement via isLoadingProp (fetch/refetch des données)
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

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchKey={searchKey}
        filters={facetedFilters}
        showViewOptions={showViewOptions}
        showSearch={showSearch}
        toolbarEndSlot={toolbarEndSlot}
      />

      <div className='relative overflow-hidden rounded-md border'>
        {/* Seul isLoadingProp déclenche l'overlay de chargement, pas isRouterPending */}
        {isLoadingProp && <TableLoadingOverlay />}

        <Table
          className={cn(
            'transition-opacity duration-200',
            isLoading && 'opacity-40 pointer-events-none select-none'
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
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
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'group/row',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && <DataTablePagination table={table} className='mt-auto' />}

      {bulkActionsSlot?.(table)}
    </div>
  )
}