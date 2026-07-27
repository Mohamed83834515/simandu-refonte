import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
  /** Masque « Page X sur Y » et « Lignes par page » — utile dans les modals. */
  compact?: boolean
}

function PageSizeSelect<TData>({
  table,
  totalRows,
}: {
  table: Table<TData>
  totalRows: number
}) {
  return (
    <Select
      value={`${table.getState().pagination.pageSize}`}
      onValueChange={(value) => {
        table.setPageSize(Number(value))
      }}
    >
      <SelectTrigger className='h-8 w-17.5'>
        <SelectValue placeholder={table.getState().pagination.pageSize} />
      </SelectTrigger>
      <SelectContent side='top'>
        {[5, 10, 20, 40, 60, 100].map((pageSize) => (
          <SelectItem key={pageSize} value={`${pageSize}`}>
            {pageSize}
          </SelectItem>
        ))}
        <SelectItem value={`${totalRows}`}>Tout</SelectItem>
      </SelectContent>
    </Select>
  )
}

function PageNavButtons<TData>({
  table,
  currentPage,
  pageNumbers,
  hideEdgeButtons,
}: {
  table: Table<TData>
  currentPage: number
  pageNumbers: (number | string)[]
  hideEdgeButtons?: boolean
}) {
  return (
    <div className='flex items-center space-x-2'>
      {!hideEdgeButtons && (
        <Button
          variant='outline'
          className='size-8 p-0 @max-md/content:hidden'
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Première page</span>
          <DoubleArrowLeftIcon className='h-4 w-4' />
        </Button>
      )}
      <Button
        variant='outline'
        className='size-8 p-0'
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <span className='sr-only'>Page précédente</span>
        <ChevronLeftIcon className='h-4 w-4' />
      </Button>

      {pageNumbers.map((pageNumber, index) => (
        <div key={`${pageNumber}-${index}`} className='flex items-center'>
          {pageNumber === '...' ? (
            <span className='px-1 text-sm text-muted-foreground'>...</span>
          ) : (
            <Button
              variant={currentPage === pageNumber ? 'default' : 'outline'}
              className='h-8 min-w-8 px-2'
              onClick={() => table.setPageIndex((pageNumber as number) - 1)}
            >
              <span className='sr-only'>Aller à la page {pageNumber}</span>
              {pageNumber}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant='outline'
        className='size-8 p-0'
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <span className='sr-only'>Page suivante</span>
        <ChevronRightIcon className='h-4 w-4' />
      </Button>
      {!hideEdgeButtons && (
        <Button
          variant='outline'
          className='size-8 p-0 @max-md/content:hidden'
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Dernière page</span>
          <DoubleArrowRightIcon className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}

export function DataTablePagination<TData>({
  table,
  className,
  compact = false,
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages  = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, totalPages)
  const totalRows   = table.getCoreRowModel().rows.length
  const pageSize    = table.getState().pagination.pageSize
  const pageIndex   = table.getState().pagination.pageIndex
  const rowFrom     = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const rowTo       = Math.min((pageIndex + 1) * pageSize, totalRows)

  // Label style ancien système : "Affichage de X à Y sur Z éléments"
  const affichageLabel = totalRows === 0
    ? 'Aucun élément'
    : `Affichage de ${rowFrom} à ${rowTo} sur ${totalRows} éléments`

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 px-2 py-1',
          className
        )}
      >
        <div className='flex flex-wrap items-center gap-3'>
          <PageSizeSelect table={table} totalRows={totalRows} />
          <span className='text-sm text-muted-foreground whitespace-nowrap'>
            {affichageLabel}
          </span>
        </div>
        <PageNavButtons
          table={table}
          currentPage={currentPage}
          pageNumbers={pageNumbers}
          hideEdgeButtons
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-2',
        className
      )}
    >
      {/* Gauche : sélecteur + lignes par page */}
      <div className='flex flex-wrap items-center gap-3'>
        <PageSizeSelect table={table} totalRows={totalRows} />
        <span className='hidden text-sm font-medium sm:block whitespace-nowrap'>
          Lignes par page
        </span>
      </div>

      {/* Centre : label affichage */}
      <span className='text-sm text-muted-foreground whitespace-nowrap'>
        {affichageLabel}
      </span>

      {/* Droite : navigation */}
      <PageNavButtons
        table={table}
        currentPage={currentPage}
        pageNumbers={pageNumbers}
      />
    </div>
  )
}