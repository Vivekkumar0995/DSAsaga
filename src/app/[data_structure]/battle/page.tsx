import BattleClient from "@/components/data_structure/battle/BattleClient"

export default async function BattlePage({
  params
}: {
  params: Promise<{ data_structure: string }>
}) {
  const { data_structure } = await params;
  
  // --------------------------------------------------------------------------------------
  //          To be added dynamically when we setup the database for learning materials
  // --------------------------------------------------------------------------------------

  // DYNAMIC CONTENT START

  const stats = {
    rating: 1847,
    win_rate: 67,
    battles: 142,
    win_streak: 12
  }

  const battle_modes = [
    {
      icon: "Zap",
      title: "Unranked Match",
      description: "Jump into a 5-minute battle instantly",
      time: "5 min",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: "Trophy",
      title: "Ranked Battle",
      description: "Do it competitively",
      time: "15 min",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: "Users",
      title: "Friend Challenge",
      description: "Challenge a friend with a custom room code",
      time: "custom",
      color: "from-purple-500 to-pink-500"
    }
  ]

  const recent_matches = [
    { opponent_user_name: "CodeMaster", result: "win", rating_change: 25, problem: "Two Sum", time: "2h ago" },
    { opponent_user_name: "AlgoKing", result: "loss", rating_change: -18, problem: "Valid Parentheses", time: "5h ago" },
    { opponent_user_name: "ByteNinja", result: "win", rating_change: +22, problem: "Merge Intervals", time: "1d ago" },
  ]


  // DYNAMIC CONTENT END
  
  // --------------------------------------------------------------------------------------
  //          To be added dynamically when we setup the database for learning materials
  // --------------------------------------------------------------------------------------


  return (
    <BattleClient ds_param={data_structure} battle_stats={stats} battle_modes={battle_modes} recent_matches={recent_matches}/>
  )
}