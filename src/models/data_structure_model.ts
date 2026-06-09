import mongoose from "mongoose";

const dataStructureSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    learning_tracks: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    battle_modes: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    problems: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    testimonials: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    live_activity: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

const DataStructureModel =
  mongoose.models.data_structure ||
  mongoose.model("data_structure", dataStructureSchema);

export default DataStructureModel;


