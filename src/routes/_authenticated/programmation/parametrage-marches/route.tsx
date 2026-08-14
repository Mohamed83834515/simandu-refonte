import { createFileRoute } from '@tanstack/react-router'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { FileText, Settings, Tags } from 'lucide-react'


import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/others/main'
import {useColor, HEADER_COLORS } from '@/stores/others/color-store'

export const Route = createFileRoute(
  '/_authenticated/programmation/parametrage-marches',
)({
  component: ParametrageMarchesLayout,
})

const TABS = [
  {
    to: '/programmation/parametrage-marches/versions-ppm',
    label: 'Versions PPM',
    icon: Settings,
    value: 'versions-ppm',
  },
  {
    to: '/programmation/parametrage-marches/modes-passation',
    label: 'Modes passation',
    icon: FileText,
    value: 'modes-passation',
  },
  {
    to: '/programmation/parametrage-marches/natures-marche',
    label: 'Natures marché',
    icon: Tags,
    value: 'natures-marche',
  },
  {
    to: '/programmation/parametrage-marches/type-financement',
    label: 'Types de financement PPM',
    icon: FileText,
    value: 'type-financement',
  },
] as const





function ParametrageMarchesLayout() {
  const pathname = useRouterState({
    select: s => s.location.pathname,
  })

    const { headerColor } = useColor()
  const {bg} = HEADER_COLORS[headerColor]

  const currentTab = pathname.includes('/modes-passation')
    ? 'modes-passation'
    : pathname.includes('/natures-marche')
      ? 'natures-marche'
      : pathname.includes('/type-financement')
        ? 'type-financement'
      : 'versions-ppm'

  return (
    <Main>
      <div className="flex w-full flex-1 flex-col gap-6 mx-auto container py-4">

        
       <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">Paramétrage des marchés</h1>
          <p className="text-muted-foreground mt-1">
            Configurez les référentiels et données des marchés.
          </p>
        </div>
      </div>
      <Tabs 
      style={
            {
              '--tab-active-bg': bg,
              '--tab-active-color': '#ffffff',
              '--tab-active-font-weight': '700'

            } as React.CSSProperties
          }
      value={currentTab}>
        <TabsList>
           {TABS.map(({ to, label, icon: Icon, value }) => {
           
            return (
              <TabsTrigger
                key={to}
                value={value}
                asChild
              
              >
                <Link  to={to}>
                 <Icon className="size-3.5" aria-hidden />
                {label}
                </Link>
               
              </TabsTrigger>
            )
          })}
        </TabsList>

        <div className="mt-4">
          <Outlet />
        </div>
      </Tabs>
      </div>
    </Main>
  )
}
