import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  useLocalSearchParams,
  Stack,
  useRouter,
} from "expo-router";
import { useProductsStore } from "@/modules/products/store/useProductsStore";
import { useTheme } from "@/modules/home/hooks/useTheme";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const product = useProductsStore((state) =>
    state.getProductById(id as string)
  );

  if (!product) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar
          barStyle={
            isDark ? "light-content" : "dark-content"
          }
        />
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: colors.status.error + "15",
          }}
        >
          <Feather
            name="alert-circle"
            size={32}
            color={colors.status.error}
          />
        </View>
        <Text
          className="text-xl font-bold mb-2"
          style={{ color: colors.text.primary }}
        >
          Product Not Found
        </Text>
        <Text
          className="text-sm text-center mb-6 px-6"
          style={{ color: colors.text.secondary }}
        >
          The product you're looking for doesn't exist or
          has been removed.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-xl px-6 py-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-semibold text-white">
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    setIsInCart(!isInCart);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <Stack.Screen
        options={{
          headerTitle: "",
          headerBackTitle: "",
          headerTransparent: true,
          headerTintColor: "white",
          headerRight: () => (
            <Pressable
              onPress={handleToggleFavorite}
              className="w-9 h-9 rounded-full items-center justify-center mr-1"
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Feather
                name="heart"
                size={18}
                color={isFavorite ? "#EF4444" : "white"}
                fill={
                  isFavorite ? "#EF4444" : "transparent"
                }
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Image Section */}
        <View className="relative">
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width, height: width * 0.8 }}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          />

          {/* Additional bottom gradient for text readability */}
          <View
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              backgroundColor: "transparent",
            }}
          >
            <View
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(0,0,0,0.7)",
                opacity: 1,
              }}
            />
          </View>

          {/* Category Badge */}
          <View
            className="absolute right-4 top-16 rounded-lg px-3 py-1.5"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: isDark ? "white" : colors.primary,
              }}
            >
              {product.category.toUpperCase()}
            </Text>
          </View>

          {/* Product Info Overlay */}
          <View className="absolute bottom-4 left-4 right-4">
            <View
              className="rounded-lg p-3 mb-2"
              style={{
                backgroundColor: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Text className="text-3xl font-bold text-white mb-2 tracking-tight">
                {product.name}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-white">
                    $
                  </Text>
                  <Text className="text-3xl font-bold text-white">
                    {product.price}
                  </Text>
                </View>
                <View
                  className="flex-row items-center rounded-lg px-3 py-1.5"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Feather
                    name="star"
                    size={16}
                    color="#F59E0B"
                  />
                  <Text className="ml-1.5 font-semibold text-white">
                    {product.rating}
                  </Text>
                  <Text className="ml-1 text-xs text-gray-200">
                    ({product.reviews})
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-4 py-4">
          {/* Tagline Card */}
          <View
            className="mb-4 rounded-xl p-4"
            style={{
              backgroundColor: isDark
                ? colors.primary + "15"
                : colors.primary + "08",
              borderWidth: 1,
              borderColor: colors.primary + "20",
            }}
          >
            <View className="flex-row items-center mb-2">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Feather
                  name="message-circle"
                  size={12}
                  color="white"
                />
              </View>
              <Text
                className="font-semibold"
                style={{ color: colors.primary }}
              >
                Product Highlight
              </Text>
            </View>
            <Text
              className="text-base font-medium leading-6 italic"
              style={{ color: colors.text.primary }}
            >
              "{product.tagline}"
            </Text>
          </View>

          {/* Stats Grid */}
          <View
            className="mb-4 rounded-xl p-4"
            style={{
              backgroundColor: isDark
                ? colors.surface
                : colors.surface,
              borderWidth: 1,
              borderColor: isDark
                ? colors.border
                : colors.border + "50",
            }}
          >
            <Text
              className="font-bold mb-4 text-center"
              style={{ color: colors.text.primary }}
            >
              Product Overview
            </Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center mb-2"
                  style={{
                    backgroundColor: isDark
                      ? "#F59E0B" + "20"
                      : "#F59E0B" + "15",
                  }}
                >
                  <Feather
                    name="star"
                    size={20}
                    color="#F59E0B"
                  />
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text.primary }}
                >
                  {product.rating}
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Rating
                </Text>
              </View>

              <View className="items-center">
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center mb-2"
                  style={{
                    backgroundColor: isDark
                      ? "#8B5CF6" + "20"
                      : "#8B5CF6" + "15",
                  }}
                >
                  <Feather
                    name="users"
                    size={20}
                    color="#8B5CF6"
                  />
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text.primary }}
                >
                  {product.reviews}
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Reviews
                </Text>
              </View>

              <View className="items-center">
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center mb-2"
                  style={{
                    backgroundColor: isDark
                      ? colors.primary + "20"
                      : colors.primary + "15",
                  }}
                >
                  <Feather
                    name="shield"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text.primary }}
                >
                  100%
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  Quality
                </Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Feather
                  name="info"
                  size={12}
                  color="white"
                />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text.primary }}
              >
                Description
              </Text>
            </View>
            <View
              className="rounded-xl p-4"
              style={{
                backgroundColor: isDark
                  ? colors.surface
                  : colors.surface,
                borderWidth: 1,
                borderColor: isDark
                  ? colors.border
                  : colors.border + "50",
              }}
            >
              <Text
                className="text-sm leading-6"
                style={{ color: colors.text.secondary }}
              >
                {product.description}
              </Text>
            </View>
          </View>

          {/* Features Section */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <View
                className="w-6 h-6 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Feather
                  name="list"
                  size={12}
                  color="white"
                />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text.primary }}
              >
                Key Features
              </Text>
            </View>
            <View className="space-y-2">
              {product.features.map((feature, index) => (
                <View
                  key={index}
                  className="rounded-lg p-3 flex-row items-start mb-1"
                  style={{
                    backgroundColor: isDark
                      ? colors.surface
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: isDark
                      ? colors.border
                      : colors.border + "50",
                  }}
                >
                  <View
                    className="w-7 h-7 rounded-lg items-center justify-center mr-3 mt-0.5"
                    style={{
                      backgroundColor: isDark
                        ? colors.primary + "20"
                        : colors.primary + "15",
                    }}
                  >
                    <Feather
                      name="check"
                      size={14}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    className="flex-1 text-sm leading-5"
                    style={{ color: colors.text.primary }}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trust Indicators */}
          <View
            className="rounded-xl p-4"
            style={{
              backgroundColor: isDark
                ? "#3B82F6" + "15"
                : "#3B82F6" + "08",
              borderWidth: 1,
              borderColor: "#3B82F6" + "25",
            }}
          >
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                style={{
                  backgroundColor: isDark
                    ? "#3B82F6" + "25"
                    : "#3B82F6" + "15",
                }}
              >
                <Feather
                  name="shield"
                  size={18}
                  color="#3B82F6"
                />
              </View>
              <View className="flex-1">
                <Text
                  className="font-bold mb-1"
                  style={{ color: colors.text.primary }}
                >
                  Satisfaction Guarantee
                </Text>
                <Text
                  className="text-xs leading-4"
                  style={{ color: colors.text.secondary }}
                >
                  30-day money-back guarantee • Free
                  shipping on orders over $50
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 py-4"
        style={{
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: isDark
            ? colors.border
            : colors.border + "50",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.25 : 0.1,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View className="flex-row" style={{ gap: 12 }}>
          {/* Add to Cart Button */}
          <Pressable
            onPress={handleAddToCart}
            className="flex-1 rounded-xl py-4"
            style={{
              backgroundColor: isInCart
                ? colors.primary
                : "transparent",
              borderWidth: 2,
              borderColor: colors.primary,
            }}
          >
            <View className="flex-row items-center justify-center">
              <Feather
                name={isInCart ? "check" : "shopping-cart"}
                size={18}
                color={isInCart ? "white" : colors.primary}
              />
              <Text
                className="ml-2 font-semibold"
                style={{
                  color: isInCart
                    ? "white"
                    : colors.primary,
                }}
              >
                {isInCart ? "Added" : "Add to Cart"}
              </Text>
            </View>
          </Pressable>

          {/* Buy Now Button */}
          <Pressable
            onPress={() => console.log("Buy Now")}
            className="flex-1 rounded-xl py-4"
            style={{
              backgroundColor: "#1F2937",
            }}
          >
            <View className="flex-row items-center justify-center">
              <Feather
                name="credit-card"
                size={18}
                color="white"
              />
              <Text className="ml-2 font-semibold text-white">
                Buy Now
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ProductDetailScreen;
