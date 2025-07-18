import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Pressable,
  useColorScheme,
  StatusBar,
  Animated,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Stack, useRouter } from "expo-router";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import {
  format,
  addDays,
  subDays,
  isToday,
} from "date-fns";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CalorieSummary from "@/modules/diary/components/CalorieSummary";
import { DiaryList } from "@/modules/diary/components/DiaryList";
import { useAppStore } from "@/stores/appStore";
import { COLORS } from "@/constants/theme";

const DiaryPage = React.memo(
  ({
    dateString,
    colorScheme,
    router,
    onScroll,
  }: {
    dateString: string;
    colorScheme: "light" | "dark";
    router: any;
    onScroll: (event: any) => void;
  }) => {
    const colors = COLORS[colorScheme];

    return (
      <FlatList
        ListHeaderComponent={() => (
          <View style={{ height: 24 }} />
        )}
        ListFooterComponent={() => (
          <View style={{ height: 15 }} />
        )}
        data={[{ key: "diary" }]}
        renderItem={() => (
          <DiaryList dateString={dateString} />
        )}
        keyExtractor={(item) => item.key}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 0,
          flexGrow: 1,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
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
  const [isInitialized, setIsInitialized] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const router = useRouter();
  const { currentUser } = useAppStore();
  const insets = useSafeAreaInsets();

  // Adjust header height to be taller
  const HEADER_HEIGHT =
    Platform.OS === "ios" ? 64 + insets.top : 64 + 30;
  const DATE_NAVIGATOR_HEIGHT = 70;
  const CALORIE_SUMMARY_HEIGHT = 90;
  const SCROLL_THRESHOLD = 10;
  const TOTAL_FIXED_HEIGHT =
    HEADER_HEIGHT +
    DATE_NAVIGATOR_HEIGHT +
    CALORIE_SUMMARY_HEIGHT;

  // Animated values for smooth transitions
  const headerTranslateY = useRef(
    new Animated.Value(0)
  ).current;
  const dateNavigatorTranslateY = useRef(
    new Animated.Value(0)
  ).current;
  const calorieSummaryTranslateY = useRef(
    new Animated.Value(0)
  ).current;
  const contentTranslateY = useRef(
    new Animated.Value(0)
  ).current;
  const lastScrollY = useRef(0);
  const isHeaderVisible = useRef(true);

  // Initialize component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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

  // Handle scroll for header animation
  const handleScroll = useCallback(
    (event: any) => {
      if (!isInitialized) return;

      const currentScrollY =
        event.nativeEvent.contentOffset.y;
      const scrollDiff =
        currentScrollY - lastScrollY.current;

      // Only animate if scroll difference is significant to avoid jittery animations
      if (Math.abs(scrollDiff) < SCROLL_THRESHOLD) {
        return;
      }

      if (
        scrollDiff > 0 &&
        currentScrollY > 50 &&
        isHeaderVisible.current
      ) {
        // Scrolling down - hide header and move other elements up
        isHeaderVisible.current = false;

        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: -HEADER_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(dateNavigatorTranslateY, {
            toValue: -HEADER_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(calorieSummaryTranslateY, {
            toValue: -HEADER_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: -HEADER_HEIGHT, // Move content up by the header's height
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (
        scrollDiff < 0 &&
        !isHeaderVisible.current
      ) {
        // Scrolling up - show header and move other elements back
        isHeaderVisible.current = true;

        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(dateNavigatorTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(calorieSummaryTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0, // Move content back to its original position
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }

      lastScrollY.current = currentScrollY;
    },
    [
      headerTranslateY,
      dateNavigatorTranslateY,
      calorieSummaryTranslateY,
      contentTranslateY,
      isInitialized,
    ]
  );

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
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <StatusBar
          backgroundColor={colors.background}
          barStyle={
            colorScheme === "dark"
              ? "light-content"
              : "dark-content"
          }
        />
        <SafeAreaView style={{ flex: 1 }}>
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
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <StatusBar
          backgroundColor={colors.background}
          barStyle={
            colorScheme === "dark"
              ? "light-content"
              : "dark-content"
          }
        />
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.background,
            }}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        backgroundColor={colors.background}
        barStyle={
          colorScheme === "dark"
            ? "light-content"
            : "dark-content"
        }
      />
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            headerShown: false,
            statusBarTranslucent: true,
          }}
        />

        {/* Animated Header - Diary Title and Back Button */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: HEADER_HEIGHT,
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            paddingTop:
              Platform.OS === "ios" ? insets.top + 8 : 28, // Increased padding
            paddingBottom: 12,
            zIndex: 30,
            transform: [{ translateY: headerTranslateY }],
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <View
            className="flex-row items-center justify-between"
            style={{ height: 74 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-9 h-9 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.surfaceElevated,
              }}
            >
              <Feather
                name="arrow-left"
                size={18}
                color={colors.text.primary}
              />
            </Pressable>

            <Text
              style={{ color: colors.text.primary }}
              className="text-lg font-bold"
            >
              Diary
            </Text>

            <View className="w-9" />
          </View>
        </Animated.View>

        {/* Animated Date Navigator */}
        <Animated.View
          style={{
            position: "absolute",
            top: HEADER_HEIGHT,
            left: 0,
            right: 0,
            height: DATE_NAVIGATOR_HEIGHT,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingVertical: 10,
            paddingHorizontal: 20,
            zIndex: 25,
            transform: [
              { translateY: dateNavigatorTranslateY },
            ],
          }}
        >
          <View className="flex-row items-center justify-between flex-1">
            <Pressable
              onPress={() => changeDate(-1)}
              className="w-8 h-8 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.surfaceElevated,
              }}
            >
              <Feather
                name="chevron-left"
                size={16}
                color={colors.text.primary}
              />
            </Pressable>

            <View className="items-center">
              <Text
                style={{
                  color: isToday(currentDate)
                    ? "#007AFF"
                    : colors.text.primary,
                  fontWeight: isToday(currentDate)
                    ? "700"
                    : "600",
                }}
                className="text-base"
              >
                {isToday(currentDate)
                  ? "Today"
                  : format(currentDate, "EEEE")}
              </Text>
              <Text
                style={{
                  color: isToday(currentDate)
                    ? "#007AFF"
                    : colors.text.secondary,
                  opacity: isToday(currentDate) ? 0.8 : 1,
                }}
                className="text-xs mt-0.5"
              >
                {format(currentDate, "MMM d, yyyy")}
              </Text>
            </View>

            <Pressable
              onPress={() => changeDate(1)}
              className="w-8 h-8 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.surfaceElevated,
              }}
            >
              <Feather
                name="chevron-right"
                size={16}
                color={colors.text.primary}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Animated Calories Summary */}
        <Animated.View
          style={{
            position: "absolute",
            top: HEADER_HEIGHT + DATE_NAVIGATOR_HEIGHT,
            left: 0,
            right: 0,
            height: CALORIE_SUMMARY_HEIGHT,
            zIndex: 20,
            backgroundColor: colors.surface,
            transform: [
              { translateY: calorieSummaryTranslateY },
            ],
          }}
        >
          <CalorieSummary
            dateString={format(currentDate, "yyyy-MM-dd")}
          />
        </Animated.View>

        {/* Content Area with PagerView */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          <View style={{ height: TOTAL_FIXED_HEIGHT }} />
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
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
                  colorScheme={colorScheme}
                  router={router}
                  onScroll={handleScroll}
                />
              </View>
            ))}
          </PagerView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
