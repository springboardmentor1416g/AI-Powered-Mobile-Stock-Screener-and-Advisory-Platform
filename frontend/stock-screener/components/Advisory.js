import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Advisory({ stock }) {
  const getAdvice = () => {
    if (stock.pe === 0) return "⚠️ High Risk – No P/E Available";
    if (stock.pe < 25) return "✅ BUY – Undervalued Stock";
    if (stock.pe < 30) return "🟡 HOLD – Fair Valuation";
    return "❌ SELL – Overvalued";
  };

  return (
    <View style={styles.advisory}>
      <Text style={styles.heading}>🤖 AI Advisory</Text>
      <Text style={styles.text}>{stock.name}</Text>
      <Text style={styles.advice}>{getAdvice()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  advisory: {
    backgroundColor: "#e8f0fe",
    padding: 15,
    borderRadius: 10,
    marginTop: 15
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold"
  },
  text: {
    marginTop: 5
  },
  advice: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold"
  }
});
