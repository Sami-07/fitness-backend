import mongoose from "mongoose";

const workoutSchema = mongoose.Schema({

  _id: {
    type: String,
    required: true,
    unique : false // this is not a unique field since it is not the primary key of the collection. It is the user id
},
    workoutDay: String,
    workoutDetails: Object,
    createdAt: {
        type: String,
        default: new Date().toLocaleDateString()
    }
})


const Workout = mongoose.model("Workout", workoutSchema);
export default Workout;