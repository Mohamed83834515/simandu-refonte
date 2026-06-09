// components/ui/progress.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, size = 'md', showValue = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const heightClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }
    
    return (
      <div className="relative w-full" ref={ref} {...props}>
        <div className={cn("w-full overflow-hidden rounded-full bg-secondary", heightClasses[size], className)}>
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-xs font-medium">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

Progress.displayName = "Progress"