import mongoose from "mongoose";

const workoutSchema = mongoose.Schema({
    id: String,
    email: String,
    workoutDay: String,
    workoutDetails: [Object],
    addedAt: {
        type: Date,
        default: new Date()
    }
})
