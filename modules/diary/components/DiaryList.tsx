import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import withObservables from "@nozbe/with-observables";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db";
import { DiaryEntry } from "@/db/models/DiaryEntry";
import { Food } from "@/db/models/Food";
import { useAppStore } from "@/stores/appStore";
import { useTheme } from "@/modules/home/hooks/useTheme";
import MealSection, {
  DisplayFoodItem,
} from "./MealSection";
import { MealType } from "@/modules/nutrition/types";

// Define the props our component will receive from its parent
interface InputProps {
  dateString: string;
}

// Define the props that will be injected by withObservables
interface ObservableProps {
  entries: DiaryEntry[];
}

// The base UI component that receives the live data
const BaseDiaryList = ({
  entries,
  dateString,
}: InputProps & ObservableProps) => {
  const [foodsMap, setFoodsMap] = useState<
    Record<string, Food>
  >({});
  const { colors, isDark } = useTheme();
  const router = useRouter();

  // Load food data when entries change
  useEffect(() => {
    const loadFoods = async () => {
      if (entries.length === 0) return;

      const foodIds = [
        ...new Set(entries.map((e) => e.foodId)),
      ];
      console.log(`🔍 Loading foods for IDs:`, foodIds);

      try {
        const foods = await database.collections
          .get<Food>("foods")
          .query(Q.where("id", Q.oneOf(foodIds)))
          .fetch();

        const foodsById: Record<string, Food> = {};
        foods.forEach((food) => {
          foodsById[food.id] = food;
        });

        console.log(
          `✅ Loaded foods:`,
          foods.map((f) => ({ id: f.id, name: f.name }))
        );
        setFoodsMap(foodsById);
      } catch (error) {
        console.error(`❌ Error loading foods:`, error);
      }
    };

    loadFoods();
  }, [entries]);

  // Debug logging
  useEffect(() => {
    console.log(
      `📊 DiaryList received entries for ${dateString}:`,
      {
        count: entries.length,
        entries: entries.map((e) => ({
          id: e.id,
          mealType: e.mealType,
          calories: e.calories,
          foodId: e.foodId,
          foodName: foodsMap[e.foodId]?.name,
          servings: e.servings,
        })),
      }
    );
  }, [entries, dateString, foodsMap]);

  // Process the raw WDB models into simple data for the UI
  const mealsData: Record<MealType, DisplayFoodItem[]> = {
    breakfast: entries
      .filter((e) => e.mealType === "breakfast")
      .map((e) => ({
        id: e.id,
        name: foodsMap[e.foodId]?.name || "Loading...",
        calories: e.calories,
        servings: e.servings,
      })),
    lunch: entries
      .filter((e) => e.mealType === "lunch")
      .map((e) => ({
        id: e.id,
        name: foodsMap[e.foodId]?.name || "Loading...",
        calories: e.calories,
        servings: e.servings,
      })),
    dinner: entries
      .filter((e) => e.mealType === "dinner")
      .map((e) => ({
        id: e.id,
        name: foodsMap[e.foodId]?.name || "Loading...",
        calories: e.calories,
        servings: e.servings,
      })),
    snacks: entries
      .filter((e) => e.mealType === "snacks")
      .map((e) => ({
        id: e.id,
        name: foodsMap[e.foodId]?.name || "Loading...",
        calories: e.calories,
        servings: e.servings,
      })),
  };

  console.log(
    `🍽️ Processed meals data for ${dateString}:`,
    {
      breakfast: mealsData.breakfast.length,
      lunch: mealsData.lunch.length,
      dinner: mealsData.dinner.length,
      snacks: mealsData.snacks.length,
    }
  );

  // Placeholder functions for button actions
  const handleNutritionPress = () => {
    console.log("Nutrition button pressed");
    router.push("/nutrition" as any);
  };

  const handleNotesPress = () => {
    console.log("Notes button pressed");
    // TODO: Open notes drawer/modal
  };

  const handleCompleteDiaryPress = () => {
    console.log("Complete Diary button pressed");
    // TODO: Complete diary action
  };

  return (
    <View className="pt-2">
      {/* Compact Meal Sections */}
      <View className="gap-3">
        <MealSection
          mealName="breakfast"
          items={mealsData.breakfast}
          dateString={dateString}
        />
        <MealSection
          mealName="lunch"
          items={mealsData.lunch}
          dateString={dateString}
        />
        <MealSection
          mealName="dinner"
          items={mealsData.dinner}
          dateString={dateString}
        />
        <MealSection
          mealName="snacks"
          items={mealsData.snacks}
          dateString={dateString}
        />
      </View>

      {/* Compact Action Buttons Section */}
      <View className="px-0 pt-4 pb-3 gap-3">
        {/* Compact Quick Actions Grid */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleNutritionPress}
            className="flex-1 rounded-xl p-3 flex-row items-center justify-center gap-2"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border + "40",
            }}
          >
            <View
              className="w-6 h-6 rounded-full items-center justify-center"
              style={{
                backgroundColor: "#3B82F6" + "20",
              }}
            >
              <Ionicons
                name="pie-chart"
                size={14}
                color="#3B82F6"
              />
            </View>
            <Text
              className="text-sm font-semibold"
              style={{
                color: colors.text.primary,
              }}
            >
              Nutrition
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNotesPress}
            className="flex-1 rounded-xl p-3 flex-row items-center justify-center gap-2"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border + "40",
            }}
          >
            <View
              className="w-6 h-6 rounded-full items-center justify-center"
              style={{
                backgroundColor: "#F59E0B" + "20",
              }}
            >
              <Ionicons
                name="document-text"
                size={14}
                color="#F59E0B"
              />
            </View>
            <Text
              className="text-sm font-semibold"
              style={{
                color: colors.text.primary,
              }}
            >
              Notes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Compact Primary Action Button */}
        <TouchableOpacity
          onPress={handleCompleteDiaryPress}
          className="rounded-xl p-4 flex-row items-center justify-center gap-3"
          style={{
            backgroundColor: isDark ? "#00D4AA" : "#059669",
          }}
        >
          <View
            className="w-5 h-5 rounded-lg items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
            }}
          >
            <Ionicons
              name="checkmark"
              size={12}
              color="white"
            />
          </View>
          <Text
            className="text-base font-bold"
            style={{
              color: "white",
            }}
          >
            Complete Diary
          </Text>
        </TouchableOpacity>
      </View>

      {/* We can add the ExerciseSection here in the same way later */}
    </View>
  );
};

// Enhanced component with observables
export const DiaryList = withObservables(
  ["dateString"], // The component will re-observe if `dateString` changes
  (props: InputProps) => {
    const currentUser = useAppStore.getState().currentUser;

    console.log(
      `🔍 DiaryList withObservables called for ${props.dateString} with user:`,
      currentUser?.id
    );

    // Only query if we have a user
    if (!currentUser) {
      console.log(`❌ No current user found`);
      return { entries: [] };
    }

    console.log(
      `📝 Creating query for date: ${props.dateString}, user: ${currentUser.id}`
    );

    return {
      // Subscribe to diary entries for the current user and date
      entries: database.collections
        .get<DiaryEntry>("diary_entries")
        .query(
          Q.where("date", props.dateString),
          Q.where("user_id", currentUser.id)
        )
        .observe(),
    };
  }
)(BaseDiaryList);
