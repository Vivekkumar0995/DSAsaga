"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, CheckCircle, ChevronDown, Clock, CircleDot, Circle } from "lucide-react"
import { learning_track, learning_stats } from "@/types/data_structure"
import { snakeToTitleCase, getNumberOfCompletedLessons, getTotalNumberOfCompletedLessons, getTotalNumberOfInProgressLessons, getTotalNumberOfLessons, spaceTo_ } from "@/lib/utils"
import Link from "next/link"
import { useCurrentPathTill } from "@/lib/client_utils"


export default function LearnPage({ ds_param, learning_tracks, learning_stats }: { 
  ds_param: string; 
  learning_tracks: learning_track[]; 
  learning_stats: learning_stats[]; 
}) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  let nTotCompleted = getTotalNumberOfCompletedLessons(learning_stats);
  let nTotInProgress = getTotalNumberOfInProgressLessons(learning_stats);
  let nTotLessons = getTotalNumberOfLessons(learning_tracks!);

  const pathParts = useCurrentPathTill(0);
  const current_section = pathParts[1]

  const toggleTrack = (trackId: string) => {
    setExpandedTrack(currentTrack => currentTrack === trackId ? null : trackId)
  }

  const getTrackProgress = (track: learning_track) => {
    const completed = getNumberOfCompletedLessons(track, learning_stats);
    return { completed, total: track.lessons.length, percent: (completed / track.lessons.length) * 100 }
  }

  useEffect(() => {
    const expandTrackFromHash = () => {
      const trackId = window.location.hash.slice(1)
      if (!trackId) return

      const track = learning_tracks.find(
        currentTrack => spaceTo_(currentTrack.title) === trackId,
      )
      if (track) setExpandedTrack(track.title)
    }

    expandTrackFromHash()
    window.addEventListener("hashchange", expandTrackFromHash)

    return () => window.removeEventListener("hashchange", expandTrackFromHash)
  }, [learning_tracks])

  return (
    <div className="array-battle-theme min-h-screen bg-white text-black">
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Learning <span className="text-[#14b8a6]">{snakeToTitleCase(ds_param)}</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Structured learning paths to master every algorithm
              </p>
            </motion.div>
          </div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="ab-glass rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold ">Your Progress</h3>
              <span className="text-teal-400 font-medium">{nTotCompleted} of {nTotLessons} lessons completed</span>
            </div>
            <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-teal-500 to-green-500 rounded-full transition-all"
                style={{ width: `${(nTotCompleted / nTotLessons) * 100}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold ">{nTotCompleted}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{nTotInProgress}</div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-500">{nTotLessons}</div>
                <div className="text-sm text-gray-500">Remaining</div>
              </div>
            </div>
          </motion.div>

          {/* Learning Tracks */}
          <div className="space-y-4">
            {learning_tracks?.map((track, i) => {
              const progress = getTrackProgress(track)
              const isExpanded = expandedTrack === track.title
              const corresponding_stat = learning_stats?.find(stat => stat.title === track.title);

              return (
                <motion.div
                  key={track.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <div className={`ab-glass rounded-2xl overflow-hidden scroll-mt-28`} id={`${spaceTo_(track.title)}`}>
                    {/* Track Header */}
                    <div
                      className={`p-6 cursor-pointer transition-colors`}
                      onClick={() => toggleTrack(track.title)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0`}>
                            <BookOpen className="w-6 h-6 " />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <h3 className="text-xl font-bold ">{track.title}</h3>
                              {track.category && (
                                <span className="ml-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                                  {track.category}
                                </span>
                              )}
                            </div>

                            
                              

                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              </motion.div>

                          </div>
                          <p className="text-gray-400 text-sm mb-3">{track.description}</p>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              track.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                              track.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {track.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">
                              {track.lessons.length} lessons
                            </span>

                            <span className="text-sm text-teal-400">
                              {progress.completed}/{progress.total} completed
                            </span>

                          </div>

                          <div className="h-1.5 bg-gray-300 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full bg-linear-to-r from-green-500 to-emerald-500 rounded-full transition-all`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Lessons List */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200"
                        >
                          <div className="p-4 space-y-2">
                            {track.lessons.map((lesson, j) => {

                                const is_lesson_completed = corresponding_stat?.lesson_stats.find(stat => stat.title === lesson.title)?.completed;
                                const is_lesson_in_progess = corresponding_stat?.lesson_stats.find(stat => stat.title === lesson.title)?.in_progress;
                                
                                return (
                                    <Link
                                        key={j}
                                        className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                                      is_lesson_completed
                                        ? "bg-green-100"
                                        : is_lesson_in_progess
                                        ? "bg-yellow-100 hover:bg-yellow-200"
                                        : "bg-gray-100 hover:bg-gray-200"
                                        } cursor-pointer`}
                                        href={`./${current_section}/${spaceTo_(track.title)}/${spaceTo_(lesson.title)}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      is_lesson_completed
                                        ? "bg-green-500 text-black"
                                        : is_lesson_in_progess
                                        ? "bg-yellow-500 text-black"
                                        : "bg-gray-200 text-gray-500"
                                        }`}>
                                            {is_lesson_completed ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : is_lesson_in_progess ? (
                                                <CircleDot className="w-5 h-5" />
                                            ) : (
                                                <Circle className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-medium ${is_lesson_completed ? "text-green-400" : is_lesson_in_progess ? "text-yellow-500" : ""}`}>
                                                {lesson.title}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            {lesson.duration}
                                        </div>
                                    </Link>
                                )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>

          
        </div>
      </main>

    </div>
  )
}