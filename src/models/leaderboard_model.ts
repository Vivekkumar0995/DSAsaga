import mongoose from "mongoose";
const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  problemsSolved: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    default: "Beginner",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  }
});

// Adding an index to score for automatic and instant descending sort at the DB level
leaderboardSchema.index({ score: -1 });

const LeaderboardModel = mongoose.models.leaderboard || mongoose.model("leaderboard", leaderboardSchema);
export default LeaderboardModel;
