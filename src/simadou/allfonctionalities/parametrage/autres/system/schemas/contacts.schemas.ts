import { z } from 'zod'

export const contactsSchema = z.object({
  structureEmail:    z.string().email('Email invalide').nullable().optional(),
  structurePhone:    z.string().nullable().optional(),
  structureWhatsapp: z.string().nullable().optional(),
})

export type ContactsInput = z.infer<typeof contactsSchema>