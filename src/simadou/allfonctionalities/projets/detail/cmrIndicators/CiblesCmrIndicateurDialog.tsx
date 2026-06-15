import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Projet } from '@/simadou/allTypes'
import type { IndicateurCmrProjet } from '@/simadou/allTypes/indicateurCmrProjet'
import CibleCmrProjetGridPanel from './CibleCmrProjetGridPanel'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicateur: IndicateurCmrProjet | null
  codeProjet: string
  projet: Projet
}

export default function CiblesCmrIndicateurDialog({
  open,
  onOpenChange,
  indicateur,
  codeProjet,
  projet,
}: Props) {
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
              ? `${indicateur.code_ref_ind} — Saisie des valeurs cibles par zone et par année du projet.`
              : 'Sélectionnez un indicateur CMR pour gérer ses cibles.'}
            {` · Projet ${codeProjet}`}
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 py-4'>
          {indicateur ? (
            <CibleCmrProjetGridPanel
              key={indicateur.id_ref_ind_cmr}
              indicateur={indicateur}
              codeProjet={codeProjet}
              projet={projet}
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