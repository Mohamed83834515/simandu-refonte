import { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { CommandMenu } from '@/components/others/command-menu'
import { ConfigDrawer } from '@/components/others/config-drawer'
import { AppSidebar } from '@/components/layout/others/app-sidebar'
import { Header } from '@/components/layout/others/header'
import { ProfileDropdown } from '@/components/others/profile-dropdown'
import { Search } from '@/components/others/search'
import { SkipToMain } from '@/components/others/skip-to-main'
import { ThemeSwitch } from '@/components/others/theme-switch'
import { AppTopbar } from './top-nav'
import { ActiveProgrammeProvider } from './active-programme-provider'
import { useSearchStore } from '@/stores/others/search-store'
import { useLayout } from '@/stores/others/layout-store'

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

  // ── Topbar mode ──────────────────────────────────────────────────────────
  if (navMode === 'topbar') {
    return (
      <SidebarProvider defaultOpen={false}>
        <SkipToMain />
        <div className='flex min-h-svh w-full flex-col'>
          <AppTopbar />
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
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </Header>
        {children ?? <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  )
}