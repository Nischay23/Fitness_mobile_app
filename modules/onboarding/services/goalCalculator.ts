import { UserProfileData } from "@/db/models/User";

// Define the shape of the output data
interface CalculatedGoals {
  tdee: number;
  dailyCalorieGoal: number;
  proteinGoal_g: number;
  carbsGoal_g: number;
  fatGoal_g: number;
  fiberGoal_g: number;
}

// This is a PURE function. It has no dependencies on WatermelonDB or `this`.
export const calculateUserGoals = (
  profile: UserProfileData
): CalculatedGoals => {
  console.log(
    "🚀 Calculating goals with pure function using data:",
    profile
  );

  // Helper to calculate age from dateOfBirth string
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(profile.dateOfBirth);

  // 1. Calculate BMR
  const bmrBase =
    10 * profile.currentWeightKg +
    6.25 * profile.heightCm -
    5 * age;
  const bmr =
    profile.gender === "male" ? bmrBase + 5 : bmrBase - 161;

  // 2. Calculate TDEE
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  const tdee =
    bmr * (multipliers[profile.activityLevel] || 1.2);

  // 3. Calculate Calorie Goal
  const dailyAdjustment =
    ((profile.goalRateKgPerWeek || 0.5) * 7700) / 7;
  let dailyCalorieGoal = tdee;
  if (profile.goalType === "lose") {
    dailyCalorieGoal = tdee - dailyAdjustment;
  } else if (profile.goalType === "gain") {
    dailyCalorieGoal = tdee + dailyAdjustment;
  }

  // 4. Calculate Macro Goals
  const proteinGoal_g = Math.round(
    (dailyCalorieGoal * 0.3) / 4
  );
  const carbsGoal_g = Math.round(
    (dailyCalorieGoal * 0.4) / 4
  );
  const fatGoal_g = Math.round(
    (dailyCalorieGoal * 0.3) / 9
  );
  const fiberGoal_g = profile.gender === "male" ? 38 : 25;

  const result = {
    tdee: Math.round(tdee),
    dailyCalorieGoal: Math.round(dailyCalorieGoal),
    proteinGoal_g,
    carbsGoal_g,
    fatGoal_g,
    fiberGoal_g,
  };

  console.log("✅ Goals calculated:", result);
  return result;
};
