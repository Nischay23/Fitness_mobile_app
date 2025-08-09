import React, { useRef, useState } from "react";
import {
  View,
  SafeAreaView,
  Pressable,
  Text,
  BackHandler,
  useColorScheme,
  Alert,
} from "react-native";
import PagerView from "react-native-pager-view";
import {
  useRouter,
  Stack,
  useLocalSearchParams,
} from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useOnboardingStore } from "@/modules/onboarding/store";
import { WelcomeScreen } from "@/modules/onboarding/components/screens/WelcomeScreen";
import { GenderScreen } from "@/modules/onboarding/components/screens/GenderScreen";
import { MetricsScreen } from "@/modules/onboarding/components/screens/MetricsScreen";
import { ActivityLevelScreen } from "@/modules/onboarding/components/screens/ActivityLevelScreen";
import { GoalScreen } from "@/modules/onboarding/components/screens/GoalScreen";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/useUserStore";
import {
  createUser,
  updateUser,
} from "@/db/actions/userActions";
import { supabase } from "@/lib/supabase";

// A simple, reusable progress bar component
const OnboardingProgressBar = ({
  progress,
}: {
  progress: number;
}) => (
  <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-6">
    <View
      style={{ width: `${progress * 100}%` }}
      className="h-1.5 bg-green-500 rounded-full"
    />
  </View>
);

export default function OnboardingFlow() {
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();
  const { edit } = useLocalSearchParams();
  const isEditMode = edit === "true";
  const isDark = useColorScheme() === "dark";
  const [currentPage, setCurrentPage] = useState(0);
  const onboardingState = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    currentUser,
    setCurrentUser,
    setOnboardingComplete,
  } = useAppStore();
  const { setUserData } = useUserStore();
  const [supabaseUser, setSupabaseUser] =
    useState<any>(null);

  // Get current user on mount and pre-populate if editing
  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    getUser();

    // Pre-populate onboarding state if editing existing user
    if (isEditMode && currentUser) {
      onboardingState.setData({
        gender: currentUser.gender as any,
        age: currentUser.age,
        heightCm: currentUser.heightCm,
        currentWeightKg: currentUser.currentWeightKg,
        activityLevel: currentUser.activityLevel as any,
        goalType: currentUser.goalType as any,
        targetWeightKg:
          currentUser.goalWeightKg || undefined,
      });
    }
  }, [isEditMode, currentUser]);

  const canProceed = () => {
    switch (currentPage) {
      case 0: // Welcome screen
        return true;
      case 1: // Gender screen
        return onboardingState.gender !== null;
      case 2: // Metrics
        return (
          onboardingState.heightCm !== null &&
          onboardingState.heightCm > 0 &&
          onboardingState.currentWeightKg !== null &&
          onboardingState.currentWeightKg > 0
        );
      case 3: // Activity Level
        return onboardingState.activityLevel !== null;
      case 4: // Goal
        return onboardingState.goalType !== null;

      default:
        return true;
    }
  };

  // Define the sequence of our onboarding screens
  const onboardingSteps = [
    WelcomeScreen,
    GenderScreen,
    MetricsScreen,
    ActivityLevelScreen,
    GoalScreen,
  ];

  const totalPages = onboardingSteps.length;

  const goToPage = (pageIndex: number) => {
    pagerRef.current?.setPage(pageIndex);
  };

  const handleNext = async () => {
    if (currentPage < totalPages - 1) {
      // If not on the last page, just go to the next one
      goToPage(currentPage + 1);
    } else {
      // --- THIS IS THE "FINISH SETUP" LOGIC ---
      if (!supabaseUser && !isEditMode) {
        Alert.alert(
          "Authentication Error",
          "Your session could not be found. Please log in again."
        );
        router.replace("/(auth)/login");
        return;
      }

      setIsSubmitting(true);
      try {
        if (isEditMode && currentUser) {
          // Update existing user
          const updates = {
            gender: onboardingState.gender!,
            age: onboardingState.age,
            heightCm: onboardingState.heightCm!,
            currentWeightKg:
              onboardingState.currentWeightKg!,
            activityLevel: onboardingState.activityLevel!,
            goalType: onboardingState.goalType!,
            targetWeightKg:
              onboardingState.targetWeightKg ||
              currentUser.goalWeightKg,
          };

          console.log(
            "🔄 Updating user with critical changes:",
            updates
          );
          const updatedUser = await updateUser(
            currentUser,
            updates
          );

          // Update both stores with the new user data
          setCurrentUser(updatedUser);
          setUserData(updatedUser);

          console.log(
            "✅ User updated successfully with new goals:",
            {
              dailyCalorieGoal:
                updatedUser.dailyCalorieGoal,
              proteinGoal_g: updatedUser.proteinGoal_g,
              carbsGoal_g: updatedUser.carbsGoal_g,
              fatGoal_g: updatedUser.fatGoal_g,
            }
          );

          // Navigate back to profile with success
          router.back();
          Alert.alert(
            "Success",
            "Your profile has been updated successfully!"
          );
        } else {
          // Create new user (original flow)
          const finalProfileData = {
            server_id: supabaseUser.id,
            email: supabaseUser.email,
            name:
              supabaseUser.user_metadata?.full_name ||
              "Fitness User",
            gender: onboardingState.gender!,
            dateOfBirth: new Date(
              new Date().setFullYear(
                new Date().getFullYear() - 25
              )
            )
              .toISOString()
              .split("T")[0], // Default age 25 for now
            heightCm: onboardingState.heightCm!,
            currentWeightKg:
              onboardingState.currentWeightKg!,
            targetWeightKg:
              onboardingState.targetWeightKg ||
              onboardingState.currentWeightKg!,
            activityLevel: onboardingState.activityLevel!,
            goalType: onboardingState.goalType!,
          };

          const newUser = await createUser(
            finalProfileData
          );

          if (newUser) {
            // Update both stores with the new user data
            setCurrentUser(newUser);
            setUserData(newUser);
            setOnboardingComplete(true);
            router.replace("/(tabs)");
          } else {
            throw new Error(
              "Failed to create the user profile in the database."
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to complete onboarding:",
          error
        );
        Alert.alert(
          "Error",
          `There was a problem ${isEditMode ? "updating" : "saving"} your profile. Please try again.`
        );
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
    return true; // Prevent default Android back behavior
  };

  // Handle the Android hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  }, [currentPage]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Shared Header with Back Button and Progress Bar */}
      <View className="my-4 flex-row items-center h-10">
        {currentPage > 0 ? (
          <Pressable
            onPress={handleBack}
            className="absolute left-4 z-10 p-2"
          >
            <Feather
              name="arrow-left"
              size={24}
              color={isDark ? "white" : "black"}
            />
          </Pressable>
        ) : (
          <View className="w-12 h-10" />
        )}
        <View className="flex-1">
          <OnboardingProgressBar
            progress={(currentPage + 1) / totalPages}
          />
        </View>
        <View className="w-12 h-10" />
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        scrollEnabled={false} // User must use the buttons
        onPageSelected={(e) =>
          setCurrentPage(e.nativeEvent.position)
        }
      >
        {onboardingSteps.map((StepComponent, index) => (
          <View key={index} className="flex-1 px-6 pb-4">
            <StepComponent />
          </View>
        ))}
      </PagerView>

      {/* Shared Footer with "Continue" Button */}
      <View className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <Pressable
          onPress={handleNext}
          disabled={!canProceed()}
          className="bg-green-500 rounded-full p-4 active:bg-green-600"
        >
          <Text className="text-white text-center text-lg font-bold">
            {currentPage === totalPages - 1
              ? isEditMode
                ? "Save Changes"
                : "Finish Setup"
              : "Continue"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
