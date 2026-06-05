import { createFileRoute } from '@tanstack/react-router'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Settings, Ruler, MapPin, } from 'lucide-react'


import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/others/main'
import {useColor, HEADER_COLORS } from '@/stores/others/color-store'

export const Route = createFileRoute(
  '/_authenticated/parametrage/autres',
)({
  component: AutresParametrageLayout,
})

const TABS = [
  { to: '/parametrage/autres/system',             label: 'Système',              icon: Settings , value : "system"   },
  { to: '/parametrage/autres/unites-indicateur',                  label: 'Unités indicateurs', icon: Ruler  , value : "unity"  },
  { to: '/parametrage/autres/type-zone',                label: 'Type zone',                 icon: MapPin  , value : "zone"  },

] as const





function AutresParametrageLayout() {
  const pathname = useRouterState({
    select: s => s.location.pathname,
  })

    const { headerColor } = useColor()
  const {bg} = HEADER_COLORS[headerColor]

  const currentTab =
    pathname.includes('/system')
      ? 'system'
      : pathname.includes('/type-zone')
        ? 'zone'
        : pathname.includes('/unites-indicateur')
          ? 'unity'
          : 'system'

  return (
    <Main>
      <div className="flex w-full flex-1 flex-col gap-6 mx-auto container py-4">

        
       <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">Autres paramétrages</h1>
          <p className="text-muted-foreground mt-1">
            Configurez les référentiels et données de base du système.
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
