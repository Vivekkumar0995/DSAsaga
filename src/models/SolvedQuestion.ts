import mongoose from "mongoose";

const solvedQuestionSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    questionSlug: {
      type: String,
      required: true,
    },
    dataStructureSlug: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["solved", "attempted"],
      default: "attempted",
    },

    xpEarned: {
      type: Number,
      default: 0,
    },
    solvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

solvedQuestionSchema.index({
  userId: 1,
  questionId: 1,
});

const SolvedQuestion = mongoose.models.solved_question || mongoose.model("solved_question", solvedQuestionSchema);
export default SolvedQuestion;
