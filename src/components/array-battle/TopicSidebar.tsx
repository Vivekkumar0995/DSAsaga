"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Swords, BookOpen, Target } from "lucide-react"

const navLinks = [
  { href: "/array-battle", label: "Home", icon: Swords },
  { href: "/array-battle/battle", label: "Battle", icon: Target },
  { href: "/array-battle/practice", label: "Practice", icon: Swords },
  { href: "/array-battle/learn", label: "Learn", icon: BookOpen },
]

export default function TopicSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-20 left-5 z-50 bg-white border border-gray-200 shadow-sm rounded-lg">
        <div className="flex-col items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-700 hover:text-teal-600"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white shadow-sm border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-teal-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
