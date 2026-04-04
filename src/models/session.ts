import mongoose, { Mongoose } from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    validTill: {
        type: Date,
        required: true,
        default: Date.now()
    },
    type: {
        type: String,
        rquired: true
    }
}, { timestamps: true});

const Session = mongoose.models.session || mongoose.model("session", sessionSchema);
export default Session;