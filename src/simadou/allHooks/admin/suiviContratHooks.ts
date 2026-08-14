import { useQuery } from '@tanstack/react-query'
import { suiviContratService } from '@/simadou/allSercices/suiviContratService'

export const suiviContratQueryKeys = {
  all: ['suivis-contrats'] as const,
}

export function useGetSuivisContrat() {
  return useQuery({
    queryKey: suiviContratQueryKeys.all,
    queryFn: () => suiviContratService.getAll(),
  })
}
