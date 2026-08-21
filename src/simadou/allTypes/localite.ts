import { NiveauLocalite } from "./niveauLocalite";

export interface Localite extends Record<string, unknown> {
  id_loca: number;
  code_loca: string;
  intitule_loca: string;
  code_national_loca: string;
  shape_file?: string;
  longitude_loca?: number;
  latitude_loca?: number;
  parent_loca: number | null;
  niveau_loca: NiveauLocalite | number;
}
