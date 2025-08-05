import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/stores/appStore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";

export const signout = async () => {
  try {
    //sign out from supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(
        "Error signing out from supabase ",
        error
      );
    } else {
      console.log("User successfully signed out");
    }

    //sign out from google
    try {
      await GoogleSignin.signOut();
      console.log(
        "User successfully signed out from Google"
      );
    } catch (googleError) {
      console.error(
        "Error signing out from Google:",
        googleError
      );
    }

    useAppStore.getState().logout();
    router.replace("/login" as any);
  } catch (e) {
    console.error(
      "A critical error occurred during sign out:",
      e
    );
    useAppStore.getState().logout();
    router.replace("/login" as any);
  }
};
