import { GeneralParamsInput } from "@/simadou/schemas/generalParams.schema";

import {
  IntegrationsInput,
  integrationsSchema,
} from "./schemas/integrations.schema";
import { useState } from "react";
import { getIntegrationsFormConfig } from "@/simadou/allfieldsConfig/generalParamsForm";
import { GENERAL_PARAMS_INTEGRATIONS } from "@/simadou/allResetFields/resetField";
import { DynamicForm } from "@/Global/Forms/DynamicForm";

interface Props {
  params: GeneralParamsInput;
  onSave: (data: IntegrationsInput) => void;
  isSaving: boolean;
}

export function IntegrationsSection({
  params,
  onSave,
  isSaving,
}: Props) {
  const [resetKey, setResetKey] = useState(0)
  const formConfig = getIntegrationsFormConfig()
  const defaultValues: IntegrationsInput = {
    ...GENERAL_PARAMS_INTEGRATIONS,
    parentApiUrl: params.parentApiUrl ?? "",
  };

  return (
    <DynamicForm
         key={resetKey}                              // remounts form on restore
         config={formConfig}
         schema={integrationsSchema}
         defaultValues={defaultValues}
         onSubmit={onSave}
         isLoading={isSaving}
         submitText="Enregistrer"
         loadingText="Enregistrement..."
         onCancel={() => setResetKey(k => k + 1)}   // restore = remount with original defaultValues
         cancelText="Restaurer les paramètres"
         className="bg-muted/50"
       />
  );
}