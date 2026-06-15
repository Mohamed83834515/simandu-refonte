import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getNotificationsFormConfig } from '@/simadou/allfieldsConfig/generalParamsForm'
import { notificationsSchema, type NotificationsInput } from './schemas/notifications.schema'
import { GENERAL_PARAMS_NOTIFICATIONS } from '@/simadou/allResetFields/resetField'
import type { GeneralParamsInput } from '@/simadou/schemas/generalParams.schema'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react'

interface Props {
  params:   GeneralParamsInput
  onSave:   (data: NotificationsInput) => void
  isSaving: boolean
}

const FORM_ID = 'notifications-form'

export function NotificationsSection({ params, onSave, isSaving }: Props) {
  const [resetKey, setResetKey] = useState(0)
  const formConfig = getNotificationsFormConfig()

  const defaultValues: NotificationsInput = {
    ...GENERAL_PARAMS_NOTIFICATIONS,
    whatsappInstanceCode:      params.whatsappInstanceCode      ?? '',
    whatsappNumberId:          params.whatsappNumberId          ?? '',
    notificationEmail:         params.notificationEmail         ?? '',
    notificationEmailPassword: params.notificationEmailPassword ?? '',
    smtpHost:                  params.smtpHost                  ?? '',
    smtpPort:                  params.smtpPort                  ?? 587,
    smtpEncryption:            params.smtpEncryption            ?? '',
    smtpFromName:              params.smtpFromName              ?? '',
  }

  return (
    <div className="flex flex-col">
      <div className="h-75 overflow-y-auto px-1">
        <DynamicForm
          key={resetKey}
          formId={FORM_ID}
          hideFormFooter
          config={formConfig}
          schema={notificationsSchema}
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