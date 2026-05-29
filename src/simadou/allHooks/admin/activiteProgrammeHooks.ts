import { useQuery } from '@tanstack/react-query'
import { useActiveProgrammeId } from '@/hooks/use-active-programme'
import activiteProgrammeService from '@/simadou/allSercices/activiteProgrammeService'

export const activiteProgrammeQueryKeys = {
  all: ['activites-programme'] as const,
  byProgramme: (idProgramme: number | undefined) =>
    [...activiteProgrammeQueryKeys.all, idProgramme] as const,
}

export function useGetActivitesProgramme(idProgramme?: number) {
  const activeProgrammeId = useActiveProgrammeId()
  const programmeId = idProgramme ?? activeProgrammeId

  return useQuery({
    queryKey: activiteProgrammeQueryKeys.byProgramme(programmeId),
    queryFn: () => activiteProgrammeService.getAll(programmeId),
    enabled: !!programmeId,
  })
}
