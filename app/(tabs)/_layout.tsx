import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 58 + bottomPadding, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 0.5 } }}><Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={23} color={color} /> }} /><Tabs.Screen name="roster" options={{ title: "Elenco", tabBarIcon: ({ color }) => <IconSymbol name="person.3.fill" size={23} color={color} /> }} /><Tabs.Screen name="league" options={{ title: "Liga", tabBarIcon: ({ color }) => <IconSymbol name="chart.bar.fill" size={23} color={color} /> }} /><Tabs.Screen name="news" options={{ title: "Notícias", tabBarIcon: ({ color }) => <IconSymbol name="newspaper" size={23} color={color} /> }} /><Tabs.Screen name="preseason" options={{ title: "Temporada", tabBarIcon: ({ color }) => <IconSymbol name="flag" size={23} color={color} /> }} /><Tabs.Screen name="more" options={{ title: "Mais", tabBarIcon: ({ color }) => <IconSymbol name="ellipsis.circle.fill" size={23} color={color} /> }} /></Tabs>;
}
