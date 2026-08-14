import { FolderOpen, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DossierProjet } from '@/simadou/allTypes/dossierProjet'

type DossierCardProps = {
  dossier: DossierProjet
  onOpen: (dossier: DossierProjet) => void  // ✅ Requis
  onEdit: (dossier: DossierProjet) => void
  onDelete: (dossier: DossierProjet) => void
}

export function DossierCard({ dossier, onOpen, onEdit, onDelete }: DossierCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border border-amber-200 bg-card p-4 transition-all duration-300',
        'hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg dark:border-amber-800/50'
      )}
    >
      <div className='absolute -top-2 -right-2'>
        <span className='inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 shadow-sm dark:bg-amber-950/30 dark:text-amber-400'>
          Dossier
        </span>
      </div>

      <div className='flex items-start justify-between gap-2'>
        <button
          type='button'
          onClick={() => onOpen(dossier)}
          className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 transition-transform group-hover:scale-110 dark:bg-amber-950/30'
        >
          <FolderOpen className='h-6 w-6 text-amber-600 dark:text-amber-400' />
        </button>

        <div className='flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100'>
          <button
            type='button'
            onClick={() => onEdit(dossier)}
            title='Modifier'
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground hover:shadow-sm'
          >
            <Pencil className='h-3.5 w-3.5' />
          </button>
          <button
            type='button'
            onClick={() => onDelete(dossier)}
            title='Supprimer'
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>

      <button
        type='button'
        onClick={() => onOpen(dossier)}
        className='flex flex-1 flex-col gap-1 text-left'
      >
        <p className='line-clamp-2 text-sm leading-snug font-semibold text-foreground'>
          {dossier.nom_dossier?.trim() || 'Sans nom'}
        </p>
        <p className='line-clamp-3 text-xs text-muted-foreground'>
          {dossier.description_dossier?.trim() || 'Aucune description'}
        </p>
      </button>

      <Button
        type='button'
        variant='outline'
        size='sm'
        className='w-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-950/30'
        onClick={() => onOpen(dossier)}
      >
        Ouvrir le dossier
      </Button>
    </div>
  )
}