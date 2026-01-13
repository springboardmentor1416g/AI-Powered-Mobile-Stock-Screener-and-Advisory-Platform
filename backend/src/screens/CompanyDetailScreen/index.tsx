import React from "react";
import { ScrollView, Text } from "react-native";

export default function CompanyDetailScreen({ route }) {
  const { company } = route.params;

  return (
    <ScrollView>
      <Text>{company.name} ({company.ticker})</Text>

      <Text>Quarterly Metrics</Text>
      {Object.entries(company.quarterly).map(([k, v]) => (
        <Text key={k}>{k}: {v}</Text>
      ))}

      <Text>TTM Metrics</Text>
      {Object.entries(company.ttm).map(([k, v]) => (
        <Text key={k}>{k}: {v}</Text>
      ))}

      <Text>Derived Ratios</Text>
      {Object.entries(company.derivedMetrics).map(([k, v]) => (
        <Text key={k}>{k}: {v}</Text>
      ))}
    </ScrollView>
  );
}
