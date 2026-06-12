import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DataStructureModel from "@/models/data_structure_model";

export const dynamic = "force-dynamic";

const ARRAY_TEMPLATE = {
  slug: "array",
  name: "Arrays",
  learning_tracks: [
    {
      title: "Array Fundamentals",
      description: "Master the basics of array manipulation and common patterns",
      difficulty: "Beginner",
      lessons: [
        { title: "Introduction to Arrays", duration: "10 min" },
        { title: "Array Traversal Techniques", duration: "15 min" },
        { title: "In-place Modifications", duration: "12 min" },
        { title: "Prefix Sum Pattern", duration: "18 min" },
        { title: "Kadane's Algorithm", duration: "20 min" },
      ],
    },
    {
      title: "Two Pointer Technique",
      description: "Learn to solve problems efficiently with two pointers",
      difficulty: "Intermediate",
      lessons: [
        { title: "Two Pointer Basics", duration: "12 min" },
        { title: "Opposite Direction Pointers", duration: "15 min" },
        { title: "Same Direction Pointers", duration: "15 min" },
        { title: "Three Sum Pattern", duration: "20 min" },
      ],
    },
    {
      title: "Sliding Window",
      description: "Optimize subarray and substring problems",
      difficulty: "Intermediate",
      lessons: [
        { title: "Fixed Size Windows", duration: "15 min" },
        { title: "Variable Size Windows", duration: "18 min" },
        { title: "Window with HashMap", duration: "20 min" },
        { title: "Maximum/Minimum Windows", duration: "22 min" },
      ],
    },
    {
      title: "Binary Search",
      description: "Beyond basic binary search - advanced applications",
      difficulty: "Intermediate",
      lessons: [
        { title: "Binary Search Fundamentals", duration: "12 min" },
        { title: "Search Space Reduction", duration: "18 min" },
        { title: "Binary Search on Answer", duration: "20 min" },
        { title: "Rotated Array Problems", duration: "22 min" },
      ],
    },
  ],
  battle_modes: [
    { icon: "Zap", title: "Unranked Match", description: "Jump into a 5-minute battle instantly", time: "5 min", color: "from-yellow-500 to-orange-500" },
    { icon: "Trophy", title: "Ranked Battle", description: "Do it competitively", time: "15 min", color: "from-teal-500 to-green-500" },
    { icon: "Users", title: "Friend Challenge", description: "Challenge a friend with a custom room code", time: "custom", color: "from-purple-500 to-pink-500" },
  ],
  problems: [
    { id: 1, title: "Two Sum", difficulty: "Easy", category: "Array Fundamentals", acceptance_rate: 49, time: "~10 min" },
    { id: 2, title: "Remove Duplicates from Sorted Array", difficulty: "Easy", category: "Two Pointers", acceptance_rate: 52, time: "~8 min" },
    { id: 3, title: "Maximum Subarray", difficulty: "Medium", category: "Kadane's Algorithm", acceptance_rate: 50, time: "~15 min" },
    { id: 4, title: "Container With Most Water", difficulty: "Medium", category: "Two Pointers", acceptance_rate: 54, time: "~15 min" },
    { id: 5, title: "3Sum", difficulty: "Medium", category: "Two Pointers", acceptance_rate: 32, time: "~20 min" },
    { id: 6, title: "Subarray Sum Equals K", difficulty: "Medium", category: "Prefix Sum", acceptance_rate: 44, time: "~20 min" },
    { id: 7, title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", acceptance_rate: 38, time: "~20 min" },
    { id: 8, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", acceptance_rate: 48, time: "~15 min" },
    { id: 9, title: "Maximum Average Subarray I", difficulty: "Easy", category: "Sliding Window", acceptance_rate: 43, time: "~10 min" },
    { id: 10, title: "Longest Repeating Character Replacement", difficulty: "Medium", category: "Sliding Window", acceptance_rate: 51, time: "~20 min" },
    { id: 11, title: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers", acceptance_rate: 58, time: "~25 min" },
    { id: 12, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Binary Search", acceptance_rate: 35, time: "~30 min" },
  ],
  testimonials: [
    { name: "Sarah Chen", role: "Software Engineer @ Google", content: "Array section helped me ace my coding interviews!", avatar: "S" },
    { name: "Marcus Johnson", role: "CS Student", content: "Way more fun than grinding LeetCode alone.", avatar: "M" },
    { name: "Priya Patel", role: "Full Stack Developer", content: "The learning tracks are incredibly well-structured.", avatar: "P" },
  ],
  live_activity: [
    { user_name: "CodeNinja42", action: "won a ranked battle", time: "2m ago" },
    { user_name: "AlgoQueen", action: "completed Binary Search track", time: "5m ago" },
    { user_name: "ByteMaster", action: "reached Diamond rank", time: "8m ago" },
    { user_name: "DevWarrior", action: "solved 50 problems", time: "12m ago" },
  ],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const lowerSlug = slug.toLowerCase();

    let doc = await DataStructureModel.findOne({ slug: lowerSlug }).lean();

    if (lowerSlug === "array" && doc && (!doc.learning_tracks || doc.learning_tracks.length === 0)) {
      await DataStructureModel.updateOne(
        { slug: "array" },
        {
          $set: {
            name: "Arrays",
            learning_tracks: ARRAY_TEMPLATE.learning_tracks,
            battle_modes: ARRAY_TEMPLATE.battle_modes,
            problems: ARRAY_TEMPLATE.problems,
            testimonials: ARRAY_TEMPLATE.testimonials,
            live_activity: ARRAY_TEMPLATE.live_activity,
          }
        }
      );
      doc = await DataStructureModel.findOne({ slug: "array" }).lean();
    }

    if (!doc) {
      return NextResponse.json(
        { message: `Data structure "${slug}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: doc }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


