import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn, getDisplayNameInitials } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { CommandMenu } from '@/components/others/command-menu'
import { ConfigDrawer } from '@/components/others/config-drawer'
import { AppSidebar } from '@/components/layout/others/app-sidebar'
import { Header } from '@/components/layout/others/header'
import { ProfileDropdown } from '@/components/others/profile-dropdown'
import { Search } from '@/components/others/search'
import { SkipToMain } from '@/components/others/skip-to-main'
import { ThemeSwitch } from '@/components/others/theme-switch'
import { LogoGroup } from '@/components/others/logo-group'
import { AppTopbar } from './top-nav'
import { ActiveProgrammeProvider } from './active-programme-provider'
import { useSearchStore } from '@/stores/others/search-store'
import { useLayout } from '@/stores/others/layout-store'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SignOutDialog } from '@/components/others/sign-out-dialog'
import useDialogState from '@/hooks/use-dialog-state'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

// ─── Outer wrapper ───────────────────────────────────────────────────────────
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const setOpen = useSearchStore((s) => s.setOpen)

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  return (
    <ActiveProgrammeProvider>
      <AuthenticatedLayoutInner defaultOpen={defaultOpen}>
        {children}
      </AuthenticatedLayoutInner>
      <CommandMenu />
    </ActiveProgrammeProvider>
  )
}

// ─── Inner component (lit navMode depuis Zustand) ────────────────────────────
function AuthenticatedLayoutInner({
  children,
  defaultOpen,
}: {
  children?: React.ReactNode
  defaultOpen: boolean
}) {
  const navMode = useLayout((s) => s.navMode)
  const {data : user} =useMe()
   const userInitials = getDisplayNameInitials(user?.nom_perso ?? '')
    const [open, setOpen] = useDialogState()
  // ── Topbar mode ──────────────────────────────────────────────────────────
  if (navMode === 'topbar') {
    return (
      <SidebarProvider defaultOpen={false}>
        <SkipToMain />
        <div className='flex min-h-svh w-full flex-col'>
         {user && (
           <AppTopbar user={{nom_perso : user.nom_perso ?? "Simadou", email : user.email ?? "hello@gmail.com", id_personnel_perso: user.id_personnel_perso ?? "4", statut : user.statut ?? 1, personnel_profile_picture : user.personnel_profile_picture, prenom_perso : user.prenom_perso}} />
         )}
          <div className='flex-1 p-4 sm:px-6 sm:py-6'>
            {children ?? <Outlet />}
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // ── Sidebar mode (default) ───────────────────────────────────────────────
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToMain />
      <AppSidebar />
      <SidebarInset
        className={cn(
          '@container/content',
          'has-data-[layout=fixed]:h-svh',
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
        )}
      >
        <Header fixed>
          <LogoGroup logoHeight={30} className="flex py-0 gap-2 px-1" />
          <Search />
          <div className="flex-1" />
          <ThemeSwitch />
          <ConfigDrawer />
            {user && (
              <ProfileDropdown
            user={user}
            side={ "bottom" }
            onLogout={() => setOpen(true)}
            trigger={
              <Button className='rounded-full h-8 w-8'>
                 <Avatar className='h-8 w-8 text-foreground font-semibold'>
                  <AvatarImage src={user.personnel_profile_picture ?? ''} alt='profile' />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
            )}
        </Header>
        {children ?? <Outlet />}
      </SidebarInset>
       <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </SidebarProvider>
  )
}