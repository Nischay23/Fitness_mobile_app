// src/modules/onboarding/store/index.ts

import { create } from "zustand";
import { OnboardingState } from "../types";

interface OnboardingActions {
  // A single, flexible function to update our clipboard
  setData: (data: Partial<OnboardingState>) => void;
  // A function to reset the clipboard if the user goes back
  reset: () => void;
}

// Define the initial empty state
const initialState: OnboardingState = {
  gender: null,
  age: null,
  heightCm: null,
  currentWeightKg: null,
  targetWeightKg: null,
  activityLevel: null,
  goalType: null,
};

// Create the store
export const useOnboardingStore = create<
  OnboardingState & OnboardingActions
>((set) => ({
  ...initialState,
  setData: (data) =>
    set((state) => ({ ...state, ...data })),
  reset: () => set(initialState),
}));
