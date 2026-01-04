import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from 'navigator/Tabnavigator';
import './global.css';


export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
