import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Workflow,
  Users,
  Target,
  NotebookPen,
  CalendarDays,
  ListChecks,
  Sparkles,
  Megaphone,
  MessageSquareText,
  Settings,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard     },
  { href: '/crm',          label: 'CRM / Pipeline',  icon: Workflow             },
  { href: '/leads',        label: 'Leads',            icon: Users                },
  { href: '/icp',          label: 'ICP & Scoring',    icon: Target               },
  { href: '/notes',        label: 'Notas & Ideias',   icon: NotebookPen          },
  { href: '/calendar',     label: 'Calendário',       icon: CalendarDays         },
  { href: '/tasks',        label: 'Tarefas',          icon: ListChecks           },
  { href: '/social-media', label: 'Social Media',     icon: Sparkles             },
  { href: '/meta-ads',     label: 'Meta Ads',         icon: Megaphone            },
  { href: '/feedbacks',    label: 'Feedbacks',        icon: MessageSquareText    },
  { href: '/settings',     label: 'Configurações',    icon: Settings             },
]

export function findLabel(pathname: string): string {
  const match = navItems.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + '/')
  )
  return match?.label ?? 'UNTD OS'
}
