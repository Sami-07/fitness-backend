import TrackFood from "../models/trackFoodData.js";
import CustomMeal from "../models/CustomMeal.js";
import TrackWeight from "../models/TrackWeight.js";
import admin from "firebase-admin";
import serviceAccount from "../config/serviceAccount.json" assert {type: "json"}
import User from "../models/User.js";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
//TODO : check if decodedToken is valid instead of idToken AND only then proceed with the database changes.
export async function addAssessmentDetails(req, res) {
  const { age, gender, weight, goal, goalWeight } = req.body;
  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const updateUserDetails = await User.findOneAndUpdate({ email: decodedToken.email }, { age, weight, goal, gender, goalWeight })
    if (updateUserDetails) {
      res.json({ status: true })
    }
    else {
      res.json({ status: false })
    }
  }
}

export async function addBodyWeight(req, res) {
  const { weight } = req.body;
  const date = new Date().toLocaleDateString();
  console.log("weight in backend", weight);
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
        weight: weight
      })
      const saved = await bodyWeightData.save();
      if (saved) {
        res.json({ status: true })
      }
      else {
        res.json({ status: false })
      }
    }



  }
}
export async function updateBodyWeight(req, res) {
  const { weight } = req.body;
  const date = new Date().toLocaleDateString();

  const idToken = req.headers.authorization.split(' ')[1];
  if (idToken) {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const data = await TrackWeight.findOneAndUpdate({ email: decodedToken.email, createdAt: date }, { weight: weight })
    if (data) {
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
export async function getTodayMeals(req, res) {
  try {
    const idToken = req.headers.authorization.split(' ')[1];
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const todayDate = new Date().toLocaleDateString();
      console.log("user logged in email :", decodedToken);
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
      console.log("token", idToken);
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