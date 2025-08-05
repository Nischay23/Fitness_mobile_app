import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHomeStore } from "../store/homeStore";
import { ProgressRing } from "./ProgressRing";
import { useTheme } from "../hooks/useTheme";

type MacroCircleProps = {
  label: string;
  goal: number;
  short: string;
  color: string;
  current: number;
  isDark: boolean;
};

const MacroCircle: React.FC<MacroCircleProps> = ({
  label,
  short,
  current,
  goal,
  color,
  isDark,
}) => {
  // Conditional text colors
  const labelColor = isDark
    ? "text-slate-200"
    : "text-slate-700";
  const valueColor = isDark
    ? "text-slate-400"
    : "text-slate-500";

  return (
    <View className="items-center flex-1">
      {/* Progress Ring */}
      <View className="relative w-12 h-12 justify-center items-center mb-2">
        <ProgressRing
          progress={goal > 0 ? current / goal : 0}
          size={44}
          strokeWidth={4}
          backgroundColor={isDark ? "#1E293B" : "#F1F5F9"}
          progressColor={color}
          isDark={isDark}
        />
        <Text
          className="absolute font-bold text-xs"
          style={{ color }}
        >
          {short}
        </Text>
      </View>

      {/* Labels */}
      <Text
        className={`font-medium text-xs mb-1 ${labelColor}`}
      >
        {label}
      </Text>
      <Text
        className={`text-xs font-semibold ${valueColor}`}
      >
        {Math.round(current)}g
      </Text>
      <Text
        className="text-xs font-bold mt-0.5"
        style={{ color }}
      >
        {goal > 0 ? Math.round((current / goal) * 100) : 0}%
      </Text>
    </View>
  );
};

// Main HeroSection Component
export const HeroSection: React.FC = () => {
  const { todayStats } = useHomeStore();
  const { isDark } = useTheme();

  // Colors and classes based on theme
  const containerBg = isDark ? "bg-gray-900" : "bg-white";
  const headerBg = isDark ? "bg-black/20" : "bg-white/50";
  const headerText = isDark
    ? "text-white"
    : "text-gray-900";
  const subText = isDark
    ? "text-gray-400"
    : "text-gray-600";

  const caloriesRemaining = Math.max(
    0,
    todayStats.caloriesGoal - todayStats.caloriesConsumed
  );
  const calorieProgress =
    todayStats.caloriesGoal > 0
      ? todayStats.caloriesConsumed /
        todayStats.caloriesGoal
      : 0;

  const macros = [
    {
      label: "Protein",
      short: "P",
      current: todayStats.proteinConsumed,
      goal: todayStats.proteinGoal,
      color: "#3B82F6",
    },
    {
      label: "Carbs",
      short: "C",
      current: todayStats.carbsConsumed,
      goal: todayStats.carbsGoal,
      color: "#F59E0B",
    },
    {
      label: "Fat",
      short: "F",
      current: todayStats.fatConsumed,
      goal: todayStats.fatGoal,
      color: "#8B5CF6",
    },
  ];

  return (
    <View
      className={`${containerBg} rounded-3xl mx-4 my-3 overflow-hidden`}
    >
      {/* Glass-morphic Header */}
      <View
        className={`${headerBg} backdrop-blur-lg px-4 py-3 flex-row justify-between items-center`}
      >
        <View>
          <Text
            className={`font-bold text-lg ${headerText}`}
          >
            Today's Progress
          </Text>
          <Text
            className={`text-xs font-medium ${subText}`}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        <Pressable
          className="w-9 h-9 rounded-xl justify-center items-center"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={isDark ? "#CBD5E1" : "#334155"}
          />
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View className="p-4 flex-row items-center justify-between">
        {/* Calorie Ring */}
        <View className="items-center mr-4">
          <View className="relative w-24 h-24 justify-center items-center mb-2">
            <ProgressRing
              progress={calorieProgress}
              size={88}
              strokeWidth={6}
              backgroundColor={
                isDark ? "#1E293B" : "#E2E8F0"
              }
              progressColor={isDark ? "#10B981" : "#059669"}
              isDark={isDark}
            />
            <View className="absolute items-center">
              <Text
                className={`text-xl font-bold ${headerText}`}
              >
                {Math.round(todayStats.caloriesConsumed)}
              </Text>
              <Text
                className={`text-xs font-medium ${subText}`}
              >
                of{" "}
                {Math.round(todayStats.caloriesGoal / 1000)}
                k
              </Text>
            </View>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: isDark
                ? "rgba(16,185,129,0.2)"
                : "rgba(5,150,105,0.2)",
            }}
          >
            <Text
              className={`text-${isDark ? "emerald-400" : "emerald-700"} font-bold text-xs`}
            >
              {Math.round(caloriesRemaining)} left
            </Text>
          </View>
        </View>

        {/* Macro Circles */}
        <View className="flex-1 flex-row justify-between">
          {macros.map((macro) => (
            <MacroCircle
              key={macro.label}
              {...macro}
              isDark={isDark}
            />
          ))}
        </View>
      </View>

      {/* Compact Footer Stats */}
      <View
        className="flex-row justify-around py-3 px-4"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.03)",
        }}
      >
        {/* Steps */}
        <View className="flex-row items-center">
          <View
            className="w-7 h-7 rounded-lg justify-center items-center mr-2"
            style={{
              backgroundColor: isDark
                ? "rgba(16,185,129,0.2)"
                : "rgba(5,150,105,0.2)",
            }}
          >
            <Ionicons
              name="walk"
              size={14}
              color={isDark ? "#10B981" : "#059669"}
            />
          </View>
          <View>
            <Text
              className={`text-sm font-bold ${headerText}`}
            >
              {(todayStats.stepsCount / 1000).toFixed(1)}k
            </Text>
            <Text className={`text-xs ${subText}`}>
              steps
            </Text>
          </View>
        </View>

        {/* Water */}
        <View className="flex-row items-center">
          <View
            className="w-7 h-7 rounded-lg justify-center items-center mr-2"
            style={{
              backgroundColor: isDark
                ? "rgba(59,130,246,0.2)"
                : "rgba(29,78,216,0.2)",
            }}
          >
            <Ionicons
              name="water"
              size={14}
              color={isDark ? "#3B82F6" : "#1D4ED8"}
            />
          </View>
          <View>
            <Text
              className={`text-sm font-bold ${headerText}`}
            >
              {(todayStats.waterConsumed / 1000).toFixed(1)}
              L
            </Text>
            <Text className={`text-xs ${subText}`}>
              water
            </Text>
          </View>
        </View>

        {/* Burned */}
        <View className="flex-row items-center">
          <View
            className="w-7 h-7 rounded-lg justify-center items-center mr-2"
            style={{
              backgroundColor: isDark
                ? "rgba(239,68,68,0.2)"
                : "rgba(220,38,38,0.2)",
            }}
          >
            <Ionicons
              name="flame"
              size={14}
              color={isDark ? "#EF4444" : "#DC2626"}
            />
          </View>
          <View>
            <Text
              className={`text-sm font-bold ${headerText}`}
            >
              {Math.round(todayStats.caloriesBurned)}
            </Text>
            <Text className={`text-xs ${subText}`}>
              burned
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
