"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Zap, Trophy, Users, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

const battleModes = [
  {
    id: 1,
    title: "Quick Match",
    description: "Practice bitwise problems instantly with timed challenges.",
    icon: Zap,
    time: "5 min",
    color: "bg-teal-500",
    gradient: "from-teal-500 to-teal-600",
    badge: "Popular",
  },
  {
    id: 2,
    title: "Ranked Battle",
    description: "Compete with coders worldwide and climb the leaderboard.",
    icon: Trophy,
    time: "15 min",
    color: "bg-indigo-500",
    gradient: "from-indigo-500 to-indigo-600",
    badge: "Competitive",
  },
  {
    id: 3,
    title: "Friend Challenge",
    description: "Challenge your friends privately with custom problem sets.",
    icon: Users,
    time: "Custom",
    color: "bg-slate-700",
    gradient: "from-slate-600 to-slate-700",
    badge: "Multiplayer",
  },
]

export function BattleSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge className="mb-4 border-indigo-200 bg-indigo-50 text-indigo-700">
            Battle Arena
          </Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Compete & Climb
          </h2>
          <p className="mt-4 text-pretty text-lg text-slate-600">
            Test your bitwise skills against coders from around the world
          </p>
        </div>

        {/* Battle Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {battleModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href="/battles/bitwise/battle">
                <Card className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50">
                  {/* Top Gradient Bar */}
                  <div
                    className={`h-1.5 bg-gradient-to-r ${mode.gradient}`}
                  />

                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl ${mode.color} text-white transition-transform duration-300 group-hover:scale-105`}
                      >
                        <mode.icon className="h-7 w-7" />
                      </div>
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-500"
                      >
                        {mode.badge}
                      </Badge>
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-xl font-semibold text-slate-900">
                      {mode.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-500">
                      {mode.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>{mode.time}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-teal-600 opacity-0 transition-all group-hover:opacity-100"
                      >
                        Play Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
