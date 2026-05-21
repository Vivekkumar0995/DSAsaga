"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/bitwise/ui/button"
import { Badge } from "@/components/bitwise/ui/badge"
import { ArrowRight, Zap, Trophy, BookOpen } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/4 translate-x-1/4 rounded-full bg-gradient-to-br from-teal-50 to-teal-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/4 -translate-x-1/4 rounded-full bg-gradient-to-tr from-indigo-50 to-indigo-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Season 1 Live Now
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Master{" "}
            <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">
              Bitwise
            </span>{" "}
            Algorithms
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600"
          >
            Learn, practice, and compete in structured bit manipulation challenges
            from beginner to advanced competitive programming level.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/bitwise/practice">
              <Button
                size="lg"
                className="group h-12 gap-2 rounded-xl bg-teal-500 px-6 text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-500/30"
              >
                <Zap className="h-4 w-4" />
                Start Practice
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/bitwise/battle">
              <Button
                size="lg"
                variant="outline"
                className="group h-12 gap-2 rounded-xl border-slate-200 px-6 text-slate-700 transition-all hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
              >
                <Trophy className="h-4 w-4 text-teal-500" />
                Join Battle
              </Button>
            </Link>
            <Link href="/bitwise/learn">
              <Button
                size="lg"
                variant="ghost"
                className="h-12 gap-2 rounded-xl px-6 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
              >
                <BookOpen className="h-4 w-4" />
                Explore Learning
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-slate-200 pt-8 sm:gap-16"
          >
            {[
              { value: "500+", label: "Problems" },
              { value: "50K+", label: "Active Coders" },
              { value: "100+", label: "Learning Paths" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
