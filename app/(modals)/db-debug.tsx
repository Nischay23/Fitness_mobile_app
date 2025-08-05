// app/debug/db-debug.tsx

import React, {
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Q } from "@nozbe/watermelondb";

// --- NEW: Direct DB import and our debug actions ---
import { database } from "@/db";
import {
  getAllTableNames,
  clearTable,
  nukeDatabase,
} from "../../db/actions/debugActions";
import { ActivityIndicator } from "react-native";

// Helper component to render each item in a readable format
const RecordItem = ({
  recordData,
}: {
  recordData: any;
}) => (
  <View className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <Text className="text-sm font-mono text-gray-800 dark:text-gray-200">
      {JSON.stringify(recordData, null, 2)}
    </Text>
  </View>
);

export default function DatabaseDebugScreen() {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<
    string | null
  >(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get table names directly from our debug action
  const tableNames = useMemo(() => getAllTableNames(), []);

  const fetchRecords = useCallback(
    async (tableName: string) => {
      setIsLoading(true);
      setSelectedTable(tableName);
      try {
        const collection =
          database.collections.get(tableName);
        const allRecords = await collection
          .query(Q.sortBy("updated_at", Q.desc))
          .fetch();
        const serializedRecords = allRecords.map(
          (record) => record._raw
        );
        setRecords(serializedRecords);
      } catch (error) {
        console.error(
          `Error fetching records for table ${tableName}:`,
          error
        );
        setRecords([
          {
            error: `Could not fetch records for ${tableName}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleClearTable = () => {
    if (!selectedTable) return;
    Alert.alert(
      "Confirm Clear Table",
      `Are you sure you want to delete all records from the '${selectedTable}' table?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Clear It",
          style: "destructive",
          onPress: async () => {
            await clearTable(selectedTable);
            fetchRecords(selectedTable); // Refresh the list after clearing
          },
        },
      ]
    );
  };

  const handleNukeDatabase = () => {
    Alert.alert(
      "Confirm NUKE Database",
      "This will delete ALL data and cannot be undone. The app will likely need a restart.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "NUKE IT",
          style: "destructive",
          onPress: async () => {
            await nukeDatabase();
            Alert.alert(
              "Success",
              "Database has been reset.",
              [{ text: "OK", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ title: "DB Inspector" }} />
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            DB Inspector
          </Text>
          <Pressable
            onPress={handleNukeDatabase}
            className="bg-red-600 p-2 rounded-lg"
          >
            <Text className="text-white font-bold text-xs">
              NUKE DB
            </Text>
          </Pressable>
        </View>

        {/* Table Selector */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tables
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {tableNames.map((name: string) => (
              <Pressable
                key={name}
                onPress={() => fetchRecords(name)}
                className={`py-2 px-4 mr-2 rounded-full border-2 ${
                  selectedTable === name
                    ? "bg-blue-500 border-blue-500"
                    : "bg-gray-200 dark:bg-gray-700 border-transparent"
                }`}
              >
                <Text
                  className={`font-semibold ${selectedTable === name ? "text-white" : "text-gray-700 dark:text-gray-200"}`}
                >
                  {name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Records Display */}
        <View className="flex-1 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {isLoading ? (
            <ActivityIndicator size="large" />
          ) : records.length > 0 && selectedTable ? (
            <FlatList
              data={records}
              keyExtractor={(item, index) =>
                item.id || `record-${index}`
              }
              renderItem={({ item }) => (
                <RecordItem recordData={item} />
              )}
              ListHeaderComponent={
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Records in{" "}
                    <Text className="font-bold">
                      {selectedTable}
                    </Text>{" "}
                    ({records.length})
                  </Text>
                  <Pressable
                    onPress={handleClearTable}
                    className="bg-yellow-600 p-2 rounded-lg"
                  >
                    <Text className="text-white font-bold text-xs">
                      Clear Table
                    </Text>
                  </Pressable>
                </View>
              }
            />
          ) : (
            <Text className="text-center text-gray-500 dark:text-gray-400 mt-8">
              {selectedTable
                ? `No records found in '${selectedTable}'.`
                : "Select a table to view its records."}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
