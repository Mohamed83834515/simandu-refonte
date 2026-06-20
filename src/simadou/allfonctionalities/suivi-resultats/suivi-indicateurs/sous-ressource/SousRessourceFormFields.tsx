import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type {
  DocumentationCmrFormData,
  PeriodeSousRessourceType,
  SimpleSousRessourceFormData,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'

type SousRessourceFormFieldsProps = {
  resource: PeriodeSousRessourceType
  disabled?: boolean
  idPrefix?: string
  simpleForm?: SimpleSousRessourceFormData
  documentationForm?: DocumentationCmrFormData
  onSimpleChange?: (
    key: keyof SimpleSousRessourceFormData,
    value: SimpleSousRessourceFormData[keyof SimpleSousRessourceFormData]
  ) => void
  onDocumentationChange?: (
    key: keyof DocumentationCmrFormData,
    value: DocumentationCmrFormData[keyof DocumentationCmrFormData]
  ) => void
}

export default function SousRessourceFormFields({
  resource,
  disabled = false,
  idPrefix = '',
  simpleForm,
  documentationForm,
  onSimpleChange,
  onDocumentationChange,
}: SousRessourceFormFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name)

  if (resource === 'documentations' && documentationForm && onDocumentationChange) {
    return (
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor={id('source-donnees')}>Source de données</Label>
          <Textarea
            id={id('source-donnees')}
            placeholder='Source de données'
            value={documentationForm.source_donnees}
            onChange={(e) => onDocumentationChange('source_donnees', e.target.value)}
            disabled={disabled}
            className='min-h-[72px] resize-y'
          />
        </div>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor={id('titre')}>Titre</Label>
          <Input
            id={id('titre')}
            placeholder='Titre du document'
            value={documentationForm.titre}
            onChange={(e) => onDocumentationChange('titre', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor={id('date-validation')}>Date de validation</Label>
          <Input
            id={id('date-validation')}
            type='date'
            value={documentationForm.date_validation}
            onChange={(e) =>
              onDocumentationChange('date_validation', e.target.value)
            }
            disabled={disabled}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor={id('document')}>Document</Label>
          <Input
            id={id('document')}
            placeholder='Référence ou lien du document'
            value={documentationForm.document}
            onChange={(e) => onDocumentationChange('document', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor={id('observation')}>Observations</Label>
          <Textarea
            id={id('observation')}
            placeholder='Observations'
            value={documentationForm.observation}
            onChange={(e) => onDocumentationChange('observation', e.target.value)}
            disabled={disabled}
            className='min-h-[96px] resize-y'
          />
        </div>
      </div>
    )
  }

  if (!simpleForm || !onSimpleChange) return null

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2 sm:col-span-2'>
        <Label htmlFor={id('source-donnees')}>Source de données</Label>
        <Textarea
          id={id('source-donnees')}
          placeholder='Source de données'
          value={simpleForm.source_donnees}
          onChange={(e) => onSimpleChange('source_donnees', e.target.value)}
          disabled={disabled}
          className='min-h-[72px] resize-y'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor={id('date-validation')}>Date de validation</Label>
        <Input
          id={id('date-validation')}
          type='date'
          value={simpleForm.date_validation}
          onChange={(e) => onSimpleChange('date_validation', e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className='space-y-2 sm:col-span-2'>
        <Label htmlFor={id('observation')}>Observations</Label>
        <Textarea
          id={id('observation')}
          placeholder='Observations'
          value={simpleForm.observation}
          onChange={(e) => onSimpleChange('observation', e.target.value)}
          disabled={disabled}
          className='min-h-[96px] resize-y'
        />
      </div>
    </div>
  )
}
