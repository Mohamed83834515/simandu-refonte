import { Link, useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'
import { Logo } from '@/assets/logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangleIcon, ArrowRight, KeyRound } from 'lucide-react'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <div className='flex min-h-screen w-screen'>

        {/* ── Panneau gauche – branding ── */}
        <div className='relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex'
          style={{ background: 'linear-gradient(160deg, #070c1a 0%, #0a1120 55%, #091525 100%)' }}
        >
          {/* Grille décorative */}
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Orbes lumineux */}
          <div className='pointer-events-none absolute -bottom-28 -left-28 h-96 w-96 rounded-full'
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,.28) 0%, transparent 70%)' }} />
          <div className='pointer-events-none absolute -right-16 top-16 h-72 w-72 rounded-full'
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,.16) 0%, transparent 70%)' }} />
          <div className='pointer-events-none absolute left-1/3 top-1/2 h-48 w-48 rounded-full'
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,.09) 0%, transparent 70%)' }} />

          {/* Logo */}
          <div className='relative flex items-center gap-3 p-10 pb-0'>
            <Logo className='size-10 rounded-xl' />
            <span className='text-base font-semibold tracking-widest text-white/90 uppercase'>
              SIMADOU
            </span>
          </div>

          {/* ── Illustration SVG centrale ── */}
          <div className='relative flex flex-1 items-center justify-center px-10'>
            <svg viewBox="0 0 420 360" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-full max-w-md'>

              {/* Sol / horizon */}
              <ellipse cx="210" cy="330" rx="175" ry="16" fill="rgba(37,99,235,.07)" />

              {/* Silhouette de fond */}
              <rect x="22" y="210" width="16" height="120" rx="2" fill="rgba(255,255,255,.035)" />
              <rect x="42" y="192" width="20" height="138" rx="2" fill="rgba(255,255,255,.045)" />
              <rect x="362" y="205" width="17" height="125" rx="2" fill="rgba(255,255,255,.035)" />
              <rect x="343" y="188" width="16" height="142" rx="2" fill="rgba(255,255,255,.045)" />

              {/* Tour gauche */}
              <rect x="68" y="148" width="52" height="182" rx="4" fill="rgba(29,78,216,.25)" stroke="rgba(99,149,255,.18)" strokeWidth="1" />
              {[148,168,188,208,228,248,268,288].map((y, i) => (
                <g key={y}>
                  <rect x="76" y={y+4} width="10" height="13" rx="2" fill={`rgba(99,149,255,${.2 + (i%3)*.15})`} />
                  <rect x="92" y={y+4} width="10" height="13" rx="2" fill={`rgba(99,149,255,${.35 + (i%2)*.2})`} />
                  <rect x="108" y={y+4} width="4" height="13" rx="2" fill={`rgba(99,149,255,${.15 + (i%4)*.1})`} />
                </g>
              ))}
              <line x1="94" y1="148" x2="94" y2="126" stroke="rgba(99,149,255,.38)" strokeWidth="1.5" />
              <circle cx="94" cy="123" r="3.5" fill="rgba(99,210,255,.95)">
                <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Tour droite */}
              <rect x="296" y="124" width="56" height="206" rx="4" fill="rgba(29,78,216,.2)" stroke="rgba(99,149,255,.14)" strokeWidth="1" />
              {[124,144,164,184,204,224,244,264,284].map((y, i) => (
                <g key={y}>
                  <rect x="304" y={y+5} width="10" height="13" rx="2" fill={`rgba(99,149,255,${.25+(i%3)*.15})`} />
                  <rect x="320" y={y+5} width="10" height="13" rx="2" fill={`rgba(99,149,255,${.15+(i%2)*.25})`} />
                  <rect x="336" y={y+5} width="8" height="13" rx="2" fill={`rgba(99,149,255,${.3+(i%4)*.1})`} />
                </g>
              ))}
              <line x1="324" y1="124" x2="324" y2="98" stroke="rgba(99,149,255,.32)" strokeWidth="1.5" />
              <circle cx="324" cy="95" r="3.5" fill="rgba(99,210,255,.95)">
                <animate attributeName="opacity" values="1;0.25;1" dur="2.6s" repeatCount="indefinite" />
              </circle>

              {/* Tour centrale — flagship */}
              <rect x="160" y="62" width="100" height="268" rx="6" fill="rgba(37,99,235,.18)" stroke="rgba(100,160,255,.22)" strokeWidth="1.5" />
              {[66,88,110,132,154,176,198,220,242,264,286].map((y, i) => (
                <g key={y}>
                  <rect x="168" y={y} width="13" height="16" rx="2" fill={`rgba(99,149,255,${.2+(i%3)*.18})`} />
                  <rect x="187" y={y} width="13" height="16" rx="2" fill={`rgba(99,149,255,${.35+(i%2)*.2})`} />
                  <rect x="206" y={y} width="13" height="16" rx="2" fill={`rgba(99,149,255,${.15+(i%4)*.12})`} />
                  <rect x="225" y={y} width="9" height="16" rx="2" fill={`rgba(99,149,255,${.28+(i%3)*.14})`} />
                </g>
              ))}
              {/* Flèche / spire */}
              <polygon points="210,26 220,62 200,62" fill="rgba(99,149,255,.28)" />
              <line x1="210" y1="26" x2="210" y2="8" stroke="rgba(99,149,255,.5)" strokeWidth="2" />
              <circle cx="210" cy="5" r="4.5" fill="rgba(99,225,255,1)">
                <animate attributeName="opacity" values="1;0.15;1" dur="1.7s" repeatCount="indefinite" />
              </circle>

              {/* Courbe de croissance */}
              <path d="M 50 300 Q 115 272 158 244 Q 200 216 245 184 Q 288 152 370 118"
                stroke="rgba(34,197,94,.7)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 50 300 Q 115 272 158 244 Q 200 216 245 184 Q 288 152 370 118 L 370 330 L 50 330 Z"
                fill="rgba(34,197,94,.055)" />
              {[[158,244],[245,184],[330,136]].map(([cx,cy],i) => (
                <circle key={i} cx={cx} cy={cy} r="4.5" fill="rgba(34,197,94,.9)" stroke="rgba(34,197,94,.25)" strokeWidth="7" />
              ))}

              {/* Card stat — gauche */}
              <rect x="10" y="78" width="84" height="46" rx="8" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.1)" strokeWidth=".75" />
              <text x="22" y="98" fill="rgba(255,255,255,.4)" fontSize="8.5" fontFamily="system-ui,sans-serif">CROISSANCE</text>
              <text x="22" y="114" fill="rgba(99,210,255,.95)" fontSize="16" fontWeight="700" fontFamily="system-ui,sans-serif">+24%</text>

              {/* Card stat — droite */}
              <rect x="328" y="50" width="84" height="46" rx="8" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.1)" strokeWidth=".75" />
              <text x="340" y="70" fill="rgba(255,255,255,.4)" fontSize="8.5" fontFamily="system-ui,sans-serif">PROJETS</text>
              <text x="340" y="86" fill="rgba(167,139,250,.95)" fontSize="16" fontWeight="700" fontFamily="system-ui,sans-serif">340+</text>

              {/* Pill top */}
              <rect x="138" y="10" width="144" height="30" rx="15" fill="rgba(37,99,235,.38)" stroke="rgba(99,149,255,.35)" strokeWidth=".75" />
              <text x="185" y="30" fill="rgba(255,255,255,.92)" fontSize="11" fontWeight="600" fontFamily="system-ui,sans-serif">Simadou 2040 🌍</text>

              {/* Étoiles scintillantes */}
              {[[40,44],[378,72],[28,252],[390,240],[55,170],[390,170]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,.4)">
                  <animate attributeName="opacity" values=".4;1;.4" dur={`${2+i*.45}s`} repeatCount="indefinite"/>
                </circle>
              ))}

              {/* Lignes de connexion entre tours */}
              <line x1="120" y1="220" x2="160" y2="220" stroke="rgba(99,149,255,.15)" strokeWidth=".75" strokeDasharray="4 4"/>
              <line x1="260" y1="220" x2="296" y2="220" stroke="rgba(99,149,255,.15)" strokeWidth=".75" strokeDasharray="4 4"/>
            </svg>
          </div>

          {/* Citation + stats */}
          <div className='relative space-y-5 px-10 pb-10'>
            <blockquote className='space-y-2'>
              <p className='text-2xl font-light leading-snug' style={{ color: 'rgba(255,255,255,.88)' }}>
                "La prospérité commence par{' '}
                <span className='font-bold text-white'>une bonne décision.</span>"
              </p>
              <footer className='text-xs uppercase tracking-widest' style={{ color: 'rgba(255,255,255,.28)' }}>
                Programme Simadou 2040
              </footer>
            </blockquote>

            {/* Stats */}
            <div className='flex gap-8' style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.25rem' }}>
              {[
                { label: 'Utilisateurs', value: '10k+' },
                { label: 'Projets', value: '340+' },
                { label: 'Satisfaction', value: '98%' },
              ].map((s) => (
                <div key={s.label}>
                  <p className='text-xl font-bold text-white'>{s.value}</p>
                  <p className='text-xs' style={{ color: 'rgba(255,255,255,.3)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer gauche */}
          <p className='relative px-10 pb-6 text-xs' style={{ color: 'rgba(255,255,255,.18)' }}>
            © {new Date().getFullYear()} SIMANDOU. Tous droits réservés.
          </p>
        </div>

        {/* ── Panneau droit – formulaire ── */}
        <div className='flex w-full flex-col items-center justify-center bg-white px-6 lg:w-1/2 lg:px-16'>

          {/* Logo mobile uniquement */}
          <div className='mb-10 flex items-center gap-3 lg:hidden'>
            <Logo className='size-10 rounded-lg' />
            <span className='text-lg font-semibold tracking-tight'>SIMANDOU</span>
          </div>

          <div className='w-full max-w-sm space-y-8'>

            {/* En-tête */}
           <div className="space-y-5">
      <div className="space-y-1">
       
        <h1 className="text-2xl font-medium tracking-tight">
          Connectez-vous à votre compte
        </h1>
      </div>

      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5
                      dark:border-amber-800 dark:bg-amber-950">
        <KeyRound
          className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Première connexion ?
          </p>
          <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-300">
            Définissez en deux clicks votre mot de passe afin de continuer .
          </p>
          <Link
            to="/forgot-password"
            search={{ mode: 'setup' }} 
            className="inline-flex items-center gap-1 text-sm font-medium
                       text-amber-800 underline underline-offset-4
                       hover:no-underline dark:text-amber-200"
          >
            Définir mon mot de passe
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        </div>
      </div>
    </div>

            {/* Formulaire — logique inchangée */}
            <UserAuthForm redirectTo={redirect} />

            {/* Séparateur + inscription */}
            {/* <div className='space-y-3'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t border-zinc-100' />
                </div>
                <div className='relative flex justify-center text-xs'>
                  <span className='bg-white px-3 text-zinc-400'>
                    Nouveau sur SIMADOU ?
                  </span>
                </div>
              </div>

              <Link
                to='/forgot-password'
                className='flex w-full items-center justify-center rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 group gap-3'
              >
                Définissez un mot de passe de connexion

                <ArrowRight className='group-hover:translate-x-1 duration-600' />
              </Link>
            </div> */}

            {/* CGU */}
            <p className='text-center text-xs text-zinc-400'>
              En vous connectant, vous acceptez nos{' '}
              <a href='/terms' className='underline underline-offset-2 hover:text-zinc-700'>
                Conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href='/privacy' className='underline underline-offset-2 hover:text-zinc-700'>
                Politique de confidentialité
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}