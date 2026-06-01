type lesson = {
    title: string,
    duration: string
}

export type learning_track = {
    title: string,
    description: string
    difficulty: string,
    lessons: lesson[]
    // color: "from-green-500 to-emerald-500"
}

type battle_mode = {
    icon: string,
    title: string,
    description: string,
    time: string,
    color: string
}

type testimonial = {
    name: string,
    avatar: string,
    role: string,
    content: string,
}

type activity = {
    user_name: string,
    action: string,
    time: string
}

type battle_stats = {
    rating: number,
    win_rate: number,
    battles: number,
    win_streak: number
}

type match = {
    opponent_user_name: string,
    problem: string,
    rating_change: number,
    time: string,
    result: string
}

type lesson_stats = {
    title: string,
    completed: Boolean,
    in_progress: Boolean
}

export type learning_stats = {
    title: string,
    completed: Boolean,
    in_progress: Boolean,
    lesson_stats: lesson_stats[]
}

type problems = {
    id: number,
    title: string,
    difficulty: string,
    category: string,
    acceptance_rate: number,
    time: string
}

type problem_stats = {
    id: number,
    solved: Boolean,
    attempted: Boolean,
    bookmarked: Boolean
}


export type Data_Structure_Props = {
  ds_param: string,

  battle_stats?: battle_stats,
  battle_modes?: battle_mode[],
  recent_matches?: match[],

  learning_tracks?: learning_track[],
  learning_stats?: learning_stats[],

  testimonials?: testimonial[],
  live_activity?: activity[],

  problems?: problems[],
  problem_stats?: problem_stats[],
};



