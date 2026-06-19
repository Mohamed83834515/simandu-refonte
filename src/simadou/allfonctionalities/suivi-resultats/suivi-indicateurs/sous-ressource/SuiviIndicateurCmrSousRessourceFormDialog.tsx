import { useEffect, useState } from 'react'
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
import type {
  DocumentationCmrEnregistrement,
  DocumentationCmrFormData,
  FondCarteEnregistrement,
  PeriodeSousRessourceEnregistrement,
  PeriodeSousRessourceType,
  SimpleSousRessourceFormData,
  TableauSyntheseEnregistrement,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'
import { PERIODE_SOUS_RESSOURCE_LABELS } from '@/simadou/allTypes/periodeIndicateurSousRessource'
import { resolvePeriodeEnregistrementId } from '@/simadou/lib/periodeSousRessourceUtils'
import {
  buildDocumentationCmrWritePayload,
  buildSimpleSousRessourceWritePayload,
  documentationCmrToFormValues,
  emptyDocumentationCmrFormValues,
  emptySimpleSousRessourceFormValues,
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

  const [simpleForm, setSimpleForm] = useState<SimpleSousRessourceFormData>(
    emptySimpleSousRessourceFormValues()
  )
  const [documentationForm, setDocumentationForm] =
    useState<DocumentationCmrFormData>(emptyDocumentationCmrFormValues())

  useEffect(() => {
    if (!open) return

    if (resource === 'documentations') {
      setDocumentationForm(
        isEditing
          ? documentationCmrToFormValues(currentRow as DocumentationCmrEnregistrement)
          : emptyDocumentationCmrFormValues()
      )
      return
    }

    const row = currentRow as
      | TableauSyntheseEnregistrement
      | FondCarteEnregistrement
      | null
      | undefined

    setSimpleForm(
      isEditing ? simpleSousRessourceToFormValues(row) : emptySimpleSousRessourceFormValues()
    )
  }, [open, isEditing, currentRow, resource])

  const isPending = createMutation.isPending || updateMutation.isPending
  const resourceLabel = PERIODE_SOUS_RESSOURCE_LABELS[resource]

  const handleSubmit = async () => {
    const personnelId = user?.n_personnel
    if (!personnelId) {
      toast.error('Utilisateur non identifié.')
      return
    }

    const payload =
      resource === 'documentations'
        ? (() => {
            if (!documentationForm.titre.trim()) {
              toast.error('Le titre est obligatoire.')
              return null
            }
            return buildDocumentationCmrWritePayload({
              form: documentationForm,
              parentPeriodeId,
              personnelId,
              isEdit: isEditing,
            })
          })()
        : buildSimpleSousRessourceWritePayload({
            form: simpleForm,
            parentPeriodeId,
            personnelId,
            isEdit: isEditing,
          })

    if (!payload) return

    try {
      if (isEditing && currentRow) {
        const itemId = resolvePeriodeEnregistrementId(currentRow, resource)
        if (itemId == null) {
          toast.error('Enregistrement introuvable.')
          return
        }
        await updateMutation.mutateAsync({ itemId, data: payload })
        toast.success(`${resourceLabel} modifié(e)`)
      } else {
        await createMutation.mutateAsync(payload)
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
        className={cn(DIALOG_SIZES.form, 'gap-0 p-0')}
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
            simpleForm={resource === 'documentations' ? undefined : simpleForm}
            documentationForm={
              resource === 'documentations' ? documentationForm : undefined
            }
            onSimpleChange={(key, value) =>
              setSimpleForm((prev) => ({ ...prev, [key]: value }))
            }
            onDocumentationChange={(key, value) =>
              setDocumentationForm((prev) => ({ ...prev, [key]: value }))
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
