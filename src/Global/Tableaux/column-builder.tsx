import { type ColumnDef, type CellContext } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'

type BadgeMap = Map<string, string>

export type OptionItem = {
  value: string
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
}

type ColumnConfig<T> =
  | { type: 'select' }
  | { type: 'actions'; cell: ColumnDef<T>['cell'] }
  | {
      type: 'text'
      key: keyof T
      title: string
      sticky?: boolean
      maxWidth?: string
    }
  | {
      type: 'combined'
      keys: (keyof T)[]
      id: string
      title: string
      maxWidth?: string
    }
  | {
      type: 'badge'
      key: keyof T
      title: string
      badgeMap: BadgeMap
      sortable?: boolean
    }
  | { type: 'icon-label'; key: keyof T; title: string; options: OptionItem[] }
  | { type: 'plain'; key: keyof T; title: string; sortable?: boolean }

export function buildColumns<T>(configs: ColumnConfig<T>[]): ColumnDef<T>[] {
  return configs.map((config): ColumnDef<T> => {
    switch (config.type) {
      case 'select':
        return {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label='Select all'
              className='translate-y-0.5'
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label='Select row'
              className='translate-y-0.5'
            />
          ),
          meta: {
            className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
          },
          enableSorting: false,
          enableHiding: false,
        }

      case 'actions':
        return {
          id: 'actions',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Actions' />
          ),
          cell: config.cell,
          enableSorting: false,
          enableHiding: false,
        }

      case 'text':
        return {
          accessorKey: config.key as string,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={config.title} />
          ),
          cell: ({ row }: CellContext<T, unknown>) => (
            <LongText
              className={cn(
                config.maxWidth ?? 'max-w-36',
                config.sticky && 'ps-3'
              )}
            >
              {row.getValue(config.key as string)}
            </LongText>
          ),
          meta: config.sticky
            ? {
                className: cn(
                  'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
                  'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
                ),
              }
            : undefined,
          enableHiding: false,
        }

      case 'combined':
        return {
          id: config.id,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={config.title} />
          ),
          cell: ({ row }: CellContext<T, unknown>) => {
            const value = config.keys.map((k) => row.original[k]).join(' ')
            return (
              <LongText className={config.maxWidth ?? 'max-w-36'}>
                {value}
              </LongText>
            )
          },
          meta: { className: `w-${config.maxWidth ?? '36'}` },
        }

      case 'badge':
        return {
          accessorKey: config.key as string,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={config.title} />
          ),
          cell: ({ row }: CellContext<T, unknown>) => {
            const val = row.getValue(config.key as string) as string
            return (
              <Badge
                variant='outline'
                className={cn('capitalize', config.badgeMap.get(val))}
              >
                {val}
              </Badge>
            )
          },
          filterFn: (row, id, value) => value.includes(row.getValue(id)),
          enableHiding: false,
          enableSorting: config.sortable ?? false,
        }

      case 'icon-label':
        return {
          accessorKey: config.key as string,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={config.title} />
          ),
          cell: ({ row }: CellContext<T, unknown>) => {
            const val = row.getValue(config.key as string) as string
            const option = config.options.find((o) => o.value === val)
            if (!option) return null
            return (
              <div className='flex items-center gap-x-2'>
                {option.icon && (
                  <option.icon size={16} className='text-muted-foreground' />
                )}
                <span className='text-sm capitalize'>{val}</span>
              </div>
            )
          },
          filterFn: (row, id, value) => value.includes(row.getValue(id)),
          enableSorting: false,
          enableHiding: false,
        }

      case 'plain':
        return {
          accessorKey: config.key as string,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title={config.title} />
          ),
          cell: ({ row }: CellContext<T, unknown>) => (
            <div>{row.getValue(config.key as string)}</div>
          ),
          enableSorting: config.sortable ?? true,
        }
    }
  })
}
