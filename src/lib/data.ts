import {
  Search,
  Binary,
  ArrowRight,
  TrendingUp,
  Layers,
  GitBranch,
  Zap,
  Swords,
  Users,
  Clock,
  Trophy,
  BookOpen,
  Target,
  Flame,
  Star,
  Award,
  type LucideIcon,
} from "lucide-react"

export interface SearchTechnique {
  id: string
  name: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  lessonsCount: number
  completedLessons: number
  description: string
  estimatedTime: string
  icon: LucideIcon
}

export const searchTechniques: SearchTechnique[] = [
  {
    id: "linear",
    name: "Linear Search",
    difficulty: "Beginner",
    lessonsCount: 5,
    completedLessons: 5,
    description: "Sequential search through elements one by one",
    estimatedTime: "1.5 hours",
    icon: Search,
  },
  {
    id: "binary",
    name: "Binary Search",
    difficulty: "Intermediate",
    lessonsCount: 8,
    completedLessons: 3,
    description: "Efficient divide and conquer on sorted arrays",
    estimatedTime: "3 hours",
    icon: Binary,
  },
  {
    id: "jump",
    name: "Jump Search",
    difficulty: "Intermediate",
    lessonsCount: 4,
    completedLessons: 0,
    description: "Block-based search with optimal jump size",
    estimatedTime: "2 hours",
    icon: ArrowRight,
  },
  {
    id: "interpolation",
    name: "Interpolation Search",
    difficulty: "Advanced",
    lessonsCount: 6,
    completedLessons: 0,
    description: "Position estimation for uniformly distributed data",
    estimatedTime: "2.5 hours",
    icon: TrendingUp,
  },
  {
    id: "exponential",
    name: "Exponential Search",
    difficulty: "Advanced",
    lessonsCount: 5,
    completedLessons: 0,
    description: "Unbounded search with exponential probing",
    estimatedTime: "2 hours",
    icon: Layers,
  },
  {
    id: "ternary",
    name: "Ternary Search",
    difficulty: "Advanced",
    lessonsCount: 4,
    completedLessons: 0,
    description: "Three-way divide search for unimodal functions",
    estimatedTime: "2 hours",
    icon: GitBranch,
  },
]

export interface BattleMode {
  id: string
  name: string
  description: string
  time: string
  icon: LucideIcon
  color: string
}

export const battleModes: BattleMode[] = [
  {
    id: "quick",
    name: "Quick Match",
    description: "Practice searching problems instantly.",
    time: "5 min",
    icon: Zap,
    color: "text-amber-500",
  },
  {
    id: "ranked",
    name: "Ranked Battle",
    description: "Compete with coders worldwide.",
    time: "15 min",
    icon: Swords,
    color: "text-primary",
  },
  {
    id: "friend",
    name: "Friend Challenge",
    description: "Invite friends to a private room.",
    time: "Custom",
    icon: Users,
    color: "text-blue-500",
  },
]

export interface Problem {
  id: string
  name: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  successRate: number
  xp: number
  estimatedTime: string
}

export const problems: Problem[] = [
  {
    id: "1",
    name: "Binary Search Basics",
    difficulty: "Easy",
    topic: "Binary Search",
    successRate: 85,
    xp: 50,
    estimatedTime: "15 min",
  },
  {
    id: "2",
    name: "Search Insert Position",
    difficulty: "Easy",
    topic: "Binary Search",
    successRate: 78,
    xp: 75,
    estimatedTime: "20 min",
  },
  {
    id: "3",
    name: "Find First Occurrence",
    difficulty: "Medium",
    topic: "Lower Bound",
    successRate: 62,
    xp: 100,
    estimatedTime: "25 min",
  },
  {
    id: "4",
    name: "Search in Rotated Array",
    difficulty: "Medium",
    topic: "Rotated Array Search",
    successRate: 48,
    xp: 150,
    estimatedTime: "30 min",
  },
  {
    id: "5",
    name: "Peak Element Finder",
    difficulty: "Medium",
    topic: "Peak Element Search",
    successRate: 55,
    xp: 125,
    estimatedTime: "25 min",
  },
  {
    id: "6",
    name: "Search in 2D Matrix",
    difficulty: "Hard",
    topic: "Matrix Search",
    successRate: 35,
    xp: 200,
    estimatedTime: "40 min",
  },
  {
    id: "7",
    name: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    topic: "Binary Search on Answer",
    successRate: 22,
    xp: 300,
    estimatedTime: "45 min",
  },
  {
    id: "8",
    name: "Koko Eating Bananas",
    difficulty: "Medium",
    topic: "Binary Search on Answer",
    successRate: 52,
    xp: 150,
    estimatedTime: "30 min",
  },
]

export interface Course {
  id: string
  name: string
  description: string
  lessonsCount: number
  completedLessons: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  icon: LucideIcon
}

export const courses: Course[] = [
  {
    id: "1",
    name: "Linear Search Fundamentals",
    description: "Master the basics of sequential searching",
    lessonsCount: 5,
    completedLessons: 5,
    difficulty: "Beginner",
    icon: Search,
  },
  {
    id: "2",
    name: "Binary Search Mastery",
    description: "Deep dive into divide and conquer search",
    lessonsCount: 12,
    completedLessons: 8,
    difficulty: "Intermediate",
    icon: Binary,
  },
  {
    id: "3",
    name: "Searching in Matrix",
    description: "2D search algorithms and optimizations",
    lessonsCount: 8,
    completedLessons: 0,
    difficulty: "Advanced",
    icon: Layers,
  },
  {
    id: "4",
    name: "Rotated Array Search",
    description: "Handle sorted arrays with rotation",
    lessonsCount: 6,
    completedLessons: 0,
    difficulty: "Intermediate",
    icon: ArrowRight,
  },
  {
    id: "5",
    name: "Binary Search on Answer",
    description: "Optimize using binary search patterns",
    lessonsCount: 10,
    completedLessons: 0,
    difficulty: "Advanced",
    icon: Target,
  },
  {
    id: "6",
    name: "Competitive Search Patterns",
    description: "Advanced techniques for competitions",
    lessonsCount: 15,
    completedLessons: 0,
    difficulty: "Advanced",
    icon: Trophy,
  },
]

export interface LeaderboardUser {
  rank: number
  username: string
  avatar: string
  xp: number
  winRate: number
  streak: number
  problemsSolved: number
}

export const leaderboardUsers: LeaderboardUser[] = [
  {
    rank: 1,
    username: "AlgoMaster",
    avatar: "AM",
    xp: 25400,
    winRate: 92,
    streak: 45,
    problemsSolved: 312,
  },
  {
    rank: 2,
    username: "SearchNinja",
    avatar: "SN",
    xp: 23100,
    winRate: 88,
    streak: 32,
    problemsSolved: 287,
  },
  {
    rank: 3,
    username: "BinaryQueen",
    avatar: "BQ",
    xp: 21800,
    winRate: 85,
    streak: 28,
    problemsSolved: 265,
  },
  {
    rank: 4,
    username: "CodeWarrior",
    avatar: "CW",
    xp: 19500,
    winRate: 82,
    streak: 21,
    problemsSolved: 243,
  },
  {
    rank: 5,
    username: "TechSavvy",
    avatar: "TS",
    xp: 18200,
    winRate: 79,
    streak: 18,
    problemsSolved: 228,
  },
  {
    rank: 6,
    username: "AlgoExpert",
    avatar: "AE",
    xp: 16800,
    winRate: 76,
    streak: 15,
    problemsSolved: 212,
  },
  {
    rank: 7,
    username: "SearchPro",
    avatar: "SP",
    xp: 15400,
    winRate: 74,
    streak: 12,
    problemsSolved: 198,
  },
  {
    rank: 8,
    username: "DataHunter",
    avatar: "DH",
    xp: 14100,
    winRate: 71,
    streak: 10,
    problemsSolved: 185,
  },
  {
    rank: 9,
    username: "ByteMaster",
    avatar: "BM",
    xp: 12800,
    winRate: 68,
    streak: 8,
    problemsSolved: 172,
  },
  {
    rank: 10,
    username: "LogicLord",
    avatar: "LL",
    xp: 11500,
    winRate: 65,
    streak: 6,
    problemsSolved: 158,
  },
]

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  content: string
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    avatar: "SC",
    content:
      "Search Battle transformed my understanding of search algorithms. The interactive battles made learning fun and competitive!",
  },
  {
    id: "2",
    name: "Alex Kumar",
    role: "Full Stack Developer",
    avatar: "AK",
    content:
      "The structured learning paths and real-time coding challenges helped me ace my technical interviews.",
  },
  {
    id: "3",
    name: "Emily Davis",
    role: "CS Student at MIT",
    avatar: "ED",
    content:
      "Best platform for mastering search techniques. The progression system keeps me motivated every day.",
  },
]

export interface Activity {
  id: string
  user: string
  action: string
  time: string
  icon: LucideIcon
}

export const activities: Activity[] = [
  {
    id: "1",
    user: "AlgoMaster",
    action: "completed Binary Search track",
    time: "2 min ago",
    icon: Trophy,
  },
  {
    id: "2",
    user: "SearchNinja",
    action: "won a ranked battle",
    time: "5 min ago",
    icon: Swords,
  },
  {
    id: "3",
    user: "BinaryQueen",
    action: "unlocked Elite Searcher badge",
    time: "12 min ago",
    icon: Award,
  },
  {
    id: "4",
    user: "CodeWarrior",
    action: "reached 20-day streak",
    time: "18 min ago",
    icon: Flame,
  },
  {
    id: "5",
    user: "TechSavvy",
    action: "earned 500 XP",
    time: "25 min ago",
    icon: Star,
  },
]

export const difficultyTopics = [
  "All Topics",
  "Linear Search",
  "Binary Search",
  "Jump Search",
  "Ternary Search",
  "Matrix Search",
  "Rotated Array Search",
  "Lower Bound",
  "Upper Bound",
  "Peak Element Search",
  "Binary Search on Answer",
]

export const ranks = [
  { name: "Beginner Scout", minXp: 0, icon: Search },
  { name: "Search Apprentice", minXp: 1000, icon: BookOpen },
  { name: "Binary Explorer", minXp: 5000, icon: Binary },
  { name: "Algorithm Hunter", minXp: 15000, icon: Target },
  { name: "Elite Searcher", minXp: 30000, icon: Award },
  { name: "Grandmaster Solver", minXp: 50000, icon: Trophy },
]
