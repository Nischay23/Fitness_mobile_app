import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Pressable,
  useColorScheme,
  StatusBar,
} from "react-native";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { format, addDays, isToday } from "date-fns";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CalorieSummary from "@/modules/diary/components/CalorieSummary";
import { DiaryList } from "@/modules/diary/components/DiaryList";
import { useAppStore } from "@/stores/appStore";
import { useTheme } from "@/modules/home/hooks/useTheme";

// Optimized constants for better spacing
const HEADER_HEIGHT = 58;
const DATE_NAVIGATOR_HEIGHT = 56;
const CALORIE_SUMMARY_HEIGHT = 80;

// This is the content for a single day's page in the swiper
const DiaryPage = React.memo(
  ({
    dateString,
    date,
    router,
    changeDate,
    colors,
    isDark,
  }: {
    dateString: string;
    date: Date;
    router: any;
    changeDate: (offset: number) => void;
    colors: any;
    isDark: boolean;
  }) => {
    // Create the data structure for FlatList with sticky headers
    const listData = [
      { type: "dateNavigator", key: "dateNavigator" },
      { type: "calorieSummary", key: "calorieSummary" },
      { type: "diaryContent", key: "diaryContent" },
    ];

    const renderItem = ({ item }: { item: any }) => {
      switch (item.type) {
        case "dateNavigator":
          return (
            <View
              style={{
                height: DATE_NAVIGATOR_HEIGHT,
                backgroundColor: isDark
                  ? "#1f1f1f"
                  : "#f8f9fa",
                borderBottomWidth: isDark ? 0 : 1,
                borderBottomColor: isDark
                  ? "transparent"
                  : colors.border + "15",
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
            >
              <View className="flex-row items-center justify-between flex-1">
                <Pressable
                  onPress={() => changeDate(-1)}
                  className="w-10 h-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? "#2a2a2a"
                      : "#ffffff",
                    shadowColor: isDark ? "#000" : "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Feather
                    name="chevron-left"
                    size={18}
                    color={colors.text.primary}
                  />
                </Pressable>

                <View className="items-center flex-1 mx-4">
                  <Text
                    style={{
                      color: isToday(date)
                        ? "#059669"
                        : colors.text.primary,
                      fontWeight: "700",
                    }}
                    className="text-lg"
                  >
                    {isToday(date)
                      ? "Today"
                      : format(date, "EEEE")}
                  </Text>
                  <Text
                    style={{
                      color: isToday(date)
                        ? "#059669" + "CC"
                        : colors.text.secondary,
                    }}
                    className="text-sm mt-0.5 font-medium"
                  >
                    {format(date, "MMM d, yyyy")}
                  </Text>
                </View>

                <Pressable
                  onPress={() => changeDate(1)}
                  className="w-10 h-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? "#2a2a2a"
                      : "#ffffff",
                    shadowColor: isDark ? "#000" : "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={colors.text.primary}
                  />
                </Pressable>
              </View>
            </View>
          );

        case "calorieSummary":
          return (
            <View
              style={{
                minHeight: CALORIE_SUMMARY_HEIGHT,
                backgroundColor: colors.background,
                shadowColor: isDark ? "#000" : "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.1 : 0.03,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="px-5 pt-2 pb-3">
                <CalorieSummary dateString={dateString} />
              </View>
            </View>
          );

        case "diaryContent":
          return (
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 8,
                minHeight: 500,
              }}
            >
              <DiaryList dateString={dateString} />
            </View>
          );

        default:
          return null;
      }
    };

    return (
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
        }}
        bounces={true}
        // Make both date navigator and calorie summary sticky
        stickyHeaderIndices={[0, 1]}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={21}
        initialNumToRender={3}
      />
    );
  }
);

DiaryPage.displayName = "DiaryPage";

// The main screen component for the "Diary" tab
export default function DiaryTab() {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );
  const pagerRef = useRef<PagerView>(null);
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { currentUser } = useAppStore();
  const insets = useSafeAreaInsets();

  // Define header background color
  const headerBgColor = isDark ? "#1a1a1a" : "#ffffff";

  // Set status bar style when this screen is focused
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        isDark ? "light-content" : "dark-content"
      );

      return () => {
        StatusBar.setBarStyle(
          isDark ? "light-content" : "dark-content"
        );
      };
    }, [isDark])
  );

  // Optimize: Create only 21 pages (10 days before, today, 10 days after)
  const { dates, initialPage } = useMemo(() => {
    const datesList = Array.from({ length: 21 }).map(
      (_, i) => addDays(new Date(), i - 10)
    );
    return {
      dates: datesList,
      initialPage: 10, // Index of today's date
    };
  }, []);

  // When the user swipes, this updates our state
  const onPageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const newDate = dates[e.nativeEvent.position];
      if (newDate) {
        setCurrentDate(newDate);
      }
    },
    [dates]
  );

  // When the user taps the arrows, this updates the state and moves the pager
  const changeDate = useCallback(
    (offset: number) => {
      if (!pagerRef.current) return;

      const currentIndex = dates.findIndex(
        (d) =>
          format(d, "yyyy-MM-dd") ===
          format(currentDate, "yyyy-MM-dd")
      );

      if (currentIndex === -1) return;

      const newIndex = currentIndex + offset;

      // Check bounds
      if (newIndex < 0 || newIndex >= dates.length) return;

      const newDate = dates[newIndex];
      setCurrentDate(newDate);
      pagerRef.current.setPage(newIndex);
    },
    [dates, currentDate]
  );

  // Show authentication check
  if (!currentUser) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: headerBgColor,
        }}
      >
        <StatusBar
          barStyle={
            isDark ? "light-content" : "dark-content"
          }
          backgroundColor="transparent"
          translucent={true}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{ color: colors.text.primary }}
            className="text-lg font-semibold text-center"
          >
            Please create a profile to view your diary
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: headerBgColor,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Fixed Header with proper safe area */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: headerBgColor,
        }}
      >
        <View
          style={{
            height: HEADER_HEIGHT,
            backgroundColor: headerBgColor,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 12,
            shadowColor: isDark ? "#000" : "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: isDark ? 0.25 : 0.06,
            shadowRadius: 8,
            elevation: 4,
            borderBottomWidth: isDark ? 0 : 1,
            borderBottomColor: isDark
              ? "transparent"
              : colors.border + "20",
          }}
        >
          <View className="flex-row items-center justify-between h-full">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark
                  ? "#2a2a2a"
                  : colors.surface,
              }}
            >
              <Feather
                name="arrow-left"
                size={18}
                color={colors.text.primary}
              />
            </Pressable>

            <View className="items-center flex-1">
              <Text
                style={{ color: colors.text.primary }}
                className="text-xl font-bold"
              >
                My Diary
              </Text>
            </View>

            <Pressable
              className="w-10 h-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark
                  ? "#2a2a2a"
                  : colors.surface,
              }}
            >
              <Feather
                name="more-horizontal"
                size={18}
                color={colors.text.secondary}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Scrollable Content with Sticky Headers */}
      <PagerView
        ref={pagerRef}
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
        initialPage={initialPage}
        onPageSelected={onPageSelected}
        overdrag={true}
        scrollEnabled={true}
      >
        {dates.map((date, index) => (
          <View
            key={format(date, "yyyy-MM-dd")}
            style={{
              flex: 1,
              backgroundColor: colors.background,
            }}
          >
            <DiaryPage
              dateString={format(date, "yyyy-MM-dd")}
              date={date}
              router={router}
              changeDate={changeDate}
              colors={colors}
              isDark={isDark}
            />
          </View>
        ))}
      </PagerView>
    </View>
  );
}
