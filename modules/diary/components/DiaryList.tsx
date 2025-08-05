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
  const { colors } = useTheme();
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
    <View style={{ paddingTop: 12 }}>
      {/* Meal Sections with improved spacing */}
      <View style={{ gap: 16 }}>
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

      {/* Enhanced Action Buttons Section */}
      <View
        style={{
          paddingHorizontal: 0,
          paddingTop: 24,
          paddingBottom: 16,
          gap: 12,
        }}
      >
        {/* Quick Actions Grid */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={handleNutritionPress}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: colors.border + "40",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#3B82F6" + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="pie-chart"
                size={18}
                color="#3B82F6"
              />
            </View>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Nutrition
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNotesPress}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              borderWidth: 1,
              borderColor: colors.border + "40",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#F59E0B" + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="document-text"
                size={18}
                color="#F59E0B"
              />
            </View>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Notes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          onPress={handleCompleteDiaryPress}
          style={{
            backgroundColor: "#059669",
            borderRadius: 16,
            padding: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            shadowColor: "#059669",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.25)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color="white"
            />
          </View>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "700",
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
