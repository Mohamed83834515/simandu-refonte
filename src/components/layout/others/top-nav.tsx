import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useLocation }                         from '@tanstack/react-router'
import { ChevronDown, Search, X }                    from 'lucide-react'
import { cn }                                        from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfigDrawer }                              from '@/components/others/config-drawer'
import { ProfileDropdown }                           from '@/components/others/profile-dropdown'
import { Search as SearchDesktop }                   from '@/components/others/search'
import { ThemeSwitch }                               from '@/components/others/theme-switch'
import { SidebarTrigger }                            from '@/components/ui/sidebar'
import { type NavCollapsible, type NavItem, type NavLink } from './types'
import { CHART_COLORS, HEADER_COLORS, useColorStore } from '@/stores/others/color-store'
import { sidebarData }                               from '../../../simadou/routescontantes/sidebar-data'
import { ProgrammeSwitcher }                           from './programme-switcher'

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
  @keyframes _tb-dd-in {
    from { opacity:0; transform:translateY(-6px) scale(.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  ._tb-row1  { animation: _tb-down 0.30s cubic-bezier(.16,1,.3,1) both; }
  ._tb-row2  { animation: _tb-down 0.30s .06s cubic-bezier(.16,1,.3,1) both; }
  ._tb-brand { animation: _tb-fade 0.35s .10s both; }

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
  ._tb-ibtn:hover  { background:rgba(255,255,255,.15); }
  ._tb-ibtn:active { transform:scale(.92); }
  ._tb-ibtn:focus-visible { outline:2px solid rgba(255,255,255,.7); outline-offset:2px; }

  ._tb-link {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:6px;
    font-size:14px; font-weight:500;
    white-space:nowrap; text-decoration:none; flex-shrink:0;
    transition: background .15s ease, color .15s ease, transform .1s ease;
    border:none; cursor:pointer;
  }
  ._tb-link:hover  { background:rgba(255,255,255,.12); color:#fff; }
  ._tb-link:active { transform:scale(.97); }
  ._tb-link:focus-visible { outline:2px solid rgba(255,255,255,.7); outline-offset:2px; }

  ._tb-logo {
    height: 52px;
    width: auto;
    max-width: 160px;
    object-fit: contain;
    display: block;
    border-radius: 6px;
    transition: opacity .2s ease, transform .2s ease;
  }
  ._tb-logo-wrap:hover ._tb-logo { opacity:.88; transform:scale(1.03); }

  ._tb-dd-panel {
    animation: _tb-dd-in 0.18s cubic-bezier(.16,1,.3,1) both;
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

// ─── Badge ───────────────────────────────────────────────────────────────────
function NavBadge({ value }: { value: string }) {
  const color = useColorStore((s) => s.color)
  const { stroke } = CHART_COLORS[color]
  return (
    <span style={{
      backgroundColor: stroke,
      boxShadow:       `0 0 0 2px ${stroke}33, 0 0 8px ${stroke}55`,
      color:           '#fff',
      display:         'inline-flex', alignItems:'center', justifyContent:'center',
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
      style={{ position:'fixed', inset:0, zIndex:200, display:'flex', flexDirection:'column' }}
    >
      <div
        onClick={onClose}
        style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.5)', backdropFilter:'blur(3px)' }}
      />
      <div
        className="_tb-modal-panel"
        style={{
          position:'relative', zIndex:1,
          backgroundColor: headerBg,
          padding:'12px 14px 16px',
          boxShadow:'0 8px 32px rgba(0,0,0,0.28)',
        }}
      >
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          backgroundColor:'rgba(255,255,255,.14)',
          borderRadius:10, padding:'8px 14px',
        }}>
          <Search size={16} aria-hidden style={{ color: headerText, opacity:.7, flexShrink:0 }} />
          <input
            ref={inputRef}
            type="search"
            placeholder={t("Rechercher dans l'application…")}
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color: headerText, fontSize:14 }}
          />
          <button onClick={onClose} className="_tb-ibtn" aria-label={t('Fermer')} style={{ width:24, height:24 }}>
            <X size={14} style={{ color: headerText, opacity:.75 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AppTopbar ────────────────────────────────────────────────────────────────
export function AppTopbar() {
  const href      = useLocation({ select: (l) => l.href })
  const firstTeam = sidebarData.teams[0]

  // ── Couleurs dynamiques — Header Color uniquement ──
  const headerColor = useColorStore((s) => s.headerColor)
  const { bg: headerBg, text: headerText } = HEADER_COLORS[headerColor]

  // ROW2 légèrement plus sombre
  const headerBg2 = darken(headerBg, 0.82)
  const accentRgb = hexToRgb(headerBg)

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [logoFailed,       setLogoFailed]       = useState(false)

  const navRef                    = useRef<HTMLDivElement>(null)
  const [leftFade,  setLeftFade]  = useState(false)
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

  const initials = firstTeam.name?.slice(0, 2).toUpperCase() ?? 'AP'

  const fadeBgLeft  = `linear-gradient(to right, ${headerBg2} 20%, transparent)`
  const fadeBgRight = `linear-gradient(to left,  ${headerBg2} 20%, transparent)`

  return (
    <>
      <CSSInjector />
      <MobileSearchModal
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        headerBg={headerBg}
        headerText={headerText}
      />

      <header style={{
        position:        'sticky',
        top:             0,
        zIndex:          50,
        width:           '100%',
        backgroundColor: headerBg,
        color:           headerText,
        borderBottom:    `1px solid rgba(${accentRgb},.25)`,
        boxShadow:       '0 2px 16px rgba(0,0,0,.18)',
        transition:      'background-color .35s ease, border-color .35s ease',
      }}>

        {/* ══ ROW 1 : Logo + contrôles ══ */}
        <div className="_tb-row1" style={{
          display:    'flex',
          alignItems: 'center',
          height:     56,
          gap:        8,
          padding:    '0 12px',
        }}>

          {/* SidebarTrigger — mobile seulement */}
          <SidebarTrigger
            className="_tb-ibtn md:hidden"
            aria-label={t('Ouvrir le menu')}
            style={{ color: headerText, flexShrink: 0 }}
          />

          {/* ── LOGO ── */}
          <div className="_tb-brand _tb-logo-wrap" style={{ flexShrink: 0, lineHeight: 0 }}>
            {!logoFailed ? (
              <img
                src="/src/assets/images/pont.jpeg"
                alt={firstTeam.name}
                className="_tb-logo"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div aria-hidden style={{
                height:          52,
                width:           120,
                borderRadius:    8,
                backgroundColor: 'rgba(255,255,255,.18)',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontSize:        18,
                fontWeight:      700,
                color:           headerText,
                letterSpacing:   '1px',
              }}>
                {initials}
              </div>
            )}
          </div>

          {/* Séparateur vertical */}
          <div aria-hidden style={{
            width:           1,
            height:          28,
            flexShrink:      0,
            backgroundColor: 'rgba(255,255,255,.18)',
          }} />

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* ── Contrôles droite ── */}
          <div className="_tb-ctrl" style={{ display:'flex', alignItems:'center', gap:3 }}>

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
            <ProfileDropdown />
          </div>
        </div>

        {/* ══ ROW 2 : Navigation ══ */}
        <div
          className="_tb-row2"
          style={{
            position:        'relative',
            borderTop:       '1px solid rgba(255,255,255,.10)',
            backgroundColor: headerBg2,
            transition:      'background-color .35s ease',
          }}
        >
          {/* Fade gauche */}
          <div aria-hidden style={{
            position: 'absolute', left:0, top:0, bottom:0, width:24,
            background: fadeBgLeft,
            zIndex:10, pointerEvents:'none',
            opacity: leftFade ? 1 : 0, transition:'opacity .2s ease',
          }} />

          {/* Fade droite */}
          <div aria-hidden style={{
            position: 'absolute', right:0, top:0, bottom:0, width:24,
            background: fadeBgRight,
            zIndex:10, pointerEvents:'none',
            opacity: rightFade ? 1 : 0, transition:'opacity .2s ease',
          }} />

          {/* Nav scrollable */}
          <nav
            ref={navRef}
            className="_tb-scroll"
            aria-label={t('Navigation principale')}
            style={{
              display:    'flex',
              alignItems: 'center',
              height:     48,
              gap:        2,
              padding:    '0 10px',
              overflowX:  'auto',
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
                />
              ))}
          </nav>
        </div>

      </header>
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
        color:           isActive ? headerText : `color-mix(in srgb, ${headerText} 62%, transparent)`,
        backgroundColor: isActive ? 'rgba(255,255,255,.17)' : 'transparent',
        fontWeight:      isActive ? 600 : 400,
        boxShadow:       isActive ? 'inset 0 -2px 0 rgba(255,255,255,.65)' : 'none',
        animation:       `_tb-fade 0.25s ${animDelay}s both`,
      }}
    >
      {item.icon && <item.icon className="size-3.5" aria-hidden />}
      <span>{t(item.title)}</span>
      {item.badge && <NavBadge value={item.badge} />}
    </Link>
  )
}

// ─── NavLink collapsible ──────────────────────────────────────────────────────
function TopNavCollapsible({
  item,
  href,
  animDelay,
  headerText,
}: {
  item: NavCollapsible
  href: string
  animDelay: number
  headerText: string
}) {
  const isActive = item.items.some(
    (sub) => href === sub.url || href.split('?')[0] === sub.url
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="_tb-link"
        aria-haspopup="true"
        style={{
          color:           isActive ? headerText : `color-mix(in srgb, ${headerText} 62%, transparent)`,
          backgroundColor: isActive ? 'rgba(255,255,255,.17)' : 'transparent',
          fontWeight:      isActive ? 600 : 400,
          boxShadow:       isActive ? 'inset 0 -2px 0 rgba(255,255,255,.65)' : 'none',
          outline: 'none',
          animation: `_tb-fade 0.25s ${animDelay}s both`,
        }}
      >
        {item.icon && <item.icon className="size-3.5" aria-hidden />}
        <span>{t(item.title)}</span>
        {item.badge && <NavBadge value={item.badge} />}
        <ChevronDown size={12} aria-hidden style={{ marginLeft: 2, opacity: .55 }} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="min-w-44 _tb-dd-panel"
      >
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
              {sub.badge && (
                <span className="ms-auto">
                  <NavBadge value={sub.badge} />
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────
function TopNavItem({
  item,
  href,
  animDelay,
  headerText,
}: {
  item: NavItem
  href: string
  animDelay: number
  headerText: string
}) {
  if (!item.items)
    return <TopNavLink item={item as NavLink} href={href} animDelay={animDelay} headerText={headerText} />
  return <TopNavCollapsible item={item as NavCollapsible} href={href} animDelay={animDelay} headerText={headerText} />
}