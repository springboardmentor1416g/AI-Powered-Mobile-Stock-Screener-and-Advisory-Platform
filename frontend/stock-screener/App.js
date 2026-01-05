import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import StockCard from "./components/StockCard";
import Advisory from "./components/Advisory";

export default function App() {
  const [selectedStock, setSelectedStock] = useState(null);

  const stocks = [
    { name: "TCS", price: 3850, pe: 28 },
    { name: "Infosys", price: 1620, pe: 24 },
    { name: "HDFC", price: 1450, pe: 22 },
    { name: "Zomato", price: 142, pe: 0 }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📊 AI Stock Screener</Text>

      <ScrollView>
        {stocks.map((stock, index) => (
          <StockCard
            key={index}
            stock={stock}
            onPress={() => setSelectedStock(stock)}
          />
        ))}

        {selectedStock && <Advisory stock={selectedStock} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center"
  }
});
