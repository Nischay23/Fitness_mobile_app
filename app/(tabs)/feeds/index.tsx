import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  StatusBar,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import Post from "@/components/Post";
import { useAppStore } from "@/stores/appStore";
import { COLORS } from "@/constants/theme";

export default function FeedsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAppStore();

  // Function to fetch posts from Supabase
  const fetchPosts = useCallback(
    async (isRefreshing = false) => {
      if (!isRefreshing) {
        setIsLoading(true);
      }

      try {
        // First, get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setPosts([]); // Clear posts if no user is logged in
          throw new Error("User not found");
        }

        // Now, call the function with the user's ID
        const { data, error } = await supabase.rpc(
          "get_feed",
          {
            user_id_to_check: user.id,
          }
        );

        if (error) throw error;

        setPosts(data || []);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // 1. Initial fetch when the component loads
    fetchPosts();

    // 2. Set up a real-time listener for any changes in the 'posts' table
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          console.log(
            "Real-time change received!",
            payload
          );

          fetchPosts();
        }
      )
      .subscribe();

    // 3. Clean up the listener when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts, currentUser]);

  // Show a loading indicator only on the very first load
  if (isLoading && posts.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle={
          colorScheme === "dark"
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={colors.background}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Custom Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text.primary },
            ]}
          >
            Feed
          </Text>
          <Pressable onPress={() => router.push("/create")}>
            <Ionicons
              name="add-circle-outline"
              size={32}
              color={colors.text.primary}
            />
          </Pressable>
        </View>

        {/* List of Posts */}
        <FlatList
          data={posts}
          renderItem={({ item }) => <Post post={item} />}
          keyExtractor={(item) => item.id}
          onRefresh={fetchPosts}
          refreshing={isLoading}
          contentContainerStyle={[
            styles.listContent,
            { backgroundColor: colors.background },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

// Using StyleSheet for clarity
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
});
