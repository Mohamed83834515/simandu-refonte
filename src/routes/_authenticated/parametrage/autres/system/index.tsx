import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AppWindow, Mail, Coins, ShieldCheck, Bell, Link2 } from 'lucide-react'
import { IdentiteSection }      from '@/simadou/allfonctionalities/parametrage/autres/system/IdentiteSection'
import { ContactsSection }      from '@/simadou/allfonctionalities/parametrage/autres/system/ContactsSection'
import { FinanceSection }       from '@/simadou/allfonctionalities/parametrage/autres/system/FinanceSection'
import { SecuriteSection }      from '@/simadou/allfonctionalities/parametrage/autres/system/SecuritySection'
import { NotificationsSection } from '@/simadou/allfonctionalities/parametrage/autres/system/NotificationsSection'
import { IntegrationsSection }  from '@/simadou/allfonctionalities/parametrage/autres/system/IntegrationsSection'
import type { GeneralParamsInput } from '@/simadou/schemas/generalParams.schema'
import { useColor, HEADER_COLORS } from '@/stores/others/color-store'

export const Route = createFileRoute(
  '/_authenticated/parametrage/autres/system/'
)({ component: SystemPage })

const TABS = [
  { id: 'identite',      label: 'Identité système', icon: AppWindow   },
  { id: 'contacts',      label: 'Contacts',          icon: Mail        },
  { id: 'finance',       label: 'Finance',            icon: Coins       },
  { id: 'securite',      label: 'Sécurité',           icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications',      icon: Bell        },
  { id: 'integrations',  label: 'Intégrations',       icon: Link2       },
] as const

type TabId = typeof TABS[number]['id']

const MOCK: GeneralParamsInput = {
  id: '1', createdAt: '', updatedAt: '',
  appName: 'SEGAR', primaryColor: null, logoUrl: null, logoPublicId: null,
  systemSigle: 'SEGAR', systemTitle: 'Suivi Evaluation Global Axé sur les Résultats',
  structureSigle: 'CEP', structureName: 'Cellule Exécution des Projets',
  structureLogo: null, structureAddress: 'Kaloum Conakry',
  structureEmail: null, structurePhone: null, structureWhatsapp: null,
  contactEmail: null, contactPhone: null, address: null, website: null,
  currencyCode: 'GNF', baseCurrency: 'USD', exchangeRate: 9000,
  maintenanceMode: false, inactivityDelayMinutes: 30, maxSessions: 2,
  loginAttemptsLimit: 3, tpCodeDelayMinutes: 5,
  passwordChangeDelayMonths: 6, deleteOrUpdateDelaySeconds: 5,
  whatsappInstanceCode: '2522545522', notificationEmail: 'cep@cep.net',
  notificationEmailPassword: 'Cep@@@@@125h', smtpHost: '557',
  parentApiUrl: null,
}

function SystemPage() {
  const [activeTab, setActiveTab] = useState<TabId>('identite')
  const params = MOCK

  const { headerColor } = useColor()
  const { bg } = HEADER_COLORS[headerColor]

  const handleSave = (section: string) => (data: unknown) => {
    console.log(`save ${section}`, data)
  }

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
      {/* ── Vertical tab list ── */}
      <TabsList
       className="
      sticky top-6                    
      flex h-auto w-52 flex-shrink-0 flex-col
      items-stretch justify-start gap-2
      rounded-xl bg-muted p-1.5
      self-start                      
    "
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className="
              flex h-auto w-full flex items-center
              justify-start gap-2.5
              rounded-lg px-3 py-3 text-sm
            "
          >
            <span
              className="
                flex size-7 flex-shrink-0 items-center justify-center
                rounded-md bg-background/60 shadow-sm
                data-[state=active]:bg-white/20
              "
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Separator orientation="vertical" className="mx-4 h-auto" />

      {/* ── Section content ── */}
      <div className="flex-1 min-w-0">
        <TabsContent value="identite">
          <IdentiteSection      params={params} isSaving={false} onSave={handleSave('identite')} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsSection      params={params} isSaving={false} onSave={handleSave('contacts')} />
        </TabsContent>
        <TabsContent value="finance">
          <FinanceSection       params={params} isSaving={false} onSave={handleSave('finance')} />
        </TabsContent>
        <TabsContent value="securite">
          <SecuriteSection      params={params} isSaving={false} onSave={handleSave('securite')} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSection params={params} isSaving={false} onSave={handleSave('notifications')} />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsSection  params={params} isSaving={false} onSave={handleSave('integrations')} />
        </TabsContent>
      </div>
    </Tabs>
  )
}