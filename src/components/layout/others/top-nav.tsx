import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import { cn, getDisplayNameInitials } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfigDrawer } from '@/components/others/config-drawer'
import { ProfileDropdown } from '@/components/others/profile-dropdown'
import { Search as SearchDesktop } from '@/components/others/search'
import { ThemeSwitch } from '@/components/others/theme-switch'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { type NavCollapsible, type NavItem, type NavLink } from './types'
import { HEADER_COLORS, useColorStore } from '@/stores/others/color-store'
import { useLayout } from '@/stores/others/layout-store'
import { sidebarData } from '../../../simadou/routescontantes/sidebar-data'
import { ProgrammeSwitcher } from './programme-switcher'
import { SignOutDialog } from '@/components/others/sign-out-dialog'
import useDialogState from '@/hooks/use-dialog-state'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const t = (key: string) => key

// ─── Helpers couleur ──────────────────────────────────────────────────────────
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

function darken(hex: string, factor = 0.85): string {
  const clean = hex.replace('#', '')
  const r = Math.round(parseInt(clean.slice(0, 2), 16) * factor)
  const g = Math.round(parseInt(clean.slice(2, 4), 16) * factor)
  const b = Math.round(parseInt(clean.slice(4, 6), 16) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ─── CSS injecté dynamiquement ────────────────────────────────────────────────
const TOPBAR_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');

  @keyframes _tb-down {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes _tb-fade {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes _tb-modal {
    from { opacity:0; transform:translateY(-100%); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes _tb-subnav-in {
    from { opacity:0; transform:translateY(-6px); max-height:0; }
    to   { opacity:1; transform:translateY(0);   max-height:56px; }
  }

  ._tb-row1  { animation: _tb-down 0.32s cubic-bezier(.16,1,.3,1) both; }
  ._tb-row2  { animation: _tb-down 0.32s .07s cubic-bezier(.16,1,.3,1) both; }
  ._tb-brand { animation: _tb-fade 0.38s .12s both; }

  ._tb-ctrl > *              { animation: _tb-fade 0.28s both; }
  ._tb-ctrl > *:nth-child(1) { animation-delay:.12s; }
  ._tb-ctrl > *:nth-child(2) { animation-delay:.16s; }
  ._tb-ctrl > *:nth-child(3) { animation-delay:.20s; }
  ._tb-ctrl > *:nth-child(4) { animation-delay:.24s; }
  ._tb-ctrl > *:nth-child(5) { animation-delay:.28s; }

  ._tb-modal-panel { animation: _tb-modal 0.22s cubic-bezier(.16,1,.3,1) both; }

  ._tb-scroll::-webkit-scrollbar { display:none; }
  ._tb-scroll { scrollbar-width:none; -ms-overflow-style:none; }

  ._tb-ibtn {
    display:inline-flex; align-items:center; justify-content:center;
    width:32px; height:32px; border-radius:8px; border:none; cursor:pointer;
    background:transparent; color:inherit;
    transition: background .15s ease, transform .1s ease;
  }
  ._tb-ibtn:hover  { background:rgba(255,255,255,.16); }
  ._tb-ibtn:active { transform:scale(.92); }
  ._tb-ibtn:focus-visible { outline:2px solid rgba(255,255,255,.7); outline-offset:2px; }

  ._tb-link {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 15px; border-radius:6px;
    font-size:13px; font-weight:500;
    white-space:nowrap; text-decoration:none; flex-shrink:0;
    transition: background .15s ease, color .15s ease, transform .1s ease;
    border:none; cursor:pointer; background:transparent;
  }
  ._tb-link:hover  { background:rgba(255,255,255,.13); color:#fff; }
  ._tb-link:active { transform:scale(.97); }
  ._tb-link:focus-visible { outline:2px solid rgba(255,255,255,.7); outline-offset:2px; }

  ._tb-sublink {
    display:inline-flex; align-items:center; gap:5px;
    padding:5px 14px; border-radius:5px;
    font-size:13px; font-weight:500;
    white-space:nowrap; text-decoration:none; flex-shrink:0;
    transition: background .15s ease, color .15s ease, transform .1s ease;
  }
  ._tb-sublink:hover  { background:rgba(255,255,255,.13); }
  ._tb-sublink:active { transform:scale(.97); }

  ._tb-subnav {
    animation: _tb-subnav-in 0.22s cubic-bezier(.16,1,.3,1) both;
    overflow: hidden;
  }

  ._tb-logo {
    height: 48px;
    width: auto;
    max-width: 140px;
    object-fit: contain;
    display: block;
    border-radius: 6px;
    transition: opacity .2s ease, transform .2s ease;
  }
  ._tb-logo-wrap:hover ._tb-logo { opacity:.85; transform:scale(1.04); }

  ._tb-center-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    gap: 2px;
  }
  ._tb-center-main {
    font-family: 'Cinzel', serif;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #fff;
    line-height: 1.1;
    white-space: nowrap;
    background: rgba(0, 0, 0, .28);
    padding: 4px 18px 5px;
    border-radius: 6px;
    border-top: 2px solid #FCD116;
    border-bottom: 2px solid #FCD116;
  }
  ._tb-center-divider {
    width: 100px;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(252,209,22,.75), transparent);
  }
  ._tb-center-sub {
    font-family: 'Lato', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .28em;
    color: rgba(252,209,22,.85);
    line-height: 1;
    text-transform: uppercase;
  }
`

function CSSInjector() {
  useEffect(() => {
    const id = '__tb_styles'
    if (document.getElementById(id)) return
    const s = Object.assign(document.createElement('style'), { id, textContent: TOPBAR_CSS })
    document.head.appendChild(s)
    return () => { document.getElementById(id)?.remove() }
  }, [])
  return null
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function NavBadge({ value }: { value: string }) {
  return (
    <span style={{
      backgroundColor: '#FCD116',
      color: '#1a1200',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 18, height: 18, borderRadius: 999,
      padding: '0 5px', fontSize: 10, fontWeight: 700, lineHeight: 1,
    }}>
      {value}
    </span>
  )
}

// ─── Modal recherche mobile ───────────────────────────────────────────────────
function MobileSearchModal({
  open,
  onClose,
  headerBg,
  headerText,
}: {
  open: boolean
  onClose: () => void
  headerBg: string
  headerText: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => inputRef.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { clearTimeout(timer); window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('Rechercher')}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      />
      <div
        className="_tb-modal-panel"
        style={{
          position: 'relative', zIndex: 1,
          backgroundColor: headerBg,
          padding: '12px 14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: 'rgba(0,0,0,.25)',
          border: '1px solid rgba(255,255,255,.2)',
          borderRadius: 10, padding: '8px 14px',
        }}>
          <Search size={16} aria-hidden style={{ color: headerText, opacity: .7, flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            placeholder={t("Rechercher dans l'application…")}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: headerText, fontSize: 14 }}
          />
          <button onClick={onClose} className="_tb-ibtn" aria-label={t('Fermer')} style={{ width: 24, height: 24 }}>
            <X size={14} style={{ color: headerText, opacity: .75 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

type UserProps = {
  user: {
    nom_perso?: string
    prenom_perso?: string
    email?: string
    personnel_profile_picture: string | null
    id_personnel_perso?: string;
    statut?: number;
  }
}

// ─── AppTopbar ────────────────────────────────────────────────────────────────
export function AppTopbar({ user }: UserProps) {
  const href = useLocation({ select: (l) => l.href })
  const firstTeam = sidebarData.teams[0]
  const subNavMode = useLayout((s) => s.subNavMode)

  const [open, setOpen] = useDialogState()
  // ── Couleurs dynamiques — Header Color uniquement ──
  const headerColor = useColorStore((s) => s.headerColor)
  const { bg: headerBg, text: headerText } = HEADER_COLORS[headerColor]
  const headerBg2 = darken(headerBg, 0.82)
  const headerBg3 = darken(headerBg, 0.70)
  const accentRgb = hexToRgb(headerBg)

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)

  const routeGroup = useMemo((): NavCollapsible | null => {
    const allItems = sidebarData.navGroups.flatMap((g) => g.items)
    return (
      (allItems.find(
        (item) =>
          item.items &&
          (item as NavCollapsible).items.some(
            (sub) => href === sub.url || href.split('?')[0] === sub.url
          )
      ) as NavCollapsible | undefined) ?? null
    )
  }, [href])

  const [manualGroup, setManualGroup] = useState<NavCollapsible | null>(null)
  const [lastHref, setLastHref] = useState(href)

  if (lastHref !== href) {
    setLastHref(href)
    setManualGroup(null)
  }

  const activeGroup = manualGroup ?? routeGroup

  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setManualGroup(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navRef = useRef<HTMLDivElement>(null)
  const [leftFade, setLeftFade] = useState(false)
  const [rightFade, setRightFade] = useState(false)

  const checkFades = useCallback(() => {
    const el = navRef.current
    if (!el) return
    setLeftFade(el.scrollLeft > 4)
    setRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    checkFades()
    const el = navRef.current
    el?.addEventListener('scroll', checkFades, { passive: true })
    window.addEventListener('resize', checkFades, { passive: true })
    return () => {
      el?.removeEventListener('scroll', checkFades)
      window.removeEventListener('resize', checkFades)
    }
  }, [checkFades])

  const fadeBgLeft = `linear-gradient(to right, ${headerBg2} 20%, transparent)`
  const fadeBgRight = `linear-gradient(to left,  ${headerBg2} 20%, transparent)`

  const userInitials = getDisplayNameInitials(user.nom_perso ?? '')

  const handleGroupToggle = (item: NavCollapsible) => {
    setManualGroup((prev) => (prev?.title === item.title ? null : item))
  }
  return (
    <>
      <CSSInjector />
      <MobileSearchModal
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        headerBg={headerBg}
        headerText={headerText}
      />

      <header
        ref={headerRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          backgroundColor: headerBg,
          color: headerText,
          borderBottom: `1px solid rgba(${accentRgb},.2)`,
          boxShadow: '0 4px 20px rgba(0,0,0,.3)',
          transition: 'background-color .35s ease, border-color .35s ease',
        }}
      >

        {/* ══ ROW 1 : Logo + Titre centré + contrôles ══ */}
        <div className="_tb-row1" style={{
          display: 'flex',
          alignItems: 'center',
          height: 60,
          gap: 8,
          padding: '0 14px',
          position: 'relative',
        }}>

          <SidebarTrigger
            className="_tb-ibtn md:hidden"
            aria-label={t('Ouvrir le menu')}
            style={{ color: headerText, flexShrink: 0 }}
          />

          {/* LOGO */}
          <div className="_tb-brand _tb-logo-wrap" style={{ flexShrink: 0, lineHeight: 0 }}>
            {!logoFailed ? (
              <img
                src="/src/assets/images/pont.png"
                alt={firstTeam.name}
                className="_tb-logo"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div aria-hidden style={{
                height: 48,
                width: 44,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,.12)',
                border: '1px solid rgba(255,255,255,.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontFamily: "'Cinzel', serif",
                fontWeight: 900,
                color: '#FCD116',
                letterSpacing: '1px',
                lineHeight: 1.1,
              }}>
                {firstTeam.name?.slice(0, 2).toUpperCase() ?? 'AP'}
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div aria-hidden style={{
            width: 1,
            height: 28,
            flexShrink: 0,
            backgroundColor: 'rgba(255,255,255,.2)',
          }} />

          {/* Nom de l'app */}
          <div className="_tb-brand" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.2, flexShrink: 0 }}>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '.06em',
              color: '#FCD116',
            }}>
              {firstTeam.name ?? 'SIMABOU'}
            </span>
            <span style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              opacity: 0.55,
              color: headerText,
            }}>
              2040
            </span>
          </div>

          {/* ══ TITRE CENTRÉ ══ */}
          <div className="_tb-center-title _tb-brand">
            <div className="_tb-center-divider" />
            <span className="_tb-center-main">Suivi &amp; Évaluation</span>
            <span className="_tb-center-sub">République de Guinée</span>
            <div className="_tb-center-divider" />
          </div>

          <div style={{ flex: 1 }} />

          {/* Contrôles droite */}
          <div className="_tb-ctrl" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="_tb-ibtn md:hidden"
              aria-label={t('Rechercher')}
              style={{ color: headerText }}
            >
              <Search size={17} aria-hidden />
            </button>
            <div className="hidden md:flex me-1">
              <SearchDesktop />
            </div>
            <ProgrammeSwitcher onHeader />
            <ThemeSwitch />
            <ConfigDrawer />
            {user && (
              <ProfileDropdown
                user={user}
                side={"bottom"}
                onLogout={() => setOpen(true)}
                trigger={
                  <Button>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user.personnel_profile_picture ?? ''} alt='profile' />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* ══ ROW 2 : Navigation principale ══ */}
        <div
          className="_tb-row2"
          style={{
            position: 'relative',
            borderTop: '1px solid rgba(255,255,255,.10)',
            backgroundColor: headerBg2,
            transition: 'background-color .35s ease',
          }}
        >
          <div aria-hidden style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 24,
            background: fadeBgLeft,
            zIndex: 10, pointerEvents: 'none',
            opacity: leftFade ? 1 : 0, transition: 'opacity .2s ease',
          }} />
          <div aria-hidden style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 24,
            background: fadeBgRight,
            zIndex: 10, pointerEvents: 'none',
            opacity: rightFade ? 1 : 0, transition: 'opacity .2s ease',
          }} />

          <nav
            ref={navRef}
            className="_tb-scroll"
            aria-label={t('Navigation principale')}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 44,
              gap: 2,
              padding: '0 10px',
              overflowX: 'auto',
            }}
          >
            {sidebarData.navGroups
              .flatMap((g) => g.items)
              .map((item, idx) => (
                <TopNavItem
                  key={item.title}
                  item={item}
                  href={href}
                  animDelay={0.05 + idx * 0.04}
                  headerText={headerText}
                  activeGroupTitle={activeGroup?.title ?? null}
                  onGroupToggle={handleGroupToggle}
                  subNavMode={subNavMode}
                />
              ))}
          </nav>
        </div>

        {/* ══ ROW 3 : Sous-navigation horizontale ══ */}
        {subNavMode === 'horizontal' && activeGroup && activeGroup.items.length > 0 && (
          <div
            className="_tb-subnav"
            style={{
              borderTop: '1px solid rgba(255,255,255,.08)',
              backgroundColor: headerBg3,
              transition: 'background-color .35s ease',
            }}
          >
            <nav
              className="_tb-scroll"
              aria-label={t(`Sous-navigation ${activeGroup.title}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 44,
                gap: 2,
                padding: '0 10px',
                overflowX: 'auto',
              }}
            >
              {activeGroup.items.map((sub, idx) => {
                const isActive = href === sub.url || href.split('?')[0] === sub.url
                return (
                  <Link
                    key={`${sub.title}-${idx}`}
                    to={sub.url}
                    className="_tb-sublink"
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      color: isActive ? '#fff' : `color-mix(in srgb, ${headerText} 65%, transparent)`,
                      backgroundColor: isActive ? 'rgba(255,255,255,.20)' : 'transparent',
                      fontWeight: isActive ? 700 : 400,
                      boxShadow: isActive ? 'inset 0 -2px 0 rgba(255,255,255,.6)' : 'none',
                      animation: `_tb-fade 0.18s ${0.02 + idx * 0.03}s both`,
                    }}
                  >
                    {sub.icon && <sub.icon className="size-3.5" aria-hidden />}
                    <span>{t(sub.title)}</span>
                    {sub.badge && <NavBadge value={sub.badge} />}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* ══ Bande tricolore Guinée ══ */}
        <div aria-hidden style={{ display: 'flex', height: 5 }}>
          <div style={{ flex: 1, backgroundColor: '#CE1126' }} />
          <div style={{ flex: 1, backgroundColor: '#FCD116' }} />
          <div style={{ flex: 1, backgroundColor: '#009460' }} />
        </div>

      </header>
      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}

// ─── NavLink simple ───────────────────────────────────────────────────────────
function TopNavLink({
  item,
  href,
  animDelay,
  headerText,
}: {
  item: NavLink
  href: string
  animDelay: number
  headerText: string
}) {
  const isActive =
    href === item.url ||
    href.split('?')[0] === item.url ||
    (href.split('/')[1] !== '' && href.split('/')[1] === item.url?.toString().split('/')[1])

  return (
    <Link
      to={item.url}
      className="_tb-link"
      aria-current={isActive ? 'page' : undefined}
      style={{
        color: isActive ? headerText : `color-mix(in srgb, ${headerText} 62%, transparent)`,
        backgroundColor: isActive ? 'rgba(255,255,255,.18)' : 'transparent',
        fontWeight: isActive ? 700 : 400,
        boxShadow: isActive ? 'inset 0 -2px 0 rgba(255,255,255,.65)' : 'none',
        animation: `_tb-fade 0.25s ${animDelay}s both`,
      }}
    >
      {item.icon && <item.icon className="size-3.5" aria-hidden />}
      <span>{t(item.title)}</span>
      {item.badge && <NavBadge value={item.badge} />}
    </Link>
  )
}

// ─── NavItem collapsible ──────────────────────────────────────────────────────
function TopNavCollapsible({
  item,
  href,
  animDelay,
  headerText,
  activeGroupTitle,
  onGroupToggle,
  subNavMode,
}: {
  item: NavCollapsible
  href: string
  animDelay: number
  headerText: string
  activeGroupTitle: string | null
  onGroupToggle: (item: NavCollapsible) => void
  subNavMode: 'horizontal' | 'dropdown'
}) {
  const isRouteActive = item.items.some(
    (sub) => href === sub.url || href.split('?')[0] === sub.url
  )
  const isOpen = activeGroupTitle === item.title

  const activeStyle = {
    color: isRouteActive || isOpen ? headerText : `color-mix(in srgb, ${headerText} 62%, transparent)`,
    backgroundColor: isRouteActive || isOpen ? 'rgba(255,255,255,.18)' : 'transparent',
    fontWeight: (isRouteActive || isOpen ? 700 : 400) as number,
    boxShadow: isRouteActive || isOpen ? 'inset 0 -2px 0 rgba(255,255,255,.65)' : 'none',
    animation: `_tb-fade 0.25s ${animDelay}s both`,
  }

  const chevron = (
    <svg
      aria-hidden
      width="10" height="10" viewBox="0 0 10 10"
      style={{
        marginLeft: 2, opacity: .5,
        transition: 'transform .2s ease',
        transform: isOpen && subNavMode === 'horizontal' ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  if (subNavMode === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="_tb-link"
          aria-haspopup="true"
          style={{ ...activeStyle, outline: 'none' }}
        >
          {item.icon && <item.icon className="size-3.5" aria-hidden />}
          <span>{t(item.title)}</span>
          {item.badge && <NavBadge value={item.badge} />}
          {chevron}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={6} className="min-w-44">
          {item.items.map((sub, idx) => (
            <DropdownMenuItem key={`${sub.title}-${idx}`} asChild>
              <Link
                to={sub.url}
                className={cn(
                  'flex items-center gap-2',
                  (href === sub.url || href.split('?')[0] === sub.url) && 'bg-secondary',
                )}
              >
                {sub.icon && <sub.icon className="size-4 shrink-0" aria-hidden />}
                <span className="max-w-52 text-xs text-wrap">{t(sub.title)}</span>
                {sub.badge && <span className="ms-auto"><NavBadge value={sub.badge} /></span>}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <button
      className="_tb-link"
      aria-haspopup="true"
      aria-expanded={isOpen}
      onClick={() => onGroupToggle(item)}
      style={activeStyle}
    >
      {item.icon && <item.icon className="size-3.5" aria-hidden />}
      <span>{t(item.title)}</span>
      {item.badge && <NavBadge value={item.badge} />}
      {chevron}
    </button>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────
function TopNavItem({
  item,
  href,
  animDelay,
  headerText,
  activeGroupTitle,
  onGroupToggle,
  subNavMode,
}: {
  item: NavItem
  href: string
  animDelay: number
  headerText: string
  activeGroupTitle: string | null
  onGroupToggle: (item: NavCollapsible) => void
  subNavMode: 'horizontal' | 'dropdown'
}) {
  if (!item.items)
    return (
      <TopNavLink item={item as NavLink} href={href} animDelay={animDelay} headerText={headerText} />
    )
  return (
    <TopNavCollapsible
      item={item as NavCollapsible}
      href={href}
      animDelay={animDelay}
      headerText={headerText}
      activeGroupTitle={activeGroupTitle}
      onGroupToggle={onGroupToggle}
      subNavMode={subNavMode}
    />
  )
}