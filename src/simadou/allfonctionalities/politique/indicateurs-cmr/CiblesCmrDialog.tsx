import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { IndicateurCmr } from '@/simadou/allTypes'
import CibleCmrGridPanel from './CibleCmrGridPanel'

type OpenProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicateur?: IndicateurCmr | null
}

export default function CiblesCmrDialog({
  open,
  onOpenChange,
  indicateur,
}: OpenProps) {
  const handleClose = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='gap-0 max-h-[90vh] overflow-y-auto p-0 sm:max-w-5xl'
        aria-describedby={undefined}
      >
        <DialogHeader className='border-b px-6 py-4 pr-12'>
          <DialogTitle className='text-base leading-snug'>
            {indicateur?.intitule_ref_ind ?? 'Cibles CMR'}
          </DialogTitle>
          <DialogDescription>
            {indicateur
              ? `${indicateur.code_ref_ind} — Saisie des valeurs cibles par zone et par année du programme actif.`
              : 'Sélectionnez un indicateur CMR pour gérer ses cibles.'}
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 py-4'>
          {indicateur ? (
            <CibleCmrGridPanel
              key={indicateur.id_ref_ind_cmr}
              indicateur={indicateur}
              onClose={handleClose}
            />
          ) : (
            <p className='py-10 text-center text-sm text-muted-foreground'>
              Ouvrez les cibles depuis un indicateur CMR.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
