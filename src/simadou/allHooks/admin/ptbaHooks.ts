import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import ptbaService from '@/simadou/allSercices/ptbaService'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'

export const useGetPtbas = (idVersionPtba: number) => {
  const codeProgramme = useActiveProgrammeCode()

  return useQuery({
    queryKey: ['ptba-activites-all', codeProgramme, idVersionPtba], 
    queryFn: () => ptbaService.getAll(codeProgramme, idVersionPtba),
    enabled: !!codeProgramme && !!idVersionPtba, 
  })
}

export const useDeletePtba = () => {
  const queryClient = useQueryClient()
  const codeProgramme = useActiveProgrammeCode()

  return useMutation({
    mutationFn: (id: number) => ptbaService.delete(id),
    onSuccess: () => {
      toast.success('Activité PTBA supprimée avec succès')
      queryClient.invalidateQueries({
        queryKey: ['ptba-activites-all', codeProgramme],
      })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de la suppression de l'activité PTBA"))
    },
  })
}
