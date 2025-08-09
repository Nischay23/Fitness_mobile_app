import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useProductsStore } from "../store/useProductsStore";
import ProductCard from "./ProductCard";
import { useTheme } from "@/modules/home/hooks/useTheme";

const ProductsSection = () => {
  const { colors, isDark } = useTheme();
  const products = useProductsStore(
    (state) => state.products
  );

  if (!products.length) {
    return (
      <View
        style={{
          marginTop: 32,
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark
            ? "rgba(30, 41, 59, 0.5)"
            : "rgba(255, 255, 255, 0.8)",
          marginHorizontal: 16,
          borderRadius: 20,
          padding: 32,
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text
          style={{
            marginTop: 8,
            color: colors.text.secondary,
            fontFamily: "Inter_18pt-Regular",
          }}
        >
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 24 }}>
      <LinearGradient
        colors={
          isDark
            ? [
                "rgba(30, 41, 59, 0.8)",
                "rgba(15, 23, 42, 0.6)",
              ]
            : [
                "rgba(255, 255, 255, 0.9)",
                "rgba(248, 250, 252, 0.8)",
              ]
        }
        style={{
          marginHorizontal: 16,
          borderRadius: 24,
          padding: 20,
          marginBottom: 20,
          shadowColor: isDark ? colors.primary : "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 16,
          elevation: isDark ? 12 : 6,
          borderWidth: isDark ? 1.5 : 1,
          borderColor: isDark
            ? "rgba(74, 222, 128, 0.2)"
            : "rgba(0, 0, 0, 0.05)",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_18pt-Bold",
            color: colors.text.primary,
            letterSpacing: -0.5,
          }}
        >
          Exclusive Store
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: 15,
            fontFamily: "Inter_18pt-Regular",
            color: colors.text.secondary,
            lineHeight: 22,
          }}
        >
          Premium gear & supplements for your fitness journey
        </Text>
      </LinearGradient>

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
          <View style={{ width: 12 }} />
        )}
      />

      <LinearGradient
        colors={
          isDark
            ? [
                "rgba(30, 41, 59, 0.6)",
                "rgba(15, 23, 42, 0.4)",
              ]
            : [
                "rgba(255, 255, 255, 0.8)",
                "rgba(248, 250, 252, 0.6)",
              ]
        }
        style={{
          marginTop: 20,
          marginBottom: 16,
          marginHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          borderRadius: 20,
          borderWidth: isDark ? 1 : 0.5,
          borderColor: isDark
            ? "rgba(74, 222, 128, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
        }}
      >
        <Feather
          name="shield"
          size={18}
          color={colors.primary}
        />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 13,
            fontFamily: "Inter_18pt-SemiBold",
            color: colors.text.secondary,
          }}
        >
          All products come with our satisfaction guarantee
        </Text>
      </LinearGradient>
    </View>
  );
};

export default ProductsSection;
