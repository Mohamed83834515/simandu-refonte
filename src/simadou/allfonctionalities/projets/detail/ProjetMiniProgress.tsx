type ProjetMiniProgressProps = {
  value: number
  colorClassName?: string
}

export default function ProjetMiniProgress({
  value,
  colorClassName = 'bg-primary',
}: ProjetMiniProgressProps) {
  return (
    <div className='h-1 w-full overflow-hidden rounded-full bg-muted'>
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClassName}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}
