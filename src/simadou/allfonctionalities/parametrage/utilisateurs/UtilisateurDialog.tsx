import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import UtilisateurFormPanel from './UtilisateurFormPanel'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'

type OpenProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UtilisateurDialog({ open, onOpenChange }: OpenProps) {
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.lg}>
        <DialogHeader>
          <DialogTitle>
            Ajouter un nouveau utilisatur 
          </DialogTitle>
        </DialogHeader>
        <UtilisateurFormPanel onClose={close} onSuccess={close} />
      </DialogContent>

    </Dialog>
  )
}
