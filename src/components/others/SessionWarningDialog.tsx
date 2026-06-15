import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface Props {
  remainingSeconds: number
  onExtend: () => void
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export function SessionWarningDialog({ remainingSeconds, onExtend }: Props) {
  return (
    <Dialog open>
      <DialogContent
        className="max-w-sm text-center"
        onInteractOutside={(e) => e.preventDefault()}  // can't dismiss by clicking outside
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex size-12 items-center justify-center rounded-full
                          border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <Clock className="size-5 text-amber-600 dark:text-amber-400" />
          </div>

          <DialogTitle className="text-base font-medium">
            Session sur le point d'expirer
          </DialogTitle>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Votre session expirera dans{' '}
            <span className="font-semibold tabular-nums text-foreground">
              {fmt(remainingSeconds)}
            </span>{' '}
            en raison d'inactivité.
          </p>

          <Button className="w-full" onClick={onExtend}>
            Rester connecté
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}