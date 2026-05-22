import { MessageSquare, Activity } from 'lucide-react'

const testimonials = [
  { name:'Sarah Chen',    role:'Software Engineer @ Google', initial:'S', text:'String Battle helped me ace my coding interviews. The string problems and battle format made practice truly addictive!' },
  { name:'Marcus Johnson',role:'CS Student',                 initial:'M', text:'Way more fun than grinding LeetCode alone. Competing with others on string problems keeps me motivated.' },
  { name:'Priya Patel',   role:'Full Stack Developer',       initial:'P', text:'The learning tracks are incredibly well-structured. Went from struggling with pattern matching to loving it.' },
]

const liveActivity = [
  { user:'StringNinja42', action:'won a ranked battle',             time:'2m ago'  },
  { user:'AlgoQueen',     action:'completed Pattern Matching track', time:'5m ago'  },
  { user:'ByteMaster',    action:'reached Diamond rank',            time:'8m ago'  },
  { user:'DevWarrior',    action:'solved 50 string problems',       time:'12m ago' },
  { user:'KMPKing',       action:'won 10-match win streak',         time:'15m ago' },
]

const topPlayers = [
  { name:'StringNinja42', rating:2341, winRate:'74%', battles:214, rank:1 },
  { name:'AlgoQueen',     rating:2190, winRate:'71%', battles:187, rank:2 },
  { name:'ByteMaster',    rating:2088, winRate:'68%', battles:203, rank:3 },
  { name:'KMPKing',       rating:1975, winRate:'66%', battles:156, rank:4 },
  { name:'DevWarrior',    rating:1847, winRate:'67%', battles:142, rank:5 },
]

const rankColors = ['text-[#F59E0B]','text-[#9CA3AF]','text-[#D97706]','text-[#374151]','text-[#374151]']

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#111827] mb-2">
          Join the <span className="text-[#10B981]">String Community</span>
        </h1>
        <p className="text-[#6B7280]">Connect with coders worldwide and grow together</p>
      </div>

      {/* Testimonials + Live Activity */}
      <div className="grid grid-cols-[1fr_360px] gap-8 mb-12">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-[#10B981]" /> What Coders Say
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#10B981] flex items-center justify-center text-white text-sm font-bold">{t.initial}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] leading-tight">{t.name}</p>
                    <p className="text-xs text-[#9CA3AF] leading-tight">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-[#374151] leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2 mb-4">
            <Activity size={18} className="text-[#10B981]" /> Live Activity
          </h2>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            {liveActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4 border-b border-[#F3F4F6] last:border-b-0">
                <span className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#374151]">
                    <span className="font-semibold text-[#10B981]">{item.user}</span> {item.action}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Players */}
      <div>
        <h2 className="text-xl font-bold text-[#111827] mb-4">Top String Battlers</h2>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_6rem_6rem_6rem] gap-4 px-6 py-3 border-b border-[#E5E7EB]">
            {['#','Player','Rating','Win Rate','Battles'].map(h =>
              <p key={h} className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{h}</p>
            )}
          </div>
          {topPlayers.map((p, i) => (
            <div key={p.name}
              className="grid grid-cols-[2rem_1fr_6rem_6rem_6rem] gap-4 px-6 py-4 items-center border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F9FAFB] transition-colors">
              <p className={`text-sm font-bold ${rankColors[i]}`}>{p.rank}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xs font-bold">{p.name[0]}</div>
                <p className="text-sm font-semibold text-[#111827]">{p.name}</p>
              </div>
              <p className="text-sm font-bold text-[#111827]">{p.rating.toLocaleString()}</p>
              <p className="text-sm font-medium text-[#10B981]">{p.winRate}</p>
              <p className="text-sm text-[#6B7280]">{p.battles}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
