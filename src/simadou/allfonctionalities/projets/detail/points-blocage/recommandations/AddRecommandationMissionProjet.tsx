import { useMemo } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { StepDynamicForm } from '@/Global/Forms/StepDynamicForm'
import type { SelectOption } from '@/Global/types/formConfig'
import { getRecommandationMissionProjetFormConfig } from '@/simadou/allfieldsConfig/recommandationMissionProjetForm'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreateRecommandationMissionProjet,
  useUpdateRecommandationMissionProjet,
} from '@/simadou/allHooks/admin/recommandationMissionProjetHooks'
import type { Projet } from '@/simadou/allTypes'
import type { RecommandationMissionProjet } from '@/simadou/allTypes/recommandationMissionProjet'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import {
  buildRecommandationMissionProjetPayload,
  toApiRelationId,
} from '@/simadou/lib/missionRecommandationUtils'
import {
  recommandationMissionProjetSchema,
  type RecommandationMissionProjetFormData,
} from '@/simadou/schemas/missionRecommandationSchemas'

type Props = {
  projet: Projet
  currentRow?: RecommandationMissionProjet | null
  selectedMissionId?: string | null
  missionOptions: SelectOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function extractFile(value: unknown): File | undefined {
  if (value instanceof File) return value
  if (Array.isArray(value) && value[0] instanceof File) return value[0]
  return undefined
}

function buildPersonnelOptions(
  personnels: {
    n_personnel?: number
    prenom_perso?: string
    nom_perso?: string
  }[]
): SelectOption[] {
  return personnels
    .filter((p) => p.n_personnel != null)
    .map((p) => ({
      value: p.n_personnel!,
      label: `${p.prenom_perso ?? ''} ${p.nom_perso ?? ''}`.trim(),
    }))
}

export default function AddRecommandationMissionProjet({
  projet,
  currentRow,
  selectedMissionId,
  missionOptions,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!currentRow?.id_recommandation
  const idProjet = projet.id_projet
  const { data: acteurs = [] } = useGetActeurs()
  const { data: personnels = [] } = useGetPersonnels()
  const { data: user } = useMe()

  const personnelOptions = useMemo(
    () => buildPersonnelOptions(personnels),
    [personnels]
  )

  const acteurOptions: SelectOption[] = useMemo(
    () =>
      acteurs.map((acteur) => ({
        value: acteur.id_acteur,
        label: acteur.nom_acteur,
      })),
    [acteurs]
  )

  const formConfig = useMemo(
    () =>
      getRecommandationMissionProjetFormConfig(
        personnelOptions,
        acteurOptions
      ),
    [personnelOptions, acteurOptions]
  )

  const createMutation = useCreateRecommandationMissionProjet(idProjet)
  const updateMutation = useUpdateRecommandationMissionProjet(idProjet)
  const mutation = isEdit ? updateMutation : createMutation

  const defaultValues = useMemo((): RecommandationMissionProjetFormData => {
    const missionFromRow = resolveRelationId(currentRow?.mission, 'id_mission')
    const missionFromFilter =
      selectedMissionId && !isEdit ? Number(selectedMissionId) : undefined

    return {
      volet_recommandation: currentRow?.volet_recommandation ?? '',
      rubrique: currentRow?.rubrique ?? '',
      numero: currentRow?.numero ?? '',
      ref_no: currentRow?.ref_no ?? '',
      date_buttoir: currentRow?.date_buttoir ?? '',
      recommandation: currentRow?.recommandation ?? '',
      type_recommandation: currentRow?.type_recommandation ?? '',
      observation: currentRow?.observation ?? '',
      rapport: typeof currentRow?.rapport === 'string' ? currentRow.rapport : '',
      etat: isEdit ? 'modifier' : "Ajouter",
      mission: missionFromRow ? missionFromRow : missionFromFilter ? missionFromFilter : 0,
      responsable:
        resolveRelationId(currentRow?.responsable, 'n_personnel') ?? undefined,
      responsable_interne:
        resolveRelationId(currentRow?.responsable_interne, 'n_personnel') ??
        undefined,
      structure:
        resolveRelationId(currentRow?.structure, 'id_acteur') ?? undefined,
    }
  }, [currentRow, isEdit, selectedMissionId])

  const handleSubmit = (data: RecommandationMissionProjetFormData) => {
    const file = extractFile(data.rapport)
    const existingRapport =
      typeof data.rapport === 'string' ? data.rapport.trim() : ''

    if (toApiRelationId(data.mission) === 0) {
      toast.error('Sélectionnez une mission de supervision.')
      return
    }

    const missionId = toApiRelationId(data.mission)
    const missionBelongsToProjet = missionOptions.some(
      (option) => Number(option.value) === missionId
    )
    if (!missionBelongsToProjet) {
      toast.error('La mission doit appartenir à ce projet.')
      return
    }

    const payload = buildRecommandationMissionProjetPayload(data, {
      idProjet,
      personnelId: user?.n_personnel,
      rapportUrl: file ? undefined : existingRapport,
    })

    if (isEdit && currentRow?.id_recommandation) {
      updateMutation.mutate(
        { id: currentRow.id_recommandation, data: payload, file },
        { onSuccess: () => onOpenChange(false) }
      )
      return
    }

    createMutation.mutate(
      { data: payload, file },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          DIALOG_SIZES.xl,
          'flex max-h-[min(100vh,42rem)] flex-col gap-0 overflow-hidden p-0'
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className='shrink-0 border-b px-4 py-3 pr-12'>
          <DialogTitle>
            {isEdit
              ? 'Modifier la recommandation'
              : 'Ajouter une recommandation'}
          </DialogTitle>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-3'>
          <StepDynamicForm
            key={`recommandation-${currentRow?.id_recommandation ?? `new-${selectedMissionId ?? 'none'}`}-${open}`}
            config={formConfig}
            schema={recommandationMissionProjetSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={mutation.isPending}
            submitText={isEdit ? 'Enregistrer' : 'Créer la recommandation'}
            loadingText='Enregistrement…'
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
