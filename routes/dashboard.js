import express from "express";
import { getTodayMeals, addBreakfast, addMorningSnacks, addLunch, addEveningSnacks, addDinner, foodNutrients, getAllCustomMeals, addCustomMeal, removeMeal, getExistingMealNutrients, addAssessmentDetails, addBodyWeight, getTodayBodyWeight, updateBodyWeight, fetchresults, getUserAssessment, calculateMacroIntake } from "../controllers/dashboardControllers.js"
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
router.post("/addassessmentdetails", addAssessmentDetails)
router.post("/addbodyweight", addBodyWeight)
router.get("/gettodaysbodyweight", getTodayBodyWeight)
router.post("/updatebodyweight", updateBodyWeight)
router.post("/fetchresults", fetchresults);
router.get("/getuserassessment", getUserAssessment);
router.get("/calculatemacrointake", calculateMacroIntake);
export default router;