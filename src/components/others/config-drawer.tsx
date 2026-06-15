import { useCallback, useState } from 'react'
import {
  CircleCheck,
  RotateCcw,
  Settings,
  CheckCheck,
  PanelLeft,
  PanelTop,
  Rows3,
  ChevronDown,
} from 'lucide-react'
import {
  useColor,
} from '@/stores/others/color-store'
import { useDirection } from '@/stores/others/direction-store'
import {
  type NavMode,
  type SubNavMode,
  useLayout,
} from '@/stores/others/layout-store'
import { useTheme } from '@/stores/others/theme-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebar } from '../ui/sidebar'

// ─── Reset confirmation hook ──────────────────────────────────────────────────

function useResetConfirmation(durationMs = 1500) {
  const [confirmed, setConfirmed] = useState(false)

  const trigger = useCallback(() => {
    setConfirmed(true)
    const id = setTimeout(() => setConfirmed(false), durationMs)
    return () => clearTimeout(id)
  }, [durationMs])

  return { confirmed, trigger }
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetDir } = useDirection()
  const resetTheme = useTheme((s) => s.resetTheme)
  const resetLayout = useLayout((s) => s.resetLayout)
  const resetColor = useColor((s) => s.resetColor)
  const resetColor2 = useColor((s) => s.resetColor2)
  const resetHeaderColor = useColor((s) => s.resetHeaderColor)
  const { confirmed, trigger } = useResetConfirmation()

  const handleReset = useCallback(() => {
    setOpen(true)
    resetDir()
    resetTheme()
    resetLayout()
    resetColor()
    resetColor2()
    resetHeaderColor()
    trigger()
  }, [
    setOpen,
    resetDir,
    resetTheme,
    resetLayout,
    resetColor,
    resetColor2,
    resetHeaderColor,
    trigger,
  ])

  return (
    <TooltipProvider delayDuration={300}>
      <Sheet>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                size='icon'
                variant='ghost'
                aria-label='Open theme settings'
                className='rounded-full transition-colors hover:bg-muted/60'
              >
                <Settings aria-hidden='true' className='size-4' />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='text-xs'>
            Theme settings
          </TooltipContent>
        </Tooltip>

        <SheetContent
          className='flex flex-col gap-0 border-l border-border/60 p-0'
          aria-describedby='drawer-description'
        >
          <a
            href='#drawer-footer'
            className='sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-1 focus:text-sm focus:text-primary-foreground'
          >
            Skip to reset button
          </a>

          <SheetHeader className='space-y-0.5 border-b border-border/50 px-6 pt-6 pb-5 text-start'>
            <div className='flex items-center justify-between'>
              <SheetTitle className='text-sm font-semibold tracking-tight'>
                Theme Settings
              </SheetTitle>
            </div>
            <SheetDescription
              id='drawer-description'
              className='font-mono text-xs tracking-wide text-muted-foreground'
            >
              Choisir le thème
            </SheetDescription>
          </SheetHeader>

          <div
            role='status'
            aria-live='polite'
            aria-atomic='true'
            className='sr-only'
            id='settings-status'
          />

          <div className='flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent space-y-7 overflow-y-auto px-6 py-6'>
            <NavModeConfig />
            {/* <HeaderColorConfig /> */}
            {/* <ThemeConfig /> */}
            {/* <ColorConfig /> */}
          </div>

          <SheetFooter
            id='drawer-footer'
            className='border-t border-border/50 px-6 py-4'
          >
            <Button
              variant='destructive'
              onClick={handleReset}
              aria-label='Reset all settings to default values'
              aria-live='polite'
              className={cn(
                'h-9 w-full rounded-xl border text-xs font-medium tracking-wide shadow-none transition-all duration-300',
                confirmed
                  ? 'border-green-500/40 bg-green-500/15 text-green-600 hover:bg-green-500/20'
                  : 'border-destructive/25 bg-destructive/10 text-destructive hover:border-destructive/40 hover:bg-destructive/20'
              )}
            >
              <span className='flex items-center gap-1.5'>
                {confirmed ? (
                  <>
                    <CheckCheck className='size-3.5' aria-hidden='true' />
                    Settings reset!
                  </>
                ) : (
                  'Reset all settings'
                )}
              </span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              size='icon'
              variant='secondary'
              className='size-[18px] rounded-full border border-border bg-muted/60 transition-colors hover:border-primary/50 hover:text-primary'
              onClick={onReset}
              aria-label={resetAriaLabel}
            >
              <RotateCcw className='size-[9px]' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='right' className='text-[11px]'>
            {resetAriaLabel ?? 'Reset to default'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

// ─── RadioGroupItem ───────────────────────────────────────────────────────────

// function RadioGroupItem({
//   item,
//   isTheme = false,
// }: {
//   item: {
//     value: string
//     label: string
//     icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
//   }
//   isTheme?: boolean
// }) {
//   return (
//     <Item
//       value={item.value}
//       className={cn('group outline-none', 'transition duration-200 ease-in')}
//       aria-label={`Select ${item.label.toLowerCase()}`}
//       aria-describedby={`${item.value}-description`}
//     >
//       <div
//         className={cn(
//           'relative overflow-hidden rounded-xl ring-[1.5px] ring-border',
//           'group-data-[state=checked]:shadow-[0_0_0_1px_hsl(var(--primary)),0_4px_20px_hsl(var(--primary)/0.2)] group-data-[state=checked]:ring-primary',
//           'group-focus-visible:ring-2',
//           'transition-all duration-200'
//         )}
//         role='img'
//         aria-hidden='false'
//         aria-label={`${item.label} option preview`}
//       >
//         <CircleCheck
//           className={cn(
//             'size-5 fill-primary stroke-white',
//             'group-data-[state=unchecked]:hidden',
//             'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
//           )}
//           aria-hidden='true'
//         />
//         <item.icon
//           className={cn(
//             !isTheme &&
//               'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
//           )}
//           aria-hidden='true'
//         />
//       </div>
//       <div
//         className='mt-1.5 text-[11px] font-medium text-muted-foreground transition-colors group-data-[state=checked]:text-foreground'
//         id={`${item.value}-description`}
//         aria-live='polite'
//       >
//         {item.label}
//       </div>
//     </Item>
//   )
// }

//NavModeConfig

function NavModeConfig() {
  const navMode = useLayout((s) => s.navMode)
  const defaultNavMode = useLayout((s) => s.defaultNavMode)
  const setNavMode = useLayout((s) => s.setNavMode)

  // SubNavMode (horizontal row vs dropdown) — visible uniquement en mode topbar
  const subNavMode = useLayout((s) => s.subNavMode)
  const defaultSubNavMode = useLayout((s) => s.defaultSubNavMode)
  const setSubNavMode = useLayout((s) => s.setSubNavMode)
  const resetSubNavMode = useLayout((s) => s.resetSubNavMode)

  const navOptions: {
    value: NavMode
    label: string
    icon: React.ElementType
    description: string
  }[] = [
      {
        value: 'sidebar',
        label: 'Sidebar',
        icon: PanelLeft,
        description: 'Navigation latérale',
      },
      {
        value: 'topbar',
        label: 'Topbar',
        icon: PanelTop,
        description: 'Navigation horizontale',
      },
    ]

  const subNavOptions: {
    value: SubNavMode
    label: string
    icon: React.ElementType
    description: string
  }[] = [
      {
        value: 'horizontal',
        label: 'Horizontal',
        icon: Rows3,
        description: 'Sous-menu en ligne',
      },
      {
        value: 'dropdown',
        label: 'Dropdown',
        icon: ChevronDown,
        description: 'Menu déroulant',
      },
    ]

  return (
    <div className='space-y-4'>
      {/* ── Mode principal ── */}
      <div>
        <SectionTitle
          title='Navigation'
          showReset={navMode !== defaultNavMode}
          onReset={() => setNavMode(defaultNavMode)}
          resetAriaLabel='Reset navigation mode to default'
        />
        <div
          className='grid grid-cols-2 gap-2'
          role='radiogroup'
          aria-label='Select navigation mode'
        >
          {navOptions.map(({ value, label, icon: Icon, description }) => {
            const isActive = navMode === value
            return (
              <button
                key={value}
                type='button'
                role='radio'
                aria-checked={isActive}
                aria-label={`Navigation mode: ${label}`}
                onClick={() => setNavMode(value)}
                className={cn(
                  'flex flex-col items-center gap-2.5 rounded-xl border p-3.5 text-center',
                  'transition-all duration-200 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  isActive
                    ? 'border-primary bg-primary/8 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-primary/15' : 'bg-muted'
                  )}
                >
                  <Icon className='size-4' aria-hidden='true' />
                </div>
                <div>
                  <div className='text-xs leading-none font-semibold'>
                    {label}
                  </div>
                  <div className='mt-1 text-[10px] leading-tight opacity-60'>
                    {description}
                  </div>
                </div>
                {isActive && (
                  <CircleCheck
                    className='size-3.5 fill-primary stroke-white'
                    aria-hidden='true'
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Style du sous-menu (visible seulement en mode topbar) ── */}
      {navMode === 'topbar' && (
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-border/50 bg-muted/30 p-3',
            'transition-all duration-300'
          )}
        >
          <div className='mb-2.5 flex items-center justify-between'>
            <span className='font-mono text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase'>
              Style sous-menu
            </span>
            {subNavMode !== defaultSubNavMode && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    size='icon'
                    variant='secondary'
                    className='size-[18px] rounded-full border border-border bg-muted/60 transition-colors hover:border-primary/50 hover:text-primary'
                    onClick={resetSubNavMode}
                    aria-label='Reset sub-navigation style'
                  >
                    <RotateCcw className='size-[9px]' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='right' className='text-[11px]'>
                  Reset sub-navigation style
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div
            className='grid grid-cols-2 gap-2'
            role='radiogroup'
            aria-label='Select sub-navigation style'
          >
            {subNavOptions.map(({ value, label, icon: Icon, description }) => {
              const isActive = subNavMode === value
              return (
                <button
                  key={value}
                  type='button'
                  role='radio'
                  aria-checked={isActive}
                  aria-label={`Sub-navigation style: ${label}`}
                  onClick={() => setSubNavMode(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-3 text-center',
                    'transition-all duration-200 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                    isActive
                      ? 'border-primary bg-primary/8 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]'
                      : 'border-border/60 text-muted-foreground hover:border-primary/30 hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-md transition-colors',
                      isActive ? 'bg-primary/15' : 'bg-muted'
                    )}
                  >
                    <Icon className='size-3.5' aria-hidden='true' />
                  </div>
                  <div>
                    <div className='text-[11px] leading-none font-semibold'>
                      {label}
                    </div>
                    <div className='mt-1 text-[10px] leading-tight opacity-60'>
                      {description}
                    </div>
                  </div>
                  {isActive && (
                    <CircleCheck
                      className='size-3 fill-primary stroke-white'
                      aria-hidden='true'
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── HeaderColorConfig ────────────────────────────────────────────────────────

// function HeaderColorConfig() {
//   const headerColor = useColor((s) => s.headerColor)
//   const defaultHeaderColor = useColor((s) => s.defaultHeaderColor)
//   const setHeaderColor = useColor((s) => s.setHeaderColor)
//   const resetHeaderColor = useColor((s) => s.resetHeaderColor)
//
//   const entries = useMemo(
//     () =>
//       Object.entries(HEADER_COLORS) as [
//         HeaderColorKey,
//         { bg: string; text: string; label: string },
//       ][],
//     []
//   )
//
//   const handleChange = useCallback(
//     (key: HeaderColorKey) => {
//       setHeaderColor(key)
//       const el = document.getElementById('settings-status')
//       if (el)
//         el.textContent = `Header color changed to ${HEADER_COLORS[key].label}`
//     },
//     [setHeaderColor]
//   )
//
//   return (
//     <div>
//       <SectionTitle
//         title='Header Color'
//         showReset={headerColor !== defaultHeaderColor}
//         onReset={resetHeaderColor}
//         resetAriaLabel='Reset header color to default'
//       />
//       <div
//         className='flex flex-wrap gap-2.5'
//         role='radiogroup'
//         aria-label='Select header color'
//       >
//         {entries.map(([key, { bg, label }]) => (
//           <Tooltip key={key}>
//             <TooltipTrigger asChild>
//               <button
//                 type='button'
//                 role='radio'
//                 aria-label={`Select ${label} header color`}
//                 aria-checked={headerColor === key}
//                 onClick={() => handleChange(key)}
//                 className={cn(
//                   'relative size-[30px] rounded-full transition-transform duration-200',
//                   'hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
//                   headerColor === key && 'ring-2 ring-offset-2'
//                 )}
//                 style={{
//                   backgroundColor: bg,
//                   // @ts-expect-error CSS variable
//                   '--tw-ring-color': bg,
//                 }}
//               >
//                 {headerColor === key && (
//                   <CircleCheck
//                     className='absolute inset-0 m-auto size-[14px] fill-transparent stroke-white'
//                     strokeWidth={2.5}
//                     aria-hidden='true'
//                   />
//                 )}
//               </button>
//             </TooltipTrigger>
//             <TooltipContent side='bottom' className='text-[11px]'>
//               {label}
//             </TooltipContent>
//           </Tooltip>
//         ))}
//       </div>
//     </div>
//   )
// }

// ─── ColorSwatchRow ───────────────────────────────────────────────────────────

// function ColorSwatchRow({
//   label,
//   selected,
//   defaultSelected,
//   onSelect,
//   onReset,
//   resetAriaLabel,
// }: {
//   label: string
//   selected: ChartColorKey
//   defaultSelected: ChartColorKey
//   onSelect: (key: ChartColorKey) => void
//   onReset: () => void
//   resetAriaLabel: string
// }) {
//   const colorEntries = useMemo(
//     () =>
//       Object.entries(CHART_COLORS) as [
//         ChartColorKey,
//         { stroke: string; label: string },
//       ][],
//     []
//   )
//
//   const handleSelect = useCallback(
//     (key: ChartColorKey) => {
//       onSelect(key)
//       const el = document.getElementById('settings-status')
//       if (el)
//         el.textContent = `${label} color changed to ${CHART_COLORS[key].label}`
//     },
//     [onSelect, label]
//   )
//
//   return (
//     <div className='space-y-2'>
//       <div className='flex items-center justify-between'>
//         <span className='flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground'>
//           <span
//             className='inline-block size-2.5 rounded-full ring-1 ring-border/60 transition-colors duration-200'
//             style={{ backgroundColor: CHART_COLORS[selected].stroke }}
//             aria-hidden='true'
//           />
//           {label}
//         </span>
//
//         {selected !== defaultSelected && (
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button
//                 type='button'
//                 size='icon'
//                 variant='secondary'
//                 className='size-[18px] rounded-full border border-border bg-muted/60 transition-colors hover:border-primary/50 hover:text-primary'
//                 onClick={onReset}
//                 aria-label={resetAriaLabel}
//               >
//                 <RotateCcw className='size-[9px]' />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent side='right' className='text-[11px]'>
//               {resetAriaLabel}
//             </TooltipContent>
//           </Tooltip>
//         )}
//       </div>
//
//       <div
//         className='flex flex-wrap gap-2'
//         role='radiogroup'
//         aria-label={`Select ${label} color`}
//       >
//         {colorEntries.map(([key, { stroke, label: colorLabel }]) => (
//           <Tooltip key={key}>
//             <TooltipTrigger asChild>
//               <button
//                 type='button'
//                 role='radio'
//                 aria-label={`Select ${colorLabel}`}
//                 aria-checked={selected === key}
//                 onClick={() => handleSelect(key)}
//                 className={cn(
//                   'relative size-[28px] rounded-full transition-transform duration-200',
//                   'hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
//                   selected === key && 'ring-2 ring-offset-2'
//                 )}
//                 style={{
//                   backgroundColor: stroke,
//                   // @ts-expect-error CSS variable
//                   '--tw-ring-color': stroke,
//                 }}
//               >
//                 {selected === key && (
//                   <CircleCheck
//                     className='absolute inset-0 m-auto size-[13px] fill-transparent stroke-white'
//                     strokeWidth={2.5}
//                     aria-hidden='true'
//                   />
//                 )}
//               </button>
//             </TooltipTrigger>
//             <TooltipContent side='bottom' className='text-[11px]'>
//               {colorLabel}
//             </TooltipContent>
//           </Tooltip>
//         ))}
//       </div>
//     </div>
//   )
// }

// ─── ColorConfig ──────────────────────────────────────────────────────────────

// function ColorConfig() {
//   const color = useColor((s) => s.color)
//   const defaultColor = useColor((s) => s.defaultColor)
//   const setColor = useColor((s) => s.setColor)
//   const resetColor = useColor((s) => s.resetColor)
//
//   const color2 = useColor((s) => s.color2)
//   const defaultColor2 = useColor((s) => s.defaultColor2)
//   const setColor2 = useColor((s) => s.setColor2)
//   const resetColor2 = useColor((s) => s.resetColor2)
//
//   const isModified = color !== defaultColor || color2 !== defaultColor2
//
//   return (
//     <div>
//       <SectionTitle
//         title='Chart Colors'
//         showReset={isModified}
//         onReset={() => {
//           resetColor()
//           resetColor2()
//         }}
//         resetAriaLabel='Reset all chart colors to default'
//       />
//
//       <div className='space-y-4'>
//         <ColorSwatchRow
//           label='Desktop'
//           selected={color}
//           defaultSelected={defaultColor}
//           onSelect={setColor}
//           onReset={resetColor}
//           resetAriaLabel='Reset Desktop color'
//         />
//
//         <div className='border-t border-border/40' />
//
//         <ColorSwatchRow
//           label='Mobile'
//           selected={color2}
//           defaultSelected={defaultColor2}
//           onSelect={setColor2}
//           onReset={resetColor2}
//           resetAriaLabel='Reset Mobile color'
//         />
//       </div>
//     </div>
//   )
// }

// ─── ThemeConfig ──────────────────────────────────────────────────────────────

// function ThemeConfig() {
//   const theme = useTheme((s) => s.theme)
//   const defaultTheme = useTheme((s) => s.defaultTheme)
//   const setTheme = useTheme((s) => s.setTheme)
//   const themeItems = useMemo(
//     () => [
//       { value: 'light', label: 'Light', icon: IconThemeLight },
//       { value: 'dark', label: 'Dark', icon: IconThemeDark },
//     ],
//     []
//   )
//   const handleThemeChange = useCallback(
//     (value: string) => {
//       setTheme(value as 'light' | 'dark')
//       const el = document.getElementById('settings-status')
//       if (el) el.textContent = `Theme changed to ${value}`
//     },
//     [setTheme]
//   )
//   return (
//     <div>
//       <SectionTitle
//         title='Theme'
//         showReset={theme !== defaultTheme}
//         onReset={() => setTheme(defaultTheme)}
//         resetAriaLabel='Reset theme preference to default'
//       />
//       <Radio
//         value={theme}
//         onValueChange={handleThemeChange}
//         className='grid w-full max-w-md grid-cols-3 gap-3'
//         aria-label='Select theme preference'
//         aria-describedby='theme-description'
//       >
//         {themeItems.map((item) => (
//           <RadioGroupItem key={item.value} item={item} isTheme />
//         ))}
//       </Radio>
//       <div id='theme-description' className='sr-only'>
//         Choose between system preference, light mode, or dark mode
//       </div>
//     </div>
//   )
// }
