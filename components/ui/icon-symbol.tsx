import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "person.3.fill": "groups",
  "chart.bar.fill": "leaderboard",
  "ellipsis.circle.fill": "more-horiz",
  "basketball.fill": "sports-basketball",
  "chevron.right": "chevron-right",
  "arrow.triangle.2.circlepath": "sync",
  "star.fill": "star",
  "bolt.fill": "bolt",
  "trophy.fill": "emoji-events",
  "person.fill": "person",
  "gearshape.fill": "settings",
  "tune": "tune",
  "my-location": "my-location",
  "shield": "shield",
} as unknown as IconMapping;

export function IconSymbol({ name, size = 24, color, style }: { name: IconSymbolName; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: SymbolWeight }) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
