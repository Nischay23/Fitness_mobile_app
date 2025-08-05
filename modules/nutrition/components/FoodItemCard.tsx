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
      style={{
        backgroundColor,
        borderColor,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 3,
        elevation: 2,
        transform: [{ scale: isLoading ? 0.98 : 1 }],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Food Icon */}
        <View
          style={{
            width: 48,
            height: 48,
            backgroundColor: iconBackgroundColor,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <Ionicons
            name="restaurant-outline"
            size={20}
            color={primaryColor}
          />
        </View>

        {/* Food Info */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: textColor,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {food.name}
            </Text>
            {food.isVerified && (
              <View
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: primaryColor,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
              >
                <Ionicons
                  name="checkmark"
                  size={10}
                  color="white"
                />
              </View>
            )}
          </View>

          {food.brand && (
            <Text
              style={{
                fontSize: 14,
                color: secondaryTextColor,
                marginBottom: 8,
              }}
              numberOfLines={1}
            >
              {food.brand}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: isDark
                  ? "#f59e0b20"
                  : "#fed7aa",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isDark ? "#f59e0b" : "#ea580c",
                }}
              >
                {food.calories} cal
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: secondaryTextColor,
                fontWeight: "500",
              }}
            >
              per {food.servingSize} {food.servingUnit}
            </Text>
          </View>

          {/* Macro Information */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#3b82f6",
                  borderRadius: 4,
                  marginRight: 4,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: secondaryTextColor,
                }}
              >
                P: {food.macros.protein}g
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#10b981",
                  borderRadius: 4,
                  marginRight: 4,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: secondaryTextColor,
                }}
              >
                C: {food.macros.carbs}g
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#f59e0b",
                  borderRadius: 4,
                  marginRight: 4,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: secondaryTextColor,
                }}
              >
                F: {food.macros.fat}g
              </Text>
            </View>
          </View>
        </View>

        {/* Add Button */}
        {showAddButton && (
          <TouchableOpacity
            onPress={onPress}
            disabled={isLoading}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: primaryColor,
              borderRadius: 12,
              shadowColor: primaryColor,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
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
                size={18}
                color="white"
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
