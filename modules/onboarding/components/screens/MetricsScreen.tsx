import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useOnboardingStore } from "../../store";
import { MetricInputProps } from "../../types";

// A reusable input field component for this screen
const MetricInput = ({
  label,
  value,
  onChangeText,
  unit,
  keyboardType = "numeric",
}: MetricInputProps) => (
  <View className="mb-6">
    <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
      {label}
    </Text>
    <View className="flex-row items-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
      <TextInput
        className="flex-1 text-3xl font-bold text-gray-800 dark:text-white p-6"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder="0"
        placeholderTextColor="#9CA3AF"
        returnKeyType="done"
      />
      <Text className="text-xl font-semibold text-gray-500 dark:text-gray-400 pr-6">
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
    <KeyboardAvoidingView 
      className="flex-1" 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6">
          <Text className="text-4xl font-bold text-gray-800 dark:text-white text-center mb-3">
            Your Basic Metrics
          </Text>
          <Text className="text-lg text-gray-500 dark:text-gray-400 text-center mb-12">
            Help us personalize your fitness journey
          </Text>

          <MetricInput
            label="Age"
            value={localAge}
            onChangeText={setLocalAge}
            unit="years"
            keyboardType="numeric"
          />
          <MetricInput
            label="Height"
            value={localHeight}
            onChangeText={setLocalHeight}
            unit="cm"
            keyboardType="numeric"
          />
          <MetricInput
            label="Current Weight"
            value={localWeight}
            onChangeText={setLocalWeight}
            unit="kg"
            keyboardType="decimal-pad"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
