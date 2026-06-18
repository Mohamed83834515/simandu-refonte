import { formatRapportMontant } from './rapport-format-utils'

type Props = {
  value: unknown
}

export function RapportMontantCell({ value }: Props) {
  const formatted = formatRapportMontant(value)
  if (formatted === '—') {
    return (
      <div className='flex justify-center'>
        <span className='text-sm text-muted-foreground'>—</span>
      </div>
    )
  }

  return (
    <div className='flex justify-center'>
      <span className='inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'>
        {formatted}
      </span>
    </div>
  )
}
