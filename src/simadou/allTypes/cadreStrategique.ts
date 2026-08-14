import { type Acteur } from "./acteur";
import { type Programme } from "./programme";

export interface CadreStrategique extends Record<string, unknown> {
  id_cs: number;
  code_cs: string;
  intutile_cs: string;
  abgrege_cs: string;
  niveau_cs: number | string;
  date_enregistrement: string;
  date_modification: string;
  etat?: number;
  partenaire_cs?: number[] | Acteur[] | number | Acteur | null;
  parent_cs?: CadreStrategique | number | null;
  programme_cs?: Programme | null;
  created_at?: string;
  updated_at?: string;
}

export type CadreStrategiqueFormData = Omit<CadreStrategique, "id_cs">;
