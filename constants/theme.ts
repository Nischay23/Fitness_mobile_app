export const COLORS = {
  // Light theme colors
  light: {
    primary: "#00E676", // Vibrant green - energy and health
    secondary: "#00BCD4", // Cyan - secondary accent
    accent: "#FF6D00", // Deep orange - highlights and call-to-actions
    background: "#FAFBFC", // Very light cool gray
    surface: "#FFFFFF", // Pure white for cards/surfaces
    surfaceElevated: "#FFFFFF", // White elevated surface with shadow
    border: "#E1E8ED", // Softer border color
    text: {
      primary: "#0F172A", // Very dark slate for maximum readability
      secondary: "#475569", // Balanced dark gray for secondary text
      muted: "#94A3B8", // Medium gray for muted text
      inverse: "#FFFFFF", // White text for dark backgrounds
    },
    status: {
      success: "#00E676", // Bright green
      warning: "#FF9800", // Orange
      error: "#F44336", // Red
      info: "#2196F3", // Blue
    },
    gradients: {
      primary: ["#00E676", "#00BCD4"], // Green to cyan
      secondary: ["#FF6D00", "#FF8F00"], // Orange gradient
      background: ["#FAFBFC", "#F1F5F9"], // Subtle background gradient
      surface: ["#FFFFFF", "#FAFBFC"], // Card gradient
      header: ["#00E676", "#00BCD4"], // Header gradient
      accent: ["#FF6D00", "#FF3D00"], // Accent gradient
      workout: ["#E91E63", "#9C27B0"], // Pink to purple
      cardio: ["#FF5722", "#FF9800"], // Red-orange gradient
      strength: ["#3F51B5", "#2196F3"], // Indigo to blue
    },
  },
  // Dark theme colors - Enhanced for fitness
  dark: {
    primary: "#00FF87", // Electric green - very vibrant for dark mode
    secondary: "#00E5FF", // Electric cyan
    accent: "#FF6D00", // Vibrant orange for highlights
    background: "#0A0A0B", // Almost black but not pure black
    surface: "#141517", // Very dark gray for cards
    surfaceElevated: "#1E1F23", // Slightly lighter for elevated elements
    border: "#2A2D31", // Subtle border that shows in dark
    text: {
      primary: "#FFFFFF", // Pure white for maximum contrast
      secondary: "#E0E0E0", // Light gray
      muted: "#9E9E9E", // Medium gray
      inverse: "#0A0A0B", // Dark text for light backgrounds
    },
    status: {
      success: "#00FF87", // Electric green
      warning: "#FFB300", // Bright amber
      error: "#FF5252", // Bright red for dark backgrounds
      info: "#40C4FF", // Bright blue for dark backgrounds
    },
    gradients: {
      primary: ["#00FF87", "#00E5FF"], // Electric green to cyan
      secondary: ["#FF6D00", "#FF3D00"], // Orange gradient
      background: ["#0A0A0B", "#141517"], // Deep background gradient
      surface: ["#141517", "#1E1F23"], // Card gradients
      header: ["#0A0A0B", "#1E1F23"], // Header gradient
      accent: ["#FF6D00", "#FF3D00"], // Accent gradient
      workout: ["#E91E63", "#9C27B0"], // Pink to purple
      cardio: ["#FF5722", "#FF9800"], // Red-orange gradient
      strength: ["#3F51B5", "#00E5FF"], // Indigo to electric blue
      achievement: ["#FFD700", "#FFA000"], // Gold gradient for achievements
    },
  },
} as const;

// Enhanced fitness specific colors with gradients
export const FITNESS_COLORS = {
  // Single colors
  calories: "#FF5722", // Red-orange
  protein: "#2196F3", // Blue
  carbs: "#FF9800", // Orange
  fat: "#9C27B0", // Purple
  water: "#00BCD4", // Cyan
  steps: "#4CAF50", // Green
  workout: "#E91E63", // Pink
  sleep: "#673AB7", // Deep purple
  heart: "#F44336", // Red
  energy: "#FFEB3B", // Yellow

  // Gradient variations for more dynamic look
  gradients: {
    calories: ["#FF5722", "#FF3D00"], // Red-orange gradient
    protein: ["#2196F3", "#03A9F4"], // Blue gradient
    carbs: ["#FF9800", "#FFB300"], // Orange gradient
    fat: ["#9C27B0", "#E91E63"], // Purple to pink
    water: ["#00BCD4", "#00E5FF"], // Cyan gradient
    steps: ["#4CAF50", "#8BC34A"], // Green gradient
    workout: ["#E91E63", "#9C27B0"], // Pink to purple
    sleep: ["#673AB7", "#3F51B5"], // Purple gradient
    heart: ["#F44336", "#FF5722"], // Red gradient
    energy: ["#FFEB3B", "#FFC107"], // Yellow gradient
    strength: ["#FF6D00", "#FF3D00"], // Orange strength gradient
    cardio: ["#FF1744", "#F44336"], // Red cardio gradient
    flexibility: ["#00E676", "#4CAF50"], // Green flexibility gradient
    endurance: ["#2196F3", "#03A9F4"], // Blue endurance gradient
    recovery: ["#9C27B0", "#673AB7"], // Purple recovery gradient
  },

  // Activity type colors
  activities: {
    running: "#FF5722",
    cycling: "#2196F3",
    swimming: "#00BCD4",
    weightlifting: "#FF6D00",
    yoga: "#9C27B0",
    walking: "#4CAF50",
    hiking: "#8BC34A",
    dancing: "#E91E63",
    boxing: "#F44336",
    basketball: "#FF9800",
    football: "#795548",
    tennis: "#FFEB3B",
  },

  // Progress and achievement colors
  progress: {
    beginner: ["#FF9800", "#FFB300"], // Orange
    intermediate: ["#2196F3", "#03A9F4"], // Blue
    advanced: ["#4CAF50", "#8BC34A"], // Green
    expert: ["#9C27B0", "#E91E63"], // Purple
    master: ["#FFD700", "#FFA000"], // Gold
  },
} as const;

// Helper function to get gradient colors
export const getGradientColors = (
  theme: Theme,
  gradientKey: string
) => {
  const themeColors = COLORS[theme];
  return (
    themeColors.gradients[
      gradientKey as keyof typeof themeColors.gradients
    ] || [themeColors.primary, themeColors.secondary]
  );
};

// Helper function to get fitness gradient
export const getFitnessGradient = (key: string) => {
  return (
    FITNESS_COLORS.gradients[
      key as keyof typeof FITNESS_COLORS.gradients
    ] || [
      FITNESS_COLORS[key as keyof typeof FITNESS_COLORS],
      FITNESS_COLORS[key as keyof typeof FITNESS_COLORS],
    ]
  );
};

export type Theme = keyof typeof COLORS;
export type ColorScheme =
  | typeof COLORS.light
  | typeof COLORS.dark;
export type FitnessColorKey = keyof typeof FITNESS_COLORS;
export type ActivityColorKey =
  keyof typeof FITNESS_COLORS.activities;
