import React from "react";
import { View, Text } from "react-native";

export default function ResultsScreen({ route }) {
  const { result } = route.params;

  if (!result.results.length) {
    return <Text>No matching stocks found</Text>;
  }

  return (
    <View>
      {result.results.map(stock => (
        <Text key={stock.symbol}>
          {stock.symbol} | PE: {stock.pe} | Growth: {stock.revenueGrowth}%
        </Text>
      ))}
    </View>
  );
}
