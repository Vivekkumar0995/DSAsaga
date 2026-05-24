"use client"
import { useEffect, useState } from "react";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import Loading from "@/app/loading"; // Import the main loading component
import { Top3Leaderboard, TopLeaderboardUser } from "@/components/leaderboard/Top3Leaderboard";

interface PopulatedUser{
  _id:string,
  name:string,
  profileImage?:string
}

interface LeaderboardEntry {
  _id: string;
  score: number;
  problemsSolved: number;
  rank: string;
  userId: PopulatedUser | null;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 }); // Out of screen initially

  useEffect(()=>{
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard')
        const data = await res.json()

        if(res.ok && data.leaderboard) {
          setLeaderboard(data.leaderboard)
        }

      } catch (error) {
          console.error("Error fetching leaderboard:", error);
      }
      finally{
        setLoading(false)
      }
    }
    fetchLeaderboard();
  },[])


  if (loading) {
    return <Loading />;
  }

  // Extract top 3 leaders for the 3D leaderboard
  const top3Users: TopLeaderboardUser[] = leaderboard.slice(0, 3).map((entry, index) => ({
    rank: (index + 1) as 1 | 2 | 3,
    name: entry.userId?.name || "Unknown",
    score: entry.score
  }));

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

   return (
    <div
      className="relative min-h-screen bg-white text-slate-900 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Modern Grid Background for entire page */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.15] transition-opacity duration-500"
        style={{
          backgroundImage: `
            linear-gradient(to right, #94a3b8 1px, transparent 1px),
            linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Scaled/Magnified Grid that reveals on hover */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #94a3b8 2px, transparent 2px),
            linear-gradient(to bottom, #94a3b8 2px, transparent 2px)
          `,
          backgroundSize: '65px 65px',
          maskImage: `radial-gradient(100px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(100px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          transition: 'mask-image 0.1s ease-out, -webkit-mask-image 0.1s ease-out'
        }}
      />

      {/* Glow Effects */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-slate-100/60 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative max-w-5xl mt-30 mx-auto z-10 w-full">
        <h1 className="text-5xl font-extrabold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900 drop-shadow-sm tracking-tight">
          Hall of Fame
        </h1>
        <p className="text-center text-slate-500 mb-16 text-lg uppercase tracking-widest font-semibold">
          Top Performers & Elite Coders
        </p>
        {/* Render the new Top 3 3D Leaderboard */}
        {top3Users.length > 0 && (
          <div className="mb-24 sm:mb-40">
            <Top3Leaderboard topUsers={top3Users} />
          </div>
        )}

        {/* WE USE THE COMPONENT HERE AND PASS THE DATA TO IT */}
        <div className="mt-16 sm:mt-24">
          <LeaderboardTable entries={leaderboard} />
        </div>

      </div>
    </div>
  );
}
