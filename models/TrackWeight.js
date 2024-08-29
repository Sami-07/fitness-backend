import mongoose from "mongoose";
const weightTrackerSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique : false // this is not a unique field since it is not the primary key of the collection. It is the user id
    },
    weight: Number,
    createdAt: { type: String, default: new Date().toLocaleDateString() }
})
const TrackWeight = mongoose.model("TrackWeight", weightTrackerSchema);
export default TrackWeight;