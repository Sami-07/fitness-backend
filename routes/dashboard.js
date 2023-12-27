import express from "express";
import { getTodayMeals, addBreakfast, addMorningSnacks, addLunch, addEveningSnacks, addDinner, foodNutrients, getAllCustomMeals, addCustomMeal, removeMeal, getExistingMealNutrients, addAssessmentDetails, addBodyWeight, getTodayBodyWeight, updateBodyWeight, fetchresults, getUserAssessment, calculateMacroIntake, getGoogleFitnessInfo, getExercises, addWorkout, getWorkoutDetails, editWorkoutDay, editSet, deleteSet, fetchWorkoutForADay, getAllExercises } from "../controllers/dashboardControllers.js"
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
// router.get("/getgooglefitnessinfo", getGoogleFitnessInfo);
router.post("/getexercises", getExercises);
router.post("/addworkout", addWorkout);
router.get("/getworkoutdetails", getWorkoutDetails);
router.post("/editworkoutday", editWorkoutDay);
router.post("/editset", editSet);
router.post("/deleteset", deleteSet);
router.post("/fetchworkoutforaday", fetchWorkoutForADay);
router.get("/getallexercises", getAllExercises);
export default router;