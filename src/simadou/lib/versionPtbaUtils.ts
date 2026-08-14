import type { VersionPtba } from '@/simadou/allTypes'

export function getAnneesDisponiblesFromVersions(
  versions: VersionPtba[]
): number[] {
  if (versions.length === 0) return []
  return [...new Set(versions.map((v) => v.annee_ptba))].sort((a, b) => b - a)
}

/** Pour chaque année PAO, retient la version avec la date_validation la plus récente. */
export function buildLatestVersionByAnneeMap(
  versions: VersionPtba[]
): Map<number, VersionPtba> {
  const map = new Map<number, VersionPtba>()

  for (const version of versions) {
    const annee = version.annee_ptba
    const dateValidation = version.date_validation
      ? new Date(version.date_validation).getTime()
      : 0

    const existing = map.get(annee)
    if (!existing) {
      map.set(annee, version)
      continue
    }

    const existingDate = existing.date_validation
      ? new Date(existing.date_validation).getTime()
      : 0

    if (dateValidation > existingDate) {
      map.set(annee, version)
    }
  }

  return map
}

export function getLatestVersionForAnnee(
  versions: VersionPtba[],
  annee: number
): VersionPtba | null {
  return buildLatestVersionByAnneeMap(versions).get(annee) ?? null
}
