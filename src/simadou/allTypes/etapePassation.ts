import type { SourceVerificationEtapePassation } from './sourceVerificationEtapePassation'

export type EtapePassation = {
    id_etape: number
    etape: string
    date_prevu: string | null
    date_realise: string | null
    groupe_etape:
    | number
    | { id_groupe_etape: number;[key: string]: unknown }
    | null
    ppm: number | { id_ppm: number;[key: string]: unknown }
    sources_verification?: SourceVerificationEtapePassation[]
}