import type { Personnel } from '@/simadou/allTypes'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import type { PersonnelWriteData } from '@/simadou/schemas/personnelWriteSchema'

export function personnelToFormValues(
  personnel?: Personnel | null
): PersonnelWriteData {
  if (!personnel) {
    return {
      nom_perso: '',
      prenom_perso: '',
      id_personnel_perso: '',
      email: '',
      titre_personnel: 0,
      contact_perso: '',
      structure_perso: 0,
      fonction_perso: 0,
      service_perso: undefined,
      region_perso: 0,
      niveau_perso: 1,
    }
  }
  return {
    nom_perso: personnel.nom_perso ?? '',
    prenom_perso: personnel.prenom_perso ?? '',
    id_personnel_perso: personnel.id_personnel_perso ?? '',
    email: personnel.email ?? '',
    titre_personnel:
      resolveRelationId(personnel.titre_personnel, 'id_titre') ?? 0,
    contact_perso: personnel.contact_perso ?? '',
    structure_perso:
      resolveRelationId(personnel.structure_perso, 'id_acteur') ?? 0,
    fonction_perso:
      resolveRelationId(personnel.fonction_perso, 'id_fonction') ?? 0,
    service_perso:
      resolveRelationId(personnel.service_perso, 'id_ds') ?? undefined,
    region_perso: resolveRelationId(personnel.region_perso, 'id_loca') ?? 0,
    niveau_perso: personnel.niveau_perso ?? 1,
  }
}

export function formatPersonnelNom(personnel: Personnel): string {
  const parts = [personnel.prenom_perso, personnel.nom_perso].filter(Boolean)
  return parts.join(' ') || personnel.id_personnel_perso || '—'
}

export function formatNiveauAcces(niveau?: number): string {
  if (niveau === 1) return 'Éditeur'
  if (niveau === 2) return 'Visiteur'
  if (niveau === 3) return 'Point focal Projet'
  return '—'
}

export function formatStatutPersonnel(statut?: number): string {
  return statut === 1 ? 'Actif' : 'Inactif'
}

export function isPersonnelActif(statut?: number): boolean {
  return statut === 1
}
