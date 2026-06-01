import { useQuery } from '@tanstack/react-query'
import { typeZoneService } from '@/simadou/allSercices/typeZoneService'

export const typeZoneQueryKeys = {
  all: ['type-zones'] as const,
} as const

export function useGetTypeZones() {
  return useQuery({
    queryKey: typeZoneQueryKeys.all,
    queryFn: () => typeZoneService.getAll(),
  })
}

