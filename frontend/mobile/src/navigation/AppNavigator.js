import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ScreenerQueryScreen from "../screens/ScreenerQuery/ScreenerQueryScreen";
import ResultsScreen from "../screens/Results/ResultsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="ScreenerQuery">
      <Stack.Screen
        name="ScreenerQuery"
        component={ScreenerQueryScreen}
        options={{ title: "Screener" }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: "Results" }}
      />
    </Stack.Navigator>
  );
}
