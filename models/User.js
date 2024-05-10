import mongoose from "mongoose";
const userSchema = mongoose.Schema({

    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    age: Number,
    gender: String,
    height: String,
    initialWeight: Number,
    weight: Number,
    approach: String,
    goalWeight: Number,
    activityLevel: String,
    calorieIntake: Number,
    proteinIntake: Number

}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)
export default User;