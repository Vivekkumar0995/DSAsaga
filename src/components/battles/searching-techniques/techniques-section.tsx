"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Clock, ArrowRight } from "lucide-react"
import { searchTechniques } from "@/lib/data"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export function TechniquesSection() {
  return (
    <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
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
            Searching Techniques
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ ...smoothTransition, delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Master every search algorithm from the fundamentals to advanced
            competitive patterns
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {searchTechniques.map((technique, index) => {
            const Icon = technique.icon
            const progress =
              (technique.completedLessons / technique.lessonsCount) * 100

            return (
              <motion.div
                key={technique.id}
                variants={fadeInUp}
                transition={{ ...smoothTransition, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group h-full overflow-hidden border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                        >
                          <Icon className="h-6 w-6 text-primary" />
                        </motion.div>
                        <Badge
                          variant={
                            technique.difficulty === "Beginner"
                              ? "secondary"
                              : technique.difficulty === "Intermediate"
                                ? "outline"
                                : "default"
                          }
                          className="font-medium"
                        >
                          {technique.difficulty}
                        </Badge>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">
                        {technique.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {technique.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {technique.lessonsCount} Lessons
                        </span>
                        <span className="font-medium text-foreground">
                          {technique.completedLessons}/{technique.lessonsCount}{" "}
                          Completed
                        </span>
                      </div>
                      <Progress value={progress} className="mb-4 h-2" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {technique.estimatedTime}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group/btn gap-1"
                        >
                          {progress > 0 ? "Continue" : "Start"}
                          <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
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
