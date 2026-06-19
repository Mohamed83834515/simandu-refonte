import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { PeriodeIndicateurFormData } from '@/simadou/allTypes/periodeIndicateur'

type PeriodeIndicateurFormFieldsProps = {
  form: PeriodeIndicateurFormData
  disabled?: boolean
  idPrefix?: string
  onChange: <K extends keyof PeriodeIndicateurFormData>(
    key: K,
    value: PeriodeIndicateurFormData[K]
  ) => void
}

export default function PeriodeIndicateurFormFields({
  form,
  disabled = false,
  idPrefix = '',
  onChange,
}: PeriodeIndicateurFormFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name)

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2 sm:col-span-2'>
        <Label htmlFor={id('source-donnees')}>Source de données</Label>
        <Textarea
          id={id('source-donnees')}
          placeholder='Source de données'
          value={form.source_donnees}
          onChange={(e) => onChange('source_donnees', e.target.value)}
          disabled={disabled}
          className='min-h-[72px] resize-y'
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
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor={id('date-validation')}>Date de validation</Label>
        <Input
          id={id('date-validation')}
          type='date'
          value={form.date_validation}
          onChange={(e) => onChange('date_validation', e.target.value)}
          disabled={disabled}
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
        />
      </div>
      <div className='space-y-2 sm:col-span-2'>
        <Label htmlFor={id('observation')}>Observations</Label>
        <Textarea
          id={id('observation')}
          placeholder='Observations'
          value={form.observation}
          onChange={(e) => onChange('observation', e.target.value)}
          disabled={disabled}
          className='min-h-[96px] resize-y'
        />
      </div>
    </div>
  )
}
