// db/actions/progressActions.ts

import { Q } from "@nozbe/watermelondb";
import { database } from "../index";
import { WeightEntry } from "../models/WeightEntry";
import { User } from "../models/User";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/useUserStore";
import { updateUserAndRecalculateGoals } from "./userActions";

const weightEntriesCollection =
  database.collections.get<WeightEntry>("weight_entries");

/**
 * Logs or updates a weight entry for a specific user and date.
 * If an entry for that date already exists, it updates it. Otherwise, it creates a new one.
 * Also updates the user's current weight.
 *
 * @param {string} userId - The ID of the current user.
 * @param {number} weightKg - The weight in kilograms.
 * @param {string} date - The date in 'YYYY-MM-DD' format.
 */
export const logOrUpdateWeight = async (
  userId: string,
  weightKg: number,
  date: string
) => {
  console.log(
    `🎯 Starting to log weight: ${weightKg}kg for ${date} (user: ${userId})`
  );

  await database.write(async (writer) => {
    const usersCollection =
      database.collections.get<User>("users");

    // Find if an entry for this date already exists
    const existingEntry = await weightEntriesCollection
      .query(
        Q.where("date", date),
        Q.where("user_id", userId)
      )
      .fetch();

    if (existingEntry.length > 0) {
      // If it exists, update it
      await existingEntry[0].update((entry) => {
        entry.weightKg = weightKg;
      });
      console.log(
        `✅ Weight entry for ${date} updated to ${weightKg}kg.`
      );
    } else {
      // If not, create a new one
      await weightEntriesCollection.create((entry) => {
        entry.userId = userId;
        entry.weightKg = weightKg;
        entry.date = date;
      });
      console.log(
        `✅ New weight entry for ${date} created with ${weightKg}kg.`
      );
    }

    // Also, update the main user model's currentWeightKg if this is the latest entry
    // (For simplicity, we'll just update it every time for now)
    const user = await usersCollection.find(userId);
    const previousWeight = user.currentWeightKg;

    // Update the user's current weight and recalculate goals if there's a significant change
    const weightDifference = Math.abs(
      weightKg - previousWeight
    );

    if (weightDifference >= 0.5) {
      // Significant weight change - recalculate goals
      console.log(
        `🔄 Significant weight change detected (${weightDifference}kg), recalculating goals...`
      );
      await updateUserAndRecalculateGoals(userId, {
        currentWeightKg: weightKg,
      });
    } else {
      // Minor weight change - just update the weight
      await user.update((u) => {
        u.currentWeightKg = weightKg;
      });
    }

    console.log(
      `🔄 Database write transaction completed for ${weightKg}kg`
    );
  });

  // Force a small delay to ensure database transaction is committed
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Also update the app store with the new weight to ensure immediate UI updates
  const { currentUser, setCurrentUser } =
    useAppStore.getState();
  const { setUserData } = useUserStore.getState();

  if (currentUser && currentUser.id === userId) {
    // Just fetch the updated user from database and set it in both stores
    const usersCollection =
      database.collections.get<User>("users");
    const updatedUser = await usersCollection.find(userId);
    setCurrentUser(updatedUser);
    setUserData(updatedUser);
    console.log(
      `🔄 Both stores updated with new weight: ${weightKg}kg`
    );
  }

  console.log(
    `✨ Weight logging finished - database should trigger observables now`
  );
};

/**
 * Creates a reactive query that observes all weight entries for a user, sorted by date.
 * The UI will automatically update when this data changes.
 *
 * @param {string} userId - The ID of the current user.
 * @returns An observable that emits an array of WeightEntry models.
 */
export const observeWeightHistory = (userId: string) => {
  return weightEntriesCollection
    .query(
      Q.where("user_id", userId),
      Q.sortBy("date", Q.desc)
    ) // Sort descending, newest first
    .observe();
};

/**
 * Creates sample weight data for testing purposes.
 * Only call this during development/testing.
 *
 * @param {string} userId - The ID of the current user.
 */
export const createSampleWeightData = async (
  userId: string
) => {
  const today = new Date();
  const sampleDates = [];

  // Create 7 days of sample data
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    sampleDates.push({
      date: date.toISOString().split("T")[0], // YYYY-MM-DD format
      weight: 70 + (Math.random() * 4 - 2), // Random weight between 68-72 kg
    });
  }

  // Add the sample data
  for (const entry of sampleDates) {
    await logOrUpdateWeight(
      userId,
      entry.weight,
      entry.date
    );
  }

  console.log(
    "✅ Sample weight data created successfully!"
  );
};
