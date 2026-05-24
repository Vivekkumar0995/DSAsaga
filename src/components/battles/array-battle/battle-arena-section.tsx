"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {Users, Clock, Trophy, Zap } from "lucide-react"

const battleModes = [
  {
    icon: Zap,
    title: "Unranked Match",
    description: "Jump into a 5-minute battle instantly",
    time: "5 min",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Trophy,
    title: "Ranked Battle",
    description: "Do it competitively",
    time: "15 min",
    color: "from-teal-500 to-green-500",
  },
  {
    icon: Users,
    title: "Friend Challenge",
    description: "Challenge a friend with a custom room code",
    time: "custom",
    color: "from-purple-500 to-pink-500",
  }
]

export function BattleArenaSection() {
  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              Array and <span className="text-[#14b8a6]">Vectors</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose your battleground and prove your algorithmic prowess
            </p>
          </motion.div>
        </div>

        {/* Battle Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-1">
          {battleModes.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href="/battles/array-battle/battle">
                <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-2xl p-6 h-full cursor-pointer group transition-shadow">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <mode.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{mode.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="text-gray-700">{mode.time}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
