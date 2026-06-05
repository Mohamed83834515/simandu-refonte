import { z } from 'zod'
import { getFieldSchema } from '@/simadou/schemas/generalParams.schema'

export const contactsSchema = z.object({
  contactEmail:      getFieldSchema('email'),
  contactPhone:      getFieldSchema('tel'),
  address:           getFieldSchema('text'),
  website:           getFieldSchema('url'),
  structureEmail:    getFieldSchema('email'),
  structurePhone:    getFieldSchema('tel'),
  structureWhatsapp: getFieldSchema('tel'),
})

export type ContactsInput = z.infer<typeof contactsSchema>