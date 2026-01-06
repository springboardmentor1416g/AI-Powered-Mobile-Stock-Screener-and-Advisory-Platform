import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0f172a", borderTopColor: "#334155" },
        tabBarActiveTintColor: "#3b82f6"
      }}
    >
      
      {/* 1. Screener (Now named 'index') */}
      <Tabs.Screen
        name="index" // ✅ CHANGED FROM 'screener' TO 'index'
        options={{
          title: "Screener",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="radar" size={24} color={color} />,
        }}
      />

      {/* 2. Portfolio */}
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="briefcase-account" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}