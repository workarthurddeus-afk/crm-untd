'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { useUIStore } from '@/lib/stores'
import { findLabel } from './nav-items'

export function Topbar() {
  const pathname = usePathname()
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCommandPaletteOpen])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      {/* Page label — wayfinding only, not the page h1 */}
      <span className="font-display text-base font-semibold text-text select-none">
        {findLabel(pathname)}
      </span>

      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Abrir busca (⌘K)"
        className="
          flex items-center gap-2 rounded-md border border-border
          bg-surface-elevated px-3 py-1.5 text-xs text-text-muted
          transition-colors duration-[150ms]
          hover:border-primary/50 hover:text-text
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-primary/40 focus-visible:ring-offset-1
          focus-visible:ring-offset-background
        "
      >
        <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span>Buscar...</span>
        <kbd className="ml-1 rounded-sm border border-border-subtle bg-background px-1.5 py-0.5 font-mono text-[10px] leading-none">
          ⌘K
        </kbd>
      </button>
    </header>
  )
}
