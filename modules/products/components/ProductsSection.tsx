import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { useProductsStore } from "../store/useProductsStore";
import ProductCard from "./ProductCard";
import { useTheme } from "@/modules/home/hooks/useTheme";

const ProductsSection = () => {
  const { colors } = useTheme();
  const products = useProductsStore(
    (state) => state.products
  );

  if (!products.length) {
    return (
      <View className="mt-8 flex-1 items-center justify-center">
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text
          className="mt-2"
          style={{ color: colors.text.secondary }}
        >
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-8">
      {/* Header Section */}
      <View className="mb-6 flex-row items-center justify-between px-4">
        <View className="flex-1">
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            Exclusive Store
          </Text>
          <Text
            className="mt-1 text-base"
            style={{ color: colors.text.secondary }}
          >
            Premium gear & supplements for your fitness
            journey
          </Text>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        ItemSeparatorComponent={() => (
          <View className="w-2" />
        )}
      />

      {/* Bottom Info */}
      <View className="mt-6 mb-4 flex-row items-center justify-center px-4">
        <Feather
          name="shield"
          size={16}
          color={colors.primary}
        />
        <Text
          className="ml-2 text-sm"
          style={{ color: colors.text.secondary }}
        >
          All products come with our satisfaction guarantee
        </Text>
      </View>
    </View>
  );
};

export default ProductsSection;
