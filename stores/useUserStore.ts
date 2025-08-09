import { create } from "zustand";
import { User } from "@/db/models/User";

// We can define interfaces for the data slices we want
interface UserProfile {
  name?: string;
  age?: number | null;
  heightCm?: number;
  currentWeightKg?: number;
  gender?: string;
  activityLevel?: string;
  goalType?: string;
  // ... add other profile fields as needed
}

interface UserGoals {
  dailyCalorieGoal?: number;
  proteinGoal_g?: number;
  carbsGoal_g?: number;
  fatGoal_g?: number;
  fiberGoal_g?: number;
  tdee?: number;
}

interface UserState {
  profile: UserProfile | null;
  goals: UserGoals | null;
  setUserData: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  goals: null,
  setUserData: (user) => {
    set({
      profile: {
        name: user.name,
        age: user.age,
        heightCm: user.heightCm,
        currentWeightKg: user.currentWeightKg,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goalType: user.goalType,
      },
      goals: {
        dailyCalorieGoal: user.dailyCalorieGoal,
        proteinGoal_g: user.proteinGoal_g,
        carbsGoal_g: user.carbsGoal_g,
        fatGoal_g: user.fatGoal_g,
        fiberGoal_g: user.fiberGoal_g,
        tdee: user.tdee,
      },
    });
  },
}));

// Now, in your app's startup logic (`_layout.tsx`), you would call both stores:
// const { setCurrentUser } = useAppStore();
// const { setUserData } = useUserStore();
//
// const user = await getActiveUser();
// setCurrentUser(user); // for session
// if (user) {
//   setUserData(user); // to populate profile/goal UI
// }
