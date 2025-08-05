// db/schemas/foodSchema.ts
import { tableSchema } from "@nozbe/watermelondb/Schema";

export const foodSchema = tableSchema({
  name: "foods",
  columns: [
    { name: "name", type: "string" },
    { name: "brand", type: "string", isOptional: true },
    { name: "calories", type: "number" },
    { name: "protein_g", type: "number" },
    { name: "carbs_g", type: "number" },
    { name: "fat_g", type: "number" },
    { name: "fiber_g", type: "number" },
    // We can add more nutrients like sugar, etc., later
    { name: "serving_size", type: "number" },
    { name: "serving_unit", type: "string" },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});
