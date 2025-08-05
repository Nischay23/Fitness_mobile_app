import React, { useState, useMemo, Suspense } from "react";
import {
  View,
  Text,
  FlatList,
  useColorScheme,
  Pressable,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

// Importing articles outside component to avoid re-importing
const articles: Article[] = require("@/lib/dummy-data/articles.json");

// Import components
import { FeaturedArticleCard } from "@/modules/blogs/components/FeaturedArticleCard";
import { SmallArticleCard } from "@/modules/blogs/components/SmallArticleCard";
import { Article } from "@/modules/blogs/types";

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  const isDark = useColorScheme() === "dark";

  return (
    <View className="px-6 mb-6">
      <Text
        className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className={`text-base mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default function BlogsScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  // Add status bar styles
  React.useEffect(() => {
    StatusBar.setBarStyle(
      isDark ? "light-content" : "dark-content"
    );
  }, [isDark]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const featuredArticle = articles[0];
  const quickReads = articles.slice(1);

  const categories = [
    "All",
    "Recovery",
    "Strength",
    "Hydration",
    "Mindset",
    "Supplement",
    "Cardio",
    "Nutrition",
    "Flexibility",
    "Home Workout",
    "Wellness",
    "Mindfulness",
    "Injury Prevention",
    "Mental Health",
    "Equipment",
    "Diet",
  ];

  const handleArticlePress = (articleId: string) => {
    router.push({
      pathname: "/blogs/[id]",
      params: { id: articleId },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter(
          (article) => article.category === selectedCategory
        );

  return (
    <View
      className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#ffffff"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,

          paddingTop: 80,
        }}
      >
        <View className="px-6 pt-4 pb-6">
          <Text
            className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Health & Fitness
          </Text>
          <Text
            className={`text-lg mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Expert tips, workout guides, and wellness
            insights
          </Text>

          {/* Stats Row */}
          <View className="flex-row items-center mt-6 space-x-8">
            <View className="items-center">
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {articles.length}
              </Text>
              <Text
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Articles
              </Text>
            </View>
            <View className="items-center">
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {categories.length - 1}
              </Text>
              <Text
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Categories
              </Text>
            </View>
            <View className="items-center">
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {articles.reduce(
                  (sum, article) => sum + article.readTime,
                  0
                )}
              </Text>
              <Text
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Min Read
              </Text>
            </View>
          </View>
        </View>

        {/* Featured Article */}
        {featuredArticle && (
          <View className="px-6 mb-6">
            <SectionHeader
              title="Featured Article"
              subtitle="Editor's pick for this week"
            />
            <Suspense
              fallback={
                <View
                  style={{
                    height: 320,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" />
                </View>
              }
            >
              <FeaturedArticleCard
                article={featuredArticle}
                onPress={() =>
                  handleArticlePress(featuredArticle.id)
                }
              />
            </Suspense>
          </View>
        )}

        {/* Categories Filter */}
        <View className="mb-6">
          <SectionHeader
            title="Categories"
            subtitle="Filter by topic"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
            }}
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() =>
                  handleCategoryPress(category)
                }
                className={`px-6 py-3 rounded-full mr-4 ${
                  selectedCategory === category
                    ? isDark
                      ? "bg-green-600"
                      : "bg-green-500"
                    : isDark
                      ? "bg-gray-900"
                      : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedCategory === category
                      ? "text-white"
                      : isDark
                        ? "text-gray-300"
                        : "text-gray-700"
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Latest Articles */}
        <View className="mb-6">
          <SectionHeader
            title="Latest Articles"
            subtitle="Fresh content from our experts"
          />
          {quickReads.length > 0 ? (
            <FlatList
              data={quickReads}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <SmallArticleCard
                  article={item}
                  onPress={() =>
                    handleArticlePress(item.id)
                  }
                />
              )}
              contentContainerStyle={{
                paddingHorizontal: 24,
              }}
            />
          ) : (
            <Text
              className={`px-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              No quick reads available.
            </Text>
          )}
        </View>

        {/* All Articles Grid */}
        <View className="px-6">
          <SectionHeader
            title="All Articles"
            subtitle={`Showing ${filteredArticles.length} articles`}
          />

          {filteredArticles.map((article, index) => (
            <Pressable
              key={article.id}
              onPress={() => handleArticlePress(article.id)}
              className="flex-row p-4 rounded-2xl active:opacity-80 mb-4"
              style={{
                backgroundColor: isDark
                  ? "#3C3C3C"
                  : "#F9FAFB",
              }}
            >
              <Image
                source={{ uri: article.imageUrl }}
                className={`w-20 h-20 rounded-xl mr-4`}
                resizeMode="cover"
              />

              <View className="flex-1">
                <Text
                  className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    index % 2 === 0
                      ? "text-green-500"
                      : "text-blue-500"
                  }`}
                >
                  {article.category}
                </Text>
                <Text
                  className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                  numberOfLines={2}
                >
                  {article.title}
                </Text>
                <View className="flex-row items-center">
                  <Feather
                    name="clock"
                    size={14}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text
                    className={`text-sm ml-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {article.readTime} min read
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View
        className="absolute top-0 left-0 right-0"
        style={{
          paddingTop: insets.top, // Use the inset value to avoid the status bar
          // Optional: Add a background for a semi-transparent effect when scrolling
          // backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'
        }}
      >
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable
            onPress={handleBackPress}
            className="flex-row items-center p-2 rounded-lg"
          >
            <Feather
              name="arrow-left"
              size={24}
              color={isDark ? "#ffffff" : "#1f2937"}
            />
            <Text
              className={`ml-1 font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Back
            </Text>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Pressable
              className={`p-3 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <Feather
                name="search"
                size={20}
                color={isDark ? "#ffffff" : "#1f2937"}
              />
            </Pressable>
            <Pressable
              className={`p-3 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
            >
              <Feather
                name="bookmark"
                size={20}
                color={isDark ? "#ffffff" : "#1f2937"}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
