'use client'

import { useState } from 'react'
import { Clock, Search, Bookmark, CheckCircle2, Circle } from 'lucide-react'

type Diff = 'Easy' | 'Medium' | 'Hard'

interface Problem {
  id: number; title: string; difficulty: Diff; acceptance: number
  time: number; completed: boolean; bookmarked: boolean; category: string
}

const problems: Problem[] = [
  { id:1,  title:'Reverse a String',                      difficulty:'Easy',   acceptance:65, time:5,  completed:true,  bookmarked:false, category:'String Fundamentals' },
  { id:2,  title:'Valid Palindrome',                      difficulty:'Easy',   acceptance:71, time:8,  completed:true,  bookmarked:false, category:'String Fundamentals' },
  { id:3,  title:'Longest Common Prefix',                 difficulty:'Easy',   acceptance:58, time:10, completed:false, bookmarked:true,  category:'String Fundamentals' },
  { id:4,  title:'Anagram Check',                        difficulty:'Easy',   acceptance:63, time:8,  completed:false, bookmarked:false, category:'Anagrams' },
  { id:5,  title:'Longest Substring Without Repeating',  difficulty:'Medium', acceptance:52, time:15, completed:true,  bookmarked:true,  category:'Sliding Window' },
  { id:6,  title:'String Compression',                   difficulty:'Medium', acceptance:44, time:15, completed:false, bookmarked:false, category:'String Fundamentals' },
  { id:7,  title:'Find All Anagrams in a String',        difficulty:'Medium', acceptance:38, time:20, completed:false, bookmarked:false, category:'Anagrams' },
  { id:8,  title:'Longest Palindromic Substring',        difficulty:'Medium', acceptance:35, time:20, completed:true,  bookmarked:false, category:'Two Pointers' },
  { id:9,  title:'Minimum Window Substring',             difficulty:'Medium', acceptance:28, time:25, completed:false, bookmarked:true,  category:'Sliding Window' },
  { id:10, title:'Longest Repeating Character Replacement', difficulty:'Medium', acceptance:51, time:20, completed:false, bookmarked:false, category:'Sliding Window' },
  { id:11, title:'Regular Expression Matching',          difficulty:'Hard',   acceptance:22, time:30, completed:false, bookmarked:false, category:'Pattern Matching' },
  { id:12, title:'Wildcard Matching',                    difficulty:'Hard',   acceptance:25, time:30, completed:false, bookmarked:false, category:'Pattern Matching' },
]

const categories = ['All','String Fundamentals','Two Pointers','Sliding Window','Anagrams','Pattern Matching','KMP Algorithm']

const diffColors: Record<Diff, string> = {
  Easy:   'bg-[#D1FAE5] text-[#10B981]',
  Medium: 'bg-[#FEF3C7] text-[#F59E0B]',
  Hard:   'bg-[#FEE2E2] text-[#EF4444]',
}

export default function PracticePage() {
  const [search, setSearch]       = useState('')
  const [cat, setCat]             = useState('All')
  const [diff, setDiff]           = useState('All')
  const [bookmarks, setBookmarks] = useState<Set<number>>(
    new Set(problems.filter(p => p.bookmarked).map(p => p.id))
  )

  const filtered = problems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) &&
    (cat  === 'All' || p.category  === cat)  &&
    (diff === 'All' || p.difficulty === diff)
  )

  const total   = problems.length
  const done    = problems.filter(p => p.completed).length
  const easy    = problems.filter(p => p.difficulty === 'Easy')
  const medium  = problems.filter(p => p.difficulty === 'Medium')
  const hard    = problems.filter(p => p.difficulty === 'Hard')

  const toggleBm = (id: number) =>
    setBookmarks(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main className="relative z-10 pt-24 pb-16 px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#111827]">Practice <span className="text-[#10B981]">Arena</span></h1>
          <p className="text-[#6B7280] mt-1">Sharpen your skills with {total}+ curated string problems</p>
        </div>

      {/* Progress stats */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6 grid grid-cols-4 gap-6">
        {[
          { label:'Progress', count:`${done}/${total}`,     color:'text-[#111827]', bar:'bg-[#10B981]', pct:(done/total)*100 },
          { label:'Easy',     count:`${easy.filter(p=>p.completed).length}/${easy.length}`,     color:'text-[#10B981]', bar:'bg-[#10B981]', pct:(easy.filter(p=>p.completed).length/easy.length)*100 },
          { label:'Medium',   count:`${medium.filter(p=>p.completed).length}/${medium.length}`, color:'text-[#F59E0B]', bar:'bg-[#F59E0B]', pct:(medium.filter(p=>p.completed).length/medium.length)*100 },
          { label:'Hard',     count:`${hard.filter(p=>p.completed).length}/${hard.length}`,     color:'text-[#EF4444]', bar:'bg-[#EF4444]', pct:(hard.filter(p=>p.completed).length/hard.length)*100 },
        ].map(s => (
          <div key={s.label}>
            <p className="text-sm text-[#6B7280] mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mt-2">
              <div className={`${s.bar} h-1.5 rounded-full`} ref={el => { if (el) el.style.width = `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text" placeholder="Search problems..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981]"
            />
          </div>
          <select title="Difficulty Filter" value={diff} onChange={e => setDiff(e.target.value)}
            className="border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#374151] focus:outline-none bg-white">
            {['All','Easy','Medium','Hard'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                cat === c ? 'bg-[#10B981] text-white' : 'border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_7rem_7rem_8rem_3rem] gap-4 px-6 py-3 border-b border-[#E5E7EB]">
          {['Status','Problem','Difficulty','Acceptance','Time',''].map((h,i) =>
            <p key={i} className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{h}</p>
          )}
        </div>
        {filtered.map(p => (
          <div key={p.id}
            className="grid grid-cols-[3rem_1fr_7rem_7rem_8rem_3rem] gap-4 px-6 py-4 items-center border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-colors">
            <div>{p.completed ? <CheckCircle2 size={20} className="text-[#10B981]" /> : <Circle size={20} className="text-[#D1D5DB]" />}</div>
            <button className={`text-sm font-medium text-left ${p.completed ? 'text-[#10B981]' : 'text-[#111827]'} hover:text-[#10B981] transition-colors`}>
              {p.id}. {p.title}
            </button>
            <div><span className={`text-xs font-medium px-3 py-1 rounded-full ${diffColors[p.difficulty]}`}>{p.difficulty}</span></div>
            <p className="text-sm text-[#6B7280]">{p.acceptance}%</p>
            <div className="flex items-center gap-1.5 text-sm text-[#6B7280]"><Clock size={13} />~{p.time} min</div>
            <button title="Toggle Bookmark" onClick={() => toggleBm(p.id)} className="text-[#D1D5DB] hover:text-[#10B981] transition-colors">
              <Bookmark size={16} className={bookmarks.has(p.id) ? 'fill-[#10B981] text-[#10B981]' : ''} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#6B7280]">
            <p className="text-lg font-medium">No problems found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
      </main>
    </div>
  )
}
