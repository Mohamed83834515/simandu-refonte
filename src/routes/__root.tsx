import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/others/navigation-progress'
import { GeneralError } from '@/components/errors/general-error'
import { NotFoundError } from '@/components/errors/not-found-error'
import { SessionProvider } from '@/simadou/allContext/sessionProvider'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <SessionProvider>
        <NavigationProgress />
        <Outlet />
        <Toaster duration={5000} />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </SessionProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
 
})
