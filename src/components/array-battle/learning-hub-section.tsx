"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { BookOpen, Play, CheckCircle, ChevronRight } from "lucide-react"

const tracks = [
  {
    title: "Array Fundamentals",
    lessons: 12,
    completed: 8,
    difficulty: "Beginner",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Two Pointer Technique",
    lessons: 8,
    completed: 3,
    difficulty: "Intermediate",
    color: "from-teal-500 to-cyan-500",
  },
  {
    title: "Sliding Window",
    lessons: 10,
    completed: 0,
    difficulty: "Intermediate",
    color: "from-blue-500 to-indigo-500",
  },
]

export function LearningHubSection() {
  return (
    <section className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              Learning <span className="text-[#14b8a6]">Hub</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Structured paths to master every algorithm
            </p>
          </motion.div>
        </div>

        {/* Learning Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tracks.map((track, i) => (
            <motion.div
              key={track.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href="/array-battle/learn">
                <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-2xl p-6 transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center`}>
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      track.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                      track.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {track.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{track.title}</h3>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{track.lessons} lessons</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {track.completed}/{track.lessons}
                    </span>
                  </div>


                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${track.color} rounded-full transition-all`}
                      ref={(el) => { if (el) el.style.width = `${(track.completed / track.lessons) * 100}%`; }}
                    />
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/array-battle/learn">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-900 font-semibold"
            >
              <Play className="w-5 h-5 text-teal-600" />
              Explore All Tracks
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  )
}
