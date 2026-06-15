import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ActiviteTabbedFormPanelProps = {
  children: ReactNode
  header?: ReactNode
  className?: string
}

/** Conteneur pour les sous-vues formulaire dans le modal activité PTBA. */
export default function ActiviteTabbedFormPanel({
  children,
  header,
  className,
}: ActiviteTabbedFormPanelProps) {
  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-2 sm:py-3',
        className
      )}
    >
      <div className='w-full space-y-3'>
        {header}
        {children}
      </div>
    </div>
  )
}
