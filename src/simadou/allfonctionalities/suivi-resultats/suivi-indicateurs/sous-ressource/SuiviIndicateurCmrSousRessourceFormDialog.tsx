import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { formPrimaryButtonClassName } from '@/Global/Forms/form-footer-styles'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreatePeriodeSousRessource,
  useUpdatePeriodeSousRessource,
} from '@/simadou/allHooks/admin/periodeIndicateurSousRessourceHooks'
import {
  PERIODE_SOUS_RESSOURCE_LABELS,
  type DocumentationCmrEnregistrement,
  type DocumentationCmrFormData,
  type DocumentationCmrWritePayload,
  type FondCarteEnregistrement,
  type FondCarteFormData,
  type FondCarteWritePayload,
  type PeriodeSousRessourceEnregistrement,
  type PeriodeSousRessourceType,
  type PeriodeSousRessourceWritePayload,
  type SimpleSousRessourceFormData,
  type SousRessourceDocumentsFormData,
  type TableauSyntheseEnregistrement,
  type TableauSyntheseWritePayload,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'
import { resolvePeriodeEnregistrementId } from '@/simadou/lib/periodeSousRessourceUtils'
import {
  buildDocumentationCmrWritePayload,
  buildFondCarteWritePayload,
  buildSimpleSousRessourceWritePayload,
  buildSousRessourceDocumentsInput,
  documentationCmrToFormValues,
  emptyDocumentationCmrFormValues,
  emptyFondCarteFormValues,
  emptySimpleSousRessourceFormValues,
  fondCarteToFormValues,
  simpleSousRessourceToFormValues,
} from './periodeSousRessourceFormUtils'
import SousRessourceFormFields from './SousRessourceFormFields'

type SuiviIndicateurCmrSousRessourceFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: PeriodeSousRessourceType
  parentPeriodeId: number
  currentRow?: PeriodeSousRessourceEnregistrement | null
}

type DocumentMutationInput = {
  data: DocumentationCmrWritePayload | FondCarteWritePayload
  documents: ReturnType<typeof buildSousRessourceDocumentsInput>
}

type SubmitInput = TableauSyntheseWritePayload | DocumentMutationInput

type WriteContext = {
  parentPeriodeId: number
  personnelId: number
  isEdit: boolean
}

function validateDocument(
  documents: SousRessourceDocumentsFormData,
  isEditing: boolean,
  missingMessage = 'Sélectionnez un document à téléverser.',
  newFileMessage = 'Sélectionnez un fichier à téléverser.'
): boolean {
  if (!isEditing && !documents.documentFile) {
    toast.error(newFileMessage)
    return false
  }

  if (isEditing) {
    if (
      documents.documentFile ||
      documents.removeExistingDocument ||
      documents.existingDocument.trim()
    ) {
      return true
    }
    toast.error(missingMessage)
    return false
  }

  return true
}

function buildDocumentMutationInput<TForm extends DocumentationCmrFormData | FondCarteFormData>(
  form: TForm,
  buildPayload: (args: WriteContext & { form: TForm }) => DocumentationCmrWritePayload | FondCarteWritePayload,
  ctx: WriteContext
): DocumentMutationInput {
  return {
    data: buildPayload({ form, ...ctx }),
    documents: buildSousRessourceDocumentsInput(form),
  }
}

function buildSubmitInput({
  resource,
  simpleForm,
  documentationForm,
  fondCarteForm,
  ctx,
}: {
  resource: PeriodeSousRessourceType
  simpleForm: SimpleSousRessourceFormData
  documentationForm: DocumentationCmrFormData
  fondCarteForm: FondCarteFormData
  ctx: WriteContext
}): SubmitInput | null {
  switch (resource) {
    case 'documentations':
      if (!documentationForm.titre.trim()) {
        toast.error('Le titre est obligatoire.')
        return null
      }
      if (!validateDocument(documentationForm, ctx.isEdit)) return null
      return buildDocumentMutationInput(
        documentationForm,
        buildDocumentationCmrWritePayload,
        ctx
      )
    case 'fonds-carte':
      if (!validateDocument(fondCarteForm, ctx.isEdit, 'Sélectionnez un fichier à téléverser.')) return null
      return buildDocumentMutationInput(fondCarteForm, buildFondCarteWritePayload, ctx)
    case 'tableaux-synthese':
      return buildSimpleSousRessourceWritePayload({ form: simpleForm, ...ctx })
  }
}

type SousRessourceMutationInput =
  | PeriodeSousRessourceWritePayload
  | {
      data: PeriodeSousRessourceWritePayload
      documents?: DocumentMutationInput['documents']
    }

type SousRessourceUpdateMutationInput = {
  itemId: number
} & SousRessourceMutationInput

function toMutationArgs(input: SubmitInput): SousRessourceMutationInput
function toMutationArgs(
  input: SubmitInput,
  itemId: number
): SousRessourceUpdateMutationInput
function toMutationArgs(
  input: SubmitInput,
  itemId?: number
): SousRessourceMutationInput | SousRessourceUpdateMutationInput {
  if ('documents' in input) {
    const withDocuments = { data: input.data, documents: input.documents }
    return itemId != null ? { itemId, ...withDocuments } : withDocuments
  }

  return itemId != null ? { itemId, data: input } : input
}

export default function SuiviIndicateurCmrSousRessourceFormDialog({
  open,
  onOpenChange,
  resource,
  parentPeriodeId,
  currentRow,
}: SuiviIndicateurCmrSousRessourceFormDialogProps) {
  const isEditing = !!currentRow
  const { data: user } = useMe()
  const createMutation = useCreatePeriodeSousRessource(parentPeriodeId, resource)
  const updateMutation = useUpdatePeriodeSousRessource(parentPeriodeId, resource)

  const [simpleForm, setSimpleForm] = useState<SimpleSousRessourceFormData>(() =>
    resource === 'tableaux-synthese' && isEditing
      ? simpleSousRessourceToFormValues(
          currentRow as TableauSyntheseEnregistrement | null | undefined
        )
      : emptySimpleSousRessourceFormValues()
  )
  const [documentationForm, setDocumentationForm] = useState<DocumentationCmrFormData>(() =>
    resource === 'documentations' && isEditing
      ? documentationCmrToFormValues(currentRow as DocumentationCmrEnregistrement)
      : emptyDocumentationCmrFormValues()
  )
  const [fondCarteForm, setFondCarteForm] = useState<FondCarteFormData>(() =>
    resource === 'fonds-carte' && isEditing
      ? fondCarteToFormValues(currentRow as FondCarteEnregistrement)
      : emptyFondCarteFormValues()
  )

  const isPending = createMutation.isPending || updateMutation.isPending
  const resourceLabel = PERIODE_SOUS_RESSOURCE_LABELS[resource]

  const handleSubmit = async () => {
    const personnelId = user?.n_personnel
    if (!personnelId) {
      toast.error('Utilisateur non identifié.')
      return
    }

    const submitInput = buildSubmitInput({
      resource,
      simpleForm,
      documentationForm,
      fondCarteForm,
      ctx: { parentPeriodeId, personnelId, isEdit: isEditing },
    })
    if (!submitInput) return

    try {
      if (isEditing && currentRow) {
        const itemId = resolvePeriodeEnregistrementId(currentRow, resource)
        if (itemId == null) {
          toast.error('Enregistrement introuvable.')
          return
        }
        await updateMutation.mutateAsync(toMutationArgs(submitInput, itemId))
        toast.success(`${resourceLabel} modifié(e)`)
      } else {
        await createMutation.mutateAsync(toMutationArgs(submitInput))
        toast.success(`${resourceLabel} ajouté(e)`)
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEditing
            ? `Erreur lors de la modification du ${resourceLabel}`
            : `Erreur lors de l'ajout du ${resourceLabel}`
        )
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(DIALOG_SIZES.md, 'gap-0 p-0')}
        aria-describedby={undefined}
      >
        <DialogHeader className='border-b px-6 py-4 pr-12'>
          <DialogTitle>
            {isEditing ? 'Modifier' : 'Ajouter'} un(e) {resourceLabel}
          </DialogTitle>
        </DialogHeader>

        <div className='px-6 py-4'>
          <SousRessourceFormFields
            resource={resource}
            disabled={isPending}
            idPrefix={`${resource}-form`}
            simpleForm={resource === 'tableaux-synthese' ? simpleForm : undefined}
            documentationForm={
              resource === 'documentations' ? documentationForm : undefined
            }
            fondCarteForm={resource === 'fonds-carte' ? fondCarteForm : undefined}
            onSimpleChange={(key, value) =>
              setSimpleForm((prev) => ({ ...prev, [key]: value }))
            }
            onDocumentationChange={(key, value) =>
              setDocumentationForm((prev) => ({ ...prev, [key]: value }))
            }
            onDocumentationDocumentsChange={(documents) =>
              setDocumentationForm((prev) => ({ ...prev, ...documents }))
            }
            onFondCarteChange={(key, value) =>
              setFondCarteForm((prev) => ({ ...prev, [key]: value }))
            }
            onFondCarteDocumentsChange={(documents) =>
              setFondCarteForm((prev) => ({ ...prev, ...documents }))
            }
          />
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            type='button'
            className={formPrimaryButtonClassName}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
            {isEditing ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
