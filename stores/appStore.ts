import { create } from "zustand";
import { User as WatermelonUser } from "@/db/models/User";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Define the shape of our state
interface AppState {
  currentUser: WatermelonUser | null;
  supabaseUser: SupabaseUser | null;
  supabaseProfile: any | null;
  setSupabaseProfile: (profile: any | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean; // To show a loading screen on app start
  onboardingComplete: boolean;
  selectedGoal: string | null; // Store the selected goal from onboarding
}

// Define the shape of our actions
interface AppActions {
  setCurrentUser: (user: WatermelonUser | null) => void;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  setOnboardingComplete: (isComplete: boolean) => void;
  setSelectedGoal: (goal: string) => void;
}

// Create the store (without persistence for now)
export const useAppStore = create<AppState & AppActions>(
  (set) => ({
    // Initial State
    onboardingComplete: false,
    currentUser: null,
    supabaseUser: null,
    supabaseProfile: null,
    setSupabaseProfile: (profile) =>
      set({ supabaseProfile: profile }),
    isAuthenticated: false,
    isLoading: true, // App starts in a loading state by default
    selectedGoal: null, // No goal selected initially

    // Actions
    setOnboardingComplete: (isComplete) => {
      set({ onboardingComplete: isComplete });
    },

    setSelectedGoal: (goal) => {
      set({ selectedGoal: goal });
    },

    setCurrentUser: (user) => {
      set({
        currentUser: user,
        isAuthenticated: !!user,
      });
    },

    setSupabaseUser: (user) => {
      set({ supabaseUser: user });
    },

    setLoading: (isLoading) => {
      set({ isLoading });
    },

    logout: () => {
      // In the future, this would also clear the database or just the user session
      set({
        currentUser: null,
        isAuthenticated: false,
        onboardingComplete: false,
        selectedGoal: null,
      });
    },
  })
);
