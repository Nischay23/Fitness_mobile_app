// db/actions/diaryActions.ts
import { Q } from "@nozbe/watermelondb";
import { database } from "../index";
import { Food } from "../models/Food";
import { User } from "../models/User";
import { DiaryEntry } from "../models/DiaryEntry";

const foodsCollection =
  database.collections.get<Food>("foods");
const diaryEntriesCollection =
  database.collections.get<DiaryEntry>("diary_entries");

/**
 * Searches the local food database for items matching the query.
 * @param query The search string from the user.
 * @returns A promise that resolves to an array of Food models.
 */
export const searchFoods = async (
  query: string
): Promise<Food[]> => {
  if (!query) return [];

  const searchWords = query
    .toLowerCase()
    .split(" ")
    .filter((w) => w);

  // This creates a query that looks for foods where the name contains EACH search word.
  const foodResults = await foodsCollection
    .query(
      Q.and(
        ...searchWords.map((word) =>
          Q.where("name", Q.like(`%${word}%`))
        )
      )
    )
    .fetch();

  return foodResults;
};

/**
 * Logs a specific food item to the user's diary for a given date and meal.
 */
export const logFoodToDiary = async (options: {
  userId: string; // User ID
  food: Food; // The full Food model object
  date: string; // 'YYYY-MM-DD'
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  servings: number;
}) => {
  const { userId, food, date, mealType, servings } =
    options;

  await database.write(async () => {
    await diaryEntriesCollection.create((entry) => {
      entry.userId = userId; // Set the user ID for this entry
      entry.foodId = food.id; // Link to the food item
      entry.date = date;
      entry.mealType = mealType;
      entry.servings = servings;

      // Denormalize the nutritional data for performance
      entry.calories = food.calories * servings;
      entry.protein_g = food.protein_g * servings;
      entry.carbs_g = food.carbs_g * servings;
      entry.fat_g = food.fat_g * servings;
    });
  });
  console.log(`✅ Logged ${food.name} to ${mealType}`);
};

/**
 * Creates an "observable" query that watches for all diary entries on a specific date.
 * This is REACTIVE. The UI will update automatically when entries are added/removed.
 * @param date The date string 'YYYY-MM-DD'.
 * @returns An observable that emits an array of DiaryEntry models.
 */
export const observeDiaryEntriesForDate = (
  date: string
) => {
  return diaryEntriesCollection
    .query(Q.where("date", date))
    .observe();
};
