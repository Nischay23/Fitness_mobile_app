// src/modules/diary/components/MealSection.tsx

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/modules/home/hooks/useTheme";
import { MealType } from "@/modules/nutrition/types";

// Interface for displaying food items in meals
export interface DisplayFoodItem {
  id: string;
  name: string;
  calories: number;
  servings: number;
}

interface MealSectionProps {
  mealName: MealType;
  items: DisplayFoodItem[];
  dateString: string;
}

const MealSection = ({
  mealName,
  items,
  dateString,
}: MealSectionProps) => {
  const { colors, isDark } = useTheme();

  const totalCalories = items.reduce(
    (sum, item) => sum + item.calories,
    0
  );

  // Meal icon mapping
  const getMealIcon = (
    name: MealType
  ): keyof typeof Ionicons.glyphMap => {
    switch (name) {
      case "breakfast":
        return "sunny-outline";
      case "lunch":
        return "partly-sunny-outline";
      case "dinner":
        return "moon-outline";
      case "snacks":
        return "nutrition-outline";
      default:
        return "restaurant-outline";
    }
  };

  // Meal color mapping
  const getMealColor = (name: MealType): string => {
    switch (name) {
      case "breakfast":
        return "#FF9500"; // Orange
      case "lunch":
        return "#007AFF"; // Blue
      case "dinner":
        return "#5856D6"; // Purple
      case "snacks":
        return "#34C759"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  const mealIcon = getMealIcon(mealName);
  const mealColor = getMealColor(mealName);
  const capitalizedMealName =
    mealName.charAt(0).toUpperCase() + mealName.slice(1);

  return (
    <View className="mx-0">
      <View
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border + "30",
        }}
      >
        {/* Compact Header */}
        <View
          className="px-4 py-3 flex-row items-center justify-between"
          style={{
            backgroundColor: colors.surface,
            borderBottomWidth: items.length > 0 ? 1 : 0,
            borderBottomColor: colors.border + "20",
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center mr-3"
              style={{
                backgroundColor: mealColor + "15",
              }}
            >
              <Ionicons
                name={mealIcon}
                size={16}
                color={mealColor}
              />
            </View>
            <View>
              <Text
                className="text-base font-bold"
                style={{ color: colors.text.primary }}
              >
                {capitalizedMealName}
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                {items.length}{" "}
                {items.length === 1 ? "item" : "items"}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text
              className="text-lg font-bold"
              style={{ color: colors.text.primary }}
            >
              {Math.round(totalCalories)}
            </Text>
            <Text
              className="text-xs font-medium"
              style={{ color: colors.text.secondary }}
            >
              calories
            </Text>
          </View>
        </View>

        {/* Compact Food Items List */}
        {items.length > 0 && (
          <View className="px-4 py-1">
            {items.map((item, index) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center py-2"
                style={{
                  borderBottomWidth:
                    index < items.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border + "15",
                }}
              >
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.text.primary }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.servings !== 1 && (
                    <Text
                      className="text-xs"
                      style={{
                        color: colors.text.secondary,
                      }}
                    >
                      {item.servings}{" "}
                      {item.servings === 1
                        ? "serving"
                        : "servings"}
                    </Text>
                  )}
                </View>
                <View className="items-end ml-3">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {Math.round(item.calories)}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.text.secondary }}
                  >
                    cal
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Compact Add Food Button */}
        <View className="px-4 py-3">
          <Link
            href={{
              pathname: "/nutrition/search",
              params: {
                mealType: mealName,
                date: dateString,
              },
            }}
            asChild
          >
            <Pressable
              className="rounded-xl py-3 px-4 flex-row items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "#00D4AA" + "20"
                  : "#059669" + "15",
                borderWidth: 1,
                borderColor: isDark
                  ? "#00D4AA" + "40"
                  : "#059669" + "30",
                borderStyle: "dashed",
              }}
            >
              <View
                className="w-5 h-5 rounded-lg items-center justify-center mr-2"
                style={{
                  backgroundColor: isDark
                    ? "#00D4AA" + "30"
                    : "#059669" + "20",
                }}
              >
                <Ionicons
                  name="add"
                  size={14}
                  color={isDark ? "#00D4AA" : "#059669"}
                />
              </View>
              <Text
                className="text-sm font-semibold"
                style={{
                  color: isDark ? "#00D4AA" : "#059669",
                }}
              >
                Add Food
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
};

export default MealSection;
