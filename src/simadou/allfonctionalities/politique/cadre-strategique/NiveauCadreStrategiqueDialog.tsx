import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import NiveauCadreStrategiqueManager from './NiveauCadreStrategiqueManager'

type OpenProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NiveauCadreStrategiqueDialog({ open, onOpenChange }: OpenProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-3xl' aria-describedby={undefined}>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle>Configuration des niveaux du cadre stratégique</DialogTitle>
        </DialogHeader>
        <div className='max-h-[min(70vh,36rem)] overflow-y-auto px-6 py-4'>
          <NiveauCadreStrategiqueManager />
        </div>
      </DialogContent>
    </Dialog>
  )
}
