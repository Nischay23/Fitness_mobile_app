import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Food } from "@/db/models/Food";
import {
  searchFoods,
  logFoodToDiary,
} from "@/db/actions/diaryActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import {
  MealType,
  FoodItem,
  foodModelToItem,
} from "../types";
import { useAppStore } from "@/stores/appStore";

export const useNutrition = () => {
  const { currentUser } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Food[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<
    FoodItem[]
  >([]);
  const [defaultSuggestedFoods, setDefaultSuggestedFoods] =
    useState<FoodItem[]>([]);
  const [isAddingFood, setIsAddingFood] = useState<
    string | null
  >(null);

  // Initialize database and load suggested foods
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await seedFoodDatabase();

        // Load some default suggested foods from the database
        const allFoods = await searchFoods(""); // Get all foods
        const suggestedItems = allFoods
          .slice(0, 6) // Take first 6 foods
          .map(foodModelToItem);
        setDefaultSuggestedFoods(suggestedItems);

        setIsInitialized(true);
        console.log("✅ Database initialized successfully");
      } catch (error) {
        console.error(
          "❌ Failed to initialize database:",
          error
        );
      }
    };

    if (!isInitialized) {
      initializeDatabase();
    }
  }, [isInitialized]);

  // Search foods with debouncing
  const performSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchFoods(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  // Log food to diary
  const addFoodToDiary = useCallback(
    async (
      food: Food,
      mealType: MealType,
      date: string,
      servings: number = 1
    ) => {
      if (!currentUser) {
        throw new Error("No user found");
      }

      setIsAddingFood(food.id);
      try {
        await logFoodToDiary({
          userId: currentUser.id,
          food,
          date,
          mealType,
          servings,
        });

        // Add to search history (convert to FoodItem format)
        const foodItem = foodModelToItem(food);
        setSearchHistory((prev) => {
          const filtered = prev.filter(
            (item) => item.id !== foodItem.id
          );
          return [foodItem, ...filtered].slice(0, 10); // Keep only 10 recent items
        });

        console.log(
          `✅ Successfully logged ${food.name} to ${mealType}`
        );
      } catch (error) {
        console.error("Error logging food:", error);
        throw error;
      } finally {
        setIsAddingFood(null);
      }
    },
    [currentUser]
  );

  // Get suggested foods (recent searches + default suggestions)
  const suggestedFoods = useMemo(() => {
    if (searchHistory.length > 0) {
      return searchHistory.slice(0, 6);
    }
    return defaultSuggestedFoods;
  }, [searchHistory, defaultSuggestedFoods]);

  const searchResultsUI = useMemo(() => {
    return searchResults.map(foodModelToItem);
  }, [searchResults]); // This value is only re-calculated when searchResults changes.

  return {
    isInitialized,
    // Return both raw models and converted items
    searchResultsRaw: searchResults,
    searchResults: searchResultsUI,
    isSearching,
    searchHistory,
    isAddingFood,
    setIsAddingFood,
    suggestedFoods,
    performSearch,
    addFoodToDiary,
  };
};
