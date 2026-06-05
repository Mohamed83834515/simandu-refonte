// features/personnel/mutations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/axios/api'

import type { Acteur, Localite, Personnel, TitrePersonnel } from '@/simadou/allTypes'
import { PersonnelCreateData, UpdateProfilePictureInput } from '@/simadou/schemas/personnelSchema'
import { personnelService } from '@/simadou/allSercices/personnelService'
import { fonctionService } from '@/simadou/allSercices/fonctionService'
import { planSiteService } from '@/simadou/allSercices/planSiteService'
import { toast } from 'sonner'

export const personnelKeys = {
  all:        () => ['/personnel/'] as const,

  me:         () => [...personnelKeys.all(), 'me'] as const,

  titres:     () => [...personnelKeys.all(), 'titresPersonnel'] as const,

  regions:    () => [...personnelKeys.all(), 'regions'] as const,

  structures: () => [...personnelKeys.all(), 'structures'] as const,

  fonctions:  () => [...personnelKeys.all(), 'fonctions'] as const,

  planSites:  () => [...personnelKeys.all(), 'planSites'] as const,
}

export type UpdatePersonnelPayload = Partial<{
  contact_perso:    string
  titre_personnel:  string 
  region_perso:     string 
}>

export function useUpdatePersonnel(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePersonnelPayload) =>
      apiClient.request<Personnel>(`/personnels/${id}/`, {
        method : 'PATCH',
        data
      }),

    // Optimistic — merge partial payload into cached personnel
   onMutate: async (incoming) => {
  await queryClient.cancelQueries({ queryKey: personnelKeys.me() })
  const previous = queryClient.getQueryData<Personnel>(personnelKeys.me())
  

  queryClient.setQueryData<Personnel>(personnelKeys.me(), old => {
    if (!old) return old
    return {
      ...old,
      ...(incoming.contact_perso !== undefined && {
        contact_perso: incoming.contact_perso,
      }),
    }
  })

  return { previous }

  

},

    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(personnelKeys.me(), context.previous)
      }
      toast.error('Une erreur est survenue lors de la mise à jour')
    },

    

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: personnelKeys.me() })
    },

    onSuccess : ()=>{
      toast.success("Modifications enregistrées ")
    }
    
  })
}



export function useCreatePersonnel ({id , isEdit, onSuccess} : {id : number, isEdit : boolean,  onSuccess?: () => void}){
 const queryClient = useQueryClient()
  return useMutation({
      mutationFn: (data: PersonnelCreateData) =>
          isEdit
            ? personnelService.update(id!, data)
            : personnelService.create(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: personnelKeys.all() });
           onSuccess?.()
        },
  })
}





// 
export function useTitres() {
  return useQuery({
    queryKey: personnelKeys.titres(),
    queryFn:  async () => await apiClient.request<TitrePersonnel[]>('/titre_personnel/'),
  })
}

export function useRegions() {
  return useQuery({
    queryKey: personnelKeys.regions(),
    queryFn:  async () => await apiClient.request<Localite[]>('/localite/'),
  })
}


// =========================
// STRUCTURES
// =========================

export function useStructures() {
  return useQuery({
    queryKey: personnelKeys.structures(),
    queryFn: async (): Promise<Acteur[]> => {
      const response = await apiClient.request('/acteur/')

      return Array.isArray(response)
        ? response
        : []
    },
  })
}

// =========================
// FONCTIONS
// =========================

export function useFonctions() {
  return useQuery({
    queryKey: personnelKeys.fonctions(),
    queryFn: fonctionService.getAll,
  })
}


// =========================
// PLAN SITES
// =========================

export function usePlanSites() {
  return useQuery({
    queryKey: personnelKeys.planSites(),
    queryFn: planSiteService.getAll,
  })
}




export const useUpdateProfilePicture = (n_personel: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => personnelService.updateProfilePicture(n_personel, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

