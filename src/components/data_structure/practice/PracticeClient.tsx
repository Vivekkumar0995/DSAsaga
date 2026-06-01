"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search, Bookmark, BookmarkCheck, Clock, CheckCircle, Circle, CircleDot } from "lucide-react"
import { Data_Structure_Props } from "@/types/data_structure"


// const problems = [
//   { id: 1, title: "Two Sum", difficulty: "Easy", category: "Array Fundamentals", solved: true, bookmarked: false, acceptance: "49%", time: "~10 min" },
//   { id: 2, title: "Remove Duplicates from Sorted Array", difficulty: "Easy", category: "Two Pointers", solved: true, bookmarked: true, acceptance: "52%", time: "~8 min" },
//   { id: 3, title: "Maximum Subarray", difficulty: "Medium", category: "Kadane's Algorithm", solved: false, bookmarked: false, acceptance: "50%", time: "~15 min" },
//   { id: 4, title: "Container With Most Water", difficulty: "Medium", category: "Two Pointers", solved: true, bookmarked: false, acceptance: "54%", time: "~15 min" },
//   { id: 5, title: "3Sum", difficulty: "Medium", category: "Two Pointers", solved: false, bookmarked: true, acceptance: "32%", time: "~20 min" },
//   { id: 6, title: "Subarray Sum Equals K", difficulty: "Medium", category: "Prefix Sum", solved: false, bookmarked: false, acceptance: "44%", time: "~20 min" },
//   { id: 7, title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", solved: false, bookmarked: false, acceptance: "38%", time: "~20 min" },
//   { id: 8, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", solved: true, bookmarked: false, acceptance: "48%", time: "~15 min" },
//   { id: 9, title: "Maximum Average Subarray I", difficulty: "Easy", category: "Sliding Window", solved: false, bookmarked: true, acceptance: "43%", time: "~10 min" },
//   { id: 10, title: "Longest Repeating Character Replacement", difficulty: "Medium", category: "Sliding Window", solved: false, bookmarked: false, acceptance: "51%", time: "~20 min" },
//   { id: 11, title: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers", solved: false, bookmarked: false, acceptance: "58%", time: "~25 min" },
//   { id: 12, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Binary Search", solved: false, bookmarked: false, acceptance: "35%", time: "~30 min" },
// ]

export default function PracticePage( { ds_param, problems, problem_stats } : Data_Structure_Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [bookmarkedProblems, setBookmarkedProblems] = useState<number[]>(
    problem_stats?.filter(p => p.bookmarked).map(p => p.id) || []
  )

  const categories = new Set<string>(["All"]);
  const difficulties = new Set<string>(["All"]);

  for( let problem of problems! ) {
    categories.add(problem.category);
    difficulties.add(problem.difficulty);
  }
  console.log(categories);


  const toggleBookmark = (id: number) => {
    setBookmarkedProblems(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const filteredProblems = problems?.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || problem.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const stats = {
    total: problems?.length,
    solved: problem_stats?.filter(p => p.solved).length,
    easy: problems?.filter(p => p.difficulty === "Easy").length,
    easySolved: problems?.filter(p => p.difficulty === "Easy" && problem_stats?.find(ps => ps.id === p.id && ps.solved)).length,
    medium: problems?.filter(p => p.difficulty === "Medium").length,
    mediumSolved: problems?.filter(p => p.difficulty === "Medium" && problem_stats?.find(ps => ps.id === p.id && ps.solved)).length,
    hard: problems?.filter(p => p.difficulty === "Hard").length,
    hardSolved: problems?.filter(p => p.difficulty === "Hard" && problem_stats?.find(ps => ps.id === p.id && ps.solved)).length,
  }

  return (
    <div className="array-battle-theme min-h-screen bg-white text-black">

      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold  mb-4">
                Practice <span className="ab-text-gradient">Arena</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Sharpen your skills with {Math.round((problems?.length|| 0) / 10) * 10}+ curated problems
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ab-glass rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Progress</div>
                <div className="text-2xl font-bold ">{stats.solved}/{stats.total}</div>
                <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-teal-500 to-green-500 rounded-full"
                    style={{ width: `${(stats.solved! / stats.total!) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Easy</div>
                <div className="text-2xl font-bold text-green-400">{stats.easySolved}/{stats.easy}</div>
                <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(stats.easySolved! / stats.easy!) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Medium</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.mediumSolved}/{stats.medium}</div>
                <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${(stats.mediumSolved! / stats.medium!) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Hard</div>
                <div className="text-2xl font-bold text-red-400">{stats.hardSolved}/{stats.hard}</div>
                <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(stats.hardSolved! / stats.hard!) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="ab-glass rounded-2xl p-4 mb-6"
          >
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white shadow-sm border border-gray-200 rounded-xl  placeholder-gray-500 text-black focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter by difficulty"
                className="px-4 py-3 bg-white shadow-sm border border-gray-200 rounded-xl text-black focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {Array.from(difficulties).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {Array.from(categories).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-linear-to-r from-teal-500 to-green-500 text-black"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Problems List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="ab-glass rounded-2xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 text-sm text-gray-500">
              <div className="col-span-1">Status</div>
              <div className="col-span-5">Problem</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Acceptance Rate</div>
              <div className="col-span-1">Average time required</div>
              <div className="col-span-1"></div>
            </div>

            {/* Problems */}
            {filteredProblems?.map((problem, i) => {
              
              const corresponding_stat = problem_stats?.find(p => p.id == problem.id) || { solved: false, attempted: false, bookmarked: false};

              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors items-center"
                >
                  <div className="col-span-1 flex md:block items-center gap-4">
                    {corresponding_stat.solved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      corresponding_stat.attempted ? (
                        <CircleDot className="w-5 h-5 text-yellow-500" />
                      ) :
                      <Circle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="col-span-5">
                    <Link href="#" className="font-medium  hover:text-teal-400 transition-colors">
                      {problem.id}. {problem.title}
                    </Link>
                    <div className="text-sm text-gray-500 md:hidden mt-1">
                      {problem.category}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === "Easy" ? "bg-green-500/20 text-green-400" :
                      problem.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="col-span-2 text-gray-400 text-sm hidden md:block">
                    {problem.acceptance_rate}
                  </div>
                  <div className="col-span-1 text-gray-500 text-sm hidden md:flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {problem.time}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => toggleBookmark(problem.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {bookmarkedProblems.includes(problem.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-teal-400" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-gray-500 hover:" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}

            {filteredProblems?.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">
                No problems found matching your criteria
              </div>
            )}
          </motion.div>
        </div>
      </main>

    </div>
  )
}
