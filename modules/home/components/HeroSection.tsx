import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useHomeStore } from "../store/homeStore";
import { ProgressRing } from "./ProgressRing";
import { useTheme } from "../hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";

interface MacroProgressBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  isDark: boolean;
}

const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  current,
  goal,
  color,
  isDark,
}) => {
  const progress =
    goal > 0 ? Math.min(current / goal, 1) : 0;
  const percentage = Math.round(progress * 100);
  const animatedWidth = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={{ flex: 1, marginHorizontal: 4 }}>
      {/* Label and values */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_18pt-SemiBold",
            color: isDark ? "#F3F4F6" : "#374151",
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Inter_18pt-Bold",
            color: color,
          }}
        >
          {Math.round(current)}g
        </Text>
      </View>

      {/* Progress bar track */}
      <View
        style={{
          height: 8,
          backgroundColor: isDark ? "#374151" : "#E5E7EB",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {/* Animated progress fill */}
        <Animated.View
          style={{
            height: "100%",
            borderRadius: 6,
            backgroundColor: color,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
          }}
        />
      </View>

      {/* Percentage */}
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter_18pt-SemiBold",
          color: color,
          textAlign: "center",
          marginTop: 6,
        }}
      >
        {percentage}%
      </Text>
    </View>
  );
};

// Main HeroSection Component
export const HeroSection: React.FC = () => {
  const { todayStats } = useHomeStore();
  const { isDark } = useTheme();
  const router = useRouter();
  const slideUpAnim = useRef(
    new Animated.Value(50)
  ).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      current: todayStats.proteinConsumed,
      goal: todayStats.proteinGoal,
      color: "#60A5FA",
    },
    {
      label: "Carbs",
      current: todayStats.carbsConsumed,
      goal: todayStats.carbsGoal,
      color: "#FBBF24",
    },
    {
      label: "Fat",
      current: todayStats.fatConsumed,
      goal: todayStats.fatGoal,
      color: "#A78BFA",
    },
  ];

  const gradientColors: [string, string, ...string[]] =
    isDark
      ? ["#1E293B", "#0F172A", "#020617"]
      : ["#FFFFFF", "#F8FAFC", "#F1F5F9"];

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideUpAnim }],
        opacity: fadeAnim,
      }}
    >
      <Pressable
        onPress={() => router.push("/nutrition" as any)}
        style={({ pressed }) => ({
          marginHorizontal: 32,
          marginVertical: 16,
          borderRadius: 28,
          overflow: "hidden",
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: isDark ? "#000000" : "#1F2937",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.4 : 0.15,
          shadowRadius: 20,
          elevation: 12,
        })}
      >
        <LinearGradient
          colors={gradientColors}
          style={{
            borderRadius: 28,
            borderWidth: isDark ? 1 : 0.5,
            borderColor: isDark
              ? "rgba(148,163,184,0.2)"
              : "rgba(148,163,184,0.3)",
          }}
        >
          {/* Header Section - More Compact */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 18,
              paddingTop: 18,
              paddingBottom: 12,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_18pt-Bold",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  marginBottom: 4,
                }}
              >
                Today's Progress
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_18pt-Medium",
                  color: isDark ? "#94A3B8" : "#64748B",
                }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>

            <Pressable
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: isDark
                  ? "rgba(148,163,184,0.15)"
                  : "rgba(148,163,184,0.1)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isDark ? "#000000" : "#64748B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={isDark ? "#CBD5E1" : "#475569"}
              />
            </Pressable>
          </View>

          {/* Main Content - More Compact */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingBottom: 14,
              alignItems: "center",
            }}
          >
            {/* Calorie Ring Section - Larger */}
            <View
              style={{
                alignItems: "center",
                marginRight: 20,
              }}
            >
              {/* Calories Label */}
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_18pt-SemiBold",
                  color: isDark ? "#CBD5E1" : "#475569",
                  marginBottom: 8,
                }}
              >
                Calories
              </Text>

              <View
                style={{
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <ProgressRing
                  progress={calorieProgress}
                  size={110}
                  strokeWidth={8}
                  backgroundColor={
                    isDark ? "#374151" : "#E2E8F0"
                  }
                  progressColor={
                    isDark ? "#34D399" : "#10B981"
                  }
                  glowEffect={true}
                  isDark={isDark}
                />
                <View
                  style={{
                    position: "absolute",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: "Inter_18pt-Bold",
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    }}
                  >
                    {Math.round(
                      todayStats.caloriesConsumed
                    )}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_18pt-Medium",
                      color: isDark ? "#94A3B8" : "#64748B",
                    }}
                  >
                    of {Math.round(todayStats.caloriesGoal)}
                  </Text>
                </View>
              </View>

              {/* Calories remaining badge - More Compact */}
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(52,211,153,0.2)"
                    : "rgba(16,185,129,0.15)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isDark
                    ? "#34D399"
                    : "#10B981",
                  shadowColor: isDark
                    ? "#34D399"
                    : "#10B981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_18pt-SemiBold",
                    color: isDark ? "#34D399" : "#047857",
                  }}
                >
                  {Math.round(caloriesRemaining)} left
                </Text>
              </View>
            </View>

            {/* Macros Section - More Compact */}
            <View style={{ flex: 1 }}>
              <View style={{ gap: 0 }}>
                {macros.map((macro) => (
                  <MacroProgressBar
                    key={macro.label}
                    label={macro.label}
                    current={macro.current}
                    goal={macro.goal}
                    color={macro.color}
                    isDark={isDark}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Bottom Stats Row - More Compact */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingHorizontal: 10,
              paddingVertical: 2,
              backgroundColor: isDark
                ? "rgba(148,163,184,0.08)"
                : "rgba(148,163,184,0.06)",
              borderTopWidth: 1,
              borderTopColor: isDark
                ? "rgba(148,163,184,0.1)"
                : "rgba(148,163,184,0.15)",
            }}
          >
            {/* Steps */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark
                    ? "rgba(52,211,153,0.2)"
                    : "rgba(16,185,129,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  shadowColor: isDark
                    ? "#34D399"
                    : "#10B981",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
              >
                <Ionicons
                  name="walk"
                  size={18}
                  color={isDark ? "#34D399" : "#047857"}
                />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_18pt-Bold",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              >
                {(todayStats.stepsCount / 1000).toFixed(1)}k
              </Text>
            </View>

            {/* Water */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark
                    ? "rgba(96,165,250,0.2)"
                    : "rgba(59,130,246,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  shadowColor: isDark
                    ? "#60A5FA"
                    : "#3B82F6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
              >
                <Ionicons
                  name="water"
                  size={18}
                  color={isDark ? "#60A5FA" : "#1D4ED8"}
                />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_18pt-Bold",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              >
                {(todayStats.waterConsumed / 1000).toFixed(
                  1
                )}
                L
              </Text>
            </View>

            {/* Burned */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark
                    ? "rgba(248,113,113,0.2)"
                    : "rgba(239,68,68,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                  shadowColor: isDark
                    ? "#F87171"
                    : "#EF4444",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
              >
                <Ionicons
                  name="flame"
                  size={18}
                  color={isDark ? "#F87171" : "#DC2626"}
                />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Inter_18pt-Bold",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                }}
              >
                {Math.round(todayStats.caloriesBurned)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};
