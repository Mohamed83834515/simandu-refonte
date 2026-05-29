import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function DetailViewLoading() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-8 w-3/4' />
      <Skeleton className='h-4 w-1/3' />
      <div className='grid gap-3 sm:grid-cols-2'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-16 rounded-lg' />
        ))}
      </div>
    </div>
  )
}

export function DetailViewError({ message }: { message: string }) {
  return (
    <div className='flex items-center justify-center rounded-lg border border-dashed py-10 text-sm text-destructive'>
      {message}
    </div>
  )
}

export function DetailViewHeader({
  title,
  badge,
  description,
}: {
  title: string
  badge?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-start gap-2'>
        <h3 className='text-base font-semibold leading-snug text-foreground'>{title}</h3>
        {badge}
      </div>
      {description ? (
        <p className='text-sm leading-relaxed text-muted-foreground'>{description}</p>
      ) : null}
    </div>
  )
}

export function DetailHighlight({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 dark:bg-primary/10',
        className
      )}
    >
      <p className='text-[11px] font-semibold tracking-wide text-primary/80 uppercase'>
        {label}
      </p>
      <div className='mt-1.5 text-sm leading-relaxed text-foreground'>{children}</div>
    </div>
  )
}

export function DetailSection({
  title,
  children,
  className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      {title ? (
        <p className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
          {title}
        </p>
      ) : null}
      {children}
    </section>
  )
}

export function DetailFieldGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <dl className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>{children}</dl>
  )
}

export function DetailField({
  label,
  value,
  className,
  mono,
}: {
  label: string
  value: React.ReactNode
  className?: string
  mono?: boolean
}) {
  const isEmpty =
    value == null ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '')

  return (
    <div
      className={cn(
        'rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors',
        className
      )}
    >
      <dt className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
        {label}
      </dt>
      <dd
        className={cn(
          'mt-1 text-sm leading-snug text-foreground break-words',
          mono && 'font-mono text-xs'
        )}
      >
        {isEmpty ? <span className='text-muted-foreground'>—</span> : value}
      </dd>
    </div>
  )
}

export function DetailMetric({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card px-4 py-3 shadow-sm',
        className
      )}
    >
      <p className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
        {label}
      </p>
      <p className='mt-1 text-2xl font-bold tabular-nums tracking-tight text-foreground'>
        {value}
      </p>
    </div>
  )
}

export function DetailViewFooter({ onClose }: { onClose: () => void }) {
  return (
    <div className='flex justify-end border-t pt-4'>
      <Button type='button' variant='outline' size='sm' onClick={onClose}>
        Fermer
      </Button>
    </div>
  )
}
