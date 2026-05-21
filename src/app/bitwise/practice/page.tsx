"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BitwiseMenu } from "@/components/bitwise/BitwiseMenu"
import { Card } from "@/components/bitwise/ui/card"
import { Badge } from "@/components/bitwise/ui/badge"
import { Button } from "@/components/bitwise/ui/button"
import { Input } from "@/components/bitwise/ui/input"
import { Progress } from "@/components/bitwise/ui/progress"
import {
  Search,
  Filter,
  Bookmark,
  Clock,
  Zap,
  Star,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"

const difficulties = ["All", "Easy", "Medium", "Hard"]
const categories = [
  "All",
  "XOR",
  "Bit Masking",
  "Power of Two",
  "Toggle Bits",
  "Count Set Bits",
  "Binary Representation",
  "Bit Tricks",
  "Competitive",
]

const problems = [
  {
    id: 1,
    title: "Single Number",
    difficulty: "Easy",
    category: "XOR",
    successRate: 87,
    xp: 50,
    time: "5 min",
    solved: true,
    bookmarked: false,
  },
  {
    id: 2,
    title: "Missing Number XOR",
    difficulty: "Easy",
    category: "XOR",
    successRate: 82,
    xp: 50,
    time: "8 min",
    solved: true,
    bookmarked: true,
  },
  {
    id: 3,
    title: "Count Set Bits",
    difficulty: "Easy",
    category: "Count Set Bits",
    successRate: 79,
    xp: 75,
    time: "10 min",
    solved: false,
    bookmarked: false,
  },
  {
    id: 4,
    title: "Check Power of Two",
    difficulty: "Easy",
    category: "Power of Two",
    successRate: 91,
    xp: 50,
    time: "5 min",
    solved: true,
    bookmarked: false,
  },
  {
    id: 5,
    title: "Toggle ith Bit",
    difficulty: "Medium",
    category: "Toggle Bits",
    successRate: 68,
    xp: 100,
    time: "12 min",
    solved: false,
    bookmarked: true,
  },
  {
    id: 6,
    title: "Find Unique Element",
    difficulty: "Medium",
    category: "XOR",
    successRate: 65,
    xp: 100,
    time: "15 min",
    solved: false,
    bookmarked: false,
  },
  {
    id: 7,
    title: "XOR Range Query",
    difficulty: "Hard",
    category: "XOR",
    successRate: 42,
    xp: 200,
    time: "25 min",
    solved: false,
    bookmarked: false,
  },
  {
    id: 8,
    title: "Subset Sum with Bits",
    difficulty: "Hard",
    category: "Bit Masking",
    successRate: 38,
    xp: 250,
    time: "30 min",
    solved: false,
    bookmarked: true,
  },
  {
    id: 9,
    title: "Reverse Bits",
    difficulty: "Medium",
    category: "Bit Tricks",
    successRate: 58,
    xp: 125,
    time: "15 min",
    solved: false,
    bookmarked: false,
  },
  {
    id: 10,
    title: "Binary Representation",
    difficulty: "Easy",
    category: "Binary Representation",
    successRate: 85,
    xp: 50,
    time: "8 min",
    solved: true,
    bookmarked: false,
  },
]

const difficultyColors: Record<string, string> = {
  Easy: "bg-teal-50 text-teal-700 border-teal-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-rose-50 text-rose-700 border-rose-200",
}

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesDifficulty =
      selectedDifficulty === "All" || problem.difficulty === selectedDifficulty
    const matchesCategory =
      selectedCategory === "All" || problem.category === selectedCategory
    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const solvedCount = problems.filter((p) => p.solved).length
  const totalXP = problems.filter((p) => p.solved).reduce((acc, p) => acc + p.xp, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <BitwiseMenu />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Practice Problems
          </h1>
          <p className="mt-2 text-slate-600">
            Master bitwise operations through carefully crafted challenges
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-xl border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {solvedCount}/{problems.length}
                </p>
                <p className="text-sm text-slate-500">Problems Solved</p>
              </div>
            </div>
            <Progress
              value={(solvedCount / problems.length) * 100}
              className="mt-4 h-2"
            />
          </Card>
          <Card className="rounded-xl border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalXP}</p>
                <p className="text-sm text-slate-500">Total XP Earned</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">XOR Warrior</p>
                <p className="text-sm text-slate-500">Current Rank</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 rounded-xl border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search bitwise problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-slate-200 pl-10"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={
                    selectedDifficulty === diff
                      ? "bg-teal-500 text-white hover:bg-teal-600"
                      : "border-slate-200 text-slate-600"
                  }
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Problems List */}
        <div className="space-y-3">
          {filteredProblems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Card className="group cursor-pointer rounded-xl border-slate-200 bg-white p-4 transition-all hover:border-teal-200 hover:shadow-md">
                <div className="flex items-center gap-4">
                  {/* Status */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      problem.solved
                        ? "bg-teal-50 text-teal-600"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {problem.solved ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="font-mono text-sm font-medium">
                        {problem.id}
                      </span>
                    )}
                  </div>

                  {/* Problem Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">
                        {problem.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${difficultyColors[problem.difficulty]}`}
                      >
                        {problem.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-xs text-slate-500"
                      >
                        {problem.category}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {problem.time}
                      </span>
                      <span>{problem.successRate}% success</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Zap className="h-3.5 w-3.5" />
                        {problem.xp} XP
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className={`rounded-lg p-2 transition-colors ${
                        problem.bookmarked
                          ? "text-amber-500"
                          : "text-slate-300 hover:text-amber-500"
                      }`}
                    >
                      <Bookmark
                        className={`h-5 w-5 ${problem.bookmarked ? "fill-current" : ""}`}
                      />
                    </button>
                    <Button
                      size="sm"
                      className="gap-1 bg-teal-500 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-teal-600"
                    >
                      Solve
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <Card className="rounded-xl border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              No problems found matching your filters.
            </p>
          </Card>
        )}
      </main>
    </div>
  )
}
