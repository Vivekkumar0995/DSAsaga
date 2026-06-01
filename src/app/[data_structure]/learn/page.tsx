import LearnClient from "@/components/data_structure/learn/LearnClient";

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

  const learning_tracks = [
    {
      title: "Array Fundamentals",
      description: "Master the basics of array manipulation and common patterns",
      difficulty: "Beginner",
      lessons: [
        { title: "Introduction to Arrays", duration: "10 min"},
        { title: "Array Traversal Techniques", duration: "15 min"},
        { title: "In-place Modifications", duration: "12 min"},
        { title: "Prefix Sum Pattern", duration: "18 min" },
        { title: "Kadane's Algorithm", duration: "20 min" },
      ],
      // color: "from-green-500 to-emerald-500",
    },
    {
      title: "Two Pointer Technique",
      description: "Learn to solve problems efficiently with two pointers",
      difficulty: "Intermediate",
      lessons: [
        { title: "Two Pointer Basics", duration: "12 min"},
        { title: "Opposite Direction Pointers", duration: "15 min" },
        { title: "Same Direction Pointers", duration: "15 min" },
        { title: "Three Sum Pattern", duration: "20 min" },
      ],
      // color: "from-teal-500 to-cyan-500",
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
      // color: "from-blue-500 to-indigo-500",
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
      // color: "from-purple-500 to-pink-500",
    },

  ]
  const learning_stats = [
    {
      title: "Array Fundamentals",
      completed: true,
      in_progress: false,
      lesson_stats: [
        { title: "Introduction to Arrays", completed: true, in_progress: false },
        { title: "Array Traversal Techniques", completed: true, in_progress: false },
        { title: "In-place Modifications", completed: true, in_progress: false },
        { title: "Prefix Sum Pattern", completed: true, in_progress: false },
        { title: "Kadane's Algorithm", completed: true, in_progress: false },
      ],
    },
    {
      title: "Two Pointer Technique",
      completed: false,
      in_progress: true,
      lesson_stats: [
        { title: "Two Pointer Basics", completed: true, in_progress: false },
        { title: "Opposite Direction Pointers", completed: false, in_progress: true },
        { title: "Same Direction Pointers", completed: false, in_progress: true },
        { title: "Three Sum Pattern", completed: false, in_progress: false },
      ],
    },
    {
      title: "Sliding Window",
      completed: false,
      in_progress: true,
      lesson_stats: [
        { title: "Fixed Size Windows", completed: false, in_progress: true },
        { title: "Variable Size Windows", completed: false, in_progress: false },
        { title: "Window with HashMap", completed: false, in_progress: false },
        { title: "Maximum/Minimum Windows", completed: false, in_progress: true },
      ],
    },
    {
      title: "Binary Search",
      completed: false,
      in_progress: true,
      lesson_stats: [
        { title: "Binary Search Fundamentals", completed: false, in_progress: false },
        { title: "Search Space Reduction", completed: false, in_progress: false },
        { title: "Binary Search on Answer", completed: false, in_progress: true },
        { title: "Rotated Array Problems", completed: false, in_progress: false },
      ],
    },
  ]


  // DYNAMIC CONTENT END
  
  // --------------------------------------------------------------------------------------
  //          To be added dynamically when we setup the database for learning materials
  // --------------------------------------------------------------------------------------


  return (
    <LearnClient ds_param={data_structure} learning_tracks={learning_tracks} learning_stats={learning_stats}/>
  )
}