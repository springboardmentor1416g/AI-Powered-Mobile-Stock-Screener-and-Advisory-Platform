import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function Results({ route }) {
  const { data } = route.params;
  const results = data?.results || [];

  if (results.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No stocks matched your query.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.symbol}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>
            {item.name} ({item.symbol})
          </Text>
          <Text>Price: ${item.price}</Text>
          <Text>Market Cap: {item.marketCap}</Text>
          <Text>P/E Ratio: {item.peRatio}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
    marginBottom: 12,
  },
  name: { fontWeight: "bold", marginBottom: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
