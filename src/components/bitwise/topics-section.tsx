"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/bitwise/ui/card"
import { Badge } from "@/components/bitwise/ui/badge"
import { Progress } from "@/components/bitwise/ui/progress"
import { 
  Binary, 
  Sparkles, 
  Layers, 
  Shield, 
  Zap, 
  Code2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const topics = [
  {
    id: 1,
    title: "Bitwise Basics",
    description: "Fundamental operations: AND, OR, XOR, NOT",
    icon: Binary,
    difficulty: "Beginner",
    lessons: 8,
    completed: 8,
    color: "bg-teal-500",
  },
  {
    id: 2,
    title: "XOR Techniques",
    description: "Advanced XOR patterns and applications",
    icon: Sparkles,
    difficulty: "Intermediate",
    lessons: 12,
    completed: 7,
    color: "bg-indigo-500",
  },
  {
    id: 3,
    title: "AND OR Operations",
    description: "Mastering AND/OR for bit manipulation",
    icon: Layers,
    difficulty: "Intermediate",
    lessons: 10,
    completed: 4,
    color: "bg-teal-600",
  },
  {
    id: 4,
    title: "Bit Masking",
    description: "Creating and using bit masks effectively",
    icon: Shield,
    difficulty: "Advanced",
    lessons: 10,
    completed: 4,
    color: "bg-slate-700",
  },
  {
    id: 5,
    title: "Power of Two Tricks",
    description: "Efficient power of 2 operations",
    icon: Zap,
    difficulty: "Intermediate",
    lessons: 8,
    completed: 2,
    color: "bg-teal-500",
  },
  {
    id: 6,
    title: "Bit Manipulation Patterns",
    description: "Common patterns in competitive programming",
    icon: Code2,
    difficulty: "Advanced",
    lessons: 14,
    completed: 0,
    color: "bg-indigo-600",
  },
]

const difficultyColors: Record<string, string> = {
  Beginner: "bg-teal-50 text-teal-700 border-teal-200",
  Intermediate: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Advanced: "bg-slate-100 text-slate-700 border-slate-200",
}

export function TopicsSection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge className="mb-4 border-teal-200 bg-teal-50 text-teal-700">
            Learning Paths
          </Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Structured Bitwise Topics
          </h2>
          <p className="mt-4 text-pretty text-lg text-slate-600">
            Master bit manipulation through carefully crafted learning modules
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href="/bitwise/learn">
                <Card className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border-slate-200 bg-white p-6 transition-all duration-300 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5">
                  {/* Icon */}
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${topic.color} text-white transition-transform duration-300 group-hover:scale-110`}
                  >
                    <topic.icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {topic.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${difficultyColors[topic.difficulty]}`}
                      >
                        {topic.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{topic.description}</p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {topic.lessons} lessons
                      </span>
                      <span className="font-medium text-teal-600">
                        {topic.completed}/{topic.lessons} completed
                      </span>
                    </div>
                    <Progress
                      value={(topic.completed / topic.lessons) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ArrowRight className="h-5 w-5 text-teal-500" />
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
