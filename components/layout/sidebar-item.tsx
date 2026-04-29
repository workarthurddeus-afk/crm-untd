'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'

interface SidebarItemProps {
  href: string
  label: string
  icon: LucideIcon
  collapsed?: boolean
}

// Consumed by the parent's stagger animation (sidebar.tsx injects these via motion.nav variants)
export const sidebarItemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: [0, 0, 0.2, 1] as const },
  },
}

export function SidebarItem({ href, label, icon: Icon, collapsed }: SidebarItemProps) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  const linkEl = (
    <motion.div variants={sidebarItemVariants}>
      <Link
        href={href}
        className={cn(
          // Base
          'group relative flex items-center gap-3 rounded-md text-sm font-medium',
          'transition-colors duration-[220ms]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          // Active vs inactive
          active
            ? 'bg-primary-muted text-text shadow-glow-primary-sm [&_svg]:text-primary'
            : 'text-text-secondary hover:bg-surface-elevated hover:text-text',
          // Expanded vs collapsed sizing
          collapsed
            ? 'mx-auto justify-center px-0 py-2 w-9'
            : 'px-3 py-2'
        )}
      >
        {/* Left accent bar — only when active and expanded */}
        {active && !collapsed && (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-sm bg-primary"
          />
        )}

        <Icon
          className={cn('h-4 w-4 shrink-0', collapsed && 'mx-auto')}
          strokeWidth={1.75}
        />

        {!collapsed && (
          <span className="truncate">{label}</span>
        )}
      </Link>
    </motion.div>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {linkEl}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkEl
}
