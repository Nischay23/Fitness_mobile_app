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
import { useTheme } from "@/modules/home/hooks/useTheme";

// Optimized constants for better spacing
const HEADER_HEIGHT = 64;
const DATE_NAVIGATOR_HEIGHT = 72;
const CALORIE_SUMMARY_HEIGHT = 100;
const SCROLL_THRESHOLD = 8;
const TOTAL_FIXED_HEIGHT =
  HEADER_HEIGHT +
  DATE_NAVIGATOR_HEIGHT +
  CALORIE_SUMMARY_HEIGHT;

// This is the content for a single day's page in the swiper
const DiaryPage = React.memo(
  ({
    dateString,
    router,
    onScroll,
  }: {
    dateString: string;
    router: any;
    onScroll: (event: any) => void;
  }) => {
    const { colors } = useTheme();

    return (
      <FlatList
        ListHeaderComponent={() => (
          <View style={{ height: 16 }} />
        )}
        ListFooterComponent={() => (
          <View style={{ height: 20 }} />
        )}
        data={[{ key: "diary" }]}
        renderItem={() => (
          <DiaryList dateString={dateString} />
        )}
        keyExtractor={(item) => item.key}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 10,
          flexGrow: 1,
          paddingHorizontal: 20,
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
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { currentUser } = useAppStore();
  const insets = useSafeAreaInsets();

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
        currentScrollY > 40 &&
        isHeaderVisible.current
      ) {
        // Scrolling down - hide header and move other elements up
        isHeaderVisible.current = false;

        Animated.parallel([
          Animated.timing(headerTranslateY, {
            toValue: -HEADER_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dateNavigatorTranslateY, {
            toValue: -HEADER_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(calorieSummaryTranslateY, {
            toValue: -HEADER_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: -HEADER_HEIGHT,
            duration: 200,
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
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dateNavigatorTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(calorieSummaryTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 200,
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
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <StatusBar
          barStyle={
            isDark ? "light-content" : "dark-content"
          }
          backgroundColor={colors.background}
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

  if (!isInitialized) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <StatusBar
          barStyle={
            isDark ? "light-content" : "dark-content"
          }
          backgroundColor={colors.background}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        />
      </SafeAreaView>
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
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Compact Professional Header */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT + insets.top,
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 12,
          zIndex: 30,
          transform: [{ translateY: headerTranslateY }],
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
      </Animated.View>

      {/* Streamlined Date Navigator */}
      <Animated.View
        style={{
          position: "absolute",
          top: HEADER_HEIGHT + insets.top,
          left: 0,
          right: 0,
          height: DATE_NAVIGATOR_HEIGHT,
          backgroundColor: isDark ? "#1f1f1f" : "#f8f9fa",
          borderBottomWidth: isDark ? 0 : 1,
          borderBottomColor: isDark
            ? "transparent"
            : colors.border + "15",
          paddingVertical: 12,
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
                color: isToday(currentDate)
                  ? "#059669"
                  : colors.text.primary,
                fontWeight: "700",
              }}
              className="text-lg"
            >
              {isToday(currentDate)
                ? "Today"
                : format(currentDate, "EEEE")}
            </Text>
            <Text
              style={{
                color: isToday(currentDate)
                  ? "#059669" + "CC"
                  : colors.text.secondary,
              }}
              className="text-sm mt-0.5 font-medium"
            >
              {format(currentDate, "MMM d, yyyy")}
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
      </Animated.View>

      {/* Compact Calories Summary */}
      <Animated.View
        style={{
          position: "absolute",
          top:
            HEADER_HEIGHT +
            DATE_NAVIGATOR_HEIGHT +
            insets.top,
          left: 0,
          right: 0,
          height: CALORIE_SUMMARY_HEIGHT,
          zIndex: 20,
          backgroundColor: colors.background,
          transform: [
            { translateY: calorieSummaryTranslateY },
          ],
        }}
      >
        <View className="px-5 pt-3 pb-2">
          <CalorieSummary
            dateString={format(currentDate, "yyyy-MM-dd")}
          />
        </View>
      </Animated.View>

      {/* Content Area with PagerView */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        <View
          style={{
            height: TOTAL_FIXED_HEIGHT + insets.top,
          }}
        />
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
                router={router}
                onScroll={handleScroll}
              />
            </View>
          ))}
        </PagerView>
      </Animated.View>
    </View>
  );
}
