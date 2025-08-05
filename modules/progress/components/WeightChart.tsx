// src/modules/progress/components/WeightChart.tsx

import React, { useMemo } from "react";
import { View, Text, useColorScheme } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { format } from "date-fns";
import { WeightEntry } from "@/db/models/WeightEntry";
import { COLORS } from "@/constants/theme"; // Assuming you have a theme file

interface WeightChartProps {
  entries: WeightEntry[];
  period?: string; // Add period prop to adjust x-axis formatting
}

export const WeightChart = ({
  entries,
  period = "all",
}: WeightChartProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  // Function to get appropriate date format and spacing based on period
  const getChartConfig = (
    period: string,
    dataLength: number
  ) => {
    switch (period) {
      case "1_week":
        return {
          dateFormat: "EEE", // Mon, Tue, Wed
          spacing: 50,
          fontSize: 10,
        };
      case "1_month":
        return {
          dateFormat: "dd/MM", // 01/12, 02/12
          spacing: Math.max(
            30,
            Math.min(50, 300 / dataLength)
          ),
          fontSize: 10,
        };
      case "2_months":
      case "3_months":
        return {
          dateFormat: "dd/MM", // 01/12, 15/12
          spacing: Math.max(
            25,
            Math.min(45, 350 / dataLength)
          ),
          fontSize: 9,
        };
      case "6_months":
        return {
          dateFormat: "MMM", // Dec, Jan, Feb
          spacing: Math.max(
            35,
            Math.min(55, 400 / dataLength)
          ),
          fontSize: 9,
        };
      case "1_year":
        return {
          dateFormat: "MMM yy", // Dec 24, Jan 25
          spacing: Math.max(
            40,
            Math.min(60, 450 / dataLength)
          ),
          fontSize: 9,
        };
      case "since_start":
      case "all":
      default:
        // For longer periods, choose format based on data range
        if (dataLength <= 7) {
          return {
            dateFormat: "dd/MM",
            spacing: 50,
            fontSize: 10,
          };
        } else if (dataLength <= 30) {
          return {
            dateFormat: "dd/MM",
            spacing: Math.max(25, 350 / dataLength),
            fontSize: 9,
          };
        } else {
          return {
            dateFormat: "MMM yy",
            spacing: Math.max(30, 400 / dataLength),
            fontSize: 8,
          };
        }
    }
  };

  // useMemo prevents this data transformation from running on every render
  const { chartData, chartConfig } = useMemo(() => {
    console.log(
      `📊 WeightChart: Recalculating chart data for period "${period}" with`,
      entries?.length || 0,
      "entries"
    );

    // The chart library expects data to be in reverse chronological order (oldest first)
    if (!entries || entries.length === 0) {
      console.log("📊 WeightChart: No entries available");
      return {
        chartData: [],
        chartConfig: { spacing: 50, fontSize: 10 },
      };
    }

    const sortedEntries = entries.slice().reverse();
    const config = getChartConfig(
      period,
      sortedEntries.length
    );

    console.log(
      `📊 WeightChart: Using config for period "${period}":`,
      config
    );

    const processedData = sortedEntries.map(
      (entry, index) => {
        const formattedDate = format(
          new Date(entry.date),
          config.dateFormat
        );
        console.log(
          `📊 WeightChart: Entry ${index}: ${entry.weightKg}kg on ${entry.date} → ${formattedDate}`
        );
        return {
          value: entry.weightKg,
          label: formattedDate,
          labelTextStyle: {
            color: colors.text.secondary,
            fontSize: config.fontSize,
          },
        };
      }
    );

    console.log(
      "📊 WeightChart: Final chart data:",
      processedData
    );
    return {
      chartData: processedData,
      chartConfig: config,
    };
  }, [
    entries?.length,
    entries?.map((e) => e.id + e.weightKg).join(","),
    period,
    colors.text.secondary,
  ]);

  if (chartData.length === 0) {
    return (
      <View
        style={{
          height: 220,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.text.secondary,
            textAlign: "center",
          }}
        >
          No weight entries found for the selected period.
        </Text>
      </View>
    );
  }

  if (chartData.length === 1) {
    return (
      <View
        style={{
          height: 220,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.text.secondary,
            textAlign: "center",
          }}
        >
          Add one more entry to see a chart trend.
        </Text>
      </View>
    );
  }

  // Create a key that changes when data changes to force chart re-render
  const chartKey = `chart-${entries?.length || 0}-${entries?.map((e) => e.weightKg).join("-") || "empty"}`;

  // Dynamic colors based on theme
  const chartColor =
    colorScheme === "dark" ? colors.primary : "#3B82F6"; // Light blue for light mode
  const fillStartColor =
    colorScheme === "dark" ? colors.primary : "#3B82F6";

  return (
    <View
      style={{ paddingHorizontal: 16, paddingVertical: 20 }}
    >
      <LineChart
        key={chartKey}
        data={chartData}
        height={220}
        color={chartColor}
        thickness={3}
        startFillColor={fillStartColor}
        endFillColor={colors.surface}
        startOpacity={0.4}
        endOpacity={0.1}
        areaChart
        yAxisTextStyle={{ color: colors.text.secondary }}
        xAxisLabelTextStyle={{
          color: colors.text.secondary,
        }}
        rulesColor={colors.border}
        noOfSections={4}
        spacing={chartConfig.spacing}
        initialSpacing={20}
        dataPointsColor={chartColor}
        curved
      />
    </View>
  );
};
