import React from "react";
import { View, Text, FlatList } from "react-native";

export default function Results({ route }) {
  const { results } = route.params;

  if (!results || results.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No results found</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <Text>Symbol: {item.symbol}</Text>
            <Text>Price: ₹{item.price}</Text>
            <Text>Volume: {item.volume}</Text>
          </View>
        )}
      />
    </View>
  );
}
