'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Dumbbell, LayoutGrid, Menu, Swords, Trophy, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Overview', href: '/battles/searching-techniques', icon: LayoutGrid },
  { name: 'Battle', href: '/battles/searching-techniques/battle', icon: Swords },
  { name: 'Practice', href: '/battles/searching-techniques/practice', icon: Dumbbell },
  { name: 'Learn', href: '/battles/searching-techniques/learn', icon: BookOpen },
  { name: 'Leaderboard', href: '/battles/searching-techniques/leaderboard', icon: Trophy },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href ||
          (item.href !== '/battles/searching-techniques' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function TechniquesSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <div className="fixed left-4 top-4 z-50">
        <Button
          variant="secondary"
          size="icon"
          className="h-15 w-15 cursor-pointer rounded-2xl border border-border/60 bg-background shadow-lg mt-20 ml-5"
          aria-label="Open searching techniques menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 size-10" />}
        </Button>

        {isMobileMenuOpen && (
          <div className="absolute left-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-xl">

            <div className="px-2 py-2">
              <NavLinks onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
