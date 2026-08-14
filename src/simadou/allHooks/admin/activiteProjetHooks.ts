import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ActiviteProjet, NiveauActiviteProjet } from '@/simadou/allTypes'
import type {
  ActiviteProjetFormData,
  NiveauActiviteProjetFormData,
} from '@/simadou/schemas/activiteProjetSchemas'
import activiteProjetService from '@/simadou/allSercices/activiteProjetService'
import niveauActiviteProjetService from '@/simadou/allSercices/niveauActiviteProjetService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const activiteProjetQueryKeys = {
  all: ['activites-projet'] as const,
  byProjet: (codeProjet: string | undefined) =>
    [...activiteProjetQueryKeys.all, 'by-projet', codeProjet] as const,
}

export const niveauActiviteProjetQueryKeys = {
  all: ['niveaux-activite-projet'] as const,
  byProjet: (codeProjet: string | undefined) =>
    [...niveauActiviteProjetQueryKeys.all, 'by-projet', codeProjet] as const,
}

/** Niveaux d'activité : globaux ou rattachés au projet selon la réponse API. */
export function useGetNiveauxActiviteProjet(codeProjet: string) {
  return useQuery({
    queryKey: niveauActiviteProjetQueryKeys.byProjet(codeProjet),
    queryFn: async () => {
      const byProjet = await niveauActiviteProjetService.getByProjet(codeProjet)
      return byProjet
    },
    enabled: !!codeProjet,
  })
}

function matchesCodeProjet(
  value: ActiviteProjet['code_projet'],
  codeProjet: string
): boolean {
  if (value == null || value === '') return false
  if (typeof value === 'string') return value === codeProjet
  if (typeof value === 'object' && 'code_projet' in value) {
    return String((value as { code_projet?: string }).code_projet) === codeProjet
  }
  return false
}

export function useCreateNiveauActiviteProjet(codeProjet: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NiveauActiviteProjetFormData) => {
      const payload: Partial<NiveauActiviteProjet> = {
        ...data,
        code_projet: codeProjet ?? data.code_projet ?? null,
      }
      return niveauActiviteProjetService.create(payload)
    },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, niveauActiviteProjetQueryKeys.all)
    },
  })
}

export function useUpdateNiveauActiviteProjet(codeProjet: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NiveauActiviteProjetFormData }) =>
      niveauActiviteProjetService.update(id, {
        ...data,
        code_projet: codeProjet ?? data.code_projet ?? null,
      }),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, niveauActiviteProjetQueryKeys.all)
    },
  })
}

export function useDeleteNiveauActiviteProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => niveauActiviteProjetService.delete(id),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, niveauActiviteProjetQueryKeys.all)
    },
  })
}

export function useGetActivitesProjet(codeProjet: string | undefined) {
  return useQuery({
    queryKey: activiteProjetQueryKeys.byProjet(codeProjet),
    queryFn: async () => {
      if (!codeProjet) return []
      try {
        const scoped = await activiteProjetService.getByProjet(codeProjet)
        if (scoped.length > 0) return scoped
      } catch {
        // fallback client-side
      }
      const all = await activiteProjetService.getAll()
      return all.filter((a) => matchesCodeProjet(a.code_projet, codeProjet))
    },
    enabled: !!codeProjet,
  })
}
export function useGetActivitesProjetLastNiveau(codeProjet: string | undefined) {
  return useQuery({
    queryKey: activiteProjetQueryKeys.byProjet(codeProjet),
    queryFn: async () => {
      if (!codeProjet) return []
      try {
        const scoped = await activiteProjetService.getLAstNiveauByProjet(codeProjet)
        if (scoped.length > 0) return scoped
      } catch {
        // fallback client-side
      }
      const all = await activiteProjetService.getAll()
      return all.filter((a) => matchesCodeProjet(a.code_projet, codeProjet))
    },
    enabled: !!codeProjet,
  })
}

export function useGetAllActivitesProjet() {
  return useQuery({
    queryKey: [...activiteProjetQueryKeys.all, 'unfiltered'] as const,
    queryFn: () => activiteProjetService.getAll(),
  })
}

export function useCreateActiviteProjet(codeProjet: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ActiviteProjetFormData) =>
      activiteProjetService.create({
        ...data,
        code_projet: data.code_projet ?? codeProjet ?? null,
      }),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, activiteProjetQueryKeys.all)
    },
  })
}

export function useUpdateActiviteProjet(codeProjet: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActiviteProjetFormData }) =>
      activiteProjetService.update(id, {
        ...data,
        code_projet: data.code_projet ?? codeProjet ?? null,
      }),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, activiteProjetQueryKeys.all)
    },
  })
}

export function useDeleteActiviteProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => activiteProjetService.delete(id),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, activiteProjetQueryKeys.all)
    },
  })
}

