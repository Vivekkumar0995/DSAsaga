import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const learningTrackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true, trim: true },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  { _id: false }
);

const battleModeSchema = new mongoose.Schema(
  {
    icon: { type: String, required: true, trim: true},
    title: { type: String, required: true, trim: true},
    description: { type: String, required: true, trim: true},
    time: { type: String, required: true, trim: true},
    color: { type: String, required: true, trim: true}
  },
  { _id: false }
)

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true},
    avatar: { type: String, required: true, trim: true},
    role: { type: String, required: true, trim: true},
    content: { type: String, required: true, trim: true}
  },
  { _id: false }
)

const activitySchema = new mongoose.Schema(
  {
    user_name: { type: String, required: true, trim: true},
    action: { type: String, required: true, trim: true},
    time: { type: String, required: true, trim: true}
  },
  { _id: false }
)

const problemSchema = new mongoose.Schema(
  {
    id: Number,
    title: { type: String, required: true, trim: true},
    difficulty: { type: String, required: true, trim: true},
    category: { type: String, required: true, trim: true},
    acceptance_rate: Number,
    time: { type: String, required: true, trim: true}
  },
  { _id: false }
)

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
      type: [learningTrackSchema],
      default: [],
    },
    battle_modes: {
      type: [battleModeSchema],
      default: [],
    },
    problems: {
      type: [problemSchema],
      default: [],
    },
    testimonials: {
      type: [testimonialSchema],
      default: [],
    },
    live_activity: {
      type: [activitySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export type DataStructureType = mongoose.InferSchemaType<typeof dataStructureSchema> & {
    _id: mongoose.Types.ObjectId;
  };

const DataStructureModel =
  mongoose.models.data_structure ||
  mongoose.model("data_structure", dataStructureSchema);

export default DataStructureModel;


