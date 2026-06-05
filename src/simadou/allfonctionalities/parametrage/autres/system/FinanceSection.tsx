import { GeneralParamsInput } from "@/simadou/schemas/generalParams.schema";
import { FinanceInput, financeSchema } from "./schemas/finance.schema";
import { useState } from "react";
import { DynamicForm } from "@/Global/Forms/DynamicForm";
import { getFinanceFormConfig } from "@/simadou/allfieldsConfig/generalParamsForm";
import { GENERAL_PARAMS_FINANCE } from "@/simadou/allResetFields/resetField";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";

interface Props {
  params: GeneralParamsInput;
  onSave: (data: FinanceInput) => void;
  isSaving: boolean;
}
const FORM_ID = 'finance-form'

export function FinanceSection({ params, onSave, isSaving }: Props) {
   const [resetKey, setResetKey] = useState(0)
   const formConfig = getFinanceFormConfig()
  const defaultValues: FinanceInput = {
    ...GENERAL_PARAMS_FINANCE,
    currencyCode: params.currencyCode ?? "",
    baseCurrency: params.baseCurrency ?? "",
    exchangeRate: params.exchangeRate ?? 1,
  };

  return (
      <div className="flex flex-col">
      <div className="h-75 overflow-y-auto px-1">
        <DynamicForm
            key={resetKey}                              // remounts form on restore
            config={formConfig}
            schema={financeSchema}
            defaultValues={defaultValues}
            onSubmit={onSave}
            isLoading={isSaving}
            submitText="Enregistrer"
            loadingText="Enregistrement..."
            onCancel={() => setResetKey(k => k + 1)}   // restore = remount with original defaultValues
            cancelText="Restaurer les paramètres"
            className="bg-muted/50"
            hideFormFooter
            formId={FORM_ID}
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
           {isSaving ? <Loader2 className="size-3.5 animate-spin group-hover:translate-x-1" /> : <ArrowRight />}
        </Button>
      </div>
      </div>
     

  );
}