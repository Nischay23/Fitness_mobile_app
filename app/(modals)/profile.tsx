import Loader from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useAppStore } from "@/stores/appStore";
import { useRouter } from "expo-router";
import { signout } from "@/db/actions/authActions";

export default function Profile() {
  const { currentUser, logout, selectedGoal } =
    useAppStore();
  const router = useRouter();

  if (!currentUser) return <Loader />;

  const handleEditProfile = () => {
    router.push("/onboarding");
  };

  const handleSignOut = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",

          onPress: async () => {
            await signout();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-surface">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-white">
            Profile
          </Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="p-1"
            onPress={handleEditProfile}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-1"
            onPress={logout}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* AVATAR & BASIC INFO */}
          <View className="flex-row items-center mb-6">
            <View className="mr-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "#2A2A2A",
                  borderWidth: 2,
                  borderColor: "#4ADE80",
                }}
              >
                <Text className="text-2xl text-white font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-xl font-bold text-white mb-1">
                {currentUser.name}
              </Text>
              <Text className="text-sm text-grey mb-2">
                {currentUser.gender} • Born{" "}
                {currentUser.dateOfBirth}
              </Text>
              {selectedGoal && (
                <View className="bg-green-500/10 px-3 py-1 rounded-full self-start">
                  <Text className="text-green-500 text-xs font-medium">
                    Goal:{" "}
                    {selectedGoal
                      .replace("_", " ")
                      .toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* PHYSICAL STATS */}
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-white font-semibold mb-3">
              Physical Stats
            </Text>
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-white">
                  {currentUser.heightCm}
                </Text>
                <Text className="text-sm text-grey">
                  Height (cm)
                </Text>
              </View>
              <View className="w-px bg-gray-700 mx-4" />
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-white">
                  {currentUser.currentWeightKg}
                </Text>
                <Text className="text-sm text-grey">
                  Weight (kg)
                </Text>
              </View>
            </View>
          </View>

          {/* FITNESS GOALS */}
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-white font-semibold mb-3">
              Fitness Goals
            </Text>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">
                {selectedGoal === "lose_weight"
                  ? "📉"
                  : selectedGoal === "maintain_weight"
                    ? "⚖️"
                    : "💪"}
              </Text>
              <View>
                <Text className="text-white font-medium">
                  {selectedGoal === "lose_weight"
                    ? "Lose Weight"
                    : selectedGoal === "maintain_weight"
                      ? "Maintain Weight"
                      : "Gain Muscle"}
                </Text>
                <Text className="text-grey text-sm">
                  Primary goal
                </Text>
              </View>
            </View>
          </View>

          {/* EDIT PROFILE BUTTON */}
          <TouchableOpacity
            className="bg-primary p-4 rounded-2xl items-center mb-4"
            onPress={handleEditProfile}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="create-outline"
                size={20}
                color="white"
              />
              <Text className="text-white font-semibold ml-2">
                Edit Profile
              </Text>
            </View>
          </TouchableOpacity>

          {/* ACCOUNT ACTIONS */}
          <View className="bg-surface rounded-2xl p-4">
            <Text className="text-white font-semibold mb-3">
              Account
            </Text>

            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-700">
              <View className="flex-row items-center">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <Text className="text-white ml-3">
                  Notifications
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-700">
              <View className="flex-row items-center">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <Text className="text-white ml-3">
                  Help & Support
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              onPress={handleSignOut}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#EF4444"
                />
                <Text className="text-red-500 ml-3">
                  Sign Out
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#EF4444"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
