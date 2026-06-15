import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    toast.error('No content.')
    return
  }

  toast.error(getApiErrorMessage(error))
}
