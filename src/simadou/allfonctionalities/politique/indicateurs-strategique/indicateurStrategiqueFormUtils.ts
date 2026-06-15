import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import type { IndicateurStrategiqueWriteData } from '@/simadou/schemas/indicateurStrategiqueSchemas'
import {
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'

export function indicateurStrategiqueToFormValues({
  indicateur,
  codeProgramme,
  niveauCodeNumber,
}: {
  indicateur?: IndicateurStrategique | null
  codeProgramme: string
  niveauCodeNumber: number
}): IndicateurStrategiqueWriteData {
  const codeIstrRaw = indicateur?.code_istr
  const codeIstr =
    resolveRelationId(codeIstrRaw as unknown, 'id_cs')?.toString() ??
    (codeIstrRaw != null && codeIstrRaw !== '' ? String(codeIstrRaw) : '')

  const responsableRaw = indicateur?.responsable_istr
  const responsable =
    resolveRelationId(responsableRaw as unknown, 'id_personnel_perso')?.toString() ??
    (responsableRaw != null && responsableRaw !== ''
      ? String(responsableRaw)
      : '')

  const structure =
    resolveRelationCode(indicateur?.structure_istr as unknown, 'code_acteur') ??
    (typeof indicateur?.structure_istr === 'string'
      ? indicateur.structure_istr
      : null)

  return {
    code_indicateur_istr: indicateur?.code_indicateur_istr ?? '',
    intitule_indicateur_istr: indicateur?.intitule_indicateur_istr ?? '',
    code_istr: codeIstr,
    periodicite_iop: indicateur?.periodicite_iop ?? '',
    source_istr: indicateur?.source_istr ?? '',
    responsable_istr: responsable || '',
    description_istr: indicateur?.description_istr ?? '',
    structure_istr: structure,
    niveau_istr:
      Number(indicateur?.niveau_istr) || niveauCodeNumber,
    programme_istr: codeProgramme,
  }
}

export function buildIndicateurStrategiquePayload({
  data,
  codeProgramme,
  niveauCodeNumber,
}: {
  data: IndicateurStrategiqueWriteData
  codeProgramme: string
  niveauCodeNumber: number
}): Omit<IndicateurStrategique, 'id_indicateur_str'> {
  return {
    code_indicateur_istr: data.code_indicateur_istr,
    intitule_indicateur_istr: data.intitule_indicateur_istr,
    code_istr: String(data.code_istr),
    niveau_istr: niveauCodeNumber,
    programme_istr: codeProgramme,
    responsable_istr: String(data.responsable_istr),
    description_istr: data.description_istr,
    periodicite_iop: data.periodicite_iop ?? '',
    source_istr: data.source_istr ?? '',
    structure_istr: data.structure_istr?.trim() ? data.structure_istr : null,
  }
}

export function resolveIndicateurStrategiqueCode(
  value: IndicateurStrategique['code_indicateur_istr'] | unknown
): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'code_indicateur_istr' in value) {
    return String(
      (value as { code_indicateur_istr: string }).code_indicateur_istr
    )
  }
  return ''
}
