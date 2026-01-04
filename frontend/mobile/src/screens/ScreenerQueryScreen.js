import { View, Text, Button } from "react-native";

export default function ScreenerQueryScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Stock Screener</Text>
      <Button title="Run Screener" onPress={() => navigation.navigate("results")} />
    </View>
  );
}
