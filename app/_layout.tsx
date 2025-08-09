import "../global.css";
import { useCallback, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";

import { useAppStore } from "@/stores/appStore";
import {
  findUserByServerId,
  getActiveUser,
} from "@/db/actions/userActions";
import { seedFoodDatabase } from "@/db/actions/foodActions";
import DatabaseProvider from "@/providers/DatabaseProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import { createUser } from "@/db/actions/userActions";

// Keep the splash screen visible while we figure things out
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading } = useAppStore();
  const [isNavigatorReady, setIsNavigatorReady] =
    useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_18pt-SemiBold.ttf"), // Using SemiBold as Medium
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      if (isAppReady) {
        await SplashScreen.hideAsync();
        console.log("✅ Splash screen hidden.");
      }
    }
  }, [fontsLoaded, fontError, isAppReady]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigatorReady(true);
      setIsAppReady(true); // Mark app as ready after a short delay
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const showLoading =
    (!fontsLoaded && !fontError) ||
    !isNavigatorReady ||
    !isAppReady;

  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <AuthProvider>
          <ToastProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView
                style={{ flex: 1, backgroundColor: "black" }}
                onLayout={onLayoutRootView}
              >
                {/* Main SafeAreaView for the entire app content */}

                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)/login" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="(modals)"
                    options={{ presentation: "modal" }}
                  />
                  <Stack.Screen name="nutrition/index" />
                  <Stack.Screen name="nutrition/search" />
                  <Stack.Screen name="products/[id]" />
                  <Stack.Screen name="user" />

                  <Stack.Screen
                    name="blogs"
                    options={{
                      contentStyle: { paddingTop: 0 },
                      animation: "fade", // Smoother transition
                      presentation: "card",
                    }}
                  />
                </Stack>

                {/* Loading overlay - position it absolutely over everything */}
                {showLoading && (
                  <View className="absolute inset-0 bg-black flex-1 justify-center items-center">
                    <ActivityIndicator
                      size="large"
                      color="#10B981"
                    />
                    <Text className="text-white mt-4 text-center px-4">
                      {fontError
                        ? "Font loading failed, continuing..."
                        : !fontsLoaded
                          ? "Loading fonts..."
                          : !isNavigatorReady
                            ? "Setting up navigation..."
                            : "Starting FitNext..."}
                    </Text>
                    {fontError && (
                      <Text className="text-red-400 mt-2 text-sm">
                        Font Error: {fontError.message}
                      </Text>
                    )}
                  </View>
                )}
                {/* Global StatusBar from expo-status-bar */}
                <StatusBar
                  style="auto"
                  backgroundColor="transparent"
                  translucent={true}
                />
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </ToastProvider>
        </AuthProvider>
      </DatabaseProvider>
    </ErrorBoundary>
  );
}
