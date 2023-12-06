import express from "express";
import { getTodayMeals, addBreakfast, addMorningSnacks, addLunch, addEveningSnacks, addDinner, foodNutrients, getAllCustomMeals, addCustomMeal, removeMeal, getExistingMealNutrients } from "../controllers/dashboardControllers.js"
const router = express.Router();

router.get("/getmeals", getTodayMeals)
router.post("/addbreakfast", addBreakfast)
router.post("/addmorningsnacks", addMorningSnacks)
router.post("/addlunch", addLunch)
router.post("/addeveningsnacks", addEveningSnacks)
router.post("/adddinner", addDinner)
router.post("/foodnutrients", foodNutrients)
//MAKE the following method to POST
router.get("/getallcustommeals", getAllCustomMeals);
router.post("/addcustommeal", addCustomMeal);
router.post("/removemeal", removeMeal)
router.post("/getexistingmealnutrients", getExistingMealNutrients);
export default router;