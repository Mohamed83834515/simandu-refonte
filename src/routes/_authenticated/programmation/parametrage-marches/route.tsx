import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { FileText, Settings, Tags } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Main } from '@/components/layout/others/main'
import { useColor, HEADER_COLORS } from '@/stores/others/color-store'
import { VersionPPMPage } from './versions-ppm'
import { ModesPassationPage } from './modes-passation'
import { NaturesMarchePage } from './natures-marche'
import { TypeFinancementPPMPage } from './type-financement'
export const Route = createFileRoute('/_authenticated/programmation/parametrage-marches')({
  component: ParametrageMarchesLayout,
})

type TabId = 'versions-ppm' | 'modes-passation' | 'natures-marche' | 'type-financement'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'versions-ppm',     label: 'Versions PPM',            icon: Settings  },
  { id: 'modes-passation',  label: 'Modes passation',          icon: FileText  },
  { id: 'natures-marche',   label: 'Natures marché',           icon: Tags      },
  { id: 'type-financement', label: 'Types de financement PPM', icon: FileText  },
]

function ParametrageMarchesLayout() {
  const [currentTab, setCurrentTab] = useState<TabId>('versions-ppm')

  const { headerColor } = useColor()
  const { bg } = HEADER_COLORS[headerColor]

  return (
    <Main>
      <div className='flex w-full flex-1 flex-col gap-6 mx-auto container py-4'>

        <div className='flex items-center gap-3'>
          <Settings className='h-8 w-8 text-muted-foreground' />
          <div>
            <h1 className='text-3xl font-bold'>Paramétrage des marchés</h1>
            <p className='text-muted-foreground mt-1'>
              Configurez les référentiels et données des marchés.
            </p>
          </div>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={(v) => setCurrentTab(v as TabId)}
          style={{
            '--tab-active-bg':          bg,
            '--tab-active-color':       '#ffffff',
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
            <TabsContent value='versions-ppm'>
              <VersionPPMPage />
            </TabsContent>
            <TabsContent value='modes-passation'>
              <ModesPassationPage />
            </TabsContent>
            <TabsContent value='natures-marche'>
              <NaturesMarchePage />
            </TabsContent>
            <TabsContent value='type-financement'>
              <TypeFinancementPPMPage
               />
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </Main>
  )
}