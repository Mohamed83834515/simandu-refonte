import { Fragment } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Action<TData> = {
  label: string
  icon?: React.ReactNode
  onClick: (row: TData) => void
  className?: string
  separator?: boolean  // affiche un séparateur AVANT cet item
}

type GenericRowActionsProps<TData> = {
  row: Row<TData>
  actions: Action<TData>[]
}

export function GenericRowActions<TData>({
  row,
  actions,
}: GenericRowActionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        {actions.map((action, index) => (
          <Fragment key={`${action.label}-${index}`}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                action.onClick(row.original)
              }}
              className={action.className}
            >
              {action.label}
              {action.icon && (
                <DropdownMenuShortcut>{action.icon}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}