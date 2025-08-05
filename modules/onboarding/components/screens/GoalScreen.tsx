import React from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useOnboardingStore } from "../../store";
import { GoalType } from "../../types";
import { GoalCardProps } from "../../types";

// Define the options for the screen
const GOAL_OPTIONS = [
  {
    key: "lose" as GoalType,
    title: "Lose Weight",
    icon: "trending-down" as keyof typeof Feather.glyphMap,
  },
  {
    key: "maintain" as GoalType,
    title: "Maintain Weight",
    icon: "anchor" as keyof typeof Feather.glyphMap,
  },
  {
    key: "gain" as GoalType,
    title: "Gain Weight",
    icon: "trending-up" as keyof typeof Feather.glyphMap,
  },
];

// --- Reusable Child Component: GoalCard ---
const GoalCard = ({
  title,
  icon,
  isSelected,
  onPress,
}: GoalCardProps) => (
  <Pressable
    onPress={onPress}
    className={`p-6 rounded-2xl border-2 mb-4 flex-row items-center
      ${isSelected ? "bg-green-500/10 border-green-500" : "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-gray-700"}`}
  >
    <View
      className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${isSelected ? "bg-green-500" : "bg-gray-200 dark:bg-slate-700"}`}
    >
      <Feather
        name={icon}
        size={24}
        color={isSelected ? "white" : "#6B7280"}
      />
    </View>
    <Text
      className={`text-xl font-bold ${isSelected ? "text-gray-800 dark:text-white" : "text-gray-800 dark:text-white"}`}
    >
      {title}
    </Text>
  </Pressable>
);

// --- Main Screen Component ---
export const GoalScreen = () => {
  const { goalType, setData } = useOnboardingStore();

  return (
    <View className="flex-1 justify-center">
      <Text className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-10">
        What is your primary goal?
      </Text>

      {GOAL_OPTIONS.map((goal) => (
        <GoalCard
          key={goal.key}
          title={goal.title}
          icon={goal.icon}
          isSelected={goalType === goal.key}
          onPress={() => setData({ goalType: goal.key })}
        />
      ))}
    </View>
  );
};
