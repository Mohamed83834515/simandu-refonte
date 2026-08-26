import { useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'

const CARTO_URL = 'https://carto.ruche-sectoriel.net/?showHeader=false&showFooter=false'

export default function CartographieView() {
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden transition-all duration-300 h-[calc(100vh-160px)] min-h-[600px]
        }`}
    >
      {/* Zone Iframe et chargement */}
      <div className="relative flex-1 w-full h-full bg-card">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xs gap-3">
            <Loader2 className="h-9 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Chargement de la cartographie...</p>
              <p className="text-xs text-muted-foreground">Veuillez patienter pendant l'initialisation du SIG.</p>
            </div>
          </div>
        )}

        <iframe
          src={CARTO_URL}
          title="Cartographie Sectorielle"
          className="w-full h-full border-0 rounded-b-xl"
          onLoad={() => setIsLoading(false)}
          allow="geolocation; microphone; camera; encrypted-media; midi; accelerometer; gyroscope"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
        />
      </div>
    </div>
  )
}
