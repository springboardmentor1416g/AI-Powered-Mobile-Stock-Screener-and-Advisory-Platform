import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// agar ye project apko acha lage toh mujhe bhi hire kar skte ho :- https://github.com/prashantjinwal

// import Home from 'components/Home'
import MarketAI from 'components/MarketAi';
import Portfolio from 'components/Portfolio'
import Profile from 'components/Porfile'

// temp 
import ResultsScreen from 'components/ResultScreen';



const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarStyle: {
          backgroundColor: '#111',
          borderTopColor: '#222',
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarActiveTintColor: '#1e90ff',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'MarketAI') iconName = 'analytics';
          else if (route.name === 'Portfolio') iconName = 'briefcase';
          else if (route.name === 'Profile') iconName = 'person';

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ResultsScreen} />
      <Tab.Screen name="MarketAI" component={MarketAI} />
      <Tab.Screen name="Portfolio" component={Portfolio} />
      <Tab.Screen name="Profile" component={Profile} />
   

    </Tab.Navigator>
  );
}
