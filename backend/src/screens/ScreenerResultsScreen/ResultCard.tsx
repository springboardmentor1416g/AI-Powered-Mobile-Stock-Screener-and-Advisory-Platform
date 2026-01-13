import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function ResultCard({ data, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View>
        <Text>{data.name} ({data.ticker})</Text>

        <Text>Matched:</Text>
        {data.matchedConditions.map((c) => (
          <Text key={c}>• {c}</Text>
        ))}

        {data.derivedMetrics?.peg && (
          <Text>PEG: {data.derivedMetrics.peg}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
