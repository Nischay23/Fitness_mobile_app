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
  const { colors } = useTheme();

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
    <View style={{ marginHorizontal: 0 }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border + "30",
          overflow: "hidden",
          shadowColor: colors.text.primary,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Enhanced Header */}
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: items.length > 0 ? 1 : 0,
            borderBottomColor: colors.border + "20",
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: mealColor + "15",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={mealIcon}
                  size={20}
                  color={mealColor}
                />
              </View>
              <View>
                <Text
                  style={{ color: colors.text.primary }}
                  className="text-lg font-bold"
                >
                  {capitalizedMealName}
                </Text>
                <Text
                  style={{ color: colors.text.secondary }}
                  className="text-sm mt-1"
                >
                  {items.length}{" "}
                  {items.length === 1 ? "item" : "items"}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text
                style={{ color: colors.text.primary }}
                className="text-xl font-bold"
              >
                {Math.round(totalCalories)}
              </Text>
              <Text
                style={{ color: colors.text.secondary }}
                className="text-sm font-medium"
              >
                calories
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Food Items List */}
        {items.length > 0 && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 8,
            }}
          >
            {items.map((item, index) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth:
                    index < items.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border + "20",
                }}
              >
                <View className="flex-1">
                  <Text
                    style={{ color: colors.text.primary }}
                    className="text-base font-medium"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.servings !== 1 && (
                    <Text
                      style={{
                        color: colors.text.secondary,
                      }}
                      className="text-sm mt-1"
                    >
                      {item.servings}{" "}
                      {item.servings === 1
                        ? "serving"
                        : "servings"}
                    </Text>
                  )}
                </View>
                <View className="items-end ml-4">
                  <Text
                    style={{ color: colors.text.primary }}
                    className="text-base font-semibold"
                  >
                    {Math.round(item.calories)}
                  </Text>
                  <Text
                    style={{ color: colors.text.secondary }}
                    className="text-xs"
                  >
                    cal
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Enhanced Add Food Button */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
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
              style={{
                backgroundColor: "#059669" + "15",
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderWidth: 1.5,
                borderColor: "#059669" + "30",
                borderStyle: "dashed",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#059669" + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <Ionicons
                  name="add"
                  size={16}
                  color="#059669"
                />
              </View>
              <Text
                style={{ color: "#059669" }}
                className="text-base font-semibold"
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
