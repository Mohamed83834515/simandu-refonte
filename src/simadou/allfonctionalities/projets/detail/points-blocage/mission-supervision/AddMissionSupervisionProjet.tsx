import { useMemo } from 'react'
import { getMissionSupervisionProjetFormConfig } from '@/simadou/allfieldsConfig/missionSupervisionProjetForm'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreateMissionSupervisionProjet,
  useUpdateMissionSupervisionProjet,
} from '@/simadou/allHooks/admin/missionSupervisionProjetHooks'
import type { Projet } from '@/simadou/allTypes'
import type { MissionSupervisionProjet } from '@/simadou/allTypes/missionSupervisionProjet'
import {
  missionSupervisionProjetSchema,
  type MissionSupervisionProjetFormData,
} from '@/simadou/schemas/missionRecommandationSchemas'
import { DynamicForm } from '@/Global/Forms/DynamicForm'

type Props = {
  projet: Projet
  currentRow?: MissionSupervisionProjet | null
  onBack: () => void
  onSuccess: () => void
}

// function extractFile(value: unknown): File | undefined {
//   if (value instanceof File) return value
//   if (Array.isArray(value) && value[0] instanceof File) return value[0]
//   return undefined
// }

export default function AddMissionSupervisionProjet({
  projet,
  currentRow,
  onBack,
  onSuccess,
}: Props) {
  const isEdit = !!currentRow?.id_mission
  const idProjet = projet.id_projet
  const { data: user } = useMe()

  const formConfig = useMemo(() => getMissionSupervisionProjetFormConfig(), [])
  const createMutation = useCreateMissionSupervisionProjet(idProjet)
  const updateMutation = useUpdateMissionSupervisionProjet(idProjet)
  const mutation = isEdit ? updateMutation : createMutation

  const defaultValues: MissionSupervisionProjetFormData = {
    code_ms: currentRow?.code_ms ?? '',
    type_mission: currentRow?.type_mission ?? '',
    objet: currentRow?.objet ?? '',
    resume: currentRow?.resume ?? '',
    debut: currentRow?.debut ?? '',
    fin: currentRow?.fin ?? '',
    observation: currentRow?.observation ?? '',
    projection: currentRow?.projection ?? '',
    etat: isEdit ? 'modifier' : "Ajouter",
  }

  const handleSubmit = (data: MissionSupervisionProjetFormData) => {
    const now = new Date().toISOString()
    const personnelId = user?.n_personnel

    const payload = {
      code_ms: data.code_ms.trim(),
      type_mission: data.type_mission?.trim() || undefined,
      objet: data.objet?.trim() || undefined,
      resume: data.resume?.trim() || undefined,
      debut: data.debut,
      fin: data.fin,
      etat:data.etat,
      observation: data.observation?.trim() || undefined,
      projection: data.projection?.trim() || undefined,
      projet: idProjet,
      modifier_le: now,
      modifier_par: personnelId,
      id_personnel: personnelId,
    }

    if (isEdit && currentRow?.id_mission) {
      updateMutation.mutate(
        { id: currentRow.id_mission, data: payload },
        { onSuccess }
      )
      return
    }

    createMutation.mutate({ data: payload }, { onSuccess })
  }

  return (
    <div className='space-y-3'>
     
      <DynamicForm
        key={`mission-supervision-${currentRow?.id_mission ?? 'new'}`}
        config={formConfig}
        schema={missionSupervisionProjetSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isLoading={mutation.isPending}
        onCancel={onBack}
        submitText={isEdit ? 'Enregistrer' : 'Créer la mission'}
        loadingText='Enregistrement…'
      />
    </div>
  )
}
