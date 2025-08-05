import { Model } from "@nozbe/watermelondb";
import { children } from "@nozbe/watermelondb/decorators";
import { DiaryEntry } from "./DiaryEntry";
import {
  date,
  readonly,
  text,
  field,
  action,
} from "@nozbe/watermelondb/decorators";
import { WeightEntry } from "./WeightEntry";

// The 'User' class extends WatermelonDB's Model.
// This gives it all the database powers like .update(), .destroy(), etc.

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";
export type GoalType = "lose" | "maintain" | "gain";
export type Gender = "male" | "female" | "other";

// This is our new single source of truth for the user profile shape
export interface UserProfileData {
  server_id: string;
  email?: string;
  name: string;
  avatar_url?: string;
  gender: Gender;
  dateOfBirth: string;
  heightCm: number;
  currentWeightKg: number;
  goalType: GoalType;
  activityLevel: ActivityLevel;
  targetWeightKg: number;
  goalRateKgPerWeek?: number;
}
export class User extends Model {
  // This static property tells WatermelonDB that this model is connected
  // to the 'users' table in the schema. This is how they link up.
  static table = "users";

  // --- Field Decorators ---
  // The @text decorator links a string property to a database column.
  @text("server_id") serverId!: string;
  @text("email") email!: string;
  @text("avatar_url") avatarUrl?: string;
  @text("name") name!: string;
  @text("date_of_birth") dateOfBirth!: string;
  @text("gender") gender!: string;
  @field("height_cm") heightCm!: number;
  @field("current_weight_kg") currentWeightKg!: number;
  @field("goal_weight_kg") goalWeightKg!: number;

  @text("activity_level") activityLevel!: ActivityLevel;
  @text("goal_type") goalType!: GoalType;
  @field("goal_rate_kg_per_week")
  goalRateKgPerWeek?: number;

  @field("tdee") tdee?: number;
  @field("daily_calorie_goal") dailyCalorieGoal?: number;
  @field("protein_goal_g") proteinGoal_g?: number;
  @field("carbs_goal_g") carbsGoal_g?: number;
  @field("fat_goal_g") fatGoal_g?: number;
  @field("fiber_goal_g") fiberGoal_g?: number;

  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @children("diary_entries") diaryEntries!: DiaryEntry[];
  @children("weight_entries") weightEntries!: WeightEntry[];

  // --- Computed Properties (Getters) ---
  // These are not stored in the database. They are calculated live whenever you access them.
  // This is perfect for things like age.
  get age(): number | null {
    if (!this.dateOfBirth) {
      return null;
    }
    // Simple age calculation logic
    const birthDate = new Date(this.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference =
      today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
