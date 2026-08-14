import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { ConfirmDialog } from '@/components/others/confirm-dialog'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'

type GenericDeleteDialogProps<T = any> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: T | null
  entityName: string
  getEntityLabel?: (row: T) => string
  onDelete: (row: T) => void
  destructive?: boolean
}

export function GenericDeleteDialog<T>({
  open,
  onOpenChange,
  currentRow,
  entityName,
  getEntityLabel,
  onDelete,
  destructive = true,
}: GenericDeleteDialogProps<T>) {
  const [showTimer, setShowTimer] = useState(false)
  const { data: config } = useGeneralParamsQuery()
  const [timer, setTimer] = useState(config?.deleteOrUpdateDelaySeconds ?? 5)
  // Réinitialiser quand le dialogue se ferme
  useEffect(() => {
    if (!open) {
      setShowTimer(false)
      setTimer(config?.deleteOrUpdateDelaySeconds ?? 5)
    }
  }, [open])

  // Timer après confirmation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (showTimer && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (showTimer && timer === 0) {
      // Supprimer après le timer
      if (currentRow) {
        onDelete(currentRow)
      }
      onOpenChange(false)
      setShowTimer(false)
      setTimer(config?.deleteOrUpdateDelaySeconds ?? 5)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showTimer, timer, onDelete, currentRow, onOpenChange])

  const handleConfirm = () => {
    // Premier clic : afficher le timer
    setShowTimer(true)
    setTimer(config?.deleteOrUpdateDelaySeconds ?? 5)
  }

  const handleConfirmNow = () => {
    // Supprimer immédiatement
    if (currentRow) {
      onDelete(currentRow)
    }
    onOpenChange(false)
    setShowTimer(false)
    setTimer(5)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setShowTimer(false)
    setTimer(config?.deleteOrUpdateDelaySeconds ?? 5)
  }

  // Si le timer est actif, afficher la vue avec compte à rebours
  if (showTimer) {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={handleCancel}
        handleConfirm={handleConfirmNow}
        title={
          <div className="flex w-full items-center justify-between">
            <span className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='stroke-destructive' size={18} />
              Confirmation de suppression
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <Clock className="h-3 w-3" />
              Annulation dans {timer}s
            </span>
          </div>
        }
        desc={
          <div className="space-y-3">
            <p className="text-sm">
              La suppression de{' '}
              {getEntityLabel && currentRow && (
                <span className='font-bold text-foreground'>{getEntityLabel(currentRow)}</span>
              )}{' '}
              aura lieu dans <span className="font-mono font-bold text-destructive">{timer} secondes</span>.
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Suppression automatique</span>
                <span className="font-mono font-semibold text-destructive">{config?.deleteOrUpdateDelaySeconds ?? 5}s</span>
              </div>
              <Progress value={(timer / (config?.deleteOrUpdateDelaySeconds ?? 5)) * 100} className="h-1.5" />
              <button
                type="button"
                onClick={handleCancel}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-border/50 bg-background px-2 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                <RefreshCw className="h-3 w-3" />
                Annuler la suppression
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              ✨ Cliquez sur <strong>"Supprimer maintenant"</strong> pour une suppression immédiate.
            </p>
          </div>
        }
        confirmText="Supprimer maintenant"
        destructive={destructive}
        cancelBtnText="Annuler"
      />
    )
  }

  // Vue initiale : demande de confirmation
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleCancel}
      handleConfirm={handleConfirm}
      title={
        <span className='flex items-center gap-2 text-destructive'>
          <AlertTriangle className='stroke-destructive' size={18} />
          Supprimer {entityName}
        </span>
      }
      desc={
        <p>
          Voulez-vous vraiment supprimer{' '}
          {getEntityLabel && currentRow && (
            <span className='font-bold text-foreground'>{getEntityLabel(currentRow)}</span>
          )}{' '}
          ? Cette action est irréversible.
        </p>
      }
      confirmText="Oui, supprimer"
      destructive={destructive}
      cancelBtnText="Non, annuler"
    />
  )
}