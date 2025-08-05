import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  ViewStyle,
  Animated,
  Easing,
  Platform,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

interface ProgressRingProps {
  progress: number; // 0 to 1
  size: number; // diameter in px
  strokeWidth: number; // ring thickness
  backgroundColor: string; // track color
  progressColor: string; // fill color
  glowEffect?: boolean; // enable/disable glow
  isDark?: boolean; // theme mode
}

export const ProgressRing = ({
  progress,
  size,
  strokeWidth,
  backgroundColor,
  progressColor,
  glowEffect = true,
  isDark = true,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(
    new Animated.Value(0)
  ).current;
  const [currentProgress, setCurrentProgress] = useState(0);

  // Clamp progress 0–1
  const clamped = Math.min(1, Math.max(0, progress));

  // Stable gradient ID
  const gradientId = useMemo(
    () => `grad_${Math.random().toString(36).slice(2, 10)}`,
    []
  );

  // Compute dash offset
  const strokeDashoffset =
    circumference * (1 - currentProgress);

  useEffect(() => {
    // Reset and subscribe
    animatedValue.setValue(0);
    const progSub = animatedValue.addListener(({ value }) =>
      setCurrentProgress(value)
    );

    // Animate progress
    Animated.timing(animatedValue, {
      toValue: clamped,
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();

    // Cleanup
    return () => {
      animatedValue.removeListener(progSub);
    };
  }, [clamped]);

  // Constant glow style
  const glowStyle: ViewStyle = glowEffect
    ? {
        shadowColor: progressColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5, // tweak 0.2–0.8 as desired
        shadowRadius: strokeWidth * 1.5, // glow spread
        ...(Platform.OS === "android" && {
          elevation: 5, // Android glow
        }),
      }
    : {};

  return (
    <Animated.View
      style={[makeWrapperStyle(size), glowStyle]}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <LinearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor={progressColor}
              stopOpacity="1"
            />
            <Stop
              offset="30%"
              stopColor={progressColor}
              stopOpacity="0.95"
            />
            <Stop
              offset="70%"
              stopColor={progressColor}
              stopOpacity="0.9"
            />
            <Stop
              offset="100%"
              stopColor={progressColor}
              stopOpacity="0.85"
            />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={isDark ? 0.25 : 0.4}
        />

        {/* Inner depth ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 3}
          stroke={isDark ? "#0F172A" : "#F8FAFC"}
          strokeWidth={0.5}
          fill="transparent"
          opacity={isDark ? 0.2 : 0.3}
        />

        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />

        {/* No end‑cap circle */}
      </Svg>
    </Animated.View>
  );
};

// Helper for wrapper sizing
function makeWrapperStyle(size: number): ViewStyle {
  return {
    width: size,
    height: size,
    alignItems: "center",
    justifyContent: "center",
  };
}
