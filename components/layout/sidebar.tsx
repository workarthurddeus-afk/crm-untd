'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useUIStore } from '@/lib/stores'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'
import { SidebarItem } from './sidebar-item'
import { navItems } from './nav-items'

// Stagger parent: runs once on mount, children animate in sequence
const navVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
}

// UNTD glyph mark — a minimal diamond/spark in primary color
function UNTDGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Outer diamond */}
      <path
        d="M12 2L20 12L12 22L4 12Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.9"
      />
      {/* Inner spark */}
      <path
        d="M12 7L15.5 12L12 17L8.5 12Z"
        fill="currentColor"
        className="text-background"
        opacity="0.7"
      />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-primary" />
    </svg>
  )
}

export function Sidebar() {
  // Hydration guard: always render expanded on SSR, rehydrate on client
  const [mounted, setMounted] = useState(false)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Before hydration — always show expanded to match SSR, suppress width transition
  const isCollapsed = mounted && collapsed

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-surface overflow-hidden',
        // Width transition with spring easing — only after mount to avoid SSR flash
        mounted
          ? 'transition-[width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
          : '',
        isCollapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-border shrink-0',
          isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-4'
        )}
      >
        <UNTDGlyph className="shrink-0" />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
            className="font-display text-lg font-bold tracking-tight text-text whitespace-nowrap overflow-hidden"
          >
            UNTD OS
          </motion.span>
        )}
      </div>

      {/* Nav list — stagger runs once on mount */}
      {reducedMotion ? (
        <nav className={cn('flex-1 space-y-0.5 py-2', isCollapsed ? 'px-1' : 'px-2')}>
          {navItems.map((item) => (
            <SidebarItem key={item.href} {...item} collapsed={isCollapsed} />
          ))}
        </nav>
      ) : (
        <motion.nav
          variants={navVariants}
          initial="hidden"
          animate="show"
          className={cn('flex-1 space-y-0.5 py-2', isCollapsed ? 'px-1' : 'px-2')}
        >
          {navItems.map((item) => (
            <SidebarItem key={item.href} {...item} collapsed={isCollapsed} />
          ))}
        </motion.nav>
      )}

      {/* Footer: collapse toggle */}
      <div className="shrink-0 border-t border-border p-2">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="w-full"
                aria-label="Expandir sidebar"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Expandir sidebar
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="w-full"
            aria-label="Colapsar sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  )
}
