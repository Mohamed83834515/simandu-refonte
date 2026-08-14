import { useRef } from 'react'
import { ExternalLink, FileText, FileUp, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateInput } from '@/components/ui/date-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type {
  DocumentationCmrFormData,
  FondCarteFormData,
  PeriodeSousRessourceType,
  SimpleSousRessourceFormData,
  SousRessourceDocumentsFormData,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'
import {
  resolveDocumentFileName,
  resolveDocumentUrl,
} from '@/simadou/lib/documentProjetUtils'

const DOCUMENT_ACCEPT =
  'application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip'

const COMPACT_TEXTAREA_CLASS = 'min-h-[56px] resize-y'

type SousRessourceFormFieldsProps = {
  resource: PeriodeSousRessourceType
  disabled?: boolean
  idPrefix?: string
  simpleForm?: SimpleSousRessourceFormData
  documentationForm?: DocumentationCmrFormData
  fondCarteForm?: FondCarteFormData
  onSimpleChange?: (
    key: keyof SimpleSousRessourceFormData,
    value: SimpleSousRessourceFormData[keyof SimpleSousRessourceFormData]
  ) => void
  onDocumentationChange?: (
    key: keyof DocumentationCmrFormData,
    value: DocumentationCmrFormData[keyof DocumentationCmrFormData]
  ) => void
  onDocumentationDocumentsChange?: (documents: SousRessourceDocumentsFormData) => void
  onFondCarteChange?: (
    key: keyof FondCarteFormData,
    value: FondCarteFormData[keyof FondCarteFormData]
  ) => void
  onFondCarteDocumentsChange?: (documents: SousRessourceDocumentsFormData) => void
}

function DocumentFileField({
  id,
  label = 'Document',
  disabled,
  documents,
  onDocumentsChange,
}: {
  id: string
  label?: string
  disabled?: boolean
  documents: SousRessourceDocumentsFormData
  onDocumentsChange: (next: SousRessourceDocumentsFormData) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const existingHref = resolveDocumentUrl(documents.existingDocument)
  const existingLabel = resolveDocumentFileName(documents.existingDocument)

  const clearInput = () => {
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={inputRef}
        id={id}
        type='file'
        accept={DOCUMENT_ACCEPT}
        className='hidden'
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          onDocumentsChange({
            ...documents,
            documentFile: file,
            removeExistingDocument: false,
          })
          clearInput()
        }}
      />

      {documents.documentFile ? (
        <div className='flex items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2'>
          <div className='flex min-w-0 items-center gap-2'>
            <FileText className='h-3.5 w-3.5 shrink-0 text-primary/70' />
            <span className='truncate text-sm font-medium'>
              {documents.documentFile.name}
            </span>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-7 w-7 shrink-0'
            onClick={() => {
              onDocumentsChange({ ...documents, documentFile: null })
              clearInput()
            }}
            disabled={disabled}
            aria-label='Retirer le fichier'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      ) : existingHref ? (
        <div className='flex items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2'>
          <a
            href={existingHref}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-primary hover:underline'
          >
            <ExternalLink className='h-3.5 w-3.5 shrink-0' />
            <span className='truncate'>{existingLabel}</span>
          </a>
          <div className='flex shrink-0 items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              aria-label='Remplacer le fichier'
            >
              <FileUp className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() =>
                onDocumentsChange({
                  documentFile: null,
                  existingDocument: '',
                  removeExistingDocument: true,
                })
              }
              disabled={disabled}
              aria-label='Supprimer le fichier'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ) : documents.removeExistingDocument ? (
        <div className='flex items-center justify-between gap-2 rounded-lg border border-dashed bg-muted/10 px-3 py-2'>
          <span className='text-sm text-muted-foreground'>Fichier supprimé</span>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            aria-label='Ajouter un fichier'
          >
            <FileUp className='h-4 w-4' />
          </Button>
        </div>
      ) : (
        <button
          type='button'
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <FileUp className='h-4 w-4' />
          Sélectionner un fichier
        </button>
      )}
    </div>
  )
}

function DateValidationField({
  id,
  disabled,
  value,
  onChange,
}: {
  id: string
  disabled?: boolean
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>Date de validation</Label>
      <DateInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className='w-full max-w-xs'
      />
    </div>
  )
}

function SourceObservationRow({
  id,
  disabled,
  sourceDonnees,
  observation,
  onSourceChange,
  onObservationChange,
}: {
  id: (name: string) => string
  disabled?: boolean
  sourceDonnees: string
  observation: string
  onSourceChange: (value: string) => void
  onObservationChange: (value: string) => void
}) {
  return (
    <div className='grid gap-3 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor={id('source-donnees')}>Source de données</Label>
        <Textarea
          id={id('source-donnees')}
          placeholder='Source de données'
          value={sourceDonnees}
          onChange={(e) => onSourceChange(e.target.value)}
          disabled={disabled}
          className={COMPACT_TEXTAREA_CLASS}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor={id('observation')}>Observations</Label>
        <Textarea
          id={id('observation')}
          placeholder='Observations'
          value={observation}
          onChange={(e) => onObservationChange(e.target.value)}
          disabled={disabled}
          className={COMPACT_TEXTAREA_CLASS}
        />
      </div>
    </div>
  )
}

export default function SousRessourceFormFields({
  resource,
  disabled = false,
  idPrefix = '',
  simpleForm,
  documentationForm,
  fondCarteForm,
  onSimpleChange,
  onDocumentationChange,
  onDocumentationDocumentsChange,
  onFondCarteChange,
  onFondCarteDocumentsChange,
}: SousRessourceFormFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name)

  if (resource === 'documentations' && documentationForm && onDocumentationChange) {
    return (
      <div className='mx-auto w-full max-w-xl space-y-3'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor={id('titre')}>Titre</Label>
            <Input
              id={id('titre')}
              placeholder='Titre du document'
              value={documentationForm.titre}
              onChange={(e) => onDocumentationChange('titre', e.target.value)}
              disabled={disabled}
              className='w-full'
            />
          </div>
          <DateValidationField
            id={id('date-validation')}
            disabled={disabled}
            value={documentationForm.date_validation}
            onChange={(value) => onDocumentationChange('date_validation', value)}
          />
        </div>

        <SourceObservationRow
          id={id}
          disabled={disabled}
          sourceDonnees={documentationForm.source_donnees}
          observation={documentationForm.observation}
          onSourceChange={(value) => onDocumentationChange('source_donnees', value)}
          onObservationChange={(value) => onDocumentationChange('observation', value)}
        />

        <DocumentFileField
          id={id('document')}
          disabled={disabled}
          documents={documentationForm}
          onDocumentsChange={
            onDocumentationDocumentsChange ??
            ((next) => {
              onDocumentationChange('documentFile', next.documentFile)
              onDocumentationChange('existingDocument', next.existingDocument)
              onDocumentationChange('removeExistingDocument', next.removeExistingDocument)
            })
          }
        />
      </div>
    )
  }

  if (resource === 'fonds-carte' && fondCarteForm && onFondCarteChange) {
    return (
      <div className='mx-auto w-full max-w-xl space-y-3'>
        <DateValidationField
          id={id('date-validation')}
          disabled={disabled}
          value={fondCarteForm.date_validation}
          onChange={(value) => onFondCarteChange('date_validation', value)}
        />

        <SourceObservationRow
          id={id}
          disabled={disabled}
          sourceDonnees={fondCarteForm.source_donnees}
          observation={fondCarteForm.observation}
          onSourceChange={(value) => onFondCarteChange('source_donnees', value)}
          onObservationChange={(value) => onFondCarteChange('observation', value)}
        />

        <DocumentFileField
          id={id('shape-file')}
          label='Document'
          disabled={disabled}
          documents={fondCarteForm}
          onDocumentsChange={
            onFondCarteDocumentsChange ??
            ((next) => {
              onFondCarteChange('documentFile', next.documentFile)
              onFondCarteChange('existingDocument', next.existingDocument)
              onFondCarteChange('removeExistingDocument', next.removeExistingDocument)
            })
          }
        />
      </div>
    )
  }

  if (!simpleForm || !onSimpleChange) return null

  return (
    <div className='mx-auto w-full max-w-xl space-y-3'>
      <DateValidationField
        id={id('date-validation')}
        disabled={disabled}
        value={simpleForm.date_validation}
        onChange={(value) => onSimpleChange('date_validation', value)}
      />

      <SourceObservationRow
        id={id}
        disabled={disabled}
        sourceDonnees={simpleForm.source_donnees}
        observation={simpleForm.observation}
        onSourceChange={(value) => onSimpleChange('source_donnees', value)}
        onObservationChange={(value) => onSimpleChange('observation', value)}
      />
    </div>
  )
}
