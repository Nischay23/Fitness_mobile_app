import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and/or Anon Key are missing. Please check your .env file."
  );
}
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,

      // Automatically refresh the user's session token when it's about to expire.
      autoRefreshToken: true,

      // Persist the user's session across app restarts.
      persistSession: true,

      // This is a specific setting for React Native that tells Supabase not to
      // look for session information in the URL, which is a web-only feature.
      detectSessionInUrl: false,
    },
  }
);
