import sourceFinancementProjetService from "@/simadou/allSercices/sourceFinancementProjetService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const sourceFinancementQueryKeys = {
  all: ['sources-financement'] as const,
  byActivite: (idActivite: string) => ['sources-financement', 'activite', idActivite] as const,
};

export const useGetSourcesByActivite = (idActivite: string) => {
  return useQuery
  ({
    queryKey: sourceFinancementQueryKeys.byActivite(idActivite),
    queryFn: () => sourceFinancementProjetService.getByActivite(idActivite),
    enabled: !!idActivite,
  });
};

export const useCreateSourceFinancement = (idActivite: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => sourceFinancementProjetService.create({ ...data, id_activite_projet: idActivite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceFinancementQueryKeys.byActivite(idActivite) })
      toast.success("Source créée avec succès")
    },
    onError: () => toast.error("Erreur lors de la création"),
  })
}

export const useUpdateSourceFinancement = (idActivite: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      sourceFinancementProjetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceFinancementQueryKeys.byActivite(idActivite) })
      toast.success("Source modifiée avec succès")
    },
    onError: () => toast.error("Erreur lors de la modification"),
  })
}

export const useDeleteSourceFinancement = (idActivite: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => sourceFinancementProjetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceFinancementQueryKeys.byActivite(idActivite) })
      toast.success("Source supprimée")
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  })
}