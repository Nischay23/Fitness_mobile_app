import React, { useState } from "react";
import { Tabs } from "expo-router";
import {
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { COLORS } from "@/constants/theme";
import { QuickLogModal } from "@/modules/nutrition";

export default function TabLayout(): React.ReactElement {
  const [showQuickLogModal, setShowQuickLogModal] =
    useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const CustomPlusButton = () => (
    <View className="items-center justify-center -mt-6 px-1">
      <TouchableOpacity
        onPress={() => setShowQuickLogModal(true)}
        style={{
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
        }}
        className="w-16 h-16 rounded-full items-center justify-center border-4 border-white dark:border-gray-900"
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="plus"
          size={32}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );

  // Enhanced tab icon component with smooth animations
  const TabIcon = ({
    name,
    focused,
    color,
    size,
    IconComponent = MaterialCommunityIcons,
  }: {
    name: any;
    focused: boolean;
    color: string;
    size: number;
    IconComponent?: any;
  }) => (
    <View className="items-center justify-center py-3 px-4 min-w-16">
      <View
        style={{
          backgroundColor: focused
            ? `${colors.primary}${colorScheme === "dark" ? "20" : "15"}`
            : "transparent",
          transform: [{ scale: focused ? 1.05 : 1 }],
        }}
        className="w-12 h-10 rounded-3xl items-center justify-center"
      >
        <IconComponent
          name={name}
          size={focused ? 25 : 24}
          color={focused ? colors.primary : color}
          style={{
            opacity: focused ? 1 : 0.6,
          }}
        />
      </View>
      {focused && (
        <View
          style={{
            backgroundColor: colors.primary,
            marginTop: 4,
          }}
          className="w-1 h-1 rounded-full"
        />
      )}
    </View>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor:
            colorScheme === "dark"
              ? colors.text.muted
              : colors.text.secondary,
          tabBarStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? "#1a1a1a" // Modern dark background
                : "#ffffff", // Clean white for light mode
            borderTopWidth: 0, // Remove top border completely
            position: "absolute",
            elevation: colorScheme === "dark" ? 0 : 8,
            shadowColor:
              colorScheme === "dark"
                ? "transparent" // No shadow in dark mode for clean look
                : "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: colorScheme === "dark" ? 0 : 0.1,
            shadowRadius: 8,
            height: 70,
            paddingBottom: 4,
            paddingTop: 6,
            paddingHorizontal: 8,
            borderRadius: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={focused ? "home" : "home-outline"}
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="diary"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={focused ? "book" : "book-outline"}
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            tabBarButton: () => <CustomPlusButton />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            headerShown: true,
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={
                  focused
                    ? "chart-line"
                    : "chart-line-variant"
                }
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="feeds/index"
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                name={
                  focused
                    ? "account-group"
                    : "account-group-outline"
                }
                focused={focused}
                color={color}
                size={size}
                IconComponent={MaterialCommunityIcons}
              />
            ),
          }}
        />
      </Tabs>

      {/* Quick Log Modal */}
      <QuickLogModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
      />
    </>
  );
}
