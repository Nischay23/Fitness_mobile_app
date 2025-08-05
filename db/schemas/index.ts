// db/schemas/index.ts

import { appSchema } from "@nozbe/watermelondb/Schema";
import { userSchema } from "./userSchema";
import { foodSchema } from "./foodSchema";
import { diaryEntrySchema } from "./diaryEntrySchema";
import { weightEntrySchema } from "./weightEntrySchema";

// This is the master schema for our entire application.
export const myAppSchema = appSchema({
  version: 8,

  // This is the list of all tables in our database. For now, it's just one.
  tables: [
    userSchema,
    foodSchema,
    diaryEntrySchema,
    weightEntrySchema,
  ],
});
