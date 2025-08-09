import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import Post from "@/components/Post";
import { useAppStore } from "@/stores/appStore";
import { COLORS } from "@/constants/theme";

export default function FeedsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAppStore();

  // Animation and scroll detection
  const headerTranslateY = useRef(
    new Animated.Value(0)
  ).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef("");
  const headerHeight = 80 + insets.top;

  const fetchPosts = useCallback(
    async (isRefreshing = false) => {
      if (!isRefreshing) {
        setIsLoading(true);
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setPosts([]);
          throw new Error("User not found");
        }

        const { data, error } = await supabase.rpc(
          "get_feed",
          {
            user_id_to_check: user.id,
          }
        );

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts();

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts, currentUser]);

  // Handle scroll with direction detection
  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const currentScrollY =
      event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    // Only trigger animation after scrolling at least 5 pixels
    if (Math.abs(diff) > 5) {
      if (diff > 0 && currentScrollY > 50) {
        // Scrolling down - hide header
        if (scrollDirection.current !== "down") {
          scrollDirection.current = "down";
          Animated.timing(headerTranslateY, {
            toValue: -headerHeight,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      } else if (diff < 0) {
        // Scrolling up - show header
        if (scrollDirection.current !== "up") {
          scrollDirection.current = "up";
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      }
    }

    lastScrollY.current = currentScrollY;
  };

  // Animated Header Component
  const AnimatedHeader = () => (
    <Animated.View
      style={[
        styles.animatedHeader,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          height: headerHeight,
          paddingTop: insets.top,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
    >
      <View style={styles.headerContent}>
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
    </Animated.View>
  );

  // Show loading indicator on first load
  if (isLoading && posts.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <StatusBar
          barStyle={
            colorScheme === "dark"
              ? "light-content"
              : "dark-content"
          }
          backgroundColor="transparent"
          translucent={true}
        />
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
        backgroundColor="transparent"
        translucent={true}
      />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Animated Header */}
      <AnimatedHeader />

      {/* FlatList with scroll detection */}
      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item.id}
        onRefresh={fetchPosts}
        refreshing={isLoading}
        contentContainerStyle={[
          styles.listContent,
          {
            backgroundColor: colors.background,
            paddingTop: headerHeight, // Space for fixed header
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
}

// Updated StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 100,
  },
});
