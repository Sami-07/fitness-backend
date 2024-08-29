import mongoose from "mongoose";

const trackFoodData = mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique : false // this is not a unique field since it is not the primary key of the collection. It is the user id
    },
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
