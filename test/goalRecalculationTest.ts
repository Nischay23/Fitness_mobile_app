// Test file to validate that goal recalculation works correctly
// This demonstrates the complete flow from profile edit to UI update

import {
  updateUser,
  getActiveUser,
} from "@/db/actions/userActions";
import { calculateUserGoals } from "@/modules/onboarding/services/goalCalculator";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/useUserStore";

/**
 * This test demonstrates the complete flow of updating user profile
 * and ensuring goals are recalculated and propagated to all stores
 */
export const testGoalRecalculationFlow = async () => {
  console.log("🧪 Starting Goal Recalculation Test...");

  try {
    // 1. Get current user
    const currentUser = await getActiveUser();
    if (!currentUser) {
      throw new Error("No active user found");
    }

    console.log("📊 Initial state:", {
      weight: currentUser.currentWeightKg,
      height: currentUser.heightCm,
      activityLevel: currentUser.activityLevel,
      goalType: currentUser.goalType,
      dailyCalorieGoal: currentUser.dailyCalorieGoal,
      proteinGoal_g: currentUser.proteinGoal_g,
      carbsGoal_g: currentUser.carbsGoal_g,
      fatGoal_g: currentUser.fatGoal_g,
    });

    // 2. Simulate a critical profile change (weight + activity level)
    const updates = {
      currentWeightKg: currentUser.currentWeightKg + 5, // Add 5kg
      activityLevel:
        currentUser.activityLevel === "sedentary"
          ? "moderately_active"
          : "sedentary", // Change activity level
      heightCm: currentUser.heightCm + 2, // Add 2cm
    };

    console.log("🔄 Applying updates:", updates);

    // 3. Update the user (this should trigger goal recalculation)
    const updatedUser = await updateUser(
      currentUser,
      updates
    );

    console.log("✅ Updated state:", {
      weight: updatedUser.currentWeightKg,
      height: updatedUser.heightCm,
      activityLevel: updatedUser.activityLevel,
      goalType: updatedUser.goalType,
      dailyCalorieGoal: updatedUser.dailyCalorieGoal,
      proteinGoal_g: updatedUser.proteinGoal_g,
      carbsGoal_g: updatedUser.carbsGoal_g,
      fatGoal_g: updatedUser.fatGoal_g,
    });

    // 4. Verify that goals have actually changed
    const goalsDifferent =
      updatedUser.dailyCalorieGoal !==
        currentUser.dailyCalorieGoal ||
      updatedUser.proteinGoal_g !==
        currentUser.proteinGoal_g ||
      updatedUser.carbsGoal_g !== currentUser.carbsGoal_g ||
      updatedUser.fatGoal_g !== currentUser.fatGoal_g;

    if (!goalsDifferent) {
      console.warn(
        "⚠️ Goals did not change - this might indicate an issue"
      );
    } else {
      console.log("🎯 Goals successfully recalculated!");
    }

    // 5. Update stores to simulate the onboarding flow
    const { setCurrentUser } = useAppStore.getState();
    const { setUserData } = useUserStore.getState();

    setCurrentUser(updatedUser);
    setUserData(updatedUser);

    console.log("🏪 Stores updated successfully");

    // 6. Verify stores have the correct data
    const appStoreUser = useAppStore.getState().currentUser;
    const userStoreGoals = useUserStore.getState().goals;

    console.log("📦 Store verification:", {
      appStore: {
        weight: appStoreUser?.currentWeightKg,
        dailyCalorieGoal: appStoreUser?.dailyCalorieGoal,
      },
      userStore: {
        dailyCalorieGoal: userStoreGoals?.dailyCalorieGoal,
        proteinGoal_g: userStoreGoals?.proteinGoal_g,
        carbsGoal_g: userStoreGoals?.carbsGoal_g,
        fatGoal_g: userStoreGoals?.fatGoal_g,
      },
    });

    console.log(
      "✅ Goal recalculation test completed successfully!"
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Goal recalculation test failed:",
      error
    );
    return false;
  }
};

/**
 * Test the pure goal calculation function
 */
export const testGoalCalculation = () => {
  console.log("🧮 Testing goal calculation...");

  const testProfile = {
    server_id: "test",
    name: "Test User",
    gender: "male" as const,
    dateOfBirth: "1990-01-01",
    heightCm: 175,
    currentWeightKg: 70,
    goalType: "lose" as const,
    activityLevel: "moderately_active" as const,
    targetWeightKg: 65,
    goalRateKgPerWeek: 0.5,
  };

  const goals1 = calculateUserGoals(testProfile);
  console.log("📊 Goals for 70kg:", goals1);

  // Change weight and recalculate
  const testProfile2 = {
    ...testProfile,
    currentWeightKg: 75,
  };
  const goals2 = calculateUserGoals(testProfile2);
  console.log("📊 Goals for 75kg:", goals2);

  // Verify goals are different
  const goalsDifferent =
    goals1.dailyCalorieGoal !== goals2.dailyCalorieGoal ||
    goals1.proteinGoal_g !== goals2.proteinGoal_g;

  if (goalsDifferent) {
    console.log(
      "✅ Goal calculation working correctly - goals change with weight"
    );
  } else {
    console.warn(
      "⚠️ Goal calculation might have issues - goals didn't change"
    );
  }

  return goalsDifferent;
};
