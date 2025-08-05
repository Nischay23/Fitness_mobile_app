import {
  addColumns,
  schemaMigrations,
} from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 8,
      steps: [
        addColumns({
          table: "users",
          columns: [
            {
              name: "avatar_url",
              type: "string",
              isOptional: true,
            },
          ],
        }),
      ],
    },
    {
      toVersion: 7,
      steps: [
        addColumns({
          table: "users",
          columns: [
            { name: "goal_weight_kg", type: "number" },
          ],
        }),
      ],
    },
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: "users",
          columns: [
            {
              name: "server_id",
              type: "string",
              isIndexed: true,
            },
            {
              name: "email",
              type: "string",
              isOptional: true,
            },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: "foods",
          columns: [
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),

        addColumns({
          table: "diary_entries",
          columns: [
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),

        addColumns({
          table: "weight_entries",
          columns: [
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
      ],
    },
  ],
});
