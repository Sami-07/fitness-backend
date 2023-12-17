const ACTIVITY_LEVEL_MULTIPLIERS = {
    "sedentary": 1.2,
    "lightly active": 1.375,
    "moderately active": 1.55,
    "very active": 1.725,
    "extremely active": 1.9,
};


const WEIGHT_CHANGE_ADJUSTMENTS = {
    "fast-loss": -800,
    "moderate-loss": -500,
    "slow-loss": -250,
    "maintain": 0,
    "moderate-gain": 250,
    "muscle-gain": 500,
};

const PROTEIN_PER_KG_BODYWEIGHT = {
    "sedentary": 0.8,
    "lightly active": 1.0,
    "moderately active": 1.2,
    "very active": 1.4,
    "extremely active": 1.6,
};
// Function to calculate BMR
function

    calculateBMR(weight, height, age, gender) {
    if (gender === "male") {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else

        if (gender === "female") {
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        } else {
            throw new Error("Invalid gender.");
        }
}

// Function to adjust BMR for activity level
function adjustBMRForActivity(bmr, activityLevel) {
    if (!ACTIVITY_LEVEL_MULTIPLIERS[activityLevel]) {
        throw new Error("Invalid activity level.");
    }
    return bmr * ACTIVITY_LEVEL_MULTIPLIERS[activityLevel];
}

// Function to adjust calorie intake based on weight goal and approach
function adjustCaloriesForGoal(adjustedBMR, approach) {
    if (!WEIGHT_CHANGE_ADJUSTMENTS[approach]) {
        throw new Error("Invalid approach.");
    }

    let adjustedIntake = adjustedBMR + WEIGHT_CHANGE_ADJUSTMENTS[approach];

    return Math.floor(adjustedIntake);
}

// Function to calculate protein intake
function calculateProteinIntake(weight, activityLevel) {
    if (!PROTEIN_PER_KG_BODYWEIGHT[activityLevel]) {
        throw new Error("Invalid activity level.");
    }
    return Math.floor(weight * PROTEIN_PER_KG_BODYWEIGHT[activityLevel]);
}

//Main function to be exported
export function calculateIntake({ weight, height, age, gender, activityLevel, approach }) {
    const bmr = calculateBMR(weight, height, age, gender);
    const adjustedBMR = adjustBMRForActivity(bmr, activityLevel);
    const dailyCalories = adjustCaloriesForGoal(adjustedBMR, approach);
    const proteinIntake = calculateProteinIntake(weight, activityLevel);
    return { dailyCalories, proteinIntake };
}
