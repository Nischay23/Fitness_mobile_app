// db/schemas/diaryEntrySchema.ts
import { tableSchema } from "@nozbe/watermelondb/Schema";

export const diaryEntrySchema = tableSchema({
  name: "diary_entries",
  columns: [
    { name: "date", type: "string" }, // YYYY-MM-DD format
    { name: "meal_type", type: "string" }, // 'breakfast', 'lunch', etc.
    { name: "servings", type: "number" }, // e.g., 1.5 servings

    // --- These columns create the relationships ---
    // This links to the 'users' table. isIndexed makes queries faster.
    { name: "user_id", type: "string", isIndexed: true },
    // This links to the 'foods' table.
    { name: "food_id", type: "string", isIndexed: true },

    // Denormalized fields for quick display (from your reference)
    { name: "calories", type: "number" },
    { name: "protein_g", type: "number" },
    { name: "carbs_g", type: "number" },
    { name: "fat_g", type: "number" },
    { name: "fiber_g", type: "number" },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});
