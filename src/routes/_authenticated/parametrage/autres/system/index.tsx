import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AppWindow, Mail, Coins, ShieldCheck, Bell, Link2, List } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { IdentiteSection }      from '@/simadou/allfonctionalities/parametrage/autres/system/IdentiteSection'
import { ContactsSection }      from '@/simadou/allfonctionalities/parametrage/autres/system/ContactsSection'
import { FinanceSection }       from '@/simadou/allfonctionalities/parametrage/autres/system/FinanceSection'
import { SecuriteSection }      from '@/simadou/allfonctionalities/parametrage/autres/system/SecuritySection'
import { NotificationsSection } from '@/simadou/allfonctionalities/parametrage/autres/system/NotificationsSection'
import { IntegrationsSection }  from '@/simadou/allfonctionalities/parametrage/autres/system/IntegrationsSection'


import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { useColor, HEADER_COLORS } from '@/stores/others/color-store'
import type { IdentiteInput }      from '@/simadou/allfonctionalities/parametrage/autres/system/schemas/identite.schemas'
import type { ContactsInput }      from '@/simadou/allfonctionalities/parametrage/autres/system/schemas/contacts.schemas'
import type { FinanceInput }       from '@/simadou/allfonctionalities/parametrage/autres/system/schemas/finance.schema'
import type { SecuriteInput }      from '@/simadou/allfonctionalities/parametrage/autres/system/schemas/security.schema'
import type { NotificationsInput } from '@/simadou/allfonctionalities/parametrage/autres/system/schemas/notifications.schema'
import type { IntegrationsInput }  from '@/simadou/allfonctionalities/parametrage/autres/system/schemas/integrations.schema'
import { useUpdateGeneralParams } from '@/simadou/allHooks/generalParams/mutations'
import { SeuilInput } from '@/simadou/allfonctionalities/parametrage/autres/system/schemas/seuils.schemas'
import { SeuilSection } from '@/simadou/allfonctionalities/parametrage/autres/system/SeuilSection'

export const Route = createFileRoute(
  '/_authenticated/parametrage/autres/system/'
)({ component: SystemPage })

const TABS = [
  { id: 'identite',      label: 'Identité système', icon: AppWindow   },
  { id: 'contacts',      label: 'Contacts',          icon: Mail        },
  { id: 'finance',       label: 'Finance',            icon: Coins       },
  { id: 'seuil',      label: 'Seuil de Performance',           icon: List },
  { id: 'securite',      label: 'Sécurité',           icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications',      icon: Bell        },
  { id: 'integrations',  label: 'Intégrations',       icon: Link2       },
] as const

type TabId = typeof TABS[number]['id']

function SystemPage() {
   const { headerColor } = useColor()
   const { data: config, isLoading } = useGeneralParamsQuery()
  const { mutate: patch, isPending } = useUpdateGeneralParams()
  const [activeTab, setActiveTab] = useState<TabId>('identite')

 
  

 
  const { bg } = HEADER_COLORS[headerColor]

  if (isLoading) return <SystemPageSkeleton />
  if (!config)   return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm text-muted-foreground">Aucune configuration disponible.</p>
    </div>
  )

  

const handleSaveIdentite = (data: IdentiteInput) =>
  patch({
    system_sigle:      data.systemSigle      || undefined,
    system_name:       data.systemTitle      || undefined,
    structure_sigle:   data.structureSigle   || undefined,
    structure_name:    data.structureName    || undefined,
    structure_address: data.structureAddress || undefined,
  })

const handleSaveContacts = (data: ContactsInput) =>
  patch({
    structure_email:           data.structureEmail    || undefined,
    structure_phone_number:    data.structurePhone    || undefined,
    structure_whatsapp_number: data.structureWhatsapp || undefined,
  })

const handleSaveFinance = (data: FinanceInput) =>
  patch({
    local_currency_sigle: data.currencyCode || undefined,
    main_currency_sigle:  data.baseCurrency || undefined,
    main_currency_rate:   data.exchangeRate != null
                            ? String(data.exchangeRate)
                            : undefined,
  })
const handleSaveSeuil = (data: SeuilInput) =>
  patch({
    ecart_projet_retard: data.ecartProjetRetard || undefined,
    ecart_projet_critique:  data.ecartProjetCritique || undefined,
  })

const handleSaveSecurite = (data: SecuriteInput) =>
  patch({
    is_maintenance:        data.maintenanceMode,
    inactivity_minute:     data.inactivityDelayMinutes,
    max_sessions:          data.maxSessions,
    max_login_attempts:    data.loginAttemptsLimit,
    otp_validity_minute:   data.tpCodeDelayMinutes,
    password_expiry_month: data.passwordChangeDelayMonths,
    delay_update_second:   data.deleteOrUpdateDelaySeconds,
  })

const handleSaveNotifications = (data: NotificationsInput) =>
  patch({
    whatsapp_instance:           data.whatsappInstanceCode      || undefined,
    whatsapp_number_id:          data.whatsappNumberId          || undefined,
    notif_email:                 data.notificationEmail         || undefined,
    notif_email_password:        data.notificationEmailPassword || undefined,
    notif_email_smtp_host:       data.smtpHost                  || undefined,
    notif_email_smtp_port:       data.smtpPort,
    notif_email_smtp_encryption: data.smtpEncryption            || undefined,
    notif_email_from_name:       data.smtpFromName              || undefined,
  })

const handleSaveIntegrations = (data: IntegrationsInput) =>
  patch({
    parent_api_url:             data.parentApiUrl             || undefined,
    parent_api_key:             data.parentApiKey             || undefined,
    parent_api_secret:          data.parentApiSecret          || undefined,
    parent_api_timeout_seconds: data.parentApiTimeoutSeconds,
    whatsapp_api_key:           data.whatsappApiKey           || undefined,
  })
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as TabId)}
      orientation="vertical"
      style={{
        '--tab-active-bg':          bg,
        '--tab-active-color':       '#ffffff',
        '--tab-active-font-weight': '600',
      } as React.CSSProperties}
      className="flex flex-row items-start gap-0 pt-6"
    >
      <TabsList className="
        sticky top-6 self-start
        flex h-auto w-52 flex-shrink-0 flex-col
        items-stretch justify-start gap-2
        rounded-xl bg-muted p-1.5
      ">
        {TABS.map(({ id, label, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="
              flex h-auto w-full items-center
              justify-start gap-2.5
              rounded-lg px-3 py-3 text-sm
            "
          >
            <span className="
              flex size-7 flex-shrink-0 items-center justify-center
              rounded-md bg-background/60 shadow-sm
            ">
              <Icon className="size-3.5" aria-hidden />
            </span>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Separator orientation="vertical" className="mx-4 h-auto" />

      <div className="flex-1 min-w-0">
        <TabsContent value="identite">
          <IdentiteSection
            params={config}
            isSaving={isPending}
            onSave={handleSaveIdentite}
          />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsSection
            params={config}
            isSaving={isPending}
            onSave={handleSaveContacts}
          />
        </TabsContent>
        <TabsContent value="finance">
          <FinanceSection
            params={config}
            isSaving={isPending}
            onSave={handleSaveFinance}
          />
        </TabsContent>
        <TabsContent value="seuil">
          <SeuilSection
            params={config}
            isSaving={isPending}
            onSave={handleSaveSeuil}
          />
        </TabsContent>
        <TabsContent value="securite">
          <SecuriteSection
            params={config}
            isSaving={isPending}
            onSave={handleSaveSecurite}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSection
            params={config}
            isSaving={isPending}
            onSave={handleSaveNotifications}
          />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsSection
            params={config}
            isSaving={isPending}
            onSave={handleSaveIntegrations}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function SystemPageSkeleton() {
  return (
    <div className="flex flex-row items-start gap-0 pt-6">
      <div className="w-52 flex-shrink-0 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
      <Separator orientation="vertical" className="mx-4 h-auto" />
      <div className="flex-1 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
} 