export interface SourFinancementProjet extends Record<string, unknown> {
  id_source_financement: number;
  code_activite_projet: string;
  intitule_source_financement: string;
  Numero_reference_sf: string;
  montant_source_financement: string;
  date_signature_convention: string;
  code_partenaire: string;
  etat_source_financement: number;
}