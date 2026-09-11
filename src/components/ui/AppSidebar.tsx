'use client'

import Link from 'next/link'
import { Home, BookOpen, Swords, GraduationCap, Trophy } from 'lucide-react'
import { snakeToTitleCase } from '@/lib/utils'
import { useCurrentPathTill } from '@/lib/client_utils'


const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/learn', icon: GraduationCap, label: 'Learn' },
  { href: '/practice', icon: BookOpen, label: 'Practice' },
  { href: '/battle', icon: Swords, label: 'Battle' },
  { href: '/main/leaderboard', icon: Trophy, label: 'Leaderboard' },
]

export default function Sidebar() {
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //                                              WRONG
  // This pattern of usePathname() with so many other redundant things can't be abstracted into a function as that
  // would break the order of react hooks if any react hook is used after this due to memoization by the React compiler.
  // One way to actually abstract this is to put the function containing usePathname at last but that's too much care
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


  // Actually its not completely wrong. If we name the function anything except like `useSomething` then it would
  // break for sure. That's when the react compiler can't know that it is a hook and can use a hook internally.
  // But if we name the function `useSomething`, the Linter treats it the same way as a hook. Anyway, this
  // `useCurrentPathTill` is called a custom hook.

  
  const pathParts = useCurrentPathTill(0);
  const pathname = pathParts.join("/");
  const topicBasePath = `/${pathParts[0]}`
  const currentDS = pathParts[0]
  const topicName = snakeToTitleCase(currentDS);

  // Update nav links based on the current topic if we are inside one
  const contextualNavItems = currentDS
    ? navItems.map(item => {
        if (item.href === '/') {
          return {
            ...item,
            href: topicBasePath
          }
        }

        if (item.href === '/main/leaderboard') {
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
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {topicName ? topicName.charAt(0) : 'S'}
            </span>
          </div>
          <span className="font-bold text-[#111827] text-base">{topicName || 'DSA Saga'}</span>
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
          const active = pathname === href || (href !== `/${currentDS}` && pathname.startsWith(href))
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

      </div>
    </aside>
  )
}
