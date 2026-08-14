import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type {
  MissionSupervisionProjet,
  MissionSupervisionProjetApiPayload,
} from '@/simadou/allTypes/missionSupervisionProjet'
import {
  filterMissionsByProjet,
  formatMissionLabel,
} from '@/simadou/lib/missionRecommandationUtils'
import missionSupervisionProjetService from '@/simadou/allSercices/missionSupervisionProjetService'

export const missionSupervisionProjetQueryKeys = {
  all: ['missions-supervision-projets'] as const,
  byProjet: (idProjet: number) =>
    ['missions-supervision-projets', idProjet] as const,
}

export const useGetMissionsSupervisionProjet = (idProjet?: number) =>
  useQuery({
    queryKey: missionSupervisionProjetQueryKeys.byProjet(idProjet ?? 0),
    queryFn: () => missionSupervisionProjetService.getByProjet(idProjet!),
    enabled: idProjet != null && idProjet > 0,
  })

export const useCreateMissionSupervisionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      data,
      file,
    }: {
      data: MissionSupervisionProjetApiPayload
      file?: File
    }) => missionSupervisionProjetService.create(data, file),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Mission de supervision ajoutée avec succès')
      queryClient.invalidateQueries({
        queryKey: missionSupervisionProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({
        queryKey: missionSupervisionProjetQueryKeys.all,
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'ajout de la mission")
      )
    },
  })
}

export const useUpdateMissionSupervisionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      file,
    }: {
      id: number
      data: Partial<MissionSupervisionProjetApiPayload>
      file?: File
    }) => missionSupervisionProjetService.update(id, data, file),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Mission de supervision modifiée avec succès')
      queryClient.invalidateQueries({
        queryKey: missionSupervisionProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({
        queryKey: missionSupervisionProjetQueryKeys.all,
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la modification de la mission')
      )
    },
  })
}

export const useDeleteMissionSupervisionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => missionSupervisionProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Mission de supervision supprimée avec succès')
      queryClient.invalidateQueries({
        queryKey: missionSupervisionProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({
        queryKey: missionSupervisionProjetQueryKeys.all,
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression de la mission')
      )
    },
  })
}

function missionStorageKey(idProjet: number) {
  return `selectedMissionSupervisionId:${idProjet}`
}

export function useMissionSupervisionSelection(idProjet: number) {
  const { data: missions = [] } = useGetMissionsSupervisionProjet(idProjet)
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null
  )

  const missionsForProjet = useMemo(
    () => filterMissionsByProjet(missions, idProjet),
    [missions, idProjet]
  )

  const missionOptions = useMemo(
    () =>
      missionsForProjet.map((mission: MissionSupervisionProjet) => ({
        label: formatMissionLabel(mission),
        value: mission.id_mission.toString(),
      })),
    [missionsForProjet]
  )

  useEffect(() => {
    if (missionsForProjet.length === 0) {
      setSelectedMissionId(null)
      return
    }

    const stored = localStorage.getItem(missionStorageKey(idProjet))
    if (
      stored &&
      missionsForProjet.some((m) => m.id_mission.toString() === stored)
    ) {
      setSelectedMissionId(stored)
      return
    }

    const preferred = [...missionsForProjet].sort(
      (a, b) => new Date(b.debut).getTime() - new Date(a.debut).getTime()
    )[0]
    const preferredId = preferred.id_mission.toString()
    setSelectedMissionId(preferredId)
    localStorage.setItem(missionStorageKey(idProjet), preferredId)
  }, [missionsForProjet, idProjet])

  const handleChangeMission = (missionId: string | null) => {
    setSelectedMissionId(missionId)
    if (missionId) {
      localStorage.setItem(missionStorageKey(idProjet), missionId)
    } else {
      localStorage.removeItem(missionStorageKey(idProjet))
    }
  }

  return {
    selectedMissionId,
    handleChangeMission,
    missionOptions,
    missionsForProjet,
  }
}
