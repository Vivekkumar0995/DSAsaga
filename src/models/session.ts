import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["credentials", "google", "otp"],
      default: "credentials",
    },
  },
  { timestamps: true }
);


sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session =
  mongoose.models.session || mongoose.model("session", sessionSchema);

export default Session;