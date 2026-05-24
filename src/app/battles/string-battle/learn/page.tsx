'use client'

import { useState } from 'react'
import { BookOpen, Clock, CheckCircle2, ChevronDown, ChevronUp, Play } from 'lucide-react'

interface Lesson { title: string; time: number; completed: boolean }
interface Track  { title: string; desc: string; level: 'Beginner'|'Intermediate'|'Advanced'; color: string; completedLessons: number; lessons: Lesson[] }

const tracks: Track[] = [
  {
    title: 'String Fundamentals', desc: 'Master the basics of string manipulation and common patterns',
    level: 'Beginner', color: 'bg-emerald-500', completedLessons: 3,
    lessons: [
      { title:'Introduction to Strings',       time:10, completed:true  },
      { title:'String Traversal Techniques',   time:15, completed:true  },
      { title:'In-place Modifications',        time:12, completed:true  },
      { title:'Prefix Sum Pattern',            time:18, completed:false },
      { title:'String Hashing Basics',         time:20, completed:false },
    ],
  },
  {
    title: 'Two Pointer Technique', desc: 'Learn to solve string problems efficiently with two pointers',
    level: 'Intermediate', color: 'bg-teal-500', completedLessons: 1,
    lessons: [
      { title:'Two Pointer Fundamentals', time:12, completed:true  },
      { title:'Palindrome Problems',      time:15, completed:false },
      { title:'Valid Anagram',            time:10, completed:false },
      { title:'Reverse String Variants',  time:14, completed:false },
    ],
  },
  {
    title: 'Sliding Window', desc: 'Optimize substring problems using the sliding window approach',
    level: 'Intermediate', color: 'bg-indigo-500', completedLessons: 0,
    lessons: [
      { title:'Fixed Size Sliding Window',              time:15, completed:false },
      { title:'Variable Size Window',                   time:18, completed:false },
      { title:'Minimum Window Substring',               time:25, completed:false },
      { title:'Longest Repeating Char Replacement',     time:20, completed:false },
    ],
  },
  {
    title: 'Pattern Matching', desc: 'Master KMP, Rabin-Karp, and advanced pattern search algorithms',
    level: 'Advanced', color: 'bg-purple-500', completedLessons: 0,
    lessons: [
      { title:'Naive Pattern Search',   time:12, completed:false },
      { title:'KMP Algorithm',          time:25, completed:false },
      { title:'Rabin-Karp Hashing',     time:20, completed:false },
      { title:'Z-Function',             time:22, completed:false },
    ],
  },
  {
    title: 'Dynamic Programming on Strings', desc: 'Solve complex string problems using DP — edit distance, LCS, and more',
    level: 'Advanced', color: 'bg-red-500', completedLessons: 0,
    lessons: [
      { title:'Longest Common Subsequence',         time:20, completed:false },
      { title:'Edit Distance',                      time:22, completed:false },
      { title:'Longest Palindromic Subsequence',    time:18, completed:false },
      { title:'Regular Expression Matching',        time:30, completed:false },
    ],
  },
]

const levelColors: Record<string,string> = {
  Beginner:     'bg-[#D1FAE5] text-[#10B981]',
  Intermediate: 'bg-[#FEF3C7] text-[#F59E0B]',
  Advanced:     'bg-[#FEE2E2] text-[#EF4444]',
}

export default function LearnPage() {
  const [open, setOpen] = useState<string|null>('String Fundamentals')

  const allLessons    = tracks.reduce((a,t) => a + t.lessons.length, 0)
  const completedAll  = tracks.reduce((a,t) => a + t.completedLessons, 0)
  const inProgress    = tracks.filter(t => t.completedLessons > 0 && t.completedLessons < t.lessons.length).length
  const remaining     = allLessons - completedAll

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main className="relative z-10 pt-24 pb-16 px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#111827]">Learning <span className="text-[#10B981]">Hub</span></h1>
          <p className="text-[#6B7280] mt-1">Structured learning paths to master every string algorithm</p>
        </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[#111827]">Your Progress</p>
          <p className="text-sm font-medium text-[#10B981]">{completedAll} of {allLessons} lessons completed</p>
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-2 mb-5">
          <div className="bg-[#10B981] h-2 rounded-full" ref={el => { if (el) el.style.width = `${(completedAll/allLessons)*100}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold text-[#111827]">{completedAll}</p><p className="text-sm text-[#6B7280]">Completed</p></div>
          <div><p className="text-2xl font-bold text-[#F59E0B]">{inProgress}</p><p className="text-sm text-[#6B7280]">In Progress</p></div>
          <div><p className="text-2xl font-bold text-[#9CA3AF]">{remaining}</p><p className="text-sm text-[#6B7280]">Remaining</p></div>
        </div>
      </div>

      {/* Track accordions */}
      <div className="space-y-4">
        {tracks.map(track => {
          const pct    = Math.round((track.completedLessons / track.lessons.length) * 100)
          const isOpen = open === track.title
          return (
            <div key={track.title} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <button className="w-full flex items-start gap-4 p-6 text-left hover:bg-[#F9FAFB] transition-colors"
                onClick={() => setOpen(isOpen ? null : track.title)}>
                <div className={`w-12 h-12 ${track.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <BookOpen size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[#111827]">{track.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColors[track.level]}`}>{track.level}</span>
                      {isOpen ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
                    </div>
                  </div>
                  <p className="text-sm text-[#6B7280] mb-3">{track.desc}</p>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-[#6B7280]">{track.lessons.length} lessons</span>
                    <span className="text-[#10B981] font-medium">{track.completedLessons}/{track.lessons.length} completed</span>
                  </div>
                  <div className="w-full bg-[#F3F4F6] rounded-full h-1.5">
                    <div className="bg-[#10B981] h-1.5 rounded-full" ref={el => { if (el) el.style.width = `${pct}%` }} />
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[#F3F4F6]">
                  {track.lessons.map((lesson, i) => (
                    <div key={i}
                      className={`flex items-center gap-4 px-6 py-3.5 border-b border-[#F3F4F6] last:border-b-0 ${lesson.completed ? 'bg-[#F0FDF4]' : 'hover:bg-[#F9FAFB]'} transition-colors`}>
                      {lesson.completed
                        ? <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                        : <div className="w-[18px] h-[18px] rounded-full border-2 border-[#D1D5DB] flex items-center justify-center flex-shrink-0">
                            <Play size={8} className="text-[#9CA3AF] ml-0.5" />
                          </div>
                      }
                      <p className={`flex-1 text-sm font-medium ${lesson.completed ? 'text-[#10B981]' : 'text-[#374151]'}`}>{lesson.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]"><Clock size={12} />{lesson.time} min</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      </main>
    </div>
  )
}
