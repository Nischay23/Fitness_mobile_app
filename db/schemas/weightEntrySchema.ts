// db/schemas/weightEntrySchema.ts
import { tableSchema } from "@nozbe/watermelondb/Schema";

export const weightEntrySchema = tableSchema({
  name: "weight_entries",
  columns: [
    { name: "weight_kg", type: "number" },
    { name: "date", type: "string", isIndexed: true }, // YYYY-MM-DD
    { name: "notes", type: "string", isOptional: true },
    { name: "user_id", type: "string", isIndexed: true },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});
