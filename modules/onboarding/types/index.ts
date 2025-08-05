import type { GestureResponderEvent } from "react-native";
import { Feather } from "@expo/vector-icons";

export type Gender = "male" | "female";
export interface GenderCardProps {
  gender: "Male" | "Female";
  label: string;
  imageSource: any;
  isSelected: boolean;
  onPress: () => void;
  animatedStyle: any;
}

export interface MetricInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit: string;
  keyboardType?: "numeric";
}

export type GoalType = "lose" | "maintain" | "gain";

export interface GoalCardProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  isSelected: boolean;
  onPress: (event: GestureResponderEvent) => void;
}

export interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>["name"]; // Valid Feather icon name
  isSelected: boolean;
  onPress: (event: GestureResponderEvent) => void;
}
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";

export interface OnboardingState {
  gender: Gender | null;
  age: number | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  activityLevel: ActivityLevel | null;
  goalType: GoalType | null;
}
