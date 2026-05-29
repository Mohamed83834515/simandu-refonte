import type { ComponentProps } from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export function NiveauTabsList({
  className,
  ...props
}: ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(
        'h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0',
        className
      )}
      {...props}
    />
  )
}

type NiveauTabTriggerProps = ComponentProps<typeof TabsTrigger> & {
  count?: number
}

export function NiveauTabTrigger({
  count,
  className,
  children,
  ...props
}: NiveauTabTriggerProps) {
  return (
    <TabsTrigger
      className={cn(
        'relative -mb-px shrink-0 rounded-none border-0 border-b-2 border-transparent',
        'bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap shadow-none',
        'text-muted-foreground transition-colors hover:text-foreground',
        'data-[state=active]:border-primary data-[state=active]:bg-transparent',
        'data-[state=active]:font-semibold data-[state=active]:text-primary',
        'data-[state=active]:shadow-none',
        'dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent',
        'dark:data-[state=active]:text-primary',
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className='ms-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-sm bg-muted px-1 py-0.5 text-[10px] leading-none font-medium text-muted-foreground tabular-nums'>
          {count}
        </span>
      )}
    </TabsTrigger>
  )
}
