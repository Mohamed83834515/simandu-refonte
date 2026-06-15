// GET response shape — full object
export interface GeneralParamsAPI {
  id:                          number
  is_default:                  boolean
  system_sigle:                string
  system_name:                 string
  structure_sigle:             string
  structure_name:              string
  structure_logo:              string | null
  structure_address:           string
  structure_email:             string | null
  structure_whatsapp_number:   string | null
  structure_phone_number:      string | null
  local_currency_sigle:        string
  main_currency_sigle:         string
  main_currency_rate:          string
  is_maintenance:              boolean
  inactivity_minute:           number
  max_sessions:                number
  max_login_attempts:          number
  otp_validity_minute:         number
  password_expiry_month:       number
  delay_update_second:         number
  whatsapp_instance:           string | null
  whatsapp_number_id:          string | null
  notif_email:                 string | null
  notif_email_smtp_host:       string | null
  notif_email_smtp_port:       number
  notif_email_smtp_encryption: string | null
  notif_email_from_name:       string | null
  parent_api_url:              string | null
  parent_api_key:              string | null
  parent_api_timeout_seconds:  number
  created_at:                  string
  updated_at:                  string
}

// PATCH body — no id, is_default, created_at, updated_at
// has extra fields not in GET
export interface GeneralParamsPatch {
  system_sigle?:               string
  system_name?:                string
  structure_sigle?:            string
  structure_name?:             string
  structure_logo?:             string | null
  structure_address?:          string
  structure_email?:            string | null
  structure_whatsapp_number?:  string | null
  structure_phone_number?:     string | null
  local_currency_sigle?:       string
  main_currency_sigle?:        string
  main_currency_rate?:         string
  is_maintenance?:             boolean
  inactivity_minute?:          number
  max_sessions?:               number
  max_login_attempts?:         number
  otp_validity_minute?:        number
  password_expiry_month?:      number
  delay_update_second?:        number
  whatsapp_instance?:          string | null
  whatsapp_number_id?:         string | null
  notif_email?:                string | null
  notif_email_password?:       string | null  // PATCH only
  notif_email_smtp_host?:      string | null
  notif_email_smtp_port?:      number
  notif_email_smtp_encryption?: string | null
  notif_email_from_name?:      string | null
  parent_api_url?:             string | null
  parent_api_key?:             string | null
  parent_api_timeout_seconds?: number
  whatsapp_api_key?:           string | null  // PATCH only
  parent_api_secret?:          string | null  // PATCH only
}

// Frontend camelCase shape — what components consume
export interface GeneralParams {
  id:                         number
  // Identite
  systemSigle:                string
  systemTitle:                string
  structureSigle:             string
  structureName:              string
  structureLogo:              string | null
  structureAddress:           string
  // Contacts
  structureEmail:             string | null
  structurePhone:             string | null
  structureWhatsapp:          string | null
  // Finance
  currencyCode:               string
  baseCurrency:               string
  exchangeRate:               number | null
  // Security
  maintenanceMode:            boolean
  inactivityDelayMinutes:     number
  maxSessions:                number
  loginAttemptsLimit:         number
  tpCodeDelayMinutes:         number
  passwordChangeDelayMonths:  number
  deleteOrUpdateDelaySeconds: number
  // Notifications
  whatsappInstanceCode:       string | null
  whatsappNumberId:           string | null
  notificationEmail:          string | null
  notificationEmailPassword:  string | null
  smtpHost:                   string | null
  smtpPort:                   number
  smtpEncryption:             string | null
  smtpFromName:               string | null
  // Integrations
  parentApiUrl:               string | null
  parentApiKey:               string | null
  parentApiSecret:            string | null
  parentApiTimeoutSeconds:    number
  whatsappApiKey:             string | null
  // Meta
  isDefault:                  boolean
  createdAt:                  string
  updatedAt:                  string
}