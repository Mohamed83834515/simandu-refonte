import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getContactsFormConfig } from '@/simadou/allfieldsConfig/generalParamsForm'
import { contactsSchema, type ContactsInput } from './schemas/contacts.schemas'
import { GENERAL_PARAMS_CONTACTS } from '@/simadou/allResetFields/resetField'
import type { GeneralParamsInput } from '@/simadou/schemas/generalParams.schema'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react'

interface Props {
  params:   GeneralParamsInput
  onSave:   (data: ContactsInput) => void
  isSaving: boolean
}

const FORM_ID = 'contacts-form'

export function ContactsSection({ params, onSave, isSaving }: Props) {
  const [resetKey, setResetKey] = useState(0)
  const formConfig = getContactsFormConfig()

  const defaultValues: ContactsInput = {
    ...GENERAL_PARAMS_CONTACTS,
    structureEmail:    params.structureEmail    ?? '',
    structurePhone:    params.structurePhone    ?? '',
    structureWhatsapp: params.structureWhatsapp ?? '',
  }

  return (
    <div className="flex flex-col">
      <div className="h-75 overflow-y-auto px-1">
        <DynamicForm
          key={resetKey}
          formId={FORM_ID}
          hideFormFooter
          config={formConfig}
          schema={contactsSchema}
          defaultValues={defaultValues}
          onSubmit={onSave}
          isLoading={isSaving}
          className="bg-muted"
        />
      </div>
      <div className="flex items-center justify-between border-t border-border bg-muted/25 px-6 py-4">
        <Button type="button" variant="outline" size="sm"
          className="gap-1.5 font-medium text-muted-foreground hover:text-foreground"
          onClick={() => setResetKey(k => k + 1)}
        >
          <RotateCcw className="size-3.5" />
          Restaurer les paramètres
        </Button>
        <Button type="submit" form={FORM_ID} size="sm"
          disabled={isSaving} className="group cursor-pointer"
        >
          Enregistrer
          {isSaving
            ? <Loader2 className="size-3.5 animate-spin" />
            : <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
          }
        </Button>
      </div>
    </div>
  )
}