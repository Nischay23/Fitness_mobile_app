import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  useColorScheme,
  Pressable,
  StatusBar,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SimpleHtmlRenderer } from "@/modules/blogs/components/SimpleHTMLRenderer";
import articles from "@/lib/dummy-data/articles.json";
import { SmallArticleCard } from "@/modules/blogs/components/SmallArticleCard";
import { Article } from "@/modules/blogs/types";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const article = articles.find((art) => art.id === id);

  const otherArticles = articles.filter((art) => art.id !== id);

  if (!article) {
    return (
      <View
        className={`flex-1 justify-center items-center ${isDark ? "bg-black" : "bg-white"}`}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#000000" : "#ffffff"}
        />
        <Feather
          name="alert-circle"
          size={64}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
        <Text
          className={`text-xl font-bold mt-4 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Article not found
        </Text>
        <Text
          className={`text-base mt-2 text-center px-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          The article you're looking for doesn't exist or has been removed.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className={`mt-6 px-6 py-3 rounded-xl ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
        >
          <Text
            className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#ffffff"}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Hero Image with Overlay */}
        <View className="relative">
          <Image
            source={{ uri: article.imageUrl }}
            className="w-full h-96"
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
            className="absolute inset-0"
          />

          {/* Back Button */}
          <SafeAreaView
            edges={["top"]}
            className="absolute top-0 left-0 right-0"
          >
            <View className="flex-row items-center justify-between px-6 py-4">
              <Pressable
                onPress={() => router.back()}
                className="flex-row items-center bg-black/50 backdrop-blur-sm px-4 py-3 rounded-full"
              >
                <Feather name="arrow-left" size={20} color="white" />
                <Text className="text-white ml-2 font-semibold">Back</Text>
              </Pressable>

              <View className="flex-row space-x-3">
                <Pressable className="bg-black/50 backdrop-blur-sm p-3 rounded-full">
                  <Feather name="share" size={20} color="white" />
                </Pressable>
                <Pressable className="bg-black/50 backdrop-blur-sm p-3 rounded-full">
                  <Feather name="bookmark" size={20} color="white" />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>

          {/* Article Category & Title on Image */}
          <View className="absolute bottom-0 left-0 right-0 p-6">
            <Text className="text-sm font-bold uppercase text-white/80 tracking-widest mb-2">
              {article.category}
            </Text>
            <Text className="text-3xl font-bold text-white leading-tight">
              {article.title}
            </Text>
          </View>
        </View>

        {/* Article Meta Info */}
        <View
          className={`px-6 py-6 border-b ${isDark ? "border-gray-800 bg-black" : "border-gray-200 bg-white"}`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  isDark ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <Feather
                  name="user"
                  size={20}
                  color={isDark ? "#ffffff" : "#374151"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {article.author}
                </Text>
                <Text
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Health & Fitness Expert
                </Text>
              </View>
            </View>

            <View className="items-end">
              <View className="flex-row items-center">
                <Feather
                  name="clock"
                  size={16}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <Text
                  className={`text-sm ml-2 font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {article.readTime} min read
                </Text>
              </View>
              <Text
                className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Published today
              </Text>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View className={`px-6 py-8 ${isDark ? "bg-black" : "bg-white"}`}>
          {/* Article Summary/Headline */}
          {article.headline && (
            <View
              className={`p-6 rounded-2xl mb-8 ${
                isDark
                  ? "bg-gray-900 border border-gray-800"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <Feather
                name="info"
                size={20}
                color={isDark ? "#10B981" : "#059669"}
                style={{ marginBottom: 8 }}
              />
              <Text
                className={`text-lg leading-relaxed ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {article.headline}
              </Text>
            </View>
          )}

          {/* Rendered HTML Content */}
          <SimpleHtmlRenderer html={article.content} />

          {/* Article Tags */}
          <View className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Text
              className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Tags
            </Text>
            <View className="flex-row flex-wrap">
              {[article.category, "Fitness", "Health", "Wellness"].map(
                (tag, index) => (
                  <View
                    key={index}
                    className={`px-4 py-2 rounded-full mr-3 mb-3 ${
                      isDark ? "bg-gray-900" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      #{tag.toLowerCase()}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Engagement Actions */}
          <View className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Text
              className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Was this helpful?
            </Text>
            <View className="flex-row space-x-4">
              <Pressable
                className={`flex-row items-center px-6 py-3 rounded-xl ${
                  isDark
                    ? "bg-green-900/30 border border-green-700"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <Feather
                  name="thumbs-up"
                  size={20}
                  color={isDark ? "#10B981" : "#059669"}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    isDark ? "text-green-400" : "text-green-700"
                  }`}
                >
                  Yes, helpful!
                </Text>
              </Pressable>

              <Pressable
                className={`flex-row items-center px-6 py-3 rounded-xl ${
                  isDark
                    ? "bg-gray-900 border border-gray-800"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <Feather
                  name="message-circle"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Feedback
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* More Articles Section */}
        {otherArticles.length > 0 && (
          <View
            className={`mt-4 pt-8 pb-8 ${
              isDark ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            <View className="px-6 mb-6">
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Continue Reading
              </Text>
              <Text
                className={`text-base mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                More articles you might enjoy
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
              }}
            >
              {otherArticles.map((item) => (
                <Link
                  key={item.id}
                  href={{
                    pathname: "/blogs/[id]",
                    params: { id: item.id },
                  }}
                  asChild
                >
                  <SmallArticleCard article={item as Article} />
                </Link>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Padding for safe area */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
