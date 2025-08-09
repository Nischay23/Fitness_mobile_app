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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

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
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Header with proper safe area handling */}
      <View
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top,
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
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
      >
        <ScrollView
          style={{ flex: 1, padding: 16 }}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Date
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 16,
                    fontWeight: "600",
                    marginRight: 8,
                  }}
                >
                  {format(selectedDate, "d MMM yyyy")}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Tips Section */}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons
                name="bulb-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Pro Tip
              </Text>
            </View>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 14,
                lineHeight: 20,
              }}
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
            style={{
              backgroundColor:
                isSubmitting || !weight
                  ? colors.surface
                  : colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 16,
              opacity: isSubmitting || !weight ? 0.5 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Text
                style={{
                  color: weight
                    ? "white"
                    : colors.text.secondary,
                  fontSize: 16,
                  fontWeight: "600",
                }}
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: 400,
            }}
          >
            {/* Calendar Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <TouchableOpacity
                onPress={handlePreviousMonth}
                style={{ padding: 8 }}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>

              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {format(calendarMonth, "MMMM yyyy")}
              </Text>

              <TouchableOpacity
                onPress={handleNextMonth}
                style={{ padding: 8 }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={{ marginBottom: 16 }}>
              {/* Day Headers */}
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 8,
                }}
              >
                {["S", "M", "T", "W", "T", "F", "S"].map(
                  (day, index) => (
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        paddingVertical: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.text.secondary,
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  )
                )}
              </View>

              {/* Calendar Days */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
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
                      style={{
                        width: `${100 / 7}%`,
                        aspectRatio: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 2,
                        borderRadius: 8,
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: isSelected
                            ? "white"
                            : isDisabled
                              ? colors.text.muted
                              : isCurrentMonth
                                ? colors.text.primary
                                : colors.text.secondary,
                          fontWeight: isSelected
                            ? "600"
                            : "400",
                        }}
                      >
                        {format(day, "d")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Modal Actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  marginLeft: 16,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
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
