import Loader from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  useColorScheme,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Add this import
import { signout } from "@/db/actions/authActions";
import { updateUser } from "@/db/actions/userActions";

export default function Profile() {
  const {
    currentUser,
    logout,
    selectedGoal,
    supabaseProfile,
  } = useAppStore();
  const { profile, goals } = useUserStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets(); // Add this hook

  if (!currentUser) return <Loader />;

  const displayName =
    supabaseProfile?.full_name || currentUser.name;
  const avatarUrl =
    supabaseProfile?.avatar_url || currentUser.avatarUrl;
  const userAge = currentUser.age;

  // Calculate BMI if we have height and weight
  const bmi =
    currentUser.heightCm && currentUser.currentWeightKg
      ? (
          currentUser.currentWeightKg /
          Math.pow(currentUser.heightCm / 100, 2)
        ).toFixed(1)
      : null;

  // Theme colors
  const colors = {
    background: isDark ? "#000000" : "#FFFFFF",
    surface: isDark ? "#1A1A1A" : "#F9FAFB",
    surfaceLight: isDark ? "#2A2A2A" : "#F3F4F6",
    text: isDark ? "#FFFFFF" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    border: isDark ? "#374151" : "#E5E7EB",
    primary: "#4ADE80",
    secondary: "#2DD4BF",
    accent: "#F59E0B",
    error: "#EF4444",
  };

  const handleEditProfile = () => {
    // Create a simple parameter to identify this is an edit flow
    router.push("/onboarding?edit=true");
  };

  const handleSignOut = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signout();
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
      paddingTop: insets.top + 16, // Use safe area insets instead of hardcoded value
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      shadowColor: isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 8,
      elevation: 4,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      fontFamily: "Inter-Bold",
    },
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceLight,
      alignItems: "center",
      justifyContent: "center",
    },
    profileCard: {
      margin: 20,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarSection: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    avatarContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colors.primary,
      padding: 3,
      marginRight: 20,
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 42,
      backgroundColor: colors.surfaceLight,
    },
    avatarFallback: {
      width: "100%",
      height: "100%",
      borderRadius: 42,
      backgroundColor: colors.surfaceLight,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
      fontFamily: "Inter-Bold",
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
      fontFamily: "Inter-Bold",
    },
    userDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
      fontFamily: "Inter-Regular",
    },
    goalBadge: {
      backgroundColor: colors.primary + "20",
      borderColor: colors.primary + "40",
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    goalText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    statsRow: {
      flexDirection: "row",
      backgroundColor: colors.background + "80",
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
      fontFamily: "Inter-Bold",
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontFamily: "Inter-Medium",
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    sectionCard: {
      margin: 20,
      marginTop: 0,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      fontFamily: "Inter-Bold",
    },
    goalItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background + "60",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    goalInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    goalEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    goalDetails: {
      flex: 1,
    },
    goalName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
      fontFamily: "Inter-SemiBold",
    },
    goalDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: "Inter-Regular",
    },
    goalStatus: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      fontFamily: "Inter-SemiBold",
    },
    nutritionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background + "60",
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    nutritionInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    nutritionDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    nutritionLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text,
      fontFamily: "Inter-Medium",
    },
    nutritionValue: {
      fontSize: 15,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    actionButton: {
      backgroundColor: colors.primary + "15",
      borderColor: colors.primary + "40",
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      marginBottom: 12,
    },
    actionButtonIcon: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
      fontFamily: "Inter-SemiBold",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background + "60",
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    menuItemText: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text,
      marginLeft: 12,
      fontFamily: "Inter-Medium",
    },
    signOutButton: {
      backgroundColor: colors.error + "10",
      borderColor: colors.error + "30",
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
    },
    signOutText: {
      color: colors.error,
      fontSize: 15,
      fontWeight: "500",
      marginLeft: 12,
      fontFamily: "Inter-Medium",
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEditProfile}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSignOut}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {displayName}
              </Text>
              <Text style={styles.userDetails}>
                {currentUser.gender
                  .charAt(0)
                  .toUpperCase() +
                  currentUser.gender.slice(1)}{" "}
                •{" "}
                {userAge
                  ? `${userAge} years old`
                  : "Age not set"}
              </Text>
              {selectedGoal && (
                <View style={styles.goalBadge}>
                  <Text style={styles.goalText}>
                    🎯{" "}
                    {selectedGoal
                      .replace("_", " ")
                      .toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* STATS ROW */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentUser.heightCm}
              </Text>
              <Text style={styles.statLabel}>
                Height (cm)
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentUser.currentWeightKg}
              </Text>
              <Text style={styles.statLabel}>
                Weight (kg)
              </Text>
            </View>
            {bmi && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {bmi}
                  </Text>
                  <Text style={styles.statLabel}>BMI</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* FITNESS GOALS CARD */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Fitness Journey
            </Text>
            <Ionicons
              name="fitness-outline"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalEmoji}>
                {selectedGoal === "lose_weight"
                  ? "📉"
                  : selectedGoal === "maintain_weight"
                    ? "⚖️"
                    : "💪"}
              </Text>
              <View style={styles.goalDetails}>
                <Text style={styles.goalName}>
                  {selectedGoal === "lose_weight"
                    ? "Weight Loss"
                    : selectedGoal === "maintain_weight"
                      ? "Weight Maintenance"
                      : "Muscle Gain"}
                </Text>
                <Text style={styles.goalDescription}>
                  Primary goal
                </Text>
              </View>
            </View>
            <Text style={styles.goalStatus}>Active</Text>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalEmoji}>🏃‍♂️</Text>
              <View style={styles.goalDetails}>
                <Text style={styles.goalName}>
                  Activity Level
                </Text>
                <Text style={styles.goalDescription}>
                  {currentUser.activityLevel
                    .replace("_", " ")
                    .charAt(0)
                    .toUpperCase() +
                    currentUser.activityLevel
                      .replace("_", " ")
                      .slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* NUTRITION GOALS CARD */}
        {goals && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Daily Nutrition Goals
              </Text>
              <Ionicons
                name="nutrition-outline"
                size={24}
                color={colors.accent}
              />
            </View>

            {goals.dailyCalorieGoal && (
              <View style={styles.nutritionItem}>
                <View style={styles.nutritionInfo}>
                  <View
                    style={[
                      styles.nutritionDot,
                      { backgroundColor: "#EF4444" },
                    ]}
                  />
                  <Text style={styles.nutritionLabel}>
                    Calories
                  </Text>
                </View>
                <Text
                  style={[
                    styles.nutritionValue,
                    { color: "#EF4444" },
                  ]}
                >
                  {goals.dailyCalorieGoal} kcal
                </Text>
              </View>
            )}

            {goals.proteinGoal_g && (
              <View style={styles.nutritionItem}>
                <View style={styles.nutritionInfo}>
                  <View
                    style={[
                      styles.nutritionDot,
                      { backgroundColor: "#3B82F6" },
                    ]}
                  />
                  <Text style={styles.nutritionLabel}>
                    Protein
                  </Text>
                </View>
                <Text
                  style={[
                    styles.nutritionValue,
                    { color: "#3B82F6" },
                  ]}
                >
                  {goals.proteinGoal_g}g
                </Text>
              </View>
            )}

            {goals.carbsGoal_g && (
              <View style={styles.nutritionItem}>
                <View style={styles.nutritionInfo}>
                  <View
                    style={[
                      styles.nutritionDot,
                      { backgroundColor: "#F59E0B" },
                    ]}
                  />
                  <Text style={styles.nutritionLabel}>
                    Carbs
                  </Text>
                </View>
                <Text
                  style={[
                    styles.nutritionValue,
                    { color: "#F59E0B" },
                  ]}
                >
                  {goals.carbsGoal_g}g
                </Text>
              </View>
            )}

            {goals.fatGoal_g && (
              <View style={styles.nutritionItem}>
                <View style={styles.nutritionInfo}>
                  <View
                    style={[
                      styles.nutritionDot,
                      { backgroundColor: "#8B5CF6" },
                    ]}
                  />
                  <Text style={styles.nutritionLabel}>
                    Fat
                  </Text>
                </View>
                <Text
                  style={[
                    styles.nutritionValue,
                    { color: "#8B5CF6" },
                  ]}
                >
                  {goals.fatGoal_g}g
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ACTIONS CARD */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.actionButtonText}>
                Edit Profile & Goals
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.menuItemText}>
                Notifications
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.menuItemText}>
                Progress Analytics
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.menuItemText}>
                Help & Support
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.error}
              />
              <Text style={styles.signOutText}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* BOTTOM SPACING */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
