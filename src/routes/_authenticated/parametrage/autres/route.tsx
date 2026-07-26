import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Settings, Ruler, MapPin, Briefcase } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Main } from '@/components/layout/others/main'
import { useColor, HEADER_COLORS } from '@/stores/others/color-store'
import { SystemPage } from './system'
import { UnitesIndicateurPage } from './unites-indicateur'
import { TypeZonePage } from './type-zone'
import { FonctionPage } from './fonction'


export const Route = createFileRoute('/_authenticated/parametrage/autres')({
  component: AutresParametrageLayout,
})

// ── Tabs config ───────────────────────────────────────────────────────────────
type TabId = 'system' | 'unity' | 'zone' | 'fonction'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'system', label: 'Système', icon: Settings },
  { id: 'unity', label: 'Unités indicateurs', icon: Ruler },
  { id: 'zone', label: 'Type zone', icon: MapPin },
  { id: 'fonction', label: 'Fonction', icon: Briefcase },
]

// ── Layout ────────────────────────────────────────────────────────────────────
function AutresParametrageLayout() {
  const [currentTab, setCurrentTab] = useState<TabId>('system')

  const { headerColor } = useColor()
  const { bg } = HEADER_COLORS[headerColor]

  return (
    <Main>
      <div className='flex w-full flex-1 flex-col gap-6 mx-auto container py-4'>

        {/* En-tête */}
        <div className='flex items-center gap-3'>
          <Settings className='h-8 w-8 text-muted-foreground' />
          <div>
            <h1 className='text-3xl font-bold'>Autres paramétrages</h1>
            <p className='text-muted-foreground mt-1'>
              Configurez les référentiels et données de base du système.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={(v) => setCurrentTab(v as TabId)}
          style={{
            '--tab-active-bg': bg,
            '--tab-active-color': '#ffffff',
            '--tab-active-font-weight': '700',
          } as React.CSSProperties}
        >
          <TabsList>
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id} className='flex items-center gap-1.5'>
                <Icon className='size-3.5' aria-hidden />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className='mt-4'>
            <TabsContent value='system'>
              <SystemPage />
            </TabsContent>
            <TabsContent value='unity'>
              <UnitesIndicateurPage />
            </TabsContent>
            <TabsContent value='zone'>
              <TypeZonePage />
            </TabsContent>
            <TabsContent value='fonction'>
              <FonctionPage />
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </Main>
  )
}