import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Ptba } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import { getValeurCibleIndicateur } from '@/simadou/allColonnes/suivi-indicateur-columns'
import SuiviIndicateurInlineManager from './SuiviIndicateurInlineManager'

type SuiviIndicateurSuiviDialogProps = {
  activite: Ptba
  indicateur: IndicateurTache | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SuiviIndicateurSuiviDialog({
  activite,
  indicateur,
  open,
  onOpenChange,
}: SuiviIndicateurSuiviDialogProps) {
  if (!indicateur) return null

  const valeurCible = getValeurCibleIndicateur(indicateur)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'
        aria-describedby={undefined}
      >
        <DialogHeader className='shrink-0 border-b px-6 py-4'>
          <DialogTitle className='text-base leading-snug'>
            Suivi — {indicateur.intitule_indicateur_tache}
          </DialogTitle>
          <DialogDescription>
            {valeurCible
              ? `Valeur cible : ${valeurCible} · `
              : ''}
            Ajoutez ou modifiez les suivis ligne par ligne.
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
          <SuiviIndicateurInlineManager
            activite={activite}
            indicateur={indicateur}
            open={open}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
