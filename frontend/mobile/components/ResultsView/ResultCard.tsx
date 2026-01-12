// frontend/mobile/components/ResultsView/ResultCard.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScreenerResult } from "../../services/api/screener";

interface Props {
  item: ScreenerResult;
}

export default function ResultCard({ item }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.company}>
        {item.companyName} ({item.symbol})
      </Text>

      {item.pe !== undefined && (
        <Text style={styles.metric}>PE Ratio: {item.pe}</Text>
      )}

      {item.revenueGrowth !== undefined && (
        <Text style={styles.metric}>
          Revenue Growth: {item.revenueGrowth}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  company: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  metric: {
    fontSize: 14,
    color: "#444",
  },
});
