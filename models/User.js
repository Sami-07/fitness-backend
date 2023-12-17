import mongoose from "mongoose";
const userSchema = mongoose.Schema({

    name: String,
    email: String,
    age: Number,
    gender: String,
    height: String,
    weight: Number,
    approach: String,
    goalWeight: Number,
    activityLevel: String,
    calorieIntake : Number,
    proteinIntake : Number

}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)
export default User;