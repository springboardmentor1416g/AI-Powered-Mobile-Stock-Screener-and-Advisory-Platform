import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home</Text>
      <Button title="Go to Screener" onPress={() => navigation.navigate('Screener')} />
    </View>
  );
}
