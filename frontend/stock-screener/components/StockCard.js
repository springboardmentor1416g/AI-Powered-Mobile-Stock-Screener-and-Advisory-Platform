import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function StockCard({ stock, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{stock.name}</Text>
      <Text>💰 Price: ₹{stock.price}</Text>
      <Text>📈 P/E Ratio: {stock.pe}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  }
});
