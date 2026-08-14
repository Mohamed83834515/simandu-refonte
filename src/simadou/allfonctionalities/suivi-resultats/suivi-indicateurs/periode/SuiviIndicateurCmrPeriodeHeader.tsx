import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PeriodeIndicateur } from '@/simadou/allTypes/periodeIndicateur'
import {
  formatPeriodeSuiviDate,
  resolvePeriodeIndicateurLabel,
  resolvePeriodeIndicateurSelectValue,
  resolvePeriodeSuiviStats,
} from './periodeIndicateurFormUtils'

type SuiviIndicateurCmrPeriodeHeaderProps = {
  periodes: PeriodeIndicateur[]
  selectedPeriodeKey: string
  onSelectedPeriodeKeyChange: (key: string) => void
  isLoading?: boolean
  isError?: boolean
}

export default function SuiviIndicateurCmrPeriodeHeader({
  periodes,
  selectedPeriodeKey,
  onSelectedPeriodeKeyChange,
  isLoading = false,
  isError = false,
}: SuiviIndicateurCmrPeriodeHeaderProps) {
  const stats = resolvePeriodeSuiviStats(periodes)

  const periodeOptions = periodes.map((periode) => ({
    key: resolvePeriodeIndicateurSelectValue(periode),
    label: resolvePeriodeIndicateurLabel(periode),
  }))

  return (
    <Card className='h-full py-0'>
      <CardContent className='flex min-h-[9.5rem] flex-col justify-between gap-3 px-3 py-3'>
        <div className='space-y-1.5'>
          <Label htmlFor='periode-suivi-select' className='text-xs'>
            Sélectionner une période
          </Label>
          {isLoading ? (
            <div className='flex h-9 items-center justify-center rounded-md border border-dashed'>
              <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
            </div>
          ) : isError ? (
            <p className='text-xs text-destructive'>
              Impossible de charger les périodes.
            </p>
          ) : (
            <Select
              value={selectedPeriodeKey || undefined}
              onValueChange={onSelectedPeriodeKeyChange}
              disabled={periodeOptions.length === 0}
            >
              <SelectTrigger id='periode-suivi-select' className='h-9 w-full'>
                <SelectValue
                  placeholder={
                    periodeOptions.length === 0
                      ? 'Aucune période enregistrée'
                      : 'Choisir une période…'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {periodeOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <dl className='grid grid-cols-2 gap-2'>
          <div className='rounded-md border bg-muted/40 px-2.5 py-2'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Périodes suivies
            </dt>
            <dd className='mt-0.5 text-lg font-semibold tabular-nums'>
              {isLoading ? '—' : stats.count}
            </dd>
          </div>
          <div className='rounded-md border bg-muted/40 px-2.5 py-2'>
            <dt className='text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
              Dernière date de suivi
            </dt>
            <dd className='mt-0.5 text-sm font-medium tabular-nums'>
              {isLoading ? '—' : formatPeriodeSuiviDate(stats.lastSuiviDate)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
