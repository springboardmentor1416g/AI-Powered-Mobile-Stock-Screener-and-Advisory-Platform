import { View, Text } from "react-native";

export default function ResultsScreen() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "black" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "white" }}>
        Screener Results
      </Text>

      <Text style={{ marginTop: 12, color: "white" }}>
        AAPL
      </Text>
      <Text style={{ color: "white" }}>
        MSFT
      </Text>
      <Text style={{ color: "white" }}>
        GOOGL
      </Text>
    </View>
  );
}
