import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetModesPassation } from '@/simadou/allHooks/admin/modePassationHooks'
import { useGetNaturesMarche } from '@/simadou/allHooks/admin/natureMarcheHooks'
import { useSavePpm } from '@/simadou/allHooks/admin/ppmHooks'
import { useGetTypeFinancementPPM } from '@/simadou/allHooks/admin/typeFinancementPPM'
import { usePpmVersionContext } from './PpmVersionContext'
import { getPpmFormConfig } from '@/simadou/allfieldsConfig/ppmForm'
import type { Ppm } from '@/simadou/allTypes/ppm'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import {
  ppmFormSchema,
  type PpmFormData,
  type PpmFormInput,
} from '@/simadou/schemas/ppmSchema'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Ppm | null
}

function resolveFkValue(value: unknown, idKey: string): number | null {
  return resolveRelationId(value, idKey)
}

function resolveVersionPpmValue(
  row: Ppm | null | undefined,
  selectedVersionId: string | null
): number | undefined {
  // À la création : toujours la version sélectionnée dans la toolbar.
  if (!row) {
    if (!selectedVersionId?.trim()) return undefined
    const parsed = Number(selectedVersionId)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }

  const fromRow = resolveFkValue(row.version_ppm, 'id_version_ppm')
  if (fromRow != null && fromRow > 0) return fromRow

  if (selectedVersionId?.trim()) {
    const parsed = Number(selectedVersionId)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  return undefined
}

export default function AddPpm({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const { selectedVersionId } = usePpmVersionContext()

  const { data: modes = [] } = useGetModesPassation()
  const { data: typesFinancement = [] } = useGetTypeFinancementPPM()
  const { data: natures = [] } = useGetNaturesMarche()

  const formConfig = useMemo(() => {
    const config = getPpmFormConfig()
    const selectOptions: Record<string, { value: number; label: string }[]> =
      {
        methode_passation: modes.map((mode) => ({
          value: mode.id_mode_passation,
          label: `${mode.code_mode_passation} - ${mode.intitule_mode_passation}`,
        })),
        type_financement: typesFinancement.map((type) => ({
          value: type.id_type_financement_ppm,
          label: `${type.code_type_financement_ppm} - ${type.intitule_type_financement_ppm}`,
        })),
        nature_marche: natures.map((nature) => ({
          value: nature.id_nature_marche,
          label: `${nature.code_nature_marche} - ${nature.intitule_nature_marche}`,
        })),
      }

    return {
      fields: config.fields.map((field) => {
        const options = selectOptions[field.name]
        if (!options) return field
        return { ...field, options }
      }),
    }
  }, [modes, typesFinancement, natures])

  const defaultValues = useMemo<PpmFormInput>(() => {
    if (isEdit && currentRow) {
      return {
        intitule_ppm: currentRow.intitule_ppm ?? '',
        code_budget: Number(currentRow.code_budget) || 0,
        montant_budget: Number(currentRow.montant_budget) || 0,
        numero_appel_offre: Number(currentRow.numero_appel_offre) || 0,
        methode_passation:
          resolveFkValue(currentRow.methode_passation, 'id_mode_passation') ?? 0,
        type_financement:
          resolveFkValue(
            currentRow.type_financement,
            'id_type_financement_ppm'
          ) ?? 0,
        nature_marche:
          resolveFkValue(currentRow.nature_marche, 'id_nature_marche') ?? 0,
      }
    }

    return {
      intitule_ppm: '',
      code_budget: 0,
      montant_budget: 0,
      numero_appel_offre: 0,
      methode_passation: 0,
      type_financement: 0,
      nature_marche: 0,
    }
  }, [currentRow, isEdit])

  const mutation = useSavePpm(isEdit, currentRow, () => {
    onOpenChange(false)
  })

  const onSubmit = (data: PpmFormInput) => {
    const versionPpm = resolveVersionPpmValue(currentRow, selectedVersionId)

    if (!versionPpm) {
      toast.error(
        "Sélectionnez une version PPM dans la liste avant d'ajouter un PPMS."
      )
      return
    }

    const payload: PpmFormData = {
      ...data,
      version_ppm: versionPpm,
    }

    mutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.lg}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier le PPM' : 'Ajouter un PPM'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Modification de « ${currentRow?.intitule_ppm} »`
              : 'Renseignez les informations du plan de passation des marchés'}
          </DialogDescription>
        </DialogHeader>

        <DynamicForm
          key={isEdit ? currentRow?.id_ppm : 'new-ppm'}
          config={formConfig}
          schema={ppmFormSchema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
          submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
          loadingText='Enregistrement…'
        />
      </DialogContent>
    </Dialog>
  )
}
