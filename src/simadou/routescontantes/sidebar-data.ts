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
  Handshake,
  Briefcase,
  MapPin,
  FileStack,
  BarChart2,
  Target,
  LineChart,
  TrendingUp,
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
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        // {
        //   title: 'Apps',
        //   url: '/apps',
        //   icon: Package,
        // },
        // {
        //   title: 'Users',
        //   url: '/users',
        //   icon: Users,
        // },

        // ── Paramétrage ──────────────────────────────────────
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
              title: 'Unités de gestion',
              url: '/parametrage/unites-de-gestion',
              icon: LayoutGrid,
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
              title: 'Fonctions',
              url: '/parametrage/fonctions',
              icon: Briefcase
              ,
            },
            {
              title: 'Partenaire Financier',
              url: '/parametrage/partenaire-financier',
              icon: Handshake,
            },
            {
              title: 'Zone de Collecte',
              url: '/parametrage/zone-de-collecte',
              icon: MapPin,
            },
            // {
            //   title: 'Conventions',
            //   url: '/parametrage/conventions',
            //   icon: FileText,
            // },
            {
              title: 'Plans de Site',
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
          title: 'Politique',
          icon: FileStack,
          items: [
            {
              title: 'Liste des politiques et stratégies',
              url: '/programme/liste',
              icon: FileStack,
            },
            {
              title: 'Cadre analytique',
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
              title: 'Indicateurs du CMR',
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
              title: 'Liste des projets',
              url: '/programmation/projets',
              icon: FolderOpen,
            },
            {
              title: 'PTBA',
              url: '/programmation/ptba',
              icon: ClipboardList,
            },
            {
              title: 'Suivi du PTBA',
              url: '/programmation/suivi-ptba',
              icon: Eye,
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
