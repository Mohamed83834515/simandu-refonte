import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ProgrammeFormPanel from './ProgrammeFormPanel'

type OpenProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProgrammeDialog({ open, onOpenChange }: OpenProps) {
  const close = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
        aria-describedby={undefined}
      >
        <DialogHeader className='space-y-1 border-b px-6 py-4 text-left'>
          <DialogTitle>Ajouter un programme</DialogTitle>
          <DialogDescription>
            Renseignez les informations générales du programme ou de la politique.
          </DialogDescription>
        </DialogHeader>
        <div className='px-6 py-4'>
          <ProgrammeFormPanel onClose={close} onSuccess={close} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
