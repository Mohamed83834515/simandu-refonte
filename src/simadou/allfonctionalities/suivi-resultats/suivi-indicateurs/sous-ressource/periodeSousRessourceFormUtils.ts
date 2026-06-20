import type {
  DocumentationCmrEnregistrement,
  DocumentationCmrFormData,
  DocumentationCmrWritePayload,
  FondCarteWritePayload,
  SimpleSousRessourceFormData,
  TableauSyntheseWritePayload,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'

export function emptySimpleSousRessourceFormValues(): SimpleSousRessourceFormData {
  return { source_donnees: '', date_validation: '', observation: '' }
}

export function emptyDocumentationCmrFormValues(): DocumentationCmrFormData {
  return {
    source_donnees: '',
    titre: '',
    date_validation: '',
    document: '',
    observation: '',
  }
}

export function simpleSousRessourceToFormValues(
  row?: { source_donnees?: string; date_validation?: string; observation?: string } | null
): SimpleSousRessourceFormData {
  return {
    source_donnees: row?.source_donnees ?? '',
    date_validation: row?.date_validation ?? '',
    observation: row?.observation ?? '',
  }
}

export function documentationCmrToFormValues(
  row?: DocumentationCmrEnregistrement | null
): DocumentationCmrFormData {
  return {
    source_donnees: row?.source_donnees ?? '',
    titre: row?.titre ?? '',
    date_validation: row?.date_validation ?? '',
    document: row?.document ?? '',
    observation: row?.observation ?? '',
  }
}

function buildBaseWritePayload({
  parentPeriodeId,
  personnelId,
  isEdit,
}: {
  parentPeriodeId: number
  personnelId: number
  isEdit: boolean
}) {
  return {
    etat: isEdit ? 'Modifier' : 'Ajouter',
    periode: parentPeriodeId,
    id_personnel: personnelId,
    modifier_par: personnelId,
  }
}

export function buildSimpleSousRessourceWritePayload({
  form,
  parentPeriodeId,
  personnelId,
  isEdit,
}: {
  form: SimpleSousRessourceFormData
  parentPeriodeId: number
  personnelId: number
  isEdit: boolean
}): TableauSyntheseWritePayload | FondCarteWritePayload {
  return {
    ...buildBaseWritePayload({ parentPeriodeId, personnelId, isEdit }),
    source_donnees: form.source_donnees,
    date_validation: form.date_validation,
    observation: form.observation,
  }
}

export function buildDocumentationCmrWritePayload({
  form,
  parentPeriodeId,
  personnelId,
  isEdit,
}: {
  form: DocumentationCmrFormData
  parentPeriodeId: number
  personnelId: number
  isEdit: boolean
}): DocumentationCmrWritePayload {
  return {
    ...buildBaseWritePayload({ parentPeriodeId, personnelId, isEdit }),
    source_donnees: form.source_donnees,
    titre: form.titre,
    date_validation: form.date_validation,
    document: form.document,
    observation: form.observation,
  }
}
