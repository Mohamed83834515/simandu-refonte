import { Outlet } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/others/main'

import { useMe } from '@/simadou/allHooks/auth/authHooks'
// import { SidebarNav } from './components/sidebar-nav'



export function Settings() {
  const {data :user} = useMe()
  return (
    <>
      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Général
          </h1>
          <p className='text-muted-foreground'>
           {user?.nom_perso} , Gérez les paramètres de votre compte et définissez vos préférences 
          </p>
        </div>
        <Separator className='my-2 lg:my-2' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
       
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
