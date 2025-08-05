import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { FontAwesome5 } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function LoginScreen() {
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "175732569705-gon1hjqas375rq7fg1inj83juupi8405.apps.googleusercontent.com",
    });
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      // 1. Check if the device has Google Play Services installed (for Android).
      await GoogleSignin.hasPlayServices();

      // 2. Trigger the native Google Sign-In UI to get the user's ID token.
      const signInResult = await GoogleSignin.signIn();
      console.log("Sign-in result:", signInResult);
      const { idToken } = await GoogleSignin.getTokens();

      console.log("ID token:", idToken);

      if (!idToken) {
        throw new Error(
          "Google Sign-In failed: No ID token was returned."
        );
      }

      // 3. Use the received ID token to sign in with Supabase.
      const { data, error } =
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
        });

      if (error) {
        // If Supabase returns an error, throw it to be caught below.
        throw error;
      }

      // If we reach here, the sign-in was successful.
      // The `onAuthStateChange` listener in your RootLayout will now take over
      // and handle the rest of the logic (checking WatermelonDB, navigation, etc.).
      console.log(
        "✅ Successfully signed in with Supabase:",
        data.user?.email
      );
    } catch (error: any) {
      if (error.code === "SIGN_IN_CANCELLED") {
        // This is a normal event, not an error.
        console.log(
          "User cancelled the Google Sign-In flow."
        );
      } else {
        // For all other errors, show an alert.
        console.error("Authentication error:", error);
        Alert.alert(
          "Sign-in Error",
          "Could not sign in with Google. Please try again."
        );
      }
    } finally {
      // Always ensure the loading state is turned off.
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-900 p-6">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="items-center mb-16">
        {/* You can add a logo here */}
        <Text className="text-5xl font-extrabold text-white">
          FitNext
        </Text>
        <Text className="text-lg text-gray-400 mt-3">
          Your ultimate fitness partner
        </Text>
      </View>

      <Pressable
        onPress={signInWithGoogle}
        disabled={isLoading}
        className={`w-full flex-row items-center justify-center p-4 rounded-xl transition-all duration-200
          ${isLoading ? "bg-gray-600" : "bg-white active:bg-gray-200"}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#1F2937" />
        ) : (
          <>
            <FontAwesome5
              name="google"
              size={20}
              color="#1F2937"
            />
            <Text className="text-gray-900 text-lg font-bold ml-4">
              Sign in with Google
            </Text>
          </>
        )}
      </Pressable>

      <Text className="text-gray-600 text-xs text-center mt-8 px-4">
        By continuing, you agree to our Terms of Service and
        Privacy Policy.
      </Text>
    </View>
  );
}
