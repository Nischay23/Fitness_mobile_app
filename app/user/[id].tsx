import React from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();

  // In the future, you will fetch the user from WatermelonDB here
  // For now, we just display the ID.

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <Stack.Screen options={{ title: `User Profile` }} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 24 }}>
          User Profile
        </Text>
        <Text style={{ color: "gray", marginTop: 8 }}>
          User ID: {id}
        </Text>
      </View>
    </SafeAreaView>
  );
}
