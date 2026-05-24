"use client"

import { motion } from "framer-motion"
import { BitwiseMenu } from "@/components/battles/bitwise/BitwiseMenu"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Binary,
  Sparkles,
  Layers,
  Shield,
  Zap,
  Code2,
  BookOpen,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  GraduationCap,
} from "lucide-react"

const learningPaths = [
  {
    id: 1,
    title: "Bitwise Fundamentals",
    description:
      "Master the basics of AND, OR, XOR, NOT, and shift operations. The foundation for all bit manipulation.",
    icon: Binary,
    difficulty: "Beginner",
    lessons: 8,
    completed: 8,
    duration: "2 hours",
    color: "bg-teal-500",
    status: "completed",
  },
  {
    id: 2,
    title: "XOR Mastery",
    description:
      "Deep dive into XOR operations - from basic properties to advanced competitive programming patterns.",
    icon: Sparkles,
    difficulty: "Intermediate",
    lessons: 12,
    completed: 7,
    duration: "4 hours",
    color: "bg-indigo-500",
    status: "in-progress",
  },
  {
    id: 3,
    title: "Bit Masking Deep Dive",
    description:
      "Learn to create and manipulate bit masks for subset enumeration, state compression, and optimization.",
    icon: Shield,
    difficulty: "Advanced",
    lessons: 10,
    completed: 4,
    duration: "5 hours",
    color: "bg-slate-700",
    status: "in-progress",
  },
  {
    id: 4,
    title: "Competitive Bit Tricks",
    description:
      "Collection of essential bit manipulation tricks used in competitive programming and coding interviews.",
    icon: Zap,
    difficulty: "Advanced",
    lessons: 14,
    completed: 0,
    duration: "6 hours",
    color: "bg-teal-600",
    status: "locked",
  },
  {
    id: 5,
    title: "Binary Representation",
    description:
      "Understand how numbers are stored in binary and manipulate them at the lowest level.",
    icon: Layers,
    difficulty: "Beginner",
    lessons: 6,
    completed: 6,
    duration: "1.5 hours",
    color: "bg-teal-500",
    status: "completed",
  },
  {
    id: 6,
    title: "Advanced Bit Manipulation",
    description:
      "Master complex bit manipulation patterns including Gray code, bit reversal, and parallel bit counting.",
    icon: Code2,
    difficulty: "Expert",
    lessons: 16,
    completed: 0,
    duration: "8 hours",
    color: "bg-indigo-600",
    status: "locked",
  },
]

const difficultyColors: Record<string, string> = {
  Beginner: "bg-teal-50 text-teal-700 border-teal-200",
  Intermediate: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Advanced: "bg-slate-100 text-slate-700 border-slate-200",
  Expert: "bg-amber-50 text-amber-700 border-amber-200",
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-teal-500" />,
  "in-progress": <Play className="h-5 w-5 text-indigo-500" />,
  locked: <Lock className="h-5 w-5 text-slate-300" />,
}

export default function LearnPage() {
  const totalLessons = learningPaths.reduce((acc, path) => acc + path.lessons, 0)
  const completedLessons = learningPaths.reduce(
    (acc, path) => acc + path.completed,
    0
  )
  const completedPaths = learningPaths.filter(
    (path) => path.status === "completed"
  ).length

  return (
    <div className="min-h-screen bg-slate-50">
      <BitwiseMenu />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3 border-teal-200 bg-teal-50 text-teal-700">
            Learning Hub
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Structured Learning Paths
          </h1>
          <p className="mt-2 text-slate-600">
            Master every bitwise algorithm through carefully crafted modules
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Card className="rounded-xl border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {completedLessons}/{totalLessons}
                </p>
                <p className="text-sm text-slate-500">Lessons</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {completedPaths}/{learningPaths.length}
                </p>
                <p className="text-sm text-slate-500">Paths Completed</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">12.5h</p>
                <p className="text-sm text-slate-500">Learning Time</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-xl border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round((completedLessons / totalLessons) * 100)}%
                </p>
                <p className="text-sm text-slate-500">Overall Progress</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8 rounded-xl border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Learning Progress</h2>
            <span className="text-sm text-slate-500">
              {completedLessons} of {totalLessons} lessons completed
            </span>
          </div>
          <Progress
            value={(completedLessons / totalLessons) * 100}
            className="h-3"
          />
        </Card>

        {/* Learning Paths Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={`group h-full overflow-hidden rounded-2xl border-slate-200 bg-white transition-all duration-300 ${
                  path.status === "locked"
                    ? "opacity-75"
                    : "cursor-pointer hover:border-teal-200 hover:shadow-lg"
                }`}
              >
                {/* Top Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100">
                  <div
                    className={`h-full ${path.color} transition-all`}
                    style={{
                      width: `${(path.completed / path.lessons) * 100}%`,
                    }}
                  />
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        path.status === "locked" ? "bg-slate-100" : path.color
                      } ${path.status === "locked" ? "text-slate-400" : "text-white"} transition-transform group-hover:scale-105`}
                    >
                      <path.icon className="h-6 w-6" />
                    </div>
                    {statusIcons[path.status]}
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {path.title}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={`mb-3 text-xs ${difficultyColors[path.difficulty]}`}
                    >
                      {path.difficulty}
                    </Badge>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {path.description}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="mb-4 flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {path.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {path.duration}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium text-teal-600">
                        {path.completed}/{path.lessons}
                      </span>
                    </div>
                    <Progress
                      value={(path.completed / path.lessons) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* CTA */}
                  <Button
                    className={`w-full gap-2 ${
                      path.status === "locked"
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : path.status === "completed"
                          ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                          : "bg-teal-500 text-white hover:bg-teal-600"
                    }`}
                    disabled={path.status === "locked"}
                  >
                    {path.status === "locked" ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Locked
                      </>
                    ) : path.status === "completed" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Review
                      </>
                    ) : (
                      <>
                        Continue Learning
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
