import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/axios/api'
import { generalParamsKeys } from './queries'
import type { GeneralParamsInput, GeneralParamsRaw } from '@/simadou/schemas/generalParams.schema'
import type { GeneralParamsPatch } from '@/simadou/allTypes/generalParams'
import { toast } from 'sonner'

export function useUpdateGeneralParams() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GeneralParamsPatch) =>
      apiClient.request<GeneralParamsInput>('/configuration/', {
        method: 'PATCH',
        data,
      }),

    onSuccess: () => {
      // Re-fetch to get the fresh transformed version
      queryClient.invalidateQueries({ queryKey: generalParamsKeys.single() })
      toast.success("Mise à jour enregistrée avec succès")
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: generalParamsKeys.single() })
    },
  })
}


export function useUploadStructureLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('structure_logo', file)
      return apiClient.request<GeneralParamsRaw>('/configuration/', {
        method:  'PATCH',
        data:    formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generalParamsKeys.single() })
      toast.success('Logo mis à jour')
    },
    onError: () => toast.error('Échec de la mise à jour du logo'),
  })
}