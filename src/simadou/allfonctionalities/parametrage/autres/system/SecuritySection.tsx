import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getSecuriteFormConfig } from '@/simadou/allfieldsConfig/generalParamsForm'
import { securiteSchema, type SecuriteInput } from './schemas/security.schema'
import { GENERAL_PARAMS_SECURITE } from '@/simadou/allResetFields/resetField'
import type { GeneralParamsInput } from '@/simadou/schemas/generalParams.schema'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react'

interface Props {
  params:   GeneralParamsInput
  onSave:   (data: SecuriteInput) => void
  isSaving: boolean
}

const FORM_ID = 'securite-form'

export function SecuriteSection({ params, onSave, isSaving }: Props) {
  const [resetKey, setResetKey] = useState(0)
  const formConfig = getSecuriteFormConfig()

  const defaultValues: SecuriteInput = {
    ...GENERAL_PARAMS_SECURITE,
    maintenanceMode:            params.maintenanceMode            ?? false,
    inactivityDelayMinutes:     params.inactivityDelayMinutes     ?? 0,
    maxSessions:                params.maxSessions                ?? 0,
    loginAttemptsLimit:         params.loginAttemptsLimit         ?? 0,
    tpCodeDelayMinutes:         params.tpCodeDelayMinutes         ?? 0,
    passwordChangeDelayMonths:  params.passwordChangeDelayMonths  ?? 0,
    deleteOrUpdateDelaySeconds: params.deleteOrUpdateDelaySeconds ?? 0,
  }

  return (
    <div className="flex flex-col">
      <div className="h-75 overflow-y-auto px-1">
        <DynamicForm
          key={resetKey}
          formId={FORM_ID}
          hideFormFooter
          config={formConfig}
          schema={securiteSchema}
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