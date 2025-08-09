import React, { useState, useEffect, useRef } from "react";
import {
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { HeroSection } from "@/modules/home/components/HeroSection";
import { PlansBanner } from "@/modules/home/components/PlansBanner";
import ProductsSection from "@/modules/products/components/ProductsSection";
import { QuickLogModal } from "@/modules/nutrition";
import { useTheme } from "@/modules/home/hooks/useTheme";
import { useHomeStore } from "@/modules/home/store/homeStore";
import { useAppStore } from "@/stores/appStore";
import { useProductsStore } from "@/modules/products/store/useProductsStore";

export default function Index(): JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { refreshData } = useHomeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickLogModal, setShowQuickLogModal] =
    useState(false);
  const { currentUser } = useAppStore();
  const { todayStats } = useHomeStore();
  const [debugTapCount, setDebugTapCount] = useState(0);
  const insets = useSafeAreaInsets();
  const { supabaseProfile } = useAppStore();

  // fetch products once
  const { fetchProducts } = useProductsStore();

  // Simplified initialization - no complex animations
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleProfilePress = () =>
    router.push("/(modals)/profile");
  const handleTitlePress = () => {
    const newCount = debugTapCount + 1;
    if (newCount >= 5) {
      router.push("/(modals)/db-debug");
      setDebugTapCount(0);
    } else {
      setDebugTapCount(newCount);
      setTimeout(() => setDebugTapCount(0), 2000);
    }
  };

  // quick actions array with enhanced styling
  const quickActions = [
    {
      icon: "restaurant",
      label: "Log Food",
      color: colors.primary,
      gradient: ["#4ADE80", "#22C55E"] as const,
      onPress: () => router.push("/nutrition/search"),
    },
    {
      icon: "fitness",
      label: "Exercise",
      color: "#EC4899",
      gradient: ["#EC4899", "#BE185D"] as const,
      onPress: () => setShowQuickLogModal(true),
    },
    {
      icon: "water",
      label: "Water",
      color: "#06B6D4",
      gradient: ["#06B6D4", "#0891B2"] as const,
      onPress: () => setShowQuickLogModal(true),
    },
    {
      icon: "library-outline",
      label: "Blogs",
      color: "#F59E0B",
      gradient: ["#F59E0B", "#D97706"] as const,
      onPress: () => router.push("/blogs"),
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />

      {/* HEADER with clean design */}
      <View
        className="flex-row justify-between items-center px-5 pt-4 pb-0"
        style={{
          paddingTop: insets.top + 5,
          paddingBottom: 5,
          backgroundColor: colors.background,
        }}
      >
        <View>
          <Pressable onPress={handleTitlePress}>
            <Text
              className="text-3xl font-bold"
              style={{
                color: colors.text.primary,
                fontFamily: "Inter_18pt-Bold",
              }}
            >
              FitNext
            </Text>
          </Pressable>
          <Text
            className="text-sm "
            style={{
              color: colors.text.secondary,
              fontFamily: "Inter_18pt-Regular",
            }}
          >
            Your fitness journey
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleProfilePress}
          className="w-12 h-12 rounded-full overflow-hidden"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.border,
          }}
        >
          {supabaseProfile?.avatar_url ? (
            <Image
              source={{
                uri: supabaseProfile.avatar_url,
              }}
              className="w-full h-full"
            />
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{
                backgroundColor: colors.primary + "20",
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{
                  color: colors.primary,
                  fontFamily: "Inter_18pt-Bold",
                }}
              >
                {currentUser?.name?.charAt(0) || "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        <View style={{ height: 12 }} />

        <View className="mx-2">
          <HeroSection />
        </View>

        <View>
          <PlansBanner />
        </View>

        {/* QUICK ACTIONS - Improved UI */}
        <View className="px-5 py-6">
          {/* Section Header */}
          <View className="mb-5">
            <Text
              className="text-xl font-bold mb-1"
              style={{
                color: colors.text.primary,
                fontFamily: "Inter_18pt-Bold",
              }}
            >
              Quick Actions
            </Text>
            <Text
              className="text-sm"
              style={{
                color: colors.text.secondary,
                fontFamily: "Inter_18pt-Regular",
              }}
            >
              Track your progress in one tap
            </Text>
          </View>

          {/* Actions Grid */}
          <View className="flex-row justify-between">
            {quickActions.map((action, index) => {
              const ActionCard = (
                <Pressable
                  key={index}
                  android_ripple={{
                    color: action.color + "22",
                    borderless: false,
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 16,
                      padding: 16,
                      minHeight: 110,
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginHorizontal: 4,
                      // Enhanced shadow
                      ...Platform.select({
                        ios: {
                          shadowColor: action.color,
                          shadowOpacity: 0.15,
                          shadowOffset: {
                            width: 0,
                            height: 4,
                          },
                          shadowRadius: 12,
                        },
                        android: {
                          elevation: 3,
                        },
                      }),
                      // Press feedback
                      transform: [
                        { scale: pressed ? 0.96 : 1 },
                      ],
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={action.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  <View
                    style={{
                      alignItems: "center",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    {/* Enhanced Gradient Icon Container */}
                    <LinearGradient
                      colors={action.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        // Add subtle inner shadow effect
                        ...Platform.select({
                          ios: {
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowOffset: {
                              width: 0,
                              height: 2,
                            },
                            shadowRadius: 4,
                          },
                          android: {
                            elevation: 2,
                          },
                        }),
                      }}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={24}
                        color="#FFFFFF"
                      />
                    </LinearGradient>

                    {/* Action Label */}
                    <Text
                      className="text-xs text-center font-semibold"
                      style={{
                        color: colors.text.primary,
                        fontFamily: "Inter_18pt-SemiBold",
                        lineHeight: 16,
                      }}
                      numberOfLines={2}
                    >
                      {action.label}
                    </Text>
                  </View>
                </Pressable>
              );

              // Handle Blogs link specially
              if (action.label === "Blogs") {
                return (
                  <Link
                    href="/blogs"
                    asChild
                    key={`blogs-${index}`}
                  >
                    {ActionCard}
                  </Link>
                );
              }

              return ActionCard;
            })}
          </View>
        </View>

        <View className="px-4 py-3">
          <ProductsSection />
        </View>
      </ScrollView>

      <QuickLogModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
      />
    </View>
  );
}
