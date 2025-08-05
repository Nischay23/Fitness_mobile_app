// Components
export { QuickLogModal } from "./components/QuickLogModal";
export { FoodItemCard } from "./components/FoodItemCard";
export { NutritionTabs } from "./components/NutritionTabs";
export { CaloriesTab } from "./components/CaloriesTab";
export { NutrientsTab } from "./components/NutrientsTab";
export { MacrosTab } from "./components/MacrosTab";

// Hooks
export { useNutrition } from "./hooks/useNutrition";

// Store
export { useNutritionStore } from "./store/nutritionStore";

// Types
export type {
  FoodItem,
  FoodLog,
  MealType,
  SearchTab,
  SearchFilters,
  NutritionState,
} from "./types";

// Services
export {
  searchFoods,
  getFoodById,
  getSuggestedFoods,
} from "./services/foodService";
