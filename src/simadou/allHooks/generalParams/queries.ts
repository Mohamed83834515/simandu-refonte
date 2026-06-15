import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/axios/api'
import {
  GeneralParamsSchema,
  type GeneralParamsRaw,
} from '@/simadou/schemas/generalParams.schema'

export const generalParamsKeys = {
  all:    () => ['general-params']           as const,
  single: () => ['general-params', 'single'] as const,
}

export function useGeneralParamsQuery() {
  return useQuery({
    queryKey: generalParamsKeys.single(),
    queryFn:  async () => {
      const raw = await apiClient.request<GeneralParamsRaw>('/configuration/')
      
      return GeneralParamsSchema.parse(raw)
    },
    staleTime: 1000 * 60 * 10,
  })
}