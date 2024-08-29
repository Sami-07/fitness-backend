import mongoose from "mongoose";

const trackFoodData = mongoose.Schema({
    _id: String,
    email: String,
    waterIntake: Number,
    breakfast: Object,
    morningSnacks: Object,
    lunch: Object,
    eveningSnacks: Object,
    dinner: Object,
    addedAt: {
       type : String,
        default: new Date().toLocaleDateString()
    }
})

const TrackFood = mongoose.model("TrackFood", trackFoodData);
export default TrackFood;
