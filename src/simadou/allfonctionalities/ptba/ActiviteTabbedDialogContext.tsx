import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'

type ActiviteTabbedDialogContextValue = {
  activeTab: string
  setSubViewActive: (active: boolean) => void
  setToolbarAction: (action: ReactNode | null) => void
}

const ActiviteTabbedDialogContext =
  createContext<ActiviteTabbedDialogContextValue | null>(null)

export function ActiviteTabbedDialogProvider({
  activeTab,
  setSubViewActive,
  setToolbarAction,
  children,
}: ActiviteTabbedDialogContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ activeTab, setSubViewActive, setToolbarAction }),
    [activeTab, setSubViewActive, setToolbarAction]
  )

  return (
    <ActiviteTabbedDialogContext.Provider value={value}>
      {children}
    </ActiviteTabbedDialogContext.Provider>
  )
}

export function useActiviteTabbedSubView(active: boolean) {
  const ctx = useContext(ActiviteTabbedDialogContext)

  useEffect(() => {
    if (!ctx) return
    ctx.setSubViewActive(active)
    return () => ctx.setSubViewActive(false)
  }, [active, ctx])
}

export function useActiviteTabbedToolbarAction(
  tabValue: string,
  action: ReactNode | null,
  enabled = true
) {
  const ctx = useContext(ActiviteTabbedDialogContext)

  useEffect(() => {
    if (!ctx || ctx.activeTab !== tabValue) return

    if (!enabled || !action) {
      ctx.setToolbarAction(null)
      return
    }

    ctx.setToolbarAction(action)
    return () => ctx.setToolbarAction(null)
  }, [ctx, tabValue, enabled, action])
}

export function ActiviteTabbedSubViewHeader({
  sectionLabel,
  className,
}: {
  sectionLabel: string
  className?: string
}) {
  return (
    <p
      className={
        className ??
        'border-b px-6 py-3 text-sm font-medium text-muted-foreground'
      }
    >
      {sectionLabel}
    </p>
  )
}
