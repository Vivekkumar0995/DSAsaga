import mongoose from "mongoose";

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
    },
    {
      timestamps: true,
    }
  );

const UserProgress = mongoose.models.user_progress || mongoose.model("user_progress",userProgressSchema);

export default UserProgress;