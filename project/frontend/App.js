import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ScreenerQueryScreen from "./src/screens/screener/ScreenerQueryScreen";
import ResultsScreen from "./src/screens/screener/ResultsScreen";
import PortfolioScreen from "./src/screens/portfolio/PortfolioScreen";
import WatchlistScreen from "./src/screens/watchlist/WatchlistScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AnimatedHeaderTitle = () => (
  <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>StockViz</Text>
);

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
          color: "#111",
        },
        tabBarActiveTintColor: "#1e40af",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: 65,
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      })}
    >
      <Tab.Screen
        name="Screener"
        component={ScreenerStack}
        options={{
          headerShown: false,
          tabBarLabel: "Screener",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: size + 4, color }}>🔍</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          tabBarLabel: "Portfolio",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: size + 4, color }}>📊</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarLabel: "Watchlist",
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: size + 4, color }}>⭐</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ScreenerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
          color: "#111",
        },
      }}
    >
      <Stack.Screen
        name="Query"
        component={ScreenerQueryScreen}
        options={{ title: "Stock Screener" }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: "Results" }}
      />
    </Stack.Navigator>
  );
}

import { Text, View } from "react-native";

export default function App() {
  const { user } = React.useContext(AuthContext);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
