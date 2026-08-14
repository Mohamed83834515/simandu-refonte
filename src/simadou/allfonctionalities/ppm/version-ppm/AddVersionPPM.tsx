import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { VersionPPM } from '@/simadou/allTypes/versionPPM'
import { getVersionPPMFormConfig } from '@/simadou/allfieldsConfig/versionPPMForm'
import { VersionPPMFormData, versionPPMSchema } from '@/simadou/schemas/ppmShema'
import { useSaveVersionPPM } from '@/simadou/allHooks/admin/versionPPMHooks'
import { useMe } from '@/simadou/allHooks/auth/authHooks'

type Props = {
    currentRow?: VersionPPM | null;
    onBack: () => void
    onSuccess: () => void
    onCancel: () => void
}

export default function AddVersionPPM({
    currentRow,
    onBack,
    onSuccess,
}: Props) {
    const isEdit = !!currentRow
const {data :user} = useMe()
    const formConfig = useMemo(() => getVersionPPMFormConfig(), [])

    const defaultValues = useMemo(() => ({
        numero_version_ppm: currentRow?.numero_version_ppm || '',
        date_version: currentRow?.date_version || '',
        date_enregistrement:  currentRow?.date_enregistrement || new Date().toDateString(),
        date_modification:  isEdit ? currentRow?.date_modification || new Date().toDateString() : undefined,
        modifier_par:  user?.n_personnel || 0,
    }), [currentRow])

    const mutation = useSaveVersionPPM(isEdit, currentRow, onSuccess)

    const handleSubmit = (data: VersionPPMFormData) => {
        mutation.mutate(data)
    }

    return (
        <DynamicForm
            config={formConfig}
            schema={versionPPMSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={onBack}
            isLoading={mutation.isPending}
            submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
            loadingText='Enregistrement...'
        />
    )
}