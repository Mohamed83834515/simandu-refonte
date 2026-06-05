import { GeneralParamsInput } from "@/simadou/schemas/generalParams.schema";

import {
  SecuriteInput,
  securiteSchema,
} from "./schemas/security.schema";
import { DynamicForm } from "@/Global/Forms/DynamicForm";
import { useState } from "react";
import { GENERAL_PARAMS_SECURITE } from "@/simadou/allResetFields/resetField";
import { getSecuriteFormConfig } from "@/simadou/allfieldsConfig/generalParamsForm";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";

interface Props {
  params: GeneralParamsInput;
  onSave: (data: SecuriteInput) => void;
  isSaving: boolean;
}
  const FORM_ID = "securite-form"
export function SecuriteSection({
  params,
  onSave,
  isSaving,
}: Props) {
   const [resetKey, setResetKey] = useState(0)
   const  formConfig = getSecuriteFormConfig()
  const defaultValues: SecuriteInput = {
    ...GENERAL_PARAMS_SECURITE,
    maintenanceMode: params.maintenanceMode ?? false,
    inactivityDelayMinutes:
      params.inactivityDelayMinutes ?? 30,
    maxSessions: params.maxSessions ?? 3,
    loginAttemptsLimit:
      params.loginAttemptsLimit ?? 5,
    tpCodeDelayMinutes:
      params.tpCodeDelayMinutes ?? 10,
    passwordChangeDelayMonths:
      params.passwordChangeDelayMonths ?? 3,
    deleteOrUpdateDelaySeconds:
      params.deleteOrUpdateDelaySeconds ?? 30,
  };

  return (
     <div className="flex flex-col">

       <div className="h-75 overflow-y-auto px-1">
          <DynamicForm
               formId={FORM_ID}
                 key={resetKey}                              // remounts form on restore
                 config={formConfig}
                 schema={securiteSchema}
                 defaultValues={defaultValues}
                 onSubmit={onSave}
                 isLoading={isSaving}
                 submitText="Enregistrer"
                 loadingText="Enregistrement..."
                 onCancel={() => setResetKey(k => k + 1)}   // restore = remount with original defaultValues
                 cancelText="Restaurer les paramètres"
                 hideFormFooter
                 className="bg-muted/50"
               />
       </div>

          <div className="flex items-center justify-between border-t border-border bg-muted px-6 py-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground font-medium"
          onClick={() => setResetKey(k => k + 1)}
        >
          <RotateCcw className="size-3.5" />
          Restaurer les paramètres
        </Button>

        <Button
          type="submit"
          form={FORM_ID}        
          size="sm"
          disabled={isSaving}
          className="group cursor-pointer"
        >
         
          Enregistrer
           {isSaving ? <Loader2 className="size-3.5 animate-spin group-hover:translate-x-1 duration-600 " /> : <ArrowRight />}
        </Button>
      </div>

      

     </div>
 
  );
}