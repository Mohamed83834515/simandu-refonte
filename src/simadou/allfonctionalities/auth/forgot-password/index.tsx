import { Link, useSearch } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'
import { Logo } from '@/assets/logo'

const CONTENT = {
  setup: {
    title:       'Définir mon mot de passe',
    description: "Entrez votre adresse email. Vous recevrez un lien pour la définition d'un mot de passe.",
    resend:      "Vous n'avez pas reçu l'email ? Vérifiez vos spams ou",
  },
  forgot: {
    title:       'Mot de passe oublié',
    description: 'Entrez votre adresse email. Vous recevrez un lien pour la réinitialisation de votre mot de passe.',
    resend:      "Vous n'avez pas reçu l'email ? Vérifiez vos spams ou",
  },
}

export function ForgotPassword() {
  const { mode } = useSearch({ strict: false }) 
  const ctx = mode === 'setup' ? CONTENT.setup : CONTENT.forgot
  return (
    <AuthLayout>
      <div className='flex min-h-screen w-screen'>

        {/* ── Panneau gauche – branding ── */}
        <div
          className='relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex'
          style={{ background: 'linear-gradient(155deg, #0c0a06 0%, #1a1005 55%, #0e0c08 100%)' }}
        >
          {/* Grille décorative */}
          <div
            className='pointer-events-none absolute inset-0'
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Orbes lumineux */}
          <div
            className='pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full'
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,.22) 0%, transparent 70%)' }}
          />
          <div
            className='pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full'
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,.14) 0%, transparent 70%)' }}
          />
          <div
            className='pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full'
            style={{ background: 'radial-gradient(circle, rgba(217,119,6,.07) 0%, transparent 70%)' }}
          />

          {/* Logo */}
          <div className='relative flex items-center gap-3 p-10 pb-0'>
            <Logo className='size-10 rounded-xl' />
            <span className='text-base font-semibold uppercase tracking-widest text-white/90'>
              SIMADOU
            </span>
          </div>

          {/* ── Illustration SVG : email / reset / clé ── */}
          <div className='relative flex flex-1 items-center justify-center px-10'>
            <svg viewBox="0 0 420 360" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-full max-w-md'>

              {/* Halos de fond */}
              <circle cx="210" cy="168" r="120" fill="rgba(245,158,11,.04)" stroke="rgba(251,191,36,.07)" strokeWidth="1"/>
              <circle cx="210" cy="168" r="88"  fill="rgba(245,158,11,.05)" stroke="rgba(251,191,36,.09)" strokeWidth="1"/>

              {/* Anneau orbital externe — pointillés */}
              <circle cx="210" cy="168" r="148" stroke="rgba(251,191,36,.10)" strokeWidth="1" strokeDasharray="6 5"/>

              {/* ── Enveloppe principale ── */}
              {/* Corps */}
              <rect x="138" y="118" width="144" height="100" rx="10"
                fill="rgba(245,158,11,.12)" stroke="rgba(251,191,36,.4)" strokeWidth="1.5"/>
              {/* Rabat — triangle */}
              <path d="M138 128 L210 178 L282 128"
                stroke="rgba(251,191,36,.5)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
              {/* Lignes de texte simulées dans l'enveloppe */}
              <line x1="158" y1="196" x2="220" y2="196" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="158" y1="206" x2="200" y2="206" stroke="rgba(255,255,255,.08)" strokeWidth="1.5" strokeLinecap="round"/>

              {/* Sceau / badge de sécurité sur l'enveloppe */}
              <circle cx="262" cy="148" r="16"
                fill="rgba(245,158,11,.25)" stroke="rgba(251,191,36,.55)" strokeWidth="1.2"/>
              <path d="M262 140 L264.5 146 L271 146 L266 150 L268 157 L262 153 L256 157 L258 150 L253 146 L259.5 146 Z"
                fill="rgba(251,191,36,.85)"/>

              {/* ── Clé flottante à gauche ── */}
              <g>
                {/* Anneau de la clé */}
                <circle cx="100" cy="148" r="18"
                  fill="rgba(245,158,11,.15)" stroke="rgba(251,191,36,.5)" strokeWidth="1.5"/>
                <circle cx="100" cy="148" r="10"
                  fill="none" stroke="rgba(251,191,36,.35)" strokeWidth="1"/>
                {/* Tige */}
                <line x1="118" y1="148" x2="145" y2="148" stroke="rgba(251,191,36,.6)" strokeWidth="2.5" strokeLinecap="round"/>
                {/* Dents */}
                <line x1="130" y1="148" x2="130" y2="155" stroke="rgba(251,191,36,.6)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="140" y1="148" x2="140" y2="153" stroke="rgba(251,191,36,.6)" strokeWidth="2" strokeLinecap="round"/>
                <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite"/>
              </g>

              {/* ── Cadenas déverrouillé en bas ── */}
              {/* Corps */}
              <rect x="190" y="240" width="40" height="30" rx="6"
                fill="rgba(245,158,11,.18)" stroke="rgba(251,191,36,.5)" strokeWidth="1.2"/>
              {/* Anse ouverte */}
              <path d="M198 240 L198 230 Q198 218 210 218 Q222 218 222 230"
                stroke="rgba(251,191,36,.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Trou de serrure */}
              <circle cx="210" cy="253" r="4.5" fill="rgba(20,12,0,.8)" stroke="rgba(251,191,36,.4)" strokeWidth="1"/>
              <rect x="208.5" y="254" width="3" height="5" rx="1" fill="rgba(20,12,0,.8)"/>

              {/* ── Particules / étoiles ── */}
              {[
                [210, 22], [370, 140], [50, 140], [210, 318],
                [340, 268], [80, 268],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3"
                  fill="rgba(251,191,36,.45)" stroke="rgba(251,191,36,.12)" strokeWidth="4">
                  <animate attributeName="opacity" values=".45;1;.45" dur={`${1.8 + i * 0.35}s`} repeatCount="indefinite"/>
                </circle>
              ))}

              {[[30,50],[395,55],[20,280],[408,275],[30,170],[400,170]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,.25)">
                  <animate attributeName="opacity" values=".25;.8;.25" dur={`${2.2+i*.4}s`} repeatCount="indefinite"/>
                </circle>
              ))}

              {/* ── Lignes de connexion email → particules ── */}
              {[
                [50, 140, 138, 155],
                [370, 140, 282, 148],
                [80, 268, 155, 218],
                [340, 268, 265, 218],
              ].map(([x1,y1,x2,y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(245,158,11,.12)" strokeWidth=".75" strokeDasharray="4 4"/>
              ))}

              {/* ── Card stat gauche : délai ── */}
              <rect x="8" y="58" width="96" height="50" rx="9"
                fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.08)" strokeWidth=".75"/>
              <text x="20" y="78" fill="rgba(255,255,255,.35)" fontSize="8" fontFamily="system-ui,sans-serif">EXPIRATION</text>
              <text x="20" y="96" fill="rgba(251,191,36,.9)" fontSize="16" fontWeight="700" fontFamily="system-ui,sans-serif">15 min</text>

              {/* ── Card stat droite : chiffrement ── */}
              <rect x="318" y="34" width="96" height="50" rx="9"
                fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.08)" strokeWidth=".75"/>
              <text x="330" y="54" fill="rgba(255,255,255,.35)" fontSize="8" fontFamily="system-ui,sans-serif">CHIFFREMENT</text>
              <text x="330" y="72" fill="rgba(251,191,36,.9)" fontSize="16" fontWeight="700" fontFamily="system-ui,sans-serif">AES-256</text>

              {/* ── Pill top ── */}
              <rect x="120" y="10" width="180" height="30" rx="15"
                fill="rgba(180,110,0,.32)" stroke="rgba(251,191,36,.3)" strokeWidth=".75"/>
              <text x="168" y="29" fill="rgba(255,255,255,.9)" fontSize="11" fontWeight="600" fontFamily="system-ui,sans-serif">Réinitialisation 🔑</text>

              {/* ── Checkmark animé ── */}
              <circle cx="210" cy="290" r="14"
                fill="rgba(16,185,129,.13)" stroke="rgba(52,211,153,.35)" strokeWidth="1">
                <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <path d="M203 290 L208 296 L218 285"
                stroke="rgba(52,211,153,.9)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

              {/* ── Floating dots orbitaux ── */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180
                const cx = 210 + 148 * Math.cos(rad)
                const cy = 168 + 148 * Math.sin(rad)
                return (
                  <circle key={i} cx={cx} cy={cy} r="3.5"
                    fill="rgba(245,158,11,.2)" stroke="rgba(251,191,36,.4)" strokeWidth=".75">
                    <animate attributeName="opacity" values=".2;.7;.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite"/>
                  </circle>
                )
              })}
            </svg>
          </div>

          {/* ── Contenu textuel ── */}
          <div className='relative space-y-5 px-10 pb-10'>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-widest' style={{ color: 'rgba(251,191,36,.85)' }}>
                Sécurité du compte
              </p>
              <h2 className='text-2xl font-light leading-snug' style={{ color: 'rgba(255,255,255,.88)' }}>
                Votre sécurité est{' '}
                <span className='font-bold text-white'>notre priorité.</span>
              </h2>
              <p className='text-sm leading-relaxed' style={{ color: 'rgba(255,255,255,.35)' }}>
                Nous vous enverrons un lien sécurisé pour réinitialiser votre
                mot de passe. Le lien expirera dans 15 minutes.
              </p>
            </div>

            {/* Étapes reset */}
            <div className='space-y-3' style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.25rem' }}>
              {[
                { n: '01', label: 'Entrez votre adresse email' },
                { n: '02', label: 'Vérifiez votre boîte de réception' },
                { n: '03', label: 'Créez un nouveau mot de passe' },
              ].map((step) => (
                <div key={step.n} className='flex items-center gap-4'>
                  <span className='text-xs font-bold' style={{ color: 'rgba(251,191,36,.9)' }}>{step.n}</span>
                  <span className='text-sm' style={{ color: 'rgba(255,255,255,.55)' }}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className='relative px-10 pb-6 text-xs' style={{ color: 'rgba(255,255,255,.18)' }}>
            © {new Date().getFullYear()} SIMADOU. Tous droits réservés.
          </p>
        </div>

        {/* ── Panneau droit – formulaire ── */}
        <div className='flex w-full flex-col items-center justify-center bg-white px-6 lg:w-1/2 lg:px-16'>

          {/* Logo mobile */}
          <div className='mb-10 flex items-center gap-3 lg:hidden'>
            <Logo className='size-10 rounded-lg' />
            <span className='text-lg font-semibold tracking-tight'>SIMADOU</span>
          </div>

          <div className='w-full max-w-sm space-y-8'>

            {/* En-tête */}
            <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {ctx.title}
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {ctx.description}
          </p>
        </div>

            {/* Formulaire */}
            <ForgotPasswordForm />

            {/* Séparateur + liens */}
            <div className='space-y-4'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t border-zinc-200' />
                </div>
                <div className='relative flex justify-center text-xs'>
                  <span className='bg-white px-3 text-zinc-400'>ou</span>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-3'>
                <Link
                  to='/sign-in'
                  className='flex items-center justify-center rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50'
                >
                  Se connecter
                </Link>
                {/* <Link
                  to='/sign-up'
                  className='flex items-center justify-center rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50'
                >
                  Créer un compte
                </Link> */}
              </div>
            </div>

            {/* Note sécurité */}
            <p className='text-center text-xs text-zinc-400'>
              Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{' '}
              <button className='underline underline-offset-2 hover:text-zinc-700'>
                renvoyez le lien
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}