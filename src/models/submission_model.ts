import mongoose, { Schema, model, models } from "mongoose";

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    verdict: {
        type: String,
        required: true,
    },
    passed: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const Submission = models.Submission || model('Submission', submissionSchema);

export default Submission;
