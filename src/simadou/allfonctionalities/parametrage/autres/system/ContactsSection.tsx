import { ContactsInput, contactsSchema } from "./schemas/contacts.schemas";

import { GeneralParamsInput } from "@/simadou/schemas/generalParams.schema";
import { getContactsFormConfig } from "@/simadou/allfieldsConfig/generalParamsForm";
import { GENERAL_PARAMS_CONTACTS } from "@/simadou/allResetFields/resetField";
import { DynamicForm } from "@/Global/Forms/DynamicForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
interface Props {
  params:   GeneralParamsInput
  onSave:   (data: ContactsInput) => void
  isSaving: boolean
}

const FORM_ID = 'contact-form'
export function ContactsSection({ params, onSave, isSaving }: Props) {
  const formConfig = getContactsFormConfig()
   const [resetKey, setResetKey] = useState(0)

  const defaultValues: ContactsInput = {
    ...GENERAL_PARAMS_CONTACTS,
    contactEmail:      params.contactEmail      ?? '',
    contactPhone:      params.contactPhone      ?? '',
    address:           params.address           ?? '',
    website:           params.website           ?? '',
    structureEmail:    params.structureEmail    ?? '',
    structurePhone:    params.structurePhone    ?? '',
    structureWhatsapp: params.structureWhatsapp ?? '',
  }
  return (
     <div className="flex flex-col">

       <div className="h-75 overflow-y-auto px-1">
     <DynamicForm
           key={resetKey}                              // remounts form on restore
           config={formConfig}
           schema={contactsSchema}
           defaultValues={defaultValues}
           onSubmit={onSave}
           isLoading={isSaving}
           submitText="Enregistrer"
           loadingText="Enregistrement..."
           onCancel={() => setResetKey(k => k + 1)}   // restore = remount with original defaultValues
           cancelText="Restaurer les paramètres"
           className="bg-muted/50"
           hideFormFooter
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
          className="group cursor-ponter"
        >
         
          Enregistrer
           {isSaving ? <Loader2 className="size-3.5 animate-spin group-hover:translate-x-1" /> : <ArrowRight />}
        </Button>
      </div>

     </div>
   
     
    )
}