// allfieldsConfig/generalParamsForm.ts
import type { FormConfig } from "@/Global/types/formConfig"

export const getIdentiteFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:        'systemSigle',
      label:       'Sigle du système',
      type:        'text',
      placeholder: 'SEGAR',
      gridCols:    1,
    },
    {
      name:        'systemTitle',
      label:       'Intitulé du système',
      type:        'text',
      placeholder: 'Suivi Evaluation Global Axé sur les Résultats',
      colSpan:     'full',
    },
    {
      name:        'structureSigle',
      label:       'Sigle de la structure',
      type:        'text',
      placeholder: 'CEP',
      gridCols:    1,
    },
    {
      name:        'structureName',
      label:       'Nom de la structure',
      type:        'text',
      placeholder: 'Cellule Exécution des Projets',
      gridCols:    1,
    },
    {
      name:        'structureAddress',
      label:       'Adresse de la structure',
      type:        'text',
      placeholder: 'Kaloum Conakry',
      colSpan:     'full',
    },
  ],
})

export const getContactsFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:        'structureEmail',
      label:       'Email de la structure',
      type:        'email',
      placeholder: 'contact@cep.gn',
      gridCols:    1,
    },
    {
      name:        'structurePhone',
      label:       'Téléphone de la structure',
      type:        'tel',
      placeholder: '+224 622 000 000',
      gridCols:    1,
    },
    {
      name:        'structureWhatsapp',
      label:       'Contact WhatsApp de la structure',
      type:        'tel',
      placeholder: '+224 622 000 000',
      gridCols:    1,
    },
  ],
})

export const getFinanceFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:        'currencyCode',
      label:       'Monnaie locale',
      type:        'text',
      placeholder: 'GNF',
      helperText:  'Sigle de la monnaie du pays',
      gridCols:    1,
    },
    {
      name:        'baseCurrency',
      label:       'Devise principale',
      type:        'text',
      placeholder: 'USD',
      helperText:  'Sigle de la devise de référence',
      gridCols:    1,
    },
    {
      name:        'exchangeRate',
      label:       'Taux de change',
      type:        'number',
      placeholder: '9000',
      helperText:  '1 USD = X GNF',
      min:         0,
      colSpan:     'full',
    },
  ],
})

export const getSeuilFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:        'ecartProjetCritique',
      label:       'Écart projet critique (%)',
      type:        'number',
      placeholder: 'Ex: 30',
      helperText:  'Nombre de pourcentage d\'écart pour qu\'un projet soit considéré comme critique',
      gridCols:    1,
      min:         0,
      step:        1,
    },
    {
      name:        'ecartProjetRetard',
      label:       'Écart projet retard (%)',
      type:        'number',
      placeholder: 'Ex: 15',
      helperText:  'Nombre de pourcentage d\'écart pour qu\'un projet soit considéré comme en retard',
      gridCols:    1,
      min:         0,
      step:        1,
    },
  ],
})

export const getSecuriteFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:       'maintenanceMode',
      label:      'Mode maintenance',
      type:       'switch',
      helperText: 'Seul le super admin a accès pendant cette période',
      colSpan:    'full',
    },
    {
      name:        'inactivityDelayMinutes',
      label:       "Délai d'inactivité (minutes)",
      type:        'number',
      placeholder: '30',
      helperText:  '0 = illimité',
      min:         0,
      gridCols:    1,
    },
    {
      name:        'maxSessions',
      label:       'Sessions simultanées max',
      type:        'number',
      placeholder: '2',
      helperText:  '0 = illimité',
      min:         0,
      gridCols:    1,
    },
    {
      name:        'loginAttemptsLimit',
      label:       'Tentatives de connexion max',
      type:        'number',
      placeholder: '3',
      helperText:  '0 = illimité',
      min:         0,
      gridCols:    1,
    },
    {
      name:        'tpCodeDelayMinutes',
      label:       'Validité code OTP (minutes)',
      type:        'number',
      placeholder: '5',
      helperText:  '0 = non exigé',
      min:         0,
      gridCols:    1,
    },
    {
      name:        'passwordChangeDelayMonths',
      label:       'Délai changement mot de passe (mois)',
      type:        'number',
      placeholder: '6',
      helperText:  '0 = non exigé',
      min:         0,
      gridCols:    1,
    },
    {
      name:        'deleteOrUpdateDelaySeconds',
      label:       'Délai avant suppression/modification (secondes)',
      type:        'number',
      placeholder: '5',
      helperText:  '0 = non exigé',
      min:         0,
      gridCols:    1,
    },
  ],
})

export const getNotificationsFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:        'notificationEmail',
      label:       'Email de notification',
      type:        'email',
      placeholder: 'cep@cep.net',
      gridCols:    1,
    },
    {
      name:               'notificationEmailPassword',
      label:              'Mot de passe email',
      type:               'password',
      placeholder:        '••••••••',
      showPasswordToggle: true,
      gridCols:           1,
    },
    {
      name:        'smtpHost',
      label:       'Hôte SMTP',
      type:        'text',
      placeholder: 'smtp.example.com',
      gridCols:    1,
    },
    {
      name:        'smtpPort',
      label:       'Port SMTP',
      type:        'number',
      placeholder: '587',
      min:         0,
      gridCols:    1,
    },
    {
      name:        'smtpEncryption',
      label:       'Chiffrement SMTP',
      type:        'text',
      placeholder: 'tls',
      gridCols:    1,
    },
    {
      name:        'smtpFromName',
      label:       'Nom expéditeur',
      type:        'text',
      placeholder: 'SEGAR',
      gridCols:    1,
    },
    {
      name:        'whatsappInstanceCode',
      label:       'Instance WhatsApp',
      type:        'text',
      placeholder: '2522545522',
      gridCols:    1,
    },
    {
      name:        'whatsappNumberId',
      label:       'WhatsApp Number ID',
      type:        'text',
      placeholder: '...',
      gridCols:    1,
    },
  ],
})

export const getIntegrationsFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:        'parentApiUrl',
      label:       "URL de l'API parente",
      type:        'url',
      placeholder: 'https://api.parent-system.net',
      helperText:  'Lien vers le système parent',
      colSpan:     'full',
    },
    {
      name:        'parentApiKey',
      label:       "Clé API parente",
      type:        'text',
      placeholder: '...',
      gridCols:    1,
    },
    {
      name:               'parentApiSecret',
      label:              'Secret API parente',
      type:               'password',
      placeholder:        '••••••••',
      showPasswordToggle: true,
      gridCols:           1,
    },
    {
      name:        'parentApiTimeoutSeconds',
      label:       'Timeout API (secondes)',
      type:        'number',
      placeholder: '30',
      helperText:  'Délai max avant abandon',
      min:         0,
      gridCols:    1,
    },
    {
      name:               'whatsappApiKey',
      label:              'Clé API WhatsApp',
      type:               'password',
      placeholder:        '••••••••',
      showPasswordToggle: true,
      gridCols:           1,
    },
  ],
})