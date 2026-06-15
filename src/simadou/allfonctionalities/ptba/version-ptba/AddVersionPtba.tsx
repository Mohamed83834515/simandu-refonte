import { DynamicForm } from "@/Global/Forms/DynamicForm"

import { getVersionPtbaFormConfig } from "@/simadou/allfieldsConfig/versionPtbaForm"

import { useSaveVersion } from "@/simadou/allHooks/admin/versionHooks"
import { versionPtbaSchema } from "@/simadou/schemas/ptbaSchemas"
import { VersionPtba } from "@/simadou/allTypes"
import { useActiveProgrammeCode } from "@/hooks/use-active-programme"
import { useMe } from "@/simadou/allHooks/auth/authHooks"

type Props = {
    currentRow?: VersionPtba | null
    onBack: () => void
    onSuccess: () => void
    onCancel: () => void
}

export default function AddVersionPtba({
    currentRow,
    onBack,
    onSuccess,
}: Props) {
    const isEdit = !!currentRow

    const formConfig =
        getVersionPtbaFormConfig()

    const codeProgramme = useActiveProgrammeCode()

    const { data: user } = useMe()
    const defaultValues = {
        annee_ptba:
            currentRow?.annee_ptba ||
            new Date().getFullYear(),

        version_ptba:
            currentRow?.version_ptba || "",

        date_validation:
            currentRow?.date_validation ||
            new Date()
                .toISOString()
                .split("T")[0],

        observation:
            currentRow?.observation || "",

        documentUrl:
            currentRow?.documentUrl || "",

        statut_version:
            currentRow?.statut_version || 0,

        programme:
            (typeof currentRow?.programme === 'object' && currentRow?.programme !== null
                ? currentRow?.programme.code_programme
                : codeProgramme) || codeProgramme || "",

        id_personnel: user?.n_personnel,

        etat: currentRow?.id_version_ptba ? "Modifiée" : "Créée",

    }
    const mutation = useSaveVersion(isEdit, currentRow, onSuccess)
    
    const handleSubmit = (data: any) => {
        mutation.mutate({
            data,
            file: data.documentUrl || undefined,
        })
    }

    return (
        <DynamicForm
            config={formConfig}
            schema={versionPtbaSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isLoading={mutation.isPending}
            submitText={
                isEdit
                    ? "Modifier"
                    : "Ajouter"
            }
            loadingText="Enregistrement..."
            onCancel={onBack}
            cancelText='Retour'
        />
    )
}