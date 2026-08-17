import { z } from 'zod'

export const etapePassationSchema = z.object({
    etape: z.string().min(1, "L'intitulé de l'étape est requis"),
    groupe_etape: z.string().optional().nullable(),
    date_prevu: z.string().optional().nullable(),
})

export type EtapePassationFormData = z.infer<typeof etapePassationSchema>