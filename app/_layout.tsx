import "../global.css";
import { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Platform, View, ActivityIndicator, Text } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

import { useAppStore } from "@/stores/appStore";
import { getActiveUser } from "@/db/actions/userActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import DatabaseProvider from "@/providers/DatabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Keep the splash screen visible while we figure things out
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // --- State from our Zustand store ---
  const {
    isLoading,
    isAuthenticated,
    setCurrentUser,
    setLoading,
    onboardingComplete,
    setOnboardingComplete,
  } = useAppStore();

  // Local state to track initialization
  const [appInitialized, setAppInitialized] = useState(false);

  // Font loading
  const [fontsLoaded, fontError] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const router = useRouter();

  // --- Simplified App Initialization ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app...");
        setLoading(true);

        // 1. Seed food database (non-blocking)
        try {
          await seedFoodDatabase();
        } catch (seedError) {
          console.warn("Food database seeding failed:", seedError);
          // Don't block app initialization for seeding issues
        }

        // 2. Check for existing user
        const user = await getActiveUser();
        console.log("👤 User found:", !!user);

        // 3. Update store
        setCurrentUser(user);

        // 4. Set onboarding status
        if (user && !onboardingComplete) {
          console.log("✅ User exists, marking onboarding as complete");
          setOnboardingComplete(true);
        }

        console.log("✅ App initialization complete");
      } catch (error) {
        console.error("❌ App initialization failed:", error);
        // Reset to a known state
        setCurrentUser(null);
        setOnboardingComplete(false);
      } finally {
        setLoading(false);
        setAppInitialized(true);
      }
    };

    // Only initialize once when fonts are ready
    if ((fontsLoaded || fontError) && !appInitialized) {
      initializeApp();
    }
  }, [fontsLoaded, fontError, appInitialized]);

  // --- Navigation Effect (Separate from initialization) ---
  useEffect(() => {
    // Wait for both app initialization and font loading
    if (!appInitialized || (!fontsLoaded && !fontError) || isLoading) {
      return;
    }

    console.log("🧭 Navigation logic triggered:", {
      isAuthenticated,
      onboardingComplete,
      fontsLoaded: !!fontsLoaded,
      appInitialized,
    });

    // Simplified navigation logic with timeout to prevent hanging
    const navigateTimeout = setTimeout(() => {
      try {
        if (isAuthenticated && onboardingComplete) {
          console.log("➡️ Going to main app");
          router.replace("/(tabs)");
        } else if (isAuthenticated && !onboardingComplete) {
          console.log("➡️ Going to onboarding");
          router.replace("/onboarding");
        } else {
          console.log("➡️ Going to profile creation");
          router.replace("/(auth)/CreateProfileScreen");
        }
      } catch (navError) {
        console.error("❌ Navigation error:", navError);
        // Fallback navigation
        router.replace("/(auth)/CreateProfileScreen");
      }
    }, 100); // Small delay to ensure state is stable

    return () => clearTimeout(navigateTimeout);
  }, [
    appInitialized,
    isAuthenticated,
    onboardingComplete,
    fontsLoaded,
    fontError,
    isLoading,
  ]);

  // --- Hide Splash Screen Logic ---
  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && appInitialized && !isLoading) {
      try {
        await SplashScreen.hideAsync();
        console.log("✅ Splash screen hidden");
      } catch (error) {
        console.warn("⚠️ Splash screen hide error:", error);
      }
    }
  }, [fontsLoaded, fontError, appInitialized, isLoading]);

  // Android Navigation Bar
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  // Show loading state
  const showLoading =
    !appInitialized || (!fontsLoaded && !fontError) || isLoading;

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-black" onLayout={onLayoutRootView}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/CreateProfileScreen" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="(modals)"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen name="nutrition/index" />
              <Stack.Screen name="nutrition/search" />
              <Stack.Screen name="products/[id]" />
              <Stack.Screen name="user/[id]" />
            </Stack>

            {/* Loading overlay with better error handling */}
            {showLoading && (
              <View className="absolute inset-0 bg-black flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className="text-white mt-4 text-center px-4">
                  {fontError
                    ? "Font loading failed, continuing..."
                    : !fontsLoaded
                      ? "Loading fonts..."
                      : !appInitialized
                        ? "Initializing app..."
                        : "Starting FitNext..."}
                </Text>
                {fontError && (
                  <Text className="text-red-400 mt-2 text-sm">
                    Font Error: {fontError.message}
                  </Text>
                )}
              </View>
            )}

            {/* Debug panel for development */}
          </SafeAreaView>
          <StatusBar style="light" />
        </SafeAreaProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}
