import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenerScreen from './screener/ScreenerScreen';
import ScreenerQueryScreen from './ScreenerQuery/ScreenerQueryScreen';
import ResultsScreen from './Results/ResultsScreen';
import CompanyDetailScreen from './CompanyDetail/CompanyDetailScreen';
import WatchlistScreen from './watchlist/WatchlistScreen';
import PortfolioScreen from './portfolio/PortfolioScreen';
import AlertsScreen from './alerts/AlertsScreen';
import NotificationsScreen from './notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Screener Stack Navigator (allows navigation from Screener -> Query -> Results)
function ScreenerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ScreenerHome" component={ScreenerScreen} />
      <Stack.Screen name="ScreenerQuery" component={ScreenerQueryScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
    </Stack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarLabel: route.name === 'Screener' ? '🔍 Screener' 
            : route.name === 'Watchlist' ? '⭐ Watchlist'
            : route.name === 'Portfolio' ? '💼 Portfolio'
            : route.name === 'Alerts' ? '🔔 Alerts'
            : '📨 Notifications',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            backgroundColor: '#fff',
            paddingBottom: 8,
          },
        })}
      >
        <Tab.Screen name="Screener" component={ScreenerStack} />
        <Tab.Screen name="Watchlist" component={WatchlistScreen} />
        <Tab.Screen name="Portfolio" component={PortfolioScreen} />
        <Tab.Screen name="Alerts" component={AlertsScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
