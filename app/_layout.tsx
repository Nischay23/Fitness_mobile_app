import "../global.css"; // Ensure Tailwind CSS is correctly imported
import { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  View,
  ActivityIndicator,
  Text,
  useColorScheme,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";

import { useAppStore } from "@/stores/appStore";
import { getActiveUser } from "@/db/actions/userActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import DatabaseProvider from "@/providers/DatabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "@/constants/theme";

// Keep the splash screen visible while we figure things out
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const {
    isLoading,
    isAuthenticated,
    setCurrentUser,
    setLoading,
    onboardingComplete,
    setOnboardingComplete,
  } = useAppStore();

  const [appInitialized, setAppInitialized] = useState(false);
  const [isNavigatorReady, setIsNavigatorReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
    // You might want to add more fonts here for a richer typography
    // "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    // "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
  });

  const router = useRouter();

  // Effect to initialize the app data (user, food database)
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app data...");
        setLoading(true); // Set global loading state

        // Seed food database (consider moving this to a more controlled environment
        // if it's a heavy operation, or only run once per app install)
        try {
          await seedFoodDatabase();
          console.log("🌱 Food database seeded successfully (if needed).");
        } catch (seedError) {
          console.warn("⚠️ Food database seeding failed:", seedError);
        }

        // Get active user
        const user = await getActiveUser();
        console.log("👤 User found:", !!user);
        setCurrentUser(user);

        // If user exists but onboarding isn't marked complete, set it
        // This handles cases where onboarding might have finished but state wasn't persisted
        if (user && !onboardingComplete) {
          console.log("✅ User exists, marking onboarding as complete.");
          setOnboardingComplete(true);
        }

        console.log("✅ App data initialization complete.");
      } catch (error) {
        console.error("❌ App data initialization failed:", error);
        // Reset user and onboarding state on error to ensure a fresh start
        setCurrentUser(null);
        setOnboardingComplete(false);
      } finally {
        setLoading(false); // Clear global loading state
        setAppInitialized(true); // Mark app data as initialized
      }
    };

    // Only run initialization once fonts are loaded/failed and app hasn't been initialized
    if ((fontsLoaded || fontError) && !appInitialized) {
      initializeApp();
    }
  }, [
    fontsLoaded,
    fontError,
    appInitialized,
    setCurrentUser,
    setOnboardingComplete,
    onboardingComplete,
    setLoading,
  ]);

  // Effect to handle navigation after all checks are complete
  useEffect(() => {
    // Wait for app data to be initialized, fonts to load, and navigator to be ready
    if (
      !appInitialized ||
      (!fontsLoaded && !fontError) ||
      isLoading || // Wait for isLoading to be false
      !isNavigatorReady
    ) {
      return;
    }

    console.log("🧭 Navigation logic triggered with state:", {
      isAuthenticated,
      onboardingComplete,
      fontsLoaded: !!fontsLoaded,
      appInitialized,
      isNavigatorReady,
      isLoading,
    });

    // Use a small timeout to ensure Expo Router is fully ready
    const navigateTimeout = setTimeout(() => {
      try {
        if (isAuthenticated && onboardingComplete) {
          console.log("➡️ Navigating to main app (tabs).");
          router.replace("/(tabs)");
        } else if (isAuthenticated && !onboardingComplete) {
          console.log("➡️ Navigating to onboarding.");
          router.replace("/onboarding");
        } else {
          console.log("➡️ Navigating to profile creation (auth).");
          router.replace("/(auth)/CreateProfileScreen");
        }
      } catch (navError) {
        console.error("❌ Navigation error:", navError);
        // Fallback to profile creation on navigation error
        router.replace("/(auth)/CreateProfileScreen");
      }
    }, 300); // Small delay to prevent race conditions with router readiness

    return () => clearTimeout(navigateTimeout); // Cleanup timeout
  }, [
    appInitialized,
    isAuthenticated,
    onboardingComplete,
    fontsLoaded,
    fontError,
    isLoading,
    isNavigatorReady,
    router,
  ]);

  // Callback to hide the splash screen once everything is loaded and ready
  const onLayoutRootView = useCallback(async () => {
    if (
      (fontsLoaded || fontError) &&
      appInitialized &&
      !isLoading &&
      isNavigatorReady
    ) {
      try {
        await SplashScreen.hideAsync();
        console.log("✅ Splash screen hidden.");
      } catch (error) {
        console.warn("⚠️ Splash screen hide error:", error);
      }
    }
  }, [fontsLoaded, fontError, appInitialized, isLoading, isNavigatorReady]);

  // Set Android navigation bar style
  useEffect(() => {
    if (Platform.OS === "android") {
      // Use a dark color for the navigation bar to match the app's initial loading screen
      NavigationBar.setBackgroundColorAsync("#0F172A"); // Dark slate
      NavigationBar.setButtonStyleAsync("light"); // Light icons/text on dark background
    }
  }, []);

  // Small timeout to mark navigator as ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigatorReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Determine if the loading overlay should be shown
  const showLoading =
    !appInitialized ||
    (!fontsLoaded && !fontError) ||
    isLoading ||
    !isNavigatorReady;

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar
              style={colorScheme === "dark" ? "light" : "dark"}
              backgroundColor="transparent"
              translucent={true}
            />
            <GestureHandlerRootView
              style={{
                flex: 1,
                backgroundColor: colors.background,
              }}
              onLayout={onLayoutRootView}
            >
              {/* Stack Navigator for routing */}
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: colors.background,
                  },
                  animation: "fade",
                  statusBarStyle: colorScheme === "dark" ? "light" : "dark",
                  statusBarTranslucent: true,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)/CreateProfileScreen" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    statusBarTranslucent: true,
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="(modals)"
                  options={{
                    presentation: "modal",
                    statusBarTranslucent: true,
                  }}
                />
                <Stack.Screen name="nutrition/index" />
                <Stack.Screen name="nutrition/search" />
                <Stack.Screen name="products/[id]" />
                <Stack.Screen name="user/[id]" />
                <Stack.Screen
                  name="blogs"
                  options={{
                    contentStyle: { paddingTop: 0 },
                  }}
                />
              </Stack>

              {/* Loading overlay */}
              {showLoading && (
                <View className="absolute inset-0 bg-slate-900 flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#6EE7B7" />
                  <Text className="text-white mt-4 text-center px-4 font-semibold text-lg">
                    {fontError
                      ? "Font loading failed, continuing..."
                      : !fontsLoaded
                        ? "Loading fonts..."
                        : !appInitialized
                          ? "Initializing app data..."
                          : !isNavigatorReady
                            ? "Preparing navigation..."
                            : "Starting FitNext..."}
                  </Text>
                  {fontError && (
                    <Text className="text-red-400 mt-2 text-sm text-center">
                      Error: {fontError.message}
                    </Text>
                  )}
                </View>
              )}
            </GestureHandlerRootView>
          </View>
        </SafeAreaProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}
