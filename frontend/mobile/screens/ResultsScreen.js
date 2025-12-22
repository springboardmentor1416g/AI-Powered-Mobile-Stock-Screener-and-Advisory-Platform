import React from "react";
import { View, Text, FlatList } from "react-native";

const MOCK_RESULTS = [
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "INFY", name: "Infosys" }
];

export default function ResultsScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Screener Results
      </Text>

      <FlatList
        data={MOCK_RESULTS}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
            <Text>{item.symbol}</Text>
          </View>
        )}
      />
    </View>
  );
}
