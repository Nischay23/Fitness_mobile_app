import { database } from "../index"; // Import your initialized database instance
import { myAppSchema } from "../schemas"; // Import your master app schema

/**
 * Fetches the names of all tables currently defined in your app's schema.
 * This is synchronous because it just reads the schema object.
 * @returns {string[]} An array of table names (e.g., ['users', 'foods', 'diary_entries']).
 */
export const getAllTableNames = (): string[] => {
  // The schema object has a 'tables' property which is a map. We get its keys.
  return Object.keys(myAppSchema.tables);
};

/**
 * Fetches all records from a specified table. This is an asynchronous database query.
 * @param {string} tableName - The name of the table to query (e.g., 'users').
 * @returns {Promise<any[]>} A promise that resolves to an array of all record objects.
 */
export const getAllRecords = async (
  tableName: string
): Promise<any[]> => {
  try {
    const collection = database.collections.get(tableName);
    const records = await collection.query().fetch();
    return records;
  } catch (error) {
    console.error(
      `Failed to fetch records for table '${tableName}':`,
      error
    );
    return []; // Return an empty array on error
  }
};

/**
 * Deletes all records from a specified table within a single database transaction.
 * @param {string} tableName - The name of the table to clear.
 */
export const clearTable = async (
  tableName: string
): Promise<void> => {
  // All database writes must be wrapped in a `database.write()` block.
  await database.write(async () => {
    try {
      const collection =
        database.collections.get(tableName);
      const recordsToDelete = await collection
        .query()
        .fetch();

      // We use `prepareDestroyPermanently` for each record and then batch them.
      // This is much more performant than deleting one by one.
      const deletions = recordsToDelete.map((record) =>
        record.prepareDestroyPermanently()
      );
      await database.batch(...deletions);

      console.log(
        `✅ Table '${tableName}' has been successfully cleared.`
      );
    } catch (error) {
      console.error(
        `Failed to clear table '${tableName}':`,
        error
      );
    }
  });
};

export const nukeDatabase = async (): Promise<void> => {
  await database.write(async () => {
    // This is a built-in WatermelonDB function for development.
    await database.unsafeResetDatabase();
    console.log("💥 Database has been successfully nuked.");
  });
};
