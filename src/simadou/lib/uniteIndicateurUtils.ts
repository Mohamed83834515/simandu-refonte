import type { UniteIndicateur } from '@/simadou/allTypes/uniteIndicateur'

/**
 * Symbole d'affichage d'une unité d'indicateur : `unite_ui` est déjà le
 * symbole (« % », « kg »…). Seule l'unité « Nombre » ne s'affiche pas.
 */
export function getUniteSymbole(
  unite: UniteIndicateur | string | null | undefined
): string {
  const symbole = typeof unite === 'string' ? unite : (unite?.unite_ui ?? '')

  const normalise = symbole
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
  if (normalise === 'nombre' || normalise === 'nbre') return ''

  return symbole.trim()
}
