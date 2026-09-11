import mongoose from "mongoose";

const lesson_stats = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: Boolean,
    in_progress: Boolean
  },
  { _id: false }
)

const learning_stats = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: Boolean,
    in_progress: Boolean,
    lesson_stats: [lesson_stats]
  },
  { _id: false }
)

export const data_structure_stats = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true },
    learning_stats: [learning_stats]
  },
  { _id: false }
)

const userProgressSchema = new mongoose.Schema({
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },
      xp: {
        type: Number,
        default: 0,
      },
      level: {
        type: Number,
        default: 1,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      solvedCount: {
        type: Number,
        default: 0,
      },
      easySolved: {
        type: Number,
        default: 0,
      },
      mediumSolved: {
        type: Number,
        default: 0,
      },
      hardSolved: {
        type: Number,
        default: 0,
      },
      currentRank: {
        type: String,
        default: "Beginner",
      },
      data_structure_stats: {
        type: [data_structure_stats],
        default: []
      },
    },
    {
      timestamps: true,
    }
  );

const UserProgress = mongoose.models.user_progress || mongoose.model("user_progress", userProgressSchema);

export default UserProgress;