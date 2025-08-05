// src/features/onboarding/screens/ActivityLevelScreen.tsx

import React from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useOnboardingStore } from "../../store";
import { ActivityLevel } from "../../types";
import { ActivityCardProps } from "./../../types/index";

// Define the options for the screen
const ACTIVITY_LEVELS = [
  {
    key: "sedentary" as ActivityLevel,
    title: "Sedentary",
    description: "Little to no exercise, desk job",
    icon: "moon" as keyof typeof Feather.glyphMap,
  },
  {
    key: "lightly_active" as ActivityLevel,
    title: "Lightly Active",
    description: "Light exercise or sports 1-3 days a week",
    icon: "wind" as keyof typeof Feather.glyphMap,
  },
  {
    key: "moderately_active" as ActivityLevel,
    title: "Moderately Active",
    description:
      "Moderate exercise or sports 3-5 days a week",
    icon: "activity" as keyof typeof Feather.glyphMap,
  },
  {
    key: "very_active" as ActivityLevel,
    title: "Very Active",
    description: "Hard exercise or sports 6-7 days a week",
    icon: "trending-up" as keyof typeof Feather.glyphMap,
  },
];

// --- Reusable Child Component: ActivityCard ---
const ActivityCard = ({
  title,
  description,
  icon,
  isSelected,
  onPress,
}: ActivityCardProps) => (
  <Pressable
    onPress={onPress}
    className={`p-5 rounded-2xl border-2 mb-4 flex-row items-center
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
    <View className="flex-1">
      <Text className="text-lg font-bold text-gray-800 dark:text-white">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {description}
      </Text>
    </View>
  </Pressable>
);

// --- Main Screen Component ---
export const ActivityLevelScreen = () => {
  const { activityLevel, setData } = useOnboardingStore();

  return (
    <View className="flex-1 justify-center">
      <Text className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-2">
        How active are you?
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-10">
        This helps us fine-tune your daily calorie goal. Be
        honest!
      </Text>

      {ACTIVITY_LEVELS.map((level) => (
        <ActivityCard
          key={level.key}
          title={level.title}
          description={level.description}
          icon={level.icon}
          isSelected={activityLevel === level.key}
          onPress={() =>
            setData({ activityLevel: level.key })
          }
        />
      ))}
    </View>
  );
};
