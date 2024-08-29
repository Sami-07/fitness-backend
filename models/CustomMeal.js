import mongoose from "mongoose";

const customMealSchema = mongoose.Schema({
    _id: String,
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