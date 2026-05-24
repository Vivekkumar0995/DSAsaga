"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"
import { battleModes } from "@/lib/data"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export function BattleSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            transition={smoothTransition}
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Battle Modes
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ ...smoothTransition, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Choose your challenge and compete with developers worldwide
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {battleModes.map((mode, index) => {
            const Icon = mode.icon

            return (
              <motion.div
                key={mode.id}
                variants={fadeInUp}
                transition={{ ...smoothTransition, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group relative h-full overflow-hidden border-border/50 bg-card shadow-sm transition-shadow hover:shadow-lg">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/5 to-transparent"
                    />
                    <CardHeader className="pb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary ${mode.color}`}
                      >
                        <Icon className="h-7 w-7" />
                      </motion.div>
                      <h3 className="mt-4 text-xl font-semibold text-foreground">
                        {mode.name}
                      </h3>
                      <p className="text-muted-foreground">{mode.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {mode.time}
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="group/btn gap-1 rounded-xl"
                          asChild
                        >
                          <Link href="/battles/searching-techniques/battle">
                            Play
                            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
