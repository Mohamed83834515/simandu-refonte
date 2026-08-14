const RAPPORT_PTBA_COLUMN_MAP: Record<string, string> = {
  code_activite_ptba: 'code',
  intitule_activite_ptba: 'activite',
  taches_count: 'taches',
  indicateurs_count: 'indicateurs',
  responsable_ptba: 'responsable',
  cout_row: 'cout',
}

const RAPPORT_ETAT_COLUMN_MAP: Record<string, string> = {
  code_activite_ptba: 'code',
  intitule_activite_ptba: 'activite',
  statut: 'statut',
  difficultes: 'difficultes',
  delai_realisation: 'delai',
  retard_accuse: 'retard',
}

const RAPPORT_DECAISSEMENT_COLUMN_MAP: Record<string, string> = {
  code_activite_ptba: 'code',
  intitule_activite_ptba: 'activite',
  montant_activite: 'montant',
  decaissement: 'decaissement',
  taux_decaissement: 'taux',
}

export function mapTableColumnsToExportIds(
  tableColumnIds: string[],
  map: Record<string, string>
): string[] {
  return tableColumnIds
    .map((columnId) => map[columnId])
    .filter((columnId): columnId is string => Boolean(columnId))
}

export {
  RAPPORT_PTBA_COLUMN_MAP,
  RAPPORT_ETAT_COLUMN_MAP,
  RAPPORT_DECAISSEMENT_COLUMN_MAP,
}
