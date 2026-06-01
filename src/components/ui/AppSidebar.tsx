'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Swords, GraduationCap, Trophy } from 'lucide-react'
import { snakeToTitleCase } from '@/lib/utils'

type AuthUser = {
  userId?: string;
} | null;

type SidebarProps = {
  initialUser: AuthUser;
};

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/learn', icon: GraduationCap, label: 'Learn' },
  { href: '/practice', icon: BookOpen, label: 'Practice' },
  { href: '/battle', icon: Swords, label: 'Battle' },
  { href: '/main/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/main/profile', icon: Home, label: 'Profile' },
]

export default function Sidebar({ initialUser }: SidebarProps) {
  const pathname = usePathname()
  const pathParts = pathname.split('/').filter(Boolean)
  const currentTopic = pathParts[0] || ''

  const topicBasePath = `/${currentTopic}`
  const topicName = snakeToTitleCase(currentTopic);

  // Update nav links based on the current topic if we are inside one
  const contextualNavItems = currentTopic
    ? navItems.map(item => {
        if (item.href === '/') {
          return {
            ...item,
            href: topicBasePath
          }
        }

        if (item.href === '/main/profile' || item.href === '/main/leaderboard') {
          return item
        }

        return {
          ...item,
          href: `${topicBasePath}${item.href}`
        }
      })
    : navItems;

  return (
    <aside className="w-64 border-r border-[#E5E7EB] bg-white hidden lg:flex flex-col relative shrink-0">
      <div className="sticky top-28 h-[calc(100vh-7rem)] flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {topicName ? topicName.charAt(0) : 'S'}
            </span>
          </div>
          <span className="font-bold text-[#111827] text-base">{topicName || 'DSA Saga'}</span>
        </Link>
      </div>

      {/* Season badge */}
      <div className="px-6 py-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse inline-block" />
          Season 3 Live Now
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {contextualNavItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== `/${currentTopic}` && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#D1FAE5] text-[#10B981]'
                  : 'text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div className="px-6 py-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white text-sm font-bold uppercase">
            {initialUser?.userId ? 'U' : 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111827] truncate">
              {initialUser?.userId ? 'Signed in' : 'Guest'}
            </p>
            <p className="text-xs text-[#6B7280]">{initialUser?.userId ? 'Account connected' : 'Not signed in'}</p>
          </div>
        </div>
      </div>
      </div>
    </aside>
  )
}
