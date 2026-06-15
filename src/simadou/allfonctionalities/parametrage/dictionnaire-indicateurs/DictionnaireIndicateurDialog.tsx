import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import DictionnaireIndicateurFormPanel from './DictionnaireIndicateurFormPanel'

type OpenProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DictionnaireIndicateurDialog({ open, onOpenChange }: OpenProps) {
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
        aria-describedby={undefined}
      >
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle>Ajouter un indicateur</DialogTitle>
        </DialogHeader>
        <div className='max-h-[min(70vh,36rem)] overflow-y-auto px-6 py-4'>
          <DictionnaireIndicateurFormPanel onClose={close} onSuccess={close} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
