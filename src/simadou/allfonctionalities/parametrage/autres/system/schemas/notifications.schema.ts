import { z } from 'zod'

export const notificationsSchema = z.object({
  whatsappInstanceCode:      z.string().nullable().optional(),
  whatsappNumberId:          z.string().nullable().optional(),
  notificationEmail:         z.string().email('Email invalide').nullable().optional(),
  notificationEmailPassword: z.string().nullable().optional(),
  smtpHost:                  z.string().nullable().optional(),
  smtpPort:                  z.coerce.number().int().min(0).optional(),
  smtpEncryption:            z.string().nullable().optional(),
  smtpFromName:              z.string().nullable().optional(),
})

export type NotificationsInput = z.infer<typeof notificationsSchema>