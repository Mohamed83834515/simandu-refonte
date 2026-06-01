import { useQuery } from '@tanstack/react-query'
import { fonctionService } from '@/simadou/allSercices/fonctionService'

export const fonctionQueryKeys = {
  all: ['fonctions-personnel'] as const,
} as const

export function useGetFonctions() {
  return useQuery({
    queryKey: fonctionQueryKeys.all,
    queryFn: () => fonctionService.getAll(),
  })
}
