import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import ptbaService from '@/simadou/allSercices/ptbaService'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'

export const useGetPtbas = () => {
  const codeProgramme = useActiveProgrammeCode()

  return useQuery({
    queryKey: ['ptba-activites-all', codeProgramme],
    queryFn: () => ptbaService.getAll(codeProgramme!),
    enabled: !!codeProgramme,
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
    onError: () => {
      toast.error("Erreur lors de la suppression de l'activité PTBA")
    },
  })
}
