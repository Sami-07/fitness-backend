import dotenv from 'dotenv';
dotenv.config();
import TrackFood from "../models/trackFoodData.js";
import CustomMeal from "../models/CustomMeal.js";
import TrackWeight from "../models/TrackWeight.js";
import admin from "firebase-admin";
import User from "../models/User.js";
import { OAuth2Client } from 'google-auth-library';
import { calculateIntake } from "../modules/calorieCalculator.js";
import Workout from "../models/Workout.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { domains } from 'googleapis/build/src/apis/domains/index.js';
//authorize the user in the middleware and attach the authorization token to the request object. 
//req.headers.authorization.split(' ')[1];
//encrypt the pasword in /signup route.

export async function hello(req, res) {
  res.json({ message: "Hello" })
}
export async function getCurrentUser(req, res) {
  if (!req?.user) {
    res.json({ status: false, message: "No user found" })
    return
  }
  const { id, email } = req?.user;

  const user = await User.findOne({ _id: id })
  if (user) {
    res.json({ status: true, user: { id: user._id, name: user.name, email: user.email } })
  }
  else {
    res.json({ status: false })
  }
}
export async function registerFunction(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let user = new User({
      name: req.body.userName,
      email: (req.body.email).toLowerCase(),
      password: hashedPassword
    })
    const savedUser = await user.save();
    if (user) {
      const token = await jwt.sign({ id: savedUser._id, name: req.body.userName, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" })

      res.cookie("token", token, {
        domains: ["https://fitness-freak-sami07s-projects.vercel.app"],
        sameSite: "none",

        maxAge: 30 * 24 * 60 * 60 * 1000,
      })

      res.json({ status: true, message: "Registered successfully", user: { name: req.body.userName, email: req.body.email } })
    }
  } catch (error) {
    res.json({ status: false, message: error.message })

  }
}

// export async function registerWithGoogle(req, res) {
//   const { displayName, email } = req.body;
//   let data = await User.findOne({ email: email });
//   if (data) {
//     res.json({ status: true });
//   }
//   else {
//     let user = new User({
//       name: req.body.displayName,
//       email: req.body.email
//     })
//     await user.save();
//     res.json({ status: true })
//   }
// }

//TODO : check if decodedToken is valid instead of idToken AND only then proceed with the database changes.
export async function addAssessmentDetails(req, res) {
  const { id, email } = req?.user;
  const { age, gender, height, weight, approach, goalWeight, activityLevel } = req.body;
  const initialWeight = weight;
  const updateUserDetails = await User.findOneAndUpdate({ _id: id }, { age, gender, height, initialWeight, weight, approach, goalWeight, activityLevel })
  res.json({ status: true })
}

export async function getUserAssessment(req, res) {

  const { id, email } = req?.user;
  const data = await User.findOne({ _id: id })
  if (data) {

    res.json({ age: data.age, initialWeight: data.initialWeight, weight: data.weight, height: data.height, gender: data.gender, goalWeight: data.goalWeight, activityLevel: data.activityLevel, approach: data.approach, calorieIntake: data.calorieIntake, proteinIntake: data.proteinIntake })
  }
}

export async function calculateMacroIntake(req, res) {
  const { id, email } = req?.user;
  const { weight, height, age, gender, activityLevel, approach } = await User.findOne({ _id: id })
  const { dailyCalories, proteinIntake } = calculateIntake({ weight, height, age, gender, activityLevel, approach })
  await User.findOneAndUpdate({ _id: id }, { calorieIntake: dailyCalories, proteinIntake: proteinIntake })
  res.json({ status: true });
}

export async function addBodyWeight(req, res) {
  const { id, email } = req?.user;
  const date = new Date().toLocaleDateString();
  const bodyWeightExists = await TrackWeight.findOne({ email: email, createdAt: date })
  if (bodyWeightExists) {
    res.json({ status: false, err: "you have already tracked your body weight today." })
  }
  else {
    const bodyWeightData = new TrackWeight({
      email,
      weight: req.body.weight
    })
    const saved = await bodyWeightData.save();
    if (saved) {
      //UPDATING the current Logged weight in the users database.
      await User.findOneAndUpdate({ _id: id }, { weight: req.body.weight })
      //UPDATING the calorie and protein intake in the users database because weight is changed.
      const { weight, height, age, gender, activityLevel, approach } = await User.findOne({ _id: id })
      const { dailyCalories, proteinIntake } = calculateIntake({ weight, height, age, gender, activityLevel, approach })
      await User.findOneAndUpdate({ _id: id }, { calorieIntake: dailyCalories, proteinIntake: proteinIntake })
      res.json({ status: true })
    }
    else {
      res.json({ status: false })
    }
  }
}

export async function updateBodyWeight(req, res) {
  const { id, email } = req?.user;
  const date = new Date().toLocaleDateString();
  const data = await TrackWeight.findOneAndUpdate({ email, createdAt: date }, { weight: req.body.weight })
  if (data) {
    //UPDATING the current Logged weight in the users database.
    await User.findOneAndUpdate({ _id: id }, { weight: req.body.weight })
    //UPDATING the calorie and protein intake in the users database because weight is changed.
    const { weight, height, age, gender, activityLevel, approach } = await User.findOne({ _id: id })
    const { dailyCalories, proteinIntake } = calculateIntake({ weight, height, age, gender, activityLevel, approach })
    await User.findOneAndUpdate({ _id: id }, { calorieIntake: dailyCalories, proteinIntake: proteinIntake })
    res.json({ status: true })
  }
  else {
    res.json({ status: false })
  }
}

export async function getTodayBodyWeight(req, res) {
  const { id, email } = req?.user;
  const date = new Date().toLocaleDateString();
  const data = await TrackWeight.findOne({ email, createdAt: date })
  if (data) {
    res.json({ status: true, data: data })
  }
  else {
    res.json({ status: false })
  }
}

export async function getGoogleFitnessInfo(req, res) {

};

export async function fetchresults(req, res) {
  const { term } = req.body;
  const MY_URL = `https://api.api-ninjas.com/v1/nutrition?query=${term}`
  const response = await fetch(MY_URL, { headers: { 'X-Api-Key': process.env.API_NINJAS_API_KEY } })
  const result = await response.json();
  res.json({ data: result });
}

export async function getTodayMeals(req, res) {
  const { id, email } = req?.user;
  try {
    const todayDate = new Date().toLocaleDateString();
    const mealsData = await TrackFood.find({ addedAt: todayDate, email });
    res.json({ data: mealsData })
  }
  catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export async function test(req, res) {

  res.json({ message: "test" })

}

export async function addBreakfast(req, res) {
  try {

    const { id, email } = req?.user;
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;

    const result = await TrackFood.findOne({ addedAt: todayDate, email: email });
    if (result) {
      const prevBreakfastData = result.breakfast;
      const newBreakfastData = { ...prevBreakfastData, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: email }, { breakfast: newBreakfastData })
    }
    else {

      let breakfast = new TrackFood({
        email: email,
        breakfast: body
      })
      breakfast.save();

    }
  } catch (error) {
    console.log(error.message);
  }
}

//Morning Snacks
export async function addMorningSnacks(req, res) {
  try {
    const { id, email } = req?.user;
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email });
    if (result) {
      const prevMorningSnacks = result.morningSnacks;
      const newMorningSnacks = { ...prevMorningSnacks, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { morningSnacks: newMorningSnacks })
    }
    else {
      let morningSnacks = new TrackFood({
        email,
        morningSnacks: body
      })
      morningSnacks.save();
    }
  } catch (error) {
    console.log(error.message);
  }
}

//Lunch
export async function addLunch(req, res) {
  try {
    const { id, email } = req?.user;
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email });
    if (result) {
      const prevLunch = result.lunch;
      const newLunch = { ...prevLunch, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { lunch: newLunch })
    }
    else {
      let lunch = new TrackFood({
        email,
        lunch: body
      })
      lunch.save();
    }

  } catch (error) {
    console.log(error.message);
  }
}

//Evening Snacks
export async function addEveningSnacks(req, res) {
  try {
    const { id, email } = req?.user;
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email });
    if (result) {
      const prevEveningSnacks = result.eveningSnacks;
      const newEveningSnacks = { ...prevEveningSnacks, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { eveningSnacks: newEveningSnacks })
    }
    else {
      let eveningSnacks = new TrackFood({
        email,
        eveningSnacks: body
      })
      eveningSnacks.save();
    }

  } catch (error) {
    console.log(error.message);
  }
}

//Dinner
export async function addDinner(req, res) {
  try {
    const { id, email } = req?.user;
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email });
    if (result) {
      const prevDinner = result.dinner;
      const newDinner = { ...prevDinner, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { dinner: newDinner })
    }
    else {
      let dinner = new TrackFood({
        email,
        dinner: body
      })
      dinner.save();
    }

  } catch (error) {
    console.log(error.message);
  }
}

export async function foodNutrients(req, res) {

  const body = req.body;
  const foodName = body.foodName;
  const MY_URL = `https://api.api-ninjas.com/v1/nutrition?query=${foodName}`
  try {
    const response = await fetch(MY_URL, { headers: { 'X-Api-Key': process.env.API_NINJAS_API_KEY } })
    const result = await response.json();
    // return result;
    res.json({ data: result });
  } catch (err) {
    console.log(err.message);
  }
}

export async function getExistingMealNutrients(req, res) {
  const { id, email } = req?.user;
  const { foodName, mealType } = req.body;
  const todayDate = new Date().toLocaleDateString();
  const info = await TrackFood.findOne({ addedAt: todayDate, email })
  const meal = info[mealType];
  const obj = {
    [foodName]: {
      ...meal[foodName]
    }
  }
  res.json(obj);
}

export async function getAllCustomMeals(req, res) {
  const { id, email } = req?.user;
  const result = await CustomMeal.find({ email });
  res.json({ data: result });
}

export async function addCustomMeal(req, res) {
  const { id, email: tokenEmail } = req?.user;
  const { email, mealName, calories, protein, fats, fiber, carbs, sugar } = req.body;
  if (email !== tokenEmail) {
    res.json({ status: false, message: "Unauthorized" })
  }
  let newMeal = new CustomMeal({
    email, mealName, calories, protein, fats, fiber, carbs, sugar
  })
  newMeal.save();
}

export async function removeMeal(req, res) {
  const { id, email } = req?.user;
  const todayDate = new Date().toLocaleDateString();
  const { foodItem, mealType } = req.body;

  let result = await TrackFood.findOne({ addedAt: todayDate, email })
  switch (mealType) {
    case "breakfast":
      const prevBreakfast = result.breakfast;
      delete prevBreakfast[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { breakfast: prevBreakfast })
      break;

    case "morningSnacks":
      const prevMorningSnacks = result.morningSnacks;
      delete prevMorningSnacks[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { morningSnacks: prevMorningSnacks })
      break;
    case "lunch":
      const prevLunch = result.lunch;
      delete prevLunch[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { lunch: prevLunch })
      break;
    case "eveningSnacks":
      const prevEveningSnacks = result.eveningSnacks;
      delete prevEveningSnacks[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { eveningSnacks: prevEveningSnacks })
      break;
    case "dinner":
      const prevDinner = result.dinner;
      delete prevDinner[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email }, { dinner: prevDinner })
      break;
  }
  // let response = await TrackFood.findOneAndUpdate({ addedAt: todayDate, _id : id })
}



// !Workout routes
export async function getExercises(req, res) {
  const response = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${req.body.muscle}`, { headers: { 'X-Api-Key': process.env.API_NINJAS_API_KEY } })
  const x = await response.json()
  if (req.body.muscle === "chest") {
    x.push({ name: "Seated Chest Press" }, { name: "Seated Flyes" }, { name: "Decline Dumbbell Press" })
  }
  res.json({ status: true, result: x })
}

// Structure of workoutDetails
// const workoutDetails = {
//   chestPress: [{ weight: 10, reps: 12 }, { weight: 10, reps: 12 }, { weight: 10, reps: 12 }],

//   dumbbellPress: [{ weight: 10, reps: 12 }, { weight: 10, reps: 12 }, { weight: 10, reps: 12 }]
// }

export async function addWorkout(req, res) {
  try {
    const { id, email } = req?.user;
    const { workoutDay, exercise, weight, reps } = req.body;
    const date = new Date().toLocaleDateString();
    const workoutInfo = await Workout.findOne({ email, createdAt: date })
    if (workoutInfo) {
      if (Object.keys(workoutInfo.workoutDetails).includes(exercise)) {
        const newWorkout = [...workoutInfo.workoutDetails[exercise], { weight, reps }]
        const newWorkoutInfo = { ...workoutInfo.workoutDetails, [exercise]: newWorkout }
        const addNewWorkout = await Workout.findOneAndUpdate({ email, createdAt: date }, { workoutDetails: newWorkoutInfo })
        res.json({ status: true, message: "Set added successfully" })
      }
      else {
        const createExercise = { ...workoutInfo.workoutDetails, [exercise]: [{ weight, reps }] }
        const addNewWorkout = await Workout.findOneAndUpdate({ email, createdAt: date }, { workoutDetails: createExercise })
        res.json({ status: true, message: "workout added successfully" })
      }
    }
    else {
      const createWorkout = new Workout({
        email,
        workoutDay,
        workoutDetails: { [exercise]: [{ weight, reps }] }
      })
      await createWorkout.save();
      res.json({ status: true, message: "Created Workout day successfully" })
    }

  } catch (err) {
    res.json({ status: false, message: err.message })
  }
}

export async function getWorkoutDetails(req, res) {
  const { id, email } = req?.user;
  const date = new Date().toLocaleDateString();
  const workoutDetails = await Workout.findOne({ email, createdAt: date })
  res.json({ status: true, parsedRes: workoutDetails });
}

export async function editWorkoutDay(req, res) {
  const { id, email } = req?.user;
  const date = new Date().toLocaleDateString();
  const { workoutDay } = req.body;
  const workoutDetails = await Workout.findOneAndUpdate({ email, createdAt: date }, { workoutDay: workoutDay })
  if (workoutDetails) {
    res.json({ status: true, message: "updated workout day" })
  }
}

export async function editSet(req, res) {
  const { id, email } = req?.user;
  const { editExercise, editWeight, editReps, prevWeight, prevReps } = req.body;
  const date = new Date().toLocaleDateString();
  const workout = await Workout.findOne({ email, createdAt: date })
  const newWorkout = workout.workoutDetails[editExercise].map(eachSet => {
    if (eachSet.weight === prevWeight && eachSet.reps === prevReps) {
      return (
        { weight: Number(editWeight), reps: Number(editReps) }
      )
    }
    else {
      return (
        eachSet
      )
    }
  })
  const newWorkoutDetails = { ...workout.workoutDetails, [editExercise]: newWorkout }

  const updateWorkout = await Workout.findOneAndUpdate({ email, createdAt: date }, { workoutDetails: newWorkoutDetails });
  if (updateWorkout) {
    res.json({ status: true, message: "Edited set successfully" })
  }
  else {
    res.json({ status: false, message: "Could not edit set" })
  }
}

export async function deleteSet(req, res) {
  const { id, email } = req?.user;
  const { editExercise, prevWeight, prevReps } = req.body;
  const date = new Date().toLocaleDateString();
  const workout = await Workout.findOne({ email, createdAt: date })
  const newWorkout = workout.workoutDetails[editExercise].filter(eachSet =>
    !((eachSet.weight === prevWeight) && (eachSet.reps === prevReps))
  )

  const newWorkoutDetails = { ...workout.workoutDetails, [editExercise]: newWorkout }

  if (newWorkoutDetails[editExercise].length === 0) {
    delete newWorkoutDetails[editExercise];
  }
  const updateWorkout = await Workout.findOneAndUpdate({ email, createdAt: date }, { workoutDetails: newWorkoutDetails });
  if (updateWorkout) {
    res.json({ status: true, message: "Deleted set successfully" })
  }
  else {
    res.json({ status: false, message: "Could not delete set" })
  }
}

export async function fetchWorkoutForADay(req, res) {
  const { id, email } = req?.user;
  const { selectedDate } = req.body;
  const workoutInfo = await Workout.findOne({ email, createdAt: selectedDate })
  if (workoutInfo) {
    res.json({ status: true, workoutDetails: workoutInfo.workoutDetails })
  }
  else {
    res.json({ status: false })
  }
}

export async function getAllExercises(req, res) {
  const response = await fetch(`https://api.api-ninjas.com/v1/exercises`, { headers: { 'X-Api-Key': process.env.API_NINJAS_API_KEY } })
  const x = await response.json()
  x.push({ name: "Seated Chest Press" }, { name: "Seated Flyes" }, { name: "Decline Dumbbell Press" })
  const names = x.map(each => {
    return (each.name)
  });

  res.json({ status: true, result: x })
}

export async function getGoogleFitSteps(req, res) {
  try {
    // 
    // 
    // if (idToken) {
    //   
    //   
    //   const x =await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${idToken}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       "aggregateBy": [{
    //         "dataTypeName": "com.google.step_count.delta",
    //         "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
    //       }],
    //       "startTimeMillis": new Date().getTime() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    //       "endTimeMillis": new Date().getTime(),
    //     }),
    //   })
    //   
    //   const parsedX = await x.json();
    //   
    // }
  }
  catch (err) {

  }
};

export async function addWater(req, res) {
  const { id, email } = req?.user;
  try {
    const date = new Date().toLocaleDateString();
    const foodData = await TrackFood.findOne({ addedAt: date, email })

    if (foodData) {
      if (foodData.waterIntake) {
        const updatedFoodData = await TrackFood.findOneAndUpdate({ addedAt: date, email }, { waterIntake: foodData.waterIntake + req.body.qty })
      }
      else {
        const foodData = await TrackFood.findOneAndUpdate({ addedAt: date, email }, { waterIntake: req.body.qty })
      }
    }
    else {
      const newFoodData = new TrackFood({
        email,
        waterIntake: req.body.qty
      })
      await newFoodData.save();
    }
    res.json({ status: true, msg: " logged water intake" })

  }
  catch (err) {
    res.json({ status: false, msg: err.message })
  }
}
export async function fetchWaterIntake(req, res) {
  try {
    const { id, email } = req?.user;
    const date = new Date().toLocaleDateString();
    const foodData = await TrackFood.findOne({ addedAt: date, email })
    if (foodData) {
      res.json({ status: true, waterIntake: foodData.waterIntake })
    }

  }
  catch (err) {
    res.json({ status: false, msg: err.message })
  }
}