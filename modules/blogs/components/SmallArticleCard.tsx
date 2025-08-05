import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  PressableProps,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Article } from "../types";

interface SmallArticleCardProps extends PressableProps {
  article: Article;
}

const SmallArticleCard = React.forwardRef<View, SmallArticleCardProps>(
  ({ article, ...props }, ref) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const isDark = useColorScheme() === "dark";

    const handleImageLoad = () => {
      setImageLoading(false);
    };

    const handleImageError = () => {
      setImageLoading(false);
      setImageError(true);
    };

    const getCategoryColor = (category: string) => {
      const colors = {
        Recovery: "#10B981",
        Strength: "#F59E0B",
        Hydration: "#06B6D4",
        Mindset: "#8B5CF6",
        Supplement: "#EF4444",
      };
      return colors[category as keyof typeof colors] || "#10B981";
    };

    return (
      <Pressable
        ref={ref}
        {...props}
        className={`w-52 mr-4 active:opacity-80 ${
          isDark ? "bg-black" : "bg-white"
        } rounded-2xl overflow-hidden shadow-lg`}
      >
        {/* Image Container */}
        <View className="relative">
          {imageError ? (
            // Fallback when image fails to load
            <View
              className={`w-full h-32 items-center justify-center ${
                isDark ? "bg-gray-900" : "bg-gray-200"
              }`}
            >
              <Feather
                name="image"
                size={32}
                color={getCategoryColor(article.category)}
              />
              <Text
                className={`text-xs mt-2 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Image unavailable
              </Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: article.imageUrl }}
                className="w-full h-32"
                resizeMode="cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />

              {/* Loading Indicator */}
              {imageLoading && (
                <View className="absolute inset-0 items-center justify-center bg-gray-200 dark:bg-gray-900">
                  <ActivityIndicator
                    size="small"
                    color={getCategoryColor(article.category)}
                  />
                </View>
              )}
            </>
          )}

          {/* Category Badge */}
          <View className="absolute top-3 left-3">
            <View
              className="px-2 py-1 rounded-full"
              style={{
                backgroundColor: getCategoryColor(article.category) + "E6",
              }}
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wider">
                {article.category}
              </Text>
            </View>
          </View>

          {/* Read Time Badge */}
          <View className="absolute top-3 right-3">
            <View className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex-row items-center">
              <Feather name="clock" size={10} color="white" />
              <Text className="text-white text-xs ml-1 font-medium">
                {article.readTime}m
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Title */}
          <Text
            className={`text-lg font-bold leading-tight mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            numberOfLines={2}
          >
            {article.title}
          </Text>

          {/* Headline/Summary */}
          {article.headline && (
            <Text
              className={`text-sm leading-relaxed mb-3 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
              numberOfLines={2}
            >
              {article.headline}
            </Text>
          )}

          {/* Author and Meta Info */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${
                  isDark ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {article.author.charAt(0)}
                </Text>
              </View>
              <Text
                className={`text-xs font-medium flex-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
                numberOfLines={1}
              >
                {article.author}
              </Text>
            </View>

            {/* Arrow Icon */}
            <View
              className={`p-1 rounded-full ${
                isDark ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <Feather
                name="arrow-right"
                size={12}
                color={getCategoryColor(article.category)}
              />
            </View>
          </View>

          {/* Engagement Indicators */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Feather
                  name="heart"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <Text
                  className={`text-xs ml-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {Math.floor(Math.random() * 50) + 10}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Feather
                  name="message-circle"
                  size={14}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <Text
                  className={`text-xs ml-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {Math.floor(Math.random() * 20) + 2}
                </Text>
              </View>
            </View>

            <Text
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              2 days ago
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }
);

SmallArticleCard.displayName = "SmallArticleCard";

export { SmallArticleCard };
