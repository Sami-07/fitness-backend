
import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    age: Number,
    gender: String,
    weight: Number,
    goal: String,
    goalWeight : Number

}, {
    timestamps: true // This option adds createdAt and updatedAt fields
})


const User = mongoose.model("User", userSchema)




export default User;