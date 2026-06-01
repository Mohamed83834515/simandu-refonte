import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const maxWidthClass = {
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const

type ActiviteTabbedFormPanelProps = {
  children: ReactNode
  header?: ReactNode
  /** Largeur du bloc formulaire (défaut : lg, adapté au suivi tâche) */
  maxWidth?: keyof typeof maxWidthClass
  className?: string
}

/** Conteneur centré pour les sous-vues formulaire dans le modal activité PTBA. */
export default function ActiviteTabbedFormPanel({
  children,
  header,
  maxWidth = 'lg',
  className,
}: ActiviteTabbedFormPanelProps) {
  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto w-full space-y-4',
          maxWidthClass[maxWidth]
        )}
      >
        {header}
        {children}
      </div>
    </div>
  )
}
