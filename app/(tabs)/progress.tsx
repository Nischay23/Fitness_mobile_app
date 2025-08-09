import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAppStore } from "@/stores/appStore";
import { WeightEntry } from "@/db/models/WeightEntry";
import { observeWeightHistory } from "@/db/actions/progressActions";
import { WeightChart } from "@/modules/progress/components/WeightChart";
import {
  format,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { COLORS } from "@/constants/theme";
import { database } from "@/db";
import { Q } from "@nozbe/watermelondb";

// Graph period types
type GraphPeriod =
  | "1_week"
  | "1_month"
  | "2_months"
  | "3_months"
  | "6_months"
  | "1_year"
  | "since_start"
  | "all";

interface GraphPeriodOption {
  id: GraphPeriod;
  label: string;
}

const GRAPH_PERIOD_OPTIONS: GraphPeriodOption[] = [
  { id: "1_week", label: "1 Week" },
  { id: "1_month", label: "1 Month" },
  { id: "2_months", label: "2 Months" },
  { id: "3_months", label: "3 Months" },
  { id: "6_months", label: "6 Months" },
  { id: "1_year", label: "1 Year" },
  { id: "since_start", label: "Since Starting Weight" },
  { id: "all", label: "All" },
];

// --- Base UI Component ---
const ProgressScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [weightHistory, setWeightHistory] = React.useState<
    WeightEntry[]
  >([]);
  const [selectedPeriod, setSelectedPeriod] =
    React.useState<GraphPeriod>("all");
  const [showPeriodModal, setShowPeriodModal] =
    React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Subscribe to weight history changes
  React.useEffect(() => {
    if (!currentUser) {
      setWeightHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const subscription = database.collections
      .get<WeightEntry>("weight_entries")
      .query(
        Q.where("user_id", currentUser.id),
        Q.sortBy("date", Q.desc)
      )
      .observe()
      .subscribe((entries) => {
        console.log(
          "📊 Weight history updated:",
          entries.length,
          "entries"
        );
        setWeightHistory(entries);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [currentUser?.id]);

  // Filter weight history based on selected period
  const filteredWeightHistory = React.useMemo(() => {
    if (!weightHistory || weightHistory.length === 0)
      return [];

    const now = new Date();
    let cutoffDate: Date | null = null;

    switch (selectedPeriod) {
      case "1_week":
        cutoffDate = subDays(now, 7);
        break;
      case "1_month":
        cutoffDate = subMonths(now, 1);
        break;
      case "2_months":
        cutoffDate = subMonths(now, 2);
        break;
      case "3_months":
        cutoffDate = subMonths(now, 3);
        break;
      case "6_months":
        cutoffDate = subMonths(now, 6);
        break;
      case "1_year":
        cutoffDate = subYears(now, 1);
        break;
      case "since_start":
        // Show all data from the first entry
        cutoffDate = null;
        break;
      case "all":
      default:
        cutoffDate = null;
        break;
    }

    if (!cutoffDate) {
      console.log(
        `📊 Showing all ${weightHistory.length} entries for period: ${selectedPeriod}`
      );
      return weightHistory;
    }

    const filtered = weightHistory.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate!;
    });

    console.log(
      `📊 Filtered to ${filtered.length} entries for period: ${selectedPeriod}`
    );
    return filtered;
  }, [weightHistory, selectedPeriod]);

  const handleBackPress = () => {
    router.back();
  };

  const handlePeriodSelect = (period: GraphPeriod) => {
    setSelectedPeriod(period);
    setShowPeriodModal(false);
    console.log(`📊 Selected period: ${period}`);
  };

  const getSelectedPeriodLabel = () => {
    return (
      GRAPH_PERIOD_OPTIONS.find(
        (option) => option.id === selectedPeriod
      )?.label || "All"
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={
          colorScheme === "dark"
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={colors.background}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Navigation Header with proper safe area */}
      <SafeAreaView
        style={{
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Pressable onPress={handleBackPress}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.text.primary}
            />
          </Pressable>

          <Text
            style={{
              color: colors.text.primary,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Progress
          </Text>

          <Link href="/(modals)/log-weight" asChild>
            <Pressable>
              <Ionicons
                name="add"
                size={28}
                color={colors.text.primary}
              />
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Section - MyFitnessPal Style */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          {/* Left Side - Chart Icon and Weight */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons
              name="trending-up"
              size={24}
              color={colors.text.secondary}
            />
            <Text
              style={{
                color:
                  colorScheme === "dark"
                    ? colors.primary
                    : "#2563EB",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Weight
            </Text>
          </View>

          {/* Right Side - Calendar Icon and Period Selector */}
          <Pressable
            onPress={() => setShowPeriodModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.text.secondary}
            />
            <Text
              style={{
                color:
                  colorScheme === "dark"
                    ? colors.primary
                    : "#2563EB",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {getSelectedPeriodLabel()}
            </Text>
          </Pressable>
        </View>

        {/* Chart Container */}
        <View
          style={{
            backgroundColor: colors.background,
            paddingVertical: 20,
          }}
        >
          {isLoading ? (
            // Loading animation for chart
            <View
              style={{
                height: 250,
                paddingHorizontal: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: 200,
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="trending-up"
                  size={48}
                  color={colors.text.secondary}
                  style={{ opacity: 0.5, marginBottom: 16 }}
                />
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Loading your progress...
                </Text>
              </View>
            </View>
          ) : (
            <WeightChart
              entries={filteredWeightHistory}
              period={selectedPeriod}
            />
          )}
        </View>

        {/* Entries Section */}
        <View
          style={{
            backgroundColor: colors.background,
            paddingTop: 20,
          }}
        >
          {/* Section Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Entries
            </Text>
            <Ionicons
              name="share-outline"
              size={24}
              color={colors.text.secondary}
            />
          </View>

          {/* Entries List */}
          <View style={{ paddingHorizontal: 20 }}>
            {filteredWeightHistory.length > 0 ? (
              filteredWeightHistory.map((entry, index) => (
                <View
                  key={entry.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 16,
                    borderBottomWidth:
                      index <
                      filteredWeightHistory.length - 1
                        ? 1
                        : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {format(
                        new Date(entry.date),
                        "EEEE d MMM yyyy"
                      )}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {entry.weightKg.toFixed(1)} kg
                    </Text>
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color={colors.text.secondary}
                    />
                  </View>
                </View>
              ))
            ) : (
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 60,
                }}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={48}
                  color={colors.text.secondary}
                  style={{ marginBottom: 16 }}
                />
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 16,
                    fontWeight: "500",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  No weight entries yet
                </Text>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 14,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Tap the + button to start tracking{"\n"}
                  your weight progress
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Graph Period Selection Modal */}
      <Modal
        visible={showPeriodModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
          onPress={() => setShowPeriodModal(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 24,
              }}
            >
              Graph Period
            </Text>

            {/* Period Options */}
            {GRAPH_PERIOD_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                onPress={() =>
                  handlePeriodSelect(option.id)
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  gap: 16,
                }}
              >
                {/* Radio Button */}
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor:
                      selectedPeriod === option.id
                        ? colors.primary
                        : colors.text.secondary,
                    backgroundColor:
                      selectedPeriod === option.id
                        ? colors.primary
                        : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedPeriod === option.id && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "white",
                      }}
                    />
                  )}
                </View>

                {/* Option Label */}
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: 16,
                    flex: 1,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}

            {/* Modal Footer */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 16,
                marginTop: 24,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Pressable
                onPress={() => setShowPeriodModal(false)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowPeriodModal(false)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  OK
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ProgressScreen;
