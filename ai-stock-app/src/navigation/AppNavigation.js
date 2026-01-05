import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ScreenerScreen from '../screens/ScreenerScreen';
import AdvisoryScreen from '../screens/AdvisoryScreen';
import StockDetailScreen from '../screens/StockDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AI Stock App' }} />
        <Stack.Screen name="Screener" component={ScreenerScreen} options={{ title: 'Screener' }} />
        <Stack.Screen name="Advisory" component={AdvisoryScreen} options={{ title: 'Advisory' }} />
        <Stack.Screen name="StockDetail" component={StockDetailScreen} options={{ title: 'Stock Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}