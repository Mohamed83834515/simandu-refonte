
import { GeneralParamsInput } from "@/simadou/schemas/generalParams.schema";

import {
  NotificationsInput,
  notificationsSchema,
} from "./schemas/notifications.schema";
import { DynamicForm } from "@/Global/Forms/DynamicForm";
import { useState } from "react";
import { GENERAL_PARAMS_NOTIFICATIONS } from "@/simadou/allResetFields/resetField";
import { getNotificationsFormConfig } from "@/simadou/allfieldsConfig/generalParamsForm";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";

interface Props {
  params: GeneralParamsInput;
  onSave: (data: NotificationsInput) => void;
  isSaving: boolean;
}

const FORM_ID = 'notification-form'

export function NotificationsSection({
  params,
  onSave,
  isSaving,
}: Props) {
    const [resetKey, setResetKey] = useState(0)
    const formConfig = getNotificationsFormConfig()
  const defaultValues: NotificationsInput = {
    ...GENERAL_PARAMS_NOTIFICATIONS,
    whatsappInstanceCode: params.whatsappInstanceCode ?? "",
    notificationEmail: params.notificationEmail ?? "",
    notificationEmailPassword:
      params.notificationEmailPassword ?? "",
    smtpHost: params.smtpHost ?? "",
  };

  return (
    <div className="flex flex-col">
      <div className="h-75 overflow-y-auto px-1">
        <DynamicForm
        formId={FORM_ID}
               key={resetKey}                              // remounts form on restore
               config={formConfig}
               schema={notificationsSchema}
               defaultValues={defaultValues}
               onSubmit={onSave}
               isLoading={isSaving}
               submitText="Enregistrer"
               loadingText="Enregistrement..."
               onCancel={() => setResetKey(k => k + 1)}   // restore = remount with original defaultValues
               cancelText="Restaurer les paramètres"
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
           {isSaving ? <Loader2 className="size-3.5 animate-spin group-hover:translate-x-1 duration-600" /> : <ArrowRight />}
        </Button>
      </div>

      

    </div>
   
  );
}