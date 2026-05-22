import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  googleSubID: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpireAt: {
    type: Date,
    default: 0,
  },
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  resetOtp: {
    type: String,
    default: "",
  },
  resetOtpExpireAt: {
    type: Date,
    default: 0,
  },
  resetOtpVerifiedTill: {
    type: Date,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileImage: {
    type: String,
    default: "",
  },
  bannerImage: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  nationality: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  displayName: {
    type: String,
    default: "",
  }, 
  timeZone: { type: String, default: "UTC" },
  darkMode: { type: Boolean, default: false },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },

},{ timestamps: true });

const UserModel = mongoose.models.user || mongoose.model("user", userSchema);
export default UserModel;
