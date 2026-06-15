import { FieldType } from '@/Global/types/formConfig'
import { z } from 'zod'

export const GeneralParamsAPISchema = z.object({
  id:                          z.number().int(),
  is_default:                  z.boolean(),
  system_sigle:                z.string(),
  system_name:                 z.string(),
  structure_sigle:             z.string(),
  structure_name:              z.string(),
  structure_logo:              z.string().nullable(),
  structure_address:           z.string(),
  structure_email:             z.string().email().nullable(),
  structure_whatsapp_number:   z.string().nullable(),
  structure_phone_number:      z.string().nullable(),
  local_currency_sigle:        z.string(),
  main_currency_sigle:         z.string(),
  main_currency_rate:          z.string(),
  is_maintenance:              z.boolean(),
  inactivity_minute:           z.number().int().min(0),
  max_sessions:                z.number().int().min(0),
  max_login_attempts:          z.number().int().min(0),
  otp_validity_minute:         z.number().int().min(0),
  password_expiry_month:       z.number().int().min(0),
  delay_update_second:         z.number().int().min(0),
  whatsapp_instance:           z.string().nullable(),
  whatsapp_number_id:          z.string().nullable(),
  notif_email:                 z.string().email().nullable(),
  notif_email_smtp_host:       z.string().nullable(),
  notif_email_smtp_port:       z.number().int(),
  notif_email_smtp_encryption: z.string().nullable(),
  notif_email_from_name:       z.string().nullable(),
  parent_api_url:              z.string().nullable(),
  parent_api_key:              z.string().nullable(),
  parent_api_timeout_seconds:  z.number().int(),
  created_at:                  z.string(),
  updated_at:                  z.string(),
})

// Transform to camelCase for frontend consumption
export const GeneralParamsSchema = GeneralParamsAPISchema.transform(d => ({
  id:                         d.id,
  systemSigle:                d.system_sigle,
  systemTitle:                d.system_name,
  structureSigle:             d.structure_sigle,
  structureName:              d.structure_name,
  structureLogo:              d.structure_logo,
  structureAddress:           d.structure_address,
  structureEmail:             d.structure_email,
  structurePhone:             d.structure_phone_number,
  structureWhatsapp:          d.structure_whatsapp_number,
  currencyCode:               d.local_currency_sigle,
  baseCurrency:               d.main_currency_sigle,
  exchangeRate:               Number(d.main_currency_rate),
  maintenanceMode:            d.is_maintenance,
  inactivityDelayMinutes:     d.inactivity_minute,
  maxSessions:                d.max_sessions,
  loginAttemptsLimit:         d.max_login_attempts,
  tpCodeDelayMinutes:         d.otp_validity_minute,
  passwordChangeDelayMonths:  d.password_expiry_month,
  deleteOrUpdateDelaySeconds: d.delay_update_second,
  whatsappInstanceCode:       d.whatsapp_instance,
  whatsappNumberId:           d.whatsapp_number_id,
  notificationEmail:          d.notif_email,
  notificationEmailPassword:  null as string | null,  // PATCH only, never returned
  smtpHost:                   d.notif_email_smtp_host,
  smtpPort:                   d.notif_email_smtp_port,
  smtpEncryption:             d.notif_email_smtp_encryption,
  smtpFromName:               d.notif_email_from_name,
  parentApiUrl:               d.parent_api_url,
  parentApiKey:               d.parent_api_key,
  parentApiSecret:            null as string | null,   // PATCH only, never returned
  parentApiTimeoutSeconds:    d.parent_api_timeout_seconds,
  whatsappApiKey:             null as string | null,   // PATCH only, never returned
  isDefault:                  d.is_default,
  createdAt:                  d.created_at,
  updatedAt:                  d.updated_at,
}))


export function getFieldSchema(type: FieldType, required?: boolean) {
  const base = (() => {
    switch (type) {
      case 'email':
        return z.string().email('Email invalide')
      case 'url':
        return z.string().url('URL invalide')
      case 'tel':
        return z.string().min(8, 'Numéro invalide').max(20, 'Numéro invalide')
      case 'number':
        return z.coerce.number({
          error: (iss) => iss.input === undefined
            ? 'Entrez un nombre valide'
            : 'Entrée invalide'
        }).min(0)
      default:
        return z.string().min(1, 'Ce champ est requis')
    }
  })()

  if (required) return base

  // number stays number | undefined — no empty string fallback
  if (type === 'number') return base.optional()

  // strings get the empty string fallback for uncontrolled inputs
  return base.optional().or(z.literal(''))
}

export type GeneralParamsRaw   = z.input<typeof GeneralParamsSchema>
export type GeneralParamsInput = z.output<typeof GeneralParamsSchema>