import LearnClient from "@/components/data_structure/learn/LearnClient";
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

export default async function LearnPage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;
  const dsData = await getDataStructure(data_structure);

  if (!dsData) {
    notFound();
  }

  return (
    <LearnClient
      ds_param={data_structure}
      learning_tracks={dsData.learning_tracks}
      learning_stats={[]} // user-specific stats — to be built later
    />
  );
}