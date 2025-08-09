import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isAfter,
} from "date-fns";
import { COLORS } from "@/constants/theme";
import { useAppStore } from "@/stores/appStore";
import { logOrUpdateWeight } from "@/db/actions/progressActions";

const LogWeightScreen = React.memo(() => {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const isDark = colorScheme === "dark";

  const [weight, setWeight] = useState(
    currentUser?.currentWeightKg?.toString() || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date()
  );
  const [showDatePicker, setShowDatePicker] =
    useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date()
  );

  const handleSaveWeight = async () => {
    if (!currentUser) {
      Alert.alert(
        "Error",
        "No user is currently logged in."
      );
      return;
    }
    const weightValue = parseFloat(weight);
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid, positive weight."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const todayString = format(
        selectedDate,
        "yyyy-MM-dd"
      );
      await logOrUpdateWeight(
        currentUser.id,
        weightValue,
        todayString
      );
      router.back();
    } catch (error) {
      console.error("Failed to log weight:", error);
      Alert.alert(
        "Error",
        "Could not save your weight. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeightChange = useCallback((text: string) => {
    setWeight(text);
  }, []);

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isAfter(date, today)) {
      Alert.alert(
        "Invalid Date",
        "You cannot log weight for future dates."
      );
      return;
    }

    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handlePreviousMonth = () => {
    setCalendarMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(calendarMonth, 1);
    const today = new Date();

    if (
      nextMonth.getFullYear() > today.getFullYear() ||
      (nextMonth.getFullYear() === today.getFullYear() &&
        nextMonth.getMonth() > today.getMonth())
    ) {
      return;
    }

    setCalendarMonth(nextMonth);
  };

  const getCalendarDays = () => {
    const start = startOfMonth(calendarMonth);
    const end = endOfMonth(calendarMonth);
    const startWeek = startOfWeek(start);
    const endWeek = endOfWeek(end);

    return eachDayOfInterval({
      start: startWeek,
      end: endWeek,
    });
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === calendarMonth.getMonth();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return isAfter(date, today);
  };

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

      {/* Header */}
      <SafeAreaView
        style={{ backgroundColor: colors.background }}
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: colors.surface,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text.primary}
            />
          </TouchableOpacity>

          <Text
            style={{
              color: colors.text.primary,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            Add Weight
          </Text>

          <TouchableOpacity
            onPress={handleSaveWeight}
            disabled={isSubmitting || !weight}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: weight
                ? colors.primary
                : colors.surface,
              opacity: isSubmitting || !weight ? 0.5 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Ionicons
                name="checkmark"
                size={20}
                color={
                  weight ? "white" : colors.text.secondary
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
      >
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Weight Input */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Weight (kg)
              </Text>
              <TextInput
                placeholder="70.5"
                placeholderTextColor={colors.text.secondary}
                value={weight}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                autoFocus={true}
                returnKeyType="done"
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: "600",
                  textAlign: "right",
                  minWidth: 64,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
                maxLength={6}
                selectTextOnFocus={true}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Date Selection */}
          <TouchableOpacity
            onPress={() => {
              setCalendarMonth(selectedDate);
              setShowDatePicker(true);
            }}
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-4 ${isDark ? "border-gray-700" : "border-gray-200"} border`}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Date
              </Text>
              <View className="flex-row items-center">
                <Text
                  className={`text-base font-semibold mr-2 ${isDark ? "text-teal-400" : "text-teal-600"}`}
                >
                  {format(selectedDate, "d MMM yyyy")}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={isDark ? "#00D4AA" : "#00B399"}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Tips Section */}
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-xl p-4 mb-4 ${isDark ? "border-gray-700" : "border-gray-200"} border`}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="bulb-outline"
                size={20}
                color="#00D4AA"
              />
              <Text className="text-teal-500 text-sm font-semibold ml-2">
                Pro Tip
              </Text>
            </View>
            <Text
              className={`text-sm leading-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              For best results, weigh yourself at the same
              time each day, preferably in the morning after
              using the bathroom.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveWeight}
            disabled={isSubmitting || !weight}
            className={`rounded-xl py-4 items-center mt-4 ${
              isSubmitting || !weight
                ? isDark
                  ? "bg-gray-700"
                  : "bg-gray-300"
                : "bg-teal-500"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  weight
                    ? "text-white"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              >
                Save Weight
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-t-3xl p-6 max-h-96`}
          >
            {/* Calendar Header */}
            <View className="flex-row items-center justify-between mb-6">
              <TouchableOpacity
                onPress={handlePreviousMonth}
                className="p-2"
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={isDark ? "#D1D5DB" : "#6B7280"}
                />
              </TouchableOpacity>

              <Text
                className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {format(calendarMonth, "MMMM yyyy")}
              </Text>

              <TouchableOpacity
                onPress={handleNextMonth}
                className="p-2"
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={isDark ? "#D1D5DB" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View className="mb-4">
              {/* Day Headers */}
              <View className="flex-row mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map(
                  (day, index) => (
                    <View
                      key={index}
                      className="flex-1 items-center py-2"
                    >
                      <Text
                        className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {day}
                      </Text>
                    </View>
                  )
                )}
              </View>

              {/* Calendar Days */}
              <View className="flex-row flex-wrap">
                {getCalendarDays().map((day, index) => {
                  const isSelected =
                    format(day, "yyyy-MM-dd") ===
                    format(selectedDate, "yyyy-MM-dd");
                  const isCurrentMonth =
                    isDateInCurrentMonth(day);
                  const isDisabled = isDateDisabled(day);

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        !isDisabled && handleDateSelect(day)
                      }
                      disabled={isDisabled}
                      className={`w-1/7 aspect-square items-center justify-center m-0.5 rounded-lg ${
                        isSelected
                          ? "bg-teal-500"
                          : isDisabled
                            ? ""
                            : isDark
                              ? "hover:bg-gray-700"
                              : "hover:bg-gray-100"
                      }`}
                      style={{ width: `${100 / 7}%` }}
                    >
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? "text-white font-semibold"
                            : isDisabled
                              ? isDark
                                ? "text-gray-600"
                                : "text-gray-400"
                              : isCurrentMonth
                                ? isDark
                                  ? "text-white"
                                  : "text-gray-900"
                                : isDark
                                  ? "text-gray-500"
                                  : "text-gray-400"
                        }`}
                      >
                        {format(day, "d")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Modal Actions */}
            <View className="flex-row justify-end pt-4 border-t border-gray-700">
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="px-6 py-2"
              >
                <Text
                  className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="px-6 py-2 ml-4"
              >
                <Text className="text-teal-500 font-medium">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

LogWeightScreen.displayName = "LogWeightScreen";

export default LogWeightScreen;
