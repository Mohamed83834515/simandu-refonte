import { cn } from '@/lib/utils'
import logoImg from '@/assets/images/pont.png'

interface LogoProps {
  className?: string
  alt?: string
}

export function Logo({ className, alt = 'SIMADOU' }: LogoProps) {
  return (
    <img
      src={logoImg}
      alt={alt}
      className={cn('size-6 rounded object-cover', className)}
    />
  )
}