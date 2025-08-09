import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Q } from "@nozbe/watermelondb";
import { COLORS } from "@/constants/theme";
import { database } from "@/db";
import {
  getAllTableNames,
  clearTable,
  nukeDatabase,
} from "../../db/actions/debugActions";

// Helper component to render each item in a readable format
const RecordItem = ({ recordData }: { recordData: any }) => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  
  return (
    <View className={`mb-3 p-3 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border`}>
      <Text className={`text-xs font-mono leading-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {JSON.stringify(recordData, null, 2)}
      </Text>
    </View>
  );
};

export default function DatabaseDebugScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const isDark = colorScheme === "dark";
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get table names
  const tableNames = useMemo(() => {
    return getAllTableNames();
  }, []);

  const fetchTableData = useCallback(async (tableName: string) => {
    setIsLoading(true);
    setSelectedTable(tableName);
    
    try {
      const collection = database.collections.get(tableName);
      const allRecords = await collection.query().fetch();
      
      // Convert WatermelonDB records to plain objects for display
      const plainRecords = allRecords.map((record: any) => {
        const plainObj: any = {};
        
        // Get all the record's properties
        for (const key in record._raw) {
          plainObj[key] = record._raw[key];
        }
        
        return plainObj;
      });
      
      setRecords(plainRecords);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      Alert.alert("Error", `Failed to fetch data from ${tableName}`);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClearTable = useCallback(async (tableName: string) => {
    Alert.alert(
      "Clear Table",
      `Are you sure you want to clear all data from "${tableName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearTable(tableName);
              Alert.alert("Success", `Cleared table: ${tableName}`);
              // Refresh the table data
              await fetchTableData(tableName);
            } catch (error) {
              Alert.alert("Error", `Failed to clear table: ${tableName}`);
            }
          },
        },
      ]
    );
  }, [fetchTableData]);

  const handleNukeDatabase = useCallback(async () => {
    Alert.alert(
      "⚠️ Nuclear Option",
      "This will DELETE ALL DATA in the database. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "NUKE IT",
          style: "destructive",
          onPress: async () => {
            try {
              await nukeDatabase();
              Alert.alert("💥 Database Nuked", "All data has been deleted.");
              setRecords([]);
              setSelectedTable(null);
            } catch (error) {
              Alert.alert("Error", "Failed to nuke database");
            }
          },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 items-center justify-center rounded-full mr-3"
            >
              <Ionicons 
                name="arrow-back" 
                size={20} 
                color={isDark ? '#D1D5DB' : '#6B7280'} 
              />
            </TouchableOpacity>
            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Database Debug
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleNukeDatabase}
            className="px-3 py-1.5 bg-red-500 rounded-lg"
          >
            <Text className="text-white text-sm font-semibold">💥 NUKE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Left Sidebar - Table List */}
        <View className={`w-1/3 ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <View className="p-4 border-b border-gray-700">
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tables ({tableNames.length})
            </Text>
          </View>
          <ScrollView className="flex-1">
            {tableNames.map((tableName) => (
              <TouchableOpacity
                key={tableName}
                onPress={() => fetchTableData(tableName)}
                className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
                  selectedTable === tableName 
                    ? (isDark ? 'bg-gray-700' : 'bg-gray-100') 
                    : ''
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`text-sm ${
                    selectedTable === tableName 
                      ? (isDark ? 'text-teal-400' : 'text-teal-600') 
                      : (isDark ? 'text-gray-300' : 'text-gray-700')
                  }`}>
                    {tableName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleClearTable(tableName)}
                    className="p-1"
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={14} 
                      color="#EF4444" 
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Content - Table Data */}
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#00D4AA" />
              <Text className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading {selectedTable}...
              </Text>
            </View>
          ) : selectedTable ? (
            <View className="flex-1">
              {/* Table Header */}
              <View className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <View className="flex-row items-center justify-between">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTable} ({records.length} records)
                  </Text>
                  <TouchableOpacity
                    onPress={() => fetchTableData(selectedTable)}
                    className="p-2"
                  >
                    <Ionicons 
                      name="refresh" 
                      size={16} 
                      color={isDark ? '#9CA3AF' : '#6B7280'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Table Content */}
              {records.length > 0 ? (
                <FlatList
                  data={records}
                  keyExtractor={(item, index) => `${selectedTable}-${index}`}
                  renderItem={({ item }) => <RecordItem recordData={item} />}
                  className="flex-1 p-4"
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons 
                    name="server-outline" 
                    size={64} 
                    color={isDark ? '#6B7280' : '#9CA3AF'} 
                    className="mb-4"
                  />
                  <Text className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    No Records Found
                  </Text>
                  <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This table is empty
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons 
                name="albums-outline" 
                size={64} 
                color={isDark ? '#6B7280' : '#9CA3AF'} 
                className="mb-4"
              />
              <Text className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Select a Table
              </Text>
              <Text className={`text-sm mt-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose a table from the left to view its data
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
