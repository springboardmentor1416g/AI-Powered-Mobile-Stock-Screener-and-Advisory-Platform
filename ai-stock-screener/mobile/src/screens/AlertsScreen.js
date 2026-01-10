import { View, Text } from "react-native";

export default function AlertsScreen() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20 }}>Alerts</Text>
      <Text>Alerts will trigger based on screener rules</Text>
    </View>
  );
}
