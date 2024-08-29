import mongoose from "mongoose";

const customMealSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique : false // this is not a unique field since it is not the primary key of the collection. It is the user id
    },
    email: String,
    mealName: String,
    calories: Number,
    protein: Number,
    fats: Number,
    fiber: Number,
    carbs: Number,
    sugar: Number,
    isCustomMeal: {
        type: Boolean,
        default: true
    }
})

const CustomMeal = mongoose.model("CustomMeal", customMealSchema);
export default CustomMeal;