import { ValidationRegex } from "./validationRegex";

export type ValidationPreset =
  | "text"
  | "name"
  | "nameStrict"
  | "nameWithNumbers"
  | "alphanumeric"
  | "alphanumericAccents"
  | "email"
  | "emailStrict"
  | "phoneFR"
  | "phoneInternational"
  | "phoneSimple"
  | "mobileFR"
  | "passwordWeak"
  | "passwordMedium"
  | "passwordStrong"
  | "passwordVeryStrong"
  | "integerPositive"
  | "integer"
  | "decimalPositive"
  | "decimal"
  | "price"
  | "percentage"
  | "url"
  | "urlStrict"
  | "postalCodeFR"
  | "postalCodeInternational"
  | "dateFR"
  | "dateISO"
  | "time"
  | "timeWithSeconds"
  | "socialSecurityFR"
  | "siret"
  | "siren"
  | "tvaFR"
  | "creditCard"
  | "iban"
  | "address"
  | "streetNumber"
  | "slug"
  | "hex"
  | "ipv4"
  | "uuid"
  | "username"
  | "lettersOnly"
  | "numbersOnly";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "search"
  | "textarea"
  | "number"
  | "range"
  | "date"
  | "daterange"
  | "time"
  | "datetime-local"
  | "month"
  | "week"
  | "select"
  | "select-with-other"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "file"
  | "image"
  | "video"
  | "audio"
  | "color"
  | "hidden"
  | "checkbox-group";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validationPreset?: ValidationPreset;
  pattern?: RegExp | string;
  patternErrorMessage?: string;
  options?: SelectOption[];
  isLoading?: boolean;
  otherFieldName?: string;
  otherPlaceholder?: string;
  endpoint?: string;
  labelKey?: string;
  valueKey?: string;
  showPasswordToggle?: boolean;
  min?: number;
  max?: number;
  //numéro de l'étape du formulaire (1, 2, 3...)
  step?: number;
  // alias explicite si "step" entre en conflit avec le step HTML (number input)
  formStep?: number;
  rows?: number;
  cols?: number;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxLength?: number;
  minLength?: number;
  helperText?: string;
  defaultChecked?: boolean;
  className?: string;
  dependsOn?: string;
  showWhen?: ((value: any) => boolean) | Record<string, any>;
  hidden?: boolean;
  colSpan?: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4  
  gridCols?: 1 | 2 | 3 | 4 
  useCombobox?: boolean;
  startName?: string;
  endName?: string;
  showPasswordChecker ? : boolean
 

}

//Nouvelle interface : description d'une étape
export interface StepConfig {
  // identifiant de l'étape (1-based)
  step: number;
  // titre affiché dans le stepper
  title: string;
  // sous-titre optionnel
  description?: string;
  // icône lucide optionnelle
  icon?: React.ReactNode;
}

export interface FormConfig {
  fields: FieldConfig[];
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
  steps?: StepConfig[];
}

export function getFieldRegex(field: FieldConfig): RegExp | undefined {
  if (field.pattern) {
    return typeof field.pattern === "string"
      ? new RegExp(field.pattern)
      : field.pattern;
  }
  if (field.validationPreset) {
    return ValidationRegex[field.validationPreset];
  }
  return undefined;
}

export function getFieldErrorMessage(field: FieldConfig): string {
  if (field.patternErrorMessage) {
    return field.patternErrorMessage;
  }

  const defaultMessages: Record<string, string> = {
    text: "Doit contenir uniquement des lettres, chiffres, espaces et - '",
    name: "Doit contenir uniquement des lettres et - '",
    nameStrict: "Doit contenir uniquement des lettres (pas de chiffres)",
    nameWithNumbers: "Lettres, chiffres, espaces et - ' autorisés (ex: Ogou1)",
    alphanumeric: "Lettres et chiffres uniquement (pas d'espaces)",
    alphanumericAccents: "Lettres, chiffres et espaces autorisés",
    email: "Format d'email invalide (ex: user@example.com)",
    emailStrict: "Format d'email invalide",
    phoneFR: "Téléphone français invalide (ex: 06 12 34 56 78)",
    phoneInternational: "Format international invalide (ex: +33612345678)",
    phoneSimple: "10 à 15 chiffres requis",
    mobileFR: "Mobile français invalide (06 ou 07)",
    passwordWeak: "Minimum 6 caractères",
    passwordMedium: "Minimum 8 caractères avec 1 lettre et 1 chiffre",
    passwordStrong: "Minimum 8 caractères avec 1 majuscule, 1 minuscule et 1 chiffre",
    passwordVeryStrong: "Minimum 8 caractères avec 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial",
    integerPositive: "Nombre entier positif requis",
    integer: "Nombre entier requis",
    decimalPositive: "Nombre décimal positif requis",
    decimal: "Nombre décimal requis",
    price: "Prix valide requis (ex: 19.99)",
    percentage: "Pourcentage entre 0 et 100",
    url: "URL invalide (ex: https://example.com)",
    urlStrict: "URL avec protocole requis (http:// ou https://)",
    postalCodeFR: "Code postal français invalide (5 chiffres)",
    postalCodeInternational: "Code postal invalide",
    dateFR: "Date invalide (format: JJ/MM/AAAA)",
    dateISO: "Date invalide (format: AAAA-MM-JJ)",
    time: "Heure invalide (format: HH:MM)",
    timeWithSeconds: "Heure invalide (format: HH:MM:SS)",
    socialSecurityFR: "Numéro de sécurité sociale invalide",
    siret: "SIRET invalide (14 chiffres)",
    siren: "SIREN invalide (9 chiffres)",
    tvaFR: "TVA intracommunautaire invalide (ex: FR12345678901)",
    creditCard: "Numéro de carte bancaire invalide",
    iban: "IBAN invalide",
    address: "Adresse invalide",
    streetNumber: "Numéro de rue invalide (ex: 10, 12bis)",
    slug: "Slug invalide (lettres minuscules, chiffres et - uniquement)",
    hex: "Code hexadécimal invalide (ex: #FF5733)",
    ipv4: "Adresse IPv4 invalide",
    uuid: "UUID invalide",
    username: "3-20 caractères (lettres, chiffres, _ et - uniquement)",
    lettersOnly: "Lettres uniquement",
    numbersOnly: "Chiffres uniquement",
  };

  if (field.validationPreset) {
    return defaultMessages[field.validationPreset] || "Format invalide";
  }

  return "Format invalide";
}