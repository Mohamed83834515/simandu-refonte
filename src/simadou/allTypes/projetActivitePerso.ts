export interface ProjetActivePerso {
  id_projet: number;
  code_projet: string;
  sigle_projet: string;
  intitule_projet: string;
  duree_projet: number;
  date_signature_projet: string;
  date_demarrage_projet: string;
  partenaire_projet: number;
  programme_projet: number;
  structure_projet: number;
  signataires_projet: number[];
  partenaires_execution_projet: number[];
  zone_projet: number[];
}
