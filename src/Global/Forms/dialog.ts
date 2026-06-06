export const DIALOG_SIZES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  /** Formulaires compacts (sous-vues add/edit dans modals larges) */
  form: 'sm:max-w-xl',
  full: 'sm:max-w-screen-xl',
} as const

export type DialogSize = keyof typeof DIALOG_SIZES
