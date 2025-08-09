import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Animated,
  Alert,
  BackHandler,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

import {
  MealType,
  FoodItem,
} from "../../modules/nutrition/types";
import { FoodItemCard } from "@/modules/nutrition";
import { useNutrition } from "@/modules/nutrition";
import { searchFoods } from "@/db/actions/diaryActions";

type MealTypeInfo = {
  value: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MEAL_TYPES: MealTypeInfo[] = [
  {
    value: "breakfast",
    label: "Breakfast",
    icon: "sunny-outline",
  },
  {
    value: "lunch",
    label: "Lunch",
    icon: "partly-sunny-outline",
  },
  {
    value: "dinner",
    label: "Dinner",
    icon: "moon-outline",
  },
  {
    value: "snacks",
    label: "Snacks",
    icon: "nutrition-outline",
  },
] as const;

export const FoodSearchScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Get route parameters
  const params = useLocalSearchParams();
  const routeMealType = params.mealType as
    | MealType
    | undefined;
  const routeDate = params.date as string | undefined;

  // Remove dependency on router parameters to avoid navigation context issues
  const [searchQuery, setSearchQuery] = useState("");
  const [showMealDropdown, setShowMealDropdown] =
    useState(false);
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>(routeMealType || "breakfast");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const dropdownAnimation = React.useRef(
    new Animated.Value(0)
  ).current;
  const toastAnimation = React.useRef(
    new Animated.Value(0)
  ).current;

  // Use Android back handler for safe navigation
  useEffect(() => {
    const backAction = () => {
      // Navigate back when hardware back button is pressed
      if (router.canGoBack()) {
        router.back();
      }
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  // Use our nutrition hook for local-first operations
  const {
    isInitialized,
    searchResults, // FoodItem[] for UI display
    searchResultsRaw, // Food[] models for database operations
    isSearching,
    searchHistory,
    isAddingFood,
    setIsAddingFood,
    suggestedFoods,
    performSearch,
    addFoodToDiary,
  } = useNutrition();

  // Get current date with consistent formatting, or use the date from route params
  const dateToLog = useMemo(() => {
    if (routeDate) {
      // Validate the route date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(routeDate)) {
        return routeDate;
      }
    }
    // Fallback to today's date
    return format(new Date(), "yyyy-MM-dd");
  }, [routeDate]);

  // Find the selected meal info
  const selectedMeal = useMemo(
    () =>
      MEAL_TYPES.find(
        (meal) => meal.value === selectedMealType
      ),
    [selectedMealType]
  );

  // Debounced search effect with error handling
  useEffect(() => {
    // Only search if there's a query and component is properly initialized
    if (!searchQuery || searchQuery.length < 2) {
      return;
    }

    const handler = setTimeout(() => {
      if (isInitialized) {
        try {
          performSearch(searchQuery);
        } catch (error) {
          console.error("Search error:", error);
        }
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, isInitialized, performSearch]);

  const handleFoodSelect = async (
    foodItem: FoodItem,
    isFromSearch: boolean = false
  ) => {
    try {
      setIsAddingFood(foodItem.id);

      let foodModel;

      if (isFromSearch) {
        // Find the corresponding Food model from search results
        foodModel = searchResultsRaw.find(
          (food) => food.id === foodItem.id
        );
        if (!foodModel) {
          throw new Error(
            "Food model not found in search results"
          );
        }
      } else {
        // For history/suggested foods, we need to search the database
        const searchResults = await searchFoods(
          foodItem.name
        );
        foodModel = searchResults.find(
          (food) => food.id === foodItem.id
        );

        if (!foodModel) {
          throw new Error("Food not found in database");
        }
      }

      await addFoodToDiary(
        foodModel,
        selectedMealType,
        dateToLog,
        1
      );

      // Show success toast instead of alert
      showSuccessToast(
        `${foodItem.name} added to ${selectedMeal?.label}`
      );

      // Reset loading state
      setIsAddingFood(null);

      // Reset search query to allow for more searches
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding food:", error);
      Alert.alert(
        "Error",
        "Failed to add food to diary. Please try again."
      );
      setIsAddingFood(null);
    }
  };

  const toggleDropdown = () => {
    const toValue = showMealDropdown ? 0 : 1;
    setShowMealDropdown(!showMealDropdown);
    Animated.spring(dropdownAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  };

  const handleGoBack = () => {
    // Navigate back to previous screen
    if (router.canGoBack()) {
      router.back();
    }
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    // Animate toast in
    Animated.sequence([
      Animated.spring(toastAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.delay(1000), // Show for 1 second
      Animated.spring(toastAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  const handleMealSelect = (mealType: MealType) => {
    setSelectedMealType(mealType);
    toggleDropdown();
  };

  // Define colors based on theme
  const gradientColors: readonly [
    string,
    string,
    ...string[],
  ] = isDark
    ? (["#1f2937", "#374151"] as const) // Dark mode: gray gradient
    : (["#059669", "#0891b2"] as const); // Light mode: green-blue gradient

  const backgroundColor = isDark ? "#111827" : "#f9fafb";
  const cardBackgroundColor = isDark ? "#1f2937" : "white";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isDark ? "#1f2937" : "#059669"}
        translucent={false}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Enhanced Header with Gradient */}
          <LinearGradient
            colors={gradientColors}
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>
                  Add Food
                </Text>
                <Text style={styles.headerSubtitle}>
                  {new Date(dateToLog).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </Text>
              </View>

              <View style={styles.headerSpacer} />
            </View>

            {/* Meal Type Selector */}
            <TouchableOpacity
              onPress={toggleDropdown}
              style={styles.mealTypeSelector}
            >
              <View style={styles.mealTypeIcon}>
                <Ionicons
                  name={
                    selectedMeal?.icon || "sunny-outline"
                  }
                  size={16}
                  color="white"
                />
              </View>
              <Text style={styles.mealTypeText}>
                {selectedMeal?.label}
              </Text>
              <Ionicons
                name={
                  showMealDropdown
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={16}
                color="white"
              />
            </TouchableOpacity>

            {/* Enhanced Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <View style={styles.searchIconContainer}>
                  <Ionicons
                    name="search"
                    size={18}
                    color="#6B7280"
                  />
                </View>

                <TextInput
                  placeholder="Search for foods..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  selectionColor="#059669"
                />

                {searchQuery.length > 0 && !isSearching && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButtonContainer}
                  >
                    <View style={styles.clearButton}>
                      <Ionicons
                        name="close"
                        size={12}
                        color="#6B7280"
                      />
                    </View>
                  </TouchableOpacity>
                )}

                {isSearching && (
                  <View
                    style={styles.searchButtonContainer}
                  >
                    <ActivityIndicator
                      size="small"
                      color="#059669"
                    />
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Dropdown Menu - Positioned absolutely to overlay content */}
          {showMealDropdown && (
            <TouchableOpacity
              style={styles.dropdownBackdrop}
              activeOpacity={1}
              onPress={() => setShowMealDropdown(false)}
            />
          )}

          <Animated.View
            style={[
              showMealDropdown
                ? styles.mealTypeDropdown
                : styles.mealTypeDropdownHidden,
              {
                transform: [
                  {
                    translateY:
                      dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                  },
                ],
                opacity: dropdownAnimation,
              },
            ]}
          >
            {MEAL_TYPES.map((meal, index) => (
              <TouchableOpacity
                key={meal.value}
                onPress={() => handleMealSelect(meal.value)}
                style={[
                  styles.mealTypeOption,
                  index === 0 && styles.mealTypeOptionFirst,
                  index === MEAL_TYPES.length - 1 &&
                    styles.mealTypeOptionLast,
                  index !== MEAL_TYPES.length - 1 &&
                    styles.mealTypeOptionNotLast,
                  selectedMealType === meal.value &&
                    styles.mealTypeOptionSelected,
                ]}
              >
                <View
                  style={[
                    styles.mealTypeOptionIcon,
                    meal.value === "breakfast" &&
                      styles.mealTypeOptionIconBreakfast,
                    meal.value === "lunch" &&
                      styles.mealTypeOptionIconLunch,
                    meal.value === "dinner" &&
                      styles.mealTypeOptionIconDinner,
                    meal.value === "snacks" &&
                      styles.mealTypeOptionIconSnacks,
                  ]}
                >
                  <Ionicons
                    name={meal.icon}
                    size={16}
                    color={
                      selectedMealType === meal.value
                        ? "#059669"
                        : "#6B7280"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.mealTypeOptionText,
                    selectedMealType === meal.value &&
                      styles.mealTypeOptionTextSelected,
                  ]}
                >
                  {meal.label}
                </Text>
                {selectedMealType === meal.value && (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: "#10b981",
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color="white"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Success Toast */}
          {showToast && (
            <Animated.View
              style={[
                styles.toastContainer,
                {
                  transform: [
                    {
                      translateY:
                        toastAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-100, 0],
                        }),
                    },
                    {
                      scale: toastAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                  opacity: toastAnimation,
                },
              ]}
            >
              <View style={styles.toastContent}>
                <View style={styles.toastIconContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="white"
                  />
                </View>
                <Text style={styles.toastText}>
                  {toastMessage}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Enhanced Content */}
          <ScrollView
            style={[
              styles.scrollContent,
              { backgroundColor },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {searchQuery.length === 0 ? (
              <View style={styles.contentContainer}>
                {/* Search History */}
                {searchHistory.length > 0 && (
                  <View style={styles.suggestedSection}>
                    <View style={styles.sectionHeader}>
                      <View
                        style={[
                          styles.sectionIconBlue,
                          {
                            backgroundColor: isDark
                              ? "#1e40af20"
                              : "#dbeafe",
                          },
                        ]}
                      >
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#3B82F6"
                        />
                      </View>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: textColor },
                        ]}
                      >
                        Recent Foods
                      </Text>
                    </View>
                    <View style={styles.foodList}>
                      {searchHistory
                        .slice(0, 5)
                        .map((food) => (
                          <FoodItemCard
                            key={food.id}
                            food={food}
                            onPress={() =>
                              handleFoodSelect(food, false)
                            }
                            isLoading={
                              isAddingFood === food.id
                            }
                            showAddButton={true}
                          />
                        ))}
                    </View>
                  </View>
                )}

                {/* Suggested Foods */}
                <View style={styles.resultsSection}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[
                        styles.sectionIconGreen,
                        {
                          backgroundColor: isDark
                            ? "#10b98120"
                            : "#dcfce7",
                        },
                      ]}
                    >
                      <Ionicons
                        name="star-outline"
                        size={16}
                        color={
                          isDark ? "#10b981" : "#059669"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: textColor },
                      ]}
                    >
                      {searchHistory.length > 0
                        ? "Popular Foods"
                        : "Suggested Foods"}
                    </Text>
                  </View>
                  {suggestedFoods.length > 0 ? (
                    <View style={styles.foodList}>
                      {suggestedFoods.map((food) => (
                        <FoodItemCard
                          key={food.id}
                          food={food}
                          onPress={() =>
                            handleFoodSelect(food, false)
                          }
                          isLoading={
                            isAddingFood === food.id
                          }
                          showAddButton={true}
                        />
                      ))}
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.emptyResultsCard,
                        {
                          backgroundColor:
                            cardBackgroundColor,
                          borderColor: isDark
                            ? "#374151"
                            : "#e5e7eb",
                        },
                      ]}
                    >
                      <View
                        style={{ alignItems: "center" }}
                      >
                        <View
                          style={{
                            width: 64,
                            height: 64,
                            backgroundColor: isDark
                              ? "#374151"
                              : "#f3f4f6",
                            borderRadius: 32,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Ionicons
                            name="restaurant-outline"
                            size={24}
                            color={secondaryTextColor}
                          />
                        </View>
                        <Text
                          style={{
                            color: textColor,
                            textAlign: "center",
                            fontWeight: "500",
                          }}
                        >
                          No suggested foods available
                        </Text>
                        <Text
                          style={{
                            color: secondaryTextColor,
                            textAlign: "center",
                            fontSize: 14,
                            marginTop: 4,
                          }}
                        >
                          Start by searching for foods above
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.contentContainer}>
                {isSearching ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 80,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          cardBackgroundColor,
                        padding: 32,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: isDark
                          ? "#374151"
                          : "#e5e7eb",
                        shadowOffset: {
                          width: 0,
                          height: 1,
                        },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    >
                      <ActivityIndicator
                        size="large"
                        color={
                          isDark ? "#10b981" : "#059669"
                        }
                      />
                      <Text
                        style={{
                          color: textColor,
                          marginTop: 16,
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        Searching foods...
                      </Text>
                    </View>
                  </View>
                ) : searchResults.length > 0 ? (
                  <>
                    <View style={styles.sectionHeader}>
                      <View
                        style={[
                          styles.sectionIconBlue,
                          {
                            backgroundColor: isDark
                              ? "#1e40af20"
                              : "#dbeafe",
                          },
                        ]}
                      >
                        <Ionicons
                          name="search-outline"
                          size={16}
                          color="#3B82F6"
                        />
                      </View>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: textColor },
                        ]}
                      >
                        Search Results
                      </Text>
                      <View
                        style={{
                          marginLeft: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: isDark
                            ? "#374151"
                            : "#e5e7eb",
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: secondaryTextColor,
                          }}
                        >
                          {searchResults.length}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.foodList,
                        { marginBottom: 24 },
                      ]}
                    >
                      {searchResults.map((food) => (
                        <FoodItemCard
                          key={food.id}
                          food={food}
                          onPress={() =>
                            handleFoodSelect(food, true)
                          }
                          isLoading={
                            isAddingFood === food.id
                          }
                          showAddButton={true}
                        />
                      ))}
                    </View>
                  </>
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 80,
                    }}
                  >
                    <View
                      style={[
                        styles.emptyResultsCard,
                        {
                          backgroundColor:
                            cardBackgroundColor,
                          borderColor: isDark
                            ? "#374151"
                            : "#e5e7eb",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <View
                        style={{
                          width: 64,
                          height: 64,
                          backgroundColor: isDark
                            ? "#374151"
                            : "#f3f4f6",
                          borderRadius: 32,
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 16,
                        }}
                      >
                        <Ionicons
                          name="search"
                          size={24}
                          color={secondaryTextColor}
                        />
                      </View>
                      <Text
                        style={{
                          color: textColor,
                          textAlign: "center",
                          fontWeight: "600",
                          fontSize: 16,
                          marginBottom: 8,
                        }}
                      >
                        No foods found
                      </Text>
                      <Text
                        style={{
                          color: secondaryTextColor,
                          textAlign: "center",
                          fontSize: 14,
                        }}
                      >
                        Try searching for "{searchQuery}"
                        with different keywords
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    padding: 32,
    borderRadius: 16,
    marginHorizontal: 24,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  headerSpacer: {
    width: 40,
  },
  mealTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  mealTypeIcon: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mealTypeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  mealTypeDropdown: {
    position: "absolute",
    top: 120,
    left: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    opacity: 1,
  },
  mealTypeDropdownHidden: {
    position: "absolute",
    top: 120,
    left: 16,
    right: 16,
    opacity: 0,
    zIndex: -1,
  },
  mealTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mealTypeOptionFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mealTypeOptionLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  mealTypeOptionNotLast: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  mealTypeOptionSelected: {
    backgroundColor: "#f3f4f6",
  },
  mealTypeOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mealTypeOptionIconBreakfast: {
    backgroundColor: "#fef3c7",
  },
  mealTypeOptionIconLunch: {
    backgroundColor: "#dbeafe",
  },
  mealTypeOptionIconDinner: {
    backgroundColor: "#e0e7ff",
  },
  mealTypeOptionIconSnacks: {
    backgroundColor: "#dcfce7",
  },
  mealTypeOptionText: {
    fontSize: 16,
    flex: 1,
    color: "#111827",
  },
  mealTypeOptionTextSelected: {
    fontWeight: "600",
  },
  searchContainer: {
    marginTop: 16,
  },
  searchInputContainer: {
    position: "relative",
  },
  searchIconContainer: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: "white",
    color: "#111827",
    fontSize: 16,
    paddingLeft: 48,
    paddingRight: 48,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  clearButtonContainer: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  clearButton: {
    width: 24,
    height: 24,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonContainer: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  suggestedSection: {
    marginBottom: 32,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  foodList: {
    gap: 12,
  },
  resultsSection: {
    marginBottom: 24,
  },
  emptyResultsCard: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  dropdownBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "transparent",
  },
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 2000,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIconContainer: {
    marginRight: 8,
  },
  toastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});

export default FoodSearchScreen;
