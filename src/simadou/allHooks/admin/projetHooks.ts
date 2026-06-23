import { AxiosError } from 'axios'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { projetService } from '@/simadou/allSercices/projetService'
import { projetStatsService } from '@/simadou/allSercices/projetStatsService'
import type { Projet } from '@/simadou/allTypes/projet'
import { projetBelongsToProgramme } from '@/simadou/allTypes/projet'
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
  const programmeKey = projetQueryKeys.byProgramme(idProgramme)
  const fromProgramme = queryClient.getQueryData<Projet[]>(programmeKey)
  const inProgramme = fromProgramme
    ? findProjetByRouteId(fromProgramme, id)
    : undefined
  if (inProgramme) return inProgramme

  const unfiltered = queryClient.getQueryData<Projet[]>([
    ...projetQueryKeys.all,
    'unfiltered',
  ])
  const inUnfiltered = unfiltered
    ? findProjetByRouteId(unfiltered, id)
    : undefined
  if (inUnfiltered) return inUnfiltered

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
    const projets = await projetService.getAll()
    const scoped =
      idProgramme != null
        ? projets.filter((p) => projetBelongsToProgramme(p, idProgramme))
        : projets

    const found =
      findProjetByRouteId(scoped, id) ?? findProjetByRouteId(projets, id)

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
    [...projetQueryKeys.all, idProgramme] as const,
}

export function useGetProjets() {
  const idProgramme = useActiveProgrammeId()

  return useQuery({
    queryKey: projetQueryKeys.byProgramme(idProgramme),
    queryFn: () => projetService.getAll(),
    enabled: idProgramme != null,
    select: (projets) =>
      idProgramme != null
        ? projets.filter((p) => projetBelongsToProgramme(p, idProgramme))
        : [],
  })
}

/** Tous les projets (sans filtre programme) — ex. sélecteurs de formulaires comme l'ancienne app. */
export function useGetAllProjets() {
  return useQuery({
    queryKey: [...projetQueryKeys.all, 'unfiltered'] as const,
    queryFn: () => projetService.getAll(),
  })
}

/** Tous les projets (sans filtre programme) — ex. sélecteurs de formulaires comme l'ancienne app. */
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
    queryKey: [...projetQueryKeys.all, 'detail', id, idProgramme] as const,
    queryFn: () => resolveProjetByRouteId(id!, idProgramme),
    initialData: () => findProjetInCache(queryClient, idProgramme, id!),
    staleTime: 30_000,
    enabled: id != null && String(id).length > 0,
    meta: { suppressGlobalErrorToast: true },
  })
}

export function useCreateProjet(idProgramme: number | undefined) {
  const queryClient = useQueryClient()

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
    },
  })
}

export function useUpdateProjet(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectCreateData) => {
      return projetService.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projetQueryKeys.all })
    },
  })
}

export function useDeleteProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => projetService.delete(id),
    onSuccess: () => {
      toast.success('Projet supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: projetQueryKeys.all })
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du projet ')
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
