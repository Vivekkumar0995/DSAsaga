"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="absolute -left-1/4 top-0 h-150 w-150 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -right-1/4 top-1/3 h-125 w-125 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-0 left-1/2 h-100 w-100 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative mx-auto max-w-5xl text-center"
      >
        {/* Badge */}
        <motion.div
          variants={fadeInUp}
          transition={smoothTransition}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            The #1 Platform for Search Algorithms
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeInUp}
          transition={{ ...smoothTransition, delay: 0.1 }}
          className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Master{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Searching
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-1 left-0 h-3 w-full origin-left rounded-full bg-primary/20"
            />
          </span>{" "}
          Techniques
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          transition={{ ...smoothTransition, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl"
        >
          Learn, practice, and compete in structured searching challenges from
          beginner to advanced competitive programming level.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeInUp}
          transition={{ ...smoothTransition, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="group h-12 gap-2 rounded-xl px-6 shadow-lg shadow-primary/20"
              asChild
            >
              <Link href="/battles/searching-techniques/practice">
                <Play className="h-4 w-4" />
                Start Practice
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 rounded-xl px-6"
              asChild
            >
              <Link href="/battles/searching-techniques/battle">Join Battle</Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
              size="lg"
              variant="ghost"
              className="h-12 gap-2 rounded-xl px-6"
              asChild
            >
              <Link href="/battles/searching-techniques/learn">Explore Learning</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeInUp}
          transition={{ ...smoothTransition, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { value: "50K+", label: "Active Learners" },
            { value: "200+", label: "Problems" },
            { value: "15+", label: "Search Techniques" },
            { value: "98%", label: "Success Rate" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm"
            >
              <div className="text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
