import TrackFood from "../models/trackFoodData.js";
import CustomMeal from "../models/CustomMeal.js"
export async function getTodayMeals(req, res) {
  try {

    const todayDate = new Date().toLocaleDateString();
    //TODO : use dynamic email when auth is implemented
    const mealsData = await TrackFood.find({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" });
    // console.log("server data", mealsData);
    res.json({ data: mealsData })
  }
  catch (err) {
    res.status(404).json({ message: err.message })

  }
}
export function addMealData() {

}
export async function getBreakfastInfo(req, res) {
  const date = new Date();

}

export async function addBreakfast(req, res) {
  try {
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" });
    if (result) {

      const prevBreakfastData = result.breakfast;
      const newBreakfastData = { ...prevBreakfastData, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { breakfast: newBreakfastData })
    }
    else {
      let breakfast = new TrackFood({
        email: "s.a.sami359359@gmail.com",
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
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" });
    if (result) {
      const prevMorningSnacks = result.morningSnacks;
      const newMorningSnacks = { ...prevMorningSnacks, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { morningSnacks: newMorningSnacks })
    }
    else {
      let morningSnacks = new TrackFood({
        email: "s.a.sami359359@gmail.com",
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
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" });
    if (result) {
      const prevLunch = result.lunch;
      const newLunch = { ...prevLunch, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { lunch: newLunch })
    }
    else {
      let lunch = new TrackFood({
        email: "s.a.sami359359@gmail.com",
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
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" });
    if (result) {
      const prevEveningSnacks = result.eveningSnacks;
      const newEveningSnacks = { ...prevEveningSnacks, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { eveningSnacks: newEveningSnacks })
    }
    else {
      let eveningSnacks = new TrackFood({
        email: "s.a.sami359359@gmail.com",
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
    const todayDate = new Date().toLocaleDateString();
    const body = req.body;
    const result = await TrackFood.findOne({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" });
    if (result) {
      const prevDinner = result.dinner;
      const newDinner = { ...prevDinner, ...body }
      const x = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { dinner: newDinner })
    }
    else {
      let dinner = new TrackFood({
        email: "s.a.sami359359@gmail.com",
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
  const MY_API_KEY = ;
  try {
    const response = await fetch(MY_URL, { headers: { 'X-Api-Key':process.env.API_NINJAS_API_KEY } })
    const result = await response.json();
    // return result;
    res.json({ data: result });
  } catch (err) {
    console.log(err.message);
  }
}
export async function getExistingMealNutrients(req, res) {
  const { foodName, mealType } = req.body;
  const todayDate = new Date().toLocaleDateString();


  const info = await TrackFood.findOne({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" })

  const meal = info[mealType];
  const obj = {
    [foodName]: {
      ...meal[foodName]
    }
  }
 
  res.json(obj);


}
export async function getAllCustomMeals(req, res) {
  console.log("hello")
  const result = await CustomMeal.find({ email: "s.a.sami359359@gmail.com" });
  // console.log("server data", result);

  res.json({ data: result });
}
export async function addCustomMeal(req, res) {
  const { email, mealName, calories, protein, fats, fiber, carbs, sugar } = req.body;
  console.log("check")
  let newMeal = new CustomMeal({
    email, mealName, calories, protein, fats, fiber, carbs, sugar
  })
  newMeal.save();
}
export async function removeMeal(req, res) {
  const todayDate = new Date().toLocaleDateString();
  const { foodItem, mealType } = req.body;
  console.log("type", mealType)
  let result = await TrackFood.findOne({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" })
  switch (mealType) {
    case "breakfast":
      const prevBreakfast = result.breakfast;
      delete prevBreakfast[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { breakfast: prevBreakfast })
      break;

    case "morningSnacks":
      const prevMorningSnacks = result.morningSnacks;
      delete prevMorningSnacks[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { morningSnacks: prevMorningSnacks })
      break;
    case "lunch":
      const prevLunch = result.lunch;
      delete prevLunch[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { lunch: prevLunch })
      break;
    case "eveningSnacks":
      const prevEveningSnacks = result.eveningSnacks;
      delete prevEveningSnacks[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { eveningSnacks: prevEveningSnacks })
      break;
    case "dinner":
      const prevDinner = result.dinner;
      delete prevDinner[foodItem];
      await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" }, { dinner: prevDinner })
      break;
  }
  // let response = await TrackFood.findOneAndUpdate({ addedAt: todayDate, email: "s.a.sami359359@gmail.com" })
}