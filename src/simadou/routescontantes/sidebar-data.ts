import {
  LayoutDashboard,
  Command,
  Settings,
  UserCog,
  ClipboardList,
  BookOpen,
  FolderOpen,
  CalendarDays,
  Eye,
  LayoutGrid,
  User,
  SlidersHorizontal,
  MapPin,
  FileStack,
  BarChart2,
  Target,
  FileSignature,
  LineChart,
  TrendingUp,
  FileBarChart,
  ListChecks,
  Wallet,
  ClipboardCheck,
  List,
} from 'lucide-react'
import { type SidebarData } from '../../components/layout/others/types'

export const sidebarData: SidebarData = {
  user: {
    name: "Simadou",
    email: "hello@gmail.com",
    id: "zofmov",
    statut: 1
  },
  teams: [
    {
      name: 'SIMANDOU',
      logo: Command,
      plan: 'agriculture',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Tableau de bord',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Paramétrage',
          icon: Settings,
          items: [
            {
              title: 'Localités',
              url: '/parametrage/localites',
              icon: MapPin,
            },

            {
              title: 'Acteurs',
              url: '/parametrage/acteurs',
              icon: User,
            },
            {
              title: 'Utilisateurs',
              url: '/parametrage/utilisateurs',
              icon: UserCog,
            },
            {
              title: 'Unités de gestion',
              url: '/parametrage/unites-de-gestion',
              icon: LayoutGrid,
            },
            // {
            //   title: 'Partenaire Financier',
            //   url: '/parametrage/partenaire-financier',
            //   icon: Handshake,
            // },
            {
              title: 'Cadre Organique du MINAGRI',
              url: '/parametrage/plans-de-site',
              icon: ClipboardList,
            },
            {
              title: 'Dictionnaire des indicateurs',
              url: '/parametrage/dictionnaire-indicateurs',
              icon: BookOpen,
            },
            {
              title: 'Autres paramétrages',
              url: '/parametrage/autres',
              icon: SlidersHorizontal,
            },
          ],
        },

        // ── Politique ─────────────────────────────────────────
        {
          title: 'Plans Stratégiques',
          icon: FileStack,
          items: [
            {
              title: 'Liste des programmes',
              url: '/programme/liste',
              icon: FileStack,
            },
            {
              title: 'CDMT',
              url: '/programme/cadre-analytique',
              icon: BarChart2,
            },
            {
              title: 'Cadre stratégique',
              url: '/programme/cadre-strategique',
              icon: Target,
            },
            {
              title: 'Indicateurs stratégiques',
              url: '/programme/indicateurs-performance',
              icon: LineChart,
            },
            {
              title: 'Cadre des mésures de resultats',
              url: '/programme/indicateurs-cmr',
              icon: TrendingUp,
            }
          ],
        },

        // ── Programmation ─────────────────────────────────────
        {
          title: 'Programmation',
          icon: CalendarDays,
          items: [

            {
              title: 'Plans d\'Actions Opérationnels',
              url: '/programmation/ptba',
              icon: ClipboardList,
            },
            {
              title: 'Contrats de performance',
              url: '/programmation/contrat-performance',
              icon: FileSignature,
            },
            {
              title: 'Paramétrage des marchés',
              url: '/programmation/parametrage-marches',
              icon: List,
            },
            {
              title: 'PPMS',
              url: '/programmation/ppms',
              icon: FileStack,
            },
          ],
        },
        // ── Projet ─────────────────────────────────────
        {
          title: 'Projets / Programmes',
          icon: CalendarDays,
          items: [
            {
              title: 'Liste des projets',
              url: '/projet-programme/projets',
              icon: FolderOpen,
            },

            {
              title: 'Zones agro-écologiques',
              url: '/projet-programme/zone-de-collecte',
              icon: MapPin,
            },

          ],
        },

        // ── Suivi des résultats ───────────────────────────────
        {
          title: 'Suivi des résultats',
          icon: ClipboardCheck,
          items: [
            {
              title: 'Suivi des indicateurs',
              url: '/suivi-resultats/suivi-indicateurs',
              icon: LineChart,
            },
            {
              title: 'Suivi du Plan d\'Action Opérationnel',
              url: '/suivi-resultats/suivi-ptba',
              icon: Eye,
            },
            {
              title: 'Cartographie',
              url: 'https://guinee.sygcip.com/',
              icon: MapPin,
            },
          ],
        },

        // ── Rapport ───────────────────────────────────────────
        {
          title: 'Etats et Rapports',
          icon: FileBarChart,
          items: [
            {
              title: 'Plans d\'Actions Opérationnels',
              url: '/rapport/ptba',
              icon: ClipboardList,
            },
            {
              title: 'Avancement des activités',
              url: '/rapport/etat-des-activites',
              icon: ListChecks,
            },
            {
              title: 'Suivi budgétaire',
              url: '/rapport/decaissement',
              icon: Wallet,
            },
            {
              title: 'Suivi des indicateurs',
              url: '/rapport/indicateurs',
              icon: LineChart,
            },
          ],
        },
      ],
    },

    // {
    //   title: 'Pages',
    //   items: [
    //     {
    //       title: 'Auth',
    //       icon: ShieldCheck,
    //       items: [
    //         {
    //           title: 'Sign In',
    //           url: '/sign-in',
    //         },
    //         {
    //           title: 'Sign Up',
    //           url: '/sign-up',
    //         },
    //         {
    //           title: 'Forgot Password',
    //           url: '/forgot-password',
    //         },
    //         {
    //           title: 'OTP',
    //           url: '/otp',
    //         },
    //       ],
    //     },
    //   ],
    // },

    // {
    //   title: 'Other',
    //   items: [
    //     {
    //       title: 'Help Center',
    //       url: '/help-center',
    //       icon: HelpCircle,
    //     },
    //   ],
    // },
  ],
}
