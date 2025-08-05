import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useColorScheme,
} from "react-native";
import { useOnboardingStore } from "../../store";
import { MetricInputProps } from "../../types";

// A reusable input field component for this screen
const MetricInput = ({
  label,
  value,
  onChangeText,
  unit,
  keyboardType,
}: MetricInputProps) => (
  <View className="mb-8">
    <Text className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-2">
      {label}
    </Text>
    <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <TextInput
        className="flex-1 text-2xl font-bold text-gray-800 dark:text-white p-4"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder="0"
        placeholderTextColor="#9CA3AF"
      />
      <Text className="text-lg font-semibold text-gray-400 dark:text-gray-500 pr-4">
        {unit}
      </Text>
    </View>
  </View>
);

export const MetricsScreen = () => {
  const isDark = useColorScheme() === "dark";
  // Get the update function and the current values from the store
  const { age, heightCm, currentWeightKg, setData } =
    useOnboardingStore();

  // Use local state for the text inputs. This is more performant than updating the global store on every keystroke.
  const [localAge, setLocalAge] = useState(
    age ? String(age) : ""
  );
  const [localHeight, setLocalHeight] = useState(
    heightCm ? String(heightCm) : ""
  );
  const [localWeight, setLocalWeight] = useState(
    currentWeightKg ? String(currentWeightKg) : ""
  );

  // This effect syncs the global store with the local state when the component is about to unmount (or when the user presses "Continue").
  // For simplicity, we'll do it on every change for now. A more advanced pattern uses a "Save" button.
  useEffect(() => {
    // Convert string inputs to numbers before saving to the global store
    setData({
      age: localAge ? parseInt(localAge, 10) : null,
      heightCm: localHeight
        ? parseInt(localHeight, 10)
        : null,
      currentWeightKg: localWeight
        ? parseFloat(localWeight)
        : null,
    });
  }, [localAge, localHeight, localWeight]);

  return (
    <View className="flex-1 justify-center">
      <View className="px-6">
        <Text className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-8">
          Your Basic Metrics
        </Text>

        <MetricInput
          label="Age"
          value={localAge}
          onChangeText={setLocalAge}
          unit="years"
        />
        <MetricInput
          label="Height"
          value={localHeight}
          onChangeText={setLocalHeight}
          unit="cm"
        />
        <MetricInput
          label="Current Weight"
          value={localWeight}
          onChangeText={setLocalWeight}
          unit="kg"
        />
      </View>
    </View>
  );
};
