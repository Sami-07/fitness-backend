import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
const userSchema = mongoose.Schema({

    userNname: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    age: Number,
    weight: Number,
    gender: String,
    goal: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
})
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)




export default User;