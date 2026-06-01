import PracticeClient from "@/components/data_structure/practice/PracticeClient";

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

  const problems = [
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
  ]

  const problem_stats = [
    { id: 1, solved: true, attempted: true, bookmarked: false},
    { id: 2, solved: true, attempted: true, bookmarked: true},
    { id: 3, solved: false, attempted: true, bookmarked: false},
    { id: 4, solved: true, attempted: true, bookmarked: false},
    { id: 5, solved: false, attempted: false, bookmarked: true},
    { id: 7, solved: false, attempted: true, bookmarked: false},
    { id: 8, solved: true, attempted: true, bookmarked: false},
    { id: 9, solved: false, attempted: true, bookmarked: true},
    { id: 11, solved: false, attempted: true, bookmarked: false},
  ]

  // DYNAMIC CONTENT END
  
  // --------------------------------------------------------------------------------------
  //          To be added dynamically when we setup the database for learning materials
  // --------------------------------------------------------------------------------------


  return (
    <PracticeClient ds_param={data_structure} problems={problems} problem_stats={problem_stats}/>
  )
}