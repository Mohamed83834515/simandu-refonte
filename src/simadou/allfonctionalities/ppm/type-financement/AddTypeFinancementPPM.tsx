import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getTypeFinancementPPMFormConfig } from '@/simadou/allfieldsConfig/typeFinancementPPM'
import { TypeFinancementPPM } from '@/simadou/allTypes/typeFinancementPPM'
import { TypeFinancementPPMFormData, typeFinancementPPMSchema } from '@/simadou/schemas/typeFinancementPPM'
import { useSaveTypeFinancementPPM } from '@/simadou/allHooks/admin/typeFinancementPPM'

type Props = {
    currentRow?: TypeFinancementPPM | null;
    onBack: () => void
    onSuccess: () => void
    onCancel: () => void
}

export default function AddTypeFinancementPPM({
    currentRow,
    onBack,
    onSuccess,
}: Props) {
    const isEdit = !!currentRow
    const formConfig = useMemo(() => getTypeFinancementPPMFormConfig(), [])

    const defaultValues = useMemo(() => ({
        code_type_financement_ppm: currentRow?.code_type_financement_ppm || '',
        intitule_type_financement_ppm: currentRow?.intitule_type_financement_ppm || '',
    }), [currentRow])

    const mutation = useSaveTypeFinancementPPM(isEdit, currentRow, onSuccess)

    const handleSubmit = (data: TypeFinancementPPMFormData) => {
        mutation.mutate(data)
    }

    return (
        <DynamicForm
            config={formConfig}
            schema={typeFinancementPPMSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={onBack}
            isLoading={mutation.isPending}
            submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
            loadingText='Enregistrement...'
        />
    )
}