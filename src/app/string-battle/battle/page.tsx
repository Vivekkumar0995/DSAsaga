'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trophy, Target, Flame, Swords, Users, Zap, Play } from 'lucide-react'

const battleModes = [
  { icon: <Zap size={22} className="text-white" />,   bg: 'bg-orange-400',  title: 'Unranked Match',   desc: 'Fast 5-minute battles with random opponents',        time: '5 min',  highlight: true },
  { icon: <Trophy size={22} className="text-white" />, bg: 'bg-emerald-500', title: 'Ranked Battle',    desc: 'Competitive matches that affect your rating',        time: '15 min', highlight: false },
  { icon: <Users size={22} className="text-white" />,  bg: 'bg-purple-500',  title: 'Friend Challenge', desc: 'Challenge a friend with a custom room code',         time: 'Custom', highlight: false },
  { icon: <Target size={22} className="text-white" />, bg: 'bg-red-500',     title: 'Daily Battle',     desc: 'One special challenge every day for bonus XP',      time: '10 min', highlight: false },
]

const recentMatches = [
  { opponent: 'CodeMaster',   result: 'W', problem: 'Longest Substring Without Repeating', delta: +25, time: '2h ago' },
  { opponent: 'AlgoKing',     result: 'L', problem: 'Valid Palindrome',                    delta: -18, time: '5h ago' },
  { opponent: 'ByteNinja',    result: 'W', problem: 'Find All Anagrams in a String',       delta: +22, time: '1d ago' },
  { opponent: 'StringWizard', result: 'W', problem: 'Minimum Window Substring',            delta: +30, time: '2d ago' },
  { opponent: 'PatternPro',   result: 'L', problem: 'Regular Expression Matching',         delta: -15, time: '3d ago' },
]

export default function BattlePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleStartBattle = (title: string) => {
    setSelectedMode(title)
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main className="relative z-10 pt-24 pb-16 px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#111827]">Battle <span className="text-[#10B981]">Arena</span></h1>
          <p className="text-[#6B7280] mt-1">Choose your battle mode and face opponents in real-time coding duels</p>
        </div>

      {/* Player Stats */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6 grid grid-cols-4 gap-6">
        <div><p className="text-2xl font-bold text-[#111827]">1,847</p><p className="text-sm text-[#6B7280] flex items-center gap-1.5 mt-1"><Trophy size={14} className="text-[#F59E0B]" /> Rating</p></div>
        <div><p className="text-2xl font-bold text-[#10B981]">67%</p><p className="text-sm text-[#6B7280] flex items-center gap-1.5 mt-1"><Target size={14} /> Win Rate</p></div>
        <div><p className="text-2xl font-bold text-[#111827]">142</p><p className="text-sm text-[#6B7280] flex items-center gap-1.5 mt-1"><Swords size={14} /> Battles</p></div>
        <div><p className="text-2xl font-bold text-[#F97316]">12</p><p className="text-sm text-[#6B7280] flex items-center gap-1.5 mt-1"><Flame size={14} /> Win Streak</p></div>
      </div>

      {/* Battle Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {battleModes.map((m, i) => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <div
              className={`bg-white rounded-2xl p-6 cursor-pointer group transition-shadow border border-[#E5E7EB] ${selectedMode === m.title ? 'ring-2 ring-teal-500' : ''}`}
              onClick={() => setSelectedMode(m.title)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl ${m.bg} flex items-center justify-center`}>{m.icon}</div>
                <div className="flex items-center gap-1.5 text-sm text-[#9CA3AF]"><Clock size={13} />{m.time}</div>
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-1">{m.title}</h3>
              <p className="text-sm text-[#6B7280] mb-5">{m.desc}</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleStartBattle(m.title) }}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${selectedMode === m.title ? 'bg-gradient-to-r from-teal-500 to-green-500 text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Play className="w-5 h-5" />
                {isSearching && selectedMode === m.title ? 'Finding Opponent...' : 'Start Battle'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Matches */}
      <div>
        <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2 mb-4">
          <Clock size={20} className="text-[#10B981]" /> Recent Matches
        </h2>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          {recentMatches.map((m, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${m.result === 'W' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}>
                {m.result}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#111827]">vs {m.opponent}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{m.problem}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${m.delta > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{m.delta > 0 ? `+${m.delta}` : m.delta}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      </main>

      {/* Matchmaking Modal */}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="ab-glass rounded-2xl p-8 max-w-md w-full mx-4 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center animate-pulse">
                <Swords className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Finding Opponent</h3>
              <p className="text-gray-400 mb-6">Matching you with a worthy challenger...</p>
              <div className="flex items-center justify-center gap-2 text-teal-400">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:0ms]" />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:150ms]" />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animationDelay:300ms]" />
              </div>
              <button onClick={() => setIsSearching(false)} className="mt-6 px-6 py-2 text-gray-400 hover: transition-colors">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
