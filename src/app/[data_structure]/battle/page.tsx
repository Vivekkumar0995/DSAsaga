import BattleClient from "@/components/data_structure/battle/BattleClient";
import { notFound } from "next/navigation";
async function getDataStructure(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/data-structure/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function BattlePage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;
  const dsData = await getDataStructure(data_structure);

  if (!dsData) {
    notFound();
  }

  const stats = { rating: 0, win_rate: 0, battles: 0, win_streak: 0 };
  const recent_matches: never[] = [];

  return (
    <BattleClient
      ds_param={data_structure}
      battle_stats={stats}
      battle_modes={dsData.battle_modes}
      recent_matches={recent_matches}
    />
  );
}
