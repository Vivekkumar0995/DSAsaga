"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X, Home, Zap, Play, BookOpen, Award } from "lucide-react"

const menuItems = [
  { href: "/battles/bitwise", label: "Overview", icon: Home },
  { href: "/battles/bitwise/battle", label: "Battle", icon: Zap },
  { href: "/battles/bitwise/practice", label: "Practice", icon: Play },
  { href: "/battles/bitwise/learn", label: "Learn", icon: BookOpen },
  { href: "/battles/bitwise/leaderboard", label: "Leaderboard", icon: Award },
]

export function BitwiseMenu() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed left-9 top-25 z-50">
      <button
        type="button"
        aria-label="Open Bitwise menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-15 w-15 items-center justify-center rounded-2xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg shadow-slate-200/60 backdrop-blur transition-transform hover:scale-105 hover:bg-white"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-200/70 backdrop-blur-xl"
          >
            {/* Header removed as requested */}
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-teal-500 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {(() => {
                      const Icon = item.icon
                      return (
                        <Icon
                          className={`h-5 w-5 ${active ? "text-white" : "text-slate-500"}`}
                        />
                      )
                    })()}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
