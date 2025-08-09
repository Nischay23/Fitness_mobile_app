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
    className={`p-6 rounded-2xl border-2 mb-6 flex-row items-center shadow-sm
      ${isSelected ? "bg-green-500/10 border-green-500" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"}`}
  >
    <View
      className={`w-16 h-16 rounded-2xl justify-center items-center mr-6 ${isSelected ? "bg-green-500" : "bg-gray-100 dark:bg-slate-700"}`}
    >
      <Feather
        name={icon}
        size={28}
        color={isSelected ? "white" : "#6B7280"}
      />
    </View>
    <Text
      className={`text-2xl font-bold flex-1 ${isSelected ? "text-gray-800 dark:text-white" : "text-gray-800 dark:text-white"}`}
    >
      {title}
    </Text>
  </Pressable>
);

// --- Main Screen Component ---
export const GoalScreen = () => {
  const { goalType, setData } = useOnboardingStore();

  return (
    <View className="flex-1 justify-center px-6">
      <View className="mb-16">
        <Text className="text-4xl font-bold text-gray-800 dark:text-white text-center mb-3">
          What is your primary goal?
        </Text>
        <Text className="text-lg text-gray-500 dark:text-gray-400 text-center">
          Choose the goal that matters most to you right now
        </Text>
      </View>

      <View>
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
    </View>
  );
};
