import * as React from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'

const dateInputPickerClasses =
  'relative w-full pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:end-0 [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0'

type DateInputProps = Omit<React.ComponentProps<'input'>, 'type'>

function DateInput({ className, ...props }: DateInputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Input type='date' className={dateInputPickerClasses} {...props} />
      <Calendar
        className='pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground'
        aria-hidden
      />
    </div>
  )
}

export { DateInput }
