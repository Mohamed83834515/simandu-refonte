import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  IndicateurPerformanceFormData
} from '@/simadou/schemas/indicateurPerformanceProjetSchemas'
import indicateurPerformanceProjetService from '@/simadou/allSercices/indicateurPerformanceProjetService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import { useGetActivitesProjet } from './activiteProjetHooks'
import { useMemo } from 'react'
import type { IndicateurPerformanceProjet, CibleIndicateurPerformanceProjet, Projet } from '@/simadou/allTypes'

export const indicateurPerformanceProjetQueryKeys = {
  all: ['indicateurs-performance-projet'] as const,
  byProjet: (codeProjet: string | undefined) =>
    [...indicateurPerformanceProjetQueryKeys.all, 'by-projet', codeProjet] as const,
  byActivite: (codeActivite: number | undefined) =>
    [...indicateurPerformanceProjetQueryKeys.all, 'by-activite', codeActivite] as const,
}

export function useGetAllIndicateursPerformanceProjet() {
  return useQuery({
    queryKey: [...indicateurPerformanceProjetQueryKeys.all, 'unfiltered'] as const,
    queryFn: () => indicateurPerformanceProjetService.getAll(),
  })
}


export function useIndicateursPerformanceByProjet(
  projet: Projet | undefined
) {
  // Récupérer toutes les activités du projet
  const { data: activites = [], isLoading: isLoadingActivites } = useGetActivitesProjet(
    projet?.code_projet
  )

  // Récupérer tous les indicateurs
  const { data: allIndicateurs = [], isLoading: isLoadingIndicateurs } = useGetAllIndicateursPerformanceProjet()

  // Filtrer les indicateurs par les activités du projet
  const indicateurs = useMemo(() => {
    if (!projet?.id_projet || activites.length === 0 || allIndicateurs.length === 0) {
      return []
    }

    // Récupérer tous les IDs d'activités du projet
    const idsActivites = activites.map(a => a.id_activite_projet)

    // Récupérer tous les codes d'activités du projet
    const codesActivites = activites.map(a => a.code_activite_projet)

    // Filtrer les indicateurs qui appartiennent aux activités du projet
    return allIndicateurs.filter((indicateur: IndicateurPerformanceProjet) => {
      // Vérifier si l'indicateur a une activité_projet
      if (!indicateur.activite_projet) return false

      // Extraire l'id_activite_projet correctement
      let idActivite: number | undefined
      let codeActivite: string | undefined

      if (typeof indicateur.activite_projet === 'object' && indicateur.activite_projet !== null) {
        idActivite = (indicateur.activite_projet as any).id_activite_projet
        codeActivite = (indicateur.activite_projet as any).code_activite_projet
      }

      // Vérifier si l'indicateur appartient au projet (par ID ou par code)
      const belongsToProject = idActivite ? idsActivites.includes(idActivite) : false
      const belongsByCode = codeActivite ? codesActivites.includes(codeActivite) : false

      return belongsToProject || belongsByCode
    })
  }, [activites, allIndicateurs, projet?.id_projet])

  // Calculer les cibles pour chaque indicateur
  const indicateursAvecCibles = useMemo(() => {
    return indicateurs.map((indicateur: IndicateurPerformanceProjet) => {
      // Récupérer les cibles
      let cibles: CibleIndicateurPerformanceProjet[] = []

      if (indicateur.cibles) {
        if (Array.isArray(indicateur.cibles)) {
          cibles = indicateur.cibles
        } else if (typeof indicateur.cibles === 'object') {
          cibles = [indicateur.cibles]
        }
      }

      // Trier les cibles par année (la plus récente en premier)
      const ciblesTriees = [...cibles].sort((a, b) => b.annee - a.annee)

      // Prendre la cible la plus récente
      const cible = ciblesTriees.length > 0 ? ciblesTriees[0] : null

      // Valeur actuelle (à remplacer par vos données de suivi réelles)
      const valeurActuelle = 0

      return {
        ...indicateur,
        valeurCible: Number(cible?.valeur_cible_indcateur_performance) || 0,
        anneeCible: cible?.annee || new Date().getFullYear(),
        valeurActuelle,
        hasCible: !!cible && Number(cible?.valeur_cible_indcateur_performance) > 0,
        cibles: ciblesTriees,
        totalCibles: ciblesTriees.length,
      }
    })
  }, [indicateurs])

  return {
    indicateurs: indicateursAvecCibles,
    isLoading: isLoadingActivites || isLoadingIndicateurs,
    total: indicateursAvecCibles.length,
  }
}

export function useGetIndicateursPerformanceProjet(codeProjet: string | undefined) {
  return useQuery({
    queryKey: indicateurPerformanceProjetQueryKeys.byProjet(codeProjet),
    queryFn: async () => {
      const all = await indicateurPerformanceProjetService.getAll()
      return all.filter((i: IndicateurPerformanceProjet) => {
        const cp = i.code_projet
        if (typeof cp === 'string') return cp === codeProjet
        if (cp && typeof cp === 'object' && 'code_projet' in cp) return (cp as any).code_projet === codeProjet
        return false
      })
    },
    enabled: !!codeProjet,
  })
}

export function useCreateIndicateurPerformanceProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IndicateurPerformanceFormData) =>
      indicateurPerformanceProjetService.create(data),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurPerformanceProjetQueryKeys.all)
    },
  })
}

export function useGetIndicateurPerformanceByActiviteProjet(idActivite: number) {
  return useQuery({
    queryKey: indicateurPerformanceProjetQueryKeys.byActivite(idActivite),
    queryFn: async () => {
      const response = await indicateurPerformanceProjetService.getByActiviteProjet(idActivite)
      return response
    },
    enabled: !!idActivite,
  })
}

export function useUpdateIndicateurPerformanceProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: IndicateurPerformanceFormData
    }) =>
      indicateurPerformanceProjetService.update(id, data),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurPerformanceProjetQueryKeys.all)
    },
  })
}

export function useDeleteIndicateurPerformanceProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => indicateurPerformanceProjetService.delete(id),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurPerformanceProjetQueryKeys.all)
    },
  })
}