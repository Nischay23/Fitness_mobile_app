import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FoodItem } from "../types";

interface FoodItemCardProps {
  food: FoodItem;
  onPress: () => void;
  isLoading?: boolean;
  showAddButton?: boolean;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  food,
  onPress,
  isLoading = false,
  showAddButton = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Define theme colors
  const backgroundColor = isDark ? "#1f2937" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";
  const iconBackgroundColor = isDark
    ? "#374151"
    : "#f3f4f6";
  const primaryColor = isDark ? "#10b981" : "#059669";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      className="bg-white border border-gray-200 rounded-xl p-3 mb-2"
      style={{
        backgroundColor,
        borderColor,
        transform: [{ scale: isLoading ? 0.98 : 1 }],
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: isDark ? 0.2 : 0.04,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center">
        {/* Compact Food Icon */}
        <View
          className="w-10 h-10 rounded-lg items-center justify-center mr-3"
          style={{
            backgroundColor: iconBackgroundColor,
          }}
        >
          <Ionicons
            name="restaurant-outline"
            size={16}
            color={primaryColor}
          />
        </View>

        {/* Food Info */}
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <Text
              className="text-sm font-semibold flex-1"
              style={{ color: textColor }}
              numberOfLines={1}
            >
              {food.name}
            </Text>
            {food.isVerified && (
              <View
                className="w-4 h-4 rounded-full items-center justify-center ml-2"
                style={{ backgroundColor: primaryColor }}
              >
                <Ionicons
                  name="checkmark"
                  size={8}
                  color="white"
                />
              </View>
            )}
          </View>

          {food.brand && (
            <Text
              className="text-xs mb-2"
              style={{ color: secondaryTextColor }}
              numberOfLines={1}
            >
              {food.brand}
            </Text>
          )}

          <View className="flex-row items-center">
            <View
              className="px-2 py-1 rounded-md mr-2"
              style={{
                backgroundColor: isDark
                  ? "#f59e0b20"
                  : "#fed7aa",
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color: isDark ? "#f59e0b" : "#ea580c",
                }}
              >
                {food.calories} cal
              </Text>
            </View>
            <Text
              className="text-xs font-medium"
              style={{ color: secondaryTextColor }}
            >
              per {food.servingSize} {food.servingUnit}
            </Text>
          </View>

          {/* Compact Macro Information */}
          <View className="flex-row items-center mt-2 gap-3">
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <Text
                className="text-xs"
                style={{ color: secondaryTextColor }}
              >
                P: {food.macros.protein}g
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: "#10b981" }}
              />
              <Text
                className="text-xs"
                style={{ color: secondaryTextColor }}
              >
                C: {food.macros.carbs}g
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <Text
                className="text-xs"
                style={{ color: secondaryTextColor }}
              >
                F: {food.macros.fat}g
              </Text>
            </View>
          </View>
        </View>

        {/* Compact Add Button */}
        {showAddButton && (
          <TouchableOpacity
            onPress={onPress}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg items-center justify-center"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Ionicons
                name="add"
                size={14}
                color="white"
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
