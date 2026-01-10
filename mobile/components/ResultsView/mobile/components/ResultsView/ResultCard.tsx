import React from "react";
import { View, Text } from "react-native";

const ResultCard = ({ stock }: any) => {
  return (
    <View style={{ padding: 12, margin: 8, borderWidth: 1 }}>
      <Text style={{ fontWeight: "bold" }}>
        {stock.companyName} ({stock.symbol})
      </Text>
      <Text>PE Ratio: {stock.peRatio ?? "N/A"}</Text>
      <Text>Revenue Growth: {stock.revenueGrowth ?? "N/A"}%</Text>
      <Text>Market Cap: {stock.marketCap ?? "N/A"}</Text>
    </View>
  );
};

export default ResultCard;
