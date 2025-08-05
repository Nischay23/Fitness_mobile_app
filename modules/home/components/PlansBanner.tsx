import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useHomeStore } from "../store/homeStore";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.85;
const cardMargin = 16;

interface PlanCard {
  id: string;
  title: string;
  subtitle: string;
  type: "premium" | "progress" | "challenge" | "nutrition";
  icon: string;
  progress?: number;
  actionText: string;
  gradient: string[];
}

const planCards: PlanCard[] = [
  {
    id: "1",
    title: "Nutrition Plan",
    subtitle: "Personalized meal planning",
    type: "premium",
    icon: "nutrition",
    actionText: "Go Premium",
    gradient: ["#FF6B6B", "#4ECDC4"],
  },
  {
    id: "2",
    title: "Weekly Goals",
    subtitle: "Track your progress",
    type: "progress",
    icon: "trophy",
    progress: 65,
    actionText: "View Progress",
    gradient: ["#A8E6CF", "#FFD93D"],
  },
  {
    id: "3",
    title: "Workout Challenge",
    subtitle: "30-day fitness challenge",
    type: "challenge",
    icon: "fitness",
    progress: 40,
    actionText: "Continue",
    gradient: ["#FF8A80", "#FF5722"],
  },
  {
    id: "4",
    title: "Macro Tracker",
    subtitle: "Balance your nutrients",
    type: "nutrition",
    icon: "pie-chart",
    progress: 80,
    actionText: "Optimize",
    gradient: ["#81C784", "#4CAF50"],
  },
];

export const PlansBanner: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { todayStats } = useHomeStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] =
    useState(false);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(
    null
  );

  const handleScroll = (event: any) => {
    const slideSize = cardWidth + cardMargin;
    const index = Math.round(
      event.nativeEvent.contentOffset.x / slideSize
    );
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const slideSize = cardWidth + cardMargin;
    scrollViewRef.current?.scrollTo({
      x: index * slideSize,
      animated: true,
    });
  };

  const startAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
    autoScrollInterval.current = setInterval(() => {
      if (!isUserScrolling) {
        setActiveIndex((prevIndex) => {
          const nextIndex =
            (prevIndex + 1) % planCards.length;
          scrollToIndex(nextIndex);
          return nextIndex;
        });
      }
    }, 3000); // Auto-scroll every 3 seconds
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    setIsUserScrolling(false);
    // Restart auto-scroll after 2 seconds of user inactivity
    setTimeout(() => {
      if (!isUserScrolling) {
        startAutoScroll();
      }
    }, 2000);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  useEffect(() => {
    if (!isUserScrolling) {
      const timer = setTimeout(() => {
        startAutoScroll();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isUserScrolling]);

  const renderProgressRing = (
    progress: number,
    size: number = 60
  ) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset =
      circumference - (progress / 100) * circumference;

    return (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.border,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size - strokeWidth,
            height: size - strokeWidth,
            borderRadius: (size - strokeWidth) / 2,
            backgroundColor: colors.primary,
            top: strokeWidth / 2,
            left: strokeWidth / 2,
            transform: [
              { rotate: `${(progress / 100) * 360}deg` },
            ],
          }}
        />
        <View
          style={{
            position: "absolute",
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: colors.surface,
            top: strokeWidth,
            left: strokeWidth,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderCard = (card: PlanCard) => (
    <TouchableOpacity
      key={card.id}
      style={{
        width: cardWidth,
        marginHorizontal: cardMargin / 2,
        backgroundColor: isDark
          ? "rgba(17, 24, 39, 0.95)"
          : colors.surface, // Match HeroSection dark bg
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: isDark
          ? "rgba(255,255,255,0.1)"
          : colors.border,
        minHeight: 180,
        justifyContent: "space-between",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Card Content */}
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text.primary,
                marginBottom: 4,
              }}
            >
              {card.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.text.secondary,
              }}
            >
              {card.subtitle}
            </Text>
          </View>

          {card.progress !== undefined ? (
            renderProgressRing(card.progress)
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.primary + "20",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={card.icon as any}
                size={24}
                color={colors.primary}
              />
            </View>
          )}
        </View>

        {/* Progress Details for Progress Cards */}
        {card.type === "progress" && (
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                }}
              >
                Weekly Goal
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                }}
              >
                {Math.round(
                  ((card.progress || 0) / 100) * 7
                )}
                /7 days
              </Text>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: colors.border,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${card.progress || 0}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        )}

        {/* Macro Stats for Nutrition Cards */}
        {card.type === "nutrition" && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {[
              {
                label: "Protein",
                value: todayStats.proteinConsumed,
                goal: todayStats.proteinGoal,
                color: "#3B82F6",
              },
              {
                label: "Carbs",
                value: todayStats.carbsConsumed,
                goal: todayStats.carbsGoal,
                color: "#F59E0B",
              },
              {
                label: "Fat",
                value: todayStats.fatConsumed,
                goal: todayStats.fatGoal,
                color: "#8B5CF6",
              },
            ].map((macro, index) => (
              <View
                key={index}
                style={{ alignItems: "center" }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: macro.color + "20",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "bold",
                      color: macro.color,
                    }}
                  >
                    {Math.round(
                      (macro.value / macro.goal) * 100
                    )}
                    %
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.text.muted,
                  }}
                >
                  {macro.label}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.text.secondary,
                  }}
                >
                  {macro.value}g
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={{
          backgroundColor:
            card.type === "premium"
              ? "#FFD93D"
              : colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 25,

          alignItems: "center",
        }}
      >
        <Text
          style={{
            color:
              card.type === "premium"
                ? "#000"
                : colors.text.inverse,
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          {card.actionText}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        marginVertical: 5,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          marginBottom: 5,
          backgroundColor: isDark
            ? "rgba(0,0,0,0.2)"
            : "rgba(255,255,255,0.5)",
          backdropFilter: "blur(8px)",
          padding: 8,
          borderRadius: 16,
          marginHorizontal: 8,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: isDark ? "#FFFFFF" : colors.text.primary,
          }}
        >
          Your Journey
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#CBD5E1" : colors.primary,
              fontWeight: "600",
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll Cards */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + cardMargin}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingLeft: cardMargin / 2,
          paddingRight: cardMargin / 2,
        }}
      >
        {planCards.map(renderCard)}
      </ScrollView>

      {/* Pagination Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        {planCards.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === activeIndex
                  ? colors.primary
                  : colors.border,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    </View>
  );
};
