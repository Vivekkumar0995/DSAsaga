import { BattleArenaSection } from "@/components/data_structure/Battle"
import { LearningHubSection } from "@/components/data_structure/Learn"
import { CommunitySection } from "@/components/data_structure/Community"

export default async function BattlePage({
  params,
}: {
  params: Promise<{ data_structure: string }>
}) {
  const { data_structure } = await params;


  // --------------------------------------------------------------------------------------
  //          To be added dynamically when we setup the database for learning materials
  // --------------------------------------------------------------------------------------

  // DYNAMIC CONTENT START





  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //                Remember to keep this structure of learning_tractks and stats as this 
  //                is very fragile. Also, this would be the structure in database
  //              :) Any suggestions is welcome
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer @ Google",
      content: "Array section helped me ace my coding interviews. The questions and format made practice addictive!",
      avatar: "S",
    },
    {
      name: "Marcus Johnson",
      role: "CS Student",
      content: "Way more fun than grinding LeetCode alone. Competing with others keeps me motivated.",
      avatar: "M",
    },
    {
      name: "Priya Patel",
      role: "Full Stack Developer",
      content: "The learning tracks are incredibly well-structured. Went from struggling with DP to loving it.",
      avatar: "P",
    },
  ]

  const live_activity = [
    { user_name: "CodeNinja42", action: "won a ranked battle", time: "2m ago" },
    { user_name: "AlgoQueen", action: "completed Binary Search track", time: "5m ago" },
    { user_name: "ByteMaster", action: "reached Diamond rank", time: "8m ago" },
    { user_name: "DevWarrior", action: "solved 50 problems", time: "12m ago" },
  ]

  // DYNAMIC CONTENT END
  
  // --------------------------------------------------------------------------------------
  //          To be added dynamically when we setup the database for learning materials
  // --------------------------------------------------------------------------------------





  return (
    <div className="array-battle-theme min-h-screen bg-white text-black">
      <main>
        <div className="top-25 relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-gray-200 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Season 3 Live Now</span>
          </div>
        </div>

        <BattleArenaSection ds_param={data_structure} battle_modes={battle_modes}/>
        <LearningHubSection ds_param={data_structure} learning_stats={learning_stats} learning_tracks={learning_tracks}/>
        <CommunitySection ds_param={data_structure} testimonials={testimonials} live_activity={live_activity}/>
      </main>
    </div>
  )
}
