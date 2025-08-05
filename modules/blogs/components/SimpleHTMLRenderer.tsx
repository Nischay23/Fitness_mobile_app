import React from "react";
import { Text, View, useColorScheme } from "react-native";

interface SimpleHtmlRendererProps {
  html: string;
}

export const SimpleHtmlRenderer = ({
  html,
}: SimpleHtmlRendererProps) => {
  const isDark = useColorScheme() === "dark";

  const parsed = html
    .split(/<(\/?[a-zA-Z0-9]+)>/)
    .filter(Boolean);

  const elements = [];
  let currentTag = "p";

  for (let i = 0; i < parsed.length; i++) {
    const part = parsed[i];

    if (
      part.startsWith("h1") ||
      part.startsWith("h2") ||
      part.startsWith("p")
    ) {
      currentTag = part;
    } else if (!part.startsWith("/")) {
      let style;
      switch (currentTag) {
        case "h1":
          style =
            "text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-8";
          break;
        case "h2":
          style =
            "text-xl font-bold text-gray-800 dark:text-white mt-6 mb-3 leading-7";
          break;
        case "p":
        default:
          style =
            "text-base text-gray-700 dark:text-gray-300 mb-5 leading-7";
          break;
      }
      elements.push(
        <Text key={i} className={style}>
          {part}
        </Text>
      );
    }
  }

  return <View>{elements}</View>;
};
