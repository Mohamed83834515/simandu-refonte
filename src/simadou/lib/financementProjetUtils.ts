import type { Acteur } from '@/simadou/allTypes/acteur'
import type {
  FinancementProjet,
  TypeFinancement,
} from '@/simadou/allTypes/financementProjet'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export const TYPE_FINANCEMENT_OPTIONS: {
  value: TypeFinancement
  label: string
}[] = [
  { value: 'pret', label: 'Prêt' },
  { value: 'don', label: 'Don' },
  { value: 'contrepartie', label: 'Contrepartie' },
]

export function formatTypeFinancementLabel(
  value: TypeFinancement | string | undefined
): string {
  if (!value) return '—'
  return (
    TYPE_FINANCEMENT_OPTIONS.find((opt) => opt.value === value)?.label ?? value
  )
}

export function resolveFinancementProjetId(
  value: FinancementProjet['projet']
): number | undefined {
  const id =
    resolveRelationId(value, 'id_projet') ?? resolveRelationId(value, 'id')
  return id ?? undefined
}

export function filterFinancementsByProjet(
  items: FinancementProjet[],
  idProjet: number
): FinancementProjet[] {
  return items.filter(
    (item) => resolveFinancementProjetId(item.projet) === idProjet
  )
}

export function buildBailleurOptionsFromSignataires(
  signataires: Acteur[] | undefined
): { value: number; label: string }[] {
  return (signataires ?? []).map((acteur) => ({
    value: acteur.id_acteur,
    label:
      acteur.description_acteur?.trim() ||
      acteur.nom_acteur?.trim() ||
      acteur.code_acteur,
  }))
}

export function resolveBailleurLabel(
  value: FinancementProjet['bailleur'],
  signatairesById?: Map<number, Acteur>
): string {
  const embedded =
    typeof value === 'object' && value !== null
      ? value.description_acteur?.trim() ||
        value.nom_acteur?.trim() ||
        value.code_acteur
      : null
  if (embedded) return embedded

  const id = resolveRelationId(value, 'id_acteur')
  if (id != null && signatairesById?.has(id)) {
    const acteur = signatairesById.get(id)!
    return (
      acteur.description_acteur?.trim() ||
      acteur.nom_acteur?.trim() ||
      acteur.code_acteur ||
      String(id)
    )
  }
  return id != null ? String(id) : '—'
}
