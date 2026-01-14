import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ScreenerQuery from '../screens/ScreenerQuery';
import Results from '../screens/Results';
import CompanyDetail from '../screens/CompanyDetail';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ScreenerQuery" component={ScreenerQuery} />
      <Stack.Screen 
        name="Results" 
        component={Results}
        options={{ title: 'Screener Results' }}
      />
      <Stack.Screen 
        name="CompanyDetail" 
        component={CompanyDetail}
        options={{ title: 'Company Fundamentals' }}
      />
    </Stack.Navigator>
  );
}
