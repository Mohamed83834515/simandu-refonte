import { AxiosError } from 'axios'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { projetService } from '@/simadou/allSercices/projetService'
import { projetStatsService } from '@/simadou/allSercices/projetStatsService'
import type { Projet, ProjetClotureForm } from '@/simadou/allTypes/projet'
import { ProjectCreateData } from '@/simadou/schemas/projetSchema'
import { toast } from 'sonner'
import { useActiveProgrammeId } from '@/hooks/use-active-programme'

function findProjetByRouteId(
  projets: Projet[],
  id: number | string
): Projet | undefined {
  const idStr = String(id)
  const numericId = Number(id)

  return projets.find(
    (p) =>
      String(p.id_projet) === idStr ||
      p.code_projet === idStr ||
      (Number.isFinite(numericId) && p.id_projet === numericId)
  )
}

function findProjetInCache(
  queryClient: QueryClient,
  idProgramme: number | undefined,
  id: number | string
): Projet | undefined {
  // Chercher dans le cache des projets par programme
  const programmeKey = projetQueryKeys.byProgramme(idProgramme)
  const fromProgramme = queryClient.getQueryData<Projet[]>(programmeKey)
  const inProgramme = fromProgramme
    ? findProjetByRouteId(fromProgramme, id)
    : undefined
  if (inProgramme) return inProgramme

  // Chercher dans le cache principal (fallback)
  const allProjets = queryClient.getQueryData<Projet[]>(projetQueryKeys.all)
  const inAll = allProjets ? findProjetByRouteId(allProjets, id) : undefined
  if (inAll) return inAll

  // Chercher dans tous les caches qui commencent par ['projets']
  for (const query of queryClient
    .getQueryCache()
    .findAll({ queryKey: projetQueryKeys.all })) {
    const data = query.state.data
    if (Array.isArray(data)) {
      const found = findProjetByRouteId(data as Projet[], id)
      if (found) return found
    }
  }

  return undefined
}

async function resolveProjetByRouteId(
  id: number | string,
  idProgramme: number | undefined
): Promise<Projet> {
  try {
    const projets = await projetService.getAll(idProgramme || 7)

    const found = findProjetByRouteId(projets, id)

    if (!found) {
      throw new Error('Projet introuvable')
    }
    return found
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error('Impossible de charger le projet')
    }
    throw error
  }
}

export const projetQueryKeys = {
  all: ['projets'] as const,
  byProgramme: (idProgramme: number | undefined) =>
    [...projetQueryKeys.all, 'programme', idProgramme] as const,
  byProgrammeWithFilter: (idProgramme: number | undefined, idVersions: number) =>
    [...projetQueryKeys.all, 'programme', idProgramme, 'filter', idVersions] as const,
  byId: (id: number | string) => [...projetQueryKeys.all, 'detail', id] as const,
}

export function useGetProjets() {
  const idProgramme = useActiveProgrammeId()

  return useQuery({
    queryKey: projetQueryKeys.byProgramme(idProgramme),
    queryFn: () => projetService.getAll(idProgramme || 7),
    enabled: idProgramme != null,
  })
}

export function useGetProjetsFilterVersion(idVersion?: number) {
  const idProgramme = useActiveProgrammeId()

  return useQuery({
    queryKey: projetQueryKeys.byProgrammeWithFilter(idProgramme, idVersion ?? 0),
    queryFn: () => projetService.getAllWithfilter(idProgramme!, idVersion!),
    enabled: idProgramme != null && idVersion != null && idVersion > 0,
  })
}

export const useGetTauxGlobalActiviteProjet = (projetId: number | string | undefined) => {
  return useQuery({
    queryKey: ['taux-global-activite', projetId],
    queryFn: () => projetStatsService.getTauxGlobalAct(projetId!),
    enabled: !!projetId,
  })
}

/** Récupère les budgets annuels d'un projet */
export function useGetBudgetAnnuel(idProjet: number) {
  return useQuery({
    queryKey: [...projetQueryKeys.all, idProjet, 'budgets-annuels'] as const,
    queryFn: () => projetService.getBudgetAnnuel(idProjet),
  })
}

export function useGetProjet(id: number | string | undefined) {
  const idProgramme = useActiveProgrammeId()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: projetQueryKeys.byId(id || 0),
    queryFn: () => resolveProjetByRouteId(id!, idProgramme),
    initialData: () => findProjetInCache(queryClient, idProgramme, id!),
    staleTime: 30_000,
    enabled: id != null && String(id).length > 0,
    meta: { suppressGlobalErrorToast: true },
  })
}

export function useCreateProjet() {
  const queryClient = useQueryClient()
  const idProgramme = useActiveProgrammeId()

  return useMutation({
    mutationFn: (data: ProjectCreateData) => {
      if (idProgramme == null) {
        return Promise.reject(new Error('Programme actif requis'))
      }
      return projetService.create({
        ...data,
        programme_projet: idProgramme,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projetQueryKeys.all })
      toast.success('Projet créé avec succès ✅')
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la création: ${error.message}`)
    },
  })
}

export function useClotureProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: ProjetClotureForm }) =>
      projetService.cloture(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projetQueryKeys.all })

      if (data.id_projet) {
        queryClient.invalidateQueries({
          queryKey: projetQueryKeys.byId(data.id_projet)
        })
      }

      const message = data.is_cloture
        ? 'Projet clôturé avec succès ✅'
        : 'Projet déclôturé avec succès 🔓'
      toast.success(message)
    },

    onError: (error: Error) => {
      toast.error(`Erreur lors de la clôture: ${error.message}`)
    },
  })
}

export function useUpdateProjet(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectCreateData) => {
      return projetService.update(id, data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projetQueryKeys.all })

      if (data?.id_projet) {
        queryClient.invalidateQueries({
          queryKey: projetQueryKeys.byId(data.id_projet)
        })
      }
      toast.success('Projet modifié avec succès ✅')
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la modification: ${error.message}`)
    },
  })
}

export function useDeleteProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => projetService.delete(id),
    onSuccess: () => {
      toast.success('Projet supprimé avec succès 🗑️')
      queryClient.invalidateQueries({ queryKey: projetQueryKeys.all })
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`)
    },
  })
}

export function useGetProjetAvancementAnnuelStats(
  projetId: number | string | undefined,
  projectYears: number[]
) {
  return useQuery({
    queryKey: [
      ...projetQueryKeys.all,
      'stats-avancement-annuel',
      projetId,
      projectYears,
    ] as const,
    queryFn: () =>
      projetStatsService.getAvancementAnnuel(projetId!, projectYears),
    enabled: projetId != null && projectYears.length > 0,
  })
}