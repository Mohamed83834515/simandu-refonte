// IdentiteSection.tsx
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getIdentiteFormConfig } from '@/simadou/allfieldsConfig/generalParamsForm'
import { identiteSchema, type IdentiteInput } from './schemas/identite.schemas'
import { GENERAL_PARAMS_IDENTITE } from '@/simadou/allResetFields/resetField'
import type { GeneralParamsInput } from '@/simadou/schemas/generalParams.schema'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react'


interface Props {
  params:   GeneralParamsInput
  onSave:   (data: IdentiteInput) => void
  isSaving: boolean
}

const FORM_ID ="identite-form"

export function IdentiteSection({ params, onSave, isSaving }: Props) {
  const formConfig = getIdentiteFormConfig()
  const [resetKey, setResetKey] = useState(0)
  const defaultValues: IdentiteInput = {
    ...GENERAL_PARAMS_IDENTITE,
    appName:          params.appName          ?? '',
    systemSigle:      params.systemSigle      ?? '',
    systemTitle:      params.systemTitle      ?? '',
    structureSigle:   params.structureSigle   ?? '',
    structureName:    params.structureName    ?? '',
    structureAddress: params.structureAddress ?? '',
    primaryColor:     params.primaryColor     ?? '',
  }



  return (
   <div className="flex flex-col">

      {/* Scrollable fields only */}
      <div className="h-75 overflow-y-auto px-1">
        <DynamicForm
          key={resetKey}
          formId={FORM_ID}
          hideFormFooter
          config={formConfig}
          schema={identiteSchema}
          defaultValues={defaultValues}
          onSubmit={onSave}
          isLoading={isSaving}
          className='bg-muted'
        />
      </div>

      {/* Fixed footer — always visible, outside scroll */}
      <div className="flex items-center justify-between border-t border-border bg-muted/25 px-6 py-4">
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
          form={FORM_ID}        // ← links to the form by id
          size="sm"
          disabled={isSaving}
          className='group cursor-pointer'
        >
         
          Enregistrer
           {isSaving ? <Loader2 className="size-3.5 animate-spin group-hover:translate-x-1 duration-600" /> : <ArrowRight />}
        </Button>
      </div>

    </div>
     
  )
}