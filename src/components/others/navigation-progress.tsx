import { useRouterState } from '@tanstack/react-router'

export function NavigationProgress() {
  const state = useRouterState()
  const isPending = state.status === 'pending'

  if (!isPending) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'relative', width: 80, height: 80 }}>

        {/* Anneau extérieur — vert */}
        <svg
          viewBox='0 0 120 120'
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animation: 'np-spin-cw 3s linear infinite',
            transformOrigin: 'center',
          }}
        >
          <circle
            cx='60' cy='60' r='54'
            fill='none'
            stroke='#10B981'
            strokeWidth='5'
            strokeDasharray='200 140'
            strokeLinecap='round'
          />
        </svg>

        {/* Anneau intermédiaire: rouge, sens inverse */}
        <svg
          viewBox='0 0 120 120'
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animation: 'np-spin-ccw 2s linear infinite',
            transformOrigin: 'center',
          }}
        >
          <circle
            cx='60' cy='60' r='40'
            fill='none'
            stroke='#EF4444'
            strokeWidth='5'
            strokeDasharray='150 101'
            strokeLinecap='round'
          />
        </svg>

        {/* Anneau intérieur:  jaune */}
        <svg
          viewBox='0 0 120 120'
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animation: 'np-spin-cw 1.2s linear infinite',
            transformOrigin: 'center',
          }}
        >
          <circle
            cx='60' cy='60' r='26'
            fill='none'
            stroke='#F59E0B'
            strokeWidth='5'
            strokeDasharray='90 73'
            strokeLinecap='round'
          />
        </svg>
      </div>

      <style>{`
        @keyframes np-spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes np-spin-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}