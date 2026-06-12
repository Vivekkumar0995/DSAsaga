import PracticeClient from "@/components/data_structure/practice/PracticeClient";

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

export default async function PracticePage({
  params,
}: {
  params: Promise<{ data_structure: string }>;
}) {
  const { data_structure } = await params;
  const dsData = await getDataStructure(data_structure);

  if (!dsData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
          {data_structure.replace(/-/g, " ")}
        </h1>
        <p className="text-gray-500 text-lg mb-6">
          This data structure hasn&apos;t been added yet.
        </p>
        <a href="/admin/data-structure" className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
          Add it via Admin Panel →
        </a>
      </div>
    );
  }

  return (
    <PracticeClient
      ds_param={data_structure}
      problems={dsData.problems}
      problem_stats={[]} // user-specific stats — to be built later
    />
  );
}