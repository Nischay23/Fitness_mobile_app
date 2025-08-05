// src/features/onboarding/screens/WelcomeScreen.tsx

import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInDown,
} from "react-native-reanimated";

export const WelcomeScreen = () => {
  const isDark = useColorScheme() === "dark";

  return (
    <View className="flex-1 justify-center items-center">
      <Animated.View
        entering={FadeInUp.duration(500).delay(200)}
      >
        <View className="w-24 h-24 bg-green-500/20 dark:bg-green-500/10 rounded-full justify-center items-center">
          <Feather name="zap" size={48} color="#10B981" />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(400)}
      >
        <Text className="text-3xl font-bold text-gray-800 dark:text-white mt-8 text-center">
          Welcome to FitNext!
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(500).delay(600)}
      >
        <Text className="text-lg text-gray-500 dark:text-gray-400 text-center mt-4">
          Let's create a personalized plan to help you reach
          your goals.
        </Text>
      </Animated.View>
    </View>
  );
};
