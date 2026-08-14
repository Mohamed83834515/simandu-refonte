import type { Convention } from '@/simadou/allTypes/convention'
import { cn } from '@/lib/utils'

export function conventionModalTitle(
  convention: Convention | null,
  fallback: string
): string {
  if (!convention?.intutile_conv) return fallback
  return convention.intutile_conv
}

export function ConventionTableHeading({
  convention,
  className,
}: {
  convention: Convention
  className?: string
}) {
  return (
    <div
      className={cn('shrink-0 border-b bg-muted/30 px-4 py-2', className)}
    >
      <p className='text-sm font-semibold leading-snug text-foreground'>
        {convention.intutile_conv}
      </p>
      <p className='font-mono text-xs text-muted-foreground'>
        {convention.code_convention}
      </p>
    </div>
  )
}
