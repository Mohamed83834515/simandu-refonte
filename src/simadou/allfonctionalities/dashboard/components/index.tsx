import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartPieLabel } from '@/components/Courbes-graphiques/ChartPieLabel'
import ChartVariation from '@/components/Courbes-graphiques/ChartVariation'
import { Main } from '@/components/layout/others/main'
import { Analytics } from './analytics'
import { Overview } from './overview'
import { RecentSales } from './recent-sales'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CHART_COLORS, useColor } from '@/stores/others/color-store'


export function Dashboard() {
  const { color } = useColor()
  const { stroke } = CHART_COLORS[color]


  

  return (
    <>
      <Main>
        {/* En-tête du dashboard avec titre et bouton de téléchargement */}
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button style={{ backgroundColor: stroke }}>Download</Button>
          </div>
        </div>

        {/* Système d'onglets principal */}
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
          style={
            {
              '--tab-active-bg': stroke,
              '--tab-active-color': '#ffffff',
            } as React.CSSProperties
          }
        >
          {/* Liste des onglets — overflow-x-auto pour le scroll sur mobile */}
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              <TabsTrigger value='reports'>Reports</TabsTrigger>
              <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            </TabsList>
          </div>

          {/* ─── Onglet Overview ─── */}
          <TabsContent value='overview' className='space-y-4'>

            {/* Grille des 4 nouvelles cartes statiques */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>

              {/* Carte 1 : Total des projets */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Total des projets</CardTitle>
                  <div className='rounded-md p-2' style={{ backgroundColor: stroke }}>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'
                      stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
                      className='h-4 w-4'>
                      <rect width='8' height='12' x='2' y='6' rx='1' />
                      <path d='M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2' />
                      <path d='M10 9h4M10 13h4' />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>0</div>
                  <p className='text-xs text-muted-foreground'>Projets enregistrés</p>
                </CardContent>
              </Card>

              {/* Carte 2 : Tâches validées */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Tâches validées</CardTitle>
                  <div className='rounded-md p-2' style={{ backgroundColor: '#22c55e' }}>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'
                      stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
                      className='h-4 w-4'>
                      <path d='M20 6 9 17l-5-5' />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>0</div>
                  <p className='text-xs text-muted-foreground'>0.0% de réalisation</p>
                </CardContent>
              </Card>

              {/* Carte 3 : Tâches en cours */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Tâches en cours</CardTitle>
                  <div className='rounded-md p-2' style={{ backgroundColor: '#a855f7' }}>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'
                      stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
                      className='h-4 w-4'>
                      <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>0</div>
                  <p className='text-xs text-muted-foreground'>En progression</p>
                </CardContent>
              </Card>

              {/* Carte 4 : Tâches en retard */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Tâches en retard</CardTitle>
                  <div className='rounded-md p-2' style={{ backgroundColor: '#f97316' }}>
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'
                      stroke='white' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'
                      className='h-4 w-4'>
                      <circle cx='12' cy='12' r='10' />
                      <path d='M12 6v6l4 2' />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>1</div>
                  <p className='text-xs text-muted-foreground'>Nécessitent attention</p>
                </CardContent>
              </Card>

            </div>

            {/* Grille des 4 cartes originales — RIEN SUPPRIMÉ */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>

              {/* Carte : Graphique de variation */}
              <Card>
                <ChartVariation />
              </Card>

              {/* Carte : Graphique en camembert */}
              <ChartPieLabel />

              {/* Carte : Sales */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4'
                    style={{ color: stroke }}
                  >
                    <rect width='20' height='14' x='2' y='5' rx='2' />
                    <path d='M2 10h20' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+12,234</div>
                  <p className='text-xs text-muted-foreground'>
                    +19% from last month
                  </p>
                </CardContent>
              </Card>

              {/* Carte : Active Now */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Active Now</CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4'
                    style={{ color: stroke }}
                  >
                    <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+573</div>
                  <p className='text-xs text-muted-foreground'>
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>

            </div>

            {/* Grille principale : Overview (4/7) + Recent Sales (3/7) */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>

              {/* Graphique d'overview */}
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>

              {/* Liste des ventes récentes */}
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ─── Onglet Analytics ─── */}
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>

          {/* ─── Onglet Reports ─── */}
          <TabsContent value='reports' className='space-y-4'>
            <p className='text-muted-foreground'>Reports content coming soon.</p>
          </TabsContent>

          {/* ─── Onglet Notifications ─── */}
          <TabsContent value='notifications' className='space-y-4'>
            <p className='text-muted-foreground'>Notifications content coming soon.</p>
          </TabsContent>

        </Tabs>
      </Main>
    </>
  )
}