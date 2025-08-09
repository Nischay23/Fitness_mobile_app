import { database } from "@/db";
import {
  User,
  UserProfileData,
  ActivityLevel,
  GoalType,
} from "@/db/models/User";
import { Q } from "@nozbe/watermelondb";
import { calculateUserGoals } from "@/modules/onboarding/services/goalCalculator";
// Get the users collection from the database
const users = database.collections.get<User>("users");
const usersCollection =
  database.collections.get<User>("users");

interface UserCreationData {
  server_id: string;
  email?: string;
  name: string;
  avatar_url?: string;
  gender: "male" | "female" | "other" | string;
  dateOfBirth: string;
  heightCm: number;
  currentWeightKg: number;
  goalType: string;
  activityLevel: string;
  targetWeightKg: number;
}

const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error(String(error));
      console.warn(
        `Attempt ${attempt} failed:`,
        lastError.message
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * attempt)
        );
      }
    }
  }

  throw lastError!;
};

// Get the active user (we'll only have one user for now)
export async function getActiveUser(): Promise<User | null> {
  try {
    console.log("🔍 Attempting to get active user...");

    const user = await retryOperation(async () => {
      // Get the first user in the database
      const usersList = await users.query().fetch();
      console.log(
        `📊 Found ${usersList.length} users in database`
      );
      return usersList[0] || null;
    });

    console.log(
      "✅ Successfully retrieved user:",
      user ? `ID: ${user.id}` : "No user found"
    );
    return user;
  } catch (error) {
    console.error("❌ Error getting active user:", error);
    return null;
  }
}

export const updateUserAndRecalculateGoals = async (
  userId: string,
  updates: Partial<UserProfileData>
): Promise<User> => {
  return await database.write(async () => {
    const userToUpdate = await usersCollection.find(userId);

    const currentProfile: UserProfileData = {
      server_id: userToUpdate.serverId,
      email: userToUpdate.email,
      name: userToUpdate.name,
      avatar_url: userToUpdate.avatarUrl,
      gender: userToUpdate.gender,
      dateOfBirth: userToUpdate.dateOfBirth,
      heightCm: userToUpdate.heightCm,
      currentWeightKg: userToUpdate.currentWeightKg,
      goalType: userToUpdate.goalType,
      activityLevel: userToUpdate.activityLevel,
      targetWeightKg: userToUpdate.goalWeightKg,
      goalRateKgPerWeek: userToUpdate.goalRateKgPerWeek,
    };

    const newProfileData = {
      ...currentProfile,
      ...updates,
    };
    const recalculatedGoals =
      calculateUserGoals(newProfileData);

    await userToUpdate.update((user) => {
      // Update the raw profile data
      if (updates.name !== undefined)
        user.name = updates.name;
      if (updates.email !== undefined)
        user.email = updates.email;
      if (updates.avatar_url !== undefined)
        user.avatarUrl = updates.avatar_url;
      if (updates.gender !== undefined)
        user.gender = updates.gender;
      if (updates.dateOfBirth !== undefined)
        user.dateOfBirth = updates.dateOfBirth;
      if (updates.heightCm !== undefined)
        user.heightCm = updates.heightCm;
      if (updates.currentWeightKg !== undefined)
        user.currentWeightKg = updates.currentWeightKg;
      if (updates.goalType !== undefined)
        user.goalType = updates.goalType;
      if (updates.activityLevel !== undefined)
        user.activityLevel = updates.activityLevel;
      if (updates.targetWeightKg !== undefined)
        user.goalWeightKg = updates.targetWeightKg;
      if (updates.goalRateKgPerWeek !== undefined)
        user.goalRateKgPerWeek = updates.goalRateKgPerWeek;

      // Update the calculated goals
      user.tdee = recalculatedGoals.tdee;
      user.dailyCalorieGoal =
        recalculatedGoals.dailyCalorieGoal;
      user.proteinGoal_g = recalculatedGoals.proteinGoal_g;
      user.carbsGoal_g = recalculatedGoals.carbsGoal_g;
      user.fatGoal_g = recalculatedGoals.fatGoal_g;
      user.fiberGoal_g = recalculatedGoals.fiberGoal_g;
    });

    return userToUpdate;
  });
};

// Create a new user
export const createUser = async (
  profile: UserProfileData
): Promise<User> => {
  return await database.write(async () => {
    // --- THIS IS THE NEW LOGIC ---
    // 1. First, call our pure calculation function with the profile data.
    const calculatedGoals = calculateUserGoals(profile);

    // 2. Now, create the user record, including both the raw data
    //    from the form AND the newly calculated goals.
    return await database.collections
      .get<User>("users")
      .create((user) => {
        // Raw data
        user.serverId = profile.server_id;
        user.email = profile.email || "";
        user.name = profile.name;
        user.avatarUrl = profile.avatar_url;
        user.gender = profile.gender;
        user.dateOfBirth = profile.dateOfBirth;
        user.heightCm = profile.heightCm;
        user.currentWeightKg = profile.currentWeightKg;
        user.goalType = profile.goalType;
        user.activityLevel = profile.activityLevel;
        user.goalWeightKg = profile.targetWeightKg;

        // Calculated data
        user.tdee = calculatedGoals.tdee;
        user.dailyCalorieGoal =
          calculatedGoals.dailyCalorieGoal;
        user.proteinGoal_g = calculatedGoals.proteinGoal_g;
        user.carbsGoal_g = calculatedGoals.carbsGoal_g;
        user.fatGoal_g = calculatedGoals.fatGoal_g;
      });
  });
};

// Update user data with goal recalculation
export async function updateUser(
  user: User,
  updates: Partial<{
    name: string;
    dateOfBirth: string;
    gender: string;
    heightCm: number;
    currentWeightKg: number;
    activityLevel: string;
    goalType: string;
    targetWeightKg: number;
    goalRateKgPerWeek: number;
  }>
): Promise<User> {
  try {
    // Check if any update affects goal calculations
    const criticalFields = [
      "heightCm",
      "currentWeightKg",
      "activityLevel",
      "goalType",
      "targetWeightKg",
      "goalRateKgPerWeek",
      "gender",
      "dateOfBirth",
    ];
    const needsGoalRecalculation = Object.keys(
      updates
    ).some((key) => criticalFields.includes(key));

    if (needsGoalRecalculation) {
      // Use the goal recalculation function for critical updates
      const userProfileUpdates: Partial<UserProfileData> =
        {};

      if (updates.name !== undefined)
        userProfileUpdates.name = updates.name;
      if (updates.gender !== undefined)
        userProfileUpdates.gender = updates.gender;
      if (updates.dateOfBirth !== undefined)
        userProfileUpdates.dateOfBirth =
          updates.dateOfBirth;
      if (updates.heightCm !== undefined)
        userProfileUpdates.heightCm = updates.heightCm;
      if (updates.currentWeightKg !== undefined)
        userProfileUpdates.currentWeightKg =
          updates.currentWeightKg;
      if (updates.activityLevel !== undefined)
        userProfileUpdates.activityLevel =
          updates.activityLevel as ActivityLevel;
      if (updates.goalType !== undefined)
        userProfileUpdates.goalType =
          updates.goalType as GoalType;
      if (updates.targetWeightKg !== undefined)
        userProfileUpdates.targetWeightKg =
          updates.targetWeightKg;
      if (updates.goalRateKgPerWeek !== undefined)
        userProfileUpdates.goalRateKgPerWeek =
          updates.goalRateKgPerWeek;

      return await updateUserAndRecalculateGoals(
        user.id,
        userProfileUpdates
      );
    } else {
      // For non-critical updates, use simple update
      await database.write(async () => {
        await user.update((user) => {
          Object.assign(user, updates);
        });
      });
      return user;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(
  user: User
): Promise<void> {
  try {
    await database.write(async () => {
      await user.destroyPermanently();
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

//Find user by supabaseId

export const findUserByServerId = async (
  serverId: string
): Promise<User | null> => {
  const usersCollection =
    database.collections.get<User>("users");
  const users = await usersCollection
    .query(Q.where("server_id", serverId))
    .fetch();
  return users.length > 0 ? users[0] : null;
};
