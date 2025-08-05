import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { myAppSchema } from "./schemas/index";
import { migrations } from "./migrations";

import { User } from "./models/User";
import { Food } from "./models/Food";
import { DiaryEntry } from "./models/DiaryEntry";
import { WeightEntry } from "./models/WeightEntry";

const adapter = new SQLiteAdapter({
  schema: myAppSchema,

  jsi: true,
  migrations,
  dbName: "myfitnessapp.db",
  onSetUpError: (error) => {
    console.error("WatermelonDB setup failed:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [User, Food, DiaryEntry, WeightEntry],
});
