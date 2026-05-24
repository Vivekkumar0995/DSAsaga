"use client"

import { motion } from "framer-motion"
import { MessageCircle, Activity } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer @ Google",
    content: "String Battle helped me master pattern matching and ace interviews.",
    avatar: "S",
  },
  {
    name: "Marcus Johnson",
    role: "CS Student",
    content: "Competing on focused string problems made practice much more engaging.",
    avatar: "M",
  },
  {
    name: "Priya Patel",
    role: "Full Stack Developer",
    content: "The learning tracks are well-structured — progressed quickly from basics to KMP.",
    avatar: "P",
  },
]

const liveActivity = [
  { user: "StringNinja42", action: "won a ranked battle", time: "2m ago" },
  { user: "AlgoQueen", action: "completed Pattern Matching track", time: "5m ago" },
  { user: "ByteMaster", action: "reached Diamond rank", time: "8m ago" },
  { user: "DevWarrior", action: "solved 50 problems", time: "12m ago" },
]

export function CommunitySection() {
  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-emerald-50 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
              Join the <span className="text-[#14b8a6]">String Community</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Connect with coders worldwide and grow together
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Testimonials */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-600" />
              What Coders Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white shadow-sm border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{t.content}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-teal-600" />
              Live Activity
            </h3>
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 space-y-4">
              {liveActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="text-sm">
                      <span className="text-teal-600 font-medium">{item.user}</span>
                      <span className="text-gray-600"> {item.action}</span>
                    </p>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
