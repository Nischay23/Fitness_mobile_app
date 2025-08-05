import React, { useState, useEffect } from "react";
import {
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";

import { format } from "date-fns/format";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/db/index";
import { DiaryEntry } from "@/db/models/DiaryEntry";

import { HeroSection } from "@/modules/home/components/HeroSection";
import { PlansBanner } from "@/modules/home/components/PlansBanner";
import { useTheme } from "@/modules/home/hooks/useTheme";
import { useHomeStore } from "@/modules/home/store/homeStore";

import { QuickLogModal } from "@/modules/nutrition";
import { useAppStore } from "@/stores/appStore";
import { Pressable } from "react-native";

import { useProductsStore } from "@/modules/products/store/useProductsStore";
import ProductsSection from "@/modules/products/components/ProductsSection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "react-native";

export default function Index(): JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
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
  useEffect(() => {
    fetchProducts();
  }, []);

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

  // quick actions array
  const quickActions = [
    {
      icon: "restaurant",
      label: "Log Food",
      color: colors.primary,
      onPress: () => router.push("/nutrition/search"),
    },
    {
      icon: "fitness",
      label: "Exercise",
      color: "#EC4899",
      onPress: () => setShowQuickLogModal(true),
    },
    {
      icon: "water",
      label: "Water",
      color: "#06B6D4",
      onPress: () => setShowQuickLogModal(true),
    },
    {
      icon: "library-outline",
      label: "Blogs",
      color: "#F59E0B",
      onPress: () => router.push("/blogs"),
    },
  ];

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* HEADER */}
      <View
        className="flex-row justify-between items-center px-6 py-4"
        style={{
          paddingTop: insets.top + 10,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View>
          <Pressable onPress={handleTitlePress}>
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.primary }}
            >
              FitNext
            </Text>
          </Pressable>
          <Text
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            Your fitness journey
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleProfilePress}
          className="w-12 h-12 rounded-full overflow-hidden"
          style={{
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.primary,
            borderWidth: 1,
          }}
        >
          {supabaseProfile?.avatar_url ? (
            <Image
              source={{ uri: supabaseProfile.avatar_url }}
              className="w-full h-full"
            />
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{
                backgroundColor: colors.primary + "20",
              }}
            >
              <Text style={{ color: colors.primary }}>
                {currentUser?.name?.charAt(0) || "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <HeroSection />
        <PlansBanner />

        {/* QUICK ACTIONS */}
        <View className="px-4 py-2">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.text.primary }}
          >
            Quick Actions
          </Text>
          <View className="flex-row justify-between">
            {quickActions.map((action, index) =>
              action.label === "Blogs" ? (
                <Link key={index} href="/blogs" asChild>
                  <TouchableOpacity
                    className="items-center p-4 rounded-2xl flex-1 mx-1"
                    style={{
                      backgroundColor: colors.surface,
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-2"
                      style={{
                        backgroundColor:
                          action.color + "20",
                      }}
                    >
                      <Ionicons
                        name={action.icon as any}
                        size={24}
                        color={action.color}
                      />
                    </View>
                    <Text
                      className="text-sm font-medium text-center"
                      style={{ color: colors.text.primary }}
                    >
                      Blogs
                    </Text>
                  </TouchableOpacity>
                </Link>
              ) : (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  className="items-center p-4 rounded-2xl flex-1 mx-1"
                  style={{
                    backgroundColor: colors.surface,
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{
                      backgroundColor: action.color + "20",
                    }}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={24}
                      color={action.color}
                    />
                  </View>
                  <Text
                    className="text-sm font-medium text-center"
                    style={{ color: colors.text.primary }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <ProductsSection />
        <View className="pb-20" />
      </ScrollView>

      <QuickLogModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
      />
    </View>
  );
}
