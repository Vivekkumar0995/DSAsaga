import mongoose, { Schema, model, models } from "mongoose";

const questionSchema = new Schema({
    data_structure_id: {
        type: Schema.Types.ObjectId,
        ref: 'data_structure',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    category: {
        type: String,
        default: "Practice",
    },
    description: {
        type: String,
        required: true,
    },
    starter_code: {
        cpp:{
            type: String,
            default: "",
        },
        java: {
            type: String,
            default: "",
        },
        python:{
            type: String,
            default: "",
        },
        c:{
            type: String,
            default: "",
        }
    },
    return_type: {
        type: String,
        default: "int"
    },
    return_type_cpp: {
        type: String,
    },
    return_type_java: {
        type: String,
    },
    return_type_c: {
        type: String,
    },
    params: [
        {
            name: { type: String, required: true },
            type: { type: String, required: true },
            type_java: { type: String },
            type_c: { type: String }
        }
    ],
    test_cases: [
        {
            input: {
                type: String,
                required: true,
            },
            output:{
                type: String,
                required: true,
            },
        },
    ],
    order:{
        type: Number,
        required: true,
    },
    xp:{
        type: Number,
        required: true,
    },
    reference_solution: {
        type: String,
        default: "",
    },
}, { timestamps: true });

const Question = models.Question || model('Question', questionSchema);

export default Question;