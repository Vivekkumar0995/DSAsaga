"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Progress } from "@/components/searching-techniques/ui/progress"
import { Badge } from "@/components/searching-techniques/ui/badge"
import { Button } from "@/components/searching-techniques/ui/button"
import { Card, CardContent, CardHeader } from "@/components/searching-techniques/ui/card"
import { Clock, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react"
import { courses } from "@/lib/data"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export default function LearnPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mb-10"
          >
            <motion.h1
              variants={fadeInUp}
              transition={smoothTransition}
              className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Learning Hub
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ ...smoothTransition, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Structured paths to master every searching technique
            </motion.p>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <Card className="border-border/50 bg-linear-to-r from-primary/5 to-primary/10 shadow-sm">
              <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    Your Learning Progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Keep up the great work! You&apos;re making excellent progress.
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.4,
                      }}
                      className="text-3xl font-bold text-primary"
                    >
                      13
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      Lessons Done
                    </p>
                  </div>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.5,
                      }}
                      className="text-3xl font-bold text-foreground"
                    >
                      56
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Total Lessons</p>
                  </div>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.6,
                      }}
                      className="text-3xl font-bold text-foreground"
                    >
                      23%
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Courses Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {courses.map((course, index) => {
              const Icon = course.icon
              const progress =
                (course.completedLessons / course.lessonsCount) * 100
              const isComplete = progress === 100

              return (
                <motion.div
                  key={course.id}
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
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${isComplete ? "bg-green-500/10" : "bg-primary/10"}`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                              <Icon className="h-6 w-6 text-primary" />
                            )}
                          </motion.div>
                          <Badge
                            variant={
                              course.difficulty === "Beginner"
                                ? "secondary"
                                : course.difficulty === "Intermediate"
                                  ? "outline"
                                  : "default"
                            }
                            className="font-medium"
                          >
                            {course.difficulty}
                          </Badge>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                          {course.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {course.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {course.lessonsCount} Lessons
                          </span>
                          <span className="font-medium text-foreground">
                            {course.completedLessons}/{course.lessonsCount}
                          </span>
                        </div>
                        <Progress value={progress} className="mb-4 h-2" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {Math.ceil(
                              (course.lessonsCount - course.completedLessons) *
                                0.5
                            )}h left
                          </div>
                          <Button
                            variant={isComplete ? "outline" : "default"}
                            size="sm"
                            className="group/btn gap-1 rounded-xl"
                            asChild
                          >
                            <Link href="#">
                              {isComplete
                                ? "Review"
                                : progress > 0
                                  ? "Continue"
                                  : "Start"}
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
      </div>
    </motion.div>
  )
}
