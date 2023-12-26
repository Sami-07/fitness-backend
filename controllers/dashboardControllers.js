import TrackFood from "../models/trackFoodData.js";
import CustomMeal from "../models/CustomMeal.js";
import TrackWeight from "../models/TrackWeight.js";
import admin from "firebase-admin";
import serviceAccount from "../config/serviceAccount.json" assert {type: "json"}
import User from "../models/User.js";
import { google } from "googleapis";
import { calculateIntake } from "../modules/calorieCalculator.js";
import Workout from "../models/Workout.js";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
//TODO : check if decodedToken is valid instead of idToken AND only then proceed with the database changes.
export async function addAssessmentDetails(req, res) {
  const { age, gender, height, weight, approach, goalWeight, activityLevel } = req.body;
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const initialWeight = weight;
    const updateUserDetails = await User.findOneAndUpdate({ email: decodedToken.email }, { age, gender, height, initialWeight, weight, approach, goalWeight, activityLevel })


    res.json({ status: true })


  }
}


export async function getUserAssessment(req, res) {
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const data = await User.findOne({ email: decodedToken.email })
    if (data) {
      res.json({ age: data.age, initialWeight: data.initialWeight, weight: data.weight, height: data.height, gender: data.gender, goalWeight: data.goalWeight, activityLevel: data.activityLevel, approach: data.approach, calorieIntake: data.calorieIntake, proteinIntake: data.proteinIntake })
    }
  }
}

export async function calculateMacroIntake(req, res) {
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { weight, height, age, gender, activityLevel, approach } = await User.findOne({ email: decodedToken.email })
    const { dailyCalories, proteinIntake } = calculateIntake({ weight, height, age, gender, activityLevel, approach })


    await User.findOneAndUpdate({ email: decodedToken.email }, { calorieIntake: dailyCalories, proteinIntake: proteinIntake })
    res.json({ status: true });
  }
}

export async function addBodyWeight(req, res) {

  const date = new Date().toLocaleDateString();

  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const bodyWeightExists = await TrackWeight.findOne({ email: decodedToken.email, createdAt: date })
    if (bodyWeightExists) {
      res.json({ status: false, err: "you have already tracked your body weight today." })
    }
    else {

      const bodyWeightData = new TrackWeight({
        email: decodedToken.email,
        weight: req.body.weight
      })
      const saved = await bodyWeightData.save();
      if (saved) {
        //UPDATING the current Logged weight in the users database.
        await User.findOneAndUpdate({ email: decodedToken.email }, { weight: req.body.weight })
        //UPDATING the calorie and protein intake in the users database because weight is changed.
        const { weight, height, age, gender, activityLevel, approach } = await User.findOne({ email: decodedToken.email })
        const { dailyCalories, proteinIntake } = calculateIntake({ weight, height, age, gender, activityLevel, approach })
        await User.findOneAndUpdate({ email: decodedToken.email }, { calorieIntake: dailyCalories, proteinIntake: proteinIntake })
        res.json({ status: true })
      }
      else {
        res.json({ status: false })
      }
    }



  }
}
export async function updateBodyWeight(req, res) {

  const date = new Date().toLocaleDateString();

  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const data = await TrackWeight.findOneAndUpdate({ email: decodedToken.email, createdAt: date }, { weight: req.body.weight })

    if (data) {
      //UPDATING the current Logged weight in the users database.
      await User.findOneAndUpdate({ email: decodedToken.email }, { weight: req.body.weight })
      //UPDATING the calorie and protein intake in the users database because weight is changed.
      const { weight, height, age, gender, activityLevel, approach } = await User.findOne({ email: decodedToken.email })
      const { dailyCalories, proteinIntake } = calculateIntake({ weight, height, age, gender, activityLevel, approach })
      await User.findOneAndUpdate({ email: decodedToken.email }, { calorieIntake: dailyCalories, proteinIntake: proteinIntake })
      res.json({ status: true })
    }
    else {
      res.json({ status: false })
    }

  }
}
export async function getTodayBodyWeight(req, res) {
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken) {
      const date = new Date().toLocaleDateString();
      const data = await TrackWeight.findOne({ email: decodedToken.email, createdAt: date })
      if (data) {
        res.json({ status: true, data: data })
      }
      else {
        res.json({ status: false })
      }
    }
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
  try {
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const todayDate = new Date().toLocaleDateString();

      const mealsData = await TrackFood.find({ addedAt: todayDate, email: decodedToken.email });

      res.json({ data: mealsData })
    }
    else {
      res.redirect("/register")
    }
  }
  catch (err) {
    res.status(404).json({ message: err.message })

  }
}

export async function addBreakfast(req, res) {
  try {
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const todayDate = new Date().toLocaleDateString();
      const body = req.body;
      const result = await TrackFood.findOne({ addedAt: todayDate, email: decodedToken.email });
      if (result) {

        const prevBreakfastData = result.breakfast;
        const newBreakfastData = { ...prevBreakfastData, ...body }
        const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { breakfast: newBreakfastData })
      }
      else {
        let breakfast = new TrackFood({
          email: decodedToken.email,
          breakfast: body
        })

        breakfast.save();

      }
    }
    else {
      res.redirect("/register")
    }
  } catch (error) {
    console.log(error.message);
  }

}

//Morning Snacks
export async function addMorningSnacks(req, res) {
  try {
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const todayDate = new Date().toLocaleDateString();
      const body = req.body;
      const result = await TrackFood.findOne({ addedAt: todayDate, email: decodedToken.email });
      if (result) {
        const prevMorningSnacks = result.morningSnacks;
        const newMorningSnacks = { ...prevMorningSnacks, ...body }
        const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { morningSnacks: newMorningSnacks })
      }
      else {
        let morningSnacks = new TrackFood({
          email: decodedToken.email,
          morningSnacks: body
        })
        morningSnacks.save();
      }
    }
    else {
      res.redirect("/register")
    }
  } catch (error) {
    console.log(error.message);
  }

}


//Lunch
export async function addLunch(req, res) {
  try {
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const todayDate = new Date().toLocaleDateString();
      const body = req.body;
      const result = await TrackFood.findOne({ addedAt: todayDate, email: decodedToken.email });
      if (result) {
        const prevLunch = result.lunch;
        const newLunch = { ...prevLunch, ...body }
        const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { lunch: newLunch })
      }
      else {
        let lunch = new TrackFood({
          email: decodedToken.email,
          lunch: body
        })
        lunch.save();
      }
    }
    else {
      res.redirect("/register")
    }
  } catch (error) {
    console.log(error.message);
  }

}

//Evening Snacks
export async function addEveningSnacks(req, res) {
  try {
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const todayDate = new Date().toLocaleDateString();
      const body = req.body;
      const result = await TrackFood.findOne({ addedAt: todayDate, email: decodedToken.email });
      if (result) {
        const prevEveningSnacks = result.eveningSnacks;
        const newEveningSnacks = { ...prevEveningSnacks, ...body }
        const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { eveningSnacks: newEveningSnacks })
      }
      else {
        let eveningSnacks = new TrackFood({
          email: decodedToken.email,
          eveningSnacks: body
        })
        eveningSnacks.save();
      }
    }
    else {
      res.redirect("/register")
    }
  } catch (error) {
    console.log(error.message);
  }

}

//Dinner
export async function addDinner(req, res) {
  try {
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const todayDate = new Date().toLocaleDateString();
      const body = req.body;
      const result = await TrackFood.findOne({ addedAt: todayDate, email: decodedToken.email });
      if (result) {
        const prevDinner = result.dinner;
        const newDinner = { ...prevDinner, ...body }
        const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { dinner: newDinner })
      }
      else {
        let dinner = new TrackFood({
          email: decodedToken.email,
          dinner: body
        })
        dinner.save();
      }
    }
    else {
      res.redirect("/register")
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
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const response = await fetch(MY_URL, { headers: { 'X-Api-Key': process.env.API_NINJAS_API_KEY } })
      const result = await response.json();
      // return result;
      res.json({ data: result });
    }
    else {
      res.redirect("/register")
    }
  } catch (err) {
    console.log(err.message);
  }
}
export async function getExistingMealNutrients(req, res) {
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { foodName, mealType } = req.body;
    const todayDate = new Date().toLocaleDateString();


    const info = await TrackFood.findOne({ addedAt: todayDate, email: decodedToken.email })

    const meal = info[mealType];
    const obj = {
      [foodName]: {
        ...meal[foodName]
      }
    }

    res.json(obj);

  }
  else {
    res.redirect("/register")
  }

}
export async function getAllCustomMeals(req, res) {
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const result = await CustomMeal.find({ email: decodedToken.email });


    res.json({ data: result });
  }
  else {
    res.redirect("/register")
  }
}
export async function addCustomMeal(req, res) {
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, mealName, calories, protein, fats, fiber, carbs, sugar } = req.body;

    let newMeal = new CustomMeal({
      email, mealName, calories, protein, fats, fiber, carbs, sugar
    })
    newMeal.save();
  }
  else {
    res.redirect("/register")
  }
}
export async function removeMeal(req, res) {
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const todayDate = new Date().toLocaleDateString();
    const { foodItem, mealType } = req.body;

    let result = await TrackFood.findOne({ addedAt: todayDate, email: decodedToken.email })
    switch (mealType) {
      case "breakfast":
        const prevBreakfast = result.breakfast;
        delete prevBreakfast[foodItem];
        await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { breakfast: prevBreakfast })
        break;

      case "morningSnacks":
        const prevMorningSnacks = result.morningSnacks;
        delete prevMorningSnacks[foodItem];
        await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { morningSnacks: prevMorningSnacks })
        break;
      case "lunch":
        const prevLunch = result.lunch;
        delete prevLunch[foodItem];
        await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { lunch: prevLunch })
        break;
      case "eveningSnacks":
        const prevEveningSnacks = result.eveningSnacks;
        delete prevEveningSnacks[foodItem];
        await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { eveningSnacks: prevEveningSnacks })
        break;
      case "dinner":
        const prevDinner = result.dinner;
        delete prevDinner[foodItem];
        await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email }, { dinner: prevDinner })
        break;
    }
  }
  else {
    res.redirect("/register")
  }
  // let response = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: decodedToken.email })
}



//Workout routes
export async function getExercises(req, res) {

  const response = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${req.body.muscle}`, { headers: { 'X-Api-Key': process.env.API_NINJAS_API_KEY } })
  const x = await response.json()

  res.json({ status: true, result: x })
}

// Structure of workoutDetails
// const workoutDetails = {
//   chestPress: [{ weight: 10, reps: 12 }, { weight: 10, reps: 12 }, { weight: 10, reps: 12 }],

//   dumbbellPress: [{ weight: 10, reps: 12 }, { weight: 10, reps: 12 }, { weight: 10, reps: 12 }]
// }

export async function addWorkout(req, res) {
  try {


    const { workoutDay, exercise, weight, reps } = req.body;

    const date = new Date().toLocaleDateString();

    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const workoutInfo = await Workout.findOne({ email: decodedToken.email, createdAt: date })
      if (workoutInfo) {
        if (Object.keys(workoutInfo.workoutDetails).includes(exercise)) {
          const newWorkout = [...workoutInfo.workoutDetails[exercise], { weight, reps }]

          const newWorkoutInfo = { ...workoutInfo.workoutDetails, [exercise]: newWorkout }

          const addNewWorkout = await Workout.findOneAndUpdate({ email: decodedToken.email, createdAt: date }, { workoutDetails: newWorkoutInfo })
          res.json({ status: true, message: "Set added successfully" })
        }
        else {
          const createExercise = { ...workoutInfo.workoutDetails, [exercise]: [{ weight, reps }] }

          const addNewWorkout = await Workout.findOneAndUpdate({ email: decodedToken.email, createdAt: date }, { workoutDetails: createExercise })
          res.json({ status: true, message: "workout added successfully" })
        }
      }
      else {
        const createWorkout = new Workout({
          email: decodedToken.email,
          workoutDay,
          workoutDetails: { [exercise]: [{ weight, reps }] }
        })
        await createWorkout.save();
        res.json({ status: true, message: "Created Workout day successfully" })
      }
    }
  } catch (err) {
    res.json({ status: false, message: err.message })
  }
}


export async function getWorkoutDetails(req, res) {
  const date = new Date().toLocaleDateString();
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const workoutDetails = await Workout.findOne({ email: decodedToken.email, createdAt: date })

    res.json({ status: true, parsedRes: workoutDetails });
  }
}
export async function editWorkoutDay(req, res) {
  const date = new Date().toLocaleDateString();
  const { workoutDay } = req.body;
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const workoutDetails = await Workout.findOneAndUpdate({ email: decodedToken.email, createdAt: date }, { workoutDay: workoutDay })
    if (workoutDetails) {
      res.json({ status: true, message: "updated workout day" })
    }
  }
}
export async function editSet(req, res) {
  const { editExercise, editWeight, editReps, prevWeight, prevReps } = req.body;
  console.log("old reps and weight ", req.body)
  const date = new Date().toLocaleDateString();
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const workout = await Workout.findOne({ email: decodedToken.email, createdAt: date })
    console.log("wporkout set", workout.workoutDetails[editExercise]);
    const newWorkout = workout.workoutDetails[editExercise].map(eachSet => {
      console.log("each", eachSet);
      if (eachSet.weight === prevWeight && eachSet.reps === prevReps) {
        console.log("true")
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
    console.log("new details", newWorkoutDetails);
    const updateWorkout = await Workout.findOneAndUpdate({ email: decodedToken.email, createdAt: date }, { workoutDetails: newWorkoutDetails });
    if (updateWorkout) {
      res.json({ status: true, message: "Edited set successfully" })
    }
    else {
      res.json({ status: false, message: "Could not edit set" })
    }
  }
}
export async function deleteSet(req, res) {
  const { editExercise, prevWeight, prevReps } = req.body;
  const date = new Date().toLocaleDateString();
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const workout = await Workout.findOne({ email: decodedToken.email, createdAt: date })
    const newWorkout = workout.workoutDetails[editExercise].filter(eachSet =>
      !((eachSet.weight === prevWeight) && (eachSet.reps === prevReps))
    )

    const newWorkoutDetails = { ...workout.workoutDetails, [editExercise]: newWorkout }

    if (newWorkoutDetails[editExercise].length === 0) {
      delete newWorkoutDetails[editExercise];
    }
    const updateWorkout = await Workout.findOneAndUpdate({ email: decodedToken.email, createdAt: date }, { workoutDetails: newWorkoutDetails });
    if (updateWorkout) {
      res.json({ status: true, message: "Deleted set successfully" })
    }
    else {
      res.json({ status: false, message: "Could not delete set" })
    }
  }
}
export async function fetchWorkoutForADay(req, res) {

  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { selectedDate } = req.body;
    const workoutInfo = await Workout.findOne({ email: decodedToken.email, createdAt: selectedDate })
    if (workoutInfo) {
      res.json({ status: true, workoutDetails: workoutInfo.workoutDetails })
    }
    else {
      res.json({ status: false })
    }
  }
}