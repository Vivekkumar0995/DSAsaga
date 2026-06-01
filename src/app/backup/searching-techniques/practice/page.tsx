"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Clock,
  Star,
  Bookmark,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { problems, difficultyTopics } from "@/lib/data"
import { fadeInUp, staggerContainer, smoothTransition } from "@/lib/motion"

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [difficulty, setDifficulty] = useState("all")
  const [topic, setTopic] = useState("All Topics")
  const [bookmarked, setBookmarked] = useState<string[]>([])

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesDifficulty =
      difficulty === "all" ||
      problem.difficulty.toLowerCase() === difficulty.toLowerCase()
    const matchesTopic = topic === "All Topics" || problem.topic === topic

    return matchesSearch && matchesDifficulty && matchesTopic
  })

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

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
              Practice Problems
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ ...smoothTransition, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Sharpen your searching skills with curated problems
            </motion.p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-11 w-35 rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="h-11 w-45 rounded-xl">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyTopics.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Problem List */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  layout
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ ...smoothTransition, delay: index * 0.05 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="p-0">
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10"
                            >
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            </motion.div>
                            <div>
                              <div className="mb-1 flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {problem.name}
                                </h3>
                                <Badge
                                  variant={
                                    problem.difficulty === "Easy"
                                      ? "secondary"
                                      : problem.difficulty === "Medium"
                                        ? "outline"
                                        : "default"
                                  }
                                  className="text-xs"
                                >
                                  {problem.difficulty}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                                  {problem.topic}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {problem.successRate}% success
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {problem.estimatedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:shrink-0">
                            <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                              +{problem.xp} XP
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleBookmark(problem.id)}
                              className="rounded-lg p-2 hover:bg-secondary"
                            >
                              <Bookmark
                                className={`h-5 w-5 ${bookmarked.includes(problem.id) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                              />
                            </motion.button>
                            <Button
                              size="sm"
                              className="group gap-1 rounded-xl"
                            >
                              Solve
                              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProblems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <p className="text-lg text-muted-foreground">
                No problems found matching your criteria
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
