import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
// Generated Routes
import { routeTree } from './routeTree.gen'
import { DirectionProvider } from './stores/others/direction-provider'
// Styles
import './styles/index.css'
import { AuthProvider } from './simadou/allContext/authProvider'
import { useAuthStore } from './stores/auth-store'
import { SessionProvider } from './simadou/allContext/sessionProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (
        (mutation.options.meta as { suppressGlobalErrorToast?: boolean } | undefined)
          ?.suppressGlobalErrorToast
      ) {
        return
      }

      handleServerError(error)
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (
        (query.meta as { suppressGlobalErrorToast?: boolean } | undefined)
          ?.suppressGlobalErrorToast
      ) {
        return
      }

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().logout()
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          if (import.meta.env.PROD) {
            router.navigate({ to: '/500' })
          }
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
     <StrictMode>
    <QueryClientProvider client={queryClient}>  
      <AuthProvider>     
        <SessionProvider>                    
        <DirectionProvider>
          <RouterProvider router={router} />
        </DirectionProvider>
        </SessionProvider>  
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
  )
}
