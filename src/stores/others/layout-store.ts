import { create } from 'zustand'
import { getCookie, setCookie } from '@/lib/cookies'

export type Collapsible = 'offcanvas' | 'icon' | 'none'
export type NavMode     = 'sidebar' | 'topbar'
export type SubNavMode  = 'horizontal' | 'dropdown'
type Variant            = 'inset' | 'sidebar' | 'floating'

const LAYOUT_COLLAPSIBLE_COOKIE_NAME  = 'layout_collapsible'
const LAYOUT_VARIANT_COOKIE_NAME      = 'layout_variant'
const LAYOUT_NAV_MODE_COOKIE_NAME     = 'layout_nav_mode'
const LAYOUT_SUB_NAV_MODE_COOKIE_NAME = 'layout_sub_nav_mode'
const LAYOUT_COOKIE_MAX_AGE           = 60 * 60 * 24 * 7

const DEFAULT_COLLAPSIBLE: Collapsible = 'icon'
const DEFAULT_VARIANT: Variant         = 'inset'
const DEFAULT_NAV_MODE: NavMode        = 'topbar'
const DEFAULT_SUB_NAV_MODE: SubNavMode = 'horizontal'

interface LayoutState {
  collapsible:        Collapsible
  defaultCollapsible: Collapsible
  setCollapsible:     (collapsible: Collapsible) => void

  variant:        Variant
  defaultVariant: Variant
  setVariant:     (variant: Variant) => void

  navMode:        NavMode
  defaultNavMode: NavMode
  setNavMode:     (navMode: NavMode) => void

  subNavMode:        SubNavMode
  defaultSubNavMode: SubNavMode
  setSubNavMode:     (subNavMode: SubNavMode) => void
  resetSubNavMode:   () => void

  resetLayout: () => void
}

export const useLayoutStore = create<LayoutState>(() => ({
  collapsible:        (getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME) as Collapsible) || DEFAULT_COLLAPSIBLE,
  defaultCollapsible: DEFAULT_COLLAPSIBLE,
  setCollapsible: (collapsible) => {
    setCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME, collapsible, LAYOUT_COOKIE_MAX_AGE)
    useLayoutStore.setState({ collapsible })
  },

  variant:        (getCookie(LAYOUT_VARIANT_COOKIE_NAME) as Variant) || DEFAULT_VARIANT,
  defaultVariant: DEFAULT_VARIANT,
  setVariant: (variant) => {
    setCookie(LAYOUT_VARIANT_COOKIE_NAME, variant, LAYOUT_COOKIE_MAX_AGE)
    useLayoutStore.setState({ variant })
  },

  navMode:        (getCookie(LAYOUT_NAV_MODE_COOKIE_NAME) as NavMode) || DEFAULT_NAV_MODE,
  defaultNavMode: DEFAULT_NAV_MODE,
  setNavMode: (navMode) => {
    setCookie(LAYOUT_NAV_MODE_COOKIE_NAME, navMode, LAYOUT_COOKIE_MAX_AGE)
    useLayoutStore.setState({ navMode })
  },

  subNavMode:        (getCookie(LAYOUT_SUB_NAV_MODE_COOKIE_NAME) as SubNavMode) || DEFAULT_SUB_NAV_MODE,
  defaultSubNavMode: DEFAULT_SUB_NAV_MODE,
  setSubNavMode: (subNavMode) => {
    setCookie(LAYOUT_SUB_NAV_MODE_COOKIE_NAME, subNavMode, LAYOUT_COOKIE_MAX_AGE)
    useLayoutStore.setState({ subNavMode })
  },
  resetSubNavMode: () => {
    setCookie(LAYOUT_SUB_NAV_MODE_COOKIE_NAME, DEFAULT_SUB_NAV_MODE, LAYOUT_COOKIE_MAX_AGE)
    useLayoutStore.setState({ subNavMode: DEFAULT_SUB_NAV_MODE })
  },

  resetLayout: () => {
    setCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME,  DEFAULT_COLLAPSIBLE,  LAYOUT_COOKIE_MAX_AGE)
    setCookie(LAYOUT_VARIANT_COOKIE_NAME,      DEFAULT_VARIANT,      LAYOUT_COOKIE_MAX_AGE)
    setCookie(LAYOUT_NAV_MODE_COOKIE_NAME,     DEFAULT_NAV_MODE,     LAYOUT_COOKIE_MAX_AGE)
    setCookie(LAYOUT_SUB_NAV_MODE_COOKIE_NAME, DEFAULT_SUB_NAV_MODE, LAYOUT_COOKIE_MAX_AGE)
    useLayoutStore.setState({
      collapsible: DEFAULT_COLLAPSIBLE,
      variant:     DEFAULT_VARIANT,
      navMode:     DEFAULT_NAV_MODE,
      subNavMode:  DEFAULT_SUB_NAV_MODE,
    })
  },
}))

export const useLayout = useLayoutStore