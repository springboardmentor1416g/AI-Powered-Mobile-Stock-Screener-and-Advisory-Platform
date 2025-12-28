import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import ScreenerQueryScreen from '../screens/ScreenerQueryScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="ScreenerQuery"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="ScreenerQuery" 
          component={ScreenerQueryScreen} 
          options={{ 
            title: 'Stock Screener',
            headerLargeTitle: false,
          }} 
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen} 
          options={{ 
            title: 'Results',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}