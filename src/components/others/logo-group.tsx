import logo1 from '@/assets/images/logo1.png'
import logo2 from '@/assets/images/logo2.png'
import logo3 from '@/assets/images/logo3.png'
import { cn } from '@/lib/utils'

interface LogoGroupProps {
  className?: string
  logoHeight?: number | string
}

export function LogoGroup({ className, logoHeight = 40 }: LogoGroupProps) {
  const logos = [
    { src: logo1, alt: 'Logo 1' },
    { src: logo2, alt: 'Logo 2' },
    { src: logo3, alt: 'Logo 3' },
  ]

  return (
    <div className={cn('flex items-center justify-center gap-6 py-2', className)}>
      {logos.map((logo, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg bg-background/5 p-1 transition-all duration-300 hover:bg-background/10 hover:shadow-md"
        >
          <img
            src={logo.src}
            alt={logo.alt}
            style={{ height: logoHeight, width: 'auto' }}
            className="object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  )
}
