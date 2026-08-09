import { useMe } from '@/simadou/allHooks/auth/authHooks'

/** Libellé « générée par … » pour le rapport d’or / fiches de synthèse. */
export function useFicheGeneratedBy(): string | undefined {
  const { data: user } = useMe()
  if (!user) return undefined
  const name = [user.prenom_perso, user.nom_perso].filter(Boolean).join(' ').trim()
  const role =
    user.fonction_perso?.nom_fonction?.trim() ||
    user.fonction_perso?.description_fonction?.trim()
  if (!name) return undefined
  return role ? `${name} — ${role}` : name
}
