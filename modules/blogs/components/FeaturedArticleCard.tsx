import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Article } from "../types";

interface FeaturedArticleCardProps {
  article: Article;
  onPress: () => void;
}

export const FeaturedArticleCard = React.memo(
  ({ article, onPress }: FeaturedArticleCardProps) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [cachedImageUri, setCachedImageUri] = useState<
      string | null
    >(null);
    const isDark = useColorScheme() === "dark";

    useEffect(() => {
      let mounted = true;

      const loadCachedImage = async () => {
        try {
          // Skip caching if no image URL
          if (!article.imageUrl) {
            if (mounted) {
              setImageError(true);
              setImageLoading(false);
            }
            return;
          }

          const uri = await getCachedImage(
            article.imageUrl
          );
          if (mounted) {
            setCachedImageUri(uri);
          }
        } catch (error) {
          console.warn(
            "Failed to load cached image:",
            error
          );
          if (mounted) {
            setCachedImageUri(article.imageUrl);
          }
        }
      };

      loadCachedImage();
      return () => {
        mounted = false;
      };
    }, [article.imageUrl]);

    const getCachedImage = async (
      imageUrl: string
    ): Promise<string> => {
      if (Platform.OS === "web") return imageUrl;

      try {
        // Create a safe filename from the URL by replacing special characters
        const filename = imageUrl
          .replace(/[^a-zA-Z0-9]/g, '')
          .slice(-50); // Take last 50 chars to avoid too long filenames
        const cacheDir = `${FileSystem.cacheDirectory}images/`;
        const cacheFilePath = `${cacheDir}${filename}.jpg`;

        // Check if directory exists, create if not
        const dirInfo =
          await FileSystem.getInfoAsync(cacheDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheDir, {
            intermediates: true,
          });
        }

        // Check if file exists in cache
        const fileInfo =
          await FileSystem.getInfoAsync(cacheFilePath);
        if (fileInfo.exists) {
          return `file://${cacheFilePath}`;
        }

        // Download and cache the image
        const downloadResult =
          await FileSystem.downloadAsync(
            imageUrl,
            cacheFilePath
          );
        if (downloadResult.status === 200) {
          return `file://${cacheFilePath}`;
        } else {
          throw new Error(
            `Download failed with status: ${downloadResult.status}`
          );
        }
      } catch (error) {
        console.warn("Image caching error:", error);
        throw error; // Re-throw to handle in loadCachedImage
      }
    };

    const handleImageLoad = () => {
      setImageLoading(false);
      setImageError(false);
    };

    const handleImageError = (error?: any) => {
      console.warn("Image load error:", error);
      setImageLoading(false);
      setImageError(true);
    };

    const getCategoryColor = (category: string): string => {
      const colors: Record<string, string> = {
        Recovery: "#10B981",
        Strength: "#F59E0B",
        Hydration: "#06B6D4",
        Mindset: "#8B5CF6",
        Supplement: "#EF4444",
      };
      return colors[category] || "#10B981";
    };

    // Fallback design when image fails to load or doesn't exist
    if (imageError || !article.imageUrl) {
      return (
        <Pressable
          onPress={onPress}
          style={{
            width: "100%",
            height: 320,
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 32,
            backgroundColor: isDark ? "#000000" : "#F3F4F6",
          }}
          android_ripple={{ color: "rgba(0,0,0,0.1)" }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
            }}
          >
            {/* Fallback Icon */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                backgroundColor: isDark
                  ? "#1F2937"
                  : "#E5E7EB",
              }}
            >
              <Feather
                name="image"
                size={32}
                color={getCategoryColor(article.category)}
              />
            </View>

            {/* Content */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 12,
                color: getCategoryColor(article.category),
              }}
            >
              {article.category}
            </Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: 28,
                marginBottom: 16,
                color: isDark ? "#FFFFFF" : "#111827",
              }}
              numberOfLines={3}
            >
              {article.title}
            </Text>

            {/* Meta info */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather
                name="book-open"
                size={14}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <Text
                style={{
                  fontSize: 14,
                  marginLeft: 8,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                {article.readTime} min read
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginHorizontal: 8,
                  color: isDark ? "#6B7280" : "#9CA3AF",
                }}
              >
                •
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Featured
              </Text>
            </View>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        style={{
          width: "100%",
          height: 320,
          borderRadius: 24,
          overflow: "hidden",
          marginBottom: 32,
          elevation: 8, // Android shadow
          shadowColor: "#000", // iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
        android_ripple={{ color: "rgba(255,255,255,0.1)" }}
      >
        <ImageBackground
          source={{
            uri: cachedImageUri || article.imageUrl,
          }}
          style={{ flex: 1, justifyContent: "flex-end" }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          resizeMode="cover"
        >
          {/* Loading Indicator */}
          {imageLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark
                  ? "#000000"
                  : "#E5E7EB",
              }}
            >
              <ActivityIndicator
                size="large"
                color={getCategoryColor(article.category)}
              />
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  color: isDark ? "#9CA3AF" : "#6B7280",
                }}
              >
                Loading image...
              </Text>
            </View>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.3)",
              "rgba(0,0,0,0.8)",
              "rgba(0,0,0,0.95)",
            ]}
            locations={[0, 0.4, 0.8, 1]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Featured Badge */}
          <View
            style={{
              position: "absolute",
              top: 24,
              right: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Featured
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={{ padding: 24, paddingBottom: 32 }}>
            {/* Category Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                  marginRight: 12,
                  backgroundColor:
                    getCategoryColor(article.category) +
                    "33", // 20% opacity
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    color: getCategoryColor(
                      article.category
                    ),
                  }}
                >
                  {article.category}
                </Text>
              </View>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.6)",
                }}
              />
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 12,
                  marginLeft: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Editor's Pick
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "white",
                lineHeight: 32,
                marginBottom: 16,
              }}
              numberOfLines={2}
            >
              {article.title}
            </Text>

            {/* Headline/Summary */}
            {article.headline && (
              <Text
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 16,
                  lineHeight: 22,
                  marginBottom: 16,
                }}
                numberOfLines={2}
              >
                {article.headline}
              </Text>
            )}

            {/* Meta Info */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Feather
                  name="book-open"
                  size={16}
                  color="white"
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    marginLeft: 8,
                    fontWeight: "500",
                  }}
                >
                  {article.readTime} min read
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    marginRight: 8,
                  }}
                >
                  By {article.author}
                </Text>
                <Feather
                  name="arrow-right"
                  size={16}
                  color="white"
                />
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    );
  }
);
