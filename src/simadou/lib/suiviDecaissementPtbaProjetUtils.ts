import type { FinancementProjet } from '@/simadou/allTypes/financementProjet'
import type { Localite } from '@/simadou/allTypes/localite'
import type { SuiviDecaissementPtbaProjet } from '@/simadou/allTypes/suiviDecaissementPtbaProjet'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export type SelectOption = { value: number; label: string }

export function buildSuiviDecaissementRegionOptions(
  zones: Localite[] | undefined | null
): SelectOption[] {
  return (zones ?? [])
    .filter((zone) => zone.id_loca != null)
    .slice()
    .sort((a, b) =>
      (a.intitule_loca ?? '').localeCompare(b.intitule_loca ?? '', 'fr')
    )
    .map((zone) => ({
      value: zone.id_loca,
      label: zone.intitule_loca?.trim() || zone.code_loca?.trim() || 'Zone',
    }))
}

export function buildSuiviDecaissementTypePartOptions(
  financements: FinancementProjet[]
): SelectOption[] {
  return financements
    .filter((f) => f.id_part != null)
    .slice()
    .sort((a, b) =>
      (a.intitule ?? '').localeCompare(b.intitule ?? '', 'fr')
    )
    .map((financement) => ({
      value: financement.id_part,
      label:
        financement.intitule?.trim() ||
        financement.code_type?.trim() ||
        'Financement',
    }))
}

export function resolveSuiviDecaissementRegionId(
  suivi: SuiviDecaissementPtbaProjet | null | undefined
): number | null {
  if (!suivi) return null
  if (typeof suivi.region === 'number') return suivi.region
  return resolveRelationId(suivi.region, 'id_loca')
}

export function resolveSuiviDecaissementTypePartId(
  suivi: SuiviDecaissementPtbaProjet | null | undefined
): number | null {
  if (!suivi) return null
  if (typeof suivi.type_part === 'number') return suivi.type_part
  return (
    resolveRelationId(suivi.type_part, 'id_part') ??
    resolveRelationId(suivi.type_part, 'id')
  )
}

export function resolveSuiviDecaissementRegionLabel(
  suivi: SuiviDecaissementPtbaProjet,
  regionLabelById?: Map<number, string>
): string {
  const region = suivi.region
  if (typeof region === 'object' && region !== null) {
    const loc = region as Localite
    return loc.intitule_loca?.trim() || loc.code_loca?.trim() || '—'
  }
  const id = resolveSuiviDecaissementRegionId(suivi)
  if (id != null && regionLabelById?.has(id)) {
    return regionLabelById.get(id)!
  }
  return id != null ? String(id) : '—'
}

export function resolveSuiviDecaissementTypePartLabel(
  suivi: SuiviDecaissementPtbaProjet,
  financementLabelById?: Map<number, string>
): string {
  const typePart = suivi.type_part
  if (typeof typePart === 'object' && typePart !== null) {
    const financement = typePart as FinancementProjet
    return (
      financement.intitule?.trim() ||
      financement.code_type?.trim() ||
      '—'
    )
  }
  const id = resolveSuiviDecaissementTypePartId(suivi)
  if (id != null && financementLabelById?.has(id)) {
    return financementLabelById.get(id)!
  }
  return id != null ? String(id) : '—'
}

export function toRegionLabelMap(options: SelectOption[]): Map<number, string> {
  return new Map(options.map((opt) => [opt.value, opt.label]))
}

export function toTypePartLabelMap(options: SelectOption[]): Map<number, string> {
  return new Map(options.map((opt) => [opt.value, opt.label]))
}
