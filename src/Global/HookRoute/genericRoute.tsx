import { Button } from "@/components/ui/button"
import { CHART_COLORS, useColor } from "@/stores/others/color-store"
import type { LucideIcon } from "lucide-react"
import { useState, type ComponentType, type ReactNode } from "react"

type ActionButtonConfig = {
  title: string
  icon: LucideIcon

  dialogComponent: ComponentType<{
    open: boolean
    onOpenChange: (open: boolean) => void
  }>

  variant?: "default" | "outline"
}

interface PageRouteLayoutProps {
  title: string
  boutonAddTitle?: string
  icon: LucideIcon

  showAddButton?: boolean

  addDialogComponent?: ComponentType<{
    open: boolean
    onOpenChange: (open: boolean) => void
  }>

  listComponent: ComponentType

  extraButtons?: ActionButtonConfig[]
  /** Custom actions rendered before the dialog/extra buttons (e.g. download, import). */
  headerActions?: React.ReactNode
}

export function PageRouteLayout({
  title,
  boutonAddTitle = "Ajouter",
  icon: Icon,
  showAddButton = true,
  addDialogComponent: AddDialog,
  listComponent: ListComponent,
  extraButtons = [],
  headerActions,
}: PageRouteLayoutProps) {

  const [showAddDialog, setShowAddDialog] = useState(false)

  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({})

  const { color } = useColor()
  const { stroke } = CHART_COLORS[color]

  const handleOpenDialog = (key: string, value: boolean) => {
    setOpenDialogs((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 rounded-lg px-6 pb-2">

        {/* TITRE */}
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h3>{title}</h3>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap">

          {headerActions}

          {/* BOUTONS SUPPLÉMENTAIRES */}
          {extraButtons.map((button) => {
            const DialogComponent = button.dialogComponent
            const ButtonIcon = button.icon

            return (
              <div key={button.title}>
                <Button
                  variant={button.variant || "outline"}
                  onClick={() =>
                    handleOpenDialog(button.title, true)
                  }
                  className="cursor-pointer"
                >
                  <ButtonIcon className="mr-2 h-4 w-4" />
                  {button.title}
                </Button>

                <DialogComponent
                  open={!!openDialogs[button.title]}
                  onOpenChange={(open) =>
                    handleOpenDialog(button.title, open)
                  }
                />
              </div>
            )
          })}

          {/* BOUTON AJOUT */}
          {showAddButton && AddDialog && (
            <div>
              <Button
                onClick={() => setShowAddDialog(true)}
                style={{ backgroundColor: stroke }}
                className="cursor-pointer text-white hover:opacity-90 active:scale-100"
              >
                <Icon className="mr-2 h-4 w-4" />
                {boutonAddTitle}
              </Button>

              <AddDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
              />
            </div>
          )}
        </div>
      </div>

      {/* LISTE */}
      <div className="px-4">
        <ListComponent />
      </div>
    </div>
  )
}
