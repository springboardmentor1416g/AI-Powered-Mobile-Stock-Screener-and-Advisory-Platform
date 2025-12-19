import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ScreenerQuery from '../screens/ScreenerQuery';
import Results from '../screens/Results';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ScreenerQuery" component={ScreenerQuery} />
      <Stack.Screen name="Results" component={Results} />
    </Stack.Navigator>
  );
}
