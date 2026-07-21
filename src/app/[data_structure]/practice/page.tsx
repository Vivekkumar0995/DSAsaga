import { getDataStructure } from "@/lib/mongodb";
import { DataStructureType } from "@/models/data_structure_model";
import Question from "@/models/question_model";
import SolvedQuestion from "@/models/SolvedQuestion";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/jose_auth";
import PracticeClient from "@/components/data_structure/practice/PracticeClient";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    data_structure: string;
  }>;
};

export default async function PracticePage({ params }: Props) {
  const { data_structure } = await params;
  const lowerSlug = data_structure.toLowerCase();

  try {
    // Fetch data structure metadata
    const dsDoc: DataStructureType | null = await getDataStructure(data_structure);

    if (!dsDoc) {
      notFound();
    }

    // Fetch questions from MongoDB
    const questions = await Question.find({ data_structure_id: dsDoc._id })
      .select("_id title slug difficulty xp order")
      .sort({ order: 1 })
      .lean() as any[];

    // Fetch user-solved questions slug
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let solvedSlugs: string[] = [];

    if (token) {
      try {
        const decoded = await decrypt(token);
        let userId = decoded?.userId;
        if (userId) {
          if (typeof userId === "object") {
            const userIdObject = userId as any;
            if (typeof userIdObject.toHexString === "function") {
              userId = userIdObject.toHexString();
            } else if (userIdObject.buffer) {
              userId = Buffer.from(Array.from(userIdObject.buffer)).toString("hex");
            }
          }
          const solved = await SolvedQuestion.find({ userId: String(userId), status: "solved" })
            .select("questionSlug")
            .lean();
          solvedSlugs = solved.map((s: any) => s.questionSlug);
        }
      } catch (err) {
        console.error("Error decrypting token in practice page:", err);
      }
    }

    // Combine database questions with metadata (category, acceptance_rate, etc.)
    const dsProblems = dsDoc.problems || [];
    const enrichedProblems = questions.map((q, index) => {
      // Find matching problem in metadata by title (case-insensitive)
      const match = dsProblems.find(
        (p: any) => p.title.toLowerCase() === q.title.toLowerCase()
      );

      return {
        id: match?.id || (index + 1),
        _id: String(q._id),
        title: q.title,
        slug: q.slug,
        difficulty: q.difficulty
          ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()
          : (match?.difficulty || "Easy"),
        category: match?.category || "Fundamentals",
        acceptance_rate: match?.acceptance_rate ? `${match.acceptance_rate}%` : "50%",
        time: match?.time || `~${q.xp / 10} min`,
        xp: q.xp,
        order: q.order,
      };
    });

    return (
      <PracticeClient
        ds_param={data_structure}
        ds_name={dsDoc.name || data_structure}
        problems={enrichedProblems}
        solvedSlugs={solvedSlugs}
      />
    );
  } catch (error) {
    console.error("Error loading practice page:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Practice</h1>
        <p className="text-gray-500">Could not fetch practice questions. Please try again later.</p>
      </div>
    );
  }
}
