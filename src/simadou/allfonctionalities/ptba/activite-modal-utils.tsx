import { cn } from '@/lib/utils'
import type { Ptba } from '@/simadou/allTypes'

/** Titre accessible du modal (sans code activité). */
export function activiteModalTitle(
  activite: Ptba | null,
  fallback: string
): string {
  if (!activite?.intitule_activite_ptba) return fallback
  return activite.intitule_activite_ptba
}

/** En-tête compact au-dessus des tableaux dans le modal planification PTBA. */
export function ActiviteTableHeading({
  activite,
  className,
}: {
  activite: Ptba
  className?: string
}) {
  return (
    <div
      className={cn(
        'shrink-0 border-b bg-muted/30 px-4 py-2',
        className
      )}
    >
      <p className='text-sm font-semibold leading-snug text-foreground'>
        {activite.intitule_activite_ptba}
      </p>
    </div>
  )
}
