import { z } from 'zod'
import { getFieldSchema } from '@/simadou/schemas/generalParams.schema'

export const notificationsSchema = z.object({
  whatsappInstanceCode:      getFieldSchema('text'),
  notificationEmail:         getFieldSchema('email'),
  notificationEmailPassword: getFieldSchema('text'),
  smtpHost:                  getFieldSchema('text'),
})

export type NotificationsInput = z.infer<typeof notificationsSchema>