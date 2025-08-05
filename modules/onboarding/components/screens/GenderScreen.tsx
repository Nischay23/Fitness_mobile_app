import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useOnboardingStore } from "./../../store/index";
import { Gender, GenderCardProps } from "../../types";

// --- Reusable Child Component for the Gender Card ---
const GenderCard = React.memo(
  ({
    gender,
    label,
    imageSource,
    isSelected,
    onPress,
    animatedStyle,
  }: GenderCardProps) => {
    return (
      <Pressable onPress={onPress}>
        <Animated.View
          style={animatedStyle}
          className="items-center"
        >
          <View
            className={`w-32 h-32 rounded-full justify-center items-center border-4 ${isSelected ? "border-green-500" : "border-gray-200 dark:border-gray-700"}`}
          >
            <Image
              source={imageSource}
              className="w-[118px] h-[118px]"
            />
          </View>
          <Text
            className={`mt-4 text-lg font-semibold ${isSelected ? "text-green-500" : "text-gray-800 dark:text-gray-300"}`}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  }
);

// --- Main GenderScreen Component ---
export const GenderScreen = () => {
  // Get the current value and the update function from our Zustand store
  const { gender, setData } = useOnboardingStore();
  const maleScale = useSharedValue(1);
  const femaleScale = useSharedValue(1);

  // Animate the cards based on the value in the store
  useEffect(() => {
    maleScale.value = withSpring(
      gender === "male" ? 1.05 : 1
    );
    femaleScale.value = withSpring(
      gender === "female" ? 1.05 : 1
    );
  }, [gender]);

  const maleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: maleScale.value }],
  }));
  const femaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: femaleScale.value }],
  }));

  return (
    <View className="flex-1 justify-center">
      {/* Header */}
      <View className="items-center px-6 mb-12">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white text-center">
          Tell us about yourself
        </Text>
      </View>

      {/* Gender Selection */}
      <View className="flex-row justify-center items-center">
        <GenderCard
          gender="Male"
          label="Male"
          imageSource={require("@/assets/images/male.png")} // Make sure you have these images
          isSelected={gender === "male"}
          onPress={() => setData({ gender: "male" })}
          animatedStyle={maleAnimatedStyle}
        />
        <View className="w-8" />
        <GenderCard
          gender="Female"
          label="Female"
          imageSource={require("@/assets/images/female.png")}
          isSelected={gender === "female"}
          onPress={() => setData({ gender: "female" })}
          animatedStyle={femaleAnimatedStyle}
        />
      </View>
    </View>
  );
};
