import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PeriodeIndicateurFormData } from '@/simadou/allTypes/periodeIndicateur'

type PeriodeIndicateurFormFieldsProps = {
  form: PeriodeIndicateurFormData
  disabled?: boolean
  idPrefix?: string
  /** dialog = modal layout (default). panel = inline workspace layout. */
  variant?: 'dialog' | 'panel'
  onChange: <K extends keyof PeriodeIndicateurFormData>(
    key: K,
    value: PeriodeIndicateurFormData[K]
  ) => void
}

export default function PeriodeIndicateurFormFields({
  form,
  disabled = false,
  idPrefix = '',
  variant = 'dialog',
  onChange,
}: PeriodeIndicateurFormFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name)

  if (variant === 'panel') {
    return (
      <div className='grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='space-y-2 sm:col-span-2 lg:col-span-3'>
          <Label htmlFor={id('source-donnees')}>Source de données</Label>
          <Textarea
            id={id('source-donnees')}
            placeholder='Source de données'
            value={form.source_donnees}
            onChange={(e) => onChange('source_donnees', e.target.value)}
            disabled={disabled}
            className='min-h-[72px] w-full resize-y'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor={id('periode-collecte')}>Période de collecte</Label>
          <Input
            id={id('periode-collecte')}
            placeholder='Ex. Trimestre 1 2026'
            value={form.periode_collecte}
            onChange={(e) => onChange('periode_collecte', e.target.value)}
            disabled={disabled}
            className='w-full'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor={id('date-validation')}>Date de validation</Label>
          <DateInput
            id={id('date-validation')}
            value={form.date_validation}
            onChange={(e) => onChange('date_validation', e.target.value)}
            disabled={disabled}
            className='w-full'
          />
        </div>

        <div className='space-y-2 sm:col-span-2 lg:col-span-1'>
          <Label htmlFor={id('valeur-periode')}>Résultat mesuré (Nbre)</Label>
          <Input
            id={id('valeur-periode')}
            type='number'
            step='any'
            placeholder='0'
            value={form.valeur_periode}
            onChange={(e) =>
              onChange('valeur_periode', Number(e.target.value) || 0)
            }
            disabled={disabled}
            className='w-full'
          />
        </div>

        <div className='space-y-2 sm:col-span-2 lg:col-span-3'>
          <Label htmlFor={id('observation')}>Observations</Label>
          <Textarea
            id={id('observation')}
            placeholder='Observations'
            value={form.observation}
            onChange={(e) => onChange('observation', e.target.value)}
            disabled={disabled}
            className='min-h-[96px] w-full resize-y'
          />
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-xl space-y-3'>
      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='space-y-2'>
          <Label htmlFor={id('periode-collecte')}>Période de collecte</Label>
          <Input
            id={id('periode-collecte')}
            placeholder='Ex. T1 2026'
            value={form.periode_collecte}
            onChange={(e) => onChange('periode_collecte', e.target.value)}
            disabled={disabled}
            className='w-full'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor={id('date-validation')}>Date de validation</Label>
          <DateInput
            id={id('date-validation')}
            value={form.date_validation}
            onChange={(e) => onChange('date_validation', e.target.value)}
            disabled={disabled}
            className='w-full'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor={id('valeur-periode')}>Résultat mesuré (Nbre)</Label>
          <Input
            id={id('valeur-periode')}
            type='number'
            step='any'
            placeholder='0'
            value={form.valeur_periode}
            onChange={(e) =>
              onChange('valeur_periode', Number(e.target.value) || 0)
            }
            disabled={disabled}
            className='w-full'
          />
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor={id('source-donnees')}>Source de données</Label>
          <Textarea
            id={id('source-donnees')}
            placeholder='Source de données'
            value={form.source_donnees}
            onChange={(e) => onChange('source_donnees', e.target.value)}
            disabled={disabled}
            className='min-h-[56px] w-full resize-y'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor={id('observation')}>Observations</Label>
          <Textarea
            id={id('observation')}
            placeholder='Observations'
            value={form.observation}
            onChange={(e) => onChange('observation', e.target.value)}
            disabled={disabled}
            className='min-h-[56px] w-full resize-y'
          />
        </div>
      </div>
    </div>
  )
}
