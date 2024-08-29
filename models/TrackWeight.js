import mongoose from "mongoose";
const weightTrackerSchema = mongoose.Schema({
    _id: String,
    weight: Number,
    createdAt: { type: String, default: new Date().toLocaleDateString() }
})
const TrackWeight = mongoose.model("TrackWeight", weightTrackerSchema);
export default TrackWeight;