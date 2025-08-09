import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FITNESS_COLORS } from "@/constants/theme";

// Mock articles data with enhanced properties
const articles = [
  {
    id: "1",
    title: "10 Minute HIIT Workout for Beginners",
    excerpt:
      "Get your heart pumping with this quick and effective workout routine that burns calories and builds endurance...",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    category: "Workout",
    readTime: "5 min read",
    author: "Sarah Johnson",
    likes: 247,
    isBookmarked: false,
    difficulty: "Beginner",
  },
  {
    id: "2",
    title: "Healthy Meal Prep Ideas for Busy People",
    excerpt:
      "Save time and eat better with these simple meal prep strategies that fit your hectic schedule...",
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    category: "Nutrition",
    readTime: "7 min read",
    author: "Mike Chen",
    likes: 189,
    isBookmarked: true,
    difficulty: "Easy",
  },
  {
    id: "3",
    title: "The Science of Sleep and Recovery",
    excerpt:
      "Understanding how proper rest enhances your fitness journey and maximizes your training results...",
    imageUrl:
      "https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400",
    category: "Recovery",
    readTime: "6 min read",
    author: "Dr. Lisa Park",
    likes: 312,
    isBookmarked: false,
    difficulty: "Intermediate",
  },
  {
    id: "4",
    title: "Building Strength: Progressive Overload Guide",
    excerpt:
      "Learn the fundamental principle for continuous muscle growth and strength development...",
    imageUrl:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400",
    category: "Training",
    readTime: "8 min read",
    author: "Tom Wilson",
    likes: 156,
    isBookmarked: true,
    difficulty: "Advanced",
  },
];

const categories = [
  {
    name: "All",
    gradient: ["#00FF87", "#00E5FF"] as const,
  },
  {
    name: "Workout",
    gradient: ["#E91E63", "#9C27B0"] as const,
  },
  {
    name: "Nutrition",
    gradient: ["#FF9800", "#FFB300"] as const,
  },
  {
    name: "Recovery",
    gradient: ["#9C27B0", "#673AB7"] as const,
  },
  {
    name: "Training",
    gradient: ["#FF6D00", "#FF3D00"] as const,
  },
];

const getCategoryGradient = (
  category: string
): readonly [string, string, ...string[]] => {
  const cat = categories.find((c) => c.name === category);
  return cat
    ? cat.gradient
    : (["#00FF87", "#00E5FF"] as const);
};

const getDifficultyColor = (
  difficulty: string,
  isDark: boolean
) => {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return isDark ? "#FFB300" : "#FF9800";
    case "easy":
      return isDark ? "#4CAF50" : "#388E3C";
    case "intermediate":
      return isDark ? "#03A9F4" : "#1976D2";
    case "advanced":
      return isDark ? "#E91E63" : "#C2185B";
    default:
      return isDark ? "#9CA3AF" : "#6B7280";
  }
};

export default function BlogsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const isDark = colorScheme === "dark";

  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [bookmarkedItems, setBookmarkedItems] = useState(
    new Set(
      articles
        .filter((a) => a.isBookmarked)
        .map((a) => a.id)
    )
  );

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter(
          (article) => article.category === selectedCategory
        );

  const toggleBookmark = (id: string) => {
    setBookmarkedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderArticleCard = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() => router.push(`/blogs/${item.id}`)}
      className="mb-6 mx-1"
      activeOpacity={0.9}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          overflow: "hidden",
          shadowColor: isDark ? "#000" : "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Image with Overlay */}
        <View className="relative">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-56"
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              "rgba(0,0,0,0)",
              "rgba(0,0,0,0.3)",
              "rgba(0,0,0,0.7)",
            ]}
            className="absolute inset-0"
          />

          {/* Category Badge */}
          <View className="absolute top-4 left-4">
            <LinearGradient
              colors={getCategoryGradient(item.category)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 9999,
              }}
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wide">
                {item.category}
              </Text>
            </LinearGradient>
          </View>

          {/* Bookmark Button */}
          <TouchableOpacity
            onPress={() => toggleBookmark(item.id)}
            className="absolute top-4 right-4"
            activeOpacity={0.8}
          >
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 8,
                borderRadius: 20,
                backdropFilter: "blur(10px)",
              }}
            >
              <Ionicons
                name={
                  bookmarkedItems.has(item.id)
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={18}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {/* Difficulty Badge */}
          <View className="absolute bottom-4 right-4">
            <View
              style={{
                backgroundColor: getDifficultyColor(
                  item.difficulty,
                  isDark
                ),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text className="text-white text-xs font-semibold">
                {item.difficulty}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-5">
          <Text
            style={{ color: colors.text.primary }}
            className="text-xl font-bold mb-2 leading-6"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text
            style={{ color: colors.text.secondary }}
            className="text-sm leading-5 mb-4"
            numberOfLines={2}
          >
            {item.excerpt}
          </Text>

          {/* Meta Info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <Text className="text-white text-xs font-bold">
                  {item.author.charAt(0)}
                </Text>
              </LinearGradient>
              <View className="ml-3 flex-1">
                <Text
                  style={{ color: colors.text.primary }}
                  className="text-sm font-semibold"
                >
                  {item.author}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={colors.text.muted}
                  />
                  <Text
                    style={{ color: colors.text.muted }}
                    className="text-xs ml-1"
                  >
                    {item.readTime}
                  </Text>
                </View>
              </View>
            </View>

            {/* Likes */}
            <View className="flex-row items-center">
              <Ionicons
                name="heart-outline"
                size={16}
                color={colors.text.muted}
              />
              <Text
                style={{ color: colors.text.muted }}
                className="text-xs ml-1 font-medium"
              >
                {item.likes}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with Gradient */}
      <LinearGradient
        colors={colors.gradients.header}
        className=" pb-6"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center justify-between px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.text.primary}
              />
            </TouchableOpacity>

            <View className="items-center">
              <Text
                style={{ color: colors.text.primary }}
                className="text-2xl font-bold"
              >
                Fitness Hub
              </Text>
              <Text
                style={{ color: colors.text.secondary }}
                className="text-sm"
              >
                Expert articles & tips
              </Text>
            </View>

            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="search"
                size={22}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Category Filter */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }}
        className="px-4 py-4"
      >
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.name)}
              className="mr-3"
              activeOpacity={0.8}
            >
              {selectedCategory === item.name ? (
                <LinearGradient
                  colors={item.gradient}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 9999,
                  }}
                >
                  <Text className="text-white font-bold">
                    {item.name}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  className="px-6 py-3 rounded-full border"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{ color: colors.text.secondary }}
                    className="font-semibold"
                  >
                    {item.name}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Articles List */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticleCard}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View className="h-2" />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <LinearGradient
              colors={[
                colors.primary + "20",
                colors.secondary + "20",
              ]}
              className="w-20 h-20 rounded-full items-center justify-center mb-6"
            >
              <Ionicons
                name="newspaper-outline"
                size={40}
                color={colors.primary}
              />
            </LinearGradient>
            <Text
              style={{ color: colors.text.primary }}
              className="text-xl font-bold mb-2"
            >
              No Articles Found
            </Text>
            <Text
              style={{ color: colors.text.secondary }}
              className="text-center text-base px-8"
            >
              Try selecting a different category to discover
              more fitness content
            </Text>

            <TouchableOpacity
              onPress={() => setSelectedCategory("All")}
              className="mt-6"
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                className="px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">
                  Show All Articles
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
