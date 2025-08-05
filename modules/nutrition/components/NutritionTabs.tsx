import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "@/constants/theme";
import { CaloriesTab } from "./CaloriesTab";
import { NutrientsTab } from "./NutrientsTab";
import { MacrosTab } from "./MacrosTab";

interface NutritionTabsProps {
  dateString: string;
}

type TabType = "calories" | "nutrients" | "macros";

const TAB_DATA = [
  { id: "calories" as TabType, label: "CALORIES" },
  { id: "nutrients" as TabType, label: "NUTRIENTS" },
  { id: "macros" as TabType, label: "MACROS" },
];

export const NutritionTabs: React.FC<
  NutritionTabsProps
> = ({ dateString }) => {
  const [activeTab, setActiveTab] =
    useState<TabType>("nutrients");
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const renderTabContent = () => {
    switch (activeTab) {
      case "calories":
        return <CaloriesTab dateString={dateString} />;
      case "nutrients":
        return <NutrientsTab dateString={dateString} />;
      case "macros":
        return <MacrosTab dateString={dateString} />;
      default:
        return <NutrientsTab dateString={dateString} />;
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ flex: 1, paddingTop: 8 }}>
        {/* Tab Header */}
        <View
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
            marginHorizontal: 16,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="flex-row justify-around">
            {TAB_DATA.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderBottomWidth:
                    activeTab === tab.id ? 2 : 0,
                  borderBottomColor: "#007AFF",
                }}
              >
                <Text
                  style={{
                    color:
                      activeTab === tab.id
                        ? "#007AFF"
                        : colors.text.secondary,
                    fontWeight:
                      activeTab === tab.id
                        ? "600"
                        : "normal",
                  }}
                  className="text-sm tracking-wide"
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {renderTabContent()}
        </View>
      </View>
    </SafeAreaView>
  );
};
