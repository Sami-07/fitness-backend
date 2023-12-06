import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    id: String,
    name: String,
    email: String,
    age: Number,
    weight: Number,
    gender: String,
    goal: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
})

const User = mongoose.model("User", userSchema)
export default User;