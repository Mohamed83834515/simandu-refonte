import { SourceVerification } from "./sourceVerification";

export interface SuiviDecaissementPtba extends Record<string, unknown> {
  id_suivi_dec: number
  sources: SourceVerification[]
  periode_suivi_dec: string
  montant_decaisse: number
  taux_dollars_jour: number
  date_suivi_dec: string
  observation: string
  date_enregistrement: string
  date_modification: string
  activite_ptba: number | null
  programme: string | null
}
